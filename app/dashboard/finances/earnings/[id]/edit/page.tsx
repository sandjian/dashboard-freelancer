import { fetchEarningById } from '@/lib/data';
import { EditEarningForm } from '@/components/dashboard/earnings/edit-form';
import { notFound } from 'next/navigation'; // 
// Más adelante importaremos el formulario aquí

export default async function EditEarningPage({ params }: { params: { id: string } }) {
 const { id } = await Promise.resolve(params); 
  const earning = await fetchEarningById(id);

  if (!earning) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Editar Ingreso</h1>
      <EditEarningForm earning={earning} />
    </div>
  );
}