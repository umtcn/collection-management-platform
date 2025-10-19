// API Configuration
export const API_CONFIG = {
    BASE_URL: 'https://maestro-api-dev.secil.biz',
    SECRET_TOKEN: process.env.SECIL_SECRET_TOKEN || 'YOUR_SECRET_TOKEN',
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/Auth/Login',
            REFRESH: '/Auth/RefreshTokenLogin',
        },
        COLLECTION: {
            GET_ALL: '/Collection/GetAll',
            GET_PRODUCTS: (id: number) => `/Collection/${id}/GetProductsForConstants`,
            GET_FILTERS: (id: number) => `/Collection/${id}/GetFiltersForConstants`,
        },
    },
    DEFAULT_HEADERS: {
        'Content-Type': 'application/json',
    },
};

/**
 * Get auth headers with bearer token
 */
export function getAuthHeaders(token: string): Record<string, string> {
    return {
        ...API_CONFIG.DEFAULT_HEADERS,
        Authorization: `Bearer ${token}`,
        SecretToken: API_CONFIG.SECRET_TOKEN,
    };
}

/**
 * Get default headers with secret token
 */
export function getDefaultHeaders(): Record<string, string> {
    return {
        ...API_CONFIG.DEFAULT_HEADERS,
        SecretToken: API_CONFIG.SECRET_TOKEN,
    };
}

/**
 * Build full API URL
 */
export function buildApiUrl(endpoint: string): string {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
}

/**
 * Handle API errors
 */
export class ApiError extends Error {
    constructor(
        public status: number,
        public message: string,
        public data?: any
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Generic fetch wrapper with error handling
 */
export async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = buildApiUrl(endpoint);

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...getDefaultHeaders(),
                ...options.headers,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new ApiError(
                response.status,
                data.message || 'API request failed',
                data
            );
        }

        return data;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, 'Network error or server unavailable');
    }
}
