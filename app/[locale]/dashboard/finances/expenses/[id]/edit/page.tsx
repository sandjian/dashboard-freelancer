import { requireUser } from '@/lib/auth-guard';
// En /app/dashboard/finances/expenses/[id]/edit/page.tsx

import { EditExpenseForm } from "@/components/dashboard/finances/expenses/edit-form";
// 👇 Importamos fetchCards
import { fetchExpenseById, fetchExpenseCategories, fetchVendors, fetchCards } from "@/lib/data";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

export default async function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  // 👇 Añadimos fetchCards a la petición en paralelo
  const [expense, vendors, categories, cards, t] = await Promise.all([
    fetchExpenseById(id),
    fetchVendors(),
    fetchExpenseCategories(),
    fetchCards(),
    getTranslations('Expenses'),
  ]);

  if (!expense) {
    notFound();
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl font-semibold mb-4">{t('editExpense')}</h1>
      <EditExpenseForm
        expense={expense}
        vendors={vendors}
        categories={categories}
        cards={cards} // 👈 Pasamos las tarjetas al formulario
      />
    </div>
  );
}