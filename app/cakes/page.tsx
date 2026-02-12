import { Metadata } from 'next'
import { urlFor } from '@/sanity/lib/image'
import { Cake, blocksToText } from '@/types/cake'
import { getAllCakes, getCakesFeaturedOffer } from '../utils/fetchCakes'
import { getAllGiftHampers } from '../utils/fetchGiftHampers'
import { getHomepageCollections, getHomepageGiftHamperCollections } from '../utils/fetchCollections'
import type { HomepageCollection } from '../types/collection'
import type { GiftHamper } from '@/types/giftHamper'
import { CakesTabletCatalog } from './components/CakesTabletCatalog'
import { CakesCollectionOption, TabletCake } from './components/types'

export const dynamic = 'force-static'

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

const fallbackCakes: TabletCake[] = [
  {
    id: 'fallback-honey',
    slug: 'cake-by-post',
    href: '/gift-hampers/cake-by-post',
    name: 'Cake by Post Gift Hamper',
    description: 'Traditional layered Medovik with delicate cream and light honey sweetness.',
    price: 35,
    imageUrl: '/images/honey-cake-medovik.jpg',
    imageAlt: 'Traditional Ukrainian honey cake',
    isByPost: true,
    isCustom: false,
    isPopular: false,
    collectionIds: [],
    productType: 'giftHamper'
  },
  {
    id: 'fallback-birthday',
    slug: 'birthday-cake',
    href: '/cakes/birthday-cake',
    name: 'Birthday Celebration Cake',
    description: 'Custom birthday cake made to order with seasonal decoration and rich sponge.',
    price: 65,
    imageUrl: '/images/placeholder-cake.jpg',
    imageAlt: 'Custom birthday cake',
    isByPost: false,
    isCustom: true,
    isPopular: true,
    collectionIds: [],
    productType: 'cake'
  },
  {
    id: 'fallback-christmas',
    slug: 'christmas-cake',
    href: '/cakes/christmas-cake',
    name: 'Christmas Cake',
    description: 'Festive design with winter flavours, handcrafted for holiday celebrations.',
    price: 58,
    imageUrl: '/images/placeholder-cake.jpg',
    imageAlt: 'Christmas design cake',
    isByPost: false,
    isCustom: true,
    isPopular: false,
    collectionIds: [],
    productType: 'cake'
  },
  {
    id: 'fallback-kyiv',
    slug: 'kyiv-cake',
    href: '/cakes/kyiv-cake',
    name: 'Kyiv Cake',
    description: 'Classic Kyiv cake with meringue layers, hazelnuts and chocolate cream.',
    price: 42,
    imageUrl: '/images/placeholder-cake.jpg',
    imageAlt: 'Classic Kyiv cake',
    isByPost: false,
    isCustom: true,
    isPopular: true,
    collectionIds: [],
    productType: 'cake'
  }
]

type UrlForImage = Parameters<typeof urlFor>[0]
type RichTextBlockLike = {
  _type?: string
  children?: Array<{ text?: string }>
}

interface ImageSelection {
  image: UrlForImage
  alt?: string
}

function normalizeDocumentId(documentId: string) {
  return documentId.startsWith('drafts.')
    ? documentId.slice('drafts.'.length)
    : documentId
}

function slugifyCollectionLabel(label: string) {
  return label
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function toShortDocumentId(documentId: string) {
  return normalizeDocumentId(documentId)
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 8)
    .toLowerCase()
}

function createCollectionQueryValue(
  collectionId: string,
  label: string,
  productType: 'cake' | 'giftHamper'
) {
  const prefix = productType === 'cake' ? 'c' : 'p'
  const slug = slugifyCollectionLabel(label).slice(0, 40)

  if (slug.length > 0) {
    return `${prefix}-${slug}`
  }

  return `${prefix}-${toShortDocumentId(collectionId)}`
}

function getDescription(cake: Cake) {
  const source = cake.shortDescription && cake.shortDescription.length > 0
    ? cake.shortDescription
    : cake.description

  const description = blocksToText(source)
  const trimmed = description.slice(0, 140).trim()

  return trimmed.length > 0
    ? trimmed
    : 'Traditional Ukrainian cake made with premium ingredients and baked fresh to order.'
}

function blocksToPlainText(blocks: RichTextBlockLike[] | undefined) {
  if (!blocks || blocks.length === 0) {
    return ''
  }

  return blocks
    .map((block) => {
      if (block._type !== 'block' || !block.children) {
        return ''
      }

      return block.children
        .map((child) => child.text?.trim() || '')
        .filter((text) => text.length > 0)
        .join('')
    })
    .filter((line) => line.length > 0)
    .join('\n')
    .trim()
}

function getGiftHamperDescription(hamper: GiftHamper) {
  const source = hamper.shortDescription && hamper.shortDescription.length > 0
    ? hamper.shortDescription
    : hamper.description

  const description = blocksToPlainText(source)
  const trimmed = description.slice(0, 140).trim()

  return trimmed.length > 0
    ? trimmed
    : 'Traditional Ukrainian gift hamper prepared fresh and packed carefully for UK delivery.'
}

function getCakeImage(cake: Cake): ImageSelection | null {
  if (cake.mainImage?.asset?._ref) {
    return {
      image: cake.mainImage as UrlForImage,
      alt: cake.mainImage.alt
    }
  }

  const standardDesigns = cake.designs?.standard ?? []
  const mainDesign = standardDesigns.find((image) => image.isMain && image.asset?._ref)

  if (mainDesign?.asset?._ref) {
    return {
      image: mainDesign as UrlForImage,
      alt: mainDesign.alt
    }
  }

  const firstDesign = standardDesigns.find((image) => image.asset?._ref)

  if (firstDesign?.asset?._ref) {
    return {
      image: firstDesign as UrlForImage,
      alt: firstDesign.alt
    }
  }

  return null
}

function getGiftHamperImage(hamper: GiftHamper): ImageSelection | null {
  const mainImage = hamper.images?.find((image) => image.isMain && image.asset?._ref)

  if (mainImage?.asset?._ref) {
    return {
      image: mainImage as UrlForImage,
      alt: mainImage.alt
    }
  }

  const firstImage = hamper.images?.find((image) => image.asset?._ref)

  if (firstImage?.asset?._ref) {
    return {
      image: firstImage as UrlForImage,
      alt: firstImage.alt
    }
  }

  return null
}

function mapCakeToTabletCake(cake: Cake): TabletCake {
  const image = getCakeImage(cake)
  const imageUrl = image ? urlFor(image.image).width(900).height(680).url() : '/images/placeholder-cake.jpg'
  const imageAlt = image?.alt?.trim() || `${cake.name} by Olgish Cakes`
  const collectionIds = (cake.collections ?? []).map((collection) => normalizeDocumentId(collection._id))

  return {
    id: cake._id,
    slug: cake.slug.current,
    href: `/cakes/${cake.slug.current}`,
    name: cake.name,
    description: getDescription(cake),
    price: cake.pricing?.standard ?? 0,
    imageUrl,
    imageAlt,
    isByPost: false,
    isCustom: true,
    isPopular: Boolean(cake.isBestseller),
    collectionIds,
    productType: 'cake'
  }
}

function mapGiftHamperToTabletCake(hamper: GiftHamper): TabletCake {
  const image = getGiftHamperImage(hamper)
  const imageUrl = image ? urlFor(image.image).width(900).height(680).url() : '/images/placeholder-cake.jpg'
  const imageAlt = image?.alt?.trim() || `${hamper.name} by Olgish Cakes`
  const collectionIds = (hamper.collections ?? []).map((collection) => normalizeDocumentId(collection._id))

  return {
    id: hamper._id,
    slug: hamper.slug.current,
    href: `/gift-hampers/${hamper.slug.current}`,
    name: hamper.name,
    description: getGiftHamperDescription(hamper),
    price: hamper.price ?? 0,
    imageUrl,
    imageAlt,
    isByPost: true,
    isCustom: false,
    isPopular: false,
    collectionIds,
    productType: 'giftHamper'
  }
}

function mapCollectionsToOptions(
  collections: HomepageCollection[],
  productType: 'cake' | 'giftHamper'
): CakesCollectionOption[] {
  const usedQueryValues = new Set<string>()

  return collections
    .map((collection) => {
      const label = collection.name.trim()

      if (label.length === 0) {
        return null
      }

      const normalizedId = normalizeDocumentId(collection._id)
      const baseQueryValue = createCollectionQueryValue(normalizedId, label, productType)
      const shortId = toShortDocumentId(normalizedId)
      let queryValue = baseQueryValue
      let suffix = 1

      while (usedQueryValues.has(queryValue)) {
        const duplicateSuffix = suffix === 1 ? shortId : `${shortId}-${suffix}`
        queryValue = `${baseQueryValue}-${duplicateSuffix}`
        suffix += 1
      }

      usedQueryValues.add(queryValue)

      return {
        id: normalizedId,
        queryValue,
        label,
        isFeatured: Boolean(collection.isFeatured),
        productType
      }
    })
    .filter((collection): collection is CakesCollectionOption => collection !== null)
}

export default async function CakesPage() {
  const [cakes, giftHampers, featuredOffer, cakeCollections, giftHamperCollections] = await Promise.all([
    getAllCakes(false),
    getAllGiftHampers(false),
    getCakesFeaturedOffer(false),
    getHomepageCollections(),
    getHomepageGiftHamperCollections()
  ])

  const mappedCakes = cakes.map((cake) => mapCakeToTabletCake(cake))
  const mappedGiftHampers = giftHampers.map((hamper) => mapGiftHamperToTabletCake(hamper))
  const catalogItems = [...mappedCakes, ...mappedGiftHampers]
  const cakesForUi = catalogItems.length > 0 ? catalogItems : fallbackCakes
  const collectionOptions = [
    ...mapCollectionsToOptions(cakeCollections, 'cake'),
    ...mapCollectionsToOptions(giftHamperCollections, 'giftHamper')
  ]

  const localBusinessData = {
    '@context': 'https://schema.org',
    '@type': 'Bakery',
    name: 'Olgish Cakes',
    description:
      'Authentic traditional Ukrainian cakes made with love in Leeds. Specialising in Ukrainian birthday cakes, wedding cakes, and traditional honey cake (Medovik).',
    image: 'https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png',
    url: 'https://olgishcakes.co.uk',
    telephone: '+44 786 721 8194',
    email: 'hello@olgishcakes.co.uk',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Allerton Grange',
      addressLocality: 'Leeds',
      postalCode: 'LS17',
      addressCountry: 'GB'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '53.8008',
      longitude: '-1.5491'
    },
    openingHours: 'Mo-Su 00:00-23:59',
    priceRange: '££',
    servesCuisine: 'Ukrainian',
    hasMenu: 'https://olgishcakes.co.uk/cakes',
    mainEntityOfPage: {
      '@id': 'https://olgishcakes.co.uk/#organization'
    }
  }

  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://olgishcakes.co.uk/'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Cakes',
        item: 'https://olgishcakes.co.uk/cakes'
      }
    ]
  }

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessData) }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      <main className='min-h-screen bg-base-100 [font-family:var(--font-inter)]'>
        <section className='mx-auto w-full max-w-[952px] px-4 pb-2 pt-8 tablet:px-0'>
          <h1 className='mt-2 !mb-0 font-moreSugar font-normal text-center text-[24px] uppercase tracking-[0.16em] text-primary-700 rotate-[-2.4deg] !leading-[40px] align-middle tablet:text-[48px] tablet:!leading-[56px] tablet:font-normal tablet:align-middle small-laptop:!leading-[64px]'>
            Traditional Ukrainian cakes by post and custom cakes in Leeds
          </h1>
          <p className='mt-3 max-w-3xl text-base leading-7 text-base-content/80'>
            Browse handmade Ukrainian cakes prepared in Leeds with traditional recipes, quality ingredients and flavours that
            feel like home.
          </p>
        </section>
        <CakesTabletCatalog
          cakes={cakesForUi}
          featuredOffer={featuredOffer}
          collectionOptions={collectionOptions}
        />
        <section className='mx-auto w-full max-w-[952px] px-4 pb-16 pt-2 tablet:px-0'>
          <h2 className='text-3xl font-semibold leading-tight text-base-content tablet:text-4xl'>
            Authentic Ukrainian cakes in Leeds, baked fresh to order
          </h2>
          <p className='mt-4 text-base leading-8 text-base-content/82'>
            I bake traditional Ukrainian cakes in Leeds for birthdays, weddings, anniversaries and family gatherings. Every
            order is prepared in small batches, so each cake gets the time and attention it needs. If you are looking for
            authentic Medovik, classic Kyiv cake or a custom design for a special day, you can choose from ready options in
            the catalogue or request a bespoke decoration. I use quality ingredients, balanced sweetness and careful layering
            so the flavour is rich but never heavy. Many customers tell me this style reminds them of cakes they grew up with
            in Ukraine, while others discover these recipes for the first time and come back for the same taste again.
          </p>
          <p className='mt-4 text-base leading-8 text-base-content/82'>
            Cakes by post are available for selected options, and custom cakes are available for local celebrations around
            Leeds. You can filter the catalogue by price, cake type and collection, then open each cake page to see more
            details. Each product card links to a dedicated page where search engines and customers can find focused
            information about flavour, texture and serving ideas. This helps you compare quickly and helps the site keep
            strong internal relevance for terms like Ukrainian honey cake, Kyiv cake and custom birthday cake in Leeds.
            Where possible, I include clear photos and practical descriptions so you can order confidently for your date.
          </p>
          <p className='mt-4 text-base leading-8 text-base-content/82'>
            If you need a custom celebration cake, share the occasion, number of servings and preferred design style, and I
            will suggest options that match your event. For traditional cakes, I keep the flavour profile close to Ukrainian
            classics while adapting decoration and delivery to what works best in England. This page is designed to help you
            discover the right cake quickly, but the final result is always personal: fresh baking, careful finishing and a
            cake that looks beautiful on the table and tastes even better when shared.
          </p>
        </section>
      </main>
    </>
  )
}
