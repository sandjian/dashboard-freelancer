"use client";

import { usePathname, useSearchParams } from 'next/navigation';
import {
  UserGroupIcon,
  HomeIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import clsx from 'clsx';

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  { name: 'Ingresos', href: '/dashboard/finances/earnings', icon: DocumentDuplicateIcon,},
  { name: 'Gastos', href: '/dashboard/finances/expenses', icon: UserGroupIcon },
  { name: 'Tarjetas', href: '/dashboard/finances/cards', icon: UserGroupIcon },
  { name: 'Ahorro en Dolares', href: '/dashboard/finances/cards', icon: UserGroupIcon },
  { name: 'Agenda', href: '/dashboard/calendary', icon: UserGroupIcon },
  { name: 'Lista de tareas', href: '/dashboard/to-do-list', icon: UserGroupIcon },
];

export default function NavLinks() {
  const pathname = usePathname();
  const searchParams = useSearchParams(); // Hook para leer la URL

  // Obtenemos los parámetros de fecha actuales
  const currentParams = new URLSearchParams(searchParams);
  const year = currentParams.get('year');
  const month = currentParams.get('month');

  // Creamos el string de la consulta que se añadirá a los enlaces
  const queryString = (year && month) ? `?year=${year}&month=${month}` : '';

  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          // 👇 CADA ENLACE AHORA LLEVA EL MES Y AÑO EN SU HREF 👇
          <Link
            key={link.name}
            href={`${link.href}${queryString}`}
            className={clsx(
              'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
              {
                'bg-sky-100 text-blue-600': pathname === link.href,
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
