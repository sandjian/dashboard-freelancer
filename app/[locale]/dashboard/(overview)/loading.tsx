import {
  TranslucentImpactCardsGridSkeleton,
  CashFlowChartSkeleton,
  RecentActivitySkeleton,
  OperationalFocusSkeleton,
} from "@/components/dashboard/skeletons";
import { DashboardHeroHeaderSkeleton } from "@/components/dashboard/overview/dashboard-hero-wrapper";

export default function Loading() {
  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 min-h-screen text-foreground">
      {/* 1. Hero Header Skeleton */}
      <DashboardHeroHeaderSkeleton />

      {/* 2. Top KPIs Skeleton */}
      <TranslucentImpactCardsGridSkeleton count={4} />

      {/* 3. Main Operational Layout Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Columna Principal (~68%) */}
        <div className="xl:col-span-8 space-y-6 sm:space-y-8">
          <CashFlowChartSkeleton />
          <RecentActivitySkeleton />
        </div>

        {/* Columna Lateral (~32%) */}
        <div className="xl:col-span-4 space-y-6">
          <OperationalFocusSkeleton />
        </div>
      </div>
    </div>
  );
}