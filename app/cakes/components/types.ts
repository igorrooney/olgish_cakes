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
  navigationTarget: 'product' | 'landing'
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

export type CatalogMode = 'all-cakes' | 'category-landing'
export type CatalogInitialViewport = 'desktop' | 'mobile'

export interface CatalogInitialDataCompleteness {
  custom: boolean
  byPost: boolean
}

export interface CakesTabletCatalogProps {
  cakes: TabletCake[]
  featuredOffer: CakesFeaturedOfferData | null
  collectionOptions: CakesCollectionOption[]
  initialFilterDefaults: CatalogFilterDefaults
  initialDataCompleteness?: CatalogInitialDataCompleteness
  lazyCustomCakesEndpoint?: string
  lazyCustomCakesPriceCeilingHint?: number
  lazyByPostCakesEndpoint?: string
  lazyByPostCakesPriceCeilingHint?: number
  catalogMode?: CatalogMode
  lockedCollectionQueryValues?: string[]
  showProductTypeFilters?: boolean
  showDesktopFilters?: boolean
  showMobileFilterSheet?: boolean
  showPriceFilter?: boolean
  showCollectionFilters?: boolean
  mobileToolbarVariant?: 'full' | 'inline-compact'
  initialViewport?: CatalogInitialViewport
}

export type CakesSortOption = 'new' | 'priceHighToLow' | 'priceLowToHigh'
