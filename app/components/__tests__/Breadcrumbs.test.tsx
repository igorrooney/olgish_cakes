/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { Breadcrumbs } from '../Breadcrumbs'

// Mock Next.js
const mockPathname = jest.fn()
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname()
}))

jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>
})

// Mock MUI
jest.mock('@/lib/mui-optimization', () => ({
  Breadcrumbs: ({ children, ...props }: any) => (
    <nav data-testid="breadcrumbs" {...props}>{children}</nav>
  ),
  Link: ({ children, component, href, color, underline, sx, ...props }: any) => {
    const Component = component || 'a'
    return <Component href={href} data-testid="mui-link" {...props}>{children}</Component>
  },
  Typography: ({ children, color, sx, ...props }: any) => (
    <span data-testid="typography" {...props}>{children}</span>
  )
}))

// Mock design system
jest.mock('@/lib/design-system', () => ({
  designTokens: {
    colors: {
      text: { primary: '#000', secondary: '#666' },
      primary: { main: '#2E3192' }
    },
    typography: {
      fontSize: { sm: '0.875rem' },
      fontWeight: { semibold: 600, normal: 400 }
    }
  }
}))

describe('Breadcrumbs', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Home Page', () => {
    it('should return null on home page', () => {
      mockPathname.mockReturnValue('/')

      const { container } = render(<Breadcrumbs />)

      expect(container.firstChild).toBeNull()
    })

    it('should not render breadcrumbs on /', () => {
      mockPathname.mockReturnValue('/')

      const { queryByTestId } = render(<Breadcrumbs />)

      expect(queryByTestId('breadcrumbs')).not.toBeInTheDocument()
    })
  })

  describe('Auto-generated Breadcrumbs', () => {
    it('should generate breadcrumbs from pathname', () => {
      mockPathname.mockReturnValue('/cakes/honey-cake')

      render(<Breadcrumbs />)

      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Cakes')).toBeInTheDocument()
      expect(screen.getByText('Honey Cake')).toBeInTheDocument()
    })

    it('should convert dashes to spaces in labels', () => {
      mockPathname.mockReturnValue('/custom-cake-design')

      render(<Breadcrumbs />)

      expect(screen.getByText('Custom Cake Design')).toBeInTheDocument()
    })

    it('should capitalize first letter of each word', () => {
      mockPathname.mockReturnValue('/wedding-cakes-leeds')

      render(<Breadcrumbs />)

      expect(screen.getByText('Wedding Cakes Leeds')).toBeInTheDocument()
    })

    it('should not link last breadcrumb', () => {
      mockPathname.mockReturnValue('/cakes/honey-cake')

      render(<Breadcrumbs />)

      const honeyCake = screen.getByText('Honey Cake')
      expect(honeyCake.closest('a')).toBeNull()
    })

    it('should link intermediate breadcrumbs', () => {
      mockPathname.mockReturnValue('/cakes/honey-cake')

      render(<Breadcrumbs />)

      const cakesLink = screen.getByText('Cakes').closest('a')
      expect(cakesLink).toHaveAttribute('href', '/cakes')
    })

    it('should include Home link by default', () => {
      mockPathname.mockReturnValue('/cakes')

      render(<Breadcrumbs />)

      const homeLink = screen.getByText('Home').closest('a')
      expect(homeLink).toHaveAttribute('href', '/')
    })

    it('should not include Home when showHome is false', () => {
      mockPathname.mockReturnValue('/cakes')

      render(<Breadcrumbs showHome={false} />)

      expect(screen.queryByText('Home')).not.toBeInTheDocument()
    })
  })

  describe('Custom Items', () => {
    const customItems = [
      { label: 'Home', href: '/' },
      { label: 'Custom', href: '/custom' },
      { label: 'Current Page' }
    ]

    it('should render custom items', () => {
      mockPathname.mockReturnValue('/some/path')

      render(<Breadcrumbs items={customItems} />)

      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Custom')).toBeInTheDocument()
      expect(screen.getByText('Current Page')).toBeInTheDocument()
    })

    it('should link custom items with href', () => {
      mockPathname.mockReturnValue('/some/path')

      render(<Breadcrumbs items={customItems} />)

      const customLink = screen.getByText('Custom').closest('a')
      expect(customLink).toHaveAttribute('href', '/custom')
    })

    it('should not link items without href', () => {
      mockPathname.mockReturnValue('/some/path')

      render(<Breadcrumbs items={customItems} />)

      const currentPage = screen.getByText('Current Page')
      expect(currentPage.closest('a')).toBeNull()
    })

    it('should override showHome when using custom items', () => {
      mockPathname.mockReturnValue('/some/path')

      render(<Breadcrumbs items={[{ label: 'Only Item' }]} showHome={true} />)

      // When custom items provided, showHome doesn't apply to generation
      expect(screen.queryByText('Home')).not.toBeInTheDocument()
      expect(screen.getByText('Only Item')).toBeInTheDocument()
    })
  })

  describe('Structured Data', () => {
    it('should include JSON-LD script', () => {
      mockPathname.mockReturnValue('/cakes')

      const { container } = render(<Breadcrumbs />)

      const script = container.querySelector('script[type="application/ld+json"]')
      expect(script).toBeTruthy()
    })

    it('should generate valid BreadcrumbList', () => {
      mockPathname.mockReturnValue('/cakes')

      const { container } = render(<Breadcrumbs />)

      const script = container.querySelector('script')
      const json = JSON.parse(script?.textContent || '{}')
      expect(json['@type']).toBe('BreadcrumbList')
    })

    it('should include all breadcrumb items', () => {
      mockPathname.mockReturnValue('/cakes/honey-cake')

      const { container } = render(<Breadcrumbs />)

      const script = container.querySelector('script')
      const json = JSON.parse(script?.textContent || '{}')
      expect(json.itemListElement.length).toBe(3)
    })
  })

  describe('Accessibility', () => {
    it('should have aria-label', () => {
      mockPathname.mockReturnValue('/cakes')

      render(<Breadcrumbs />)

      const breadcrumbs = screen.getByTestId('breadcrumbs')
      expect(breadcrumbs).toHaveAttribute('aria-label', 'breadcrumb')
    })
  })
})

