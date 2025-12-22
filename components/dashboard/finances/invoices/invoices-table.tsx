
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { fetchFilteredInvoices, fetchInvoicesPages } from '@/lib/data'; // 👈 Asumimos que las acciones están aisladas
import { InvoiceActions } from './invoice-action';
import Pagination from '@/components/ui/pagination';
import { Card } from '@/components/ui/card';

// Define el tipo para las variantes de estado
type StatusVariant = 'success' | 'warning' | 'danger' | 'secondary';

const getStatusVariant = (status: string): StatusVariant => {
  switch (status.toLowerCase()) {
    case 'paid':
    case 'facturado':
      return 'success';
    case 'pending':
    case 'pendiente':
      return 'warning';
    case 'overdue':
    case 'vencido':
      return 'danger';
    default: // Draft / Borrador
      return 'secondary';
  }
};
const formatDate = (date: Date) => new Date(date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' });
const formatTime = (date: Date) => new Date(date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });


// 👇 La función ahora es ASÍNCRONA y recibe los parámetros de búsqueda
export async function InvoicesTable({
  query,
  currentPage,
  year,
  month,
  status,
  
}: {
  query: string;
  currentPage: number;
  year: number;
  month: number;
  status: string;
}) {

const [totalPages, invoices] = await Promise.all([
    fetchInvoicesPages(query, year, month, status),
    fetchFilteredInvoices(query, currentPage, year, month, status)
  ]);



  if (invoices.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center text-muted-foreground">
        No se encontraron facturas para el período seleccionado.
      </div>
    );
  }

  return (
    <Card className='p-2' >
      <Table >
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Emisión</TableHead>
            <TableHead>Vencimiento</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Monto</TableHead>
            <TableHead className="w-[50px]">
              <span className="sr-only">Acciones</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className='m-12'>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id} className='hover:bg-neutral-100/40 transition-colors duration-300 '>
              <TableCell className="">
                <Link
                  href={`/dashboard/finances/invoices/${invoice.id}/details`}
                  className="hover:text-primary"
                >
                  {/* 👇 Añadimos el email debajo del nombre 👇 */}
                  <div>{invoice.name}</div>
                  <div className="text-xs text-muted-foreground">{invoice.email}</div>
                </Link>
              </TableCell>
              <TableCell >
                <div className='text-xs font-semibold'>{formatDate(invoice.issue_date)}</div>
                <div className="text-xs text-muted-foreground">{formatTime(invoice.issue_date)}</div>
              </TableCell>
              <TableCell>
                <div className='text-xs font-semibold'>{formatDate(invoice.due_date)}</div>
                <div className="text-xs text-muted-foreground">{formatTime(invoice.due_date)}</div>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(invoice.status)}>
                  {invoice.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-semibold text-xs">
                {formatCurrency(invoice.amount)}
              </TableCell>
              <TableCell className="text-right">
                {/* Usamos un componente de cliente aislado para las acciones */}
                <InvoiceActions invoiceId={invoice.id} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={6} className="p-0">
              <Pagination totalPages={totalPages} />
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </Card>
  );
}