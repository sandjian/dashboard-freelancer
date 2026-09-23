"use server"

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  CardSchema,
  CardState,
  Category,
  ClientSchema,
  ClientState,
  ExpenseSchema,
  ExpenseTemplateSchema,
  ExpenseState,
  InvoiceSchema,
  InvoiceState,
  Vendor
} from './definitions';
import { fetchNextInvoiceNumber } from './data';
import { calculateCardDates } from './utils';

// --- UTILS ---

const parseDateAsLocal = (dateString: string | null | undefined): Date | null => {
  if (!dateString) return null;
  // Replace '-' with '/' to better support local time parsing in some environments, though ISO string standard is clearer.
  // Using explicit Date construction with components is safest but this trick often works for YYYY-MM-DD.
  const date = new Date(dateString.replace(/-/g, '\/'));
  return isNaN(date.getTime()) ? null : date;
};

// --- INVOICES ---

const CreateInvoiceSchema = InvoiceSchema.omit({ id: true, invoice_number: true, amount: true });

export async function createInvoice(prevState: InvoiceState, formData: FormData): Promise<InvoiceState> {

  const issueDateValue = formData.get('issue_date') as string;
  const dueDateValue = formData.get('due_date') as string;

  const validatedFields = CreateInvoiceSchema.safeParse({
    client_id: formData.get('client_id'),
    status: formData.get('status'),
    discount: formData.get('discount'),
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

  // Process Line Items
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
  // Dentro de createInvoice:
  const discountPercent = Number(discount) || 0;
  const finalAmountInCents = Math.round(totalAmountInCents * (1 - discountPercent / 100));
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

export async function deleteInvoice(formData: FormData) {
  const id = formData.get('id')?.toString();
  if (!id) throw new Error('ID de factura no encontrado.');

  const db = await sql.connect();
  try {
    await db.query('BEGIN');
    await db.query(`DELETE FROM line_items WHERE invoice_id = $1`, [id]);
    await db.query(`DELETE FROM invoices WHERE id = $1`, [id]);
    await db.query('COMMIT');

    revalidatePath('/dashboard/finances/invoices');
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Database Error:', error);
    throw new Error('Error de Base de Datos: No se pudo eliminar la factura.');
  } finally {
    db.release();
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

  const { client_id, status, discount, issue_date, due_date, currency } = validatedFields.data;

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
    await sql`UPDATE invoices SET status = ${newStatus} WHERE id = ${id}`;
    revalidatePath(`/dashboard/finances/invoices/${id}/details`);
    revalidatePath('/dashboard/finances/invoices');
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('No se pudo actualizar el estado de la factura.');
  }
}

// --- CLIENTS ---

const CreateClientSchema = ClientSchema.omit({ id: true });

export async function createClient(prevState: ClientState, formData: FormData): Promise<ClientState> {
  const validatedFields = CreateClientSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    brand: formData.get('brand'),
    phone: formData.get('phone'),
    image_url: formData.get('image_url'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan campos o son inválidos. No se pudo crear el cliente.',
    };
  }

  const { name, email, brand, phone, image_url } = validatedFields.data;

  try {
    await sql`
      INSERT INTO clients (name, email, brand, phone, image_url)
      VALUES (${name}, ${email || null}, ${brand || null}, ${phone || null}, ${image_url || null})
    `;
  } catch (error) {
    console.error('Database Error:', error);
    return {
      message: 'Error de Base de Datos: No se pudo crear el cliente.',
    };
  }

  revalidatePath('/dashboard/finances/clients');
  revalidatePath('/dashboard/finances/invoices/create');
  return { message: "Cliente creado con éxito.", errors: {} };
}

export async function deleteClient(formData: FormData) {
  const id = formData.get('id')?.toString();
  if (!id) throw new Error('ID de cliente no encontrado.');

  try {
    const invoiceCount = await sql`SELECT COUNT(*) FROM invoices WHERE client_id = ${id}`;
    if (Number(invoiceCount.rows[0].count) > 0) {
      console.error('Validation Error: Cannot delete client with existing invoices.');
      return;
    }
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

// --- CATEGORIES & VENDORS ---

export async function createCategory(name: string): Promise<Category> {
  const existingCategory = await sql`SELECT * FROM expense_categories WHERE name ILIKE ${name}`;
  if (existingCategory.rows.length > 0) {
    return existingCategory.rows[0] as Category;
  }
  try {
    const newCategory = await sql`
      INSERT INTO expense_categories (name) VALUES (${name}) RETURNING id, name;
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
      INSERT INTO vendors (name) VALUES (${name}) RETURNING id, name;
    `;
    revalidatePath('/dashboard/finances/expenses');
    return newVendor.rows[0] as Vendor;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('No se pudo crear el proveedor.');
  }
}

// --- CARDS ---

const CreateCardSchema = CardSchema.omit({ id: true });
export async function createCard(prevState: CardState, formData: FormData): Promise<CardState> {
  const validatedFields = CreateCardSchema.safeParse({
    name: formData.get('name'),
    last_four_digits: formData.get('last_four_digits'),
    closing_day: formData.get('closing_day'),
    due_day: formData.get('due_day'),
    color: formData.get('color'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan campos o son inválidos.',
    };
  }
  const { name, last_four_digits, closing_day, due_day, color } = validatedFields.data;

  try {
    await sql`
      INSERT INTO cards (name, last_four_digits, closing_day, due_day, color)
      VALUES (${name}, ${last_four_digits}, ${closing_day}, ${due_day}, ${color})
    `;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error de Base de Datos: No se pudo crear la tarjeta.');
  }
  revalidatePath('/dashboard/finances/cards');
  return { message: 'Tarjeta creada con éxito.' };
}

// --- EXPENSES (REFACTORED) ---

const CreateExpenseSchema = ExpenseSchema.omit({ id: true });
const CreateTemplateSchema = ExpenseTemplateSchema.omit({ id: true, next_due_date: true });

export async function createExpense(prevState: ExpenseState, formData: FormData): Promise<ExpenseState> {
  const rawAmount = formData.get('amount');
  const amountVal = rawAmount ? Number(rawAmount) : 0;

  // Si está marcado como recurrente, delega a la creación de plantilla
  const isRecurring = formData.get('is_recurring') === 'true';
  if (isRecurring) {
    return createExpenseTemplate(prevState, formData);
  }

  const parsedDate = parseDateAsLocal(formData.get('expense_date') as string);
  const validDate = parsedDate ?? new Date();
  const period = `${validDate.getFullYear()}-${String(validDate.getMonth() + 1).padStart(2, '0')}`;
  const rawData = {
    concept: formData.get('concept'),
    category_id: formData.get('category_id'),
    vendor_id: formData.get('vendor_id') || null,
    amount: amountVal,
    currency: formData.get('currency') || 'ARS',
    status: formData.get('status') || 'pending',
    date: validDate,
    payment_method: formData.get('payment_method'),
    card_id: formData.get('card_id') || null,
    description: formData.get('description') || null,
    entity_type: formData.get('entity_type') || 'personal',
  };

  const validated = CreateExpenseSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: 'Error en campos del gasto.',
    };
  }

  const data = validated.data;
  const amountInCents = Math.round(data.amount * 100);
  const db = await sql.connect();

  try {
    // Inserción directa sin partición de cuotas en tablas secundarias
    await db.query(
      `INSERT INTO expenses 
       (concept, amount, currency, category_id, vendor_id, payment_method, card_id, date, status, description, entity_type, period)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        data.concept,
        amountInCents,
        data.currency,
        data.category_id,
        data.vendor_id,
        data.payment_method,
        data.card_id,
        data.date.toISOString(),
        data.status,
        data.description,
        data.entity_type,
        period,
      ]
    );
  } catch (err) {
    console.error('DB Error:', err);
    return { message: 'Error al guardar el gasto.' };
  } finally {
    db.release();
  }

  revalidatePath('/dashboard/finances/expenses');
  redirect('/dashboard/finances/expenses');
}

async function createExpenseTemplate(prevState: ExpenseState, formData: FormData): Promise<ExpenseState> {
  const rawAmount = formData.get('amount');
  const parsedDate = parseDateAsLocal(formData.get('expense_date') as string);
  const validDate = parsedDate ?? new Date();
  const period = `${validDate.getFullYear()}-${String(validDate.getMonth() + 1).padStart(2, '0')}`;
  const rawData = {
    concept: formData.get('concept'),
    amount: rawAmount ? Number(rawAmount) : 0,
    currency: formData.get('currency') || 'ARS',
    category_id: formData.get('category_id'),
    vendor_id: formData.get('vendor_id') || null,
    frequency: formData.get('frequency') || 'monthly',
    start_date: validDate,
    payment_method: formData.get('payment_method'),
    card_id: formData.get('card_id') || null,
    entity_type: formData.get('entity_type') || 'personal',
    active: true,
  };

  const validated = CreateTemplateSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: 'Error en campos de la plantilla recurrente.',
    };
  }

  const data = validated.data;
  const amountInCents = Math.round(data.amount * 100);
  const db = await sql.connect();

  try {
    await db.query('BEGIN');

    // 1. Guardar Molde / Plantilla
    const templateResult = await db.query(
      `INSERT INTO expense_templates 
       (concept, amount, currency, category_id, vendor_id, frequency, start_date, next_due_date, payment_method, card_id, entity_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id`,
      [
        data.concept,
        amountInCents,
        data.currency,
        data.category_id,
        data.vendor_id,
        data.frequency,
        data.start_date.toISOString(),
        data.start_date.toISOString(),
        data.payment_method,
        data.card_id,
        data.entity_type,
      ]
    );

    const templateId = templateResult.rows[0].id;

    // 2. Generar la instancia del mes actual con su período correspondiente
    await db.query(
      `INSERT INTO expenses
       (concept, amount, currency, category_id, vendor_id, payment_method, card_id, date, status, description, template_id, entity_type, period)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', 'Generado automáticamente desde plantilla', $9, $10, $11)`,
      [
        data.concept,
        amountInCents,
        data.currency,
        data.category_id,
        data.vendor_id,
        data.payment_method,
        data.card_id,
        data.start_date.toISOString(),
        templateId,
        data.entity_type,
        period,
      ]
    );

    await db.query('COMMIT');
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('DB Template Error:', err);
    return { message: 'Error al crear la plantilla.' };
  } finally {
    db.release();
  }

  revalidatePath('/dashboard/finances/expenses');
  redirect('/dashboard/finances/expenses');
}

export async function deleteExpense(formData: FormData) {
  'use server';
  const id = formData.get('id')?.toString();
  if (!id) throw new Error('ID de gasto no encontrado.');

  try {
    await sql`DELETE FROM expenses WHERE id = ${id}`;
    revalidatePath('/dashboard/finances/expenses');
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error de Base de Datos: No se pudo eliminar el gasto.');
  }
}

const UpdateExpenseSchema = ExpenseSchema.omit({ id: true }).partial();

export async function updateExpense(id: string, prevState: ExpenseState, formData: FormData): Promise<ExpenseState> {
  const rawData = {
    concept: formData.get('concept'),
    category_id: formData.get('category_id'),
    vendor_id: formData.get('vendor_id') || null,
    amount: formData.get('amount') ? Number(formData.get('amount')) : undefined,
    currency: formData.get('currency'),
    status: formData.get('status'),
    date: parseDateAsLocal(formData.get('expense_date') as string),
    payment_method: formData.get('payment_method'),
    card_id: formData.get('card_id') || null,
    description: formData.get('description'),
  };

  const validatedFields = UpdateExpenseSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan campos o son inválidos.',
    };
  }

  const { data } = validatedFields;
  const amountInCents = data.amount ? Math.round(data.amount * 100) : undefined;

  try {
    const dateStr = data.date ? data.date.toISOString() : undefined;

    // We will build arrays for dynamic update
    const cols = [];
    const vals = [];
    if (data.concept !== undefined) { cols.push('concept'); vals.push(data.concept); }
    if (data.amount !== undefined) { cols.push('amount'); vals.push(amountInCents); }
    if (data.category_id !== undefined) { cols.push('category_id'); vals.push(data.category_id); }
    if (data.vendor_id !== undefined) { cols.push('vendor_id'); vals.push(data.vendor_id); }
    if (data.currency !== undefined) { cols.push('currency'); vals.push(data.currency); }
    if (data.status !== undefined) { cols.push('status'); vals.push(data.status); }
    if (data.date !== undefined) { cols.push('date'); vals.push(dateStr); }
    if (data.payment_method !== undefined) { cols.push('payment_method'); vals.push(data.payment_method); }
    if (data.card_id !== undefined) { cols.push('card_id'); vals.push(data.card_id); }
    if (data.description !== undefined) { cols.push('description'); vals.push(data.description); }

    if (cols.length > 0) {
      // Construct SET clause: "col1 = $1, col2 = $2, ..."
      const setClause = cols.map((col, idx) => `${col} = $${idx + 1}`).join(', ');
      // Add ID as last param
      vals.push(id);

      await sql.query(
        `UPDATE expenses SET ${setClause} WHERE id = $${vals.length}`,
        vals
      );
    }

  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Error de Base de Datos: No se pudo actualizar el gasto.' };
  }

  const basePath = '/dashboard/finances/expenses';
  revalidatePath(basePath);
  revalidatePath(`${basePath}/${id}/edit`);
  redirect(basePath);
}

// Separate action for updating Templates triggers
export async function updateRecurringExpense(
  recurrenceId: string,
  updates: Record<string, unknown>
) {
  const db = await sql.connect();
  try {
    const columns: string[] = [];
    const values: unknown[] = [];

    for (const key of Object.keys(updates)) {
      const value = updates[key];
      const formattedValue = value instanceof Date ? value.toISOString() : value ?? null;

      columns.push(`${key} = $${values.length + 1}`);
      values.push(formattedValue);
    }

    if (columns.length === 0) {
      return;
    }

    await db.query(
      `UPDATE expense_templates SET ${columns.join(", ")} WHERE id = $${values.length + 1}`,
      [...values, recurrenceId]
    );

    revalidatePath("/dashboard/finances/expenses");
  } finally {
    db.release();
  }
}


export async function processRecurringExpenses(
  selection: { templateId: string; status: 'paid' | 'pending' }[]
) {
  const db = await sql.connect();
  try {
    if (!selection || selection.length === 0) return { success: true, count: 0 };

    await db.query('BEGIN');
    let count = 0;

    for (const item of selection) {
      // Fetch template
      const tmplResult = await db.query(`SELECT * FROM expense_templates WHERE id = $1`, [item.templateId]);
      if (tmplResult.rows.length === 0) continue;
      const tmpl = tmplResult.rows[0];

      const currentDueDate = new Date(tmpl.next_due_date);
      const today = new Date();
      // Reset time for fair comparison
      today.setHours(0, 0, 0, 0);
      currentDueDate.setHours(0, 0, 0, 0);

      // Loop while the due date is in the past or today
      while (currentDueDate <= today) {

        // Insert Expense
        await db.query(
          `INSERT INTO expenses
            (concept, amount, currency, category_id, vendor_id, payment_method, card_id, date, status, description, template_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Generado manualmente (Recurrente)', $10)`,
          [
            tmpl.concept,
            tmpl.amount,
            tmpl.currency,
            tmpl.category_id,
            tmpl.vendor_id,
            tmpl.payment_method,
            tmpl.card_id,
            currentDueDate.toISOString(), // Use currently processed date
            item.status,
            tmpl.id
          ]
        );
        count++;

        // Calculate Next Date for the loop
        if (tmpl.frequency === 'monthly') {
          currentDueDate.setMonth(currentDueDate.getMonth() + 1);
        } else if (tmpl.frequency === 'yearly') {
          currentDueDate.setFullYear(currentDueDate.getFullYear() + 1);
        } else if (tmpl.frequency === 'weekly') {
          currentDueDate.setDate(currentDueDate.getDate() + 7);
        } else if (tmpl.frequency === 'daily') {
          currentDueDate.setDate(currentDueDate.getDate() + 1);
        }
      }

      // Update Template Next Due Date to the future date we reached
      await db.query(
        `UPDATE expense_templates SET next_due_date = $1 WHERE id = $2`,
        [currentDueDate.toISOString(), tmpl.id]
      );
    }

    await db.query('COMMIT');
    revalidatePath('/dashboard/finances/expenses');
    return { success: true, count };

  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Process Recurring Error:', error);
    return { success: false, message: 'Failed to process expenses' };
  } finally {
    db.release();
  }
}

export async function checkRecurringExpenses() {
  const db = await sql.connect();
  try {
    const dueTemplates = await db.query(`
      SELECT * FROM expense_templates 
      WHERE next_due_date <= NOW() AND active = TRUE
    `);

    if (dueTemplates.rows.length === 0) return { message: "No hay gastos recurrentes pendientes." };

    await db.query('BEGIN');

    for (const tmpl of dueTemplates.rows) {
      await db.query(
        `INSERT INTO expenses
          (concept, amount, currency, category_id, vendor_id, payment_method, card_id, date, status, description, template_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', 'Generado automáticamente (Recurrente)', $9)`,
        [
          tmpl.concept,
          tmpl.amount,
          tmpl.currency,
          tmpl.category_id,
          tmpl.vendor_id,
          tmpl.payment_method,
          tmpl.card_id,
          tmpl.next_due_date,
          tmpl.id
        ]
      );

      // Calculate Next Date
      const currentDue = new Date(tmpl.next_due_date);
      const nextDate = new Date(currentDue);

      if (tmpl.frequency === 'monthly') {
        nextDate.setMonth(nextDate.getMonth() + 1);
      } else if (tmpl.frequency === 'yearly') {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      } else if (tmpl.frequency === 'weekly') {
        nextDate.setDate(nextDate.getDate() + 7);
      } else if (tmpl.frequency === 'daily') {
        nextDate.setDate(nextDate.getDate() + 1);
      }

      // Update Template
      await db.query(
        `UPDATE expense_templates SET next_due_date = $1 WHERE id = $2`,
        [nextDate.toISOString(), tmpl.id]
      );
    }

    await db.query('COMMIT');
    revalidatePath('/dashboard/finances/expenses');
    return { message: `Se generaron ${dueTemplates.rows.length} gastos recurrentes.` };

  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Recurrence Check Error:', error);
    throw new Error('Failed to process recurring expenses.');
  } finally {
    db.release();
  }
}

export async function getDueRecurringExpenses() {
  const db = await sql.connect();
  try {
    const dueTemplates = await db.query(`
      SELECT * FROM expense_templates 
      WHERE next_due_date <= NOW() AND active = TRUE
    `);

    return dueTemplates.rows.map(row => ({
      ...row,
      amount: row.amount / 100, // Convert cents to units for display
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch due recurring expenses.');
  } finally {
    db.release();
  }
}

export async function saveCardStatement(formData: FormData) {
  'use server';

  const cardId = formData.get('card_id') as string;
  const year = Number(formData.get('year'));
  const month = Number(formData.get('month'));
  const rawAmount = formData.get('total_amount');
  const amount = rawAmount ? Number(rawAmount) : 0;
  const dueDateStr = formData.get('due_date') as string;
  const closingDateStr = formData.get('closing_date') as string;

  if (!cardId || !year || !month || amount <= 0 || !dueDateStr) {
    throw new Error('Todos los campos son obligatorios y el monto debe ser mayor a 0.');
  }

  // Primer día del mes del período (statement_month)
  const statementMonth = `${year}-${String(month).padStart(2, '0')}-01`;

  // Normalización de fecha de vencimiento (YYYY-MM-DD)
  const dueDateTime = new Date(dueDateStr);
  const dueDate = dueDateTime.toISOString().split('T')[0];

  // Si el formulario no envía fecha de cierre, calculamos 10 días antes del vencimiento por defecto
  let closingDate: string;
  if (closingDateStr) {
    closingDate = new Date(closingDateStr).toISOString().split('T')[0];
  } else {
    const calculatedClosing = new Date(dueDateTime);
    calculatedClosing.setDate(calculatedClosing.getDate() - 10);
    closingDate = calculatedClosing.toISOString().split('T')[0];
  }

  const db = await sql.connect();
  try {
    // Operación Upsert con closing_date incluida para satisfacer la restricción NOT NULL
    await db.query(
      `INSERT INTO card_statements (
         card_id, 
         statement_month, 
         total_amount, 
         closing_date, 
         due_date, 
         status
       )
       VALUES ($1, $2, $3, $4, $5, 'pending')
       ON CONFLICT (card_id, statement_month)
       DO UPDATE SET
         total_amount = EXCLUDED.total_amount,
         closing_date = EXCLUDED.closing_date,
         due_date = EXCLUDED.due_date,
         status = 'pending'`,
      [cardId, statementMonth, amount, closingDate, dueDate]
    );

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/finances/cards');
    revalidatePath('/dashboard/finances/expenses');
  } catch (error) {
    console.error('Error al guardar resumen de tarjeta:', error);
    throw new Error('No se pudo registrar el resumen.');
  } finally {
    db.release();
  }
}

export async function toggleCardStatementStatus(statementId: string | number, currentStatus: string) {
  'use server';

  const nextStatus = currentStatus === 'paid' ? 'pending' : 'paid';
  const db = await sql.connect();

  try {
    await db.query('BEGIN');

    // 1. Actualizar el estado del resumen en card_statements
    await db.query(
      `UPDATE card_statements 
       SET status = $1 
       WHERE id = $2`,
      [nextStatus, statementId]
    );

    const statementIdentifier = `[statement_id:${statementId}]`;

    if (nextStatus === 'paid') {
      // 2. Obtener datos del resumen y de la tarjeta
      const statementRes = await db.query(
        `SELECT cs.total_amount, cs.statement_month, cs.card_id, c.name as card_name
         FROM card_statements cs
         JOIN cards c ON cs.card_id = c.id
         WHERE cs.id = $1`,
        [statementId]
      );

      if (statementRes.rows.length > 0) {
        const row = statementRes.rows[0];
        const cardName = row.card_name;
        // card_statements almacena decimales reales; expenses almacena centavos (enteros)
        const amountInCents = Math.round(Number(row.total_amount) * 100);

        // Formatear periodo YYYY-MM a partir de statement_month
        const stDate = new Date(row.statement_month);
        const period = `${stDate.getUTCFullYear()}-${String(stDate.getUTCMonth() + 1).padStart(2, '0')}`;

        // Buscar si existe una categoría específica para tarjetas o servicios bancarios
        const catRes = await db.query(
          `SELECT id FROM expense_categories 
           WHERE name ILIKE '%tarjeta%' OR name ILIKE '%financ%' 
           ORDER BY id ASC LIMIT 1`
        );
        const categoryId = catRes.rows[0]?.id || null;

        // Insertar el egreso bancario real en expenses
        await db.query(
          `INSERT INTO expenses (
            concept,
            amount,
            currency,
            category_id,
            payment_method,
            card_id,
            date,
            status,
            entity_type,
            period,
            description
          ) VALUES (
            $1, $2, 'ARS', $3, 'transfer', $4, CURRENT_DATE, 'paid', 'personal', $5, $6
          )`,
          [
            `Pago Resumen Tarjeta ${cardName}`,
            amountInCents,
            categoryId,
            row.card_id,
            period,
            `Generado automáticamente desde pago de resumen mensual ${statementIdentifier}`,
          ]
        );
      }
    } else {
      // 3. Si se desmarca a 'pending', eliminamos la salida de caja vinculada
      await db.query(
        `DELETE FROM expenses 
         WHERE description LIKE '%' || $1 || '%'`,
        [statementIdentifier]
      );
    }

    await db.query('COMMIT');

    revalidatePath('/dashboard/finances/cards');
    revalidatePath('/dashboard/finances/expenses');
    revalidatePath('/dashboard/finances');

    return { success: true, status: nextStatus };
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error al sincronizar estado del resumen con gastos:', error);
    throw new Error('No se pudo procesar el pago del resumen.');
  } finally {
    db.release();
  }
}

export async function ensureMonthlyRecurrences(year: number, month: number) {
  const period = `${year}-${String(month).padStart(2, '0')}`;
  const db = await sql.connect();

  try {
    // Inserta solo las plantillas activas que aún no tengan fila generada en este período
    await db.query(
      `INSERT INTO expenses (
        concept,
        amount,
        currency,
        category_id,
        vendor_id,
        payment_method,
        card_id,
        date,
        status,
        description,
        entity_type,
        period,
        template_id
      )
      SELECT 
        t.concept,
        t.amount,
        t.currency,
        t.category_id,
        t.vendor_id,
        t.payment_method,
        t.card_id,
        MAKE_DATE($1, $2, LEAST(EXTRACT(DAY FROM t.start_date)::int, 28)),
        'pending',
        'Gasto fijo generado automáticamente',
        t.entity_type,
        $3::varchar,
        t.id
      FROM expense_templates t
      WHERE t.active = true
        AND NOT EXISTS (
          SELECT 1 FROM expenses e 
          WHERE e.template_id = t.id AND e.period = $3::varchar
        )`,
      [year, month, period]
    );
  } catch (error) {
    console.error('Error al sincronizar recurrentes:', error);
  } finally {
    db.release();
  }
}

export async function toggleInvoicePaymentStatus(invoiceId: string, currentStatus: string) {
  'use server';

  // Si está cobrada ('facturado'), vuelve a 'pendiente'; si no, se marca como cobrada ('facturado')
  const nextStatus = currentStatus === 'facturado' ? 'pendiente' : 'facturado';

  try {
    await sql`
      UPDATE invoices
      SET status = ${nextStatus}
      WHERE id = ${invoiceId}
    `;

    revalidatePath('/dashboard/finances/invoices');
    revalidatePath('/dashboard/finances');
    return { success: true, status: nextStatus };
  } catch (error) {
    console.error('Error al actualizar estado de la factura:', error);
    throw new Error('No se pudo actualizar el estado de cobro.');
  }
}


// Obtener los ítems y configuración de la última factura de un cliente (para clonar/precargar)
export async function getLastInvoiceForClient(clientId: string) {
  'use server';
  if (!clientId) return null;

  try {
    const invoiceRes = await sql`
      SELECT id, currency, discount 
      FROM invoices 
      WHERE client_id = ${clientId} 
      ORDER BY issue_date DESC, created_at DESC 
      LIMIT 1
    `;

    if (invoiceRes.rows.length === 0) return null;

    const lastInvoice = invoiceRes.rows[0];
    const itemsRes = await sql`
      SELECT description, quantity, unit_price 
      FROM line_items 
      WHERE invoice_id = ${lastInvoice.id}
    `;

    return {
      currency: lastInvoice.currency,
      discount: Number(lastInvoice.discount) || 0,
      lineItems: itemsRes.rows.map((item) => ({
        description: item.description,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price) / 100, // Se pasa a pesos para los inputs
      })),
    };
  } catch (error) {
    console.error('Error al obtener última factura del cliente:', error);
    return null;
  }
}

export async function createBankAccount(formData: FormData) {
  'use server';

  const name = formData.get('name') as string;
  const account_type = formData.get('account_type') as string;
  const currency = (formData.get('currency') as string) || 'ARS';
  const initialBalance = Number(formData.get('balance')) || 0;
  const color = (formData.get('color') as string) || '#10b981';

  if (!name || !account_type) {
    throw new Error('Nombre y tipo de cuenta son obligatorios.');
  }

  const balanceInCents = Math.round(initialBalance * 100);

  try {
    await sql`
      INSERT INTO bank_accounts (name, account_type, currency, balance, color)
      VALUES (${name}, ${account_type}, ${currency}, ${balanceInCents}, ${color})
    `;

    revalidatePath('/dashboard/finances/banks');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error al crear cuenta bancaria:', error);
    throw new Error('No se pudo registrar la cuenta.');
  }
}

export async function updateAccountBalance(accountId: string, newBalance: number) {
  'use server';

  const balanceInCents = Math.round(newBalance * 100);

  try {
    await sql`
      UPDATE bank_accounts
      SET balance = ${balanceInCents}, updated_at = NOW()
      WHERE id = ${accountId}
    `;

    revalidatePath('/dashboard/finances/banks');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error al actualizar saldo:', error);
    throw new Error('No se pudo actualizar el saldo de la cuenta.');
  }
}


export async function payCardStatement(statementId: string, accountId: string) {
  'use server';

  if (!statementId || !accountId) {
    throw new Error('Faltan parámetros para procesar el pago.');
  }

  const db = await sql.connect();

  try {
    await db.query('BEGIN');

    // 1. Obtener datos del resumen y la tarjeta
    const stmtRes = await db.query(
      `SELECT cs.id, cs.total_amount, cs.status, c.name as card_name, cs.card_id
       FROM card_statements cs
       JOIN cards c ON cs.card_id = c.id
       WHERE cs.id = $1 FOR UPDATE`,
      [statementId]
    );

    if (stmtRes.rows.length === 0) {
      throw new Error('Resumen no encontrado.');
    }

    const statement = stmtRes.rows[0];

    if (statement.status === 'paid') {
      throw new Error('Este resumen ya figura como pagado.');
    }

    const amountInCents = Number(statement.total_amount);

    // 2. Descontar saldo de la cuenta bancaria elegida
    const updateBankRes = await db.query(
      `UPDATE bank_accounts 
       SET balance = balance - $1, updated_at = NOW() 
       WHERE id = $2 AND is_active = TRUE
       RETURNING id, balance`,
      [amountInCents, accountId]
    );

    if (updateBankRes.rows.length === 0) {
      throw new Error('Cuenta bancaria no válida o inactiva.');
    }

    // 3. Marcar el resumen como pagado
    await db.query(
      `UPDATE card_statements 
       SET status = 'paid' 
       WHERE id = $1`,
      [statementId]
    );

    // 4. Buscar una categoría por defecto para el gasto (fallback seguro para evitar errores NOT NULL)
    const catRes = await db.query(
      `SELECT id FROM expense_categories 
       WHERE name ILIKE '%tarjeta%' OR name ILIKE '%financ%' OR name ILIKE '%servicios%'
       LIMIT 1`
    );
    const defaultCategoryId = catRes.rows[0]?.id || null;

    // 5. Registrar el egreso en expenses vinculado a la cuenta
    await db.query(
      `INSERT INTO expenses (
        concept, 
        amount, 
        date, 
        category_id, 
        payment_method, 
        account_id, 
        status
      ) VALUES ($1, $2, CURRENT_DATE, $3, 'transfer', $4, 'paid')`,
      [
        `Pago Resumen Tarjeta ${statement.card_name}`,
        amountInCents,
        defaultCategoryId,
        accountId,
      ]
    );

    await db.query('COMMIT');
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error al pagar resumen de tarjeta:', error);
    throw new Error('No se pudo procesar el pago del resumen.');
  } finally {
    db.release();
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/finances/cards');
  revalidatePath('/dashboard/finances/banks');
  revalidatePath('/dashboard/finances/expenses');
}

export async function createQuickExpense(formData: FormData) {
  'use server';

  const concept = formData.get('concept') as string;
  const categoryName = formData.get('categoryName') as string;
  const rawAmount = formData.get('amount');
  const accountId = (formData.get('accountId') as string) || null;
  const amount = rawAmount ? Number(rawAmount) : 0;

  if (!concept || amount <= 0) {
    throw new Error('El concepto y un monto válido son obligatorios.');
  }

  const amountInCents = Math.round(amount * 100);
  const db = await sql.connect();

  try {
    await db.query('BEGIN');

    // 1. Buscar ID de la categoría por coincidencia de nombre
    let categoryId = null;
    if (categoryName) {
      const catRes = await db.query(
        `SELECT id FROM expense_categories WHERE name ILIKE $1 LIMIT 1`,
        [`%${categoryName}%`]
      );
      categoryId = catRes.rows[0]?.id || null;
    }

    // Fallback de categoría si no coincide exactamente el nombre
    if (!categoryId) {
      const fallbackCat = await db.query(
        `SELECT id FROM expense_categories LIMIT 1`
      );
      categoryId = fallbackCat.rows[0]?.id || null;
    }

    // 2. Si se seleccionó cuenta bancaria, descontar el saldo en centavos
    if (accountId) {
      await db.query(
        `UPDATE bank_accounts 
         SET balance = balance - $1, updated_at = NOW() 
         WHERE id = $2 AND is_active = TRUE`,
        [amountInCents, accountId]
      );
    }

    // 3. Registrar el gasto con estado 'paid'
    await db.query(
      `INSERT INTO expenses (
        concept, 
        amount, 
        date, 
        category_id, 
        payment_method, 
        account_id, 
        status
      ) VALUES ($1, $2, CURRENT_DATE, $3, 'debit_card', $4, 'paid')`,
      [concept, amountInCents, categoryId, accountId]
    );

    await db.query('COMMIT');
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error al registrar gasto rápido:', error);
    throw new Error('No se pudo registrar el gasto rápido.');
  } finally {
    db.release();
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/finances/expenses');
  revalidatePath('/dashboard/finances/banks');
}


export async function transferBetweenAccounts(formData: FormData) {
  'use server';

  const fromAccountId = formData.get('from_account_id') as string;
  const toAccountId = formData.get('to_account_id') as string;
  const rawAmount = formData.get('amount');
  const notes = (formData.get('notes') as string) || null;
  const amount = rawAmount ? Number(rawAmount) : 0;

  if (!fromAccountId || !toAccountId || amount <= 0) {
    throw new Error('Selecciona origen, destino y un monto mayor a cero.');
  }

  if (fromAccountId === toAccountId) {
    throw new Error('La cuenta de origen y destino deben ser diferentes.');
  }

  const amountInCents = Math.round(amount * 100);
  const db = await sql.connect();

  try {
    await db.query('BEGIN');

    // 1. Obtener y verificar ambas cuentas (validación de moneda)
    const accountsRes = await db.query(
      `SELECT id, name, currency, balance 
       FROM bank_accounts 
       WHERE id IN ($1, $2) AND is_active = TRUE
       FOR UPDATE`,
      [fromAccountId, toAccountId]
    );

    if (accountsRes.rows.length !== 2) {
      throw new Error('Una o ambas cuentas no están disponibles o activas.');
    }

    const fromAcc = accountsRes.rows.find((r) => r.id === fromAccountId);
    const toAcc = accountsRes.rows.find((r) => r.id === toAccountId);

    if (!fromAcc || !toAcc) {
      throw new Error('No se pudieron verificar las cuentas.');
    }

    if (fromAcc.currency !== toAcc.currency) {
      throw new Error(
        `No se pueden realizar transferencias directas entre monedas distintas (${fromAcc.currency} a ${toAcc.currency}).`
      );
    }

    // 2. Debitar de la cuenta de origen
    await db.query(
      `UPDATE bank_accounts 
       SET balance = balance - $1, updated_at = NOW() 
       WHERE id = $2`,
      [amountInCents, fromAccountId]
    );

    // 3. Acreditar en la cuenta de destino
    await db.query(
      `UPDATE bank_accounts 
       SET balance = balance + $1, updated_at = NOW() 
       WHERE id = $2`,
      [amountInCents, toAccountId]
    );

    // 4. Registrar en el historial de transferencias
    await db.query(
      `INSERT INTO bank_transfers (from_account_id, to_account_id, amount, notes)
       VALUES ($1, $2, $3, $4)`,
      [fromAccountId, toAccountId, amountInCents, notes]
    );

    await db.query('COMMIT');
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error en transferencia entre cuentas:', error);
    throw new Error(
      error instanceof Error ? error.message : 'No se pudo completar la transferencia.'
    );
  } finally {
    db.release();
  }

  revalidatePath('/dashboard/finances/banks');
  revalidatePath('/dashboard');
}

export async function collectInvoice(invoiceId: string, accountId: string) {
  'use server';

  if (!invoiceId || !accountId) {
    throw new Error('Faltan parámetros para procesar el cobro de la factura.');
  }

  const db = await sql.connect();

  try {
    await db.query('BEGIN');

    // 1. Obtener datos de la factura con bloqueo de fila
    const invoiceRes = await db.query(
      `SELECT id, amount, currency, status 
       FROM invoices 
       WHERE id = $1 FOR UPDATE`,
      [invoiceId]
    );

    if (invoiceRes.rows.length === 0) {
      throw new Error('Factura no encontrada.');
    }

    const invoice = invoiceRes.rows[0];

    if (['paid', 'pagado', 'cobrado'].includes(invoice.status?.toLowerCase())) {
      throw new Error('Esta factura ya fue registrada como cobrada.');
    }

    const invoiceAmountInCents = Number(invoice.amount);
    const invoiceCurrency = (invoice.currency || 'ARS').toUpperCase();

    // 2. Obtener y verificar la cuenta bancaria destino
    const accountRes = await db.query(
      `SELECT id, name, currency, balance 
       FROM bank_accounts 
       WHERE id = $1 AND is_active = TRUE 
       FOR UPDATE`,
      [accountId]
    );

    if (accountRes.rows.length === 0) {
      throw new Error('Cuenta bancaria no encontrada o inactiva.');
    }

    const account = accountRes.rows[0];

    // Validación de moneda para evitar discrepancias cambiarias
    if (account.currency.toUpperCase() !== invoiceCurrency) {
      throw new Error(
        `Discrepancia de moneda: la factura está en ${invoiceCurrency} y la cuenta seleccionada es en ${account.currency}.`
      );
    }

    // 3. Acreditar saldo en la cuenta bancaria seleccionada
    await db.query(
      `UPDATE bank_accounts 
       SET balance = balance + $1, updated_at = NOW() 
       WHERE id = $2`,
      [invoiceAmountInCents, accountId]
    );

    // 4. Marcar la factura como cobrada y asociar la cuenta (sin updated_at)
    await db.query(
      `UPDATE invoices 
       SET status = 'paid', 
           account_id = $1, 
           paid_at = NOW() 
       WHERE id = $2`,
      [accountId, invoiceId]
    );

    await db.query('COMMIT');
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error al registrar cobro de factura:', error);
    throw new Error(
      error instanceof Error ? error.message : 'No se pudo procesar el cobro de la factura.'
    );
  } finally {
    db.release();
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/finances/invoices');
  revalidatePath('/dashboard/finances/banks');
}


