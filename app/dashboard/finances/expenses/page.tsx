import {
  // 👇 1. Reemplazamos 'fetchTotalExpenses' por las nuevas funciones
  fetchExpenseStats,
  fetchVendors,
  fetchExpenseCategories,
  fetchCards,
  fetchCardPaymentsDueForMonth,
} from '@/lib/data';
import Search from '@/components/ui/search';
import { Button } from '@/components/ui/button';
import { ExpensesTable } from '@/components/dashboard/finances/expenses/expenses-table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreateExpenseForm } from '@/components/dashboard/finances/expenses/create-form';
import { Suspense } from 'react';
import { ExpensesTableSkeleton } from '@/components/ui/skeletons';
import { DateNavigator } from '@/components/dashboard/month-year-selector';
// 👇 2. Reutilizamos el componente KpiCard de Invoices (podemos renombrarlo a KpiCard en el futuro)
import { InvoiceKpiCard } from '@/components/dashboard/finances/invoices/kpi-card';
import { ExpenseStatusButtons } from '@/components/dashboard/finances/expenses/status-filter';

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams?: { 
    year?: string; 
    month?: string; 
    query?: string; 
    page?: string;
    categoryId?: string;
    status?: string;
  };
}) {

  console.log('--- INICIO DE RENDERIZADO EN SERVIDOR ---');
  console.log('[SERVIDOR - ExpensesPage] searchParams recibidos:', searchParams);
 const resolvedSearchParams = await Promise.resolve(searchParams);

  // 👇 2. Ahora, leemos de la caja abierta (el objeto resuelto)
  const year = Number(resolvedSearchParams?.year) || new Date().getFullYear();
  const month = Number(resolvedSearchParams?.month) || new Date().getMonth() + 1;
  const query = resolvedSearchParams?.query || '';
  const currentPage = Number(resolvedSearchParams?.page) || 1;
  const categoryId = resolvedSearchParams?.categoryId || null;
  const status = resolvedSearchParams?.status || null;


  console.log(`[SERVIDOR - ExpensesPage] Valor de 'status' interpretado:`, status);
  console.log(`[SERVIDOR - ExpensesPage] Valor de 'categoryId' interpretado:`, categoryId);

  // 👇 3. Llamamos a las nuevas funciones para obtener las estadísticas
  const [
    expenseStats,
    cardPaymentsDue,
    vendors,
    categories,
    cards
  ] = await Promise.all([
    fetchExpenseStats(year, month),
    fetchCardPaymentsDueForMonth(year, month),
    fetchVendors(),
    fetchExpenseCategories(),
    fetchCards(),
  ]);

  
  // Calculamos los porcentajes para los KPIs mensuales
  const totalAmount = expenseStats.totalAmount || 1; 
  const recurringPercentage = (expenseStats.recurringAmount / totalAmount) * 100;
  const pendingPercentage = (expenseStats.pendingAmount / totalAmount) * 100;

  return (
    <div className="p-4 w-full m-auto max-w-6xl space-y-6">
      <div className='flex justify-end'>
        <DateNavigator/>
      </div>

      {/* 👇 4. Renderizamos la nueva grilla de KPIs */}
      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
        <InvoiceKpiCard title="Gasto Mensual" count={expenseStats.totalCount} amount={expenseStats.totalAmount} percentage={100} iconName="total" color="info" />
        <InvoiceKpiCard title="Gastos Recurrentes" count={expenseStats.recurringCount} amount={expenseStats.recurringAmount} percentage={recurringPercentage} iconName="facturado" color="success" />
        <InvoiceKpiCard title="Gastos Pendientes" count={expenseStats.pendingCount} amount={expenseStats.pendingAmount} percentage={pendingPercentage} iconName="pendiente" color="warning" />
        <InvoiceKpiCard 
          title="Vencimiento Tarjetas (Mes)" 
          count={cardPaymentsDue.count} 
          amount={cardPaymentsDue.amount} 
          iconName="vencido" // Podemos cambiar el ícono a una tarjeta más adelante
          color="danger" 
        />
      </div>

      <div className="flex justify-between items-center ">
       <div className=" flex items-center justify-between gap-2 ">
        <div className='flex gap-2'>
          <Search placeholder="Buscar ..." />
          <ExpenseStatusButtons />
        </div>
        {/* El botón de "Añadir Gasto" ya lo tienes en el div de arriba,
            así que no lo repetimos aquí para mantener la UI limpia. */}
      </div>
       
        <Dialog>
          <DialogTrigger asChild className='flex justify-center items-center'>
            <Button variant={'primary'} className='cursor-pointer'>+ Añadir Gasto</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className='text-black/70'>Crear Nuevo Gasto</DialogTitle>
              <DialogDescription>Rellena los campos para registrar un nuevo gasto.</DialogDescription>
            </DialogHeader>
            <CreateExpenseForm vendors={vendors} categories={categories} cards={cards} />
          </DialogContent>
        </Dialog>
      
      </div>
      
      


      <Suspense key={query + currentPage + year + month + categoryId + status} fallback={<ExpensesTableSkeleton />}>
        <ExpensesTable
          query={query}
          currentPage={currentPage}
          year={year}
          month={month}
          categoryId={categoryId}
          status={status} // 👈 Le pasamos el nuevo filtro a la tabla
        />
      </Suspense>
    </div>
  );
}