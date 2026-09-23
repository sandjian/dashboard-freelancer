const { db } = require('@vercel/postgres');
// require('dotenv').config(); - Using --env-file


async function main() {
  const client = await db.connect();

  try {
    console.log('Creating "calendar_events" table...');
    await client.sql`
      CREATE TABLE IF NOT EXISTS calendar_events (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id UUID NOT NULL, 
        title VARCHAR(255) NOT NULL,
        description TEXT,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        is_all_day BOOLEAN DEFAULT FALSE,
        type VARCHAR(50) NOT NULL CHECK (type IN ('meeting', 'task', 'reminder')),
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
        related_client_id UUID,
        related_invoice_id UUID,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    console.log('Table "calendar_events" created.');

    console.log('Creating index on dates...');
    await client.sql`
      CREATE INDEX IF NOT EXISTS idx_calendar_events_dates ON calendar_events(start_time, end_time);
    `;
    console.log('Index created.');

  } catch (error) {
    console.error('Error in migration:', error);
  } finally {
    client.release();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
