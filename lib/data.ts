import { sql } from '@vercel/postgres';
import { Card, Category, Client, ClientWithStats, Expense, ExpenseWithVendor, Invoice, InvoiceWithClient, Vendor } from './definitions'; // Asegúrate de tener estas importaciones

export async function fetchClients(): Promise<Client[]> {
  try {
    const data = await sql<Client>`
      SELECT
        id,
        name,
        email,
        brand,
        phone
      FROM clients
      ORDER BY name ASC
    `;
    return data.rows;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all clients.');
  }
}

export async function fetchClientById(id: string): Promise<Client | undefined> {
  try {
    const data = await sql<Client>`SELECT id, name, email, brand, phone FROM clients WHERE id = ${id}`;
    return data.rows[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch client.');
  }
}

export async function fetchNextInvoiceNumber(): Promise<number> {
    try {
        const result = await sql`SELECT MAX(invoice_number) as max FROM invoices;`;
        const nextNumber = (result.rows[0].max ?? 0) + 1;
        return nextNumber;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch next invoice number.');
    }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
  year: number,
  month: number,
  status: string
): Promise<InvoiceWithClient[]> {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const searchQuery = `%${query}%`;

  const today = new Date();
  const isCurrentMonthView = year === today.getFullYear() && month === today.getMonth() + 1;

  try {
    let data;

    if (isCurrentMonthView) {
      if (status) {
        // CASO 1: Mes actual, con filtro de estado
        data = await sql`
           SELECT
        invoices.id, invoices.amount, invoices.issue_date, invoices.due_date, invoices.currency,
        clients.name, clients.email, clients.brand, clients.phone,
        -- 👇 Aquí creamos el estado dinámicamente
        CASE
          WHEN invoices.status = 'pendiente' AND invoices.due_date < NOW() THEN 'vencido'
          ELSE invoices.status
        END as status
          FROM invoices
          JOIN clients ON invoices.client_id = clients.id
          WHERE 
            ((EXTRACT(YEAR FROM invoices.issue_date) = ${year} AND EXTRACT(MONTH FROM invoices.issue_date) = ${month}) OR invoices.status IN ('pendiente', 'vencido'))
            AND invoices.status ILIKE ${status}
            AND (clients.name ILIKE ${searchQuery} OR invoices.status ILIKE ${searchQuery})
          ORDER BY invoices.issue_date DESC LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}`;
      } else {
        // CASO 2: Mes actual, sin filtro de estado
        data = await sql`
          SELECT
            invoices.id, invoices.amount, invoices.issue_date, invoices.due_date, invoices.status, invoices.currency,
            clients.name, clients.email, clients.brand, clients.phone
          FROM invoices
          JOIN clients ON invoices.client_id = clients.id
          WHERE 
            ((EXTRACT(YEAR FROM invoices.issue_date) = ${year} AND EXTRACT(MONTH FROM invoices.issue_date) = ${month}) OR invoices.status IN ('pendiente', 'vencido'))
            AND (clients.name ILIKE ${searchQuery} OR invoices.status ILIKE ${searchQuery})
          ORDER BY invoices.issue_date DESC LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}`;
      }
    } else {
      if (status) {
        // CASO 3: Mes pasado, con filtro de estado
        data = await sql`
          SELECT
            invoices.id, invoices.amount, invoices.issue_date, invoices.due_date, invoices.status, invoices.currency,
            clients.name, clients.email, clients.brand, clients.phone
          FROM invoices
          JOIN clients ON invoices.client_id = clients.id
          WHERE 
            (EXTRACT(YEAR FROM invoices.issue_date) = ${year} AND EXTRACT(MONTH FROM invoices.issue_date) = ${month})
            AND invoices.status ILIKE ${status}
            AND (clients.name ILIKE ${searchQuery} OR invoices.status ILIKE ${searchQuery})
          ORDER BY invoices.issue_date DESC LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}`;
      } else {
        // CASO 4: Mes pasado, sin filtro de estado
        data = await sql`
          SELECT
            invoices.id, invoices.amount, invoices.issue_date, invoices.due_date, invoices.status, invoices.currency,
            clients.name, clients.email, clients.brand, clients.phone
          FROM invoices
          JOIN clients ON invoices.client_id = clients.id
          WHERE 
            (EXTRACT(YEAR FROM invoices.issue_date) = ${year} AND EXTRACT(MONTH FROM invoices.issue_date) = ${month})
            AND (clients.name ILIKE ${searchQuery} OR invoices.status ILIKE ${searchQuery})
          ORDER BY invoices.issue_date DESC LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}`;
      }
    }

    const invoices = data.rows.map(invoice => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(invoice.due_date);
        let finalStatus = invoice.status;
        if (invoice.status === 'pendiente' && dueDate < today) {
            finalStatus = 'vencido';
        }
        return {
            id: invoice.id, name: invoice.name, email: invoice.email, brand: invoice.brand,
            phone: invoice.phone, amount: invoice.amount / 100, issue_date: new Date(invoice.issue_date),
            due_date: dueDate, status: finalStatus, currency: invoice.currency,
        };
    });
    return invoices as InvoiceWithClient[];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}


export async function fetchInvoicesPages(
  query: string,
  year: number,
  month: number,
  status: string
) {
  const searchQuery = `%${query}%`;
  const today = new Date();
  const isCurrentMonthView = year === today.getFullYear() && month === today.getMonth() + 1;

  try {
    let count;

    if (isCurrentMonthView) {
      if (status) {
        // CASO 1: Mes actual, con filtro de estado
        count = await sql`
          SELECT COUNT(*) FROM invoices JOIN clients ON invoices.client_id = clients.id
          WHERE 
            ((EXTRACT(YEAR FROM invoices.issue_date) = ${year} AND EXTRACT(MONTH FROM invoices.issue_date) = ${month}) OR invoices.status IN ('pendiente', 'vencido'))
            AND invoices.status ILIKE ${status}
            AND (clients.name ILIKE ${searchQuery} OR clients.email ILIKE ${searchQuery} OR invoices.status ILIKE ${searchQuery})`;
      } else {
        // CASO 2: Mes actual, sin filtro de estado
        count = await sql`
          SELECT COUNT(*) FROM invoices JOIN clients ON invoices.client_id = clients.id
          WHERE 
            ((EXTRACT(YEAR FROM invoices.issue_date) = ${year} AND EXTRACT(MONTH FROM invoices.issue_date) = ${month}) OR invoices.status IN ('pendiente', 'vencido'))
            AND (clients.name ILIKE ${searchQuery} OR clients.email ILIKE ${searchQuery} OR invoices.status ILIKE ${searchQuery})`;
      }
    } else {
      if (status) {
        // CASO 3: Mes pasado, con filtro de estado
        count = await sql`
          SELECT COUNT(*) FROM invoices JOIN clients ON invoices.client_id = clients.id
          WHERE 
            (EXTRACT(YEAR FROM invoices.issue_date) = ${year} AND EXTRACT(MONTH FROM invoices.issue_date) = ${month})
            AND invoices.status ILIKE ${status}
            AND (clients.name ILIKE ${searchQuery} OR clients.email ILIKE ${searchQuery} OR invoices.status ILIKE ${searchQuery})`;
      } else {
        // CASO 4: Mes pasado, sin filtro de estado
        count = await sql`
          SELECT COUNT(*) FROM invoices JOIN clients ON invoices.client_id = clients.id
          WHERE 
            (EXTRACT(YEAR FROM invoices.issue_date) = ${year} AND EXTRACT(MONTH FROM invoices.issue_date) = ${month})
            AND (clients.name ILIKE ${searchQuery} OR clients.email ILIKE ${searchQuery} OR invoices.status ILIKE ${searchQuery})`;
      }
    }
    
    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    // 1. Hacemos un JOIN para obtener también los datos del cliente
    const invoiceData = await sql`
      SELECT
        invoices.*,
        clients.name,
        clients.email
      FROM invoices
      JOIN clients ON invoices.client_id = clients.id
      WHERE invoices.id = ${id};
    `;

    // Buscamos los ítems en paralelo
    const itemsData = await sql`SELECT * FROM line_items WHERE invoice_id = ${id}`;

    if (invoiceData.rows.length === 0) {
      return null;
    }

    const invoice = invoiceData.rows[0];
    const lineItems = itemsData.rows;

    // 2. Aplicamos la misma lógica para calcular el estado 'Vencido'
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(invoice.due_date);
    let finalStatus = invoice.status;
    if (invoice.status === 'Pendiente' && dueDate < today) {
      finalStatus = 'Vencido';
    }

    const processedLineItems = lineItems.map((item) => ({
      id: item.id,
      invoice_id: item.invoice_id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price / 100,
    }));

    // 3. Devolvemos el objeto completo con los datos del cliente y el estado corregido
    return {
      id: invoice.id,
      client_id: invoice.client_id,
      invoice_number: invoice.invoice_number,
      amount: invoice.amount / 100,
      currency: invoice.currency,
      discount: invoice.discount,
      status: finalStatus, // Usamos el estado calculado
      issue_date: new Date(invoice.issue_date),
      due_date: dueDate,
      line_items: processedLineItems,
      // Añadimos los datos del cliente para usarlos en la página
      client: {
        name: invoice.name,
        email: invoice.email,
      }
    };

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}


export async function fetchGlobalOverdueStats(): Promise<{ amount: number; count: number }> {
  try {
    const data = await sql`
      SELECT 
        COALESCE(SUM(amount), 0) as total_amount, 
        COUNT(*) as total_count 
      FROM invoices 
      WHERE 
        status = 'vencido' OR (status = 'pendiente' AND due_date < NOW())
    `;
    
    const stats = {
      amount: data.rows[0].total_amount / 100,
      count: Number(data.rows[0].total_count) || 0
    };

    return stats;
    
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch global overdue stats.');
  }
}


export async function fetchVendors(): Promise<Vendor[]> {
  try {
    const data = await sql<Vendor>`SELECT id, name FROM vendors ORDER BY name ASC`;
    return data.rows;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all vendors.');
  }
}



export async function fetchTotalExpenses(year: number, month: number) {
  try {
    const data = await sql`
      SELECT SUM(amount) FROM expenses
      WHERE EXTRACT(YEAR FROM expense_date) = ${year}
      AND EXTRACT(MONTH FROM expense_date) = ${month}
    `;
    return (data.rows[0].sum ?? 0) / 100;
  } catch (error) {
    console.error('Database Error:', error);
    return 0;
  }
}

// 👇 AÑADE ESTA FUNCIÓN (PARA EL FORMULARIO) 👇
export async function fetchExpenseCategories(): Promise<Category[]> {
  try {
    const data = await sql<Category>`
      SELECT id, name FROM expense_categories ORDER BY name ASC
    `;
    return data.rows;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch expense categories.');
  }
}


// En /lib/data.ts

export async function fetchExpenseById(id: string): Promise<Expense | undefined> {
  try {
    // No usamos <Expense> aquí para trabajar con el dato crudo de la DB
    const data = await sql`SELECT * FROM expenses WHERE id = ${id}`;

    if (data.rows.length === 0) {
      return undefined;
    }
    
    const expenseFromDb = data.rows[0];

    // Mapeamos explícitamente los nombres de columna (snake_case)
    // a los nombres de propiedad de nuestro tipo (camelCase).
    return {
      id: expenseFromDb.id,
      vendor_id: expenseFromDb.vendor_id,
      concept: expenseFromDb.concept,
      category_id: expenseFromDb.category_id,
      amount: expenseFromDb.amount / 100,
      currency: expenseFromDb.currency,
      status: expenseFromDb.status,
      transactionDate: new Date(expenseFromDb.transaction_date),
      payment_method: expenseFromDb.payment_method,
      card_id: expenseFromDb.card_id,
      total_installments: expenseFromDb.total_installments,
      current_installment: expenseFromDb.current_installment,
      is_recurring: expenseFromDb.is_recurring,
      recurrence_interval: expenseFromDb.recurrence_interval,
      parent_expense_id: expenseFromDb.parent_expense_id,
    };

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch expense.');
  }
}

export async function fetchCards(): Promise<Card[]> {
  try {
    const data = await sql<Card>`SELECT * FROM cards ORDER BY name ASC`;
    return data.rows;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch cards.');
  }
}





export async function fetchInvoiceStats(year: number, month: number) {
  try {
    const data = await sql`
      SELECT
        -- Contar y sumar TODAS las facturas del mes
        COUNT(*) AS total_count,
        SUM(amount) AS total_amount,
        -- Contar y sumar solo las PAGADAS
        COUNT(*) FILTER (WHERE status = 'facturado') AS facturado_count,
        SUM(amount) FILTER (WHERE status = 'facturado') AS facturado_amount,
        -- Contar y sumar solo las PENDIENTES
        COUNT(*) FILTER (WHERE status = 'pendiente') AS pendiente_count,
        SUM(amount) FILTER (WHERE status = 'pendiente') AS pendiente_amount,
        -- Contar y sumar solo las VENCIDAS
        COUNT(*) FILTER (WHERE status = 'vencido') AS vencido_count,
        SUM(amount) FILTER (WHERE status = 'vencido') AS vencido_amount
      FROM invoices
      WHERE 
        EXTRACT(YEAR FROM issue_date) = ${year} AND
        EXTRACT(MONTH FROM issue_date) = ${month}
    `;

    const stats = data.rows[0];

    // Convertimos de centavos a la unidad principal y manejamos valores nulos
    return {
      totalCount: Number(stats.total_count ?? 0),
      totalAmount: Number(stats.total_amount ?? 0) / 100,
      facturadoCount: Number(stats.facturado_count ?? 0),
      facturadoAmount: Number(stats.facturado_amount ?? 0) / 100,
      pendienteCount: Number(stats.pendiente_count ?? 0),
      pendienteAmount: Number(stats.pendiente_amount ?? 0) / 100,
      vencidoCount: Number(stats.vencido_count ?? 0),
      vencidoAmount: Number(stats.vencido_amount ?? 0) / 100,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice stats.');
  }
}



export async function fetchClientsWithStats(): Promise<ClientWithStats[]> {
  try {
    const data = await sql`
      SELECT
        clients.id,
        clients.name,
        clients.brand,
        clients.email,
        clients.phone,
        COUNT(invoices.id) AS total_invoices
      FROM clients
      LEFT JOIN invoices ON clients.id = invoices.client_id
      GROUP BY clients.id, clients.name, clients.brand, clients.email, clients.phone 
      ORDER BY clients.name ASC
    `;
    // Aseguramos que el conteo sea un número
    return data.rows.map(client => ({
      ...client,
      total_invoices: Number(client.total_invoices)
    })) as ClientWithStats[];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch clients with stats.');
  }
}





export async function fetchClientDetailsById(id: string) {
  try {
    // Buscamos los datos del cliente y sus facturas en paralelo
    const [clientData, invoicesData] = await Promise.all([
      sql<Client>`SELECT * FROM clients WHERE id = ${id}`,
      sql<Invoice>`
        SELECT * FROM invoices 
        WHERE client_id = ${id} 
        ORDER BY issue_date DESC
      `,
    ]);

    const client = clientData.rows[0];
    
    // Convertimos los montos de las facturas de centavos
    const invoices = invoicesData.rows.map(invoice => ({
      ...invoice,
      amount: invoice.amount / 100,
    }));

    return { client, invoices };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch client details.');
  }
}


export async function fetchExpenseStats(year: number, month: number) {
  // Definimos un tipo para los datos que necesitamos en esta función.
  type ExpenseForStats = {
    amount: number;
    is_recurring: boolean;
    status: string;
    expense_date: Date;
  };

  try {
    const [monthlyExpensesData, pastRecurringExpensesData] = await Promise.all([
      // 1. CORRECCIÓN: Obtenemos TODOS los gastos con fecha en este mes.
      sql<ExpenseForStats>`
        SELECT amount, is_recurring, status, expense_date
        FROM expenses
        WHERE EXTRACT(YEAR FROM expense_date) = ${year}
          AND EXTRACT(MONTH FROM expense_date) = ${month}
      `,
      // 2. CORRECCIÓN: Obtenemos los recurrentes que empezaron ANTES de este mes.
      sql<ExpenseForStats>`
        SELECT amount, is_recurring, status, expense_date
        FROM expenses
        WHERE is_recurring = true
          AND expense_date < MAKE_DATE(${year}, ${month}, 1)
      `
    ]);

    const monthlyExpenses = monthlyExpensesData.rows;
    const pastRecurringExpenses = pastRecurringExpensesData.rows;

    // Generamos las instancias "virtuales" solo para los recurrentes de meses pasados.
    const generatedRecurringForMonth = pastRecurringExpenses.map(expense => ({
      ...expense,
      // Forzamos el estado a 'pendiente' para las instancias futuras
      status: 'pendiente',
      expense_date: new Date(year, month - 1, new Date(expense.expense_date).getDate()),
    }));

    // Unimos los gastos que ocurrieron este mes con los recurrentes generados.
    const expensesForMonth = [...monthlyExpenses, ...generatedRecurringForMonth];
    
    // La lógica de .reduce() para calcular las estadísticas no cambia.
    const statsInCents = expensesForMonth.reduce((acc, expense) => {
      acc.totalAmount += expense.amount;
      acc.totalCount += 1;

      // Un gasto recurrente del mes actual también debe contar aquí
      if (expense.is_recurring) {
        acc.recurringAmount += expense.amount;
        acc.recurringCount += 1;
      }

      if (expense.status === 'pendiente') {
        acc.pendingAmount += expense.amount;
        acc.pendingCount += 1;
      }
      
      return acc;
    }, {
      totalAmount: 0, totalCount: 0,
      recurringAmount: 0, recurringCount: 0,
      pendingAmount: 0, pendingCount: 0,
    });

    // Convertimos los montos de centavos antes de devolver.
    return {
      totalAmount: statsInCents.totalAmount / 100,
      totalCount: statsInCents.totalCount,
      recurringAmount: statsInCents.recurringAmount / 100,
      recurringCount: statsInCents.recurringCount,
      pendingAmount: statsInCents.pendingAmount / 100,
      pendingCount: statsInCents.pendingCount,
    };

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch expense stats.');
  }
}

export async function fetchGlobalCardDebt() {
  try {
    const data = await sql`
      SELECT 
        COALESCE(SUM(amount), 0) AS total_amount,
        COUNT(*) AS total_count
      FROM expenses
      WHERE status = 'pendiente' 
      AND payment_method != 'Efectivo' 
      AND payment_method != 'Débito'
    `;
    return {
      amount: data.rows[0].total_amount / 100,
      count: Number(data.rows[0].total_count) || 0,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch global card debt.');
  }
}
// En lib/data.ts - Reemplazar completamente las funciones

const ITEMS_PER_PAGE_EXPENSES = 8;

// Esta función se llama desde el page.tsx antes de fetch
export async function ensureMonthlyRecurringExpenses(year: number, month: number) {
  try {
    await sql.query('SELECT generate_recurring_expenses_for_month($1, $2)', [year, month]);
    await sql.query('SELECT process_pending_recurring_occurrences()');
  } catch (error) {
    console.error('Error ensuring recurring expenses:', error);
  }
}

// Función auxiliar para formatear fechas (la misma que ya tienes en actions.ts)
function dateToDbString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Función CORREGIDA - Evita duplicación y respeta fechas
async function generateRecurringExpensesForMonth(year: number, month: number) {
  try {
    console.log(`🔄 [DEBUG] Generando recurrentes para: ${month}/${year}`);
    
    const currentDate = new Date();
    const targetDate = new Date(year, month - 1, 1);
    
    // 👇 NO generar para meses futuros (solo presente/pasado)
    if (targetDate > currentDate) {
      console.log(`⏭️ [DEBUG] Saltando mes futuro: ${month}/${year}`);
      return;
    }
    
    const endDate = new Date(year, month, 0);
    
    // 1. Buscar gastos recurrentes ACTIVOS para este mes
    const recurringExpenses = await sql`
      SELECT id, concept, amount, vendor_id, category_id, currency, 
             payment_method, transaction_date, recurrence_interval,
             recurrence_end_date
      FROM expenses 
      WHERE is_recurring = true 
        AND recurrence_interval = 'monthly'
        AND parent_expense_id IS NULL  -- 👈 SOLO los originales
    `;
    
    console.log(`📊 [DEBUG] Encontrados ${recurringExpenses.rows.length} recurrentes`);
    
    let generatedCount = 0;
    
    // 2. Para cada recurrente, verificar si DEBE generarse para este mes
    for (const expense of recurringExpenses.rows) {
      const originalDate = new Date(expense.transaction_date);
      const originalMonth = originalDate.getMonth() + 1;
      const originalYear = originalDate.getFullYear();
      
      // 👇 NO generar para el mes del gasto original
      if (year === originalYear && month === originalMonth) {
        console.log(`⏭️ [DEBUG] Saltando: ${expense.concept} - es el mes original`);
        continue;
      }
      
      // 👇 Verificar fecha de finalización
      if (expense.recurrence_end_date) {
        const endDateObj = new Date(expense.recurrence_end_date);
        if (targetDate > endDateObj) {
          console.log(`⏭️ [DEBUG] Saltando: ${expense.concept} - pasó fecha fin (${endDateObj.toISOString().split('T')[0]})`);
          continue;
        }
      }
      
      // 👇 Verificar que el mes objetivo sea POSTERIOR al original
      const originalDateTime = originalDate.getTime();
      const targetDateTime = targetDate.getTime();
      if (targetDateTime <= originalDateTime) {
        console.log(`⏭️ [DEBUG] Saltando: ${expense.concept} - mes anterior al original`);
        continue;
      }
      
      const dayOfMonth = Math.min(originalDate.getDate(), endDate.getDate());
      const occurrenceDate = new Date(year, month - 1, dayOfMonth);
      
      // 👇 VERIFICACIÓN MÁS ROBUSTA de si ya existe
      const exists = await sql`
        SELECT 1 FROM expenses 
        WHERE parent_expense_id = ${expense.id}
          AND EXTRACT(YEAR FROM expense_date) = ${year}
          AND EXTRACT(MONTH FROM expense_date) = ${month}
          AND concept = ${expense.concept}
      `;
      
      if (exists.rows.length === 0) {
        console.log(`✅ [DEBUG] Creando: ${expense.concept} para ${month}/${year}`);
        
        await sql`
          INSERT INTO expenses (
            transaction_date, expense_date, concept, category_id, 
            amount, currency, status, payment_method, parent_expense_id,
            total_installments, current_installment, is_recurring
          ) VALUES (
            ${dateToDbString(occurrenceDate)}, ${dateToDbString(occurrenceDate)},
            ${expense.concept}, ${expense.category_id}, 
            ${expense.amount}, ${expense.currency}, 'pendiente',
            ${expense.payment_method}, ${expense.id},
            1, 1, false
          )
        `;
        generatedCount++;
      } else {
        console.log(`⏭️ [DEBUG] Ya existe: ${expense.concept} para ${month}/${year}`);
      }
    }
    
    console.log(`🎯 [DEBUG] Generados ${generatedCount} gastos para ${month}/${year}`);
    
  } catch (error) {
    console.error('❌ [DEBUG] Error generando recurrentes:', error);
  }
}

export async function fetchExpensesPages(
  query: string,
  year: number,
  month: number,
  categoryId: string | null,
  status: string | null
) {
  const searchQuery = `%${query}%`;
  
  try {
    // Primero generar recurrentes para el mes
    await generateRecurringExpensesForMonth(year, month);
    
    // Luego contar normalmente
    let countData;

    if (categoryId && status) {
      countData = await sql`
        SELECT COUNT(*) FROM expenses
        LEFT JOIN vendors v ON expenses.vendor_id = v.id 
        LEFT JOIN expense_categories ec ON expenses.category_id = ec.id
        WHERE EXTRACT(YEAR FROM expenses.expense_date) = ${year} 
          AND EXTRACT(MONTH FROM expenses.expense_date) = ${month}
          AND expenses.category_id::text = ${categoryId} 
          AND expenses.status = ${status}
          AND (expenses.concept ILIKE ${searchQuery} OR v.name ILIKE ${searchQuery} OR ec.name ILIKE ${searchQuery})
      `;
    } else if (categoryId) {
      countData = await sql`
        SELECT COUNT(*) FROM expenses
        LEFT JOIN vendors v ON expenses.vendor_id = v.id 
        LEFT JOIN expense_categories ec ON expenses.category_id = ec.id
        WHERE EXTRACT(YEAR FROM expenses.expense_date) = ${year} 
          AND EXTRACT(MONTH FROM expenses.expense_date) = ${month}
          AND expenses.category_id::text = ${categoryId}
          AND (expenses.concept ILIKE ${searchQuery} OR v.name ILIKE ${searchQuery} OR ec.name ILIKE ${searchQuery})
      `;
    } else if (status) {
      countData = await sql`
        SELECT COUNT(*) FROM expenses
        LEFT JOIN vendors v ON expenses.vendor_id = v.id 
        LEFT JOIN expense_categories ec ON expenses.category_id = ec.id
        WHERE EXTRACT(YEAR FROM expenses.expense_date) = ${year} 
          AND EXTRACT(MONTH FROM expenses.expense_date) = ${month}
          AND expenses.status = ${status}
          AND (expenses.concept ILIKE ${searchQuery} OR v.name ILIKE ${searchQuery} OR ec.name ILIKE ${searchQuery})
      `;
    } else {
      countData = await sql`
        SELECT COUNT(*) FROM expenses
        LEFT JOIN vendors v ON expenses.vendor_id = v.id 
        LEFT JOIN expense_categories ec ON expenses.category_id = ec.id
        WHERE EXTRACT(YEAR FROM expenses.expense_date) = ${year} 
          AND EXTRACT(MONTH FROM expenses.expense_date) = ${month}
          AND (expenses.concept ILIKE ${searchQuery} OR v.name ILIKE ${searchQuery} OR ec.name ILIKE ${searchQuery})
      `;
    }

    return Math.ceil(Number(countData.rows[0].count) / ITEMS_PER_PAGE_EXPENSES);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of expenses.');
  }
}

export async function fetchFilteredExpenses(
  query: string,
  currentPage: number,
  year: number,
  month: number,
  categoryId: string | null,
  status: string | null
): Promise<ExpenseWithVendor[]> {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE_EXPENSES;
  const searchQuery = `%${query}%`;

  try {
    // Primero generar recurrentes para el mes
    await generateRecurringExpensesForMonth(year, month);
    
    // Luego buscar normalmente
    let data;
    
    if (categoryId && status) {
      data = await sql<ExpenseWithVendor>`
        SELECT expenses.id, expenses.concept, expenses.amount, expenses.currency, expenses.status, 
               expenses.expense_date, expenses.payment_method, expenses.total_installments, 
               expenses.current_installment, expenses.is_recurring, expenses.category_id,
               expenses.parent_expense_id, expenses.transaction_date,
               v.name as vendor_name, ec.name as category_name
        FROM expenses 
        LEFT JOIN vendors v ON expenses.vendor_id = v.id 
        LEFT JOIN expense_categories ec ON expenses.category_id = ec.id
        WHERE EXTRACT(YEAR FROM expenses.expense_date) = ${year} 
          AND EXTRACT(MONTH FROM expenses.expense_date) = ${month}
          AND expenses.category_id::text = ${categoryId} 
          AND expenses.status = ${status}
          AND (expenses.concept ILIKE ${searchQuery} OR v.name ILIKE ${searchQuery} OR ec.name ILIKE ${searchQuery})
        ORDER BY expenses.expense_date DESC 
        LIMIT ${ITEMS_PER_PAGE_EXPENSES} OFFSET ${offset}
      `;
    } else if (categoryId) {
      data = await sql<ExpenseWithVendor>`
        SELECT expenses.id, expenses.concept, expenses.amount, expenses.currency, expenses.status, 
               expenses.expense_date, expenses.payment_method, expenses.total_installments, 
               expenses.current_installment, expenses.is_recurring, expenses.category_id,
               expenses.parent_expense_id, expenses.transaction_date,
               v.name as vendor_name, ec.name as category_name
        FROM expenses 
        LEFT JOIN vendors v ON expenses.vendor_id = v.id 
        LEFT JOIN expense_categories ec ON expenses.category_id = ec.id
        WHERE EXTRACT(YEAR FROM expenses.expense_date) = ${year} 
          AND EXTRACT(MONTH FROM expenses.expense_date) = ${month}
          AND expenses.category_id::text = ${categoryId}
          AND (expenses.concept ILIKE ${searchQuery} OR v.name ILIKE ${searchQuery} OR ec.name ILIKE ${searchQuery})
        ORDER BY expenses.expense_date DESC 
        LIMIT ${ITEMS_PER_PAGE_EXPENSES} OFFSET ${offset}
      `;
    } else if (status) {
      data = await sql<ExpenseWithVendor>`
        SELECT expenses.id, expenses.concept, expenses.amount, expenses.currency, expenses.status, 
               expenses.expense_date, expenses.payment_method, expenses.total_installments, 
               expenses.current_installment, expenses.is_recurring, expenses.category_id,
               expenses.parent_expense_id, expenses.transaction_date,
               v.name as vendor_name, ec.name as category_name
        FROM expenses 
        LEFT JOIN vendors v ON expenses.vendor_id = v.id 
        LEFT JOIN expense_categories ec ON expenses.category_id = ec.id
        WHERE EXTRACT(YEAR FROM expenses.expense_date) = ${year} 
          AND EXTRACT(MONTH FROM expenses.expense_date) = ${month}
          AND expenses.status = ${status}
          AND (expenses.concept ILIKE ${searchQuery} OR v.name ILIKE ${searchQuery} OR ec.name ILIKE ${searchQuery})
        ORDER BY expenses.expense_date DESC 
        LIMIT ${ITEMS_PER_PAGE_EXPENSES} OFFSET ${offset}
      `;
    } else {
      data = await sql<ExpenseWithVendor>`
        SELECT expenses.id, expenses.concept, expenses.amount, expenses.currency, expenses.status, 
               expenses.expense_date, expenses.payment_method, expenses.total_installments, 
               expenses.current_installment, expenses.is_recurring, expenses.category_id,
               expenses.parent_expense_id, expenses.transaction_date,
               v.name as vendor_name, ec.name as category_name
        FROM expenses 
        LEFT JOIN vendors v ON expenses.vendor_id = v.id 
        LEFT JOIN expense_categories ec ON expenses.category_id = ec.id
        WHERE EXTRACT(YEAR FROM expenses.expense_date) = ${year} 
          AND EXTRACT(MONTH FROM expenses.expense_date) = ${month}
          AND (expenses.concept ILIKE ${searchQuery} OR v.name ILIKE ${searchQuery} OR ec.name ILIKE ${searchQuery})
        ORDER BY expenses.expense_date DESC 
        LIMIT ${ITEMS_PER_PAGE_EXPENSES} OFFSET ${offset}
      `;
    }

    console.log(`📋 Gastos encontrados en tabla: ${data.rows.length}`);
    
    return data.rows.map(row => ({ ...row, amount: row.amount / 100 })) as ExpenseWithVendor[];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch expenses.');
  }
}
/**
 * Calcula el monto total y la cantidad de gastos de tarjeta de crédito
 * que vencen en un mes y año específicos.
 */
export async function fetchCardPaymentsDueForMonth(year: number, month: number): Promise<{ amount: number; count: number }> {
  try {
    // La consulta ahora es directa, simple y eficiente.
    const data = await sql`
      SELECT 
        COALESCE(SUM(amount), 0) AS total_amount,
        COUNT(*) AS total_count
      FROM expenses
      WHERE 
        status = 'pendiente' 
        AND card_id IS NOT NULL
        AND EXTRACT(YEAR FROM expense_date) = ${year}
        AND EXTRACT(MONTH FROM expense_date) = ${month}
    `;

    return {
      amount: data.rows[0].total_amount / 100,
      count: Number(data.rows[0].total_count) || 0,
    };

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card payments due for the month.');
  }
}