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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { transferBetweenAccounts } from '@/lib/actions';
import { BankAccount } from '@/lib/definitions';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeftRight, Loader2, Check } from 'lucide-react';

export function TransferModal({ accounts }: { accounts: BankAccount[] }) {
    const [open, setOpen] = useState(false);
    const [fromAccountId, setFromAccountId] = useState<string>('');
    const [toAccountId, setToAccountId] = useState<string>('');
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    // Filtramos para asegurar que ambas cuentas compartan la misma moneda
    const selectedFrom = accounts.find((a) => a.id === fromAccountId);
    const eligibleDestinationAccounts = accounts.filter(
        (a) => a.id !== fromAccountId && (!selectedFrom || a.currency === selectedFrom.currency)
    );

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            setFromAccountId('');
            setToAccountId('');
            setAmount('');
            setNotes('');
            setError(null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!fromAccountId || !toAccountId || !amount || Number(amount) <= 0) {
            setError('Completa todos los campos obligatorios.');
            return;
        }

        startTransition(async () => {
            try {
                const formData = new FormData();
                formData.append('from_account_id', fromAccountId);
                formData.append('to_account_id', toAccountId);
                formData.append('amount', amount);
                if (notes) formData.append('notes', notes);

                await transferBetweenAccounts(formData);
                handleOpenChange(false);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Error al procesar la transferencia.');
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button
                    size="sm"
                    className="h-10 px-4 rounded-xl text-xs font-semibold bg-secondary/40 text-secondary-foreground hover:bg-secondary/30 dark:bg-foreground/90 dark:hover:bg-foreground dark:text-background border border-border shadow-sm transition-colors gap-2"
                >
                    <ArrowLeftRight className="w-4 h-4" />
                    <span>Nueva Transferencia</span>
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md bg-card border-border">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ArrowLeftRight className="w-5 h-5 text-primary" />
                        Transferencia entre Cuentas
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Mueve dinero entre tus cuentas o billeteras sin computar gastos ni alterar tu patrimonio global.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    {error && (
                        <p className="text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">
                            {error}
                        </p>
                    )}

                    {/* Cuenta Origen */}
                    <div className="space-y-1.5">
                        <Label htmlFor="from-account" className="text-xs text-muted-foreground">
                            Cuenta de Origen (Sale dinero)
                        </Label>
                        <Select
                            value={fromAccountId}
                            onValueChange={(val) => {
                                setFromAccountId(val);
                                if (toAccountId === val) setToAccountId('');
                            }}
                        >
                            <SelectTrigger id="from-account" className="w-full">
                                <SelectValue placeholder="Seleccionar origen" />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts.map((acc) => (
                                    <SelectItem key={acc.id} value={acc.id}>
                                        <div className="flex items-center justify-between w-full gap-4 text-xs">
                                            <span>{acc.name}</span>
                                            <span className="font-mono text-muted-foreground">
                                                {acc.currency === 'USD'
                                                    ? `US$ ${acc.balance.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
                                                    : formatCurrency(acc.balance)}
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Cuenta Destino */}
                    <div className="space-y-1.5">
                        <Label htmlFor="to-account" className="text-xs text-muted-foreground">
                            Cuenta de Destino (Entra dinero)
                        </Label>
                        <Select
                            value={toAccountId}
                            onValueChange={setToAccountId}
                            disabled={!fromAccountId}
                        >
                            <SelectTrigger id="to-account" className="w-full">
                                <SelectValue placeholder={fromAccountId ? "Seleccionar destino" : "Primero elige el origen"} />
                            </SelectTrigger>
                            <SelectContent>
                                {eligibleDestinationAccounts.map((acc) => (
                                    <SelectItem key={acc.id} value={acc.id}>
                                        <div className="flex items-center justify-between w-full gap-4 text-xs">
                                            <span>{acc.name}</span>
                                            <span className="font-mono text-muted-foreground">
                                                {acc.currency === 'USD'
                                                    ? `US$ ${acc.balance.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
                                                    : formatCurrency(acc.balance)}
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Monto */}
                    <div className="space-y-1.5">
                        <Label htmlFor="transfer-amount" className="text-xs text-muted-foreground">
                            Monto a Transferir {selectedFrom ? `(${selectedFrom.currency})` : ''}
                        </Label>
                        <Input
                            id="transfer-amount"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            required
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="text-xl font-bold font-mono h-11"
                        />
                    </div>

                    {/* Nota opcional */}
                    <div className="space-y-1.5">
                        <Label htmlFor="transfer-notes" className="text-xs text-muted-foreground">
                            Nota o Motivo (Opcional)
                        </Label>
                        <Input
                            id="transfer-notes"
                            type="text"
                            placeholder="Ej: Fondeo de Mercado Pago, Extracción cajero..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="text-xs"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenChange(false)}
                            disabled={isPending}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={isPending || !fromAccountId || !toAccountId || !amount}
                            className="gap-1.5"
                        >
                            {isPending ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Check className="w-3.5 h-3.5" />
                            )}
                            Confirmar Transferencia
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}