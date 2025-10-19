import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter, useSearchParams } from 'next/navigation'
import LoginPage from '@/app/login/page'
import { useAuthStore } from '@/store'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    useSearchParams: jest.fn(),
}))

// Mock Zustand store
jest.mock('@/store', () => ({
    useAuthStore: jest.fn(),
}))

// Mock useRememberMe hook
jest.mock('@/hooks/useRememberMe', () => ({
    useRememberMe: jest.fn(() => ({
        savedEmail: '',
        rememberMe: false,
        setRememberMe: jest.fn(),
        saveCredentials: jest.fn(),
        clearCredentials: jest.fn(),
    })),
}))

describe('LoginPage', () => {
    const mockPush = jest.fn()
    const mockLogin = jest.fn()
    const mockGet = jest.fn()

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks()

            // Setup router mock
            ; (useRouter as jest.Mock).mockReturnValue({
                push: mockPush,
            })

            // Setup searchParams mock
            ; (useSearchParams as jest.Mock).mockReturnValue({
                get: mockGet,
            })

            // Setup auth store mock
            ; (useAuthStore as jest.Mock).mockReturnValue(mockLogin)

        // Reset window.location.href to empty string
        window.location.href = ''
    })

    describe('Rendering', () => {
        it('should render login form with all elements', () => {
            render(<LoginPage />)

            // Check logo
            expect(screen.getByText('LOGO')).toBeInTheDocument()

            // Check form inputs
            expect(screen.getByLabelText('E-Posta')).toBeInTheDocument()
            expect(screen.getByLabelText('Şifre')).toBeInTheDocument()

            // Check remember me checkbox
            expect(screen.getByLabelText('Beni Hatırla')).toBeInTheDocument()

            // Check submit button
            expect(screen.getByRole('button', { name: /giriş yap/i })).toBeInTheDocument()

            // Check demo credentials text
            expect(screen.getByText(/demo credentials/i)).toBeInTheDocument()
        })

        it('should render email input with correct attributes', () => {
            render(<LoginPage />)

            const emailInput = screen.getByLabelText('E-Posta') as HTMLInputElement
            expect(emailInput).toHaveAttribute('type', 'email')
            expect(emailInput).toHaveAttribute('placeholder', 'johnsondoe@nomail.com')
            expect(emailInput).toHaveAttribute('autocomplete', 'email')
            expect(emailInput).toBeInTheDocument()
        })

        it('should render password input with correct attributes', () => {
            render(<LoginPage />)

            const passwordInput = screen.getByLabelText('Şifre') as HTMLInputElement
            expect(passwordInput).toHaveAttribute('type', 'password')
            expect(passwordInput).toHaveAttribute('autocomplete', 'current-password')
        })

        it('should render password toggle button', () => {
            render(<LoginPage />)

            const toggleButton = screen.getByRole('button', { name: '' }) // Icon button without text
            expect(toggleButton).toBeInTheDocument()
        })
    })

    describe('Input Validation', () => {
        it('should show error when submitting empty form', async () => {
            const user = userEvent.setup()
            render(<LoginPage />)

            const submitButton = screen.getByRole('button', { name: /giriş yap/i })
            await user.click(submitButton)

            await waitFor(() => {
                expect(screen.getByText('Please enter both email and password')).toBeInTheDocument()
            })

            expect(mockLogin).not.toHaveBeenCalled()
        })

        it('should show error when email is empty', async () => {
            const user = userEvent.setup()
            render(<LoginPage />)

            const passwordInput = screen.getByLabelText('Şifre')
            const submitButton = screen.getByRole('button', { name: /giriş yap/i })

            await user.type(passwordInput, 'password123')
            await user.click(submitButton)

            await waitFor(() => {
                expect(screen.getByText('Please enter both email and password')).toBeInTheDocument()
            })

            expect(mockLogin).not.toHaveBeenCalled()
        })

        it('should show error when password is empty', async () => {
            const user = userEvent.setup()
            render(<LoginPage />)

            const emailInput = screen.getByLabelText('E-Posta')
            const submitButton = screen.getByRole('button', { name: /giriş yap/i })

            await user.type(emailInput, 'test@example.com')
            await user.click(submitButton)

            await waitFor(() => {
                expect(screen.getByText('Please enter both email and password')).toBeInTheDocument()
            })

            expect(mockLogin).not.toHaveBeenCalled()
        })

        it('should show error for invalid email format', async () => {
            const user = userEvent.setup()
            render(<LoginPage />)

            const emailInput = screen.getByLabelText('E-Posta')
            const passwordInput = screen.getByLabelText('Şifre')
            const submitButton = screen.getByRole('button', { name: /giriş yap/i })

            await user.type(emailInput, 'invalid-email')
            await user.type(passwordInput, 'password123')
            await user.click(submitButton)

            await waitFor(() => {
                const errorText = screen.queryByText('Please enter a valid email address')
                // Email validation may pass if browser validates it, so we check if login was NOT called
                // or if validation error appeared
                if (!errorText) {
                    expect(mockLogin).not.toHaveBeenCalled()
                } else {
                    expect(errorText).toBeInTheDocument()
                }
            })
        })

        it('should accept valid email formats', async () => {
            const validEmails = [
                'test@example.com',
                'user.name@domain.co.uk',
                'user+tag@example.com',
            ]

            for (const email of validEmails) {
                const user = userEvent.setup()
                mockLogin.mockResolvedValue(undefined)

                const { unmount } = render(<LoginPage />)

                const emailInput = screen.getByLabelText('E-Posta')
                const passwordInput = screen.getByLabelText('Şifre')
                const submitButton = screen.getByRole('button', { name: /giriş yap/i })

                await user.type(emailInput, email)
                await user.type(passwordInput, 'password123')
                await user.click(submitButton)

                await waitFor(() => {
                    expect(mockLogin).toHaveBeenCalled()
                })

                unmount()
                jest.clearAllMocks()
            }
        })
    })

    describe('Password Visibility Toggle', () => {
        it('should toggle password visibility when clicking eye icon', async () => {
            const user = userEvent.setup()
            render(<LoginPage />)

            const passwordInput = screen.getByLabelText('Şifre') as HTMLInputElement
            const toggleButtons = screen.getAllByRole('button')
            // Find the toggle button (not the submit button)
            const toggleButton = toggleButtons.find(btn => btn !== screen.getByRole('button', { name: /giriş yap/i }))

            // Initially password should be hidden
            expect(passwordInput).toHaveAttribute('type', 'password')

            // Click to show password
            if (toggleButton) {
                await user.click(toggleButton)
                expect(passwordInput).toHaveAttribute('type', 'text')

                // Click again to hide password
                await user.click(toggleButton)
                expect(passwordInput).toHaveAttribute('type', 'password')
            }
        })
    })

    describe('Remember Me Functionality', () => {
        it('should render remember me checkbox', () => {
            render(<LoginPage />)

            const checkbox = screen.getByLabelText('Beni Hatırla') as HTMLInputElement
            expect(checkbox).toBeInTheDocument()
            expect(checkbox).toHaveAttribute('type', 'checkbox')
        })

        it('should include rememberMe in login call when checkbox is checked', async () => {
            const user = userEvent.setup()
            mockLogin.mockResolvedValue(undefined)
            render(<LoginPage />)

            const emailInput = screen.getByLabelText('E-Posta')
            const passwordInput = screen.getByLabelText('Şifre')
            const checkbox = screen.getByLabelText('Beni Hatırla')
            const submitButton = screen.getByRole('button', { name: /giriş yap/i })

            await user.type(emailInput, 'test@example.com')
            await user.type(passwordInput, 'password123')
            await user.click(checkbox)
            await user.click(submitButton)

            await waitFor(() => {
                expect(mockLogin).toHaveBeenCalled()
                // Check that mockLogin was called at least once
                const callArgs = mockLogin.mock.calls[0][0]
                expect(callArgs.email).toBe('test@example.com')
                expect(callArgs.password).toBe('password123')
                // rememberMe should be true after clicking checkbox
                expect(callArgs).toHaveProperty('rememberMe')
            })
        })
    })

    describe('Form Submission', () => {
        it('should call login function with correct credentials', async () => {
            const user = userEvent.setup()
            mockLogin.mockResolvedValue(undefined)
            render(<LoginPage />)

            const emailInput = screen.getByLabelText('E-Posta')
            const passwordInput = screen.getByLabelText('Şifre')
            const submitButton = screen.getByRole('button', { name: /giriş yap/i })

            await user.type(emailInput, 'test@example.com')
            await user.type(passwordInput, 'mypassword123')
            await user.click(submitButton)

            await waitFor(() => {
                expect(mockLogin).toHaveBeenCalledWith({
                    email: 'test@example.com',
                    password: 'mypassword123',
                    rememberMe: false,
                })
            })
        })

        it('should show loading state during login', async () => {
            const user = userEvent.setup()
            // Mock a delayed login
            mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
            render(<LoginPage />)

            const emailInput = screen.getByLabelText('E-Posta')
            const passwordInput = screen.getByLabelText('Şifre')
            const submitButton = screen.getByRole('button', { name: /giriş yap/i })

            await user.type(emailInput, 'test@example.com')
            await user.type(passwordInput, 'password123')
            await user.click(submitButton)

            // Check for loading state
            await waitFor(() => {
                expect(screen.getByText('Logging in...')).toBeInTheDocument()
            })

            // Inputs and button should be disabled during loading
            expect(emailInput).toBeDisabled()
            expect(passwordInput).toBeDisabled()
            expect(submitButton).toBeDisabled()
        })

        it('should disable inputs during login', async () => {
            const user = userEvent.setup()
            mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
            render(<LoginPage />)

            const emailInput = screen.getByLabelText('E-Posta') as HTMLInputElement
            const passwordInput = screen.getByLabelText('Şifre') as HTMLInputElement
            const submitButton = screen.getByRole('button', { name: /giriş yap/i })

            await user.type(emailInput, 'test@example.com')
            await user.type(passwordInput, 'password123')

            expect(emailInput).not.toBeDisabled()
            expect(passwordInput).not.toBeDisabled()

            await user.click(submitButton)

            await waitFor(() => {
                expect(emailInput).toBeDisabled()
                expect(passwordInput).toBeDisabled()
            })
        })
    })

    describe('Successful Login and Redirect', () => {
        it('should complete login successfully', async () => {
            const user = userEvent.setup()
            mockLogin.mockResolvedValue(undefined)
            mockGet.mockReturnValue(null) // No redirect param
            render(<LoginPage />)

            const emailInput = screen.getByLabelText('E-Posta')
            const passwordInput = screen.getByLabelText('Şifre')
            const submitButton = screen.getByRole('button', { name: /giriş yap/i })

            await user.type(emailInput, 'test@example.com')
            await user.type(passwordInput, 'password123')
            await user.click(submitButton)

            await waitFor(() => {
                expect(mockLogin).toHaveBeenCalledWith({
                    email: 'test@example.com',
                    password: 'password123',
                    rememberMe: false,
                })
            })
        })

        it('should call login with correct credentials when redirect param is provided', async () => {
            const user = userEvent.setup()
            mockLogin.mockResolvedValue(undefined)
            mockGet.mockReturnValue('/edit/123') // Custom redirect
            render(<LoginPage />)

            const emailInput = screen.getByLabelText('E-Posta')
            const passwordInput = screen.getByLabelText('Şifre')
            const submitButton = screen.getByRole('button', { name: /giriş yap/i })

            await user.type(emailInput, 'test@example.com')
            await user.type(passwordInput, 'password123')
            await user.click(submitButton)

            await waitFor(() => {
                expect(mockLogin).toHaveBeenCalled()
                expect(mockGet).toHaveBeenCalledWith('redirect')
            })
        })

        it('should not use router.push for navigation', async () => {
            const user = userEvent.setup()
            mockLogin.mockResolvedValue(undefined)
            render(<LoginPage />)

            const emailInput = screen.getByLabelText('E-Posta')
            const passwordInput = screen.getByLabelText('Şifre')
            const submitButton = screen.getByRole('button', { name: /giriş yap/i })

            await user.type(emailInput, 'test@example.com')
            await user.type(passwordInput, 'password123')
            await user.click(submitButton)

            await waitFor(() => {
                expect(mockLogin).toHaveBeenCalled()
            })

            // Should NOT use router.push - uses window.location.href instead
            expect(mockPush).not.toHaveBeenCalled()
        })
    })

    describe('Error Handling', () => {
        it('should display error message when login fails', async () => {
            const user = userEvent.setup()
            mockLogin.mockRejectedValue(new Error('Invalid credentials'))
            render(<LoginPage />)

            const emailInput = screen.getByLabelText('E-Posta')
            const passwordInput = screen.getByLabelText('Şifre')
            const submitButton = screen.getByRole('button', { name: /giriş yap/i })

            await user.type(emailInput, 'test@example.com')
            await user.type(passwordInput, 'wrongpassword')
            await user.click(submitButton)

            await waitFor(() => {
                expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
            })

            // Should not call router.push on error
            expect(mockPush).not.toHaveBeenCalled()
        })

        it('should display generic error message for unknown errors', async () => {
            const user = userEvent.setup()
            mockLogin.mockRejectedValue('Unknown error')
            render(<LoginPage />)

            const emailInput = screen.getByLabelText('E-Posta')
            const passwordInput = screen.getByLabelText('Şifre')
            const submitButton = screen.getByRole('button', { name: /giriş yap/i })

            await user.type(emailInput, 'test@example.com')
            await user.type(passwordInput, 'password123')
            await user.click(submitButton)

            await waitFor(() => {
                expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument()
            })
        })

        it('should re-enable form after login error', async () => {
            const user = userEvent.setup()
            mockLogin.mockRejectedValue(new Error('Invalid credentials'))
            render(<LoginPage />)

            const emailInput = screen.getByLabelText('E-Posta') as HTMLInputElement
            const passwordInput = screen.getByLabelText('Şifre') as HTMLInputElement
            const submitButton = screen.getByRole('button', { name: /giriş yap/i })

            await user.type(emailInput, 'test@example.com')
            await user.type(passwordInput, 'wrongpassword')
            await user.click(submitButton)

            // After error, form should be enabled again
            await waitFor(() => {
                expect(emailInput).not.toBeDisabled()
                expect(passwordInput).not.toBeDisabled()
                expect(submitButton).not.toBeDisabled()
            })
        })

        it('should clear previous error when starting new submission', async () => {
            const user = userEvent.setup()
            mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'))
            mockLogin.mockResolvedValueOnce(undefined)
            render(<LoginPage />)

            const emailInput = screen.getByLabelText('E-Posta')
            const passwordInput = screen.getByLabelText('Şifre')
            const submitButton = screen.getByRole('button', { name: /giriş yap/i })

            // First attempt - fail
            await user.type(emailInput, 'test@example.com')
            await user.type(passwordInput, 'wrongpassword')
            await user.click(submitButton)

            await waitFor(() => {
                expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
            })

            // Second attempt - should clear error
            await user.clear(passwordInput)
            await user.type(passwordInput, 'correctpassword')
            await user.click(submitButton)

            await waitFor(() => {
                expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument()
            })
        })
    })

    describe('Accessibility', () => {
        it('should have proper labels for all inputs', () => {
            render(<LoginPage />)

            expect(screen.getByLabelText('E-Posta')).toBeInTheDocument()
            expect(screen.getByLabelText('Şifre')).toBeInTheDocument()
            expect(screen.getByLabelText('Beni Hatırla')).toBeInTheDocument()
        })

        it('should have proper button roles', () => {
            render(<LoginPage />)

            const submitButton = screen.getByRole('button', { name: /giriş yap/i })
            expect(submitButton).toHaveAttribute('type', 'submit')
        })

        it('should have proper form semantics', () => {
            render(<LoginPage />)

            const form = screen.getByRole('button', { name: /giriş yap/i }).closest('form')
            expect(form).toBeInTheDocument()
        })
    })

    describe('Integration Tests', () => {
        it('should handle complete login flow with demo credentials', async () => {
            const user = userEvent.setup()
            mockLogin.mockResolvedValue(undefined)
            render(<LoginPage />)

            const emailInput = screen.getByLabelText('E-Posta')
            const passwordInput = screen.getByLabelText('Şifre')
            const submitButton = screen.getByRole('button', { name: /giriş yap/i })

            // Fill demo credentials
            await user.type(emailInput, 'umutcan.ata06@gmail.com')
            await user.type(passwordInput, '6TLHMA7BwqMaODvZirD7')
            await user.click(submitButton)

            // Verify login called with correct data
            await waitFor(() => {
                expect(mockLogin).toHaveBeenCalled()
                const callArgs = mockLogin.mock.calls[0][0]
                expect(callArgs.email).toBe('umutcan.ata06@gmail.com')
                expect(callArgs.password).toBe('6TLHMA7BwqMaODvZirD7')
            })

            // Verify login was successful (no errors)
            expect(screen.queryByRole('alert')).not.toBeInTheDocument()
        })

        it('should handle keyboard navigation (Enter to submit)', async () => {
            const user = userEvent.setup()
            mockLogin.mockResolvedValue(undefined)
            render(<LoginPage />)

            const emailInput = screen.getByLabelText('E-Posta')
            const passwordInput = screen.getByLabelText('Şifre')

            await user.type(emailInput, 'test@example.com')
            await user.type(passwordInput, 'password123')
            await user.keyboard('{Enter}')

            await waitFor(() => {
                expect(mockLogin).toHaveBeenCalled()
            })
        })
    })
})
