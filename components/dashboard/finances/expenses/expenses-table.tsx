import { fetchFilteredExpenses, fetchExpensesPages } from '@/lib/data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { ExpenseActions } from './expenses-actions';
import Pagination from '@/components/ui/pagination';

const getStatusVariant = (status: string) => {
  if (status === 'pagado') return 'success';
  if (status === 'pendiente') return 'warning';
  return 'secondary';
};

const getExpenseTypeBadge = (
  expenseType: string,
  parentExpenseId: string | null,
  isRecurring: boolean,
  totalInstallments: number
) => {
  // Solo mostrar "Recurrente" para gastos recurrentes reales (no cuotas)
  if (expenseType === 'recurring_generated' || expenseType === 'recurring_original') {
    return (
      <Badge variant="secondary" className="ml-2 bg-blue-50 text-blue-700 border-blue-200 text-xs">
        Recurrente
      </Badge>
    );
  }

  // Mostrar badge diferente para cuotas
  if (expenseType === 'installment' && totalInstallments > 1) {
    return (
      <Badge variant="secondary" className="ml-2 bg-green-50 text-green-700 border-green-200 text-xs">
        Cuota
      </Badge>
    );
  }

  return null;
};

export async function ExpensesTable({
  query,
  currentPage,
  year,
  month,
  categoryId,
  status,
}: {
  query: string;
  currentPage: number;
  year: number;
  month: number;
  categoryId: string | null;
  status: string | null;
}) {
  console.log('[SERVIDOR - ExpensesTable] Props recibidos:', { query, currentPage, year, month, categoryId, status });

  const [expenses, totalPages] = await Promise.all([
    fetchFilteredExpenses(query, currentPage, year, month, categoryId, status),
    fetchExpensesPages(query, year, month, categoryId, status),
  ]);

  if (expenses.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center text-muted-foreground">
        No se encontraron gastos para los filtros seleccionados.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Concepto</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Método de Pago</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead><span className="sr-only">Acciones</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{new Date(expense.expense_date).toLocaleDateString('es-AR')}</TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {expense.concept}
                    {getExpenseTypeBadge(
                      expense.expense_type,
                      expense.parent_expense_id,
                      expense.is_recurring,
                      expense.total_installments
                    )}
                  </div>
                </TableCell>
                <TableCell>{expense.category_name}</TableCell>
                <TableCell>
                  {expense.payment_method}
                  {expense.total_installments > 1 && (
                    <span className="text-xs text-muted-foreground ml-1">
                      ({expense.current_installment}/{expense.total_installments})
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(expense.status)}>
                    {expense.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                <TableCell className="text-right">
                  <ExpenseActions expenseId={expense.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}