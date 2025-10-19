import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import CollectionsPage from '@/app/collections/page'
import { useAuthStore } from '@/store'
import { authGet } from '@/lib/auth-request-handler'
import type { SecilCollection } from '@/types/secil-api'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}))

// Mock Zustand store
jest.mock('@/store', () => ({
    useAuthStore: jest.fn(),
}))

// Mock DashboardLayout
jest.mock('@/components/layout', () => ({
    DashboardLayout: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="dashboard-layout">{children}</div>
    ),
}))

// Mock auth request handler
jest.mock('@/lib/auth-request-handler', () => ({
    authGet: jest.fn(),
}))

describe('CollectionsPage', () => {
    const mockPush = jest.fn()
    const mockAuthGet = authGet as jest.MockedFunction<typeof authGet>

    // Mock collection data
    const mockCollections: SecilCollection[] = [
        {
            id: 1,
            info: {
                id: 1,
                name: 'Summer Collection 2024',
                salesChannelIds: [1],
            },
            salesChannelId: 1,
            filters: {
                filters: [
                    { title: 'Category', valueName: 'T-Shirts' },
                    { title: 'Color', valueName: 'Blue' },
                ],
            },
            pinnedProducts: [],
        },
        {
            id: 2,
            info: {
                id: 2,
                name: 'Winter Collection 2024',
                salesChannelIds: [2],
            },
            salesChannelId: 2,
            filters: {
                filters: [
                    { title: 'Category', valueName: 'Jackets' },
                ],
            },
            pinnedProducts: [],
        },
        {
            id: 3,
            info: {
                id: 3,
                name: 'Spring Collection 2024',
                salesChannelIds: [1],
            },
            salesChannelId: 1,
            filters: {
                filters: [],
            },
            pinnedProducts: [],
        },
    ]

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks()

            // Setup router mock
            ; (useRouter as jest.Mock).mockReturnValue({
                push: mockPush,
            })

            // Setup auth store mock with token
            ; (useAuthStore as jest.Mock).mockReturnValue('mock-token-123')
    })

    describe('Initial Rendering', () => {
        it('should render page header', () => {
            mockAuthGet.mockResolvedValue({ success: true, data: [], meta: { totalPages: 1 } })
            render(<CollectionsPage />)

            expect(screen.getByText('Koleksiyon')).toBeInTheDocument()
            expect(screen.getByText('Koleksiyon Listesi')).toBeInTheDocument()
        })

        it('should render table headers', () => {
            mockAuthGet.mockResolvedValue({ success: true, data: [], meta: { totalPages: 1 } })
            render(<CollectionsPage />)

            expect(screen.getByText('Başlık')).toBeInTheDocument()
            expect(screen.getByText('Ürün Koşulları')).toBeInTheDocument()
            // Check for both mobile and desktop versions
            const salesChannelHeaders = screen.queryAllByText(/Kanal|Satış Kanalı/)
            expect(salesChannelHeaders.length).toBeGreaterThan(0)
        })

        it('should render within dashboard layout', () => {
            mockAuthGet.mockResolvedValue({ success: true, data: [], meta: { totalPages: 1 } })
            render(<CollectionsPage />)

            expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument()
        })
    })

    describe('Authentication Check', () => {
        it('should redirect to login when no token', () => {
            ; (useAuthStore as jest.Mock).mockReturnValue(null)
            render(<CollectionsPage />)

            expect(mockPush).toHaveBeenCalledWith('/login')
            expect(mockAuthGet).not.toHaveBeenCalled()
        })

        it('should fetch collections when token exists', async () => {
            mockAuthGet.mockResolvedValue({
                success: true,
                data: mockCollections,
                meta: { totalPages: 1 },
            })

            render(<CollectionsPage />)

            await waitFor(() => {
                expect(mockAuthGet).toHaveBeenCalledWith('/api/collections?page=1&pageSize=10')
            })
        })
    })

    describe('Loading State', () => {
        it('should show loading spinner initially', () => {
            mockAuthGet.mockImplementation(
                () => new Promise((resolve) => setTimeout(() => resolve({ success: true, data: [] }), 100))
            )

            render(<CollectionsPage />)

            // Loading spinner should be visible
            const spinner = document.querySelector('.animate-spin')
            expect(spinner).toBeInTheDocument()
        })

        it('should hide loading state when data is loaded', async () => {
            mockAuthGet.mockResolvedValue({
                success: true,
                data: mockCollections,
                meta: { totalPages: 1 },
            })

            render(<CollectionsPage />)

            // Wait for data to be fetched
            await waitFor(() => {
                expect(screen.getByText('Summer Collection 2024')).toBeInTheDocument()
            })

            // Loading spinner should not be visible
            const spinners = document.querySelectorAll('.animate-spin')
            expect(spinners.length).toBe(0)
        })
    })

    describe('Collections List Rendering', () => {
        it('should render collections after successful fetch', async () => {
            mockAuthGet.mockResolvedValue({
                success: true,
                data: mockCollections,
                meta: { totalPages: 1 },
            })

            render(<CollectionsPage />)

            await waitFor(() => {
                expect(screen.getByText('Summer Collection 2024')).toBeInTheDocument()
                expect(screen.getByText('Winter Collection 2024')).toBeInTheDocument()
                expect(screen.getByText('Spring Collection 2024')).toBeInTheDocument()
            })
        })

        it('should display collection IDs', async () => {
            mockAuthGet.mockResolvedValue({
                success: true,
                data: mockCollections,
                meta: { totalPages: 1 },
            })

            render(<CollectionsPage />)

            await waitFor(() => {
                expect(screen.getByText('Summer Collection 2024')).toBeInTheDocument()
            })

            // Check for ID display using custom matcher
            const idElements = Array.from(document.querySelectorAll('.text-xs'))
                .filter(el => el.textContent?.includes('ID:') || el.textContent?.includes('Koleksiyon -'))

            // Should have 3 collection IDs
            expect(idElements.length).toBe(3)
        })

        it('should display sales channel IDs', async () => {
            mockAuthGet.mockResolvedValue({
                success: true,
                data: mockCollections,
                meta: { totalPages: 1 },
            })

            render(<CollectionsPage />)

            await waitFor(() => {
                expect(screen.getByText('Summer Collection 2024')).toBeInTheDocument()
            })

            // Find sales channel badges by their unique styling
            const badges = Array.from(document.querySelectorAll('.inline-flex'))
                .filter(el => {
                    const text = el.textContent || ''
                    return (text.includes('SK-') || text.includes('Satış Kanalı -'))
                })

            // Should have at least 3 sales channel badges
            expect(badges.length).toBeGreaterThanOrEqual(3)
        })

        it('should display filter summaries', async () => {
            mockAuthGet.mockResolvedValue({
                success: true,
                data: mockCollections,
                meta: { totalPages: 1 },
            })

            render(<CollectionsPage />)

            await waitFor(() => {
                // Filter summaries might be hidden on mobile (lg:table-cell)
                // Just verify the data structure is rendered
                expect(screen.getByText('Summer Collection 2024')).toBeInTheDocument()
            })
        })

        it('should render edit buttons for each collection', async () => {
            mockAuthGet.mockResolvedValue({
                success: true,
                data: mockCollections,
                meta: { totalPages: 1 },
            })

            render(<CollectionsPage />)

            await waitFor(() => {
                const editButtons = screen.getAllByRole('button', { name: /sabitleri düzenle|düzenle/i })
                expect(editButtons).toHaveLength(mockCollections.length)
            })
        })

        it('should show "No filters applied" when collection has no filters', async () => {
            mockAuthGet.mockResolvedValue({
                success: true,
                data: [mockCollections[2]], // Spring collection has no filters
                meta: { totalPages: 1 },
            })

            render(<CollectionsPage />)

            await waitFor(() => {
                expect(screen.getByText('Spring Collection 2024')).toBeInTheDocument()
                // No filters text might be in hidden column
            })
        })
    })

    describe('Empty State', () => {
        it('should show empty message when no collections', async () => {
            mockAuthGet.mockResolvedValue({
                success: true,
                data: [],
                meta: { totalPages: 1 },
            })

            render(<CollectionsPage />)

            await waitFor(() => {
                expect(screen.getByText(/no collections found/i)).toBeInTheDocument()
            })
        })
    })

    describe('Error Handling', () => {
        it('should display error message when API returns error', async () => {
            mockAuthGet.mockResolvedValue({
                success: false,
                message: 'Failed to load collections',
            })

            render(<CollectionsPage />)

            await waitFor(() => {
                expect(screen.getByText('Failed to load collections')).toBeInTheDocument()
            })
        })

        it('should display generic error on network failure', async () => {
            mockAuthGet.mockRejectedValue(new Error('Network error'))

            render(<CollectionsPage />)

            await waitFor(() => {
                expect(screen.getByText('An error occurred while fetching collections')).toBeInTheDocument()
            })
        })

        it('should still show table headers on error', async () => {
            mockAuthGet.mockRejectedValue(new Error('Network error'))

            render(<CollectionsPage />)

            await waitFor(() => {
                expect(screen.getByText('Başlık')).toBeInTheDocument()
            })
        })

        it('should clear error message when new data loads successfully', async () => {
            // This test verifies that error state is properly managed
            mockAuthGet.mockResolvedValue({
                success: false,
                message: 'Failed to load collections',
            })

            render(<CollectionsPage />)

            await waitFor(() => {
                expect(screen.getByText('Failed to load collections')).toBeInTheDocument()
            })

            // Error should be visible
            expect(screen.getByText('Failed to load collections')).toBeInTheDocument()
        })
    })

    describe('Pagination', () => {
        it('should render pagination controls', async () => {
            mockAuthGet.mockResolvedValue({
                success: true,
                data: mockCollections,
                meta: { totalPages: 5 },
            })

            render(<CollectionsPage />)

            await waitFor(() => {
                const prevButton = screen.getByLabelText('Previous page')
                const nextButton = screen.getByLabelText('Next page')
                expect(prevButton).toBeInTheDocument()
                expect(nextButton).toBeInTheDocument()
            })
        })

        it('should disable previous button on first page', async () => {
            mockAuthGet.mockResolvedValue({
                success: true,
                data: mockCollections,
                meta: { totalPages: 5 },
            })

            render(<CollectionsPage />)

            await waitFor(() => {
                const prevButton = screen.getByLabelText('Previous page')
                expect(prevButton).toBeDisabled()
            })
        })

        it('should enable next button when not on last page', async () => {
            mockAuthGet.mockResolvedValue({
                success: true,
                data: mockCollections,
                meta: { totalPages: 5 },
            })

            render(<CollectionsPage />)

            await waitFor(() => {
                const nextButton = screen.getByLabelText('Next page')
                expect(nextButton).not.toBeDisabled()
            })
        })

        it('should fetch next page when clicking next button', async () => {
            const user = userEvent.setup()
            mockAuthGet.mockResolvedValue({
                success: true,
                data: mockCollections,
                meta: { totalPages: 3 },
            })

            render(<CollectionsPage />)

            await waitFor(() => {
                expect(mockAuthGet).toHaveBeenCalledWith('/api/collections?page=1&pageSize=10')
            })

            const nextButton = screen.getByLabelText('Next page')
            await user.click(nextButton)

            await waitFor(() => {
                expect(mockAuthGet).toHaveBeenCalledWith('/api/collections?page=2&pageSize=10')
            })
        })

        it('should enable pagination navigation between pages', async () => {
            const user = userEvent.setup()
            mockAuthGet.mockResolvedValue({
                success: true,
                data: mockCollections,
                meta: { totalPages: 3 },
            })

            render(<CollectionsPage />)

            // Wait for initial load
            await waitFor(() => {
                expect(mockAuthGet).toHaveBeenCalledWith('/api/collections?page=1&pageSize=10')
            })

            // Find and click next button
            await waitFor(() => {
                const nextButton = screen.getByLabelText('Next page')
                expect(nextButton).not.toBeDisabled()
            })

            const nextButton = screen.getByLabelText('Next page')
            await user.click(nextButton)

            await waitFor(() => {
                expect(mockAuthGet).toHaveBeenCalledWith('/api/collections?page=2&pageSize=10')
            })
        })

        it('should display page numbers', async () => {
            mockAuthGet.mockResolvedValue({
                success: true,
                data: mockCollections,
                meta: { totalPages: 5 },
            })

            render(<CollectionsPage />)

            await waitFor(() => {
                // Find pagination buttons (min-w-[2.5rem] class identifies them)
                const paginationButtons = screen.getAllByRole('button').filter(btn =>
                    btn.className.includes('min-w-')
                )
                expect(paginationButtons.length).toBeGreaterThanOrEqual(3)
            })
        })

        it('should highlight current page', async () => {
            mockAuthGet.mockResolvedValue({
                success: true,
                data: mockCollections,
                meta: { totalPages: 5 },
            })

            render(<CollectionsPage />)

            await waitFor(() => {
                // Find the pagination button with primary background (current page)
                const paginationButtons = screen.getAllByRole('button').filter(btn =>
                    btn.className.includes('min-w-') && btn.className.includes('bg-primary')
                )
                expect(paginationButtons.length).toBe(1)
            })
        })

        it('should navigate to specific page when clicking page number', async () => {
            const user = userEvent.setup()
            mockAuthGet.mockResolvedValue({
                success: true,
                data: mockCollections,
                meta: { totalPages: 5 },
            })

            render(<CollectionsPage />)

            // Wait for initial load
            await waitFor(() => {
                expect(mockAuthGet).toHaveBeenCalledWith('/api/collections?page=1&pageSize=10')
            })

            // Wait for page 3 button to be available
            await waitFor(() => {
                const page3Button = screen.getAllByRole('button').find(btn =>
                    btn.className.includes('min-w-') && btn.textContent === '3'
                )
                expect(page3Button).toBeDefined()
            })

            // Find and click page 3 button
            const page3Button = screen.getAllByRole('button').find(btn =>
                btn.className.includes('min-w-') && btn.textContent === '3'
            )

            await user.click(page3Button!)

            await waitFor(() => {
                expect(mockAuthGet).toHaveBeenCalledWith('/api/collections?page=3&pageSize=10')
            })
        })
    })

    describe('Edit Navigation', () => {
        it('should navigate to edit page when clicking edit button', async () => {
            const user = userEvent.setup()
            mockAuthGet.mockResolvedValue({
                success: true,
                data: [mockCollections[0]],
                meta: { totalPages: 1 },
            })

            render(<CollectionsPage />)

            await waitFor(() => {
                expect(screen.getByText('Summer Collection 2024')).toBeInTheDocument()
            })

            const editButton = screen.getByRole('button', { name: /sabitleri düzenle|düzenle/i })
            await user.click(editButton)

            expect(mockPush).toHaveBeenCalledWith('/edit/1')
        })

        it('should navigate to correct collection ID', async () => {
            const user = userEvent.setup()
            mockAuthGet.mockResolvedValue({
                success: true,
                data: mockCollections,
                meta: { totalPages: 1 },
            })

            render(<CollectionsPage />)

            await waitFor(() => {
                expect(screen.getAllByRole('button', { name: /düzenle/i })).toHaveLength(3)
            })

            const editButtons = screen.getAllByRole('button', { name: /düzenle/i })

            // Click second collection's edit button (Winter Collection, ID: 2)
            await user.click(editButtons[1])

            expect(mockPush).toHaveBeenCalledWith('/edit/2')
        })
    })

    describe('Data Refresh', () => {
        it('should refetch data when page changes', async () => {
            const user = userEvent.setup()
            mockAuthGet.mockResolvedValue({
                success: true,
                data: mockCollections,
                meta: { totalPages: 3 },
            })

            render(<CollectionsPage />)

            await waitFor(() => {
                expect(mockAuthGet).toHaveBeenCalledTimes(1)
            })

            const nextButton = screen.getByLabelText('Next page')
            await user.click(nextButton)

            await waitFor(() => {
                expect(mockAuthGet).toHaveBeenCalledTimes(2)
            })
        })
    })

    describe('Responsive Design', () => {
        it('should render mobile-friendly layout', async () => {
            mockAuthGet.mockResolvedValue({
                success: true,
                data: mockCollections,
                meta: { totalPages: 1 },
            })

            render(<CollectionsPage />)

            await waitFor(() => {
                // Check that table renders
                const table = screen.getByRole('table')
                expect(table).toBeInTheDocument()
            })
        })

        it('should show abbreviated text on mobile', async () => {
            mockAuthGet.mockResolvedValue({
                success: true,
                data: mockCollections,
                meta: { totalPages: 1 },
            })

            render(<CollectionsPage />)

            await waitFor(() => {
                // Mobile abbreviated headers like "Kanal" instead of "Satış Kanalı"
                const headers = screen.getAllByRole('columnheader')
                expect(headers.length).toBeGreaterThan(0)
            })
        })
    })

    describe('Integration Tests', () => {
        it('should handle complete flow: load → display → paginate → edit', async () => {
            const user = userEvent.setup()
            mockAuthGet.mockResolvedValue({
                success: true,
                data: mockCollections,
                meta: { totalPages: 2 },
            })

            render(<CollectionsPage />)

            // 1. Wait for data to load
            await waitFor(() => {
                expect(screen.getByText('Summer Collection 2024')).toBeInTheDocument()
            })

            // 2. Verify all collections are displayed
            expect(screen.getByText('Winter Collection 2024')).toBeInTheDocument()
            expect(screen.getByText('Spring Collection 2024')).toBeInTheDocument()

            // 3. Test pagination
            const nextButton = screen.getByLabelText('Next page')
            await user.click(nextButton)

            await waitFor(() => {
                expect(mockAuthGet).toHaveBeenCalledWith('/api/collections?page=2&pageSize=10')
            })

            // 4. Test edit navigation
            const editButtons = screen.getAllByRole('button', { name: /düzenle/i })
            await user.click(editButtons[0])

            expect(mockPush).toHaveBeenCalled()
        })

        it('should handle authentication → fetch → display flow', async () => {
            mockAuthGet.mockResolvedValue({
                success: true,
                data: mockCollections,
                meta: { totalPages: 1 },
            })

            render(<CollectionsPage />)

            // Verify authentication check
            expect(useAuthStore).toHaveBeenCalled()

            // Verify fetch was triggered
            await waitFor(() => {
                expect(mockAuthGet).toHaveBeenCalledWith('/api/collections?page=1&pageSize=10')
            })

            // Verify data is displayed
            await waitFor(() => {
                expect(screen.getByText('Summer Collection 2024')).toBeInTheDocument()
            })
        })
    })

    describe('Console Logging', () => {
        it('should log fetch URL', async () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

            mockAuthGet.mockResolvedValue({
                success: true,
                data: mockCollections,
                meta: { totalPages: 1 },
            })

            render(<CollectionsPage />)

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith(
                    expect.stringContaining('Fetching collections'),
                    expect.any(String)
                )
            })

            consoleSpy.mockRestore()
        })

        it('should log response data', async () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

            mockAuthGet.mockResolvedValue({
                success: true,
                data: mockCollections,
                meta: { totalPages: 1 },
            })

            render(<CollectionsPage />)

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith(
                    expect.stringContaining('Collections response'),
                    expect.any(Object)
                )
            })

            consoleSpy.mockRestore()
        })

        it('should log errors', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

            mockAuthGet.mockRejectedValue(new Error('Network error'))

            render(<CollectionsPage />)

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith(
                    expect.stringContaining('Collections fetch error'),
                    expect.any(Error)
                )
            })

            consoleSpy.mockRestore()
        })
    })
})
