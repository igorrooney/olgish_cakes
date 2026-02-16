import type { Metadata } from 'next'
import { CatalogFaqAccordion } from '../cakes/components/CatalogFaqAccordion'
import type { TabletCake } from '../cakes/components/types'
import { CatalogPageTemplate } from '../cakes/CatalogPageTemplate'
import { giftHampersCatalogFaqItems } from '../cakes/catalogFaqItems'
import {
  getCatalogCustomCakesPriceCeiling,
  getCatalogPageData
} from '../cakes/catalogPageData'
import { formatStructuredDataPrice } from '@/lib/utils/price-formatting'
import { getAllTestimonialsStats } from '../utils/fetchTestimonials'
import { buildAggregateRating } from '../utils/review-stats'
import {
  getMerchantReturnPolicy,
  getOfferShippingDetails,
  getPriceValidUntil
} from '../utils/seo'

export const dynamic = 'force-static'

const baseUrl = 'https://olgishcakes.co.uk'
const brandId = `${baseUrl}/#brand`

type StructuredData = Record<string, unknown>

const pageTitle = 'Cakes by Post UK | Ukrainian Letterbox Cake Delivery'
const pageDescription = 'Order cakes by post across the UK from Olgish Cakes. Browse handmade Ukrainian cake hampers prepared in Leeds and packed fresh for reliable delivery.'

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords:
    'cakes by post UK, cake by post delivery, letterbox cakes UK, Ukrainian honey cake by post, postal cake gifts, Olgish Cakes Leeds',
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: `${baseUrl}/cakes-by-post`,
    siteName: 'Olgish Cakes',
    images: [
      {
        url: `${baseUrl}/images/gift-hampers-collection.jpg`,
        width: 1200,
        height: 630,
        alt: 'Luxury Ukrainian gift hampers by Olgish Cakes'
      }
    ],
    locale: 'en_GB',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: pageTitle,
    description: pageDescription,
    images: [`${baseUrl}/images/gift-hampers-collection.jpg`]
  },
  alternates: {
    canonical: `${baseUrl}/cakes-by-post`
  },
  verification: {
    google: 'ggHjlSwV1aM_lVT4IcRSlUIk6Vn98ZbJ_FGCepoVi64'
  },
  other: {
    'geo.region': 'GB-ENG',
    'geo.placename': 'Leeds'
  }
}

function toAbsoluteImageUrl(imageUrl: string) {
  return imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`
}

function toAbsoluteProductUrl(href: string) {
  return href.startsWith('http') ? href : `${baseUrl}${href}`
}

function createGiftHamperItemListStructuredData(giftHampers: TabletCake[]): StructuredData {
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
        name: 'Cakes by Post UK Collection',
        itemListElement: giftHampers.map((hamper, index) => {
          const hamperUrl = toAbsoluteProductUrl(hamper.href)

          return {
            '@type': 'ListItem',
            position: index + 1,
            item: {
              '@type': 'Product',
              '@id': `${hamperUrl}#product`,
              name: hamper.name,
              description: hamper.description,
              image: toAbsoluteImageUrl(hamper.imageUrl),
              url: hamperUrl,
              brand: {
                '@id': brandId
              },
              offers: {
                '@type': 'Offer',
                price: formatStructuredDataPrice(hamper.price, 0),
                priceCurrency: 'GBP',
                availability: 'https://schema.org/InStock',
                priceValidUntil: getPriceValidUntil(30),
                url: hamperUrl,
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

function resolveGiftHampersForStructuredData(catalogData: {
  mappedGiftHampers: TabletCake[]
  cakesForUi: TabletCake[]
}) {
  if (catalogData.mappedGiftHampers.length > 0) {
    return catalogData.mappedGiftHampers
  }

  return catalogData.cakesForUi.filter((cake) => cake.productType === 'giftHamper')
}

const detailsParagraphs = [
  'Our cakes-by-post collection is designed for people who want reliable UK delivery without giving up handmade quality. Every order is prepared in Leeds and packed carefully for travel, with clear product pages covering flavours, contents, portion guidance and delivery expectations. You can compare by budget and occasion, then choose the best option for birthdays, thank-you gifts, corporate sending or family surprises. Ukrainian-inspired favourites such as honey cake slices and caramel biscuits are made with balanced sweetness and packaging selected for safe letterbox-friendly delivery. If you are unsure what to choose, start with recipient preferences and delivery date, and I can recommend the most suitable cake-by-post option.'
]

export default async function GiftHampersPage() {
  const [catalogData, customCakesPriceCeilingHint, testimonialStats] = await Promise.all([
    getCatalogPageData('giftHampers'),
    getCatalogCustomCakesPriceCeiling().catch((error) => {
      console.warn('Failed to fetch custom cakes price ceiling hint for gift hampers page:', error)
      return undefined
    }),
    getAllTestimonialsStats()
  ])

  const aggregateRating = buildAggregateRating(testimonialStats)
  const giftHampersForStructuredData = resolveGiftHampersForStructuredData(catalogData)
  const localBusinessData: StructuredData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Olgish Cakes',
    url: baseUrl,
    telephone: '+44 786 721 8194',
    email: 'hello@olgishcakes.co.uk',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Allerton Grange',
      addressLocality: 'Leeds',
      postalCode: 'LS17',
      addressRegion: 'West Yorkshire',
      addressCountry: 'GB'
    },
    sameAs: [
      'https://www.facebook.com/p/Olgish-Cakes-61557043820222/?locale=en_GB',
      'https://www.instagram.com/olgish_cakes/'
    ],
    ...(aggregateRating ? { aggregateRating } : {})
  }

  return (
    <CatalogPageTemplate
      variant='giftHampers'
      heading='Cakes by post across the UK with handmade Ukrainian flavour'
      intro='Browse our cakes-by-post collection, handcrafted in Leeds and delivered nationwide for birthdays, celebrations and thoughtful surprises.'
      detailsSectionTitle='Cakes by post from Leeds with reliable UK-wide delivery'
      detailsParagraphs={detailsParagraphs}
      breadcrumbLabel='Cakes by post'
      canonicalPath='/cakes-by-post'
      localBusinessDescription='Handmade Ukrainian cakes by post, prepared in Leeds and delivered across the UK.'
      catalogData={catalogData}
      initialFilterDefaults={{ byPost: true, custom: false }}
      lazyCustomCakesEndpoint='/api/catalog/custom-cakes'
      lazyCustomCakesPriceCeilingHint={customCakesPriceCeilingHint}
      postCatalogContent={(
        <CatalogFaqAccordion
          sectionId='cakes-by-post-faq-title'
          title='Cakes by post FAQs'
          intro='Quick answers about UK delivery, gifting options, and what to expect from cakes by post.'
          items={giftHampersCatalogFaqItems}
        />
      )}
      localBusinessData={localBusinessData}
      additionalStructuredData={[
        createGiftHamperItemListStructuredData(giftHampersForStructuredData)
      ]}
    />
  )
}
