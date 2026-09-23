import { Card, CardContent } from "@/components/ui/card";
import { Calendar, CreditCard, Receipt, ArrowRight, Wallet, AlertCircle, Plus } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { useTranslations, useFormatter } from "next-intl";
import { PayStatementModal } from "@/components/dashboard/finances/cards/pay-statement-modal";
import { CollectInvoiceModal } from "@/components/dashboard/finances/invoices/collect-invoice-modal";
import { BankAccount } from "@/lib/definitions";

type PredictiveStatus = {
    expenses: {
        type: 'card' | 'recurring';
        statementId?: string;
        cardName?: string;
        date: Date;
        amount: number;
        label: string;
        cardId?: string;
        cardLast4?: string;
    } | null;
    invoices: {
        id?: string;
        count?: number;
        client?: string;
        date?: Date;
        amount: number;
        currency?: 'ARS' | 'USD';
        isOverdue: boolean;
    } | null;
    agenda: {
        count: number;
        nextEvent: { title: string; date: Date } | null;
    } | null;
};

export function PredictiveInsights({
    status,
    accounts = [],
}: {
    status: PredictiveStatus;
    accounts?: BankAccount[];
}) {
    const t = useTranslations('Predictive');
    const tCommon = useTranslations('Common');
    const format = useFormatter();

    function formatDate(date: Date) {
        return format.dateTime(date, { day: '2-digit', month: 'short' });
    }

    return (
        <div className="col-span-1 lg:col-span-1 flex flex-col gap-4 h-full">
            {/* Header Title */}
            <div className="flex items-center gap-2 px-1">
                <Wallet className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">{t('title')}</h3>
            </div>

            <div className="flex-1 flex flex-col gap-4">
                {/* 1. GASTOS CARD (Resumen de Tarjeta o Recurrente) */}
                <Card className="flex-1 bg-card border-l-4 border-l-primary border-y border-r border-border shadow-sm relative overflow-hidden group hover:border-primary/50 transition-colors">
                    <div className="absolute right-0 top-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                        <CreditCard className="h-20 w-20 text-primary" />
                    </div>
                    <CardContent className="p-5 flex flex-col justify-between h-full relative z-10">
                        <div>
                            <div className="flex items-center gap-2 text-primary mb-2">
                                <CreditCard className="h-4 w-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">
                                    {t('nextPayment')}
                                </span>
                            </div>

                            {status.expenses ? (
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground font-medium">
                                        {status.expenses.type === 'card'
                                            ? t('cardSummary', { label: status.expenses.label }) +
                                            (status.expenses.cardLast4 ? ' x' + status.expenses.cardLast4 : '')
                                            : status.expenses.label}
                                    </p>
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-2xl font-bold font-mono text-card-foreground">
                                            {formatCurrency(status.expenses.amount)}
                                        </span>
                                        <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                                            {t('paymentDue', { date: formatDate(status.expenses.date) })}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">{t('noUpcomingFull')}</p>
                            )}
                        </div>

                        {/* Acciones de Tarjeta */}
                        <div className="mt-3">
                            {status.expenses?.type === 'card' && status.expenses.statementId ? (
                                <div className="flex items-center gap-2">
                                    <div className="flex-1">
                                        <PayStatementModal
                                            statementId={status.expenses.statementId}
                                            cardName={status.expenses.cardName || status.expenses.label}
                                            totalAmount={status.expenses.amount}
                                            accounts={accounts}
                                        />
                                    </div>

                                    {status.expenses.cardId && (
                                        <Link
                                            href={`/dashboard/finances/cards/${status.expenses.cardId}?year=${new Date(status.expenses.date).getFullYear()}&month=${new Date(status.expenses.date).getMonth() + 1}`}
                                            title={t('viewSummary')}
                                        >
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-foreground border-border hover:bg-muted"
                                            >
                                                <ArrowRight className="h-3.5 w-3.5" />
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    href={
                                        status.expenses?.type === 'card'
                                            ? '/dashboard/finances/cards'
                                            : '/dashboard/finances/expenses'
                                    }
                                >
                                    <Button
                                        className="w-full relative overflow-hidden bg-primary text-primary-foreground shadow-lg shadow-primary/25 border-0 ring-0 group transition-all duration-300 hover:shadow-primary/50 hover:bg-primary hover:text-primary-foreground h-8 text-xs cursor-pointer"
                                        size="sm"
                                    >
                                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                                        <span className="relative z-10 font-semibold flex items-center justify-center gap-2">
                                            {status.expenses?.type === 'card' ? t('viewSummary') : t('goToExpenses')}
                                            <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                                        </span>
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 2. FACTURACIÓN CARD (Cobros Pendientes / Acreditación Rápida) */}
                <Card className="flex-1 bg-card border-l-4 border-l-primary border-y border-r border-border shadow-sm relative overflow-hidden group hover:border-primary/50 transition-colors">
                    <div className="absolute right-0 top-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Receipt className="h-20 w-20 text-primary" />
                    </div>
                    <CardContent className="p-5 flex flex-col justify-between h-full relative z-10">
                        <div>
                            <div className="flex items-center gap-2 text-primary mb-2">
                                <Receipt className="h-4 w-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">
                                    {t('receivables')}
                                </span>
                            </div>

                            {status.invoices ? (
                                <div className="space-y-1">
                                    {status.invoices.isOverdue && status.invoices.count ? (
                                        <>
                                            <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4 text-warning" />
                                                {t.rich('overdueAlert', {
                                                    count: status.invoices.count,
                                                    bold: (chunks) => <span className="text-warning font-bold">{chunks}</span>,
                                                })}
                                            </p>
                                            <p className="text-2xl font-bold font-mono text-card-foreground">
                                                {formatCurrency(status.invoices.amount)}
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-sm text-muted-foreground font-medium">
                                                {t('nextCollection')}
                                            </p>
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-xl font-bold font-mono text-card-foreground">
                                                    {formatCurrency(status.invoices.amount)}
                                                </span>
                                                <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                                                    {status.invoices.client}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-primary/70 mt-1">
                                                {status.invoices.date
                                                    ? t('paymentDue', { date: formatDate(status.invoices.date) })
                                                    : '-'}
                                            </p>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">{t('allClear')}</p>
                            )}
                        </div>

                        {/* Acciones de Facturación: Acreditar o Ir a listado */}
                        <div className="mt-3">
                            {status.invoices && status.invoices.id && !status.invoices.isOverdue ? (
                                <div className="flex items-center gap-2">
                                    <div className="flex-1">
                                        <CollectInvoiceModal
                                            invoiceId={status.invoices.id}
                                            clientName={status.invoices.client || 'Cliente'}
                                            amount={status.invoices.amount}
                                            currency={status.invoices.currency || 'ARS'}
                                            accounts={accounts}
                                        />
                                    </div>
                                    <Link href="/dashboard/finances/invoices" title={t('viewInvoices')}>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-foreground border-border hover:bg-muted"
                                        >
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <Link
                                    href={
                                        status.invoices?.isOverdue
                                            ? '/dashboard/finances/invoices?status=vencido'
                                            : '/dashboard/finances/invoices'
                                    }
                                >
                                    <Button
                                        className={cn(
                                            'w-full relative overflow-hidden text-white hover:text-white shadow-lg border-0 ring-0 group transition-all duration-300 h-8 text-xs cursor-pointer',
                                            status.invoices?.isOverdue
                                                ? 'bg-amber-600 shadow-amber-600/25 hover:shadow-amber-600/40 hover:bg-amber-600'
                                                : 'bg-primary shadow-primary/25 hover:shadow-primary/40 hover:bg-primary'
                                        )}
                                        size="sm"
                                    >
                                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                                        <span className="relative z-10 font-semibold flex items-center justify-center gap-2">
                                            {status.invoices?.isOverdue ? t('manageOverdue') : t('viewInvoices')}
                                            <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                                        </span>
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 3. AGENDA CARD */}
                <Card className="flex-1 bg-card border-l-4 border-l-primary border-y border-r border-border shadow-sm relative overflow-hidden group hover:border-primary/50 transition-colors">
                    <div className="absolute right-0 top-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Calendar className="h-20 w-20 text-primary" />
                    </div>
                    <CardContent className="p-5 flex flex-col justify-between h-full relative z-10">
                        <div>
                            <div className="flex items-center gap-2 text-primary mb-2">
                                <Calendar className="h-4 w-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">
                                    {tCommon('agenda')}
                                </span>
                            </div>

                            {status.agenda && status.agenda.count > 0 ? (
                                <div className="space-y-1">
                                    <p className="text-2xl font-bold font-mono text-card-foreground">
                                        {status.agenda.count}{' '}
                                        <span className="text-base font-normal text-muted-foreground font-sans">
                                            {t('events')}
                                        </span>
                                    </p>
                                    {status.agenda.nextEvent && (
                                        <p className="text-xs text-muted-foreground truncate">
                                            {t.rich('next', {
                                                title: status.agenda.nextEvent.title,
                                                date: formatDate(status.agenda.nextEvent.date),
                                                highlight: (chunks) => <span className="text-primary">{chunks}</span>,
                                            })}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground font-medium">{t('freeAgenda')}</p>
                                    <p className="text-xs text-muted-foreground">{t('agendaPrompt')}</p>
                                </div>
                            )}
                        </div>

                        {/* Botón Agenda */}
                        <div className="mt-3">
                            <Link href="/dashboard/agenda">
                                <Button
                                    className="w-full relative overflow-hidden bg-primary text-primary-foreground shadow-lg shadow-primary/25 border-0 ring-0 group transition-all duration-300 hover:shadow-primary/50 hover:bg-primary hover:text-primary-foreground h-8 text-xs cursor-pointer"
                                    size="sm"
                                >
                                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                                    <span className="relative z-10 font-semibold flex items-center justify-center gap-2">
                                        {status.agenda && status.agenda.count > 0 ? t('viewAgenda') : t('scheduleEvent')}
                                        <Plus className="h-3 w-3 transition-transform duration-300 group-hover:rotate-90" />
                                    </span>
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}