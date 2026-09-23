const { db } = require('@vercel/postgres');

async function revert() {
    const client = await db.connect();

    try {
        console.log('Iniciando reversión de Fase 11...');

        // 1. Eliminar is_deductible
        console.log('Eliminando columna is_deductible...');
        await client.query(`
      ALTER TABLE expenses 
      DROP COLUMN IF EXISTS is_deductible;
    `);

        // 2. Eliminar receipt_url
        console.log('Eliminando columna receipt_url...');
        await client.query(`
      ALTER TABLE expenses 
      DROP COLUMN IF EXISTS receipt_url;
    `);

        console.log('Reversión completada: Columnas eliminadas.');
    } catch (err) {
        console.error('Error durante la reversión:', err);
    } finally {
        await client.end();
    }
}

revert();
