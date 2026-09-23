import { fetchAllEvents } from "@/lib/data/agenda";
import { fetchClients } from "@/lib/data";
import { CalendarView } from "@/components/dashboard/agenda/calendar-view";
import { Suspense } from "react";

export default async function AgendaPage() {
    const [events, clients] = await Promise.all([
        fetchAllEvents(),
        fetchClients(),
    ]);

    return (
        <main className="flex-1 p-6 md:p-8 pt-6 min-h-screen">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Organización</p>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Agenda</h1>
                </div>
            </div>

            <Suspense fallback={<div className="h-[600px] flex items-center justify-center text-muted-foreground">Cargando calendario...</div>}>
                <CalendarView events={events} clients={clients} />
            </Suspense>
        </main>
    );
}
