import { fetchFilteredExpenses, fetchExpensesPages } from '@/lib/data';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn, formatCurrency } from '@/lib/utils';
import { ExpenseActions } from './expenses-actions';
import Pagination from '@/components/ui/pagination';
import {
  Wallet,
  CreditCard,
  Banknote,
  ArrowRightLeft,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

export async function ExpensesTable({
  query,
  currentPage,
  year,
  month,
  categoryId,
  status,
  cardId,
}: {
  query: string;
  currentPage: number;
  year: number;
  month: number;
  categoryId: string | null;
  status: string | null;
  cardId?: string | null;
}) {
  const [expenses, totalPages] = await Promise.all([
    fetchFilteredExpenses(query, currentPage, year, month, categoryId, status, cardId),
    fetchExpensesPages(query, year, month, categoryId, status, cardId),
  ]);

  if (expenses.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
        <Clock className="w-8 h-8 text-muted-foreground/40 mb-1" />
        <p className="font-medium text-foreground">No se encontraron movimientos</p>
        <p className="text-xs">No hay gastos registrados que coincidan con los filtros aplicados.</p>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="w-full overflow-x-auto flex-1">
        <Table>
          <TableHeader className="bg-muted/10 sticky top-0 z-10 border-b border-border/30 backdrop-blur-sm">
            <TableRow className="border-border/30 hover:bg-transparent">
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 py-3.5 pl-4 sm:pl-6 w-[85px]">
                Fecha
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 py-3.5">
                Concepto & Destino
              </TableHead>
              <TableHead className="hidden sm:table-cell text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 py-3.5">
                Categoría
              </TableHead>
              <TableHead className="hidden md:table-cell text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 py-3.5">
                Método
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 py-3.5">
                Estado
              </TableHead>
              <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 py-3.5 pr-3 sm:pr-6">
                Monto
              </TableHead>
              <TableHead className="w-[44px] py-3.5 pr-3 sm:pr-6 text-right">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => {
              const isSummary = expense.id && expense.id.startsWith('card_summary_');
              const realCardId = isSummary ? expense.id!.replace('card_summary_', '') : null;

              // Determinación dinámica de estado real
              const expenseDate = new Date(expense.date);
              expenseDate.setHours(0, 0, 0, 0);

              const isPaid = expense.status === 'paid';
              const isOverdue = !isPaid && expenseDate < today;
              const isPending = !isPaid && !isOverdue;

              return (
                <TableRow
                  key={expense.id}
                  className="bg-transparent border-b border-border/20 hover:bg-muted/30 transition-colors"
                >
                  {/* 1. FECHA */}
                  <TableCell className="py-3.5 pl-4 sm:pl-6 text-muted-foreground font-medium font-mono text-xs whitespace-nowrap">
                    {new Date(expense.date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
                  </TableCell>

                  {/* 2. CONCEPTO + BADGES (DESTINO Y RECURRENCIA) */}
                  <TableCell className="py-3.5 font-medium text-foreground">
                    <div className="flex flex-wrap items-center gap-2">
                      {isSummary ? (
                        <Link
                          href={`/dashboard/finances/cards/${realCardId}?year=${year}&month=${month}`}
                          className="font-medium text-foreground text-sm decoration-foreground/30 underline-offset-4 hover:underline hover:decoration-foreground/70 transition-all duration-200"
                        >
                          {expense.concept}
                        </Link>
                      ) : (
                        <span className="font-medium text-foreground text-sm">
                          {expense.concept}
                        </span>
                      )}

                      {/* Badge Destino: Personal vs Negocio */}
                      {expense.entity_type === 'business' ? (
                        <Badge variant="outline" className="border-border text-foreground/80 bg-muted/30 text-[10px] px-1.5 py-0 font-mono">
                          🏢 Negocio
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-border text-muted-foreground bg-muted/20 text-[10px] px-1.5 py-0 font-mono">
                          🏠 Personal
                        </Badge>
                      )}

                      {/* Badge Fijo / Plantilla */}
                      {expense.template_id && (
                        <Badge variant="outline" className="border-border text-muted-foreground bg-muted/40 text-[10px] px-1.5 py-0 shadow-none font-mono">
                          Fijo
                        </Badge>
                      )}

                      {isSummary && (
                        <Badge variant="outline" className="border-border text-muted-foreground bg-muted/40 text-[10px] px-1.5 py-0 shadow-none font-mono">
                          Resumen
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  {/* 3. CATEGORÍA */}
                  <TableCell className="py-3.5 hidden sm:table-cell">
                    <span className="inline-flex items-center text-xs font-mono text-muted-foreground px-2 py-0.5 rounded-md bg-muted/40 border border-border">
                      {expense.category_name}
                    </span>
                  </TableCell>

                  {/* 4. MÉTODO DE PAGO */}
                  <TableCell className="py-3.5 hidden md:table-cell text-muted-foreground text-sm">
                    <div className="flex items-center gap-2">
                      {expense.payment_method === 'cash' && <Wallet className="w-3.5 h-3.5 text-muted-foreground" />}
                      {expense.payment_method === 'credit_card' && <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />}
                      {expense.payment_method === 'debit_card' && <Banknote className="w-3.5 h-3.5 text-muted-foreground" />}
                      {expense.payment_method === 'transfer' && <ArrowRightLeft className="w-3.5 h-3.5 text-muted-foreground" />}

                      <span className="capitalize text-xs font-mono">
                        {expense.payment_method === 'credit_card' ? 'Crédito' :
                          expense.payment_method === 'debit_card' ? 'Débito' :
                            expense.payment_method === 'transfer' ? 'Transf.' :
                              'Efectivo'}
                      </span>
                    </div>
                  </TableCell>

                  {/* 5. ESTADO EXACTO (Matching Invoices badge) */}
                  <TableCell className="py-3.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center justify-center gap-1.5 text-[11px] font-mono leading-none tracking-tight px-2.5 py-1 rounded-md border transition-colors capitalize whitespace-nowrap",
                          // Pagado
                          isPaid && "bg-neutral-100 text-neutral-900 border-neutral-300 dark:bg-white/[0.08] dark:text-zinc-100 dark:border-white/20 shadow-[0_0_12px_rgba(255,255,255,0.03)]",

                          // Pendiente
                          isPending && "bg-neutral-100/80 text-neutral-600 border-neutral-300 dark:bg-zinc-900/60 dark:text-zinc-400 dark:border-zinc-800/80",

                          // Vencido
                          isOverdue && "bg-neutral-200/80 text-neutral-800 border-neutral-300 dark:bg-zinc-800/40 dark:text-zinc-300 dark:border-zinc-700",

                          // Fallback
                          !isPaid && !isPending && !isOverdue && "bg-neutral-100 text-neutral-500 border-neutral-200 dark:bg-zinc-900/40 dark:text-zinc-500 dark:border-zinc-800"
                        )}
                      >
                        {/* Indicador visual de estado */}
                        <span
                          className={cn(
                            "w-1.5 h-1.5 rounded-full shrink-0",
                            isPaid && "bg-secondary/40 dark:bg-foreground/90",
                            isPending && "border border-neutral-500 bg-transparent dark:border-zinc-500",
                            isOverdue && "bg-neutral-700 dark:bg-zinc-400",
                            !isPaid && !isPending && !isOverdue && "bg-neutral-400 dark:bg-zinc-600"
                          )}
                        />
                        <span className="translate-y-[-0.5px]">
                          {isPaid ? 'Pagado' : isOverdue ? 'Vencido' : 'Pendiente'}
                        </span>
                      </span>
                    </div>
                  </TableCell>

                  {/* 6. MONTO */}
                  <TableCell className="py-3.5 pr-3 sm:pr-6 text-right font-mono tabular-nums font-semibold text-xs sm:text-sm text-secondary/40 dark:text-foreground/90 whitespace-nowrap">
                    {formatCurrency(expense.amount)}
                  </TableCell>

                  {/* 7. ACCIONES */}
                  <TableCell className="py-3.5 pr-3 sm:pr-6 text-right">
                    <div className="flex justify-end">
                      {!isSummary && <ExpenseActions expenseId={expense.id!} />}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="mt-auto border-t border-border/30 px-4 sm:px-6 py-4 flex w-full justify-center bg-transparent">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}