'use client';

import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import type { Invoice } from '@/lib/definitions';

// Función para determinar el color del badge según el estado
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


export function ClientInvoicesTable({ invoices }: { invoices: Invoice[] }) {
  if (invoices.length === 0) {
    return <p className="text-sm text-muted-foreground">Este cliente no tiene facturas todavía.</p>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nº Factura</TableHead>
            <TableHead>Fecha Emisión</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Monto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">
                <Link 
                  href={`/dashboard/finances/invoices/${invoice.id}/details`}
                  className="text-primary hover:underline"
                >
                  #{invoice.invoice_number}
                </Link>
              </TableCell>
              <TableCell>{new Date(invoice.issue_date).toLocaleDateString('es-AR')}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(invoice.status)}>
                  {invoice.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">{formatCurrency(invoice.amount, invoice.currency)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}