'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { ClientWithStats } from '@/lib/definitions';
import { ClientActions } from './clients-actions';
import Link from 'next/link';

export function ClientsTable({ clients }: { clients: ClientWithStats[] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Marca</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-center">Nº Facturas</TableHead>
            <TableHead><span className="sr-only">Acciones</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell className="font-medium"><Link href={`/dashboard/finances/clients/${client.id}`}>{client.brand}</Link></TableCell>
              <TableCell>{client.name}</TableCell>
              <TableCell>{client.email || '-'}</TableCell>
              <TableCell className="text-center">{client.total_invoices}</TableCell>
              <TableCell className="text-right">
                <ClientActions client={client} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}