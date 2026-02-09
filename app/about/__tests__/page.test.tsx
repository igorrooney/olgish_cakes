/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react'
import AboutPage, { metadata, dynamic } from '../page'

// Mock utils
jest.mock('@/app/utils/seo', () => ({
  generateLocalBusinessSchema: jest.fn(() => ({ '@type': 'LocalBusiness' })),
  generateOrganizationSchema: jest.fn(() => ({ '@type': 'Organization' })),
  generatePageMetadata: jest.fn((data) => data),
  generateWebPageSchema: jest.fn(() => ({ '@type': 'WebPage' })),
  generatePersonSchema: jest.fn(() => ({ '@type': 'Person' }))
}))

jest.mock('@/app/utils/review-stats.server', () => ({
  getReviewStats: jest.fn(async () => ({ count: 13, averageRating: 5 }))
}))

// Mock components
jest.mock('../AboutContent', () => ({
  __esModule: true,
  default: () => <div data-testid="about-content">About Content</div>
}))

// Mock Next.js Script
jest.mock('next/script', () => ({
  __esModule: true,
  default: ({ children, id, strategy, ...props }: MockProps) => (
    <script data-testid={id} data-strategy={strategy} {...props}>{children}</script>
  )
}))

const renderAboutPage = async () => render(await AboutPage())

describe('AboutPage', () => {
  describe('Static Configuration', () => {
    it('should have force-static dynamic', () => {
      expect(dynamic).toBe('force-static')
    })

  })

  describe('Metadata', () => {
    it('should have title', () => {
      expect(metadata.title).toContain('About')
      expect(metadata.title).toContain('Olgish Cakes')
    })

    it('should have description', () => {
      expect(metadata.description).toBeDefined()
      expect(metadata.description).toContain('Olga Ieromenko')
    })

    it('should have keywords', () => {
      expect(metadata.keywords).toBeDefined()
      expect(Array.isArray(metadata.keywords)).toBe(true)
    })

    it('should include Ukrainian baker keyword', () => {
      const keywords = metadata.keywords as string[]
      expect(keywords).toContain('Ukrainian baker Leeds')
    })

    it('should have image', () => {
      expect(metadata.image).toBeDefined()
      expect(metadata.image).toContain('olga')
    })

    it('should have URL', () => {
      expect(metadata.url).toBe('/about')
    })

    it('should have profile type', () => {
      expect(metadata.type).toBe('profile')
    })

    it('should have author', () => {
      expect(metadata.author).toBe('Olga Ieromenko')
    })

    it('should have section', () => {
      expect(metadata.section).toBe('About Us')
    })

    it('should have tags', () => {
      expect(metadata.tags).toBeDefined()
      expect(Array.isArray(metadata.tags)).toBe(true)
    })
  })

  describe('Structured Data', () => {
    it('should include organization schema', async () => {
      const { container } = await renderAboutPage()

      const script = container.querySelector('script[id="organization-schema"]')
      expect(script).toBeTruthy()
      expect(script?.getAttribute('type')).toBe('application/ld+json')
    })

    it('should include local business schema', async () => {
      const { container } = await renderAboutPage()

      const script = container.querySelector('script[id="local-business-schema"]')
      expect(script).toBeTruthy()
    })

    it('should include webpage schema', async () => {
      const { container } = await renderAboutPage()

      const script = container.querySelector('script[id="webpage-schema"]')
      expect(script).toBeTruthy()
    })

    it('should include person schema', async () => {
      const { container } = await renderAboutPage()

      const script = container.querySelector('script[id="person-schema"]')
      expect(script).toBeTruthy()
    })

    it('should include FAQ schema', async () => {
      const { container } = await renderAboutPage()

      const script = container.querySelector('script[id="about-faq-schema"]')
      expect(script).toBeTruthy()

      const json = JSON.parse(script?.textContent || '{}')
      expect(json['@type']).toBe('FAQPage')
      expect(json.mainEntity).toBeDefined()
      expect(json.mainEntity.length).toBeGreaterThan(0)
    })
  })

  describe('Performance Optimization', () => {
    it('should include performance optimization script', async () => {
      const { container } = await renderAboutPage()

      const script = container.querySelector('script[data-testid="performance-optimization"]')
      expect(script).toBeTruthy()
      expect(script?.getAttribute('data-strategy')).toBe('afterInteractive')
    })
  })

  describe('Rendering', () => {
    it('should render AboutContent component', async () => {
      const { getByTestId } = await renderAboutPage()

      expect(getByTestId('about-content')).toBeInTheDocument()
    })
  })

  describe('Schema Generation', () => {
    it('should call schema generators', async () => {
      const { generateLocalBusinessSchema, generateOrganizationSchema, generateWebPageSchema } = require('@/app/utils/seo')

      await renderAboutPage()

      expect(generateLocalBusinessSchema).toHaveBeenCalled()
      expect(generateOrganizationSchema).toHaveBeenCalled()
      expect(generateWebPageSchema).toHaveBeenCalled()
    })

    it('should pass correct data to generateWebPageSchema', async () => {
      const { generateWebPageSchema } = require('@/app/utils/seo')

      await renderAboutPage()

      expect(generateWebPageSchema).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.stringContaining('About'),
          url: expect.stringContaining('/about')
        })
      )
    })
  })
})
