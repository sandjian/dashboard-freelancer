const { db } = require('@vercel/postgres');

async function main() {
  const client = await db.connect();
  try {
    console.log('Adding paid_amount column to card_statements...');
    await client.sql`
      ALTER TABLE card_statements 
      ADD COLUMN IF NOT EXISTS paid_amount NUMERIC(12, 2) DEFAULT 0;
    `;
    console.log('Migration successful: paid_amount column added.');
  } catch (error) {
    console.error('Error in migration:', error);
  } finally {
    await client.end();
  }
}

main();
