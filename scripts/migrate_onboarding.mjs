import { sql } from '@vercel/postgres';

async function migrateOnboarding() {
  console.log('Running Onboarding schema migration on Neon DB...');
  const client = await sql.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS default_currency VARCHAR(10) NOT NULL DEFAULT 'ARS',
        ADD COLUMN IF NOT EXISTS monthly_income_goal BIGINT NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE;
    `);

    const updateRes = await client.query(`
      UPDATE users u
      SET onboarding_completed = TRUE,
          onboarding_completed_at = COALESCE(u.onboarding_completed_at, NOW())
      WHERE u.email = 'demo@avalon.com'
         OR EXISTS (SELECT 1 FROM bank_accounts ba WHERE ba.user_id = u.id)
         OR EXISTS (SELECT 1 FROM clients c WHERE c.user_id = u.id)
      RETURNING id, email, onboarding_completed;
    `);

    await client.query('COMMIT');
    console.log('Migration committed successfully. Updated existing active users:', updateRes.rows);

    const allUsers = await client.query(`
      SELECT id, name, email, onboarding_completed, default_currency, monthly_income_goal
      FROM users
      ORDER BY email;
    `);
    console.log('Current users state:', allUsers.rows);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
  }
}

migrateOnboarding();

