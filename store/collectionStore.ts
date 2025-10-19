import { create } from 'zustand';
import { CollectionState, Collection } from '@/types';

const useCollectionStore = create<CollectionState>((set) => ({
    collections: [],
    currentCollection: null,
    isLoading: false,
    error: null,

    fetchCollections: async () => {
        set({ isLoading: true, error: null });

        try {
            const response = await fetch('/api/collections');
            const data = await response.json();

            if (data.success) {
                set({
                    collections: data.data || [],
                    isLoading: false,
                });
            } else {
                set({
                    error: data.message || 'Failed to fetch collections',
                    isLoading: false,
                });
            }
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'An error occurred',
                isLoading: false,
            });
        }
    },

    setCurrentCollection: (collection: Collection | null) => {
        set({ currentCollection: collection });
    },
}));

export default useCollectionStore;
