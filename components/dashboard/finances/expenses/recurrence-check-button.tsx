"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RefreshCw, Loader2 } from "lucide-react"
import { getDueRecurringExpenses, processRecurringExpenses } from "@/lib/actions"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface DueExpense {
    id: string;
    concept: string;
    amount: number;
    currency: string;
    next_due_date: Date;
}

export function CheckRecurrenceButton({ pendingCount }: { pendingCount: number }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [processing, setProcessing] = useState(false)
    const [dueExpenses, setDueExpenses] = useState<DueExpense[]>([])
    const [selections, setSelections] = useState<Record<string, { selected: boolean, status: 'paid' | 'pending' }>>({})

    // Fetch when opening
    const handleOpenPromise = async (isOpen: boolean) => {
        setOpen(isOpen);
        if (isOpen) {
            setLoading(true);
            const expenses = await getDueRecurringExpenses();
            setDueExpenses(expenses as unknown as DueExpense[]);

            // Initialize selections
            const initialSelections: Record<string, { selected: boolean, status: 'paid' | 'pending' }> = {};
            (expenses as unknown as DueExpense[]).forEach((ex) => {
                initialSelections[ex.id] = { selected: true, status: 'pending' };
            });
            setSelections(initialSelections);
            setLoading(false);
        }
    };

    const handleProcess = async () => {
        setProcessing(true);
        const payload = Object.entries(selections)
            .filter(([, val]) => val.selected)
            .map(([id, val]) => ({ templateId: id, status: val.status }));

        const result = await processRecurringExpenses(payload);

        if (result.success) {
            setOpen(false);
            // Show success toast?
        }
        setProcessing(false);
    }

    const updateSelection = <K extends 'selected' | 'status'>(
        id: string,
        field: K,
        value: { selected: boolean; status: 'paid' | 'pending' }[K]
    ) => {
        setSelections(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value
            }
        }));
    }

    const hasDue = dueExpenses.length > 0;

    return (
        <Dialog open={open} onOpenChange={handleOpenPromise}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    disabled={pendingCount === 0}
                    className={`h-6 w-6 ${pendingCount > 0 ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-400/10' : 'text-zinc-600'}`}
                >
                    <RefreshCw className={`h-4 w-4 ${loading && "animate-spin"}`} />
                    {pendingCount > 0 && (
                        <span className="absolute -top-1 -right-1 block h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-zinc-900" />
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle>Gastos Recurrentes Pendientes</DialogTitle>
                    <DialogDescription>
                        Revisa los gastos detectados y selecciona cómo quieres generarlos.
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="py-10 flex justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : !hasDue ? (
                    <div className="py-10 text-center text-muted-foreground">
                        No hay gastos recurrentes para generar hoy, aunque el contador indicaba {pendingCount}.
                        (Puede que se hayan generado en otro proceso o las fechas no coincidan).
                    </div>
                ) : (
                    <div className="py-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]"></TableHead>
                                    <TableHead>Concepto</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Importe</TableHead>
                                    <TableHead>Estado a Generar</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {dueExpenses.map((expense) => (
                                    <TableRow key={expense.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selections[expense.id]?.selected}
                                                onCheckedChange={(checked: boolean) => updateSelection(expense.id, 'selected', checked)}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{expense.concept}</TableCell>
                                        <TableCell>{new Date(expense.next_due_date).toLocaleDateString()}</TableCell>
                                        <TableCell>{formatCurrency(expense.amount / 100)}</TableCell>
                                        <TableCell>
                                            <Select
                                                value={selections[expense.id]?.status}
                                                onValueChange={(val) => updateSelection(expense.id, 'status', val as 'paid' | 'pending')}
                                                disabled={!selections[expense.id]?.selected}
                                            >
                                                <SelectTrigger className="w-[130px] h-8">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pending">Pendiente</SelectItem>
                                                    <SelectItem value="paid">Pagado</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                    {hasDue && (
                        <Button onClick={handleProcess} disabled={processing}>
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirmar y Generar
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
