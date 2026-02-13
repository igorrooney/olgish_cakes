'use client'

import { useCallback, useEffect, useMemo } from 'react'
import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates
} from 'nuqs'
import { CakesFeaturedOffer } from './CakesFeaturedOffer'
import { CakesFilterSidebar } from './CakesFilterSidebar'
import { CakesProductCard } from './CakesProductCard'
import { CakesSortBar } from './CakesSortBar'
import { CakesCollectionOption, CakesFeaturedOfferData, CakesFilterState, CakesSortOption, TabletCake } from './types'

interface CakesTabletCatalogProps {
  cakes: TabletCake[]
  featuredOffer: CakesFeaturedOfferData | null
  collectionOptions: CakesCollectionOption[]
}

function getPriceCeiling(cakes: TabletCake[]) {
  if (cakes.length === 0) {
    return 0
  }

  return Math.ceil(Math.max(...cakes.map((cake) => cake.price)))
}

const sortOptions = ['new', 'popular', 'priceHighToLow', 'priceLowToHigh'] as const

const queryParsers = {
  sort: parseAsStringLiteral(sortOptions).withDefault('new'),
  byPost: parseAsBoolean.withDefault(false),
  custom: parseAsBoolean.withDefault(true),
  maxPrice: parseAsInteger,
  collections: parseAsArrayOf(parseAsString).withDefault([])
}

export function CakesTabletCatalog({ cakes, featuredOffer, collectionOptions }: CakesTabletCatalogProps) {
  const priceCeiling = useMemo(() => getPriceCeiling(cakes), [cakes])
  const [queryState, setQueryState] = useQueryStates(queryParsers, {
    history: 'replace'
  })

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)

    if (!searchParams.has('collections')) {
      return
    }

    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0

    const isJSDOM = typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)

    if (isJSDOM || typeof window.scrollTo !== 'function') {
      return
    }

    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    } catch {
      // Ignore environments that do not implement window scrolling (for example, JSDOM).
    }
  }, [])

  const collectionIdSet = useMemo(
    () => new Set(collectionOptions.map((option) => option.id)),
    [collectionOptions]
  )
  const collectionIdByQueryValue = useMemo(() => {
    const entries = collectionOptions.flatMap((option) => {
      const aliasEntries = option.legacyQueryValues.map((value) => [value, option.id] as const)
      return [[option.queryValue, option.id] as const, ...aliasEntries]
    })

    return new Map<string, string>(entries)
  }, [collectionOptions])
  const collectionQueryValueById = useMemo(() => {
    return new Map(
      collectionOptions.map((option) => [option.id, option.queryValue] as const)
    )
  }, [collectionOptions])
  const selectedCollectionValues = useMemo(
    () => queryState.collections.filter((value) => collectionIdByQueryValue.has(value)),
    [collectionIdByQueryValue, queryState.collections]
  )
  const selectedCollectionIds = useMemo(() => {
    const collectionIds = selectedCollectionValues
      .map((value) => collectionIdByQueryValue.get(value))
      .filter((value): value is string => value !== undefined)

    return Array.from(new Set(collectionIds)).filter((collectionId) => collectionIdSet.has(collectionId))
  }, [collectionIdByQueryValue, collectionIdSet, selectedCollectionValues])
  const maxPrice = useMemo(() => {
    if (queryState.maxPrice === null) {
      return priceCeiling
    }

    if (queryState.maxPrice < 0) {
      return 0
    }

    if (queryState.maxPrice > priceCeiling) {
      return priceCeiling
    }

    return queryState.maxPrice
  }, [priceCeiling, queryState.maxPrice])
  const selectedSort = queryState.sort
  const filters = useMemo<CakesFilterState>(() => {
    return {
      showByPost: queryState.byPost,
      showCustom: queryState.custom,
      maxPrice,
      selectedCollectionIds
    }
  }, [maxPrice, queryState.byPost, queryState.custom, selectedCollectionIds])

  const handleToggleByPost = useCallback((checked: boolean) => {
    void setQueryState({
      byPost: checked,
      collections: []
    })
  }, [setQueryState])

  const handleToggleCustom = useCallback((checked: boolean) => {
    void setQueryState({
      custom: checked,
      collections: []
    })
  }, [setQueryState])

  const handlePriceChange = useCallback((price: number) => {
    const clampedPrice = Math.min(Math.max(price, 0), priceCeiling)
    void setQueryState({ maxPrice: clampedPrice })
  }, [priceCeiling, setQueryState])

  const handleToggleCollection = useCallback((collectionId: string, checked: boolean) => {
    const queryValue = collectionQueryValueById.get(collectionId)

    if (!queryValue) {
      return
    }

    const nextCollectionValues = checked
      ? Array.from(
        new Set([
          ...selectedCollectionValues.filter((value) => collectionIdByQueryValue.get(value) !== collectionId),
          queryValue
        ])
      )
      : selectedCollectionValues.filter((value) => collectionIdByQueryValue.get(value) !== collectionId)

    void setQueryState({ collections: nextCollectionValues })
  }, [collectionIdByQueryValue, collectionQueryValueById, selectedCollectionValues, setQueryState])

  const handleReset = useCallback(() => {
    void setQueryState({
      sort: null,
      byPost: null,
      custom: null,
      maxPrice: null,
      collections: null
    })
  }, [setQueryState])

  const handleSortChange = useCallback((option: CakesSortOption) => {
    void setQueryState({ sort: option })
  }, [setQueryState])

  const filteredCakes = useMemo(() => {
    const isCategoryVisible = (cake: TabletCake) => {
      const hasCategoryFilter = filters.showByPost || filters.showCustom

      if (!hasCategoryFilter) {
        return true
      }

      const matchesByPost = filters.showByPost && cake.productType === 'giftHamper'
      const matchesCustom = filters.showCustom && cake.productType === 'cake'

      return matchesByPost || matchesCustom
    }

    const withCategories = cakes.filter((cake) => isCategoryVisible(cake))

    const withPrice = withCategories.filter((cake) => cake.price <= filters.maxPrice)

    const withCollections = withPrice.filter((cake) => {
      if (filters.selectedCollectionIds.length === 0) {
        return true
      }

      return cake.collectionIds.some((collectionId) => filters.selectedCollectionIds.includes(collectionId))
    })

    const cakesCopy = [...withCollections]

    if (selectedSort === 'popular') {
      return cakesCopy.sort((firstCake, secondCake) => {
        return Number(secondCake.isPopular) - Number(firstCake.isPopular)
      })
    }

    if (selectedSort === 'priceHighToLow') {
      return cakesCopy.sort((firstCake, secondCake) => secondCake.price - firstCake.price)
    }

    if (selectedSort === 'priceLowToHigh') {
      return cakesCopy.sort((firstCake, secondCake) => firstCake.price - secondCake.price)
    }

    return cakesCopy
  }, [cakes, filters, selectedSort])

  return (
    <section className='mx-auto w-full max-w-[952px] px-4 pb-16 pt-8 tablet:px-0'>
      {featuredOffer && <CakesFeaturedOffer featuredOffer={featuredOffer} />}

      <div className='mt-10 flex flex-col gap-5 tablet:gap-6 tablet:flex-row tablet:items-start'>
        <div className='tablet:w-60 tablet:flex-none'>
          <CakesFilterSidebar
            filters={filters}
            priceMax={priceCeiling}
            collectionOptions={collectionOptions}
            onToggleByPost={handleToggleByPost}
            onToggleCustom={handleToggleCustom}
            onPriceChange={handlePriceChange}
            onToggleCollection={handleToggleCollection}
            onReset={handleReset}
          />
        </div>

        <div className='min-w-0 tablet:flex-1'>
          <CakesSortBar selectedSort={selectedSort} onSelectSort={handleSortChange} />
          {filteredCakes.length > 0 ? (
            <div className='mt-4 grid grid-cols-1 gap-4 tablet:grid-cols-2'>
              {filteredCakes.map((cake) => (
                <CakesProductCard key={cake.id} cake={cake} />
              ))}
            </div>
          ) : (
            <div className='mt-6 rounded-box border border-dashed border-base-300 bg-base-100 p-10 text-center'>
              <p className='text-base text-base-content/70'>No cakes match the selected filters yet.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
