'use client';

import Image from 'next/image';
import { GripVertical, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SecilProduct } from '@/types/secil-api';

interface ProductCardProps {
    product: SecilProduct;
    viewMode: 'grid' | 'list';
    isDragging?: boolean;
    onRemove?: () => void;
    showRemoveButton?: boolean;
    priority?: boolean;
}

export default function ProductCard({
    product,
    viewMode,
    isDragging = false,
    onRemove,
    showRemoveButton = false,
    priority = false,
}: ProductCardProps) {
    if (viewMode === 'list') {
        return (
            <div
                className={cn(
                    'product-card flex items-center gap-4 p-3',
                    isDragging && 'dragging'
                )}
            >
                {/* Drag Handle */}
                <div className="cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-5 h-5 text-gray-400" />
                </div>

                {/* Image */}
                <div className="relative w-16 h-16 flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden">
                    {product.imageUrl ? (
                        <Image
                            src={product.imageUrl}
                            alt={product.name || product.productCode}
                            fill
                            className="object-cover"
                            sizes="64px"
                            loading={priority ? undefined : 'lazy'}
                            priority={priority}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No Image</span>
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                        {product.name || 'Product'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {product.productCode}
                    </p>
                </div>

                {/* Remove Button */}
                {showRemoveButton && onRemove && (
                    <button
                        onClick={onRemove}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md transition-colors"
                        aria-label="Remove product"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>
        );
    }

    // Grid View
    return (
        <div
            className={cn(
                'product-card group relative',
                isDragging && 'dragging'
            )}
        >
            {/* Drag Handle Overlay */}
            <div className="absolute top-2 left-2 z-10 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white dark:bg-dark-card rounded-md p-1 shadow-md">
                    <GripVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
            </div>

            {/* Remove Button */}
            {showRemoveButton && onRemove && (
                <button
                    onClick={onRemove}
                    className="absolute top-2 right-2 z-10 p-1.5 bg-white dark:bg-dark-card hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove product"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            )}

            {/* Image */}
            <div className="relative w-full pt-[133%] bg-gray-200 dark:bg-gray-700 rounded-t-lg overflow-hidden">
                {product.imageUrl ? (
                    <Image
                        src={product.imageUrl}
                        alt={product.name || product.productCode}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        loading={priority ? undefined : 'lazy'}
                        priority={priority}
                        quality={75}
                        placeholder="blur"
                        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mM8/eJlPQAIRQMzgbe+2wAAAABJRU5ErkJggg=="
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No Image</span>
                    </div>
                )}

                {/* Stock Badge */}
                {product.outOfStock && (
                    <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 text-xs font-medium bg-red-500 text-white rounded-md">
                            Out of Stock
                        </span>
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
}