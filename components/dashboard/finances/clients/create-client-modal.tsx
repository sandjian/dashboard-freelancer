'use client';

import { useState, useEffect, useRef, useCallback } from 'react'; // useRef añadido
import { useActionState } from 'react';
import { createClient } from '@/lib/actions';
import type { ClientState } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus, Flag, Mail, Phone, User } from 'lucide-react';
import { toast } from 'sonner';

// El formulario ahora es un sub-componente interno
function ClientForm({ onSuccess }: { onSuccess: () => void }) {
  const initialState: ClientState = { message: null, errors: {} };
  const [state, formAction] = useActionState(createClient, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // LOG 1: Se ejecuta cada vez que el estado del formulario cambia (después de un envío)
    console.log('[ClientForm useEffect] El estado del formulario ha cambiado:', state);

    if (state.message?.includes('éxito')) {
      // LOG 2: Solo se ejecuta si la condición de éxito se cumple
      console.log('[ClientForm useEffect] Condición de éxito CUMPLIDA. Llamando a onSuccess...');
      
      toast.success('Cliente Creado', {
        
      });
      formRef.current?.reset();
      onSuccess();
    } else if (state.message) {
      toast.error('Error', { description: state.message });
    }
  }, [state, onSuccess]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4 py-2">
      <div className="space-y-2">
        <Label htmlFor="name" className="flex items-center gap-2"><User className='w-4 h-4' /> Nombre Completo</Label>
        <Input id="name" name="name" placeholder="Ej: Alejandro Sandjian" required />
        {state.errors?.name && <p className="mt-1 text-xs text-danger">{state.errors.name[0]}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center gap-2"><Mail className='w-4 h-4'/> Email</Label>
        <Input id="email" name="email" type="email" placeholder="Ej: alesandjian@gmail.com" />
         {state.errors?.email && <p className="mt-1 text-xs text-danger">{state.errors.email[0]}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="brand" className="flex items-center gap-2"><Flag className='w-4 h-4'/> Marca</Label>
        <Input id="brand" name="brand" placeholder="Ej: OmegaSur S.A." />
         {state.errors?.brand && <p className="mt-1 text-xs text-danger">{state.errors.brand[0]}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone" className="flex items-center gap-2"><Phone className='w-4 h-4'/> Teléfono (Opcional)</Label>
        <Input id="phone" name="phone" placeholder="Ej: +54 223 568 5711" />
      </div>
      <div className="flex justify-end pt-4">
        <Button type="submit">Crear Cliente</Button>
      </div>
    </form>
  );
}


export function CreateClientModal() {
  const [isOpen, setIsOpen] = useState(false);

  // 👇 2. "Memorizamos" la función para cerrar el modal
  const handleSuccess = useCallback(() => {
    setIsOpen(false);
  }, []); // El array vacío significa que la función nunca cambia

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className='py-2 px-3 bg-info/80 hover:scale-105 transition-all duration-200 text-white'>
          <UserPlus className='w-4 h-4 mr-2'/>Añadir Cliente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className='py-6'>Crear Nuevo Cliente</DialogTitle>
        </DialogHeader>
        {/* 👇 3. Pasamos la función memorizada */}
        <ClientForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}