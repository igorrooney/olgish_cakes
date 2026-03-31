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

    it('should include location pages', async () => {
      mockFetch.mockResolvedValue([])

      const result = await sitemap()
      const leedsUrl = result.find((entry) => entry.url === 'https://olgishcakes.co.uk/cakes-leeds')
      const wakefieldUrl = result.find((entry) => entry.url === 'https://olgishcakes.co.uk/cakes-wakefield')
      const bradfordUrl = result.find((entry) => entry.url === 'https://olgishcakes.co.uk/cakes-bradford')

      expect(leedsUrl).toBeDefined()
      expect(wakefieldUrl).toBeDefined()
      expect(bradfordUrl).toBeDefined()
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
      const aboutUrl = result.find((entry) => entry.url === 'https://olgishcakes.co.uk/about')
      const homeEntry = getStaticSitemapEntry('/')
      const aboutEntry = getStaticSitemapEntry('/about')
      const runtimeDate = new Date('2026-03-17T12:00:00.000Z')

      expect(homeUrl?.lastModified).toEqual(new Date(homeEntry?.lastModified || ''))
      expect(aboutUrl?.lastModified).toEqual(new Date(aboutEntry?.lastModified || ''))
      expect(homeUrl?.lastModified).not.toEqual(runtimeDate)
      expect(aboutUrl?.lastModified).not.toEqual(runtimeDate)
    })

    it('should expose the updated committed lastModified values for cakes and cakes by post', async () => {
      mockFetch.mockResolvedValue([])

      const result = await sitemap()
      const cakesUrl = result.find((entry) => entry.url === 'https://olgishcakes.co.uk/cakes')
      const hampersUrl = result.find((entry) => entry.url === 'https://olgishcakes.co.uk/cakes-by-post')

      expect(cakesUrl?.lastModified).toEqual(new Date('2026-03-17'))
      expect(hampersUrl?.lastModified).toEqual(new Date('2026-03-12'))
      expect(getStaticSitemapLastModified('/cakes')).toEqual(new Date('2026-03-17'))
      expect(getStaticSitemapLastModified('/cakes-by-post')).toEqual(new Date('2026-03-12'))
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
    it('should prioritize recent articles', async () => {
      const recentDate = new Date().toISOString()
      const oldDate = '2020-01-01'

      mockFetch
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          { slug: { current: 'recent' }, _updatedAt: recentDate, publishedAt: recentDate },
          { slug: { current: 'old' }, _updatedAt: oldDate, publishedAt: oldDate }
        ])
        .mockResolvedValueOnce([])

      const result = await sitemap()
      const recentUrl = result.find((entry) => entry.url.includes('/blog/recent'))
      const oldUrl = result.find((entry) => entry.url.includes('/blog/old'))

      expect(recentUrl?.priority).toBeGreaterThan(oldUrl?.priority || 0)
    })

    it('should use weekly change frequency for trending article topics by default', async () => {
      mockFetch
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          {
            slug: { current: 'trend' },
            _updatedAt: '2025-01-01',
            publishedAt: '2025-01-01',
            topic: { slug: 'cake-by-post' }
          },
          {
            slug: { current: 'standard' },
            _updatedAt: '2025-01-01',
            publishedAt: '2025-01-01',
            topic: { slug: 'custom-cakes' }
          }
        ])
        .mockResolvedValueOnce([])

      const result = await sitemap()
      const trendingUrl = result.find((entry) => entry.url.includes('/blog/trend'))
      const standardUrl = result.find((entry) => entry.url.includes('/blog/standard'))

      expect(trendingUrl?.changeFrequency).toBe('weekly')
      expect(standardUrl?.changeFrequency).toBe('monthly')
    })

    it('should sort entries by priority', async () => {
      mockFetch.mockResolvedValue([])

      const result = await sitemap()

      for (let index = 0; index < result.length - 1; index++) {
        expect(result[index].priority).toBeGreaterThanOrEqual(result[index + 1].priority || 0)
      }
    })
  })

  describe('SEO Fields', () => {
    it('should use custom priority from SEO', async () => {
      mockFetch
        .mockResolvedValueOnce([{ slug: { current: 'test' }, _updatedAt: '2025-01-01', seo: { priority: 0.95 } }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const result = await sitemap()
      const entry = result.find((item) => item.url.includes('/cakes/test'))

      expect(entry?.priority).toBe(0.95)
    })

    it('should use custom changeFrequency from SEO', async () => {
      mockFetch
        .mockResolvedValueOnce([{ slug: { current: 'test' }, _updatedAt: '2025-01-01', seo: { changefreq: 'daily' } }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const result = await sitemap()
      const entry = result.find((item) => item.url.includes('/cakes/test'))

      expect(entry?.changeFrequency).toBe('daily')
    })
  })

  describe('GSC Compliance - Test Items Filtering', () => {
    it('should query with filters to exclude test items from cakes', async () => {
      mockFetch.mockResolvedValue([])

      await sitemap()

      const cakesQuery = mockFetch.mock.calls[0][0]

      expect(cakesQuery).toContain('!slug.current match "test*"')
      expect(cakesQuery).toContain('!slug.current match "*test*"')
      expect(cakesQuery).toContain('defined(slug.current)')
    })

    it('should query with filters to exclude test items from articles', async () => {
      mockFetch.mockResolvedValue([])

      await sitemap()

      const blogQuery = mockFetch.mock.calls[1][0]

      expect(blogQuery).toContain('_type == "article"')
      expect(blogQuery).toContain('coalesce(publishedAt, _createdAt) <= now()')
      expect(blogQuery).toContain('!slug.current match "test*"')
      expect(blogQuery).toContain('!slug.current match "*test*"')
      expect(blogQuery).toContain('defined(slug.current)')
    })

    it('should query with filters to exclude test items from gift hampers', async () => {
      mockFetch.mockResolvedValue([])

      await sitemap()

      const hampersQuery = mockFetch.mock.calls[2][0]

      expect(hampersQuery).toContain('!slug.current match "test*"')
      expect(hampersQuery).toContain('!slug.current match "*test*"')
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
