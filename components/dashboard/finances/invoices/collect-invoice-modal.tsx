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
import { collectInvoice } from '@/lib/actions';
import { BankAccount } from '@/lib/definitions';
import { formatCurrency } from '@/lib/utils';
import { CheckCircle2, Loader2, Landmark, ArrowDownLeft } from 'lucide-react';

interface CollectInvoiceModalProps {
    invoiceId: string;
    clientName: string;
    amount: number; // Monto en formato regular (ej: 150000.50)
    currency?: 'ARS' | 'USD';
    accounts: BankAccount[];
}

export function CollectInvoiceModal({
    invoiceId,
    clientName,
    amount,
    currency = 'ARS',
    accounts = [],
}: CollectInvoiceModalProps) {
    const [open, setOpen] = useState(false);

    // Filtra las cuentas que coincidan con la moneda de la factura
    const compatibleAccounts = accounts.filter((acc) => acc.currency === currency);
    const [selectedAccountId, setSelectedAccountId] = useState<string>(
        compatibleAccounts[0]?.id || ''
    );

    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const selectedAccount = compatibleAccounts.find((acc) => acc.id === selectedAccountId);
    const newProjectedBalance = selectedAccount ? selectedAccount.balance + amount : null;

    const handleConfirm = () => {
        if (!selectedAccountId) return;
        setError(null);

        startTransition(async () => {
            try {
                await collectInvoice(invoiceId, selectedAccountId);
                setOpen(false);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Ocurrió un error al procesar el cobro.');
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    size="sm"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-8 text-xs gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    Registrar Cobro
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md bg-card border-border">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        Acreditar Cobro de Factura
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Selecciona la cuenta bancaria o billetera donde ingresaron los fondos del cliente.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {error && (
                        <p className="text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">
                            {error}
                        </p>
                    )}

                    {/* Resumen del cobro */}
                    <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Cliente:</span>
                            <span className="font-semibold text-foreground truncate max-w-[200px]">
                                {clientName}
                            </span>
                        </div>
                        <div className="flex justify-between items-baseline pt-1">
                            <span className="text-xs text-muted-foreground">Total a ingresar:</span>
                            <span className="text-xl font-bold font-mono text-emerald-500">
                                {currency === 'USD'
                                    ? `US$ ${amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
                                    : formatCurrency(amount)}
                            </span>
                        </div>
                    </div>

                    {/* Selector de cuenta de acreditación */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                            ¿En qué cuenta se depositó el dinero?
                        </label>
                        <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecciona la cuenta destino" />
                            </SelectTrigger>
                            <SelectContent>
                                {compatibleAccounts.map((acc) => (
                                    <SelectItem key={acc.id} value={acc.id}>
                                        <div className="flex items-center justify-between w-full gap-4 text-xs">
                                            <span>{acc.name}</span>
                                            <span className="font-mono text-muted-foreground">
                                                Saldo: {acc.currency === 'USD' ? `US$ ${acc.balance.toLocaleString('es-AR')}` : formatCurrency(acc.balance)}
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Previsualización del nuevo saldo */}
                    {selectedAccount && newProjectedBalance !== null && (
                        <div className="text-xs text-muted-foreground p-2.5 bg-background rounded-md border border-border/60 flex items-center justify-between">
                            <span>Nuevo saldo resultante en {selectedAccount.name}:</span>
                            <span className="font-mono font-bold text-foreground">
                                {currency === 'USD'
                                    ? `US$ ${newProjectedBalance.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
                                    : formatCurrency(newProjectedBalance)}
                            </span>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setOpen(false)}
                            disabled={isPending}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleConfirm}
                            disabled={isPending || !selectedAccountId}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                        >
                            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            Acreditar Fondos
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}