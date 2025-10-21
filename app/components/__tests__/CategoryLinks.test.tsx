/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { CategoryLinks } from '../CategoryLinks'

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>
})

// Mock MUI
jest.mock('@mui/material', () => ({
  Box: ({ children, sx, ...props }: any) => <div data-testid="box" {...props}>{children}</div>,
  Typography: ({ children, variant, className, sx, ...props }: any) => (
    <div data-testid="typography" data-variant={variant} className={className} {...props}>
      {children}
    </div>
  ),
  Chip: ({ label, size, className, sx, title, ...props }: any) => (
    <span data-testid="chip" data-size={size} className={className} title={title} {...props}>
      {label}
    </span>
  ),
  Stack: ({ children, direction, spacing, flexWrap, useFlexGap, ...props }: any) => (
    <div data-testid="stack" data-direction={direction} {...props}>{children}</div>
  )
}))

describe('CategoryLinks', () => {
  const categories = [
    'wedding-cakes',
    'birthday-cakes',
    'custom-cakes',
    'ukrainian-cakes'
  ]

  describe('Rendering', () => {
    it('should render category links', () => {
      render(<CategoryLinks categories={categories} />)

      expect(screen.getByText('Explore More Categories')).toBeInTheDocument()
    })

    it('should render Box container', () => {
      render(<CategoryLinks categories={categories} />)

      expect(screen.getAllByTestId('box').length).toBeGreaterThan(0)
    })

    it('should render Stack component', () => {
      render(<CategoryLinks categories={categories} />)

      expect(screen.getByTestId('stack')).toBeInTheDocument()
    })

    it('should render heading', () => {
      render(<CategoryLinks categories={categories} />)

      const typography = screen.getAllByTestId('typography')
      const heading = typography.find(t => t.textContent === 'Explore More Categories')
      expect(heading).toBeTruthy()
    })

    it('should render description text', () => {
      render(<CategoryLinks categories={categories} />)

      expect(screen.getByText(/Discover more cake categories/)).toBeInTheDocument()
    })
  })

  describe('Category Filtering', () => {
    it('should filter out current category', () => {
      render(<CategoryLinks currentCategory="wedding-cakes" categories={categories} />)

      expect(screen.queryByText('Wedding Cakes')).not.toBeInTheDocument()
    })

    it('should show other categories when current is specified', () => {
      render(<CategoryLinks currentCategory="wedding-cakes" categories={categories} />)

      expect(screen.getByText('Birthday Cakes')).toBeInTheDocument()
      expect(screen.getByText('Custom Cakes')).toBeInTheDocument()
    })

    it('should show all categories when currentCategory not specified', () => {
      render(<CategoryLinks categories={categories} />)

      expect(screen.getByText('Wedding Cakes')).toBeInTheDocument()
      expect(screen.getByText('Birthday Cakes')).toBeInTheDocument()
      expect(screen.getByText('Custom Cakes')).toBeInTheDocument()
      expect(screen.getByText('Ukrainian Cakes')).toBeInTheDocument()
    })

    it('should limit to 4 categories', () => {
      const manyCategories = [
        'wedding-cakes',
        'birthday-cakes',
        'custom-cakes',
        'ukrainian-cakes',
        'honey-cake',
        'corporate-cakes',
        'seasonal-cakes'
      ]

      const { container } = render(<CategoryLinks categories={manyCategories} />)

      const chips = container.querySelectorAll('[data-testid="chip"]')
      expect(chips.length).toBeLessThanOrEqual(4)
    })
  })

  describe('Category Links', () => {
    it('should link to wedding-cakes URL', () => {
      render(<CategoryLinks categories={categories} />)

      const weddingLink = screen.getByText('Wedding Cakes').closest('a')
      expect(weddingLink).toHaveAttribute('href', '/wedding-cakes')
    })

    it('should link to birthday-cakes URL', () => {
      render(<CategoryLinks categories={categories} />)

      const birthdayLink = screen.getByText('Birthday Cakes').closest('a')
      expect(birthdayLink).toHaveAttribute('href', '/birthday-cakes')
    })

    it('should link to custom-cakes URL', () => {
      render(<CategoryLinks categories={categories} />)

      const customLink = screen.getByText('Custom Cakes').closest('a')
      expect(customLink).toHaveAttribute('href', '/custom-cake-design')
    })

    it('should link to ukrainian-cakes URL', () => {
      render(<CategoryLinks categories={categories} />)

      const ukrainianLink = screen.getByText('Ukrainian Cakes').closest('a')
      expect(ukrainianLink).toHaveAttribute('href', '/traditional-ukrainian-cakes')
    })
  })

  describe('Empty State', () => {
    it('should return null when no categories', () => {
      const { container } = render(<CategoryLinks categories={[]} />)

      expect(container.firstChild).toBeNull()
    })

    it('should return null when only current category exists', () => {
      const { container } = render(
        <CategoryLinks currentCategory="wedding-cakes" categories={['wedding-cakes']} />
      )

      expect(container.firstChild).toBeNull()
    })

    it('should render when at least one category remains after filtering', () => {
      render(
        <CategoryLinks
          currentCategory="wedding-cakes"
          categories={['wedding-cakes', 'birthday-cakes']}
        />
      )

      expect(screen.getByText('Birthday Cakes')).toBeInTheDocument()
    })
  })

  describe('Category Mappings', () => {
    it('should skip unmapped categories', () => {
      render(<CategoryLinks categories={['wedding-cakes', 'unknown-category']} />)

      expect(screen.getByText('Wedding Cakes')).toBeInTheDocument()
      // unknown-category should not render
      const chips = screen.getAllByTestId('chip')
      expect(chips.length).toBe(1)
    })

    it('should handle case-insensitive category matching', () => {
      render(<CategoryLinks categories={['WEDDING-CAKES']} />)

      expect(screen.getByText('Wedding Cakes')).toBeInTheDocument()
    })

    it('should provide descriptions in title attribute', () => {
      render(<CategoryLinks categories={['wedding-cakes']} />)

      const chip = screen.getByTestId('chip')
      expect(chip).toHaveAttribute('title', 'Explore our stunning wedding cake collection')
    })
  })

  describe('Accessibility', () => {
    it('should have aria-labels for links', () => {
      render(<CategoryLinks categories={categories} />)

      const weddingLink = screen.getByText('Wedding Cakes').closest('a')
      expect(weddingLink).toHaveAttribute('aria-label', 'Browse Wedding Cakes cakes')
    })

    it('should remove text decoration from links', () => {
      const { container } = render(<CategoryLinks categories={categories} />)

      const links = container.querySelectorAll('a')
      links.forEach(link => {
        expect(link).toHaveStyle({ textDecoration: 'none' })
      })
    })
  })

  describe('Props', () => {
    it('should accept categories array', () => {
      render(<CategoryLinks categories={categories} />)

      const chips = screen.getAllByTestId('chip')
      expect(chips.length).toBeGreaterThan(0)
    })

    it('should accept optional currentCategory', () => {
      render(<CategoryLinks currentCategory="wedding-cakes" categories={categories} />)

      expect(screen.queryByText('Wedding Cakes')).not.toBeInTheDocument()
    })

    it('should handle undefined currentCategory', () => {
      render(<CategoryLinks categories={categories} />)

      expect(screen.getByText('Wedding Cakes')).toBeInTheDocument()
    })
  })
})

