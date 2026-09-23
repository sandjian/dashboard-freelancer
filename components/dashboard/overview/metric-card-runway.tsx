import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslations, useFormatter } from "next-intl";

export function MetricCardRunway({ months, days, target = 6 }: { months: number, days: number, target?: number }) {
    const t = useTranslations('Overview');
    const tCommon = useTranslations('Common');
    const tStatus = useTranslations('Status');
    const format = useFormatter();

    const progress = (months / target) * 100;

    // Calculate date until covered
    const coverageDate = new Date();
    coverageDate.setMonth(coverageDate.getMonth() + months);
    coverageDate.setDate(coverageDate.getDate() + days);

    return (

        <Card className="relative overflow-hidden shadow-sm border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-muted rounded-lg">
                        <Timer className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t('financialRunway')}</CardTitle>
                </div>
                <Badge variant="outline" className="border-success/30 text-success bg-success/10 transition-colors">
                    {tStatus('stable')}
                </Badge>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold mt-2 text-card-foreground">
                    {months} <span className="text-lg font-normal text-muted-foreground">{tCommon('months')},</span> {days} <span className="text-lg font-normal text-muted-foreground">{tCommon('days')}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                    {t('coveredUntil', {
                        date: format.dateTime(coverageDate, { day: 'numeric', month: 'long', year: 'numeric' })
                    })}
                </p>

                <div className="space-y-2">
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[11px] text-muted-foreground uppercase font-semibold">
                        <span>0 {tCommon('months')}</span>
                        <span>{t('target', { count: target })}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
