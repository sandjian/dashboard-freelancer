import { requireUser } from '@/lib/auth-guard';
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
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

  const t = await getTranslations('Overview');

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
          title={t("availableLiquidity")}
          value={formatCurrency(dashboardData.metrics.totalBankARS)}
          subtitle={
            dashboardData.metrics.totalBankUSD > 0
              ? `+ USD ${dashboardData.metrics.totalBankUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
              : "ARS / USD"
          }
          trend={t("activeAccounts")}
          icon={Wallet}
        />

        {/* KPI 2: Ingresos del Mes */}
        <TranslucentImpactCard
          title={t("monthlyIncome")}
          value={formatCurrency(invoiceStats.facturadoAmount)}
          subtitle={`${t("billedVsPending")} ${formatCurrency(invoiceStats.pendienteAmount)}`}
          trend={`${invoiceStats.facturadoCount} ${t("billedVsPending").split(" ")[0].toLowerCase()}`}
          icon={TrendingUp}
        />

        {/* KPI 3: Egresos del Mes */}
        <TranslucentImpactCard
          title={t("monthlyExpenses")}
          value={formatCurrency(expenseStats.totalAmount)}
          subtitle={`${t("fixedCostBase")}: ${formatCurrency(expenseStats.recurringAmount)}`}
          trend={`${expenseStats.totalCount} ${t("monthlyExpenses").toLowerCase()}`}
          icon={TrendingDown}
        />

        {/* KPI 4: Runway Operativo */}
        <TranslucentImpactCard
          title={t("runway")}
          value={`${runwayDecimal} ${t("projectedMonths")}`}
          subtitle={`Burn rate: ${formatCurrency(dashboardData.metrics.burnRate)}`}
          trend={t("projectedMonths")}
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