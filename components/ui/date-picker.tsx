'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface DatePickerPreset {
  label: string;
  days: number | 'eom';
}

export interface DatePickerProps {
  name?: string;
  defaultValue?: Date;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  baseDate?: Date; // Fecha base para calcular atajos (ej. fecha de emisión)
  presets?: DatePickerPreset[];
}

export function DatePicker({
  name,
  defaultValue,
  value,
  onChange,
  className,
  placeholder = 'Selecciona una fecha',
  disabled = false,
  baseDate,
  presets,
}: DatePickerProps) {
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(defaultValue);
  const [open, setOpen] = React.useState(false);

  // Soporta modo controlado (value) o no controlado (internalDate)
  const isControlled = value !== undefined;
  const selectedDate = isControlled ? value : internalDate;

  const handleSelect = (date: Date | undefined) => {
    if (!isControlled) {
      setInternalDate(date);
    }
    onChange?.(date);
    if (date && !presets) {
      setOpen(false);
    }
  };

  const handleApplyPreset = (days: number | 'eom') => {
    const base = new Date(baseDate || new Date());
    let nextDate: Date;
    if (days === 'eom') {
      nextDate = new Date(base.getFullYear(), base.getMonth() + 1, 0);
    } else {
      base.setDate(base.getDate() + days);
      nextDate = new Date(base);
    }

    if (!isControlled) {
      setInternalDate(nextDate);
    }
    onChange?.(nextDate);
    setOpen(false);
  };

  return (
    <div className={cn('relative w-full', className)}>
      {name && (
        <input
          type="hidden"
          name={name}
          value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
        />
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              'w-full justify-start text-left font-normal h-10 px-3.5 rounded-xl border-border bg-background hover:bg-muted/50 text-foreground transition-all',
              !selectedDate && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate block">
              {selectedDate ? (
                format(selectedDate, 'PPP', { locale: es })
              ) : (
                placeholder
              )}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 bg-popover border border-border shadow-xl rounded-xl overflow-hidden z-50 opacity-100"
          align="start"
        >
          {presets && presets.length > 0 && (
            <div className="p-3 border-b border-border/80 bg-muted/40">
              <div className="flex items-center gap-1.5 mb-2 text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  Plazos rápidos
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {presets.map((preset) => (
                  <Button
                    key={preset.label}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleApplyPreset(preset.days)}
                    className="h-6 px-2 text-[11px] font-medium bg-card hover:bg-muted text-foreground border-border rounded-lg transition-colors cursor-pointer"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="p-2 bg-popover">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleSelect}
              initialFocus
              className="bg-popover opacity-100"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}