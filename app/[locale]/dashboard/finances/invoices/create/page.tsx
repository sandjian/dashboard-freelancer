import { fetchClients, fetchNextInvoiceNumber, fetchLastIssuedInvoices, fetchOverdueInvoices } from '@/lib/data';
import { CreateInvoiceForm } from '@/components/dashboard/finances/invoices/create-form';
import { InvoiceSidePanel } from '@/components/dashboard/finances/invoices/invoice-side-panel';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export default async function CreateInvoicePage() {
  const [clients, nextInvoiceNumber, lastIssued, overdue] = await Promise.all([
    fetchClients(),
    fetchNextInvoiceNumber(),
    fetchLastIssuedInvoices(5),
    fetchOverdueInvoices(5)
  ]);

  return (
    <div className="p-4 w-full max-w-[1600px] mx-auto space-y-6">

      <div className="flex flex-col gap-6 ">
        {/* Header Section */}
        <div className="space-y-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard" className="text-muted-foreground hover:text-foreground">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard/finances/invoices" className="text-muted-foreground hover:text-foreground">Facturas</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-foreground">Nueva Factura</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-foreground">Crear Nueva Factura</h1>
            <p className="text-muted-foreground text-sm">
              Complete los detalles para generar una nueva factura
            </p>
          </div>
        </div>

        {/* Main Content Grid (3 cols + 1 col) */}
        <div className="grid gap-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 ">

          {/* Main Form (Takes 3 columns) */}
          <div className="md:col-span-3 lg:col-span-3 xl:col-span-3">
            <CreateInvoiceForm
              clients={clients}
              nextInvoiceNumber={nextInvoiceNumber}
            />
          </div>

          {/* Sidebar (Takes 1 column) */}
          <div className="md:col-span-1 lg:col-span-1 xl:col-span-1 ">
            <InvoiceSidePanel lastIssued={lastIssued} overdue={overdue} />
          </div>

        </div>
      </div>
    </div>
  );
}