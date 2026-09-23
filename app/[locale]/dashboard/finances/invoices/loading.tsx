import { InvoicesTableSkeleton, PageHeaderSkeleton } from "@/components/ui/skeletons";

export default function Loading() {
    return (
        <div className="p-6 w-full max-w-[1600px] m-auto space-y-8 min-h-screen">
            <PageHeaderSkeleton />

            {/* KPI Grid - Matches InvoicesPage: grid gap-6 md:grid-cols-2 */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Card 1 */}
                <div className="h-32 rounded-xl bg-card border border-border animate-pulse p-4 flex flex-col justify-between">
                    <div className="h-4 w-32 rounded bg-muted" />
                    <div className="h-8 w-40 rounded bg-muted" />
                </div>
                {/* Card 2 */}
                <div className="h-32 rounded-xl bg-card border border-border animate-pulse p-4 flex flex-col justify-between">
                    <div className="h-4 w-32 rounded bg-muted" />
                    <div className="h-8 w-40 rounded bg-muted" />
                </div>
            </div>

            {/* Main Content Grid - Matches InvoicesPage (3+1) */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

                {/* Left Column */}
                <div className="xl:col-span-3 space-y-4">
                    {/* Filters Toolbar */}
                    <div className="h-16 w-full rounded-lg border border-border bg-card animate-pulse" />

                    {/* Table */}
                    <InvoicesTableSkeleton />

                    {/* History Chart */}
                    <div className="rounded-xl border border-border bg-card p-5 h-[400px] animate-pulse">
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
