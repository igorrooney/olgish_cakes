import { urlFor } from '@/sanity/lib/image'
import type { GiftHamper } from '@/types/giftHamper'
import { Cake, blocksToText } from '@/types/cake'
import { getAllCakes, getCakesFeaturedOffer } from '../utils/fetchCakes'
import { getAllGiftHampers } from '../utils/fetchGiftHampers'
import { getHomepageCollections, getHomepageGiftHamperCollections } from '../utils/fetchCollections'
import type { HomepageCollection } from '../types/collection'
import {
  createCollectionIdByQueryValueMap,
  createCollectionQueryValueMap,
  normalizeDocumentId
} from '../utils/collectionQueryValue'
import type { CakesCollectionOption, CakesFeaturedOfferData, TabletCake } from './components/types'
import { resolveCakeBasePrice } from '@/lib/utils/cake-base-price'

type UrlForImage = Parameters<typeof urlFor>[0]
type RichTextBlockLike = {
  _type?: string
  children?: Array<{ text?: string }>
}

interface ImageSelection {
  image: UrlForImage
  alt?: string
}

export interface CatalogPageData {
  cakesForUi: TabletCake[]
  mappedGiftHampers: TabletCake[]
  collectionOptions: CakesCollectionOption[]
  featuredOffer: CakesFeaturedOfferData | null
}

export type CatalogPageVariant = 'cakes' | 'giftHampers'

export interface CatalogCustomCakesData {
  cakes: TabletCake[]
  collectionOptions: CakesCollectionOption[]
}

export interface CatalogByPostCakesData {
  cakes: TabletCake[]
  collectionOptions: CakesCollectionOption[]
}

function getTabletCakesPriceCeiling(cakes: TabletCake[]) {
  if (cakes.length === 0) {
    return 0
  }

  return Math.ceil(Math.max(...cakes.map((cake) => cake.price)))
}

const fallbackCakes: TabletCake[] = [
  {
    id: 'fallback-honey',
    slug: 'cake-by-post',
    href: '/cakes-by-post/cake-by-post',
    navigationTarget: 'product',
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
    slug: 'birthday-cakes',
    href: '/birthday-cakes',
    navigationTarget: 'landing',
    name: 'Birthday cakes in Leeds',
    description: 'Explore handmade birthday cake ideas and send a brief for a custom quote that fits your celebration.',
    price: 65,
    imageUrl: '/images/placeholder-cake.jpg',
    imageAlt: 'Birthday cake inspiration from Olgish Cakes',
    isByPost: false,
    isCustom: true,
    isPopular: true,
    collectionIds: [],
    productType: 'cake'
  },
  {
    id: 'fallback-christmas',
    slug: 'christmas-cakes-leeds',
    href: '/christmas-cakes-leeds',
    navigationTarget: 'landing',
    name: 'Christmas cakes in Leeds',
    description: 'Browse festive cake ideas for Christmas tables, gifting, and winter celebrations before requesting a quote.',
    price: 58,
    imageUrl: '/images/placeholder-cake.jpg',
    imageAlt: 'Christmas cake inspiration from Olgish Cakes',
    isByPost: false,
    isCustom: true,
    isPopular: false,
    collectionIds: [],
    productType: 'cake'
  },
  {
    id: 'fallback-kyiv',
    slug: 'ukrainian-cake',
    href: '/ukrainian-cake',
    navigationTarget: 'landing',
    name: 'Traditional Ukrainian cakes',
    description: 'See the signature Ukrainian cake styles, flavours, and story behind the bakes before choosing your direction.',
    price: 42,
    imageUrl: '/images/placeholder-cake.jpg',
    imageAlt: 'Traditional Ukrainian cake inspiration from Olgish Cakes',
    isByPost: false,
    isCustom: true,
    isPopular: true,
    collectionIds: [],
    productType: 'cake'
  }
]

const fallbackCustomCakes = fallbackCakes.filter((cake) => cake.productType === 'cake')

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
  const imageUrl = image ? urlFor(image.image).width(900).height(900).url() : '/images/placeholder-cake.jpg'
  const imageAlt = image?.alt?.trim() || `${cake.name} by Olgish Cakes`
  const collectionIds = (cake.collections ?? []).map((collection) => normalizeDocumentId(collection._id))
  const basePrice = resolveCakeBasePrice({
    newDesignPricingByServings: cake.newDesignPricingByServings,
    pricing: cake.pricing
  })

  return {
    id: cake._id,
    slug: cake.slug.current,
    href: `/cakes/${cake.slug.current}`,
    navigationTarget: 'product',
    name: cake.name,
    description: getDescription(cake),
    price: basePrice,
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
  const imageUrl = image ? urlFor(image.image).width(900).height(900).url() : '/images/placeholder-cake.jpg'
  const imageAlt = image?.alt?.trim() || `${hamper.name} by Olgish Cakes`
  const collectionIds = (hamper.collections ?? []).map((collection) => normalizeDocumentId(collection._id))

  return {
    id: hamper._id,
    slug: hamper.slug.current,
    href: `/cakes-by-post/${hamper.slug.current}`,
    navigationTarget: 'product',
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
  const queryValueById = createCollectionQueryValueMap(collections, productType)
  const collectionIdByQueryValue = createCollectionIdByQueryValueMap(collections, productType)
  const aliasesByCollectionId = new Map<string, string[]>()

  collectionIdByQueryValue.forEach((collectionId, queryValue) => {
    const existingAliases = aliasesByCollectionId.get(collectionId) ?? []
    if (existingAliases.includes(queryValue)) {
      return
    }

    aliasesByCollectionId.set(collectionId, [...existingAliases, queryValue])
  })

  return collections
    .map((collection) => {
      const label = collection.name.trim()

      if (label.length === 0) {
        return null
      }

      const normalizedId = normalizeDocumentId(collection._id)
      const queryValue = queryValueById.get(normalizedId)

      if (!queryValue) {
        return null
      }

      const legacyQueryValues = (aliasesByCollectionId.get(normalizedId) ?? [])
        .filter((value) => value !== queryValue)

      return {
        id: normalizedId,
        queryValue,
        legacyQueryValues,
        label,
        isFeatured: Boolean(collection.isFeatured),
        productType
      }
    })
    .filter((collection): collection is CakesCollectionOption => collection !== null)
}

export async function getCatalogCustomCakesData(): Promise<CatalogCustomCakesData> {
  const [cakes, cakeCollections] = await Promise.all([
    getAllCakes(false),
    getHomepageCollections()
  ])

  const mappedCakes = cakes.map((cake) => mapCakeToTabletCake(cake))
  const collectionOptions = mapCollectionsToOptions(cakeCollections, 'cake')

  return {
    cakes: mappedCakes.length > 0 ? mappedCakes : fallbackCustomCakes,
    collectionOptions
  }
}

export async function getCatalogCustomCakesPriceCeiling(): Promise<number> {
  const cakes = await getAllCakes(false)
  const mappedCakes = cakes.map((cake) => mapCakeToTabletCake(cake))
  const resolvedCakes = mappedCakes.length > 0 ? mappedCakes : fallbackCustomCakes

  return getTabletCakesPriceCeiling(resolvedCakes)
}

export async function getCatalogByPostCakesData(): Promise<CatalogByPostCakesData> {
  const [giftHampers, giftHamperCollections] = await Promise.all([
    getAllGiftHampers(false),
    getHomepageGiftHamperCollections()
  ])

  const mappedGiftHampers = giftHampers.map((hamper) => mapGiftHamperToTabletCake(hamper))
  const collectionOptions = mapCollectionsToOptions(giftHamperCollections, 'giftHamper')

  return {
    cakes: mappedGiftHampers,
    collectionOptions
  }
}

export async function getCatalogByPostCakesPriceCeiling(): Promise<number> {
  const giftHampers = await getAllGiftHampers(false)
  const mappedGiftHampers = giftHampers.map((hamper) => mapGiftHamperToTabletCake(hamper))

  return getTabletCakesPriceCeiling(mappedGiftHampers)
}

export async function getCatalogPageData(variant: CatalogPageVariant): Promise<CatalogPageData> {
  if (variant === 'giftHampers') {
    const [giftHampers, giftHamperCollections] = await Promise.all([
      getAllGiftHampers(false),
      getHomepageGiftHamperCollections()
    ])

    const mappedGiftHampers = giftHampers.map((hamper) => mapGiftHamperToTabletCake(hamper))
    const collectionOptions = mapCollectionsToOptions(giftHamperCollections, 'giftHamper')

    return {
      cakesForUi: mappedGiftHampers,
      mappedGiftHampers,
      collectionOptions,
      featuredOffer: null
    }
  }

  const [cakes, featuredOffer, cakeCollections] = await Promise.all([
    getAllCakes(false),
    getCakesFeaturedOffer(false),
    getHomepageCollections()
  ])

  const mappedCakes = cakes.map((cake) => mapCakeToTabletCake(cake))
  const cakesForUi = mappedCakes.length > 0 ? mappedCakes : fallbackCustomCakes
  const collectionOptions = mapCollectionsToOptions(cakeCollections, 'cake')

  return {
    cakesForUi,
    mappedGiftHampers: [],
    collectionOptions,
    featuredOffer
  }
}
