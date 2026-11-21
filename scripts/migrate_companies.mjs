import { sql } from '@vercel/postgres';

async function migrateCompanies() {
  console.log('Running Companies schema migration on Neon DB...');
  const client = await sql.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        address VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(100),
        tax_id VARCHAR(100),
        image_url TEXT,
        is_default BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);
    `);

    await client.query(`
      ALTER TABLE invoices
        ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;
    `);

    await client.query('COMMIT');
    console.log('Companies migration committed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Companies migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
  }
}

migrateCompanies();
