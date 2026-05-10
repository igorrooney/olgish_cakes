// Mock unstable_cache to bypass Next.js context requirement
jest.mock('next/cache', () => ({
  unstable_cache: jest.fn((fn) => fn)
}))

import { categoryLandingConfig } from '../cakes/categoryLandingConfig'
import sitemap from '../sitemap'
import { getStaticSitemapEntry, getStaticSitemapLastModified } from '../sitemap-static-pages'

jest.mock('@/sanity/lib/client', () => {
  const mockFetch = jest.fn()
  return {
    client: { fetch: mockFetch },
    __mockFetch: mockFetch
  }
})

const { __mockFetch: mockFetch } = jest.requireMock('@/sanity/lib/client') as {
  __mockFetch: jest.Mock
}

describe('sitemap', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Data Fetching', () => {
    it('should fetch cakes, articles, and gift hampers', async () => {
      mockFetch.mockResolvedValue([])

      await sitemap()

      expect(mockFetch).toHaveBeenCalledTimes(3)
    })

    it('should handle fetch errors', async () => {
      mockFetch.mockRejectedValue(new Error('Fetch failed'))

      await expect(sitemap()).rejects.toThrow()
    })
  })

  describe('Sitemap Generation', () => {
    it('should generate sitemap entries', async () => {
      mockFetch
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const result = await sitemap()

      expect(Array.isArray(result)).toBe(true)
    })

    it('should include core pages', async () => {
      mockFetch.mockResolvedValue([])

      const result = await sitemap()
      const homeUrl = result.find((entry) => entry.url === 'https://olgishcakes.co.uk')
      const homeEntry = getStaticSitemapEntry('/')

      expect(homeUrl).toBeDefined()
      expect(homeUrl?.priority).toBe(1.0)
      expect(homeUrl?.lastModified).toEqual(new Date(homeEntry?.lastModified || ''))
    })

    it('should include cake routes', async () => {
      mockFetch
        .mockResolvedValueOnce([{ slug: { current: 'honey-cake' }, _updatedAt: '2025-01-01' }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const result = await sitemap()
      const cakeUrl = result.find((entry) => entry.url.includes('/cakes/honey-cake'))

      expect(cakeUrl).toBeDefined()
    })

    it('should include article routes', async () => {
      mockFetch
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{
          slug: { current: 'test-post' },
          _updatedAt: '2025-01-01',
          publishedAt: '2025-01-01'
        }])
        .mockResolvedValueOnce([])

      const result = await sitemap()
      const blogUrl = result.find((entry) => entry.url.includes('/blog/test-post'))

      expect(blogUrl).toBeDefined()
    })

    it('should use the most recent article date for lastModified', async () => {
      mockFetch
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{
          slug: { current: 'updated-post' },
          _updatedAt: '2025-02-10T12:00:00.000Z',
          publishedAt: '2025-01-15T09:00:00.000Z'
        }])
        .mockResolvedValueOnce([])

      const result = await sitemap()
      const blogUrl = result.find((entry) => entry.url.includes('/blog/updated-post'))

      expect(blogUrl?.lastModified).toEqual(new Date('2025-02-10T12:00:00.000Z'))
    })

    it('should assign a fixed article priority so sitemap sorting stays type-safe', async () => {
      mockFetch
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{
          slug: { current: 'priority-post' },
          _updatedAt: '2025-02-10T12:00:00.000Z',
          publishedAt: '2025-01-15T09:00:00.000Z'
        }])
        .mockResolvedValueOnce([])

      const result = await sitemap()
      const blogUrl = result.find((entry) => entry.url.includes('/blog/priority-post'))

      expect(blogUrl?.priority).toBe(0.6)
    })

    it('should not emit legacy gift-hampers URLs in the sitemap', async () => {
      mockFetch
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ slug: { current: 'deluxe-hamper' }, _updatedAt: '2025-01-01T00:00:00.000Z' }])

      const result = await sitemap()

      expect(result.find((entry) => entry.url.includes('/gift-hampers/'))).toBeUndefined()
      expect(
        result.find((entry) => entry.url === 'https://olgishcakes.co.uk/cakes-by-post/deluxe-hamper')
      ).toBeDefined()
    })

    it('should include the kept static public pages', async () => {
      mockFetch.mockResolvedValue([])

      const result = await sitemap()
      const quoteUrl = result.find((entry) => entry.url === 'https://olgishcakes.co.uk/get-custom-quote')
      const contactUrl = result.find((entry) => entry.url === 'https://olgishcakes.co.uk/contact')
      const faqsUrl = result.find((entry) => entry.url === 'https://olgishcakes.co.uk/faqs')
      const deliveryUrl = result.find((entry) => entry.url === 'https://olgishcakes.co.uk/delivery')
      const allergensUrl = result.find((entry) => entry.url === 'https://olgishcakes.co.uk/allergens')

      expect(quoteUrl).toBeDefined()
      expect(contactUrl).toBeDefined()
      expect(faqsUrl).toBeDefined()
      expect(deliveryUrl).toBeDefined()
      expect(allergensUrl).toBeDefined()
    })

    it('should exclude retired article-replacement pages from the static sitemap', async () => {
      mockFetch.mockResolvedValue([])

      const result = await sitemap()
      const retiredUrls = [
        'https://olgishcakes.co.uk/ukrainian-cake',
        'https://olgishcakes.co.uk/cake-delivery-leeds',
        'https://olgishcakes.co.uk/nut-free-cakes-leeds',
        'https://olgishcakes.co.uk/cake-size-guide',
        'https://olgishcakes.co.uk/cake-preservation',
        'https://olgishcakes.co.uk/about',
        'https://olgishcakes.co.uk/order',
        'https://olgishcakes.co.uk/market-schedule',
        'https://olgishcakes.co.uk/reviews-awards',
        'https://olgishcakes.co.uk/celebration-cakes',
        'https://olgishcakes.co.uk/vegan-wedding-cakes-leeds',
        'https://olgishcakes.co.uk/gluten-friendly-wedding-cakes-leeds'
      ]

      retiredUrls.forEach((url) => {
        expect(result.find((entry) => entry.url === url)).toBeUndefined()
      })
    })

    it('should include category landing pages with config-driven lastModified dates', async () => {
      mockFetch.mockResolvedValue([])

      const result = await sitemap()

      Object.values(categoryLandingConfig).forEach((config) => {
        const categoryUrl = result.find((entry) => entry.url === `https://olgishcakes.co.uk${config.canonicalPath}`)

        expect(categoryUrl).toBeDefined()
        expect(categoryUrl?.lastModified).toEqual(new Date(config.lastSignificantUpdate))
      })
    })

    it('should keep static page lastModified values stable instead of using the runtime date', async () => {
      mockFetch.mockResolvedValue([])

      const result = await sitemap()
      const homeUrl = result.find((entry) => entry.url === 'https://olgishcakes.co.uk')
      const contactUrl = result.find((entry) => entry.url === 'https://olgishcakes.co.uk/contact')
      const homeEntry = getStaticSitemapEntry('/')
      const contactEntry = getStaticSitemapEntry('/contact')
      const runtimeDate = new Date('2026-03-17T12:00:00.000Z')

      expect(homeUrl?.lastModified).toEqual(new Date(homeEntry?.lastModified || ''))
      expect(contactUrl?.lastModified).toEqual(new Date(contactEntry?.lastModified || ''))
      expect(homeUrl?.lastModified).not.toEqual(runtimeDate)
      expect(contactUrl?.lastModified).not.toEqual(runtimeDate)
    })

    it('should include the workshops landing page with the committed sitemap metadata', async () => {
      mockFetch.mockResolvedValue([])

      const result = await sitemap()
      const workshopsUrl = result.find(
        (entry) => entry.url === 'https://olgishcakes.co.uk/learn/workshops'
      )

      expect(workshopsUrl?.priority).toBe(0.75)
      expect(workshopsUrl?.changeFrequency).toBe('monthly')
      expect(workshopsUrl?.lastModified).toEqual(new Date('2026-04-02'))
      expect(getStaticSitemapLastModified('/learn/workshops')).toEqual(new Date('2026-04-02'))
    })

    it('should expose the updated committed lastModified values for cakes and cakes by post', async () => {
      mockFetch.mockResolvedValue([])

      const result = await sitemap()
      const cakesUrl = result.find((entry) => entry.url === 'https://olgishcakes.co.uk/cakes')
      const hampersUrl = result.find((entry) => entry.url === 'https://olgishcakes.co.uk/cakes-by-post')
      const deliveryUrl = result.find((entry) => entry.url === 'https://olgishcakes.co.uk/delivery')
      const allergensUrl = result.find((entry) => entry.url === 'https://olgishcakes.co.uk/allergens')

      expect(cakesUrl?.lastModified).toEqual(new Date('2026-03-17'))
      expect(hampersUrl?.lastModified).toEqual(new Date('2026-03-12'))
      expect(deliveryUrl?.lastModified).toEqual(new Date('2026-04-24'))
      expect(allergensUrl?.lastModified).toEqual(new Date('2026-04-25'))
      expect(getStaticSitemapLastModified('/cakes')).toEqual(new Date('2026-03-17'))
      expect(getStaticSitemapLastModified('/cakes-by-post')).toEqual(new Date('2026-03-12'))
      expect(getStaticSitemapLastModified('/delivery')).toEqual(new Date('2026-04-24'))
      expect(getStaticSitemapLastModified('/allergens')).toEqual(new Date('2026-04-25'))
    })
    it('should exclude retired legacy landing pages from sitemap coverage', async () => {
      mockFetch.mockResolvedValue([])

      const result = await sitemap()

      expect(result.find((entry) => entry.url === 'https://olgishcakes.co.uk/corporate-cakes-leeds')).toBeUndefined()
      expect(result.find((entry) => entry.url === 'https://olgishcakes.co.uk/traditional-ukrainian-cakes')).toBeUndefined()
      expect(result.find((entry) => entry.url === 'https://olgishcakes.co.uk/honey-cake-near-me')).toBeUndefined()
      expect(result.find((entry) => entry.url === 'https://olgishcakes.co.uk/ukrainian-cake')).toBeUndefined()
      expect(result.find((entry) => entry.url === 'https://olgishcakes.co.uk/cake-delivery-leeds')).toBeUndefined()
      expect(result.find((entry) => entry.url === 'https://olgishcakes.co.uk/nut-free-cakes-leeds')).toBeUndefined()
      expect(result.find((entry) => entry.url === 'https://olgishcakes.co.uk/about')).toBeUndefined()
      expect(result.find((entry) => entry.url === 'https://olgishcakes.co.uk/order')).toBeUndefined()
      expect(result.find((entry) => entry.url === 'https://olgishcakes.co.uk/reviews-awards')).toBeUndefined()
    })

    it('should filter out hampers without slug', async () => {
      mockFetch
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ _id: 'hamper-123', _updatedAt: '2025-01-01' }])

      const result = await sitemap()
      const hamperUrl = result.find((entry) => entry.url.includes('/cakes-by-post/hamper-123'))

      expect(hamperUrl).toBeUndefined()
    })
  })

  describe('Priority Logic', () => {
    it('should sort entries by priority', async () => {
      mockFetch.mockResolvedValue([])

      const result = await sitemap()

      for (let index = 0; index < result.length - 1; index++) {
        expect(result[index].priority).toBeGreaterThanOrEqual(result[index + 1].priority || 0)
      }
    })
  })

  describe('SEO Fields', () => {
    it('should use fixed cake priority instead of legacy SEO priority', async () => {
      mockFetch
        .mockResolvedValueOnce([{ slug: { current: 'test' }, _updatedAt: '2025-01-01', seo: { priority: 0.95 } }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const result = await sitemap()
      const entry = result.find((item) => item.url.includes('/cakes/test'))

      expect(entry?.priority).toBe(0.8)
    })

    it('should use fixed cake changeFrequency instead of legacy SEO changefreq', async () => {
      mockFetch
        .mockResolvedValueOnce([{ slug: { current: 'test' }, _updatedAt: '2025-01-01', seo: { changefreq: 'daily' } }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const result = await sitemap()
      const entry = result.find((item) => item.url.includes('/cakes/test'))

      expect(entry?.changeFrequency).toBe('weekly')
    })
  })

  describe('GSC Compliance - Test Items Filtering', () => {
    it('should query with filters to exclude test items from cakes', async () => {
      mockFetch.mockResolvedValue([])

      await sitemap()

      const cakesQuery = mockFetch.mock.calls[0][0]

      expect(cakesQuery).toContain('!(slug.current match "test*")')
      expect(cakesQuery).toContain('!(slug.current match "*test*")')
      expect(cakesQuery).toContain('defined(slug.current)')
    })

    it('should query with filters to exclude test items from articles', async () => {
      mockFetch.mockResolvedValue([])

      await sitemap()

      const blogQuery = mockFetch.mock.calls[1][0]

      expect(blogQuery).toContain('_type == "article"')
      expect(blogQuery).toContain('coalesce(publishedAt, _createdAt) <= now()')
      expect(blogQuery).toContain('!(slug.current match "test*")')
      expect(blogQuery).toContain('!(slug.current match "*test*")')
      expect(blogQuery).toContain('defined(slug.current)')
      expect(blogQuery).not.toContain('seo {')
      expect(blogQuery).not.toContain('"topic": topic->')
    })

    it('should query with filters to exclude test items from gift hampers', async () => {
      mockFetch.mockResolvedValue([])

      await sitemap()

      const hampersQuery = mockFetch.mock.calls[2][0]

      expect(hampersQuery).toContain('!(slug.current match "test*")')
      expect(hampersQuery).toContain('!(slug.current match "*test*")')
      expect(hampersQuery).toContain('defined(slug.current)')
    })

    it('should not include items with undefined slugs', async () => {
      mockFetch
        .mockResolvedValueOnce([
          { slug: { current: 'valid-cake' }, _updatedAt: '2025-01-01' },
          { slug: null, _updatedAt: '2025-01-01' }
        ])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const result = await sitemap()
      const validEntry = result.find((entry) => entry.url.includes('/cakes/valid-cake'))
      const invalidEntry = result.find((entry) => entry.url.includes('null'))

      expect(validEntry).toBeDefined()
      expect(invalidEntry).toBeUndefined()
    })
  })
})
