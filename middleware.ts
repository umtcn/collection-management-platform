import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public paths that don't require authentication
const publicPaths = ['/login'];

// Define protected paths that require authentication
const protectedPaths = ['/collections', '/edit'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if user is authenticated by looking for auth token in cookies
    const authCookie = request.cookies.get('auth-storage');
    let isAuthenticated = false;

    if (authCookie) {
        try {
            const authData = JSON.parse(authCookie.value);
            isAuthenticated = authData?.state?.isAuthenticated || false;
        } catch (error) {
            console.error('Error parsing auth cookie:', error);
            isAuthenticated = false;
        }
    }

    // Check if the current path is protected
    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

    // Redirect to login if trying to access protected path without authentication
    if (isProtectedPath && !isAuthenticated) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
    }

    // Redirect to collections if trying to access login while already authenticated
    if (isPublicPath && isAuthenticated && pathname === '/login') {
        const url = request.nextUrl.clone();
        url.pathname = '/collections';
        return NextResponse.redirect(url);
    }

    // Add security headers
    const response = NextResponse.next();

    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=()'
    );

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc.)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|images|.*\\..*$).*)',
    ],
};
