import { fetchClientDetailsById } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserIcon, MailIcon, PhoneIcon, BuildingIcon } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ClientInvoicesTable } from '@/components/dashboard/finances/clients/client-invoices-table';

export default async function ClientDetailsPage({
     params
     }: {
         params: { id: string }
         })
          {
  const {id} = await Promise.resolve(params)
  const data = await fetchClientDetailsById(id);

  if (!data || !data.client) {
    notFound();
  }

  const { client, invoices } = data;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/finances/clients">Clientes</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Nombre del cliente</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Columna Izquierda: Tarjeta de Contacto */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <BuildingIcon className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">{client.brand}</span>
              </div>
              <div className="flex items-center gap-3">
                <UserIcon className="w-5 h-5 text-muted-foreground" />
                <span>{client.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <MailIcon className="w-5 h-5 text-muted-foreground" />
                <a href={`mailto:${client.email}`} className="text-primary hover:underline">
                  {client.email}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <PhoneIcon className="w-5 h-5 text-muted-foreground" />
                <span>{client.phone || 'No especificado'}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha: Historial de Facturas */}
        <div className="lg:col-span-2">
           <h2 className="text-xl font-semibold mb-4">Historial de Facturas</h2>
           {/* Aquí podemos reutilizar una versión simplificada de tu tabla de facturas */}
           {/* Por ahora, mostramos un resumen */}
       <ClientInvoicesTable invoices={invoices} />
        </div>
      </div>
    </div>
  );
}