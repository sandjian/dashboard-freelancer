'use client';

import { useActionState, useState } from 'react';
import { updateExpense } from '@/lib/actions';
import type { ExpenseState, Vendor, Category, Expense } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CategoryCombobox } from './category-combobox'; // Reutilizamos el combobox
import { VendorCombobox } from './vendor-combobox'; // Reutilizamos el combobox

export function EditExpenseForm({ 
  expense, 
  vendors, 
  categories 
}: { 
  expense: Expense;
  vendors: Vendor[];
  categories: Category[];
}){
 const initialState: ExpenseState = { message: null, errors: {} };
  const updateExpenseWithId = updateExpense.bind(null, expense.id);
  const [state, formAction] = useActionState(updateExpenseWithId, initialState);
  
  const [selectedCategoryId, setSelectedCategoryId] = useState(expense.category_id);
  const [selectedVendorId, setSelectedVendorId] = useState(expense.vendor_id);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="category_id" value={selectedCategoryId ?? ''} />
      <input type="hidden" name="vendor_id" value={selectedVendorId ?? ''} />

      {/* Concepto */}
      <div className="space-y-2">
        <Label htmlFor="concept">Concepto</Label>
        <Input id="concept" name="concept" defaultValue={expense.concept} />
        {state.errors?.concept && <p className="text-sm text-red-500">{state.errors.concept[0]}</p>}
      </div>

      {/* Proveedor y Categoría */}
      <div className="flex gap-4">
        <div className="flex-1 space-y-2">
          <Label>Proveedor (Opcional)</Label>
          <VendorCombobox initialVendors={vendors} onSelect={setSelectedVendorId} defaultValue={expense.vendor_id} />
        </div>
        <div className="flex-1 space-y-2">
          <Label>Categoría</Label>
          <CategoryCombobox initialCategories={categories} onSelect={setSelectedCategoryId} defaultValue={expense.category_id} />
          {state.errors?.category_id && <p className="text-sm text-red-500">{state.errors.category_id[0]}</p>}
        </div>
      </div>
      
      {/* Monto y Moneda */}
      <div className="flex gap-4">
        <div className="flex-1 space-y-2">
          <Label htmlFor="amount">Monto</Label>
          <Input id="amount" name="amount" type="number" step="0.01" defaultValue={expense.amount} />
          {state.errors?.amount && <p className="text-sm text-red-500">{state.errors.amount[0]}</p>}
        </div>
        <div className="w-[120px] space-y-2">
          <Label htmlFor="currency">Moneda</Label>
          <Select name="currency" defaultValue={expense.currency}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ARS">ARS</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Fecha y Estado */}
      <div className="flex gap-4">
        <div className="flex-1 space-y-2">
          <Label htmlFor="expenseDate">Fecha del Gasto</Label>
          <Input id="expenseDate" name="expenseDate" type="date" defaultValue={new Date(expense.expenseDate).toISOString().split('T')[0]} />
          {state.errors?.expenseDate && <p className="text-sm text-red-500">{state.errors.expenseDate[0]}</p>}
        </div>
        <div className="flex-1 space-y-2">
          <Label htmlFor="status">Estado</Label>
          <Select name="status" defaultValue={expense.status}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="facturado">Facturado</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="vencido">Vencido</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      
      <div className="flex justify-end pt-4">
        <Button type="submit">Actualizar Gasto</Button>
      </div>
    </form>
  );
}