'use client';

import { useActionState, useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { createInvoice, getLastInvoiceForClient } from '@/lib/actions';
import type { InvoiceState, Client } from '@/lib/definitions';
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
import { PlusIcon, PencilIcon, FileClockIcon, ClockIcon, CheckCircleIcon, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { useFormScrollOnError } from '@/lib/hooks';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const statusOptions = [
  { value: 'facturado', label: 'Facturado', icon: CheckCircleIcon },
  { value: 'pendiente', label: 'Pendiente', icon: ClockIcon },
  { value: 'vencido', label: 'Vencido', icon: FileClockIcon },
];

export function CreateInvoiceForm({ clients, nextInvoiceNumber }: { clients: Client[], nextInvoiceNumber: number }) {
  const initialState: InvoiceState = { message: null, errors: {} };
  const [state, formAction] = useActionState(createInvoice, initialState);

  // Fechas: Por defecto emisión HOY y vencimiento a +10 DÍAS
  const [issueDate, setIssueDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    return d;
  });

  const [lineItems, setLineItems] = useState([
    { description: '', quantity: 1, unit_price: 0, total_price: 0 }
  ]);
  const [discount, setDiscount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientModalOpen, setClientModalOpen] = useState(false);
  const [isCloning, startCloning] = useTransition();

  useFormScrollOnError(state.errors);

  // Recálculo dinámico de montos
  useEffect(() => {
    const newSubtotal = lineItems.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);
    setSubtotal(newSubtotal);
    const validDiscount = Math.max(0, Math.min(100, discount || 0));
    const discountAmount = newSubtotal * (validDiscount / 100);
    setTotal(newSubtotal - discountAmount);
  }, [lineItems, discount]);

  // Si cambia la fecha de emisión, el vencimiento avanza automáticamente 10 días desde esa fecha base
  const handleIssueDateChange = (date: Date | undefined) => {
    if (!date) return;
    setIssueDate(date);
    const nextDue = new Date(date);
    nextDue.setDate(nextDue.getDate() + 10);
    setDueDate(nextDue);
  };


  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...lineItems];
    const currentItem = { ...newItems[index], [field]: value };
    currentItem.total_price = Number(currentItem.quantity || 0) * Number(currentItem.unit_price || 0);
    newItems[index] = currentItem;
    setLineItems(newItems);
  };

  const addItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unit_price: 0, total_price: 0 }]);
  };

  const removeItem = (index: number) => {
    if (lineItems.length === 1) {
      setLineItems([{ description: '', quantity: 1, unit_price: 0, total_price: 0 }]);
      return;
    }
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleLoadLastInvoice = () => {
    if (!selectedClient) return;

    startCloning(async () => {
      const lastData = await getLastInvoiceForClient(selectedClient.id);
      if (lastData && lastData.lineItems.length > 0) {
        setLineItems(
          lastData.lineItems.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.quantity * item.unit_price,
          }))
        );
        setDiscount(lastData.discount || 0);
      }
    });
  };

  const currentYearSuffix = new Date().getFullYear().toString().slice(-2);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="client_id" value={selectedClient?.id || ''} />
      <input type="hidden" name="currency" value="ARS" />

      <Card className="mx-auto max-w-7xl w-full border-border shadow-sm">
        <CardContent className="space-y-6 pt-10 px-6 sm:px-12">

          {/* SECCIÓN DE / PARA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2 sm:px-4">
            <div className="p-4 border-r border-border border-dashed space-y-2">
              <h3 className="text-xl font-semibold text-foreground">De:</h3>
              <div className="flex flex-col gap-y-2">
                <Input value="Tu Empresa" className="font-semibold text-sm bg-muted/50 border-transparent text-foreground p-2" readOnly />
                <Input value="Calle Falsa 123" className="text-xs text-muted-foreground bg-transparent border-transparent px-0 h-auto" readOnly />
                <Input value="contacto@tuempresa.com" className="text-xs text-muted-foreground bg-transparent border-transparent px-0 h-auto" readOnly />
              </div>
            </div>

            <div className="p-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-xl text-foreground">Para:</h3>
                <Dialog open={isClientModalOpen} onOpenChange={setClientModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon" type="button" className="rounded-full mr-3 hover:bg-muted transition-all size-10">
                      <PencilIcon className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader className="flex-row items-center justify-between pt-6">
                      <div>
                        <DialogTitle>Clientes</DialogTitle>
                        <DialogDescription>Selecciona un cliente para la factura.</DialogDescription>
                      </div>
                      <Button asChild size="sm" variant="secondary">
                        <Link href="/dashboard/clients">
                          <span className="mr-2">+</span> Crear Cliente
                        </Link>
                      </Button>
                    </DialogHeader>
                    <Separator />
                    <div className="flex flex-col space-y-1 max-h-[300px] overflow-y-auto">
                      {clients.map((client) => (
                        <div
                          key={client.id}
                          onClick={() => {
                            setSelectedClient(client);
                            setClientModalOpen(false);
                          }}
                          className="flex items-center gap-3 p-3 hover:bg-muted rounded-md cursor-pointer transition-colors"
                        >
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

              <div>
                {selectedClient ? (
                  <div className="flex flex-col gap-y-2 mt-2">
                    <p className="font-semibold text-sm text-foreground">{selectedClient.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedClient.email}</p>
                    <div className="flex items-center gap-2 pt-1">
                      <Badge variant="outline" className="w-fit text-[10px] font-normal border-border">
                        Cliente Registrado
                      </Badge>

                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={isCloning}
                        onClick={handleLoadLastInvoice}
                        className="h-6 text-[11px] gap-1 px-2 text-primary hover:bg-primary/10"
                      >
                        {isCloning ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Sparkles className="w-3 h-3 text-primary" />
                        )}
                        Repetir abono habitual
                      </Button>
                    </div>
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

          {/* METADATOS Y VENCIMIENTO INTELIGENTE */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-5 px-4 bg-muted/20 border border-border rounded-xl shadow-xs text-xs">
            <div className="w-full space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Nº Factura</Label>
              <Input
                value={`INV-${String(nextInvoiceNumber).padStart(6, '0')}/${currentYearSuffix}`}
                className="bg-background border-border text-foreground rounded-xl w-full h-10 px-3.5 font-semibold text-xs"
                readOnly
                disabled
              />
            </div>

            <div className="w-full space-y-1.5">
              <Label htmlFor="status" className="text-xs font-medium text-muted-foreground">Estado</Label>
              <Select name="status" defaultValue="pendiente">
                <SelectTrigger className="bg-background border-border text-foreground hover:bg-muted/50 rounded-xl w-full h-10 px-3.5 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(({ value, label, icon: Icon }) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2 text-xs">
                        <Icon className="h-4 w-4" />
                        <span>{label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full space-y-1.5">
              <Label htmlFor="issue_date" className="text-xs font-medium text-muted-foreground">Fecha Emisión</Label>
              <DatePicker
                name="issue_date"
                value={issueDate}
                onChange={handleIssueDateChange}
                className="w-full"
              />
              {state.errors?.issue_date && <p className="text-xs text-destructive mt-1">{state.errors.issue_date[0]}</p>}
            </div>

            <div className="w-full space-y-1.5">
              <Label htmlFor="due_date" className="text-xs font-medium text-muted-foreground">Fecha Vencimiento</Label>
              <DatePicker
                name="due_date"
                value={dueDate}
                onChange={(d: Date | undefined) => d && setDueDate(d)}
                baseDate={issueDate}
                presets={[
                  { label: 'Contado', days: 0 },
                  { label: '+7d', days: 7 },
                  { label: '+10d', days: 10 },
                  { label: '+15d', days: 15 },
                  { label: 'Fin de mes', days: 'eom' },
                ]}
                className="w-full"
              />
              {state.errors?.due_date && <p className="text-xs text-destructive mt-1">{state.errors.due_date[0]}</p>}
            </div>
          </div>

          {/* ÍTEMS DE FACTURA */}
          <div className="space-y-4 py-6 px-4">
            <h3 className="font-medium text-foreground">Ítems de Factura</h3>
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="text-xs border-border hover:bg-transparent">
                    <TableHead className="w-[50%]">Descripción</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Precio Unit. ($)</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-[50px]"><span className="sr-only">Eliminar</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((item, index) => (
                    <TableRow key={index} className="border-border hover:bg-muted/30">
                      <TableCell className="text-xs">
                        <Input
                          type="text"
                          placeholder="Descripción del servicio..."
                          value={item.description}
                          required
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          className="border-border bg-background focus:ring-primary py-2 px-3"
                        />
                        <input type="hidden" name={`description-${index}`} value={item.description} />
                      </TableCell>
                      <TableCell className="text-xs">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          required
                          onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value) || 1)}
                          className="w-20 border-border bg-background py-2 px-3 font-mono"
                        />
                        <input type="hidden" name={`quantity-${index}`} value={item.quantity} />
                      </TableCell>
                      <TableCell className="text-xs">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unit_price}
                          required
                          onChange={(e) => handleItemChange(index, 'unit_price', Number(e.target.value) || 0)}
                          className="w-28 border-border bg-background py-2 px-3 font-mono"
                        />
                        <input type="hidden" name={`unit_price-${index}`} value={item.unit_price} />
                      </TableCell>
                      <TableCell className="text-right text-xs font-semibold font-mono text-foreground">
                        {formatCurrency(item.total_price)}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="rounded-full h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Button
              type="button"
              size="sm"
              variant="outline"
              className="border-dashed border-primary/50 text-primary hover:bg-primary/5 ml-1 mt-2"
              onClick={addItem}
            >
              <PlusIcon className="h-4 w-4 mr-2" /> Agregar Ítem
            </Button>
          </div>

          {/* TOTALES Y DESCUENTO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 px-4">
            <div className="space-y-2 text-xs">
              <Label htmlFor="discount" className="text-muted-foreground">Descuento (%)</Label>
              <Input
                name="discount"
                type="number"
                min="0"
                max="100"
                value={discount}
                onChange={(e) => setDiscount(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                className="border-border bg-background rounded-xl w-32 px-4 py-4 font-semibold font-mono"
              />
            </div>
            <div className="space-y-2 text-right text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-sans">Subtotal:</span>
                <span className="text-foreground">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-sans">Descuento ({discount}%):</span>
                <span className="text-destructive">-{formatCurrency(subtotal * (discount / 100))}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="font-medium text-sm font-sans text-foreground">Total:</span>
                <span className="font-bold text-base text-foreground">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="pt-4 mt-4 border-t border-border text-xs text-muted-foreground py-8">
            <p className="font-medium text-foreground">Atención al Consumidor:</p>
            <p>Ante cualquier duda o consulta administrativa, contactarse a contacto@tuempresa.com</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4 w-full max-w-7xl m-auto pr-3">
        <AnimatedSubmitButton type="submit">
          Crear Factura
        </AnimatedSubmitButton>
      </div>
    </form>
  );
}