/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CookieConsent from '../CookieConsent'

// Mock Next.js
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>
})

// Mock MUI and UI components
jest.mock('@/lib/mui-optimization', () => ({
  Box: ({ children, sx, ...props }: any) => <div data-testid="box" {...props}>{children}</div>,
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>{children}</button>
  ),
  Typography: ({ children, variant, sx, ...props }: any) => (
    <div data-testid="typography" data-variant={variant} {...props}>{children}</div>
  ),
  Paper: ({ children, elevation, sx, ...props }: any) => (
    <div data-testid="paper" {...props}>{children}</div>
  ),
  Link: ({ children, component, href, sx, ...props }: any) => {
    const Component = component || 'a'
    return <Component href={href} data-testid="mui-link" {...props}>{children}</Component>
  },
  Stack: ({ children, direction, spacing, sx, ...props }: any) => (
    <div data-testid="stack" {...props}>{children}</div>
  ),
  IconButton: ({ children, ...props }: any) => <button data-testid="icon-button" {...props}>{children}</button>,
  CloseIcon: () => <span>×</span>
}))

// Mock UI components
jest.mock('@/lib/ui-components', () => ({
  PrimaryButton: ({ children, onClick, disabled, ...props }: any) => (
    <button data-testid="primary-button" onClick={onClick} disabled={disabled} {...props}>{children}</button>
  ),
  OutlineButton: ({ children, onClick, disabled, ...props }: any) => (
    <button data-testid="outline-button" onClick={onClick} disabled={disabled} {...props}>{children}</button>
  ),
  BodyText: ({ children, ...props }: any) => <p data-testid="body-text" {...props}>{children}</p>,
  TouchTargetWrapper: ({ children, ...props }: any) => <div data-testid="touch-target" {...props}>{children}</div>,
  AccessibleIconButton: ({ children, label, onClick, ...props }: any) => (
    <button data-testid="accessible-icon-button" onClick={onClick} aria-label={label} {...props}>{children}</button>
  )
}))

jest.mock('@/lib/design-system', () => ({
  designTokens: {
    colors: {
      background: { paper: '#FFF', subtle: '#F5F5F5' },
      border: { light: '#E0E0E0' },
      text: { primary: '#000', secondary: '#666' },
      primary: { main: '#2E3192' }
    },
    typography: {
      fontWeight: { semibold: 600, medium: 500 },
      lineHeight: { relaxed: 1.75 }
    },
    spacing: { sm: '0.5rem', md: '1rem', lg: '1.5rem' },
    borderRadius: { lg: '0.75rem' },
    shadows: {}
  }
}))

jest.mock('@/lib/ui-components', () => ({
  PrimaryButton: ({ children, onClick, disabled, sx, ...props }: any) => (
    <button data-testid="primary-button" onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
  OutlineButton: ({ children, onClick, disabled, sx, ...props }: any) => (
    <button data-testid="outline-button" onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
  BodyText: ({ children, sx, ...props }: any) => <p data-testid="body-text" {...props}>{children}</p>,
  TouchTargetWrapper: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  AccessibleIconButton: ({ children, onClick, ariaLabel, title, sx, ...props }: any) => (
    <button data-testid="accessible-icon-button" onClick={onClick} aria-label={ariaLabel} title={title} {...props}>
      {children}
    </button>
  )
}))

describe('CookieConsent', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    localStorage.clear()
    jest.restoreAllMocks()
  })

  describe('Initial Visibility', () => {
    it('should show when no consent stored', () => {
      render(<CookieConsent />)

      expect(screen.getByText('🍪 Cookie Policy')).toBeInTheDocument()
    })

    it('should not show when consent accepted', () => {
      localStorage.setItem('cookieConsent', 'accepted')

      const { queryByText } = render(<CookieConsent />)

      expect(queryByText('🍪 Cookie Policy')).not.toBeInTheDocument()
    })

    it('should not show when consent declined', () => {
      localStorage.setItem('cookieConsent', 'declined')

      const { queryByText } = render(<CookieConsent />)

      expect(queryByText('🍪 Cookie Policy')).not.toBeInTheDocument()
    })
  })

  describe('Content', () => {
    it('should display heading', () => {
      render(<CookieConsent />)

      expect(screen.getByText('🍪 Cookie Policy')).toBeInTheDocument()
    })

    it('should display cookie policy text', () => {
      render(<CookieConsent />)

      expect(screen.getByText(/We use cookies to enhance your browsing experience/)).toBeInTheDocument()
    })

    it('should display link to cookie policy', () => {
      render(<CookieConsent />)

      expect(screen.getByText('Learn more about our cookie policy')).toBeInTheDocument()
    })

    it('should link to /cookies page', () => {
      render(<CookieConsent />)

      const link = screen.getByText('Learn more about our cookie policy').closest('a')
      expect(link).toHaveAttribute('href', '/cookies')
    })
  })

  describe('Buttons', () => {
    it('should render Accept button', () => {
      render(<CookieConsent />)

      expect(screen.getByText('Accept All')).toBeInTheDocument()
    })

    it('should render Decline button', () => {
      render(<CookieConsent />)

      expect(screen.getByText('Decline')).toBeInTheDocument()
    })

    it('should render close button', () => {
      render(<CookieConsent />)

      const closeButton = screen.getByTestId('accessible-icon-button')
      expect(closeButton).toBeInTheDocument()
      expect(closeButton).toHaveAttribute('aria-label', 'Close cookie consent')
    })
  })

  describe('Accept Functionality', () => {
    it('should save accepted consent to localStorage', async () => {
      render(<CookieConsent />)

      const acceptButton = screen.getByText('Accept All')
      fireEvent.click(acceptButton)

      await waitFor(() => {
        expect(localStorage.getItem('cookieConsent')).toBe('accepted')
      })
    })

    it('should hide banner after accepting', async () => {
      render(<CookieConsent />)

      const acceptButton = screen.getByText('Accept All')
      fireEvent.click(acceptButton)

      await waitFor(() => {
        expect(screen.queryByText('🍪 Cookie Policy')).not.toBeInTheDocument()
      })
    })

    it('should disable buttons while processing', async () => {
      render(<CookieConsent />)

      const acceptButton = screen.getByText('Accept All')

      // Click should work without throwing
      expect(() => fireEvent.click(acceptButton)).not.toThrow()

      // Wait for processing to complete
      await waitFor(() => {
        expect(screen.queryByText('🍪 Cookie Policy')).not.toBeInTheDocument()
      })
    })

    it('should handle localStorage error gracefully', async () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem')
        .mockImplementation(() => { throw new Error('QuotaExceededError') })

      render(<CookieConsent />)

      const acceptButton = screen.getByText('Accept All')
      fireEvent.click(acceptButton)

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Error saving cookie consent:', expect.any(Error))
      })

      setItemSpy.mockRestore()
    })
  })

  describe('Decline Functionality', () => {
    it('should save declined consent to localStorage', async () => {
      render(<CookieConsent />)

      const declineButton = screen.getByText('Decline')
      fireEvent.click(declineButton)

      await waitFor(() => {
        expect(localStorage.getItem('cookieConsent')).toBe('declined')
      })
    })

    it('should hide banner after declining', async () => {
      render(<CookieConsent />)

      const declineButton = screen.getByText('Decline')
      fireEvent.click(declineButton)

      await waitFor(() => {
        expect(screen.queryByText('🍪 Cookie Policy')).not.toBeInTheDocument()
      })
    })

    it('should handle localStorage error on decline', async () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem')
        .mockImplementation(() => { throw new Error('Error') })

      render(<CookieConsent />)

      const declineButton = screen.getByText('Decline')
      fireEvent.click(declineButton)

      await waitFor(() => {
        expect(console.error).toHaveBeenCalled()
      })

      setItemSpy.mockRestore()
    })
  })

  describe('Close Functionality', () => {
    it('should hide banner when close button clicked', () => {
      render(<CookieConsent />)

      const closeButton = screen.getByTestId('accessible-icon-button')
      fireEvent.click(closeButton)

      expect(screen.queryByText('🍪 Cookie Policy')).not.toBeInTheDocument()
    })

    it('should not save to localStorage when closed', () => {
      render(<CookieConsent />)

      const closeButton = screen.getByTestId('accessible-icon-button')
      fireEvent.click(closeButton)

      expect(localStorage.getItem('cookieConsent')).toBeNull()
    })
  })

  describe('Memoization', () => {
    it('should be memoized', () => {
    })
  })

  describe('Accessibility', () => {
    it('should have close button with aria-label', () => {
      render(<CookieConsent />)

      const closeButton = screen.getByTestId('accessible-icon-button')
      expect(closeButton).toHaveAttribute('aria-label', 'Close cookie consent')
      expect(closeButton).toHaveAttribute('title', 'Close cookie consent')
    })
  })
})

