'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckCircleIcon, ClockIcon, ListFilter } from 'lucide-react';

const statuses = [
  { 
    name: 'Pagado', 
    value: 'pagado', 
    icon: CheckCircleIcon, 
    className: "border-success text-success hover:scale-105 shadow-md",
    activeClassName: "border-success text-white bg-success hover:scale-105"
  },
  { 
    name: 'Pendiente', 
    value: 'pendiente', 
    icon: ClockIcon,
    className: "border-warning text-warning hover:scale-105 shadow-md",
    activeClassName: "border-warning text-white bg-warning hover:scale-105"
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

    if (params.get('status') === statusValue || statusValue === '') {
      params.delete('status');
    } else {
      params.set('status', statusValue);
    }
    
    // 👇 CONSOLE.LOG AÑADIDO PARA DEPURACIÓN 👇
    // Este log se mostrará en la consola del NAVEGADOR.
    console.log('[CLIENTE - Botones de Filtro] Navegando a:', `${pathname}?${params.toString()}`);
    
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={!activeStatus ? 'default' : 'outline'}
        onClick={() => handleFilter('')}
        className="h-8 px-3 hover:scale-105 shadow-md cursor-pointer"
      >
        <ListFilter className="mr-2 h-4 w-4" />
        Todos
      </Button>

      {statuses.map((status) => {
        const Icon = status.icon;
        const isActive = activeStatus === status.value;
        
        return (
          <Button
            key={status.value}
            variant="outline"
            onClick={() => handleFilter(status.value)}
            className={cn(
              "h-8 px-2.5 py-1.5 text-xs sm:text-sm cursor-pointer",
              isActive ? status.activeClassName : status.className
            )}
          >
            <Icon className="mr-2 h-4 w-4" />
            {status.name}
          </Button>
        );
      })}
    </div>
  );
}