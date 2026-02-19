'use client'

import { useEffect, useMemo, useRef, useState, type FormEvent, type SyntheticEvent } from 'react'
import { CakesCollectionOption, CakesSortOption } from './types'

interface CakesMobileFilterSortSheetProps {
  open: boolean
  selectedSort: CakesSortOption
  featuredCollectionOptions: CakesCollectionOption[]
  collectionOptions: CakesCollectionOption[]
  selectedCollectionIds: string[]
  onSortChange: (option: CakesSortOption) => void
  onToggleCollection: (collectionId: string, checked: boolean) => void
  onApply: () => void
  onCancel: () => void
}

const sortOptions: Array<{ id: CakesSortOption, label: string }> = [
  { id: 'new', label: 'Latest/Newest' },
  { id: 'priceHighToLow', label: 'Price: High to low' },
  { id: 'priceLowToHigh', label: 'Price: Low to high' }
]
const sheetSectionHeadingClassName =
  '[font-family:var(--t-font-family-theme-primary)] [font-weight:var(--t-font-weight-bold)] [font-style:normal] [font-size:var(--t-font-size-lg)] [leading-trim:none] [line-height:var(--t-font-lineHeight-leading-7)] [letter-spacing:0] align-middle text-(--d-color-base-content)'
const sortOptionRowTypographyClassName =
  '[font-family:var(--t-font-family-theme-primary)] [font-style:normal] [font-size:var(--t-font-size-base)] [leading-trim:none] [line-height:var(--t-font-lineHeight-leading-7)] [letter-spacing:0] align-middle text-(--d-color-base-content)'
const mobileFilterGroupTitleClassName =
  '[font-family:var(--t-font-family-theme-primary)] [font-weight:var(--t-font-weight-semibold)] [font-style:normal] [font-size:var(--t-font-size-xl)] [leading-trim:none] [line-height:var(--t-font-lineHeight-leading-7)] [letter-spacing:0] align-middle text-(--d-color-base-content)'
const mobileFilterCollapseIconClassName = 'mobile-filter-collapse-icon'
const mobileFilterCollapseIndicatorClassName =
  'pointer-events-none absolute right-[22px] top-1/2 -translate-y-1/2 [font-family:var(--t-font-family-theme-primary)] [font-style:normal] [font-size:var(--t-font-size-xl)] [font-weight:var(--t-font-weight-semibold)] leading-none text-(--color-primary-400)'

function CollectionCheckbox({
  checked,
  label,
  onChange
}: {
  checked: boolean
  label: string
  onChange: (checked: boolean) => void
}) {
  return (
    <label
      className={`${sortOptionRowTypographyClassName} ${
        checked
          ? '[font-weight:var(--t-font-weight-semibold)]'
          : '[font-weight:var(--t-font-weight-normal)]'
      } flex w-full cursor-pointer items-center justify-between gap-3 py-1`}
    >
      <span>{label}</span>
      <input
        type='checkbox'
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className='checkbox checkbox-sm rounded-[8px] border-base-300 bg-base-100 [--chkbg:var(--color-primary)] [--chkfg:var(--color-primary-content)]'
      />
    </label>
  )
}

export function CakesMobileFilterSortSheet({
  open,
  selectedSort,
  featuredCollectionOptions,
  collectionOptions,
  selectedCollectionIds,
  onSortChange,
  onToggleCollection,
  onApply,
  onCancel
}: CakesMobileFilterSortSheetProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null)
  const modalBoxRef = useRef<HTMLDivElement | null>(null)
  const collectionsDetailsRef = useRef<HTMLDetailsElement | null>(null)
  const wasOpenRef = useRef(false)
  const previousOptionsSignatureRef = useRef<string | null>(null)
  const [isFeaturedExpanded, setIsFeaturedExpanded] = useState(true)
  const [isCollectionsExpanded, setIsCollectionsExpanded] = useState(false)
  const [showAllCollections, setShowAllCollections] = useState(false)
  const selectedCollectionIdSet = useMemo(
    () => new Set(selectedCollectionIds),
    [selectedCollectionIds]
  )
  const optionsSignature = useMemo(() => {
    const featuredIds = featuredCollectionOptions.map((option) => option.id).join('|')
    const collectionIds = collectionOptions.map((option) => option.id).join('|')

    return `${featuredIds}::${collectionIds}`
  }, [collectionOptions, featuredCollectionOptions])
  const visibleCollectionOptions = showAllCollections
    ? collectionOptions
    : collectionOptions.slice(0, 3)

  useEffect(() => {
    const dialogElement = dialogRef.current

    if (!dialogElement) {
      return
    }

    if (open) {
      if (dialogElement.open) {
        return
      }

      if (typeof dialogElement.showModal === 'function') {
        try {
          dialogElement.showModal()
          return
        } catch {
          dialogElement.open = true
          return
        }
      }

      dialogElement.open = true
      return
    }

    if (!dialogElement.open) {
      return
    }

    if (typeof dialogElement.close === 'function') {
      dialogElement.close()
      return
    }

    dialogElement.open = false
  }, [open])

  function handleDialogCancel(event: SyntheticEvent<HTMLDialogElement, Event>) {
    event.preventDefault()
    onCancel()
  }

  function handleBackdropSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onCancel()
  }

  function resolveCollectionsScrollBehavior(): ScrollBehavior {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return 'smooth'
    }

    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth'
  }

  function scrollElementIntoViewWithinModal(element: Element | null) {
    const modalBox = modalBoxRef.current

    if (!modalBox || !element) {
      return
    }

    const containerRect = modalBox.getBoundingClientRect()
    const targetRect = element.getBoundingClientRect()
    const topBuffer = 12
    const bottomBuffer = 12
    const currentScrollTop = modalBox.scrollTop
    const targetTop = targetRect.top - containerRect.top + currentScrollTop
    const targetBottom = targetRect.bottom - containerRect.top + currentScrollTop
    const containerTop = currentScrollTop
    const containerBottom = currentScrollTop + modalBox.clientHeight
    const visibleTop = containerTop + topBuffer
    const visibleBottom = containerBottom - bottomBuffer
    const targetHeight = targetBottom - targetTop
    const maxScrollTop = Math.max(0, modalBox.scrollHeight - modalBox.clientHeight)
    let nextScrollTop = currentScrollTop

    if (targetHeight > modalBox.clientHeight - topBuffer - bottomBuffer) {
      nextScrollTop = targetTop - topBuffer
    } else if (targetTop < visibleTop) {
      nextScrollTop = targetTop - topBuffer
    } else if (targetBottom > visibleBottom) {
      nextScrollTop = targetBottom - modalBox.clientHeight + bottomBuffer
    } else {
      return
    }

    const clampedScrollTop = Math.min(Math.max(0, nextScrollTop), maxScrollTop)

    if (Math.abs(clampedScrollTop - currentScrollTop) < 1) {
      return
    }

    const behavior = resolveCollectionsScrollBehavior()

    if (typeof modalBox.scrollTo === 'function') {
      try {
        modalBox.scrollTo({
          top: clampedScrollTop,
          behavior
        })
        return
      } catch {
        // Fall back to direct assignment for environments that do not support options.
      }
    }

    modalBox.scrollTop = clampedScrollTop
  }

  function scrollCollectionsSectionIntoView() {
    scrollElementIntoViewWithinModal(collectionsDetailsRef.current)
  }

  function scrollFirstCheckedCollectionIntoView() {
    const collectionsDetails = collectionsDetailsRef.current

    if (!collectionsDetails) {
      return
    }

    const checkedCollectionInput =
      collectionsDetails.querySelector<HTMLInputElement>('input[type="checkbox"]:checked')

    if (!checkedCollectionInput) {
      return
    }

    const checkedCollectionRow = checkedCollectionInput.closest('label')
    scrollElementIntoViewWithinModal(checkedCollectionRow ?? checkedCollectionInput)
  }

  function scheduleCollectionsVisibilityScroll({
    includeCheckedCollection = false
  }: {
    includeCheckedCollection?: boolean
  } = {}) {
    if (typeof window === 'undefined') {
      return
    }

    const runScroll = () => {
      scrollCollectionsSectionIntoView()

      if (includeCheckedCollection) {
        scrollFirstCheckedCollectionIntoView()
      }
    }

    if (typeof window.requestAnimationFrame !== 'function') {
      window.setTimeout(runScroll, 0)
      return
    }

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(runScroll)
    })
  }

  useEffect(() => {
    const wasOpen = wasOpenRef.current
    const previousOptionsSignature = previousOptionsSignatureRef.current
    wasOpenRef.current = open
    previousOptionsSignatureRef.current = optionsSignature
    const didOpen = open && !wasOpen
    const didOptionsChange = open &&
      wasOpen &&
      previousOptionsSignature !== null &&
      previousOptionsSignature !== optionsSignature

    if (!open || (!didOpen && !didOptionsChange)) {
      return
    }

    const hasFeaturedOptions = featuredCollectionOptions.length > 0
    const hasCollectionsOptions = collectionOptions.length > 0
    const featuredCollectionIdSet = new Set(featuredCollectionOptions.map((option) => option.id))
    const regularCollectionIdSet = new Set(collectionOptions.map((option) => option.id))
    const selectedInCollections = selectedCollectionIds.filter((collectionId) => {
      return regularCollectionIdSet.has(collectionId)
    })
    const selectedInFeatured = selectedCollectionIds.filter((collectionId) => {
      return featuredCollectionIdSet.has(collectionId)
    })
    const hasSelectedCollections = selectedInCollections.length > 0
    const hasSelectedFeatured = selectedInFeatured.length > 0
    const shouldExpandCollections = hasSelectedCollections || (!hasFeaturedOptions && hasCollectionsOptions)
    const shouldExpandFeatured = hasSelectedCollections
      ? false
      : hasSelectedFeatured || (hasFeaturedOptions && !shouldExpandCollections)
    const shouldShowAllForSelectedCollections = hasSelectedCollections && selectedInCollections.some((collectionId) => {
      return collectionOptions.findIndex((option) => option.id === collectionId) >= 3
    })

    setShowAllCollections(shouldShowAllForSelectedCollections)
    setIsFeaturedExpanded(shouldExpandFeatured)
    setIsCollectionsExpanded(shouldExpandCollections)

    if (shouldExpandCollections && hasSelectedCollections) {
      scheduleCollectionsVisibilityScroll({
        includeCheckedCollection: true
      })
    }
  }, [collectionOptions, featuredCollectionOptions, open, optionsSignature, selectedCollectionIds])

  function handleFeaturedToggle(event: SyntheticEvent<HTMLDetailsElement, Event>) {
    const nextOpenState = event.currentTarget.open
    setIsFeaturedExpanded(nextOpenState)

    if (nextOpenState) {
      setIsCollectionsExpanded(false)
    }
  }

  function handleCollectionsToggle(event: SyntheticEvent<HTMLDetailsElement, Event>) {
    const nextOpenState = event.currentTarget.open
    setIsCollectionsExpanded(nextOpenState)

    if (nextOpenState) {
      setIsFeaturedExpanded(false)
      scheduleCollectionsVisibilityScroll()
    }
  }

  function handleCollectionsSeeMoreToggle() {
    const nextShowAllCollections = !showAllCollections
    setShowAllCollections(nextShowAllCollections)

    if (nextShowAllCollections) {
      scheduleCollectionsVisibilityScroll()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className='modal modal-bottom tablet:hidden'
      onCancel={handleDialogCancel}
      data-testid='mobile-filter-sort-sheet'
    >
      <div
        ref={modalBoxRef}
        className='modal-box m-0 w-full max-w-none rounded-t-[36px] rounded-b-none border border-base-300 bg-(--color-filter-sort-mobile-sheet-bg) px-6 pb-6 pt-3 shadow-none'
      >
        <div className='mx-auto h-[5px] w-[40px] rounded-[8px] bg-(--color-filter-sort-mobile-handle)' aria-hidden='true' />

        <section className='mt-6'>
          <h2 className={sheetSectionHeadingClassName}>
            Sort by
          </h2>
          <fieldset className='mt-4 space-y-2'>
            <legend className='sr-only'>Sort by</legend>
            {sortOptions.map((option) => {
              const isSelected = option.id === selectedSort

              return (
                <label
                  key={option.id}
                  className={`${sortOptionRowTypographyClassName} ${
                    isSelected
                      ? '[font-weight:var(--t-font-weight-semibold)]'
                      : '[font-weight:var(--t-font-weight-normal)]'
                  } flex cursor-pointer items-center gap-3 pl-2`}
                >
                  <input
                    type='radio'
                    name='mobile-filter-sort'
                    checked={isSelected}
                    onChange={() => onSortChange(option.id)}
                    className='sr-only'
                  />
                  <span aria-hidden='true' className='select-none'>&bull;</span>
                  <span>{option.label}</span>
                </label>
              )
            })}
          </fieldset>
        </section>

        <section className='mt-8'>
          <h2 className={sheetSectionHeadingClassName}>
            Filter by
          </h2>

          {featuredCollectionOptions.length > 0 ? (
            <details
              open={isFeaturedExpanded}
              onToggle={handleFeaturedToggle}
              className={`collapse collapse-plus ${mobileFilterCollapseIconClassName} mt-4 rounded-[28px] border border-base-300 bg-(--color-filter-sort-mobile-section-bg)`}
            >
              <summary
                className={`collapse-title relative ${mobileFilterGroupTitleClassName}`}
                style={{ boxSizing: 'border-box' }}
              >
                <span>Featured</span>
                <span aria-hidden='true' className={mobileFilterCollapseIndicatorClassName}>
                  {isFeaturedExpanded ? '\u2212' : '+'}
                </span>
              </summary>
              <div className='collapse-content pt-0'>
                <div className='space-y-1'>
                  {featuredCollectionOptions.map((option) => (
                    <CollectionCheckbox
                      key={option.id}
                      checked={selectedCollectionIdSet.has(option.id)}
                      label={option.label}
                      onChange={(checked) => onToggleCollection(option.id, checked)}
                    />
                  ))}
                </div>
              </div>
            </details>
          ) : null}

          {collectionOptions.length > 0 ? (
            <details
              ref={collectionsDetailsRef}
              open={isCollectionsExpanded}
              onToggle={handleCollectionsToggle}
              className={`collapse collapse-plus ${mobileFilterCollapseIconClassName} mt-4 rounded-[28px] border border-base-300 bg-(--color-filter-sort-mobile-section-bg)`}
            >
              <summary
                className={`collapse-title relative ${mobileFilterGroupTitleClassName}`}
                style={{ boxSizing: 'border-box' }}
              >
                <span>Collections</span>
                <span aria-hidden='true' className={mobileFilterCollapseIndicatorClassName}>
                  {isCollectionsExpanded ? '\u2212' : '+'}
                </span>
              </summary>
              <div className='collapse-content pt-0'>
                <div className='space-y-1'>
                  {visibleCollectionOptions.map((option) => (
                    <CollectionCheckbox
                      key={option.id}
                      checked={selectedCollectionIdSet.has(option.id)}
                      label={option.label}
                      onChange={(checked) => onToggleCollection(option.id, checked)}
                    />
                  ))}
                </div>
                {collectionOptions.length > 3 ? (
                  <button
                    type='button'
                    onClick={handleCollectionsSeeMoreToggle}
                    className='btn btn-ghost btn-sm mt-2 h-auto min-h-0 border-transparent bg-transparent px-0 py-0 text-[15px] font-normal normal-case leading-[1.35] text-(--color-filter-sort-mobile-text) shadow-none hover:border-transparent hover:bg-transparent hover:shadow-none focus:border-transparent focus:bg-transparent focus:!outline-none focus:!shadow-none focus-visible:border-transparent focus-visible:bg-transparent focus-visible:!outline-none focus-visible:!shadow-none'
                  >
                    {showAllCollections ? 'See less' : 'See more'}
                  </button>
                ) : null}
              </div>
            </details>
          ) : null}
        </section>

        <div className='mt-8 grid grid-cols-2 gap-4'>
          <button
            type='button'
            onClick={onApply}
            className='btn btn-primary h-14 min-h-14 rounded-field text-[16px] font-semibold normal-case'
          >
            Apply
          </button>
          <button
            type='button'
            onClick={onCancel}
            className='btn btn-outline btn-primary h-14 min-h-14 rounded-field text-[16px] font-semibold normal-case'
          >
            Cancel
          </button>
        </div>
      </div>

      <form className='modal-backdrop' onSubmit={handleBackdropSubmit}>
        <button type='submit' aria-label='Close filter and sort panel'>Close</button>
      </form>
    </dialog>
  )
}
