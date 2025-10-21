import sitemapImages from '../sitemap-images'

jest.mock('@/sanity/lib/client', () => {
  const mockFetch = jest.fn()
  return {
    client: { fetch: mockFetch },
    __mockFetch: mockFetch
  }
})

const { __mockFetch: mockFetch } = jest.requireMock('@/sanity/lib/client')

describe('sitemap-images', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Image Sitemap Generation', () => {
    it('should generate image sitemap', async () => {
      mockFetch.mockResolvedValue([])

      const result = await sitemapImages()

      expect(Array.isArray(result)).toBe(true)
    })

    it('should include blog images', async () => {
      mockFetch
        .mockResolvedValueOnce([{
          slug: { current: 'test-post' },
          title: 'Test Post',
          featuredImage: { asset: { url: 'https://cdn.sanity.io/test.jpg' }, alt: 'Test' },
          publishDate: '2025-01-01'
        }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const result = await sitemapImages()

      const blogEntry = result.find(entry => entry.url.includes('/blog/test-post'))
      expect(blogEntry).toBeDefined()
      if ('images' in blogEntry!) {
        expect((blogEntry as any).images?.[0].url).toContain('test.jpg')
      }
    })

    it('should include cake images', async () => {
      mockFetch
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{
          slug: { current: 'honey-cake' },
          name: 'Honey Cake',
          images: [{ asset: { url: 'https://cdn.sanity.io/cake.jpg' }, alt: 'Cake' }],
          _updatedAt: '2025-01-01'
        }])
        .mockResolvedValueOnce([])

      const result = await sitemapImages()

      const cakeEntry = result.find(entry => entry.url.includes('/cakes/honey-cake'))
      expect(cakeEntry).toBeDefined()
    })

    it('should include gift hamper images', async () => {
      mockFetch
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{
          slug: { current: 'deluxe' },
          name: 'Deluxe Hamper',
          images: [{ asset: { url: 'https://cdn.sanity.io/hamper.jpg' }, alt: 'Hamper' }],
          _updatedAt: '2025-01-01'
        }])

      const result = await sitemapImages()

      const hamperEntry = result.find(entry => entry.url.includes('/gift-hampers/deluxe'))
      expect(hamperEntry).toBeDefined()
    })

    it('should include static page images', async () => {
      mockFetch.mockResolvedValue([])

      const result = await sitemapImages()

      const logoEntry = result.find(entry => {
        if ('images' in entry) {
          return (entry as any).images?.some((img: any) => img.url.includes('logo'))
        }
        return false
      })
      expect(logoEntry).toBeDefined()
    })

    it('should add geo location to images', async () => {
      mockFetch
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{
          slug: { current: 'test' },
          name: 'Test',
          images: [{ asset: { url: 'https://test.jpg' }, alt: 'Test' }],
          _updatedAt: '2025-01-01'
        }])
        .mockResolvedValueOnce([])

      const result = await sitemapImages()

      const entry = result.find(entry => entry.url.includes('/cakes/test'))
      if (entry && 'images' in entry) {
        expect((entry as any).images?.[0]?.geoLocation || '').toContain('Leeds')
      }
    })

    it('should sort by priority', async () => {
      mockFetch.mockResolvedValue([])

      const result = await sitemapImages()

      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].priority).toBeGreaterThanOrEqual(result[i + 1].priority || 0)
      }
    })
  })
})

