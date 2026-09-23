'use client';

import * as React from 'react';
import Link from 'next/link';
import { CalendarEvent } from '@/lib/definitions';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Clock,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Video,
  ListTodo
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ClientAgendaCardProps {
  events: CalendarEvent[];
  clientId: string;
  clientName: string;
}

export function ClientAgendaCard({ events, clientId, clientName }: ClientAgendaCardProps) {
  // Próximos eventos (ordenados cronológicamente)
  const now = new Date();
  const upcomingEvents = events.filter((e) => new Date(e.end_time || e.start_time) >= now);
  const pastEvents = events.filter((e) => new Date(e.end_time || e.start_time) < now);

  const displayEvents = upcomingEvents.length > 0 ? upcomingEvents.slice(0, 4) : pastEvents.slice(0, 4);

  return (
    <div className="rounded-[var(--radius)] bg-card border border-border p-4 sm:p-6 md:p-7 shadow-sm flex flex-col justify-between h-full">
      <div>
        {/* Cabecera idéntica a los charts y cards de la aplicación */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-secondary/40 hover:bg-secondary/30 dark:bg-foreground/90 dark:hover:bg-foreground text-secondary-foreground dark:text-background transition-colors">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground tracking-tight">
                Agenda & Reuniones
              </h3>
              <p className="text-xs text-muted-foreground">
                Citas y tareas programadas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-8 px-2.5 rounded-lg text-xs border-border bg-background hover:bg-muted text-foreground"
            >
              <Link href={`/dashboard/agenda`} title="Abrir agenda completa">
                <span>Ver Agenda</span>
                <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Lista de Eventos / Reuniones */}
        {displayEvents.length === 0 ? (
          <div className="h-[260px] flex flex-col items-center justify-center text-center p-4 border border-dashed border-border rounded-xl bg-muted/20 my-4">
            <Clock className="w-8 h-8 text-muted-foreground/40 mb-2" />
            <p className="text-xs font-medium text-foreground">Sin reuniones programadas</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[200px]">
              No hay citas o llamadas pendientes con este cliente.
            </p>
            <Button
              asChild
              size="sm"
              className="mt-3 h-7 px-3 text-xs bg-secondary/40 hover:bg-secondary/30 dark:bg-foreground/90 dark:hover:bg-foreground text-secondary-foreground dark:text-background font-medium rounded-lg"
            >
              <Link href="/dashboard/agenda">
                <Plus className="w-3.5 h-3.5 mr-1" />
                Agendar Cita
              </Link>
            </Button>
          </div>
        ) : (
          <div className="py-3 space-y-2.5 my-2">
            {displayEvents.map((event) => {
              const startDate = new Date(event.start_time);
              const isPast = startDate < now;
              const isMeeting = event.type === 'meeting';

              return (
                <div
                  key={event.id}
                  className="flex items-start justify-between gap-3 p-3 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div
                      className={cn(
                        "mt-0.5 p-1.5 rounded-lg shrink-0",
                        isMeeting
                          ? "bg-secondary/20 dark:bg-foreground/20 text-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {isMeeting ? <Video className="w-3.5 h-3.5" /> : <ListTodo className="w-3.5 h-3.5" />}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {event.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                        <span className="capitalize">{formatDate(startDate)}</span>
                        <span>•</span>
                        <span>
                          {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-md border shrink-0",
                      event.status === 'completed'
                        ? "bg-neutral-100 text-neutral-800 border-neutral-300 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700"
                        : isPast
                        ? "bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800"
                        : "bg-secondary/40 text-secondary-foreground dark:bg-foreground/90 dark:text-background border-transparent"
                    )}
                  >
                    {event.status === 'completed' ? 'Realizada' : isPast ? 'Pasada' : 'Próxima'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer de la Card */}
      <div className="flex items-center justify-between pt-3 mt-2 border-t border-border text-xs text-muted-foreground">
        <span>{events.length} {events.length === 1 ? 'evento registrado' : 'eventos registrados'}</span>
        <Link href="/dashboard/agenda" className="hover:underline text-foreground">
          Nueva Cita +
        </Link>
      </div>
    </div>
  );
}
