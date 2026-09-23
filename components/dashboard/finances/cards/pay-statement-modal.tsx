'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
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
import { CreditCard, Loader2, CheckCircle2 } from 'lucide-react';

interface PayStatementModalProps {
    statementId: string;
    cardName: string;
    totalAmount: number; // en pesos/unidades reales (no centavos)
    accounts: BankAccount[];
}

export function PayStatementModal({
    statementId,
    cardName,
    totalAmount,
    accounts,
}: PayStatementModalProps) {
    const [open, setOpen] = useState(false);
    const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id || '');
    const [isPending, startTransition] = useTransition();

    const handlePay = () => {
        if (!selectedAccountId) return;

        startTransition(async () => {
            await payCardStatement(statementId, selectedAccountId);
            setOpen(false);
        });
    };

    const selectedAccount = accounts.find((acc) => acc.id === selectedAccountId);
    const hasInsufficientFunds = selectedAccount ? selectedAccount.balance < totalAmount : false;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-8 gap-1.5 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-card dark:bg-accent/80 hover:bg-emerald-500/10 hover:border-emerald-500/60 text-xs font-mono font-medium shadow-xs"
                >
                    <CreditCard className="w-3.5 h-3.5" />
                    Pagar Resumen
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        Liquidar Resumen de Tarjeta
                    </DialogTitle>
                    <DialogDescription>
                        Confirma el débito para cancelar el resumen y descontar los fondos de tu cuenta.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-3">
                    <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Tarjeta:</span>
                            <span className="font-semibold text-foreground">{cardName}</span>
                        </div>
                        <div className="flex justify-between items-baseline pt-1">
                            <span className="text-xs text-muted-foreground">Total a debitar:</span>
                            <span className="text-lg font-bold font-mono text-foreground">
                                {formatCurrency(totalAmount)}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                            ¿De qué cuenta sale el dinero?
                        </label>
                        <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecciona una cuenta" />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts
                                    .filter((acc) => acc.currency === 'ARS')
                                    .map((acc) => (
                                        <SelectItem key={acc.id} value={acc.id}>
                                            <div className="flex items-center justify-between w-full gap-4 text-xs">
                                                <span>{acc.name}</span>
                                                <span className="font-mono text-muted-foreground">
                                                    Disp: {formatCurrency(acc.balance)}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {hasInsufficientFunds && (
                        <p className="text-[11px] text-amber-500 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 p-2 rounded">
                            Aviso: El saldo de la cuenta seleccionada ({formatCurrency(selectedAccount?.balance || 0)}) es inferior al monto del resumen. El saldo quedará en negativo.
                        </p>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setOpen(false)}
                            disabled={isPending}
                        >
                            Cancelar
                        </Button>
                        <Button
                            size="sm"
                            onClick={handlePay}
                            disabled={isPending || !selectedAccountId}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            {isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                            Confirmar y Debitar
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}