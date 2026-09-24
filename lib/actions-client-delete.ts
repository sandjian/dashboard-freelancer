'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { requireUser } from './auth-guard';

export async function deleteClient(clientId: string) {
    const user = await requireUser();
    const db = await sql.connect();

    try {
        await db.query('BEGIN');

        // 1. Unlink invoices belonging to this user
        await db.query(`
          UPDATE invoices 
          SET client_id = NULL 
          WHERE client_id = $1 AND user_id = $2
        `, [clientId, user.id]);

        // 2. Delete the client belonging to this user
        await db.query(`
          DELETE FROM clients 
          WHERE id = $1 AND user_id = $2
        `, [clientId, user.id]);

        await db.query('COMMIT');
        revalidatePath('/dashboard/finances/clients');
        return { message: 'Cliente eliminado correctamente (las facturas se han conservado como "Sin Cliente").' };
    } catch (error) {
        await db.query('ROLLBACK');
        console.error('Database Error:', error);
        return { message: 'Error al eliminar el cliente.' };
    } finally {
        db.release();
    }
}
