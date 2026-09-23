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
import { MoreHorizontal } from 'lucide-react';
import { deleteExpense } from '@/lib/actions';

export function ExpenseActions({ expenseId }: { expenseId: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
          <span className="sr-only">Abrir menú</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover border-border text-popover-foreground">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem asChild className="hover:bg-muted focus:bg-muted cursor-pointer">
          <Link href={`/dashboard/finances/expenses/${expenseId}/edit`}>
            Editar
          </Link>
        </DropdownMenuItem>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive focus:bg-destructive/10 hover:bg-destructive/10 cursor-pointer"
              onSelect={(e) => e.preventDefault()}
            >
              Eliminar
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-card border-border text-foreground">
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                Esta acción no se puede deshacer. Esto eliminará permanentemente este gasto.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-border bg-transparent hover:bg-muted text-foreground">Cancelar</AlertDialogCancel>
              <form action={deleteExpense}>
                <input type="hidden" name="id" value={expenseId} />
                <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:text-white" type="submit">Continuar</AlertDialogAction>
              </form>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}