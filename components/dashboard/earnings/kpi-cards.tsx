import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { ArrowTrendingUpIcon, BanknotesIcon, ClockIcon,  CurrencyDollarIcon } from '@heroicons/react/24/outline';

// 👇 CORRECCIÓN: Definimos las props que la página le va a pasar
interface KpiCardsProps {
  totalMonth: number;
  pending: number;
  forecast: number;
  usdBalance: number;
}

// 👇 CORRECCIÓN: Usamos las props definidas
export function EarningsKpiCards({ totalMonth, pending, forecast, usdBalance }: KpiCardsProps) {

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
          <BanknotesIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalMonth)}</div>
          <p className="text-xs text-muted-foreground">Total facturado en el período</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Por Cobrar</CardTitle>
          <ClockIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(pending)}</div>
          <p className="text-xs text-muted-foreground">Total histórico pendiente</p>
        </CardContent>
      </Card>
      
        <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pronosticado del Mes</CardTitle>
          <ArrowTrendingUpIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(forecast)}</div>
          <p className="text-xs text-muted-foreground">Facturado + Por Cobrar del mes</p>
        </CardContent>
      
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Balance USD</CardTitle>
          <CurrencyDollarIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(usdBalance, 'USD')}</div>
          <p className="text-xs text-muted-foreground">Balance total histórico</p>
        </CardContent>
      </Card>
    </div>
  );
}