import { Link } from '@/i18n/routing';
import { signOut } from '@/auth';
import { useTranslations } from 'next-intl';

import { PowerIcon } from '@heroicons/react/24/outline';
import NavLinks from './nav-links';
import { UserMobileMenu } from './user-mobile-menu';


export default function SideNav({ user }: { user?: { name?: string | null; email?: string | null; image?: string | null } }) {
  const t = useTranslations('Common');

  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-4 bg-sidebar border-r border-sidebar-border rounded-r-2xl">
      <div className="mb-2 flex h-20 items-center justify-between md:h-40 md:justify-start md:flex-col md:items-start p-4">
        <Link
          className="group relative overflow-hidden flex items-center justify-start"
          href="/"
        >
          <div className="w-32 text-sidebar-foreground md:w-40 relative z-10">
            <span className='text-3xl font-extrabold tracking-tighter text-sidebar-foreground group-hover:text-sidebar-primary transition-colors duration-600'>AVALON</span>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium mt-1 group-hover:text-sidebar-primary/70 transition-colors">Intelligent Finance</p>
          </div>
        </Link>

        <div className="md:hidden">
          <UserMobileMenu user={user} />
        </div>
      </div>

      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2 mt-2">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md bg-transparent md:block"></div>

        {/* Theme Toggle */}


        <form action={async () => {
          'use server';
          await signOut({ redirectTo: '/login' });
        }}>
          <button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-sidebar-accent/20 border border-sidebar-border hover:bg-destructive/10 hover:border-destructive/30 p-3 text-sm font-medium text-sidebar-foreground hover:text-destructive transition-all duration-200 md:flex-none md:justify-start md:p-2 md:px-3">
            <PowerIcon className="w-6" />
            <div className="hidden md:block">{t('signOut')}</div>
          </button>
        </form>

      </div>
    </div>
  );
}