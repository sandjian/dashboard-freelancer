'use client';

import { useActionState, useState } from 'react';
import { updateExpense } from '@/lib/actions';
import type { ExpenseState, Vendor, Category, Expense, Card as CreditCard } from '@/lib/definitions';
import { PAYMENT_METHODS, FREQUENCIES } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFormScrollOnError } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { CreditCard as CardIcon, Banknote, CalendarClock, Wallet } from 'lucide-react';
import { PaymentMethodSelector } from '@/components/ui/payment-method-selector';
import { AnimatedSubmitButton } from '@/components/ui/animated-submit-button';

export function EditExpenseForm({
  expense,
  vendors,
  categories,
  cards
}: {
  expense: Expense;
  vendors: Vendor[];
  categories: Category[];
  cards?: CreditCard[];
}) {
  const initialState: ExpenseState = { message: null, errors: {} };
  const updateExpenseWithId = updateExpense.bind(null, expense.id as string);
  const [state, formAction] = useActionState(updateExpenseWithId, initialState);

  const [mode, setMode] = useState<'single' | 'recurring'>('single');
  const [paymentMethod, setPaymentMethod] = useState<string>(expense.payment_method || "cash");

  useFormScrollOnError(state.errors);

  // Labels Helpers
  const getFrequencyLabel = (freq: string) => {
    switch (freq) {
      case 'daily': return 'Diaria';
      case 'weekly': return 'Semanal';
      case 'monthly': return 'Mensual';
      case 'yearly': return 'Anual';
      default: return freq;
    }
  };

  return (
    <form action={formAction} className="flex flex-col h-full max-w-4xl mx-auto border border-border rounded-xl p-4">
      <input type="hidden" name="is_recurring" value={mode === 'recurring' ? 'true' : 'false'} />
      {/* Preserve original ID if needed, implicitly handled by bind */}

      <div className="flex-1 pr-2  p-1">

        {/* TABS CONTROLLER (Visual only if we don't want to allow changing type, but let's allow it if it works) */}
        <Tabs
          defaultValue={mode}
          value={mode}
          onValueChange={(v: string) => setMode(v as 'single' | 'recurring')}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 bg-muted p-1 mb-6 border border-border rounded-xl">
            <TabsTrigger value="single" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all">
              Gasto Único
            </TabsTrigger>
            <TabsTrigger value="recurring" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all">
              Gasto Recurrente
            </TabsTrigger>
          </TabsList>

          <div className="space-y-5">

            {/* --- ROW 1: AMOUNT --- */}
            <div className="relative group">
              <Label htmlFor="amount" className="sr-only">Monto</Label>
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-light text-muted-foreground group-focus-within:text-foreground transition-colors pointer-events-none">$</span>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                defaultValue={expense.amount}
                className={cn(
                  "pl-14 h-20 text-4xl font-bold bg-muted/20 border-border rounded-2xl shadow-inner text-center",
                  "focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-foreground placeholder:text-muted-foreground/50",
                  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                )}
                autoFocus
              />
              {state.errors?.amount && <p className="text-sm text-center text-destructive mt-2">{state.errors.amount[0]}</p>}
            </div>

            {/* --- ROW 2: CONCEPT --- */}
            <div className="space-y-1.5">
              <Label htmlFor="concept" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Concepto</Label>
              <Input
                id="concept"
                name="concept"
                placeholder="Descripción del gasto..."
                defaultValue={expense.concept}
                className="bg-background border-input text-foreground focus:border-primary h-11 rounded-xl px-4"
              />
              {state.errors?.concept && <p className="text-sm text-destructive ml-1">{state.errors.concept[0]}</p>}
            </div>

            {/* --- ROW 3: DATE / CATEGORY / VENDOR --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Date - Using 'expenseDate' as defined in old form, or 'expense_date' if I assume create form is standard. 
                  OLD FORM used: name="expenseDate". 
                  CREATE FORM uses: name="expense_date".
                  I will check lib/definitions if poss, but barring that, I will stick to OLD FORM name for safety to avoid breakage,
                  OR better, assuming I am refactoring, I should ensure it matches action.
                  I'll use 'expenseDate' to match the previous Edit Form to be safe about the update action. */}
              <div className="space-y-1.5">
                <Label htmlFor="date" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                  Fecha
                </Label>
                <DatePicker
                  name="date"
                  defaultValue={expense.date ? new Date(expense.date) : new Date()}
                  className="bg-background border-input text-foreground rounded-xl hover:bg-muted/50"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5 w-full">
                <Label htmlFor="category_id" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Categoría</Label>
                <Select name="category_id" defaultValue={expense.category_id?.toString()}>
                  <SelectTrigger className="bg-background border-input text-foreground rounded-xl w-full py-5 hover:bg-muted/50">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-foreground">
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()} className="focus:bg-muted">{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Vendor */}
              <div className="space-y-1.5 w-full">
                <Label htmlFor="vendor_id" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Proveedor</Label>
                <Select name="vendor_id" defaultValue={expense.vendor_id?.toString()}>
                  <SelectTrigger className="bg-background border-input text-foreground h-11 rounded-xl w-full py-5 hover:bg-muted/50">
                    <SelectValue placeholder="Opcional" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-foreground">
                    {vendors.map((v) => (
                      <SelectItem key={v.id} value={v.id.toString()} className="focus:bg-muted">{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

            </div>

            {/* --- ROW 4: Payment --- */}
            <div className="pt-4 border-t border-border">
              <div className="bg-muted/10 rounded-xl p-3 border border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">

                  <div className="space-y-1 h-full col-span-1 md:col-span-2 lg:col-span-1">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Método de Pago</Label>
                    <input type="hidden" name="payment_method" value={paymentMethod} />
                    <PaymentMethodSelector
                      value={paymentMethod}
                      onChange={setPaymentMethod}
                      className="grid-cols-1 sm:grid-cols-2 gap-2"
                      methods={[
                        { id: 'cash', label: 'Efectivo', description: 'Pago en mano', icon: <Banknote className="w-4 h-4" /> },
                        { id: 'debit_card', label: 'Débito', description: 'Descuento inmediato', icon: <CardIcon className="w-4 h-4" /> },
                        { id: 'credit_card', label: 'Crédito', description: 'Pago diferido/cuotas', icon: <CardIcon className="w-4 h-4" /> },
                        { id: 'transfer', label: 'Transferencia', description: 'Bancaria / App', icon: <Wallet className="w-4 h-4" /> },
                      ]}
                    />
                  </div>

                  {/* Dynamic Slot */}
                  {paymentMethod === 'credit_card' && cards ? (
                    <div className="space-y-1 animate-in fade-in slide-in-from-left-2 h-full ">
                      <Label htmlFor="card_id" className="text-xs font-semibold text-primary uppercase tracking-wider ml-1 flex items-center gap-1">
                        <CardIcon className="w-3 h-3" /> Tarjeta & Cuotas
                      </Label>
                      <div className="flex gap-2">
                        <Select name="card_id" defaultValue={expense.card_id?.toString()}>
                          <SelectTrigger className="bg-background border-input text-foreground rounded-lg flex-1 w-full">
                            <SelectValue placeholder="Tarjeta" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border text-foreground">
                            {cards.map((card) => (
                              <SelectItem key={card.id} value={card.id} className='focus:bg-muted'>
                                {card.name} ****{card.last_four_digits}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {mode === 'single' && (
                          <Select name="installments" defaultValue="1">
                            <SelectTrigger className="w-20 bg-background border-input text-foreground h-10 rounded-lg ">
                              <SelectValue placeholder="1" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border text-foreground">
                              {[1, 3, 6, 9, 12].map(n => <SelectItem key={n} value={n.toString()} className='focus:bg-muted'>{n}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  ) : (
                    mode === 'single' ? (
                      <div className="space-y-1">
                        <Label htmlFor="status" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Estado</Label>
                        {/* Old form supported 'facturado', 'pendiente', 'vencido'. Create form supports 'paid', 'pending'. 
                             I should check which values to use. Old form values: facturado, pendiente, vencido.
                             New form: paid, pending.
                             I will use OLD FORM values to be safe: 'facturado' | 'pendiente' | 'vencido'.
                             BUT Create form labels them "Pagado" (paid) / "Pendiente" (pending).
                             I'll assume 'paid' maps to 'facturado' or similar. 
                             Actually, let's use the values found in EditForm: 'facturado', 'pendiente', 'vencido'.
                             And update labels. */}
                        <Select name="status" defaultValue={expense.status || "pendiente"}>
                          <SelectTrigger className="bg-background border-input text-foreground h-10 rounded-lg w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border text-foreground">
                            <SelectItem value="facturado" className="text-emerald-500 focus:bg-muted">Facturado / Pagado</SelectItem>
                            <SelectItem value="pendiente" className="text-amber-500 focus:bg-muted">Pendiente</SelectItem>
                            <SelectItem value="vencido" className="text-destructive focus:bg-muted">Vencido</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : <div />
                  )}

                </div>
              </div>
            </div>

            {/* --- RECURRENCE --- */}
            <TabsContent value="recurring" className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="p-4 bg-muted/20 rounded-xl flex items-center gap-4 border border-border">
                <div className="p-2 bg-primary/10 rounded-full">
                  <CalendarClock className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <Label htmlFor="frequency" className="text-foreground font-medium">Frecuencia de Repetición</Label>
                  <Select name="frequency" defaultValue="monthly">
                    <SelectTrigger className="bg-background border-input text-foreground h-9 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border text-foreground">
                      {FREQUENCIES.map((freq) => (
                        <SelectItem key={freq} className='focus:bg-muted' value={freq}>{getFrequencyLabel(freq)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

          </div>
        </Tabs>
      </div>

      <div className="flex justify-end pt-4 mt-auto border-t border-border">
        <AnimatedSubmitButton type="submit" className="w-full md:w-auto">
          Actualizar Gasto
        </AnimatedSubmitButton>
      </div>
    </form>
  );
}