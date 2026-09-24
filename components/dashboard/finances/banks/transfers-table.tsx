'use client';

import * as React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowRight, ArrowLeftRight, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BankTransferRecord {
    id: string;
    amount: number;
    notes: string | null;
    createdAt: Date;
    fromAccount: {
        name: string;
        currency: string;
        color?: string;
    };
    toAccount: {
        name: string;
        currency: string;
        color?: string;
    };
}

const ITEMS_PER_PAGE = 8;

export function TransfersTable({ transfers }: { transfers: BankTransferRecord[] }) {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [currencyFilter, setCurrencyFilter] = React.useState<'all' | 'ARS' | 'USD'>('all');
    const [currentPage, setCurrentPage] = React.useState(1);

    // Reset pagination on filter change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, currencyFilter]);

    const filteredTransfers = React.useMemo(() => {
        return transfers.filter((item) => {
            const matchesSearch =
                item.fromAccount.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.toAccount.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));

            if (!matchesSearch) return false;

            if (currencyFilter !== 'all') {
                return (
                    item.fromAccount.currency === currencyFilter ||
                    item.toAccount.currency === currencyFilter
                );
            }

            return true;
        });
    }, [transfers, searchQuery, currencyFilter]);

    const totalPages = Math.ceil(filteredTransfers.length / ITEMS_PER_PAGE) || 1;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedTransfers = filteredTransfers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    function formatTime(date: Date) {
        return new Date(date).toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    if (transfers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-[var(--radius)] bg-muted/20 text-muted-foreground text-center">
                <ArrowLeftRight className="w-10 h-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm font-medium">No se han registrado transferencias internas todavía.</p>
                <p className="text-xs mt-1">Usa el botón de arriba para registrar movimientos entre tus cuentas.</p>
            </div>
        );
    }

    return (
        /* Unified Data Canvas (Toolbar + Table in a Single Block) idéntico a Invoices y Expenses */
        <div className="rounded-[var(--radius)] bg-card border border-border shadow-sm overflow-hidden flex flex-col justify-between">
            {/* Integrated Header Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 p-3.5 sm:p-5 border-b border-border bg-muted/20">
                <div className="w-full md:max-w-xs relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar por cuenta o nota..."
                        className="pl-9 h-10 bg-background border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground"
                    />
                </div>

                {/* Filter Buttons in style of StatusButtons */}
                <div className="bg-muted/50 p-1 rounded-xl flex items-center gap-1 border border-border w-max min-w-full sm:min-w-0 justify-between sm:justify-start overflow-x-auto scrollbar-none">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrencyFilter('all')}
                        className={cn(
                            "h-8 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer",
                            currencyFilter === 'all'
                                ? "bg-secondary/40 text-secondary-foreground font-semibold shadow-xs border border-border"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                    >
                        Todas ({transfers.length})
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrencyFilter('ARS')}
                        className={cn(
                            "h-8 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer",
                            currencyFilter === 'ARS'
                                ? "bg-secondary/40 text-secondary-foreground font-semibold shadow-xs border border-border"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                    >
                        Pesos (ARS)
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrencyFilter('USD')}
                        className={cn(
                            "h-8 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer",
                            currencyFilter === 'USD'
                                ? "bg-secondary/40 text-secondary-foreground font-semibold shadow-xs border border-border"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                    >
                        Dólares (USD)
                    </Button>
                </div>
            </div>

            {/* Table Area */}
            <div className="overflow-x-auto">
                <Table className="min-w-[650px]">
                    <TableHeader>
                        <TableRow className="border-border/30 hover:bg-transparent bg-muted/10">
                            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 py-3.5 pl-4 sm:pl-6">
                                Fecha y Hora
                            </TableHead>
                            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 py-3.5">
                                Origen (Débito)
                            </TableHead>
                            <TableHead className="w-10 py-3.5 text-center text-muted-foreground/40">
                                —
                            </TableHead>
                            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 py-3.5">
                                Destino (Crédito)
                            </TableHead>
                            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 py-3.5">
                                Motivo / Detalle
                            </TableHead>
                            <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 py-3.5 pr-4 sm:pr-6">
                                Monto
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedTransfers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-xs text-muted-foreground">
                                    No se encontraron movimientos que coincidan con la búsqueda.
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedTransfers.map((item) => (
                                <TableRow
                                    key={item.id}
                                    className="bg-transparent border-b border-border/20 hover:bg-muted/30 transition-colors"
                                >
                                    {/* Fecha y Hora */}
                                    <TableCell className="py-3.5 pl-4 sm:pl-6">
                                        <div className="text-xs font-semibold text-foreground">
                                            {formatDate(item.createdAt)}
                                        </div>
                                        <div className="text-[11px] font-mono text-muted-foreground">
                                            {formatTime(item.createdAt)}
                                        </div>
                                    </TableCell>

                                    {/* Cuenta Origen */}
                                    <TableCell className="py-3.5">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                                style={{ backgroundColor: item.fromAccount.color || '#71717a' }}
                                            />
                                            <span className="text-xs font-medium text-foreground">
                                                {item.fromAccount.name}
                                            </span>
                                        </div>
                                    </TableCell>

                                    {/* Flecha conectora */}
                                    <TableCell className="py-3.5 text-center text-muted-foreground/60 px-0">
                                        <ArrowRight className="w-3.5 h-3.5 mx-auto" />
                                    </TableCell>

                                    {/* Cuenta Destino */}
                                    <TableCell className="py-3.5">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                                style={{ backgroundColor: item.toAccount.color || '#10b981' }}
                                            />
                                            <span className="text-xs font-medium text-foreground">
                                                {item.toAccount.name}
                                            </span>
                                        </div>
                                    </TableCell>

                                    {/* Motivo / Detalle */}
                                    <TableCell className="py-3.5">
                                        <span className="text-xs text-muted-foreground">
                                            {item.notes || '—'}
                                        </span>
                                    </TableCell>

                                    {/* Monto transferido */}
                                    <TableCell className="text-right py-3.5 pr-4 sm:pr-6 font-mono tabular-nums font-semibold text-xs sm:text-sm text-secondary/40 dark:text-foreground/90 whitespace-nowrap">
                                        {item.fromAccount.currency === 'USD'
                                            ? `US$ ${item.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
                                            : formatCurrency(item.amount)}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Paginación y Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-border/30 gap-3 text-xs text-muted-foreground">
                <div>
                    Mostrando {filteredTransfers.length === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, filteredTransfers.length)} de {filteredTransfers.length} movimientos
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center gap-1.5">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage <= 1}
                            className="h-8 px-2.5 rounded-lg text-xs border-border bg-background hover:bg-muted text-foreground"
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Anterior
                        </Button>
                        <span className="font-mono text-xs px-2 text-foreground">
                            {currentPage} / {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage >= totalPages}
                            className="h-8 px-2.5 rounded-lg text-xs border-border bg-background hover:bg-muted text-foreground"
                        >
                            Siguiente
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}