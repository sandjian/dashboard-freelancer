import { fetchClients, fetchNextInvoiceNumber } from '@/lib/data';
import { CreateInvoiceForm } from '@/components/dashboard/finances/invoices/create-form';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export default async function CreateInvoicePage() {
  const [clients, nextInvoiceNumber] = await Promise.all([
    fetchClients(),
    fetchNextInvoiceNumber(),
  ]);

  return (
    <div className="p-4  space-y-6 w-full max-w-5xl m-auto">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/finances/invoices">Facturas</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Nueva Factura</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Título */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Crear Nueva Factura</h1>
        <p className="text-muted-foreground">
          Complete los detalles para generar una nueva factura
        </p>
      </div>

      {/* Formulario */}
      <CreateInvoiceForm 
        clients={clients} 
        nextInvoiceNumber={nextInvoiceNumber} 
      />
    </div>
  );
}