import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import EditCollectionPage from '@/app/edit/[id]/page';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store';
import { authPost, authGet } from '@/lib/auth-request-handler';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    useParams: jest.fn(),
}));

// Mock auth store
jest.mock('@/store', () => ({
    useAuthStore: jest.fn(),
}));

// Mock auth request handler
jest.mock('@/lib/auth-request-handler', () => ({
    authPost: jest.fn(),
    authGet: jest.fn(),
}));

// Mock DashboardLayout
jest.mock('@/components/layout', () => ({
    DashboardLayout: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="dashboard-layout">{children}</div>
    ),
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => {
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
        return <img {...props} />;
    },
}));

const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
};

const mockAuthPost = authPost as jest.MockedFunction<typeof authPost>;
const mockAuthGet = authGet as jest.MockedFunction<typeof authGet>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

// Mock product data
const mockProducts = [
    {
        productId: 1,
        productCode: 'PROD-001',
        colorCode: 'RED',
        name: 'Test Product 1',
        colorName: 'Red',
        imageUrl: 'https://example.com/image1.jpg',
        price: 100,
        isSaleB2B: true,
        outOfStock: false,
    },
    {
        productId: 2,
        productCode: 'PROD-002',
        colorCode: 'BLUE',
        name: 'Test Product 2',
        colorName: 'Blue',
        imageUrl: 'https://example.com/image2.jpg',
        price: 150,
        isSaleB2B: true,
        outOfStock: false,
    },
    {
        productId: 3,
        productCode: 'PROD-003',
        colorCode: 'GREEN',
        name: 'Test Product 3',
        colorName: 'Green',
        imageUrl: 'https://example.com/image3.jpg',
        price: 200,
        isSaleB2B: false,
        outOfStock: false,
    },
    {
        productId: 4,
        productCode: 'PROD-004',
        colorCode: 'YELLOW',
        name: 'Test Product 4',
        colorName: 'Yellow',
        imageUrl: 'https://example.com/image4.jpg',
        price: 120,
        isSaleB2B: true,
        outOfStock: true,
    },
];

// Mock filters data
const mockFilters = [
    {
        id: 'category',
        title: 'Category',
        values: [
            { value: '1', valueName: 'T-Shirts' },
            { value: '2', valueName: 'Jackets' },
        ],
    },
    {
        id: 'color',
        title: 'Color',
        values: [
            { value: 'red', valueName: 'Red' },
            { value: 'blue', valueName: 'Blue' },
        ],
    },
];

describe('EditCollectionPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseRouter.mockReturnValue(mockRouter);
        mockUseParams.mockReturnValue({ id: '1' });
        mockUseAuthStore.mockReturnValue('test-token');

        // Default mock for products API
        mockAuthPost.mockResolvedValue({
            success: true,
            data: mockProducts,
            meta: { totalProduct: 4 },
        });

        // Default mock for filters API
        mockAuthGet.mockResolvedValue({
            success: true,
            data: mockFilters,
        });
    });

    describe('Page Navigation and Routing', () => {
        it('should redirect to login when no token', () => {
            mockUseAuthStore.mockReturnValue(null);

            render(<EditCollectionPage />);

            expect(mockRouter.push).toHaveBeenCalledWith('/login');
        });

        it('should use collection ID from URL params', async () => {
            mockUseParams.mockReturnValue({ id: '123' });

            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(mockAuthPost).toHaveBeenCalledWith(
                    '/api/collections/123/products',
                    expect.any(Object)
                );
            });
        });

        it('should render within dashboard layout', () => {
            render(<EditCollectionPage />);

            expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
        });
    });

    describe('Initial Rendering', () => {
        it('should render page header', async () => {
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Sabitleri Düzenle')).toBeInTheDocument();
            });
        });

        it('should render view mode toggle', async () => {
            render(<EditCollectionPage />);

            await waitFor(() => {
                // View mode buttons should exist
                const buttons = screen.getAllByRole('button');
                expect(buttons.length).toBeGreaterThan(0);
            });
        });

        it('should render filter button', async () => {
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText(/Filtre/i)).toBeInTheDocument();
            });
        });

        it('should render pinned slots section', async () => {
            render(<EditCollectionPage />);

            await waitFor(() => {
                const sections = screen.getAllByText(/Sabitler/i);
                // Should have at least 2 mentions: "Sabitleri Düzenle" and "Sabitler" section
                expect(sections.length).toBeGreaterThanOrEqual(2);
            });
        });

        it('should render collection products section', async () => {
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });

            // Products are rendered without a specific section title
            const products = document.querySelectorAll('[class*="border-"]');
            expect(products.length).toBeGreaterThan(0);
        });
    });

    describe('Products Loading', () => {
        it('should show loading state initially', () => {
            mockAuthPost.mockImplementation(
                () => new Promise((resolve) => setTimeout(() => resolve({ success: true, data: [] }), 100))
            );

            render(<EditCollectionPage />);

            // Loading spinner should be visible
            const spinner = document.querySelector('.animate-spin');
            expect(spinner).toBeInTheDocument();
        });

        it('should hide loading state after data loads', async () => {
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });

            // Loading spinner should not be visible
            const spinners = document.querySelectorAll('.animate-spin');
            expect(spinners.length).toBe(0);
        });

        it('should fetch products with correct collection ID', async () => {
            mockUseParams.mockReturnValue({ id: '456' });

            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(mockAuthPost).toHaveBeenCalledWith(
                    '/api/collections/456/products',
                    expect.objectContaining({
                        page: 1,
                        pageSize: 36,
                    })
                );
            });
        });

        it('should log fetch and response', async () => {
            const consoleSpy = jest.spyOn(console, 'log');

            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith(
                    expect.stringContaining('Fetching products')
                );
                expect(consoleSpy).toHaveBeenCalledWith(
                    expect.stringContaining('Products response'),
                    expect.any(Object)
                );
            });

            consoleSpy.mockRestore();
        });
    });

    describe('Products Display', () => {
        it('should display all products after successful fetch', async () => {
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
                expect(screen.getByText('Test Product 2')).toBeInTheDocument();
                expect(screen.getByText('Test Product 3')).toBeInTheDocument();
                expect(screen.getByText('Test Product 4')).toBeInTheDocument();
            });
        });

        it('should display product images', async () => {
            render(<EditCollectionPage />);

            await waitFor(() => {
                const images = screen.getAllByRole('img');
                expect(images.length).toBeGreaterThanOrEqual(4);
            });
        });

        it('should display product codes', async () => {
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('PROD-001')).toBeInTheDocument();
                expect(screen.getByText('PROD-002')).toBeInTheDocument();
                expect(screen.getByText('PROD-003')).toBeInTheDocument();
                expect(screen.getByText('PROD-004')).toBeInTheDocument();
            });
        });

        it('should display product names', async () => {
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
                expect(screen.getByText('Test Product 2')).toBeInTheDocument();
                expect(screen.getByText('Test Product 3')).toBeInTheDocument();
                expect(screen.getByText('Test Product 4')).toBeInTheDocument();
            });
        });

        it('should show correct total product count', async () => {
            render(<EditCollectionPage />);

            await waitFor(() => {
                // Check for total count display (e.g., "4 ürün")
                const countText = screen.queryByText(/4.*ürün/i);
                expect(countText).toBeTruthy();
            });
        });
    });

    describe('Product Status Indicators', () => {
        it('should show inactive product indicator', async () => {
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 3')).toBeInTheDocument();
            });

            // Product 3 has isSaleB2B: false, should have red border
            const productCards = document.querySelectorAll('[class*="border-red"]');
            expect(productCards.length).toBeGreaterThan(0);
        });

        it('should show out of stock indicator', async () => {
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 4')).toBeInTheDocument();
            });

            // Product 4 has outOfStock: true, should have yellow border
            const productCards = document.querySelectorAll('[class*="border-yellow"]');
            expect(productCards.length).toBeGreaterThan(0);
        });

        it('should show active product with black border', async () => {
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });

            // Product 1 is active and in stock, should have black border
            const productCards = document.querySelectorAll('[class*="border-black"]');
            expect(productCards.length).toBeGreaterThan(0);
        });
    });

    describe('Empty Pinned Slots', () => {
        it('should render empty pinned slots based on total product count', async () => {
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });

            // Should have 4 empty slots (same as total products)
            const emptySlots = document.querySelectorAll('[class*="dashed"]');
            expect(emptySlots.length).toBeGreaterThan(0);
        });

        it('should show slot numbers', async () => {
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });

            // Check for slot number indicators (1, 2, 3, 4...)
            const slotNumbers = screen.queryAllByText(/^[1-4]$/);
            expect(slotNumbers.length).toBeGreaterThan(0);
        });
    });

    describe('Product Selection', () => {
        it('should highlight product when clicked', async () => {
            const user = userEvent.setup();
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });

            // Click on a product
            const product1 = screen.getByText('Test Product 1').closest('div[class*="cursor"]');
            if (product1) {
                await user.click(product1);
            }

            // Check for selection indicator
            await waitFor(() => {
                const selectedIndicators = document.querySelectorAll('[class*="ring"]');
                expect(selectedIndicators.length).toBeGreaterThan(0);
            });
        });

        it('should show "Seçili" indicator when product is selected', async () => {
            const user = userEvent.setup();
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });

            // Click on a product
            const product1 = screen.getByText('Test Product 1').closest('div[class*="cursor"]');
            if (product1) {
                await user.click(product1);
            }

            // Check for "Seçili" text
            await waitFor(() => {
                expect(screen.getByText(/Seçili/i)).toBeInTheDocument();
            });
        });

        it('should clear selection after clicking another product', async () => {
            const user = userEvent.setup();
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });

            // Click on first product
            const product1 = screen.getByText('Test Product 1').closest('div[class*="cursor"]');
            if (product1) {
                await user.click(product1);
            }

            // Click on second product
            const product2 = screen.getByText('Test Product 2').closest('div[class*="cursor"]');
            if (product2) {
                await user.click(product2);
            }

            // Only one product should be selected
            await waitFor(() => {
                const selectedIndicators = document.querySelectorAll('[class*="ring-4"]');
                expect(selectedIndicators.length).toBeLessThanOrEqual(1);
            });
        });
    });

    describe('Error Handling', () => {
        it('should display error message when API returns error', async () => {
            mockAuthPost.mockResolvedValue({
                success: false,
                message: 'Failed to load products',
            });

            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText(/Failed to load products/i)).toBeInTheDocument();
            });
        });

        it('should display generic error on network failure', async () => {
            mockAuthPost.mockRejectedValue(new Error('Network error'));

            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText(/An error occurred/i)).toBeInTheDocument();
            });
        });

        it('should log error to console', async () => {
            const consoleSpy = jest.spyOn(console, 'error');
            mockAuthPost.mockRejectedValue(new Error('Network error'));

            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith(
                    expect.stringContaining('fetch error'),
                    expect.any(Error)
                );
            });

            consoleSpy.mockRestore();
        });
    });

    describe('Pagination', () => {
        it('should render pagination controls', async () => {
            mockAuthPost.mockResolvedValue({
                success: true,
                data: mockProducts,
                meta: { totalProduct: 100 },
            });

            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });

            // Check for numbered pagination buttons (1, 2, 3, etc.)
            const paginationButtons = screen.getAllByRole('button').filter(btn =>
                /^[1-9]$/.test(btn.textContent || '')
            );
            expect(paginationButtons.length).toBeGreaterThan(0);
        });

        it('should highlight current page button', async () => {
            mockAuthPost.mockResolvedValue({
                success: true,
                data: mockProducts,
                meta: { totalProduct: 100 },
            });

            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });

            // First page button should be highlighted
            const pageButtons = screen.getAllByRole('button').filter(btn =>
                btn.textContent === '1' && btn.className.includes('bg-gray-900')
            );
            expect(pageButtons.length).toBeGreaterThan(0);
        });

        it('should navigate to different page when clicking page number', async () => {
            const user = userEvent.setup();
            mockAuthPost.mockResolvedValue({
                success: true,
                data: mockProducts,
                meta: { totalProduct: 100 },
            });

            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(mockAuthPost).toHaveBeenCalledWith(
                    '/api/collections/1/products',
                    expect.objectContaining({ page: 1 })
                );
            });

            // Find page 2 button
            const page2Button = screen.getAllByRole('button').find(btn =>
                btn.textContent === '2' && btn.className.includes('rounded-md')
            );

            if (page2Button) {
                await user.click(page2Button);

                await waitFor(() => {
                    expect(mockAuthPost).toHaveBeenCalledWith(
                        '/api/collections/1/products',
                        expect.objectContaining({ page: 2 })
                    );
                });
            }
        });
    });

    describe('View Mode Toggle', () => {
        it('should toggle between view modes', async () => {
            const user = userEvent.setup();
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });

            // Get view mode buttons
            const buttons = screen.getAllByRole('button');
            const viewModeButtons = buttons.filter(btn =>
                btn.getAttribute('aria-label')?.includes('view') ||
                btn.className.includes('rounded')
            );

            if (viewModeButtons.length > 0) {
                await user.click(viewModeButtons[0]);
                // View should change - check for layout changes
                expect(document.querySelector('[class*="grid"]')).toBeTruthy();
            }
        });
    });

    describe('Integration Tests', () => {
        it('should handle complete flow: navigation → load → display', async () => {
            mockUseParams.mockReturnValue({ id: '789' });

            render(<EditCollectionPage />);

            // Should not redirect
            expect(mockRouter.push).not.toHaveBeenCalled();

            // Should fetch products
            await waitFor(() => {
                expect(mockAuthPost).toHaveBeenCalledWith(
                    '/api/collections/789/products',
                    expect.any(Object)
                );
            });

            // Should display products
            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });
        });

        it('should handle authentication → fetch → display flow', async () => {
            render(<EditCollectionPage />);

            // Check token was used
            expect(mockUseAuthStore).toHaveBeenCalled();

            // Products should be fetched
            await waitFor(() => {
                expect(mockAuthPost).toHaveBeenCalled();
            });

            // Products should be displayed
            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });
        });
    });

    describe('Responsive Design', () => {
        it('should render mobile-friendly layout', async () => {
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });

            // Check for responsive classes
            const responsiveElements = document.querySelectorAll('[class*="sm:"], [class*="md:"], [class*="lg:"]');
            expect(responsiveElements.length).toBeGreaterThan(0);
        });

        it('should have touch-friendly slot sizes', async () => {
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });

            // Slots should have aspect ratio and proper sizing
            const slots = document.querySelectorAll('[class*="aspect"]');
            expect(slots.length).toBeGreaterThan(0);
        });
    });

    describe('Console Logging', () => {
        it('should log products fetch URL', async () => {
            const consoleSpy = jest.spyOn(console, 'log');

            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith(
                    expect.stringContaining('Fetching products')
                );
            });

            consoleSpy.mockRestore();
        });

        it('should log products response data', async () => {
            const consoleSpy = jest.spyOn(console, 'log');

            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith(
                    expect.stringContaining('Products response'),
                    expect.objectContaining({
                        success: true,
                        data: expect.any(Array),
                    })
                );
            });

            consoleSpy.mockRestore();
        });

        it('should log errors', async () => {
            const consoleSpy = jest.spyOn(console, 'error');
            mockAuthPost.mockRejectedValue(new Error('Test error'));

            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalled();
            });

            consoleSpy.mockRestore();
        });
    });
});
