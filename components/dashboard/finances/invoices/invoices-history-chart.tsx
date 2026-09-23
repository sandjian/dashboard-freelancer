"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, Tooltip, YAxis, TooltipProps } from "recharts"
import { formatCurrency } from "@/lib/utils"
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent"

export interface InvoiceHistoryData {
    name: string;        // Month name (e.g. "Ene")
    month_num: number;
    value: number;       // Total amount
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-[var(--radius-md)] border border-border bg-popover/95 dark:bg-popover/90 p-3 shadow-lg backdrop-blur-md">
                <div className="mb-1 text-xs font-medium text-muted-foreground">{label}</div>
                <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold font-mono text-foreground">
                        {formatCurrency(Number(payload[0].value))}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Ingreso Neto</span>
                </div>
            </div>
        )
    }
    return null
}

export function InvoicesHistoryChart({ data }: { data: InvoiceHistoryData[] }) {
    if (!data || data.length === 0) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <p className="text-sm text-muted-foreground">No hay datos históricos disponibles.</p>
            </div>
        )
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                {/* 
                     XAxis: Shows Month Names
                */}
                <XAxis
                    dataKey="name"
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                />
                <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                    domain={[0, 'auto']}
                />
                <Tooltip
                    content={<CustomTooltip />}
                    cursor={{
                        fill: 'var(--muted)',
                        opacity: 0.35,
                        radius: 6,
                    }}
                />
                <Bar
                    dataKey="value"
                    stroke="none"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                    className="fill-secondary/40 hover:fill-secondary/30 dark:fill-foreground/90 dark:hover:fill-foreground transition-colors duration-200"
                />
            </BarChart>
        </ResponsiveContainer>
    )
}
