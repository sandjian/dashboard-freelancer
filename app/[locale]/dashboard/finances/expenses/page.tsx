import { requireUser } from '@/lib/auth-guard';
import { getTranslations } from 'next-intl/server';
import {
  fetchExpenseStats,
  fetchVendors,
  fetchExpenseCategories,
  fetchCards,
  fetchCardPaymentsDueForMonth,
  fetchPendingRecurringExpensesCount,
} from '@/lib/data';
import Search from '@/components/ui/search';
import { Button } from '@/components/ui/button';
import { ExpensesTable } from '@/components/dashboard/finances/expenses/expenses-table';
import { CreateExpenseDialog } from '@/components/dashboard/finances/expenses/create-expense-dialog';
import { Suspense } from 'react';
import { ExpensesTableSkeleton } from '@/components/dashboard/skeletons';
import { DateNavigator } from '@/components/dashboard/month-year-selector';
import { TranslucentImpactCard } from '@/components/dashboard/finances/invoices/translucent-impact-card';
import { BanknoteIcon, RepeatIcon, ClockIcon, BarChart3, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { ExpenseStatusButtons } from '@/components/dashboard/finances/expenses/status-filter';
import { CheckRecurrenceButton } from '@/components/dashboard/finances/expenses/recurrence-check-button';
import { SideInsightsPanel } from '@/components/dashboard/finances/expenses/side-panel';
import { fetchMonthlyExpenseHistory } from '@/lib/data';
import { ExpensesHistoryChart, HistoryData } from '@/components/dashboard/finances/expenses/expenses-history-chart';
import { ensureMonthlyRecurrences } from '@/lib/actions';

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams?: Promise<{
    year?: string;
    month?: string;
    query?: string;
    page?: string;
    categoryId?: string;
    status?: string;
    groupCards?: string;
    cardId?: string;
    action?: string;
    concept?: string;
    categoryName?: string;
    category_id?: string;
  }>;
}) {
  const user = await requireUser();

  const resolvedSearchParams = await searchParams;

  const year = Number(resolvedSearchParams?.year) || new Date().getFullYear();
  const month = Number(resolvedSearchParams?.month) || new Date().getMonth() + 1;
  const query = resolvedSearchParams?.query || '';
  const currentPage = Number(resolvedSearchParams?.page) || 1;
  const categoryId = resolvedSearchParams?.categoryId || null;
  const status = resolvedSearchParams?.status || null;
  const cardId = resolvedSearchParams?.cardId || null;

  await ensureMonthlyRecurrences(year, month);

  const results = await Promise.all([
    fetchExpenseStats(year, month),
    fetchCardPaymentsDueForMonth(year, month),
    fetchVendors(),
    fetchExpenseCategories(),
    fetchCards(),
    fetchPendingRecurringExpensesCount(),
    fetchMonthlyExpenseHistory(12), // Last 12 months
    getTranslations('Expenses'),
  ]);

  const [
    expenseStats,
    cardPaymentsDue,
    vendors,
    categories,
    cards,
    pendingRecurrencesCount,
    historyData,
    t,
  ] = results;

  const totalAmount = expenseStats.totalAmount || 1;
  const recurringPercentage = (expenseStats.recurringAmount / totalAmount) * 100;

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 min-h-screen text-foreground">

      {/* 1. Hero Banner with tweakcn aesthetics (Header + KPIs unified container) */}
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

            <CreateExpenseDialog
              vendors={vendors}
              categories={categories}
              cards={cards}
              defaultOpen={resolvedSearchParams?.action === 'create'}
              initialValues={{
                concept: resolvedSearchParams?.concept || '',
                category_id: (() => {
                  // Intelligent Category Matching Logic
                  if (resolvedSearchParams?.category_id) return resolvedSearchParams.category_id;
                  if (resolvedSearchParams?.categoryName) {
                    const searchName = resolvedSearchParams.categoryName.toLowerCase();
                    const found = categories.find(c => c.name.toLowerCase() === searchName)
                      || categories.find(c => c.name.toLowerCase().includes(searchName));
                    if (found) return found.id.toString();
                  }
                  return undefined;
                })(),
                amount: ''
              }}
            />
          </div>
        </div>

        {/* Banner Metric Cards: 1 column on < lg, 3 columns on lg+ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 pt-6 sm:pt-8 relative z-10">
          {/* KPI 1: Gasto Total */}
          <TranslucentImpactCard
            title={t('totalExpense')}
            value={formatCurrency(expenseStats.totalAmount)}
            subtitle={t('personalVsBusiness', { personal: formatCurrency(expenseStats.personalAmount), business: formatCurrency(expenseStats.businessAmount) })}
            icon={BanknoteIcon}
            trend={month === new Date().getMonth() + 1 ? t('currentMonth') : t('queriedPeriod')}
          />

          {/* KPI 2: Piso Fijo Mensual */}
          <TranslucentImpactCard
            title={t('monthlyFixedFloor')}
            value={formatCurrency(expenseStats.recurringAmount)}
            subtitle={t('fixedCostPercentage', { percentage: Math.round(recurringPercentage || 0) })}
            icon={RepeatIcon}
            trend={t('recurring')}
          />

          {/* KPI 3: Pendiente de Pago */}
          <TranslucentImpactCard
            title={t('pendingPayment')}
            value={formatCurrency(expenseStats.pendingAmount)}
            subtitle={t('pendingOutflows', { count: expenseStats.pendingCount })}
            icon={ClockIcon}
            trend={expenseStats.pendingAmount > 0 ? t('dueSoon') : t('upToDate')}
          />
        </div>
      </div>

      {/* 3. Main Content Grid (3+1 Layout) */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

        {/* Left Column: Unified Data Canvas & Chart (Spans 3 cols) */}
        <div className="xl:col-span-3 space-y-6">
          {/* Unified Data Canvas (Toolbar + Table + Pagination in a Single Block) */}
          <div className="rounded-[var(--radius)] bg-card border border-border shadow-sm overflow-hidden">
            {/* Integrated Header Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 p-3.5 sm:p-5 border-b border-border bg-muted/20">
              <div className="w-full md:max-w-xs">
                <Search placeholder={t('searchPlaceholder')} />
              </div>
              <div className="w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                <ExpenseStatusButtons />
              </div>
            </div>

            {/* Table Area inside Canvas */}
            <div className="min-h-[500px] flex flex-col">
              <Suspense key={query + currentPage + year + month + categoryId + status} fallback={<ExpensesTableSkeleton />}>
                <ExpensesTable
                  query={query}
                  currentPage={currentPage}
                  year={year}
                  month={month}
                  categoryId={categoryId}
                  status={status}
                  cardId={cardId}
                />
              </Suspense>
            </div>
          </div>

          {/* 4. Monthly History Chart */}
          <div className="rounded-[var(--radius)] bg-card border border-border p-4 sm:p-6 md:p-7 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-secondary/40 hover:bg-secondary/30 dark:bg-foreground/90 dark:hover:bg-foreground text-secondary-foreground dark:text-background transition-colors">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-foreground tracking-tight">{t('expenseHistoryTitle')}</h3>
            </div>
            <div className="h-[280px] sm:h-[340px] md:h-[370px] w-full">
              <ExpensesHistoryChart data={historyData as unknown as HistoryData[]} />
            </div>
          </div>

        </div>

        {/* Right Column: Side Insights Panel (Spans 1 col) */}
        <div className="xl:col-span-1">
          <SideInsightsPanel year={year} month={month} />
        </div>

      </div>
    </div>
  );
}