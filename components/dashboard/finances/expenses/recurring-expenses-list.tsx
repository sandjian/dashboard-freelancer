"use client";

import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { AnimatedExpandableList } from "@/components/ui/animated-expandable-list";
import { CalendarClock, CreditCard, Tag } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

interface RecurringExpenseItem {
    id: string; // Template ID
    concept: string;
    amount: number;
    category_name: string;
    next_due_date: Date;
    frequency?: string;
    payment_method?: string;
}

export function RecurringExpensesList({ items }: { items: RecurringExpenseItem[] }) {
    const t = useTranslations('Expenses');
    const locale = useLocale();

    return (
        <AnimatedExpandableList
            items={items}
            getKey={(item) => item.id}
            emptyMessage={t('noUpcomingRecurring')}
            renderItem={(item) => {
                const daysUntil = Math.ceil((new Date(item.next_due_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                const isClose = daysUntil <= 7;

                return (
                    <div className="group flex flex-col gap-1 p-3 rounded-xl bg-muted/40 hover:bg-muted/70 border border-border transition-all">
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-medium text-foreground truncate max-w-[150px]" title={item.concept}>
                                {item.concept}
                            </span>
                            <span className="text-xs font-bold font-mono text-secondary/40 dark:text-foreground/90">{formatCurrency(item.amount)}</span>
                        </div>

                        <div className="flex justify-between items-center mt-1">
                            <div className="flex items-center gap-1">
                                <span className="inline-flex items-center text-[10px] font-mono px-2 py-0.5 rounded-md border border-border bg-muted/30 text-muted-foreground">
                                    {item.category_name}
                                </span>
                            </div>
                            <span className={`text-[10px] font-medium ${isClose ? 'text-destructive' : 'text-muted-foreground'}`}>
                                {daysUntil > 0 ? t('inDays', { days: daysUntil }) : t('todayOrOverdue')}
                            </span>
                        </div>
                    </div>
                )
            }}
            renderDetail={(item, onClose) => (
                <div className="flex flex-col gap-4 p-5 rounded-[var(--radius)] bg-popover border border-border shadow-xl">
                    <div className="flex flex-col items-center py-4 border-b border-border">
                        <div className="h-12 w-12 rounded-full bg-secondary/40 hover:bg-secondary/30 dark:bg-foreground/90 dark:hover:bg-foreground flex items-center justify-center mb-3 text-secondary-foreground dark:text-background border border-border transition-colors">
                            <CalendarClock className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-bold font-mono text-foreground">{formatCurrency(item.amount)}</h3>
                        <p className="text-sm text-muted-foreground font-medium">{item.concept}</p>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/40">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Tag className="h-4 w-4" />
                                <span className="text-xs">{t('tableCategory')}</span>
                            </div>
                            <span className="text-xs font-medium font-mono text-foreground">{item.category_name}</span>
                        </div>

                        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/40">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <CalendarClock className="h-4 w-4" />
                                <span className="text-xs">{t('tableDate')}</span>
                            </div>
                            <span className="text-xs font-medium text-foreground">
                                {new Date(item.next_due_date).toLocaleDateString(locale === 'es' ? 'es-AR' : 'en-US', { day: 'numeric', month: 'long' })}
                            </span>
                        </div>

                        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/40">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <CreditCard className="h-4 w-4" />
                                <span className="text-xs">{t('tableMethod')}</span>
                            </div>
                            <span className="text-xs font-medium text-foreground capitalize">
                                {item.payment_method?.replace(/_/g, ' ') || 'Definido en Plantilla'}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-2.5 mt-2 text-xs font-medium text-muted-foreground hover:text-foreground bg-transparent hover:bg-muted border border-border rounded-xl transition-all cursor-pointer"
                    >
                        {t('back')}
                    </button>
                </div>
            )}
        />
    );
}
