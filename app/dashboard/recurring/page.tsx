import { fetchRecurringTransactions } from '@/lib/data';
import { RecurringTable } from '@/components/dashboard/recurring/table';
import { CreateRecurringForm } from '@/components/dashboard/recurring/create-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default async function RecurringPage() {
  // Llamamos a la función dos veces, en paralelo para mayor eficiencia
  const [recurringEarnings, recurringExpenses] = await Promise.all([
    fetchRecurringTransactions('earning'),
    fetchRecurringTransactions('expense'),
  ]);

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Transacciones Recurrentes</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Añadir Nueva</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Plantilla Recurrente</DialogTitle>
            </DialogHeader>
            <CreateRecurringForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Renderizamos las dos tablas por separado */}
      <div className="space-y-8">
        <RecurringTable type='earning' title="Ingresos Fijos" data={recurringEarnings} />
        <RecurringTable type='expense' title="Gastos Fijos" data={recurringExpenses} />
      </div>
    </div>
  );
}