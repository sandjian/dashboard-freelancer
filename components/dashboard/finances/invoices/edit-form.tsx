'use client';

import { useActionState, useState, useEffect } from 'react';
import Link from 'next/link';
import { updateInvoice } from '@/lib/actions';
import type { InvoiceState, Client, LineItem } from '@/lib/definitions';
import { AnimatedSubmitButton } from '@/components/ui/animated-submit-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { DatePicker } from '@/components/ui/date-picker';
import { formatCurrency } from '@/lib/utils';
import { PlusIcon, PencilIcon, FileClockIcon, ClockIcon, CheckCircleIcon, Trash2 } from 'lucide-react';
import { useFormScrollOnError } from '@/lib/hooks';
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

// Helper to extract initials
function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Objeto para manejar los estados y sus íconos
const statusOptions = [
  { value: 'facturado', label: 'Facturado', icon: CheckCircleIcon },
  { value: 'pendiente', label: 'Pendiente', icon: ClockIcon },
  { value: 'vencido', label: 'Vencido', icon: FileClockIcon },
];

// Tipo para la factura completa que recibe el formulario
export type EditInvoiceData = {
  line_items: Array<Partial<LineItem> & { unit_price: number; quantity?: number; description?: string }>;
  id: string;
  client_id: string;
  invoice_number: number;
  amount: number;
  currency: string;
  discount: number;
  status: string;
  issue_date: Date;
  due_date: Date;
};

// Tipo flexible para los ítems en el estado del formulario
type FormLineItem = {
  id?: string;
  invoice_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price?: number; // Añadido para consistencia
};

export function EditInvoiceForm({ invoice, clients }: { invoice: EditInvoiceData, clients: Client[] }) {
  const initialState: InvoiceState = { message: null, errors: {} };
  const updateInvoiceWithId = updateInvoice.bind(null, invoice.id);
  const [state, formAction] = useActionState(updateInvoiceWithId, initialState);

  // Estado del formulario
  const [lineItems, setLineItems] = useState<FormLineItem[]>(invoice.line_items.map(item => ({
    ...item,
    description: item.description || '',
    quantity: item.quantity ?? 1,
    total_price: (item.quantity ?? 1) * item.unit_price
  })));
  const [discount, setDiscount] = useState(invoice.discount);
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedClient, setSelectedClient] = useState<Client | null>(() => clients.find(c => c.id === invoice.client_id) || null);
  const [isClientModalOpen, setClientModalOpen] = useState(false);
  useFormScrollOnError(state.errors);

  // Efecto para recalcular totales
  useEffect(() => {
    const newSubtotal = lineItems.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);
    setSubtotal(newSubtotal);
    const discountAmount = newSubtotal * (discount / 100);
    setTotal(newSubtotal - discountAmount);
  }, [lineItems, discount]);

  // Manejadores de ítems
  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...lineItems];
    const currentItem = { ...newItems[index], [field]: value };
    currentItem.total_price = currentItem.quantity * currentItem.unit_price;
    newItems[index] = currentItem;
    setLineItems(newItems);
  };

  const addItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unit_price: 0, total_price: 0 }]);
  };

  const removeItem = (index: number) => {
    const newItems = lineItems.filter((_, i) => i !== index);
    setLineItems(newItems);
  };

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="client_id" value={selectedClient?.id || ''} />
      <input type="hidden" name="currency" value={invoice.currency} />
      <Card className='mx-auto max-w-7xl w-full border-border shadow-sm'>
        <CardContent className="space-y-6 pt-10 px-12">
          {/* Sección From/To */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
            <div className="p-4 border-r border-border border-dashed space-y-2">
              <h3 className='text-xl font-semibold text-foreground'>De:</h3>
              <div className="flex flex-col gap-y-2">
                <Input value="Tu Empresa" className='font-semibold text-sm bg-muted/50 border-transparent text-foreground p-2' readOnly />
                <Input value="Calle Falsa 123" className='text-xs text-muted-foreground bg-transparent border-transparent px-0 h-auto' readOnly />
                <Input value="contacto@tuempresa.com" className='text-xs text-muted-foreground bg-transparent border-transparent px-0 h-auto' readOnly />
              </div>
            </div>
            <div className="p-4 ">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-xl text-foreground">Para:</h3>
                <Dialog open={isClientModalOpen} onOpenChange={setClientModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon" type="button" className="rounded-full mr-3 cursor-pointer hover:bg-muted transition-all size-10">
                      <PencilIcon className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader className="flex-row items-center justify-between pt-6">
                      <div>
                        <DialogTitle>Clientes</DialogTitle>
                        <DialogDescription>Selecciona un cliente para la factura.</DialogDescription>
                      </div>
                      <Button asChild size="sm" variant="secondary" className="rounded-xl bg-primary/80 hover:bg-primary/95 transition-all duration-300 py-2 text-white"  >
                        <Link href="/dashboard/clients">
                          <span className="mr-2">
                            +
                          </span>
                          Crear Cliente
                        </Link>
                      </Button>
                    </DialogHeader>
                    <Separator />
                    <div className="flex flex-col space-y-1 max-h-[300px] overflow-y-auto">
                      {clients.map((client) => (
                        <div key={client.id} onClick={() => { setSelectedClient(client); setClientModalOpen(false); }} className="flex items-center gap-3 p-3 hover:bg-muted rounded-md cursor-pointer transition-colors group">
                          {/* Avatar for Client List */}
                          <Avatar className="h-10 w-10 border border-border">
                            <AvatarImage src={client.image_url || ''} alt={client.name} />
                            <AvatarFallback className="bg-muted text-muted-foreground text-xs font-semibold">
                              {getInitials(client.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{client.name}</p>
                            <p className="text-sm text-muted-foreground">{client.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="">
                {selectedClient ? (
                  <div className='flex flex-col gap-y-2 mt-2'>
                    <p className="font-semibold text-sm text-foreground">{selectedClient.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedClient.email}</p>
                    <Badge variant="outline" className="w-fit text-[10px] font-normal border border-border">Cliente Registrado</Badge>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground mt-2 italic">Ningún cliente seleccionado.</p>
                )}
              </div>
              {state.errors?.client_id && (
                <p className="text-sm text-destructive mt-2">{state.errors.client_id[0]}</p>
              )}
            </div>
          </div>

          {/* Detalles de la factura */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-5 px-4 bg-muted/20 border border-border rounded-xl shadow-xs text-xs">
            <div className='w-full space-y-1.5'>
              <Label className="text-xs font-medium text-muted-foreground">Nº Factura</Label>
              <Input value={`INV-0000${invoice.invoice_number}/25`} className='bg-background border-border text-foreground rounded-xl w-full h-10 px-3.5 font-semibold text-xs' readOnly disabled />
            </div>
            <div className='w-full space-y-1.5'>
              <Label htmlFor="status" className="text-xs font-medium text-muted-foreground">Estado</Label>
              <Select name="status" defaultValue={invoice.status}>
                <SelectTrigger className='bg-background border-border text-foreground hover:bg-muted/50 rounded-xl w-full h-10 px-3.5 text-xs'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(({ value, label, icon: Icon }) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2 text-xs">
                        <Icon className="h-4 w-4 " />
                        <span>{label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='w-full space-y-1.5'>
              <Label htmlFor="issue_date" className="text-xs font-medium text-muted-foreground">Fecha Emisión</Label>
              <DatePicker name="issue_date" defaultValue={new Date(invoice.issue_date)} className='w-full' />
              {state.errors?.issue_date && <p className="text-xs text-destructive mt-1">{state.errors.issue_date[0]}</p>}
            </div>
            <div className='w-full space-y-1.5'>
              <Label htmlFor="due_date" className="text-xs font-medium text-muted-foreground">Fecha Vencimiento</Label>
              <DatePicker name="due_date" defaultValue={new Date(invoice.due_date)} className='w-full' />
              {state.errors?.due_date && <p className="text-xs text-destructive mt-1">{state.errors.due_date[0]}</p>}
            </div>
          </div>

          {/* Ítems de la factura */}
          <div className="space-y-4 py-6 px-4">
            <h3 className="font-medium text-foreground">Ítems de Factura</h3>
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className='text-xs border-border hover:bg-transparent'>
                    <TableHead className="w-[50%]">Descripción</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Precio Unit.</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead><span className="sr-only">Eliminar</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((item, index) => (
                    <TableRow key={item.id || index} className="border-border hover:bg-muted/30">
                      <TableCell className='text-xs'>
                        <Input type="text" placeholder="Descripción del servicio ..." value={item.description} required onChange={(e) => handleItemChange(index, 'description', e.target.value)} className='border-border bg-background focus:ring-primary py-2 px-3' />
                        <input type="hidden" name={`description-${index}`} value={item.description} />
                        {/* Es importante enviar el ID del ítem para que el backend sepa cuál actualizar */}
                        {item.id && <input type="hidden" name={`item_id-${index}`} value={item.id} />}
                      </TableCell>
                      <TableCell className='text-xs'>
                        <Input type="number" value={item.quantity} required onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))} className="w-20 border-border bg-background py-2 px-3" />
                        <input type="hidden" name={`quantity-${index}`} value={item.quantity} />
                      </TableCell>
                      <TableCell className='text-xs'>
                        <Input type="number" value={item.unit_price} onChange={(e) => handleItemChange(index, 'unit_price', Number(e.target.value))} className="w-24 border-border bg-background py-2 px-3" />
                        <input type="hidden" name={`unit_price-${index}`} value={item.unit_price} />
                      </TableCell>
                      <TableCell className="text-right text-xs font-semibold text-foreground">{formatCurrency(item.total_price || 0)}</TableCell>
                      <TableCell>
                        <Button type="button" size="icon" variant="ghost" className='rounded-full h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all' onClick={() => removeItem(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Button type="button" size="sm" variant="outline" className="border-dashed border-primary/50 text-primary hover:bg-primary/5 ml-1 mt-2 transition-all" onClick={addItem}>
              <PlusIcon className="h-4 w-4 mr-2" /> Agregar Ítem
            </Button>
          </div>

          {/* Descuento y Totales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 px-4">
            <div className="space-y-2 text-xs">
              <Label htmlFor="discount" className="text-muted-foreground">Descuento (%)</Label>
              <Input name="discount" type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value) || 0)} className="ml-3 border-border bg-background rounded-xl w-32 px-4 py-4 font-semibold" />
            </div>
            <div className="space-y-2 text-right text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal:</span><span className="text-foreground">{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Descuento ({discount}%):</span><span className="text-destructive">-{formatCurrency(subtotal * (discount / 100))}</span></div>
              <div className="flex justify-between pt-2 border-t border-border"><span className="font-medium text-sm text-foreground">Total:</span><span className="font-bold text-sm text-foreground">{formatCurrency(total)}</span></div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 mt-4 border-t border-border text-xs text-muted-foreground py-10">
            <p className="font-medium text-foreground">Atención al Consumidor:</p>
            <p>Ante cualquier duda o reclamo, por favor contactarse a contacto@tuempresa.com</p>
            <p>Horario de atención: Lunes a Viernes de 9:00 a 18:00 hs</p>
          </div>
        </CardContent>
      </Card>

      {/* Botones de Acción */}
      <div className="flex justify-end gap-4 w-full max-w-5xl m-auto pr-3">
        <Button asChild variant="outline" className='transition-all hover:bg-muted py-5 h-[56px] rounded-xl'>
          <Link href="/dashboard/finances/invoices">Cancelar</Link>
        </Button>
        <AnimatedSubmitButton name="status" value="pending" type="submit">
          Actualizar Factura
        </AnimatedSubmitButton>
      </div>
    </form>
  );
}
