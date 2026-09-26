import { CalendarViewSkeleton } from "@/components/dashboard/skeletons";

export default function Loading() {
    return (
        <main className="w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 min-h-screen">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
                <div className="space-y-2">
                    <div className="h-3 w-24 bg-muted/60 rounded" />
                    <div className="h-8 w-44 bg-muted/80 rounded" />
                </div>
            </div>

            <CalendarViewSkeleton />
        </main>
    );
}
