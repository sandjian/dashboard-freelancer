'use client';

import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';
import { updateClient } from '@/lib/actions';
import type {  ClientState } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// 👇 Importamos los íconos
import { Flag, Mail, Phone, User, Save } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function EditClientForm({
  client,
  onSuccess
}: {
   client: {
    id: string;
    name: string;
    brand?: string | null;
    email?: string | null;
    phone?: string | null;
  };
  onSuccess?: () => void;
}) {
  const initialState: ClientState = { message: null, errors: {} };
  const updateClientWithId = updateClient.bind(null, client.id);
  const [state, formAction] = useActionState(updateClientWithId, initialState);

  useEffect(() => {
    if (state.message?.includes('éxito')) {
      toast.success('Cliente Actualizado', {
        description: state.message,
      });
      if (onSuccess) onSuccess(); // Cierra el diálogo
    } else if (state.message) {
      toast.error('Error', { description: state.message });
    }
  }, [state, onSuccess]); // Añade onSuccess a las dependencias

  
  return (
    <Card className='w-full max-w-4xl m-auto'>
      <CardContent>

        <form action={formAction} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="brand" className="flex items-center gap-2"><Flag className='w-4 h-4'/> Marca</Label>
            <Input
              id="brand"
              name="brand"
              defaultValue={client.brand ?? ''}
              className="py-2 px-3 bg-neutral-200/80 border border-neutral-300"
            />
            {state.errors?.brand && <p className="mt-1 text-xs text-danger">{state.errors.brand[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2"><User className='w-4 h-4' /> Nombre Contacto</Label>
            <Input
              id="name"
              name="name"
              defaultValue={client.name}
              required
              className="py-2 px-3 bg-neutral-200/80 border border-neutral-300"
            />
            {state.errors?.name && <p className="mt-1 text-xs text-danger">{state.errors.name[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2"><Mail className='w-4 h-4'/> Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={client.email ?? ''}
              className="py-2 px-3 bg-neutral-200/80 border border-neutral-300"
            />
            {state.errors?.email && <p className="mt-1 text-xs text-danger">{state.errors.email[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2"><Phone className='w-4 h-4'/> Teléfono (Opcional)</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={client.phone ?? ''}
              className="py-2 px-3 bg-neutral-200/80 border border-neutral-300"
            />
          </div>
          
          <div className="flex justify-end pt-4">
            <Button type="submit" className='bg-info/80 text-white mt-6 hover:scale-105 duration-200 transition-all cursor-pointer'>
              <Save className="mr-2 h-4 w-4" />
              Actualizar Cliente
            </Button>
          </div>
          
          <div aria-live="polite" aria-atomic="true">
            {state.message && (
              <p className="mt-2 text-sm text-danger">{state.message}</p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}