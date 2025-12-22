import { fetchClientsWithStats } from '@/lib/data';
import { ClientsTable } from '@/components/dashboard/finances/clients/clients-table';
import { CreateClientModal } from '@/components/dashboard/finances/clients/create-client-modal';

export default async function ClientsPage() {
  const clients = await fetchClientsWithStats();

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Clientes</h1>
        {/* 👇 La llamada ahora es mucho más simple 👇 */}
        <CreateClientModal />
      </div>
      <ClientsTable clients={clients} />
    </div>
  );
}