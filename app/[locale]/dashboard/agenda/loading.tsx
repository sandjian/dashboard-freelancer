import { AgendaSkeleton, PageHeaderSkeleton } from "@/components/ui/skeletons";

export default function Loading() {
    return (
        <div className="flex-1 p-6 md:p-8 pt-6 min-h-screen flex flex-col">
            <PageHeaderSkeleton />
            <AgendaSkeleton />
        </div>
    );
}
