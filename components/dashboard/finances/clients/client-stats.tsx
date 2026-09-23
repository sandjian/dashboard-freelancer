'use client';

import { ClientWithStats } from "@/lib/definitions";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, FileText, AlertTriangle, Clock, TrendingUp } from "lucide-react";
import { TranslucentImpactCard } from "@/components/dashboard/finances/invoices/translucent-impact-card";

export function ClientStats({ client }: { client: ClientWithStats }) {
    const totalBilled = client.total_billed || client.total_revenue || 0;
    const averageTicket = client.total_invoices > 0 ? totalBilled / client.total_invoices : 0;
    const hasOverdue = (client.overdue_amount || 0) > 0 || (client.overdue_invoices || 0) > 0;
    const hasPending = (client.pending_amount || 0) > 0 || (client.pending_invoices || 0) > 0;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <TranslucentImpactCard
                title="Recaudación Total"
                value={formatCurrency(client.total_revenue || 0)}
                subtitle={`Facturado: ${formatCurrency(totalBilled)}`}
                trend="Cobrado"
                icon={DollarSign}
            />

            <TranslucentImpactCard
                title="Por Cobrar"
                value={formatCurrency(client.pending_amount || 0)}
                subtitle={`${client.pending_invoices || 0} facturas a término`}
                trend={hasPending ? "Vigente" : "Al día"}
                icon={Clock}
            />

            <TranslucentImpactCard
                title="Mora Impaga"
                value={formatCurrency(client.overdue_amount || 0)}
                subtitle={`${client.overdue_invoices || 0} facturas vencidas`}
                trend={hasOverdue ? "Vencido" : "Al día"}
                icon={AlertTriangle}
                className={hasOverdue ? "border-destructive/30" : ""}
            />

            <TranslucentImpactCard
                title="Ticket Promedio"
                value={formatCurrency(averageTicket)}
                subtitle={`${client.total_invoices} facturas emitidas`}
                trend="Promedio"
                icon={TrendingUp}
            />
        </div>
    );
}
