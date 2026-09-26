import { fetchCardsWithMonthlyStatement, fetchBankAccounts } from "@/lib/data";
import { RealCard } from "@/components/dashboard/finances/cards/real-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CreditCard } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function CardsGalleryWrapper({
    year,
    month,
}: {
    year: number;
    month: number;
}) {
    const [cardsWithStatements, bankAccounts, t] = await Promise.all([
        fetchCardsWithMonthlyStatement(year, month),
        fetchBankAccounts(),
        getTranslations("Cards"),
    ]);

    if (cardsWithStatements.length === 0) {
        return (
            <div className="col-span-full py-16 flex flex-col items-center justify-center border border-dashed border-border rounded-[var(--radius)] bg-card/40">
                <CreditCard className="w-10 h-10 text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground text-sm mb-4">{t("noAssociatedCards")}</p>
                <Button
                    asChild
                    className="bg-secondary/40 text-secondary-foreground hover:bg-secondary/30 dark:bg-foreground/90 dark:hover:bg-foreground dark:text-background font-semibold rounded-xl border border-border shadow-sm h-10 px-5"
                >
                    <Link href="/dashboard/finances/cards/create">{t("addFirstCard")}</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {cardsWithStatements.map((card) => (
                <div key={card.id} className="flex flex-col">
                    <RealCard
                        id={card.id}
                        name={card.name}
                        closingDay={card.closing_day}
                        dueDay={card.due_day}
                        color={card.color}
                        last4={card.last_four_digits}
                        statement={card.statement}
                        year={year}
                        month={month}
                        accounts={bankAccounts}
                    />
                </div>
            ))}
        </div>
    );
}
