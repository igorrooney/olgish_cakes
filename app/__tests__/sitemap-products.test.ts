import sitemapProducts from '../sitemap-products'

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
        .mockResolvedValueOnce([]) // cakes
        .mockResolvedValueOnce([]) // hampers

      const result = await sitemapProducts()

      expect(Array.isArray(result)).toBe(true)
    })

    it('should include cake routes', async () => {
      mockFetch
        .mockResolvedValueOnce([{ slug: { current: 'honey-cake' }, _updatedAt: '2025-01-01' }])
        .mockResolvedValueOnce([])

      const result = await sitemapProducts()

      const cakeUrl = result.find(entry => entry.url.includes('/cakes/honey-cake'))
      expect(cakeUrl).toBeDefined()
      expect(cakeUrl?.priority).toBe(0.95)
      expect(cakeUrl?.changeFrequency).toBe('daily')
    })

    it('should include gift hamper routes', async () => {
      mockFetch
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ slug: { current: 'deluxe' }, _updatedAt: '2025-01-01' }])

      const result = await sitemapProducts()

      const hamperUrl = result.find(entry => entry.url.includes('/gift-hampers/deluxe'))
      expect(hamperUrl).toBeDefined()
    })

    it('should include category pages', async () => {
      mockFetch.mockResolvedValue([])

      const result = await sitemapProducts()

      const cakesPage = result.find(entry => entry.url === 'https://olgishcakes.co.uk/cakes')
      const hampersPage = result.find(entry => entry.url === 'https://olgishcakes.co.uk/gift-hampers')
      const orderPage = result.find(entry => entry.url === 'https://olgishcakes.co.uk/order')

      expect(cakesPage).toBeDefined()
      expect(hampersPage).toBeDefined()
      expect(orderPage).toBeDefined()
    })

    it('should use _id fallback for hampers without slug', async () => {
      mockFetch
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ _id: 'hamper-123', _updatedAt: '2025-01-01' }])

      const result = await sitemapProducts()

      const hamperUrl = result.find(entry => entry.url.includes('/gift-hampers/hamper-123'))
      expect(hamperUrl).toBeDefined()
    })
  })
})

