"use client";

import { HorizontalThemeWipeToggle } from "@/components/ui/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useLocale } from "next-intl";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

import { useRouter, usePathname } from "@/i18n/routing";

export function Header({ user }: { user?: { name?: string | null; email?: string | null; image?: string | null } }) {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const dateLocale = locale === 'es' ? es : enUS;
    const currentDate = format(new Date(), "EEEE, d 'de' MMMM", { locale: dateLocale });

    const toggleLanguage = () => {
        const nextLocale = locale === 'es' ? 'en' : 'es';
        router.replace({ pathname }, { locale: nextLocale });
    };

    const userInitials = user?.name
        ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
        : 'CN';

    return (
        <header className="hidden md:flex h-16 w-full items-center justify-between border-b border-border bg-background py-6 px-6">
            {/* Left side (Date) */}
            <div className="hidden md:flex flex-col">
                <h2 className="text-sm text-foreground capitalize">
                    {currentDate}
                </h2>
            </div>            {/* Right side (Toggle + Avatar) */}
            <div className="flex items-center gap-3">

                <HorizontalThemeWipeToggle />
                <div className="flex items-center gap-2 mr-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border hover:bg-muted/50 transition-colors outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1">
                                <div className="w-5 h-5 rounded-full overflow-hidden border border-border/50 relative">
                                    <img
                                        src={locale === 'es' ? "https://flagcdn.com/es.svg" : "https://flagcdn.com/us.svg"}
                                        alt={locale === 'es' ? "Español" : "English"}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <span className="text-sm font-medium text-foreground uppercase">{locale}</span>
                                <ChevronDown className="h-3 w-3 text-muted-foreground opacity-50" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[140px]">
                            <DropdownMenuItem
                                onClick={() => router.replace({ pathname }, { locale: 'es' })}
                                className="gap-2 cursor-pointer"
                            >
                                <div className="w-4 h-4 rounded-full overflow-hidden border border-border/50 relative">
                                    <img src="https://flagcdn.com/es.svg" alt="ES" className="w-full h-full object-cover" />
                                </div>
                                <span>Español</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => router.replace({ pathname }, { locale: 'en' })}
                                className="gap-2 cursor-pointer"
                            >
                                <div className="w-4 h-4 rounded-full overflow-hidden border border-border/50 relative">
                                    <img src="https://flagcdn.com/us.svg" alt="EN" className="w-full h-full object-cover" />
                                </div>
                                <span>English</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="flex items-center gap-3 pl-4 border-l border-border">
                    <div className="flex-col items-end hidden md:flex">
                        <span className="text-sm font-semibold text-foreground">{user?.name || 'Usuario'}</span>
                        <span className="text-xs text-muted-foreground">{user?.email || 'Freelancer'}</span>
                    </div>
                    <Avatar className="cursor-pointer hover:opacity-80 transition-opacity">
                        <AvatarImage src={user?.image || "https://github.com/shadcn.png"} alt={user?.name || "@shadcn"} />
                        <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </header>
    );
}
