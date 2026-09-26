import { fetchDashboardData } from "@/lib/data";
import { ConsolidatedRecentActivity } from "@/components/dashboard/overview/consolidated-recent-activity";

export async function RecentActivityWrapper() {
    const dashboardData = await fetchDashboardData();

    return (
        <ConsolidatedRecentActivity
            activity={dashboardData.recentActivity}
        />
    );
}
