import { create } from 'zustand';
import { ProductState, Product, PinnedProduct } from '@/types';

const useProductStore = create<ProductState>((set, get) => ({
    products: [],
    pinnedProducts: [],
    isLoading: false,
    error: null,

    fetchProducts: async (collectionId: string) => {
        set({ isLoading: true, error: null });

        try {
            const response = await fetch(`/api/collections/${collectionId}/products`);
            const data = await response.json();

            if (data.success) {
                set({
                    products: data.data.products || [],
                    pinnedProducts: data.data.pinnedProducts || [],
                    isLoading: false,
                });
            } else {
                set({
                    error: data.message || 'Failed to fetch products',
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

    updateProductOrder: (products: Product[]) => {
        set({ products });
    },

    updatePinnedProducts: (pinnedProducts: PinnedProduct[]) => {
        set({ pinnedProducts });
    },

    pinProduct: (product: Product) => {
        const { products, pinnedProducts } = get();

        const newPinnedProduct: PinnedProduct = {
            ...product,
            isPinned: true,
            pinnedAt: new Date().toISOString(),
            pinnedOrder: pinnedProducts.length,
        };

        set({
            products: products.filter(p => p.id !== product.id),
            pinnedProducts: [...pinnedProducts, newPinnedProduct],
        });
    },

    unpinProduct: (productId: string) => {
        const { products, pinnedProducts } = get();

        const unpinnedProduct = pinnedProducts.find(p => p.id === productId);
        if (!unpinnedProduct) return;

        const { isPinned, pinnedAt, pinnedOrder, ...product } = unpinnedProduct;

        set({
            pinnedProducts: pinnedProducts.filter(p => p.id !== productId),
            products: [...products, product as Product],
        });
    },
}));

export default useProductStore;
