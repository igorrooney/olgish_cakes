import type { Metadata } from 'next'
import Link from 'next/link'
import { CatalogFaqAccordion } from '../cakes/components/CatalogFaqAccordion'
import type { TabletCake } from '../cakes/components/types'
import { CatalogPageTemplate } from '../cakes/CatalogPageTemplate'
import { giftHampersCatalogFaqItems } from '../cakes/catalogFaqItems'
import {
  getCatalogCustomCakesPriceCeiling,
  getCatalogPageData
} from '../cakes/catalogPageData'
import {
  createCatalogMetadata,
  type ResolvedSearchParams
} from '../cakes/catalogSeo'
import { getMerchantReturnPolicy } from '../utils/seo'
import { formatStructuredDataPrice } from '@/lib/utils/price-formatting'
import { toSafeOperationalError } from '@/lib/security/safe-operational-error'

const baseUrl = 'https://olgishcakes.co.uk'
const brandId = `${baseUrl}/#brand`

type StructuredData = Record<string, unknown>

const pageTitle = 'Cakes by Post UK | Ukrainian Letterbox Cake Delivery'
const pageDescription = 'Order cakes by post across the UK from Olgish Cakes. Browse handmade Ukrainian cake hampers prepared in Leeds and packed fresh for reliable delivery.'

export async function generateMetadata({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}): Promise<Metadata> {
  const resolvedSearchParams: ResolvedSearchParams = searchParams ? await searchParams : {}

  return createCatalogMetadata({
    title: pageTitle,
    description: pageDescription,
    keywords:
      'cakes by post UK, cake by post delivery, letterbox cakes UK, Ukrainian honey cake by post, postal cake gifts, Olgish Cakes Leeds',
    canonicalPath: '/cakes-by-post',
    openGraphImage: {
      url: '/images/gift-hampers-collection.jpg',
      alt: 'Luxury Ukrainian gift hampers by Olgish Cakes'
    },
    searchParams: resolvedSearchParams,
    noindexOnQueryFilters: true,
    extraMetadata: {
      verification: {
        google: 'ggHjlSwV1aM_lVT4IcRSlUIk6Vn98ZbJ_FGCepoVi64'
      },
      other: {
        'geo.region': 'GB-ENG',
        'geo.placename': 'Leeds'
      }
    }
  })
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
                url: hamperUrl,
                seller: {
                  '@type': 'Organization',
                  name: 'Olgish Cakes',
                  url: baseUrl
                },
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

export default async function CakesByPostPage() {
  const [catalogData, customCakesPriceCeilingHint] = await Promise.all([
    getCatalogPageData('giftHampers'),
    getCatalogCustomCakesPriceCeiling().catch((error) => {
      console.warn('Custom cake price ceiling hint fetch failed', {
        operation: 'gift-hampers.price-ceiling.fetch',
        ...toSafeOperationalError(error)
      })
      return undefined
    })
  ])

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
      streetAddress: '15 Allerton Grange Avenue',
      addressLocality: 'Leeds',
      postalCode: 'LS17 6PR',
      addressRegion: 'West Yorkshire',
      addressCountry: 'GB'
    },
    sameAs: [
      'https://www.facebook.com/p/Olgish-Cakes-61557043820222/?locale=en_GB',
      'https://www.instagram.com/olgish_cakes/'
    ]
  }

  return (
    <CatalogPageTemplate
      variant='giftHampers'
      heading='Personalised cake cards and cake slices by post'
      intro='Send handmade Ukrainian honey cake slices and personalised cake cards by post, made in Yorkshire and delivered across the UK.'
      canonicalPath='/cakes-by-post'
      localBusinessDescription='Handmade Ukrainian cakes by post, prepared in Leeds and delivered across the UK.'
      catalogData={catalogData}
      initialFilterDefaults={{ byPost: true, custom: false }}
      lazyCustomCakesEndpoint='/api/catalog/custom-cakes'
      lazyCustomCakesPriceCeilingHint={customCakesPriceCeilingHint}
      lazyByPostCakesEndpoint='/api/catalog/by-post-cakes'
      postCatalogContent={(
        <>
          <CatalogFaqAccordion
            sectionId='cakes-by-post-faq-title'
            title='Cakes by post FAQs'
            intro='Quick answers about UK delivery, gifting options, and what to expect from cakes by post.'
            mobileIntro='UK delivery and gifting FAQs for cakes by post.'
            items={giftHampersCatalogFaqItems}
          />
          <aside
            aria-label='Delivery and returns information'
            className='mx-auto w-full max-w-5xl px-4 pb-16 tablet:px-0'
          >
            <div className='alert border border-base-300 bg-base-100 text-base-content shadow-sm'>
              <div>
                <p className='font-semibold'>Need delivery or returns details?</p>
                <p className='mt-1 text-sm leading-6 text-base-content/75'>
                  Read how UK post, local delivery, Leeds collection, cancellations and damaged
                  orders are handled.
                </p>
              </div>
              <Link href='/delivery' className='btn btn-outline min-h-11 font-semibold normal-case'>
                Delivery and returns
              </Link>
            </div>
          </aside>
        </>
      )}
      localBusinessData={localBusinessData}
      additionalStructuredData={[
        createGiftHamperItemListStructuredData(giftHampersForStructuredData)
      ]}
      includeBreadcrumbStructuredData
      breadcrumbItems={[
        {
          name: 'Home',
          item: '/'
        },
        {
          name: 'Cakes by post',
          item: '/cakes-by-post'
        }
      ]}
    />
  )
}
