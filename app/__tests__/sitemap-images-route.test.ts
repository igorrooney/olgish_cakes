/**
 * @jest-environment node
 */
jest.mock('next/cache', () => ({
  unstable_cache: jest.fn((fn) => fn)
}))
import { GET } from '../sitemap-images.xml/route'
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
describe('sitemap-images.xml route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('returns an XML sitemap response with image entries and cache headers', async () => {
    mockFetch
      .mockResolvedValueOnce([{
        slug: { current: 'serialized-post' },
        title: 'Serialized Post',
        coverImage: { asset: { url: 'https://cdn.sanity.io/test.jpg' }, alt: 'Test' },
        _updatedAt: '2025-01-02'
      }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
    const response = await GET()
    const body = await response.text()
    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/xml; charset=utf-8')
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=3600, s-maxage=86400')
    expect(body).toContain('<urlset')
    expect(body).toContain('xmlns:image=')
    expect(body).toContain('<image:loc>https://cdn.sanity.io/test.jpg</image:loc>')
  })

  it('returns 200 and omits malformed or test blog and cake image entries', async () => {
    mockFetch
      .mockResolvedValueOnce([
        {
          slug: { current: 'test-post' },
          title: 'Test Post',
          coverImage: { asset: { url: 'https://cdn.sanity.io/test-post.jpg' }, alt: 'Test' },
          _updatedAt: '2025-01-02'
        },
        {
          title: 'No Slug Post',
          coverImage: { asset: { url: 'https://cdn.sanity.io/no-slug-post.jpg' }, alt: 'Post' },
          _updatedAt: '2025-01-02'
        },
        {
          slug: { current: 'published-post' },
          title: 'Published Post',
          coverImage: { asset: { url: 'https://cdn.sanity.io/published-post.jpg' }, alt: 'Published' },
          _updatedAt: '2025-01-02'
        }
      ])
      .mockResolvedValueOnce([
        {
          slug: { current: 'test-cake' },
          name: 'Test Cake',
          images: [{ asset: { url: 'https://cdn.sanity.io/test-cake.jpg' }, alt: 'Test Cake' }],
          _updatedAt: '2025-01-01'
        },
        {
          name: 'No Slug Cake',
          images: [{ asset: { url: 'https://cdn.sanity.io/no-slug-cake.jpg' }, alt: 'Cake' }],
          _updatedAt: '2025-01-01'
        },
        {
          slug: { current: 'honey-cake' },
          name: 'Honey Cake',
          images: [{ asset: { url: 'https://cdn.sanity.io/honey-cake.jpg' }, alt: 'Honey Cake' }],
          _updatedAt: '2025-01-01'
        }
      ])
      .mockResolvedValueOnce([])

    const response = await GET()
    const body = await response.text()

    expect(response.status).toBe(200)
    expect(body).toContain('/blog/published-post')
    expect(body).toContain('/cakes/honey-cake')
    expect(body).not.toContain('/blog/test-post')
    expect(body).not.toContain('/blog/undefined')
    expect(body).not.toContain('/cakes/test-cake')
    expect(body).not.toContain('/cakes/undefined')
  })
})
