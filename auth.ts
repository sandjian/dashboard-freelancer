import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { z } from 'zod';

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    trustHost: true,
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

                    const user = await sql`
                        SELECT id, name, email, password, image_url, COALESCE(onboarding_completed, false) AS onboarding_completed
                        FROM users
                        WHERE email = ${email}
                    `;

                    if (user.rows.length === 0 || !user.rows[0].password) return null;

                    const passwordsMatch = await bcrypt.compare(password, user.rows[0].password);
                    if (passwordsMatch) {
                        return {
                            id: user.rows[0].id,
                            name: user.rows[0].name,
                            email: user.rows[0].email,
                            image: user.rows[0].image_url,
                            onboardingCompleted: Boolean(user.rows[0].onboarding_completed),
                        };
                    }
                }
                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
    callbacks: {
        ...authConfig.callbacks,
        async signIn({ user, account }) {
            if (account?.provider === 'google' && user.email) {
                try {
                    const { sql } = await import('@vercel/postgres');
                    const existing = await sql`
                        INSERT INTO users (name, email, image_url)
                        VALUES (${user.name || 'Freelancer'}, ${user.email}, ${user.image || null})
                        ON CONFLICT (email) DO UPDATE
                          SET name = COALESCE(users.name, EXCLUDED.name),
                              image_url = COALESCE(EXCLUDED.image_url, users.image_url)
                        RETURNING id, COALESCE(onboarding_completed, false) AS onboarding_completed
                    `;
                    if (existing.rows[0]) {
                        user.id = existing.rows[0].id;
                        (user as { onboardingCompleted?: boolean }).onboardingCompleted = Boolean(
                            existing.rows[0].onboarding_completed
                        );
                    }
                    return true;
                } catch (error) {
                    console.error('Error syncing Google user with Neon DB:', error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.onboardingCompleted = Boolean(
                    (user as { onboardingCompleted?: boolean }).onboardingCompleted
                );
                token.dbSynced = true;
            }

            // Autocuración para sesiones previas (p.ej. Google OAuth sin sincronizar ID con Neon DB)
            if (!token.dbSynced && token.email) {
                try {
                    const { sql } = await import('@vercel/postgres');
                    const synced = await sql`
                        INSERT INTO users (name, email, image_url)
                        VALUES (${(token.name as string) || 'Freelancer'}, ${token.email}, ${(token.picture as string) || null})
                        ON CONFLICT (email) DO UPDATE
                          SET name = COALESCE(users.name, EXCLUDED.name)
                        RETURNING id, COALESCE(onboarding_completed, false) AS onboarding_completed
                    `;
                    if (synced.rows[0]) {
                        token.id = synced.rows[0].id;
                        token.onboardingCompleted = Boolean(synced.rows[0].onboarding_completed);
                        token.dbSynced = true;
                    }
                } catch (error) {
                    console.error('Error healing JWT user ID with Neon DB:', error);
                }
            }

            if (trigger === 'update' && session?.onboardingCompleted !== undefined) {
                token.onboardingCompleted = Boolean(session.onboardingCompleted);
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user && token.id) {
                session.user.id = token.id as string;
                (session.user as { onboardingCompleted?: boolean }).onboardingCompleted = Boolean(
                    token.onboardingCompleted
                );
            }
            return session;
        },
    },
});
