import { getTranslations } from "next-intl/server";
import { fetchDashboardData, fetchInvoiceStats, fetchExpenseStats } from "@/lib/data";
import { TranslucentImpactCard } from "@/components/dashboard/finances/invoices/translucent-impact-card";
import { formatCurrency } from "@/lib/utils";
import { Wallet, TrendingUp, TrendingDown, Timer } from "lucide-react";

export async function OverviewKpisWrapper({
    year,
    month,
}: {
    year: number;
    month: number;
}) {
    const [dashboardData, invoiceStats, expenseStats, t] = await Promise.all([
        fetchDashboardData(),
        fetchInvoiceStats(year, month),
        fetchExpenseStats(year, month),
        getTranslations("Overview"),
    ]);

    const runwayDecimal = dashboardData.metrics.runway.toFixed(1);

    return (
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
    );
}
