/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ScrollToTop } from '../ScrollToTop'
import { KLARO_VISIBILITY_EVENT } from '../KlaroA11yBridge'

describe('ScrollToTop', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      configurable: true,
      value: 0
    })

    window.scrollTo = jest.fn()
    document.body.dataset.klaroOpen = 'false'
  })

  describe('Visibility', () => {
    it('should not be visible initially', () => {
      render(<ScrollToTop />)

      const zoom = screen.getByTestId('zoom')
      const button = screen.getByTestId('fab')
      expect(zoom.getAttribute('data-in')).toBe('false')
      expect(button).toHaveAttribute('tabindex', '-1')
      expect(button).toHaveAttribute('aria-hidden', 'true')
    })

    it('should become visible when scrolled down 300px', () => {
      render(<ScrollToTop />)

      act(() => {
        Object.defineProperty(window, 'pageYOffset', { value: 301, writable: true })
        fireEvent.scroll(window)
      })

      const zoom = screen.getByTestId('zoom')
      const button = screen.getByTestId('fab')
      expect(zoom.getAttribute('data-in')).toBe('true')
      expect(button).toHaveAttribute('tabindex', '0')
      expect(button).toHaveAttribute('aria-hidden', 'false')
    })

    it('should hide when scrolled to top', () => {
      render(<ScrollToTop />)

      act(() => {
        Object.defineProperty(window, 'pageYOffset', { value: 400, writable: true })
        fireEvent.scroll(window)
      })

      act(() => {
        Object.defineProperty(window, 'pageYOffset', { value: 200, writable: true })
        fireEvent.scroll(window)
      })

      const zoom = screen.getByTestId('zoom')
      const button = screen.getByTestId('fab')
      expect(zoom.getAttribute('data-in')).toBe('false')
      expect(button).toHaveAttribute('tabindex', '-1')
      expect(button).toHaveAttribute('aria-hidden', 'true')
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

    it('should hide while Klaro consent UI is open', () => {
      render(<ScrollToTop />)

      act(() => {
        Object.defineProperty(window, 'pageYOffset', { value: 400, writable: true })
        fireEvent.scroll(window)
      })

      act(() => {
        document.body.dataset.klaroOpen = 'true'
        window.dispatchEvent(new CustomEvent(KLARO_VISIBILITY_EVENT, { detail: { isOpen: true } }))
      })

      expect(screen.queryByTestId('zoom')).not.toBeInTheDocument()
      expect(screen.queryByTestId('fab')).not.toBeInTheDocument()
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
    it('should render the scroll-to-top button', () => {
      render(<ScrollToTop />)

      expect(screen.getByTestId('fab')).toBeInTheDocument()
    })

    it('should use medium size', () => {
      render(<ScrollToTop />)

      const fab = screen.getByTestId('fab')
      expect(fab.getAttribute('data-size')).toBe('medium')
    })

    it('should include the inline icon', () => {
      const { container } = render(<ScrollToTop />)

      expect(container.querySelector('button')).toBeTruthy()
      expect(container.querySelector('svg')).toBeTruthy()
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

    it('should be removed from keyboard focus order while hidden', () => {
      render(<ScrollToTop />)

      const button = screen.getByTestId('fab')
      expect(button).toHaveAttribute('tabindex', '-1')
      expect(button).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('Render Behavior', () => {
    it('should always render the visibility wrapper', () => {
      render(<ScrollToTop />)

      expect(screen.getByTestId('zoom')).toBeInTheDocument()
    })

    it('should always render the button inside the visibility wrapper', () => {
      render(<ScrollToTop />)

      const zoom = screen.getByTestId('zoom')
      const fab = zoom.querySelector('[data-testid="fab"]')
      expect(fab).toBeTruthy()
    })
  })
})
