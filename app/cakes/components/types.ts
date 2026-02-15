import type { CakesFeaturedOffer } from '@/types/cakeFeaturedOffer'

export interface CakesFilterState {
  showByPost: boolean
  showCustom: boolean
  maxPrice: number
  selectedCollectionIds: string[]
}

export interface CakesCollectionOption {
  id: string
  queryValue: string
  legacyQueryValues: string[]
  label: string
  isFeatured: boolean
  productType: 'cake' | 'giftHamper'
}

export interface TabletCake {
  id: string
  slug: string
  href: string
  name: string
  description: string
  price: number
  imageUrl: string
  imageAlt: string
  isByPost: boolean
  isCustom: boolean
  isPopular: boolean
  collectionIds: string[]
  productType: 'cake' | 'giftHamper'
}

export type CakesFeaturedOfferData = CakesFeaturedOffer

export interface CatalogFilterDefaults {
  byPost: boolean
  custom: boolean
}

export interface CakesTabletCatalogProps {
  cakes: TabletCake[]
  featuredOffer: CakesFeaturedOfferData | null
  collectionOptions: CakesCollectionOption[]
  initialFilterDefaults: CatalogFilterDefaults
  lazyCustomCakesEndpoint?: string
  lazyCustomCakesPriceCeilingHint?: number
  lazyByPostCakesEndpoint?: string
  lazyByPostCakesPriceCeilingHint?: number
}

export type CakesSortOption = 'new' | 'priceHighToLow' | 'priceLowToHigh'
