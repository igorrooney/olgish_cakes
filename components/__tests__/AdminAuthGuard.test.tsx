/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { AdminAuthGuard } from '../AdminAuthGuard'

// Mock Next.js navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  )
})

// Mock MUI components
jest.mock('@mui/material', () => ({
  Box: ({ children, ...props }: any) => <div data-testid="box" {...props}>{children}</div>,
  CircularProgress: () => <div data-testid="circular-progress">Loading...</div>,
  Typography: ({ children, variant, color, ...props }: any) => (
    <div data-testid="typography" data-variant={variant} data-color={color} {...props}>
      {children}
    </div>
  )
}))

// Mock ErrorBoundary
jest.mock('../ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: any) => <div data-testid="error-boundary">{children}</div>
}))

// Mock fetch
global.fetch = jest.fn()

describe('AdminAuthGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Loading State', () => {
    it('should show loading state initially', async () => {
      ;(fetch as jest.Mock).mockImplementation(() => new Promise(() => {}))

      render(<AdminAuthGuard>Protected Content</AdminAuthGuard>)

      expect(screen.getByTestId('circular-progress')).toBeInTheDocument()
      expect(screen.getByText('Checking authentication...')).toBeInTheDocument()
    })

    it('should display loading message', async () => {
      ;(fetch as jest.Mock).mockImplementation(() => new Promise(() => {}))

      render(<AdminAuthGuard>Protected Content</AdminAuthGuard>)

      expect(screen.getByText('Checking authentication...')).toBeInTheDocument()
    })

    it('should not render children during loading', async () => {
      ;(fetch as jest.Mock).mockImplementation(() => new Promise(() => {}))

      render(<AdminAuthGuard><div data-testid="protected">Protected</div></AdminAuthGuard>)

      expect(screen.queryByTestId('protected')).not.toBeInTheDocument()
    })
  })

  describe('Authentication Check', () => {
    it('should call /api/admin/auth on mount', async () => {
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ authenticated: true })
      })

      render(<AdminAuthGuard>Content</AdminAuthGuard>)

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/admin/auth', {
          method: 'GET',
          credentials: 'include'
        })
      })
    })

    it('should set authenticated state on successful response', async () => {
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ authenticated: true })
      })

      render(<AdminAuthGuard><div data-testid="protected">Protected</div></AdminAuthGuard>)

      await waitFor(() => {
        expect(screen.getByTestId('protected')).toBeInTheDocument()
      })
    })

    it('should set unauthenticated on error response', async () => {
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Unauthorized' })
      })

      render(<AdminAuthGuard>Content</AdminAuthGuard>)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/auth')
      })
    })

    it('should handle fetch error', async () => {
      ;(fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      render(<AdminAuthGuard>Content</AdminAuthGuard>)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/auth')
      })
    })

    it('should stop loading after auth check', async () => {
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ authenticated: true })
      })

      render(<AdminAuthGuard>Content</AdminAuthGuard>)

      await waitFor(() => {
        expect(screen.queryByText('Checking authentication...')).not.toBeInTheDocument()
      })
    })
  })

  describe('Unauthenticated State', () => {
    it('should redirect to login when not authenticated', async () => {
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Unauthorized' })
      })

      render(<AdminAuthGuard>Content</AdminAuthGuard>)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/auth')
      })
    })

    it('should show redirecting message', async () => {
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Unauthorized' })
      })

      render(<AdminAuthGuard>Content</AdminAuthGuard>)

      await waitFor(() => {
        expect(screen.getByText('Not authenticated. Redirecting to login...')).toBeInTheDocument()
      })
    })

    it('should show loading spinner during redirect', async () => {
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Unauthorized' })
      })

      render(<AdminAuthGuard>Content</AdminAuthGuard>)

      await waitFor(() => {
        const circularProgress = screen.getAllByTestId('circular-progress')
        expect(circularProgress.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Authenticated State', () => {
    beforeEach(() => {
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ authenticated: true })
      })
    })

    it('should render children when authenticated', async () => {
      render(<AdminAuthGuard><div data-testid="protected">Protected Content</div></AdminAuthGuard>)

      await waitFor(() => {
        expect(screen.getByTestId('protected')).toBeInTheDocument()
      })
    })

    it('should render admin navigation', async () => {
      render(<AdminAuthGuard>Content</AdminAuthGuard>)

      await waitFor(() => {
        expect(screen.getByText('🎂 Olgish Cakes Admin')).toBeInTheDocument()
      })
    })

    it('should show Dashboard link', async () => {
      render(<AdminAuthGuard>Content</AdminAuthGuard>)

      await waitFor(() => {
        expect(screen.getByText('🏠 Dashboard')).toBeInTheDocument()
      })
    })

    it('should show Orders link', async () => {
      render(<AdminAuthGuard>Content</AdminAuthGuard>)

      await waitFor(() => {
        expect(screen.getByText('📦 Orders')).toBeInTheDocument()
      })
    })

    it('should show Earnings link', async () => {
      render(<AdminAuthGuard>Content</AdminAuthGuard>)

      await waitFor(() => {
        expect(screen.getByText('📊 Earnings')).toBeInTheDocument()
      })
    })

    it('should show Test Emails link', async () => {
      render(<AdminAuthGuard>Content</AdminAuthGuard>)

      await waitFor(() => {
        expect(screen.getByText('📧 Test Emails')).toBeInTheDocument()
      })
    })

    it('should show Content Studio link', async () => {
      render(<AdminAuthGuard>Content</AdminAuthGuard>)

      await waitFor(() => {
        expect(screen.getByText('✏️ Content Studio')).toBeInTheDocument()
      })
    })

    it('should show View Website link', async () => {
      render(<AdminAuthGuard>Content</AdminAuthGuard>)

      await waitFor(() => {
        expect(screen.getByText('🌐 View Website')).toBeInTheDocument()
      })
    })

    it('should show logout button', async () => {
      render(<AdminAuthGuard>Content</AdminAuthGuard>)

      await waitFor(() => {
        expect(screen.getByText('🚪 Logout')).toBeInTheDocument()
      })
    })

    it('should wrap content in ErrorBoundary', async () => {
      render(<AdminAuthGuard>Content</AdminAuthGuard>)

      await waitFor(() => {
        expect(screen.getByTestId('error-boundary')).toBeInTheDocument()
      })
    })
  })

  describe('Logout Functionality', () => {
    beforeEach(() => {
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ authenticated: true })
      })
    })

    it('should call logout API when logout button clicked', async () => {
      render(<AdminAuthGuard>Content</AdminAuthGuard>)

      await waitFor(() => {
        expect(screen.getByText('🚪 Logout')).toBeInTheDocument()
      })

      const logoutButton = screen.getByText('🚪 Logout')
      fireEvent.click(logoutButton)

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/admin/logout', {
          method: 'POST',
          credentials: 'include'
        })
      })
    })

    it('should redirect to login after logout', async () => {
      render(<AdminAuthGuard>Content</AdminAuthGuard>)

      await waitFor(() => {
        expect(screen.getByText('🚪 Logout')).toBeInTheDocument()
      })

      const logoutButton = screen.getByText('🚪 Logout')
      fireEvent.click(logoutButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/auth')
      })
    })

    it('should redirect even if logout fails', async () => {
      render(<AdminAuthGuard>Content</AdminAuthGuard>)

      await waitFor(() => {
        expect(screen.getByText('🚪 Logout')).toBeInTheDocument()
      })

      ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Logout failed'))

      const logoutButton = screen.getByText('🚪 Logout')
      fireEvent.click(logoutButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/auth')
      })
    })

    it('should log error on logout failure', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      render(<AdminAuthGuard>Content</AdminAuthGuard>)

      await waitFor(() => {
        expect(screen.getByText('🚪 Logout')).toBeInTheDocument()
      })

      const error = new Error('Logout failed')
      ;(fetch as jest.Mock).mockRejectedValueOnce(error)

      const logoutButton = screen.getByText('🚪 Logout')
      fireEvent.click(logoutButton)

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Logout failed:', error)
      })

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Error Handling', () => {
    it('should handle JSON parse error', async () => {
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => { throw new Error('Parse error') }
      })

      render(<AdminAuthGuard>Content</AdminAuthGuard>)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/auth')
      })
    })

    it('should handle network error', async () => {
      ;(fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      render(<AdminAuthGuard>Content</AdminAuthGuard>)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/auth')
      })
    })

    it('should set loading to false after error', async () => {
      ;(fetch as jest.Mock).mockRejectedValue(new Error('Error'))

      render(<AdminAuthGuard>Content</AdminAuthGuard>)

      await waitFor(() => {
        expect(screen.queryByText('Checking authentication...')).not.toBeInTheDocument()
      })
    })
  })

  describe('Navigation Links', () => {
    beforeEach(async () => {
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ authenticated: true })
      })
    })

    it('should link to /admin', async () => {
      render(<AdminAuthGuard>Content</AdminAuthGuard>)

      await waitFor(() => {
        const dashboardLink = screen.getByText('🏠 Dashboard').closest('a')
        expect(dashboardLink).toHaveAttribute('href', '/admin')
      })
    })

    it('should link to /admin/orders', async () => {
      render(<AdminAuthGuard>Content</AdminAuthGuard>)

      await waitFor(() => {
        const ordersLink = screen.getByText('📦 Orders').closest('a')
        expect(ordersLink).toHaveAttribute('href', '/admin/orders')
      })
    })

    it('should link to /admin/earnings', async () => {
      render(<AdminAuthGuard>Content</AdminAuthGuard>)

      await waitFor(() => {
        const earningsLink = screen.getByText('📊 Earnings').closest('a')
        expect(earningsLink).toHaveAttribute('href', '/admin/earnings')
      })
    })

    it('should link to /test-emails', async () => {
      render(<AdminAuthGuard>Content</AdminAuthGuard>)

      await waitFor(() => {
        const emailsLink = screen.getByText('📧 Test Emails').closest('a')
        expect(emailsLink).toHaveAttribute('href', '/test-emails')
      })
    })

    it('should link to /studio with target=_blank', async () => {
      render(<AdminAuthGuard>Content</AdminAuthGuard>)

      await waitFor(() => {
        const studioLink = screen.getByText('✏️ Content Studio').closest('a')
        expect(studioLink).toHaveAttribute('href', '/studio')
        expect(studioLink).toHaveAttribute('target', '_blank')
        expect(studioLink).toHaveAttribute('rel', 'noopener noreferrer')
      })
    })

    it('should link to / with target=_blank', async () => {
      render(<AdminAuthGuard>Content</AdminAuthGuard>)

      await waitFor(() => {
        const websiteLink = screen.getByText('🌐 View Website').closest('a')
        expect(websiteLink).toHaveAttribute('href', '/')
        expect(websiteLink).toHaveAttribute('target', '_blank')
        expect(websiteLink).toHaveAttribute('rel', 'noopener noreferrer')
      })
    })
  })

  describe('Layout Structure', () => {
    beforeEach(async () => {
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ authenticated: true })
      })
    })

    it('should render navigation', async () => {
      const { container } = render(<AdminAuthGuard>Content</AdminAuthGuard>)

      await waitFor(() => {
        expect(container.querySelector('nav')).toBeInTheDocument()
      })
    })

    it('should render main element', async () => {
      const { container } = render(<AdminAuthGuard>Content</AdminAuthGuard>)

      await waitFor(() => {
        expect(container.querySelector('main')).toBeInTheDocument()
      })
    })

    it('should render children inside main', async () => {
      render(<AdminAuthGuard><div data-testid="child">Child</div></AdminAuthGuard>)

      await waitFor(() => {
        const main = document.querySelector('main')
        expect(main?.querySelector('[data-testid="child"]')).toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle auth check only once on mount', async () => {
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ authenticated: true })
      })

      const { rerender } = render(<AdminAuthGuard>Content</AdminAuthGuard>)

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1)
      })

      rerender(<AdminAuthGuard>Updated Content</AdminAuthGuard>)

      // Should not call fetch again
      expect(fetch).toHaveBeenCalledTimes(1)
    })

    it('should handle missing response data', async () => {
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({})
      })

      render(<AdminAuthGuard>Content</AdminAuthGuard>)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/auth')
      })
    })
  })
})

