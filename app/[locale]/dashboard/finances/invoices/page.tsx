import { requireUser } from '@/lib/auth-guard';
import Link from 'next/link';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import {
  fetchInvoiceStats,
  fetchMonthlyIncomeHistory,
  fetchBankAccounts,
} from '@/lib/data';
import Search from '@/components/ui/search';
import { Button } from '@/components/ui/button';
import { InvoicesTable } from '@/components/dashboard/finances/invoices/invoices-table';
import { TranslucentImpactCard } from '@/components/dashboard/finances/invoices/translucent-impact-card';
import { InvoicesTableSkeleton } from '@/components/dashboard/skeletons';
import { StatusButtons } from '@/components/dashboard/finances/invoices/status-filter';
import { DateNavigator } from '@/components/dashboard/month-year-selector';
import { InvoicesHistoryChart, type InvoiceHistoryData } from '@/components/dashboard/finances/invoices/invoices-history-chart';
import { InvoicesSidePanel } from '@/components/dashboard/finances/invoices/side-panel';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, Clock, BarChart3, Plus, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Ingresos | Dashboard',
};

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams?: Promise<{ year?: string; month?: string; query?: string; page?: string; status?: string; }>;
}) {
  const user = await requireUser();
  const resolvedSearchParams = await searchParams;
  const year = Number(resolvedSearchParams?.year) || new Date().getFullYear();
  const month = Number(resolvedSearchParams?.month) || new Date().getMonth() + 1;
  const query = resolvedSearchParams?.query || '';
  const currentPage = Number(resolvedSearchParams?.page) || 1;
  const status = resolvedSearchParams?.status || '';

  const [
    invoiceStats,
    incomeHistory,
    bankAccounts,
    t,
  ] = await Promise.all([
    fetchInvoiceStats(year, month),
    fetchMonthlyIncomeHistory(12),
    fetchBankAccounts(),
    getTranslations('Invoices'),
  ]);

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 min-h-screen text-foreground">
      {/* 1. Hero Banner with tweakcn aesthetics */}
      <div className="rounded-[var(--radius)] p-4 sm:p-6 md:p-8 lg:p-10 shadow-sm border border-border bg-card relative overflow-hidden">
        {/* Subtle background glow effect */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />

        {/* Banner Top Bar: Title & Controls */}
        <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between pb-6 border-b border-border relative z-10">
          <div className="space-y-1.5 w-full xl:w-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-secondary/40 dark:bg-secondary/20 text-secondary-foreground mb-1 border border-border">
              <Sparkles className="w-3.5 h-3.5 text-accent dark:text-secondary-foreground" />
              <span>{t('badge')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground/80 font-sans">
              {t('heroTitle')}
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
              {t('heroDescription')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
            {/* Custom styled DateNavigator */}
            <div className="bg-muted/40 border border-border rounded-xl p-1 text-foreground flex justify-center">
              <DateNavigator className="bg-transparent border-0 shadow-none text-foreground [&_button]:text-foreground [&_button]:hover:bg-muted [&_span]:text-foreground" />
            </div>

            <Button
              asChild
              className="relative overflow-hidden bg-secondary/40 text-secondary-foreground hover:bg-secondary/30 hover:border-secondary/30 hover:text-accent dark:hover:text-secondary-foreground shadow-sm font-semibold transition-all duration-300 group h-10 px-5 rounded-xl cursor-pointer w-full sm:w-auto justify-center"
            >
              <Link href="/dashboard/finances/invoices/create">
                <div className="flex items-center justify-center gap-2 relative z-10 tracking-wide text-sm font-medium">
                  <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
                  <span>{t('newInvoice')}</span>
                </div>
              </Link>
            </Button>
          </div>
        </div>

        {/* Banner Metric Cards: 1 column on < lg, 2 columns on lg+ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 pt-6 sm:pt-8 relative z-10">
          <TranslucentImpactCard
            title={t('netIncome')}
            value={formatCurrency(invoiceStats.facturadoAmount)}
            subtitle={t('invoicesCollected', { count: invoiceStats.facturadoCount })}
            icon={TrendingUp}
            trend={t('totalCollected')}
          />

          <TranslucentImpactCard
            title={t('receivables')}
            value={formatCurrency(invoiceStats.pendienteAmount)}
            subtitle={t('invoicesPending', { count: invoiceStats.pendienteCount })}
            icon={Clock}
            trend={t('monthPending')}
          />
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Left Column: Unified Data Canvas & Chart */}
        <div className="xl:col-span-3 space-y-6 ">
          {/* Unified Data Canvas (Toolbar + Table + Pagination in a Single Block) */}
          <div className="rounded-[var(--radius)] bg-card border border-border shadow-sm overflow-hidden">
            {/* Integrated Header Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 p-3.5 sm:p-5 border-b border-border bg-muted/20">
              <div className="w-full md:max-w-xs">
                <Search placeholder={t('searchPlaceholder')} />
              </div>
              <div className="w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                <StatusButtons />
              </div>
            </div>

            {/* Table Area inside Canvas */}
            <div className="min-h-[500px] flex flex-col">
              <Suspense key={query + currentPage + year + month + status} fallback={<InvoicesTableSkeleton />}>
                <InvoicesTable
                  query={query}
                  currentPage={currentPage}
                  year={year}
                  month={month}
                  status={status}
                  accounts={bankAccounts}
                />
              </Suspense>
            </div>
          </div>

          {/* History Chart Container */}
          <div className="rounded-[var(--radius)] bg-card border border-border p-4 sm:p-6 md:p-7 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-secondary/40 hover:bg-secondary/30 dark:bg-foreground/90 dark:hover:bg-foreground text-secondary-foreground dark:text-background transition-colors">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-foreground tracking-tight">{t('incomeHistoryTitle')}</h3>
            </div>
            <div className="h-[280px] sm:h-[340px] md:h-[370px] w-full">
              <InvoicesHistoryChart data={incomeHistory as unknown as InvoiceHistoryData[]} />
            </div>
          </div>
        </div>

        {/* Right Column: Side Insights Panel */}
        <div className="xl:col-span-1">
          <InvoicesSidePanel year={year} month={month} />
        </div>
      </div>
    </div>
  );
}