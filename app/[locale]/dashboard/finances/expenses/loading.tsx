import { ExpensesTableSkeleton, PageHeaderSkeleton } from "@/components/ui/skeletons";

export default function Loading() {
    return (
        <div className="p-6 w-full m-auto max-w-[1600px] space-y-8 min-h-screen">
            <PageHeaderSkeleton />

            {/* KPI Grid - Matches ExpensesPage: grid gap-6 md:grid-cols-4 */}
            <div className="grid gap-6 md:grid-cols-4">
                {/* Card 1 (Gasto Total) - Spans 2 */}
                <div className="md:col-span-2 h-32 rounded-xl bg-card border border-border animate-pulse p-4 flex flex-col justify-between">
                    <div className="h-4 w-32 rounded bg-muted" />
                    <div className="h-8 w-40 rounded bg-muted" />
                </div>
                {/* Card 2 (Recurrente) - Spans 1 */}
                <div className="md:col-span-1 h-32 rounded-xl bg-card border border-border animate-pulse p-4 flex flex-col justify-between">
                    <div className="h-4 w-24 rounded bg-muted" />
                    <div className="h-8 w-32 rounded bg-muted" />
                </div>
                {/* Card 3 (Por Pagar) - Spans 1 */}
                <div className="md:col-span-1 h-32 rounded-xl bg-card border border-border animate-pulse p-4 flex flex-col justify-between">
                    <div className="h-4 w-24 rounded bg-muted" />
                    <div className="h-8 w-32 rounded bg-muted" />
                </div>
            </div>

            {/* Main Content Grid (3+1 Layout) */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

                {/* Left Column - Spans 3 */}
                <div className="xl:col-span-3 space-y-4">
                    {/* Filters Toolbar */}
                    <div className="h-16 w-full rounded-lg border border-border bg-card animate-pulse" />

                    {/* Table */}
                    <ExpensesTableSkeleton />

                    {/* History Chart */}
                    <div className="rounded-xl border border-border bg-card p-5 h-[350px] animate-pulse">
                        <div className="h-4 w-64 rounded bg-muted mb-6" />
                        <div className="h-full w-full bg-muted/10 rounded-lg" />
                    </div>
                </div>

                {/* Right Column - Side Panel */}
                <div className="xl:col-span-1 h-[600px] rounded-xl bg-card border border-border animate-pulse" />
            </div>
        </div>
    );
}
