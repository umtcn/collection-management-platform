import { NextResponse } from 'next/server';
import { API_CONFIG, getAuthHeaders, ApiError } from '@/lib/api-config';
import type { SecilCollectionListResponse } from '@/types/secil-api';

export async function GET(request: Request) {
    try {
        // Get auth token from request headers
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Authentication required',
                },
                { status: 401 }
            );
        }

        // Parse query parameters for pagination
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

        // Call Secil API
        const response = await fetch(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COLLECTION.GET_ALL}?page=${page}&pageSize=${pageSize}`,
            {
                method: 'GET',
                headers: getAuthHeaders(token),
            }
        );

        // Check status BEFORE parsing JSON
        if (!response.ok) {
            // If token is invalid/expired, return 401 (not 500)
            if (response.status === 401 || response.status === 403) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Authentication failed - token invalid or expired',
                    },
                    { status: 401 }
                );
            }

            // For other errors, try to parse error message
            let errorMessage = 'Failed to fetch collections';
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (parseError) {
                // Ignore parse error
            }

            return NextResponse.json(
                {
                    success: false,
                    message: errorMessage,
                },
                { status: response.status }
            );
        }

        // Parse successful response
        let data: SecilCollectionListResponse;
        try {
            data = await response.json();
        } catch (parseError) {
            console.error('Failed to parse Secil API response:', parseError);
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid response from API',
                },
                { status: 502 } // Bad Gateway - invalid response from upstream
            );
        }

        return NextResponse.json(
            {
                success: true,
                ...data,
            },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'private, max-age=60',
                },
            }
        );
    } catch (error) {
        console.error('Error fetching collections:', error);

        if (error instanceof ApiError) {
            return NextResponse.json(
                {
                    success: false,
                    message: error.message,
                },
                { status: error.status }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch collections',
            },
            { status: 500 }
        );
    }
}