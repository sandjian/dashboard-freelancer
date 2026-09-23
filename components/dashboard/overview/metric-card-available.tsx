import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { CreateExpenseDialog } from "@/components/dashboard/finances/expenses/create-expense-dialog";
import { Vendor, Category, Card as CardType } from "@/lib/definitions";

export function MetricCardAvailable({
    amount,
    vendors,
    categories,
    cards
}: {
    amount: number;
    vendors: Vendor[];
    categories: Category[];
    cards: CardType[];
}) {
    const t = useTranslations('Overview');
    const tCommon = useTranslations('Common');

    return (
        <Card className="relative overflow-hidden shadow-sm border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-muted rounded-lg">
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t('availableMoney')}</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-bold mt-2 text-card-foreground">
                    {formatCurrency(amount)}
                </div>
                <p className="text-sm text-muted-foreground mt-1 mb-6">
                    {t('safeToSpendDescription')}
                </p>

                <div className="flex gap-3">
                    <div className="flex-1">
                        <CreateExpenseDialog
                            vendors={vendors}
                            categories={categories}
                            cards={cards}
                            triggerClassName="w-full h-9 cursor-pointer" // h-9 matches size="sm" usually (36px) or close to it
                        />
                    </div>
                    <Link href="/dashboard/finances/expenses" className="flex-1">
                        <Button className="w-full border-border bg-card hover:bg-muted text-foreground transition-all duration-300 hover:shadow-md h-9 cursor-pointer" variant="outline" size="sm">
                            {t('viewDetails')}
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
