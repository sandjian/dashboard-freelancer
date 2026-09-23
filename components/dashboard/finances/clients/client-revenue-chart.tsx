'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, Tooltip, YAxis } from "recharts";
import { TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ClientRevenueChartProps {
    data: { name: string; value: number }[];
}

export function ClientRevenueChart({ data }: ClientRevenueChartProps) {
    const hasData = data && data.some((item) => item.value > 0);
    const totalCollected = (data || []).reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="rounded-[var(--radius)] bg-card border border-border p-4 sm:p-6 md:p-7 shadow-sm flex flex-col justify-between">
            {/* Header del gráfico idéntico a Invoices y Expenses */}
            <div>
                <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-secondary/40 hover:bg-secondary/30 dark:bg-foreground/90 dark:hover:bg-foreground text-secondary-foreground dark:text-background transition-colors">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-foreground tracking-tight">
                                Historial de Recaudación (Últimos 12 meses)
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                Ingresos cobrados mes a mes de este cliente
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-xs text-muted-foreground block">Total Recaudado</span>
                        <span className="text-sm font-semibold font-mono text-foreground">
                            {formatCurrency(totalCollected)}
                        </span>
                    </div>
                </div>

                {!hasData ? (
                    <div className="h-[260px] flex items-center justify-center text-xs text-muted-foreground border border-dashed border-border rounded-xl bg-muted/20 my-4">
                        Sin cobros registrados para este cliente en el período.
                    </div>
                ) : (
                    <div className="h-[260px] w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
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
                                    cursor={{
                                        fill: 'var(--muted)',
                                        opacity: 0.35,
                                        radius: 6,
                                    }}
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="rounded-xl border border-border bg-popover/95 p-3 shadow-xl backdrop-blur-md">
                                                    <div className="mb-1 text-xs font-medium text-muted-foreground">{label}</div>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-sm font-bold font-mono text-foreground">
                                                            {formatCurrency(Number(payload[0].value))}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                                            Cobrado
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
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
                    </div>
                )}
            </div>

            {/* Footer idéntico al de los charts del sistema */}
            <div className="flex items-center justify-between pt-3 mt-2 border-t border-border text-xs text-muted-foreground">
                <span>Facturas en estado cobrado</span>
                <span>Últimos 12 meses</span>
            </div>
        </div>
    );
}
