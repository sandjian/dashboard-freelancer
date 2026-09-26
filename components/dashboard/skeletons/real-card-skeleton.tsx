import { cn } from "@/lib/utils";

export function RealCardSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn("relative w-full max-w-[420px] mx-auto px-1", className)}>
            <div className="h-[200px] md:h-[225px] w-full rounded-[16px] border border-white/10 bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950 p-5 sm:p-6 flex flex-col justify-between shadow-xl animate-pulse relative overflow-hidden">
                {/* Glow & Specular Sheen */}
                <div className="pointer-events-none absolute -top-24 -right-24 w-48 h-48 rounded-full bg-white/[0.03] blur-2xl" />

                {/* Top Row: Alias + EMV & Contactless */}
                <div className="flex justify-between items-start relative z-10">
                    <div className="space-y-1.5">
                        <div className="h-2 w-16 bg-white/20 rounded" />
                        <div className="h-4 w-28 bg-white/30 rounded" />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full bg-white/20" />
                        <div className="h-[24px] w-[32px] rounded-md bg-amber-500/25 border border-amber-400/20" />
                    </div>
                </div>

                {/* Middle: Masked Card Number */}
                <div className="my-auto py-2 relative z-10">
                    <div className="h-4 w-44 bg-white/20 rounded font-mono" />
                </div>

                {/* Footer: Cierre / Vencimiento + Network Logo */}
                <div className="flex justify-between items-end relative z-10">
                    <div className="flex gap-4">
                        <div className="space-y-1">
                            <div className="h-2 w-10 bg-white/20 rounded" />
                            <div className="h-3 w-12 bg-white/30 rounded" />
                        </div>
                        <div className="space-y-1">
                            <div className="h-2 w-10 bg-white/20 rounded" />
                            <div className="h-3 w-12 bg-white/30 rounded" />
                        </div>
                    </div>
                    <div className="h-6 w-12 bg-white/20 rounded-md" />
                </div>
            </div>
        </div>
    );
}

export function RealCardsGridSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex flex-col">
                    <RealCardSkeleton />
                </div>
            ))}
        </div>
    );
}
