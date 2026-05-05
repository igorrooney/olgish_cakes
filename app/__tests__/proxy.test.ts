/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { config, proxy } from '../../proxy'
import { isAdminAuthenticated } from '../../lib/admin-auth'

jest.mock('../../lib/admin-auth', () => ({
  isAdminAuthenticated: jest.fn()
}))

const mockedIsAdminAuthenticated = isAdminAuthenticated as jest.MockedFunction<typeof isAdminAuthenticated>

describe('proxy SEO headers for cakes filters', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedIsAdminAuthenticated.mockResolvedValue(true)
  })

  it('sets noindex, follow for filtered cakes URLs', async () => {
    const request = new NextRequest('https://olgishcakes.co.uk/cakes?sort=popular&collections=c-wedding-cakes')

    const response = await proxy(request)

    expect(response.headers.get('X-Robots-Tag')).toBe(
      'noindex, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    )
  })

  it('sets noindex, follow for occasions collection URLs', async () => {
    const request = new NextRequest('https://olgishcakes.co.uk/cakes?collections=c-wedding-cakes')

    const response = await proxy(request)

    expect(response.headers.get('X-Robots-Tag')).toBe(
      'noindex, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    )
  })

  it('keeps pure paginated cakes URLs indexable', async () => {
    const request = new NextRequest('https://olgishcakes.co.uk/cakes?page=2')

    const response = await proxy(request)

    expect(response.headers.get('X-Robots-Tag')).toBeNull()
  })

  it('sets noindex, follow for filtered cakes-by-post URLs', async () => {
    const request = new NextRequest('https://olgishcakes.co.uk/cakes-by-post?collections=h-postal-gifts')

    const response = await proxy(request)

    expect(response.headers.get('X-Robots-Tag')).toBe(
      'noindex, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    )
  })

  it('keeps pure paginated cakes-by-post URLs indexable', async () => {
    const request = new NextRequest('https://olgishcakes.co.uk/cakes-by-post?page=2')

    const response = await proxy(request)

    expect(response.headers.get('X-Robots-Tag')).toBeNull()
  })

  it('redirects filtered gift-hampers URLs to cakes-by-post while preserving filters', async () => {
    const request = new NextRequest('https://olgishcakes.co.uk/gift-hampers?collections=h-postal-gifts')

    const response = await proxy(request)

    expect(response.status).toBe(308)
    expect(response.headers.get('location')).toBe(
      'https://olgishcakes.co.uk/cakes-by-post?collections=h-postal-gifts'
    )
  })

  it('redirects paginated gift-hampers URLs to cakes-by-post while preserving pagination', async () => {
    const request = new NextRequest('https://olgishcakes.co.uk/gift-hampers?page=2')

    const response = await proxy(request)

    expect(response.status).toBe(308)
    expect(response.headers.get('location')).toBe('https://olgishcakes.co.uk/cakes-by-post?page=2')
  })

  it('sets noindex, follow for mixed cakes pagination and filter URLs', async () => {
    const request = new NextRequest('https://olgishcakes.co.uk/cakes?page=2&collections=c-wedding-cakes')

    const response = await proxy(request)

    expect(response.headers.get('X-Robots-Tag')).toBe(
      'noindex, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    )
  })

  it('sets noindex, follow for mixed cakes-by-post pagination and filter URLs', async () => {
    const request = new NextRequest('https://olgishcakes.co.uk/cakes-by-post?page=2&collections=h-postal-gifts')

    const response = await proxy(request)

    expect(response.headers.get('X-Robots-Tag')).toBe(
      'noindex, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    )
  })

  it('redirects mixed gift-hampers pagination and filter URLs to cakes-by-post', async () => {
    const request = new NextRequest('https://olgishcakes.co.uk/gift-hampers?page=2&collections=h-postal-gifts')

    const response = await proxy(request)

    expect(response.status).toBe(308)
    expect(response.headers.get('location')).toBe(
      'https://olgishcakes.co.uk/cakes-by-post?page=2&collections=h-postal-gifts'
    )
  })

  it('sets noindex, follow for invalid low page values', async () => {
    const request = new NextRequest('https://olgishcakes.co.uk/cakes?page=0')

    const response = await proxy(request)

    expect(response.headers.get('X-Robots-Tag')).toBe(
      'noindex, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    )
  })

  it('sets noindex, follow for invalid negative page values', async () => {
    const request = new NextRequest('https://olgishcakes.co.uk/cakes?page=-1')

    const response = await proxy(request)

    expect(response.headers.get('X-Robots-Tag')).toBe(
      'noindex, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    )
  })

  it('sets noindex, follow for invalid non-numeric page values', async () => {
    const request = new NextRequest('https://olgishcakes.co.uk/cakes?page=abc')

    const response = await proxy(request)

    expect(response.headers.get('X-Robots-Tag')).toBe(
      'noindex, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    )
  })

  it('sets noindex, follow for repeated page query values', async () => {
    const request = new NextRequest('https://olgishcakes.co.uk/cakes?page=2&page=3')

    const response = await proxy(request)

    expect(response.headers.get('X-Robots-Tag')).toBe(
      'noindex, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    )
  })

  it('redirects cakes page=1 to canonical base URL', async () => {
    const request = new NextRequest('https://olgishcakes.co.uk/cakes?page=1')

    const response = await proxy(request)

    expect(response.status).toBe(308)
    expect(response.headers.get('location')).toBe('https://olgishcakes.co.uk/cakes')
  })

  it('redirects cakes-by-post page=1 to canonical base URL', async () => {
    const request = new NextRequest('https://olgishcakes.co.uk/cakes-by-post?page=1')

    const response = await proxy(request)

    expect(response.status).toBe(308)
    expect(response.headers.get('location')).toBe('https://olgishcakes.co.uk/cakes-by-post')
  })

  it('redirects gift-hampers page=1 directly to cakes-by-post canonical URL', async () => {
    const request = new NextRequest('https://olgishcakes.co.uk/gift-hampers?page=1')

    const response = await proxy(request)

    expect(response.status).toBe(308)
    expect(response.headers.get('location')).toBe('https://olgishcakes.co.uk/cakes-by-post')
  })

  it('does not override robots header for clean cakes URL', async () => {
    const request = new NextRequest('https://olgishcakes.co.uk/cakes')

    const response = await proxy(request)

    expect(response.headers.get('X-Robots-Tag')).toBeNull()
  })

  it('does not override robots header for clean cakes-by-post URL', async () => {
    const request = new NextRequest('https://olgishcakes.co.uk/cakes-by-post')

    const response = await proxy(request)

    expect(response.headers.get('X-Robots-Tag')).toBeNull()
  })

  it('does not override robots header for clean gift-hampers URL', async () => {
    const request = new NextRequest('https://olgishcakes.co.uk/gift-hampers')

    const response = await proxy(request)

    expect(response.status).toBe(308)
    expect(response.headers.get('location')).toBe('https://olgishcakes.co.uk/cakes-by-post')
  })

  it('keeps Klaro runtime assets immutable through the proxy', async () => {
    const request = new NextRequest('https://olgishcakes.co.uk/runtime/klaro/v0.7/klaro-no-css.js')

    const response = await proxy(request)

    expect(response.headers.get('Cache-Control')).toBe('public, max-age=31536000, immutable')
  })

  it('returns 410 for retired corporate cakes landing page', async () => {
    const request = new NextRequest('https://olgishcakes.co.uk/corporate-cakes-leeds')

    const response = await proxy(request)

    expect(response.status).toBe(410)
    expect(response.headers.get('location')).toBeNull()
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex, follow')
  })

  it('redirects retired traditional Ukrainian cakes landing page to /cakes', async () => {
    const request = new NextRequest('https://olgishcakes.co.uk/traditional-ukrainian-cakes')

    const response = await proxy(request)

    expect(response.status).toBe(308)
    expect(response.headers.get('location')).toBe('https://olgishcakes.co.uk/cakes')
  })

  it('redirects retired traditional Ukrainian cakes landing page with query params to clean /cakes', async () => {
    const request = new NextRequest('https://olgishcakes.co.uk/traditional-ukrainian-cakes?utm_source=google')

    const response = await proxy(request)

    expect(response.status).toBe(308)
    expect(response.headers.get('location')).toBe('https://olgishcakes.co.uk/cakes')
  })

  it('excludes crawl metadata routes from the matcher', () => {
    expect(config.matcher).toContain(
      '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|sitemap-images.xml|sitemap-products.xml|icon.svg|apple-icon.png).*)'
    )
  })
})
