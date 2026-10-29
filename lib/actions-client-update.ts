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
        name: formData.get('name')?.toString().trim() ?? '',
        email: formData.get('email')?.toString().trim() || '',
        image_url: formData.get('image_url')?.toString() || undefined,
        brand: formData.get('brand')?.toString().trim() || undefined,
        phone: formData.get('phone')?.toString().trim() || undefined,
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
      SET name = ${name},
          email = ${email || null},
          image_url = ${image_url || null},
          brand = ${brand || null},
          phone = ${phone || null}
      WHERE id = ${id} AND user_id = ${user.id}
    `;
    } catch (error) {
        console.error('Database Error in updateClient:', error);
        return { message: 'Database Error: Failed to Update Client.' };
    }

    revalidatePath('/[locale]/dashboard', 'layout');
    revalidatePath('/dashboard/finances/clients');
    revalidatePath('/es/dashboard/finances/clients');
    revalidatePath('/en/dashboard/finances/clients');
    revalidatePath(`/dashboard/finances/clients/${id}`);
    return { message: 'Cliente actualizado con éxito.', errors: {} };
}
