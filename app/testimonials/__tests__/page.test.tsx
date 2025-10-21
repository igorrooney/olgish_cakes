/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import TestimonialsPage, { metadata, revalidate, dynamic } from '../page'

// Mock Sanity client
jest.mock('@/sanity/lib/client', () => {
  const mockFetch = jest.fn()
  return {
    client: { fetch: mockFetch },
    __mockFetch: mockFetch
  }
})

const { __mockFetch: mockFetch } = jest.requireMock('@/sanity/lib/client')

jest.mock('@/sanity/lib/queries', () => ({
  testimonialQuery: 'query',
  testimonialCountQuery: 'countQuery'
}))

// Mock components
jest.mock('../TestimonialsList', () => ({
  TestimonialsList: () => <div data-testid="testimonials-list">Testimonials List</div>
}))

jest.mock('../../components/Breadcrumbs', () => ({
  Breadcrumbs: () => <nav data-testid="breadcrumbs">Breadcrumbs</nav>
}))

// Mock MUI
jest.mock('@mui/material', () => ({
  Container: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Typography: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Box: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Paper: ({ children, ...props }: any) => <div {...props}>{children}</div>
}))

describe('TestimonialsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Static Configuration', () => {
    it('should have force-static dynamic', () => {
      expect(dynamic).toBe('force-static')
    })

    it('should have 60 second revalidation', () => {
      expect(revalidate).toBe(60)
    })
  })

  describe('Metadata', () => {
    it('should have title', () => {
      expect(metadata.title).toContain('Testimonials')
      expect(metadata.title).toContain('Olgish Cakes')
    })

    it('should have description', () => {
      expect(metadata.description).toBeDefined()
      expect(metadata.description).toContain('reviews')
    })

    it('should have OpenGraph data', () => {
      expect(metadata.openGraph).toBeDefined()
      expect(metadata.openGraph?.url).toBe('https://olgishcakes.co.uk/testimonials')
    })

    it('should have Twitter card', () => {
      expect(metadata.twitter).toBeDefined()
      expect(metadata.twitter?.card).toBe('summary_large_image')
    })

    it('should have canonical URL', () => {
      expect(metadata.alternates?.canonical).toBe('https://olgishcakes.co.uk/testimonials')
    })

    it('should have keywords', () => {
      expect(metadata.keywords).toBeDefined()
      expect(Array.isArray(metadata.keywords)).toBe(true)
    })

    it('should have authors', () => {
      expect(metadata.authors).toBeDefined()
    })

    it('should have metadataBase', () => {
      expect(metadata.metadataBase).toBeInstanceOf(URL)
    })

    it('should have robots config', () => {
      expect(metadata.robots).toBeDefined()
    })
  })

  describe('Data Fetching', () => {
    it('should fetch testimonials and count', async () => {
      mockFetch.mockResolvedValue([])

      await TestimonialsPage({ searchParams: {} })

      expect(mockFetch).toHaveBeenCalled()
    })

    it('should handle fetch errors', async () => {
      mockFetch.mockRejectedValue(new Error('Fetch failed'))

      await expect(TestimonialsPage({ searchParams: {} })).rejects.toThrow('Fetch failed')
    })
  })

  describe('Rendering', () => {
    it('should render without crashing', async () => {
      mockFetch.mockResolvedValue([])

      const page = await TestimonialsPage({ searchParams: {} })

      expect(() => render(page)).not.toThrow()
    })

    it('should render TestimonialsList', async () => {
      mockFetch.mockResolvedValue([])

      const page = await TestimonialsPage({ searchParams: {} })

      render(page)

      expect(screen.getByTestId('testimonials-list')).toBeInTheDocument()
    })

    it('should render Breadcrumbs', async () => {
      mockFetch.mockResolvedValue([])

      const page = await TestimonialsPage({ searchParams: {} })

      render(page)

      expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument()
    })
  })
})

