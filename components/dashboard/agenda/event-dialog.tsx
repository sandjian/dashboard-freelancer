"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { CalendarEvent, Client } from "@/lib/definitions"
import { createEvent, deleteEvent } from "@/lib/actions/agenda"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"

function SubmitButton({ isEdit }: { isEdit: boolean }) {
    const { pending } = useFormStatus()
    return (
        <Button
            type="submit"
            disabled={pending}
            className="text-xs font-semibold bg-secondary/40 text-secondary-foreground hover:bg-secondary/30 dark:bg-foreground/90 dark:hover:bg-foreground dark:text-background transition-colors"
        >
            {pending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            {isEdit ? "Guardar Cambios" : "Crear Evento"}
        </Button>
    )
}

export function EventDialog({
    open,
    onOpenChange,
    selectedDate,
    eventToEdit,
    clients = [],
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedDate?: Date;
    eventToEdit?: CalendarEvent | null;
    clients?: Client[];
}) {
    const defaultStart = selectedDate ? new Date(selectedDate) : new Date();
    defaultStart.setHours(9, 0, 0, 0); // Default 9 AM

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px] bg-card border-border text-foreground">
                <DialogHeader>
                    <DialogTitle className="text-base font-bold text-foreground">
                        {eventToEdit ? 'Editar Evento / Nota' : 'Nueva Tarea, Cita o Nota'}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        {eventToEdit ? 'Actualiza los datos del evento o tarea seleccionada.' : 'Registra una cita con cliente, recordatorio o nota en tu agenda.'}
                    </DialogDescription>
                </DialogHeader>

                <form action={async (formData) => {
                    await createEvent(null, formData);
                    onOpenChange(false);
                }} className="space-y-4 py-2">

                    {/* Título */}
                    <div className="space-y-1.5">
                        <Label htmlFor="title" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Título *
                        </Label>
                        <Input
                            id="title"
                            name="title"
                            defaultValue={eventToEdit?.title}
                            placeholder="Ej: Reunión kickoff, Llamada de seguimiento..."
                            className="text-xs bg-background border-border"
                            required
                        />
                    </div>

                    {/* Tipo y Prioridad en 2 columnas */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="type" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Tipo de Actividad
                            </Label>
                            <Select name="type" defaultValue={eventToEdit?.type || "meeting"}>
                                <SelectTrigger className="w-full text-xs bg-background border-border">
                                    <SelectValue placeholder="Seleccionar tipo" />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border text-foreground">
                                    <SelectItem value="meeting">Reunión / Cita</SelectItem>
                                    <SelectItem value="task">Tarea Accionable</SelectItem>
                                    <SelectItem value="reminder">Nota / Recordatorio</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="priority" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Prioridad
                            </Label>
                            <Select name="priority" defaultValue={eventToEdit?.priority || "medium"}>
                                <SelectTrigger className="w-full text-xs bg-background border-border">
                                    <SelectValue placeholder="Prioridad" />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border text-foreground">
                                    <SelectItem value="low">Baja</SelectItem>
                                    <SelectItem value="medium">Media</SelectItem>
                                    <SelectItem value="high">Alta</SelectItem>
                                    <SelectItem value="urgent">Urgente</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Cliente Asociado (Opcional) */}
                    <div className="space-y-1.5">
                        <Label htmlFor="related_client_id" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Vincular Cliente (Opcional)
                        </Label>
                        <Select
                            name="related_client_id"
                            defaultValue={eventToEdit?.related_client_id || "none"}
                        >
                            <SelectTrigger className="w-full text-xs bg-background border-border">
                                <SelectValue placeholder="Sin cliente vinculado" />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border text-foreground max-h-56">
                                <SelectItem value="none">Sin vincular (General)</SelectItem>
                                {clients.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.name} {c.brand ? `(${c.brand})` : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Fechas Inicio y Fin en 2 columnas */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="start_time" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Inicio
                            </Label>
                            <Input
                                id="start_time"
                                name="start_time"
                                type="datetime-local"
                                defaultValue={eventToEdit ? format(new Date(eventToEdit.start_time), "yyyy-MM-dd'T'HH:mm") : format(defaultStart, "yyyy-MM-dd'T'HH:mm")}
                                className="text-xs bg-background border-border font-mono"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="end_time" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Fin
                            </Label>
                            <Input
                                id="end_time"
                                name="end_time"
                                type="datetime-local"
                                defaultValue={eventToEdit ? format(new Date(eventToEdit.end_time), "yyyy-MM-dd'T'HH:mm") : format(new Date(defaultStart.getTime() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm")}
                                className="text-xs bg-background border-border font-mono"
                                required
                            />
                        </div>
                    </div>

                    {/* Notas / Descripción */}
                    <div className="space-y-1.5">
                        <Label htmlFor="description" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Notas & Detalles
                        </Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Agrega contexto, enlaces a videollamadas, o detalles de la tarea..."
                            defaultValue={eventToEdit?.description || ''}
                            className="text-xs bg-background border-border min-h-[70px]"
                        />
                    </div>

                    <DialogFooter className="flex items-center justify-between sm:justify-between pt-3 border-t border-border/50">
                        {eventToEdit ? (
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={async () => {
                                    if (confirm('¿Eliminar este evento?')) {
                                        await deleteEvent(eventToEdit.id);
                                        onOpenChange(false);
                                    }
                                }}
                                className="text-xs"
                            >
                                Eliminar
                            </Button>
                        ) : <div />}

                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => onOpenChange(false)}
                                className="text-xs"
                            >
                                Cancelar
                            </Button>
                            <SubmitButton isEdit={!!eventToEdit} />
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
