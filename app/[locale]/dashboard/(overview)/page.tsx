import { requireUser } from '@/lib/auth-guard';
import { Suspense } from "react";
import { DashboardHeroWrapper, DashboardHeroHeaderSkeleton } from "@/components/dashboard/overview/dashboard-hero-wrapper";
import { OverviewKpisWrapper } from "@/components/dashboard/overview/overview-kpis-wrapper";
import { CashFlowChartWrapper } from "@/components/dashboard/overview/cashflow-chart-wrapper";
import { RecentActivityWrapper } from "@/components/dashboard/overview/recent-activity-wrapper";
import { OperationalFocusWrapper } from "@/components/dashboard/overview/operational-focus-wrapper";
import {
  TranslucentImpactCardsGridSkeleton,
  CashFlowChartSkeleton,
  RecentActivitySkeleton,
  OperationalFocusSkeleton,
} from "@/components/dashboard/skeletons";

export const metadata = {
  title: "Salud Financiera | Dashboard",
};

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ year?: string; month?: string }>;
}) {
  await requireUser();
  const resolvedParams = await searchParams;
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const year = Number(resolvedParams?.year) || currentYear;
  const month = Number(resolvedParams?.month) || currentMonth;

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 min-h-screen text-foreground">
      {/* 1. Hero Header & Quick Registration Actions */}
      <Suspense fallback={<DashboardHeroHeaderSkeleton />}>
        <DashboardHeroWrapper />
      </Suspense>

      {/* 2. Top KPIs: 4 Compact TranslucentImpactCards */}
      <Suspense key={`${year}-${month}`} fallback={<TranslucentImpactCardsGridSkeleton count={4} />}>
        <OverviewKpisWrapper year={year} month={month} />
      </Suspense>

      {/* 3. Main Operational Layout (68% / 32%) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Columna Principal (~68%): Gráfico de Flujo de Caja + Actividad Reciente */}
        <div className="xl:col-span-8 space-y-6 sm:space-y-8">
          <Suspense fallback={<CashFlowChartSkeleton />}>
            <CashFlowChartWrapper />
          </Suspense>

          <Suspense fallback={<RecentActivitySkeleton />}>
            <RecentActivityWrapper />
          </Suspense>
        </div>

        {/* Columna Lateral (~32%): Panel de Foco Operativo */}
        <div className="xl:col-span-4 space-y-6">
          <Suspense fallback={<OperationalFocusSkeleton />}>
            <OperationalFocusWrapper />
          </Suspense>
        </div>
      </div>
    </div>
  );
}