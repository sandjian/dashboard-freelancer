import { fetchClientById } from '@/lib/data';
import { notFound } from 'next/navigation';
import { EditClientForm } from '@/components/dashboard/finances/clients/edit-form';

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  console.log(`[EditClientPage] Iniciando carga para el ID: ${id}`);
  const client = await fetchClientById(id);

   if (!client) {
    console.error(`[EditClientPage] No se encontró ningún cliente con el ID: ${id}. Mostrando 404.`);
    notFound();
  }
  console.log(`[EditClientPage] Cliente encontrado:`, client);

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl font-semibold mb-4">Editar Cliente</h1>
      <EditClientForm client={client} />
    </div>
  );
}