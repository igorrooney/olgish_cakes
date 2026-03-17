/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { CategoryLinks } from '../CategoryLinks'

jest.mock('next/link', () => {
  return ({ children, href, ...props }: MockProps) => (
    <a href={href} {...props}>{children}</a>
  )
})

jest.mock('@mui/material', () => ({
  Box: ({ children, sx, ...props }: MockProps) => (
    <div data-testid='box' {...props}>{children}</div>
  ),
  Typography: ({ children, variant, className, sx, ...props }: MockProps) => (
    <div data-testid='typography' data-variant={variant} className={className} {...props}>
      {children}
    </div>
  ),
  Chip: ({ label, size, className, sx, title, ...props }: MockProps) => (
    <span data-testid='chip' data-size={size} className={className} title={title} {...props}>
      {label}
    </span>
  ),
  Stack: ({ children, direction, spacing, flexWrap, useFlexGap, ...props }: MockProps) => (
    <div data-testid='stack' data-direction={direction} {...props}>{children}</div>
  )
}))

describe('CategoryLinks', () => {
  const activeCategories = ['wedding-cakes', 'birthday-cakes', 'custom-cakes', 'honey-cake']

  describe('Rendering', () => {
    it('renders the wrapper content and active mapped categories', () => {
      render(<CategoryLinks categories={activeCategories} />)

      expect(screen.getAllByTestId('box').length).toBeGreaterThan(0)
      expect(screen.getByTestId('stack')).toBeInTheDocument()
      expect(screen.getByText('Explore More Categories')).toBeInTheDocument()
      expect(screen.getByText(/Discover more cake categories/)).toBeInTheDocument()
      expect(screen.getByText('Wedding Cakes')).toBeInTheDocument()
      expect(screen.getByText('Birthday Cakes')).toBeInTheDocument()
      expect(screen.getByText('Custom Cakes')).toBeInTheDocument()
      expect(screen.getByText('Honey Cake')).toBeInTheDocument()
    })
  })

  describe('Category Filtering', () => {
    it('filters out the current category case-insensitively', () => {
      render(<CategoryLinks currentCategory='WEDDING-CAKES' categories={activeCategories} />)

      expect(screen.queryByText('Wedding Cakes')).not.toBeInTheDocument()
      expect(screen.getByText('Birthday Cakes')).toBeInTheDocument()
      expect(screen.getByText('Custom Cakes')).toBeInTheDocument()
    })

    it('slices to the first four categories before omitting unmapped retired slugs', () => {
      render(
        <CategoryLinks
          categories={[
            'wedding-cakes',
            'ukrainian-cakes',
            'custom-cakes',
            'corporate-cakes',
            'birthday-cakes'
          ]}
        />
      )

      expect(screen.getByText('Wedding Cakes')).toBeInTheDocument()
      expect(screen.getByText('Custom Cakes')).toBeInTheDocument()
      expect(screen.queryByText('Ukrainian Cakes')).not.toBeInTheDocument()
      expect(screen.queryByText('Corporate Cakes')).not.toBeInTheDocument()
      expect(screen.queryByText('Birthday Cakes')).not.toBeInTheDocument()
      expect(screen.getAllByTestId('chip')).toHaveLength(2)
    })
  })

  describe('Category Links', () => {
    it('renders active category links with the correct destinations', () => {
      render(<CategoryLinks categories={activeCategories} />)

      expect(screen.getByText('Wedding Cakes').closest('a')).toHaveAttribute('href', '/wedding-cakes')
      expect(screen.getByText('Birthday Cakes').closest('a')).toHaveAttribute('href', '/birthday-cakes')
      expect(screen.getByText('Custom Cakes').closest('a')).toHaveAttribute('href', '/custom-cake-design')
      expect(screen.getByText('Honey Cake').closest('a')).toHaveAttribute('href', '/honey-cake-history')
    })

    it('keeps active category descriptions in the chip title attribute', () => {
      render(<CategoryLinks categories={['wedding-cakes']} />)

      expect(screen.getByTestId('chip')).toHaveAttribute('title', 'Explore our stunning wedding cake collection')
    })
  })

  describe('Retired Categories', () => {
    it('does not render chips or links for retired slugs', () => {
      render(<CategoryLinks categories={['ukrainian-cakes', 'corporate-cakes', 'wedding-cakes']} />)

      expect(screen.queryByText('Ukrainian Cakes')).not.toBeInTheDocument()
      expect(screen.queryByText('Corporate Cakes')).not.toBeInTheDocument()
      expect(screen.queryByRole('link', { name: 'Browse Ukrainian Cakes cakes' })).not.toBeInTheDocument()
      expect(screen.queryByRole('link', { name: 'Browse Corporate Cakes cakes' })).not.toBeInTheDocument()
      expect(screen.getByText('Wedding Cakes')).toBeInTheDocument()
    })

    it('renders only active mapped categories from a mixed list', () => {
      render(
        <CategoryLinks
          categories={['ukrainian-cakes', 'wedding-cakes', 'unknown-category', 'corporate-cakes']}
        />
      )

      expect(screen.getAllByTestId('chip')).toHaveLength(1)
      expect(screen.getByText('Wedding Cakes')).toBeInTheDocument()
    })
  })

  describe('Category Mappings', () => {
    it('skips unknown categories and matches categories case-insensitively', () => {
      render(<CategoryLinks categories={['WEDDING-CAKES', 'unknown-category']} />)

      expect(screen.getByText('Wedding Cakes')).toBeInTheDocument()
      expect(screen.getAllByTestId('chip')).toHaveLength(1)
    })
  })

  describe('Accessibility', () => {
    it('keeps aria-labels and link styling for rendered links', () => {
      const { container } = render(<CategoryLinks categories={['wedding-cakes', 'birthday-cakes']} />)
      const links = container.querySelectorAll('a')

      expect(screen.getByRole('link', { name: 'Browse Wedding Cakes cakes' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Browse Birthday Cakes cakes' })).toBeInTheDocument()

      links.forEach((link) => {
        expect(link).toHaveStyle({ textDecoration: 'none' })
      })
    })
  })

  describe('Empty State', () => {
    it('returns null when no categories are provided', () => {
      const { container } = render(<CategoryLinks categories={[]} />)

      expect(container.firstChild).toBeNull()
    })

    it('returns null when only the current category remains after filtering', () => {
      const { container } = render(
        <CategoryLinks currentCategory='wedding-cakes' categories={['wedding-cakes']} />
      )

      expect(container.firstChild).toBeNull()
    })

    it('returns null when nothing mapped remains after filtering and unmapping', () => {
      const { container } = render(
        <CategoryLinks
          currentCategory='wedding-cakes'
          categories={['wedding-cakes', 'ukrainian-cakes', 'corporate-cakes', 'unknown-category']}
        />
      )

      expect(container.firstChild).toBeNull()
    })
  })

  describe('Props', () => {
    it('handles an undefined currentCategory', () => {
      render(<CategoryLinks categories={['seasonal-cakes']} />)

      expect(screen.getByText('Seasonal Cakes')).toBeInTheDocument()
    })
  })
})
