'use client';

import { useActionState } from 'react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { createCard } from '@/lib/actions';
import type { CardState } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function CreateCardForm() {
  const initialState: CardState = { message: null, errors: {} };
  const [state, formAction] = useActionState(createCard, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message?.includes('éxito')) {
      toast.success('Tarjeta Creada', {
        description: state.message,
      });
      formRef.current?.reset();
    } else if (state.message) {
      toast.error('Error', {
        description: state.message,
      });
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre de la Tarjeta</Label>
        <Input id="name" name="name" placeholder="Ej: Visa Banco Galicia" />
        {state.errors?.name && <p className="text-sm text-red-500">{state.errors.name[0]}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="last_four_digits">Últimos 4 Dígitos (Opcional)</Label>
        <Input id="last_four_digits" name="last_four_digits" placeholder="Ej: 1234" maxLength={4} />
        {state.errors?.last_four_digits && <p className="text-sm text-red-500">{state.errors.last_four_digits[0]}</p>}
      </div>
      
      <div className="flex gap-4">
        <div className="flex-1 space-y-2">
          <Label htmlFor="closing_day">Día de Cierre</Label>
          <Input id="closing_day" name="closing_day" type="number" min="1" max="31" placeholder="Ej: 25" />
          {state.errors?.closing_day && <p className="text-sm text-red-500">{state.errors.closing_day[0]}</p>}
        </div>
        <div className="flex-1 space-y-2">
          <Label htmlFor="due_day">Día de Vencimiento</Label>
          <Input id="due_day" name="due_day" type="number" min="1" max="31" placeholder="Ej: 5" />
          {state.errors?.due_day && <p className="text-sm text-red-500">{state.errors.due_day[0]}</p>}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit">Guardar Tarjeta</Button>
      </div>
    </form>
  );
}