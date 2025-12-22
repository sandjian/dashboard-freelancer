'use client';

import { useActionState, useState } from 'react';
import { updateExpense } from '@/lib/actions';
import type { ExpenseState, Vendor, Category, Expense, Card } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CategoryCombobox } from '../finances/expenses/category-combobox';
import { VendorCombobox } from '../finances/expenses/vendor-combobox'; 
import { Checkbox } from '@/components/ui/checkbox'; // 1. Importamos Checkbox

const formatDateForInput = (date: Date): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0'); // Añade un 0 si es necesario
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};



export function EditExpenseForm({ expense, vendors, categories, cards }: { expense: Expense, vendors: Vendor[], categories: Category[],cards: Card[] }) {
  const initialState: ExpenseState = { message: null, errors: {} };
  const updateExpenseWithId = updateExpense.bind(null, expense.id);
  const [state, formAction] = useActionState(updateExpenseWithId, initialState);
  
  const [selectedCategoryId, setSelectedCategoryId] = useState(expense.category_id);
  const [selectedVendorId, setSelectedVendorId] = useState(expense.vendor_id);
  // 1. Añadimos un nuevo estado para controlar la lógica de recurrencia en la UI
  const [isRecurring, setIsRecurring] = useState(expense.is_recurring);
const [paymentMethod, setPaymentMethod] = useState(expense.payment_method);
 
const paymentMethods = [
    { id: 'Efectivo', name: 'Efectivo' },
    { id: 'Débito', name: 'Débito' },
    ...cards.map(c => ({ id: c.id, name: c.name }))
  ];

return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="category_id" value={selectedCategoryId ?? ''} />
      <input type="hidden" name="vendor_id" value={selectedVendorId ?? ''} />

      {/* --- Campos Principales (sin cambios) --- */}
      <div className="space-y-2">
        <Label htmlFor="concept">Concepto</Label>
        <Input id="concept" name="concept" defaultValue={expense.concept} />
        {state.errors?.concept && <p className="text-sm text-red-500">{state.errors.concept[0]}</p>}
      </div>

      <div className="flex gap-4">
        <div className="flex-1 space-y-2">
          <Label>Proveedor (Opcional)</Label>
          <VendorCombobox 
            initialVendors={vendors} 
            onSelect={setSelectedVendorId} 
            defaultValue={expense.vendor_id} 
          />
        </div>
        <div className="flex-1 space-y-2">
          <Label>Categoría</Label>
          <CategoryCombobox 
            initialCategories={categories} 
            onSelect={setSelectedCategoryId} 
            defaultValue={expense.category_id} 
          />
          {state.errors?.category_id && <p className="text-sm text-red-500">{state.errors.category_id[0]}</p>}
        </div>
      </div>
      <div className="flex-1 space-y-2">
        <Label htmlFor="payment_method">Método de Pago</Label>
        <Select
          name="payment_method"
          value={paymentMethod}
          onValueChange={setPaymentMethod}
          required
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {paymentMethods.map(method => (
              <SelectItem key={method.id} value={method.name}>
                {method.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
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

      <div className="flex gap-4">
        <div className="flex-1 space-y-2">
          <Label htmlFor="expenseDate">Fecha del Gasto</Label>
          <Input id="expenseDate" name="expenseDate" type="date" defaultValue={formatDateForInput(expense.expenseDate)} />
          {state.errors?.expenseDate && <p className="text-sm text-red-500">{state.errors.expenseDate[0]}</p>}
        </div>
        <div className="flex-1 space-y-2">
          <Label htmlFor="status">Estado</Label>
          <Select name="status" defaultValue={expense.status}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {/* 2. CORRECCIÓN: El valor debe ser 'pagado' */}
              <SelectItem value="pagado">Pagado</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 3. AÑADIDO: Sección para Gastos Recurrentes */}
      <div className="flex items-center space-x-4 rounded-md border p-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_recurring"
            name="is_recurring"
            checked={isRecurring}
            onCheckedChange={(checked) => setIsRecurring(Boolean(checked))}
          />
          <Label htmlFor="is_recurring" className="font-medium">
            ¿Es un gasto recurrente?
          </Label>
        </div>
        {isRecurring && (
          <div className="flex-1">
            <Select name="recurrence_interval" defaultValue={expense.recurrence_interval ?? 'monthly'}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona intervalo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Mensual</SelectItem>
                <SelectItem value="yearly">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      <div className="flex justify-end pt-4">
        <Button type="submit">Actualizar Gasto</Button>
      </div>
    </form>
  );
}