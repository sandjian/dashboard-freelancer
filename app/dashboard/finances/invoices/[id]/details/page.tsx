import { fetchInvoiceById } from '@/lib/data';
import { notFound } from 'next/navigation';
import InvoiceDetails from '@/components/dashboard/finances/invoices/invoice-detail';
import type { FullInvoice } from '@/lib/definitions'; // 👈 Importamos el tipo para asegurar la compatibilidad

export default async function InvoiceDetailsPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  // Extraemos el id usando Promise.resolve como en tu ejemplo
  const { id } = await Promise.resolve(params);
  const invoice = await fetchInvoiceById(id);

  if (!invoice) {
    notFound();
  }

  // 3. Pasamos los datos al componente de cliente para que renderice la UI
  return <InvoiceDetails invoice={invoice as FullInvoice} />;
}
