"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieChartIcon, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { ClientsPortfolioMetrics } from "@/lib/data";

interface ClientsPortfolioChartsProps {
  metrics: ClientsPortfolioMetrics;
}

export function ClientsPortfolioCharts({ metrics }: ClientsPortfolioChartsProps) {
  const { portfolioStatusDistribution, topClientsByRevenue } = metrics;
  const hasClients = metrics.totalClients > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
      {/* 1. Donut Chart: Estado de la Cartera */}
      <div className="lg:col-span-5 rounded-[var(--radius)] border border-border bg-card p-5 sm:p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-secondary/40 hover:bg-secondary/30 dark:bg-foreground/90 dark:hover:bg-foreground text-secondary-foreground dark:text-background transition-colors">
                <PieChartIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground tracking-tight">Salud de la Cartera</h3>
                <p className="text-xs text-muted-foreground">Distribución por estado de cobro</p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              {metrics.totalClients} {metrics.totalClients === 1 ? 'cliente' : 'clientes'}
            </span>
          </div>

          {!hasClients ? (
            <div className="h-[220px] flex items-center justify-center text-xs text-muted-foreground border border-dashed border-border rounded-xl bg-muted/20 my-4">
              Sin clientes registrados.
            </div>
          ) : (
            <div className="h-[200px] w-full relative my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={portfolioStatusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="count"
                    stroke="none"
                    cornerRadius={3}
                  >
                    {portfolioStatusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="rounded-xl border border-border bg-popover/95 p-3 shadow-xl backdrop-blur-md">
                            <div className="text-xs font-semibold text-foreground mb-0.5 flex items-center gap-1.5">
                              <span
                                className="w-2 h-2 rounded-full inline-block"
                                style={{ backgroundColor: item.color }}
                              />
                              <span>{item.name}</span>
                            </div>
                            <div className="text-sm font-bold text-foreground">
                              {item.count} {item.count === 1 ? 'cliente' : 'clientes'} ({item.value}%)
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Inner Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-foreground">
                  {metrics.totalClients}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Cartera
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Legend / Status Badges */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
          {portfolioStatusDistribution.map((item) => (
            <div
              key={item.name}
              className="flex flex-col items-center justify-center p-2 rounded-lg bg-muted/20 border border-border/50 text-center"
            >
              <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name}</span>
              </div>
              <span className="text-xs font-semibold text-foreground mt-0.5">
                {item.count} <span className="text-[10px] text-muted-foreground font-normal">({item.value}%)</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Top 5 Clientes por Volumen de Facturación (Horizontal Bar Chart) */}
      <div className="lg:col-span-7 rounded-[var(--radius)] border border-border bg-card p-5 sm:p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-secondary/40 hover:bg-secondary/30 dark:bg-foreground/90 dark:hover:bg-foreground text-secondary-foreground dark:text-background transition-colors">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground tracking-tight">Top Clientes por Facturación</h3>
                <p className="text-xs text-muted-foreground">Volumen acumulado de ventas</p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              Histórico
            </span>
          </div>

          {topClientsByRevenue.length === 0 ? (
            <div className="h-[240px] flex items-center justify-center text-xs text-muted-foreground border border-dashed border-border rounded-xl bg-muted/20 my-4">
              Sin facturación registrada en clientes.
            </div>
          ) : (
            <div className="space-y-3.5 my-4">
              {topClientsByRevenue.map((client, idx) => {
                const maxRevenue = topClientsByRevenue[0]?.totalRevenue || 1;
                const percentage = Math.min(100, Math.round((client.totalRevenue / (maxRevenue || 1)) * 100));

                return (
                  <div key={client.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2 truncate max-w-[65%]">
                        <span className="text-[11px] text-muted-foreground w-4">
                          #{idx + 1}
                        </span>
                        <span className="font-semibold text-foreground truncate">
                          {client.name}
                        </span>
                        {client.brand && (
                          <span className="text-[11px] text-muted-foreground truncate hidden sm:inline">
                            · {client.brand}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {client.pendingAmount > 0 && (
                          <span className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-md border border-neutral-300 dark:border-zinc-800 bg-neutral-100/80 dark:bg-zinc-900/60 text-neutral-600 dark:text-zinc-400 sm:inline">
                            Saldo: {formatCurrency(client.pendingAmount)}
                          </span>
                        )}
                        <span className="font-semibold font-mono text-foreground">
                          {formatCurrency(client.totalRevenue)}
                        </span>
                      </div>
                    </div>
                    {/* Barra horizontal con la gama de colores idéntica al chart de Expenses/Invoices */}
                    <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden border border-border/30">
                      <div
                        className="h-full bg-secondary/40 hover:bg-secondary/30 dark:bg-foreground/90 dark:hover:bg-foreground rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(6, percentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info note */}
        <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-muted-foreground">
          <span>Facturación neta acumulada</span>
          <span>Top 5 clientes</span>
        </div>
      </div>
    </div>
  );
}
