import { requireUser } from '@/lib/auth-guard';
import { fetchAllEvents } from "@/lib/data/agenda";
import { fetchClients } from "@/lib/data";
import { CalendarView } from "@/components/dashboard/agenda/calendar-view";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

export default async function AgendaPage() {
    const user = await requireUser();
    const t = await getTranslations("Agenda");
    const [events, clients] = await Promise.all([
        fetchAllEvents(),
        fetchClients(),
    ]);

    return (
        <main className="w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 min-h-screen">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
                <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">{t("badge")}</p>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">{t("title")}</h1>
                </div>
            </div>

            <Suspense fallback={<div className="h-[600px] flex items-center justify-center text-muted-foreground">{t("loading")}</div>}>
                <CalendarView events={events} clients={clients} />
            </Suspense>
        </main>
    );
}
