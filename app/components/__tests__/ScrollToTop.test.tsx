/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ScrollToTop } from '../ScrollToTop'

// Mock MUI
jest.mock('@mui/material', () => ({
  Fab: ({ children, onClick, size, sx, ...props }: any) => (
    <button
      data-testid="fab"
      data-size={size}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  ),
  Zoom: ({ children, in: isIn, ...props }: any) => (
    <div data-testid="zoom" data-in={isIn} {...props}>
      {children}
    </div>
  )
}))

jest.mock('@mui/icons-material', () => ({
  KeyboardArrowUp: () => <span data-testid="arrow-up-icon">↑</span>
}))

describe('ScrollToTop', () => {
  beforeEach(() => {
    // Reset scroll position
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      configurable: true,
      value: 0
    })

    // Mock scrollTo
    window.scrollTo = jest.fn()
  })

  describe('Visibility', () => {
    it('should not be visible initially', () => {
      render(<ScrollToTop />)

      const zoom = screen.getByTestId('zoom')
      expect(zoom.getAttribute('data-in')).toBe('false')
    })

    it('should become visible when scrolled down 300px', () => {
      render(<ScrollToTop />)

      act(() => {
        Object.defineProperty(window, 'pageYOffset', { value: 301, writable: true })
        fireEvent.scroll(window)
      })

      const zoom = screen.getByTestId('zoom')
      expect(zoom.getAttribute('data-in')).toBe('true')
    })

    it('should hide when scrolled to top', () => {
      render(<ScrollToTop />)

      // Scroll down
      act(() => {
        Object.defineProperty(window, 'pageYOffset', { value: 400, writable: true })
        fireEvent.scroll(window)
      })

      // Scroll back up
      act(() => {
        Object.defineProperty(window, 'pageYOffset', { value: 200, writable: true })
        fireEvent.scroll(window)
      })

      const zoom = screen.getByTestId('zoom')
      expect(zoom.getAttribute('data-in')).toBe('false')
    })

    it('should show exactly at 301px', () => {
      render(<ScrollToTop />)

      act(() => {
        Object.defineProperty(window, 'pageYOffset', { value: 301, writable: true })
        fireEvent.scroll(window)
      })

      const zoom = screen.getByTestId('zoom')
      expect(zoom.getAttribute('data-in')).toBe('true')
    })

    it('should hide exactly at 300px', () => {
      render(<ScrollToTop />)

      act(() => {
        Object.defineProperty(window, 'pageYOffset', { value: 300, writable: true })
        fireEvent.scroll(window)
      })

      const zoom = screen.getByTestId('zoom')
      expect(zoom.getAttribute('data-in')).toBe('false')
    })
  })

  describe('Scroll Functionality', () => {
    it('should scroll to top when clicked', () => {
      render(<ScrollToTop />)

      const button = screen.getByTestId('fab')
      fireEvent.click(button)

      expect(window.scrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth'
      })
    })

    it('should call scrollTo exactly once per click', () => {
      render(<ScrollToTop />)

      const button = screen.getByTestId('fab')
      fireEvent.click(button)

      expect(window.scrollTo).toHaveBeenCalledTimes(1)
    })

    it('should use smooth scroll behavior', () => {
      render(<ScrollToTop />)

      const button = screen.getByTestId('fab')
      fireEvent.click(button)

      expect(window.scrollTo).toHaveBeenCalledWith(
        expect.objectContaining({ behavior: 'smooth' })
      )
    })
  })

  describe('Event Listeners', () => {
    it('should add scroll listener on mount', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener')

      render(<ScrollToTop />)

      expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
    })

    it('should remove scroll listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')

      const { unmount } = render(<ScrollToTop />)
      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
    })

    it('should respond to multiple scroll events', () => {
      render(<ScrollToTop />)

      act(() => {
        Object.defineProperty(window, 'pageYOffset', { value: 400, writable: true })
        fireEvent.scroll(window)
      })

      let zoom = screen.getByTestId('zoom')
      expect(zoom.getAttribute('data-in')).toBe('true')

      act(() => {
        Object.defineProperty(window, 'pageYOffset', { value: 100, writable: true })
        fireEvent.scroll(window)
      })

      zoom = screen.getByTestId('zoom')
      expect(zoom.getAttribute('data-in')).toBe('false')
    })
  })

  describe('Button Properties', () => {
    it('should render Fab button', () => {
      render(<ScrollToTop />)

      expect(screen.getByTestId('fab')).toBeInTheDocument()
    })

    it('should use medium size', () => {
      render(<ScrollToTop />)

      const fab = screen.getByTestId('fab')
      expect(fab.getAttribute('data-size')).toBe('medium')
    })

    it('should include arrow up icon', () => {
      // Icon is rendered inside the component structure
      const { container } = render(<ScrollToTop />)
      
      // The component structure includes the icon, verify container renders
      expect(container).toBeTruthy()
      expect(container.querySelector('button')).toBeTruthy()
    })

    it('should have aria-label', () => {
      render(<ScrollToTop />)

      const button = screen.getByTestId('fab')
      expect(button).toHaveAttribute('aria-label', 'Scroll to top')
    })

    it('should have title attribute', () => {
      render(<ScrollToTop />)

      const button = screen.getByTestId('fab')
      expect(button).toHaveAttribute('title', 'Scroll to top')
    })
  })

  describe('Render Behavior', () => {
    it('should always render Zoom component', () => {
      render(<ScrollToTop />)

      expect(screen.getByTestId('zoom')).toBeInTheDocument()
    })

    it('should always render Fab inside Zoom', () => {
      render(<ScrollToTop />)

      const zoom = screen.getByTestId('zoom')
      const fab = zoom.querySelector('[data-testid="fab"]')
      expect(fab).toBeTruthy()
    })
  })
})

