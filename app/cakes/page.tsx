import { Metadata } from 'next'
import { urlFor } from '@/sanity/lib/image'
import { Cake, blocksToText } from '@/types/cake'
import { getAllCakes, getCakesFeaturedOffer } from '../utils/fetchCakes'
import { CakesTabletCatalog } from './components/CakesTabletCatalog'
import { TabletCake } from './components/types'

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
    slug: 'honey-cake',
    name: 'Honey Cake',
    description: 'Traditional layered Medovik with delicate cream and light honey sweetness.',
    price: 35,
    imageUrl: '/images/honey-cake-medovik.jpg',
    imageAlt: 'Traditional Ukrainian honey cake',
    isByPost: true,
    isCustom: false,
    isPopular: true,
    tags: {
      freeHoney: true,
      christmas: false,
      birthday: false
    }
  },
  {
    id: 'fallback-birthday',
    slug: 'birthday-cake',
    name: 'Birthday Celebration Cake',
    description: 'Custom birthday cake made to order with seasonal decoration and rich sponge.',
    price: 65,
    imageUrl: '/images/placeholder-cake.jpg',
    imageAlt: 'Custom birthday cake',
    isByPost: false,
    isCustom: true,
    isPopular: true,
    tags: {
      freeHoney: false,
      christmas: false,
      birthday: true
    }
  },
  {
    id: 'fallback-christmas',
    slug: 'christmas-cake',
    name: 'Christmas Cake',
    description: 'Festive design with winter flavours, handcrafted for holiday celebrations.',
    price: 58,
    imageUrl: '/images/placeholder-cake.jpg',
    imageAlt: 'Christmas design cake',
    isByPost: true,
    isCustom: true,
    isPopular: false,
    tags: {
      freeHoney: false,
      christmas: true,
      birthday: false
    }
  },
  {
    id: 'fallback-kyiv',
    slug: 'kyiv-cake',
    name: 'Kyiv Cake',
    description: 'Classic Kyiv cake with meringue layers, hazelnuts and chocolate cream.',
    price: 42,
    imageUrl: '/images/placeholder-cake.jpg',
    imageAlt: 'Classic Kyiv cake',
    isByPost: true,
    isCustom: false,
    isPopular: true,
    tags: {
      freeHoney: false,
      christmas: false,
      birthday: false
    }
  }
]

type UrlForImage = Parameters<typeof urlFor>[0]

interface CakeImageSelection {
  image: UrlForImage
  alt?: string
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

function getImage(cake: Cake): CakeImageSelection | null {
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

function mapCakeToTabletCake(cake: Cake): TabletCake {
  const searchable = `${cake.name} ${cake.category}`.toLowerCase()
  const image = getImage(cake)
  const imageUrl = image ? urlFor(image.image).width(900).height(680).url() : '/images/placeholder-cake.jpg'
  const imageAlt = image?.alt?.trim() || `${cake.name} by Olgish Cakes`
  const isCustom = /custom|birthday|wedding|anniversary|baby shower|corporate/.test(searchable)
  const isByPost = !isCustom || /post|honey|medovik|ukrainian|kyiv/.test(searchable)

  return {
    id: cake._id,
    slug: cake.slug.current,
    name: cake.name,
    description: getDescription(cake),
    price: cake.pricing?.standard ?? 0,
    imageUrl,
    imageAlt,
    isByPost,
    isCustom,
    isPopular: Boolean(cake.isBestseller),
    tags: {
      freeHoney: /honey|medovik/.test(searchable),
      christmas: /christmas|xmas/.test(searchable),
      birthday: /birthday/.test(searchable)
    }
  }
}

export default async function CakesPage() {
  const [cakes, featuredOffer] = await Promise.all([
    getAllCakes(false),
    getCakesFeaturedOffer(false)
  ])

  const mappedCakes = cakes.map((cake) => mapCakeToTabletCake(cake))
  const cakesForUi = mappedCakes.length > 0 ? mappedCakes : fallbackCakes

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
          <h1 className='text-4xl font-semibold leading-tight text-base-content tablet:text-5xl'>
            Traditional Ukrainian cakes by post and custom cakes in Leeds
          </h1>
          <p className='mt-3 max-w-3xl text-base leading-7 text-base-content/80'>
            Browse handmade Ukrainian cakes prepared in Leeds with traditional recipes, quality ingredients and flavours that
            feel like home.
          </p>
        </section>
        <CakesTabletCatalog cakes={cakesForUi} featuredOffer={featuredOffer} />
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
            Leeds. You can filter the catalogue by price, style and seasonal features, then open each cake page to see more
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
