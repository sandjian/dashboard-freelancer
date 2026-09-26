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
import { createBankAccount } from '@/lib/actions';
import { Plus, Landmark, Wallet, Banknote, DollarSign, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export function CreateAccountModal() {
    const t = useTranslations('Banks');
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [accountType, setAccountType] = useState('bank');
    const [currency, setCurrency] = useState<'ARS' | 'USD'>('ARS');
    const [color, setColor] = useState('#10b981');
    const [error, setError] = useState<string | null>(null);

    const accountTypes = [
        { value: 'bank', label: t('typeTraditional'), icon: Landmark },
        { value: 'wallet', label: t('typeWallet'), icon: Wallet },
        { value: 'cash', label: t('typeCash'), icon: Banknote },
        { value: 'usd_account', label: t('typeUSD'), icon: DollarSign },
    ];

    const presetColors = [
        { label: t('colorEmerald'), value: '#10b981' },
        { label: t('colorBlue'), value: '#3b82f6' },
        { label: t('colorPurple'), value: '#8b5cf6' },
        { label: t('colorAmber'), value: '#f59e0b' },
        { label: t('colorPink'), value: '#ec4899' },
        { label: t('colorZinc'), value: '#71717a' },
    ];

    const handleTypeChange = (type: string) => {
        setAccountType(type);
        if (type === 'usd_account') {
            setCurrency('USD');
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);
        formData.set('account_type', accountType);
        formData.set('currency', currency);
        formData.set('color', color);

        startTransition(async () => {
            try {
                await createBankAccount(formData);
                toast.success(t('accountCreated'));
                setOpen(false);
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : t('accountCreateError');
                setError(message);
                toast.error(message);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    className="relative overflow-hidden bg-secondary/40 text-secondary-foreground hover:bg-secondary/30 hover:border-secondary/30 hover:text-accent dark:hover:text-secondary-foreground shadow-sm font-semibold transition-all duration-300 group h-10 px-5 rounded-xl cursor-pointer w-full sm:w-auto justify-center"
                >
                    <div className="flex items-center justify-center gap-2 relative z-10 tracking-wide text-sm font-medium">
                        <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
                        <span>{t('newAccount')}</span>
                    </div>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-card border-border text-foreground">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-foreground font-semibold">
                        <Landmark className="w-5 h-5 text-primary" />
                        {t('registerAccountTitle')}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-xs">
                        {t('registerAccountDesc')}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    {error && (
                        <div className="p-3 text-xs font-medium rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <Label htmlFor="acc-name" className="text-xs font-medium text-muted-foreground">
                            {t('accountNameLabel')}
                        </Label>
                        <Input
                            id="acc-name"
                            name="name"
                            placeholder={t('accountNamePlaceholder')}
                            required
                            autoFocus
                            className="bg-background border-border text-foreground h-10 rounded-xl"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-muted-foreground">{t('accountTypeLabel')}</Label>
                            <Select value={accountType} onValueChange={handleTypeChange}>
                                <SelectTrigger className="bg-background border-border text-foreground h-10 rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {accountTypes.map((type) => {
                                        const Icon = type.icon;
                                        return (
                                            <SelectItem key={type.value} value={type.value}>
                                                <div className="flex items-center gap-2 text-xs">
                                                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                                                    <span>{type.label}</span>
                                                </div>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-muted-foreground">{t('currencyLabel')}</Label>
                            <Select
                                value={currency}
                                onValueChange={(val: 'ARS' | 'USD') => setCurrency(val)}
                                disabled={accountType === 'usd_account'}
                            >
                                <SelectTrigger className="bg-background border-border text-foreground h-10 rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ARS">{t('pesosOption')}</SelectItem>
                                    <SelectItem value="USD">{t('dollarsOption')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="acc-balance" className="text-xs font-medium text-muted-foreground">
                            {t('initialBalanceLabel', { currency })}
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm text-muted-foreground">
                                {currency === 'USD' ? 'US$' : '$'}
                            </span>
                            <Input
                                id="acc-balance"
                                name="balance"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="bg-background border-border text-foreground pl-10 font-mono font-semibold h-10 rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">{t('colorLabel')}</Label>
                        <div className="flex items-center gap-2 flex-wrap">
                            {presetColors.map((c) => (
                                <button
                                    key={c.value}
                                    type="button"
                                    onClick={() => setColor(c.value)}
                                    className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${
                                        color === c.value ? 'scale-110 border-foreground shadow-sm' : 'border-transparent opacity-80 hover:opacity-100'
                                    }`}
                                    style={{ backgroundColor: c.value }}
                                    title={c.label}
                                    aria-label={`Seleccionar color ${c.label}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-border">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            className="rounded-xl"
                        >
                            {t('cancel')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-semibold gap-2"
                        >
                            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            <span>{isPending ? t('saving') : t('createAccount')}</span>
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
