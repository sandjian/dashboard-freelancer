import { fetchClientsWithStats } from '@/lib/data'; // 👈 Usamos la nueva función
import { ClientsTable } from '@/components/dashboard/finances/clients/clients-table'; // 👈 Usamos el nuevo componente

export default async function ClientTable() {
  const clients = await fetchClientsWithStats(); // 👈 Llamamos a la nueva función

  return (
    <div className="p-4 sm-p-6 md:p-8 space-y-6">
          <ClientsTable clients={clients} /> {/* 👈 Usamos el nuevo componente */}
    </div>
  );
}