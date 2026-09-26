import { fetchVendors, fetchExpenseCategories, fetchCards, fetchClients } from "@/lib/data";
import { DashboardHeroHeader } from "@/components/dashboard/overview/dashboard-hero-header";

export async function DashboardHeroWrapper() {
    const [vendors, categories, cards, clients] = await Promise.all([
        fetchVendors(),
        fetchExpenseCategories(),
        fetchCards(),
        fetchClients(),
    ]);

    return (
        <DashboardHeroHeader
            vendors={vendors}
            categories={categories}
            cards={cards}
            clients={clients}
        />
    );
}

export function DashboardHeroHeaderSkeleton() {
    return (
        <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between pb-6 border-b border-border relative z-10 mb-8 animate-pulse">
            <div className="space-y-2">
                <div className="h-4 w-32 bg-muted/60 rounded-full" />
                <div className="h-9 w-64 bg-muted/80 rounded" />
                <div className="h-4 w-96 bg-muted/40 rounded" />
            </div>
            <div className="flex items-center gap-3">
                <div className="h-10 w-44 bg-muted/60 rounded-xl" />
                <div className="h-10 w-36 bg-muted/70 rounded-xl" />
            </div>
        </div>
    );
}
