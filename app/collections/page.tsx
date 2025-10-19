'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit3, ChevronLeft, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { useAuthStore } from '@/store';
import { authGet } from '@/lib/auth-request-handler';
import type { SecilCollection } from '@/types/secil-api';

export default function CollectionsPage() {
    const router = useRouter();
    const token = useAuthStore((state) => state.token);
    const [collections, setCollections] = useState<SecilCollection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        if (!token) {
            router.push('/login');
            return;
        }

        fetchCollections();
    }, [currentPage, token]);

    const fetchCollections = async () => {
        setIsLoading(true);
        setError('');

        try {
            const url = `/api/collections?page=${currentPage}&pageSize=${pageSize}`;

            // Next.js API route üzerinden (server-side)
            const data = await authGet(url) as any;

            if (data.success) {
                setCollections(data.data || []);
                setTotalPages(data.meta?.totalPages || 1);
            } else {
                setError(data.message || 'Failed to fetch collections');
            }
        } catch (err) {
            setError('An error occurred while fetching collections');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditClick = (collectionId: number) => {
        router.push(`/edit/${collectionId}`);
    };

    const getFilterSummary = (collection: SecilCollection): string => {
        if (!collection.filters?.filters || collection.filters.filters.length === 0) {
            return 'No filters applied';
        }

        return collection.filters.filters
            .map((f) => `${f.title} ${f.valueName}`)
            .join(', ');
    };

    return (
        <DashboardLayout>
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Koleksiyon
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Koleksiyon Listesi
                        </p>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                {/* Table */}
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr className="table-header">
                                    <th className="table-cell font-semibold text-sm sm:text-base">Başlık</th>
                                    <th className="font-semibold text-sm sm:text-base px-2 py-2 sm:px-4 sm:py-3 hidden lg:table-cell">Ürün Koşulları</th>
                                    <th className="table-cell font-semibold text-sm sm:text-base">
                                        <span className="hidden sm:inline">Satış Kanalı</span>
                                        <span className="sm:hidden">Kanal</span>
                                    </th>
                                    <th className="table-cell font-semibold text-sm sm:text-base text-right">
                                        <span className="hidden sm:inline">İşlemler</span>
                                        <span className="sm:hidden">Düzenle</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={4} className="table-cell text-center py-12">
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : collections.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="table-cell text-center py-12">
                                            <p className="text-gray-500 dark:text-gray-400">
                                                No collections found
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    collections.map((collection) => (
                                        <tr key={collection.id} className="table-row">
                                            <td className="table-cell">
                                                <div>
                                                    <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                                                        {collection.info.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                        <span className="hidden sm:inline">Koleksiyon - </span>
                                                        <span className="sm:hidden">ID: </span>
                                                        {collection.id}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-2 py-2 sm:px-4 sm:py-3 hidden lg:table-cell">
                                                <p className="text-sm text-gray-600 dark:text-gray-300 max-w-md truncate">
                                                    {getFilterSummary(collection)}
                                                </p>
                                            </td>
                                            <td className="table-cell">
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 rounded">
                                                        <span className="hidden sm:inline">Satış Kanalı - </span>
                                                        <span className="sm:hidden">SK-</span>
                                                        {collection.salesChannelId}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="table-cell text-right">
                                                <button
                                                    onClick={() => handleEditClick(collection.id)}
                                                    className="inline-flex items-center gap-2 px-2.5 py-2 sm:px-3 sm:py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
                                                    aria-label="Sabitleri Düzenle"
                                                    title="Sabitleri Düzenle"
                                                >
                                                    <Edit3 className="w-4 h-4 flex-shrink-0" />
                                                    <span className="hidden sm:inline whitespace-nowrap">Sabitleri Düzenle</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {!isLoading && collections.length > 0 && (
                        <div className="flex items-center justify-center gap-1 p-4 border-t border-light-border dark:border-dark-border">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                aria-label="Previous page"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            {Array.from({ length: Math.min(9, totalPages) }, (_, i) => {
                                const page = i + 1;
                                return (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`min-w-[2.5rem] h-10 px-3 rounded-md text-sm font-medium transition-colors ${currentPage === page
                                            ? 'bg-primary-600 text-white'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                aria-label="Next page"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}