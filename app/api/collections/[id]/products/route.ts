import { NextResponse } from 'next/server';
import { API_CONFIG, getAuthHeaders, ApiError } from '@/lib/api-config';
import type { SecilProductsRequest, SecilProductsResponse, SecilFiltersResponse } from '@/types/secil-api';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
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

        const collectionId = parseInt(params.id, 10);
        const body: Partial<SecilProductsRequest> = await request.json();

        // Prepare request body
        const requestBody: SecilProductsRequest = {
            additionalFilters: body.additionalFilters || [],
            page: body.page || 1,
            pageSize: body.pageSize || 36,
        };

        // Call Secil API
        // Call Secil API
        const response = await fetch(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COLLECTION.GET_PRODUCTS(collectionId)}`,
            {
                method: 'POST',
                headers: getAuthHeaders(token),
                body: JSON.stringify(requestBody),
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
            let errorMessage = 'Failed to fetch products';
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
        let data: SecilProductsResponse;
        try {
            data = await response.json();
        } catch (parseError) {
            console.error('Failed to parse Products API response:', parseError);
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid response from API',
                },
                { status: 502 } // Bad Gateway
            );
        }

        // Check API response status field
        if (data.status !== 200) {
            console.error('Products API returned error status:', data.status, data.message);
            return NextResponse.json(
                {
                    success: false,
                    message: data.message || 'Failed to fetch products',
                },
                { status: 400 } // Bad Request
            );
        }

        return NextResponse.json(
            {
                success: true,
                ...data.data,
            },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'private, max-age=30',
                },
            }
        );
    } catch (error) {
        console.error('Error fetching products:', error);

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
                message: 'Failed to fetch products',
            },
            { status: 500 }
        );
    }
}

// GET endpoint for filters
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
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

        const collectionId = parseInt(params.id, 10);

        // Call Secil API for filters
        const response = await fetch(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COLLECTION.GET_FILTERS(collectionId)}`,
            {
                method: 'GET',
                headers: getAuthHeaders(token),
            }
        );

        const data: SecilFiltersResponse = await response.json();

        if (!response.ok || data.status !== 200) {
            return NextResponse.json(
                {
                    success: false,
                    message: data.message || 'Failed to fetch filters',
                },
                { status: response.status }
            );
        }

        return NextResponse.json(
            {
                success: true,
                data: data.data,
            },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'private, max-age=300',
                },
            }
        );
    } catch (error) {
        console.error('Error fetching filters:', error);

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
                message: 'Failed to fetch filters',
            },
            { status: 500 }
        );
    }
}