'use client';

import { useActionState } from 'react';
import { createClient } from '@/lib/actions'; // Asumimos que la acción está en este archivo
import type { ClientState } from '@/lib/definitions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Flag, Mail, Phone, User, UserPlus } from 'lucide-react';

export function CreateClientForm() {
  const initialState: ClientState = { message: null, errors: {} };
  const [state, formAction] = useActionState(createClient, initialState);

  return (
    <form action={formAction} className="space-y-4 py-2">
      <div className="space-y-2">
        <Label htmlFor="name"><User className='w-4 h-4' /> Nombre Completo</Label>
        <Input
          id="name"
          name="name"
          placeholder="Ej: Alejandro Sandjian"
          required
          aria-describedby="name-error"
          className="py-2 px-3 bg-neutral-200/80 border  border-neutral-300"
        />
        <div id="name-error" aria-live="polite" aria-atomic="true">
          {state.errors?.name &&
            state.errors.name.map((error: string) => (
              <p className="mt-1 text-xs text-danger" key={error}>
                {error}
              </p>
            ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email"><Mail className='w-4 h-4'/> Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Ej: alesandjian@gmail.com"
          className="py-2 px-3 bg-neutral-200/80 border border-neutral-300"
          aria-describedby="email-error"
        />
         <div id="email-error" aria-live="polite" aria-atomic="true">
          {state.errors?.email &&
            state.errors.email.map((error: string) => (
              <p className="mt-1 text-xs text-danger" key={error}>
                {error}
              </p>
            ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="brand"><Flag className='w-4 h-4'/> Marca (Opcional)</Label>
        <Input
          id="brand"
          name="brand"
          placeholder="Ej: OmegaSur S.A."
          className="py-2 px-3 bg-neutral-200/80 border border-neutral-300"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone"><Phone className='w-4 h-4'/> Teléfono (Opcional)</Label>
        <Input
          id="phone"
          name="phone"
          placeholder="Ej: +54 223 568 5711"
          className="py-2 px-3 bg-neutral-200/80 border border-neutral-300"
        />
      </div>
      

      <div className="flex justify-end pt-4">
        <Button type="submit" className='bg-info/80 text-white mt-6 hover:scale-105 duration-200 transition-all cursor-pointer'>
            <UserPlus className="mr-2 h-4 w-4" />
            Crear Cliente
        </Button>
      </div>
       <div aria-live="polite" aria-atomic="true">
          {state.message && (
            <p className="mt-2 text-sm text-danger">{state.message}</p>
          )}
      </div>
    </form>
  );
}
