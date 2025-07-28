import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { CreateExpensesForm } from "@/components/dashboard/expenses/create-form";
import { fetchExpenses, fetchTotalExpenses } from "@/lib/data"; // Importamos fetchTotalExpenses
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { deleteExpense } from "@/lib/actions";
import Link from "next/link";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams?: { year?: string; month?: string; };
}) {
  // 👇 LA SOLUCIÓN: Resolvemos los searchParams asíncronamente
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const year = Number(resolvedSearchParams?.year) || new Date().getFullYear();
  const month = Number(resolvedSearchParams?.month) || new Date().getMonth() + 1;

  const [expenses, totalExpenses] = await Promise.all([
    fetchExpenses(year, month), // Pasa el mes y año a la función
    fetchTotalExpenses(year, month),
  ]);
  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* SECCIÓN DE KPIs (Ahora con datos dinámicos) */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gastado (Mes)</CardTitle>
            <span className="text-red-500">💸</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">Gastos del mes seleccionado</p>
          </CardContent>
        </Card>
        {/* Nota: La card de "Gastos en comida" sigue siendo un placeholder. 
            Podríamos crear una función específica para ello más adelante. */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos en comida</CardTitle>
            <span className="text-orange-500">🍔</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$195,000.00</div>
            <p className="text-xs text-muted-foreground">2% vs mes pasado</p>
          </CardContent>
        </Card>
      </div>

      {/* SECCIÓN DE ACCIONES Y TÍTULO */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Gastos</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Añadir Gasto</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Gasto</DialogTitle>
            </DialogHeader>
            <CreateExpensesForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* TABLA DE GASTOS */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Concepto</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead>
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="font-medium">{expense.concept}</TableCell>
                <TableCell>{expense.category}</TableCell>
                <TableCell>{expense.expenseDate.toLocaleDateString('es-AR')}</TableCell>
                <TableCell className="text-right">
                  {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(expense.amount)}
                </TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <Link href={`/dashboard/expenses/${expense.id}/edit`}>
                          <DropdownMenuItem>Editar</DropdownMenuItem>
                        </Link>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem className="text-red-500">Eliminar</DropdownMenuItem>
                        </AlertDialogTrigger>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Esto eliminará permanentemente el gasto de tus registros.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <form action={deleteExpense}>
                          <input type="hidden" name="id" value={expense.id} />
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