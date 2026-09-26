import { cn } from "@/lib/utils";

export function TranslucentImpactCardSkeleton({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-[var(--radius)] p-5 sm:p-6 border border-border bg-secondary/20 animate-pulse shadow-xs",
                className
            )}
        >
            {/* Header: Title + Icon */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-muted/60 h-10 w-10 shrink-0" />
                    <div className="h-3 w-28 rounded bg-muted/60" />
                </div>
            </div>

            {/* Value Section */}
            <div className="mt-4 space-y-2">
                <div className="h-8 w-36 rounded bg-muted/70 font-mono" />
                <div className="h-3 w-48 rounded bg-muted/40" />
            </div>
        </div>
    );
}

export function TranslucentImpactCardsGridSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div
            className={cn(
                "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6",
                count === 4 && "xl:grid-cols-4"
            )}
        >
            {Array.from({ length: count }).map((_, i) => (
                <TranslucentImpactCardSkeleton key={i} />
            ))}
        </div>
    );
}
