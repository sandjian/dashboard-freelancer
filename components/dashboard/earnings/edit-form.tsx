'use client';

import { useActionState } from 'react';
import { updateEarning } from '@/lib/actions';
import type { Earning, EarningState } from '@/lib/definitions';
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

const DUMMY_CLIENTS = [ { id: '1', name: 'TechCorp' }, { id: '2', name: 'InnovateX' }, { id: '3', name: 'MarketingPro' }];

export function EditEarningForm({ earning }: { earning: Earning }) {
  const initialState: EarningState = { message: null, errors: {} };
  const updateEarningWithId = updateEarning.bind(null, earning.id);
  const [state, formAction] = useActionState(updateEarningWithId, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {/* Concepto */}
      <div className="space-y-2">
        <Label htmlFor="concept">Concepto</Label>
        <Input id="concept" name="concept" defaultValue={earning.concept} />
        {/* 👇 Solución al aviso de ESLint: Usar 'state' para mostrar errores */}
        <div id="concept-error" aria-live="polite" aria-atomic="true">
          {state.errors?.concept && (
            <p className="text-sm text-red-500">{state.errors.concept[0]}</p>
          )}
        </div>
      </div>

      {/* Cliente */}
      <div className="space-y-2">
        <Label htmlFor="client">Cliente</Label>
        <Select name="client" defaultValue={earning.client}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{DUMMY_CLIENTS.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
        </Select>
        <div id="client-error" aria-live="polite" aria-atomic="true">
          {state.errors?.client && (
            <p className="text-sm text-red-500">{state.errors.client[0]}</p>
          )}
        </div>
      </div>

      {/* Monto */}
      <div className="space-y-2">
        <Label htmlFor="amount">Monto</Label>
        <Input id="amount" name="amount" type="number" defaultValue={earning.amount} />
        <div id="amount-error" aria-live="polite" aria-atomic="true">
          {state.errors?.amount && (
            <p className="text-sm text-red-500">{state.errors.amount[0]}</p>
          )}
        </div>
      </div>
<div className="grid grid-cols-3 gap-4">
        <div className="space-y-2 col-span-2">
          <Label htmlFor="currency">Moneda</Label>
          <Select name="currency" defaultValue={earning.currency || 'ARS'}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ARS">ARS</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
            </SelectContent>
          </Select>
        </div>
        </div>

      {/* Estado */}
      <div className="space-y-2">
        <Label htmlFor="status">Estado</Label>
        <Select name="status" defaultValue={earning.status}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Por cobrar">Por Cobrar</SelectItem>
            <SelectItem value="Facturado">Facturado</SelectItem>
          </SelectContent>
        </Select>
         <div id="status-error" aria-live="polite" aria-atomic="true">
          {state.errors?.status && (
            <p className="text-sm text-red-500">{state.errors.status[0]}</p>
          )}
        </div>
      </div>

      {/* Fecha */}
      <div className="space-y-2">
        <Label htmlFor="dueDate">Fecha</Label>
        {/* 👇 Solución al error 'toISOString': Comprobamos si la fecha existe */}
        <Input 
          id="dueDate" 
          name="dueDate" 
          type="date" 
          defaultValue={earning.dueDate?.toISOString().split('T')[0]} 
        />
        <div id="dueDate-error" aria-live="polite" aria-atomic="true">
          {state.errors?.dueDate && (
            <p className="text-sm text-red-500">{state.errors.dueDate[0]}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit">Actualizar Ingreso</Button>
      </div>
    </form>
  );
}