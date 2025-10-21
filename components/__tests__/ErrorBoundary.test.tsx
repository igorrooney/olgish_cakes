/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary } from '../ErrorBoundary'

// Mock MUI components
jest.mock('@mui/material', () => ({
  Box: ({ children, sx, ...props }: any) => (
    <div data-testid="box" data-sx={JSON.stringify(sx)} {...props}>{children}</div>
  ),
  Typography: ({ children, variant, color, gutterBottom, sx, ...props }: any) => (
    <div
      data-testid="typography"
      data-variant={variant}
      data-color={color}
      data-sx={JSON.stringify(sx)}
      {...props}
    >
      {children}
    </div>
  ),
  Alert: ({ children, severity, sx, ...props }: any) => (
    <div data-testid="alert" data-severity={severity} data-sx={JSON.stringify(sx)} {...props}>
      {children}
    </div>
  ),
  Button: ({ children, variant, onClick, sx, ...props }: any) => (
    <button
      data-testid="button"
      data-variant={variant}
      onClick={onClick}
      data-sx={JSON.stringify(sx)}
      {...props}
    >
      {children}
    </button>
  )
}))

// Component that throws an error
function ThrowError({ shouldThrow = false }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div data-testid="child">Child component</div>
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Normal Rendering', () => {
    it('should render children when no error', () => {
      render(
        <ErrorBoundary>
          <div data-testid="child">Child content</div>
        </ErrorBoundary>
      )

      expect(screen.getByTestId('child')).toBeInTheDocument()
      expect(screen.getByText('Child content')).toBeInTheDocument()
    })

    it('should not show error message when no error', () => {
      render(
        <ErrorBoundary>
          <div>Content</div>
        </ErrorBoundary>
      )

      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
    })

    it('should render multiple children', () => {
      render(
        <ErrorBoundary>
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
        </ErrorBoundary>
      )

      expect(screen.getByTestId('child1')).toBeInTheDocument()
      expect(screen.getByTestId('child2')).toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('should catch errors from children', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('should display error message', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Test error')).toBeInTheDocument()
    })

    it('should show default message for errors without message', () => {
      function ThrowErrorWithoutMessage() {
        throw { name: 'CustomError' }
      }

      render(
        <ErrorBoundary>
          <ThrowErrorWithoutMessage />
        </ErrorBoundary>
      )

      expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument()
    })

    it('should not render children when error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.queryByTestId('child')).not.toBeInTheDocument()
    })

    it('should show error alert', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const alert = screen.getByTestId('alert')
      expect(alert).toBeInTheDocument()
      expect(alert.getAttribute('data-severity')).toBe('error')
    })

    it('should show reload button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Reload Page')).toBeInTheDocument()
    })

    it('should log error to console', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(console.error).toHaveBeenCalled()
    })
  })

  describe('Custom Fallback', () => {
    it('should render custom fallback when provided', () => {
      const customFallback = <div data-testid="custom-fallback">Custom Error UI</div>

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument()
      expect(screen.getByText('Custom Error UI')).toBeInTheDocument()
    })

    it('should not show default error UI with custom fallback', () => {
      const customFallback = <div>Custom UI</div>

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
      expect(screen.queryByText('Reload Page')).not.toBeInTheDocument()
    })

    it('should not use fallback when no error', () => {
      const customFallback = <div data-testid="custom-fallback">Custom UI</div>

      render(
        <ErrorBoundary fallback={customFallback}>
          <div data-testid="child">Normal Content</div>
        </ErrorBoundary>
      )

      expect(screen.queryByTestId('custom-fallback')).not.toBeInTheDocument()
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })
  })

  describe('Reload Functionality', () => {
    it('should reload window when reload button clicked', () => {
      const reloadSpy = jest.fn()
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { reload: reloadSpy }
      })

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const reloadButton = screen.getByText('Reload Page')
      fireEvent.click(reloadButton)

      expect(reloadSpy).toHaveBeenCalled()
    })
  })

  describe('Class Component Behavior', () => {
    it('should initialize with hasError false', () => {
      const { container } = render(
        <ErrorBoundary>
          <div>Content</div>
        </ErrorBoundary>
      )

      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
    })

    it('should update state when error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      // State should be updated to hasError: true
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('should call getDerivedStateFromError', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      // Should catch error and update state
      expect(screen.getByText('Test error')).toBeInTheDocument()
    })

    it('should call componentDidCatch', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      // Should log error
      expect(console.error).toHaveBeenCalled()
    })
  })

  describe('Error Message Display', () => {
    it('should show error message in Typography', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const typography = screen.getAllByTestId('typography')
      const errorMessage = typography.find(t => t.textContent === 'Test error')
      expect(errorMessage).toBeInTheDocument()
    })

    it('should show heading', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('should apply brand color to reload button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const button = screen.getByTestId('button')
      const sx = JSON.parse(button.getAttribute('data-sx') || '{}')
      expect(sx.backgroundColor).toBe('#2E3192')
    })

    it('should center error content', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const box = screen.getByTestId('box')
      const sx = JSON.parse(box.getAttribute('data-sx') || '{}')
      expect(sx.textAlign).toBe('center')
    })
  })

  describe('Multiple Errors', () => {
    it('should handle consecutive errors', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <div>No error</div>
        </ErrorBoundary>
      )

      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()

      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })
  })
})

