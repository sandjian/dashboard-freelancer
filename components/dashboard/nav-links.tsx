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
import clsx from 'clsx';
import { useTranslations } from 'next-intl';

export default function NavLinks() {
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
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        // Basic active check (might need improvement for locale prefixes if usePathname includes it)
        // usage of next/navigation usePathname in localized app usually includes locale: /es/dashboard
        // links.href is /dashboard.
        // We really should use `usePathname` from `next-intl/navigation` or just check inclusion.
        // Actually, let's strictly check content.

        // However, next-intl's Link handles the href prop by adding locale.
        // But for active state, we compare the current pathname.

        // Cleanest way:
        // pathname might be "/es/dashboard/..."
        // link.href is "/dashboard"

        // Let's use a simpler check for now: 
        const isActive = pathname.endsWith(link.href) || (link.href !== '/dashboard' && pathname.includes(link.href));

        return (
          <Link
            key={link.href}
            href={`${link.href}${queryString}`}
            className={clsx(
              'flex h-[48px] grow items-center justify-center gap-2 rounded-md p-3 text-sm font-medium transition-all duration-200 md:flex-none md:justify-start md:p-2 md:px-3',
              {
                'bg-sidebar-accent text-sidebar-primary dark:text-white shadow-sm': isActive,
                'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground': !isActive,
              },
            )}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
