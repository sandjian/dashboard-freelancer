import { requireUser } from '@/lib/auth-guard';
import { fetchClientDetailsById, fetchClientRevenueHistory, fetchClientCalendarEvents } from '@/lib/data';
import { notFound } from 'next/navigation';
import { ClientInvoicesTable } from '@/components/dashboard/finances/clients/client-invoices-table';
import { ClientProfileHeader } from '@/components/dashboard/finances/clients/client-profile-header';
import { ClientStats } from '@/components/dashboard/finances/clients/client-stats';
import { ClientRevenueChart } from '@/components/dashboard/finances/clients/client-revenue-chart';
import { ClientAgendaCard } from '@/components/dashboard/finances/clients/client-agenda-card';

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const data = await fetchClientDetailsById(id);
  return {
    title: data?.client ? `${data.client.name} | Clientes` : 'Cliente | Dashboard',
  };
}

export default async function ClientDetailsPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const user = await requireUser();
  const { id } = await params;

  const [data, revenueHistory, calendarEvents] = await Promise.all([
    fetchClientDetailsById(id),
    fetchClientRevenueHistory(id),
    fetchClientCalendarEvents(id)
  ]);

  if (!data || !data.client) {
    notFound();
  }

  const { client, invoices } = data;

  return (
    <div className="p-4 sm:p-6 w-full max-w-[1600px] m-auto space-y-8 min-h-screen text-foreground">
      {/* 1. Hero Profile Header & Controls */}
      <ClientProfileHeader client={client} />

      {/* 2. Top KPIs Row (TranslucentImpactCards) */}
      <ClientStats client={client} />

      {/* 3. Monthly Revenue History Chart & Agenda / Reuniones Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-foreground">Actividad & Finanzas</h2>
            <p className="text-xs text-muted-foreground">Evolución de recaudación y citas programadas con el cliente</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
          {/* Gráfico de Barras: Ocupa 7 u 8 columnas en pantallas grandes */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
            <ClientRevenueChart data={revenueHistory} />
          </div>

          {/* Card de Agenda / Reuniones Programadas: Ocupa 5 o 4 columnas */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
            <ClientAgendaCard events={calendarEvents} clientId={client.id} clientName={client.name} />
          </div>
        </div>
      </div>

      {/* 4. Invoices History with Unified Data Canvas & Pagination */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-foreground">Historial de Facturas</h2>
            <p className="text-xs text-muted-foreground">Listado de comprobantes emitidos, cobros y vencimientos</p>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {invoices.length} {invoices.length === 1 ? 'comprobante' : 'comprobantes'}
          </span>
        </div>

        <ClientInvoicesTable invoices={invoices} clientName={client.name} />
      </div>
    </div>
  );
}