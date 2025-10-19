'use client';

import { useState, useEffect, useRef } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface FilterValue {
    value: string;
    valueName: string;
}

interface Filter {
    id: string;
    title: string;
    values: FilterValue[];
}

interface SelectedFilter {
    id: string;
    value: string;
    valueName: string;
    filterTitle: string;
    comparisonType: number;
}

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: SelectedFilter[]) => void;
    filters: Filter[];
    selectedFilters?: SelectedFilter[];
    isLoading?: boolean;
}

export default function FilterModal({
    isOpen,
    onClose,
    onApply,
    filters,
    selectedFilters: initialSelectedFilters = [],
    isLoading = false
}: FilterModalProps) {
    const [selectedFilters, setSelectedFilters] = useState<SelectedFilter[]>([]);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

    // Lock body scroll when modal is open
    useBodyScrollLock(isOpen);

    // Initialize selected filters when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedFilters(initialSelectedFilters);
        }
    }, [isOpen, initialSelectedFilters]);

    useEffect(() => {
        // Close modal on Escape key
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        // Close dropdown when clicking outside
        const handleClickOutside = (e: MouseEvent) => {
            if (openDropdown && dropdownRefs.current[openDropdown]) {
                const dropdown = dropdownRefs.current[openDropdown];
                if (dropdown && !dropdown.contains(e.target as Node)) {
                    setOpenDropdown(null);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openDropdown]);

    if (!isOpen) return null;

    const handleFilterSelect = (filter: Filter, value: FilterValue) => {
        // Skip empty values
        if (!value.value && value.value !== '0') {
            console.warn('⚠️ Skipping filter with empty value:', value);
            return;
        }

        setSelectedFilters(prev => {
            // Strict comparison for filter matching
            const exists = prev.find(f =>
                f.id === filter.id &&
                f.value === value.value &&
                f.valueName === value.valueName
            );

            if (exists) {
                // Remove filter if already selected (strict match)
                return prev.filter(f => !(
                    f.id === filter.id &&
                    f.value === value.value &&
                    f.valueName === value.valueName
                ));
            } else {
                // Add filter
                console.log('✅ Adding filter:', {
                    id: filter.id,
                    value: value.value,
                    valueName: value.valueName,
                    filterTitle: filter.title
                });

                return [...prev, {
                    id: filter.id,
                    value: value.value,
                    valueName: value.valueName,
                    filterTitle: filter.title,
                    comparisonType: 0
                }];
            }
        });
    };

    const handleRemoveFilter = (filterId: string, value: string) => {
        setSelectedFilters(prev => prev.filter(f => !(f.id === filterId && f.value === value)));
    };

    const isFilterSelected = (filterId: string, value: string) => {
        // Strict match
        return selectedFilters.some(f => f.id === filterId && f.value === value);
    };

    const toggleDropdown = (filterId: string) => {
        setOpenDropdown(prev => prev === filterId ? null : filterId);
    };

    const handleClearAll = () => {
        setSelectedFilters([]);
    };

    const handleApply = () => {
        onApply(selectedFilters);
        onClose();
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={handleBackdropClick}
        >
            <div
                className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-scale-in"
                data-scroll-lock-ignore
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Filtreler
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                        </div>
                    ) : filters.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 dark:text-gray-400">Filtre bulunamadı</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Filter Dropdowns */}
                            <div className="space-y-4">
                                {filters.map((filter) => {
                                    // Filter out empty values to prevent duplicate keys
                                    const validValues = filter.values.filter(v => v.value || v.value === '0');

                                    // Skip filter if no valid values
                                    if (validValues.length === 0) return null;

                                    return (
                                        <div key={filter.id} className="relative" ref={(el) => { dropdownRefs.current[filter.id] = el; }}>
                                            <button
                                                onClick={() => toggleDropdown(filter.id)}
                                                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
                                            >
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {filter.title}
                                                </span>
                                                <ChevronDown
                                                    className={`w-4 h-4 text-gray-500 transition-transform ${openDropdown === filter.id ? 'rotate-180' : ''
                                                        }`}
                                                />
                                            </button>

                                            {/* Dropdown Content */}
                                            {openDropdown === filter.id && (
                                                <div className="absolute z-10 w-full mt-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                    <div className="p-2">
                                                        {validValues.map((value, valueIndex) => {
                                                            const selected = isFilterSelected(filter.id, value.value);
                                                            // Unique key: filterId + value + index to prevent duplicates
                                                            const uniqueKey = `${filter.id}-${value.value || 'empty'}-${valueIndex}`;

                                                            return (
                                                                <button
                                                                    key={uniqueKey}
                                                                    onClick={() => {
                                                                        handleFilterSelect(filter, value);
                                                                    }}
                                                                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selected
                                                                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium'
                                                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center justify-between">
                                                                        <span>{value.valueName || '(Boş)'}</span>
                                                                        {selected && (
                                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                                <path
                                                                                    fillRule="evenodd"
                                                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                                    clipRule="evenodd"
                                                                                />
                                                                            </svg>
                                                                        )}
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Applied Filters */}
                            {selectedFilters.length > 0 && (
                                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                                        Uygulanan Kriterler
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedFilters.map((filter) => (
                                            <div
                                                key={`${filter.id}-${filter.value}`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium border border-primary-200 dark:border-primary-800"
                                            >
                                                <span className="text-xs">{filter.filterTitle}:</span>
                                                <span>{filter.valueName}</span>
                                                <button
                                                    onClick={() => handleRemoveFilter(filter.id, filter.value)}
                                                    className="ml-1 hover:bg-primary-100 dark:hover:bg-primary-900/40 rounded-full p-0.5 transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={handleClearAll}
                        className="px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={selectedFilters.length === 0}
                    >
                        Tümünü Temizle
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 border border-light-border dark:border-dark-border rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            İptal
                        </button>
                        <button
                            onClick={handleApply}
                            className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                        >
                            Seçimi Tamamla
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
