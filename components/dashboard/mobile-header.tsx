"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Menu, PowerIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logOut } from "@/lib/actions";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import NavLinks from "./nav-links";
import { UserMobileMenu } from "./user-mobile-menu";
import { HorizontalThemeWipeToggle } from "@/components/ui/theme-toggle";

export function MobileHeader({
  user,
}: {
  user?: { name?: string | null; email?: string | null; image?: string | null };
}) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("Common");

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-background/95 px-4 sm:px-6 backdrop-blur-md xl:hidden">
      {/* Menu burger & Brand */}
      <div className="flex items-center gap-2.5">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-foreground hover:bg-muted cursor-pointer"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="top"
            className="w-full max-h-[85vh] p-0 flex flex-col justify-between bg-sidebar border-b border-sidebar-border shadow-2xl overflow-hidden"
          >
            <div className="flex flex-col flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              <SheetHeader className="text-left pb-4 border-b border-sidebar-border flex flex-row items-center justify-between">
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex flex-col"
                >
                  <SheetTitle className="text-2xl font-extrabold tracking-tighter text-sidebar-foreground">
                    AVALON
                  </SheetTitle>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium mt-0.5">
                    Intelligent Finance
                  </p>
                </Link>
              </SheetHeader>

              <div className="flex-1 space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2 mb-1">
                  Navegación
                </p>
                {/* Links list with icons and names in full screen width */}
                <div
                  onClick={() => setOpen(false)}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-1.5"
                >
                  <NavLinks />
                </div>
              </div>
            </div>

            {/* Bottom Footer inside mobile top drawer */}
            <div className="p-4 sm:p-5 border-t border-sidebar-border/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-sidebar/70">
              <div className="flex items-center justify-between sm:justify-start gap-3 px-1">
                <span className="text-xs text-muted-foreground font-medium">Tema</span>
                <HorizontalThemeWipeToggle />
              </div>
              <form action={logOut} className="w-full">
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  className="w-full justify-center sm:justify-start gap-2 h-9 text-xs text-muted-foreground hover:text-destructive hover:border-destructive/30 border-sidebar-border bg-sidebar-accent/20 cursor-pointer"
                >
                  <PowerIcon className="w-4 h-4" />
                  <span>{t("signOut")}</span>
                </Button>
              </form>
            </div>
          </SheetContent>
        </Sheet>

        <Link href="/dashboard" className="flex items-center gap-1.5">
          <span className="text-xl font-black tracking-tight text-foreground">
            AVALON
          </span>
        </Link>
      </div>

      {/* Right controls: Theme + User mobile menu */}
      <div className="flex items-center gap-2">
        <UserMobileMenu user={user} />
      </div>
    </header>
  );
}
