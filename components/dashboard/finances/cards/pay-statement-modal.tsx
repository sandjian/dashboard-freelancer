'use client';

import { useState, useTransition, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { payCardStatement } from '@/lib/actions';
import { BankAccount } from '@/lib/definitions';
import { formatCurrency } from '@/lib/utils';
import { CreditCard, Loader2, CheckCircle2, Split } from 'lucide-react';

interface PayStatementModalProps {
    statementId: string;
    cardName: string;
    totalAmount: number; // en pesos/unidades reales (no centavos)
    paidAmount?: number; // acumulado pagado hasta el momento
    accounts: BankAccount[];
}

export function PayStatementModal({
    statementId,
    cardName,
    totalAmount,
    paidAmount = 0,
    accounts,
}: PayStatementModalProps) {
    const [open, setOpen] = useState(false);
    const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id || '');
    const [isPending, startTransition] = useTransition();

    const currentPaid = Number(paidAmount || 0);
    const remainingToPay = Math.max(0, totalAmount - currentPaid);

    // Estado del monto que el usuario desea pagar
    const [amountToPay, setAmountToPay] = useState<number>(remainingToPay);
    const [mode, setMode] = useState<'full' | 'partial'>('full');

    // Sincronizar monto al abrir o cambiar props
    useEffect(() => {
        if (open) {
            setAmountToPay(remainingToPay);
            setMode('full');
        }
    }, [open, remainingToPay]);

    const handleSelectFull = () => {
        setMode('full');
        setAmountToPay(remainingToPay);
    };

    const handleSelectPartial = () => {
        setMode('partial');
    };

    const handlePay = () => {
        if (!selectedAccountId || amountToPay <= 0 || amountToPay > remainingToPay + 0.01) return;

        startTransition(async () => {
            await payCardStatement(statementId, selectedAccountId, amountToPay);
            setOpen(false);
        });
    };

    const selectedAccount = accounts.find((acc) => acc.id === selectedAccountId);
    const hasInsufficientFunds = selectedAccount ? selectedAccount.balance < amountToPay : false;
    const isExceedingRemaining = amountToPay > remainingToPay + 0.01;
    const newRemainingAfterPayment = Math.max(0, remainingToPay - (amountToPay || 0));

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-8 gap-1.5 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-card dark:bg-accent/80 hover:bg-emerald-500/10 hover:border-emerald-500/60 text-xs font-mono font-medium shadow-xs"
                >
                    <CreditCard className="w-3.5 h-3.5" />
                    {currentPaid > 0 ? "Completar / Pagar" : "Pagar Resumen"}
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        Pagar Resumen de Tarjeta
                    </DialogTitle>
                    <DialogDescription>
                        Cancela total o parcialmente el resumen debitando los fondos de tu cuenta.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Desglose claro y elegante del resumen */}
                    <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 dark:bg-zinc-900/50 space-y-2.5 backdrop-blur-xs">
                        <div className="flex justify-between items-center text-xs text-muted-foreground pb-2 border-b border-border/50">
                            <span className="font-mono text-[11px] uppercase tracking-wider">Tarjeta</span>
                            <span className="font-semibold text-foreground">{cardName}</span>
                        </div>
                        <div className="space-y-1.5 font-mono text-xs">
                            <div className="flex justify-between items-center text-muted-foreground">
                                <span>Total emitido:</span>
                                <span className="text-foreground font-medium">{formatCurrency(totalAmount)}</span>
                            </div>
                            {currentPaid > 0 && (
                                <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                                    <span>Ya abonado previamente:</span>
                                    <span className="font-semibold">{formatCurrency(currentPaid)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-1.5 border-t border-border/60 text-sm font-semibold">
                                <span className="text-foreground">Saldo a cancelar:</span>
                                <span className="text-amber-500 dark:text-amber-400 text-base font-bold">
                                    {formatCurrency(remainingToPay)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Atajos Rápidos: Total vs Monto libre */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-medium text-muted-foreground">
                                Monto a abonar
                            </Label>
                            <div className="flex items-center gap-1.5 bg-muted/40 p-0.5 rounded-lg border border-border/60">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant={mode === 'full' ? 'default' : 'ghost'}
                                    className={`h-6 text-[11px] px-2.5 font-mono rounded-md transition-all ${
                                        mode === 'full' 
                                            ? 'bg-foreground text-background shadow-xs font-semibold' 
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                    onClick={handleSelectFull}
                                >
                                    Total ({formatCurrency(remainingToPay)})
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant={mode === 'partial' ? 'default' : 'ghost'}
                                    className={`h-6 text-[11px] px-2.5 font-mono rounded-md transition-all ${
                                        mode === 'partial' 
                                            ? 'bg-foreground text-background shadow-xs font-semibold' 
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                    onClick={handleSelectPartial}
                                >
                                    Monto libre
                                </Button>
                            </div>
                        </div>

                        {/* Input numérico de monto a abonar */}
                        <div className="relative">
                            <Input
                                type="number"
                                step="0.01"
                                min="0.01"
                                max={remainingToPay}
                                value={isNaN(amountToPay) ? '' : amountToPay}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    setAmountToPay(isNaN(val) ? 0 : val);
                                    if (mode !== 'partial') setMode('partial');
                                }}
                                className="h-11 text-lg font-bold font-mono pr-14 bg-background/50 border-border focus-visible:ring-1 focus-visible:ring-emerald-500"
                                placeholder="0.00"
                            />
                            <div className="absolute right-3.5 top-3 text-xs font-mono text-muted-foreground font-bold pointer-events-none">
                                ARS
                            </div>
                        </div>

                        {/* Indicador de saldo que quedará impago tras el pago */}
                        {amountToPay > 0 && amountToPay < remainingToPay && !isExceedingRemaining && (
                            <div className="flex justify-between items-center text-[11px] font-mono px-1 text-muted-foreground">
                                <span>Remanente adeudado:</span>
                                <span className="font-semibold text-amber-500 dark:text-amber-400">
                                    {formatCurrency(newRemainingAfterPayment)}
                                </span>
                            </div>
                        )}

                        {isExceedingRemaining && (
                            <p className="text-[11px] text-rose-500 dark:text-rose-400 font-mono px-1">
                                El monto no puede ser mayor al saldo a cancelar ({formatCurrency(remainingToPay)}).
                            </p>
                        )}
                    </div>

                    {/* Cuenta Bancaria de Origen */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">
                            Cuenta bancaria de débito
                        </Label>
                        <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                            <SelectTrigger className="w-full h-10 text-xs font-mono">
                                <SelectValue placeholder="Selecciona una cuenta" />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts
                                    .filter((acc) => acc.currency === 'ARS')
                                    .map((acc) => (
                                        <SelectItem key={acc.id} value={acc.id} className="font-mono text-xs">
                                            <div className="flex items-center justify-between w-full gap-4">
                                                <span className="font-sans font-medium">{acc.name}</span>
                                                <span className="text-muted-foreground">
                                                    Disp: {formatCurrency(acc.balance)}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {hasInsufficientFunds && (
                        <p className="text-[11px] text-amber-500 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg font-mono">
                            Aviso: El saldo disponible ({formatCurrency(selectedAccount?.balance || 0)}) es inferior al monto a debitar ({formatCurrency(amountToPay)}). La cuenta quedará en descubierto.
                        </p>
                    )}

                    <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setOpen(false)}
                            disabled={isPending}
                            className="font-mono text-xs"
                        >
                            Cancelar
                        </Button>
                        <Button
                            size="sm"
                            onClick={handlePay}
                            disabled={isPending || !selectedAccountId || amountToPay <= 0 || isExceedingRemaining}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs shadow-xs"
                        >
                            {isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                            Confirmar y Debitar {amountToPay > 0 && !isExceedingRemaining ? formatCurrency(amountToPay) : ''}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}