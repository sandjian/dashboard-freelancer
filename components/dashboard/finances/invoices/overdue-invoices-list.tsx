"use client";

import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { AnimatedExpandableList } from "@/components/ui/animated-expandable-list";
import { AlertTriangle, User, Calendar, Mail } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

interface OverdueInvoiceItem {
    id: string;
    client_name: string;
    amount: number;
    due_date: Date;
    issue_date: Date;
}

export function OverdueInvoicesList({ items }: { items: OverdueInvoiceItem[] }) {
    const t = useTranslations('Invoices');
    const locale = useLocale();

    return (
        <AnimatedExpandableList
            items={items}
            getKey={(item) => item.id}
            emptyMessage={t('noOverdueInvoices')}
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
                                    {t('filterOverdue')}
                                </Badge>
                            </div>
                            <span className="text-[10px] font-medium text-destructive">
                                {t('daysAgo', { days: daysOverdue })}
                            </span>
                        </div>
                    </div>
                )
            }}
            renderDetail={(item, onClose) => {
                const now = new Date();
                const due = new Date(item.due_date);
                const daysOverdue = Math.ceil((now.getTime() - due.getTime()) / (1000 * 3600 * 24));
                const formattedDueDate = due.toLocaleDateString(locale === 'es' ? 'es-AR' : 'en-US', { day: 'numeric', month: 'long' });
                const formattedShortDue = due.toLocaleDateString(locale === 'es' ? 'es-AR' : 'en-US');

                return (
                    <div className="flex flex-col gap-4 p-5 rounded-[var(--radius)] bg-popover border border-border shadow-xl">
                        <div className="flex flex-col items-center py-4 border-b border-border">
                            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-3 text-destructive border border-destructive/20">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-bold font-mono text-foreground">{formatCurrency(item.amount)}</h3>
                            <p className="text-sm text-muted-foreground font-medium">{t('overdueInvoice')}</p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <User className="h-4 w-4" />
                                    <span className="text-xs">{t('client')}</span>
                                </div>
                                <span className="text-xs font-medium text-foreground">{item.client_name}</span>
                            </div>

                            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span className="text-xs">{t('dueDate')}</span>
                                </div>
                                <span className="text-xs font-medium text-destructive">
                                    {formattedDueDate}
                                </span>
                            </div>

                            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
                                <p className="text-xs text-destructive">
                                    {t('overdueDelayMessage', { days: daysOverdue })}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <button
                                onClick={onClose}
                                className="w-full py-2 text-xs font-medium text-muted-foreground bg-transparent hover:bg-muted border border-border rounded-lg transition-colors cursor-pointer"
                            >
                                {t('back')}
                            </button>
                            <button
                                onClick={() => {
                                    const subject = encodeURIComponent(t('claimSubject', { client: item.client_name }));
                                    const body = encodeURIComponent(t('claimBody', { client: item.client_name, amount: formatCurrency(item.amount), date: formattedShortDue }));
                                    window.location.href = `mailto:?subject=${subject}&body=${body}`;
                                }}
                                className="w-full py-2 text-xs font-medium text-destructive-foreground bg-destructive hover:bg-destructive/90 border border-destructive rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                            >
                                <Mail className="h-3 w-3" /> {t('claim')}
                            </button>
                        </div>
                    </div>
                );
            }}
        />
    );
}
