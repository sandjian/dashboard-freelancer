"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocaleSwitcherProps {
    variant?: "dropdown" | "buttons";
    className?: string;
}

export function LocaleSwitcher({ variant = "dropdown", className }: LocaleSwitcherProps) {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const switchLocale = (nextLocale: "es" | "en") => {
        if (nextLocale === locale || isPending) return;

        startTransition(() => {
            const query = searchParams.toString();
            const target = query ? `${pathname}?${query}` : pathname;
            router.replace(target, { locale: nextLocale });
        });
    };

    if (variant === "buttons") {
        return (
            <div className={cn("flex gap-1 w-full", className)}>
                <Button
                    variant={locale === "es" ? "secondary" : "ghost"}
                    size="sm"
                    className="w-full justify-start gap-2 h-8"
                    disabled={isPending}
                    onClick={() => switchLocale("es")}
                >
                    {isPending && locale !== "es" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                        <img
                            src="https://flagcdn.com/es.svg"
                            alt="ES"
                            className="w-4 h-4 rounded-full object-cover shrink-0"
                        />
                    )}
                    <span className="text-xs">Español</span>
                </Button>
                <Button
                    variant={locale === "en" ? "secondary" : "ghost"}
                    size="sm"
                    className="w-full justify-start gap-2 h-8"
                    disabled={isPending}
                    onClick={() => switchLocale("en")}
                >
                    {isPending && locale !== "en" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                        <img
                            src="https://flagcdn.com/us.svg"
                            alt="EN"
                            className="w-4 h-4 rounded-full object-cover shrink-0"
                        />
                    )}
                    <span className="text-xs">English</span>
                </Button>
            </div>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    disabled={isPending}
                    className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full border border-border hover:bg-muted/50 transition-colors outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:opacity-60 cursor-pointer",
                        className
                    )}
                    aria-label="Cambiar idioma"
                >
                    <div className="w-5 h-5 rounded-full overflow-hidden border border-border/50 relative flex items-center justify-center">
                        {isPending ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                        ) : (
                            <img
                                src={locale === "es" ? "https://flagcdn.com/es.svg" : "https://flagcdn.com/us.svg"}
                                alt={locale === "es" ? "Español" : "English"}
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                    <span className="text-sm font-medium text-foreground uppercase">{locale}</span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground opacity-50" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[140px]">
                <DropdownMenuItem
                    onClick={() => switchLocale("es")}
                    disabled={isPending}
                    className={cn(
                        "gap-2 cursor-pointer",
                        locale === "es" && "bg-muted font-medium"
                    )}
                >
                    <div className="w-4 h-4 rounded-full overflow-hidden border border-border/50 relative">
                        <img src="https://flagcdn.com/es.svg" alt="ES" className="w-full h-full object-cover" />
                    </div>
                    <span>Español</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => switchLocale("en")}
                    disabled={isPending}
                    className={cn(
                        "gap-2 cursor-pointer",
                        locale === "en" && "bg-muted font-medium"
                    )}
                >
                    <div className="w-4 h-4 rounded-full overflow-hidden border border-border/50 relative">
                        <img src="https://flagcdn.com/us.svg" alt="EN" className="w-full h-full object-cover" />
                    </div>
                    <span>English</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
