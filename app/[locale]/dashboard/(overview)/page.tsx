import { requireUser } from '@/lib/auth-guard';
import { Suspense } from "react";
import {
  fetchDashboardData,
  fetchVendors,
  fetchExpenseCategories,
  fetchCards,
  fetchClients,
  fetchInvoiceStats,
  fetchExpenseStats,
  fetchTodayPendingEvents,
  fetchUpcomingDues,
} from "@/lib/data";
import { DashboardHeroHeader } from "@/components/dashboard/overview/dashboard-hero-header";
import { TranslucentImpactCard } from "@/components/dashboard/finances/invoices/translucent-impact-card";
import { UnifiedCashFlowChart } from "@/components/dashboard/overview/unified-cashflow-chart";
import { ConsolidatedRecentActivity } from "@/components/dashboard/overview/consolidated-recent-activity";
import { OperationalFocusPanel } from "@/components/dashboard/overview/operational-focus-panel";
import { formatCurrency } from "@/lib/utils";
import { Wallet, TrendingUp, TrendingDown, Timer } from "lucide-react";

export const metadata = {
  title: "Salud Financiera | Dashboard",
};

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ year?: string; month?: string }>;
}) {
  const user = await requireUser();
  const resolvedParams = await searchParams;
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const year = Number(resolvedParams?.year) || currentYear;
  const month = Number(resolvedParams?.month) || currentMonth;

  const [
    dashboardData,
    invoiceStats,
    expenseStats,
    vendors,
    categories,
    cards,
    clients,
    todayEvents,
    upcomingDues,
  ] = await Promise.all([
    fetchDashboardData(),
    fetchInvoiceStats(year, month),
    fetchExpenseStats(year, month),
    fetchVendors(),
    fetchExpenseCategories(),
    fetchCards(),
    fetchClients(),
    fetchTodayPendingEvents(),
    fetchUpcomingDues(),
  ]);

  const runwayMonths = Math.floor(dashboardData.metrics.runway);
  const runwayDecimal = (dashboardData.metrics.runway).toFixed(1);

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 min-h-screen text-foreground">
      {/* 1. Hero Header & Quick Registration Actions */}
      <DashboardHeroHeader
        vendors={vendors}
        categories={categories}
        cards={cards}
        clients={clients}
      />

      {/* 2. Top KPIs: 4 Compact TranslucentImpactCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {/* KPI 1: Liquidez Disponible */}
        <TranslucentImpactCard
          title="Liquidez Disponible"
          value={formatCurrency(dashboardData.metrics.totalBankARS)}
          subtitle={
            dashboardData.metrics.totalBankUSD > 0
              ? `+ USD ${dashboardData.metrics.totalBankUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
              : "Saldo total en cuentas bancarias"
          }
          trend="Cuentas activas"
          icon={Wallet}
        />

        {/* KPI 2: Ingresos del Mes */}
        <TranslucentImpactCard
          title="Ingresos del Mes"
          value={formatCurrency(invoiceStats.facturadoAmount)}
          subtitle={`Cobrado vs. ${formatCurrency(invoiceStats.pendienteAmount)} pend.`}
          trend={`${invoiceStats.facturadoCount} cobradas`}
          icon={TrendingUp}
        />

        {/* KPI 3: Egresos del Mes */}
        <TranslucentImpactCard
          title="Egresos del Mes"
          value={formatCurrency(expenseStats.totalAmount)}
          subtitle={`Fijos: ${formatCurrency(expenseStats.recurringAmount)}`}
          trend={`${expenseStats.totalCount} gastos`}
          icon={TrendingDown}
        />

        {/* KPI 4: Runway Operativo */}
        <TranslucentImpactCard
          title="Runway Operativo"
          value={`${runwayDecimal} meses`}
          subtitle={`Burn rate prom: ${formatCurrency(dashboardData.metrics.burnRate)}/mes`}
          trend="Cobertura estimada"
          icon={Timer}
        />
      </div>

      {/* 3. Main Operational Layout (68% / 32%) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Columna Principal (~68%): Gráfico de Flujo de Caja + Actividad Reciente */}
        <div className="xl:col-span-8 space-y-6 sm:space-y-8">
          <UnifiedCashFlowChart
            data={dashboardData.chartData}
            baseline={dashboardData.metrics.burnRate}
          />

          <ConsolidatedRecentActivity
            activity={dashboardData.recentActivity}
          />
        </div>

        {/* Columna Lateral (~32%): Panel de Foco Operativo */}
        <div className="xl:col-span-4 space-y-6">
          <OperationalFocusPanel
            todayEvents={todayEvents}
            upcomingDues={upcomingDues}
          />
        </div>
      </div>
    </div>
  );
}