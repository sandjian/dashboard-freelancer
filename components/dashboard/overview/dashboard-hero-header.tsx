"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Plus, Receipt, CreditCard, CalendarPlus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DateNavigator } from "@/components/dashboard/month-year-selector";
import { CreateExpenseDialog } from "@/components/dashboard/finances/expenses/create-expense-dialog";
import { EventDialog } from "@/components/dashboard/agenda/event-dialog";
import { Vendor, Category, Card as CardType, Client } from "@/lib/definitions";

interface DashboardHeroHeaderProps {
    vendors: Vendor[];
    categories: Category[];
    cards: CardType[];
    clients: Client[];
}

export function DashboardHeroHeader({
    vendors,
    categories,
    cards,
    clients,
}: DashboardHeroHeaderProps) {
    const t = useTranslations("Overview");
    const [expenseOpen, setExpenseOpen] = useState(false);
    const [eventOpen, setEventOpen] = useState(false);

    return (
        <>
            <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between pb-6 border-b border-border relative z-10 mb-8">
                {/* Title and context */}
                <div className="space-y-1.5 w-full xl:w-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-secondary/40 dark:bg-secondary/20 text-secondary-foreground mb-1 border border-border">
                        <span className="w-1.5 h-1.5 rounded-full bg-foreground shrink-0" />
                        <span>{t("financialSummaryBadge")}</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground font-sans">
                        {t("heroTitle")}
                    </h1>
                    <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
                        {t("heroDescription")}
                    </p>
                </div>

                {/* Right Controls: DateNavigator & Action Dropdown */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
                    {/* Date Navigator */}
                    <div className="bg-muted/40 border border-border rounded-xl p-1 text-foreground flex justify-center">
                        <DateNavigator className="bg-transparent border-0 shadow-none text-foreground [&_button]:text-foreground [&_button]:hover:bg-muted [&_span]:text-foreground" />
                    </div>

                    {/* Grouped Action Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                className="relative overflow-hidden bg-secondary/40 text-secondary-foreground hover:bg-secondary/30 hover:border-secondary/30 hover:text-accent dark:hover:text-secondary-foreground shadow-sm font-semibold transition-all duration-300 group h-10 px-5 rounded-xl cursor-pointer w-full sm:w-auto justify-center border border-border"
                            >
                                <div className="flex items-center justify-center gap-2 relative z-10 tracking-wide text-sm font-medium">
                                    <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
                                    <span>{t("register")}</span>
                                    <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-0.5" />
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-card border-border p-1 shadow-md">
                            <DropdownMenuItem asChild className="cursor-pointer text-xs py-2">
                                <Link href="/dashboard/finances/invoices/create" className="flex items-center gap-2">
                                    <Receipt className="w-4 h-4 text-muted-foreground" />
                                    <span>{t("newInvoice")}</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setExpenseOpen(true)}
                                className="cursor-pointer text-xs py-2 flex items-center gap-2"
                            >
                                <CreditCard className="w-4 h-4 text-muted-foreground" />
                                <span>{t("newExpense")}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setEventOpen(true)}
                                className="cursor-pointer text-xs py-2 flex items-center gap-2"
                            >
                                <CalendarPlus className="w-4 h-4 text-muted-foreground" />
                                <span>{t("newEvent")}</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>



            <EventDialog
                open={eventOpen}
                onOpenChange={setEventOpen}
                clients={clients}
            />
        </>
    );
}
