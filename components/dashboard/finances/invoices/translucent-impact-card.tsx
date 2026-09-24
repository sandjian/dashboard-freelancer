import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TranslucentImpactCardProps {
    title: string;
    value: string;
    subtitle?: string;
    trend?: string;
    icon: LucideIcon;
    className?: string;
}

export function TranslucentImpactCard({
    title,
    value,
    subtitle,
    trend,
    icon: Icon,
    className
}: TranslucentImpactCardProps) {
    return (
        <div
            className={cn(
                "group relative overflow-hidden rounded-[var(--radius)] p-5 sm:p-6 transition-all duration-300",
                "bg-secondary/40 hover:bg-secondary/30 dark:bg-foreground/90 dark:hover:bg-foreground",
                "border border-border",
                "shadow-xs hover:shadow-sm",
                className
            )}
        >
            <div className="absolute bottom-0 left-0 right-0 top-0 bg-[repeating-linear-gradient(45deg,#808080_0px_1px,transparent_1px_10px)] opacity-30 mask-[radial-gradient(ellipse_80%_50%_at_100%_0%,#000_70%,transparent_110%)] pointer-events-none"></div>
            {/* Header: Title + Icon */}
            <div className="flex items-center justify-between gap-3 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-card dark:bg-accent /80  text-secondary/40 dark:text-foreground transition-transform duration-300  shadow-xs">
                        <Icon className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold tracking-wider uppercase text-accent">
                            {title}
                        </p>
                    </div>
                </div>
            </div>

            {/* Value Section */}
            <div className="mt-4 relative z-10">
                <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-accent">
                    {value}
                </div>
                {subtitle && (
                    <p className="text-xs text-accent mt-1.5 font-medium">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
}
