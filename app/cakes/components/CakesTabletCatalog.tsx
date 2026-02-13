'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
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

const sortOptions = ['new', 'priceHighToLow', 'priceLowToHigh'] as const
const TABLET_PAGE_SIZE = 6
const SMALL_LAPTOP_PAGE_SIZE = 9
const TRUNCATED_PAGINATION_THRESHOLD = 7

type PaginationToken = number | 'ellipsis-leading' | 'ellipsis-trailing'

function getClampedPage(page: number, totalPages: number) {
  if (page < 1) {
    return 1
  }

  if (page > totalPages) {
    return totalPages
  }

  return page
}

function getPaginationTokens(currentPage: number, totalPages: number): PaginationToken[] {
  if (totalPages <= TRUNCATED_PAGINATION_THRESHOLD) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const tokens: PaginationToken[] = [1]

  let middleStart = Math.max(2, currentPage - 1)
  let middleEnd = Math.min(totalPages - 1, currentPage + 1)

  if (currentPage <= 3) {
    middleStart = 2
    middleEnd = 4
  }

  if (currentPage >= totalPages - 2) {
    middleStart = totalPages - 3
    middleEnd = totalPages - 1
  }

  if (middleStart > 2) {
    tokens.push('ellipsis-leading')
  }

  for (let pageNumber = middleStart; pageNumber <= middleEnd; pageNumber += 1) {
    tokens.push(pageNumber)
  }

  if (middleEnd < totalPages - 1) {
    tokens.push('ellipsis-trailing')
  }

  tokens.push(totalPages)

  return tokens
}

function scrollWindowToTop() {
  if (typeof document === 'undefined') {
    return
  }

  const isJSDOM = typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)
  const previousDocumentScrollBehavior = document.documentElement.style.scrollBehavior
  const previousBodyScrollBehavior = document.body.style.scrollBehavior

  // Force instant jump even though the global stylesheet enables smooth scrolling.
  document.documentElement.style.scrollBehavior = 'auto'
  document.body.style.scrollBehavior = 'auto'
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0

  if (!isJSDOM && typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    } catch {
      window.scrollTo(0, 0)
    }
  }

  if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
    window.requestAnimationFrame(() => {
      document.documentElement.style.scrollBehavior = previousDocumentScrollBehavior
      document.body.style.scrollBehavior = previousBodyScrollBehavior
    })
    return
  }

  document.documentElement.style.scrollBehavior = previousDocumentScrollBehavior
  document.body.style.scrollBehavior = previousBodyScrollBehavior
}

const queryParsers = {
  sort: parseAsStringLiteral(sortOptions).withDefault('new'),
  byPost: parseAsBoolean.withDefault(false),
  custom: parseAsBoolean.withDefault(true),
  maxPrice: parseAsInteger,
  collections: parseAsArrayOf(parseAsString).withDefault([]),
  page: parseAsInteger.withDefault(1)
}

export function CakesTabletCatalog({ cakes, featuredOffer, collectionOptions }: CakesTabletCatalogProps) {
  const priceCeiling = useMemo(() => getPriceCeiling(cakes), [cakes])
  const pendingPaginationScrollRef = useRef(false)
  const [queryState, setQueryState] = useQueryStates(queryParsers, {
    history: 'replace'
  })

  useEffect(() => {
    scrollWindowToTop()
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
      collections: [],
      page: null
    })
  }, [setQueryState])

  const handleToggleCustom = useCallback((checked: boolean) => {
    void setQueryState({
      custom: checked,
      collections: [],
      page: null
    })
  }, [setQueryState])

  const handlePriceChange = useCallback((price: number) => {
    const clampedPrice = Math.min(Math.max(price, 0), priceCeiling)
    void setQueryState({
      maxPrice: clampedPrice,
      page: null
    })
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

    void setQueryState({
      collections: nextCollectionValues,
      page: null
    })
  }, [collectionIdByQueryValue, collectionQueryValueById, selectedCollectionValues, setQueryState])

  const handleReset = useCallback(() => {
    void setQueryState({
      sort: null,
      byPost: null,
      custom: null,
      maxPrice: null,
      collections: null,
      page: null
    })
  }, [setQueryState])

  const handleSortChange = useCallback((option: CakesSortOption) => {
    void setQueryState({
      sort: option,
      page: null
    })
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

    if (selectedSort === 'priceHighToLow') {
      return cakesCopy.sort((firstCake, secondCake) => secondCake.price - firstCake.price)
    }

    if (selectedSort === 'priceLowToHigh') {
      return cakesCopy.sort((firstCake, secondCake) => firstCake.price - secondCake.price)
    }

    return cakesCopy
  }, [cakes, filters, selectedSort])
  const tabletTotalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredCakes.length / TABLET_PAGE_SIZE))
  }, [filteredCakes.length])
  const smallLaptopTotalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredCakes.length / SMALL_LAPTOP_PAGE_SIZE))
  }, [filteredCakes.length])
  const tabletCurrentPage = useMemo(() => {
    return getClampedPage(queryState.page, tabletTotalPages)
  }, [queryState.page, tabletTotalPages])
  const smallLaptopCurrentPage = useMemo(() => {
    return getClampedPage(queryState.page, smallLaptopTotalPages)
  }, [queryState.page, smallLaptopTotalPages])
  const tabletPageStartIndex = useMemo(() => {
    return (tabletCurrentPage - 1) * TABLET_PAGE_SIZE
  }, [tabletCurrentPage])
  const tabletPageEndIndex = useMemo(() => {
    return tabletPageStartIndex + TABLET_PAGE_SIZE
  }, [tabletPageStartIndex])
  const smallLaptopPageStartIndex = useMemo(() => {
    return (smallLaptopCurrentPage - 1) * SMALL_LAPTOP_PAGE_SIZE
  }, [smallLaptopCurrentPage])
  const smallLaptopPageEndIndex = useMemo(() => {
    return smallLaptopPageStartIndex + SMALL_LAPTOP_PAGE_SIZE
  }, [smallLaptopPageStartIndex])
  const isOutsideTabletPage = useCallback((index: number) => {
    return index < tabletPageStartIndex || index >= tabletPageEndIndex
  }, [tabletPageEndIndex, tabletPageStartIndex])
  const isOutsideSmallLaptopPage = useCallback((index: number) => {
    return index < smallLaptopPageStartIndex || index >= smallLaptopPageEndIndex
  }, [smallLaptopPageEndIndex, smallLaptopPageStartIndex])
  const getCakeItemClassName = useCallback((index: number) => {
    const outsideTabletPage = isOutsideTabletPage(index)
    const outsideSmallLaptopPage = isOutsideSmallLaptopPage(index)

    if (outsideTabletPage && outsideSmallLaptopPage) {
      return 'h-full tablet:hidden'
    }

    if (outsideTabletPage) {
      return 'h-full tablet:hidden small-laptop:block'
    }

    if (outsideSmallLaptopPage) {
      return 'h-full small-laptop:hidden'
    }

    return 'h-full'
  }, [isOutsideSmallLaptopPage, isOutsideTabletPage])
  const tabletPageTokens = useMemo(() => {
    return getPaginationTokens(tabletCurrentPage, tabletTotalPages)
  }, [tabletCurrentPage, tabletTotalPages])
  const smallLaptopPageTokens = useMemo(() => {
    return getPaginationTokens(smallLaptopCurrentPage, smallLaptopTotalPages)
  }, [smallLaptopCurrentPage, smallLaptopTotalPages])

  useEffect(() => {
    if (!pendingPaginationScrollRef.current) {
      return
    }

    pendingPaginationScrollRef.current = false
    scrollWindowToTop()
  }, [smallLaptopCurrentPage, tabletCurrentPage])

  useEffect(() => {
    if (queryState.page === tabletCurrentPage) {
      return
    }

    void setQueryState({
      page: tabletCurrentPage === 1 ? null : tabletCurrentPage
    })
  }, [queryState.page, setQueryState, tabletCurrentPage])

  const paginationFocusClassName = 'focus:!outline-none focus-visible:!outline-none focus:!shadow-none focus-visible:!shadow-none'
  const paginationItemClassName = `join-item btn h-12 min-h-12 rounded-none border-0 bg-base-100 text-base-content ${paginationFocusClassName}`
  const pageItemClassName = `${paginationItemClassName} w-12 min-w-12 px-0`
  const activePageItemClassName = 'border-x border-base-content font-semibold cursor-default pointer-events-none'
  const inactivePageItemClassName = 'hover:bg-base-200'
  const prevNextItemClassName = `${paginationItemClassName} min-w-24 px-4 normal-case`
  const ellipsisItemClassName = `${paginationItemClassName} btn-disabled min-w-10 px-2`
  const handlePageChange = useCallback((targetPage: number, currentPage: number, totalPages: number) => {
    const normalizedPage = getClampedPage(targetPage, totalPages)

    if (normalizedPage === currentPage) {
      return
    }

    pendingPaginationScrollRef.current = true
    void setQueryState({
      page: normalizedPage === 1 ? null : normalizedPage
    })
  }, [setQueryState])

  const renderPaginationNav = useCallback(({
    navAriaLabel,
    navClassName,
    currentPage,
    totalPages,
    pageTokens,
    previousPageLabel,
    nextPageLabel,
    getPageLabel
  }: {
    navAriaLabel: string
    navClassName: string
    currentPage: number
    totalPages: number
    pageTokens: PaginationToken[]
    previousPageLabel: string
    nextPageLabel: string
    getPageLabel: (pageNumber: number) => string
  }) => {
    return (
      <nav aria-label={navAriaLabel} className={navClassName}>
        <div className='join overflow-hidden rounded-btn border border-base-300'>
          {currentPage === 1 ? (
            <button
              type='button'
              aria-label={previousPageLabel}
              disabled
              className={`${prevNextItemClassName} opacity-45 cursor-not-allowed`}
            >
              <span aria-hidden='true' className='text-base leading-none'>&lsaquo;</span>
              <span>Previous</span>
            </button>
          ) : (
            <button
              type='button'
              aria-label={previousPageLabel}
              onClick={() => handlePageChange(currentPage - 1, currentPage, totalPages)}
              className={prevNextItemClassName}
            >
              <span aria-hidden='true' className='text-base leading-none'>&lsaquo;</span>
              <span>Previous</span>
            </button>
          )}
          {pageTokens.map((token, index) => {
            if (token === 'ellipsis-leading' || token === 'ellipsis-trailing') {
              return (
                <span
                  key={`${token}-${index}`}
                  aria-hidden='true'
                  className={ellipsisItemClassName}
                >
                  ...
                </span>
              )
            }

            const pageNumber = token
            const isActivePage = pageNumber === currentPage

            return (
              <button
                type='button'
                key={pageNumber}
                aria-label={getPageLabel(pageNumber)}
                aria-current={isActivePage ? 'page' : undefined}
                onClick={() => handlePageChange(pageNumber, currentPage, totalPages)}
                disabled={isActivePage}
                style={isActivePage
                  ? {
                      backgroundColor: 'var(--color-primary-500)',
                      color: 'var(--color-primary-50)'
                    }
                  : undefined}
                className={`${pageItemClassName} ${
                  isActivePage ? activePageItemClassName : inactivePageItemClassName
                }`}
              >
                {pageNumber}
              </button>
            )
          })}
          {currentPage === totalPages ? (
            <button
              type='button'
              aria-label={nextPageLabel}
              disabled
              className={`${prevNextItemClassName} opacity-45 cursor-not-allowed`}
            >
              <span>Next</span>
              <span aria-hidden='true' className='text-base leading-none'>&rsaquo;</span>
            </button>
          ) : (
            <button
              type='button'
              aria-label={nextPageLabel}
              onClick={() => handlePageChange(currentPage + 1, currentPage, totalPages)}
              className={prevNextItemClassName}
            >
              <span>Next</span>
              <span aria-hidden='true' className='text-base leading-none'>&rsaquo;</span>
            </button>
          )}
        </div>
      </nav>
    )
  }, [
    activePageItemClassName,
    ellipsisItemClassName,
    handlePageChange,
    inactivePageItemClassName,
    pageItemClassName,
    prevNextItemClassName
  ])

  return (
    <section className='mx-auto w-full max-w-[952px] px-4 pb-16 pt-8 tablet:px-0 small-laptop:max-w-[1200px] large-laptop:max-w-[1432px]'>
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
            <div className='mt-4 grid grid-cols-1 gap-4 tablet:auto-rows-fr tablet:grid-cols-2 small-laptop:grid-cols-3'>
              {filteredCakes.map((cake, index) => (
                <div key={cake.id} className={getCakeItemClassName(index)}>
                  <CakesProductCard cake={cake} />
                </div>
              ))}
            </div>
          ) : (
            <div className='mt-6 rounded-box border border-dashed border-base-300 bg-base-100 p-10 text-center'>
              <p className='text-base text-base-content/70'>No cakes match the selected filters yet.</p>
            </div>
          )}
          {filteredCakes.length > 0 && tabletTotalPages > 1
            ? renderPaginationNav({
              navAriaLabel: 'Cake catalog pagination',
              navClassName: 'mt-9 hidden w-full justify-center tablet:flex small-laptop:hidden',
              currentPage: tabletCurrentPage,
              totalPages: tabletTotalPages,
              pageTokens: tabletPageTokens,
              previousPageLabel: 'Previous page',
              nextPageLabel: 'Next page',
              getPageLabel: (pageNumber) => `Go to page ${pageNumber}`
            })
            : null}
          {filteredCakes.length > 0 && smallLaptopTotalPages > 1
            ? renderPaginationNav({
              navAriaLabel: 'Cake catalog pagination (small laptop)',
              navClassName: 'mt-9 hidden w-full justify-center small-laptop:flex',
              currentPage: smallLaptopCurrentPage,
              totalPages: smallLaptopTotalPages,
              pageTokens: smallLaptopPageTokens,
              previousPageLabel: 'Previous page (small laptop)',
              nextPageLabel: 'Next page (small laptop)',
              getPageLabel: (pageNumber) => `Go to small laptop page ${pageNumber}`
            })
            : null}
        </div>
      </div>
    </section>
  )
}
