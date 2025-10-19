// User and Authentication Types
export interface User {
    id: string;
    email: string;
    name?: string;
    role?: 'admin' | 'user';
}

export interface LoginCredentials {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface AuthResponse {
    success: boolean;
    user?: User;
    token?: string;
    message?: string;
}

// Collection Types
export interface Collection {
    id: string;
    title: string;
    description?: string;
    productCount: number;
    salesChannel: string;
    createdAt: string;
    updatedAt: string;
    products?: Product[];
}

export interface CollectionListResponse {
    success: boolean;
    data: Collection[];
    total: number;
    page: number;
    pageSize: number;
}

// Product Types
export interface Product {
    id: string;
    name: string;
    code: string;
    category: string;
    price: number;
    stock: number;
    image?: string;
    description?: string;
    isPinned?: boolean;
    order?: number;
    createdAt: string;
    updatedAt: string;
}

export interface PinnedProduct extends Product {
    pinnedAt: string;
    pinnedOrder: number;
}

// Filter Types
export interface FilterOptions {
    categories: string[];
    priceRange: {
        min: number;
        max: number;
    };
    stockRange: {
        min: number;
        max: number;
    };
    productCode?: string;
    sortBy?: SortOption;
    appliedCriteria: AppliedCriterion[];
}

export type SortOption =
    | 'name-asc'
    | 'name-desc'
    | 'price-asc'
    | 'price-desc'
    | 'stock-asc'
    | 'stock-desc'
    | 'date-asc'
    | 'date-desc';

export interface AppliedCriterion {
    id: string;
    label: string;
    value: string;
    type: 'category' | 'price' | 'stock' | 'code' | 'sort';
}

// View Types
export type ViewMode = 'grid' | 'list' | 'large-grid' | 'small-grid';

export type Theme = 'light' | 'dark';

// API Response Types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    errors?: Record<string, string[]>;
}

export interface PaginationParams {
    page: number;
    pageSize: number;
    total?: number;
}

// Form Types
export interface FormError {
    field: string;
    message: string;
}

// Modal Types
export type ModalType = 'filter' | 'confirm' | 'success' | 'error';

export interface ModalState {
    isOpen: boolean;
    type: ModalType | null;
    title?: string;
    message?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

// Drag and Drop Types
export interface DragItem {
    id: string;
    type: 'product' | 'pinned';
    data: Product;
}

export interface DropResult {
    sourceIndex: number;
    destinationIndex: number;
    sourceList: 'products' | 'pinned';
    destinationList: 'products' | 'pinned';
}

// Store Types
export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
    setUser: (user: User | null) => void;
}

export interface CollectionState {
    collections: Collection[];
    currentCollection: Collection | null;
    isLoading: boolean;
    error: string | null;
    fetchCollections: () => Promise<void>;
    setCurrentCollection: (collection: Collection | null) => void;
}

export interface ProductState {
    products: Product[];
    pinnedProducts: PinnedProduct[];
    isLoading: boolean;
    error: string | null;
    fetchProducts: (collectionId: string) => Promise<void>;
    updateProductOrder: (products: Product[]) => void;
    updatePinnedProducts: (products: PinnedProduct[]) => void;
    pinProduct: (product: Product) => void;
    unpinProduct: (productId: string) => void;
}

export interface FilterState {
    filters: FilterOptions;
    isOpen: boolean;
    updateFilters: (filters: Partial<FilterOptions>) => void;
    clearFilters: () => void;
    toggleFilterModal: () => void;
    addCriterion: (criterion: AppliedCriterion) => void;
    removeCriterion: (criterionId: string) => void;
}

export interface UIState {
    theme: Theme;
    viewMode: ViewMode;
    sidebarOpen: boolean;
    toggleTheme: () => void;
    setViewMode: (mode: ViewMode) => void;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
}
