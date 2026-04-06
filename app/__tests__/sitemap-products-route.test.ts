/**
 * @jest-environment node
 */
jest.mock('next/cache', () => ({
  unstable_cache: jest.fn((fn) => fn)
}))
import { GET } from '../sitemap-products.xml/route'
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
describe('sitemap-products.xml route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('returns an XML sitemap response with product URLs and cache headers', async () => {
    mockFetch
      .mockResolvedValueOnce([{ slug: { current: 'honey-cake' }, _updatedAt: '2025-01-01' }])
      .mockResolvedValueOnce([])
    const response = await GET()
    const body = await response.text()
    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/xml; charset=utf-8')
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=3600, s-maxage=86400')
    expect(body).toContain('<urlset')
    expect(body).toContain('<loc>https://olgishcakes.co.uk/cakes/honey-cake</loc>')
    expect(body).toContain('<loc>https://olgishcakes.co.uk/get-custom-quote</loc>')
  })

  it('returns 200 and omits malformed or test cake entries', async () => {
    mockFetch
      .mockResolvedValueOnce([
        { slug: { current: 'test-cake' }, _updatedAt: '2025-01-01' },
        { _updatedAt: '2025-01-01' },
        { slug: { current: 'honey-cake' }, _updatedAt: '2025-01-01' }
      ])
      .mockResolvedValueOnce([])

    const response = await GET()
    const body = await response.text()

    expect(response.status).toBe(200)
    expect(body).toContain('<loc>https://olgishcakes.co.uk/cakes/honey-cake</loc>')
    expect(body).not.toContain('/cakes/test-cake')
    expect(body).not.toContain('/cakes/undefined')
  })
})
