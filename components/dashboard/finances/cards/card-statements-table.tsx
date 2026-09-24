'use client';

import { useTransition } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { toggleCardStatementStatus } from "@/lib/actions";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface StatementHistoryItem {
    id: number;
    statementMonth: Date;
    dueDate: Date;
    totalAmount: number;
    paidAmount?: number;
    status: 'pending' | 'partially_paid' | 'paid';
}

export function CardStatementsTable({ statements }: { statements: StatementHistoryItem[] }) {
    const [isPending, startTransition] = useTransition();

    const handleToggle = (id: number, currentStatus: string) => {
        startTransition(async () => {
            await toggleCardStatementStatus(id, currentStatus);
        });
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
        <div className="rounded-xl border border-border bg-card text-card-foreground overflow-hidden">
            <Table>
                <TableHeader className="bg-muted/40">
                    <TableRow className="border-border">
                        <TableHead className="font-medium">Período</TableHead>
                        <TableHead className="font-medium">Fecha Vencimiento</TableHead>
                        <TableHead className="font-medium">Estado</TableHead>
                        <TableHead className="text-right font-medium">Monto del Resumen</TableHead>
                        <TableHead className="text-right font-medium w-[140px]">Acción</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {statements.map((st) => {
                        const dueDate = new Date(st.dueDate);
                        dueDate.setHours(0, 0, 0, 0);
                        const isOverdue = (st.status === 'pending' || st.status === 'partially_paid') && dueDate < today;
                        const remaining = Math.max(0, st.totalAmount - (st.paidAmount || 0));

                        return (
                            <TableRow key={st.id} className="border-border hover:bg-muted/20 transition-colors">
                                <TableCell className="font-medium capitalize">
                                    {new Date(st.statementMonth).toLocaleDateString('es-AR', { month: 'long', year: 'numeric', timeZone: 'UTC' })}
                                </TableCell>
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                    {new Date(st.dueDate).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                </TableCell>
                                <TableCell>
                                    {st.status === 'paid' ? (
                                        <Badge variant="outline" className="border-emerald-500/30 text-emerald-500 bg-emerald-500/10 text-xs gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> Pagado
                                        </Badge>
                                    ) : st.status === 'partially_paid' ? (
                                        <Badge variant="outline" className="border-amber-500/30 text-amber-500 bg-amber-500/10 text-xs gap-1">
                                            <Clock className="w-3 h-3" /> Parcial ({formatCurrency(remaining)})
                                        </Badge>
                                    ) : isOverdue ? (
                                        <Badge variant="outline" className="border-rose-500/30 text-rose-500 bg-rose-500/10 text-xs gap-1">
                                            <AlertCircle className="w-3 h-3" /> Vencido
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="border-blue-500/30 text-blue-500 bg-blue-500/10 text-xs gap-1">
                                            <Clock className="w-3 h-3" /> Pendiente
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right font-mono font-bold text-foreground">
                                    <div>{formatCurrency(st.totalAmount)}</div>
                                    {st.status === 'partially_paid' && (
                                        <div className="text-[11px] font-normal text-muted-foreground">
                                            Resta: {formatCurrency(remaining)}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        size="sm"
                                        variant={st.status === 'paid' ? 'ghost' : 'outline'}
                                        disabled={isPending}
                                        onClick={() => handleToggle(st.id, st.status)}
                                        className="h-8 text-xs font-medium"
                                    >
                                        {st.status === 'paid' ? 'Desmarcar' : 'Completar Pago'}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                    {statements.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                No hay resúmenes registrados para esta tarjeta.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}