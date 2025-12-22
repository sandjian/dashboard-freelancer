"use server"

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { CardSchema, CardState, Category, ClientSchema, ClientState, ExpenseSchema, ExpenseState, InvoiceSchema, InvoiceState, Vendor } from './definitions'; // Asegúrate de tener estas importaciones
import {  fetchNextInvoiceNumber } from './data';

const parseDateAsLocal = (dateString: string | null | undefined): Date | null => {
  if (!dateString) {
    return null; // Si no hay fecha, devolvemos null
  }
  // El truco de reemplazar '-' por '/' ayuda a los navegadores a interpretarlo como fecha local
  const date = new Date(dateString.replace(/-/g, '\/'));
  // Verificamos si la fecha resultante es válida
  return isNaN(date.getTime()) ? null : date;
};

const CreateInvoiceSchema = InvoiceSchema.omit({ id: true, invoice_number: true, amount: true });

export async function createInvoice(prevState: InvoiceState, formData: FormData): Promise<InvoiceState> {
  const issueDateValue = formData.get('issue_date') as string;
  const dueDateValue = formData.get('due_date') as string;

  const validatedFields = CreateInvoiceSchema.safeParse({
    client_id: formData.get('client_id'),
    status: formData.get('status'),
    discount: formData.get('discount'),
    // 👇 2. Usamos la función robusta y manejamos el caso de que devuelva null 👇
    issue_date: parseDateAsLocal(issueDateValue),
    due_date: parseDateAsLocal(dueDateValue),
    currency: formData.get('currency'),
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan campos principales.',
    };
  }
  const { client_id, status, discount, issue_date, due_date, currency } = validatedFields.data;

  // 2. Extraer y procesar los ítems de la factura (el "carrito de compras")
  const lineItems = [];
  let totalAmountInCents = 0;
  let i = 0;
  while (formData.has(`description-${i}`)) {
    const quantity = Number(formData.get(`quantity-${i}`));
    const unit_price = Number(formData.get(`unit_price-${i}`));
    const description = formData.get(`description-${i}`) as string;

    if (description && quantity > 0 && unit_price > 0) {
      const itemTotal = quantity * (unit_price * 100);
      totalAmountInCents += itemTotal;
      lineItems.push({ description, quantity, unit_price: unit_price * 100 });
    }
    i++;
  }
  if (lineItems.length === 0) {
    return { message: 'La factura debe tener al menos un ítem.' };
  }

  // 3. Aplicar descuento y obtener número de factura
  const finalAmountInCents = Math.round(totalAmountInCents * (1 - discount / 100));
  const nextInvoiceNumber = await fetchNextInvoiceNumber();

  const db = await sql.connect();
  try {
    await db.query('BEGIN');
    const insertedInvoice = await db.query(
      `INSERT INTO invoices (client_id, invoice_number, amount, currency, discount, status, issue_date, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [client_id, nextInvoiceNumber, finalAmountInCents, currency, discount, status, issue_date, due_date]
    );
    const invoiceId = insertedInvoice.rows[0].id;

    for (const item of lineItems) {
      await db.query(
        `INSERT INTO line_items (invoice_id, description, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [invoiceId, item.description, item.quantity, item.unit_price]
      );
    }
    await db.query('COMMIT');
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Database Error:', error);
    return { message: 'Error de Base de Datos: No se pudo crear la factura.' };
  } finally {
    db.release();
  }

  revalidatePath('/dashboard/finances/invoices');
  redirect('/dashboard/finances/invoices');
}







const CreateClientSchema = ClientSchema.omit({ id: true });

export async function createClient(prevState: ClientState, formData: FormData): Promise<ClientState> {
  // 1. Validar los datos usando Zod
  const validatedFields = CreateClientSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    brand: formData.get('brand'),
    phone: formData.get('phone'),
  });

  // 2. Si la validación falla, devolver los errores.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan campos o son inválidos. No se pudo crear el cliente.',
    };
  }

  // 3. Preparar los datos para la inserción
  const { name, email, brand, phone} = validatedFields.data;

  // 4. Insertar los datos en la base de datos
  try {
    await sql`
      INSERT INTO clients (name, email, brand, phone)
      VALUES (${name}, ${email || null}, ${brand || null}, ${phone || null})
    `;
  } catch (error) {
    console.error('Database Error:', error);
    return {
      message: 'Error de Base de Datos: No se pudo crear el cliente.',
    };
  }

  // 5. Revalidar el caché para las páginas afectadas y devolver éxito
  revalidatePath('/dashboard/finances/clients');
  revalidatePath('/dashboard/finances/invoices/create'); // Si usas la lista de clientes aquí
  
  // No devolvemos un mensaje de éxito para no confundir con los de error.
  // El formulario se puede cerrar o resetear desde el cliente al recibir un estado sin errores.
  return { message: "Cliente creado con éxito.", errors: {} };
}





// lib/actions.ts

// ... (tus otras funciones)

export async function deleteInvoice(formData: FormData) {
  const id = formData.get('id')?.toString();
  if (!id) {
    throw new Error('ID de factura no encontrado.');
  }

  try {
    const db = await sql.connect();
    await db.query('BEGIN');
    await db.query(`DELETE FROM line_items WHERE invoice_id = $1`, [id]);
    await db.query(`DELETE FROM invoices WHERE id = $1`, [id]);
    await db.query('COMMIT');

    revalidatePath('/dashboard/finances/invoices');
    // 👇 No devolvemos nada en caso de éxito. La revalidación es suficiente.
  } catch (error) {
    console.error('Database Error:', error);
    await (await sql.connect()).query('ROLLBACK');
    // 👇 En caso de error, lanzamos una excepción en lugar de devolver un mensaje.
    throw new Error('Error de Base de Datos: No se pudo eliminar la factura.');
  }
}




const UpdateInvoiceSchema = InvoiceSchema.omit({ id: true, invoice_number: true, amount: true });

export async function updateInvoice(id: string, prevState: InvoiceState, formData: FormData): Promise<InvoiceState> {
  const validatedFields = UpdateInvoiceSchema.safeParse({
    client_id: formData.get('client_id'),
    status: formData.get('status'),
    discount: formData.get('discount'),
    issue_date: parseDateAsLocal(formData.get('issue_date') as string),
    due_date: parseDateAsLocal(formData.get('due_date') as string),
    currency: formData.get('currency'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan campos principales o son inválidos.',
    };
  }

  // Ahora TypeScript sabe que 'data' existe
  const { client_id, status, discount, issue_date, due_date, currency } = validatedFields.data;

  // Tipamos explícitamente el array de ítems
  const lineItems: { description: string; quantity: number; unit_price: number }[] = [];
  let totalAmountInCents = 0;
  let i = 0;
  while (formData.has(`description-${i}`)) {
    const quantity = Number(formData.get(`quantity-${i}`));
    const unit_price = Number(formData.get(`unit_price-${i}`));
    const description = formData.get(`description-${i}`) as string;

    if (description && quantity > 0 && unit_price > 0) {
      const itemTotal = quantity * (unit_price * 100);
      totalAmountInCents += itemTotal;
      lineItems.push({ description, quantity, unit_price: unit_price * 100 });
    }
    i++;
  }
  if (lineItems.length === 0) {
    return { message: 'La factura debe tener al menos un ítem.' };
  }

  const finalAmountInCents = Math.round(totalAmountInCents * (1 - discount / 100));

const db = await sql.connect();
  try {
    await db.query('BEGIN');
    
    await db.query(
      `UPDATE invoices
       SET client_id = $1, amount = $2, currency = $3, discount = $4, status = $5, issue_date = $6, due_date = $7
       WHERE id = $8`,
      [client_id, finalAmountInCents, currency, discount, status, issue_date, due_date, id]
    );

    await db.query(`DELETE FROM line_items WHERE invoice_id = $1`, [id]);

    for (const item of lineItems) {
      await db.query(
        `INSERT INTO line_items (invoice_id, description, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [id, item.description, item.quantity, item.unit_price]
      );
    }
    
    await db.query('COMMIT');
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Database Error:', error);
    return { message: 'Error de Base de Datos: No se pudo actualizar la factura.' };
  } finally {
    db.release();
  }

  revalidatePath('/dashboard/finances/invoices');
  redirect('/dashboard/finances/invoices');
}

export async function updateInvoiceStatus(id: string, formData: FormData) {
  'use server';

  const newStatus = formData.get('status')?.toString();

  const validStatuses = ['pendiente', 'facturado', 'vencido'];
  if (!newStatus || !validStatuses.includes(newStatus)) {
    throw new Error('Estado de factura inválido.');
  }

  try {
    await sql`
      UPDATE invoices
      SET status = ${newStatus}
      WHERE id = ${id}
    `;
    revalidatePath(`/dashboard/finances/invoices/${id}/details`);
    revalidatePath('/dashboard/finances/invoices');
    // 👇 No devolvemos nada en caso de éxito
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('No se pudo actualizar el estado de la factura.');
  }
}





export async function createCategory(name: string): Promise<Category> {


  // CORREGIDO: El nombre de la tabla es 'expense_categories'
  const existingCategory = await sql`SELECT * FROM expense_categories WHERE name ILIKE ${name}`;
  if (existingCategory.rows.length > 0) {
    return existingCategory.rows[0] as Category;
  }

  try {
    const newCategory = await sql`
      INSERT INTO expense_categories (name)
      VALUES (${name})
      RETURNING id, name;
    `;
    revalidatePath('/dashboard/finances/expenses');
    return newCategory.rows[0] as Category;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('No se pudo crear la categoría.');
  }
}



export async function createVendor(name: string): Promise<Vendor> {
  const existingVendor = await sql`SELECT * FROM vendors WHERE name ILIKE ${name}`;
  if (existingVendor.rows.length > 0) {
    return existingVendor.rows[0] as Vendor;
  }

  try {
    const newVendor = await sql`
      INSERT INTO vendors (name)
      VALUES (${name})
      RETURNING id, name;
    `;
    revalidatePath('/dashboard/finances/expenses');
    return newVendor.rows[0] as Vendor;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('No se pudo crear el proveedor.');
  }
}


export async function deleteExpense(formData: FormData) {
  'use server';

  const id = formData.get('id')?.toString();
  if (!id) {
    throw new Error('ID de gasto no encontrado.');
  }

  try {
    await sql`DELETE FROM expenses WHERE id = ${id}`;
    // Revalidamos la ruta para que la tabla se actualice
    revalidatePath('/dashboard/finances/expenses');
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error de Base de Datos: No se pudo eliminar el gasto.');
  }
}


const UpdateExpenseSchema = ExpenseSchema.omit({ id: true }).partial();

export async function updateExpense(id: string, prevState: ExpenseState, formData: FormData): Promise<ExpenseState> {

  const validatedFields = UpdateExpenseSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan campos o son inválidos.',
    };
  }

  const { data } = validatedFields;
  const amountInCents = data.amount ? Math.round(data.amount * 100) : undefined;
  const expenseDateForDb = data.transactionDate
    ? data.transactionDate.toISOString().split('T')[0]
    : null;

  // 👇 TRANSFORMACIÓN: Convertir strings vacíos a null para la DB
  const vendorIdForDb = data.vendor_id || null;
  const cardIdForDb = data.card_id || null;
  const categoryIdForDb = data.category_id || null;

  try {
    await sql`
      UPDATE expenses
      SET 
        vendor_id = ${vendorIdForDb},
        concept = ${data.concept},
        category_id = ${categoryIdForDb},
        amount = ${amountInCents},
        currency = ${data.currency},
        status = ${data.status},
        expense_date = ${expenseDateForDb},
        payment_method = ${data.payment_method},
        card_id = ${cardIdForDb},
        is_recurring = ${data.is_recurring},
        recurrence_interval = ${data.recurrence_interval}
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Error de Base de Datos: No se pudo actualizar el gasto.' };
  }

  const basePath = '/dashboard/finances/expenses';
  revalidatePath(basePath);
  revalidatePath(`${basePath}/${id}/edit`);
  redirect(basePath);
}

const CreateCardSchema = CardSchema.omit({ id: true });

export async function createCard(prevState: CardState, formData: FormData): Promise<CardState> {
  'use server';
  const validatedFields = CreateCardSchema.safeParse({
    name: formData.get('name'),
    last_four_digits: formData.get('last_four_digits'),
    closing_day: formData.get('closing_day'),
    due_day: formData.get('due_day'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan campos o son inválidos.',
    };
  }
  const { name, last_four_digits, closing_day, due_day } = validatedFields.data;

  try {
    await sql`
      INSERT INTO cards (name, last_four_digits, closing_day, due_day)
      VALUES (${name}, ${last_four_digits}, ${closing_day}, ${due_day})
    `;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error de Base de Datos: No se pudo crear la tarjeta.');
  }
  revalidatePath('/dashboard/finances/cards');
  return { message: 'Tarjeta creada con éxito.' };
}







// 👇 AÑADE ESTA NUEVA FUNCIÓN 👇
export async function deleteClient(formData: FormData) {
  const id = formData.get('id')?.toString();
  if (!id) {
    throw new Error('ID de cliente no encontrado.');
  }

  try {
    // 1. Comprobamos si el cliente tiene facturas asociadas
    const invoiceCount = await sql`
      SELECT COUNT(*) FROM invoices WHERE client_id = ${id}
    `;

    if (Number(invoiceCount.rows[0].count) > 0) {
      // Si tiene facturas, devolvemos un error y no borramos nada
      console.error('Validation Error: Cannot delete client with existing invoices.');
      // En una implementación futura, podrías devolver este mensaje a la UI
      // return { message: 'Este cliente tiene facturas asociadas y no puede ser eliminado.' };
      return; // Por ahora, simplemente no hacemos nada
    }

    // 2. Si no tiene facturas, lo eliminamos
    await sql`DELETE FROM clients WHERE id = ${id}`;
    revalidatePath('/dashboard/finances/clients');

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error de Base de Datos: No se pudo eliminar el cliente.');
  }
}



export async function updateClient(id: string, prevState: ClientState, formData: FormData): Promise<ClientState> {
  const validatedFields = ClientSchema.omit({ id: true }).safeParse({
    brand: formData.get('brand'),
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan campos o son inválidos.',
    };
  }
  const { brand, name, email, phone } = validatedFields.data;

  try {
    await sql`
      UPDATE clients
      SET brand = ${brand}, name = ${name}, email = ${email}, phone = ${phone}
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Error de Base de Datos: No se pudo actualizar el cliente.' };
  }

  revalidatePath('/dashboard/finances/clients');
  redirect('/dashboard/finances/clients');
}
// ---------------------
// INTERFACES
// ---------------------
export interface ExpenseInput {
  concept: string;
  amount: number;
  currency?: string;
  categoryId?: string;
  vendorId?: string;
  paymentMethod: "Efectivo" | "Tarjeta";
  cardId?: string;
  expenseDate: Date;
  totalInstallments?: number;
}

export interface RecurringExpenseInput {
  concept: string;
  amount: number;
  currency?: string;
  categoryId?: string;
  vendorId?: string;
  paymentMethod: "Efectivo" | "Tarjeta";
  cardId?: string;
  frequency: "monthly" | "weekly";
  startDate: Date;
  endDate: Date;
  totalInstallments?: number;
}

// ---------------------
// FUNCIÓN AUXILIAR - CUOTAS BATCH
// ---------------------
async function generateInstallmentsAndStatementsBatch(
  expenseId: string,
  amount: number,
  totalInstallments: number,
  expenseDate: Date,
  cardId: string
) {
  const db = await sql.connect();
  try {
    const cardResult = await db.query<{ closing_day: number; due_day: number }>(
      "SELECT closing_day, due_day FROM cards WHERE id = $1",
      [cardId]
    );

    if (!cardResult.rows[0]) throw new Error("Card not found");

    const { closing_day, due_day } = cardResult.rows[0];

    const installmentsValues: {
      expense_id: string;
      installment_number: number;
      due_date: string;
      amount: number;
      status: "pending" | "paid";
    }[] = [];

    const dueDate = new Date(expenseDate);
    if (dueDate.getDate() > closing_day) {
      dueDate.setMonth(dueDate.getMonth() + 1);
      dueDate.setDate(due_day);
    } else {
      dueDate.setDate(due_day);
    }

    const installmentAmount = Math.floor(amount / totalInstallments);

    for (let i = 1; i <= totalInstallments; i++) {
      installmentsValues.push({
        expense_id: expenseId,
        installment_number: i,
        due_date: dueDate.toISOString().split("T")[0],
        amount: installmentAmount,
        status: "pending",
      });
      dueDate.setMonth(dueDate.getMonth() + 1);
    }

    for (const inst of installmentsValues) {
      await db.query(
        "INSERT INTO expense_installments (expense_id, installment_number, due_date, amount, status) VALUES ($1, $2, $3, $4, $5)",
        [inst.expense_id, inst.installment_number, inst.due_date, inst.amount, inst.status]
      );
    }
  } finally {
    db.release();
  }
}

// ---------------------
// CREAR GASTO SIMPLE
// ---------------------
export async function createExpense(input: ExpenseInput) {
  const db = await sql.connect();
  try {
    const result = await db.query<{
      id: string;
      total_installments: number;
      card_id: string | null;
      amount: number;
      expense_date: string;
    }>(
      `INSERT INTO expenses 
        (concept, amount, currency, category_id, vendor_id, payment_method, card_id, expense_date, status, total_installments, current_installment)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending',$9,1)
       RETURNING id, total_installments, card_id, amount, expense_date`,
      [
        input.concept,
        input.amount,
        input.currency || "ARS",
        input.categoryId || null,
        input.vendorId || null,
        input.paymentMethod,
        input.cardId || null,
        input.expenseDate.toISOString().split("T")[0],
        input.totalInstallments || 1,
      ]
    );

    const row = result.rows[0];
    if (row.card_id && row.total_installments > 1) {
      await generateInstallmentsAndStatementsBatch(
        row.id,
        row.amount,
        row.total_installments,
        new Date(row.expense_date),
        row.card_id
      );
    }

    return row.id;
  } finally {
    db.release();
  }
}

// ---------------------
// CREAR GASTO RECURRENTE
// ---------------------
export async function createRecurringExpense(input: RecurringExpenseInput) {
  const db = await sql.connect();
  try {
    // Crear la recurrencia
    const recurrenceResult = await db.query<{ id: string }>(
      `INSERT INTO expense_recurrences
        (concept, amount, currency, category_id, vendor_id, payment_method, card_id, frequency, start_date, end_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING id`,
      [
        input.concept,
        input.amount,
        input.currency || "ARS",
        input.categoryId || null,
        input.vendorId || null,
        input.paymentMethod,
        input.cardId || null,
        input.frequency,
        input.startDate.toISOString().split("T")[0],
        input.endDate.toISOString().split("T")[0],
      ]
    );

    const recurrenceId = recurrenceResult.rows[0].id;

    // Generar fechas
// Generar fechas de manera inmutable, sin usar let
const dates: Date[] = [];
for (
  let date = new Date(input.startDate);
  date <= input.endDate;
  date = new Date(
    input.frequency === "monthly"
      ? new Date(date).setMonth(date.getMonth() + 1)
      : new Date(date).setDate(date.getDate() + 7)
  )
) {
  dates.push(new Date(date));
}

    // Insertar cada gasto generado
    for (const date of dates) {
      const expenseResult = await db.query<{
        id: string;
        total_installments: number;
        card_id: string | null;
        amount: number;
        expense_date: string;
      }>(
        `INSERT INTO expenses
          (concept, amount, currency, category_id, vendor_id, payment_method, card_id, expense_date, status, parent_expense_id, total_installments, current_installment)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending',$9,$10,1)
         RETURNING id, total_installments, card_id, amount, expense_date`,
        [
          input.concept,
          input.amount,
          input.currency || "ARS",
          input.categoryId || null,
          input.vendorId || null,
          input.paymentMethod,
          input.cardId || null,
          date.toISOString().split("T")[0],
          recurrenceId,
          input.totalInstallments || 1,
        ]
      );

      const expenseRow = expenseResult.rows[0];
      if (expenseRow.card_id && expenseRow.total_installments > 1) {
        await generateInstallmentsAndStatementsBatch(
          expenseRow.id,
          expenseRow.amount,
          expenseRow.total_installments,
          new Date(expenseRow.expense_date),
          expenseRow.card_id
        );
      }
    }

    return recurrenceId;
  } finally {
    db.release();
  }
}

export async function updateRecurringExpense(
  recurrenceId: string,
  updates: Partial<RecurringExpenseInput>
) {
  const db = await sql.connect();
  try {
    // 1️⃣ Construimos los pares columna = valor dinámicamente
    const columns: string[] = [];
    const values: (string | number | null | Date)[] = [];

    for (const key of Object.keys(updates) as (keyof RecurringExpenseInput)[]) {
      const value: RecurringExpenseInput[typeof key] = updates[key]!;

      // Convertimos fechas a string YYYY-MM-DD si corresponde
      const formattedValue =
        value instanceof Date ? value.toISOString().split("T")[0] : value ?? null;

      columns.push(`${key} = $${values.length + 1}`);
      values.push(formattedValue);
    }

    if (columns.length === 0) {
      throw new Error("No hay campos para actualizar");
    }

    // 2️⃣ Ejecutamos update
    await db.query(
      `UPDATE expense_recurrences SET ${columns.join(", ")} WHERE id = $${values.length + 1}`,
      [...values, recurrenceId]
    );

    // 3️⃣ Revalidamos cache si corresponde
    revalidatePath("/dashboard/finances/expenses");
  } finally {
    db.release();
  }
}
