"use client";

import { HorizontalThemeWipeToggle } from "@/components/ui/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { useLocale } from "next-intl";
import { getDateFnsLocale } from "@/lib/date-locale";
import { LocaleSwitcher } from "@/components/dashboard/locale-switcher";

export function Header({
    user,
}: {
    user?: { name?: string | null; email?: string | null; image?: string | null };
}) {
    const locale = useLocale();
    const dateLocale = getDateFnsLocale(locale);
    const currentDate = format(
        new Date(),
        locale === "es" ? "EEEE, d 'de' MMMM" : "EEEE, MMMM d",
        { locale: dateLocale }
    );

    const userInitials = user?.name
        ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
        : 'CN';

    return (
        <header className="hidden xl:flex h-16 w-full items-center justify-between border-b border-border bg-background py-6 px-6">
            {/* Left side (Date) */}
            <div className="flex items-center gap-3">
                <h2 className="text-sm font-medium text-foreground capitalize tracking-tight">
                    {currentDate}
                </h2>
            </div>

            {/* Right side (Toggle + Avatar) */}
            <div className="flex items-center gap-3">
                <HorizontalThemeWipeToggle />
                <div className="flex items-center gap-2 mr-2">
                    <LocaleSwitcher variant="dropdown" />
                </div>
                <div className="flex items-center gap-3 pl-4 border-l border-border">
                    <div className="flex-col items-end hidden xl:flex">
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
