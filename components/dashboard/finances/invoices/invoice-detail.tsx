'use client';

import { useRef } from 'react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Importaciones de UI y utilidades
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { PencilIcon, PrinterIcon, ArrowDown, FileClockIcon, ClockIcon, CheckCircleIcon } from 'lucide-react';
import type { FullInvoice, LineItem } from '@/lib/definitions';

// Objeto para mapear el estado a su apariencia
const statusMap = {
  facturado: { label: 'Facturado', icon: CheckCircleIcon, variant: 'success' as const },
  pendiente: { label: 'Pendiente', icon: ClockIcon, variant: 'warning' as const },
  vencido: { label: 'Vencido', icon: FileClockIcon, variant: 'danger' as const },
};

const formatDateToLocal = (dateStr: Date, locale: string = 'es-AR') => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'numeric', year: 'numeric' };
    return new Intl.DateTimeFormat(locale, options).format(date);
};

function DetailItem({ label, value }: { label: string; value: string | React.ReactNode }) {
    return (
        <div className='w-full space-y-2'>
            <p className="text-muted-foreground">{label}</p>
            <div className='border border-white bg-white rounded-xl w-full px-4 py-3 font-semibold text-xs'>
                {value}
            </div>
        </div>
    );
}

export default function InvoiceDetails({ invoice }: { invoice: FullInvoice }) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async () => {
    const element = invoiceRef.current;
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff', // Mantenemos el fondo blanco por seguridad
    });
    const data = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProperties = pdf.getImageProperties(data);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;

    pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`factura-INV-0000${invoice.invoice_number}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  const subtotal = invoice.line_items.reduce((acc: number, item: LineItem) => acc + (item.quantity * item.unit_price), 0);
  const statusInfo = statusMap[invoice.status as keyof typeof statusMap] || statusMap.pendiente;

  return (
    <div className="p-4 w-full max-w-5xl m-auto space-y-6">
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #invoice-print-area, #invoice-print-area * { visibility: visible; }
          #invoice-print-area { position: absolute; left: 0; top: 0; width: 100%; }
          
          /* 👇 CORRECCIÓN 2: Forzamos el layout de grid para la impresión */
          .print-grid-2-cols {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .print-grid-4-cols {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }
      `}</style>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink asChild><Link href="/dashboard">Dashboard</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink asChild><Link href="/dashboard/finances/invoices">Facturas</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>Factura INV-0000{invoice.invoice_number}/25</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center gap-2 flex-wrap">
          <Button asChild variant="outline" size="sm" className='cursor-pointer hover:scale-105 transition-all duration-300'><Link href={`/dashboard/finances/invoices/${invoice.id}/edit`}><PencilIcon className="w-4 mr-2 " /> Editar</Link></Button>
          <Button variant="outline" size="sm" className='cursor-pointer hover:scale-105 transition-all duration-300' onClick={handleDownloadPdf}><ArrowDown className="w-4 mr-2 " /> Descargar</Button>
          <Button variant="outline" size="sm" className='cursor-pointer hover:scale-105 transition-all duration-300' onClick={handlePrint}><PrinterIcon className="w-4 mr-2 " /> Imprimir</Button>
        </div>
      </div>

      <div id="invoice-print-area" ref={invoiceRef}>
        {/* 👇 CORRECCIÓN 1: Añadimos bg-white para asegurar un fondo simple */}
        <Card className='mx-auto max-w-5xl w-full bg-white'>
            <CardContent className="space-y-6 pt-10 px-12">
                {/* 👇 CORRECCIÓN 2: Usamos la nueva clase de impresión */}
                <div className="grid grid-cols-1 md:grid-cols-2 print-grid-2-cols gap-6 px-4">
                    <div className="p-4 border-r border-dashed space-y-2">
                        <h3 className='text-xl font-semibold'>De:</h3>
                        <div className='flex flex-col gap-y-2'>
                            <p className="font-semibold text-sm">Tu Empresa</p>
                            <p className="text-xs text-muted-foreground">Calle Falsa 123</p>
                            <p className="text-xs text-muted-foreground">contacto@tuempresa.com</p>
                        </div>
                    </div>
                    <div className="p-4">
                        <h3 className="font-semibold text-xl">Para:</h3>
                        <div className='flex flex-col gap-y-2 mt-2'>
                            <p className="font-semibold text-sm">{invoice.client.name}</p>
                            <p className="text-xs text-muted-foreground">{invoice.client.email}</p>
                        </div>
                    </div>
                </div>

                {/* 👇 CORRECCIÓN 2: Usamos la nueva clase de impresión */}
                <div className="grid grid-cols-1 md:grid-cols-4 print-grid-4-cols gap-4 py-6 px-4 bg-[#ececec] border border-[#ececec] rounded-xl shadow-sm text-xs">
                    <DetailItem label="Nº Factura" value={`INV-0000${invoice.invoice_number}/25`} />
                    <div className='w-full space-y-2'>
                        <p className="text-muted-foreground">Estado</p>
                        <div className='border border-white bg-white rounded-xl w-full px-4 py-2 font-semibold text-sm'>
                            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        </div>
                    </div>
                    <DetailItem label="Fecha Emisión" value={formatDateToLocal(invoice.issue_date)} />
                    <DetailItem label="Fecha Vencimiento" value={formatDateToLocal(invoice.due_date)} />
                </div>

                <div className="space-y-4 py-6 px-4">
                    <h3 className="font-medium">Ítems de Factura</h3>
                    <div className=" ">
                        <Table >
                            <TableHeader><TableRow className='text-xs   ' ><TableHead className="w-[50%] bg-[#ececec] rounded-tl-xl">Descripción</TableHead><TableHead className='bg-[#ececec] '>Cantidad</TableHead><TableHead className='bg-[#ececec] '>Precio Unit.</TableHead><TableHead className="text-right rounded-tr-xl bg-[#ececec]">Total</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {invoice.line_items.map((item: LineItem) => (
                                    <TableRow key={item.id}><TableCell className='text-xs'>{item.description}</TableCell><TableCell className='text-xs'>{item.quantity}</TableCell><TableCell className='text-xs'>{formatCurrency(item.unit_price)}</TableCell><TableCell className="text-right text-xs font-semibold">{formatCurrency(item.quantity * item.unit_price)}</TableCell></TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* 👇 CORRECCIÓN 2: Usamos la nueva clase de impresión */}
                <div className="grid grid-cols-1 md:grid-cols-2 print-grid-2-cols gap-6 py-6 px-4">
                    <div className="space-y-2 text-xs"></div>
                    <div className="space-y-2 text-right text-xs">
                        <div className="flex justify-between"><span className="text-[#4e4e4e]">Subtotal:</span><span>{formatCurrency(subtotal)}</span></div>
                        <div className="flex justify-between"><span className="text-[#4e4e4e]">Descuento ({invoice.discount}%):</span><span>-{formatCurrency(subtotal * (invoice.discount / 100))}</span></div>
                        <div className="flex justify-between pt-2 border-t"><span className="font-medium text-sm">Total:</span><span className="font-bold text-sm">{formatCurrency(invoice.amount)}</span></div>
                    </div>
                </div>

                <div className="pt-4 mt-4 border-t text-xs text-[#4e4e4e] py-10">
                    <p className="font-medium">Atención al Consumidor:</p>
                    <p>Ante cualquier duda o reclamo, por favor contactarse a contacto@tuempresa.com</p>
                    <p>Horario de atención: Lunes a Viernes de 9:00 a 18:00 hs</p>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
