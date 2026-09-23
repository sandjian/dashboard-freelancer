"use client";

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
import { deleteCard } from "@/lib/actions-card-delete";
import { toast } from "sonner";
import { useState } from "react";

interface DeleteCardDialogProps {
    cardId: string;
    cardName: string;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function DeleteCardDialog({ cardId, cardName, trigger, open: controlledOpen, onOpenChange: setControlledOpen }: DeleteCardDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? (setControlledOpen || (() => {})) : setInternalOpen;

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDeleting(true);

        try {
            const result = await deleteCard(cardId);
            if (result.success) {
                toast.success(result.message);
                setOpen(false);
            } else {
                toast.error(result.message || "Error al eliminar la tarjeta.");
            }
        } catch (error) {
            toast.error("Error inesperado al eliminar la tarjeta.");
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            {trigger ? (
                <AlertDialogTrigger asChild>
                    {trigger}
                </AlertDialogTrigger>
            ) : !isControlled ? (
                <AlertDialogTrigger asChild>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setOpen(true);
                        }}
                        className="bg-white backdrop-blur-md border-2 border-red-500 rounded-full p-2.5 text-red-600 hover:bg-red-500 hover:text-white hover:border-red-400 transition-all duration-300 group/delete"
                        aria-label="Eliminar tarjeta"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </AlertDialogTrigger>
            ) : null}
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar la tarjeta &quot;{cardName}&quot;?</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="space-y-3 text-sm text-muted-foreground">
                            <p>Esta acción no se puede deshacer.</p>
                            <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 p-3 border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-200">
                                <strong>Atención:</strong> Al eliminar la tarjeta, toda la deuda pendiente (cuotas futuras) se marcará automáticamente como <strong>PAGADA (Saldada)</strong> para cerrar el ciclo contable.
                            </div>
                            <p>Los gastos históricos permanecerán visibles pero ya no estarán vinculados a esta tarjeta.</p>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:text-white hover:bg-red-600"
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Eliminando..." : "Sí, eliminar y saldar deuda"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
