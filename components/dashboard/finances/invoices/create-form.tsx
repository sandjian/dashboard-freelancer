'use client';

import { useActionState, useState, useEffect } from 'react';
import Link from 'next/link';
import { createInvoice } from '@/lib/actions';
import type { InvoiceState, Client } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'; // 👈 Tabla de shadcn
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { DatePicker } from '@/components/ui/date-picker';
import { formatCurrency } from '@/lib/utils';
// 👇 Importamos los íconos necesarios
import { PlusIcon, PencilIcon, FileClockIcon, ClockIcon, CheckCircleIcon, Trash2 } from 'lucide-react';
import { useFormScrollOnError } from '@/lib/hooks';

// Objeto para manejar los estados y sus íconos
const statusOptions = [
  { value: 'facturado', label: 'Facturado', icon: CheckCircleIcon },
  { value: 'pendiente', label: 'Pendiente', icon: ClockIcon },
  { value: 'vencido', label: 'Vencido', icon: FileClockIcon },
];

export function CreateInvoiceForm({ clients, nextInvoiceNumber }: { clients: Client[], nextInvoiceNumber: number }) {
  const initialState: InvoiceState = { message: null, errors: {} };
  const [state, formAction] = useActionState(createInvoice, initialState);

  const [lineItems, setLineItems] = useState([{ description: '', quantity: 1, unit_price: 0, total_price: 0 }]);
  const [discount, setDiscount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientModalOpen, setClientModalOpen] = useState(false);
 useFormScrollOnError(state.errors)
  useEffect(() => {
    const newSubtotal = lineItems.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);
    setSubtotal(newSubtotal);
    const discountAmount = newSubtotal * (discount / 100);
    setTotal(newSubtotal - discountAmount);
  }, [lineItems, discount]);

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
      <input type="hidden" name="currency" value="ARS" />
      <Card className='mx-auto max-w-5xl w-full'>
        <CardContent className="space-y-6 pt-10 px-12">
          {/* Sección From/To */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
            <div className="p-4 border-r border-dashed space-y-2">
              <h3 className='text-xl font-semibold'>De:</h3>
              <div className="flex flex-col gap-y-2">
                <Input value="Tu Empresa" className='font-semibold text-sm' readOnly />
                <Input value="Calle Falsa 123" className='text-xs text-muted-foreground' readOnly />
                <Input value="contacto@tuempresa.com" className='text-xs text-muted-foreground' readOnly />
              </div>
            </div>
            <div className="p-4 ">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-xl">Para:</h3>
                <Dialog open={isClientModalOpen} onOpenChange={setClientModalOpen}>
                  <DialogTrigger asChild>
                    {/* 👇 Botón de cliente modificado 👇 */}
                    <Button  size="icon" className="border border-info/80 rounded-full mr-3 cursor-pointer hover:scale-105 transition-all size-10 ">
                      <PencilIcon className="w-4 h-4 text-info/80" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader className="flex-row items-center justify-between pt-6">
                      <div>
                        <DialogTitle>Clientes</DialogTitle>
                        <DialogDescription>Selecciona un cliente para la factura.</DialogDescription>
                      </div>
                      <Button asChild size="sm">
                        <Link href="/dashboard/clients">Crear Cliente</Link>
                      </Button>
                    </DialogHeader>
                    <Separator />
                    <div className="flex flex-col space-y-1 max-h-[300px] overflow-y-auto">
                      {clients.map((client) => (
                        <div key={client.id} onClick={() => { setSelectedClient(client); setClientModalOpen(false); }} className="p-3 hover:bg-accent rounded-md cursor-pointer">
                          <p className="font-medium">{client.name}</p>
                          <p className="text-sm text-muted-foreground">{client.email}</p>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div data-form-error={!!state.errors?.client_id}>
                {state.errors?.client_id && (
                  <p className="text-sm text-red-500 mt-2"></p>
                )}
              </div>
              <div className="">
                {selectedClient ? (
                  <div className='flex flex-col gap-y-2'>
                    {/* 👇 MEJORA 3: Visualización en la Factura 👇 */}
                    <p className="font-semibold text-sm">{selectedClient.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedClient.email}</p>
                    <p className="text-xs text-muted-foreground">{selectedClient.email}</p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Ningún cliente seleccionado.</p>
                )}
              </div>
              {state.errors?.client_id && (
                <p className="text-sm text-red-500">{state.errors.client_id[0]}</p>
              )}
            </div>
          </div>

          {/* Detalles de la factura */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-6 px-4 bg-neutral-300/20 border border-neutral-200/30 rounded-xl shadow-sm text-xs">
            <div className='w-full space-y-2'>
              <Label>Nº Factura</Label>
              <Input value={`INV-0000${nextInvoiceNumber}/25`} className='border border-white rounded-xl w-full px-4 py-4 font-semibold' readOnly disabled />
            </div>
            <div className='w-full space-y-2 text-xs'>
              <Label htmlFor="status">Estado</Label>
              <Select name="status" defaultValue="pendiente">
                <SelectTrigger className='border border-white rounded-xl w-full px-4 py-6 text-xs bg-white'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='pt-2 mt-2 bg-white border border-neutral-200'>
                  {/* 👇 Select de estado con íconos 👇 */}
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
            <div className='w-full space-y-2 text-xs'>
              <Label htmlFor="issue_date ">Fecha Emisión</Label>
              <DatePicker name="issue_date" defaultValue={new Date()} />
              {state.errors?.issue_date && <p className="text-sm text-red-500">{state.errors.issue_date[0]}</p>}
            </div>
            <div className='w-full space-y-2 text-xs'>
              <Label htmlFor="due_date">Fecha Vencimiento</Label>
              <DatePicker name="due_date"  />
              {state.errors?.due_date && <p className="text-sm text-red-500">{state.errors.due_date[0]}</p>}
            </div>
          </div>

          {/* Ítems de la factura */}
          <div className="space-y-4 py-6 px-4">
            <h3 className="font-medium">Ítems de Factura</h3>
            {/* 👇 Tabla de ítems con componentes de shadcn 👇 */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className='text-xs bg-black/5'>
                    <TableHead className="w-[50%]">Descripción</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Precio Unit.</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead><span className="sr-only">Eliminar</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className='text-xs'>
                        <Input type="text" placeholder="Descripción del servicio ..." value={item.description}  required onChange={(e) => handleItemChange(index, 'description', e.target.value)} className='border border-neutral-500/20  py-2 px-3 ' />
                        <input type="hidden" name={`description-${index}`} value={item.description} />
                      </TableCell>
                      <TableCell className='text-xs'>
                        <Input type="number" value={item.quantity} required onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))} className="w-20 border border-neutral-500/20  py-2 px-3" />
                        <input type="hidden" name={`quantity-${index}`} value={item.quantity} />
                      </TableCell>
                      <TableCell className='text-xs'>
                        <Input type="number" value={item.unit_price}  onChange={(e) => handleItemChange(index, 'unit_price', Number(e.target.value))} className="w-24 border border-neutral-500/20 py-2 px-3" />
                        <input type="hidden" name={`unit_price-${index}`} value={item.unit_price} />
                      </TableCell>
                      <TableCell className="text-right text-xs font-semibold">{formatCurrency(item.total_price)}</TableCell>
                      <TableCell>
                        <Button type="button"  size="icon" className=' rounded-full shadow-sm cursor-pointer border border-danger/30 ml-3 hover:scale-105 transition-all' onClick={() => removeItem(index)}>
                          <Trash2 className="h-5 w-5 text-danger/50" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* 👇 Botón de añadir ítem modificado 👇 */}
            <Button type="button"  size="icon" className="rounded-full border border-success ml-3 cursor-pointer hover:scale-105 transition-all" onClick={addItem}>
              <PlusIcon className="h-4 w-4 text-success" />
            </Button>
          </div>

          {/* Descuento y Totales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 px-4">
            <div className="space-y-2 text-xs">
              <Label htmlFor="discount">Descuento (%)</Label>
              <Input name="discount" type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value) || 0)} className="ml-3 border border-neutral-200 rounded-xl w-32 px-4 py-4 font-semibold" />
            </div>
            <div className="space-y-2 text-right text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal:</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Descuento ({discount}%):</span><span>-{formatCurrency(subtotal * (discount / 100))}</span></div>
              <div className="flex justify-between pt-2 border-t"><span className="font-medium text-sm">Total:</span><span className="font-bold text-sm">{formatCurrency(total)}</span></div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 mt-4 border-t text-xs text-muted-foreground py-10">
            <p className="font-medium">Atención al Consumidor:</p>
            <p>Ante cualquier duda o reclamo, por favor contactarse a contacto@tuempresa.com</p>
            <p>Horario de atención: Lunes a Viernes de 9:00 a 18:00 hs</p>
          </div>
        </CardContent>
      </Card>

      {/* Botones de Acción */}
      <div className="flex justify-end gap-4 w-full max-w-5xl m-auto pr-3">
        <Button name="status" value="Pendiente" type="submit" className='transition-all hover:scale-105 text-success shadow-sm border border-success '><span className='font-semibold text-xl mr-2'>+</span>Crear Factura</Button>
      </div>
    </form>
  );
}