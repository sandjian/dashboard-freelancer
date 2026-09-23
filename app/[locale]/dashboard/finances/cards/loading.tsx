import { RealCardsSkeleton, PageHeaderSkeleton } from "@/components/ui/skeletons";

export default function Loading() {
    return (
        <div className="w-full space-y-6 container mx-auto p-6 max-w-[1600px]">
            <PageHeaderSkeleton />
            <RealCardsSkeleton />
        </div>
    );
}
