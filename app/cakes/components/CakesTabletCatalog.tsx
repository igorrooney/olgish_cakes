'use client'

import { useMemo, useState } from 'react'
import { CakesFeaturedOffer } from './CakesFeaturedOffer'
import { CakesFilterSidebar } from './CakesFilterSidebar'
import { CakesProductCard } from './CakesProductCard'
import { CakesSortBar } from './CakesSortBar'
import { CakesFeaturedOfferData, CakesFilterState, CakesSortOption, TabletCake } from './types'

interface CakesTabletCatalogProps {
  cakes: TabletCake[]
  featuredOffer: CakesFeaturedOfferData | null
}

function getPriceCeiling(cakes: TabletCake[]) {
  if (cakes.length === 0) {
    return 0
  }

  return Math.ceil(Math.max(...cakes.map((cake) => cake.price)))
}

function createInitialFilters(maxPrice: number): CakesFilterState {
  return {
    showByPost: true,
    showCustom: true,
    maxPrice,
    features: {
      onlyFreeHoney: false,
      onlyChristmas: false,
      onlyBirthday: false
    }
  }
}

export function CakesTabletCatalog({ cakes, featuredOffer }: CakesTabletCatalogProps) {
  const [selectedSort, setSelectedSort] = useState<CakesSortOption>('new')
  const priceCeiling = useMemo(() => getPriceCeiling(cakes), [cakes])
  const [filters, setFilters] = useState<CakesFilterState>(() => createInitialFilters(priceCeiling))

  const filteredCakes = useMemo(() => {
    const isCategoryVisible = (cake: TabletCake) => {
      const matchesByPost = filters.showByPost && cake.isByPost
      const matchesCustom = filters.showCustom && cake.isCustom

      return matchesByPost || matchesCustom
    }

    const withCategories = cakes.filter((cake) => isCategoryVisible(cake))

    const withPrice = withCategories.filter((cake) => cake.price <= filters.maxPrice)

    const withFeatures = withPrice.filter((cake) => {
      if (filters.features.onlyFreeHoney && !cake.tags.freeHoney) {
        return false
      }

      if (filters.features.onlyChristmas && !cake.tags.christmas) {
        return false
      }

      if (filters.features.onlyBirthday && !cake.tags.birthday) {
        return false
      }

      return true
    })

    const cakesCopy = [...withFeatures]

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

      <div className='mt-10 grid grid-cols-1 gap-5 tablet:grid-cols-[228px_minmax(0,1fr)]'>
        <CakesFilterSidebar
          filters={filters}
          priceMax={priceCeiling}
          onToggleByPost={() => setFilters((previous) => ({ ...previous, showByPost: !previous.showByPost }))}
          onToggleCustom={() => setFilters((previous) => ({ ...previous, showCustom: !previous.showCustom }))}
          onPriceChange={(price) => setFilters((previous) => ({ ...previous, maxPrice: price }))}
          onToggleFreeHoney={() =>
            setFilters((previous) => ({
              ...previous,
              features: { ...previous.features, onlyFreeHoney: !previous.features.onlyFreeHoney }
            }))
          }
          onToggleChristmas={() =>
            setFilters((previous) => ({
              ...previous,
              features: { ...previous.features, onlyChristmas: !previous.features.onlyChristmas }
            }))
          }
          onToggleBirthday={() =>
            setFilters((previous) => ({
              ...previous,
              features: { ...previous.features, onlyBirthday: !previous.features.onlyBirthday }
            }))
          }
          onReset={() => setFilters(createInitialFilters(priceCeiling))}
        />

        <div>
          <CakesSortBar selectedSort={selectedSort} onSelectSort={setSelectedSort} />
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
