'use client';

import { useState } from 'react';
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
import { DatePicker } from '@/components/ui/date-picker';
import { saveCardStatement } from '@/lib/actions';
import { Plus, CreditCard, Calendar as CalendarIcon, DollarSign, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface StatementUploadModalProps {
    cardId: string;
    cardName: string;
    year: number;
    month: number;
    defaultDueDate: string;
}

export function StatementUploadModal({
    cardId,
    cardName,
    year,
    month,
    defaultDueDate,
}: StatementUploadModalProps) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dueDate, setDueDate] = useState<Date>(() => {
        const [y, m, d] = defaultDueDate.split('-').map(Number);
        return new Date(y, m - 1, d);
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        formData.set('card_id', cardId);
        formData.set('year', String(year));
        formData.set('month', String(month));
        formData.set('due_date', dueDate.toISOString().split('T')[0]);

        try {
            await saveCardStatement(formData);
            toast.success('Resumen guardado exitosamente');
            setOpen(false);
        } catch (error) {
            toast.error('Error al guardar el resumen');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    type="button"
                    className="w-full h-8 rounded-lg text-xs font-medium font-mono text-zinc-950 bg-white hover:bg-zinc-200 border border-white/30 flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Cargar Resumen</span>
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-card border-border text-foreground">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-foreground font-semibold">
                        <CreditCard className="w-5 h-5 text-primary" />
                        Cargar Resumen: {cardName}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-xs">
                        Ingresa el monto total emitido por el banco y la fecha límite de vencimiento.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                        <Label htmlFor={`amount-${cardId}`} className="text-xs font-medium text-muted-foreground">
                            Total a Pagar según Resumen ($)
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm text-muted-foreground">
                                $
                            </span>
                            <Input
                                id={`amount-${cardId}`}
                                name="total_amount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                required
                                autoFocus
                                className="pl-10 text-xl font-bold font-mono h-11 bg-background border-border text-foreground rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">
                            Fecha de Vencimiento del Resumen
                        </Label>
                        <DatePicker
                            value={dueDate}
                            onChange={(date) => date && setDueDate(date)}
                            className="w-full"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-border">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            className="rounded-xl"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs rounded-xl gap-1.5"
                        >
                            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            <span>{isSubmitting ? 'Guardando...' : 'Guardar Resumen'}</span>
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
