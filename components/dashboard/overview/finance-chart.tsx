"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts" // Changed LineChart/Line to AreaChart/Area
import { TrendingUp, TrendingDown } from "lucide-react"

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
import { useTranslations } from "next-intl";

export const description = "A dual-line chart showing Income vs Expenses with interactive metrics"

interface FinanceChartProps {
    data: {
        name: string
        income: number
        expense: number
        baseline?: number
    }[]
    baseline?: number // Global burn rate if needed
}

export function FinanceChart({ data, baseline }: FinanceChartProps) {
    const t = useTranslations('Finance');

    // Dynamic Chart Config for Translations
    const chartConfig = {
        income: {
            label: t('income'),
            color: "var(--success)",
        },
        expense: {
            label: t('expenses'),
            color: "var(--danger)",
        },
    } satisfies ChartConfig

    // Calculate totals for the header metrics (using the last 12 months data passed)
    const totalIncome = data.reduce((acc, curr) => acc + curr.income, 0)
    const totalExpense = data.reduce((acc, curr) => acc + curr.expense, 0)

    // Previous period simulation (just splitting data in half for demo or using logic)
    const lastMonth = data[data.length - 1] || { income: 0, expense: 0 }
    const prevMonth = data[data.length - 2] || { income: 0, expense: 0 }

    const incomeTrend = prevMonth.income > 0 ? ((lastMonth.income - prevMonth.income) / prevMonth.income) * 100 : 0
    const expenseTrend = prevMonth.expense > 0 ? ((lastMonth.expense - prevMonth.expense) / prevMonth.expense) * 100 : 0

    // DEFAULT: 'income' only.
    const [activeSeries, setActiveSeries] = React.useState<"income" | "expense">("income")

    return (
        <Card className="col-span-1 lg:col-span-2 overflow-hidden shadow-sm border-border bg-card">
            <CardHeader className="p-0 border-b border-border">
                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
                    {/* Income Metric */}
                    <div
                        className={cn(
                            "p-4 cursor-pointer transition-colors relative",
                            activeSeries === 'income' ? "bg-accent/40" : "hover:bg-accent/20"
                        )}
                        onClick={() => setActiveSeries('income')}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className={cn("text-sm font-medium", activeSeries === 'income' ? "text-success" : "text-muted-foreground")}>
                                {t('totalIncome')}
                            </span>
                            <Badge variant="outline" className="border-success/30 text-success bg-success/10">
                                {incomeTrend >= 0 ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
                                {Math.abs(incomeTrend).toFixed(1)}%
                            </Badge>
                        </div>
                        <div className="text-2xl font-bold text-card-foreground">{formatCurrency(totalIncome)}</div>

                        {/* Active Indicator Line */}
                        {activeSeries === 'income' && (
                            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-success" />
                        )}
                    </div>

                    {/* Expense Metric */}
                    <div
                        className={cn(
                            "p-4 cursor-pointer transition-colors relative",
                            activeSeries === 'expense' ? "bg-accent/40" : "hover:bg-accent/20"
                        )}
                        onClick={() => setActiveSeries('expense')}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className={cn("text-sm font-medium", activeSeries === 'expense' ? "text-danger" : "text-muted-foreground")}>
                                {t('totalExpenses')}
                            </span>
                            <Badge variant="outline" className="border-danger/30 text-danger bg-danger/10">
                                {expenseTrend <= 0 ? <TrendingDown className="mr-1 h-3 w-3" /> : <TrendingUp className="mr-1 h-3 w-3" />}
                                {Math.abs(expenseTrend).toFixed(1)}%
                            </Badge>
                        </div>
                        <div className="text-2xl font-bold text-card-foreground">{formatCurrency(totalExpense)}</div>

                        {/* Active Indicator Line */}
                        {activeSeries === 'expense' && (
                            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-danger" />
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="px-2 sm:p-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[350px] w-full"
                >
                    <AreaChart
                        data={data}
                        margin={{
                            left: 12,
                            right: 12,
                            top: 12,
                            bottom: 12
                        }}
                    >
                        <defs>
                            <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--success)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="fillExpense" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--danger)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="var(--danger)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                        <XAxis
                            dataKey="name"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.slice(0, 3)}
                            stroke="var(--muted-foreground)"
                            fontSize={12}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => `$${value / 1000}k`}
                            stroke="var(--muted-foreground)"
                            fontSize={12}
                        />
                        <ChartTooltip
                            cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1 }}
                            content={
                                <ChartTooltipContent labelClassName="text-muted-foreground" indicator="dot" />
                            }
                        />

                        {activeSeries === 'income' && (
                            <Area
                                dataKey="income"
                                type="monotone"
                                stroke="var(--success)"
                                strokeWidth={3}
                                fill="url(#fillIncome)"
                                fillOpacity={1}
                                activeDot={{ r: 6, strokeWidth: 0, fill: "var(--success)" }}
                            />
                        )}

                        {activeSeries === 'expense' && (
                            <Area
                                dataKey="expense"
                                type="monotone"
                                stroke="var(--danger)"
                                strokeWidth={3}
                                fill="url(#fillExpense)"
                                fillOpacity={1}
                                activeDot={{ r: 6, strokeWidth: 0, fill: "var(--danger)" }}
                            />
                        )}

                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
