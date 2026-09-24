import { sql } from '@vercel/postgres';

async function main() {
  const users = await sql`SELECT id, name, email FROM users`;
  console.log('USERS:', users.rows);
}

main().catch(console.error);
