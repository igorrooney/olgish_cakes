import { cachedSanityFetch, getCacheConfig } from '@/lib/sanity-cache'
import type { MetadataRoute } from 'next'
import { getStaticSitemapLastModified } from './sitemap-static-pages'

type ImageSitemapEntry = MetadataRoute.Sitemap[number]

interface SanityImageDimensions {
  width?: number
  height?: number
  aspectRatio?: number
  [key: string]: unknown
}

interface SanityImageAsset {
  _id: string
  url: string
  metadata?: {
    dimensions?: SanityImageDimensions
  }
}

interface SanityImageRef {
  asset?: SanityImageAsset
  alt?: string
}

interface BlogImageResult {
  slug?: { current: string }
  featuredImage?: SanityImageRef
  cardImage?: SanityImageRef
  title: string
  publishDate?: string
  _updatedAt: string
}

interface CakeImageResult {
  slug?: { current: string }
  images?: SanityImageRef[]
  name: string
  _updatedAt: string
}

interface GiftHamperImageResult {
  slug?: { current: string }
  images?: SanityImageRef[]
  _updatedAt: string
}

function hasIndexableBlogSlug(post: BlogImageResult): post is BlogImageResult & { slug: { current: string } } {
  const slug = post.slug?.current

  if (!slug) {
    return false
  }

  return !slug.startsWith('test') && !slug.includes('test')
}

function hasIndexableCakeSlug(cake: CakeImageResult): cake is CakeImageResult & { slug: { current: string } } {
  const slug = cake.slug?.current

  if (!slug) {
    return false
  }

  return !slug.startsWith('test') && !slug.includes('test')
}

function hasIndexableGiftHamperSlug(hamper: GiftHamperImageResult): hamper is GiftHamperImageResult & { slug: { current: string } } {
  const slug = hamper.slug?.current

  if (!slug) {
    return false
  }

  return !slug.startsWith('test') && !slug.includes('test')
}

function hasSanityImageUrl(image: SanityImageRef): image is SanityImageRef & { asset: SanityImageAsset } {
  return Boolean(image.asset?.url)
}

function mergeUniqueUrls(...groups: string[][]) {
  const seen = new Set<string>()
  const mergedUrls: string[] = []

  for (const group of groups) {
    for (const url of group) {
      if (seen.has(url)) {
        continue
      }

      seen.add(url)
      mergedUrls.push(url)
    }
  }

  return mergedUrls
}

function toSingleImageUrl(image?: SanityImageRef) {
  return image?.asset?.url ? [image.asset.url] : []
}

function toImageUrls(images?: SanityImageRef[]) {
  if (!images || images.length === 0) {
    return []
  }

  const imageUrlGroups = images
    .filter(hasSanityImageUrl)
    .map((image) => [image.asset.url])

  return mergeUniqueUrls(...imageUrlGroups)
}

function getBlogLastModified(post: BlogImageResult) {
  return new Date(post.publishDate || post._updatedAt)
}

async function getBlogImages() {
  const query = `*[
    _type == "blogPost" &&
    status == "published" &&
    defined(slug.current) &&
    !slug.current match "test*" &&
    !slug.current match "*test*"
  ] {
    slug,
    featuredImage {
      asset->{
        _id,
        url,
        metadata {
          dimensions
        }
      },
      alt
    },
    cardImage {
      asset->{
        _id,
        url,
        metadata {
          dimensions
        }
      },
      alt
    },
    title,
    publishDate,
    _updatedAt
  }`
  const config = getCacheConfig('sitemaps')
  return cachedSanityFetch<BlogImageResult[]>(query, {}, config)
}

async function getCakeImages() {
  const query = `*[
    _type == "cake" &&
    defined(slug.current) &&
    !slug.current match "test*" &&
    !slug.current match "*test*"
  ] {
    slug,
    images[] {
      asset->{
        _id,
        url,
        metadata {
          dimensions
        }
      },
      alt
    },
    name,
    _updatedAt
  }`
  const config = getCacheConfig('sitemaps')
  return cachedSanityFetch<CakeImageResult[]>(query, {}, config)
}

async function getGiftHamperImages() {
  const query = `*[
    _type == "giftHamper" &&
    defined(slug.current) &&
    !slug.current match "test*" &&
    !slug.current match "*test*"
  ] {
    slug,
    images[] {
      asset->{
        _id,
        url,
        metadata {
          dimensions
        }
      },
      alt
    },
    _updatedAt
  }`
  const config = getCacheConfig('sitemaps')
  return cachedSanityFetch<GiftHamperImageResult[]>(query, {}, config)
}

export default async function sitemapImages(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://olgishcakes.co.uk'
  const [blogImages, cakeImages, giftHamperImages] = await Promise.all([
    getBlogImages(),
    getCakeImages(),
    getGiftHamperImages()
  ])

  const imageEntries: ImageSitemapEntry[] = []

  blogImages
    .filter(hasIndexableBlogSlug)
    .forEach((post) => {
      const postUrl = `${baseUrl}/blog/${post.slug.current}`
      const lastModified = getBlogLastModified(post)
      const images = mergeUniqueUrls(
        toSingleImageUrl(post.featuredImage),
        toSingleImageUrl(post.cardImage)
      )

      if (images.length === 0) {
        return
      }

      imageEntries.push({
        url: postUrl,
        lastModified,
        changeFrequency: 'monthly',
        priority: 0.7,
        images
      })
    })

  cakeImages
    .filter(hasIndexableCakeSlug)
    .forEach((cake) => {
      const cakeUrl = `${baseUrl}/cakes/${cake.slug.current}`
      const images = toImageUrls(cake.images)

      if (images.length === 0) {
        return
      }

      imageEntries.push({
        url: cakeUrl,
        lastModified: new Date(cake._updatedAt),
        changeFrequency: 'weekly',
        priority: 0.8,
        images
      })
    })

  giftHamperImages
    .filter(hasIndexableGiftHamperSlug)
    .forEach((hamper) => {
      const hamperUrl = `${baseUrl}/cakes-by-post/${hamper.slug.current}`
      const images = toImageUrls(hamper.images)

      if (images.length === 0) {
        return
      }

      imageEntries.push({
        url: hamperUrl,
        lastModified: new Date(hamper._updatedAt),
        changeFrequency: 'weekly',
        priority: 0.7,
        images
      })
    })

  const staticPageImages: ImageSitemapEntry[] = [
    {
      url: `${baseUrl}`,
      lastModified: getStaticSitemapLastModified('/'),
      changeFrequency: 'daily',
      priority: 1.0,
      images: [`${baseUrl}/images/olgish-cakes-logo-bakery-brand.png`]
    },
    {
      url: `${baseUrl}/about`,
      lastModified: getStaticSitemapLastModified('/about'),
      changeFrequency: 'monthly',
      priority: 0.8,
      images: [`${baseUrl}/android-chrome-192x192.png`]
    }
  ]

  return [...imageEntries, ...staticPageImages]
    .sort((a, b) => (b.priority || 0) - (a.priority || 0))
}
