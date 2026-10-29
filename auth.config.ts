import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = /\/.*dashboard/.test(nextUrl.pathname) || nextUrl.pathname === '/dashboard';
            const isOnOnboarding = /\/.*onboarding/.test(nextUrl.pathname) || nextUrl.pathname === '/onboarding';

            if (isOnDashboard || isOnOnboarding) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                if (nextUrl.pathname === '/' || /\/.*login/.test(nextUrl.pathname)) {
                    return Response.redirect(new URL('/dashboard', nextUrl));
                }
            }
            return true;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                if ('onboardingCompleted' in user) {
                    token.onboardingCompleted = Boolean(
                        (user as { onboardingCompleted?: boolean }).onboardingCompleted
                    );
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
    providers: [],
} satisfies NextAuthConfig;
