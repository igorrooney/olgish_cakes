import { cachedSanityFetch, getCacheConfig } from '@/lib/sanity-cache'
import type { MetadataRoute } from 'next'
import { BUSINESS_CONSTANTS } from '@/lib/constants'
import { categoryLandingConfig } from './cakes/categoryLandingConfig'
import { staticSitemapPages, toStaticSitemapEntry } from './sitemap-static-pages'

interface SitemapCake {
  slug: { current: string }
  _updatedAt: string
}

interface SitemapArticle {
  slug: { current: string }
  _updatedAt: string
  publishedAt?: string
}

interface SitemapGiftHamper {
  slug: { current: string }
  _updatedAt: string
}

function getArticleLastModified(article: SitemapArticle) {
  const publishedAt = article.publishedAt ? new Date(article.publishedAt) : null
  const updatedAt = new Date(article._updatedAt)

  if (!publishedAt) {
    return updatedAt
  }

  return updatedAt > publishedAt ? updatedAt : publishedAt
}

async function getCakes() {
  const query = `*[_type == "cake" && !(slug.current match "test*") && !(slug.current match "*test*") && defined(slug.current)] {
    slug,
    _updatedAt
  }`
  const config = getCacheConfig('sitemaps')
  return cachedSanityFetch<SitemapCake[]>(query, {}, config)
}

async function getArticles() {
  const query = `*[_type == "article" && coalesce(publishedAt, _createdAt) <= now() && !(slug.current match "test*") && !(slug.current match "*test*") && defined(slug.current)] {
    slug,
    _updatedAt,
    "publishedAt": coalesce(publishedAt, _createdAt)
  }`
  const config = getCacheConfig('sitemaps')
  return cachedSanityFetch<SitemapArticle[]>(query, {}, config)
}

async function getGiftHampers() {
  const query = `*[_type == "giftHamper" && !(slug.current match "test*") && !(slug.current match "*test*") && defined(slug.current)] {
    slug,
    _updatedAt
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
      changeFrequency: 'weekly' as const,
      priority: 0.8
    }))

  const articleRoutes = articles
    .filter((article) => article.slug?.current)
    .map((article) => ({
      url: `${baseUrl}/blog/${article.slug.current}`,
      lastModified: getArticleLastModified(article),
      priority: 0.6
    }))

  const giftHamperRoutes = giftHampers
    .filter((hamper) => hamper.slug?.current)
    .map((hamper) => ({
      url: `${baseUrl}/cakes-by-post/${hamper.slug.current}`,
      lastModified: new Date(hamper._updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7
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
