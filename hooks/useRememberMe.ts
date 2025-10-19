import { useState, useEffect } from 'react';

const REMEMBER_ME_KEY = 'remember-me-email';

interface UseRememberMeReturn {
    savedEmail: string;
    rememberMe: boolean;
    setRememberMe: (value: boolean) => void;
    saveCredentials: (email: string, remember: boolean) => void;
    clearCredentials: () => void;
}

/**
 * Custom hook for "Remember Me" functionality
 * Stores only email (never password) in localStorage
 * Follows security best practices
 */
export function useRememberMe(): UseRememberMeReturn {
    const [savedEmail, setSavedEmail] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    // Load saved email on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem(REMEMBER_ME_KEY);
                if (saved) {
                    setSavedEmail(saved);
                    setRememberMe(true);
                }
            } catch (error) {
                console.error('Failed to load saved credentials:', error);
            }
        }
    }, []);

    // Save email to localStorage
    const saveCredentials = (email: string, remember: boolean) => {
        if (typeof window === 'undefined') return;

        try {
            if (remember && email) {
                localStorage.setItem(REMEMBER_ME_KEY, email);
            } else {
                localStorage.removeItem(REMEMBER_ME_KEY);
            }
        } catch (error) {
            console.error('Failed to save credentials:', error);
        }
    };

    // Clear saved credentials
    const clearCredentials = () => {
        if (typeof window === 'undefined') return;

        try {
            localStorage.removeItem(REMEMBER_ME_KEY);
            setSavedEmail('');
            setRememberMe(false);
        } catch (error) {
            console.error('Failed to clear credentials:', error);
        }
    };

    return {
        savedEmail,
        rememberMe,
        setRememberMe,
        saveCredentials,
        clearCredentials,
    };
}
