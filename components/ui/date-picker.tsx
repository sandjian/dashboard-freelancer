'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale'; // Para formato en español
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerProps {
  name: string;
  defaultValue?: Date;
}

export function DatePicker({ name, defaultValue }: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(defaultValue);

  return (
    <div>
        <input 
        type="hidden" 
        name={name} 
        // Formateamos la fecha al formato que el servidor puede interpretar
        value={date ? date.toISOString().split('T')[0] : ''} 
      />
      
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={'outline'}
            className={cn(
              'w-full justify-start text-left font-normal rounded-xl text-xs border-white  px-4 py-6',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-6 w-6 text-info/80" />
            {date ? format(date, 'PPP', { locale: es }) : <span>Selecciona una fecha</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white text-xs">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}