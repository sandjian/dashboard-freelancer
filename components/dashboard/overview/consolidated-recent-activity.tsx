import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, History, ArrowRight } from "lucide-react";
import { ActivityItem } from "./recent-activity";

interface ConsolidatedRecentActivityProps {
    activity: ActivityItem[];
}

export function ConsolidatedRecentActivity({ activity }: ConsolidatedRecentActivityProps) {
    const items = activity.slice(0, 6);

    return (
        <div className="rounded-[var(--radius)] bg-card border border-border shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-muted/20">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-secondary/40 hover:bg-secondary/30 dark:bg-foreground/90 dark:hover:bg-foreground text-secondary-foreground dark:text-background transition-colors">
                        <History className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-foreground tracking-tight">Actividad Reciente Consolidada</h3>
                        <p className="text-xs text-muted-foreground">Últimos movimientos de ingresos y gastos</p>
                    </div>
                </div>

                <Link
                    href="/dashboard/finances/expenses"
                    className="text-xs font-semibold text-foreground hover:underline transition-all flex items-center gap-1"
                >
                    <span>Ver historial completo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            {/* Table Area */}
            {items.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-xs">
                    No se registran movimientos recientes.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <Table className="min-w-[500px]">
                        <TableHeader>
                            <TableRow className="border-border hover:bg-transparent bg-muted/10">
                                <TableHead className="w-[48px]"></TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Concepto</TableHead>
                                <TableHead className="hidden sm:table-cell text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tipo / Categoría</TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fecha</TableHead>
                                <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Monto</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item, idx) => {
                                const isInvoice = item.type === "invoice";
                                const Icon = isInvoice ? ArrowUpRight : ArrowDownRight;

                                return (
                                    <TableRow
                                        key={item.id || idx}
                                        className="border-border hover:bg-muted/40 transition-colors"
                                    >
                                        <TableCell className="py-3 pl-4">
                                            <div
                                                className={cn(
                                                    "w-7 h-7 rounded-lg flex items-center justify-center border",
                                                    isInvoice
                                                        ? "bg-foreground/5 text-foreground border-border"
                                                        : "bg-muted text-muted-foreground border-border"
                                                )}
                                            >
                                                <Icon className="w-3.5 h-3.5" />
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-3 font-medium text-xs text-foreground max-w-[200px] truncate">
                                            {item.description || "Sin descripción"}
                                        </TableCell>

                                        <TableCell className="py-3 hidden sm:table-cell">
                                            <Badge
                                                variant="outline"
                                                className="text-[10px] font-normal px-2 py-0.5 border-border bg-card text-muted-foreground"
                                            >
                                                {item.category || (isInvoice ? "Ingreso" : "Gasto")}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="py-3 text-xs font-mono text-muted-foreground">
                                            {format(new Date(item.date), "dd MMM yyyy", { locale: es })}
                                        </TableCell>

                                        <TableCell className="py-3 text-right font-mono text-xs font-semibold text-foreground pr-4">
                                            <span className={cn(isInvoice ? "text-foreground" : "text-muted-foreground")}>
                                                {isInvoice ? "+" : "-"}{formatCurrency(item.amount)}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
