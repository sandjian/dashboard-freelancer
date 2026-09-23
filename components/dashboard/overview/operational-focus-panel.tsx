"use client";

import { useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarEvent } from "@/lib/definitions";
import { UpcomingDueItem } from "@/lib/data";
import { toggleTaskStatus } from "@/lib/actions/agenda";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, cn } from "@/lib/utils";
import {
    CalendarDays,
    AlertOctagon,
    Clock,
    ArrowRight,
    CheckCircle2,
    Calendar,
    Receipt,
    CreditCard
} from "lucide-react";

interface OperationalFocusPanelProps {
    todayEvents: CalendarEvent[];
    upcomingDues: UpcomingDueItem[];
}

export function OperationalFocusPanel({
    todayEvents,
    upcomingDues,
}: OperationalFocusPanelProps) {
    const [isPending, startTransition] = useTransition();

    const handleToggleTask = (event: CalendarEvent) => {
        const nextStatus = event.status === "completed" ? "pending" : "completed";
        startTransition(async () => {
            await toggleTaskStatus(event.id, nextStatus);
        });
    };

    return (
        <div className="space-y-6">
            {/* 1. Widget: Foco de Hoy / Agenda */}
            <div className="rounded-[var(--radius)] border border-border bg-card p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-secondary/40 hover:bg-secondary/30 dark:bg-foreground/90 dark:hover:bg-foreground text-secondary-foreground dark:text-background transition-colors">
                            <CalendarDays className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-foreground tracking-tight">Foco de Hoy</h3>
                            <p className="text-[11px] text-muted-foreground capitalize">
                                {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/dashboard/agenda"
                        className="text-xs font-semibold text-foreground hover:underline transition-all flex items-center gap-1"
                    >
                        <span>Ver Agenda</span>
                        <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>

                {todayEvents.length === 0 ? (
                    <div className="p-4 rounded-xl bg-muted/20 border border-dashed border-border text-center">
                        <p className="text-xs font-medium text-foreground">Agenda despejada</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                            No tienes tareas pendientes programadas para hoy.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {todayEvents.map((event) => {
                            const isCompleted = event.status === "completed";

                            return (
                                <div
                                    key={event.id}
                                    className={cn(
                                        "flex items-start gap-2.5 p-3 rounded-xl bg-muted/40 hover:bg-muted/70 border border-border transition-all group",
                                        isCompleted && "opacity-50 line-through bg-muted/20"
                                    )}
                                >
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleTask(event);
                                        }}
                                        className="mt-0.5 cursor-pointer"
                                    >
                                        <Checkbox
                                            checked={isCompleted}
                                            disabled={isPending}
                                            className="h-4 w-4 border-muted-foreground/60 data-[state=checked]:bg-foreground data-[state=checked]:border-foreground"
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-1">
                                            <span className="text-xs font-medium text-foreground truncate">
                                                {event.title}
                                            </span>
                                            <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                                                {format(new Date(event.start_time), "HH:mm")}
                                            </span>
                                        </div>

                                        {event.client_name && (
                                            <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                                                {event.client_name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* 2. Próximos Vencimientos */}
            <div className="rounded-[var(--radius)] border border-border bg-card p-5 sm:p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-secondary/40 hover:bg-secondary/30 dark:bg-foreground/90 dark:hover:bg-foreground text-secondary-foreground dark:text-background transition-colors">
                            <Clock className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground tracking-tight">Próximos Vencimientos</h3>
                    </div>
                    <Link
                        href="/dashboard/finances/invoices?status=pendiente"
                        className="text-xs font-semibold text-foreground hover:underline transition-all"
                    >
                        Ver todos
                    </Link>
                </div>

                {upcomingDues.length === 0 ? (
                    <div className="p-4 rounded-xl bg-muted/20 border border-dashed border-border text-center">
                        <p className="text-xs font-medium text-foreground">Sin vencimientos cercanos</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                            Todos tus pagos y cobros se encuentran al día.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {upcomingDues.map((item) => {
                            const isInvoice = item.type === "invoice";
                            const Icon = isInvoice ? Receipt : CreditCard;

                            return (
                                <Link
                                    key={item.id}
                                    href={item.targetUrl}
                                    className="flex flex-col gap-1 p-3 rounded-xl bg-muted/40 hover:bg-muted/70 border border-border transition-all group"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-1.5 min-w-0 pr-2">
                                            <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                            <span className="text-xs font-medium text-foreground truncate" title={item.title}>
                                                {item.title}
                                            </span>
                                        </div>
                                        <span className="text-xs font-bold font-mono text-foreground shrink-0">
                                            {formatCurrency(item.amount)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center mt-1">
                                        <div className="flex items-center gap-1.5">
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "text-[10px] px-2 py-0.2 font-normal border",
                                                    item.isOverdue
                                                        ? "border-destructive/30 text-destructive bg-destructive/10"
                                                        : "border-border text-muted-foreground bg-card"
                                                )}
                                            >
                                                {item.isOverdue ? "Vencido" : isInvoice ? "Por cobrar" : "A pagar"}
                                            </Badge>
                                        </div>

                                        <span className="text-[10px] font-mono text-muted-foreground">
                                            {format(new Date(item.dueDate), "dd MMM")}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
