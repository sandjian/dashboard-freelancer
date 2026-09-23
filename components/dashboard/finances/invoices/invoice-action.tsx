'use client';

import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
// 1. Importar los nuevos íconos (Eye)
import { MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react';
import { deleteInvoice } from '@/lib/actions';

export function InvoiceActions({ invoiceId }: { invoiceId: string }) {
  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer text-neutral-500">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-popover border-border text-popover-foreground">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border" />

          {/* 2. Nuevo ítem "Ver Detalles" */}
          <DropdownMenuItem asChild className='hover:bg-muted focus:bg-muted transition-colors duration-200 cursor-pointer'>
            <Link href={`/dashboard/finances/invoices/${invoiceId}/details`}>
              <Eye className="mr-2 h-4 w-4" />
              Ver
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className='hover:bg-muted focus:bg-muted transition-colors duration-200 cursor-pointer'>
            <Link href={`/dashboard/finances/invoices/${invoiceId}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </DropdownMenuItem>

          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive focus:bg-destructive/10 hover:bg-destructive/10 transition-colors duration-200 cursor-pointer"
              onSelect={(e) => e.preventDefault()}
            >
              <Trash2 className="mr-2 h-4 w-4 text-danger" />
              Eliminar
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente la
            factura y todos sus ítems.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <form action={deleteInvoice}>
            <input type="hidden" name="id" value={invoiceId} />
            <AlertDialogAction type="submit">Continuar</AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
