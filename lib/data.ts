
import { sql } from '@vercel/postgres';
import { ChartData, Earning, MonthlyRevenueData, RecurringTransaction } from './definitions';
import { Expenses } from './definitions';










const ITEMS_PER_PAGE = 7; // Puedes ajustar este número

// FUNCIÓN MEJORADA: Ahora maneja búsqueda y paginación
export async function fetchFilteredEarnings(
  year: number,
  month: number,
  query: string,
  currentPage: number
): Promise<Earning[]> {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const data = await sql`
      SELECT * FROM earnings
      WHERE
        EXTRACT(YEAR FROM due_date) = ${year} AND
        EXTRACT(MONTH FROM due_date) = ${month} AND
        (client ILIKE ${`%${query}%`} OR concept ILIKE ${`%${query}%`})
      ORDER BY due_date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    // El mapeo de datos se mantiene igual
    const earnings = data.rows.map((row) => ({
      // ... (tu mapeo de datos aquí)
      id: row.id, concept: row.concept, client: row.client, status: row.status,
      amount: row.amount / 100, dueDate: new Date(row.due_date), currency: row.currency
    })) as Earning[];
    return earnings;

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch filtered earnings.');
  }
}

// NUEVA FUNCIÓN: Para contar el total de páginas
export async function fetchEarningsPages(year: number, month: number, query: string): Promise<number> {
  try {
    const count = await sql`
      SELECT COUNT(*)
      FROM earnings
      WHERE
        EXTRACT(YEAR FROM due_date) = ${year} AND
        EXTRACT(MONTH FROM due_date) = ${month} AND
        (client ILIKE ${`%${query}%`} OR concept ILIKE ${`%${query}%`})
    `;
    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of earnings pages.');
  }
}
















// MODIFICADA: Ahora acepta 'year' y 'month' opcionales para filtrar
export async function fetchExpenses(year?: number, month?: number): Promise<Expenses[]> {
  try {
    let query = `SELECT * FROM expenses`;
    if (year && month) {
      query += ` WHERE EXTRACT(YEAR FROM expense_date) = ${year} AND EXTRACT(MONTH FROM expense_date) = ${month}`;
    }
    query += ` ORDER BY created_at DESC`;

    const data = await sql.query(query);

    const expenses = data.rows.map((row) => ({
      id: row.id,
      concept: row.concept,
      category: row.category,
      amount: row.amount / 100,
      expenseDate: new Date(row.expense_date),
    })) as Expenses[]; 
    
    return expenses;

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch expenses.');
  }
}

export async function fetchTotalEarnings(year: number, month: number) {
  try {
    const data = await sql`
      SELECT SUM(amount) FROM earnings 
      WHERE status = 'Facturado'
      AND EXTRACT(YEAR FROM due_date) = ${year}
      AND EXTRACT(MONTH FROM due_date) = ${month}
    `;
    return (data.rows[0].sum ?? 0) / 100;
  } catch (error) {
    console.error('Database Error:', error);
    return 0;
  }
}





// MODIFICADA: Ahora requiere 'year' y 'month' para el cálculo
export async function fetchTotalExpenses(year: number, month: number) {
  try {
    const data = await sql`
      SELECT SUM(amount) FROM expenses
      WHERE EXTRACT(YEAR FROM expense_date) = ${year}
      AND EXTRACT(MONTH FROM expense_date) = ${month}
    `;
    const total = data.rows[0].sum ?? 0;
    return total / 100;
  } catch (error) {
    console.error('Database Error:', error);
    return 0;
  }
}

// SIN CAMBIOS: Esta función sigue siendo un total general
export async function fetchPendingEarnings() {
    try {
        const data = await sql`SELECT SUM(amount) FROM earnings WHERE status = 'Por cobrar'`;
        const total = data.rows[0].sum ?? 0;
        return total / 100;
    } catch (error) {
        console.error('Database Error:', error);
        return 0;
    }
}

// SIN CAMBIOS: El gráfico sigue mostrando el historial de los últimos meses
export async function fetchMonthlyRevenue(): Promise<MonthlyRevenueData[]> {
  try {
    const data = await sql`
      WITH monthly_data AS (
        SELECT 
          DATE_TRUNC('month', due_date) AS month,
          SUM(amount) AS total_earnings,
          0 AS total_expenses
        FROM earnings
        WHERE status = 'Facturado'
        GROUP BY month
        
        UNION ALL
        
        SELECT 
          DATE_TRUNC('month', expense_date) AS month,
          0 AS total_earnings,
          SUM(amount) AS total_expenses
        FROM expenses
        GROUP BY month
      )
      SELECT
        TO_CHAR(month, 'Mon') AS month,
        SUM(total_earnings) / 100 AS earnings,
        SUM(total_expenses) / 100 AS expenses
      FROM monthly_data
      WHERE month IS NOT NULL
      GROUP BY month
      ORDER BY month DESC
      LIMIT 6;
    `;
    
    return data.rows.reverse() as MonthlyRevenueData[]; // .reverse() para ordenar de más antiguo a más nuevo
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch monthly revenue.');
  }
}


export async function fetchForecastedEarnings(year: number, month: number) {
  try {
    const data = await sql`
      SELECT SUM(amount) FROM earnings
      WHERE (status = 'Facturado' OR status = 'Por cobrar')
      AND EXTRACT(YEAR FROM due_date) = ${year}
      AND EXTRACT(MONTH FROM due_date) = ${month}
    `;
    return (data.rows[0].sum ?? 0) / 100;
  } catch (error) {
    console.error('Database Error:', error);
    return 0;
  }
}



export async function fetchEarningById(id: string) {
  try {
    const data = await sql<Earning>`
      SELECT
        id,
        concept,
        client,
        amount,
        currency,
        status,
        due_date
      FROM earnings
      WHERE id = ${id};
    `;

    // Usamos .map() para procesar, igual que en el ejemplo de Vercel
    const earnings = data.rows.map((earning) => ({
      ...earning,
      amount: earning.amount / 100, // Convertimos de centavos a pesos
      dueDate: new Date(earning.dueDate), // Convertimos string a Date
    }));

    // Devolvemos el único elemento del array
    return earnings[0];
  } catch (error) {
    console.error('Database Error:', error);
    // Lanzamos el error para que Next.js lo capture
    throw new Error('Failed to fetch earning.');
  }
}
export async function fetchExpenseById(id: string): Promise<Expenses | undefined> {
  try {
    const data = await sql<Expenses>`
      SELECT
        id,
        concept,
        category,
        amount,
        expense_date AS "expenseDate"
      FROM expenses
      WHERE id = ${id};
    `;

    const expense = data.rows[0];
    // Convertimos el monto de centavos a pesos
    if (expense) {
      expense.amount = expense.amount / 100;
    }
    
    return expense;
  } catch (error) {
    console.error('Database Error:', error);
    // No usamos 'throw' aquí para poder manejar el error en la página
  }
}



export async function fetchRecurringTransactions(type: 'earning' | 'expense'): Promise<RecurringTransaction[]> {
  try {
    // Añadimos un WHERE para filtrar por el tipo que le pasemos
    const data = await sql`
      SELECT * FROM recurring_transactions 
      WHERE type = ${type} 
      ORDER BY created_at DESC
    `;
    
    // El resto de la función no cambia
    const transactions = data.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      type: row.type,
      concept: row.concept,
      category: row.category,
      client: row.client,
      amount: row.amount / 100,
      dayOfMonth: row.day_of_month,
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
    })) as RecurringTransaction[];

    return transactions;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to fetch recurring ${type}s.`);
  }
}









export async function fetchPendingRecurringTransactions(year: number, month: number) {
  try {
    // Esta consulta es la más compleja, pero muy potente.
    // Busca todas las plantillas recurrentes activas que NO tienen
    // una transacción correspondiente ya creada en el mes y año actuales.
    const data = await sql`
      SELECT rt.*
      FROM recurring_transactions rt
      LEFT JOIN (
        SELECT source_recurring_id FROM earnings
        WHERE EXTRACT(YEAR FROM due_date) = ${year} AND EXTRACT(MONTH FROM due_date) = ${month}
      ) e ON rt.id = e.source_recurring_id
      LEFT JOIN (
        SELECT source_recurring_id FROM expenses
        WHERE EXTRACT(YEAR FROM expense_date) = ${year} AND EXTRACT(MONTH FROM expense_date) = ${month}
      ) ex ON rt.id = ex.source_recurring_id
      WHERE rt.is_active = TRUE AND e.source_recurring_id IS NULL AND ex.source_recurring_id IS NULL;
    `;

    // Mapeamos los datos para que coincidan con nuestro tipo
    const transactions = data.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      type: row.type,
      concept: row.concept,
      category: row.category,
      client: row.client,
      currency: row.currency,
      amount: row.amount / 100,
      dayOfMonth: row.day_of_month,
      isActive: row.is_active,
    })) as RecurringTransaction[];

    return transactions;

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch pending recurring transactions.');
  }
}




export async function fetchEarningsByClient(year: number, month: number): Promise<ChartData[]> {
  try {
    const data = await sql`
      SELECT 
        client, 
        SUM(amount) / 100 as total
      FROM earnings
      WHERE status = 'Facturado'
      AND EXTRACT(YEAR FROM due_date) = ${year}
      AND EXTRACT(MONTH FROM due_date) = ${month}
      GROUP BY client
      ORDER BY total DESC;
    `;
    // Usamos una aserción de tipo para confirmar a TypeScript la forma de los datos
    return data.rows as ChartData[];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch earnings by client.');
  }
}


export async function fetchTotalRecurringEarnings() {
  try {
    const data = await sql`
      SELECT SUM(amount) FROM recurring_transactions 
      WHERE type = 'earning' AND is_active = TRUE
    `;
    const total = data.rows[0].sum ?? 0;
    return total / 100;
  } catch (error) {
    console.error('Database Error:', error);
    return 0;
  }
}

export async function fetchCurrencyBalance(currency: string) {
  try {
    const totalEarningsData = await sql`
      SELECT SUM(amount) FROM earnings WHERE currency = ${currency}
    `;
    const totalEarnings = totalEarningsData.rows[0].sum ?? 0;

    const totalExpensesData = await sql`
      SELECT SUM(amount) FROM expenses WHERE currency = ${currency}
    `;
    const totalExpenses = totalExpensesData.rows[0].sum ?? 0;

    const balanceInCents = totalEarnings - totalExpenses;
    return balanceInCents / 100;
  } catch (error) {
    console.error('Database Error:', error);
    return 0;
  }
}

