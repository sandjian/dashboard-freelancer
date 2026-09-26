import { requireUser } from '@/lib/auth-guard';
import {
  fetchCardsWithMonthlyStatement,
  fetchGlobalCardActivity,
  fetchCardSpendingDistribution,
  fetchBankAccounts,
} from '@/lib/data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Sparkles, CheckCircle2, AlertTriangle, CreditCard } from 'lucide-react';
import { RealCard } from '@/components/dashboard/finances/cards/real-card';
import { CardsSpendingChart } from '@/components/dashboard/finances/cards/cards-spending-chart';
import { RecentCardActivity } from '@/components/dashboard/finances/cards/recent-card-activity';
import { CardAlerts, CardAlertItem } from '@/components/dashboard/finances/cards/card-alerts';
import { CardWithStatement } from '@/lib/definitions';
import { formatCurrency } from '@/lib/utils';
import { TranslucentImpactCard } from '@/components/dashboard/finances/invoices/translucent-impact-card';
import { getTranslations } from 'next-intl/server';

export default async function CardsPage() {
  const user = await requireUser();
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const currentDay = today.getDate();

  const [cardsWithStatements, globalActivity, spendingDistribution, bankAccounts, t] = await Promise.all([
    fetchCardsWithMonthlyStatement(year, month),
    fetchGlobalCardActivity(6),
    fetchCardSpendingDistribution(year, month),
    fetchBankAccounts(),
    getTranslations('Cards'),
  ]);

  // 1. Cálculo de KPIs directos desde card_statements
  const totalDueThisMonth = cardsWithStatements.reduce((acc, c) => {
    if (c.statement && c.statement.status === 'pending') {
      return acc + c.statement.totalAmount;
    }
    return acc;
  }, 0);

  const totalPaidThisMonth = cardsWithStatements.reduce((acc, c) => {
    if (c.statement && c.statement.status === 'paid') {
      return acc + c.statement.totalAmount;
    }
    return acc;
  }, 0);

  const pendingCount = cardsWithStatements.filter(
    (c) => !c.statement || c.statement.status === 'pending'
  ).length;

  // 2. Recomendador Inteligente: ¿Qué tarjeta conviene usar hoy?
  const bestCardResult = cardsWithStatements.reduce<{ card: CardWithStatement | null; maxDays: number }>(
    (acc, card) => {
      const daysSinceClosing = (currentDay - card.closing_day + 30) % 30;
      if (daysSinceClosing > acc.maxDays) {
        return { card, maxDays: daysSinceClosing };
      }
      return acc;
    },
    { card: null, maxDays: -1 }
  );
  const bestCard = bestCardResult.card;
  const maxDaysSinceClosing = bestCardResult.maxDays;

  // 3. Alertas de Cierre y Vencimiento
  const alerts: CardAlertItem[] = [];
  cardsWithStatements.forEach(card => {
    const closingDiff = card.closing_day - currentDay;
    if (closingDiff >= 0 && closingDiff <= 3) {
      alerts.push({
        type: 'info',
        title: t('imminentClosing', { card: card.name }),
        description: closingDiff === 0 ? t('closesTodayDescription') : t('closesInDaysDescription', { days: closingDiff }),
        date: new Date(year, month - 1, card.closing_day)
      });
    }

    const dueDiff = card.due_day - currentDay;
    if (dueDiff >= 0 && dueDiff <= 5 && card.statement?.status !== 'paid') {
      alerts.push({
        type: 'warning',
        title: t('upcomingDue', { card: card.name }),
        description: dueDiff === 0 ? t('dueTodayDescription') : t('dueInDaysDescription', { days: dueDiff }),
        date: new Date(year, month - 1, card.due_day)
      });
    }
  });

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 min-h-screen text-foreground">

      {/* 1. Hero Banner with tweakcn aesthetics (Unified Header + KPIs container) */}
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

          <div className="flex items-center gap-3 w-full xl:w-auto">
            <Button
              asChild
              className="relative overflow-hidden bg-secondary/40 text-secondary-foreground hover:bg-secondary/30 hover:border-secondary/30 hover:text-accent dark:hover:text-secondary-foreground shadow-sm font-semibold transition-all duration-300 group h-10 px-5 rounded-xl cursor-pointer w-full sm:w-auto justify-center"
            >
              <Link href="/dashboard/finances/cards/create">
                <div className="flex items-center justify-center gap-2 relative z-10 tracking-wide text-sm font-medium">
                  <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
                  <span>{t('newCard')}</span>
                </div>
              </Link>
            </Button>
          </div>
        </div>

        {/* Best Card Strategy Alert (Inside Hero) */}
        {bestCard && (
          <div className="mt-6 rounded-xl border border-border bg-muted/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-secondary/40 rounded-xl text-foreground border border-border">
                <Sparkles className="w-4 h-4 text-accent dark:text-foreground" />
              </div>
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
                  {t('recommendedStrategyTitle')}
                </div>
                <div className="text-sm font-medium text-foreground mt-0.5">
                  {t('recommendedStrategyDescription', { card: bestCard.name, days: maxDaysSinceClosing })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* KPIs Grid: 1 column on < lg, 3 columns on lg+ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 pt-6 relative z-10">
          <TranslucentImpactCard
            title={t('dueThisMonth')}
            value={formatCurrency(totalDueThisMonth)}
            subtitle={pendingCount > 0 ? t('cardsPendingCount', { count: pendingCount }) : t('allUpToDate')}
            trend={t('monthTrend', { month, year })}
            icon={CreditCard}
          />

          <TranslucentImpactCard
            title={t('paidThisMonth')}
            value={formatCurrency(totalPaidThisMonth)}
            subtitle={t('paidThisMonthSubtitle')}
            trend={t('settledTrend')}
            icon={CheckCircle2}
          />

          <TranslucentImpactCard
            title={t('statementStatus')}
            value={totalDueThisMonth === 0 ? t('statusUpToDate') : t('statusPending')}
            subtitle={totalDueThisMonth === 0 ? t('noPendingStatements') : t('statementsToPay')}
            trend={totalDueThisMonth === 0 ? t('trendOk') : t('trendAttention')}
            icon={totalDueThisMonth === 0 ? CheckCircle2 : AlertTriangle}
          />
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-7 gap-8">

        {/* Cards Gallery & Statements */}
        <div className="xl:col-span-5 space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div>
              <h2 className="text-lg font-bold text-foreground">{t('yourPlastics')}</h2>
              <p className="text-xs text-muted-foreground">{t('yourPlasticsSubtitle')}</p>
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              {cardsWithStatements.length} {cardsWithStatements.length === 1 ? t('cardCountSingular') : t('cardCountPlural')}
            </span>
          </div>

          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {cardsWithStatements.length > 0 ? (
              cardsWithStatements.map((card) => (
                <div key={card.id} className="flex flex-col">
                  <RealCard
                    id={card.id}
                    name={card.name}
                    closingDay={card.closing_day}
                    dueDay={card.due_day}
                    color={card.color}
                    last4={card.last_four_digits}
                    statement={card.statement}
                    year={year}
                    month={month}
                    accounts={bankAccounts}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full py-16 flex flex-col items-center justify-center border border-dashed border-border rounded-[var(--radius)] bg-card/40">
                <CreditCard className="w-10 h-10 text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground text-sm mb-4">{t('noAssociatedCards')}</p>
                <Button
                  asChild
                  className="bg-secondary/40 text-secondary-foreground hover:bg-secondary/30 dark:bg-foreground/90 dark:hover:bg-foreground dark:text-background font-semibold rounded-xl border border-border shadow-sm h-10 px-5"
                >
                  <Link href="/dashboard/finances/cards/create">{t('addFirstCard')}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Alerts, Distribution Chart & Recent Activity */}
        <div className="xl:col-span-2 space-y-6">
          {alerts.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground font-mono">
                {t('importantAlerts')}
              </h3>
              <CardAlerts alerts={alerts} />
            </div>
          )}

          <CardsSpendingChart data={spendingDistribution} />
          <RecentCardActivity activity={globalActivity} />
        </div>

      </div>
    </div>
  );
}