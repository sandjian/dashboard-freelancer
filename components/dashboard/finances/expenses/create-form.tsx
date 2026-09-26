'use client';

import { useActionState, useState } from 'react';
import { AnimatedSubmitButton } from '@/components/ui/animated-submit-button';
import { createExpense } from '@/lib/actions';
import type { ExpenseState, Vendor, Category, Card as CreditCard } from '@/lib/definitions';
import { FREQUENCIES } from '@/lib/definitions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFormScrollOnError } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { Banknote, CalendarClock, CreditCard as CardIcon, Wallet } from 'lucide-react';
import { PaymentMethodSelector } from '@/components/ui/payment-method-selector';
import { useTranslations } from 'next-intl';

export function CreateExpenseForm({
  vendors,
  categories,
  cards,
  initialValues,
  onSuccess,
}: {
  vendors: Vendor[];
  categories: Category[];
  cards?: CreditCard[];
  initialValues?: {
    concept?: string;
    category_id?: string;
    amount?: string;
  };
  onSuccess?: () => void;
}) {
  const t = useTranslations('Expenses');
  const initialState: ExpenseState = { message: null, errors: {} };
  const [state, formAction] = useActionState<ExpenseState, FormData>(createExpense, initialState);
  const [mode, setMode] = useState<'single' | 'recurring'>('single');
  const [entityType, setEntityType] = useState<'personal' | 'business'>('personal');
  const [paymentMethod, setPaymentMethod] = useState<string>('debit_card');

  useFormScrollOnError(state.errors);

  const getFrequencyLabel = (freq: string) => {
    switch (freq) {
      case 'daily': return t('frequencyDaily');
      case 'weekly': return t('frequencyWeekly');
      case 'monthly': return t('frequencyMonthly');
      case 'yearly': return t('frequencyYearly');
      default: return freq;
    }
  };

  return (
    <form action={formAction} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto max-h-[65vh] pr-2 custom-scrollbar p-1 space-y-5">

        {/* Hidden inputs para sincronizar con Server Actions */}
        <input type="hidden" name="is_recurring" value={mode === 'recurring' ? 'true' : 'false'} />
        <input type="hidden" name="entity_type" value={entityType} />
        <input type="hidden" name="payment_method" value={paymentMethod} />

        {/* 1. TABS: MODO DE GASTO */}
        <Tabs
          defaultValue="single"
          value={mode}
          onValueChange={(v: string) => setMode(v as 'single' | 'recurring')}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 bg-muted p-1 border border-border rounded-xl">
            <TabsTrigger
              value="single"
              className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
            >
              {t('singleExpenseTab')}
            </TabsTrigger>
            <TabsTrigger
              value="recurring"
              className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
            >
              {t('recurringExpenseTab')}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* 2. TOGGLE: PERSONAL vs NEGOCIO */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
            {t('expenseDestination')}
          </Label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted/40 border border-border rounded-xl">
            <button
              type="button"
              onClick={() => setEntityType('personal')}
              className={cn(
                "flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all",
                entityType === 'personal'
                  ? "bg-background text-foreground shadow-sm border border-border font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>🏠</span>
              <span>{t('destinationPersonal')}</span>
            </button>
            <button
              type="button"
              onClick={() => setEntityType('business')}
              className={cn(
                "flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all",
                entityType === 'business'
                  ? "bg-background text-foreground shadow-sm border border-border font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>🏢</span>
              <span>{t('destinationBusiness')}</span>
            </button>
          </div>
        </div>

        {/* 3. MONTO */}
        <div className="relative group">
          <Label htmlFor="amount" className="sr-only">{t('amountLabel')}</Label>
          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-light text-muted-foreground group-focus-within:text-foreground transition-colors pointer-events-none">$</span>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            defaultValue={initialValues?.amount}
            className={cn(
              "pl-14 h-20 text-4xl font-bold bg-muted/20 border-border rounded-2xl shadow-inner text-center",
              "focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-foreground placeholder:text-muted-foreground/50",
              "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            )}
            autoFocus
          />
          {state.errors?.amount && <p className="text-sm text-center text-destructive mt-2">{state.errors.amount[0]}</p>}
        </div>

        {/* 4. CONCEPTO */}
        <div className="space-y-1.5">
          <Label htmlFor="concept" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">{t('conceptLabel')}</Label>
          <Input
            id="concept"
            name="concept"
            placeholder={entityType === 'business' ? t('conceptPlaceholderBusiness') : t('conceptPlaceholderPersonal')}
            defaultValue={initialValues?.concept}
            className="bg-background border-input text-foreground focus:border-primary h-11 rounded-xl px-4"
          />
          {state.errors?.concept && <p className="text-sm text-destructive ml-1">{state.errors.concept[0]}</p>}
        </div>

        {/* 5. FECHA | CATEGORÍA | PROVEEDOR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="expense_date" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
              {t('dateLabel')}
            </Label>
            <DatePicker
              name="expense_date"
              defaultValue={new Date()}
              className="bg-background border-input text-foreground rounded-xl hover:bg-muted/50 w-full"
            />
          </div>

          <div className="space-y-1.5 w-full">
            <Label htmlFor="category_id" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">{t('categoryLabel')}</Label>
            <Select name="category_id" defaultValue={initialValues?.category_id}>
              <SelectTrigger className="bg-background border-input text-foreground rounded-xl w-full py-5 hover:bg-muted/50">
                <SelectValue placeholder={t('categorySelectPlaceholder')} />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-foreground">
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()} className="focus:bg-muted">{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 w-full">
            <Label htmlFor="vendor_id" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">{t('vendorLabel')}</Label>
            <Select name="vendor_id">
              <SelectTrigger className="bg-background border-input text-foreground h-11 rounded-xl w-full py-5 hover:bg-muted/50">
                <SelectValue placeholder={t('vendorOptionalPlaceholder')} />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-foreground">
                {vendors.map((v) => (
                  <SelectItem key={v.id} value={v.id.toString()} className="focus:bg-muted">{v.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 6. MÉTODO DE PAGO DIRECTO + ESTADO */}
        <div className="pt-4 border-t border-border">
          <div className="bg-muted/10 rounded-xl p-4 border border-border space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">

              {/* Selector de métodos reales de caja */}
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                  {t('paymentMethodLabel')}
                </Label>
                <PaymentMethodSelector
                  value={paymentMethod}
                  onChange={setPaymentMethod}
                  className="grid-cols-3 gap-2"
                  methods={[
                    { id: 'debit_card', label: t('methodDebit'), description: t('methodImmediate'), icon: <CardIcon className="w-4 h-4" /> },
                    { id: 'transfer', label: t('methodTransferFull'), description: t('methodAppBank'), icon: <Wallet className="w-4 h-4" /> },
                    { id: 'cash', label: t('methodCash'), description: t('methodInHand'), icon: <Banknote className="w-4 h-4" /> },
                  ]}
                />
              </div>

              {/* Selector de Estado */}
              {mode === 'single' ? (
                <div className="space-y-1.5">
                  <Label htmlFor="status" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">{t('tableStatus')}</Label>
                  <Select name="status" defaultValue="paid">
                    <SelectTrigger className="bg-background border-input text-foreground h-11 rounded-xl w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border text-foreground">
                      <SelectItem value="paid" className="text-emerald-500 font-medium focus:bg-muted">{t('statusPaid')}</SelectItem>
                      <SelectItem value="pending" className="text-amber-500 font-medium focus:bg-muted">{t('statusPending')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">{t('frequencyLabel')}</Label>
                  <Select name="frequency" defaultValue="monthly">
                    <SelectTrigger className="bg-background border-input text-foreground h-11 rounded-xl w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border text-foreground">
                      {FREQUENCIES.map((freq) => (
                        <SelectItem key={freq} className="focus:bg-muted" value={freq}>{getFrequencyLabel(freq)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

            </div>
          </div>
        </div>

        {state.message && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm text-center">
            {state.message}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-4 mt-auto border-t border-border flex justify-end gap-3">
        <AnimatedSubmitButton
          type="submit"
          className="w-full md:w-auto"
        >
          {mode === 'recurring' ? t('createFixedTemplate') : t('createExpense')}
        </AnimatedSubmitButton>
      </div>
    </form>
  );
}