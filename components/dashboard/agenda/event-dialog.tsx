"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { useTranslations } from "next-intl"
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

function SubmitButton({ isEdit, t }: { isEdit: boolean; t: (key: string) => string }) {
    const { pending } = useFormStatus()
    return (
        <Button
            type="submit"
            disabled={pending}
            className="text-xs font-semibold bg-secondary/40 text-secondary-foreground hover:bg-secondary/30 dark:bg-foreground/90 dark:hover:bg-foreground dark:text-background transition-colors"
        >
            {pending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            {isEdit ? t("saveChanges") : t("createEventButton")}
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
    const t = useTranslations("Agenda");
    const defaultStart = selectedDate ? new Date(selectedDate) : new Date();
    defaultStart.setHours(9, 0, 0, 0); // Default 9 AM

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px] bg-card border-border text-foreground">
                <DialogHeader>
                    <DialogTitle className="text-base font-bold text-foreground">
                        {eventToEdit ? t("dialogEditTitle") : t("dialogCreateTitle")}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        {eventToEdit ? t("dialogEditDesc") : t("dialogCreateDesc")}
                    </DialogDescription>
                </DialogHeader>

                <form action={async (formData) => {
                    await createEvent(null, formData);
                    onOpenChange(false);
                }} className="space-y-4 py-2">

                    {/* Título */}
                    <div className="space-y-1.5">
                        <Label htmlFor="title" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {t("fieldTitle")}
                        </Label>
                        <Input
                            id="title"
                            name="title"
                            defaultValue={eventToEdit?.title}
                            placeholder={t("fieldTitlePlaceholder")}
                            className="text-xs bg-background border-border"
                            required
                        />
                    </div>

                    {/* Tipo y Prioridad en 2 columnas */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="type" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {t("fieldType")}
                            </Label>
                            <Select name="type" defaultValue={eventToEdit?.type || "meeting"}>
                                <SelectTrigger className="w-full text-xs bg-background border-border">
                                    <SelectValue placeholder={t("fieldType")} />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border text-foreground">
                                    <SelectItem value="meeting">{t("typeMeeting")}</SelectItem>
                                    <SelectItem value="task">{t("typeTask")}</SelectItem>
                                    <SelectItem value="reminder">{t("typeReminder")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="priority" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {t("fieldPriority")}
                            </Label>
                            <Select name="priority" defaultValue={eventToEdit?.priority || "medium"}>
                                <SelectTrigger className="w-full text-xs bg-background border-border">
                                    <SelectValue placeholder={t("fieldPriority")} />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border text-foreground">
                                    <SelectItem value="low">{t("priorityLow")}</SelectItem>
                                    <SelectItem value="medium">{t("priorityMedium")}</SelectItem>
                                    <SelectItem value="high">{t("priorityHigh")}</SelectItem>
                                    <SelectItem value="urgent">{t("priorityUrgent")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Cliente Asociado (Opcional) */}
                    <div className="space-y-1.5">
                        <Label htmlFor="related_client_id" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {t("fieldClient")}
                        </Label>
                        <Select
                            name="related_client_id"
                            defaultValue={eventToEdit?.related_client_id || "none"}
                        >
                            <SelectTrigger className="w-full text-xs bg-background border-border">
                                <SelectValue placeholder={t("clientPlaceholder")} />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border text-foreground max-h-56">
                                <SelectItem value="none">{t("clientNone")}</SelectItem>
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
                                {t("fieldStart")}
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
                                {t("fieldEnd")}
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
                            {t("fieldNotes")}
                        </Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder={t("fieldNotesPlaceholder")}
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
                                    if (confirm(t("confirmDeleteEvent"))) {
                                        await deleteEvent(eventToEdit.id);
                                        onOpenChange(false);
                                    }
                                }}
                                className="text-xs"
                            >
                                {t("deleteEventButton")}
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
                                {t("cancelButton")}
                            </Button>
                            <SubmitButton isEdit={!!eventToEdit} t={t} />
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
