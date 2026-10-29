import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);
const { auth } = NextAuth(authConfig);

export default auth(async function middleware(req) {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth?.user;

    const localeMatch = nextUrl.pathname.match(/^\/([a-z]{2})(\/|$)/);
    const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;

    const isDashboard = nextUrl.pathname.includes('/dashboard');
    const isOnboarding = nextUrl.pathname.includes('/onboarding');

    if ((isDashboard || isOnboarding) && !isLoggedIn) {
        return Response.redirect(new URL(`/${locale}/login`, nextUrl));
    }

    return handleI18nRouting(req);
});

export const config = {
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
