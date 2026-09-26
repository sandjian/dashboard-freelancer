import { fetchDashboardData } from "@/lib/data";
import { UnifiedCashFlowChart } from "@/components/dashboard/overview/unified-cashflow-chart";

export async function CashFlowChartWrapper() {
    const dashboardData = await fetchDashboardData();

    return (
        <UnifiedCashFlowChart
            data={dashboardData.chartData}
            baseline={dashboardData.metrics.burnRate}
        />
    );
}
