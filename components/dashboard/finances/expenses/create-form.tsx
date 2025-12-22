'use client';

import { useActionState,  useState } from 'react';
import { createExpense } from '@/lib/actions';
import type { ExpenseState, Vendor, Category } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { useFormScrollOnError } from '@/lib/hooks';

export function CreateExpenseForm({
  vendors,
  categories,
}: {
  vendors: Vendor[];
  categories: Category[];
}) {
  // Estado inicial
  const initialState: ExpenseState = { message: null, errors: {} };
const [state, formAction] = useActionState<ExpenseState, FormData>(createExpense, initialState);


  // Hook para hacer scroll automático al error
  useFormScrollOnError(state.errors);

  // Estado local opcional para mostrar u ocultar campos de recurrencia
  const [isRecurring, setIsRecurring] = useState(false);

  return (
    <form action={formAction} className="space-y-6">
      <Card className="mx-auto max-w-3xl w-full">
        <CardContent className="space-y-6 pt-10 px-8">
          <h2 className="text-xl font-semibold">Registrar nuevo gasto</h2>

          {/* Vendor */}
          <div className="space-y-2">
            <Label htmlFor="vendor_id">Proveedor</Label>
            <Select name="vendor_id">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar proveedor" />
              </SelectTrigger>
              <SelectContent>
                {vendors.map((v) => (
                  <SelectItem key={v.id} value={v.id.toString()}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.errors?.vendor_id && (
              <p className="text-sm text-red-500">{state.errors.vendor_id[0]}</p>
            )}
          </div>

          {/* Concepto */}
          <div className="space-y-2">
            <Label htmlFor="concept">Concepto</Label>
            <Input id="concept" name="concept" type="text" />
            {state.errors?.concept && (
              <p className="text-sm text-red-500">{state.errors.concept[0]}</p>
            )}
          </div>

          {/* Monto */}
          <div className="space-y-2">
            <Label htmlFor="amount">Monto</Label>
            <Input id="amount" name="amount" type="number" step="0.01" />
            {state.errors?.amount && (
              <p className="text-sm text-red-500">{state.errors.amount[0]}</p>
            )}
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <Label htmlFor="category_id">Categoría</Label>
            <Select name="category_id">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.errors?.category_id && (
              <p className="text-sm text-red-500">{state.errors.category_id[0]}</p>
            )}
          </div>

          {/* Método de pago */}
          <div className="space-y-2">
            <Label htmlFor="payment_method">Método de pago</Label>
            <Select name="payment_method" defaultValue="efectivo">
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="efectivo">Efectivo</SelectItem>
                <SelectItem value="tarjeta">Tarjeta</SelectItem>
                <SelectItem value="transferencia">Transferencia</SelectItem>
              </SelectContent>
            </Select>
            {state.errors?.payment_method && (
              <p className="text-sm text-red-500">
                {state.errors.payment_method[0]}
              </p>
            )}
          </div>

          {/* Fecha del gasto */}
          <div className="space-y-2">
            <Label htmlFor="expense_date">Fecha del gasto</Label>
            <DatePicker name="expense_date" />
            {state.errors?.expenseDate && (
              <p className="text-sm text-red-500">{state.errors.expenseDate[0]}</p>
            )}
          </div>

          {/* Recurrencia */}
          <div className="space-y-2">
            <Label htmlFor="is_recurring">¿Es un gasto recurrente?</Label>
            <Select
              name="is_recurring"
              onValueChange={(val) => setIsRecurring(val === 'true')}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Sí</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isRecurring && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="recurrence_interval">Intervalo</Label>
                <Select name="recurrence_interval">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar intervalo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensual">Mensual</SelectItem>
                    <SelectItem value="trimestral">Trimestral</SelectItem>
                    <SelectItem value="anual">Anual</SelectItem>
                  </SelectContent>
                </Select>
                {state.errors?.recurrence_interval && (
                  <p className="text-sm text-red-500">
                    {state.errors.recurrence_interval[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="recurrence_end_date">Fin de recurrencia</Label>
                <DatePicker name="recurrence_end_date" />
                {state.errors?.recurrence_end_date && (
                  <p className="text-sm text-red-500">
                    {state.errors.recurrence_end_date[0]}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Botón submit */}
          <div className="flex justify-end">
            <Button type="submit" className="hover:scale-105 transition-all">
              Guardar gasto
            </Button>
          </div>

          {/* Mensaje de resultado */}
          {state.message && (
            <p className="text-sm text-gray-700 mt-4">{state.message}</p>
          )}
        </CardContent>
      </Card>
    </form>
  );
}
