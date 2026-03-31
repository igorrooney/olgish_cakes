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

interface SitemapArticle {
  slug: { current: string }
  _updatedAt: string
  publishedAt?: string
  topic?: {
    slug?: string
  }
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

async function getArticles() {
  const query = `*[_type == "article" && coalesce(publishedAt, _createdAt) <= now() && !slug.current match "test*" && !slug.current match "*test*" && defined(slug.current)] {
    slug,
    _updatedAt,
    "publishedAt": coalesce(publishedAt, _createdAt),
    "topic": topic->{
      "slug": slug.current
    },
    seo {
      priority,
      changefreq
    }
  }`
  const config = getCacheConfig('sitemaps')
  return cachedSanityFetch<SitemapArticle[]>(query, {}, config)
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
  const [cakes, articles, giftHampers] = await Promise.all([
    getCakes(),
    getArticles(),
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

  const articleRoutes = articles
    .filter((article) => article.slug?.current)
    .map((article) => {
      const isRecent = article.publishedAt &&
        new Date(article.publishedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const basePriority = isRecent ? 0.7 : 0.6
      const trendingTopics = new Set([
        'cake-by-post',
        'celebration-planning',
        'gift-ideas',
        'local-cake-delivery',
        'seasonal-cake-guides',
        'ukrainian-cake-guides'
      ])
      const isTrending = article.topic?.slug ? trendingTopics.has(article.topic.slug) : false
      const changeFrequency: SitemapChangeFrequency = isTrending ? 'weekly' : 'monthly'

      return {
        url: `${baseUrl}/blog/${article.slug.current}`,
        lastModified: new Date(article.publishedAt || article._updatedAt),
        changeFrequency: toSitemapChangeFrequency(article.seo?.changefreq, changeFrequency),
        priority: article.seo?.priority || basePriority
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

  return [...staticPages, ...categoryLandingPages, ...cakeRoutes, ...giftHamperRoutes, ...articleRoutes]
    .sort((a, b) => (b.priority || 0) - (a.priority || 0))
}
