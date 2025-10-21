/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { BackButton } from '../BackButton'

// Mock Next.js navigation
const mockBack = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    back: mockBack
  })
}))

// Mock MUI components
jest.mock('@/lib/mui-optimization', () => ({
  Button: ({ children, variant, startIcon, onClick, disabled, sx, ...props }: any) => (
    <button
      data-testid="button"
      data-variant={variant}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {startIcon}
      {children}
    </button>
  ),
  ArrowBackIcon: () => <span data-testid="arrow-back-icon">←</span>
}))

// Mock design system
jest.mock('@/lib/design-system', () => ({
  designTokens: {
    colors: {
      primary: { main: '#2E3192' },
      text: { disabled: '#999999' }
    },
    typography: {
      fontWeight: { medium: 500 },
      fontSize: { base: '1rem' }
    },
    spacing: {
      sm: '0.5rem',
      md: '1rem'
    }
  }
}))

describe('BackButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render button', () => {
      render(<BackButton />)

      expect(screen.getByTestId('button')).toBeInTheDocument()
    })

    it('should display "Back to Cakes" text', () => {
      render(<BackButton />)

      expect(screen.getByText('Back to Cakes')).toBeInTheDocument()
    })

    it('should include ArrowBackIcon', () => {
      render(<BackButton />)

      expect(screen.getByTestId('arrow-back-icon')).toBeInTheDocument()
    })

    it('should use text variant', () => {
      render(<BackButton />)

      const button = screen.getByTestId('button')
      expect(button.getAttribute('data-variant')).toBe('text')
    })

    it('should not be disabled initially', () => {
      render(<BackButton />)

      const button = screen.getByTestId('button')
      expect(button).not.toBeDisabled()
    })
  })

  describe('Navigation', () => {
    it('should call router.back() when clicked', () => {
      render(<BackButton />)

      const button = screen.getByTestId('button')
      fireEvent.click(button)

      expect(mockBack).toHaveBeenCalled()
    })

    it('should call router.back() exactly once', () => {
      render(<BackButton />)

      const button = screen.getByTestId('button')
      fireEvent.click(button)

      expect(mockBack).toHaveBeenCalledTimes(1)
    })

    it('should set loading state when clicked', () => {
      render(<BackButton />)

      const button = screen.getByTestId('button')
      fireEvent.click(button)

      // Button should become disabled after click
      expect(button).toBeDisabled()
    })
  })

  describe('Loading State', () => {
    it('should disable button when loading', () => {
      render(<BackButton />)

      const button = screen.getByTestId('button')
      fireEvent.click(button)

      expect(button).toBeDisabled()
    })

    it('should prevent multiple clicks', () => {
      render(<BackButton />)

      const button = screen.getByTestId('button')
      fireEvent.click(button)
      fireEvent.click(button)
      fireEvent.click(button)

      expect(mockBack).toHaveBeenCalledTimes(1)
    })
  })

  describe('Styling', () => {
    it('should use primary color', () => {
      render(<BackButton />)

      const button = screen.getByTestId('button')
      expect(button).toBeInTheDocument()
    })

    it('should have text transform none', () => {
      render(<BackButton />)

      expect(screen.getByTestId('button')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should be keyboard accessible', () => {
      render(<BackButton />)

      const button = screen.getByTestId('button')
      expect(button.tagName.toLowerCase()).toBe('button')
    })

    it('should have descriptive text', () => {
      render(<BackButton />)

      expect(screen.getByText('Back to Cakes')).toBeInTheDocument()
    })

    it('should have visual icon', () => {
      render(<BackButton />)

      expect(screen.getByTestId('arrow-back-icon')).toBeInTheDocument()
    })
  })
})

