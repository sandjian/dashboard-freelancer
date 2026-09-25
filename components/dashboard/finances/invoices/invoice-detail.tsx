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
import { formatCurrency, cn } from '@/lib/utils';
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
    <div className='w-full space-y-1.5'>
      <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono">{label}</p>
      <div className='border border-border/60 bg-muted/30 rounded-xl w-full px-4 py-3 font-semibold text-xs text-foreground'>
        {value}
      </div>
    </div>
  );
}

export default function InvoiceDetails({ invoice }: { invoice: FullInvoice }) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  /* 👇 PDF FIX: Replacing flaky html2canvas with window.print() leveraging the print CSS */
  const handleDownloadPdf = async () => {
    window.print();
  };

  const handlePrint = () => {
    window.print();
  };

  const subtotal = invoice.line_items.reduce((acc: number, item: LineItem) => acc + (item.quantity * item.unit_price), 0);
  
  const statusLower = invoice.status?.toLowerCase() || '';
  const isPaid = ['facturado', 'paid', 'cobrado'].includes(statusLower);
  const isPending = ['pendiente', 'pending'].includes(statusLower);
  const isOverdue = ['vencido', 'overdue'].includes(statusLower);

  return (
    <div className="p-4 w-full max-w-5xl m-auto space-y-6">
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #invoice-print-area, #invoice-print-area * { visibility: visible; }
          #invoice-print-area { position: absolute; left: 0; top: 0; width: 100%; }
          #invoice-print-area .bg-card { background: white !important; color: black !important; border: 1px solid #ddd !important; }
          #invoice-print-area .text-foreground { color: black !important; }
          #invoice-print-area .text-muted-foreground { color: #666 !important; }
          #invoice-print-area .bg-muted\\/30, #invoice-print-area .bg-muted\\/50 { background: #f9f9f9 !important; }
          
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
        <Card className='mx-auto max-w-5xl w-full bg-card border-border shadow-xs'>
          <CardContent className="space-y-6 pt-10 px-6 sm:px-12">
            <div className="grid grid-cols-1 md:grid-cols-2 print-grid-2-cols gap-6 px-2 sm:px-4">
              <div className="p-4 border-b md:border-b-0 md:border-r border-dashed border-border/60 space-y-2">
                <h3 className='text-lg font-semibold font-mono tracking-tight text-foreground'>De:</h3>
                <div className='flex flex-col gap-y-1.5'>
                  <p className="font-semibold text-sm text-foreground">Tu Empresa</p>
                  <p className="text-xs text-muted-foreground">Calle Falsa 123</p>
                  <p className="text-xs text-muted-foreground">contacto@tuempresa.com</p>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-lg font-mono tracking-tight text-foreground">Para:</h3>
                <div className='flex flex-col gap-y-1.5'>
                  <p className="font-semibold text-sm text-foreground">{invoice.client.name}</p>
                  <p className="text-xs text-muted-foreground">{invoice.client.email}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 print-grid-4-cols gap-4 rounded-xl text-xs">
              <DetailItem label="Nº Factura" value={`INV-0000${invoice.invoice_number}/25`} />
              <div className='w-full space-y-1.5'>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Estado</p>
                <div className='border border-border/60 bg-muted/30 rounded-xl w-full px-4 py-2.5 font-semibold text-sm flex items-center h-[42px]'>
                  <span
                    className={cn(
                      "inline-flex items-center justify-center gap-1.5 text-xs font-mono leading-none tracking-tight px-2.5 py-1 rounded-md border capitalize whitespace-nowrap",
                      isPaid && "bg-neutral-100 text-neutral-900 border-neutral-300 dark:bg-white/[0.08] dark:text-zinc-100 dark:border-white/20",
                      isPending && "bg-neutral-100/80 text-neutral-600 border-neutral-300 dark:bg-zinc-900/60 dark:text-zinc-400 dark:border-zinc-800/80",
                      isOverdue && "bg-neutral-200/80 text-neutral-800 border-neutral-300 dark:bg-zinc-800/40 dark:text-zinc-300 dark:border-zinc-700",
                      !isPaid && !isPending && !isOverdue && "bg-neutral-100 text-neutral-500 border-neutral-200 dark:bg-zinc-900/40 dark:text-zinc-500 dark:border-zinc-800"
                    )}
                  >
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0",
                        isPaid && "bg-secondary/40 dark:bg-foreground/90",
                        isPending && "border border-neutral-500 bg-transparent dark:border-zinc-500",
                        isOverdue && "bg-neutral-700 dark:bg-zinc-400",
                        !isPaid && !isPending && !isOverdue && "bg-neutral-400 dark:bg-zinc-600"
                      )}
                    />
                    <span>{invoice.status}</span>
                  </span>
                </div>
              </div>
              <DetailItem label="Fecha Emisión" value={formatDateToLocal(invoice.issue_date)} />
              <DetailItem label="Fecha Vencimiento" value={formatDateToLocal(invoice.due_date)} />
            </div>

            <div className="space-y-4 py-4 px-2 sm:px-4">
              <h3 className="font-medium text-sm text-foreground">Ítems de Factura</h3>
              <div className="rounded-xl border border-border/60 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className='text-xs bg-muted/50 border-b border-border/60'>
                      <TableHead className="w-[50%] font-semibold uppercase tracking-wider text-[11px] text-muted-foreground/80">Descripción</TableHead>
                      <TableHead className='font-semibold uppercase tracking-wider text-[11px] text-muted-foreground/80'>Cantidad</TableHead>
                      <TableHead className='font-semibold uppercase tracking-wider text-[11px] text-muted-foreground/80'>Precio Unit.</TableHead>
                      <TableHead className="text-right font-semibold uppercase tracking-wider text-[11px] text-muted-foreground/80">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.line_items.map((item: LineItem) => (
                      <TableRow key={item.id} className="border-b border-border/40 hover:bg-muted/20">
                        <TableCell className='text-xs font-medium text-foreground'>{item.description}</TableCell>
                        <TableCell className='text-xs text-muted-foreground'>{item.quantity}</TableCell>
                        <TableCell className='text-xs font-mono text-muted-foreground'>{formatCurrency(item.unit_price)}</TableCell>
                        <TableCell className="text-right text-xs font-semibold font-mono text-foreground">{formatCurrency(item.quantity * item.unit_price)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 print-grid-2-cols gap-6 py-4 px-2 sm:px-4">
              <div className="space-y-2 text-xs"></div>
              <div className="space-y-2 text-right text-xs bg-muted/20 p-4 rounded-xl border border-border/40">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal:</span><span className="font-mono text-foreground">{formatCurrency(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Descuento ({invoice.discount}%):</span><span className="font-mono text-foreground">-{formatCurrency(subtotal * (invoice.discount / 100))}</span></div>
                <div className="flex justify-between pt-2 border-t border-border/60"><span className="font-medium text-sm text-foreground">Total:</span><span className="font-bold text-base font-mono text-foreground">{formatCurrency(invoice.amount)}</span></div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-border/60 text-xs text-muted-foreground py-6">
              <p className="font-medium text-foreground mb-1">Atención al Consumidor:</p>
              <p>Ante cualquier duda o reclamo, por favor contactarse a contacto@tuempresa.com</p>
              <p>Horario de atención: Lunes a Viernes de 9:00 a 18:00 hs</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
