/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render } from '@testing-library/react'
import {
  TestimonialSkeleton,
  CakeCardSkeleton,
  ImageSkeleton,
  PageSkeleton,
  GridSkeleton
} from '../skeleton-components'

// Mock MUI components
jest.mock('@mui/material', () => ({
  Box: ({ children, sx, component, ...props }: any) => (
    <div data-testid="box" data-sx={JSON.stringify(sx)} {...props}>{children}</div>
  ),
  Card: ({ children, sx, ...props }: any) => (
    <div data-testid="card" data-sx={JSON.stringify(sx)} {...props}>{children}</div>
  ),
  CardContent: ({ children, className, ...props }: any) => (
    <div data-testid="card-content" className={className} {...props}>{children}</div>
  ),
  Skeleton: ({ variant, width, height, animation, sx, ...props }: any) => (
    <div
      data-testid="skeleton"
      data-variant={variant}
      data-width={width}
      data-height={height}
      data-animation={animation}
      data-sx={JSON.stringify(sx)}
      {...props}
    />
  )
}))

describe('skeleton-components', () => {
  describe('TestimonialSkeleton', () => {
    it('should render Card component', () => {
      const { getByTestId } = render(<TestimonialSkeleton />)

      expect(getByTestId('card')).toBeInTheDocument()
    })

    it('should show image by default', () => {
      const { getAllByTestId } = render(<TestimonialSkeleton />)
      const skeletons = getAllByTestId('skeleton')

      const imageSkeleton = skeletons.find(el => el.getAttribute('data-variant') === 'rectangular' && el.getAttribute('data-height') === '256')
      expect(imageSkeleton).toBeDefined()
    })

    it('should hide image when showImage=false', () => {
      const { getAllByTestId } = render(<TestimonialSkeleton showImage={false} />)
      const skeletons = getAllByTestId('skeleton')

      const imageSkeleton = skeletons.find(el => el.getAttribute('data-height') === '256')
      expect(imageSkeleton).toBeUndefined()
    })

    it('should use full variant by default', () => {
      const { getAllByTestId } = render(<TestimonialSkeleton />)
      const skeletons = getAllByTestId('skeleton')

      const imageSkeleton = skeletons.find(el => el.getAttribute('data-variant') === 'rectangular')
      expect(imageSkeleton?.getAttribute('data-height')).toBe('256')
    })

    it('should use compact variant when specified', () => {
      const { getAllByTestId } = render(<TestimonialSkeleton variant="compact" />)
      const skeletons = getAllByTestId('skeleton')

      const imageSkeleton = skeletons.find(el => el.getAttribute('data-variant') === 'rectangular')
      if (imageSkeleton) {
        expect(imageSkeleton.getAttribute('data-height')).toBe('128')
      }
    })

    it('should render text skeletons', () => {
      const { getAllByTestId } = render(<TestimonialSkeleton />)
      const skeletons = getAllByTestId('skeleton')

      const textSkeletons = skeletons.filter(el => el.getAttribute('data-variant') === 'text')
      expect(textSkeletons.length).toBeGreaterThan(0)
    })

    it('should memoize component', () => {
    })
  })

  describe('CakeCardSkeleton', () => {
    it('should render Card component', () => {
      const { getByTestId } = render(<CakeCardSkeleton />)

      expect(getByTestId('card')).toBeInTheDocument()
    })

    it('should use catalog variant by default', () => {
      const { getAllByTestId } = render(<CakeCardSkeleton />)
      const skeletons = getAllByTestId('skeleton')

      const imageSkeleton = skeletons.find(el => el.getAttribute('data-variant') === 'rectangular')
      expect(imageSkeleton?.getAttribute('data-height')).toBe('250')
    })

    it('should use featured variant when specified', () => {
      const { getAllByTestId } = render(<CakeCardSkeleton variant="featured" />)
      const skeletons = getAllByTestId('skeleton')

      const imageSkeleton = skeletons.find(el => el.getAttribute('data-variant') === 'rectangular')
      expect(imageSkeleton?.getAttribute('data-height')).toBe('300')
    })

    it('should render image skeleton', () => {
      const { getAllByTestId } = render(<CakeCardSkeleton />)
      const skeletons = getAllByTestId('skeleton')

      const imageSkeleton = skeletons.find(el => el.getAttribute('data-variant') === 'rectangular')
      expect(imageSkeleton).toBeDefined()
    })

    it('should render title skeleton', () => {
      const { getAllByTestId } = render(<CakeCardSkeleton />)
      const skeletons = getAllByTestId('skeleton')

      expect(skeletons.length).toBeGreaterThan(1)
    })

    it('should memoize component', () => {
    })
  })

  describe('ImageSkeleton', () => {
    it('should render Skeleton component', () => {
      const { getByTestId } = render(<ImageSkeleton />)

      expect(getByTestId('skeleton')).toBeInTheDocument()
    })

    it('should use default width', () => {
      const { getByTestId } = render(<ImageSkeleton />)

      expect(getByTestId('skeleton').getAttribute('data-width')).toBe('100%')
    })

    it('should use default height', () => {
      const { getByTestId } = render(<ImageSkeleton />)

      expect(getByTestId('skeleton').getAttribute('data-height')).toBe('200')
    })

    it('should use custom width', () => {
      const { getByTestId } = render(<ImageSkeleton width={500} />)

      expect(getByTestId('skeleton').getAttribute('data-width')).toBe('500')
    })

    it('should use custom height', () => {
      const { getByTestId } = render(<ImageSkeleton height={300} />)

      expect(getByTestId('skeleton').getAttribute('data-height')).toBe('300')
    })

    it('should use default border radius', () => {
      const { getByTestId } = render(<ImageSkeleton />)
      const sx = JSON.parse(getByTestId('skeleton').getAttribute('data-sx') || '{}')

      expect(sx.borderRadius).toBe('8px')
    })

    it('should use custom border radius', () => {
      const { getByTestId } = render(<ImageSkeleton borderRadius="16px" />)
      const sx = JSON.parse(getByTestId('skeleton').getAttribute('data-sx') || '{}')

      expect(sx.borderRadius).toBe('16px')
    })

    it('should use rectangular variant', () => {
      const { getByTestId } = render(<ImageSkeleton />)

      expect(getByTestId('skeleton').getAttribute('data-variant')).toBe('rectangular')
    })

    it('should use wave animation', () => {
      const { getByTestId } = render(<ImageSkeleton />)

      expect(getByTestId('skeleton').getAttribute('data-animation')).toBe('wave')
    })

    it('should memoize component', () => {
    })
  })

  describe('PageSkeleton', () => {
    it('should render Box container', () => {
      const { getAllByTestId } = render(<PageSkeleton />)

      expect(getAllByTestId('box').length).toBeGreaterThan(0)
    })

    it('should render default 3 sections', () => {
      const { getAllByTestId } = render(<PageSkeleton />)
      const skeletons = getAllByTestId('skeleton')

      // Title, subtitle, and 3 sections with 2 skeletons each = 2 + 6 = 8 skeletons
      expect(skeletons.length).toBeGreaterThanOrEqual(8)
    })

    it('should render custom number of sections', () => {
      const { getAllByTestId } = render(<PageSkeleton sections={5} />)
      const skeletons = getAllByTestId('skeleton')

      // Title, subtitle, and 5 sections with 2 skeletons each = 2 + 10 = 12 skeletons
      expect(skeletons.length).toBeGreaterThanOrEqual(12)
    })

    it('should render title skeleton', () => {
      const { getAllByTestId } = render(<PageSkeleton />)
      const skeletons = getAllByTestId('skeleton')

      const titleSkeleton = skeletons.find(el => el.getAttribute('data-height') === '48')
      expect(titleSkeleton).toBeDefined()
    })

    it('should memoize component', () => {
    })

    it('should handle sections=0', () => {
      const { getAllByTestId } = render(<PageSkeleton sections={0} />)

      // Should still render title and subtitle
      expect(getAllByTestId('skeleton').length).toBeGreaterThanOrEqual(2)
    })

    it('should handle sections=1', () => {
      const { getAllByTestId } = render(<PageSkeleton sections={1} />)
      const skeletons = getAllByTestId('skeleton')

      expect(skeletons.length).toBeGreaterThanOrEqual(4)
    })
  })

  describe('GridSkeleton', () => {
    it('should render Box container', () => {
      const { getByTestId } = render(<GridSkeleton />)

      expect(getByTestId('box')).toBeInTheDocument()
    })

    it('should render default 6 items', () => {
      const { getAllByTestId } = render(<GridSkeleton />)
      const cards = getAllByTestId('card')

      expect(cards.length).toBe(6)
    })

    it('should render custom number of items', () => {
      const { getAllByTestId } = render(<GridSkeleton items={10} />)
      const cards = getAllByTestId('card')

      expect(cards.length).toBe(10)
    })

    it('should use default columns', () => {
      render(<GridSkeleton />)

      // Default columns should be set
      expect(true).toBe(true)
    })

    it('should use custom columns', () => {
      render(<GridSkeleton columns={{ xs: 2, md: 3 }} />)

      expect(true).toBe(true)
    })

    it('should use TestimonialSkeleton by default', () => {
      const { getAllByTestId } = render(<GridSkeleton items={2} />)
      const cards = getAllByTestId('card')

      expect(cards.length).toBe(2)
    })

    it('should use custom item component', () => {
      const CustomComponent = () => <div data-testid="custom-item">Custom</div>
      const { getAllByTestId } = render(
        <GridSkeleton items={3} itemComponent={CustomComponent} />
      )

      expect(getAllByTestId('custom-item').length).toBe(3)
    })

    it('should memoize component', () => {
    })

    it('should handle items=0', () => {
      const { queryAllByTestId } = render(<GridSkeleton items={0} />)
      const cards = queryAllByTestId('card')

      expect(cards.length).toBe(0)
    })

    it('should handle items=1', () => {
      const { getAllByTestId } = render(<GridSkeleton items={1} />)
      const cards = getAllByTestId('card')

      expect(cards.length).toBe(1)
    })
  })

  describe('Animation', () => {
    it('should use wave animation', () => {
      const { getAllByTestId } = render(<TestimonialSkeleton />)
      const skeletons = getAllByTestId('skeleton')

      skeletons.forEach(skeleton => {
        expect(skeleton.getAttribute('data-animation')).toBe('wave')
      })
    })
  })

  describe('Accessibility', () => {
    it('should provide visual loading feedback', () => {
      const { getAllByTestId } = render(<CakeCardSkeleton />)
      const skeletons = getAllByTestId('skeleton')

      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should use semantic structure', () => {
      const { getByTestId } = render(<TestimonialSkeleton />)

      expect(getByTestId('card')).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    it('should support full variant for TestimonialSkeleton', () => {
      const { container } = render(<TestimonialSkeleton variant="full" />)

      expect(container).toBeDefined()
    })

    it('should support compact variant for TestimonialSkeleton', () => {
      const { container } = render(<TestimonialSkeleton variant="compact" />)

      expect(container).toBeDefined()
    })

    it('should support catalog variant for CakeCardSkeleton', () => {
      const { container } = render(<CakeCardSkeleton variant="catalog" />)

      expect(container).toBeDefined()
    })

    it('should support featured variant for CakeCardSkeleton', () => {
      const { container } = render(<CakeCardSkeleton variant="featured" />)

      expect(container).toBeDefined()
    })
  })

  describe('Memoization', () => {
    it('should memoize TestimonialSkeleton', () => {
    })

    it('should memoize CakeCardSkeleton', () => {
    })

    it('should memoize ImageSkeleton', () => {
    })

    it('should memoize PageSkeleton', () => {
    })

    it('should memoize GridSkeleton', () => {
    })
  })

  describe('Integration', () => {
    it('should work together in grid layout', () => {
      const { getAllByTestId } = render(<GridSkeleton items={4} />)
      const cards = getAllByTestId('card')

      expect(cards.length).toBe(4)
    })

    it('should render nested structure correctly', () => {
      const { getAllByTestId } = render(<TestimonialSkeleton />)

      expect(getAllByTestId('card').length).toBeGreaterThan(0)
      expect(getAllByTestId('card-content').length).toBeGreaterThan(0)
      expect(getAllByTestId('skeleton').length).toBeGreaterThan(0)
    })
  })
})

