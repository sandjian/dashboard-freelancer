'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus } from 'lucide-react';
import { ClientForm } from './create-form';
import { useTranslations } from 'next-intl';

export function CreateClientModal() {
  const t = useTranslations('Clients');
  const [isOpen, setIsOpen] = useState(false);

  // 👇 2. "Memorizamos" la función para cerrar el modal
  const handleSuccess = useCallback(() => {
    setIsOpen(false);
  }, []); // El array vacío significa que la función nunca cambia

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="relative overflow-hidden bg-secondary/40 text-secondary-foreground hover:bg-secondary/30 hover:border-secondary/30 hover:text-accent dark:hover:text-secondary-foreground shadow-sm font-semibold transition-all duration-300 group h-10 px-5 rounded-xl cursor-pointer w-full sm:w-auto justify-center"
        >
          <div className="flex items-center justify-center gap-2 relative z-10 tracking-wide text-sm font-medium">
            <UserPlus className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
            <span>{t('newClient')}</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className='py-6'>{t('createClientTitle')}</DialogTitle>
        </DialogHeader>
        {/* 👇 3. Pasamos la función memorizada */}
        <ClientForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}