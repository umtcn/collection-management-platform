'use client';

import { useState } from 'react';
import {
    Sun,
    Moon,
    Bell,
    Mail,
    Settings,
    Menu,
    Globe,
    User,
    LogOut,
} from 'lucide-react';
import { useUIStore, useAuthStore } from '@/store';
import { useRouter } from 'next/navigation';

interface HeaderProps {
    onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    const router = useRouter();
    const theme = useUIStore((state) => state.theme);
    const toggleTheme = useUIStore((state) => state.toggleTheme);
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            // Use window.location for full page reload to ensure clean state
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout error:', error);
            // Still redirect even if logout API fails
            window.location.href = '/login';
        }
    };

    return (
        <header className="h-16 bg-white dark:bg-dark-card border-b border-light-border dark:border-dark-border sticky top-0 z-30">
            <div className="h-full px-4 flex items-center justify-between">
                {/* Left Side */}
                <div className="flex items-center gap-4">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                        aria-label="Toggle menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    {/* Page Title - Hidden on mobile */}
                    <div className="hidden md:block">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Koleksiyon
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Koleksiyon Listesi
                        </p>
                    </div>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-2">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                        aria-label="Toggle theme"
                    >
                        {theme === 'light' ? (
                            <Sun className="w-5 h-5 text-primary-600" />
                        ) : (
                            <Moon className="w-5 h-5 text-primary-400" />
                        )}
                    </button>

                    {/* Language/Globe */}
                    <button
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                        aria-label="Language"
                    >
                        <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>

                    {/* Notifications */}
                    <button
                        className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                        aria-label="Notifications"
                    >
                        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full" />
                    </button>

                    {/* Mail */}
                    <button
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                        aria-label="Mail"
                    >
                        <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>

                    {/* Settings */}
                    <button
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                        aria-label="Settings"
                    >
                        <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>

                    {/* Profile Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                            aria-label="Profile menu"
                        >
                            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            </div>
                        </button>

                        {/* Dropdown Menu */}
                        {showProfileMenu && (
                            <>
                                {/* Backdrop */}
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowProfileMenu(false)}
                                />

                                {/* Menu */}
                                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg shadow-lg z-50 animate-fade-in">
                                    <div className="p-3 border-b border-light-border dark:border-dark-border">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {user?.name || 'User'}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {user?.email}
                                        </p>
                                    </div>

                                    <div className="p-2">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}