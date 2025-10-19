import { create } from 'zustand';
import { FilterState, FilterOptions, AppliedCriterion } from '@/types';

const defaultFilters: FilterOptions = {
    categories: [],
    priceRange: {
        min: 0,
        max: 10000,
    },
    stockRange: {
        min: 0,
        max: 1000,
    },
    productCode: '',
    sortBy: undefined,
    appliedCriteria: [],
};

const useFilterStore = create<FilterState>((set, get) => ({
    filters: defaultFilters,
    isOpen: false,

    updateFilters: (newFilters: Partial<FilterOptions>) => {
        set((state) => ({
            filters: {
                ...state.filters,
                ...newFilters,
            },
        }));
    },

    clearFilters: () => {
        set({ filters: defaultFilters });
    },

    toggleFilterModal: () => {
        set((state) => ({ isOpen: !state.isOpen }));
    },

    addCriterion: (criterion: AppliedCriterion) => {
        const { filters } = get();
        const exists = filters.appliedCriteria.some(c => c.id === criterion.id);

        if (!exists) {
            set((state) => ({
                filters: {
                    ...state.filters,
                    appliedCriteria: [...state.filters.appliedCriteria, criterion],
                },
            }));
        }
    },

    removeCriterion: (criterionId: string) => {
        set((state) => ({
            filters: {
                ...state.filters,
                appliedCriteria: state.filters.appliedCriteria.filter(
                    c => c.id !== criterionId
                ),
            },
        }));
    },
}));

export default useFilterStore;
