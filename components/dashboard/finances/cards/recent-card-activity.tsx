"use client";

import { formatCurrency, formatDate } from "@/lib/utils";
import { CreditCard, CalendarDays, Tag, Wallet } from "lucide-react";
import { AnimatedExpandableList } from "@/components/ui/animated-expandable-list";
import { Badge } from "@/components/ui/badge";

interface ActivityItem {
    concept: string;
    amount: number;
    date: Date;
    card_name: string;
    card_color: string;
    category_name?: string | null;
}

interface RecentCardActivityProps {
    activity: ActivityItem[];
}

export function RecentCardActivity({ activity }: RecentCardActivityProps) {
    return (
        <div className="rounded-[var(--radius)] border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-secondary/40 hover:bg-secondary/30 dark:bg-foreground/90 dark:hover:bg-foreground text-secondary-foreground dark:text-background transition-colors">
                    <Wallet className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-foreground tracking-tight">Últimos Movimientos</h3>
            </div>

            <div>
                <AnimatedExpandableList
                    items={activity}
                    getKey={(item) => `${item.concept}-${item.date.getTime()}-${item.amount}`}
                    emptyMessage="No hay movimientos recientes."
                    renderItem={(item) => (
                        <div className="group flex flex-col gap-1 p-3 rounded-xl bg-muted/30 border border-border hover:bg-muted/50 transition-all">
                            <div className="flex justify-between items-start">
                                <span className="text-xs font-medium text-foreground truncate max-w-[160px]" title={item.concept}>
                                    {item.concept}
                                </span>
                                <span className="text-xs font-mono font-bold text-foreground">{formatCurrency(item.amount)}</span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                                <Badge variant="outline" className="text-[10px] px-2 py-0 h-4 border border-border bg-secondary/30 text-secondary-foreground font-mono font-normal">
                                    {item.card_name}
                                </Badge>
                                <span className="text-[10px] font-mono text-muted-foreground">{formatDate(item.date)}</span>
                            </div>
                        </div>
                    )}
                    renderDetail={(item, onClose) => (
                        <div className="flex flex-col gap-4 p-4 rounded-xl bg-popover border border-border shadow-lg">
                            <div className="flex flex-col items-center py-3 border-b border-border">
                                <div className="h-11 w-11 rounded-xl flex items-center justify-center mb-2 bg-secondary/40 text-foreground border border-border">
                                    <Wallet className="h-5 w-5" />
                                </div>
                                <h4 className="text-base font-bold font-mono text-foreground">{formatCurrency(item.amount)}</h4>
                                <p className="text-xs text-muted-foreground text-center px-2">{item.concept}</p>
                            </div>
                            <div className="space-y-2 text-xs">
                                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <CreditCard className="h-3.5 w-3.5" />
                                        <span>Tarjeta</span>
                                    </div>
                                    <span className="font-medium text-foreground">{item.card_name}</span>
                                </div>
                                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Tag className="h-3.5 w-3.5" />
                                        <span>Categoría</span>
                                    </div>
                                    <span className="font-medium text-foreground">{item.category_name || '—'}</span>
                                </div>
                                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <CalendarDays className="h-3.5 w-3.5" />
                                        <span>Fecha</span>
                                    </div>
                                    <span className="font-mono text-foreground">{formatDate(item.date)}</span>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-full py-2 mt-1 text-xs font-semibold text-foreground bg-secondary/40 hover:bg-secondary/30 rounded-xl border border-border transition-colors cursor-pointer"
                            >
                                Cerrar
                            </button>
                        </div>
                    )}
                />
            </div>
        </div>
    );
}

