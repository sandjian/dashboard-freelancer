import { EditInvoiceForm } from '@/components/dashboard/finances/invoices/edit-form';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { fetchInvoiceById, fetchClients } from '@/lib/data';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function EditInvoicePage({ 
  params 
}: { 
  params: { id: string } 
}) {
  // Extraemos el id correctamente usando Promise.resolve
  const { id } = await Promise.resolve(params);

  // Buscamos la factura y la lista de clientes en paralelo
  const [invoice, clients] = await Promise.all([
    fetchInvoiceById(id),
    fetchClients(),
  ]);

  // Si la factura no existe, mostramos la página 404
  if (!invoice) {
    notFound();
  }

  return (
    <div className="p-4 w-full max-w-5xl m-auto space-y-6">
      <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink asChild><Link href="/dashboard">Dashboard</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink asChild><Link href="/dashboard/finances/invoices">Facturas</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage className='font-semibold'>Editar Factura INV-0000{invoice.invoice_number}/25</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      
      <EditInvoiceForm invoice={invoice} clients={clients} />
    </div>
  );
}