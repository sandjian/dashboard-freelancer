const fs = require('fs');
const path = require('path');
try {
    const envPath = path.resolve(__dirname, '../.env.local');
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, ...value] = line.split('=');
        if (key && value) process.env[key.trim()] = value.join('=').trim().replace(/^["']|["']$/g, '');
    });
} catch (e) { }

const { db } = require('@vercel/postgres');

async function check() {
    const client = await db.connect();
    try {
        const res = await client.sql`SELECT * FROM expenses LIMIT 1`;
        console.log('Columns:', res.fields.map(f => f.name));
    } catch (err) {
        console.error(err);
    } finally {
        client.release();
    }
}

check();
