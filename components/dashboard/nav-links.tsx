"use client";

import { usePathname, useSearchParams } from 'next/navigation';
import {
  UserGroupIcon,
  HomeIcon,
  DocumentDuplicateIcon,
  BanknotesIcon,
  CreditCardIcon,
  BuildingLibraryIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NavLinksProps {
  isCollapsed?: boolean;
}

export default function NavLinks({ isCollapsed = false }: NavLinksProps) {
  const t = useTranslations('Common');
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentParams = new URLSearchParams(searchParams);
  const year = currentParams.get('year');
  const month = currentParams.get('month');

  const queryString = (year && month) ? `?year=${year}&month=${month}` : '';

  const links = [
    { name: t('dashboard'), href: '/dashboard', icon: HomeIcon },
    { name: t('invoices'), href: '/dashboard/finances/invoices', icon: DocumentDuplicateIcon },
    { name: t('expenses'), href: '/dashboard/finances/expenses', icon: BanknotesIcon },
    { name: t('cards'), href: '/dashboard/finances/cards', icon: CreditCardIcon },
    { name: t('banking'), href: '/dashboard/finances/banks', icon: BuildingLibraryIcon },
    { name: t('clients'), href: '/dashboard/finances/clients', icon: UserGroupIcon },
    { name: t('agenda'), href: '/dashboard/agenda', icon: CalendarIcon },
  ];

  return (
    <div className="flex flex-col space-y-1 w-full">
      {links.map((link) => {
        const LinkIcon = link.icon;
        const isActive =
          pathname.endsWith(link.href) ||
          (link.href !== '/dashboard' && pathname.includes(link.href));

        const linkContent = (
          <Link
            href={`${link.href}${queryString}`}
            className={cn(
              'group relative flex h-10 w-full items-center rounded-lg text-sm font-medium transition-all duration-200 select-none outline-none',
              isCollapsed
                ? 'justify-center px-0'
                : 'justify-start px-3 gap-3',
              isActive
                ? 'bg-sidebar-accent text-sidebar-primary dark:text-white shadow-xs font-semibold'
                : 'text-sidebar-foreground/75 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
            )}
          >
            <LinkIcon className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-105" />

            {/* In collapsed mode, the text is completely removed from flow */}
            {!isCollapsed && (
              <span className="truncate transition-opacity duration-200 text-xs sm:text-sm">
                {link.name}
              </span>
            )}
          </Link>
        );

        if (isCollapsed) {
          return (
            <Tooltip key={link.href}>
              <TooltipTrigger asChild>
                {linkContent}
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={12}>
                {link.name}
              </TooltipContent>
            </Tooltip>
          );
        }

        return <div key={link.href}>{linkContent}</div>;
      })}
    </div>
  );
}
