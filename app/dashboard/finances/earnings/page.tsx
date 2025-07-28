import {
  fetchFilteredEarnings, // Cambiado
  fetchEarningsPages,   // Nuevo
  fetchTotalEarnings,
  fetchPendingEarnings,
  fetchEarningsByClient,
  fetchMonthlyRevenue,
  fetchCurrencyBalance,
  fetchForecastedEarnings
} from '@/lib/data';
import { Earning } from '@/lib/definitions';

// Importamos los componentes
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EarningsKpiCards } from '@/components/dashboard/earnings/kpi-cards';
import { EarningsTableWrapper } from '@/components/dashboard/earnings/earnings-table';
import { EarningsByClientChart } from '@/components/dashboard/earnings/earnings-by-client-chart';
import { RecurringEarningsSection } from '@/components/dashboard/earnings/recurring-earnings';
import { RevenueChart } from '@/components/dashboard/earnings/revenue-chart';
import Pagination from '@/components/ui/pagination';

export default async function EarningsPage({
  searchParams,
}: {
  searchParams?: { year?: string; month?: string; query?: string; page?: string; };
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const year = Number(resolvedSearchParams?.year) || new Date().getFullYear();
  const month = Number(resolvedSearchParams?.month) || new Date().getMonth() + 1;
  const query = resolvedSearchParams?.query || '';
  const currentPage = Number(resolvedSearchParams?.page) || 1;

  const [
    totalPages,
    monthlyEarnings,
    totalEarningsMonth,
    pendingEarnings,
    forecastedEarnings,
    usdBalance,
    earningsByClient,
    historicalRevenue
  ] = await Promise.all([
    fetchEarningsPages(year, month, query),
    fetchFilteredEarnings(year, month, query, currentPage),
    fetchTotalEarnings(year, month),
    fetchPendingEarnings(),
    fetchForecastedEarnings(year,month),
    fetchCurrencyBalance('USD'),
    fetchEarningsByClient(year, month),
    fetchMonthlyRevenue()
  ]);

  const getBadgeVariant = (status: Earning['status']) => {
    switch (status) {
      case 'Facturado': return 'success';
      case 'Por cobrar': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Análisis de Ingresos</h1>
      
      <EarningsKpiCards 
        totalMonth={totalEarningsMonth}
        pending={pendingEarnings}
        forecast={forecastedEarnings}
        usdBalance={usdBalance}
      />


      {/* --- PRIMERA FILA DE GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 flex flex-col justify-between">
          <EarningsTableWrapper data={monthlyEarnings} getBadgeVariant={getBadgeVariant} />
          <div className="mt-4 flex w-full justify-center">
            <Pagination totalPages={totalPages} />
          </div>
        </div>
        <div className="lg:col-span-2">
          <EarningsByClientChart data={earningsByClient} />
        </div>
      </div>

      {/* --- SEGUNDA FILA DE GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
         <div className="lg:col-span-3">
           <RecurringEarningsSection />
         </div>
         <div className="lg:col-span-2">
            <Card>
              <CardHeader><CardTitle>Ingresos Históricos</CardTitle></CardHeader>
              <CardContent className="h-[350px]">
                <RevenueChart data={historicalRevenue} />
              </CardContent>
            </Card>
         </div>
      </div>
    </div>
  );
}