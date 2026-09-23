import { AlertTriangle, BellRing, CalendarDays, Clock, Zap } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export interface CardAlertItem {
    type: 'warning' | 'info';
    title: string;
    description: string;
    date?: Date;
}

interface CardAlertsProps {
    alerts: CardAlertItem[];
}

export function CardAlerts({ alerts }: CardAlertsProps) {
    if (alerts.length === 0) return null;

    return (
        <div className="rounded-[var(--radius)] border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-secondary/40 hover:bg-secondary/30 dark:bg-foreground/90 dark:hover:bg-foreground text-secondary-foreground dark:text-background transition-colors">
                    <Zap className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-foreground tracking-tight">Alertas</h3>
            </div>

            <div className="space-y-3">
                {alerts.map((alert, index) => {
                    const isWarning = alert.type === 'warning';
                    const Icon = isWarning ? AlertTriangle : BellRing;

                    return (
                        <div
                            key={index}
                            className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-2 transition-all hover:bg-muted/60"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <Icon className={cn("w-4 h-4 shrink-0", isWarning ? "text-amber-500" : "text-foreground/70")} />
                                    <h4 className="text-xs font-semibold text-foreground tracking-tight">
                                        {alert.title}
                                    </h4>
                                </div>
                                {alert.date && (
                                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-mono text-muted-foreground border border-border bg-background/50">
                                        <CalendarDays className="mr-1 h-3 w-3" />
                                        {formatDate(alert.date)}
                                    </span>
                                )}
                            </div>

                            <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                                {alert.description}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

