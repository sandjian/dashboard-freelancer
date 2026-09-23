import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);
const { auth } = NextAuth(authConfig);

export default auth(async function middleware(req) {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const isDashboard = nextUrl.pathname.includes('/dashboard');

    if (isDashboard && !isLoggedIn) {
        // Redirect to login, preserving locale if possible, otherwise default
        const localeMatch = nextUrl.pathname.match(/^\/([a-z]{2})\//);
        const locale = localeMatch ? localeMatch[1] : 'es'; // Default to 'es' if not found
        return Response.redirect(new URL(`/${locale}/login`, nextUrl));
    }

    // 1. Run i18n middleware first to handle redirects (e.g. / -> /es) and locale resolution
    const res = handleI18nRouting(req);

    return res;
});

export const config = {
    // Match only internationalized pathnames
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
