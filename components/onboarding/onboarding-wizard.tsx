'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Banknote,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  DollarSign,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { completeOnboarding, type OnboardingInput } from '@/lib/actions/onboarding';
import { formatCurrency } from '@/lib/utils';

type DraftAccount = {
  id: string;
  name: string;
  account_type: 'bank' | 'wallet' | 'usd_account';
  currency: 'ARS' | 'USD';
  balance: string;
  color: string;
};

const STEP_VARIANTS = {
  enter: (direction: number) => ({
    x: direction > 0 ? 48 : -48,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 48 : -48,
    opacity: 0,
  }),
};

export function OnboardingWizard({ userName }: { userName?: string | null }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPending, startTransition] = useTransition();

  const [defaultCurrency, setDefaultCurrency] = useState<'ARS' | 'USD'>('ARS');
  const [monthlyIncomeGoal, setMonthlyIncomeGoal] = useState('');
  const [cashARS, setCashARS] = useState('');
  const [cashUSD, setCashUSD] = useState('');
  const [accounts, setAccounts] = useState<DraftAccount[]>([
    {
      id: 'acc-1',
      name: 'Banco Principal',
      account_type: 'bank',
      currency: 'ARS',
      balance: '',
      color: '#10b981',
    },
  ]);

  const goNext = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, 3));
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  };

  const addAccount = () => {
    setAccounts((prev) => [
      ...prev,
      {
        id: `acc-${Date.now()}`,
        name: '',
        account_type: 'wallet',
        currency: 'ARS',
        balance: '',
        color: '#3b82f6',
      },
    ]);
  };

  const removeAccount = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  const updateAccount = (id: string, patch: Partial<DraftAccount>) => {
    setAccounts((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const updated = { ...a, ...patch };
        if (patch.account_type === 'usd_account') updated.currency = 'USD';
        return updated;
      })
    );
  };

  const totalInitialARS =
    (Number(cashARS) || 0) +
    accounts
      .filter((a) => a.currency === 'ARS')
      .reduce((acc, a) => acc + (Number(a.balance) || 0), 0);

  const totalInitialUSD =
    (Number(cashUSD) || 0) +
    accounts
      .filter((a) => a.currency === 'USD')
      .reduce((acc, a) => acc + (Number(a.balance) || 0), 0);

  const handleFinish = () => {
    const payload: OnboardingInput = {
      defaultCurrency,
      monthlyIncomeGoal: Number(monthlyIncomeGoal) || 0,
      cashARS: Number(cashARS) || 0,
      cashUSD: Number(cashUSD) || 0,
      accounts: accounts
        .filter((a) => a.name.trim().length > 0)
        .map((a) => ({
          name: a.name.trim(),
          account_type: a.account_type,
          currency: a.currency,
          balance: Number(a.balance) || 0,
          color: a.color,
        })),
    };

    startTransition(async () => {
      const res = await completeOnboarding(payload);
      if (!res.success) {
        toast.error(res.message || 'Error al guardar la configuración inicial.');
        return;
      }
      toast.success('¡Bienvenido! Tu liquidez inicial ha sido configurada.');
      router.replace('/dashboard');
      router.refresh();
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground">
      <Card className="w-full max-w-2xl border-border bg-card shadow-xl overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/20 pb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-secondary/40 text-secondary-foreground border border-border">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Paso {step + 1} de 4</span>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`h-1.5 w-8 rounded-full transition-colors ${
                    idx <= step ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            {step === 0 && `¡Hola${userName ? `, ${userName}` : ''}! Configuremos tu base financiera`}
            {step === 1 && 'Efectivo en Mano'}
            {step === 2 && 'Cuentas Bancarias y Billeteras'}
            {step === 3 && 'Resumen de Liquidez Inicial'}
          </CardTitle>
          <CardDescription>
            {step === 0 && 'Define tu moneda principal de operación y tu objetivo mensual de facturación.'}
            {step === 1 && 'Declara el dinero físico con el que cuentas hoy para calcular tu liquidez real.'}
            {step === 2 && 'Agrega tus bancos o billeteras virtuales (Mercado Pago, Brubank, Payoneer, etc.) y sus saldos actuales.'}
            {step === 3 && 'Verifica que los saldos iniciales coincidan con tu estado actual antes de abrir el dashboard.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 min-h-[340px] flex flex-col justify-between">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={STEP_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.24, ease: 'easeOut' }}
              className="space-y-6"
            >
              {step === 0 && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label>Moneda Principal de Operación</Label>
                    <Select
                      value={defaultCurrency}
                      onValueChange={(v: 'ARS' | 'USD') => setDefaultCurrency(v)}
                    >
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ARS">Peso Argentino (ARS $)</SelectItem>
                        <SelectItem value="USD">Dólar Estadounidense (USD US$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goal">Meta de Facturación Mensual (Opcional)</Label>
                    <Input
                      id="goal"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={monthlyIncomeGoal}
                      onChange={(e) => setMonthlyIncomeGoal(e.target.value)}
                      className="h-12 font-mono text-lg rounded-xl"
                    />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Banknote className="w-4 h-4 text-emerald-500" />
                      <span>Efectivo en Pesos (ARS)</span>
                    </div>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={cashARS}
                      onChange={(e) => setCashARS(e.target.value)}
                      className="h-11 font-mono text-base bg-background rounded-xl"
                    />
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <DollarSign className="w-4 h-4 text-blue-500" />
                      <span>Efectivo en Dólares (USD)</span>
                    </div>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={cashUSD}
                      onChange={(e) => setCashUSD(e.target.value)}
                      className="h-11 font-mono text-base bg-background rounded-xl"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {accounts.map((acc) => (
                    <div
                      key={acc.id}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 p-3 rounded-xl border border-border bg-muted/20 items-end"
                    >
                      <div className="sm:col-span-4 space-y-1">
                        <Label className="text-xs">Entidad / Nombre</Label>
                        <Input
                          placeholder="Ej. Galicia / Mercado Pago"
                          value={acc.name}
                          onChange={(e) => updateAccount(acc.id, { name: e.target.value })}
                          className="h-10 bg-background rounded-lg text-xs"
                        />
                      </div>

                      <div className="sm:col-span-3 space-y-1">
                        <Label className="text-xs">Tipo</Label>
                        <Select
                          value={acc.account_type}
                          onValueChange={(v: 'bank' | 'wallet' | 'usd_account') =>
                            updateAccount(acc.id, { account_type: v })
                          }
                        >
                          <SelectTrigger className="h-10 bg-background rounded-lg text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bank">Banco</SelectItem>
                            <SelectItem value="wallet">Billetera Virtual</SelectItem>
                            <SelectItem value="usd_account">Cuenta USD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <Label className="text-xs">Moneda</Label>
                        <Select
                          value={acc.currency}
                          disabled={acc.account_type === 'usd_account'}
                          onValueChange={(v: 'ARS' | 'USD') => updateAccount(acc.id, { currency: v })}
                        >
                          <SelectTrigger className="h-10 bg-background rounded-lg text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ARS">ARS</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <Label className="text-xs">Saldo Inicial</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={acc.balance}
                          onChange={(e) => updateAccount(acc.id, { balance: e.target.value })}
                          className="h-10 bg-background rounded-lg font-mono text-xs"
                        />
                      </div>

                      <div className="sm:col-span-1 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAccount(acc.id)}
                          disabled={accounts.length === 1}
                          className="h-10 w-10 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addAccount}
                    className="w-full rounded-xl border-dashed gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar otra cuenta o billetera</span>
                  </Button>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-border bg-muted/30">
                      <span className="text-xs uppercase font-mono text-muted-foreground">
                        Liquidez Total Inicial (ARS)
                      </span>
                      <p className="text-2xl font-bold font-mono mt-1">
                        {formatCurrency(totalInitialARS)}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-muted/30">
                      <span className="text-xs uppercase font-mono text-muted-foreground">
                        Reserva Total Inicial (USD)
                      </span>
                      <p className="text-2xl font-bold font-mono mt-1">
                        US$ {totalInitialUSD.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Al confirmar, crearemos tus cajas y cuentas iniciales para que el cálculo de{' '}
                      <strong className="text-foreground">Dinero Disponible (Safe-to-Spend)</strong> y{' '}
                      <strong className="text-foreground">Runway</strong> sea exacto desde el primer día.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between pt-6 mt-6 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              onClick={goBack}
              disabled={step === 0 || isPending}
              className="gap-2 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Anterior</span>
            </Button>

            {step < 3 ? (
              <Button type="button" onClick={goNext} className="gap-2 rounded-xl">
                <span>Siguiente</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleFinish}
                disabled={isPending}
                className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{isPending ? 'Guardando configuración...' : 'Finalizar y abrir Dashboard'}</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

