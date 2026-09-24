import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency, cn } from '@/lib/utils';
import { fetchFilteredInvoices, fetchInvoicesPages, fetchBankAccounts } from '@/lib/data';
import { InvoiceActions } from './invoice-action';
import { ToggleInvoiceStatusButton } from './toggle-invoice-status';
import { CollectInvoiceModal } from '@/components/dashboard/finances/invoices/collect-invoice-modal';
import { BankAccount } from '@/lib/definitions';
import Pagination from '@/components/ui/pagination';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export async function InvoicesTable({
  query,
  currentPage,
  year,
  month,
  status,
  accounts,
}: {
  query: string;
  currentPage: number;
  year: number;
  month: number;
  status: string;
  accounts?: BankAccount[];
}) {
  const [totalPages, invoices, fallbackAccounts] = await Promise.all([
    fetchInvoicesPages(query, year, month, status),
    fetchFilteredInvoices(query, currentPage, year, month, status),
    !accounts ? fetchBankAccounts() : Promise.resolve([]),
  ]);

  const bankAccounts = accounts && accounts.length > 0 ? accounts : fallbackAccounts;

  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  function formatTime(date: Date) {
    return new Date(date).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (invoices.length === 0) {
    return (
      <div className="rounded-md border border-border/40 p-8 text-center text-muted-foreground">
        No se encontraron facturas para el período seleccionado.
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col justify-between">
      {/* Se asegura min-w-full y scroll horizontal en móviles para preservar legibilidad */}
      <div className="w-full overflow-x-auto flex-1">
        <Table className="min-w-[650px]">
          <TableHeader className="bg-muted/10 sticky top-0 z-10 border-b border-border/30 backdrop-blur-sm">
            <TableRow className="border-border/30 hover:bg-transparent">
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 py-3.5 pl-4 sm:pl-6">
                Cliente
              </TableHead>
              <TableHead className="hidden sm:table-cell text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 py-3.5">
                Emisión
              </TableHead>
              <TableHead className="hidden md:table-cell text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 py-3.5">
                Vencimiento
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 py-3.5">
                Estado
              </TableHead>
              <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 py-3.5 pr-3 sm:pr-6">
                Monto
              </TableHead>
              {/* Ancho fijo estrecho para que el botón de los 3 puntos quede siempre pegado al margen derecho */}
              <TableHead className="w-[44px] py-3.5 pr-3 sm:pr-6 text-right">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => {
              const statusLower = invoice.status?.toLowerCase() || '';
              const isPaid = ['facturado', 'paid', 'cobrado'].includes(statusLower);
              const isPending = ['pendiente', 'pending'].includes(statusLower);
              const isOverdue = ['vencido', 'overdue'].includes(statusLower);

              return (
                <TableRow
                  key={invoice.id}
                  className="bg-transparent border-b border-border/20 hover:bg-muted/30 transition-colors"
                >
                  {/* Cliente */}
                  <TableCell className="py-3.5 pl-4 sm:pl-6">
                    <Link
                      href={`/dashboard/finances/invoices/${invoice.id}/details`}
                      className="group flex items-center gap-3"
                    >
                      <div className="hidden sm:block">
                        <Avatar className="h-8 w-8 border border-border/50 shadow-xs">
                          <AvatarImage src={invoice.image_url || ''} alt={invoice.name} />
                          <AvatarFallback className="bg-secondary/40 hover:bg-secondary/30 dark:bg-foreground/90 dark:hover:bg-foreground text-secondary-foreground dark:text-background text-xs font-semibold font-mono transition-colors">
                            {getInitials(invoice.name)}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      <div className="max-w-[130px] xs:max-w-[180px] sm:max-w-none">
                        <div className="font-medium text-foreground text-sm decoration-foreground/30 underline-offset-4 group-hover:underline group-hover:decoration-foreground/70 transition-all duration-200 truncate">
                          {invoice.name}
                        </div>
                        <div className="text-xs text-muted-foreground transition-colors truncate">
                          {invoice.email}
                        </div>
                      </div>
                    </Link>
                  </TableCell>

                  {/* Emisión */}
                  <TableCell className="py-3.5 hidden sm:table-cell">
                    <div className="text-xs font-medium text-foreground">
                      {formatDate(invoice.issue_date)}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      {formatTime(invoice.issue_date)}
                    </div>
                  </TableCell>

                  {/* Vencimiento */}
                  <TableCell className="py-3.5 hidden md:table-cell">
                    <div className="text-xs font-medium text-foreground">
                      {formatDate(invoice.due_date)}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      {formatTime(invoice.due_date)}
                    </div>
                  </TableCell>

                  {/* Estado: Badge unificado y limpio */}
                  <TableCell className="py-3.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center justify-center gap-1.5 text-[11px] font-mono leading-none tracking-tight px-2.5 py-1 rounded-md border transition-colors capitalize whitespace-nowrap",
                          // Cobrado / Facturado
                          isPaid && "bg-neutral-100 text-neutral-900 border-neutral-300 dark:bg-white/[0.08] dark:text-zinc-100 dark:border-white/20 shadow-[0_0_12px_rgba(255,255,255,0.03)]",

                          // Pendiente
                          isPending && "bg-neutral-100/80 text-neutral-600 border-neutral-300 dark:bg-zinc-900/60 dark:text-zinc-400 dark:border-zinc-800/80",

                          // Vencido
                          isOverdue && "bg-neutral-200/80 text-neutral-800 border-neutral-300 dark:bg-zinc-800/40 dark:text-zinc-300 dark:border-zinc-700",

                          // Fallback
                          !isPaid && !isPending && !isOverdue && "bg-neutral-100 text-neutral-500 border-neutral-200 dark:bg-zinc-900/40 dark:text-zinc-500 dark:border-zinc-800"
                        )}
                      >
                        {/* Indicador visual de estado mediante relleno o contorno */}
                        <span
                          className={cn(
                            "w-1.5 h-1.5 rounded-full shrink-0",
                            isPaid && "bg-secondary/40 dark:bg-foreground/90",
                            isPending && "border border-neutral-500 bg-transparent dark:border-zinc-500", // Círculo hueco = pendiente
                            isOverdue && "bg-neutral-700 dark:bg-zinc-400",
                            !isPaid && !isPending && !isOverdue && "bg-neutral-400 dark:bg-zinc-600"
                          )}
                        />
                        <span className="translate-y-[-0.5px]">{invoice.status}</span>
                      </span>

                      {/* Botón rápido para cobrar cuando esté pendiente */}
                      {!isPaid && (
                        <div className="hidden sm:block">
                          <CollectInvoiceModal
                            invoiceId={invoice.id}
                            clientName={invoice.name}
                            amount={invoice.amount}
                            currency={((invoice.currency || 'ARS').toUpperCase() === 'USD' ? 'USD' : 'ARS') as 'ARS' | 'USD'}
                            accounts={bankAccounts}
                          />
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Monto */}
                  <TableCell className="py-3.5 pr-3 sm:pr-6 text-right font-mono tabular-nums font-semibold text-xs sm:text-sm text-secondary/40 dark:text-foreground/90 whitespace-nowrap">
                    {formatCurrency(invoice.amount)}
                  </TableCell>

                  {/* Botón de Menú de Acciones exclusivamente */}
                  <TableCell className="py-3.5 pr-3 sm:pr-6 text-right">
                    <div className="flex justify-end">
                      <InvoiceActions invoiceId={invoice.id} />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="mt-auto border-t border-border/30 px-6 py-4 flex w-full justify-center bg-transparent">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}