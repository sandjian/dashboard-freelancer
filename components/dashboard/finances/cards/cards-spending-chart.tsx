"use client";

import { PieChart as PieChartIcon } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface SpendingData {
    name: string;
    color: string;
    value: number;
}

interface CardsSpendingChartProps {
    data: SpendingData[];
}

const THEME_CHART_COLORS = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
];

export function CardsSpendingChart({ data }: CardsSpendingChartProps) {
    const t = useTranslations("Cards");
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="rounded-[var(--radius)] border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-secondary/40 hover:bg-secondary/30 dark:bg-foreground/90 dark:hover:bg-foreground text-secondary-foreground dark:text-background transition-colors">
                    <PieChartIcon className="w-4 h-4" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-foreground tracking-tight">{t("distributionTitle")}</h3>
                    <p className="text-[11px] text-muted-foreground">{t("distributionSubtitle")}</p>
                </div>
            </div>

            {totalValue === 0 ? (
                <div className="h-[220px] flex items-center justify-center text-xs text-muted-foreground border border-dashed border-border rounded-xl bg-muted/20">
                    {t("noExpensesThisMonth")}
                </div>
            ) : (
                <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={70}
                                paddingAngle={4}
                                dataKey="value"
                                stroke="none"
                                cornerRadius={4}
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={THEME_CHART_COLORS[index % THEME_CHART_COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="rounded-xl border border-border bg-popover/95 p-3 shadow-xl backdrop-blur-md">
                                                <div className="text-xs font-semibold text-foreground mb-1">
                                                    {payload[0].name}
                                                </div>
                                                <div className="text-sm font-mono font-bold text-foreground">
                                                    {formatCurrency(Number(payload[0].value))}
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={32}
                                iconType="circle"
                                wrapperStyle={{ fontSize: "11px" }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}

