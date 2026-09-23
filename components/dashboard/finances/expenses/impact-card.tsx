import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImpactCardProps {
    title: string;
    value: string;
    subtitle?: string;
    trend?: string;
    trendType?: 'positive' | 'negative' | 'neutral';
    icon: LucideIcon;
    variant?: 'default' | 'emerald' | 'cyan' | 'red' | 'blue' | 'pink' | 'indigo';
    className?: string;
}

const variantStyles: Record<string, { card: string; iconBg: string; iconColor: string }> = {
    default:
    {
        card: "bg-card border-border",
        iconBg: "bg-primary text-primary-foreground", // Green bg (primary) and white icon (primary-foreground)
        iconColor: "text-primary-foreground",
    },
    emerald: {
        card: "shadow-emerald-300 border-emerald-300/20 from-emerald-900/70",
        iconBg: "bg-emerald-900/30",
        iconColor: "text-emerald-400",
    },
    cyan: {
        card: "shadow-cyan-300 border-cyan-300/20 from-cyan-900/70",
        iconBg: "bg-cyan-900/30",
        iconColor: "text-cyan-400",
    },
    red: {
        card: "shadow-red-300 border-red-300/20 from-red-900/70",
        iconBg: "bg-red-900/30",
        iconColor: "text-red-400",
    },
    blue: {
        card: "shadow-blue-300 border-blue-300/20 from-blue-900/70",
        iconBg: "bg-blue-900/30",
        iconColor: "text-blue-400",
    },
    pink: {
        card: "shadow-pink-300 border-pink-300/20 from-pink-900/70",
        iconBg: "bg-pink-900/30",
        iconColor: "text-pink-400",
    },
    indigo: {
        card: "shadow-indigo-300 border-indigo-300/20 from-indigo-900/70",
        iconBg: "bg-indigo-900/30",
        iconColor: "text-indigo-400",
    },
};

export function ImpactCard({ title, value, subtitle, icon: Icon, trend, trendType, variant = 'default', className }: ImpactCardProps) {
    const styles = variantStyles[variant] || variantStyles.default;

    return (
        <Card className={cn(
            "relative overflow-hidden shadow-sm px-3 py-6",
            // For colorful variants, keep the gradient if desired, or remove it for a cleaner look. 
            // The original used bg-black/20 which implies a dark theme. 
            // We'll use bg-card by default which adapts.
            variant === 'default' ? "bg-card" : "bg-black/20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_100%)] to-transparent",
            styles.card,
            className
        )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0 mb-3">
                <div className="flex items-center gap-2">
                    <div className={cn("p-2 rounded-lg", styles.iconBg)}>
                        <Icon className={cn("h-4 w-4", styles.iconColor)} />
                    </div>
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        {title}
                    </CardTitle>
                </div>
                {trend && (
                    <div className={cn("text-xs font-medium px-2 py-1 rounded-full border",
                        // Changed bg-muted to bg-transparent
                        variant === 'default' ? "bg-transparent border-border text-muted-foreground" : "bg-transparent border-white/20",
                        trendType === 'positive' ? "text-emerald-500 border-emerald-500/20" :
                            trendType === 'negative' ? "text-destructive border-destructive/20" :
                                trendType === 'neutral' ? "text-muted-foreground border-border" : ""
                    )}>
                        {trend}
                    </div>
                )}
            </CardHeader>

            <CardContent className="p-0">
                <div className="text-2xl font-bold text-card-foreground">{value}</div>
                {subtitle && (
                    <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">
                        {subtitle}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
