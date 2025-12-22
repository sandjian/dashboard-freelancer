'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckCircleIcon, ClockIcon, XCircleIcon, ListFilter } from 'lucide-react';

// 1. Expandimos la estructura para incluir íconos y estilos
const statuses = [
  { 
    name: 'Facturado', 
    value: 'facturado', 
    icon: CheckCircleIcon, 
    className: "border-success text-success hover:scale-105 shadow-md",
    activeClassName: " border-success text-white bg-success hover:scale-105"
  },
  { 
    name: 'Pendiente', 
    value: 'pendiente', 
    icon: ClockIcon,
    className: "border-warning text-warning hover:scale-105 shadow-md",
    activeClassName: "border-warning text-white bg-warning hover:scale-105"
  },
  { 
    name: 'Vencido', 
    value: 'vencido', 
    icon: XCircleIcon,
    className: "border-danger text-danger hover:scale-105 shadow-md",
    activeClassName: "border-danger text-white bg-danger hover:scale-105"
  },
];

export function StatusButtons() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  const activeStatus = searchParams.get('query');

  const handleFilter = (statusValue: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');

    if (params.get('query') === statusValue) {
      params.delete('query');
    } else {
      params.set('query', statusValue);
    }
    
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Botón para "Limpiar Filtro" */}
      <Button
        variant={!activeStatus || !statuses.some(s => s.value === activeStatus) ? 'default' : 'outline'}
        onClick={() => handleFilter('')}
        className="h-8 px-3 hover:scale-105 shadow-md cursor-pointer"
      >
        <ListFilter className="mr-2 h-4 w-4" />
        Todos
      </Button>

      {/* 2. Mapeamos la nueva estructura */}
      {statuses.map((status) => {
        const Icon = status.icon;
        const isActive = activeStatus === status.value;
        
        return (
          <Button
            key={status.value}
            variant="outline"
            onClick={() => handleFilter(status.value)}
            // 3. Aplicamos los estilos dinámicamente
            className={cn(
              "h-8 px-2.5 py-1.5 text-xs sm:text-sm cursor-pointer", // Clases base
              isActive ? status.activeClassName : status.className // Clases condicionales
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