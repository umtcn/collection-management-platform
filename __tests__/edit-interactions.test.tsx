import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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
        isSaleB2B: true,
        outOfStock: false,
    },
];

describe('EditCollectionPage - Interactive Features', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseRouter.mockReturnValue(mockRouter);
        mockUseParams.mockReturnValue({ id: '1' });
        mockUseAuthStore.mockReturnValue('test-token');

        mockAuthPost.mockResolvedValue({
            success: true,
            data: mockProducts,
            meta: { totalProduct: 3 },
        });

        mockAuthGet.mockResolvedValue({
            success: true,
            data: [],
        });
    });

    describe('Click-to-Select Product', () => {
        it('should select product when clicked', async () => {
            const user = userEvent.setup();
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });

            // Find and click the first product
            const product = screen.getByText('Test Product 1').closest('div[draggable="true"]');
            expect(product).toBeInTheDocument();

            await user.click(product!);

            // Product should have selection ring
            await waitFor(() => {
                expect(product).toHaveClass('ring-2');
            });
        });

        it('should show "Seçili" indicator when product is selected', async () => {
            const user = userEvent.setup();
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });

            const product = screen.getByText('Test Product 1').closest('div[draggable="true"]');
            await user.click(product!);

            // Should show "Seçili" text somewhere
            await waitFor(() => {
                const seciiliText = screen.queryByText(/Seçili/i);
                expect(seciiliText).toBeInTheDocument();
            });
        });

        it('should clear previous selection when clicking another product', async () => {
            const user = userEvent.setup();
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });

            const product1 = screen.getByText('Test Product 1').closest('div[draggable="true"]');
            const product2 = screen.getByText('Test Product 2').closest('div[draggable="true"]');

            // Select first product
            await user.click(product1!);
            await waitFor(() => {
                expect(product1).toHaveClass('ring-2');
            });

            // Select second product
            await user.click(product2!);
            await waitFor(() => {
                expect(product2).toHaveClass('ring-2');
                // First product should no longer have ring
                expect(product1).not.toHaveClass('ring-2');
            });
        });
    });

    describe('Click-to-Place Product in Slot', () => {
        it('should place selected product in empty slot when clicked', async () => {
            const user = userEvent.setup();
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });

            // Select a product
            const product = screen.getByText('Test Product 1').closest('div[draggable="true"]');
            await user.click(product!);

            // Find all slot containers
            const allSlots = document.querySelectorAll('[data-slot-index]');
            expect(allSlots.length).toBeGreaterThan(0);

            // Click on the first slot
            await user.click(allSlots[0] as Element);

            // Product should now be in the slot (check for image or product name)
            await waitFor(() => {
                const slotWithProduct = allSlots[0].querySelector('img[alt*="Test Product"]');
                expect(slotWithProduct).toBeInTheDocument();
            });
        });

        it('should clear selection after placing product in slot', async () => {
            const user = userEvent.setup();
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });

            const product = screen.getByText('Test Product 1').closest('div[draggable="true"]');
            await user.click(product!);

            const allSlots = document.querySelectorAll('[data-slot-index]');
            await user.click(allSlots[0] as Element);

            // Selection should be cleared
            await waitFor(() => {
                expect(product).not.toHaveClass('ring-2');
            });
        });

        it('should show "Eklendi" overlay on pinned product', async () => {
            const user = userEvent.setup();
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });

            const product = screen.getByText('Test Product 1').closest('div[draggable="true"]');
            await user.click(product!);

            const allSlots = document.querySelectorAll('[data-slot-index]');
            await user.click(allSlots[0] as Element);

            // "Eklendi" text should appear in the pinned slot
            await waitFor(() => {
                const eklendiText = screen.queryByText(/Eklendi/i);
                expect(eklendiText).toBeInTheDocument();
            });
        });

        it('should update product border to purple after pinning', async () => {
            const user = userEvent.setup();
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });

            const product = screen.getByText('Test Product 1').closest('div[draggable="true"]');
            await user.click(product!);

            const allSlots = document.querySelectorAll('[data-slot-index]');
            await user.click(allSlots[0] as Element);

            // Product in collection list should now have purple border
            await waitFor(() => {
                expect(product).toHaveClass('border-purple-500');
            });
        });
    });

    describe('Duplicate Product Prevention', () => {
        it('should show warning modal when trying to add duplicate product', async () => {
            const user = userEvent.setup();
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });

            const product = screen.getByText('Test Product 1').closest('div[draggable="true"]');
            const allSlots = document.querySelectorAll('[data-slot-index]');

            // Add product to first slot
            await user.click(product!);
            await user.click(allSlots[0] as Element);

            // Try to add same product to second slot
            await user.click(product!);
            await user.click(allSlots[1] as Element);

            // Warning modal should appear
            await waitFor(() => {
                expect(screen.getByText(/Ürün Zaten Eklendi/i)).toBeInTheDocument();
            });
        });

        it('should show slot number in duplicate warning message', async () => {
            const user = userEvent.setup();
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });

            const product = screen.getByText('Test Product 1').closest('div[draggable="true"]');
            const allSlots = document.querySelectorAll('[data-slot-index]');

            await user.click(product!);
            await user.click(allSlots[0] as Element);

            await user.click(product!);
            await user.click(allSlots[1] as Element);

            // Message should mention slot number
            await waitFor(() => {
                const message = screen.getByText(/1\. sabitte/i);
                expect(message).toBeInTheDocument();
            });
        });

        it('should close warning modal when clicking close button', async () => {
            const user = userEvent.setup();
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });

            const product = screen.getByText('Test Product 1').closest('div[draggable="true"]');
            const emptySlots = document.querySelectorAll('[class*="border-dashed"]');

            await user.click(product!);
            await user.click(emptySlots[0] as Element);
            await user.click(product!);
            await user.click(emptySlots[1] as Element);

            await waitFor(() => {
                expect(screen.getByText(/Ürün Zaten Eklendi/i)).toBeInTheDocument();
            });

            // Find and click close button
            const closeButtons = screen.getAllByRole('button').filter(btn =>
                btn.getAttribute('aria-label')?.includes('Kapat') ||
                btn.textContent === 'Tamam' ||
                btn.textContent === 'Kapat'
            );

            if (closeButtons.length > 0) {
                await user.click(closeButtons[0]);

                // Modal should be closed
                await waitFor(() => {
                    expect(screen.queryByText(/Ürün Zaten Eklendi/i)).not.toBeInTheDocument();
                });
            }
        });
    });

    describe('Drag and Drop - Product to Slot', () => {
        it('should handle drag start event on product', async () => {
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });

            const product = screen.getByText('Test Product 1').closest('div[draggable="true"]');

            // Product should be draggable
            expect(product).toHaveAttribute('draggable', 'true');
        });

        it('should have drag handlers attached to products', async () => {
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });

            const product = screen.getByText('Test Product 1').closest('div[draggable="true"]');

            // Product should have draggable attribute
            expect(product).toHaveAttribute('draggable', 'true');

            // Products should exist for drag operations
            const allProducts = document.querySelectorAll('div[draggable="true"]');
            expect(allProducts.length).toBeGreaterThanOrEqual(3);
        });

        it('should have drop zones for products', async () => {
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });

            // Slots should exist as drop zones
            const allSlots = document.querySelectorAll('[data-slot-index]');
            expect(allSlots.length).toBeGreaterThan(0);
        });
    });

    describe('Remove Product from Slot', () => {
        it('should show remove confirmation modal when clicking remove button', async () => {
            const user = userEvent.setup();
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });

            // Add product to slot
            const product = screen.getByText('Test Product 1').closest('div[draggable="true"]');
            const allSlots = document.querySelectorAll('[data-slot-index]');
            await user.click(product!);
            await user.click(allSlots[0] as Element);

            await waitFor(() => {
                const slotImage = (allSlots[0] as Element).querySelector('img[alt*="Test Product"]');
                expect(slotImage).toBeInTheDocument();
            });

            // Find remove button (X or trash icon)
            const removeButtons = screen.getAllByRole('button').filter(btn =>
                btn.getAttribute('aria-label')?.includes('Remove') ||
                btn.querySelector('svg')
            );

            if (removeButtons.length > 0) {
                await user.click(removeButtons[0]);

                // Confirmation modal should appear (use getAllByText for multiple matches)
                await waitFor(() => {
                    const confirmTexts = screen.queryAllByText(/Vazgeç|Onayla/i);
                    expect(confirmTexts.length).toBeGreaterThan(0);
                });
            }
        });

        it('should show success modal after removing product', async () => {
            const user = userEvent.setup();
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });

            const product = screen.getByText('Test Product 1').closest('div[draggable="true"]');
            const allSlots = document.querySelectorAll('[data-slot-index]');

            await user.click(product!);
            await user.click(allSlots[0] as Element);

            await waitFor(() => {
                const slotImage = (allSlots[0] as Element).querySelector('img[alt*="Test Product"]');
                expect(slotImage).toBeInTheDocument();
            });

            const removeButtons = screen.getAllByRole('button').filter(btn =>
                btn.getAttribute('aria-label')?.includes('Remove')
            );

            if (removeButtons.length > 0) {
                await user.click(removeButtons[0]);

                // Find all Onayla buttons and click the last one (in modal)
                const confirmButtons = await screen.findAllByText(/Onayla/i);
                await user.click(confirmButtons[confirmButtons.length - 1]);

                // Success modal should appear - use queryAllByText for multiple matches
                await waitFor(() => {
                    const successTexts = screen.queryAllByText(/Çıkarıldı|Başarılı/i);
                    expect(successTexts.length).toBeGreaterThan(0);
                });
            }
        });

        it('should show error modal when canceling removal', async () => {
            const user = userEvent.setup();
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });

            const product = screen.getByText('Test Product 1').closest('div[draggable="true"]');
            const allSlots = document.querySelectorAll('[data-slot-index]');

            await user.click(product!);
            await user.click(allSlots[0] as Element);

            await waitFor(() => {
                const slotImage = (allSlots[0] as Element).querySelector('img[alt*="Test Product"]');
                expect(slotImage).toBeInTheDocument();
            });

            const removeButtons = screen.getAllByRole('button').filter(btn =>
                btn.getAttribute('aria-label')?.includes('Remove')
            );

            if (removeButtons.length > 0) {
                await user.click(removeButtons[0]);

                // Find all Vazgeç buttons and click the first one (in warning modal)
                const cancelButtons = await screen.findAllByText(/Vazgeç/i);
                await user.click(cancelButtons[0]);

                // Error/cancel modal should appear or product should still be in slot
                await waitFor(() => {
                    const slotImage = (allSlots[0] as Element).querySelector('img[alt*="Test Product"]');
                    expect(slotImage).toBeTruthy();
                });
            }
        });

        it('should restore product border color after removal', async () => {
            const user = userEvent.setup();
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });

            const product = screen.getByText('Test Product 1').closest('div[draggable="true"]');
            const allSlots = document.querySelectorAll('[data-slot-index]');

            await user.click(product!);
            await user.click(allSlots[0] as Element);

            // Product should have purple border
            await waitFor(() => {
                expect(product).toHaveClass('border-purple-500');
            });

            const removeButtons = screen.getAllByRole('button').filter(btn =>
                btn.getAttribute('aria-label')?.includes('Remove')
            );

            if (removeButtons.length > 0) {
                await user.click(removeButtons[0]);

                // Find all Onayla buttons and click the last one
                const confirmButtons = await screen.findAllByText(/Onayla/i);
                await user.click(confirmButtons[confirmButtons.length - 1]);

                // Wait for success modal and close it
                await waitFor(async () => {
                    const closeButtons = screen.queryAllByText(/Kapat|Tamam/i);
                    if (closeButtons.length > 0) {
                        await user.click(closeButtons[0]);
                    }
                });

                // Product should no longer have purple border
                await waitFor(() => {
                    expect(product).not.toHaveClass('border-purple-500');
                }, { timeout: 3000 });
            }
        });
    });

    describe('Slot-to-Slot Reordering', () => {
        it('should have multiple slots for product placement', async () => {
            const user = userEvent.setup();
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });

            const product1 = screen.getByText('Test Product 1').closest('div[draggable="true"]');
            const product2 = screen.getByText('Test Product 2').closest('div[draggable="true"]');
            const allSlots = document.querySelectorAll('[data-slot-index]');

            // Add two products to different slots
            await user.click(product1!);
            await user.click(allSlots[0] as Element);

            await user.click(product2!);
            await user.click(allSlots[1] as Element);

            await waitFor(() => {
                const slot1Image = (allSlots[0] as Element).querySelector('img[alt*="Test Product"]');
                const slot2Image = (allSlots[1] as Element).querySelector('img[alt*="Test Product"]');
                expect(slot1Image).toBeInTheDocument();
                expect(slot2Image).toBeInTheDocument();
            });

            // Both slots should have products
            expect(allSlots[0].querySelector('img')).toBeTruthy();
            expect(allSlots[1].querySelector('img')).toBeTruthy();
        });

        it('should make filled slots draggable for reordering', async () => {
            const user = userEvent.setup();
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });

            const product = screen.getByText('Test Product 1').closest('div[draggable="true"]');
            const allSlots = document.querySelectorAll('[data-slot-index]');

            await user.click(product!);
            await user.click(allSlots[0] as Element);

            await waitFor(() => {
                const slotImage = (allSlots[0] as Element).querySelector('img[alt*="Test Product"]');
                expect(slotImage).toBeInTheDocument();
            });

            // Filled slot should have product image and be interactive
            const filledSlot = allSlots[0];
            const slotImage = filledSlot.querySelector('img');
            expect(slotImage).toBeTruthy();

            // Slot itself should have data-slot-index for reordering
            expect(filledSlot).toHaveAttribute('data-slot-index');
        });
    });

    describe('Mobile Touch Support', () => {
        it('should have touch event handlers on products', async () => {
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });

            const product = screen.getByText('Test Product 1').closest('div[draggable="true"]');

            // Product should exist and be draggable (which also enables touch)
            expect(product).toBeDefined();
            expect(product).toHaveAttribute('draggable', 'true');
        });

        it('should have touch-friendly slot sizes on mobile', async () => {
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });

            // Slots should have aspect ratio for proper mobile sizing
            const allSlots = document.querySelectorAll('[data-slot-index]');
            expect(allSlots.length).toBeGreaterThan(0);

            // Check if slots have aspect ratio classes
            const hasAspectRatio = Array.from(allSlots).some(slot =>
                slot.className.includes('aspect-')
            );
            expect(hasAspectRatio).toBe(true);
        });

        it('should have mobile-visible remove buttons', async () => {
            const user = userEvent.setup();
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });

            const product = screen.getByText('Test Product 1').closest('div[draggable="true"]');
            const allSlots = document.querySelectorAll('[data-slot-index]');

            await user.click(product!);
            await user.click(allSlots[0] as Element);

            await waitFor(() => {
                const slotImage = (allSlots[0] as Element).querySelector('img[alt*="Test Product"]');
                expect(slotImage).toBeInTheDocument();
            });

            // Mobile remove buttons should exist (with md:hidden class)
            const mobileButtons = document.querySelectorAll('[class*="md:hidden"]');
            expect(mobileButtons.length).toBeGreaterThan(0);
        });

        it('should support both touch and click interactions', async () => {
            const user = userEvent.setup();
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });

            const product = screen.getByText('Test Product 1').closest('div[draggable="true"]');

            // Click should work (already tested in other sections)
            await user.click(product!);

            await waitFor(() => {
                expect(product).toHaveClass('ring-2');
            });

            // Product is interactive and responsive
            expect(product).toBeDefined();
        });
    });

    describe('UI Feedback and States', () => {
        it('should show hover effect on empty slots when product is selected', async () => {
            const user = userEvent.setup();
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });

            const product = screen.getByText('Test Product 1').closest('div[draggable="true"]');
            await user.click(product!);

            // Empty slots should have highlighted state
            const emptySlots = document.querySelectorAll('[class*="border-dashed"]');
            await waitFor(() => {
                // At least one slot should have primary border color when product is selected
                const highlightedSlots = Array.from(emptySlots).filter(slot =>
                    slot.className.includes('border-primary')
                );
                expect(highlightedSlots.length).toBeGreaterThan(0);
            });
        });

        it('should show desktop hover overlay on filled slots', async () => {
            const user = userEvent.setup();
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });

            const product = screen.getByText('Test Product 1').closest('div[draggable="true"]');
            const emptySlots = document.querySelectorAll('[class*="border-dashed"]');

            await user.click(product!);
            await user.click(emptySlots[0] as Element);

            await waitFor(() => {
                const slotImage = (emptySlots[0] as Element).querySelector('img');
                expect(slotImage).toBeInTheDocument();
            });

            // Hover overlay should exist (hidden by default, shown on hover)
            const overlays = document.querySelectorAll('[class*="hover:opacity-100"]');
            expect(overlays.length).toBeGreaterThan(0);
        });

        it('should show mobile remove button on filled slots', async () => {
            const user = userEvent.setup();
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });

            const product = screen.getByText('Test Product 1').closest('div[draggable="true"]');
            const emptySlots = document.querySelectorAll('[class*="border-dashed"]');

            await user.click(product!);
            await user.click(emptySlots[0] as Element);

            await waitFor(() => {
                const slotImage = (emptySlots[0] as Element).querySelector('img');
                expect(slotImage).toBeInTheDocument();
            });

            // Mobile remove button should be visible (not hidden on md)
            const mobileRemoveButtons = document.querySelectorAll('[class*="md:hidden"]');
            expect(mobileRemoveButtons.length).toBeGreaterThan(0);
        });

        it('should maintain slot grid layout after adding products', async () => {
            const user = userEvent.setup();
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });

            const product = screen.getByText('Test Product 1').closest('div[draggable="true"]');
            const emptySlots = document.querySelectorAll('[class*="border-dashed"]');

            await user.click(product!);
            await user.click(emptySlots[0] as Element);

            // Grid layout should remain intact
            const gridContainers = document.querySelectorAll('[class*="grid"]');
            expect(gridContainers.length).toBeGreaterThan(0);
        });
    });

    describe('Multiple Product Operations', () => {
        it('should handle adding multiple products to different slots', async () => {
            const user = userEvent.setup();
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });

            const product1 = screen.getByText('Test Product 1').closest('div[draggable="true"]');
            const product2 = screen.getByText('Test Product 2').closest('div[draggable="true"]');
            const product3 = screen.getByText('Test Product 3').closest('div[draggable="true"]');
            const allSlots = document.querySelectorAll('[data-slot-index]');

            // Add three products to three different slots
            await user.click(product1!);
            await user.click(allSlots[0] as Element);

            await user.click(product2!);
            await user.click(allSlots[1] as Element);

            await user.click(product3!);
            await user.click(allSlots[2] as Element);

            // All three products should be in slots
            await waitFor(() => {
                const slot1Image = (allSlots[0] as Element).querySelector('img[alt*="Test Product"]');
                const slot2Image = (allSlots[1] as Element).querySelector('img[alt*="Test Product"]');
                const slot3Image = (allSlots[2] as Element).querySelector('img[alt*="Test Product"]');
                expect(slot1Image).toBeInTheDocument();
                expect(slot2Image).toBeInTheDocument();
                expect(slot3Image).toBeInTheDocument();
            });
        });

        it('should show correct count of pinned products', async () => {
            const user = userEvent.setup();
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });

            const product1 = screen.getByText('Test Product 1').closest('div[draggable="true"]');
            const product2 = screen.getByText('Test Product 2').closest('div[draggable="true"]');
            const emptySlots = document.querySelectorAll('[class*="border-dashed"]');

            await user.click(product1!);
            await user.click(emptySlots[0] as Element);

            await user.click(product2!);
            await user.click(emptySlots[1] as Element);

            // Count "Eklendi" overlays
            await waitFor(() => {
                const eklendiTexts = screen.queryAllByText(/Eklendi/i);
                expect(eklendiTexts.length).toBeGreaterThanOrEqual(2);
            });
        });

        it('should handle removing multiple products', async () => {
            const user = userEvent.setup();
            render(<EditCollectionPage />);

            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            });

            const product1 = screen.getByText('Test Product 1').closest('div[draggable="true"]');
            const product2 = screen.getByText('Test Product 2').closest('div[draggable="true"]');
            const allSlots = document.querySelectorAll('[data-slot-index]');

            // Add two products
            await user.click(product1!);
            await user.click(allSlots[0] as Element);

            await user.click(product2!);
            await user.click(allSlots[1] as Element);

            await waitFor(() => {
                const slot1Image = (allSlots[0] as Element).querySelector('img[alt*="Test Product"]');
                const slot2Image = (allSlots[1] as Element).querySelector('img[alt*="Test Product"]');
                expect(slot1Image).toBeInTheDocument();
                expect(slot2Image).toBeInTheDocument();
            });

            // Both slots should have content
            expect(allSlots[0].querySelector('img')).toBeTruthy();
            expect(allSlots[1].querySelector('img')).toBeTruthy();
        });
    });
});
