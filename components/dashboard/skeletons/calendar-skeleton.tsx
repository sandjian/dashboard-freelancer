import { cn } from "@/lib/utils";

export function CalendarViewSkeleton() {
    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start animate-pulse">
            {/* Main Calendar Column (8 cols) */}
            <div className="xl:col-span-8 flex flex-col bg-card rounded-xl border border-border/80 shadow-sm overflow-hidden min-h-[580px] sm:min-h-[640px]">
                {/* Header Toolbar */}
                <div className="flex flex-wrap items-center justify-between p-4 border-b border-border/80 bg-muted/20 gap-3">
                    <div className="flex items-center gap-3">
                        <div className="h-6 w-36 bg-muted/70 rounded-md" />
                        <div className="flex items-center rounded-lg border border-border/80 bg-background overflow-hidden">
                            <div className="h-8 w-8 bg-muted/40 border-r border-border/60" />
                            <div className="h-8 w-12 bg-muted/50 border-r border-border/60" />
                            <div className="h-8 w-8 bg-muted/40" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="h-8 w-28 bg-muted/60 rounded-lg" />
                        <div className="h-8 w-20 bg-muted/80 rounded-lg" />
                    </div>
                </div>

                {/* Days of Week Header */}
                <div className="grid grid-cols-7 border-b border-border/60 bg-muted/10 py-2.5">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="flex justify-center">
                            <div className="h-3 w-8 bg-muted/60 rounded" />
                        </div>
                    ))}
                </div>

                {/* Calendar Grid 7x5 */}
                <div className="grid grid-cols-7 grid-rows-5 flex-1 divide-x divide-y divide-border/40">
                    {Array.from({ length: 35 }).map((_, i) => (
                        <div key={i} className="min-h-[90px] sm:min-h-[105px] p-2 space-y-1.5 bg-card/40">
                            <div className="h-3.5 w-4 bg-muted/50 rounded ml-auto" />
                            {i % 4 === 1 && (
                                <div className="h-5 w-full bg-muted/60 rounded-md mt-2" />
                            )}
                            {i % 7 === 2 && (
                                <div className="h-5 w-3/4 bg-muted/50 rounded-md" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Sidebar Column (4 cols) */}
            <div className="xl:col-span-4 flex flex-col bg-card rounded-xl border border-border/80 shadow-sm overflow-hidden h-[640px]">
                {/* Sidebar Header */}
                <div className="p-4 border-b border-border/60 bg-muted/20 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-muted/60 shrink-0" />
                        <div className="space-y-1">
                            <div className="h-4 w-32 bg-muted/70 rounded" />
                            <div className="h-3 w-20 bg-muted/40 rounded" />
                        </div>
                    </div>
                    <div className="h-8 w-16 bg-muted/80 rounded-lg shrink-0" />
                </div>

                {/* Sidebar Content */}
                <div className="p-4 space-y-6 flex-1 overflow-hidden">
                    {/* Day agenda section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="h-3 w-28 bg-muted/60 rounded" />
                            <div className="h-3 w-8 bg-muted/40 rounded" />
                        </div>

                        {/* List items */}
                        <div className="space-y-2">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="p-3 rounded-lg border border-border/60 bg-background/60 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 flex-1">
                                            <div className="h-2 w-2 rounded-full bg-muted/80" />
                                            <div className="h-3.5 w-3/5 bg-muted/70 rounded" />
                                        </div>
                                        <div className="h-3 w-10 bg-muted/50 rounded font-mono" />
                                    </div>
                                    <div className="h-2.5 w-4/5 bg-muted/40 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Backlog section */}
                    <div className="space-y-3 pt-3 border-t border-border/40">
                        <div className="flex items-center justify-between">
                            <div className="h-3 w-24 bg-muted/60 rounded" />
                            <div className="h-3 w-8 bg-muted/40 rounded" />
                        </div>
                        <div className="space-y-2">
                            {Array.from({ length: 2 }).map((_, i) => (
                                <div key={i} className="p-2.5 rounded-lg border border-border/50 bg-background/40 flex items-center justify-between">
                                    <div className="flex items-center gap-2 flex-1">
                                        <div className="h-3.5 w-3.5 bg-muted/50 rounded" />
                                        <div className="h-3 w-1/2 bg-muted/60 rounded" />
                                    </div>
                                    <div className="h-2.5 w-8 bg-muted/40 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
