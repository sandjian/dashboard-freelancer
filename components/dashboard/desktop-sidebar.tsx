"use client";

import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { PowerIcon } from '@heroicons/react/24/outline';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import NavLinks from './nav-links';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { logOut } from '@/lib/actions';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function DesktopSidebar({
  user,
  isOpen,
  onToggle,
}: {
  user?: { name?: string | null; email?: string | null; image?: string | null };
  isOpen: boolean;
  onToggle: () => void;
}) {
  const t = useTranslations('Common');

  return (
    <aside
      className={cn(
        "hidden xl:flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-200 ease-in-out relative z-20 shrink-0 select-none",
        isOpen ? "w-64 px-4 py-4" : "w-18 px-2.5 py-4 items-center"
      )}
    >
      {/* Sidebar Header with Brand Logo and Elegant Collapse Button */}
      <div
        className={cn(
          "mb-5 flex items-center w-full min-h-[40px]",
          isOpen ? "justify-between px-1" : "justify-center px-0"
        )}
      >
        {isOpen && (
          <Link
            className="group relative overflow-hidden flex items-center justify-start outline-none"
            href="/dashboard"
          >
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-sidebar-foreground group-hover:text-sidebar-primary transition-colors">
                AVALON
              </span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold group-hover:text-sidebar-primary/70 transition-colors">
                Intelligent Finance
              </span>
            </div>
          </Link>
        )}

        {/* Toggle Button for collapsing/expanding sidebar */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              aria-label={isOpen ? "Colapsar barra lateral" : "Expandir barra lateral"}
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors cursor-pointer"
            >
              {isOpen ? (
                <PanelLeftClose className="w-4 h-4" />
              ) : (
                <PanelLeftOpen className="w-4 h-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={12}>
            {isOpen ? "Colapsar barra lateral" : "Expandir barra lateral"}
          </TooltipContent>
        </Tooltip>
      </div>

      {/* NavLinks container */}
      <div className="flex grow flex-col space-y-1.5 overflow-y-auto overflow-x-hidden w-full scrollbar-none">
        <NavLinks isCollapsed={!isOpen} />
      </div>

      {/* Sign Out Action at Footer */}
      <div className="pt-3 mt-auto border-t border-sidebar-border/60 w-full">
        <form action={logOut} className="w-full">
          {!isOpen ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="submit"
                  variant="ghost"
                  className={cn(
                    "w-full h-10 rounded-lg text-xs font-medium text-sidebar-foreground/80 hover:text-destructive hover:bg-destructive/10 border border-transparent transition-all duration-200 select-none cursor-pointer justify-center px-0"
                  )}
                >
                  <PowerIcon className="w-5 h-5 shrink-0 transition-transform duration-200" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={12}>
                {t('signOut')}
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              type="submit"
              variant="ghost"
              className={cn(
                "w-full h-10 rounded-lg text-xs font-medium text-sidebar-foreground/80 hover:text-destructive hover:bg-destructive/10 border border-transparent transition-all duration-200 select-none cursor-pointer justify-start px-3 gap-3"
              )}
            >
              <PowerIcon className="w-5 h-5 shrink-0 transition-transform duration-200" />
              <span className="truncate">{t('signOut')}</span>
            </Button>
          )}
        </form>
      </div>
    </aside>
  );
}
