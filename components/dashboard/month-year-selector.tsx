'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function DateNavigator() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const year = Number(searchParams.get('year')) || currentYear;
  const month = Number(searchParams.get('month')) || currentMonth;

  const handleNavigate = (direction: 'prev' | 'next' | 'today') => {
    const params = new URLSearchParams(searchParams);
    let newYear = year;
    let newMonth = month;

    if (direction === 'today') {
      newYear = currentYear;
      newMonth = currentMonth;
    } else {
      const date = new Date(year, month - 1); // JS Date months are 0-indexed
      if (direction === 'prev') {
        date.setMonth(date.getMonth() - 1);
      } else { // next
        date.setMonth(date.getMonth() + 1);
      }
      newYear = date.getFullYear();
      newMonth = date.getMonth() + 1;
    }

    params.set('year', String(newYear));
    params.set('month', String(newMonth));
    params.set('page', '1'); // Reset page to 1 when changing period
    replace(`${pathname}?${params.toString()}`);
  };

  const displayDate = `${monthNames[month - 1]} ${year}`;

  return (
    <Card>
      <CardContent className='flex items-center'>

      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => handleNavigate('prev')}
        aria-label="Mes anterior"
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </Button>
      
      <span className="w-32 text-center font-semibold text-sm">
        {displayDate}
      </span>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => handleNavigate('next')}
        aria-label="Mes siguiente"
      >
        <ChevronRightIcon className="h-4 w-4" />
      </Button>

      <Button 
        variant="outline"
        size="sm"
        className="ml-2"
        onClick={() => handleNavigate('today')}
      >
        Hoy
      </Button>
      </CardContent>
    </Card>
  );
}