'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { toggleInvoicePaymentStatus } from '@/lib/actions';
import { Check, RotateCcw, Loader2 } from 'lucide-react';

interface ToggleInvoiceStatusButtonProps {
    invoiceId: string;
    currentStatus: string;
}

export function ToggleInvoiceStatusButton({
    invoiceId,
    currentStatus,
}: ToggleInvoiceStatusButtonProps) {
    const [isPending, startTransition] = useTransition();
    const isPaid = currentStatus === 'facturado';

    const handleToggle = () => {
        startTransition(async () => {
            await toggleInvoicePaymentStatus(invoiceId, currentStatus);
        });
    };

    return (
        <Button
            size="sm"
            variant={isPaid ? 'ghost' : 'outline'}
            disabled={isPending}
            onClick={handleToggle}
            className={`h-7 px-2.5 text-xs font-medium transition-colors ${isPaid
                    ? 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                    : 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/60'
                }`}
            title={isPaid ? 'Desmarcar y pasar a pendiente' : 'Marcar como cobrada'}
        >
            {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isPaid ? (
                <span className="flex items-center gap-1 text-[11px]">
                    <RotateCcw className="w-3 h-3" /> Desmarcar
                </span>
            ) : (
                <span className="flex items-center gap-1 text-[11px]">
                    <Check className="w-3.5 h-3.5" /> Cobrada
                </span>
            )}
        </Button>
    );
}