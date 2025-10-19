import { NextResponse } from 'next/server';

/**
 * POST /api/auth/logout
 * Clear authentication cookies
 */
export async function POST() {
    const response = NextResponse.json(
        { success: true, message: 'Logged out successfully' },
        { status: 200 }
    );

    // Clear auth cookie
    response.cookies.set('auth-storage', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
    });

    return response;
}
