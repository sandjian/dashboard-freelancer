"use client"

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { formatCurrency } from "@/lib/utils"

// Theme chart palette
const COLORS = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
]

import { TooltipProps } from "recharts";
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { useTranslations } from "next-intl";

const CustomTooltip = ({ active, payload, labelText }: TooltipProps<ValueType, NameType> & { labelText?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border border-border bg-popover p-3 shadow-xl backdrop-blur-md">
                <div className="mb-1 text-xs font-medium text-foreground">{payload[0].name}</div>
                <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold text-primary">
                        {formatCurrency(Number(payload[0].value))}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{labelText || 'Facturado'}</span>
                </div>
            </div>
        )
    }
    return null
}

export function TopClientsChart({ data }: { data: { name: string; value: number }[] }) {
    const t = useTranslations('Invoices');

    if (!data || data.length === 0) {
        return (
            <div className="flex h-[200px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/20">
                <p className="text-xs text-muted-foreground">{t('noClientsThisMonth')}</p>
            </div>
        )
    }

    return (
        <div className="h-[200px] w-full">
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
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                                className="transition-all duration-300 hover:opacity-80"
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip labelText={t('filterPaid')} />} />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        iconSize={6}
                        formatter={(value) => <span className="text-[10px] font-medium text-muted-foreground">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}
