"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { CreateExpenseForm } from "./create-form";
import { Vendor, Category, Card } from "@/lib/definitions";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface CreateExpenseDialogProps {
    vendors: Vendor[];
    categories: Category[];
    cards?: Card[]; // Opcional, ya que los gastos directos no usan tarjetas en cuotas
    initialValues?: {
        concept?: string;
        category_id?: string;
        amount?: string;
    };
    defaultOpen?: boolean;
    triggerClassName?: string;
}

export function CreateExpenseDialog({
    vendors,
    categories,
    cards = [],
    initialValues,
    defaultOpen = false,
    triggerClassName,
}: CreateExpenseDialogProps) {
    const t = useTranslations('Expenses');
    const [open, setOpen] = useState(defaultOpen);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (defaultOpen) {
            setOpen(true);
        }
    }, [defaultOpen]);

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            const params = new URLSearchParams(searchParams.toString());
            if (params.has("action")) {
                params.delete("action");
                params.delete("concept");
                params.delete("categoryName");
                params.delete("category_id");
                router.replace(`${pathname}?${params.toString()}`);
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button
                    className={cn(
                        "relative overflow-hidden bg-secondary/40 text-secondary-foreground hover:bg-secondary/30 hover:border-secondary/30 hover:text-accent dark:hover:text-secondary-foreground shadow-sm font-semibold transition-all duration-300 group h-10 px-5 rounded-xl cursor-pointer w-full sm:w-auto justify-center",
                        triggerClassName
                    )}
                >
                    <div className="flex items-center justify-center gap-2 relative z-10 tracking-wide text-sm font-medium">
                        <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
                        <span>{t('newExpense')}</span>
                    </div>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl bg-card border-border p-4 py-8 text-foreground max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t('createExpense')}</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {t('createExpenseDescription')}
                    </DialogDescription>
                </DialogHeader>
                <CreateExpenseForm
                    vendors={vendors}
                    categories={categories}
                    cards={cards}
                    initialValues={initialValues}
                    onSuccess={() => handleOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    );
}