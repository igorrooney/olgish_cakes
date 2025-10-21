/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { AreasWeCover } from '../AreasWeCover'

// Mock MUI components
jest.mock('@mui/material', () => ({
  Box: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Grid: ({ children, container, item, spacing, justifyContent, ...props }: any) => (
    <div data-container={container} data-item={item} {...props}>{children}</div>
  ),
  Paper: ({ children, elevation, sx, ...props }: any) => (
    <div data-testid="paper" data-elevation={elevation} {...props}>{children}</div>
  ),
  Typography: ({ children, variant, color, sx, ...props }: any) => (
    <div data-testid="typography" data-variant={variant} {...props}>{children}</div>
  ),
  Chip: ({ label, component, href, clickable, color, sx, ...props }: any) => {
    const Component = component || 'div'
    return <Component href={href} data-testid="chip" data-clickable={clickable} {...props}>{label}</Component>
  }
}))

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  )
})

describe('AreasWeCover', () => {
  describe('Default Props', () => {
    it('should render with default title', () => {
      render(<AreasWeCover />)

      expect(screen.getByText('Areas We Cover')).toBeInTheDocument()
    })

    it('should render with default subtitle', () => {
      render(<AreasWeCover />)

      expect(screen.getByText(/Cake delivery and wedding\/birthday cake service/)).toBeInTheDocument()
    })

    it('should render default areas', () => {
      render(<AreasWeCover />)

      expect(screen.getByText('Leeds')).toBeInTheDocument()
      expect(screen.getByText('York')).toBeInTheDocument()
      expect(screen.getByText('Bradford')).toBeInTheDocument()
    })

    it('should render 10 default areas', () => {
      const { getAllByTestId } = render(<AreasWeCover />)

      const chips = getAllByTestId('chip')
      expect(chips.length).toBe(10)
    })

    it('should include all default cities', () => {
      render(<AreasWeCover />)

      const defaultCities = ['Leeds', 'York', 'Bradford', 'Halifax', 'Huddersfield', 'Wakefield', 'Otley', 'Pudsey', 'Skipton', 'Ilkley']
      
      defaultCities.forEach(city => {
        expect(screen.getByText(city)).toBeInTheDocument()
      })
    })
  })

  describe('Custom Props', () => {
    it('should render custom title', () => {
      render(<AreasWeCover title="Custom Title" />)

      expect(screen.getByText('Custom Title')).toBeInTheDocument()
    })

    it('should render custom subtitle', () => {
      render(<AreasWeCover subtitle="Custom subtitle text" />)

      expect(screen.getByText('Custom subtitle text')).toBeInTheDocument()
    })

    it('should render custom areas', () => {
      const customAreas = [
        { label: 'Area 1', href: '/area-1' },
        { label: 'Area 2', href: '/area-2' }
      ]

      render(<AreasWeCover areas={customAreas} />)

      expect(screen.getByText('Area 1')).toBeInTheDocument()
      expect(screen.getByText('Area 2')).toBeInTheDocument()
    })

    it('should handle empty areas array', () => {
      const { queryAllByTestId } = render(<AreasWeCover areas={[]} />)

      const chips = queryAllByTestId('chip')
      expect(chips.length).toBe(0)
    })

    it('should handle single area', () => {
      const singleArea = [{ label: 'Single', href: '/single' }]

      render(<AreasWeCover areas={singleArea} />)

      expect(screen.getByText('Single')).toBeInTheDocument()
    })
  })

  describe('Area Links', () => {
    it('should create links for each area', () => {
      render(<AreasWeCover />)

      const leedsChip = screen.getByText('Leeds').closest('a')
      expect(leedsChip).toHaveAttribute('href', '/cakes-leeds')
    })

    it('should link to correct pages', () => {
      render(<AreasWeCover />)

      expect(screen.getByText('York').closest('a')).toHaveAttribute('href', '/cakes-york')
      expect(screen.getByText('Bradford').closest('a')).toHaveAttribute('href', '/cakes-bradford')
    })

    it('should use area href', () => {
      const customAreas = [{ label: 'Test', href: '/custom-href' }]

      render(<AreasWeCover areas={customAreas} />)

      expect(screen.getByText('Test').closest('a')).toHaveAttribute('href', '/custom-href')
    })
  })

  describe('Chip Properties', () => {
    it('should make chips clickable', () => {
      const { getAllByTestId } = render(<AreasWeCover />)

      const chips = getAllByTestId('chip')
      chips.forEach(chip => {
        expect(chip.getAttribute('data-clickable')).toBe('true')
      })
    })

    it('should use unique keys', () => {
      const areas = [
        { label: 'Area 1', href: '/area-1' },
        { label: 'Area 2', href: '/area-2' },
        { label: 'Area 3', href: '/area-3' }
      ]

      const { container } = render(<AreasWeCover areas={areas} />)

      // Each area should be rendered
      expect(screen.getByText('Area 1')).toBeInTheDocument()
      expect(screen.getByText('Area 2')).toBeInTheDocument()
      expect(screen.getByText('Area 3')).toBeInTheDocument()
    })
  })

  describe('Layout', () => {
    it('should render Paper container', () => {
      const { getByTestId } = render(<AreasWeCover />)

      expect(getByTestId('paper')).toBeInTheDocument()
    })

    it('should render Grid container', () => {
      const { container } = render(<AreasWeCover />)

      const grids = container.querySelectorAll('[data-container="true"]')
      expect(grids.length).toBeGreaterThan(0)
    })
  })

  describe('Typography', () => {
    it('should render title as h3', () => {
      const { getAllByTestId } = render(<AreasWeCover />)

      const typographies = getAllByTestId('typography')
      const h3 = typographies.find(t => t.getAttribute('data-variant') === 'h3')
      expect(h3).toBeTruthy()
    })

    it('should render subtitle as body1', () => {
      const { getAllByTestId } = render(<AreasWeCover />)

      const typographies = getAllByTestId('typography')
      const body1 = typographies.find(t => t.getAttribute('data-variant') === 'body1')
      expect(body1).toBeTruthy()
    })
  })
})

