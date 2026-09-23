import { formatCurrency } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ClockIcon, AlertCircleIcon, CheckCircle2Icon } from 'lucide-react';

// Helper for Initials
function getInitials(name: string) {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

// Helper for Date Format
function formatDate(date: Date) {
    return new Date(date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
}

type InvoiceItem = {
    id: string;
    client_name: string;
    image_url?: string;
    amount: number;
    issue_date?: Date;
    due_date?: Date;
    status: string;
};

export function InvoiceSidePanel({
    lastIssued,
    overdue
}: {
    lastIssued: InvoiceItem[],
    overdue: InvoiceItem[]
}) {
    return (
        <div className="space-y-6">

            {/* 1. Modulo: Últimas Facturas Emitidas */}
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden text-card-foreground">
                <div className="p-4 border-b border-border bg-muted/40 flex justify-between items-center">
                    <h3 className="font-semibold text-foreground text-sm">Últimas Emitidas</h3>
                    <CheckCircle2Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="divide-y divide-border">
                    {lastIssued.length === 0 ? (
                        <div className="p-4 text-xs text-muted-foreground text-center">No hay facturas recientes.</div>
                    ) : (
                        lastIssued.map((inv) => (
                            <div key={inv.id} className="p-3 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8 border border-border">
                                        <AvatarImage src={inv.image_url} />
                                        <AvatarFallback className="bg-muted/40 text-[10px] text-muted-foreground">{getInitials(inv.client_name)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-xs font-medium text-foreground truncate max-w-[100px]">{inv.client_name}</p>
                                        <p className="text-[10px] text-muted-foreground">{inv.issue_date ? formatDate(inv.issue_date) : '-'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-foreground">{formatCurrency(inv.amount)}</p>
                                    <Badge variant="outline" className={
                                        inv.status === 'facturado' ? 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10' :
                                            inv.status === 'pendiente' ? 'text-amber-500 border-amber-500/30 bg-amber-500/10' :
                                                'text-destructive border-destructive/30 bg-destructive/10'
                                    }>
                                        {inv.status}
                                    </Badge>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* 2. Modulo: Facturas Vencidas (Alerta) */}
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/40 flex justify-between items-center">
                    <h3 className="font-semibold text-foreground text-sm">Vencidas / Pendientes</h3>
                    <AlertCircleIcon className="w-4 h-4 text-destructive animate-pulse" />
                </div>
                <div className="divide-y divide-border">
                    {overdue.length === 0 ? (
                        <div className="p-4 text-xs text-muted-foreground text-center">¡Al día! No tienes facturas vencidas.</div>
                    ) : (
                        overdue.map((inv) => (
                            <div key={inv.id} className="p-3 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-muted/40 flex items-center justify-center border border-destructive/20 text-destructive text-xs font-bold">
                                        !
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-foreground truncate max-w-[100px]">{inv.client_name}</p>
                                        <p className="text-[10px] text-destructive">Vence: {inv.due_date ? formatDate(inv.due_date) : '-'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-foreground">{formatCurrency(inv.amount)}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>
    );
}
