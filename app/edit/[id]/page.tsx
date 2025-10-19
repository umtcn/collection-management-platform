'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Filter, X, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { DashboardLayout } from '@/components/layout';
import ViewModeToggle from '@/components/ui/ViewModeToggle';
import WarningModal from '@/components/ui/WarningModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import FilterModal from '@/components/ui/FilterModal';
import RequestModal from '@/components/ui/RequestModal';
import { useAuthStore } from '@/store';
import { authPost, authGet } from '@/lib/auth-request-handler';
import type { SecilProduct } from '@/types/secil-api';

type ViewMode = 'square' | 'list' | 'grid';

interface FilterValue {
    value: string;
    valueName: string;
}

interface FilterData {
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

export default function EditCollectionPage() {
    const router = useRouter();
    const params = useParams();
    const token = useAuthStore((state) => state.token);
    const collectionId = params?.id as string;

    const [products, setProducts] = useState<SecilProduct[]>([]);
    const [pinnedSlots, setPinnedSlots] = useState<(SecilProduct | null)[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<SecilProduct | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const [pinnedPage, setPinnedPage] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [warningMessage, setWarningMessage] = useState({ title: '', message: '' });
    const [touchDragData, setTouchDragData] = useState<{ product: SecilProduct; fromSlotIndex: number | null } | null>(null);
    const [touchStartTime, setTouchStartTime] = useState<number>(0);
    const [touchMoved, setTouchMoved] = useState(false);
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
    const [showRemoveSuccess, setShowRemoveSuccess] = useState(false);
    const [showRemoveError, setShowRemoveError] = useState(false);
    const [slotToRemove, setSlotToRemove] = useState<number | null>(null);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [availableFilters, setAvailableFilters] = useState<FilterData[]>([]);
    const [selectedFilters, setSelectedFilters] = useState<SelectedFilter[]>([]);
    const [isLoadingFilters, setIsLoadingFilters] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [showSaveRequest, setShowSaveRequest] = useState(false);
    const pageSize = 36;
    const pinnedSlotsPerPage = 36; // Same as pageSize - show same number of slots per page

    // Get border color based on product status (for collection products only)
    const getProductBorderColor = (product: SecilProduct, isPinned: boolean): string => {
        // Purple: Product is pinned (moved to pinned slots)
        if (isPinned) {
            return 'border-purple-500 dark:border-purple-400';
        }
        // Yellow: Out of stock
        if (product.outOfStock) {
            return 'border-yellow-500 dark:border-yellow-400';
        }
        // Red: Not active (isSaleB2B false)
        if (!product.isSaleB2B) {
            return 'border-red-500 dark:border-red-400';
        }
        // Black: Active and in stock
        return 'border-black dark:border-white';
    };

    // Calculate total pinned pages based on total products
    const totalPinnedPages = Math.ceil(totalProducts / pinnedSlotsPerPage);

    // Initialize pinnedSlots when totalProducts changes
    useEffect(() => {
        if (totalProducts > 0) {
            setPinnedSlots(Array(totalProducts).fill(null));
        }
    }, [totalProducts]);

    // Ensure pinnedPage is within valid range
    useEffect(() => {
        if (totalPinnedPages > 0 && pinnedPage > totalPinnedPages) {
            setPinnedPage(totalPinnedPages);
        }
    }, [totalPinnedPages, pinnedPage]);

    useEffect(() => {
        if (!token) {
            router.push('/login');
            return;
        }

        fetchProducts(selectedFilters);
    }, [currentPage, token, collectionId, selectedFilters]);

    const fetchProducts = async (additionalFilters: SelectedFilter[] = []) => {
        setIsLoading(true);
        setError('');

        try {
            // Next.js API route üzerinden (server-side)
            const data = await authPost(
                `/api/collections/${collectionId}/products`,
                {
                    additionalFilters,
                    page: currentPage,
                    pageSize: pageSize,
                }
            ) as any;

            if (data.success) {
                setProducts(data.data || []);
                setTotalProducts(data.meta?.totalProduct || 0);
            } else {
                setError(data.message || 'Failed to fetch products');
            }
        } catch (err) {
            setError('An error occurred while fetching products');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchFilters = async () => {
        setIsLoadingFilters(true);

        try {
            // Next.js API route üzerinden (server-side)
            const data = await authGet(`/api/collections/${collectionId}/filters`) as any;

            if (data.success) {
                setAvailableFilters(data.data || []);
            }
        } catch (err) {
            // Filters optional, silently fail
        } finally {
            setIsLoadingFilters(false);
        }
    };

    const applyFilters = (filters: SelectedFilter[]) => {
        setSelectedFilters(filters);
        setShowFilterModal(false);
        fetchProducts(filters);
    };

    const handleRemoveFilter = (filterId: string, filterValue: string) => {
        const updatedFilters = selectedFilters.filter(
            (f) => !(f.id === filterId && f.value === filterValue)
        );
        setSelectedFilters(updatedFilters);
        setCurrentPage(1); // Reset to first page when filters change
        fetchProducts(updatedFilters);
    };

    const handleProductClick = (product: SecilProduct) => {
        setSelectedProduct(product);
    };

    const handleSlotClick = (slotIndex: number) => {
        if (selectedProduct) {
            // Check if product is already pinned in another slot (check both productCode and colorCode)
            const existingSlotIndex = pinnedSlots.findIndex(
                (slot) => slot?.productCode === selectedProduct.productCode && slot?.colorCode === selectedProduct.colorCode
            );

            if (existingSlotIndex !== -1 && existingSlotIndex !== slotIndex) {
                // Product already exists in another slot
                setWarningMessage({
                    title: 'Ürün Zaten Eklendi',
                    message: `Bu ürün zaten ${existingSlotIndex + 1}. sabitte ekli. Bir ürün sadece bir sabitte bulunabilir. Önce mevcut konumdan kaldırarak başka bir yere taşıyabilirsiniz.`
                });
                setShowWarningModal(true);
                setSelectedProduct(null);
                return;
            }

            const newSlots = [...pinnedSlots];
            newSlots[slotIndex] = selectedProduct;
            setPinnedSlots(newSlots);
            setSelectedProduct(null);
        }
    };

    const handleUnpinProduct = (slotIndex: number) => {
        // Show confirmation modal
        setSlotToRemove(slotIndex);
        setShowRemoveConfirm(true);
    };

    const confirmRemoveProduct = () => {
        if (slotToRemove === null) return;

        try {
            const newSlots = [...pinnedSlots];
            newSlots[slotToRemove] = null;
            setPinnedSlots(newSlots);

            // Show success modal
            setShowRemoveSuccess(true);
            setSlotToRemove(null);
        } catch (error) {
            // Show error modal
            setShowRemoveError(true);
            setSlotToRemove(null);
        }
    };

    const cancelRemoveProduct = () => {
        // Show error modal when user cancels
        setShowRemoveError(true);
        setSlotToRemove(null);
    };

    // Drag & Drop Handlers
    const handleDragStart = (e: React.DragEvent, product: SecilProduct, fromSlotIndex?: number) => {
        e.dataTransfer.effectAllowed = 'move';
        const dragData = {
            product,
            fromSlotIndex: fromSlotIndex !== undefined ? fromSlotIndex : null
        };
        e.dataTransfer.setData('application/json', JSON.stringify(dragData));
        // Visual feedback: set selected product
        setSelectedProduct(product);
    };

    const handleDragEnd = (e: React.DragEvent) => {
        // Clear selection after drag ends
        setSelectedProduct(null);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, toSlotIndex: number) => {
        e.preventDefault();
        try {
            const dragData = JSON.parse(e.dataTransfer.getData('application/json'));
            const product = dragData.product as SecilProduct;
            const fromSlotIndex = dragData.fromSlotIndex;

            // If dragging from a slot to another slot (reordering)
            if (fromSlotIndex !== null && fromSlotIndex !== undefined) {
                const newSlots = [...pinnedSlots];
                const draggedProduct = newSlots[fromSlotIndex];
                const targetProduct = newSlots[toSlotIndex];

                // Swap the products
                newSlots[toSlotIndex] = draggedProduct;
                newSlots[fromSlotIndex] = targetProduct;

                setPinnedSlots(newSlots);
                setSelectedProduct(null);
                return;
            }

            // If dragging from collection to slot
            // Check if product is already pinned in another slot (check both productCode and colorCode)
            const existingSlotIndex = pinnedSlots.findIndex(
                (slot) => slot?.productCode === product.productCode && slot?.colorCode === product.colorCode
            );

            if (existingSlotIndex !== -1 && existingSlotIndex !== toSlotIndex) {
                // Product already exists in another slot
                setWarningMessage({
                    title: 'Ürün Zaten Eklendi',
                    message: `Bu ürün zaten ${existingSlotIndex + 1}. sabitte ekli. Bir ürün sadece bir sabitte bulunabilir. Önce mevcut konumdan kaldırarak başka bir yere taşıyabilirsiniz.`
                });
                setShowWarningModal(true);
                setSelectedProduct(null);
                return;
            }

            const newSlots = [...pinnedSlots];
            newSlots[toSlotIndex] = product;
            setPinnedSlots(newSlots);
            setSelectedProduct(null);
        } catch (err) {
            console.error('Failed to parse drag data:', err);
        }
    };

    // Touch Event Handlers for Mobile
    const handleTouchStart = (e: React.TouchEvent, product: SecilProduct, fromSlotIndex?: number) => {
        setTouchStartTime(Date.now());
        setTouchMoved(false);

        const dragData = {
            product,
            fromSlotIndex: fromSlotIndex !== undefined ? fromSlotIndex : null
        };
        setTouchDragData(dragData);
        setSelectedProduct(product);

        // Add visual feedback
        const target = e.currentTarget as HTMLElement;
        target.style.opacity = '0.5';
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!touchDragData) return;

        setTouchMoved(true);

        // Get element under touch point
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);

        // Find the slot element if we're over one
        const slotElement = element?.closest('[data-slot-index]');
        if (slotElement) {
            // Add hover effect
            slotElement.classList.add('ring-2', 'ring-primary-500');
        }

        // Remove hover effect from other slots
        document.querySelectorAll('[data-slot-index]').forEach(slot => {
            if (slot !== slotElement) {
                slot.classList.remove('ring-2', 'ring-primary-500');
            }
        });
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!touchDragData) return;

        // Reset opacity
        const target = e.currentTarget as HTMLElement;
        target.style.opacity = '1';

        // Remove all hover effects
        document.querySelectorAll('[data-slot-index]').forEach(slot => {
            slot.classList.remove('ring-2', 'ring-primary-500');
        });

        // If touch was quick and didn't move much, it's a tap/click - let onClick handle it
        const touchDuration = Date.now() - touchStartTime;
        if (!touchMoved && touchDuration < 200) {
            setSelectedProduct(null);
            setTouchDragData(null);
            setTouchMoved(false);
            return;
        }

        // Get the element under the last touch position
        const changedTouch = e.changedTouches[0];
        const element = document.elementFromPoint(changedTouch.clientX, changedTouch.clientY);
        const slotElement = element?.closest('[data-slot-index]');

        if (slotElement) {
            const toSlotIndex = parseInt(slotElement.getAttribute('data-slot-index') || '-1');

            if (toSlotIndex >= 0) {
                const product = touchDragData.product;
                const fromSlotIndex = touchDragData.fromSlotIndex;

                // If dragging from a slot to another slot (reordering)
                if (fromSlotIndex !== null && fromSlotIndex !== undefined) {
                    if (fromSlotIndex !== toSlotIndex) {
                        const newSlots = [...pinnedSlots];
                        const draggedProduct = newSlots[fromSlotIndex];
                        const targetProduct = newSlots[toSlotIndex];

                        // Swap the products
                        newSlots[toSlotIndex] = draggedProduct;
                        newSlots[fromSlotIndex] = targetProduct;

                        setPinnedSlots(newSlots);
                    }
                    setSelectedProduct(null);
                    setTouchDragData(null);
                    setTouchMoved(false);
                    return;
                }

                // If dragging from collection to slot
                const existingSlotIndex = pinnedSlots.findIndex(
                    (slot) => slot?.productCode === product.productCode && slot?.colorCode === product.colorCode
                );

                if (existingSlotIndex !== -1 && existingSlotIndex !== toSlotIndex) {
                    setWarningMessage({
                        title: 'Ürün Zaten Eklendi',
                        message: `Bu ürün zaten ${existingSlotIndex + 1}. sabitte ekli. Bir ürün sadece bir sabitte bulunabilir. Önce mevcut konumdan kaldırarak başka bir yere taşıyabilirsiniz.`
                    });
                    setShowWarningModal(true);
                    setSelectedProduct(null);
                    setTouchDragData(null);
                    setTouchMoved(false);
                    return;
                }

                const newSlots = [...pinnedSlots];
                newSlots[toSlotIndex] = product;
                setPinnedSlots(newSlots);
            }
        }

        setSelectedProduct(null);
        setTouchDragData(null);
        setTouchMoved(false);
    };

    const handleTouchCancel = (e: React.TouchEvent) => {
        // Reset state
        const target = e.currentTarget as HTMLElement;
        target.style.opacity = '1';

        // Remove all hover effects
        document.querySelectorAll('[data-slot-index]').forEach(slot => {
            slot.classList.remove('ring-2', 'ring-primary-500');
        });

        setSelectedProduct(null);
        setTouchDragData(null);
        setTouchMoved(false);
    };

    const isProductPinned = (productCode: string, colorCode: string) => {
        return pinnedSlots.some((slot) =>
            slot?.productCode === productCode && slot?.colorCode === colorCode
        );
    };

    // Handle Cancel button click
    const handleCancel = () => {
        setShowCancelConfirm(true);
    };

    // Confirm cancel - redirect to collections page
    const confirmCancel = () => {
        setShowCancelConfirm(false);
        router.push('/collections');
    };

    // Handle Save button click
    const handleSave = () => {
        setShowSaveConfirm(true);
    };

    // Confirm save - show request modal
    const confirmSave = () => {
        setShowSaveConfirm(false);
        setShowSaveRequest(true);
    };

    // Get grid classes based on view mode for pinned slots
    const getPinnedGridClasses = () => {
        switch (viewMode) {
            case 'square':
                // Web: 2 columns, Mobile: 1 column (larger images)
                return 'grid grid-cols-1 md:grid-cols-2 gap-4';
            case 'list':
                // Web: 3 columns, Mobile: 2 columns (current default)
                return 'grid grid-cols-2 md:grid-cols-3 gap-4';
            case 'grid':
                // Web: 4 columns, Mobile: 3 columns (smaller images)
                return 'grid grid-cols-3 md:grid-cols-4 gap-3';
            default:
                return 'grid grid-cols-2 md:grid-cols-3 gap-4';
        }
    };

    const currentPinnedSlots = pinnedSlots.slice(
        (pinnedPage - 1) * pinnedSlotsPerPage,
        pinnedPage * pinnedSlotsPerPage
    );

    const totalPages = Math.ceil(totalProducts / pageSize);

    return (
        <DashboardLayout>
            <div className="space-y-4">
                {/* Header */}
                <div className="flex flex-col gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Sabitleri Düzenle
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Koleksiyon - {collectionId} / {totalProducts} Ürün
                        </p>
                    </div>

                    {/* Filters - Responsive */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        {/* Mobile: Buttons on top, Desktop: Filters on left */}
                        <div className="flex items-center justify-between md:justify-start gap-2 md:gap-3 order-2 md:order-1 flex-1 md:min-w-0">
                            {/* Applied Filters - Full width on mobile, wrapping on desktop */}
                            {selectedFilters.length > 0 && (
                                <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
                                    {selectedFilters.map((filter) => (
                                        <div
                                            key={`${filter.id}-${filter.value}`}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-xs md:text-sm"
                                        >
                                            <span className="font-medium text-blue-900 dark:text-blue-100">
                                                {filter.filterTitle}: {filter.valueName}
                                            </span>
                                            <button
                                                onClick={() => handleRemoveFilter(filter.id, filter.value)}
                                                className="p-0.5 hover:bg-blue-100 dark:hover:bg-blue-800 rounded transition-colors"
                                                aria-label="Filtreyi kaldır"
                                            >
                                                <X className="w-3 h-3 text-blue-700 dark:text-blue-300" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Mobile: Top row, Desktop: Right side - Filter Button & View Mode Toggle */}
                        <div className="flex items-center justify-end gap-2 md:gap-3 order-1 md:order-2 shrink-0">
                            {/* Filter Button */}
                            <button
                                onClick={() => {
                                    setShowFilterModal(true);
                                    fetchFilters();
                                }}
                                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors shrink-0"
                            >
                                <Filter className="w-4 h-4" />
                                <span className="text-xs md:text-sm font-medium">Filtreler</span>
                            </button>

                            {/* View Mode Toggle */}
                            <ViewModeToggle currentMode={viewMode} onChange={setViewMode} />
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Collection Products Panel */}
                    <div className="card p-4 flex flex-col">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex-shrink-0">
                            Koleksiyon Ürünleri
                            {selectedProduct && (
                                <span className="ml-3 text-sm text-primary-600 dark:text-primary-400">
                                    (Seçili: {selectedProduct.productCode} - Bir sabite tıklayın)
                                </span>
                            )}
                        </h3>

                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500 dark:text-gray-400">No products found</p>
                            </div>
                        ) : (
                            <>
                                {/* Products Grid - Scrollable */}
                                <div className="overflow-y-auto h-[480px] pr-2" style={{ touchAction: 'pan-y' }}>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {products.map((product, index) => {
                                            const isPinned = isProductPinned(product.productCode, product.colorCode);
                                            const isSelected = selectedProduct?.productCode === product.productCode && selectedProduct?.colorCode === product.colorCode;
                                            const borderColor = getProductBorderColor(product, isPinned);

                                            return (
                                                <div
                                                    key={`${product.productCode}-${index}`}
                                                    draggable={true}
                                                    onDragStart={(e) => handleDragStart(e, product)}
                                                    onDragEnd={handleDragEnd}
                                                    onTouchStart={(e) => handleTouchStart(e, product)}
                                                    onTouchMove={handleTouchMove}
                                                    onTouchEnd={handleTouchEnd}
                                                    onTouchCancel={handleTouchCancel}
                                                    onClick={() => handleProductClick(product)}
                                                    className={`relative bg-white dark:bg-dark-card border-2 rounded-lg overflow-hidden shadow-sm transition-all duration-200 cursor-move hover:shadow-md ${isSelected
                                                        ? 'ring-2 ring-primary-300 ' + borderColor
                                                        : borderColor
                                                        }`}
                                                >
                                                    {/* Pinned Badge */}
                                                    {isPinned && (
                                                        <div className="absolute top-0 left-0 right-0 bg-black/70 text-white text-center py-2 z-10">
                                                            <span className="text-xs font-semibold">Eklendi</span>
                                                        </div>
                                                    )}

                                                    {/* Image */}
                                                    <div className="relative w-full pt-[133%] bg-gray-200 dark:bg-gray-700">
                                                        {product.imageUrl ? (
                                                            <Image
                                                                src={product.imageUrl}
                                                                alt={product.name || product.productCode}
                                                                fill
                                                                className="object-cover"
                                                                sizes="(max-width: 768px) 50vw, 33vw"
                                                                loading={index < 6 ? undefined : 'lazy'}
                                                                priority={index < 6}
                                                                quality={75}
                                                            />
                                                        ) : (
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <span className="text-gray-400 text-sm">No Image</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Info */}
                                                    <div className="p-3">
                                                        <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                                            {product.name || 'Product'}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            {product.productCode}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Pagination */}
                                <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-light-border dark:border-dark-border">
                                    {Array.from({ length: Math.min(9, totalPages) }, (_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${currentPage === i + 1
                                                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Pinned Products Panel */}
                    <div className="card p-4 flex flex-col">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Sabitler
                        </h3>

                        {/* Pinned Slots - Dynamic grid based on view mode */}
                        <div className="h-[500px] overflow-y-auto overflow-x-hidden" style={{ touchAction: 'pan-y' }}>
                            <div className={getPinnedGridClasses()}>
                                {currentPinnedSlots.map((product, index) => {
                                    const globalIndex = (pinnedPage - 1) * pinnedSlotsPerPage + index;

                                    return (
                                        <div
                                            key={`slot-${globalIndex}`}
                                            data-slot-index={globalIndex}
                                            draggable={!!product}
                                            onDragStart={(e) => product && handleDragStart(e, product, globalIndex)}
                                            onDragEnd={handleDragEnd}
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, globalIndex)}
                                            onTouchStart={(e) => product && handleTouchStart(e, product, globalIndex)}
                                            onTouchMove={handleTouchMove}
                                            onTouchEnd={handleTouchEnd}
                                            onTouchCancel={handleTouchCancel}
                                            onClick={() => handleSlotClick(globalIndex)}
                                            className={`relative border-2 rounded-lg overflow-hidden transition-all duration-200 flex items-center justify-center w-full aspect-[3/4] ${product
                                                    ? 'cursor-move border-solid border-gray-300 dark:border-gray-700'
                                                    : `cursor-pointer border-dashed ${selectedProduct
                                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30'
                                                        : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                                                    }`
                                                }`}
                                        >
                                            {product ? (
                                                <>
                                                    {/* Product Image */}
                                                    <div className="relative w-full h-full group">
                                                        {product.imageUrl ? (
                                                            <Image
                                                                src={product.imageUrl}
                                                                alt={product.name || product.productCode}
                                                                fill
                                                                className="object-cover transition-all duration-300"
                                                                sizes="33vw"
                                                                loading="lazy"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                                <span className="text-gray-400 text-sm">No Image</span>
                                                            </div>
                                                        )}

                                                        {/* Hover Overlay with Blur and Trash Icon - Desktop Only */}
                                                        <div className="hidden md:flex absolute inset-0 bg-black/0 hover:bg-black/40 backdrop-blur-0 hover:backdrop-blur-sm transition-all duration-300 items-center justify-center opacity-0 hover:opacity-100">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleUnpinProduct(globalIndex);
                                                                }}
                                                                className="p-3 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:scale-110 transition-transform duration-200"
                                                                aria-label="Remove from pinned"
                                                            >
                                                                <Trash2 className="w-6 h-6 text-red-500" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Remove Button - Mobile Only (top-right X) */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleUnpinProduct(globalIndex);
                                                        }}
                                                        className="md:hidden absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md shadow-md transition-colors z-10"
                                                        aria-label="Remove from pinned"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>

                                                    {/* Product Info */}
                                                    <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-dark-card p-2 border-t border-gray-200 dark:border-gray-700">
                                                        <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                                                            {product.name || 'Product'}
                                                        </p>
                                                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                                            {product.productCode}
                                                        </p>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-center p-4">
                                                    <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    {selectedProduct && (
                                                        <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                                                            Tıklayın
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Pagination - Independent navigation */}
                        <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-light-border dark:border-dark-border flex-wrap">
                            {/* Previous Button */}
                            {totalPinnedPages > 1 && (
                                <button
                                    onClick={() => setPinnedPage(Math.max(1, pinnedPage - 1))}
                                    disabled={pinnedPage === 1}
                                    className="w-8 h-8 rounded-md text-sm font-medium transition-colors bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    ←
                                </button>
                            )}

                            {/* Page Numbers */}
                            {Array.from({ length: Math.min(totalPinnedPages, 10) }, (_, i) => {
                                let pageNum;
                                // Show first 10 pages or pages around current page
                                if (totalPinnedPages <= 10) {
                                    pageNum = i + 1;
                                } else {
                                    // Show current page and surrounding pages
                                    const startPage = Math.max(1, Math.min(pinnedPage - 5, totalPinnedPages - 9));
                                    pageNum = startPage + i;
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setPinnedPage(pageNum)}
                                        className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${pinnedPage === pageNum
                                            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            {/* Show total pages indicator if more than 10 pages */}
                            {totalPinnedPages > 10 && (
                                <span className="text-xs text-gray-500 dark:text-gray-400 px-2">
                                    / {totalPinnedPages}
                                </span>
                            )}

                            {/* Next Button */}
                            {totalPinnedPages > 1 && (
                                <button
                                    onClick={() => setPinnedPage(Math.min(totalPinnedPages, pinnedPage + 1))}
                                    disabled={pinnedPage === totalPinnedPages}
                                    className="w-8 h-8 rounded-md text-sm font-medium transition-colors bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    →
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={handleCancel}
                        className="px-6 py-2.5 border border-light-border dark:border-dark-border rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        Vazgeç
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                    >
                        Kaydet
                    </button>
                </div>
            </div>

            {/* Warning Modal */}
            <WarningModal
                isOpen={showWarningModal}
                onClose={() => setShowWarningModal(false)}
                title={warningMessage.title}
                message={warningMessage.message}
            />

            {/* Remove Confirmation Modal */}
            <ConfirmModal
                isOpen={showRemoveConfirm}
                onClose={() => setShowRemoveConfirm(false)}
                onConfirm={confirmRemoveProduct}
                onCancel={cancelRemoveProduct}
                type="warning"
                title="Uyarı!"
                message="Sabitlerden Çıkarılacaktır Emin Misiniz?"
                confirmText="Onayla"
                cancelText="Vazgeç"
            />

            {/* Remove Success Modal */}
            <ConfirmModal
                isOpen={showRemoveSuccess}
                onClose={() => setShowRemoveSuccess(false)}
                type="success"
                title="Başarılı!"
                message="Sabitler İçerisinden Çıkarıldı."
                confirmText="Tamam"
            />

            {/* Remove Error Modal */}
            <ConfirmModal
                isOpen={showRemoveError}
                onClose={() => setShowRemoveError(false)}
                type="error"
                title="Uyarı!"
                message="Sabitler İçerisinden Çıkarılırken Hata Oluştu."
                confirmText="Tamam"
            />

            {/* Filter Modal */}
            <FilterModal
                isOpen={showFilterModal}
                onClose={() => setShowFilterModal(false)}
                onApply={applyFilters}
                filters={availableFilters}
                selectedFilters={selectedFilters}
                isLoading={isLoadingFilters}
            />

            {/* Cancel Confirmation Modal */}
            <ConfirmModal
                isOpen={showCancelConfirm}
                onClose={() => setShowCancelConfirm(false)}
                onConfirm={confirmCancel}
                onCancel={() => setShowCancelConfirm(false)}
                type="warning"
                title="Emin Misiniz?"
                message="Yaptığınız değişiklikler kaydedilmeyecek. Devam etmek istiyor musunuz?"
                confirmText="Evet, Vazgeç"
                cancelText="Hayır"
            />

            {/* Save Confirmation Modal */}
            <ConfirmModal
                isOpen={showSaveConfirm}
                onClose={() => setShowSaveConfirm(false)}
                onConfirm={confirmSave}
                onCancel={() => setShowSaveConfirm(false)}
                type="warning"
                title="Kaydet"
                message="Değişiklikleri kaydetmek istediğinize emin misiniz?"
                confirmText="Evet, Kaydet"
                cancelText="Hayır"
            />

            {/* Save Request Modal */}
            <RequestModal
                isOpen={showSaveRequest}
                onClose={() => setShowSaveRequest(false)}
                requestData={{
                    collectionId: collectionId,
                    pinnedProducts: pinnedSlots
                        .map((product, index) => product ? {
                            slotIndex: index,
                            productCode: product.productCode,
                            colorCode: product.colorCode,
                            name: product.name,
                        } : null)
                        .filter(Boolean),
                    filters: selectedFilters,
                    totalPinnedCount: pinnedSlots.filter(slot => slot !== null).length,
                }}
            />
        </DashboardLayout>
    );
}