'use client';

import Link from 'next/link';
import type { RecurringTransaction } from '@/lib/definitions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { MoreHorizontal } from 'lucide-react';
import { deleteRecurringTransaction } from '@/lib/actions';

export function RecurringTable({ title, data, type }: { title: string, data: RecurringTransaction[], type: 'earning' | 'expense' }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Concepto</TableHead>
              {type === 'earning' ? <TableHead>Cliente</TableHead> : <TableHead>Categoría</TableHead>}
              <TableHead>Día del Mes</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead><span className="sr-only">Acciones</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.concept}</TableCell>
                {type === 'earning' ? <TableCell>{item.client || '-'}</TableCell> : <TableCell>{item.category || '-'}</TableCell>}
                <TableCell>{item.dayOfMonth}</TableCell>
                <TableCell className="text-right">
                  {new Intl.NumberFormat('es-AR', { style: 'currency', currency: item.currency || 'ARS' }).format(item.amount)}
                </TableCell>
                <TableCell className="text-right">
                  {/* 👇 CÓDIGO DE ACCIONES AÑADIDO 👇 */}
                  <AlertDialog>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <Link href={`/dashboard/recurring/${item.id}/edit`}>
                          <DropdownMenuItem>Editar</DropdownMenuItem>
                        </Link>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem className="text-red-500" onSelect={(e) => e.preventDefault()}>
                            Eliminar
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción eliminará permanentemente esta plantilla recurrente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <form action={deleteRecurringTransaction}>
                          <input type="hidden" name="id" value={item.id} />
                          <AlertDialogAction type="submit">Continuar</AlertDialogAction>
                        </form>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}