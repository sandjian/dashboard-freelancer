"use server";

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { requireUser } from './auth-guard';

export async function deleteCard(cardId: string) {
    const user = await requireUser();

    if (!cardId) {
        return { success: false, message: 'ID de tarjeta no proporcionado.' };
    }

    const db = await sql.connect();
    try {
        await db.query('BEGIN');

        // Verificar propiedad de la tarjeta
        const ownerCheck = await db.query(
            `SELECT id FROM cards WHERE id = $1 AND user_id = $2`,
            [cardId, user.id]
        );
        if (ownerCheck.rowCount === 0) {
            await db.query('ROLLBACK');
            return { success: false, message: 'La tarjeta no existe o no tienes permiso para eliminarla.' };
        }

        // 1. "Saldar la deuda": Update pending installments of expenses on this card to 'paid'
        await db.query(
            `UPDATE expense_installments AS ei
             SET status = 'paid'
             FROM expenses AS e
             WHERE ei.expense_id = e.id
               AND e.card_id = $1
               AND e.user_id = $2
               AND ei.status = 'pending'`,
            [cardId, user.id]
        );

        // 2. "Preservar registros contables": Desvincular gastos de la tarjeta eliminada (card_id = NULL)
        await db.query(
            `UPDATE expenses
             SET card_id = NULL
             WHERE card_id = $1 AND user_id = $2`,
            [cardId, user.id]
        );

        // 3. Desvincular plantillas de gastos recurrentes
        await db.query(
            `UPDATE expense_templates
             SET card_id = NULL
             WHERE card_id = $1 AND user_id = $2`,
            [cardId, user.id]
        ).catch(() => {
            // Silencioso en caso de que expense_templates no tenga columna card_id en algún entorno
        });

        // 4. Eliminar los resúmenes asociados a la tarjeta para satisfacer card_statements_card_id_fkey
        await db.query(
            `DELETE FROM card_statements
             WHERE card_id = $1`,
            [cardId]
        );

        // 5. Eliminar la tarjeta física
        const deleteRes = await db.query(
            `DELETE FROM cards WHERE id = $1 AND user_id = $2 RETURNING id`,
            [cardId, user.id]
        );

        if (deleteRes.rowCount === 0) {
            await db.query('ROLLBACK');
            return { success: false, message: 'La tarjeta no existe o ya fue eliminada.' };
        }

        await db.query('COMMIT');

        revalidatePath('/[locale]/dashboard', 'layout');
        revalidatePath('/dashboard/finances/cards');
        revalidatePath('/es/dashboard/finances/cards');
        revalidatePath('/en/dashboard/finances/cards');
        revalidatePath('/dashboard/finances/expenses');
        revalidatePath('/dashboard');

        return { success: true, message: 'Tarjeta eliminada exitosamente y deuda saldada.' };

    } catch (error) {
        await db.query('ROLLBACK');
        console.error('Delete Card Error:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'No se pudo eliminar la tarjeta debido a un error en base de datos.'
        };
    } finally {
        db.release();
    }
}
