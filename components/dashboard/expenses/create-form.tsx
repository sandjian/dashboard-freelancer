'use client';

import { useActionState } from 'react';
import { createExpense } from '@/lib/actions';
import type { ExpensesState } from '@/lib/definitions';

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

export function CreateExpensesForm() {
  const initialState: ExpensesState = { message: null, errors: {} };
  const [state, formAction] = useActionState(createExpense, initialState);

  return (
    <form action={formAction} className="space-y-4">
      
      <div className="space-y-2">
        <Label htmlFor="concept">Concepto</Label>
        <Input
          id="concept"
          name="concept"
          placeholder="Ej: Alquiler"
          aria-describedby="concept-error"
        />
        <div id="concept-error" aria-live="polite" aria-atomic="true">
          {state.errors?.concept && (
            <p className="text-sm text-red-500">{state.errors.concept[0]}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="client">Category</Label>
        <Select name="category">
          <SelectTrigger aria-describedby="category-error">
            <SelectValue placeholder="Selecciona una categoria" />
          </SelectTrigger>
          <SelectContent>
            {Category.map((category) => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div id="category-error" aria-live="polite" aria-atomic="true">
          {state.errors?.category && (
            <p className="text-sm text-red-500">{state.errors.category[0]}</p>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
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
        <Label htmlFor="dueDate">Fecha</Label>
        <Input
            id="expenseDate"
            name="expenseDate"
            type="date"
            aria-describedby="expenseDate-error"
        />
        <div id="expenseDate-error" aria-live="polite" aria-atomic="true">
            {state.errors?.expenseDate && (
                <p className="text-sm text-red-500">{state.errors.expenseDate[0]}</p>
            )}
        </div>
      </div>
      
      {state.message && (
        <p className="text-sm text-red-500">{state.message}</p>
      )}

      <div className="flex justify-end pt-4">
        <Button type="submit">Crear Gasto</Button>
      </div>
    </form>
  );
}