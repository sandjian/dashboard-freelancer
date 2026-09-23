"use client"

import { useState } from "react"
import { CalendarEvent, Client } from "@/lib/definitions"
import { EventDialog } from "./event-dialog"
import { AgendaSidebar } from "./agenda-sidebar"
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    addMonths,
    subMonths,
    getDay
} from "date-fns"
import { es } from "date-fns/locale"
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Clock, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toggleTaskStatus } from "@/lib/actions/agenda"

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export function CalendarView({
    events,
    clients = [],
}: {
    events: CalendarEvent[]
    clients?: Client[]
}) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Calculate empty slots for grid alignment
    const startDay = getDay(monthStart); // 0 (Sun) to 6 (Sat)
    const emptySlots = Array(startDay).fill(null);

    function navPrev() { setCurrentMonth(subMonths(currentMonth, 1)); }
    function navNext() { setCurrentMonth(addMonths(currentMonth, 1)); }
    function navToday() {
        const today = new Date();
        setCurrentMonth(today);
        setSelectedDate(today);
    }

    function handleDateClick(date: Date) {
        setSelectedDate(date);
    }

    function handleDateDoubleClick(date: Date) {
        setSelectedDate(date);
        setSelectedEvent(null);
        setIsDialogOpen(true);
    }

    function handleEventClick(e: React.MouseEvent, event: CalendarEvent) {
        e.stopPropagation();
        setSelectedEvent(event);
        setSelectedDate(new Date(event.start_time));
        setIsDialogOpen(true);
    }

    function handleNewEvent(initialDate?: Date) {
        if (initialDate) setSelectedDate(initialDate);
        setSelectedEvent(null);
        setIsDialogOpen(true);
    }

    function handleEditEvent(event: CalendarEvent) {
        setSelectedEvent(event);
        setSelectedDate(new Date(event.start_time));
        setIsDialogOpen(true);
    }

    async function handleTaskToggle(e: React.MouseEvent, event: CalendarEvent) {
        e.stopPropagation();
        const newStatus = event.status === 'completed' ? 'pending' : 'completed';
        await toggleTaskStatus(event.id, newStatus);
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Main Calendar Column (~68-70%) */}
            <div className="lg:col-span-8 flex flex-col bg-card rounded-xl border border-border/80 shadow-sm overflow-hidden min-h-[640px]">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between p-4 border-b border-border/80 bg-muted/20 gap-3">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold capitalize text-foreground tracking-tight">
                            {format(currentMonth, "MMMM yyyy", { locale: es })}
                        </h2>
                        <div className="flex items-center rounded-lg border border-border/80 bg-background shadow-xs overflow-hidden">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={navPrev}
                                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-none"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={navToday}
                                className="h-8 px-2.5 font-medium text-xs border-x border-border/80 rounded-none text-foreground hover:bg-muted"
                            >
                                Hoy
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={navNext}
                                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-none"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500/80"></span> Reunión
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500/80"></span> Tarea
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-zinc-400"></span> Nota
                        </span>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleNewEvent(selectedDate)}
                            className="h-8 gap-1 text-xs border-border/80 ml-2"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Crear</span>
                        </Button>
                    </div>
                </div>

                {/* Grid Header */}
                <div className="grid grid-cols-7 border-b border-border/70 bg-muted/40">
                    {DAYS.map(day => (
                        <div key={day} className="p-2 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Grid Body */}
                <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-card">
                    {emptySlots.map((_, i) => (
                        <div key={`empty-${i}`} className="min-h-[96px] border-b border-r border-border/50 bg-muted/5" />
                    ))}

                    {daysInMonth.map(date => {
                        const dayEvents = events.filter(e => isSameDay(new Date(e.start_time), date));
                        const isToday = isSameDay(date, new Date());
                        const isSelected = isSameDay(date, selectedDate);

                        return (
                            <div
                                key={date.toISOString()}
                                className={cn(
                                    "min-h-[96px] p-2 border-b border-r border-border/60 transition-all cursor-pointer relative group flex flex-col select-none",
                                    isSelected && "bg-muted/30 dark:bg-muted/20 ring-1 ring-inset ring-border/80",
                                    isToday && !isSelected && "bg-primary/5",
                                    !isSelected && !isToday && "hover:bg-muted/20"
                                )}
                                onClick={() => handleDateClick(date)}
                                onDoubleClick={() => handleDateDoubleClick(date)}
                            >
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className={cn(
                                        "text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full transition-colors",
                                        isToday
                                            ? "bg-primary text-primary-foreground font-bold"
                                            : isSelected
                                                ? "bg-foreground text-background font-bold"
                                                : "text-muted-foreground group-hover:text-foreground"
                                    )}>
                                        {format(date, "d")}
                                    </span>
                                    {isToday && (
                                        <span className="text-[9px] font-bold text-primary uppercase">Hoy</span>
                                    )}
                                </div>

                                <div className="space-y-1 overflow-hidden flex-1">
                                    {dayEvents.slice(0, 3).map(ev => {
                                        const isCompleted = ev.status === 'completed';

                                        return (
                                            <div
                                                key={ev.id}
                                                onClick={(e) => handleEventClick(e, ev)}
                                                className={cn(
                                                    "text-[11px] px-1.5 py-0.5 rounded truncate flex items-center gap-1.5 border transition-all",
                                                    ev.type === 'meeting'
                                                        ? "bg-blue-500/10 text-blue-700 border-blue-500/20 hover:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30"
                                                        : ev.type === 'task'
                                                            ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30"
                                                            : "bg-zinc-800/10 text-zinc-700 border-zinc-500/20 hover:bg-zinc-800/20 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
                                                    isCompleted && "opacity-50 line-through grayscale bg-muted/40 border-border/50 text-muted-foreground"
                                                )}
                                            >
                                                {ev.type === 'task' && (
                                                    <div onClick={(e) => handleTaskToggle(e, ev)} className="cursor-pointer shrink-0">
                                                        {isCompleted ? (
                                                            <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
                                                        ) : (
                                                            <Circle className="h-2.5 w-2.5 text-emerald-600/70 dark:text-emerald-400/70" />
                                                        )}
                                                    </div>
                                                )}
                                                {ev.type === 'meeting' && (
                                                    <span className="font-mono text-[10px] font-bold opacity-80 shrink-0">
                                                        {format(new Date(ev.start_time), 'HH:mm')}
                                                    </span>
                                                )}
                                                <span className="truncate">{ev.title}</span>
                                            </div>
                                        );
                                    })}
                                    {dayEvents.length > 3 && (
                                        <p className="text-[10px] text-muted-foreground font-medium pl-1">
                                            +{dayEvents.length - 3} más
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Right Side Column (~30-32%): Feed / Bitácora */}
            <div className="lg:col-span-4 min-h-[640px] sticky top-6">
                <AgendaSidebar
                    events={events}
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                    onNewEvent={handleNewEvent}
                    onEditEvent={handleEditEvent}
                    clients={clients}
                />
            </div>

            <EventDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                selectedDate={selectedDate}
                eventToEdit={selectedEvent}
                clients={clients}
            />
        </div>
    )
}
