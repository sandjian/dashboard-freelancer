import { 
  fetchTotalEarnings, 
  fetchTotalExpenses, 
  fetchPendingEarnings, 
  fetchMonthlyRevenue 
} from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RevenueChart } from '@/components/dashboard/earnings/revenue-chart';

export default async function OverviewPage({
  searchParams,
}: {
  searchParams?: {
    year?: string;
    month?: string;
  };
}) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  // Solución para el error de 'searchParams'
  const resolvedSearchParams = await Promise.resolve(searchParams);

  // Leemos de la variable resuelta o usamos los valores por defecto
  const year = Number(resolvedSearchParams?.year) || currentYear;
  const month = Number(resolvedSearchParams?.month) || currentMonth;

  // Llamamos a las funciones de datos en paralelo
  const [
    totalEarnings, 
    totalExpenses, 
    pendingEarnings, 
    monthlyRevenue
  ] = await Promise.all([
    fetchTotalEarnings(year, month),
    fetchTotalExpenses(year, month),
    fetchPendingEarnings(),
    fetchMonthlyRevenue(),
  ]);

  const netProfit = totalEarnings - totalExpenses;

  return (
    <>
      <h1 className="text-2xl font-semibold mb-6">Resumen General</h1>
      
      {/* SECCIÓN DE KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancia Neta</CardTitle>
            <span className="text-green-500">📊</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(netProfit)}
            </div>
            <p className="text-xs text-muted-foreground">Del mes seleccionado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos (Cobrados)</CardTitle>
            <span className="text-blue-500">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(totalEarnings)}
            </div>
            <p className="text-xs text-muted-foreground">Del mes seleccionado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos</CardTitle>
            <span className="text-red-500">💸</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">Del mes seleccionado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Por Cobrar</CardTitle>
            <span className="text-orange-500">⏳</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(pendingEarnings)}
            </div>
            <p className="text-xs text-muted-foreground">Total histórico pendiente</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
            <CardHeader>
                <CardTitle>Ingresos vs. Gastos (Histórico)</CardTitle>
            </CardHeader>
            <CardContent>
                <RevenueChart data={monthlyRevenue} />
            </CardContent>
        </Card>
      </div>
    </>
  );
}