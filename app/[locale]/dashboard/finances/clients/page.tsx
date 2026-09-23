import { fetchClientsWithStats, fetchClientsPortfolioMetrics } from '@/lib/data';
import { CreateClientModal } from '@/components/dashboard/finances/clients/create-client-modal';
import { TranslucentImpactCard } from '@/components/dashboard/finances/invoices/translucent-impact-card';
import { ClientsPortfolioCharts } from '@/components/dashboard/finances/clients/clients-portfolio-charts';
import { ClientsExplorer } from '@/components/dashboard/finances/clients/clients-explorer';
import { formatCurrency } from '@/lib/utils';
import { Users, AlertTriangle, Clock, TrendingUp, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Clientes | Dashboard Financiero',
};

export default async function ClientsPage() {
  const [clients, portfolioMetrics] = await Promise.all([
    fetchClientsWithStats(),
    fetchClientsPortfolioMetrics(),
  ]);

  return (
    <div className="p-4 sm:p-6 w-full max-w-[1600px] m-auto space-y-8 min-h-screen text-foreground">
      {/* 1. Hero Banner with tweakcn aesthetics & Top 4 KPIs */}
      <div className="rounded-[var(--radius)] p-6 sm:p-8 md:p-10 shadow-sm border border-border bg-card relative overflow-hidden">
        {/* Subtle background glow effect */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />

        {/* Banner Top Bar: Title & Primary CTA */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-border relative z-10">
          <div className="space-y-1.5 w-full lg:w-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-secondary/40 dark:bg-secondary/20 text-secondary-foreground mb-1 border border-border">
              <Sparkles className="w-3.5 h-3.5 text-accent dark:text-secondary-foreground" />
              <span>Gestión de Clientes & Cobranzas</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground/80 font-sans">
              Clientes
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
              Monitorea estados de cuenta, facturación acumulada, mora y saldo por cobrar en tiempo real.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <CreateClientModal />
          </div>
        </div>

        {/* 1. Fila de KPIs Principales (Top Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-6 sm:pt-8 relative z-10">
          <TranslucentImpactCard
            title="Total / Activos"
            value={`${portfolioMetrics.totalClients}`}
            subtitle={`${portfolioMetrics.activeClients} activos con historial`}
            trend="Cartera"
            icon={Users}
          />

          <TranslucentImpactCard
            title="Mora Acumulada"
            value={formatCurrency(portfolioMetrics.totalOverdueAmount)}
            subtitle="Facturas vencidas impagas"
            trend={portfolioMetrics.totalOverdueAmount > 0 ? "Atención" : "Al día"}
            icon={AlertTriangle}
            className={portfolioMetrics.totalOverdueAmount > 0 ? "border-destructive/30" : ""}
          />

          <TranslucentImpactCard
            title="Por Cobrar"
            value={formatCurrency(portfolioMetrics.totalPendingAmount)}
            subtitle="Facturas vigentes a término"
            trend="En término"
            icon={Clock}
          />

          <TranslucentImpactCard
            title="Ticket Promedio"
            value={formatCurrency(portfolioMetrics.arpu)}
            subtitle="Promedio facturado por cliente"
            trend="ARPU"
            icon={TrendingUp}
          />
        </div>
      </div>

      {/* 2. Gráficos Analíticos de Cartera (Donut Salud + Horizontal Bar Chart Top 5) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-foreground">Análisis de Cartera</h2>
            <p className="text-xs text-muted-foreground">Comportamiento financiero y concentración de ventas</p>
          </div>
        </div>

        <ClientsPortfolioCharts metrics={portfolioMetrics} />
      </div>

      {/* 3. Rediseño del Listado de Clientes con Toolbar Unificada */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-foreground">Directorio de Clientes</h2>
            <p className="text-xs text-muted-foreground">Búsqueda, filtros por salud crediticia y acciones rápidas</p>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {clients.length} {clients.length === 1 ? 'cliente' : 'clientes'}
          </span>
        </div>

        <ClientsExplorer clients={clients} />
      </div>
    </div>
  );
}