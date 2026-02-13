'use client'

import { useEffect, useMemo, useState } from 'react'
import { CakesCollectionOption, CakesFilterState } from './types'

interface CakesFilterSidebarProps {
  filters: CakesFilterState
  priceMax: number
  collectionOptions: CakesCollectionOption[]
  onToggleByPost: (checked: boolean) => void
  onToggleCustom: (checked: boolean) => void
  onPriceChange: (price: number) => void
  onToggleCollection: (collectionId: string, checked: boolean) => void
  onReset: () => void
}

const sectionHeadingClassName = 'mb-1 text-base leading-[1.4] font-normal text-base-content'
const seeMoreButtonClassName = 'btn btn-ghost btn-sm h-auto min-h-0 border-transparent bg-transparent px-0 py-0 text-base font-normal normal-case leading-none text-base-content shadow-none hover:border-transparent hover:bg-transparent hover:shadow-none focus:border-transparent focus:bg-transparent focus:!outline-none focus:!shadow-none focus-visible:border-transparent focus-visible:bg-transparent focus-visible:!outline-none focus-visible:!shadow-none tablet:[font-family:var(--t-font-family-theme-primary)] tablet:[font-weight:300] tablet:[font-style:normal] tablet:[font-size:var(--t-font-size-sm)] tablet:[leading-trim:none] tablet:[line-height:140%] tablet:[letter-spacing:0]'

function FilterCheckbox({
  checked,
  label,
  helperText,
  onChange
}: {
  checked: boolean
  label: string
  helperText?: string
  onChange: (checked: boolean) => void
}) {
  return (
    <label className='label flex w-full cursor-pointer items-start justify-start gap-2 p-0 py-1'>
      <input
        type='checkbox'
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className='m-0 mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded-[4px] border border-base-content/45 bg-base-100 accent-primary'
      />
      <span className='text-base leading-[1.4] text-base-content'>
        <span className='block font-normal'>
          {label}
        </span>
        {helperText ? (
          <span className='mt-0.5 block text-base leading-[1.4] text-base-content/60'>
            {helperText}
          </span>
        ) : null}
      </span>
    </label>
  )
}

export function CakesFilterSidebar({
  filters,
  priceMax,
  collectionOptions,
  onToggleByPost,
  onToggleCustom,
  onPriceChange,
  onToggleCollection,
  onReset
}: CakesFilterSidebarProps) {
  const [showAllCollections, setShowAllCollections] = useState(false)
  const activeCollectionOptions = useMemo(() => {
    const onlyByPost = filters.showByPost && !filters.showCustom
    const onlyCustom = filters.showCustom && !filters.showByPost

    if (onlyByPost) {
      return collectionOptions.filter((option) => option.productType === 'giftHamper')
    }

    if (onlyCustom) {
      return collectionOptions.filter((option) => option.productType === 'cake')
    }

    return collectionOptions
  }, [collectionOptions, filters.showByPost, filters.showCustom])

  const featuredCollectionOptions = activeCollectionOptions.filter((option) => option.isFeatured)
  const nonFeaturedCollectionOptions = activeCollectionOptions.filter((option) => !option.isFeatured)
  const selectedCollectionIds = useMemo(
    () => new Set(filters.selectedCollectionIds),
    [filters.selectedCollectionIds]
  )

  useEffect(() => {
    setShowAllCollections(false)
  }, [filters.showByPost, filters.showCustom])

  const visibleCollectionOptions = showAllCollections
    ? nonFeaturedCollectionOptions
    : nonFeaturedCollectionOptions.slice(0, 3)

  function resetAllFilters() {
    onReset()
    setShowAllCollections(false)
  }

  return (
    <aside className='card h-fit border border-[#D9D9D9] bg-[var(--color-featured-offer)] shadow-none tablet:w-60 tablet:max-w-60'>
      <div className='card-body gap-0 p-4'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='m-0 text-base font-normal leading-[1.4] text-base-content'>Filter by</h2>
          <button
            type='button'
            onClick={resetAllFilters}
            className='btn btn-ghost btn-sm h-auto min-h-0 border-transparent px-0 py-0 text-base font-normal normal-case leading-none text-base-content shadow-none hover:border-transparent hover:bg-transparent hover:shadow-none focus:border-transparent focus:!outline-none focus:!shadow-none focus-visible:border-transparent focus-visible:!outline-none focus-visible:!shadow-none'
          >
            Reset
          </button>
        </div>

        <div className='space-y-1'>
          <FilterCheckbox
            checked={filters.showByPost}
            label='Cakes by post'
            helperText='Delivered nationwide'
            onChange={onToggleByPost}
          />
          <FilterCheckbox
            checked={filters.showCustom}
            label='Custom cakes'
            helperText='Made to order'
            onChange={onToggleCustom}
          />
        </div>

        <div className='mt-6'>
          <div className='mb-2 flex items-center justify-between text-base leading-[1.4] text-base-content'>
            <span>Price</span>
            <span>{`\u00A30-${filters.maxPrice}`}</span>
          </div>
          <div className='mt-1'>
            <input
              type='range'
              min={0}
              max={priceMax}
              value={filters.maxPrice}
              onChange={(event) => onPriceChange(Number(event.target.value))}
              className='range range-primary range-xs'
              aria-label='Price range'
            />
          </div>
        </div>

        {featuredCollectionOptions.length > 0 ? (
          <div className='mt-6 space-y-1'>
            <h3 className={sectionHeadingClassName}>
              Featured
            </h3>
            {featuredCollectionOptions.map((option) => (
              <FilterCheckbox
                key={option.id}
                checked={selectedCollectionIds.has(option.id)}
                label={option.label}
                onChange={(checked) => onToggleCollection(option.id, checked)}
              />
            ))}
          </div>
        ) : null}

        {nonFeaturedCollectionOptions.length > 0 ? (
          <div className='mt-6 hidden space-y-1 tablet:block'>
            <h3 className={sectionHeadingClassName}>
              Collection
            </h3>
            {visibleCollectionOptions.map((option) => (
              <FilterCheckbox
                key={option.id}
                checked={selectedCollectionIds.has(option.id)}
                label={option.label}
                onChange={(checked) => onToggleCollection(option.id, checked)}
              />
            ))}
            {nonFeaturedCollectionOptions.length > 3 ? (
              <button
                type='button'
                onClick={() => setShowAllCollections((previous) => !previous)}
                className={seeMoreButtonClassName}
              >
                {showAllCollections ? 'See less' : 'See more'}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </aside>
  )
}
