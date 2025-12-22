'use client';

import { updateInvoiceStatus } from '@/lib/actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export function InvoiceStatus({ id, currentStatus }: { id: string, currentStatus: string }) {
  // Usamos .bind() para pasar el 'id' a la acción
  const updateStatusWithId = updateInvoiceStatus.bind(null, id);

  return (
    <form action={updateStatusWithId} className="flex items-center gap-2">
      <Select name="status" defaultValue={currentStatus}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Cambiar estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pendiente">Pendiente</SelectItem>
          <SelectItem value="facturado">Pagada</SelectItem>
          <SelectItem value="vencido">Vencida </SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit">Actualizar</Button>
    </form>
  );
}