"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HorizontalThemeWipeToggle } from "@/components/ui/theme-toggle";
import { LocaleSwitcher } from "@/components/dashboard/locale-switcher";
import { Button } from "@/components/ui/button";

interface UserMobileMenuProps {
    user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
}

export function UserMobileMenu({ user }: UserMobileMenuProps) {
    const userInitials = user?.name
        ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
        : 'CN';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 xl:hidden">
                    <Avatar className="h-9 w-9 border border-border">
                        <AvatarImage src={user?.image || "https://github.com/shadcn.png"} alt={user?.name || "@user"} />
                        <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name || 'Usuario'}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user?.email || 'm@example.com'}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Theme Toggle Section */}
                <div className="px-2 py-1.5">
                    <p className="mb-2 px-2 text-xs font-semibold text-muted-foreground">Tema</p>
                    <div className="flex justify-center">
                        <HorizontalThemeWipeToggle />
                    </div>
                </div>
                <DropdownMenuSeparator />

                {/* Language Selector Section */}
                <div className="px-2 py-1.5">
                    <p className="mb-2 px-2 text-xs font-semibold text-muted-foreground">Idioma</p>
                    <LocaleSwitcher variant="buttons" />
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
