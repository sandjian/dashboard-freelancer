"use client";

import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { AnimatedExpandableList } from "@/components/ui/animated-expandable-list";
import { AlertTriangle, User, Calendar, Mail } from "lucide-react";

interface OverdueInvoiceItem {
    id: string;
    client_name: string;
    amount: number;
    due_date: Date;
    issue_date: Date;
}

export function OverdueInvoicesList({ items }: { items: OverdueInvoiceItem[] }) {

    return (
        <AnimatedExpandableList
            items={items}
            getKey={(item) => item.id}
            emptyMessage="No hay facturas vencidas."
            renderItem={(item) => {
                const now = new Date();
                const due = new Date(item.due_date);
                const daysOverdue = Math.ceil((now.getTime() - due.getTime()) / (1000 * 3600 * 24));

                return (
                    <div className="group flex flex-col gap-1 p-3 rounded-xl bg-muted/40 hover:bg-muted/70 border border-border transition-all">
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-medium text-foreground truncate max-w-[120px]" title={item.client_name}>
                                {item.client_name}
                            </span>
                            <span className="text-xs font-bold font-mono text-muted-foreground">{formatCurrency(item.amount)}</span>
                        </div>

                        <div className="flex justify-between items-center mt-1">
                            <div className="flex items-center gap-1">
                                <Badge variant="outline" className="text-[9px] px-2 py-0.5 border border-destructive/20 text-destructive bg-destructive/10">
                                    Vencido
                                </Badge>
                            </div>
                            <span className="text-[10px] font-medium text-destructive">
                                Hace {daysOverdue} días
                            </span>
                        </div>
                    </div>
                )
            }}
            renderDetail={(item, onClose) => {
                const now = new Date();
                const due = new Date(item.due_date);
                const daysOverdue = Math.ceil((now.getTime() - due.getTime()) / (1000 * 3600 * 24));

                return (
                    <div className="flex flex-col gap-4 p-5 rounded-[var(--radius)] bg-popover border border-border shadow-xl">
                        <div className="flex flex-col items-center py-4 border-b border-border">
                            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-3 text-destructive border border-destructive/20">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-bold font-mono text-foreground">{formatCurrency(item.amount)}</h3>
                            <p className="text-sm text-muted-foreground font-medium">Factura Vencida</p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <User className="h-4 w-4" />
                                    <span className="text-xs">Cliente</span>
                                </div>
                                <span className="text-xs font-medium text-foreground">{item.client_name}</span>
                            </div>

                            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span className="text-xs">Fecha Venc.</span>
                                </div>
                                <span className="text-xs font-medium text-destructive">
                                    {due.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}
                                </span>
                            </div>

                            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
                                <p className="text-xs text-destructive">
                                    Esta factura tiene {daysOverdue} días de retraso.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <button
                                onClick={onClose}
                                className="w-full py-2 text-xs font-medium text-muted-foreground bg-transparent hover:bg-muted border border-border rounded-lg transition-colors cursor-pointer"
                            >
                                Volver
                            </button>
                            <button
                                onClick={() => {
                                    const subject = encodeURIComponent(`Recordatorio de Factura Vencida - ${item.client_name}`);
                                    const body = encodeURIComponent(`Hola ${item.client_name},\n\nLe escribimos para recordarle que la factura por el monto de ${formatCurrency(item.amount)} con fecha de vencimiento el ${due.toLocaleDateString('es-AR')} se encuentra vencida.\n\nAgradecemos su pronto pago.\n\nSaludos.`);
                                    window.location.href = `mailto:?subject=${subject}&body=${body}`;
                                }}
                                className="w-full py-2 text-xs font-medium text-destructive-foreground bg-destructive hover:bg-destructive/90 border border-destructive rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                            >
                                <Mail className="h-3 w-3" /> Reclamar
                            </button>
                        </div>
                    </div>
                );
            }}
        />
    );
}
