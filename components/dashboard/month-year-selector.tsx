'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const months = [
  { value: '1', label: 'Enero' }, { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' }, { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' }, { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' }, { value: '8', label: 'Agosto' },
  { value: '9', label: 'Septiembre' }, { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i));

export function MonthYearSelector() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const selectedYear = searchParams.get('year') || String(currentYear);
  const selectedMonth = searchParams.get('month') || String(new Date().getMonth() + 1);

  const handleDateChange = (value: string, type: 'year' | 'month') => {
    const params = new URLSearchParams(searchParams);
    params.set(type, value);
    
    // Nos aseguramos de que el otro parámetro siempre esté presente en la URL
    if (type === 'month') {
        params.set('year', selectedYear);
    } else {
        params.set('month', selectedMonth);
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex gap-4">
      <Select 
        value={selectedMonth} 
        onValueChange={(value) => handleDateChange(value, 'month')}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Mes" />
        </SelectTrigger>
        <SelectContent>
          {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select 
        value={selectedYear} 
        onValueChange={(value) => handleDateChange(value, 'year')}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Año" />
        </SelectTrigger>
        <SelectContent>
          {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}