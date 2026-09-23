'use client';

import { useState, useTransition } from 'react';
import {
    ShoppingCart,
    Car,
    Coffee,
    Pill,
    Zap,
    Ticket,
    Loader2,
    Check,
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { createQuickExpense } from '@/lib/actions';
import { BankAccount } from '@/lib/definitions';

const ACTIONS = [
    {
        key: 'super',
        concept: 'Supermercado',
        categoryName: 'Supermercado',
        icon: ShoppingCart,
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
    },
    {
        key: 'uber',
        concept: 'Uber / Cabify',
        categoryName: 'Transporte',
        icon: Car,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
    },
    {
        key: 'outing',
        concept: 'Cena / Salida',
        categoryName: 'Salidas',
        icon: Ticket,
        color: 'text-purple-500',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
    },
    {
        key: 'coffee',
        concept: 'Cafetería',
        categoryName: 'Salidas',
        icon: Coffee,
        color: 'text-amber-500',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
    },
    {
        key: 'pharmacy',
        concept: 'Farmacia',
        categoryName: 'Salud',
        icon: Pill,
        color: 'text-rose-500',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/20',
    },
    {
        key: 'services',
        concept: 'Pago Servicios',
        categoryName: 'Servicios',
        icon: Zap,
        color: 'text-yellow-500',
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/20',
    },
];

interface QuickActionsGridProps {
    accounts?: BankAccount[];
}

export function QuickActionsGrid({ accounts = [] }: QuickActionsGridProps) {
    const t = useTranslations('QuickActions');
    const [selectedAction, setSelectedAction] = useState<(typeof ACTIONS)[0] | null>(null);
    const [amount, setAmount] = useState('');

    // Selecciona la primera cuenta en ARS por defecto (ej. Mercado Pago o Banco)
    const arsAccounts = accounts.filter((acc) => acc.currency === 'ARS');
    const [selectedAccountId, setSelectedAccountId] = useState<string>(
        arsAccounts[0]?.id || accounts[0]?.id || ''
    );

    const [isPending, startTransition] = useTransition();

    const handleOpen = (action: (typeof ACTIONS)[0]) => {
        setSelectedAction(action);
        setAmount('');
        if (!selectedAccountId && arsAccounts.length > 0) {
            setSelectedAccountId(arsAccounts[0].id);
        }
    };

    const handleClose = () => {
        setSelectedAction(null);
        setAmount('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAction || !amount || Number(amount) <= 0) return;

        startTransition(async () => {
            const formData = new FormData();
            formData.append('concept', selectedAction.concept);
            formData.append('categoryName', selectedAction.categoryName);
            formData.append('amount', amount);
            if (selectedAccountId) {
                formData.append('accountId', selectedAccountId);
            }

            await createQuickExpense(formData);
            handleClose();
        });
    };

    return (
        <>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
                {ACTIONS.map((action) => {
                    const Icon = action.icon;
                    return (
                        <button
                            key={action.key}
                            type="button"
                            onClick={() => handleOpen(action)}
                            className={cn(
                                'flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-300 text-left',
                                'hover:scale-105 hover:shadow-lg active:scale-95 bg-card cursor-pointer',
                                action.border,
                                'group'
                            )}
                        >
                            <div
                                className={cn(
                                    'p-2.5 rounded-full transition-colors',
                                    action.bg,
                                    action.color,
                                    'group-hover:bg-opacity-80'
                                )}
                            >
                                <Icon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
                                {t(action.key)}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Modal Ultrarrápido de Registro */}
            <Dialog open={!!selectedAction} onOpenChange={(open) => !open && handleClose()}>
                <DialogContent className="sm:max-w-md bg-card border-border">
                    {selectedAction && (
                        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                            <DialogHeader>
                                <div className="flex items-center gap-3">
                                    <div
                                        className={cn(
                                            'p-2.5 rounded-full',
                                            selectedAction.bg,
                                            selectedAction.color
                                        )}
                                    >
                                        <selectedAction.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-base font-semibold text-foreground">
                                            {selectedAction.concept}
                                        </DialogTitle>
                                        <DialogDescription className="text-xs text-muted-foreground">
                                            Categoría: {selectedAction.categoryName} • Registro personal
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="space-y-3 pt-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="quick-amount" className="text-xs text-muted-foreground">
                                        Monto Gastado ($)
                                    </Label>
                                    <Input
                                        id="quick-amount"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        autoFocus
                                        required
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="text-2xl font-bold font-mono h-12"
                                    />
                                </div>

                                {accounts.length > 0 && (
                                    <div className="space-y-1.5">
                                        <Label htmlFor="quick-account" className="text-xs text-muted-foreground">
                                            Debitar de la cuenta
                                        </Label>
                                        <Select
                                            value={selectedAccountId}
                                            onValueChange={setSelectedAccountId}
                                        >
                                            <SelectTrigger id="quick-account" className="w-full">
                                                <SelectValue placeholder="Selecciona una cuenta" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {arsAccounts.map((acc) => (
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
                                )}
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-border/50">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClose}
                                    disabled={isPending}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={isPending || !amount || Number(amount) <= 0}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                                >
                                    {isPending ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Check className="w-3.5 h-3.5" />
                                    )}
                                    Confirmar Gasto
                                </Button>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}