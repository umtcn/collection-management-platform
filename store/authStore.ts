import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthState, LoginCredentials, User } from '@/types';

interface AuthStateExtended extends AuthState {
    token: string | null;
    refreshToken: string | null;
    setTokens: (token: string, refreshToken: string) => void;
    updateUser: (user: User) => void;
}

/**
 * Decode JWT token to extract user info
 */
function decodeJWT(token: string): any {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Failed to decode JWT:', error);
        return null;
    }
}

/**
 * Extract user information from JWT token
 */
function getUserFromToken(token: string, email: string): User {
    const decoded = decodeJWT(token);

    if (decoded) {
        return {
            id: decoded.sub || email,
            email: decoded.email || email,
            name: decoded.name || decoded.given_name || email.split('@')[0],
            role: 'user',
        };
    }

    // Fallback if decode fails
    return {
        id: email,
        email: email,
        name: email.split('@')[0],
        role: 'user',
    };
}

const useAuthStore = create<AuthStateExtended>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            token: null,
            refreshToken: null,

            login: async (credentials: LoginCredentials) => {
                set({ isLoading: true });

                try {
                    const response = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(credentials),
                    });

                    const data = await response.json();

                    if (data.success && data.token) {
                        // Extract user info from JWT token
                        const user = getUserFromToken(data.token, credentials.email);

                        set({
                            user,
                            isAuthenticated: true,
                            isLoading: false,
                            token: data.token,
                            refreshToken: data.refreshToken,
                        });
                    } else {
                        set({ isLoading: false });
                        throw new Error(data.message || 'Login failed');
                    }
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            logout: async () => {
                // Call logout endpoint to clear cookie
                try {
                    await fetch('/api/auth/logout', {
                        method: 'POST',
                    });
                } catch (error) {
                    console.error('Logout API error:', error);
                }

                set({
                    user: null,
                    isAuthenticated: false,
                    token: null,
                    refreshToken: null,
                });

                // Clear localStorage
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('auth-storage');
                }
            },

            setUser: (user: User | null) => {
                set({
                    user,
                    isAuthenticated: !!user,
                });
            },

            updateUser: (user: User) => {
                set({ user });
            },

            setTokens: (token: string, refreshToken: string) => {
                const currentState = get();

                // If we have a new token, update user info from it
                if (token && currentState.user) {
                    const updatedUser = getUserFromToken(token, currentState.user.email);
                    set({
                        token,
                        refreshToken,
                        user: updatedUser,
                    });
                } else {
                    set({
                        token,
                        refreshToken,
                    });
                }
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
                token: state.token,
                refreshToken: state.refreshToken,
            }),
        }
    )
);

export default useAuthStore;