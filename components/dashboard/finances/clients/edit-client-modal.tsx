'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ClientForm } from './create-form';
import { Client } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { updateClient } from '@/lib/actions-client-update';

export function EditClientModal({
    client,
    trigger
}: {
    client: Client;
    trigger?: React.ReactNode
}) {
    const [open, setOpen] = useState(false);

    const handleSuccess = () => {
        setOpen(false);
    };

    // Bind ID to update action (Server Actions limitation: we need to pass ID)
    const updateAction = updateClient.bind(null, client.id);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" className="w-full justify-start">
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Editar Cliente</DialogTitle>
                </DialogHeader>
                <ClientForm
                    initialData={client}
                    action={updateAction}
                    onSuccess={handleSuccess}
                />
            </DialogContent>
        </Dialog>
    );
}
