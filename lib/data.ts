import { sql } from '@vercel/postgres';
import { resolveUserId } from './auth-guard';
import { Card, Category, Client, ClientWithStats, Expense, ExpenseWithVendor, ExpenseTemplateWithDetails, Invoice, InvoiceWithClient, Vendor, DashboardPredictiveStatus, CardWithStatement, CalendarEvent } from './definitions';

const ITEMS_PER_PAGE = 6;
const ITEMS_PER_PAGE_EXPENSES = 5;

// --- INVOICE FUNCTIONS ---

export async function fetchClients(userId?: string): Promise<Client[]> {
  const uid = await resolveUserId(userId);
  try {
    const data = await sql<Client>`
      SELECT id, name, email, brand, phone, image_url FROM clients WHERE user_id = ${uid} ORDER BY name ASC
    `;
    return data.rows;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all clients.');
  }
}

export async function fetchClientById(id: string, userId?: string): Promise<Client | undefined> {
  const uid = await resolveUserId(userId);
  try {
    const data = await sql<Client>`SELECT id, name, email, brand, phone, image_url FROM clients WHERE id = ${id} AND user_id = ${uid}`;
    return data.rows[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch client.');
  }
}

export async function fetchNextInvoiceNumber(userId?: string): Promise<number> {
  const uid = await resolveUserId(userId);
  try {
    const result = await sql`SELECT MAX(invoice_number) as max FROM invoices WHERE user_id = ${uid};`;
    return (result.rows[0].max ?? 0) + 1;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch next invoice number.');
  }
}

export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
  year: number,
  month: number,
  status: string,
  userId?: string
): Promise<InvoiceWithClient[]> {
  const uid = await resolveUserId(userId);
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const searchQuery = `%${query}%`;

  try {
    const whereConditions = [
      `invoices.user_id = $1`,
      `EXTRACT(YEAR FROM invoices.issue_date) = $2`,
      `EXTRACT(MONTH FROM invoices.issue_date) = $3`,
      `(clients.name ILIKE $4 OR clients.email ILIKE $4 OR clients.brand ILIKE $4)`
    ];
    const params: unknown[] = [uid, year, month, searchQuery];

    // Filtro de estado contemplando vencimiento dinámico
    if (status) {
      if (status.toLowerCase() === 'vencido') {
        whereConditions.push(`(invoices.status = 'vencido' OR (invoices.status = 'pendiente' AND invoices.due_date < CURRENT_DATE))`);
      } else if (status.toLowerCase() === 'pendiente') {
        whereConditions.push(`(invoices.status = 'pendiente' AND invoices.due_date >= CURRENT_DATE)`);
      } else {
        params.push(status);
        whereConditions.push(`invoices.status ILIKE $${params.length}`);
      }
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const fullQuery = `
      SELECT
        invoices.id,
        invoices.amount,
        invoices.issue_date,
        invoices.due_date,
        invoices.currency,
        clients.name,
        clients.email,
        clients.brand,
        clients.phone,
        clients.image_url,
        CASE
          WHEN invoices.status = 'pendiente' AND invoices.due_date < CURRENT_DATE THEN 'vencido'
          ELSE invoices.status
        END AS status
      FROM invoices
      JOIN clients ON invoices.client_id = clients.id
      ${whereClause}
      ORDER BY invoices.issue_date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    const data = await sql.query(fullQuery, params);

    return data.rows.map((invoice) => ({
      id: invoice.id,
      name: invoice.name,
      email: invoice.email,
      brand: invoice.brand,
      phone: invoice.phone,
      image_url: invoice.image_url,
      amount: Number(invoice.amount) / 100,
      issue_date: new Date(invoice.issue_date),
      due_date: new Date(invoice.due_date),
      status: invoice.status,
      currency: invoice.currency,
    })) as InvoiceWithClient[];
  } catch (error) {
    console.error('Database Error in fetchFilteredInvoices:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(
  query: string,
  year: number,
  month: number,
  status: string,
  userId?: string
) {
  const uid = await resolveUserId(userId);
  const searchQuery = `%${query}%`;

  try {
    const whereConditions = [
      `invoices.user_id = $1`,
      `EXTRACT(YEAR FROM invoices.issue_date) = $2`,
      `EXTRACT(MONTH FROM invoices.issue_date) = $3`,
      `(clients.name ILIKE $4 OR clients.email ILIKE $4 OR clients.brand ILIKE $4)`
    ];
    const params: unknown[] = [uid, year, month, searchQuery];

    if (status) {
      if (status.toLowerCase() === 'vencido') {
        whereConditions.push(`(invoices.status = 'vencido' OR (invoices.status = 'pendiente' AND invoices.due_date < CURRENT_DATE))`);
      } else if (status.toLowerCase() === 'pendiente') {
        whereConditions.push(`(invoices.status = 'pendiente' AND invoices.due_date >= CURRENT_DATE)`);
      } else {
        params.push(status);
        whereConditions.push(`invoices.status ILIKE $${params.length}`);
      }
    }

    const countQuery = `
      SELECT COUNT(*) 
      FROM invoices 
      JOIN clients ON invoices.client_id = clients.id 
      WHERE ${whereConditions.join(' AND ')}
    `;

    const count = await sql.query(countQuery, params);
    return Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
  } catch (error) {
    console.error('Database Error in fetchInvoicesPages:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string, userId?: string) {
  const uid = await resolveUserId(userId);
  try {
    const invoiceData = await sql`
      SELECT invoices.*, clients.name, clients.email
      FROM invoices
      JOIN clients ON invoices.client_id = clients.id
      WHERE invoices.id = ${id} AND invoices.user_id = ${uid};
    `;
    const itemsData = await sql`
      SELECT li.* 
      FROM line_items li
      JOIN invoices inv ON li.invoice_id = inv.id
      WHERE li.invoice_id = ${id} AND inv.user_id = ${uid}
    `;

    if (invoiceData.rows.length === 0) return null;

    const invoice = invoiceData.rows[0];
    const lineItems = itemsData.rows;

    const dueDate = new Date(invoice.due_date);
    let finalStatus = invoice.status;
    if (['pendiente', 'Pendiente'].includes(invoice.status) && dueDate < new Date(new Date().setHours(0, 0, 0, 0))) {
      finalStatus = 'Vencido';
    }

    const processedLineItems = lineItems.map((item) => ({
      ...item,
      unit_price: item.unit_price / 100,
    }));

    return {
      id: invoice.id,
      client_id: invoice.client_id,
      invoice_number: invoice.invoice_number,
      amount: invoice.amount / 100,
      currency: invoice.currency,
      discount: invoice.discount,
      status: finalStatus,
      issue_date: new Date(invoice.issue_date),
      due_date: dueDate,
      line_items: processedLineItems,
      client: { name: invoice.name, email: invoice.email }
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchGlobalOverdueStats(userId?: string): Promise<{ amount: number; count: number }> {
  const uid = await resolveUserId(userId);
  try {
    const data = await sql`
        SELECT COALESCE(SUM(amount), 0) as total_amount, COUNT(*) as total_count 
        FROM invoices 
        WHERE status = 'vencido' OR (status = 'pendiente' AND due_date < NOW())
      `;
    return {
      amount: Number(data.rows[0].total_amount) / 100,
      count: Number(data.rows[0].total_count) || 0
    };
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

export async function fetchInvoiceStats(year: number, month: number, userId?: string) {
  const uid = await resolveUserId(userId);
  try {
    const data = await sql`
      SELECT
        COUNT(*) AS total_count,
        COALESCE(SUM(amount), 0) AS total_amount,
        
        -- Cobrado (facturado)
        COUNT(*) FILTER (WHERE status = 'facturado') AS facturado_count,
        COALESCE(SUM(amount) FILTER (WHERE status = 'facturado'), 0) AS facturado_amount,
        
        -- Pendiente dentro de término
        COUNT(*) FILTER (WHERE status = 'pendiente' AND due_date >= CURRENT_DATE) AS pendiente_count,
        COALESCE(SUM(amount) FILTER (WHERE status = 'pendiente' AND due_date >= CURRENT_DATE), 0) AS pendiente_amount,
        
        -- Vencido real (explícito o por fecha cumplida)
        COUNT(*) FILTER (WHERE status = 'vencido' OR (status = 'pendiente' AND due_date < CURRENT_DATE)) AS vencido_count,
        COALESCE(SUM(amount) FILTER (WHERE status = 'vencido' OR (status = 'pendiente' AND due_date < CURRENT_DATE)), 0) AS vencido_amount
      FROM invoices
      WHERE EXTRACT(YEAR FROM issue_date) = ${year} 
        AND EXTRACT(MONTH FROM issue_date) = ${month}
    `;

    const stats = data.rows[0];
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
    console.error('Database Error in fetchInvoiceStats:', error);
    throw new Error('Failed to fetch invoice stats.');
  }
}

export async function fetchClientsWithStats(userId?: string): Promise<ClientWithStats[]> {
  const uid = await resolveUserId(userId);
  try {
    const data = await sql`
        SELECT 
          clients.id, 
          clients.name, 
          clients.brand, 
          clients.email, 
          clients.phone, 
          clients.image_url,
          COUNT(invoices.id) AS total_invoices,
          COUNT(CASE WHEN invoices.status = 'vencido' OR (invoices.status = 'pendiente' AND invoices.due_date < CURRENT_DATE) THEN 1 END) AS overdue_invoices,
          COUNT(CASE WHEN invoices.status = 'pendiente' AND invoices.due_date >= CURRENT_DATE THEN 1 END) AS pending_invoices,
          COUNT(CASE WHEN invoices.status = 'facturado' THEN 1 END) AS paid_invoices,
          COALESCE(SUM(CASE WHEN invoices.status = 'facturado' THEN invoices.amount ELSE 0 END), 0) / 100.0 AS total_revenue,
          COALESCE(SUM(invoices.amount), 0) / 100.0 AS total_billed,
          COALESCE(SUM(CASE WHEN invoices.status = 'pendiente' AND invoices.due_date >= CURRENT_DATE THEN invoices.amount ELSE 0 END), 0) / 100.0 AS pending_amount,
          COALESCE(SUM(CASE WHEN invoices.status = 'vencido' OR (invoices.status = 'pendiente' AND invoices.due_date < CURRENT_DATE) THEN invoices.amount ELSE 0 END), 0) / 100.0 AS overdue_amount,
          MAX(invoices.issue_date) AS last_invoice_date
        FROM clients 
        LEFT JOIN invoices ON clients.id = invoices.client_id
        GROUP BY clients.id, clients.name, clients.brand, clients.email, clients.phone, clients.image_url
        ORDER BY clients.name ASC
      `;
    return data.rows.map(client => ({
      id: client.id,
      name: client.name,
      brand: client.brand || '',
      email: client.email || null,
      phone: client.phone || null,
      image_url: client.image_url || null,
      total_invoices: Number(client.total_invoices),
      overdue_invoices: Number(client.overdue_invoices),
      pending_invoices: Number(client.pending_invoices),
      paid_invoices: Number(client.paid_invoices || 0),
      total_revenue: Number(client.total_revenue),
      total_billed: Number(client.total_billed),
      pending_amount: Number(client.pending_amount),
      overdue_amount: Number(client.overdue_amount),
      last_invoice_date: client.last_invoice_date ? new Date(client.last_invoice_date) : null,
    })) as ClientWithStats[];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch clients with stats.');
  }
}

export async function fetchClientDetailsById(id: string, userId?: string) {
  const uid = await resolveUserId(userId);
  try {
    const [clientData, invoicesData] = await Promise.all([
      sql`
        SELECT 
          c.*,
          COUNT(i.id) as total_invoices,
          COUNT(CASE WHEN i.status = 'vencido' OR (i.status = 'pendiente' AND i.due_date < CURRENT_DATE) THEN 1 END) as overdue_invoices,
          COUNT(CASE WHEN i.status = 'pendiente' AND i.due_date >= CURRENT_DATE THEN 1 END) as pending_invoices,
          COUNT(CASE WHEN i.status = 'facturado' THEN 1 END) as paid_invoices,
          COALESCE(SUM(CASE WHEN i.status = 'facturado' THEN i.amount ELSE 0 END), 0) / 100.0 as total_revenue,
          COALESCE(SUM(i.amount), 0) / 100.0 as total_billed,
          COALESCE(SUM(CASE WHEN i.status = 'pendiente' AND i.due_date >= CURRENT_DATE THEN i.amount ELSE 0 END), 0) / 100.0 as pending_amount,
          COALESCE(SUM(CASE WHEN i.status = 'vencido' OR (i.status = 'pendiente' AND i.due_date < CURRENT_DATE) THEN i.amount ELSE 0 END), 0) / 100.0 as overdue_amount
        FROM clients c
        LEFT JOIN invoices i ON c.id = i.client_id
        WHERE c.id = ${id}
        GROUP BY c.id
      `,
      sql<Invoice>`
        SELECT 
          id,
          client_id,
          invoice_number,
          amount,
          currency,
          discount,
          CASE 
            WHEN status = 'pendiente' AND due_date < CURRENT_DATE THEN 'vencido'
            ELSE status 
          END as status,
          issue_date,
          due_date
        FROM invoices 
        WHERE client_id = ${id} 
        ORDER BY issue_date DESC
      `,
    ]);

    if (clientData.rows.length === 0) {
      return null;
    }

    const client = clientData.rows[0];
    const invoices = invoicesData.rows.map(invoice => ({
      ...invoice,
      amount: Number(invoice.amount) / 100.0,
      issue_date: new Date(invoice.issue_date),
      due_date: new Date(invoice.due_date)
    }));

    // Ensure types match ClientWithStats
    const clientWithStats: ClientWithStats = {
      id: client.id,
      name: client.name,
      email: client.email || null,
      phone: client.phone || null,
      brand: client.brand || '',
      image_url: client.image_url || null,
      total_invoices: Number(client.total_invoices),
      overdue_invoices: Number(client.overdue_invoices),
      pending_invoices: Number(client.pending_invoices),
      paid_invoices: Number(client.paid_invoices || 0),
      total_revenue: Number(client.total_revenue),
      total_billed: Number(client.total_billed),
      pending_amount: Number(client.pending_amount),
      overdue_amount: Number(client.overdue_amount),
    };

    return { client: clientWithStats, invoices };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch client details.');
  }
}

export async function fetchClientRevenueHistory(clientId: string, months: number = 12, userId?: string) {
  const uid = await resolveUserId(userId);
  try {
    const data = await sql`
      WITH months AS (
        SELECT generate_series(
          date_trunc('month', CURRENT_DATE) - (INTERVAL '1 month' * ${months - 1}),
          date_trunc('month', CURRENT_DATE),
          '1 month'::interval
        ) as month_start
      )
      SELECT 
        to_char(m.month_start, 'Mon') as name,
        COALESCE(SUM(i.amount), 0) / 100 as value
      FROM months m
      LEFT JOIN invoices i ON date_trunc('month', i.issue_date) = m.month_start 
        AND i.client_id = ${clientId} 
        AND i.status = 'facturado'
      GROUP BY m.month_start
      ORDER BY m.month_start ASC
    `;
    return data.rows.map(row => ({
      name: row.name,
      value: Number(row.value)
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch client revenue history.');
  }
}

export async function fetchClientCalendarEvents(clientId: string, userId?: string): Promise<CalendarEvent[]> {
  const uid = await resolveUserId(userId);
  try {
    const data = await sql<CalendarEvent>`
      SELECT 
        id,
        user_id,
        title,
        description,
        start_time,
        end_time,
        is_all_day,
        type,
        status,
        related_client_id,
        related_invoice_id,
        created_at
      FROM calendar_events
      WHERE related_client_id = ${clientId}
      ORDER BY start_time ASC
    `;

    return data.rows.map(row => ({
      ...row,
      start_time: new Date(row.start_time),
      end_time: new Date(row.end_time),
      created_at: new Date(row.created_at)
    }));
  } catch (error) {
    console.error('Database Error:', error);
    return [];
  }
}

export interface ClientsPortfolioMetrics {
  totalClients: number;
  activeClients: number;
  totalOverdueAmount: number;
  totalPendingAmount: number;
  totalBilledAmount: number;
  arpu: number; // Average Revenue Per Client (o Ticket Promedio)
  portfolioStatusDistribution: {
    name: string;
    value: number;
    count: number;
    color: string;
  }[];
  topClientsByRevenue: {
    id: string;
    name: string;
    brand: string;
    totalRevenue: number;
    pendingAmount: number;
    invoicesCount: number;
  }[];
}

export async function fetchClientsPortfolioMetrics(userId?: string): Promise<ClientsPortfolioMetrics> {
  const uid = await resolveUserId(userId);
  try {
    const clients = await fetchClientsWithStats(uid);

    const totalClients = clients.length;
    // Un cliente se considera activo si tiene facturas emitidas o actividad registrada
    const activeClients = clients.filter(c => c.total_invoices > 0).length;

    const totalOverdueAmount = clients.reduce((sum, c) => sum + (c.overdue_amount || 0), 0);
    const totalPendingAmount = clients.reduce((sum, c) => sum + (c.pending_amount || 0), 0);
    const totalBilledAmount = clients.reduce((sum, c) => sum + (c.total_billed || 0), 0);
    const totalRevenue = clients.reduce((sum, c) => sum + (c.total_revenue || 0), 0);

    // ARPU = Total cobrado / cantidad de clientes activos (o total clientes)
    const arpu = activeClients > 0 ? totalRevenue / activeClients : 0;

    // Clasificación del estado de salud de la cartera
    let upToDateCount = 0;
    let pendingCount = 0;
    let overdueCount = 0;

    clients.forEach(c => {
      if (c.overdue_invoices > 0 || c.overdue_amount > 0) {
        overdueCount++;
      } else if (c.pending_invoices > 0 || c.pending_amount > 0) {
        pendingCount++;
      } else {
        upToDateCount++;
      }
    });

    const portfolioStatusDistribution = [
      {
        name: "Al Día",
        value: totalClients > 0 ? Math.round((upToDateCount / totalClients) * 100) : 0,
        count: upToDateCount,
        color: "var(--chart-1)",
      },
      {
        name: "Pendiente",
        value: totalClients > 0 ? Math.round((pendingCount / totalClients) * 100) : 0,
        count: pendingCount,
        color: "var(--chart-2)",
      },
      {
        name: "En Mora",
        value: totalClients > 0 ? Math.round((overdueCount / totalClients) * 100) : 0,
        count: overdueCount,
        color: "var(--chart-3)",
      },
    ];

    // Top 5 Clientes por mayor facturación histórica
    const topClientsByRevenue = [...clients]
      .sort((a, b) => (b.total_billed || b.total_revenue) - (a.total_billed || a.total_revenue))
      .slice(0, 5)
      .map(c => ({
        id: c.id,
        name: c.name,
        brand: c.brand || '',
        totalRevenue: c.total_billed > 0 ? c.total_billed : c.total_revenue,
        pendingAmount: c.pending_amount + c.overdue_amount,
        invoicesCount: c.total_invoices,
      }));

    return {
      totalClients,
      activeClients,
      totalOverdueAmount,
      totalPendingAmount,
      totalBilledAmount,
      arpu,
      portfolioStatusDistribution,
      topClientsByRevenue,
    };
  } catch (error) {
    console.error('Database Error in fetchClientsPortfolioMetrics:', error);
    throw new Error('Failed to fetch clients portfolio metrics.');
  }
}

// --- INVOICES ANALYTICS ---

export async function fetchMonthlyIncomeHistory(months: number = 12, userId?: string) {
  const uid = await resolveUserId(userId);
  try {
    const data = await sql`
      WITH months AS (
        SELECT generate_series(
          date_trunc('month', CURRENT_DATE) - (INTERVAL '1 month' * ${months - 1}),
          date_trunc('month', CURRENT_DATE),
          '1 month'::interval
        ) as month_start
      )
      SELECT 
        to_char(m.month_start, 'Mon') as name,
        EXTRACT(MONTH FROM m.month_start) as month_num,
        COALESCE(SUM(i.amount), 0) / 100 as value
      FROM months m
      LEFT JOIN invoices i ON date_trunc('month', i.issue_date) = m.month_start AND i.status = 'facturado' AND i.user_id = 
      GROUP BY m.month_start
      ORDER BY m.month_start ASC
    `;
    return data.rows.map(row => ({
      ...row,
      value: Number(row.value)
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch income history.');
  }
}

export async function fetchTopClients(year: number, month: number, limit: number = 5, userId?: string) {
  const uid = await resolveUserId(userId);
  try {
    const data = await sql`
      SELECT 
        c.name,
        COALESCE(SUM(i.amount), 0) / 100 as value
      FROM invoices i
      JOIN clients c ON i.client_id = c.id
      WHERE EXTRACT(YEAR FROM i.issue_date) = ${year}
        AND EXTRACT(MONTH FROM i.issue_date) = ${month}
        AND i.status = 'facturado'
      GROUP BY c.name
      ORDER BY value DESC
      LIMIT ${limit}
    `;
    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch top clients.');
  }
}

// Fetches the most recent invoices (Created/Issued) regardless of status
export async function fetchLastIssuedInvoices(limit: number = 5, userId?: string) {
  const uid = await resolveUserId(userId);
  try {
    const data = await sql`
      SELECT 
        i.id,
        c.name as client_name,
        c.image_url,
        i.amount / 100 as amount,
        i.issue_date,
        i.status
      FROM invoices i
      JOIN clients c ON i.client_id = c.id
      ORDER BY i.issue_date DESC
      LIMIT ${limit}
    `;
    return data.rows.map(row => ({
      id: row.id,
      client_name: row.client_name,
      image_url: row.image_url,
      status: row.status,
      amount: Number(row.amount),
      issue_date: new Date(row.issue_date)
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch last issued invoices');
  }
}

// --- EXPENSE FUNCTIONS (NEW SCHEMA) ---

export async function fetchExpenseCategories(): Promise<Category[]> {
  try {
    const data = await sql<Category>`SELECT id, name FROM expense_categories ORDER BY name ASC`;
    return data.rows;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch expense categories.');
  }
}

export async function fetchExpenseById(id: string, userId?: string): Promise<Expense | undefined> {
  const uid = await resolveUserId(userId);
  try {
    const data = await sql`SELECT * FROM expenses WHERE id =  AND user_id = ${id}`;

    if (data.rows.length === 0) return undefined;

    const expenseFromDb = data.rows[0];

    return {
      id: expenseFromDb.id,
      vendor_id: expenseFromDb.vendor_id,
      concept: expenseFromDb.concept,
      category_id: expenseFromDb.category_id,
      amount: expenseFromDb.amount / 100,
      currency: expenseFromDb.currency,
      status: expenseFromDb.status,
      date: new Date(expenseFromDb.date),
      payment_method: expenseFromDb.payment_method,
      card_id: expenseFromDb.card_id,
      template_id: expenseFromDb.template_id,
      description: expenseFromDb.description,
      entity_type: expenseFromDb.entity_type || 'personal',
      period: expenseFromDb.period,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch expense.');
  }
}
export async function fetchCards(userId?: string): Promise<Card[]> {
  const uid = await resolveUserId(userId);
  try {
    const data = await sql<Card>`SELECT * FROM cards WHERE user_id =  ORDER BY name ASC`;
    return data.rows;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch cards.');
  }
}

export async function fetchExpenseStats(year: number, month: number, userId?: string) {
  const uid = await resolveUserId(userId);
  try {
    const period = `${year}-${String(month).padStart(2, '0')}`;

    // Consulta atómica: separa fijos, variables, estado y naturaleza (personal vs negocio)
    const data = await sql`
      SELECT 
        COALESCE(SUM(amount), 0) AS total_amount,
        COUNT(*) AS total_count,
        COALESCE(SUM(CASE WHEN template_id IS NOT NULL THEN amount ELSE 0 END), 0) AS recurring_amount,
        COALESCE(SUM(CASE WHEN template_id IS NULL THEN amount ELSE 0 END), 0) AS variable_amount,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) AS pending_amount,
        COALESCE(SUM(CASE WHEN entity_type = 'business' THEN amount ELSE 0 END), 0) AS business_amount,
        COALESCE(SUM(CASE WHEN entity_type = 'personal' THEN amount ELSE 0 END), 0) AS personal_amount,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending_count
      FROM expenses
      WHERE period = ${period} 
         OR (period IS NULL AND EXTRACT(YEAR FROM date) = ${year} AND EXTRACT(MONTH FROM date) = ${month})
    `;

    const stats = data.rows[0];

    return {
      totalAmount: Number(stats.total_amount) / 100,
      totalCount: Number(stats.total_count),
      recurringAmount: Number(stats.recurring_amount) / 100,
      variableAmount: Number(stats.variable_amount) / 100,
      pendingAmount: Number(stats.pending_amount) / 100,
      businessAmount: Number(stats.business_amount) / 100,
      personalAmount: Number(stats.personal_amount) / 100,
      pendingCount: Number(stats.pending_count),
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch expense stats.');
  }
}

export async function fetchExpenseCategoryStats(year: number, month: number, userId?: string) {
  const uid = await resolveUserId(userId);
  try {
    const period = `${year}-${String(month).padStart(2, '0')}`;

    // Ya no hace falta el UNION con expense_installments
    const data = await sql`
      SELECT 
        COALESCE(ec.name, 'Sin Categoría') AS name, 
        COALESCE(SUM(e.amount), 0) AS total_amount
      FROM expenses e
      LEFT JOIN expense_categories ec ON e.category_id = ec.id
      WHERE e.period = ${period} 
         OR (e.period IS NULL AND EXTRACT(YEAR FROM e.date) = ${year} AND EXTRACT(MONTH FROM e.date) = ${month})
      GROUP BY ec.name
      ORDER BY total_amount DESC
    `;

    return data.rows.map(row => ({
      name: row.name,
      value: Number(row.total_amount) / 100,
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch category stats.');
  }
}

export async function fetchMonthlyExpenseHistory(months: number = 6, userId?: string) {
  const uid = await resolveUserId(userId);
  try {
    // Genera la serie temporal consultando únicamente la tabla expenses
    const data = await sql`
      WITH months AS (
        SELECT generate_series(
          date_trunc('month', CURRENT_DATE) - (INTERVAL '1 month' * ${months - 1}),
          date_trunc('month', CURRENT_DATE),
          '1 month'::interval
        ) AS month_start
      ),
      monthly_totals AS (
        SELECT 
          date_trunc('month', date) AS month_start,
          SUM(amount) AS amount
        FROM expenses
        WHERE date >= date_trunc('month', CURRENT_DATE) - (INTERVAL '1 month' * ${months - 1})
        GROUP BY 1
      )
      SELECT 
        to_char(m.month_start, 'Mon') AS name,
        EXTRACT(MONTH FROM m.month_start) AS month_num,
        COALESCE(mt.amount, 0) / 100 AS value
      FROM months m
      LEFT JOIN monthly_totals mt ON m.month_start = mt.month_start
      ORDER BY m.month_start ASC
    `;

    return data.rows.map(row => ({
      ...row,
      value: Number(row.value),
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch expense history.');
  }
}

export async function fetchOverdueInvoices(limit: number = 6, userId?: string) {
  const uid = await resolveUserId(userId);
  try {
    const data = await sql`
      SELECT 
        i.id,
        c.name as client_name,
        c.image_url,
        i.amount / 100 as amount,
        i.due_date,
        i.issue_date,
        i.status
      FROM invoices i
      JOIN clients c ON i.client_id = c.id
      WHERE i.user_id =  AND ((i.status = 'vencido') OR (i.status = 'pendiente' AND i.due_date < NOW()))
      ORDER BY i.due_date ASC
      LIMIT ${limit}
    `;
    return data.rows.map(row => ({
      id: row.id,
      client_name: row.client_name,
      image_url: row.image_url,
      amount: Number(row.amount),
      due_date: new Date(row.due_date),
      issue_date: new Date(row.issue_date),
      status: row.status
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch overdue invoices');
  }
}

export async function fetchExpensesPages(
  query: string,
  year: number,
  month: number,
  categoryId: string | null,
  status: string | null,
  cardId: string | null = null,
  userId?: string
) {
  const uid = await resolveUserId(userId);
  const searchQuery = `%${query}%`;
  try {
    let whereClause = `
        WHERE EXTRACT(YEAR FROM expenses.date) = $1 
          AND EXTRACT(MONTH FROM expenses.date) = $2
          AND (expenses.concept ILIKE $3 OR v.name ILIKE $3 OR ec.name ILIKE $3)
      `;
    const queryParams: unknown[] = [year, month, searchQuery, uid];

    if (categoryId && categoryId !== 'all') {
      queryParams.push(categoryId);
      whereClause += ` AND expenses.category_id = $${queryParams.length}`;
    }
    if (status && status !== 'all') {
      if (status === 'overdue') {
        whereClause += ` AND expenses.status = 'pending' AND expenses.date < CURRENT_DATE`;
      } else {
        queryParams.push(status);
        whereClause += ` AND expenses.status = $${queryParams.length}`;
      }
    }
    if (cardId && cardId !== 'all') {
      queryParams.push(cardId);
      whereClause += ` AND expenses.card_id = $${queryParams.length}`;
    }

    const countData = await sql.query(`
        SELECT COUNT(*) FROM expenses
        LEFT JOIN vendors v ON expenses.vendor_id = v.id 
        LEFT JOIN expense_categories ec ON expenses.category_id = ec.id
        ${whereClause}
      `, queryParams);

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
  status: string | null,
  cardId: string | null = null
): Promise<ExpenseWithVendor[]> {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE_EXPENSES;
  const searchQuery = `%${query}%`;

  try {
    const queryParams: unknown[] = [year, month, searchQuery];
    const whereConditions = [
      `EXTRACT(YEAR FROM expenses.date) = $1`,
      `EXTRACT(MONTH FROM expenses.date) = $2`,
      `(expenses.concept ILIKE $3 OR v.name ILIKE $3 OR ec.name ILIKE $3)`,
      `expenses.payment_method != 'credit_card'`
    ];

    if (categoryId && categoryId !== 'all') {
      queryParams.push(categoryId);
      whereConditions.push(`expenses.category_id = $${queryParams.length}`);
    }

    if (status && status !== 'all') {
      if (status === 'overdue') {
        whereConditions.push(`expenses.status = 'pending' AND expenses.date < CURRENT_DATE`);
      } else {
        queryParams.push(status);
        whereConditions.push(`expenses.status = $${queryParams.length}`);
      }
    }

    if (cardId && cardId !== 'all') {
      queryParams.push(cardId);
      whereConditions.push(`expenses.card_id = $${queryParams.length}`);
    }

    const whereClause = 'WHERE ' + whereConditions.join(' AND ');

    let queryStr = `
        SELECT
          expenses.id::text AS id,
          expenses.concept,
          expenses.amount,
          expenses.currency,
          CASE 
            WHEN expenses.status = 'pending' AND expenses.date < CURRENT_DATE THEN 'overdue'
            ELSE expenses.status::text 
          END AS status,
          expenses.date,
          expenses.payment_method::text AS payment_method,
          expenses.category_id,
          expenses.vendor_id,
          expenses.template_id,
          expenses.description,
          v.name AS vendor_name,
          ec.name AS category_name,
          (SELECT COUNT(*) FROM expense_installments WHERE expense_id = expenses.id) as total_installments
        FROM expenses
        LEFT JOIN vendors v ON expenses.vendor_id = v.id
        LEFT JOIN expense_categories ec ON expenses.category_id = ec.id
        ${whereClause}
    `;

    // AGREGAR UNION PARA RESÚMENES O DETALLE DE TARJETA
    if (cardId && cardId !== 'all') {
      // CASE A: DRILL-DOWN (Detail View) - Individual INSTALLMENTS

      // Filter logic for installments needs to match the params
      // Since specific Installments have 'pending' status, we check due_date for overdue
      let installWhere = `
          WHERE e.card_id = $${queryParams.length} 
            AND EXTRACT(YEAR FROM ei.due_date) = $1
            AND EXTRACT(MONTH FROM ei.due_date) = $2
            AND (e.concept ILIKE $3 OR v.name ILIKE $3 OR ec.name ILIKE $3)
      `;

      if (status && status !== 'all') {
        if (status === 'overdue') {
          installWhere += ` AND ei.status = 'pending' AND ei.due_date < CURRENT_DATE`;
        } else {
          // We need to use the param index for status if it was added
          // But queryParams order matters. Status was added before cardId if present.
          // However, for this UNION query, we might need to be careful with param indices.
          // Actually, queryParams layout: [year, month, search, (cat?), (status?), (cardId?)]
          // We are reusing queryParams.
          // If status is present, it is at index 4 or 5.
          // Let's rely on value injection or finding the index.
          // Easier: Reconstruct logic or use named params (not supported directly).
          // Safe bet: duplicate logic using queryParams array length or known indices.
          // But since I'm appending to queryStr, keeping `queryParams` consistent is key.
          // Status corresponds to the param added in main block.
          // If status != 'overdue', it was pushed.
          // We need to find its index.
          const statusIndex = queryParams.indexOf(status);
          if (statusIndex !== -1) {
            installWhere += ` AND ei.status = $${statusIndex + 1}`;
          }
        }
      }

      const detailQuery = `
         UNION ALL
         SELECT
           (e.id::text || '_inst_' || ei.installment_number) AS id,
           (e.concept || ' (Cuota ' || ei.installment_number || '/' || ei.total_installments || ')') AS concept,
           CAST(ei.amount AS INTEGER) AS amount,
           e.currency::text AS currency,
           CASE 
             WHEN ei.status = 'pending' AND ei.due_date < CURRENT_DATE THEN 'overdue'
             ELSE ei.status::text 
           END AS status,
           ei.due_date::timestamp AS date,
           'credit_card'::text AS payment_method,
           e.category_id AS category_id,
           e.vendor_id AS vendor_id,
           e.template_id AS template_id,
           'Cuota de tarjeta' AS description,
           v.name AS vendor_name,
           ec.name AS category_name,
           ei.total_installments
         FROM expense_installments ei
         JOIN expenses e ON ei.expense_id = e.id
         LEFT JOIN vendors v ON e.vendor_id = v.id 
         LEFT JOIN expense_categories ec ON e.category_id = ec.id
         ${installWhere}
       `;

      queryStr += detailQuery;

    } else {
      // CASE B: GENERAL VIEW (Summaries) - One row per Card

      const summaryQuery = `
         UNION ALL
         SELECT
           ('card_summary_' || c.id) AS id,
           ('Resumen ' || c.name) AS concept,
           CAST(SUM(ei.amount) AS INTEGER) AS amount,
           'ARS'::text AS currency,
           'pending'::text AS status,
           MAKE_DATE($1::int, $2::int, c.due_day)::timestamp AS date,
           'credit_card'::text AS payment_method,
           '00000000-0000-0000-0000-000000000000'::uuid AS category_id,
           NULL::uuid AS vendor_id,
           NULL::uuid AS template_id,
           'Resumen mensual de tarjeta' AS description,
           c.name AS vendor_name,
           'Tarjetas' AS category_name,
           COUNT(*) AS total_installments
         FROM expense_installments ei
         JOIN expenses e ON ei.expense_id = e.id
         JOIN cards c ON e.card_id = c.id
         WHERE EXTRACT(YEAR FROM ei.due_date) = $1
           AND EXTRACT(MONTH FROM ei.due_date) = $2
           AND ei.status = 'pending'
           AND (c.name ILIKE $3 OR 'Resumen' ILIKE $3)
         GROUP BY c.id, c.name, c.due_day
       `;

      queryStr += summaryQuery;
    }

    queryStr += ` ORDER BY date DESC LIMIT ${ITEMS_PER_PAGE_EXPENSES} OFFSET ${offset}`;

    // Note: Parameter index management for limit/offset in dynamic query with union is tricky.
    // However, since we embed limit/offset directly in string above, we don't push them to params.
    // But wait, the original code pushed them.
    // "LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}"
    // I replaced it with template literal values for simplicity in this complex update, 
    // assuming ITEMS_PER_PAGE is constant and offset is safe number.
    // Ideally use params but let's stick to safe injection for integers.

    const data = await sql.query(queryStr, queryParams);

    return data.rows.map(expense => ({
      ...expense,
      amount: expense.amount / 100,
      date: new Date(expense.date),
      total_installments: Number(expense.total_installments),
    })) as ExpenseWithVendor[];

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch expenses.');
  }
}

export async function fetchCardPaymentsDueForMonth(year: number, month: number, userId?: string) {
  const uid = await resolveUserId(userId);
  try {
    const data = await sql`
SELECT
COUNT(*) as total_count,
  COALESCE(SUM(amount), 0) as total_amount
      FROM expense_installments
      WHERE EXTRACT(YEAR FROM due_date) = ${year}
        AND EXTRACT(MONTH FROM due_date) = ${month}
        AND status = 'pending'
  `;

    const stats = data.rows[0];
    return {
      count: Number(stats.total_count),
      amount: Number(stats.total_amount) / 100,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card payments due for month.');
  }
}

export async function fetchPendingRecurringExpensesCount(userId?: string): Promise<number> {
  const uid = await resolveUserId(userId);
  try {
    const data = await sql`
      SELECT COUNT(*) as count 
      FROM expense_templates 
      WHERE next_due_date <= NOW() AND active = TRUE
  `;
    return Number(data.rows[0].count);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch pending recurring expenses count.');
  }
}

export async function fetchDashboardData(userId?: string) {
  const uid = await resolveUserId(userId);
  const db = await sql.connect();
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  try {
    // --- 1. Liquidez Real en Bancos y Billeteras (ARS y USD) ---
    const bankLiquidityResult = await db.query(`
      SELECT 
        COALESCE(SUM(balance) FILTER (WHERE currency = 'ARS'), 0) as total_ars,
        COALESCE(SUM(balance) FILTER (WHERE currency = 'USD'), 0) as total_usd
      FROM bank_accounts
      WHERE is_active = TRUE
    `);
    const totalBankARS = Number(bankLiquidityResult.rows[0].total_ars || 0) / 100;
    const totalBankUSD = Number(bankLiquidityResult.rows[0].total_usd || 0) / 100;

    // --- 2. Compromisos Inmediatos de Tarjetas (Pasivo Pendiente en ARS) ---
    const pendingStatementsResult = await db.query(`
      SELECT COALESCE(SUM(total_amount - COALESCE(paid_amount, 0)), 0) as total 
      FROM card_statements 
      WHERE status IN ('pending', 'partially_paid')
    `);
    const pendingCardDebt = Number(pendingStatementsResult.rows[0].total || 0) / 100;

    // --- 3. Flujo Operativo del Mes en Curso (KPIs del Período) ---
    const incomeResult = await db.query(
      `SELECT COALESCE(SUM(amount), 0) as total 
       FROM invoices 
       WHERE status IN ('paid', 'pagado', 'cobrado', 'facturado') 
         AND EXTRACT(MONTH FROM issue_date) = $1 
         AND EXTRACT(YEAR FROM issue_date) = $2`,
      [currentMonth, currentYear]
    );
    const income = Number(incomeResult.rows[0].total || 0) / 100;

    const paidExpensesResult = await db.query(
      `SELECT COALESCE(SUM(amount), 0) as total 
       FROM expenses 
       WHERE payment_method != 'credit_card'
         AND status = 'paid'
         AND EXTRACT(MONTH FROM date) = $1 
         AND EXTRACT(YEAR FROM date) = $2`,
      [currentMonth, currentYear]
    );
    const paidExpenses = Number(paidExpensesResult.rows[0].total || 0) / 100;

    const expensesTotal = paidExpenses + pendingCardDebt;

    // --- 4. Gasto Promedio Mensual (Burn Rate) - Últimos 6 meses ---
    const burnRateResult = await db.query(`
      WITH monthly_stats AS (
        SELECT 
          date_trunc('month', date) as m, 
          SUM(amount) as total
        FROM expenses
        WHERE status = 'paid'
          AND payment_method != 'credit_card'
          AND date >= date_trunc('month', CURRENT_DATE) - INTERVAL '6 months'
        GROUP BY 1
      )
      SELECT COALESCE(AVG(total), 0) as avg_expense FROM monthly_stats
    `);
    const burnRate = Number(burnRateResult.rows[0].avg_expense || 0) / 100;

    // --- 5. Cálculo Final de Runway y Dinero Disponible Real ---
    const safeToSpend = totalBankARS - pendingCardDebt;
    const runwayMonths = burnRate > 0 && safeToSpend > 0 ? safeToSpend / burnRate : 0;

    // --- 6. Insights Predictivos (Próximos eventos) ---

    // A. Próximo Vencimiento de Resumen de Tarjeta
    let expenseStatus = null;
    const nextCardPayment = await db.query(`
      SELECT cs.id as statement_id, cs.due_date, (cs.total_amount - COALESCE(cs.paid_amount, 0)) as remaining_amount, cs.card_id, c.name as card_name
      FROM card_statements cs
      JOIN cards c ON cs.card_id = c.id
      WHERE cs.status IN ('pending', 'partially_paid') AND cs.due_date >= CURRENT_DATE
      ORDER BY cs.due_date ASC
      LIMIT 1
    `);

    if (nextCardPayment.rows.length > 0) {
      const row = nextCardPayment.rows[0];
      expenseStatus = {
        type: 'card',
        statementId: row.statement_id,
        cardName: row.card_name,
        cardId: row.card_id,
        date: new Date(row.due_date),
        amount: Number(row.remaining_amount) / 100,
        label: `Resumen Tarjeta ${row.card_name}`,
      };
    } else {
      const nextRecurring = await db.query(`
        SELECT next_due_date, amount, concept
        FROM expense_templates
        WHERE next_due_date >= CURRENT_DATE AND active = TRUE
        ORDER BY next_due_date ASC
        LIMIT 1
      `);
      if (nextRecurring.rows.length > 0) {
        expenseStatus = {
          type: 'recurring',
          date: new Date(nextRecurring.rows[0].next_due_date),
          amount: Number(nextRecurring.rows[0].amount) / 100,
          label: nextRecurring.rows[0].concept,
        };
      }
    }

    // B. Próximo Cobro de Factura (Incluye id y currency para el modal de cobro)
    let invoiceStatus = null;
    const nextInvoiceDue = await db.query(`
      SELECT invoices.id, invoices.due_date, invoices.amount, invoices.currency, clients.name
      FROM invoices
      JOIN clients ON invoices.client_id = clients.id
      WHERE invoices.status IN ('pendiente', 'pending')
      ORDER BY invoices.due_date ASC
      LIMIT 1
    `);

    if (nextInvoiceDue.rows.length > 0) {
      const row = nextInvoiceDue.rows[0];
      invoiceStatus = {
        id: row.id,
        client: row.name,
        currency: ((row.currency || 'ARS').toUpperCase() === 'USD' ? 'USD' : 'ARS') as 'ARS' | 'USD',
        date: new Date(row.due_date),
        amount: Number(row.amount) / 100,
        isOverdue: new Date(row.due_date) < today,
      };
    }

    // C. Agenda Semanal
    let agendaStatus = null;
    const agendaEvents = await db.query(`
      SELECT COUNT(*) as count, MIN(start_time) as next_event_time, MIN(title) as next_event_title
      FROM calendar_events 
      WHERE start_time BETWEEN NOW() AND NOW() + INTERVAL '7 days'
    `);

    agendaStatus = {
      count: Number(agendaEvents.rows[0].count),
      nextEvent: agendaEvents.rows[0].next_event_title
        ? {
          title: agendaEvents.rows[0].next_event_title,
          date: new Date(agendaEvents.rows[0].next_event_time),
        }
        : null,
    };

    // --- 7. Histórico 12 Meses para Gráfico de Líneas ---
    const chartDataResult = await db.query(`
      WITH months AS (
        SELECT generate_series(
          date_trunc('month', CURRENT_DATE) - INTERVAL '11 months',
          date_trunc('month', CURRENT_DATE),
          '1 month'::interval
        ) AS m_date
      ),
      monthly_incomes AS (
        SELECT 
          date_trunc('month', issue_date) AS m_date,
          SUM(amount) AS total
        FROM invoices
        WHERE status IN ('paid', 'pagado', 'cobrado', 'facturado')
          AND issue_date >= date_trunc('month', CURRENT_DATE) - INTERVAL '11 months'
        GROUP BY 1
      ),
      monthly_expenses AS (
        SELECT 
          date_trunc('month', date) AS m_date,
          SUM(amount) AS total
        FROM expenses
        WHERE status = 'paid'
          AND payment_method != 'credit_card'
          AND date >= date_trunc('month', CURRENT_DATE) - INTERVAL '11 months'
        GROUP BY 1
      )
      SELECT 
        to_char(m.m_date, 'Mon') AS month_label,
        COALESCE(inc.total, 0) / 100.0 AS income,
        COALESCE(exp.total, 0) / 100.0 AS expense
      FROM months m
      LEFT JOIN monthly_incomes inc ON m.m_date = inc.m_date
      LEFT JOIN monthly_expenses exp ON m.m_date = exp.m_date
      ORDER BY m.m_date ASC
    `);

    const chartData = chartDataResult.rows.map((r) => ({
      name: r.month_label.toUpperCase(),
      income: Number(r.income),
      expense: Number(r.expense),
      baseline: burnRate,
    }));

    // --- 8. Actividad Reciente Normalizada ---
    const recentActivityResult = await db.query(`
      (SELECT 'invoice' as type, id::text, amount, status, issue_date as date, 
        (SELECT name FROM clients WHERE id = invoices.client_id) as description, 
        'Ingreso' as category
       FROM invoices ORDER BY issue_date DESC LIMIT 5)
      UNION ALL
      (SELECT 'expense' as type, id::text, amount, status, date, concept as description,
        (SELECT name FROM expense_categories WHERE id = expenses.category_id) as category
       FROM expenses ORDER BY date DESC LIMIT 5)
      ORDER BY date DESC LIMIT 5
    `);

    const recentActivity = recentActivityResult.rows.map((row) => ({
      ...row,
      amount: Number(row.amount) / 100,
      date: new Date(row.date),
    }));

    return {
      metrics: {
        runway: runwayMonths,
        safeToSpend,
        totalBankARS,
        totalBankUSD,
        burnRate,
        income,
        expenses: expensesTotal,
      },
      predictiveStatus: {
        expenses: expenseStatus,
        invoices: invoiceStatus,
        agenda: agendaStatus,
      } as DashboardPredictiveStatus,
      recentActivity,
      chartData,
    };
  } catch (error) {
    console.error('Overview Data Error:', error);
    throw new Error('Failed to fetch dashboard overview.');
  } finally {
    db.release();
  }
}

export async function fetchUpcomingRecurringExpenses(limit: number = 5, userId?: string): Promise<ExpenseTemplateWithDetails[]> {
  const uid = await resolveUserId(userId);
  try {
    const data = await sql`
      SELECT 
        et.id, et.concept, et.amount, et.currency, et.category_id, et.vendor_id, 
        et.frequency, et.start_date, et.end_date, et.next_due_date, 
        et.payment_method, et.card_id, et.active,
        v.name as vendor_name,
        ec.name as category_name
      FROM expense_templates et
      LEFT JOIN vendors v ON et.vendor_id = v.id
      LEFT JOIN expense_categories ec ON et.category_id = ec.id
      WHERE et.user_id =  AND et.next_due_date > NOW() AND et.active = TRUE
      ORDER BY et.next_due_date ASC
      LIMIT ${limit}
    `;

    return data.rows.map(row => ({
      ...row,
      amount: Number(row.amount) / 100,
      start_date: new Date(row.start_date),
      next_due_date: new Date(row.next_due_date),
      end_date: row.end_date ? new Date(row.end_date) : null,
    })) as ExpenseTemplateWithDetails[];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch upcoming recurring expenses.');
  }
}

// --- CARDS DASHBOARD ANALYTICS ---

export interface CardActivityItem {
  concept: string;
  amount: number;
  date: Date;
  card_name: string;
  card_color: string;
  category_name?: string | null;
}

export async function fetchGlobalCardActivity(limit: number = 6, userId?: string) {
  const uid = await resolveUserId(userId);
  try {
    const data = await sql`
      SELECT 
        e.id,
        e.concept,
        e.amount,
        e.date,
        e.status,
        c.name AS card_name,
        c.color AS card_color
      FROM expenses e
      JOIN cards c ON e.card_id = c.id
      ORDER BY e.date DESC, e.id DESC
      LIMIT ${limit}
    `;

    return data.rows.map(row => ({
      id: String(row.id),
      concept: row.concept,
      amount: Number(row.amount) / 100,
      date: new Date(row.date),
      status: row.status,
      card_name: row.card_name,
      card_color: row.card_color || '#64748b',
      cardName: row.card_name,
      cardColor: row.card_color || '#64748b',
    }));
  } catch (error) {
    console.error('Database Error in fetchGlobalCardActivity:', error);
    return [];
  }
}

export async function fetchCardSpendingDistribution(year: number, month: number, userId?: string) {
  const uid = await resolveUserId(userId);
  const periodDate = `${year}-${String(month).padStart(2, '0')}-01`;

  try {
    const data = await sql`
      SELECT 
        c.name,
        COALESCE(cs.total_amount, 0) AS value,
        c.color
      FROM cards c
      JOIN card_statements cs 
        ON c.id = cs.card_id 
       AND cs.statement_month = ${periodDate}::date
      WHERE c.user_id =  AND cs.total_amount > 0
      ORDER BY value DESC
    `;

    return data.rows.map(row => ({
      name: row.name,
      value: Number(row.value),
      color: row.color || '#3b82f6',
    }));
  } catch (error) {
    console.error('Database Error in fetchCardSpendingDistribution:', error);
    return [];
  }
}


export async function fetchCardsWithMonthlyStatement(year: number, month: number, userId?: string): Promise<CardWithStatement[]> {
  const uid = await resolveUserId(userId);
  const periodDate = `${year}-${String(month).padStart(2, '0')}-01`;

  try {
    const data = await sql`
      SELECT 
        c.id,
        c.name,
        c.last_four_digits,
        c.closing_day,
        c.due_day,
        c.color,
        cs.id AS statement_id,
        cs.total_amount,
        COALESCE(cs.paid_amount, 0) AS paid_amount,
        cs.due_date,
        cs.status AS statement_status
      FROM cards c
      LEFT JOIN card_statements cs 
        ON c.id = cs.card_id 
       AND cs.statement_month = ${periodDate}::date
      ORDER BY c.name ASC
    `;

    return data.rows.map(row => ({
      id: row.id,
      name: row.name,
      last_four_digits: row.last_four_digits,
      closing_day: row.closing_day,
      due_day: row.due_day,
      color: row.color,
      statement: row.statement_id ? {
        id: row.statement_id,
        totalAmount: Number(row.total_amount),
        paidAmount: Number(row.paid_amount || 0),
        dueDate: new Date(row.due_date),
        status: row.statement_status as 'pending' | 'partially_paid' | 'paid',
      } : null,
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch cards with monthly statement.');
  }
}

export async function fetchCardDetail(cardId: string, year: number, month: number, userId?: string) {
  const uid = await resolveUserId(userId);
  const periodDate = `${year}-${String(month).padStart(2, '0')}-01`;

  try {
    const [cardRes, currentStatementRes, historyRes] = await Promise.all([
      sql`SELECT * FROM cards WHERE id = ${cardId}`,
      sql`SELECT * FROM card_statements WHERE card_id = ${cardId} AND statement_month = ${periodDate}::date`,
      sql`
        SELECT * FROM card_statements 
        WHERE card_id = ${cardId} 
        ORDER BY statement_month DESC 
        LIMIT 12
      `
    ]);

    if (cardRes.rows.length === 0) return null;

    const card = cardRes.rows[0];
    const currentStatement = currentStatementRes.rows[0] ? {
      id: Number(currentStatementRes.rows[0].id),
      totalAmount: Number(currentStatementRes.rows[0].total_amount),
      paidAmount: Number(currentStatementRes.rows[0].paid_amount || 0),
      dueDate: new Date(currentStatementRes.rows[0].due_date),
      status: currentStatementRes.rows[0].status as 'pending' | 'partially_paid' | 'paid',
    } : null;

    const history = historyRes.rows.map(row => ({
      id: Number(row.id),
      statementMonth: new Date(row.statement_month),
      totalAmount: Number(row.total_amount),
      paidAmount: Number(row.paid_amount || 0),
      dueDate: new Date(row.due_date),
      status: row.status as 'pending' | 'partially_paid' | 'paid',
    }));

    return {
      card: {
        id: card.id,
        name: card.name,
        lastFourDigits: card.last_four_digits,
        closingDay: card.closing_day,
        dueDay: card.due_day,
        color: card.color,
      },
      currentStatement,
      history,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card detail.');
  }
}


import { BankAccount } from '@/lib/definitions';

export async function fetchBankAccounts(userId?: string): Promise<BankAccount[]> {
  const uid = await resolveUserId(userId);
  try {
    const data = await sql`
      SELECT 
        id, 
        name, 
        account_type, 
        currency, 
        balance, 
        color, 
        is_active, 
        created_at, 
        updated_at
      FROM bank_accounts
      WHERE is_active = TRUE
      ORDER BY currency ASC, balance DESC
    `;

    return data.rows.map((row) => ({
      id: row.id,
      name: row.name,
      account_type: row.account_type,
      currency: row.currency,
      balance: Number(row.balance) / 100, // Convertimos de centavos a unidades
      color: row.color || '#10b981',
      is_active: row.is_active,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    })) as BankAccount[];
  } catch (error) {
    console.error('Database Error in fetchBankAccounts:', error);
    throw new Error('No se pudieron obtener las cuentas bancarias.');
  }
}

export async function fetchBankLiquiditySummary(userId?: string) {
  const uid = await resolveUserId(userId);
  try {
    const data = await sql`
      SELECT 
        currency,
        COALESCE(SUM(balance), 0) as total_balance,
        COUNT(id) as total_accounts
      FROM bank_accounts
      WHERE is_active = TRUE
      GROUP BY currency
    `;

    let totalARS = 0;
    let totalUSD = 0;

    data.rows.forEach((row) => {
      const balance = Number(row.total_balance) / 100;
      if (row.currency === 'ARS') totalARS = balance;
      if (row.currency === 'USD') totalUSD = balance;
    });

    return { totalARS, totalUSD };
  } catch (error) {
    console.error('Database Error in fetchBankLiquiditySummary:', error);
    return { totalARS: 0, totalUSD: 0 };
  }
}

export async function fetchBankTransfers(userId?: string) {
  const uid = await resolveUserId(userId);
  const db = await sql.connect();

  try {
    const result = await db.query(`
      SELECT 
        bt.id,
        bt.amount,
        bt.notes,
        bt.created_at,
        fa.name AS from_account_name,
        fa.currency AS from_account_currency,
        fa.color AS from_account_color,
        ta.name AS to_account_name,
        ta.currency AS to_account_currency,
        ta.color AS to_account_color
      FROM bank_transfers bt
      JOIN bank_accounts fa ON bt.from_account_id = fa.id
      JOIN bank_accounts ta ON bt.to_account_id = ta.id
      ORDER BY bt.created_at DESC
      LIMIT 25
    `);

    return result.rows.map((row) => ({
      id: row.id,
      amount: Number(row.amount) / 100,
      notes: row.notes,
      createdAt: new Date(row.created_at),
      fromAccount: {
        name: row.from_account_name,
        currency: row.from_account_currency,
        color: row.from_account_color,
      },
      toAccount: {
        name: row.to_account_name,
        currency: row.to_account_currency,
        color: row.to_account_color,
      },
    }));
  } catch (error) {
    console.error('Error al obtener transferencias bancarias:', error);
    return [];
  } finally {
    db.release();
  }
}

// --- DASHBOARD HOMEPAGE FOCUS & DUES ---

export async function fetchTodayPendingEvents(userId?: string): Promise<CalendarEvent[]> {
  const uid = await resolveUserId(userId);
  try {
    const data = await sql<CalendarEvent>`
      SELECT 
        e.*,
        c.name as client_name,
        c.image_url as client_image_url
      FROM calendar_events e
      LEFT JOIN clients c ON e.related_client_id = c.id
      WHERE 
        DATE(e.start_time) = CURRENT_DATE
        AND e.status = 'pending'
      ORDER BY e.start_time ASC
    `;
    return data.rows.map(row => ({
      ...row,
      start_time: new Date(row.start_time),
      end_time: new Date(row.end_time),
      created_at: new Date(row.created_at),
    }));
  } catch (error) {
    console.error('Database Error in fetchTodayPendingEvents:', error);
    return [];
  }
}

export interface UpcomingDueItem {
  id: string;
  type: 'invoice' | 'card';
  title: string;
  subtitle?: string;
  amount: number;
  currency?: string;
  dueDate: Date;
  isOverdue: boolean;
  targetUrl: string;
}

export async function fetchUpcomingDues(userId?: string): Promise<UpcomingDueItem[]> {
  const uid = await resolveUserId(userId);
  const db = await sql.connect();
  try {
    // 1. Las 3 facturas por cobrar más próximas a vencer o vencidas
    const invoicesResult = await db.query(`
      SELECT 
        i.id,
        i.amount,
        i.currency,
        i.due_date,
        c.name as client_name,
        CASE
          WHEN i.status = 'vencido' OR (i.status = 'pendiente' AND i.due_date < CURRENT_DATE) THEN TRUE
          ELSE FALSE
        END as is_overdue
      FROM invoices i
      JOIN clients c ON i.client_id = c.id
      WHERE i.status IN ('pendiente', 'vencido')
      ORDER BY i.due_date ASC
      LIMIT 3
    `);

    // 2. Pagos de tarjetas de crédito más cercanos
    const cardsResult = await db.query(`
      SELECT 
        cs.id,
        (cs.total_amount - COALESCE(cs.paid_amount, 0)) as remaining_amount,
        cs.due_date,
        cs.card_id,
        c.name as card_name,
        CASE
          WHEN cs.due_date < CURRENT_DATE THEN TRUE
          ELSE FALSE
        END as is_overdue
      FROM card_statements cs
      JOIN cards c ON cs.card_id = c.id
      WHERE cs.status IN ('pending', 'partially_paid')
      ORDER BY cs.due_date ASC
      LIMIT 3
    `);

    const items: UpcomingDueItem[] = [];

    invoicesResult.rows.forEach(row => {
      items.push({
        id: `inv-${row.id}`,
        type: 'invoice',
        title: row.client_name,
        subtitle: 'Factura por cobrar',
        amount: Number(row.amount) / 100,
        currency: row.currency || 'ARS',
        dueDate: new Date(row.due_date),
        isOverdue: Boolean(row.is_overdue),
        targetUrl: `/dashboard/finances/invoices?query=${encodeURIComponent(row.client_name)}`,
      });
    });

    cardsResult.rows.forEach(row => {
      items.push({
        id: `card-${row.id}`,
        type: 'card',
        title: `Resumen ${row.card_name}`,
        subtitle: 'Vencimiento de tarjeta',
        amount: Number(row.remaining_amount) / 100,
        currency: 'ARS',
        dueDate: new Date(row.due_date),
        isOverdue: Boolean(row.is_overdue),
        targetUrl: `/dashboard/finances/cards/${row.card_id}`,
      });
    });

    // Ordenar combinados por fecha de vencimiento ascendente
    items.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

    return items;
  } catch (error) {
    console.error('Database Error in fetchUpcomingDues:', error);
    return [];
  } finally {
    db.release();
  }
}