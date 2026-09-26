import { requireUser } from '@/lib/auth-guard';
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { AgendaEventsWrapper } from "@/components/dashboard/agenda/agenda-events-wrapper";
import { CalendarViewSkeleton } from "@/components/dashboard/skeletons";

export default async function AgendaPage() {
    await requireUser();
    const t = await getTranslations("Agenda");

    return (
        <main className="w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 min-h-screen">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
                <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                        {t("badge")}
                    </p>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">
                        {t("title")}
                    </h1>
                </div>
            </div>

            <Suspense fallback={<CalendarViewSkeleton />}>
                <AgendaEventsWrapper />
            </Suspense>
        </main>
    );
}
