import { fetchAllEvents } from "@/lib/data/agenda";
import { fetchClients } from "@/lib/data";
import { CalendarView } from "@/components/dashboard/agenda/calendar-view";

export async function AgendaEventsWrapper() {
    const [events, clients] = await Promise.all([
        fetchAllEvents(),
        fetchClients(),
    ]);

    return <CalendarView events={events} clients={clients} />;
}
