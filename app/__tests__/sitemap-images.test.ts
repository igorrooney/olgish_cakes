// Mock unstable_cache to bypass Next.js context requirement
jest.mock('next/cache', () => ({
  unstable_cache: jest.fn((fn) => fn)
}))

import sitemapImages from '../sitemap-images'
import { getStaticSitemapLastModified } from '../sitemap-static-pages'
import { resolveSitemap } from 'next/dist/build/webpack/loaders/metadata/resolve-route-data'

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

    it('should include article images', async () => {
      mockFetch
        .mockResolvedValueOnce([{
          slug: { current: 'featured-post' },
          title: 'Test Post',
          coverImage: { asset: { url: 'https://cdn.sanity.io/test.jpg' }, alt: 'Test' },
          publishedAt: '2025-01-01',
          _updatedAt: '2025-01-02'
        }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const result = await sitemapImages()
      const blogEntry = result.find((entry) => entry.url.includes('/blog/featured-post'))

      expect(blogEntry).toBeDefined()
      expect(blogEntry?.images).toEqual(['https://cdn.sanity.io/test.jpg'])
      expect(blogEntry?.lastModified).toEqual(new Date('2025-01-01'))
    })

    it('should include cover and card article images in a single entry', async () => {
      mockFetch
        .mockResolvedValueOnce([{
          slug: { current: 'two-images-post' },
          title: 'Two Images Post',
          coverImage: { asset: { url: 'https://cdn.sanity.io/featured.jpg' }, alt: 'Featured' },
          cardImage: { asset: { url: 'https://cdn.sanity.io/card.jpg' }, alt: 'Card' },
          publishedAt: '2025-01-01',
          _updatedAt: '2025-01-02'
        }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const result = await sitemapImages()
      const blogEntries = result.filter((entry) => entry.url.includes('/blog/two-images-post'))

      expect(blogEntries).toHaveLength(1)
      expect(blogEntries[0].images).toEqual([
        'https://cdn.sanity.io/featured.jpg',
        'https://cdn.sanity.io/card.jpg'
      ])
    })

    it('should dedupe identical cover and card article images', async () => {
      mockFetch
        .mockResolvedValueOnce([{
          slug: { current: 'duplicate-image-post' },
          title: 'Duplicate Image Post',
          coverImage: { asset: { url: 'https://cdn.sanity.io/shared.jpg' }, alt: 'Shared' },
          cardImage: { asset: { url: 'https://cdn.sanity.io/shared.jpg' }, alt: 'Shared card' },
          publishedAt: '2025-01-01',
          _updatedAt: '2025-01-02'
        }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const result = await sitemapImages()
      const blogEntry = result.find((entry) => entry.url.includes('/blog/duplicate-image-post'))

      expect(blogEntry?.images).toEqual(['https://cdn.sanity.io/shared.jpg'])
    })

    it('should fall back to Sanity _updatedAt when an article is missing publishedAt', async () => {
      mockFetch
        .mockResolvedValueOnce([{
          slug: { current: 'updated-post' },
          title: 'Updated Post',
          coverImage: { asset: { url: 'https://cdn.sanity.io/updated.jpg' }, alt: 'Updated' },
          _updatedAt: '2025-02-03T00:00:00.000Z'
        }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const result = await sitemapImages()
      const blogEntry = result.find((entry) => entry.url.includes('/blog/updated-post'))

      expect(blogEntry?.lastModified).toEqual(new Date('2025-02-03T00:00:00.000Z'))
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
      const cakeEntry = result.find((entry) => entry.url.includes('/cakes/honey-cake'))

      expect(cakeEntry).toBeDefined()
      expect(cakeEntry?.images).toEqual(['https://cdn.sanity.io/cake.jpg'])
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
      const hamperEntry = result.find((entry) => entry.url.includes('/cakes-by-post/deluxe'))

      expect(hamperEntry).toBeDefined()
      expect(hamperEntry?.images).toEqual(['https://cdn.sanity.io/hamper.jpg'])
    })

    it('should include static page images with stable committed lastModified dates', async () => {
      mockFetch.mockResolvedValue([])

      const result = await sitemapImages()
      const homeEntry = result.find((entry) => entry.url === 'https://olgishcakes.co.uk')
      const aboutEntry = result.find((entry) => entry.url === 'https://olgishcakes.co.uk/about')

      expect(homeEntry).toBeDefined()
      expect(aboutEntry).toBeDefined()
      expect(homeEntry?.images).toEqual(['https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png'])
      expect(aboutEntry?.images).toEqual(['https://olgishcakes.co.uk/android-chrome-192x192.png'])
      expect(homeEntry?.lastModified).toEqual(getStaticSitemapLastModified('/'))
      expect(aboutEntry?.lastModified).toEqual(getStaticSitemapLastModified('/about'))
    })

    it('should keep image sitemap helpers aligned with committed cakes and cakes by post dates', () => {
      expect(getStaticSitemapLastModified('/cakes')).toEqual(new Date('2026-03-17'))
      expect(getStaticSitemapLastModified('/cakes-by-post')).toEqual(new Date('2026-03-12'))
      expect(getStaticSitemapLastModified('/get-custom-quote')).toEqual(new Date('2026-03-17'))
    })

    it('should filter out invalid image refs and dedupe duplicate cake image URLs', async () => {
      mockFetch
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{
          slug: { current: 'valid-cake' },
          name: 'Valid Cake',
          images: [
            { alt: 'Missing asset url' },
            { asset: { _id: 'asset-1', url: 'https://test.jpg' }, alt: 'First valid image' },
            { asset: { _id: 'asset-2', url: 'https://test.jpg' }, alt: 'Duplicate valid image' }
          ],
          _updatedAt: '2025-01-01'
        }])
        .mockResolvedValueOnce([])

      const result = await sitemapImages()
      const entry = result.find((item) => item.url.includes('/cakes/valid-cake'))

      expect(entry?.images).toEqual(['https://test.jpg'])
    })

    it('should omit blog entries with no valid image URLs', async () => {
      mockFetch
        .mockResolvedValueOnce([{
          slug: { current: 'missing-image-post' },
          title: 'Missing Image Post',
          coverImage: { alt: 'No asset url' },
          cardImage: { alt: 'Still no asset url' },
          publishedAt: '2025-01-01',
          _updatedAt: '2025-01-02'
        }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const result = await sitemapImages()

      expect(result.find((entry) => entry.url.includes('/blog/missing-image-post'))).toBeUndefined()
    })

    it('should omit cake entries with no valid image URLs', async () => {
      mockFetch
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{
          slug: { current: 'invalid-cake' },
          name: 'Invalid Cake',
          images: [{ alt: 'Missing asset url' }],
          _updatedAt: '2025-01-01'
        }])
        .mockResolvedValueOnce([])

      const result = await sitemapImages()

      expect(result.find((entry) => entry.url.includes('/cakes/invalid-cake'))).toBeUndefined()
    })

    it('should omit blog entries without a slug even when images exist', async () => {
      mockFetch
        .mockResolvedValueOnce([{
          title: 'No Slug Post',
          coverImage: { asset: { url: 'https://cdn.sanity.io/no-slug-post.jpg' }, alt: 'Post' },
          _updatedAt: '2025-01-02'
        }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const result = await sitemapImages()

      expect(result.find((entry) => entry.url.includes('/blog/undefined'))).toBeUndefined()
    })

    it('should omit cake entries without a slug even when images exist', async () => {
      mockFetch
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{
          name: 'No Slug Cake',
          images: [{ asset: { url: 'https://cdn.sanity.io/no-slug-cake.jpg' }, alt: 'Cake' }],
          _updatedAt: '2025-01-01'
        }])
        .mockResolvedValueOnce([])

      const result = await sitemapImages()

      expect(result.find((entry) => entry.url.includes('/cakes/undefined'))).toBeUndefined()
    })

    it('should omit test blog slugs from the image sitemap', async () => {
      mockFetch
        .mockResolvedValueOnce([
          {
            slug: { current: 'test-post' },
            title: 'Test Post',
            coverImage: { asset: { url: 'https://cdn.sanity.io/test-post.jpg' }, alt: 'Test' },
            _updatedAt: '2025-01-02'
          },
          {
            slug: { current: 'guide-test-post' },
            title: 'Guide Test Post',
            coverImage: { asset: { url: 'https://cdn.sanity.io/guide-test-post.jpg' }, alt: 'Guide Test' },
            _updatedAt: '2025-01-02'
          },
          {
            slug: { current: 'published-post' },
            title: 'Published Post',
            coverImage: { asset: { url: 'https://cdn.sanity.io/published-post.jpg' }, alt: 'Published' },
            _updatedAt: '2025-01-02'
          }
        ])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const result = await sitemapImages()

      expect(result.find((entry) => entry.url.includes('/blog/test-post'))).toBeUndefined()
      expect(result.find((entry) => entry.url.includes('/blog/guide-test-post'))).toBeDefined()
      expect(result.find((entry) => entry.url.includes('/blog/published-post'))).toBeDefined()
    })

    it('should omit test cake slugs from the image sitemap', async () => {
      mockFetch
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          {
            slug: { current: 'test-cake' },
            name: 'Test Cake',
            images: [{ asset: { url: 'https://cdn.sanity.io/test-cake.jpg' }, alt: 'Test Cake' }],
            _updatedAt: '2025-01-01'
          },
          {
            slug: { current: 'birthday-test-cake' },
            name: 'Birthday Test Cake',
            images: [{ asset: { url: 'https://cdn.sanity.io/birthday-test-cake.jpg' }, alt: 'Birthday Test Cake' }],
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

      const result = await sitemapImages()

      expect(result.find((entry) => entry.url.includes('/cakes/test-cake'))).toBeUndefined()
      expect(result.find((entry) => entry.url.includes('/cakes/birthday-test-cake'))).toBeDefined()
      expect(result.find((entry) => entry.url.includes('/cakes/honey-cake'))).toBeDefined()
    })

    it('should omit gift hamper entries with no valid image URLs', async () => {
      mockFetch
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{
          slug: { current: 'invalid-hamper' },
          name: 'Invalid Hamper',
          images: [{ alt: 'Missing asset url' }],
          _updatedAt: '2025-01-01'
        }])

      const result = await sitemapImages()

      expect(result.find((entry) => entry.url.includes('/cakes-by-post/invalid-hamper'))).toBeUndefined()
    })

    it('should omit gift hamper entries without a slug even when images exist', async () => {
      mockFetch
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{
          _id: 'hamper-without-slug',
          images: [{ asset: { url: 'https://cdn.sanity.io/hamper.jpg' }, alt: 'Hamper' }],
          _updatedAt: '2025-01-01'
        }])

      const result = await sitemapImages()

      expect(result.find((entry) => entry.url.includes('/cakes-by-post/hamper-without-slug'))).toBeUndefined()
    })

    it('should omit test hamper slugs from the image sitemap', async () => {
      mockFetch
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          {
            slug: { current: 'test-hamper' },
            images: [{ asset: { url: 'https://cdn.sanity.io/test-hamper.jpg' }, alt: 'Hamper' }],
            _updatedAt: '2025-01-01'
          },
          {
            slug: { current: 'deluxe-test-hamper' },
            images: [{ asset: { url: 'https://cdn.sanity.io/deluxe-test-hamper.jpg' }, alt: 'Hamper' }],
            _updatedAt: '2025-01-01'
          },
          {
            slug: { current: 'deluxe' },
            images: [{ asset: { url: 'https://cdn.sanity.io/deluxe.jpg' }, alt: 'Hamper' }],
            _updatedAt: '2025-01-01'
          }
        ])

      const result = await sitemapImages()

      expect(result.find((entry) => entry.url.includes('/cakes-by-post/test-hamper'))).toBeUndefined()
      expect(result.find((entry) => entry.url.includes('/cakes-by-post/deluxe-test-hamper'))).toBeDefined()
      expect(result.find((entry) => entry.url === 'https://olgishcakes.co.uk/cakes-by-post/deluxe')?.images).toEqual(['https://cdn.sanity.io/deluxe.jpg'])
    })

    it('should skip malformed and test blog and cake records without throwing', async () => {
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

      const result = await sitemapImages()
      const urls = result.map((entry) => entry.url)

      expect(urls).toContain('https://olgishcakes.co.uk/blog/published-post')
      expect(urls).toContain('https://olgishcakes.co.uk/cakes/honey-cake')
      expect(urls).not.toContain('https://olgishcakes.co.uk/blog/test-post')
      expect(urls).not.toContain('https://olgishcakes.co.uk/blog/undefined')
      expect(urls).not.toContain('https://olgishcakes.co.uk/cakes/test-cake')
      expect(urls).not.toContain('https://olgishcakes.co.uk/cakes/undefined')
    })

    it('should serialize valid image XML instead of object placeholders', async () => {
      mockFetch
        .mockResolvedValueOnce([{
          slug: { current: 'serialized-post' },
          title: 'Serialized Post',
          coverImage: { asset: { url: 'https://cdn.sanity.io/test.jpg' }, alt: 'Test' },
          _updatedAt: '2025-01-02'
        }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const result = await sitemapImages()
      const xml = resolveSitemap(result)

      expect(xml).toContain('<image:loc>https://cdn.sanity.io/test.jpg</image:loc>')
      expect(xml).not.toContain('[object Object]')
    })

    it('should sort by priority', async () => {
      mockFetch.mockResolvedValue([])

      const result = await sitemapImages()

      for (let index = 0; index < result.length - 1; index++) {
        expect(result[index].priority).toBeGreaterThanOrEqual(result[index + 1].priority || 0)
      }
    })
  })

  describe('Query Filtering', () => {
    it('should query article images with filters to exclude missing and test slugs', async () => {
      mockFetch.mockResolvedValue([])

      await sitemapImages()

      const blogQuery = mockFetch.mock.calls[0][0]

      expect(blogQuery).toContain('defined(slug.current)')
      expect(blogQuery).toContain('slug.current != "test"')
      expect(blogQuery).toContain('!slug.current match "test-*"')
      expect(blogQuery).toContain('_type == "article"')
      expect(blogQuery).toContain('coalesce(publishedAt, _createdAt) <= now()')
    })

    it('should query cake images with filters to exclude missing and test slugs', async () => {
      mockFetch.mockResolvedValue([])

      await sitemapImages()

      const cakesQuery = mockFetch.mock.calls[1][0]

      expect(cakesQuery).toContain('defined(slug.current)')
      expect(cakesQuery).toContain('slug.current != "test"')
      expect(cakesQuery).toContain('!slug.current match "test-*"')
    })
  })
})

