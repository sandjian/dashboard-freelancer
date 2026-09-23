'use client';

import clsx from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export default function Pagination({ totalPages }: { totalPages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full py-2 px-2">
      <div className="text-xs text-muted-foreground order-2 sm:order-1 font-mono">
        Página {currentPage} de {totalPages}
      </div>

      <div className="flex gap-1 order-1 sm:order-2">
        <PaginationArrow
          direction="left"
          href={createPageURL(currentPage - 1)}
          isDisabled={currentPage <= 1}
        />

        <PaginationArrow
          direction="right"
          href={createPageURL(currentPage + 1)}
          isDisabled={currentPage >= totalPages}
        />
      </div>
    </div>
  );
}

function PaginationArrow({
  href,
  direction,
  isDisabled,
}: {
  href: string;
  direction: 'left' | 'right';
  isDisabled?: boolean;
}) {
  const className = clsx(
    'flex h-8 w-8 items-center justify-center rounded-md border border-transparent',
    {
      'pointer-events-none text-muted-foreground/50': isDisabled,
      'hover:bg-muted hover:text-foreground text-muted-foreground': !isDisabled,
    },
  );

  const icon =
    direction === 'left' ? (
      <ChevronLeft className="w-5 h-5" />
    ) : (
      <ChevronRight className="w-5 h-5" />
    );

  return isDisabled ? (
    <div className={className}>{icon}</div>
  ) : (
    <Link
      className={className}
      href={href}
      scroll={false}
      aria-label={direction === 'left' ? 'Página anterior' : 'Página siguiente'}
    >
      {icon}
    </Link>
  );
}