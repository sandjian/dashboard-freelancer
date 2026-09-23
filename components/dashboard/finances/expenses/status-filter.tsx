'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckCircleIcon, ClockIcon, ListFilter, XCircleIcon } from 'lucide-react';

const statuses = [
  {
    name: 'Pagado',
    value: 'paid',
    icon: CheckCircleIcon,
    className: "text-muted-foreground hover:text-foreground hover:bg-muted/50",
    activeClassName: "bg-primary text-primary-foreground shadow-xs"
  },
  {
    name: 'Pendiente',
    value: 'pending',
    icon: ClockIcon,
    className: "text-muted-foreground hover:text-foreground hover:bg-muted/50",
    activeClassName: "bg-secondary text-secondary-foreground shadow-xs border border-border"
  },
  {
    name: 'Vencido',
    value: 'overdue',
    icon: XCircleIcon,
    className: "text-muted-foreground hover:text-foreground hover:bg-muted/50",
    activeClassName: "bg-destructive text-destructive-foreground shadow-xs"
  },
];

export function ExpenseStatusButtons() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const activeStatus = searchParams.get('status');

  const handleFilter = (statusValue: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');

    if (activeStatus === statusValue) {
      params.delete('status');
    } else {
      if (statusValue) {
        params.set('status', statusValue);
      } else {
        params.delete('status'); // Clear filter
      }
    }

    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="bg-muted/50 p-1 rounded-xl flex items-center gap-1 border border-border w-max min-w-full sm:min-w-0 justify-between sm:justify-start">
      {/* Botón para "Todos" */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleFilter('')}
        className={cn(
          "h-8 px-3 text-xs font-medium rounded-lg transition-all duration-200 border-0 cursor-pointer",
          !activeStatus
            ? "bg-card text-foreground shadow-xs font-semibold"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        )}
      >
        <ListFilter className="mr-1.5 h-3.5 w-3.5" />
        Todos
      </Button>

      {statuses.map((status) => {
        const Icon = status.icon;
        const isActive = activeStatus === status.value;

        return (
          <Button
            key={status.value}
            variant="ghost"
            size="sm"
            onClick={() => handleFilter(status.value)}
            className={cn(
              "h-8 px-2.5 sm:px-3 text-xs font-medium rounded-lg transition-all duration-200 border-0 cursor-pointer",
              isActive ? status.activeClassName : status.className
            )}
          >
            <Icon className="mr-1.5 h-3.5 w-3.5" />
            <span>{status.name}</span>
          </Button>
        );
      })}
    </div>
  );
}
