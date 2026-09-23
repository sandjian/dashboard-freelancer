'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';

export async function deleteClient(clientId: string) {
    const db = await sql.connect();

    try {
        await db.query('BEGIN');

        // 1. Unlink invoices (set client_id to NULL) to preserve history
        await db.query(`
      UPDATE invoices 
      SET client_id = NULL 
      WHERE client_id = $1
    `, [clientId]);

        // 2. Delete the client
        await db.query(`
      DELETE FROM clients 
      WHERE id = $1
    `, [clientId]);

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
