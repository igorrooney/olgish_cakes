import { cachedSanityFetch, getCacheConfig } from '@/lib/sanity-cache'
import type { MetadataRoute } from 'next'
import { BUSINESS_CONSTANTS } from '@/lib/constants'
import { categoryLandingConfig } from './cakes/categoryLandingConfig'
import { staticSitemapPages, toStaticSitemapEntry } from './sitemap-static-pages'

interface SitemapCake {
  slug: { current: string }
  _updatedAt: string
  seo?: { priority?: number, changefreq?: string }
}

interface SitemapBlogPost {
  slug: { current: string }
  _updatedAt: string
  publishDate?: string
  featured?: boolean
  category?: string
  seo?: { priority?: number, changefreq?: string }
}

interface SitemapGiftHamper {
  slug: { current: string }
  _updatedAt: string
  seo?: { priority?: number, changefreq?: string }
}

type SitemapChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>

function toSitemapChangeFrequency(value: string | undefined, fallback: SitemapChangeFrequency) {
  return (value as SitemapChangeFrequency | undefined) || fallback
}

async function getCakes() {
  const query = `*[_type == "cake" && !slug.current match "test*" && !slug.current match "*test*" && defined(slug.current)] {
    slug,
    _updatedAt,
    seo {
      priority,
      changefreq
    }
  }`
  const config = getCacheConfig('sitemaps')
  return cachedSanityFetch<SitemapCake[]>(query, {}, config)
}

async function getBlogPosts() {
  const query = `*[_type == "blogPost" && status == "published" && !slug.current match "test*" && !slug.current match "*test*" && defined(slug.current)] {
    slug,
    _updatedAt,
    publishDate,
    featured,
    category,
    seo {
      priority,
      changefreq
    }
  }`
  const config = getCacheConfig('sitemaps')
  return cachedSanityFetch<SitemapBlogPost[]>(query, {}, config)
}

async function getGiftHampers() {
  const query = `*[_type == "giftHamper" && !slug.current match "test*" && !slug.current match "*test*" && defined(slug.current)] {
    slug,
    _updatedAt,
    seo {
      priority,
      changefreq
    }
  }`
  const config = getCacheConfig('sitemaps')
  return cachedSanityFetch<SitemapGiftHamper[]>(query, {}, config)
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = BUSINESS_CONSTANTS.BASE_URL
  const [cakes, blogPosts, giftHampers] = await Promise.all([
    getCakes(),
    getBlogPosts(),
    getGiftHampers()
  ])

  const cakeRoutes = cakes
    .filter((cake) => cake.slug?.current)
    .map((cake) => ({
      url: `${baseUrl}/cakes/${cake.slug.current}`,
      lastModified: new Date(cake._updatedAt),
      changeFrequency: toSitemapChangeFrequency(cake.seo?.changefreq, 'weekly'),
      priority: cake.seo?.priority || 0.8
    }))

  const blogRoutes = blogPosts
    .filter((post) => post.slug?.current)
    .map((post) => {
      const isRecent = post.publishDate &&
        new Date(post.publishDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const basePriority = post.featured ? 0.8 : (isRecent ? 0.7 : 0.6)
      const trendingCategories = ['wedding-cakes', 'birthday-cakes', 'custom-cakes', 'ukrainian-cakes']
      const isTrending = post.category && trendingCategories.includes(post.category.toLowerCase())
      const changeFrequency: SitemapChangeFrequency = isTrending ? 'weekly' : 'monthly'

      return {
        url: `${baseUrl}/blog/${post.slug.current}`,
        lastModified: new Date(post.publishDate || post._updatedAt),
        changeFrequency: toSitemapChangeFrequency(post.seo?.changefreq, changeFrequency),
        priority: post.seo?.priority || basePriority
      }
    })

  const giftHamperRoutes = giftHampers
    .filter((hamper) => hamper.slug?.current)
    .map((hamper) => ({
      url: `${baseUrl}/cakes-by-post/${hamper.slug.current}`,
      lastModified: new Date(hamper._updatedAt),
      changeFrequency: toSitemapChangeFrequency(hamper.seo?.changefreq, 'weekly'),
      priority: hamper.seo?.priority || 0.7
    }))

  const categoryLandingPages = Object.values(categoryLandingConfig).map((config) =>
    toStaticSitemapEntry(baseUrl, {
      url: config.canonicalPath,
      lastModified: config.lastSignificantUpdate,
      changeFrequency: 'weekly',
      priority: config.slug === 'wedding-cakes' || config.slug === 'birthday-cakes' ? 0.9 : 0.85
    })
  )

  const staticPages = staticSitemapPages.map((entry) => toStaticSitemapEntry(baseUrl, entry))

  return [...staticPages, ...categoryLandingPages, ...cakeRoutes, ...giftHamperRoutes, ...blogRoutes]
    .sort((a, b) => (b.priority || 0) - (a.priority || 0))
}
