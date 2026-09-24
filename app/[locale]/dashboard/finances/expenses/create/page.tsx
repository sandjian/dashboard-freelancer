import { requireUser } from '@/lib/auth-guard';
import { fetchVendors, fetchExpenseCategories, fetchCards } from '@/lib/data';
import { CreateExpenseForm } from '@/components/dashboard/finances/expenses/create-form';
import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default async function CreateExpensePage({
    searchParams,
}: {
    searchParams?: Promise<{
        concept?: string;
        categoryName?: string;
        category_id?: string;
        amount?: string;
    }>;
}) {
  const user = await requireUser();
    const resolvedParams = await searchParams;
    const [vendors, categories, cards] = await Promise.all([
        fetchVendors(),
        fetchExpenseCategories(),
        fetchCards(),
    ]);

    // Intelligent Category Matching
    let matchedCategoryId = resolvedParams?.category_id;
    if (!matchedCategoryId && resolvedParams?.categoryName) {
        const searchName = resolvedParams.categoryName.toLowerCase();
        // Try exact match first, then partial
        const found = categories.find(c => c.name.toLowerCase() === searchName)
            || categories.find(c => c.name.toLowerCase().includes(searchName));

        if (found) {
            matchedCategoryId = found.id;
        }
    }

    return (
        <div className="flex justify-center items-center min-h-[80vh] p-4">
            <Card className="w-full max-w-2xl shadow-xl border-border bg-card">
                <CardHeader className="border-b border-border bg-muted/20">
                    <CardTitle className="text-xl font-bold text-foreground">Registrar Nuevo Gasto</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Ingresa los detalles de la transacción o verifica la información pre-cargada.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <CreateExpenseForm
                        vendors={vendors}
                        categories={categories}
                        cards={cards}
                        initialValues={{
                            concept: resolvedParams?.concept || '',
                            category_id: matchedCategoryId || undefined,
                            amount: resolvedParams?.amount || '',
                        }}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
