import { fetchTodayPendingEvents, fetchUpcomingDues } from "@/lib/data";
import { OperationalFocusPanel } from "@/components/dashboard/overview/operational-focus-panel";

export async function OperationalFocusWrapper() {
    const [todayEvents, upcomingDues] = await Promise.all([
        fetchTodayPendingEvents(),
        fetchUpcomingDues(),
    ]);

    return (
        <OperationalFocusPanel
            todayEvents={todayEvents}
            upcomingDues={upcomingDues}
        />
    );
}
