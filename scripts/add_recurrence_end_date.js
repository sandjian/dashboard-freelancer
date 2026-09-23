const fs = require('fs');
const path = require('path');

// Load .env.local manually
try {
    const envPath = path.resolve(__dirname, '../.env.local');
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, ...value] = line.split('=');
        if (key && value) {
            // Remove quotes if present
            process.env[key.trim()] = value.join('=').trim().replace(/^["']|["']$/g, '');
        }
    });
    console.log('Loaded .env.local');
} catch (e) {
    console.log('Could not load .env.local (maybe running in production?)');
}

const { db } = require('@vercel/postgres');

async function migrate() {
    const client = await db.connect();
    try {
        console.log('Starting migration to add recurrence_end_date...');

        await client.sql`
      ALTER TABLE expenses 
      ADD COLUMN IF NOT EXISTS recurrence_end_date DATE;
    `;
        console.log('Added recurrence_end_date column to expenses table');

        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        client.release();
    }
}

migrate();
