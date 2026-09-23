"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react"

import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { cn, formatCurrency } from "@/lib/utils"

interface UnifiedCashFlowChartProps {
    data: {
        name: string
        income: number
        expense: number
        baseline?: number
    }[]
    baseline?: number
}

export function UnifiedCashFlowChart({ data, baseline }: UnifiedCashFlowChartProps) {
    const chartConfig = {
        income: {
            label: "Ingresos",
            color: "var(--foreground)",
        },
        expense: {
            label: "Egresos",
            color: "var(--muted-foreground)",
        },
    } satisfies ChartConfig

    const totalIncome = data.reduce((acc, curr) => acc + curr.income, 0)
    const totalExpense = data.reduce((acc, curr) => acc + curr.expense, 0)

    const [activeSeries, setActiveSeries] = React.useState<"both" | "income" | "expense">("both")

    return (
        <div className="rounded-[var(--radius)] bg-card border border-border p-4 sm:p-6 shadow-sm overflow-hidden">
            {/* Header with Title and Mode selectors */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-border/70 gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-secondary/40 hover:bg-secondary/30 dark:bg-foreground/90 dark:hover:bg-foreground text-secondary-foreground dark:text-background transition-colors">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground tracking-tight">
                            Flujo de Caja (Cash Flow)
                        </h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Comparativa histórica de ingresos cobrados vs. gastos operativos
                    </p>
                </div>

                {/* Filter toggles */}
                <div className="flex items-center rounded-lg border border-border bg-muted/40 p-1 text-xs">
                    <button
                        onClick={() => setActiveSeries("both")}
                        className={cn(
                            "px-3 py-1 rounded-md font-medium transition-all cursor-pointer",
                            activeSeries === "both"
                                ? "bg-card text-foreground shadow-xs"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Ambos
                    </button>
                    <button
                        onClick={() => setActiveSeries("income")}
                        className={cn(
                            "px-3 py-1 rounded-md font-medium transition-all cursor-pointer",
                            activeSeries === "income"
                                ? "bg-card text-foreground shadow-xs"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Ingresos
                    </button>
                    <button
                        onClick={() => setActiveSeries("expense")}
                        className={cn(
                            "px-3 py-1 rounded-md font-medium transition-all cursor-pointer",
                            activeSeries === "expense"
                                ? "bg-card text-foreground shadow-xs"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Egresos
                    </button>
                </div>
            </div>

            {/* Metrics Mini-Row */}
            <div className="grid grid-cols-2 divide-x divide-border/60 py-3 border-b border-border/50 text-xs">
                <div className="pr-4">
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                        <ArrowUpRight className="w-3.5 h-3.5 text-foreground" />
                        Total Ingresos (Período)
                    </span>
                    <p className="text-lg font-bold font-mono text-foreground mt-0.5">
                        {formatCurrency(totalIncome)}
                    </p>
                </div>
                <div className="pl-4">
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                        <ArrowDownRight className="w-3.5 h-3.5 text-muted-foreground" />
                        Total Egresos (Período)
                    </span>
                    <p className="text-lg font-bold font-mono text-muted-foreground mt-0.5">
                        {formatCurrency(totalExpense)}
                    </p>
                </div>
            </div>

            {/* Chart Area */}
            <div className="pt-4">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[300px] w-full"
                >
                    <AreaChart
                        data={data}
                        margin={{
                            left: 0,
                            right: 12,
                            top: 10,
                            bottom: 0,
                        }}
                    >
                        <defs>
                            <linearGradient id="fillCashflowIncome" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--foreground)" stopOpacity={0.25} />
                                <stop offset="95%" stopColor="var(--foreground)" stopOpacity={0.0} />
                            </linearGradient>
                            <linearGradient id="fillCashflowExpense" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--muted-foreground)" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="var(--muted-foreground)" stopOpacity={0.0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                        <XAxis
                            dataKey="name"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            tickFormatter={(value) => value.slice(0, 3)}
                            stroke="var(--muted-foreground)"
                            fontSize={11}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => `$${value >= 1000 ? `${Math.round(value / 1000)}k` : value}`}
                            stroke="var(--muted-foreground)"
                            fontSize={11}
                        />
                        <ChartTooltip
                            cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
                            content={
                                <ChartTooltipContent labelClassName="text-muted-foreground" indicator="dot" />
                            }
                        />

                        {(activeSeries === "both" || activeSeries === "income") && (
                            <Area
                                dataKey="income"
                                type="monotone"
                                stroke="var(--foreground)"
                                strokeWidth={2}
                                fill="url(#fillCashflowIncome)"
                                fillOpacity={1}
                                activeDot={{ r: 5, strokeWidth: 0, fill: "var(--foreground)" }}
                            />
                        )}

                        {(activeSeries === "both" || activeSeries === "expense") && (
                            <Area
                                dataKey="expense"
                                type="monotone"
                                stroke="var(--muted-foreground)"
                                strokeWidth={2}
                                strokeDasharray="4 4"
                                fill="url(#fillCashflowExpense)"
                                fillOpacity={1}
                                activeDot={{ r: 5, strokeWidth: 0, fill: "var(--muted-foreground)" }}
                            />
                        )}
                    </AreaChart>
                </ChartContainer>
            </div>
        </div>
    )
}
