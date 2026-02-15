import type { Metadata } from 'next'
import { CatalogPageTemplate } from './CatalogPageTemplate'
import { CatalogFaqAccordion } from './components/CatalogFaqAccordion'
import type { TabletCake } from './components/types'
import { cakesCatalogFaqItems } from './catalogFaqItems'
import {
  getCatalogByPostCakesPriceCeiling,
  getCatalogPageData
} from './catalogPageData'
import { formatStructuredDataPrice } from '@/lib/utils/price-formatting'
import {
  getMerchantReturnPolicy,
  getOfferShippingDetails,
  getPriceValidUntil
} from '../utils/seo'

export const dynamic = 'force-static'

const baseUrl = 'https://olgishcakes.co.uk'
const brandId = `${baseUrl}/#brand`

type StructuredData = Record<string, unknown>

const pageTitle = 'Traditional Ukrainian Cakes Leeds | Birthday & Wedding'
const pageDescription = 'Authentic Ukrainian cakes in Leeds from GBP 25, including Medovik honey cake, Kyiv cake and custom birthday designs, baked fresh for delivery or collection.'

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords:
    'traditional Ukrainian cakes, ukrainian cakes Leeds, authentic ukrainian cakes, ukraine birthday cake, ukrainian birthday cakes, ukrainian bakery near me, honey cake, Medovik, Kyiv cake, Ukrainian wedding cakes, Ukrainian desserts Leeds, real Ukrainian cakes, Ukrainian baker Leeds, authentic Medovik, traditional medovik',
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: 'https://olgishcakes.co.uk/cakes',
    siteName: 'Olgish Cakes',
    images: [
      {
        url: 'https://olgishcakes.co.uk/images/cakes-collection.jpg',
        width: 1200,
        height: 630,
        alt: 'Ukrainian cakes collection by Olgish Cakes'
      }
    ],
    locale: 'en_GB',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: pageTitle,
    description: pageDescription,
    images: ['https://olgishcakes.co.uk/images/cakes-collection.jpg']
  },
  alternates: {
    canonical: 'https://olgishcakes.co.uk/cakes'
  }
}

const detailsParagraphs = [
  'I bake traditional Ukrainian cakes in Leeds for birthdays, weddings, anniversaries and family celebrations, with every order made in small batches so flavour and finish stay consistent. You can browse ready designs in the catalogue or request a custom cake with your preferred size, style and decoration. Popular options include Medovik honey cake, Kyiv cake and bespoke birthday cakes, all made with quality ingredients, balanced sweetness and careful layering. Custom celebration cakes are prepared for collection or local delivery around Leeds, and if you specifically need postal options you can switch on the cakes-by-post filter to view available hamper products. Each product page includes clear photos, flavour notes, texture details and serving guidance, so it is easy to compare choices and order with confidence. If you share your occasion date and serving numbers, I can suggest the most suitable cake for your event.'
]

function toAbsoluteImageUrl(imageUrl: string) {
  return imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`
}

function toAbsoluteProductUrl(href: string) {
  return href.startsWith('http') ? href : `${baseUrl}${href}`
}

function createCakesItemListStructuredData(cakes: TabletCake[]): StructuredData {
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
        name: 'Traditional Ukrainian Cakes in Leeds',
        itemListElement: cakes.map((cake, index) => {
          const cakeUrl = toAbsoluteProductUrl(cake.href)

          return {
            '@type': 'ListItem',
            position: index + 1,
            item: {
              '@type': 'Product',
              '@id': `${cakeUrl}#product`,
              name: cake.name,
              description: cake.description,
              image: toAbsoluteImageUrl(cake.imageUrl),
              url: cakeUrl,
              brand: {
                '@id': brandId
              },
              offers: {
                '@type': 'Offer',
                price: formatStructuredDataPrice(cake.price, 0),
                priceCurrency: 'GBP',
                availability: 'https://schema.org/InStock',
                priceValidUntil: getPriceValidUntil(30),
                url: cakeUrl,
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

export default async function CakesPage() {
  const [catalogData, byPostCakesPriceCeilingHint] = await Promise.all([
    getCatalogPageData('cakes'),
    getCatalogByPostCakesPriceCeiling().catch((error) => {
      console.warn('Failed to fetch by-post cakes price ceiling hint for cakes page:', error)
      return undefined
    })
  ])
  const cakesForStructuredData = catalogData.cakesForUi.filter((cake) => cake.productType === 'cake')

  return (
    <CatalogPageTemplate
      variant='cakes'
      heading='Traditional Ukrainian custom cakes in Leeds for celebrations'
      intro='Browse handmade Ukrainian cakes prepared in Leeds with traditional recipes, quality ingredients and flavours that feel like home.'
      detailsSectionTitle='Authentic Ukrainian cakes in Leeds, baked fresh to order'
      detailsParagraphs={detailsParagraphs}
      breadcrumbLabel='Cakes'
      canonicalPath='/cakes'
      localBusinessDescription='Authentic traditional Ukrainian cakes made with love in Leeds. Specialising in Ukrainian birthday cakes, wedding cakes, and traditional honey cake (Medovik).'
      catalogData={catalogData}
      initialFilterDefaults={{ byPost: false, custom: true }}
      lazyByPostCakesEndpoint='/api/catalog/by-post-cakes'
      lazyByPostCakesPriceCeilingHint={byPostCakesPriceCeilingHint}
      postCatalogContent={(
        <CatalogFaqAccordion
          sectionId='cakes-faq-title'
          title='Cake ordering FAQs'
          intro='Answers to common questions about custom cakes, delivery, and ordering in Leeds.'
          items={cakesCatalogFaqItems}
        />
      )}
      additionalStructuredData={[
        createCakesItemListStructuredData(cakesForStructuredData)
      ]}
    />
  )
}
