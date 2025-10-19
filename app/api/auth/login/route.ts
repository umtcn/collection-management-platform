import { NextResponse } from 'next/server';
import { API_CONFIG, getDefaultHeaders, ApiError } from '@/lib/api-config';
import type { SecilAuthRequest, SecilAuthResponse } from '@/types/secil-api';
import type { AuthResponse, User } from '@/types';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Email and password are required',
                } as AuthResponse,
                { status: 400 }
            );
        }

        // Prepare request for Secil API
        const authRequest: SecilAuthRequest = {
            username: email,
            password: password,
        };

        // Call Secil Auth API
        const apiResponse = await fetch(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`,
            {
                method: 'POST',
                headers: getDefaultHeaders(),
                body: JSON.stringify(authRequest),
            }
        );

        const data: SecilAuthResponse = await apiResponse.json();

        if (!apiResponse.ok || data.status !== 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: data.message || 'Invalid credentials',
                } as AuthResponse,
                { status: 401 }
            );
        }

        // Extract user info from JWT token (you can decode it or use user info from token)
        const user: User = {
            id: email, // Using email as ID for now
            email: email,
            name: email.split('@')[0],
            role: 'user',
        };

        // Create response with auth data
        const response = NextResponse.json(
            {
                success: true,
                user: user,
                token: data.data.accessToken,
                refreshToken: data.data.refreshToken,
                message: 'Login successful',
            } as AuthResponse & { refreshToken: string },
            { status: 200 }
        );

        // Set auth cookie for middleware
        const authCookie = {
            state: {
                isAuthenticated: true,
                user: user,
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
        console.error('Login error:', error);

        if (error instanceof ApiError) {
            return NextResponse.json(
                {
                    success: false,
                    message: error.message,
                } as AuthResponse,
                { status: error.status }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: 'An error occurred during login',
            } as AuthResponse,
            { status: 500 }
        );
    }
}