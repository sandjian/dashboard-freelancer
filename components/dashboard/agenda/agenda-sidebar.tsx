"use client";

import { useTransition } from "react";
import Link from "next/link";
import { format, isSameDay } from "date-fns";
import { useLocale, useTranslations } from "next-intl";
import { getDateFnsLocale } from "@/lib/date-locale";
import { CalendarEvent, Client } from "@/lib/definitions";
import { toggleTaskStatus } from "@/lib/actions/agenda";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Calendar as CalendarIcon,
    Plus,
    Clock,
    CheckCircle2,
    CalendarDays,
    FileText,
    ExternalLink,
    AlertCircle,
    User
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AgendaSidebarProps {
    events: CalendarEvent[];
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
    onNewEvent: (initialDate?: Date) => void;
    onEditEvent: (event: CalendarEvent) => void;
    clients?: Client[];
}

export function AgendaSidebar({
    events,
    selectedDate,
    onSelectDate,
    onNewEvent,
    onEditEvent,
}: AgendaSidebarProps) {
    const t = useTranslations("Agenda");
    const locale = useLocale();
    const dateLocale = getDateFnsLocale(locale);
    const [isPending, startTransition] = useTransition();

    const isToday = isSameDay(selectedDate, new Date());

    // Events scheduled on the selected day
    const dayEvents = events.filter((e) =>
        isSameDay(new Date(e.start_time), selectedDate)
    );

    // Backlog / Notes: pending tasks or general notes/reminders (either general or across all events)
    const backlogItems = events.filter(
        (e) => (e.type === "task" && e.status === "pending") || e.type === "reminder"
    );

    const handleToggle = (event: CalendarEvent) => {
        const nextStatus = event.status === "completed" ? "pending" : "completed";
        startTransition(async () => {
            await toggleTaskStatus(event.id, nextStatus);
        });
    };

    const getPriorityDot = (priority?: string) => {
        switch (priority) {
            case "urgent":
                return <span className="w-2 h-2 rounded-full bg-foreground shadow-sm shrink-0" title={t("priorityUrgent")} />;
            case "high":
                return <span className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-300 shrink-0" title={t("priorityHigh")} />;
            case "medium":
                return <span className="w-2 h-2 rounded-full bg-zinc-500/70 shrink-0" title={t("priorityMedium")} />;
            case "low":
            default:
                return <span className="w-2 h-2 rounded-full bg-zinc-600/40 shrink-0" title={t("priorityLow")} />;
        }
    };

    return (
        <aside className="flex flex-col h-full bg-card rounded-xl border border-border/80 shadow-sm overflow-hidden">
            {/* Header: Selected Date & New Action */}
            <div className="p-4 border-b border-border/60 bg-muted/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-card dark:bg-secondary/30 flex items-center justify-center text-foreground shrink-0 border border-border/50">
                        <CalendarDays className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-foreground capitalize">
                                {format(
                                    selectedDate,
                                    locale === "es" ? "EEEE d 'de' MMMM" : "EEEE, MMMM d",
                                    { locale: dateLocale }
                                )}
                            </h3>
                            {isToday && (
                                <span className="text-[10px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                                    {t("todayButton")}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {t("scheduledActivities", { count: dayEvents.length })}
                        </p>
                    </div>
                </div>

                <Button
                    size="sm"
                    onClick={() => onNewEvent(selectedDate)}
                    className="h-8 gap-1.5 px-3 text-xs font-semibold shrink-0 bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white shadow-sm transition-colors cursor-pointer"
                >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t("newButton")}</span>
                </Button>
            </div>

            {/* Content: Scrollable Feed */}
            <div className="flex-1 overflow-y-auto divide-y divide-border/40 p-4 space-y-6">
                {/* 1. Day's scheduled activities */}
                <section className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-muted-foreground/70" />
                            {t("dayAgendaTitle")}
                        </span>
                        <span className="text-[11px] text-muted-foreground/80 font-mono">
                            {dayEvents.filter(e => e.status === "completed").length}/{dayEvents.length}
                        </span>
                    </div>

                    {dayEvents.length === 0 ? (
                        <div className="py-6 px-4 text-center rounded-lg border border-dashed border-border/60 bg-muted/10">
                            <CalendarIcon className="w-7 h-7 mx-auto mb-2 text-muted-foreground/40 stroke-[1.5]" />
                            <p className="text-xs font-medium text-foreground">{t("noActivitiesToday")}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                {t("noActivitiesTodayPrompt")}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {dayEvents.map((event) => {
                                const isCompleted = event.status === "completed";
                                const isTask = event.type === "task";

                                return (
                                    <div
                                        key={event.id}
                                        onClick={() => onEditEvent(event)}
                                        className={cn(
                                            "group p-3 rounded-lg border border-border/60 bg-background/60 hover:bg-muted/30 transition-all cursor-pointer relative flex items-start gap-3",
                                            isCompleted && "bg-muted/20 border-border/30"
                                        )}
                                    >
                                        {/* Action Checkbox or Type Icon */}
                                        {isTask ? (
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleToggle(event);
                                                }}
                                                className="mt-0.5 cursor-pointer"
                                            >
                                                <Checkbox
                                                    checked={isCompleted}
                                                    disabled={isPending}
                                                    className="h-4 w-4 border-muted-foreground/50 data-[state=checked]:bg-foreground data-[state=checked]:border-foreground"
                                                />
                                            </div>
                                        ) : (
                                            <div className="mt-0.5 text-muted-foreground shrink-0">
                                                <Clock className="w-4 h-4 text-zinc-400" />
                                            </div>
                                        )}

                                        {/* Main Event Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 justify-between">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    {getPriorityDot(event.priority)}
                                                    <p
                                                        className={cn(
                                                            "text-xs font-semibold text-foreground truncate",
                                                            isCompleted && "line-through text-muted-foreground opacity-60 font-normal"
                                                        )}
                                                    >
                                                        {event.title}
                                                    </p>
                                                </div>

                                                <span className="text-[11px] font-mono text-muted-foreground shrink-0">
                                                    {format(new Date(event.start_time), "HH:mm")}
                                                </span>
                                            </div>

                                            {event.description && (
                                                <p
                                                    className={cn(
                                                        "text-[11px] text-muted-foreground/90 line-clamp-2 mt-1",
                                                        isCompleted && "opacity-50"
                                                    )}
                                                >
                                                    {event.description}
                                                </p>
                                            )}

                                            {/* Client Link Pill */}
                                            {event.related_client_id && (
                                                <div className="mt-2 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                                    <Link
                                                        href={`/dashboard/finances/clients/${event.related_client_id}`}
                                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                                                    >
                                                        <User className="w-2.5 h-2.5" />
                                                        <span className="truncate max-w-[140px]">
                                                             {event.client_name || t("linkedClient")}
                                                        </span>
                                                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* 2. Notas & Backlog */}
                <section className="pt-5 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-muted-foreground/70" />
                            {t("notesBacklogTitle")}
                        </span>
                        <span className="text-[11px] text-muted-foreground/80 font-mono">
                            {t("pendingCount", { count: backlogItems.length })}
                        </span>
                    </div>

                    {backlogItems.length === 0 ? (
                        <div className="py-4 text-center">
                            <p className="text-xs text-muted-foreground/70">
                                {t("noPendingBacklog")}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {backlogItems.slice(0, 10).map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => onEditEvent(item)}
                                    className="p-2.5 rounded-lg border border-border/50 bg-background/40 hover:bg-muted/30 transition-all cursor-pointer flex items-start gap-2.5"
                                >
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggle(item);
                                        }}
                                        className="mt-0.5 cursor-pointer"
                                    >
                                        <Checkbox
                                            checked={item.status === "completed"}
                                            disabled={isPending}
                                            className="h-3.5 w-3.5 border-muted-foreground/50 data-[state=checked]:bg-foreground"
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-1.5">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                {getPriorityDot(item.priority)}
                                                <p className="text-xs font-medium text-foreground truncate">
                                                    {item.title}
                                                </p>
                                            </div>
                                            <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                                                {format(new Date(item.start_time), "dd/MM")}
                                            </span>
                                        </div>

                                        {item.related_client_id && (
                                            <div className="mt-1.5" onClick={(e) => e.stopPropagation()}>
                                                <Link
                                                    href={`/dashboard/finances/clients/${item.related_client_id}`}
                                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
                                                >
                                                    <span className="truncate max-w-[120px]">
                                                        {item.client_name || "Cliente"}
                                                    </span>
                                                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </aside>
    );
}
