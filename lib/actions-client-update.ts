'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { ClientSchema, ClientState } from './definitions';
import { requireUser } from './auth-guard';

const UpdateClientSchema = ClientSchema.omit({ id: true });

export async function updateClient(
    id: string,
    prevState: ClientState | null | undefined,
    formData: FormData,
) {
    const user = await requireUser();

    const validatedFields = UpdateClientSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        image_url: formData.get('image_url'),
        brand: formData.get('brand'),
        phone: formData.get('phone'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Faltan campos obligatorios. Error al actualizar cliente.',
        };
    }

    const { name, email, image_url, brand, phone } = validatedFields.data;

    try {
        await sql`
      UPDATE clients
      SET name = ${name}, email = ${email}, image_url = ${image_url}, brand = ${brand}, phone = ${phone}
      WHERE id = ${id} AND user_id = ${user.id}
    `;
    } catch (error) {
        return { message: 'Database Error: Failed to Update Client.' };
    }

    revalidatePath('/dashboard/finances/clients');
    revalidatePath(`/dashboard/finances/clients/${id}`);
    return { message: 'Cliente actualizado con éxito.' };
}
