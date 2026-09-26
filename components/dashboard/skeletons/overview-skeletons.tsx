import { cn } from "@/lib/utils";

export function CashFlowChartSkeleton() {
    return (
        <div className="rounded-[var(--radius)] bg-card border border-border p-5 sm:p-6 shadow-sm space-y-6 animate-pulse">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
                <div className="space-y-1.5">
                    <div className="h-5 w-44 bg-muted/70 rounded" />
                    <div className="h-3.5 w-64 bg-muted/40 rounded" />
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-4 w-20 bg-muted/50 rounded" />
                    <div className="h-4 w-20 bg-muted/50 rounded" />
                </div>
            </div>

            {/* Chart Area: Simulated SVG Bar/Line Height */}
            <div className="h-[280px] sm:h-[340px] w-full flex items-end justify-between gap-3 pt-6 pb-2 px-2">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                        <div
                            className="w-full bg-muted/40 rounded-t-sm"
                            style={{ height: `${20 + ((i * 17) % 65)}%` }}
                        />
                        <div className="h-3 w-6 bg-muted/30 rounded" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function RecentActivitySkeleton() {
    return (
        <div className="rounded-[var(--radius)] bg-card border border-border p-5 sm:p-6 shadow-sm space-y-4 animate-pulse">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="h-5 w-40 bg-muted/70 rounded" />
                <div className="h-4 w-16 bg-muted/40 rounded" />
            </div>
            <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/10">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted/60" />
                            <div className="space-y-1.5">
                                <div className="h-4 w-36 bg-muted/70 rounded" />
                                <div className="h-3 w-24 bg-muted/40 rounded" />
                            </div>
                        </div>
                        <div className="h-4 w-20 bg-muted/60 rounded font-mono" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function OperationalFocusSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Today Focus Card */}
            <div className="rounded-[var(--radius)] bg-card border border-border p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                    <div className="h-4 w-32 bg-muted/70 rounded" />
                    <div className="h-4 w-12 bg-muted/40 rounded" />
                </div>
                <div className="space-y-2.5">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="p-3 rounded-lg border border-border/40 bg-muted/10 space-y-1.5">
                            <div className="flex items-center justify-between">
                                <div className="h-3.5 w-3/5 bg-muted/60 rounded" />
                                <div className="h-3 w-10 bg-muted/40 rounded" />
                            </div>
                            <div className="h-2.5 w-2/5 bg-muted/30 rounded" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Upcoming Dues Card */}
            <div className="rounded-[var(--radius)] bg-card border border-border p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                    <div className="h-4 w-36 bg-muted/70 rounded" />
                    <div className="h-4 w-12 bg-muted/40 rounded" />
                </div>
                <div className="space-y-2.5">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="p-3 rounded-lg border border-border/40 bg-muted/10 flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="h-3.5 w-28 bg-muted/60 rounded" />
                                <div className="h-2.5 w-16 bg-muted/40 rounded" />
                            </div>
                            <div className="h-4 w-16 bg-muted/60 rounded font-mono" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
