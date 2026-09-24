'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { CalendarEventSchema, CalendarEventFormState } from '@/lib/definitions';
import { requireUser } from '@/lib/auth-guard';

const CreateEvent = CalendarEventSchema.omit({ id: true });

export async function createEvent(prevState: CalendarEventFormState | null | undefined, formData: FormData) {
    const user = await requireUser();

    const validatedFields = CreateEvent.safeParse({
        title: formData.get('title'),
        description: formData.get('description'),
        start_time: formData.get('start_time'),
        end_time: formData.get('end_time'),
        type: formData.get('type'),
        priority: formData.get('priority') || 'medium',
        is_all_day: formData.get('is_all_day') === 'on',
        related_client_id: formData.get('related_client_id') || null,
        related_invoice_id: formData.get('related_invoice_id') || null,
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Campos incompletos. No se pudo crear el evento.',
        };
    }

    const { title, description, start_time, end_time, type, priority, is_all_day, related_client_id, related_invoice_id } = validatedFields.data;

    try {
        await sql`
      INSERT INTO calendar_events (user_id, title, description, start_time, end_time, type, priority, is_all_day, status, related_client_id, related_invoice_id)
      VALUES (${user.id}, ${title}, ${description}, ${start_time.toISOString()}, ${end_time.toISOString()}, ${type}, ${priority || 'medium'}, ${is_all_day}, 'pending', ${related_client_id}, ${related_invoice_id})
    `;
    } catch (error) {
        return {
            message: 'Error de base de datos: No se pudo crear el evento.',
        };
    }

    revalidatePath('/dashboard/agenda');
    revalidatePath('/dashboard');
    return { message: 'Success' };
}

export async function deleteEvent(id: string) {
    const user = await requireUser();
    try {
        await sql`DELETE FROM calendar_events WHERE id = ${id} AND user_id = ${user.id}`;
        revalidatePath('/dashboard/agenda');
        revalidatePath('/dashboard');
        return { message: 'Deleted Event.' };
    } catch (error) {
        return { message: 'Database Error: Failed to Delete Event.' };
    }
}

export async function toggleTaskStatus(id: string, status: 'pending' | 'completed') {
    const user = await requireUser();
    try {
        await sql`
            UPDATE calendar_events 
            SET status = ${status}
            WHERE id = ${id} AND user_id = ${user.id}
        `;
        revalidatePath('/dashboard/agenda');
        revalidatePath('/dashboard');
    } catch (error) {
        throw new Error('Failed to update task status.');
    }
}
