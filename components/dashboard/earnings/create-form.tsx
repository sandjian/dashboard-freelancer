'use client';

import { useActionState } from 'react';
import { createEarning } from '@/lib/actions';
import type { EarningState } from '@/lib/definitions';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const DUMMY_CLIENTS = [
  { id: '1', name: 'Tabata' },
  { id: '2', name: 'AURA' },
  { id: '3', name: 'Fitness Shop' },
];

export function CreateEarningForm() {
  const initialState: EarningState = { message: null, errors: {} };
  const [state, formAction] = useActionState(createEarning, initialState);

  return (
    <form action={formAction} className="space-y-4">

      <div className="space-y-2">
        <Label htmlFor="concept">Concepto</Label>
        <Input
          id="concept"
          name="concept"
          placeholder="Ej: Diseño de Logo"
          aria-describedby="concept-error"
        />
        <div id="concept-error" aria-live="polite" aria-atomic="true">
          {state.errors?.concept && (
            <p className="text-sm text-red-500">{state.errors.concept[0]}</p>
          )}
        </div>
      </div>

      
      
      <div className="space-y-2">
        <Label htmlFor="client">Cliente</Label>
        <Select name="client">
          <SelectTrigger aria-describedby="client-error">
            <SelectValue placeholder="Selecciona un cliente" />
          </SelectTrigger>
          <SelectContent>
            {DUMMY_CLIENTS.map((client) => (
              <SelectItem key={client.id} value={client.name}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div id="client-error" aria-live="polite" aria-atomic="true">
          {state.errors?.client && (
            <p className="text-sm text-red-500">{state.errors.client[0]}</p>
          )}
        </div>
      </div>



      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2 col-span-2">
          <Label htmlFor="amount">Monto</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            placeholder="Ej: 50000"
            aria-describedby="amount-error"
          />
          <div id="amount-error" aria-live="polite" aria-atomic="true">
            {state.errors?.amount && (
              <p className="text-sm text-red-500">{state.errors.amount[0]}</p>
            )}
          </div>
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




      <div className="space-y-2">
        <Label htmlFor="status">Estado</Label>
        <Select name="status" defaultValue="Facturado">
          <SelectTrigger aria-describedby="status-error">
            <SelectValue placeholder="Selecciona un estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Facturado">Facturado</SelectItem>
            <SelectItem value="Por cobrar">Por cobrar</SelectItem>
          </SelectContent>
        </Select>
        <div id="status-error" aria-live="polite" aria-atomic="true">
          {state.errors?.status && (
            <p className="text-sm text-red-500">{state.errors.status[0]}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dueDate">Fecha de Cobro</Label>
        <Input
          id="dueDate"
          name="dueDate"
          type="date"
          aria-describedby="dueDate-error"
          defaultValue={new Date().toISOString().split('T')[0]}
        />
        <div id="dueDate-error" aria-live="polite" aria-atomic="true">
          {state.errors?.dueDate && (
            <p className="text-sm text-red-500">{state.errors.dueDate[0]}</p>
          )}
        </div>
      </div>

      {state.message && (
        <p className="text-sm text-red-500">{state.message}</p>
      )}

      <div className="flex justify-end pt-4">
        <Button type="submit">Crear Ingreso</Button>
      </div>
    </form>
  );
}