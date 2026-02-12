import type { CakesFeaturedOffer } from '@/types/cakeFeaturedOffer'

export interface CakesFeatureFilters {
  onlyFreeHoney: boolean
  onlyChristmas: boolean
  onlyBirthday: boolean
}

export interface CakesFilterState {
  showByPost: boolean
  showCustom: boolean
  maxPrice: number
  features: CakesFeatureFilters
}

export interface TabletCake {
  id: string
  slug: string
  name: string
  description: string
  price: number
  imageUrl: string
  imageAlt: string
  isByPost: boolean
  isCustom: boolean
  isPopular: boolean
  tags: {
    freeHoney: boolean
    christmas: boolean
    birthday: boolean
  }
}

export type CakesFeaturedOfferData = CakesFeaturedOffer

export type CakesSortOption = 'new' | 'popular' | 'priceHighToLow' | 'priceLowToHigh'
