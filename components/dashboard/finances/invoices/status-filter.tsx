'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckCircleIcon, ClockIcon, XCircleIcon, ListFilter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function StatusButtons() {
  const t = useTranslations('Invoices');
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const statuses = [
    {
      name: t('filterPaid'),
      value: 'facturado',
      icon: CheckCircleIcon,
      className: "text-muted-foreground hover:text-foreground hover:bg-muted/50",
      activeClassName: "bg-primary text-primary-foreground shadow-xs"
    },
    {
      name: t('filterPending'),
      value: 'pendiente',
      icon: ClockIcon,
      className: "text-muted-foreground hover:text-foreground hover:bg-muted/50",
      activeClassName: "bg-secondary text-secondary-foreground shadow-xs border border-border"
    },
    {
      name: t('filterOverdue'),
      value: 'vencido',
      icon: XCircleIcon,
      className: "text-muted-foreground hover:text-foreground hover:bg-muted/50",
      activeClassName: "bg-destructive text-destructive-foreground shadow-xs"
    },
  ];

  const activeStatus = searchParams.get('status') || '';

  const handleFilter = (statusValue: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');

    if (activeStatus === statusValue) {
      params.delete('status');
    } else {
      if (statusValue) {
        params.set('status', statusValue);
      } else {
        params.delete('status');
      }
    }

    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <>
      {/* Mobile & Tablet (< xl): Compact clean Select dropdown */}
      <div className="w-full xl:hidden">
        <Select
          value={activeStatus || 'all'}
          onValueChange={(val) => handleFilter(val === 'all' ? '' : val)}
        >
          <SelectTrigger className="w-full h-10 bg-background border-border rounded-xl text-xs text-foreground">
            <div className="flex items-center gap-2">
              <ListFilter className="w-3.5 h-3.5 text-muted-foreground" />
              <SelectValue placeholder={t('allStatuses')} />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all" className="text-xs">
              {t('allStatuses')}
            </SelectItem>
            {statuses.map((status) => (
              <SelectItem key={status.value} value={status.value} className="text-xs">
                {status.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop (xl+): Apaisado / Horizontal segmented control */}
      <div className="hidden xl:flex bg-muted/50 p-1 rounded-xl items-center gap-1 border border-border w-max">
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
          {t('filterAll')}
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
                "h-8 px-3 text-xs font-medium rounded-lg transition-all duration-200 border-0 cursor-pointer",
                isActive ? status.activeClassName : status.className
              )}
            >
              <Icon className="mr-1.5 h-3.5 w-3.5" />
              <span>{status.name}</span>
            </Button>
          );
        })}
      </div>
    </>
  );
}