// Mock unstable_cache to bypass Next.js context requirement
jest.mock('next/cache', () => ({
  unstable_cache: jest.fn((fn) => fn)
}))

import sitemapProducts from '../sitemap-products'
import { getStaticSitemapLastModified } from '../sitemap-static-pages'

jest.mock('@/sanity/lib/client', () => {
  const mockFetch = jest.fn()
  return {
    client: { fetch: mockFetch },
    __mockFetch: mockFetch
  }
})

const { __mockFetch: mockFetch } = jest.requireMock('@/sanity/lib/client')

describe('sitemap-products', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Product Sitemap Generation', () => {
    it('should generate product sitemap', async () => {
      mockFetch
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const result = await sitemapProducts()

      expect(Array.isArray(result)).toBe(true)
    })

    it('should include cake routes', async () => {
      mockFetch
        .mockResolvedValueOnce([{ slug: { current: 'honey-cake' }, _updatedAt: '2025-01-01' }])
        .mockResolvedValueOnce([])

      const result = await sitemapProducts()
      const cakeUrl = result.find((entry) => entry.url.includes('/cakes/honey-cake'))

      expect(cakeUrl).toBeDefined()
      expect(cakeUrl?.priority).toBe(0.95)
      expect(cakeUrl?.changeFrequency).toBe('daily')
    })

    it('should include gift hamper routes', async () => {
      mockFetch
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ slug: { current: 'deluxe' }, _updatedAt: '2025-01-01' }])

      const result = await sitemapProducts()
      const hamperUrl = result.find((entry) => entry.url.includes('/cakes-by-post/deluxe'))

      expect(hamperUrl).toBeDefined()
    })

    it('should include category pages with stable committed lastModified dates', async () => {
      mockFetch.mockResolvedValue([])

      const result = await sitemapProducts()
      const cakesPage = result.find((entry) => entry.url === 'https://olgishcakes.co.uk/cakes')
      const hampersPage = result.find((entry) => entry.url === 'https://olgishcakes.co.uk/cakes-by-post')
      const quotePage = result.find((entry) => entry.url === 'https://olgishcakes.co.uk/get-custom-quote')

      expect(cakesPage).toBeDefined()
      expect(hampersPage).toBeDefined()
      expect(quotePage).toBeDefined()
      expect(cakesPage?.lastModified).toEqual(getStaticSitemapLastModified('/cakes'))
      expect(hampersPage?.lastModified).toEqual(getStaticSitemapLastModified('/cakes-by-post'))
      expect(quotePage?.lastModified).toEqual(getStaticSitemapLastModified('/get-custom-quote'))
    })

    it('should keep central static sitemap lastModified values in sync for key category pages', () => {
      expect(getStaticSitemapLastModified('/cakes')).toEqual(new Date('2026-03-17'))
      expect(getStaticSitemapLastModified('/cakes-by-post')).toEqual(new Date('2026-03-12'))
      expect(getStaticSitemapLastModified('/get-custom-quote')).toEqual(new Date('2026-03-17'))
    })

    it('should omit cakes without a slug from the sitemap', async () => {
      mockFetch
        .mockResolvedValueOnce([{ _updatedAt: '2025-01-01' }])
        .mockResolvedValueOnce([])

      const result = await sitemapProducts()

      expect(result.find((entry) => entry.url.includes('/cakes/undefined'))).toBeUndefined()
    })

    it('should omit test cake slugs from the sitemap', async () => {
      mockFetch
        .mockResolvedValueOnce([
          { slug: { current: 'test-cake' }, _updatedAt: '2025-01-01' },
          { slug: { current: 'birthday-test-cake' }, _updatedAt: '2025-01-01' },
          { slug: { current: 'honey-cake' }, _updatedAt: '2025-01-01' }
        ])
        .mockResolvedValueOnce([])

      const result = await sitemapProducts()

      expect(result.find((entry) => entry.url.includes('/cakes/test-cake'))).toBeUndefined()
      expect(result.find((entry) => entry.url.includes('/cakes/birthday-test-cake'))).toBeDefined()
      expect(result.find((entry) => entry.url.includes('/cakes/honey-cake'))).toBeDefined()
    })

    it('should skip malformed and test cake records without throwing', async () => {
      mockFetch
        .mockResolvedValueOnce([
          { slug: { current: 'test-cake' }, _updatedAt: '2025-01-01' },
          { slug: { current: 'birthday-test-cake' }, _updatedAt: '2025-01-01' },
          { slug: { current: 'latest-cake' }, _updatedAt: '2025-01-01' },
          { _updatedAt: '2025-01-01' },
          { slug: { current: 'honey-cake' }, _updatedAt: '2025-01-01' }
        ])
        .mockResolvedValueOnce([])

      const result = await sitemapProducts()
      const cakeUrls = result
        .filter((entry) => entry.url.includes('/cakes/'))
        .map((entry) => entry.url)

      expect(cakeUrls).toContain('https://olgishcakes.co.uk/cakes/honey-cake')
      expect(cakeUrls).toContain('https://olgishcakes.co.uk/cakes/birthday-test-cake')
      expect(cakeUrls).toContain('https://olgishcakes.co.uk/cakes/latest-cake')
      expect(cakeUrls).not.toContain('https://olgishcakes.co.uk/cakes/test-cake')
      expect(cakeUrls).not.toContain('https://olgishcakes.co.uk/cakes/undefined')
    })

    it('should omit hampers without a slug from the sitemap', async () => {
      mockFetch
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ _id: 'hamper-123', _updatedAt: '2025-01-01' }])

      const result = await sitemapProducts()
      const hamperUrl = result.find((entry) => entry.url.includes('/cakes-by-post/hamper-123'))

      expect(hamperUrl).toBeUndefined()
    })

    it('should omit test hamper slugs from the sitemap', async () => {
      mockFetch
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          { slug: { current: 'test-hamper' }, _updatedAt: '2025-01-01' },
          { slug: { current: 'deluxe-test-hamper' }, _updatedAt: '2025-01-01' },
          { slug: { current: 'deluxe' }, _updatedAt: '2025-01-01' }
        ])

      const result = await sitemapProducts()

      expect(result.find((entry) => entry.url.includes('/cakes-by-post/test-hamper'))).toBeUndefined()
      expect(result.find((entry) => entry.url.includes('/cakes-by-post/deluxe-test-hamper'))).toBeDefined()
      expect(result.find((entry) => entry.url.includes('/cakes-by-post/deluxe'))).toBeDefined()
    })
  })

  describe('Query Filtering', () => {
    it('should query cakes with filters to exclude missing and test slugs', async () => {
      mockFetch.mockResolvedValue([])

      await sitemapProducts()

      const cakesQuery = mockFetch.mock.calls[0][0]

      expect(cakesQuery).toContain('defined(slug.current)')
      expect(cakesQuery).toContain('slug.current != "test"')
      expect(cakesQuery).toContain('!slug.current match "test-*"')
    })
  })
})
