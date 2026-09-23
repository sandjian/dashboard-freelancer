'use client';

import * as React from 'react';
import Link from 'next/link';
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
import type { Invoice } from '@/lib/definitions';
import { cn } from '@/lib/utils';
import { Search, Plus, ArrowUpRight, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

interface ClientInvoicesTableProps {
  invoices: Invoice[];
  clientName?: string;
}

const ITEMS_PER_PAGE = 6;

export function ClientInvoicesTable({ invoices, clientName }: ClientInvoicesTableProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'facturado' | 'pendiente' | 'vencido'>('all');
  const [currentPage, setCurrentPage] = React.useState(1);

  // Reset page on search or filter change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const filteredInvoices = React.useMemo(() => {
    return invoices.filter((inv) => {
      const numStr = `INV-${inv.invoice_number?.toString().padStart(6, '0')}`;
      const matchesSearch = numStr.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      const statusLower = (inv.status || '').toLowerCase();
      const isPaid = ['facturado', 'paid', 'cobrado'].includes(statusLower);
      const isPending = ['pendiente', 'pending'].includes(statusLower);
      const isOverdue = ['vencido', 'overdue'].includes(statusLower);

      if (statusFilter === 'facturado') return isPaid;
      if (statusFilter === 'pendiente') return isPending;
      if (statusFilter === 'vencido') return isOverdue;

      return true;
    });
  }, [invoices, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-[var(--radius)] bg-muted/20 text-muted-foreground text-center">
        <FileText className="w-10 h-10 text-muted-foreground/40 mb-3" />
        <p className="text-sm font-medium">Este cliente no tiene facturas registradas todavía.</p>
        <p className="text-xs mt-1">Crea la primera factura para comenzar a registrar su historial.</p>
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
            placeholder="Buscar por Nº Factura..."
            className="pl-9 h-10 bg-background border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Filter Buttons in style of StatusButtons component */}
        <div className="bg-muted/50 p-1 rounded-xl flex items-center gap-1 border border-border w-max min-w-full sm:min-w-0 justify-between sm:justify-start overflow-x-auto scrollbar-none">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStatusFilter('all')}
            className={cn(
              "h-8 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer",
              statusFilter === 'all'
                ? "bg-secondary/40 text-secondary-foreground font-semibold shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            Todas ({invoices.length})
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStatusFilter('facturado')}
            className={cn(
              "h-8 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer",
              statusFilter === 'facturado'
                ? "bg-secondary/40 text-secondary-foreground font-semibold shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            Cobradas
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStatusFilter('pendiente')}
            className={cn(
              "h-8 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer",
              statusFilter === 'pendiente'
                ? "bg-secondary/40 text-secondary-foreground font-semibold shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            Pendientes
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStatusFilter('vencido')}
            className={cn(
              "h-8 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer",
              statusFilter === 'vencido'
                ? "bg-neutral-200/80 text-neutral-900 dark:bg-zinc-800 dark:text-zinc-200 font-semibold shadow-xs border border-neutral-300 dark:border-zinc-700"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            Vencidas
          </Button>
        </div>
      </div>

      {/* Table Area */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 hover:bg-transparent bg-muted/10">
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 py-3.5 pl-4 sm:pl-6">
                Nº Factura
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 py-3.5">
                Emisión
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 py-3.5 hidden sm:table-cell">
                Vencimiento
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 py-3.5">
                Estado
              </TableHead>
              <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 py-3.5 pr-4 sm:pr-6">
                Monto
              </TableHead>
              <TableHead className="w-[44px] py-3.5 pr-3 sm:pr-6 text-right">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-xs text-muted-foreground">
                  No se encontraron facturas con los filtros seleccionados.
                </TableCell>
              </TableRow>
            ) : (
              paginatedInvoices.map((invoice) => {
                const statusLower = (invoice.status || '').toLowerCase();
                const isPaid = ['facturado', 'paid', 'cobrado'].includes(statusLower);
                const isPending = ['pendiente', 'pending'].includes(statusLower);
                const isOverdue = ['vencido', 'overdue'].includes(statusLower);

                return (
                  <TableRow
                    key={invoice.id}
                    className="bg-transparent border-b border-border/20 hover:bg-muted/30 transition-colors"
                  >
                    {/* Nº Factura */}
                    <TableCell className="py-3.5 pl-4 sm:pl-6">
                      <Link
                        href={`/dashboard/finances/invoices/${invoice.id}/details`}
                        className="group inline-flex items-center gap-2 font-mono text-xs sm:text-sm font-semibold text-foreground hover:underline"
                      >
                        <span>INV-{invoice.invoice_number.toString().padStart(6, '0')}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </TableCell>

                    {/* Emisión */}
                    <TableCell className="py-3.5 text-xs text-foreground font-medium">
                      {formatDate(invoice.issue_date)}
                    </TableCell>

                    {/* Vencimiento */}
                    <TableCell className="py-3.5 text-xs text-muted-foreground hidden sm:table-cell">
                      {formatDate(invoice.due_date)}
                    </TableCell>

                    {/* Estado: Badge unificado y limpio idéntico al de Invoices */}
                    <TableCell className="py-3.5">
                      <span
                        className={cn(
                          "inline-flex items-center justify-center gap-1.5 text-[11px] leading-none px-2.5 py-1 rounded-md border transition-colors capitalize whitespace-nowrap",
                          isPaid && "bg-neutral-100 text-neutral-900 border-neutral-300 dark:bg-white/[0.08] dark:text-zinc-100 dark:border-white/20",
                          isPending && "bg-neutral-100/80 text-neutral-600 border-neutral-300 dark:bg-zinc-900/60 dark:text-zinc-400 dark:border-zinc-800/80",
                          isOverdue && "bg-neutral-200/80 text-neutral-800 border-neutral-300 dark:bg-zinc-800/40 dark:text-zinc-300 dark:border-zinc-700"
                        )}
                      >
                        <span
                          className={cn(
                            "w-1.5 h-1.5 rounded-full shrink-0",
                            isPaid && "bg-secondary/40 dark:bg-foreground/90",
                            isPending && "border border-neutral-500 bg-transparent dark:border-zinc-500",
                            isOverdue && "bg-neutral-700 dark:bg-zinc-400"
                          )}
                        />
                        <span>{invoice.status}</span>
                      </span>
                    </TableCell>

                    {/* Monto */}
                    <TableCell className="py-3.5 pr-4 sm:pr-6 text-right font-mono tabular-nums font-semibold text-xs sm:text-sm text-secondary/40 dark:text-foreground/90 whitespace-nowrap">
                      {formatCurrency(invoice.amount, invoice.currency)}
                    </TableCell>

                    {/* Ver detalle botón rápido */}
                    <TableCell className="py-3.5 pr-3 sm:pr-6 text-right">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                      >
                        <Link href={`/dashboard/finances/invoices/${invoice.id}/details`} title="Ver Detalle de Factura">
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación y Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-border/30 gap-3 text-xs text-muted-foreground">
        <div>
          Mostrando {filteredInvoices.length === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, filteredInvoices.length)} de {filteredInvoices.length} facturas
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