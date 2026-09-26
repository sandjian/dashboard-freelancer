'use client';

import { ClientWithStats } from "@/lib/definitions";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, FileText, AlertTriangle, Clock, TrendingUp } from "lucide-react";
import { TranslucentImpactCard } from "@/components/dashboard/finances/invoices/translucent-impact-card";
import { useTranslations } from "next-intl";

export function ClientStats({ client }: { client: ClientWithStats }) {
    const t = useTranslations('Clients');
    const totalBilled = client.total_billed || client.total_revenue || 0;
    const averageTicket = client.total_invoices > 0 ? totalBilled / client.total_invoices : 0;
    const hasOverdue = (client.overdue_amount || 0) > 0 || (client.overdue_invoices || 0) > 0;
    const hasPending = (client.pending_amount || 0) > 0 || (client.pending_invoices || 0) > 0;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <TranslucentImpactCard
                title={t('totalCollected')}
                value={formatCurrency(client.total_revenue || 0)}
                subtitle={t('billedSub', { amount: formatCurrency(totalBilled) })}
                trend={t('collectedTrend')}
                icon={DollarSign}
            />

            <TranslucentImpactCard
                title={t('receivables')}
                value={formatCurrency(client.pending_amount || 0)}
                subtitle={t('pendingInvoicesSub', { count: client.pending_invoices || 0 })}
                trend={hasPending ? t('pendingTrend') : t('upToDate')}
                icon={Clock}
            />

            <TranslucentImpactCard
                title={t('unpaidDebt')}
                value={formatCurrency(client.overdue_amount || 0)}
                subtitle={t('overdueInvoicesSub', { count: client.overdue_invoices || 0 })}
                trend={hasOverdue ? t('overdueTrend') : t('upToDate')}
                icon={AlertTriangle}
                className={hasOverdue ? "border-destructive/30" : ""}
            />

            <TranslucentImpactCard
                title={t('averageTicket')}
                value={formatCurrency(averageTicket)}
                subtitle={t('invoicesEmittedSub', { count: client.total_invoices })}
                trend={t('averageTrend')}
                icon={TrendingUp}
            />
        </div>
    );
}
