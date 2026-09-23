import { sql } from '@vercel/postgres';

async function main() {
  console.log('🔍 Probando conexión a la base de datos...');

  if (!process.env.POSTGRES_URL) {
    console.error('❌ Error: La variable de entorno POSTGRES_URL no está definida.');
    console.log('💡 Asegúrate de crear el archivo .env.local con las credenciales de Neon.');
    process.exit(1);
  }

  try {
    const result = await sql`SELECT version();`;
    console.log('✅ ¡Conexión exitosa!');
    console.log(`📦 Versión de PostgreSQL: ${result.rows[0].version}`);
    
    // Check table existence
    try {
      const tableCheck = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'invoices';
      `;
      if (tableCheck.rowCount > 0) {
          console.log('✅ Tabla "invoices" encontrada.');
      } else {
          console.log('⚠️  Tabla "invoices" NO encontrada. Recuerda ejecutar el schema.sql.');
      }
    } catch (e) {
      console.log('⚠️  No se pudo verificar la existencia de tablas.');
    }

  } catch (error) {
    console.error('❌ Falló la conexión:');
    console.error(error);
    process.exit(1);
  }
}

main();
