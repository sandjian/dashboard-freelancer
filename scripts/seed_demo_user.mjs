import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

async function main() {
  const users = await sql`SELECT id, name, email FROM users WHERE id = '410544b2-4001-4271-9855-fec4b6a6442a' OR email = 'demo@avalon.com'`;
  console.log('Existing demo users:', users.rows);

  // Asegurar que exista el usuario demo con el UUID 410544b2-4001-4271-9855-fec4b6a6442a
  const hashedPassword = await bcrypt.hash('demo1234', 10);
  
  await sql`
    INSERT INTO users (id, name, email, password, image_url)
    VALUES (
      '410544b2-4001-4271-9855-fec4b6a6442a',
      'Demo User',
      'demo@avalon.com',
      ${hashedPassword},
      'https://avatar.vercel.sh/demo'
    )
    ON CONFLICT (id) DO UPDATE SET
      password = EXCLUDED.password,
      email = EXCLUDED.email,
      name = EXCLUDED.name;
  `;
  console.log('Demo user ensured with email: demo@avalon.com and password: demo1234');
}

main().catch(console.error);
