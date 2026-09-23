const fs = require('fs');
const path = require('path');

// Load .env.local manually
try {
    const envPath = path.resolve(__dirname, '../.env.local');
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, ...value] = line.split('=');
        if (key && value) {
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
        console.log('Starting migration...');

        // 1. Drop existing constraint if it exists
        // We need to know the constraint name. Usually it's automatic.
        // We'll try to drop the constraint by name if we can guess it or look it up, 
        // but generic 'ALTER TABLE expenses DROP CONSTRAINT ...' requires the name.
        // PostgreSQL usually names it 'expenses_parent_expense_id_fkey'.

        try {
            await client.sql`ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_parent_expense_id_fkey;`;
            console.log('Dropped old constraint expenses_parent_expense_id_fkey');
        } catch (e) {
            console.log('Error dropping constraint (might not exist):', e.message);
        }

        // 2. Add new self-referencing constraint
        await client.sql`
      ALTER TABLE expenses 
      ADD CONSTRAINT expenses_parent_expense_id_fkey 
      FOREIGN KEY (parent_expense_id) REFERENCES expenses(id);
    `;
        console.log('Added new self-referencing constraint');

        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        client.release();
    }
}

migrate();
