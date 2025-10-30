import sitemap from '../sitemap'

// Mock Sanity client
jest.mock('@/sanity/lib/client', () => {
  const mockFetch = jest.fn()
  return {
    client: { fetch: mockFetch },
    __mockFetch: mockFetch
  }
})

const { __mockFetch: mockFetch } = jest.requireMock('@/sanity/lib/client')

describe('sitemap', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Data Fetching', () => {
    it('should fetch cakes, blog posts, and gift hampers', async () => {
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
        .mockResolvedValueOnce([]) // cakes
        .mockResolvedValueOnce([]) // blog posts
        .mockResolvedValueOnce([]) // hampers

      const result = await sitemap()

      expect(Array.isArray(result)).toBe(true)
    })

    it('should include core pages', async () => {
      mockFetch.mockResolvedValue([])

      const result = await sitemap()

      const homeUrl = result.find(entry => entry.url === 'https://olgishcakes.co.uk')
      expect(homeUrl).toBeDefined()
      expect(homeUrl?.priority).toBe(1.0)
    })

    it('should include cake routes', async () => {
      mockFetch
        .mockResolvedValueOnce([{ slug: { current: 'honey-cake' }, _updatedAt: '2025-01-01' }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const result = await sitemap()

      const cakeUrl = result.find(entry => entry.url.includes('/cakes/honey-cake'))
      expect(cakeUrl).toBeDefined()
    })

    it('should include blog routes', async () => {
      mockFetch
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{
          slug: { current: 'test-post' },
          _updatedAt: '2025-01-01',
          publishDate: '2025-01-01',
          featured: true
        }])
        .mockResolvedValueOnce([])

      const result = await sitemap()

      const blogUrl = result.find(entry => entry.url.includes('/blog/test-post'))
      expect(blogUrl).toBeDefined()
    })

    it('should include location pages', async () => {
      mockFetch.mockResolvedValue([])

      const result = await sitemap()

      const leedsUrl = result.find(entry => entry.url === 'https://olgishcakes.co.uk/cakes-leeds')
      const wakefieldUrl = result.find(entry => entry.url === 'https://olgishcakes.co.uk/cakes-wakefield')
      const bradfordUrl = result.find(entry => entry.url === 'https://olgishcakes.co.uk/cakes-bradford')
      
      expect(leedsUrl).toBeDefined()
      expect(wakefieldUrl).toBeDefined()
      expect(bradfordUrl).toBeDefined()
    })

    it('should include cake delivery Leeds page', async () => {
      mockFetch.mockResolvedValue([])

      const result = await sitemap()

      const deliveryUrl = result.find(entry => entry.url === 'https://olgishcakes.co.uk/cake-delivery-leeds')
      expect(deliveryUrl).toBeDefined()
      expect(deliveryUrl?.priority).toBe(0.9)
    })

    it('should use _id as fallback for hampers without slug', async () => {
      mockFetch
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ _id: 'hamper-123', _updatedAt: '2025-01-01' }])

      const result = await sitemap()

      const hamperUrl = result.find(entry => entry.url.includes('/gift-hampers/hamper-123'))
      expect(hamperUrl).toBeDefined()
    })
  })

  describe('Priority Logic', () => {
    it('should prioritize featured blog posts higher', async () => {
      mockFetch
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          { slug: { current: 'featured' }, _updatedAt: '2025-01-01', featured: true },
          { slug: { current: 'normal' }, _updatedAt: '2025-01-01', featured: false }
        ])
        .mockResolvedValueOnce([])

      const result = await sitemap()

      const featuredUrl = result.find(entry => entry.url.includes('/blog/featured'))
      const normalUrl = result.find(entry => entry.url.includes('/blog/normal'))

      expect(featuredUrl?.priority).toBeGreaterThan(normalUrl?.priority || 0)
    })

    it('should prioritize recent blog posts', async () => {
      const recentDate = new Date().toISOString()
      const oldDate = '2020-01-01'

      mockFetch
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          { slug: { current: 'recent' }, _updatedAt: recentDate, publishDate: recentDate },
          { slug: { current: 'old' }, _updatedAt: oldDate, publishDate: oldDate }
        ])
        .mockResolvedValueOnce([])

      const result = await sitemap()

      const recentUrl = result.find(entry => entry.url.includes('/blog/recent'))
      const oldUrl = result.find(entry => entry.url.includes('/blog/old'))

      expect(recentUrl?.priority).toBeGreaterThan(oldUrl?.priority || 0)
    })

    it('should sort entries by priority', async () => {
      mockFetch.mockResolvedValue([])

      const result = await sitemap()

      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].priority).toBeGreaterThanOrEqual(result[i + 1].priority || 0)
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

      const entry = result.find(entry => entry.url.includes('/cakes/test'))
      expect(entry?.priority).toBe(0.95)
    })

    it('should use custom changeFrequency from SEO', async () => {
      mockFetch
        .mockResolvedValueOnce([{ slug: { current: 'test' }, _updatedAt: '2025-01-01', seo: { changefreq: 'daily' } }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const result = await sitemap()

      const entry = result.find(entry => entry.url.includes('/cakes/test'))
      expect(entry?.changeFrequency).toBe('daily')
    })
  })
})

