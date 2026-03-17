import type { Metadata } from 'next'
import type { TabletCake } from './components/types'
import { formatStructuredDataPrice } from '@/lib/utils/price-formatting'
import {
  classifyPageOnlyQueryFromListingSearchParams,
  isIndexablePageOnlyPagination
} from '@/lib/utils/catalog-listing-query-seo'
import {
  getMerchantReturnPolicy,
  getOfferShippingDetails,
  getPriceValidUntil
} from '../utils/seo'
import type { CatalogFaqItem } from './catalogFaqItems'

const baseUrl = 'https://olgishcakes.co.uk'
const brandId = `${baseUrl}/#brand`

type StructuredData = Record<string, unknown>

type SearchParamValue = string | string[] | undefined
export type ResolvedSearchParams = Record<string, SearchParamValue>

interface CatalogMetadataInput {
  title: string
  description: string
  keywords: string
  canonicalPath: `/${string}`
  openGraphImage: {
    url: string
    alt: string
  }
  searchParams?: ResolvedSearchParams
  noindexOnQueryFilters?: boolean
  extraMetadata?: Pick<Metadata, 'verification' | 'other'>
}

function toAbsoluteUrl(pathOrUrl: string) {
  return pathOrUrl.startsWith('http') ? pathOrUrl : `${baseUrl}${pathOrUrl}`
}

function hasDefinedSearchParams(searchParams: ResolvedSearchParams) {
  return Object.values(searchParams).some((value) => value !== undefined)
}

export function createCatalogMetadata({
  title,
  description,
  keywords,
  canonicalPath,
  openGraphImage,
  searchParams = {},
  noindexOnQueryFilters = false,
  extraMetadata
}: CatalogMetadataInput): Metadata {
  const pageOnlyClassification = classifyPageOnlyQueryFromListingSearchParams(searchParams)
  const isIndexablePagination = isIndexablePageOnlyPagination(pageOnlyClassification)
  const canonicalUrl = isIndexablePagination
    ? toAbsoluteUrl(`${canonicalPath}?page=${pageOnlyClassification.pageNumber}`)
    : toAbsoluteUrl(canonicalPath)
  const imageUrl = toAbsoluteUrl(openGraphImage.url)
  const shouldNoindex =
    noindexOnQueryFilters &&
    hasDefinedSearchParams(searchParams) &&
    !isIndexablePagination

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Olgish Cakes',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: openGraphImage.alt
        }
      ],
      locale: 'en_GB',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl]
    },
    alternates: {
      canonical: canonicalUrl
    },
    ...extraMetadata,
    ...(shouldNoindex
      ? {
          robots: {
            index: false,
            follow: true
          }
        }
      : {})
  }
}

function toAbsoluteProductUrl(href: string) {
  return toAbsoluteUrl(href)
}

function toAbsoluteImageUrl(imageUrl: string) {
  return toAbsoluteUrl(imageUrl)
}

export function createCatalogItemListStructuredData({
  listName,
  items
}: {
  listName: string
  items: TabletCake[]
}): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Brand',
        '@id': brandId,
        name: 'Olgish Cakes',
        url: baseUrl,
        logo: `${baseUrl}/images/olgish-cakes-logo-bakery-brand.png`
      },
      {
        '@type': 'ItemList',
        name: listName,
        itemListElement: items.map((item, index) => {
          const itemUrl = toAbsoluteProductUrl(item.href)

          return {
            '@type': 'ListItem',
            position: index + 1,
            item: {
              '@type': 'Product',
              '@id': `${itemUrl}#product`,
              name: item.name,
              description: item.description,
              image: toAbsoluteImageUrl(item.imageUrl),
              url: itemUrl,
              brand: {
                '@id': brandId
              },
              offers: {
                '@type': 'Offer',
                price: formatStructuredDataPrice(item.price, 0),
                priceCurrency: 'GBP',
                availability: 'https://schema.org/InStock',
                priceValidUntil: getPriceValidUntil(30),
                url: itemUrl,
                seller: {
                  '@type': 'Organization',
                  name: 'Olgish Cakes',
                  url: baseUrl
                },
                shippingDetails: getOfferShippingDetails(),
                hasMerchantReturnPolicy: getMerchantReturnPolicy()
              }
            }
          }
        })
      }
    ]
  }
}

export function createCatalogFaqStructuredData(items: CatalogFaqItem[]): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  }
}
