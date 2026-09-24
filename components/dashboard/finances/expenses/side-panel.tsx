import { fetchUpcomingRecurringExpenses, fetchExpenseCategoryStats } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { CalendarClock, Zap, PieChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RecurringExpensesList } from "./recurring-expenses-list";
import { ExpensesCategoryChart } from "./expenses-category-chart";

export async function SideInsightsPanel({ year, month }: { year: number; month: number }) {
    const [recurringData, categoryStats] = await Promise.all([
        fetchUpcomingRecurringExpenses(5),
        fetchExpenseCategoryStats(year, month),
    ]);

    // Ensure data matches the expected type
    const recurring = recurringData.map(item => ({
        ...item,
        id: item.id || '',
        category_name: item.category_name || 'Sin Categoría'
    })).filter(item => item.id !== '');

    return (
        <div className="space-y-6">

            {/* 1. Alerts / Notification Section */}
            <div className="rounded-[var(--radius)] border border-border bg-card p-5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-xl bg-secondary/40 hover:bg-secondary/30 dark:bg-foreground/90 dark:hover:bg-foreground text-secondary-foreground dark:text-background transition-colors">
                        <Zap className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground tracking-tight">Alertas</h3>
                </div>

                <div className="space-y-2">
                    <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Recuerda revisar tus pagos de tarjeta antes del cierre (día 25).
                        </p>
                    </div>
                </div>
            </div>

            {/* 2. Category Distribution Chart */}
            <div className="rounded-[var(--radius)] border border-border bg-card p-5 sm:p-6 h-[360px] flex flex-col shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-xl bg-secondary/40 hover:bg-secondary/30 dark:bg-foreground/90 dark:hover:bg-foreground text-secondary-foreground dark:text-background transition-colors">
                        <PieChart className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground tracking-tight">Distribución</h3>
                </div>
                <div className="flex-1 min-h-0">
                    <ExpensesCategoryChart data={categoryStats} />
                </div>
            </div>

            {/* 3. Upcoming Recurring Payments */}
            <div className="rounded-[var(--radius)] border border-border bg-card p-5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-xl bg-secondary/40 hover:bg-secondary/30 dark:bg-foreground/90 dark:hover:bg-foreground text-secondary-foreground dark:text-background transition-colors">
                        <CalendarClock className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground tracking-tight">Próximos</h3>
                </div>

                {recurring.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No hay gastos recurrentes activos.</p>
                ) : (
                    <RecurringExpensesList items={recurring} />
                )}
            </div>

        </div>
    );
}
