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
import { deleteEarning } from '@/lib/actions';

// El componente recibe el ID del ingreso como prop
export function EarningActions({ earningId }: { earningId: string }) {
  return (
    // La estructura correcta es tener el DropdownMenu como componente principal
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menú</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href={`/dashboard/finances/earnings/${earningId}/edit`}>
          <DropdownMenuItem>
            Editar
          </DropdownMenuItem>
        </Link>
        
        {/* El AlertDialog se instancia solo para la acción de eliminar */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              className="text-red-500"
              // Esta línea es crucial: previene que el menú se cierre al abrir el diálogo
              onSelect={(e) => e.preventDefault()}
            >
              Eliminar
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente
                el ingreso de tus registros.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <form action={deleteEarning}>
                <input type="hidden" name="id" value={earningId} />
                <AlertDialogAction type="submit">Continuar</AlertDialogAction>
              </form>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </DropdownMenuContent>
    </DropdownMenu>
  );
}