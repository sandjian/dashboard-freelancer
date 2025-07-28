import { fetchRecurringTransactions } from '@/lib/data';
import { RecurringTable } from '../recurring/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreateRecurringForm } from '../recurring/create-form'; 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export async function RecurringEarningsSection() {
  // Buscamos solo las plantillas de tipo 'earning'
  const recurringEarnings = await fetchRecurringTransactions('earning');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Plantillas de Ingresos Fijos</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">Añadir Plantilla</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Plantilla de Ingreso Fijo</DialogTitle>
            </DialogHeader>
            <CreateRecurringForm />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <RecurringTable 
        title='Ingresos fijos'
          data={recurringEarnings} 
          type="earning" 
        />
      </CardContent>
    </Card>
  );
}