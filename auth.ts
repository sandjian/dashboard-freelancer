import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { z } from 'zod';

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET,
        }),
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;

                    const { sql } = await import('@vercel/postgres');
                    const bcrypt = await import('bcryptjs');

                    const user = await sql`SELECT * FROM users WHERE email=${email}`;

                    if (user.rows.length === 0) return null;

                    const passwordsMatch = await bcrypt.compare(password, user.rows[0].password);
                    if (passwordsMatch) {
                        return {
                            id: user.rows[0].id,
                            name: user.rows[0].name,
                            email: user.rows[0].email,
                            image: user.rows[0].image_url,
                        };
                    }
                }
                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
});
