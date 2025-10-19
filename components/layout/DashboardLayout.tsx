'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import { useUIStore } from '@/store';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();
    const sidebarOpen = useUIStore((state) => state.sidebarOpen);
    const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile on mount
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        // Migration: Reset sidebar state for mobile users
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('ui-storage');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (parsed?.state?.sidebarOpen && window.innerWidth < 1024) {
                        parsed.state.sidebarOpen = false;
                        localStorage.setItem('ui-storage', JSON.stringify(parsed));
                        setSidebarOpen(false);
                    }
                } catch (e) {
                    // Silently fail - not critical
                }
            }
        }

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        if (isMobile && sidebarOpen) {
            setSidebarOpen(false);
        }
    }, [pathname]); // Only depend on pathname

    // Close sidebar on initial load if mobile - removed duplicate
    // Already handled in mount effect above

    const handleCloseSidebar = () => {
        setSidebarOpen(false);
    };

    const handleOpenSidebar = () => {
        setSidebarOpen(true);
    };

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />

            {/* Main Content */}
            <div className="lg:ml-64 min-h-screen flex flex-col">
                {/* Header */}
                <Header onMenuClick={handleOpenSidebar} />

                {/* Page Content */}
                <main className="flex-1 p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}