import { fetchExpenseById } from '@/lib/data';
import { EditExpenseForm } from '@/components/dashboard/expenses/edit-form';
import { notFound } from 'next/navigation'; // 
// Más adelante importaremos el formulario aquí

export default async function EditExpensePage({ params }: { params: { id: string } }) {
 const { id } = await Promise.resolve(params); 
  const expense = await fetchExpenseById(id);

  if (!expense) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Editar Ingreso</h1>
      <EditExpenseForm expense={expense} />
    </div>
  );
}