import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/lib/api-config';

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { refreshToken, accessToken } = body;

        // If both tokens provided, just update cookies (called from frontend after refresh)
        if (accessToken && refreshToken) {
            const response = NextResponse.json({
                success: true,
                message: 'Cookies updated',
            });

            // Update auth cookie
            const authCookie = {
                state: {
                    isAuthenticated: true,
                    token: accessToken,
                    refreshToken: refreshToken,
                }
            };

            response.cookies.set('auth-storage', JSON.stringify(authCookie), {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7, // 7 days
                path: '/',
            });

            return response;
        }

        // Otherwise, refresh token via API
        if (!refreshToken) {
            return NextResponse.json(
                { success: false, message: 'Refresh token is required' },
                { status: 400 }
            );
        }

        // Call Secil API refresh endpoint
        const apiResponse = await fetch(`${API_CONFIG.BASE_URL}/Auth/RefreshTokenLogin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'SecretToken': API_CONFIG.SECRET_TOKEN,
            },
            body: JSON.stringify({ refreshToken }),
        });

        const data = await apiResponse.json();

        if (!apiResponse.ok || data.status !== 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: data.message || 'Token refresh failed',
                },
                { status: apiResponse.status }
            );
        }

        // Return new tokens
        const response = NextResponse.json({
            success: true,
            token: data.data.accessToken,
            refreshToken: data.data.refreshToken,
            expiresIn: data.data.expiresIn,
            refreshExpiresIn: data.data.refreshExpiresIn,
        });

        // Update auth cookie with new tokens
        const authCookie = {
            state: {
                isAuthenticated: true,
                token: data.data.accessToken,
                refreshToken: data.data.refreshToken,
            }
        };

        response.cookies.set('auth-storage', JSON.stringify(authCookie), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Token refresh error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'An error occurred during token refresh',
            },
            { status: 500 }
        );
    }
}
