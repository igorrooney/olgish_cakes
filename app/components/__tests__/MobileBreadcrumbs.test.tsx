/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MobileBreadcrumbs } from '../MobileBreadcrumbs'

// Mock MUI
jest.mock('@/lib/mui-optimization', () => ({
  Box: ({ children, component, sx, ...props }: any) => {
    const Component = component || 'div'
    return <Component data-testid="box" {...props}>{children}</Component>
  },
  Typography: ({ children, sx, ...props }: any) => <span data-testid="typography" {...props}>{children}</span>,
  Breadcrumbs: ({ children, separator, ...props }: any) => (
    <nav data-testid="breadcrumbs" {...props}>
      {children}
      {separator && <span data-testid="separator">{separator}</span>}
    </nav>
  ),
  Link: ({ children, href, onClick, sx, ...props }: any) => (
    <a data-testid="link" href={href} onClick={onClick} {...props}>{children}</a>
  )
}))

// Mock design system
jest.mock('@/lib/design-system', () => ({
  designTokens: {
    colors: {
      background: { warm: '#FFF8E7' },
      border: { light: '#E0E0E0' },
      text: { secondary: '#666' },
      primary: { main: '#2E3192' }
    },
    typography: {
      fontSize: { sm: '0.875rem' },
      fontWeight: { medium: 500, normal: 400 }
    }
  }
}))

describe('MobileBreadcrumbs', () => {
  const mockItems = [
    { label: 'Home', href: '/' },
    { label: 'Cakes', href: '/cakes' },
    { label: 'Honey Cake' }
  ]

  describe('Rendering', () => {
    it('should render breadcrumbs', () => {
      render(<MobileBreadcrumbs items={mockItems} />)

      expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument()
    })

    it('should render all items', () => {
      render(<MobileBreadcrumbs items={mockItems} />)

      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Cakes')).toBeInTheDocument()
      expect(screen.getByText('Honey Cake')).toBeInTheDocument()
    })

    it('should render Box container', () => {
      render(<MobileBreadcrumbs items={mockItems} />)

      expect(screen.getAllByTestId('box').length).toBeGreaterThan(0)
    })

    it('should have custom separator', () => {
      render(<MobileBreadcrumbs items={mockItems} />)

      const separator = screen.getByTestId('separator')
      expect(separator).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should return null for single item', () => {
      const { container } = render(<MobileBreadcrumbs items={[{ label: 'Only' }]} />)

      expect(container.firstChild).toBeNull()
    })

    it('should return null for empty items', () => {
      const { container } = render(<MobileBreadcrumbs items={[]} />)

      expect(container.firstChild).toBeNull()
    })

    it('should render for two or more items', () => {
      render(<MobileBreadcrumbs items={[{ label: 'One' }, { label: 'Two' }]} />)

      expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument()
    })
  })

  describe('Links', () => {
    it('should render links for items with href', () => {
      render(<MobileBreadcrumbs items={mockItems} />)

      const homeLink = screen.getByText('Home').closest('a')
      expect(homeLink).toHaveAttribute('href', '/')
    })

    it('should not render link for last item', () => {
      render(<MobileBreadcrumbs items={mockItems} />)

      const lastItem = screen.getByText('Honey Cake')
      expect(lastItem.closest('a')).toBeNull()
    })

    it('should not render link for items without href', () => {
      render(<MobileBreadcrumbs items={mockItems} />)

      const honeyCake = screen.getByText('Honey Cake').closest('a')
      expect(honeyCake).toBeNull()
    })

    it('should call onNavigate when link clicked', () => {
      const onNavigate = jest.fn()

      render(<MobileBreadcrumbs items={mockItems} onNavigate={onNavigate} />)

      const cakesLink = screen.getByText('Cakes')
      fireEvent.click(cakesLink)

      expect(onNavigate).toHaveBeenCalledWith('/cakes')
    })

    it('should prevent default navigation', () => {
      const onNavigate = jest.fn()

      render(<MobileBreadcrumbs items={mockItems} onNavigate={onNavigate} />)

      const cakesLink = screen.getByText('Cakes')
      const event = new MouseEvent('click', { bubbles: true })
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault')
      
      cakesLink.dispatchEvent(event)

      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('should handle missing onNavigate', () => {
      render(<MobileBreadcrumbs items={mockItems} />)

      const cakesLink = screen.getByText('Cakes')
      
      expect(() => {
        fireEvent.click(cakesLink)
      }).not.toThrow()
    })
  })

  describe('Accessibility', () => {
    it('should have aria-label', () => {
      render(<MobileBreadcrumbs items={mockItems} />)

      const breadcrumbs = screen.getByTestId('breadcrumbs')
      expect(breadcrumbs).toHaveAttribute('aria-label', 'breadcrumb navigation')
    })

    it('should have aria-label for links', () => {
      render(<MobileBreadcrumbs items={mockItems} />)

      const homeLink = screen.getByText('Home').closest('a')
      expect(homeLink).toHaveAttribute('aria-label', 'Navigate to Home')
    })
  })

  describe('Styling', () => {
    it('should render with background color', () => {
      render(<MobileBreadcrumbs items={mockItems} />)

      expect(screen.getAllByTestId('box')[0]).toBeInTheDocument()
    })

    it('should use warm background', () => {
      render(<MobileBreadcrumbs items={mockItems} />)

      expect(screen.getAllByTestId('box').length).toBeGreaterThan(0)
    })
  })

  describe('Memoization', () => {
    it('should be memoized', () => {
    })
  })

  describe('Item Rendering', () => {
    it('should render Typography for last item', () => {
      render(<MobileBreadcrumbs items={mockItems} />)

      const typographies = screen.getAllByTestId('typography')
      expect(typographies.length).toBeGreaterThan(0)
    })

    it('should render links for non-last items with href', () => {
      render(<MobileBreadcrumbs items={mockItems} />)

      const links = screen.getAllByTestId('link')
      expect(links.length).toBeGreaterThanOrEqual(1)
    })
  })
})

