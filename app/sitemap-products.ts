import { cachedSanityFetch, getCacheConfig } from '@/lib/sanity-cache'
import type { MetadataRoute } from 'next'
import { getStaticSitemapLastModified } from './sitemap-static-pages'

interface SitemapCake {
  slug?: { current: string }
  _updatedAt: string
}

interface SitemapGiftHamper {
  slug?: { current: string }
  _updatedAt: string
}

function hasIndexableCakeSlug(cake: SitemapCake): cake is SitemapCake & { slug: { current: string } } {
  const slug = cake.slug?.current

  if (!slug) {
    return false
  }

  return !slug.startsWith('test') && !slug.includes('test')
}

function hasIndexableGiftHamperSlug(hamper: SitemapGiftHamper): hamper is SitemapGiftHamper & { slug: { current: string } } {
  const slug = hamper.slug?.current

  if (!slug) {
    return false
  }

  return !slug.startsWith('test') && !slug.includes('test')
}

async function getProducts() {
  const config = getCacheConfig('sitemaps')
  const [cakes, giftHampers] = await Promise.all([
    cachedSanityFetch<SitemapCake[]>(`*[
      _type == "cake" &&
      defined(slug.current) &&
      !slug.current match "test*" &&
      !slug.current match "*test*"
    ] {
      _id,
      name,
      slug,
      _updatedAt,
      pricing,
      mainImage,
      designs,
      category,
      shortDescription,
      description,
      seo {
        priority,
        changefreq
      }
    }`, {}, config),
    cachedSanityFetch<SitemapGiftHamper[]>(`*[
      _type == "giftHamper" &&
      defined(slug.current) &&
      !slug.current match "test*" &&
      !slug.current match "*test*"
    ] {
      slug,
      _updatedAt
    }`, {}, config)
  ])

  return { cakes, giftHampers }
}

export default async function sitemapProducts(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://olgishcakes.co.uk'
  const { cakes, giftHampers } = await getProducts()

  const cakeRoutes = cakes
    .filter(hasIndexableCakeSlug)
    .map((cake) => ({
      url: `${baseUrl}/cakes/${cake.slug.current}`,
      lastModified: new Date(cake._updatedAt),
      changeFrequency: 'daily' as const,
      priority: 0.95
    }))

  const giftHamperRoutes = giftHampers
    .filter(hasIndexableGiftHamperSlug)
    .map((hamper) => ({
      url: `${baseUrl}/cakes-by-post/${hamper.slug.current}`,
      lastModified: new Date(hamper._updatedAt),
      changeFrequency: 'daily' as const,
      priority: 0.95
    }))

  const categoryPages = [
    {
      url: `${baseUrl}/cakes`,
      lastModified: getStaticSitemapLastModified('/cakes'),
      changeFrequency: 'daily' as const,
      priority: 0.9
    },
    {
      url: `${baseUrl}/cakes-by-post`,
      lastModified: getStaticSitemapLastModified('/cakes-by-post'),
      changeFrequency: 'daily' as const,
      priority: 0.9
    },
    {
      url: `${baseUrl}/order`,
      lastModified: getStaticSitemapLastModified('/order'),
      changeFrequency: 'daily' as const,
      priority: 0.95
    }
  ]

  return [...categoryPages, ...cakeRoutes, ...giftHamperRoutes]
}
