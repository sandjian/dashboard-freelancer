'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { createRecurringTransaction } from '@/lib/actions';
import type { RecurringTransactionState } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Datos de ejemplo
const DUMMY_CLIENTS = [ { id: '1', name: 'TechCorp' }, { id: '2', name: 'InnovateX' }];
const DUMMY_CATEGORIES = [ { id: '1', name: 'Oficina' }, { id: '2', name: 'Servicios' }, { id: '3', name: 'Suscripciones' }];

export function CreateRecurringForm() {
  const initialState: RecurringTransactionState = { message: null, errors: {} };
  const [state, formAction] = useActionState(createRecurringTransaction, initialState);
  const [transactionType, setTransactionType] = useState('expense');

  return (
    <form action={formAction} className="space-y-4">
      {/* --- Selector de Tipo --- */}
      <div className="space-y-2">
        <Label htmlFor="type">Tipo de Transacción</Label>
        <Select name="type" defaultValue={transactionType} onValueChange={setTransactionType}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="expense">Gasto Fijo</SelectItem>
            <SelectItem value="earning">Ingreso Fijo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* --- Concepto (Común a ambos) --- */}
      <div className="space-y-2">
        <Label htmlFor="concept">Concepto</Label>
        <Input id="concept" name="concept" placeholder="Ej: Alquiler Oficina / Servicios Marca X" />
        {state.errors?.concept && <p className="text-sm text-red-500">{state.errors.concept[0]}</p>}
      </div>

      {/* --- CAMPOS DINÁMICOS --- */}
      {transactionType === 'expense' ? (
        <div className="space-y-2">
          <Label htmlFor="category">Categoría</Label>
          <Select name="category">
            <SelectTrigger><SelectValue placeholder="Selecciona una categoría" /></SelectTrigger>
            <SelectContent>
              {DUMMY_CATEGORIES.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {state.errors?.category && <p className="text-sm text-red-500">{state.errors.category[0]}</p>}
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="client">Cliente</Label>
           <Select name="client">
            <SelectTrigger><SelectValue placeholder="Selecciona un cliente" /></SelectTrigger>
            <SelectContent>
              {DUMMY_CLIENTS.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {state.errors?.client && <p className="text-sm text-red-500">{state.errors.client[0]}</p>}
        </div>
      )}

      {/* --- Monto y Moneda --- */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2 col-span-2">
          <Label htmlFor="amount">Monto</Label>
          <Input id="amount" name="amount" type="number" step="0.01" />
           {state.errors?.amount && <p className="text-sm text-red-500">{state.errors.amount[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Moneda</Label>
          <Select name="currency" defaultValue="ARS">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ARS">ARS</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* --- Día del Mes --- */}
      <div className="space-y-2">
        <Label htmlFor="dayOfMonth">Día del Mes de Generación</Label>
        <Input id="dayOfMonth" name="dayOfMonth" type="number" min="1" max="31" placeholder="Ej: 5, 10, 25"/>
        {state.errors?.dayOfMonth && <p className="text-sm text-red-500">{state.errors.dayOfMonth[0]}</p>}
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit">Guardar Plantilla</Button>
      </div>
    </form>
  );
}