'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteClient } from "@/lib/actions-client-delete";

export function DeleteClientDialog({
    clientId,
    clientName,
    trigger
}: {
    clientId: string;
    clientName: string;
    trigger?: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const [isDeleting, startDelete] = useTransition();

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        startDelete(async () => {
            const result = await deleteClient(clientId);
            if (result.message && !result.message.includes('Error')) {
                toast.success(result.message);
                setOpen(false);
            } else {
                toast.error(result.message || "Error al eliminar el cliente");
            }
        });
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                    </Button>
                )}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Estás a punto de eliminar a <span className="font-bold text-foreground">{clientName}</span>.
                        <br /><br />
                        Esta acción es irreversible, pero las facturas asociadas <strong>se conservarán</strong> y quedarán como &quot;Sin Cliente asignado&quot;.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Eliminando..." : "Sí, eliminar"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
