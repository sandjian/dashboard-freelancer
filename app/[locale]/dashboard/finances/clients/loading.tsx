import { ClientsGridSkeleton, PageHeaderSkeleton } from "@/components/ui/skeletons";

export default function Loading() {
    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-6 container mx-auto max-w-[1600px]">
            <PageHeaderSkeleton />
            <ClientsGridSkeleton />
        </div>
    );
}
