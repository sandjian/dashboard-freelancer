'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { requireUser } from '@/lib/auth-guard';

const InitialAccountSchema = z.object({
  name: z.string().min(1, 'El nombre de la cuenta es obligatorio'),
  account_type: z.enum(['bank', 'wallet', 'cash', 'usd_account']),
  currency: z.enum(['ARS', 'USD']),
  balance: z.coerce.number().min(0, 'El saldo no puede ser negativo'),
  color: z.string().default('#10b981'),
});

const OnboardingPayloadSchema = z.object({
  defaultCurrency: z.enum(['ARS', 'USD']).default('ARS'),
  monthlyIncomeGoal: z.coerce.number().min(0).default(0),
  cashARS: z.coerce.number().min(0).default(0),
  cashUSD: z.coerce.number().min(0).default(0),
  accounts: z.array(InitialAccountSchema).default([]),
});

export type OnboardingInput = z.infer<typeof OnboardingPayloadSchema>;

export async function completeOnboarding(input: OnboardingInput) {
  const user = await requireUser();
  const parsed = OnboardingPayloadSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: 'Revisa los montos ingresados.',
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { defaultCurrency, monthlyIncomeGoal, cashARS, cashUSD, accounts } = parsed.data;
  const db = await sql.connect();

  try {
    await db.query('BEGIN');

    // 1. Registrar Efectivo en Mano (ARS)
    await db.query(
      `INSERT INTO bank_accounts (name, account_type, currency, balance, color, is_active, user_id)
       VALUES ($1, 'cash', 'ARS', $2, '#10b981', TRUE, $3)`,
      ['Efectivo en Mano (ARS)', Math.round(cashARS * 100), user.id]
    );

    // 2. Registrar Efectivo en Mano (USD) si declaró dólares físicos
    if (cashUSD > 0) {
      await db.query(
        `INSERT INTO bank_accounts (name, account_type, currency, balance, color, is_active, user_id)
         VALUES ($1, 'cash', 'USD', $2, '#3b82f6', TRUE, $3)`,
        ['Efectivo USD', Math.round(cashUSD * 100), user.id]
      );
    }

    // 3. Insertar cada cuenta bancaria / billetera virtual declarada
    for (const acc of accounts) {
      if (!acc.name.trim()) continue;
      const balanceInCents = Math.round(acc.balance * 100);
      await db.query(
        `INSERT INTO bank_accounts (name, account_type, currency, balance, color, is_active, user_id)
         VALUES ($1, $2, $3, $4, $5, TRUE, $6)`,
        [acc.name.trim(), acc.account_type, acc.currency, balanceInCents, acc.color, user.id]
      );
    }

    // 4. Marcar onboarding como completado en el perfil del usuario
    await db.query(
      `UPDATE users
       SET onboarding_completed = TRUE,
           default_currency = $1,
           monthly_income_goal = $2,
           onboarding_completed_at = NOW()
       WHERE id = $3`,
      [defaultCurrency, Math.round(monthlyIncomeGoal * 100), user.id]
    );

    await db.query('COMMIT');
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Onboarding Transaction Error:', error);
    return {
      success: false,
      message: 'No se pudo guardar la configuración inicial en la base de datos.',
    };
  } finally {
    db.release();
  }

  const cookieStore = await cookies();
  cookieStore.set('onboarding_completed', 'true', {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });

  revalidatePath('/[locale]/dashboard', 'layout');
  revalidatePath('/dashboard');
  return { success: true };
}

