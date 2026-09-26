import { requireUser } from '@/lib/auth-guard';
import { fetchClientsWithStats, fetchClientsPortfolioMetrics } from '@/lib/data';
import { CreateClientModal } from '@/components/dashboard/finances/clients/create-client-modal';
import { TranslucentImpactCard } from '@/components/dashboard/finances/invoices/translucent-impact-card';
import { ClientsPortfolioCharts } from '@/components/dashboard/finances/clients/clients-portfolio-charts';
import { ClientsExplorer } from '@/components/dashboard/finances/clients/clients-explorer';
import { formatCurrency } from '@/lib/utils';
import { Users, AlertTriangle, Clock, TrendingUp, Sparkles } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function ClientsPage() {
  const user = await requireUser();
  const t = await getTranslations('Clients');

  const [clients, portfolioMetrics] = await Promise.all([
    fetchClientsWithStats(),
    fetchClientsPortfolioMetrics(),
  ]);

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 min-h-screen text-foreground">
      {/* 1. Hero Banner with tweakcn aesthetics & Top 4 KPIs */}
      <div className="rounded-[var(--radius)] p-4 sm:p-6 md:p-8 lg:p-10 shadow-sm border border-border bg-card relative overflow-hidden">
        {/* Subtle background glow effect */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />

        {/* Banner Top Bar: Title & Primary CTA */}
        <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between pb-6 border-b border-border relative z-10">
          <div className="space-y-1.5 w-full xl:w-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-secondary/40 dark:bg-secondary/20 text-secondary-foreground mb-1 border border-border">
              <Sparkles className="w-3.5 h-3.5 text-accent dark:text-secondary-foreground" />
              <span>{t('badge')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground/80 font-sans">
              {t('title')}
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
              {t('description')}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full xl:w-auto">
            <CreateClientModal />
          </div>
        </div>

        {/* 1. Fila de KPIs Principales: 1 column on < lg, 2 on lg, 4 on xl+ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 pt-6 sm:pt-8 relative z-10">
          <TranslucentImpactCard
            title={t('totalActive')}
            value={`${portfolioMetrics.totalClients}`}
            subtitle={t('activeWithHistory', { count: portfolioMetrics.activeClients })}
            trend={t('portfolioTrend')}
            icon={Users}
          />

          <TranslucentImpactCard
            title={t('overdueDebt')}
            value={formatCurrency(portfolioMetrics.totalOverdueAmount)}
            subtitle={t('unpaidOverdueInvoices')}
            trend={portfolioMetrics.totalOverdueAmount > 0 ? t('attention') : t('upToDate')}
            icon={AlertTriangle}
            className={portfolioMetrics.totalOverdueAmount > 0 ? "border-destructive/30" : ""}
          />

          <TranslucentImpactCard
            title={t('receivables')}
            value={formatCurrency(portfolioMetrics.totalPendingAmount)}
            subtitle={t('currentPendingInvoices')}
            trend={t('inTerm')}
            icon={Clock}
          />

          <TranslucentImpactCard
            title={t('averageTicket')}
            value={formatCurrency(portfolioMetrics.arpu)}
            subtitle={t('averageBilledPerClient')}
            trend={t('arpu')}
            icon={TrendingUp}
          />
        </div>
      </div>

      {/* 2. Gráficos Analíticos de Cartera (Donut Salud + Horizontal Bar Chart Top 5) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-foreground">{t('portfolioAnalysis')}</h2>
            <p className="text-xs text-muted-foreground">{t('portfolioAnalysisSubtitle')}</p>
          </div>
        </div>

        <ClientsPortfolioCharts metrics={portfolioMetrics} />
      </div>

      {/* 3. Rediseño del Listado de Clientes con Toolbar Unificada */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-foreground">{t('directoryTitle')}</h2>
            <p className="text-xs text-muted-foreground">{t('directorySubtitle')}</p>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {clients.length} {clients.length === 1 ? t('clientCountSingular') : t('clientCountPlural')}
          </span>
        </div>

        <ClientsExplorer clients={clients} />
      </div>
    </div>
  );
}