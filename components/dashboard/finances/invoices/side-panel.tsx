import { fetchTopClients, fetchOverdueInvoices } from "@/lib/data"
import { TopClientsChart } from "./top-clients-chart"
import { Users, AlertOctagon, Zap } from "lucide-react"
import Link from "next/link"
import { OverdueInvoicesList } from "./overdue-invoices-list"
import { getTranslations } from "next-intl/server"

export async function InvoicesSidePanel({ year, month }: { year: number, month: number }) {
    const [topClients, overdueInvoices, t] = await Promise.all([
        fetchTopClients(year, month, 5),
        fetchOverdueInvoices(5),
        getTranslations('Invoices')
    ]);

    return (
        <div className="space-y-6">
            {/* 1. Alerts / Notification Section */}
            <div className="rounded-[var(--radius)] border border-border bg-card p-5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-xl bg-secondary/40 hover:bg-secondary/30 dark:bg-foreground/90 dark:hover:bg-foreground text-secondary-foreground dark:text-background transition-colors">
                        <Zap className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground tracking-tight">{t('alertsTitle')}</h3>
                </div>

                <div className="space-y-2">
                    <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {overdueInvoices.length > 0
                                ? t('alertsOverdueMessage', { count: overdueInvoices.length })
                                : t('alertsAllClear')}
                        </p>
                    </div>
                </div>
            </div>

            {/* 2. Top Clients (Donut) */}
            <div className="rounded-[var(--radius)] border border-border bg-card p-5 sm:p-6 h-[360px] flex flex-col shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-xl bg-secondary/40 hover:bg-secondary/30 dark:bg-foreground/90 dark:hover:bg-foreground text-secondary-foreground dark:text-background transition-colors">
                        <Users className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground tracking-tight">{t('topClientsTitle')}</h3>
                </div>
                <div className="flex-1 min-h-0">
                    <TopClientsChart data={topClients.map(c => ({ name: c.name, value: Number(c.value) }))} />
                </div>
            </div>

            {/* 3. Overdue Invoices List */}
            <div className="rounded-[var(--radius)] border border-border bg-card p-5 sm:p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-secondary/40 hover:bg-secondary/30 dark:bg-foreground/90 dark:hover:bg-foreground text-secondary-foreground dark:text-background transition-colors">
                            <AlertOctagon className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground tracking-tight">{t('overdueTitle')}</h3>
                    </div>
                    {overdueInvoices.length > 0 && (
                        <Link href="/dashboard/finances/invoices?status=vencido" className="text-xs font-semibold text-foreground hover:underline transition-all">
                            {t('viewAll')}
                        </Link>
                    )}
                </div>

                <OverdueInvoicesList items={overdueInvoices} />
            </div>
        </div>
    )
}
