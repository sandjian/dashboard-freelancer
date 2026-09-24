import { sql } from '@vercel/postgres';

async function checkSchema() {
  const res = await sql`
    SELECT table_name, column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    ORDER BY table_name, ordinal_position
  `;
  const map = {};
  for (const r of res.rows) {
    map[r.table_name] = map[r.table_name] || [];
    map[r.table_name].push(r.column_name);
  }
  console.log(JSON.stringify(map, null, 2));
}

checkSchema().catch(console.error);
