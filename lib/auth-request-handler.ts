import { API_CONFIG, getAuthHeaders, ApiError } from './api-config';

interface RefreshTokenResponse {
    status: number;
    message: string | null;
    data: {
        accessToken: string;
        expiresIn: number;
        refreshExpiresIn: number;
        refreshToken: string;
        tokenType: string;
    };
}

/**
 * Request handler with automatic token refresh
 */
export class AuthenticatedRequestHandler {
    private static isRefreshing = false;
    private static refreshPromise: Promise<string> | null = null;

    /**
     * Get current tokens from storage
     */
    private static getTokens(): { token: string | null; refreshToken: string | null } {
        if (typeof window === 'undefined') {
            return { token: null, refreshToken: null };
        }

        try {
            const authStorage = localStorage.getItem('auth-storage');
            if (!authStorage) return { token: null, refreshToken: null };

            const parsed = JSON.parse(authStorage);
            return {
                token: parsed.state?.token || null,
                refreshToken: parsed.state?.refreshToken || null,
            };
        } catch {
            return { token: null, refreshToken: null };
        }
    }

    /**
     * Update tokens in storage (cookies already updated by API route)
     */
    private static updateTokens(token: string, refreshToken: string): void {
        if (typeof window === 'undefined') return;

        try {
            // Update localStorage only
            const authStorage = localStorage.getItem('auth-storage');
            if (!authStorage) return;

            const parsed = JSON.parse(authStorage);
            parsed.state.token = token;
            parsed.state.refreshToken = refreshToken;

            localStorage.setItem('auth-storage', JSON.stringify(parsed));

            // Note: Cookies are already updated by /api/auth/refresh endpoint
        } catch (error) {
            console.error('❌ Failed to update tokens in localStorage:', error);
        }
    }

    /**
     * Clear tokens and redirect to login
     */
    private static clearAuthAndRedirect(): void {
        if (typeof window === 'undefined') return;

        console.log('🚪 Clearing authentication and redirecting to login...');

        // Clear localStorage
        try {
            localStorage.removeItem('auth-storage');
            console.log('✅ LocalStorage cleared');
        } catch (error) {
            console.error('❌ Failed to clear localStorage:', error);
        }

        // Clear cookies via logout API
        fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(() => {
                console.log('✅ Cookies cleared via API');
            })
            .catch((error) => {
                console.error('❌ Failed to clear cookies:', error);
            })
            .finally(() => {
                // Redirect to login regardless of cookie clear success
                console.log('↪️ Redirecting to login page...');
                window.location.href = '/login';
            });
    }

    /**
     * Refresh access token using refresh token
     */
    private static async refreshAccessToken(): Promise<string> {
        // Prevent multiple simultaneous refresh attempts
        if (this.isRefreshing && this.refreshPromise) {
            return this.refreshPromise;
        }

        this.isRefreshing = true;
        this.refreshPromise = this.performRefresh();

        try {
            const newToken = await this.refreshPromise;
            return newToken;
        } finally {
            this.isRefreshing = false;
            this.refreshPromise = null;
        }
    }

    /**
     * Perform the actual token refresh
     */
    private static async performRefresh(): Promise<string> {
        const { refreshToken } = this.getTokens();

        if (!refreshToken) {
            console.error('❌ No refresh token available');
            this.clearAuthAndRedirect();
            throw new Error('No refresh token available');
        }

        console.log('🔄 Refreshing access token via API route...');

        try {
            // Call our API route (which proxies to Secil API)
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken }),
            });

            console.log(`📡 Refresh token API route response status: ${response.status}`);

            // Parse response
            let data: any;
            try {
                data = await response.json();
                console.log('📦 Refresh token response data:', {
                    success: data.success,
                    hasToken: !!data.token,
                    hasRefreshToken: !!data.refreshToken
                });
            } catch (parseError) {
                console.error('❌ Failed to parse refresh token response:', parseError);
                this.clearAuthAndRedirect();
                throw new Error('Invalid response from refresh token API');
            }

            // Check HTTP status
            if (!response.ok) {
                console.error(`❌ Refresh token API HTTP error ${response.status}:`, data.message);

                // 401/403: Invalid refresh token → logout
                if (response.status === 401 || response.status === 403) {
                    console.error('🚪 Refresh token invalid/expired, logging out...');
                    this.clearAuthAndRedirect();
                    throw new Error(`Refresh token invalid: ${response.status}`);
                }

                // 500+: Server error → logout
                if (response.status >= 500) {
                    console.error('🚪 Server error during refresh, logging out...');
                    this.clearAuthAndRedirect();
                    throw new Error(`Server error during refresh: ${response.status}`);
                }

                throw new Error(`Token refresh failed with status ${response.status}`);
            }

            // Check API response success field
            if (!data.success) {
                console.error('❌ Refresh token API returned error:', data.message);
                this.clearAuthAndRedirect();
                throw new Error(`Refresh token API error: ${data.message}`);
            }

            // Validate response data
            if (!data.token || !data.refreshToken) {
                console.error('❌ Refresh token response missing tokens:', data);
                this.clearAuthAndRedirect();
                throw new Error('Invalid tokens in refresh response');
            }

            console.log('✅ Token refresh successful');

            // Update tokens in storage (cookies already updated by API route)
            this.updateTokens(data.token, data.refreshToken);
            console.log('✅ Tokens updated in storage and cookies');

            return data.token;
        } catch (error) {
            console.error('❌ Token refresh error:', error);

            // If error already called clearAuthAndRedirect, don't call again
            if (error instanceof Error && error.message.includes('invalid')) {
                throw error;
            }

            // Network error or unexpected error → logout
            console.error('🚪 Unexpected refresh error, logging out...');
            this.clearAuthAndRedirect();
            throw error;
        }
    }

    /**
     * Check if error is due to expired/invalid token
     * This includes 401 (Unauthorized) and 403 (Forbidden)
     */
    private static isTokenExpiredError(status: number): boolean {
        return status === 401 || status === 403;
    }

    /**
     * Make authenticated request with automatic token refresh
     */
    static async fetch<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const { token } = this.getTokens();

        if (!token) {
            console.error('❌ No authentication token found');
            this.clearAuthAndRedirect();
            throw new Error('No authentication token');
        }

        // First attempt with current token
        try {
            const response = await fetch(endpoint, {
                ...options,
                headers: {
                    ...getAuthHeaders(token),
                    ...options.headers,
                },
            });

            // If token expired, refresh and retry
            if (this.isTokenExpiredError(response.status)) {
                console.log(`⚠️ Token expired (${response.status}), refreshing token...`);

                try {
                    const newToken = await this.refreshAccessToken();

                    console.log('✅ Token refreshed successfully, retrying original request...');

                    // Retry request with new token
                    const retryResponse = await fetch(endpoint, {
                        ...options,
                        headers: {
                            ...getAuthHeaders(newToken),
                            ...options.headers,
                        },
                    });

                    const retryData = await retryResponse.json();

                    if (!retryResponse.ok) {
                        console.error('❌ Request failed after token refresh:', retryResponse.status);
                        throw new ApiError(
                            retryResponse.status,
                            retryData.message || 'Request failed after token refresh',
                            retryData
                        );
                    }

                    console.log('✅ Request successful after token refresh');
                    return retryData;
                } catch (refreshError) {
                    // Refresh başarısız oldu, kullanıcı zaten login'e yönlendirildi
                    console.error('❌ Token refresh failed, user will be redirected to login');
                    throw refreshError;
                }
            }

            const data = await response.json();

            if (!response.ok) {
                console.error(`❌ Request failed with status ${response.status}:`, data);
                throw new ApiError(
                    response.status,
                    data.message || 'Request failed',
                    data
                );
            }

            return data;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            console.error('❌ Network error or server unavailable:', error);
            throw new ApiError(500, 'Network error or server unavailable');
        }
    }

    /**
     * Make authenticated GET request
     */
    static async get<T>(endpoint: string): Promise<T> {
        return this.fetch<T>(endpoint, { method: 'GET' });
    }

    /**
     * Make authenticated POST request
     */
    static async post<T>(endpoint: string, body?: any): Promise<T> {
        return this.fetch<T>(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    /**
     * Make authenticated PUT request
     */
    static async put<T>(endpoint: string, body?: any): Promise<T> {
        return this.fetch<T>(endpoint, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    /**
     * Make authenticated DELETE request
     */
    static async delete<T>(endpoint: string): Promise<T> {
        return this.fetch<T>(endpoint, { method: 'DELETE' });
    }
}

/**
 * Convenience export
 */
export const authFetch = AuthenticatedRequestHandler.fetch.bind(AuthenticatedRequestHandler);
export const authGet = AuthenticatedRequestHandler.get.bind(AuthenticatedRequestHandler);
export const authPost = AuthenticatedRequestHandler.post.bind(AuthenticatedRequestHandler);
export const authPut = AuthenticatedRequestHandler.put.bind(AuthenticatedRequestHandler);
export const authDelete = AuthenticatedRequestHandler.delete.bind(AuthenticatedRequestHandler);
