'use server';

import { sql } from '@vercel/postgres'; // 
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { EarningSchema, RecurringTransactionSchema } from './definitions';
import type { EarningState, RecurringTransactionState } from './definitions';
import { ExpensesSchema } from './definitions';
import type { ExpensesState } from './definitions';
import { fetchPendingRecurringTransactions } from './data';
import { headers } from 'next/headers';

const CreateEarningSchema = EarningSchema.omit({ id: true });

export async function createEarning(prevState: EarningState, formData: FormData): Promise<EarningState> {
  const validatedFields = CreateEarningSchema.safeParse({
    concept: formData.get('concept'),
    client: formData.get('client'),
    amount: formData.get('amount'),
    currency: formData.get('currency'),
    status: formData.get('status'),
    dueDate: new Date(formData.get('dueDate') as string),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan campos o son inválidos.',
    };
  }

  const { concept, client, amount, currency, status, dueDate } = validatedFields.data;

  const amountInCents = amount * 100;

  try {
    await sql`
      INSERT INTO earnings (concept, client, amount, currency, status, due_date)
      VALUES (${concept}, ${client}, ${amountInCents}, ${currency}, ${status}, ${dueDate.toISOString().split('T')[0]})
    `;
  } catch (error) {
    console.error('Database Error:', error);
    return {
      message: 'Error de Base de Datos: No se pudo crear el ingreso.',
    };
  }

  revalidatePath('/dashboard/finances/earnings');
  redirect('/dashboard/finances/earnings');
}

export async function deleteEarning(formData: FormData) {
  const id = formData.get('id')?.toString();

  // El 'throw new Error' detendrá la ejecución si el ID no existe.
  // Esto es más robusto que devolver un mensaje.
  if (!id) {
    throw new Error('ID de ingreso no encontrado.');
  }

  try {
    await sql`DELETE FROM earnings WHERE id = ${id}`;
    // La revalidación es la única acción necesaria en caso de éxito.
    revalidatePath('/dashboard/finances/earnings');
  } catch (error) {
    console.error('Database Error:', error);
    // En caso de error, podríamos devolver un mensaje, pero para que el tipo sea
    // compatible, simplemente lanzamos el error o mostramos un log.
    // Para este caso, solo registrar el error es suficiente.
  }
}


const UpdateEarningSchema = EarningSchema.omit({ id: true });

export async function updateEarning(id: string, prevState: EarningState, formData: FormData): Promise<EarningState> {
  const validatedFields = UpdateEarningSchema.safeParse({
    concept: formData.get('concept'),
    client: formData.get('client'),
    amount: formData.get('amount'),
    currency: formData.get('currency'),
    status: formData.get('status'),
    dueDate: new Date(formData.get('dueDate') as string),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan campos o son inválidos.',
    };
  }

  const { concept, client, amount, currency, status, dueDate } = validatedFields.data;
  const amountInCents = amount * 100;

  try {
    await sql`
      UPDATE earnings
      SET concept = ${concept}, client = ${client}, amount = ${amountInCents}, currency = ${currency}, status = ${status}, due_date = ${dueDate.toISOString().split('T')[0]}
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Error de Base de Datos: No se pudo actualizar el ingreso.' };
  }

  revalidatePath('/dashboard/finances/earnings');
  redirect('/dashboard/finances/earnings');
}














const CreateRecurringSchema = RecurringTransactionSchema.omit({ id: true, userId: true, isActive: true });

export async function createRecurringTransaction(prevState: RecurringTransactionState, formData: FormData): Promise<RecurringTransactionState> {
  const validatedFields = CreateRecurringSchema.safeParse({
    type: formData.get('type'),
    concept: formData.get('concept'),
    category: formData.get('category'),
    client: formData.get('client'), // 👈 Lee el nuevo campo
    amount: formData.get('amount'),
    currency: formData.get('currency'), // 👈 Lee el nuevo campo
    dayOfMonth: formData.get('dayOfMonth'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan campos o son inválidos.',
    };
  }

   const { type, concept, category, client, amount, currency, dayOfMonth } = validatedFields.data;
  const amountInCents = amount * 100;

  try {
    await sql`
      INSERT INTO recurring_transactions (type, concept, category, client, amount, currency, day_of_month)
      VALUES (${type}, ${concept}, ${category || null}, ${client || null}, ${amountInCents}, ${currency}, ${dayOfMonth})
    `;
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Error de Base de Datos: No se pudo crear la transacción recurrente.' };
  }

  revalidatePath('/dashboard/recurring');
  redirect('/dashboard/recurring');
}


export async function generateRecurringTransactions(year: number, month: number) {
  const pendingTransactions = await fetchPendingRecurringTransactions(year, month);

  if (pendingTransactions.length === 0) {
    console.log('No hay transacciones recurrentes pendientes para generar.');
    return;
  }

  const newEarnings = [];
  const newExpenses = [];

  for (const trans of pendingTransactions) {
    const dateForTransaction = new Date(year, month - 1, trans.dayOfMonth);
    const amountInCents = trans.amount * 100;

    if (trans.type === 'earning') {
      newEarnings.push({
        concept: trans.concept,
        client: trans.client,
        amount: amountInCents,
        status: 'Por cobrar', // Usamos el estado que prefieres
        dueDate: dateForTransaction,
        sourceRecurringId: trans.id,
        // 👇 LA CORRECCIÓN CLAVE: Añadimos la moneda 👇
        currency: trans.currency || 'ARS', // Usa la moneda de la plantilla o 'ARS' por defecto
      });
    } else if (trans.type === 'expense') {
      newExpenses.push({
        concept: trans.concept,
        category: trans.category || 'Varios',
        amount: amountInCents,
        expenseDate: dateForTransaction,
        sourceRecurringId: trans.id,
        currency: trans.currency || 'ARS', // También para gastos
      });
    }
  }

  try {
    if (newEarnings.length > 0) {
      // 👇 CORRECCIÓN: Añadimos 'currency' a la consulta SQL
      const values = newEarnings.map(e => `('${e.concept}', '${e.client}', ${e.amount}, '${e.status}', '${e.dueDate.toISOString()}', '${e.sourceRecurringId}', '${e.currency}')`).join(',');
      await sql.query(`INSERT INTO earnings (concept, client, amount, status, due_date, source_recurring_id, currency) VALUES ${values}`);
    }

    if (newExpenses.length > 0) {
      // 👇 CORRECCIÓN: Añadimos 'currency' a la consulta SQL
      const values = newExpenses.map(e => `('${e.concept}', '${e.category}', ${e.amount}, '${e.expenseDate.toISOString()}', '${e.sourceRecurringId}', '${e.currency}')`).join(',');
      await sql.query(`INSERT INTO expenses (concept, category, amount, expense_date, source_recurring_id, currency) VALUES ${values}`);
    }

    console.log(`Se generaron ${newEarnings.length} ingresos y ${newExpenses.length} gastos recurrentes.`);

  } catch (error) {
    console.error('Database Error:', error);
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/finances/earnings');
  revalidatePath('/dashboard/finances/expenses'); // Corregí una pequeña errata aquí
}




// --- ACCIONES DE GASTOS (EXPENSES) ---

const CreateExpenseSchema = ExpensesSchema.omit({ id: true });

export async function createExpense(prevState: ExpensesState, formData: FormData): Promise<ExpensesState> {
  const validatedFields = CreateExpenseSchema.safeParse({
    concept: formData.get('concept'),
    category: formData.get('category'),
    amount: formData.get('amount'),
    expenseDate: new Date(formData.get('expenseDate') as string),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan campos o son inválidos.',
    };
  }

  const { concept, category, amount, expenseDate } = validatedFields.data;
  const amountInCents = amount * 100;

  try {
    await sql`
      INSERT INTO expenses (concept, category, amount, expense_date)
      VALUES (${concept}, ${category}, ${amountInCents}, ${expenseDate.toISOString().split('T')[0]})
    `;
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Error de Base de Datos: No se pudo crear el gasto.' };
  }

  const referer = (await headers()).get('referer') || '/dashboard/earnings';
  revalidatePath(referer);
  redirect(referer);
}

// (Aquí irían updateExpense y deleteExpense, que serían muy similares)
export async function deleteExpense(formData: FormData) {
  const id = formData.get('id')?.toString();
  if (!id) throw new Error('ID no encontrado.');

  try {
    await sql`DELETE FROM expenses WHERE id = ${id}`;
    revalidatePath('/dashboard/expenses');
  } catch (error) {
    console.error('Database Error:', error);
  }
}


const UpdateRecurringSchema = RecurringTransactionSchema.omit({ id: true, userId: true, isActive: true });

export async function updateRecurringTransaction(id: string, prevState: RecurringTransactionState, formData: FormData): Promise<RecurringTransactionState> {
  const validatedFields = UpdateRecurringSchema.safeParse({
    type: formData.get('type'),
    concept: formData.get('concept'),
    category: formData.get('category'),
    client: formData.get('client'),
    amount: formData.get('amount'),
    currency: formData.get('currency'),
    dayOfMonth: formData.get('dayOfMonth'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan campos o son inválidos.',
    };
  }

  const { type, concept, category, client, amount, currency, dayOfMonth } = validatedFields.data;
  const amountInCents = amount * 100;

  try {
    await sql`
      UPDATE recurring_transactions
      SET type = ${type}, concept = ${concept}, category = ${category || null}, client = ${client || null}, amount = ${amountInCents}, currency = ${currency}, day_of_month = ${dayOfMonth}
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Error de Base de Datos: No se pudo actualizar la plantilla.' };
  }

  revalidatePath('/dashboard/recurring');
  redirect('/dashboard/recurring');
}

export async function deleteRecurringTransaction(formData: FormData) {
  const id = formData.get('id')?.toString();
  if (!id) throw new Error('ID no encontrado.');

  try {
    await sql`DELETE FROM recurring_transactions WHERE id = ${id}`;
    revalidatePath('/dashboard/recurring');
  } catch (error) {
    console.error('Database Error:', error);
    // Para el cliente, la revalidación es suficiente feedback.
  }
}