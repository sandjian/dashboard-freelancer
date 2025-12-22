import Link from 'next/link';
import { Suspense } from 'react';
import {
  fetchInvoiceStats,
  fetchGlobalOverdueStats, // 👇 1. Importamos la nueva función global
} from '@/lib/data';
import Search from '@/components/ui/search';
import { Button } from '@/components/ui/button';
import { InvoicesTable } from '@/components/dashboard/finances/invoices/invoices-table';
import { InvoiceKpiCard } from '@/components/dashboard/finances/invoices/kpi-card';
import { InvoicesTableSkeleton } from '@/components/ui/skeletons';
import { StatusButtons } from '@/components/dashboard/finances/invoices/status-filter';
import { DateNavigator } from '@/components/dashboard/month-year-selector';

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams?: { year?: string; month?: string; query?:string; page?: string; status?: string; };
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const year = Number(resolvedSearchParams?.year) || new Date().getFullYear();
  const month = Number(resolvedSearchParams?.month) || new Date().getMonth() + 1;
  const query = resolvedSearchParams?.query || '';
  const currentPage = Number(resolvedSearchParams?.page) || 1;
  const status = resolvedSearchParams?.status || "";
  const [ invoiceStats, globalOverdueStats ] = await Promise.all([
    fetchInvoiceStats(year, month),
    fetchGlobalOverdueStats(),
  ]);

  const totalAmount = invoiceStats.totalAmount || 1; 
  const facturadoPercentage = (invoiceStats.facturadoAmount / totalAmount) * 100;
  const pendientePercentage = (invoiceStats.pendienteAmount / totalAmount) * 100;

  return (
    <div className="p-2 space-y-6 w-full max-w-6xl m-auto">
      <div className='flex justify-end '>
        <DateNavigator/>
      </div>
      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4 ">
        <InvoiceKpiCard title="Total" count={invoiceStats.totalCount} amount={invoiceStats.totalAmount} percentage={100} iconName="total" color="info" />
        <InvoiceKpiCard title="Facturadas" count={invoiceStats.facturadoCount} amount={invoiceStats.facturadoAmount} percentage={facturadoPercentage} iconName="facturado" color="success" />
        <InvoiceKpiCard title="Pendientes" count={invoiceStats.pendienteCount} amount={invoiceStats.pendienteAmount} percentage={pendientePercentage} iconName="pendiente" color="warning" />
        <InvoiceKpiCard title="Vencidas" count={globalOverdueStats.count} amount={globalOverdueStats.amount} percentage={100} iconName="vencido" color="danger" />
      </div>
      
      <div className="mt-4 flex items-center justify-between md:mt-8">
        <div className='flex gap-2'>
          <Search placeholder="Buscar por cliente, email" />
          <StatusButtons />
        </div>
        <Button asChild variant={'primary'}>
          <Link href="/dashboard/finances/invoices/create">+ Crear Factura</Link>
        </Button>
      </div>
      <Suspense key={query + currentPage + year + month} fallback={<InvoicesTableSkeleton />}>
        <InvoicesTable 
          query={query} 
          currentPage={currentPage}
          year={year}
          month={month}
          status={status}
        />
      </Suspense>
    </div>
  );
}