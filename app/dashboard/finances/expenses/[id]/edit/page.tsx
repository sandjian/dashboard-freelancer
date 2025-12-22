// En /app/dashboard/finances/expenses/[id]/edit/page.tsx

import { EditExpenseForm } from "@/components/dashboard/expenses/edit-form";
// 👇 Importamos fetchCards
import { fetchExpenseById, fetchExpenseCategories, fetchVendors, fetchCards } from "@/lib/data"; 
import { notFound } from "next/navigation";

export default async function EditExpensePage({ params }: { params: { id: string } }) {
  const id = params.id;

  // 👇 Añadimos fetchCards a la petición en paralelo
  const [expense, vendors, categories, cards] = await Promise.all([
    fetchExpenseById(id),
    fetchVendors(),
    fetchExpenseCategories(),
    fetchCards(), 
  ]);

  if (!expense) {
    notFound();
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl font-semibold mb-4">Editar Gasto</h1>
      <EditExpenseForm 
        expense={expense} 
        vendors={vendors} 
        categories={categories}
        cards={cards} // 👈 Pasamos las tarjetas al formulario
      />
    </div>
  );
}