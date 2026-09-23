const { db } = require('@vercel/postgres');

async function migrate() {
    const client = await db.connect();

    try {
        console.log('Iniciando migración de Fase 11...');

        // 1. Agregar is_deductible
        console.log('Agregando columna is_deductible...');
        await client.query(`
      ALTER TABLE expenses 
      ADD COLUMN IF NOT EXISTS is_deductible BOOLEAN DEFAULT FALSE;
    `);

        // 2. Agregar receipt_url
        console.log('Agregando columna receipt_url...');
        await client.query(`
      ALTER TABLE expenses 
      ADD COLUMN IF NOT EXISTS receipt_url TEXT;
    `);

        console.log('Migración completada con éxito.');
    } catch (err) {
        console.error('Error durante la migración:', err);
    } finally {
        await client.end();
    }
}

migrate();
