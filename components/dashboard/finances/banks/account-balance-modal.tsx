'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { updateAccountBalance } from '@/lib/actions';
import { BankAccount } from '@/lib/definitions';
import { formatCurrency } from '@/lib/utils';
import { Edit3, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

export function AccountBalanceModal({ account }: { account: BankAccount }) {
    const t = useTranslations('Banks');
    const [open, setOpen] = useState(false);
    const [balance, setBalance] = useState(account.balance.toString());
    const [isPending, startTransition] = useTransition();

    const handleUpdate = () => {
        startTransition(async () => {
            try {
                await updateAccountBalance(account.id, Number(balance) || 0);
                toast.success(t('balanceUpdated'));
                setOpen(false);
            } catch (err) {
                toast.error(t('balanceUpdateError'));
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2.5 rounded-lg text-xs font-medium text-foreground hover:bg-muted border border-border/60 transition-colors shadow-2xs cursor-pointer"
                >
                    <Edit3 className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
                    <span>{t('adjustBalance')}</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-card border-border text-foreground">
                <DialogHeader>
                    <DialogTitle className="text-base font-bold text-foreground">
                        {t('reconcileBalanceTitle', { account: account.name })}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <p className="text-xs text-muted-foreground">
                        {t('reconcileBalanceDesc')}
                    </p>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {t('newBalanceLabel', { currency: account.currency })}
                        </label>
                        <Input
                            type="number"
                            step="0.01"
                            value={balance}
                            onChange={(e) => setBalance(e.target.value)}
                            className="font-mono text-base font-bold h-11 bg-background border-border"
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setOpen(false)}
                            disabled={isPending}
                            className="text-xs"
                        >
                            {t('cancel')}
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleUpdate}
                            disabled={isPending}
                            className="text-xs font-semibold bg-secondary/40 text-secondary-foreground hover:bg-secondary/30 dark:bg-foreground/90 dark:hover:bg-foreground dark:text-background"
                        >
                            {isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                            {isPending ? t('updatingBalance') : t('updateBalance')}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}