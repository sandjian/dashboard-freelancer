import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Link } from "@/i18n/routing";
import { useTranslations, useFormatter } from "next-intl";
import { Button } from "@/components/ui/button";

export interface ActivityItem {
    id: string;
    type: 'invoice' | 'expense' | string;
    description: string | null;
    category?: string | null;
    date: Date | string;
    amount: number;
    status?: string;
}

export function RecentActivity({ activity }: { activity: ActivityItem[] }) {
    const t = useTranslations('Common');
    const format = useFormatter();

    if (!activity || activity.length === 0) {
        return <div className="text-sm text-muted-foreground p-4">No recent activity.</div>
    }

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead className="text-muted-foreground">{t('transaction')}</TableHead>
                        <TableHead className="text-muted-foreground">{t('category')}/{t('clients')}</TableHead>
                        <TableHead className="text-muted-foreground">{t('date')}</TableHead>
                        <TableHead className="text-right text-muted-foreground">{t('amount')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {activity.map((item, index) => (
                        <TableRow key={index} className="border-border hover:bg-muted/50">
                            <TableCell>
                                <Avatar className="h-9 w-9 border border-border bg-transparent">
                                    <AvatarFallback className="bg-transparent">
                                        {item.type === 'invoice' ? <TrendingUp className="h-4 w-4 text-emerald-500" /> : <TrendingDown className="h-4 w-4 text-rose-500" />}
                                    </AvatarFallback>
                                </Avatar>
                            </TableCell>
                            <TableCell>
                                <div className="font-medium text-sm text-card-foreground">{item.description || 'Sin descripción'}</div>
                                <div className="text-xs text-muted-foreground capitalize">
                                    {item.type === 'invoice' ? t('invoices') : t('expenses')}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="font-normal text-xs text-muted-foreground border-border">
                                    {item.category || item.description || 'General'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {format.dateTime(new Date(item.date), {
                                    day: "numeric",
                                    month: "short",
                                })}
                            </TableCell>
                            <TableCell className={`text-right font-medium ${item.type === 'invoice' ? 'text-success' : 'text-danger'}`}>
                                {item.type === 'invoice' ? '+' : '-'}{formatCurrency(item.amount)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="p-4 border-t border-border flex justify-center">
                <Link href="/dashboard/finances/expenses">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                        {t('viewAllActivity')}
                    </Button>
                </Link>
            </div>
        </>

    )
}
