import { NextResponse } from 'next/server';
import { API_CONFIG, getAuthHeaders } from '@/lib/api-config';

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

        // Call Secil API - GetFiltersForConstants endpoint
        const response = await fetch(
            `${API_CONFIG.BASE_URL}/Collection/${collectionId}/GetFiltersForConstants`,
            {
                method: 'GET',
                headers: getAuthHeaders(token),
            }
        );

        console.log('📡 Secil API Filters response status:', response.status);

        // Check status BEFORE parsing JSON
        if (!response.ok) {
            console.error('❌ Secil API Filters error:', response.status, response.statusText);

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
            let errorMessage = 'Failed to fetch filters';
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (parseError) {
                console.error('⚠️ Could not parse error response:', parseError);
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
        let data: any;
        try {
            data = await response.json();
            console.log('📦 Filters API response parsed successfully');
        } catch (parseError) {
            console.error('❌ Failed to parse Filters API response:', parseError);
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
            console.error('❌ Filters API returned error status:', data.status, data.message);
            return NextResponse.json(
                {
                    success: false,
                    message: data.message || 'Failed to fetch filters',
                },
                { status: 400 } // Bad Request
            );
        }

        return NextResponse.json({
            success: true,
            data: data.data || [],
            message: data.message,
        });
    } catch (error) {
        console.error('Error fetching filters:', error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Internal server error',
            },
            { status: 500 }
        );
    }
}
