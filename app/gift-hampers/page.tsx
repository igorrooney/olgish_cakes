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

const pageTitle = 'Luxury Gift Hampers in Leeds | Ukrainian Cakes by Post'
const pageDescription = 'Shop luxury Ukrainian gift hampers in Leeds with UK delivery. Browse cakes by post, curated treats, and handcrafted gifts made fresh by Olgish Cakes today.'

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords:
    'gift hampers Leeds, Ukrainian gift hampers UK, cakes by post UK, luxury food hampers, honey cake by post, handcrafted hampers, Olgish Cakes Leeds, postal cake gifts',
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: `${baseUrl}/gift-hampers`,
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
    canonical: `${baseUrl}/gift-hampers`
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
        name: 'Luxury Ukrainian Gift Hampers',
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
  'Our gift hampers are built for people who want reliable cakes by post without giving up handmade quality. Every hamper is prepared in Leeds and packed carefully for UK delivery, with an emphasis on flavour, freshness and presentation from unboxing to first slice. The catalogue preselects by-post options so you can compare quickly by budget, style and occasion, then open each product page for clear details on contents, flavours, serving notes and delivery expectations. This keeps the journey simple for birthday gifts, thank-you hampers, corporate sending and family surprises. Ukrainian-inspired favourites such as honey cake slices and caramel biscuits are made with balanced sweetness and practical packaging chosen for safe travel. If you are unsure what to choose, start with budget and recipient preference, and I can recommend the best hamper for your date and delivery needs.'
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
      heading='Luxury gift hampers and cakes by post across the UK'
      intro='Browse our gift-hamper collection with cakes by post preselected, handcrafted in Leeds and delivered nationwide for birthdays, celebrations and thoughtful surprises.'
      detailsSectionTitle='Gift hampers in Leeds with reliable UK-wide cake-by-post delivery'
      detailsParagraphs={detailsParagraphs}
      breadcrumbLabel='Gift Hampers'
      canonicalPath='/gift-hampers'
      localBusinessDescription='Luxury Ukrainian gift hampers and cakes by post, handcrafted in Leeds and delivered across the UK.'
      catalogData={catalogData}
      initialFilterDefaults={{ byPost: true, custom: false }}
      lazyCustomCakesEndpoint='/api/catalog/custom-cakes'
      lazyCustomCakesPriceCeilingHint={customCakesPriceCeilingHint}
      postCatalogContent={(
        <CatalogFaqAccordion
          sectionId='gift-hampers-faq-title'
          title='Gift hamper FAQs'
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
