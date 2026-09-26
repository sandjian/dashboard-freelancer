"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTranslations } from "next-intl";

const COLORS = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
];

interface CategoryStat {
    name: string;
    value: number;
}

export function ExpensesCategoryChart({ data }: { data: CategoryStat[] }) {
    const t = useTranslations('Expenses');

    if (!data || data.length === 0) {
        return (
            <Card className="bg-transparent border-0 shadow-none h-full">
                <CardHeader className="p-0 pb-4">
                    <CardTitle className="text-sm font-semibold text-foreground">{t('distributionByCategory')}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[250px]">
                    <p className="text-sm text-muted-foreground">{t('noDistributionData')}</p>
                </CardContent>
            </Card>
        );
    }

    // Filter out zero values just in case
    const activeData = data.filter(d => d.value > 0);

    return (
        <Card className="bg-transparent border-0 shadow-none h-full">
            <CardContent className="h-full w-full p-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={activeData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {activeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="rounded-[var(--radius-md)] border border-border bg-popover/95 dark:bg-popover/90 p-3 shadow-lg backdrop-blur-md">
                                            <div className="mb-1 text-xs font-medium text-muted-foreground">{payload[0].name}</div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-sm font-bold font-mono text-foreground">
                                                    {formatCurrency(payload[0].value as number)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            align="center"
                            iconSize={8}
                            iconType="circle"
                            wrapperStyle={{ paddingTop: '10px' }}
                            formatter={(value) => <span className="text-[10px] font-medium text-muted-foreground">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
