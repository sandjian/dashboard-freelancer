'use client';

import { useActionState } from 'react';
import { updateExpense } from '@/lib/actions';
import type { Expenses, ExpensesState } from '@/lib/definitions';
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

const Category = [
  { id: '1', name: 'Alquiler' },
  { id: '2', name: 'Hogar' },
  { id: '3', name: 'Comida' },
];

export function EditExpenseForm({ expense }: { expense: Expenses }) {
  const initialState: ExpensesState = { message: null, errors: {} };
  const updateExpenseWithId = updateExpense.bind(null, expense.id);
  const [state, formAction] = useActionState(updateExpenseWithId, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {/* Concepto */}
      <div className="space-y-2">
        <Label htmlFor="concept">Concepto</Label>
        <Input id="concept" name="concept" defaultValue={expense.concept} />
        {/* 👇 Solución al aviso de ESLint: Usar 'state' para mostrar errores */}
        <div id="concept-error" aria-live="polite" aria-atomic="true">
          {state.errors?.concept && (
            <p className="text-sm text-red-500">{state.errors.concept[0]}</p>
          )}
        </div>
      </div>

      {/* Cliente */}
      <div className="space-y-2">
        <Label htmlFor="category">Categoria</Label>
        <Select name="category" defaultValue={expense.category}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{Category.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
        </Select>
        <div id="client-error" aria-live="polite" aria-atomic="true">
          {state.errors?.category && (
            <p className="text-sm text-red-500">{state.errors.category[0]}</p>
          )}
        </div>
      </div>

      {/* Monto */}
      <div className="space-y-2">
        <Label htmlFor="amount">Monto</Label>
        <Input id="amount" name="amount" type="number" defaultValue={expense.amount} />
        <div id="amount-error" aria-live="polite" aria-atomic="true">
          {state.errors?.amount && (
            <p className="text-sm text-red-500">{state.errors.amount[0]}</p>
          )}
        </div>
      </div>


      {/* Fecha */}
      <div className="space-y-2">
        <Label htmlFor="expenseDate">Fecha</Label>
        {/* 👇 Solución al error 'toISOString': Comprobamos si la fecha existe */}
        <Input 
          id="expenseDate" 
          name="expenseDate" 
          type="date" 
          defaultValue={expense.expenseDate?.toISOString().split('T')[0]} 
        />
        <div id="expenseDate-error" aria-live="polite" aria-atomic="true">
          {state.errors?.expenseDate && (
            <p className="text-sm text-red-500">{state.errors.expenseDate[0]}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit">Actualizar Ingreso</Button>
      </div>
    </form>
  );
}