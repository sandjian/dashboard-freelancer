import { sql } from '@vercel/postgres';

async function migrate() {
  const DEMO_USER_ID = '410544b2-4001-4271-9855-fec4b6a6442a';

  console.log('--- Iniciando migración de Multi-Tenancy ---');

  // 1. Agregar user_id a tablas principales si no existe
  const tables = [
    'clients',
    'invoices',
    'expenses',
    'expense_templates',
    'cards',
    'bank_accounts'
  ];

  for (const table of tables) {
    console.log(`Verificando columna user_id en ${table}...`);
    await sql.query(`
      ALTER TABLE ${table} 
      ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;
    `);

    // Asignar el demo user a los registros huérfanos preexistentes
    const updateRes = await sql.query(`
      UPDATE ${table} 
      SET user_id = $1 
      WHERE user_id IS NULL;
    `, [DEMO_USER_ID]);
    console.log(`Actualizados ${updateRes.rowCount} registros en ${table} con user_id de demo.`);
  }

  // 2. Crear índices para performance
  console.log('Creando índices de performance por user_id...');
  await sql.query(`CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);`);
  await sql.query(`CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);`);
  await sql.query(`CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);`);
  await sql.query(`CREATE INDEX IF NOT EXISTS idx_expense_templates_user_id ON expense_templates(user_id);`);
  await sql.query(`CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(user_id);`);
  await sql.query(`CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON bank_accounts(user_id);`);
  await sql.query(`CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);`);

  console.log('--- Migración completada con éxito ---');
}

migrate().catch(console.error);
