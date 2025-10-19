import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UIState, Theme, ViewMode } from '@/types';

const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            theme: 'light',
            viewMode: 'grid',
            sidebarOpen: false,

            toggleTheme: () => {
                set((state) => {
                    const newTheme = state.theme === 'light' ? 'dark' : 'light';

                    // Update document class for theme
                    if (typeof document !== 'undefined') {
                        if (newTheme === 'dark') {
                            document.documentElement.classList.add('dark');
                        } else {
                            document.documentElement.classList.remove('dark');
                        }
                    }

                    return { theme: newTheme };
                });
            },

            setViewMode: (mode: ViewMode) => {
                set({ viewMode: mode });
            },

            toggleSidebar: () => {
                set((state) => ({ sidebarOpen: !state.sidebarOpen }));
            },

            setSidebarOpen: (open: boolean) => {
                set({ sidebarOpen: open });
            },
        }),
        {
            name: 'ui-storage',
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                // Apply theme on rehydration
                if (state && typeof document !== 'undefined') {
                    if (state.theme === 'dark') {
                        document.documentElement.classList.add('dark');
                    } else {
                        document.documentElement.classList.remove('dark');
                    }
                }
            },
        }
    )
);

export default useUIStore;
