/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DevTools } from '../DevTools'

// Mock dependencies
jest.mock('@/app/utils/fetchCakes', () => ({
  clearCache: jest.fn(),
  invalidateCache: jest.fn()
}))

const mockClearAllCache = jest.fn()
const mockClearCachePattern = jest.fn()
const mockGetCacheStatus = jest.fn()

jest.mock('@/app/utils/cacheManager', () => ({
  cacheManager: {
    clearAllCache: () => mockClearAllCache(),
    clearCachePattern: (pattern: string) => mockClearCachePattern(pattern),
    getCacheStatus: () => mockGetCacheStatus()
  }
}))

// Mock MUI
jest.mock('@/lib/mui-optimization', () => ({
  Button: ({ children, onClick, disabled, variant, color, startIcon, fullWidth, size, sx, ...props }: MockProps) => (
    <button data-testid="button" onClick={onClick} disabled={disabled} {...props}>
      {startIcon}
      {children}
    </button>
  ),
  Box: ({ children, component, sx, ...props }: MockProps) => {
    const Component = component || 'div'
    return <Component data-testid="box" {...props}>{children}</Component>
  },
  Typography: ({ children, variant, color, sx, ...props }: MockProps) => (
    <div data-testid="typography" data-variant={variant} {...props}>{children}</div>
  ),
  Alert: ({ children, severity, sx, onClose, ...props }: MockProps) => (
    <div data-testid="alert" data-severity={severity} {...props}>
      {children}
      {onClose && <button onClick={onClose}>Close</button>}
    </div>
  ),
  IconButton: ({ children, onClick, sx, ...props }: MockProps) => (
    <button data-testid="icon-button" onClick={onClick} {...props}>{children}</button>
  ),
  Tooltip: ({ children, title, placement, ...props }: MockProps) => (
    <div data-testid="tooltip" title={title} {...props}>{children}</div>
  ),
  SettingsIcon: (props: MockProps) => <span {...props}>⚙️</span>,
  CloseIcon: (props: MockProps) => <span {...props}>×</span>,
  RefreshIcon: (props: MockProps) => <span {...props}>🔄</span>,
  ClearIcon: (props: MockProps) => <span {...props}>🗑️</span>,
  Chip: ({ label, color, size, sx, ...props }: MockProps) => (
    <span data-testid="chip" {...props}>{label}</span>
  ),
  Divider: (props: MockProps) => <hr data-testid="divider" {...props} />
}))

jest.mock('@/lib/ui-components', () => ({
  AccessibleIconButton: ({ children, onClick, ariaLabel, sx, ...props }: MockProps) => (
    <button data-testid="accessible-icon-button" onClick={onClick} aria-label={ariaLabel} {...props}>
      {children}
    </button>
  ),
  TouchTargetWrapper: ({ children, ...props }: MockProps) => <div {...props}>{children}</div>
}))

describe('DevTools', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetCacheStatus.mockReturnValue({ isAutoClearing: false })
  })

  describe('Environment Check', () => {
    it('should return null in production', () => {
      process.env.NODE_ENV = 'production'

      const { container } = render(<DevTools />)

      expect(container.firstChild).toBeNull()
    })

    it('should render in development', () => {
      process.env.NODE_ENV = 'development'

      render(<DevTools />)

      expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    })
  })

  describe('Toggle Visibility', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development'
    })

    it('should show settings icon initially', () => {
      render(<DevTools />)

      expect(screen.getByText('⚙️')).toBeInTheDocument()
    })

    it('should hide panel initially', () => {
      render(<DevTools />)

      expect(screen.queryByText('Dev Tools')).not.toBeInTheDocument()
    })

    it('should show panel when toggle clicked', () => {
      render(<DevTools />)

      const toggleButton = screen.getByLabelText('Toggle developer tools')
      fireEvent.click(toggleButton)

      expect(screen.getByText('Dev Tools')).toBeInTheDocument()
    })

    it('should show close icon when panel open', () => {
      render(<DevTools />)

      const toggleButton = screen.getByLabelText('Toggle developer tools')
      fireEvent.click(toggleButton)

      expect(screen.getAllByText('×').length).toBeGreaterThan(0)
    })

    it('should hide panel when close button clicked', () => {
      render(<DevTools />)

      const toggleButton = screen.getByLabelText('Toggle developer tools')
      fireEvent.click(toggleButton)

      const closeButton = screen.getByLabelText('Close developer tools')
      fireEvent.click(closeButton)

      expect(screen.queryByText('Dev Tools')).not.toBeInTheDocument()
    })
  })

  describe('Cache Management', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development'
      mockClearAllCache.mockResolvedValue(undefined)
      mockClearCachePattern.mockResolvedValue(undefined)
    })

    it('should show Clear All Cache button', () => {
      render(<DevTools />)

      const toggleButton = screen.getByLabelText('Toggle developer tools')
      fireEvent.click(toggleButton)

      expect(screen.getByText('Clear All Cache')).toBeInTheDocument()
    })

    it('should clear all cache when button clicked', async () => {
      render(<DevTools />)

      const toggleButton = screen.getByLabelText('Toggle developer tools')
      fireEvent.click(toggleButton)

      const clearButton = screen.getByText('Clear All Cache')
      fireEvent.click(clearButton)

      await waitFor(() => {
        expect(mockClearAllCache).toHaveBeenCalled()
      })
    })

    it('should show success message after clearing', async () => {
      render(<DevTools />)

      const toggleButton = screen.getByLabelText('Toggle developer tools')
      fireEvent.click(toggleButton)

      const clearButton = screen.getByText('Clear All Cache')
      fireEvent.click(clearButton)

      await waitFor(() => {
        expect(screen.getByText('✅ Cache cleared successfully!')).toBeInTheDocument()
      })
    })

    it('should show error message on failure', async () => {
      mockClearAllCache.mockRejectedValue(new Error('Cache error'))

      render(<DevTools />)

      const toggleButton = screen.getByLabelText('Toggle developer tools')
      fireEvent.click(toggleButton)

      const clearButton = screen.getByText('Clear All Cache')
      fireEvent.click(clearButton)

      await waitFor(() => {
        expect(screen.getByText('❌ Failed to clear cache')).toBeInTheDocument()
      })
    })

    it('should disable buttons while clearing', async () => {
      mockClearAllCache.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(<DevTools />)

      const toggleButton = screen.getByLabelText('Toggle developer tools')
      fireEvent.click(toggleButton)

      const clearButton = screen.getByText('Clear All Cache')
      fireEvent.click(clearButton)

      expect(clearButton).toHaveTextContent('Clearing...')
    })

    it('should clear cakes pattern', async () => {
      render(<DevTools />)

      const toggleButton = screen.getByLabelText('Toggle developer tools')
      fireEvent.click(toggleButton)

      const cakesButton = screen.getByText('Cakes')
      fireEvent.click(cakesButton)

      await waitFor(() => {
        expect(mockClearCachePattern).toHaveBeenCalledWith('cakes')
      })
    })

    it('should clear testimonials pattern', async () => {
      render(<DevTools />)

      const toggleButton = screen.getByLabelText('Toggle developer tools')
      fireEvent.click(toggleButton)

      const testimonialsButton = screen.getByText('Testimonials')
      fireEvent.click(testimonialsButton)

      await waitFor(() => {
        expect(mockClearCachePattern).toHaveBeenCalledWith('testimonials')
      })
    })

    it('should clear faqs pattern', async () => {
      render(<DevTools />)

      const toggleButton = screen.getByLabelText('Toggle developer tools')
      fireEvent.click(toggleButton)

      const faqsButton = screen.getByText('FAQs')
      fireEvent.click(faqsButton)

      await waitFor(() => {
        expect(mockClearCachePattern).toHaveBeenCalledWith('faqs')
      })
    })

    it('should show pattern-specific success message', async () => {
      render(<DevTools />)

      const toggleButton = screen.getByLabelText('Toggle developer tools')
      fireEvent.click(toggleButton)

      const cakesButton = screen.getByText('Cakes')
      fireEvent.click(cakesButton)

      await waitFor(() => {
        expect(screen.getByText('✅ Cache cleared for pattern: cakes')).toBeInTheDocument()
      })
    })
  })

  describe('Force Refresh', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development'
      const locationMock = { href: 'https://test.com/page' } as unknown as Location
      Object.defineProperty(window, 'location', { value: locationMock, writable: true })
    })

    it('should show Force Refresh button', () => {
      render(<DevTools />)

      const toggleButton = screen.getByLabelText('Toggle developer tools')
      fireEvent.click(toggleButton)

      expect(screen.getByText('Force Refresh')).toBeInTheDocument()
    })

    it('should add cache-busting parameter', () => {
      render(<DevTools />)

      const toggleButton = screen.getByLabelText('Toggle developer tools')
      fireEvent.click(toggleButton)

      const refreshButton = screen.getByText('Force Refresh')
      fireEvent.click(refreshButton)

      expect(window.location.href).toContain('_t=')
    })
  })

  describe('Cache Status', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development'
    })

    it('should show auto-clearing chip when active', () => {
      mockGetCacheStatus.mockReturnValue({ isAutoClearing: true })

      render(<DevTools />)

      const toggleButton = screen.getByLabelText('Toggle developer tools')
      fireEvent.click(toggleButton)

      expect(screen.getByText('Auto-clearing every 30s')).toBeInTheDocument()
    })

    it('should not show auto-clearing chip when inactive', () => {
      mockGetCacheStatus.mockReturnValue({ isAutoClearing: false })

      render(<DevTools />)

      const toggleButton = screen.getByLabelText('Toggle developer tools')
      fireEvent.click(toggleButton)

      expect(screen.queryByText('Auto-clearing every 30s')).not.toBeInTheDocument()
    })
  })

  describe('Last Cleared Timestamp', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development'
      mockClearAllCache.mockResolvedValue(undefined)
    })

    it('should show timestamp after clearing', async () => {
      render(<DevTools />)

      const toggleButton = screen.getByLabelText('Toggle developer tools')
      fireEvent.click(toggleButton)

      const clearButton = screen.getByText('Clear All Cache')
      fireEvent.click(clearButton)

      await waitFor(() => {
        expect(screen.getByText(/Last cleared:/)).toBeInTheDocument()
      })
    })

    it('should not show timestamp initially', () => {
      render(<DevTools />)

      const toggleButton = screen.getByLabelText('Toggle developer tools')
      fireEvent.click(toggleButton)

      expect(screen.queryByText(/Last cleared:/)).not.toBeInTheDocument()
    })
  })
})
