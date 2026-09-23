'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { CalendarEventSchema, CalendarEventFormState } from '@/lib/definitions';

const CreateEvent = CalendarEventSchema.omit({ id: true });

export async function createEvent(prevState: CalendarEventFormState | null | undefined, formData: FormData) {
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
            message: 'Missing Fields. Failed to Create Event.',
        };
    }

    const { title, description, start_time, end_time, type, priority, is_all_day, related_client_id, related_invoice_id } = validatedFields.data;
    const user_id = '410544b2-4001-4271-9855-fec4b6a6442a'; // Hardcoded for now based on previous context

    try {
        await sql`
      INSERT INTO calendar_events (user_id, title, description, start_time, end_time, type, priority, is_all_day, status, related_client_id, related_invoice_id)
      VALUES (${user_id}, ${title}, ${description}, ${start_time.toISOString()}, ${end_time.toISOString()}, ${type}, ${priority || 'medium'}, ${is_all_day}, 'pending', ${related_client_id}, ${related_invoice_id})
    `;
    } catch (error) {
        return {
            message: 'Database Error: Failed to Create Event.',
        };
    }

    revalidatePath('/dashboard/agenda');
    revalidatePath('/dashboard');
    return { message: 'Success' };
}

export async function deleteEvent(id: string) {
    try {
        await sql`DELETE FROM calendar_events WHERE id = ${id}`;
        revalidatePath('/dashboard/agenda');
        revalidatePath('/dashboard');
        return { message: 'Deleted Event.' };
    } catch (error) {
        return { message: 'Database Error: Failed to Delete Event.' };
    }
}

export async function toggleTaskStatus(id: string, status: 'pending' | 'completed') {
    try {
        await sql`
            UPDATE calendar_events 
            SET status = ${status}
            WHERE id = ${id}
        `;
        revalidatePath('/dashboard/agenda');
        revalidatePath('/dashboard');
    } catch (error) {
        throw new Error('Failed to update task status.');
    }
}
