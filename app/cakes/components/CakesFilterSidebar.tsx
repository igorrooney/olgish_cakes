'use client'

import { useEffect, useMemo, useState } from 'react'
import { CakesCollectionOption, CakesFilterState } from './types'

interface CakesFilterSidebarProps {
  filters: CakesFilterState
  priceMax: number
  collectionOptions: CakesCollectionOption[]
  isByPostLoading: boolean
  isCustomLoading: boolean
  onToggleByPost: (checked: boolean) => void
  onToggleCustom: (checked: boolean) => void
  onPriceChange: (price: number) => void
  onToggleCollection: (collectionId: string, checked: boolean) => void
  onReset: () => void
  lockedCollectionIds?: string[]
  showProductTypeFilters?: boolean
}

const sectionLabelClassName = 'mb-1 text-sm font-semibold uppercase tracking-[0.18em] text-base-content/75'
const seeMoreButtonClassName = 'btn btn-ghost btn-sm h-auto min-h-0 border-transparent bg-transparent px-0 py-0 text-base font-normal normal-case leading-none text-base-content shadow-none hover:border-transparent hover:bg-transparent hover:shadow-none focus:border-transparent focus:bg-transparent focus:!outline-none focus:!shadow-none focus-visible:border-transparent focus-visible:bg-transparent focus-visible:!outline-none focus-visible:!shadow-none tablet:[font-family:var(--t-font-family-theme-primary)] tablet:[font-weight:300] tablet:[font-style:normal] tablet:[font-size:var(--t-font-size-sm)] tablet:[leading-trim:none] tablet:[line-height:140%] tablet:[letter-spacing:0]'

function FilterCheckbox({
  checked,
  label,
  helperText,
  onChange,
  isLoading = false,
  isDisabled = false,
  loadingSrLabel,
  controlSlotTestId,
  spinnerTestId
}: {
  checked: boolean
  label: string
  helperText?: string
  onChange: (checked: boolean) => void
  isLoading?: boolean
  isDisabled?: boolean
  loadingSrLabel?: string
  controlSlotTestId?: string
  spinnerTestId?: string
}) {
  const isInteractive = !isLoading && !isDisabled

  return (
    <label className={`label flex w-full items-start justify-start gap-2 p-0 py-1 ${isInteractive ? 'cursor-pointer' : 'cursor-default'}`}>
      <span
        aria-live='polite'
        className='m-0 mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center'
        data-testid={controlSlotTestId}
      >
        {isLoading ? (
          <span className='inline-flex h-4 w-4 items-center justify-center' role='status'>
            <span
              aria-hidden='true'
              className='loading loading-spinner h-4 w-4'
              data-testid={spinnerTestId}
            />
            <span className='sr-only'>{loadingSrLabel}</span>
          </span>
        ) : (
          <input
            type='checkbox'
            checked={checked}
            disabled={isDisabled}
            onChange={(event) => onChange(event.target.checked)}
            className='m-0 h-4 w-4 shrink-0 rounded-[4px] border border-base-content/45 bg-base-100 accent-primary disabled:cursor-not-allowed disabled:opacity-70'
          />
        )}
      </span>
      <span className='text-base leading-[1.4] text-base-content'>
        <span className='block font-normal'>
          {label}
        </span>
        {helperText ? (
          <span className='mt-0.5 block text-base leading-[1.4] text-base-content/75'>
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
  isByPostLoading,
  isCustomLoading,
  onToggleByPost,
  onToggleCustom,
  onPriceChange,
  onToggleCollection,
  onReset,
  lockedCollectionIds = [],
  showProductTypeFilters = true
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
  const lockedCollectionIdSet = useMemo(() => new Set(lockedCollectionIds), [lockedCollectionIds])

  useEffect(() => {
    setShowAllCollections(false)
  }, [filters.showByPost, filters.showCustom])

  const visibleCollectionOptions = showAllCollections
    ? nonFeaturedCollectionOptions
    : nonFeaturedCollectionOptions.filter((option, index) => {
      return index < 3 || selectedCollectionIds.has(option.id)
    })

  function resetAllFilters() {
    onReset()
    setShowAllCollections(false)
  }

  return (
    <aside aria-label='Catalog filters' className='card h-fit border border-base-300 bg-base-100 shadow-[0_16px_30px_rgba(15,23,42,0.03)] tablet:w-60 tablet:max-w-60'>
      <div className='card-body gap-0 p-4'>
        <div className='mb-4 flex items-center justify-between'>
          <p className='m-0 text-sm font-semibold uppercase tracking-[0.18em] text-base-content/75'>Filter by</p>
          <button
            type='button'
            onClick={resetAllFilters}
            className='btn btn-ghost btn-sm h-auto min-h-0 border-transparent px-0 py-0 text-base font-normal normal-case leading-none text-base-content shadow-none hover:border-transparent hover:bg-transparent hover:shadow-none focus:border-transparent focus:!outline-none focus:!shadow-none focus-visible:border-transparent focus-visible:!outline-none focus-visible:!shadow-none'
          >
            Reset
          </button>
        </div>

        {showProductTypeFilters ? (
          <div className='space-y-1'>
            <FilterCheckbox
              checked={filters.showByPost}
              label='Cakes by post'
              helperText='Delivered nationwide'
              onChange={onToggleByPost}
              isLoading={isByPostLoading}
              loadingSrLabel='Loading cakes by post'
              controlSlotTestId='by-post-control-slot'
              spinnerTestId='by-post-loader-spinner'
            />
            <FilterCheckbox
              checked={filters.showCustom}
              label='Custom cakes'
              helperText='Made to order'
              onChange={onToggleCustom}
              isLoading={isCustomLoading}
              loadingSrLabel='Loading custom cakes'
              controlSlotTestId='custom-control-slot'
              spinnerTestId='custom-loader-spinner'
            />
          </div>
        ) : null}

        <div className={`${showProductTypeFilters ? 'mt-6' : 'mt-0'}`}>
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
            <p className={sectionLabelClassName}>
              Featured
            </p>
            {featuredCollectionOptions.map((option) => (
              <FilterCheckbox
                key={option.id}
                checked={selectedCollectionIds.has(option.id)}
                label={option.label}
                isDisabled={lockedCollectionIdSet.has(option.id)}
                onChange={(checked) => onToggleCollection(option.id, checked)}
              />
            ))}
          </div>
        ) : null}

        {nonFeaturedCollectionOptions.length > 0 ? (
          <div className='mt-6 hidden space-y-1 tablet:block'>
            <p className={sectionLabelClassName}>
              Collection
            </p>
            {visibleCollectionOptions.map((option) => (
              <FilterCheckbox
                key={option.id}
                checked={selectedCollectionIds.has(option.id)}
                label={option.label}
                isDisabled={lockedCollectionIdSet.has(option.id)}
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
