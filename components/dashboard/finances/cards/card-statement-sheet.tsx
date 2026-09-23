'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { saveCardStatement, toggleCardStatementStatus } from '@/lib/actions';
import { formatCurrency } from '@/lib/utils';
import { CheckCircle2, Clock, Plus, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PayStatementModal } from '@/components/dashboard/finances/cards/pay-statement-modal';
import { BankAccount } from '@/lib/definitions';

interface CardStatementSheetProps {
    cardId: string;
    cardName: string;
    dueDay: number;
    year: number;
    month: number;
    statement: {
        id: string | number;
        totalAmount: number;
        dueDate: Date;
        status: 'pending' | 'paid';
    } | null;
    accounts?: BankAccount[];
}

export function CardStatementControl({
    cardId,
    cardName,
    dueDay,
    year,
    month,
    statement,
    accounts = [],
}: CardStatementSheetProps) {
    const [open, setOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const defaultDueDate = new Date(year, month - 1, Math.min(dueDay, 28))
        .toISOString()
        .split('T')[0];

    const handleTogglePaid = async () => {
        if (!statement) return;
        setIsPending(true);
        try {
            await toggleCardStatementStatus(statement.id, statement.status);
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="mt-3 p-3 rounded-xl border border-border bg-card/60 space-y-3">
            {statement ? (
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <div className="text-xs text-muted-foreground">Resumen a pagar</div>
                        <div className="text-lg font-bold font-mono text-foreground">
                            {formatCurrency(statement.totalAmount)}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                            Vence: {new Date(statement.dueDate).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                        <Badge
                            variant="outline"
                            className={
                                statement.status === 'paid'
                                    ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10 text-xs'
                                    : 'border-amber-500/30 text-amber-500 bg-amber-500/10 text-xs'
                            }
                        >
                            {statement.status === 'paid' ? (
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                            ) : (
                                <Clock className="w-3 h-3 mr-1" />
                            )}
                            {statement.status === 'paid' ? 'Pagado' : 'Pendiente'}
                        </Badge>

                        {statement.status === 'paid' ? (
                            <Button
                                size="sm"
                                variant="ghost"
                                disabled={isPending}
                                onClick={handleTogglePaid}
                                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                            >
                                Desmarcar
                            </Button>
                        ) : (
                            <PayStatementModal
                                statementId={statement.id.toString()}
                                cardName={cardName}
                                totalAmount={statement.totalAmount}
                                accounts={accounts}
                            />
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-between py-1">
                    <span className="text-xs text-muted-foreground">Sin resumen cargado este mes</span>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="h-8 text-xs gap-1 border-primary/40 text-primary hover:bg-primary/10">
                                <Plus className="w-3.5 h-3.5" />
                                Cargar Resumen
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md bg-card border-border">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-primary" />
                                    Cargar Resumen: {cardName}
                                </DialogTitle>
                            </DialogHeader>

                            <form
                                action={async (formData) => {
                                    await saveCardStatement(formData);
                                    setOpen(false);
                                }}
                                className="space-y-4 pt-2"
                            >
                                <input type="hidden" name="card_id" value={cardId} />
                                <input type="hidden" name="year" value={year} />
                                <input type="hidden" name="month" value={month} />

                                <div className="space-y-1.5">
                                    <Label htmlFor="total_amount">Total del Resumen ($)</Label>
                                    <Input
                                        id="total_amount"
                                        name="total_amount"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        required
                                        autoFocus
                                        className="text-xl font-bold font-mono h-12"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="due_date">Fecha de Vencimiento</Label>
                                    <Input
                                        id="due_date"
                                        name="due_date"
                                        type="date"
                                        defaultValue={defaultDueDate}
                                        required
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit">Guardar Resumen</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            )}
        </div>
    );
}