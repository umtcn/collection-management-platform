// Real API Types based on Secil Store API

export interface SecilAuthRequest {
    username: string;
    password: string;
}

export interface SecilAuthResponse {
    status: number;
    message: string | null;
    data: {
        accessToken: string;
        expiresIn: number;
        refreshExpiresIn: number;
        refreshToken: string;
        tokenType: string; // "Bearer"
    };
}

export interface SecilRefreshTokenRequest {
    refreshToken: string;
}

export interface SecilCollectionFilter {
    id: string;
    title: string;
    value: string;
    valueName: string;
    currency: string | null;
    comparisonType: number;
}

export interface SecilCollectionFilters {
    useOrLogic: boolean;
    filters: SecilCollectionFilter[] | null;
}

export interface SecilCollectionInfo {
    id: number;
    name: string;
    description: string;
    url: string;
    langCode: string;
}

export interface SecilCollection {
    id: number;
    filters: SecilCollectionFilters;
    type: number; // 0: Manual, 1: Auto
    info: SecilCollectionInfo;
    salesChannelId: number;
    products: SecilManualProduct[] | null;
}

export interface SecilManualProduct {
    productCode: string;
    colorCode: string | null;
    name: string;
    imageUrl: string;
}

export interface SecilCollectionListResponse {
    meta: {
        page: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
        hasPreviousPage: boolean;
        hasNextPage: boolean;
    };
    data: SecilCollection[];
}

export interface SecilProduct {
    productCode: string;
    colorCode: string;
    name: string | null;
    outOfStock: boolean;
    isSaleB2B: boolean;
    imageUrl: string;
}

export interface SecilProductsRequest {
    additionalFilters: SecilCollectionFilter[];
    page: number;
    pageSize: number;
}

export interface SecilProductsResponse {
    status: number;
    message: string;
    data: {
        meta: {
            page: number;
            pageSize: number;
            totalProduct: number;
        };
        data: SecilProduct[];
    };
}

export interface SecilFilterOption {
    id: string;
    title: string;
    options: {
        value: string;
        label: string;
    }[];
}

export interface SecilFiltersResponse {
    status: number;
    message: string;
    data: SecilFilterOption[];
}
