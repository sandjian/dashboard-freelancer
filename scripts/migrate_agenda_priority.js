const { db } = require('@vercel/postgres');

async function main() {
  const client = await db.connect();
  try {
    console.log('Altering calendar_events table to add priority column if not exists...');
    await client.sql`
      ALTER TABLE calendar_events 
      ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium';
    `;
    console.log('Priority column ensured.');

    const cols = await client.sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'calendar_events';
    `;
    console.log('Columns:', cols.rows);
  } catch (error) {
    console.error('Error in migration:', error);
  } finally {
    client.release();
  }
}

main().catch(console.error);
