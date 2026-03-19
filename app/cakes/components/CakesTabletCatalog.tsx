'use client'

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type MouseEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { usePathname } from 'next/navigation'
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
import { CatalogLogoLoader } from './CatalogLogoLoader'
import { CakesMobileFilterSortSheet } from './CakesMobileFilterSortSheet'
import { CakesProductCard } from './CakesProductCard'
import { CakesSortBar } from './CakesSortBar'
import {
  CakesCollectionOption,
  CakesFilterState,
  CakesSortOption,
  CakesTabletCatalogProps,
  TabletCake
} from './types'
import { categoryLandingProductShellClassName } from './categoryLandingLayout'
import { buildCatalogProductLinkHref } from '../catalogNavigation'

function getPriceCeiling(cakes: TabletCake[]) {
  if (cakes.length === 0) {
    return 0
  }

  return Math.ceil(Math.max(...cakes.map((cake) => cake.price)))
}

const sortOptions = ['new', 'priceHighToLow', 'priceLowToHigh'] as const
const mobileViewModeStorageKey = 'catalog-mobile-view-mode'
const MOBILE_PAGE_SIZE = 6
const TABLET_PAGE_SIZE = 6
const SMALL_LAPTOP_PAGE_SIZE = 9
const TRUNCATED_PAGINATION_THRESHOLD = 7
const TABLET_BREAKPOINT = 1024
const MOBILE_SENTINEL_ROOT_MARGIN = '240px 0px'
const DEFAULT_CATALOG_PATH = '/cakes'
const BY_POST_CATALOG_PATH = '/cakes-by-post'

type PaginationToken = number | 'ellipsis-leading' | 'ellipsis-trailing'
type MobileTab = 'custom' | 'byPost'
type MobileViewMode = 'grid' | 'single'

function isMobileViewMode(value: unknown): value is MobileViewMode {
  return value === 'grid' || value === 'single'
}

function readStoredMobileViewMode() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const storedViewMode = window.localStorage.getItem(mobileViewModeStorageKey)
    return isMobileViewMode(storedViewMode) ? storedViewMode : null
  } catch {
    return null
  }
}

function writeStoredMobileViewMode(viewMode: MobileViewMode) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(mobileViewModeStorageKey, viewMode)
  } catch {
    // Ignore storage errors to avoid breaking view toggles in restricted environments.
  }
}

interface LazyCustomCakesResponse {
  cakes?: unknown
  collectionOptions?: unknown
}

interface LazyCatalogQueryPayload {
  cakesPayload: TabletCake[]
  collectionOptionsPayload: CakesCollectionOption[]
}

interface PriceScopeInput {
  showByPost: boolean
  showCustom: boolean
  selectedCollectionIds: string[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isTabletCake(value: unknown): value is TabletCake {
  if (!isRecord(value)) {
    return false
  }

  if (value.productType !== 'cake' && value.productType !== 'giftHamper') {
    return false
  }

  return typeof value.id === 'string' &&
    typeof value.slug === 'string' &&
    typeof value.href === 'string' &&
    (value.navigationTarget === 'product' || value.navigationTarget === 'landing') &&
    typeof value.name === 'string' &&
    typeof value.description === 'string' &&
    typeof value.price === 'number' &&
    typeof value.imageUrl === 'string' &&
    typeof value.imageAlt === 'string' &&
    typeof value.isByPost === 'boolean' &&
    typeof value.isCustom === 'boolean' &&
    typeof value.isPopular === 'boolean' &&
    Array.isArray(value.collectionIds) &&
    value.collectionIds.every((collectionId) => typeof collectionId === 'string')
}

function isCollectionOption(value: unknown): value is CakesCollectionOption {
  if (!isRecord(value)) {
    return false
  }

  if (value.productType !== 'cake' && value.productType !== 'giftHamper') {
    return false
  }

  return typeof value.id === 'string' &&
    typeof value.queryValue === 'string' &&
    Array.isArray(value.legacyQueryValues) &&
    value.legacyQueryValues.every((queryValue) => typeof queryValue === 'string') &&
    typeof value.label === 'string' &&
    typeof value.isFeatured === 'boolean'
}

function mergeCatalogItems(
  baseItems: TabletCake[],
  extraItems: TabletCake[]
) {
  const itemById = new Map<string, TabletCake>()

  ;[...baseItems, ...extraItems].forEach((item) => {
    itemById.set(item.id, item)
  })

  const mergedItems = Array.from(itemById.values())
  const customCakes = mergedItems.filter((item) => item.productType === 'cake')
  const byPostCakes = mergedItems.filter((item) => item.productType === 'giftHamper')

  // Preserve previous catalog behavior where custom cakes appear before by-post hampers.
  return [...customCakes, ...byPostCakes]
}

function mergeCollectionOptions(
  baseOptions: CakesCollectionOption[],
  extraOptions: CakesCollectionOption[]
) {
  const optionByQueryValue = new Map<string, CakesCollectionOption>()

  ;[...baseOptions, ...extraOptions].forEach((option) => {
    optionByQueryValue.set(option.queryValue, option)
  })

  return Array.from(optionByQueryValue.values())
}

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

function isPlainLeftClick(event: MouseEvent<HTMLAnchorElement>) {
  return event.button === 0 &&
    !event.defaultPrevented &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
}

function getViewportSnapshot() {
  if (typeof window === 'undefined') {
    return false
  }

  return window.innerWidth < TABLET_BREAKPOINT
}

function getViewportServerSnapshot() {
  return false
}

function subscribeToViewportChanges(onStoreChange: () => void) {
  if (typeof window === 'undefined') {
    return () => {}
  }

  window.addEventListener('resize', onStoreChange)

  return () => {
    window.removeEventListener('resize', onStoreChange)
  }
}

function useIsMobileViewport() {
  return useSyncExternalStore(
    subscribeToViewportChanges,
    getViewportSnapshot,
    getViewportServerSnapshot
  )
}

function resolveMobileTab({
  showByPost,
  showCustom,
  fallbackByPost
}: {
  showByPost: boolean
  showCustom: boolean
  fallbackByPost: boolean
}): MobileTab {
  if (showByPost && !showCustom) {
    return 'byPost'
  }

  if (showCustom && !showByPost) {
    return 'custom'
  }

  return fallbackByPost ? 'byPost' : 'custom'
}

function getTabCatalogItems(catalogItems: TabletCake[], tab: MobileTab) {
  if (tab === 'byPost') {
    return catalogItems.filter((item) => item.productType === 'giftHamper')
  }

  return catalogItems.filter((item) => item.productType === 'cake')
}

function getCatalogBasePath(initialFilterDefaults: {
  byPost: boolean
  custom: boolean
}) {
  return initialFilterDefaults.byPost && !initialFilterDefaults.custom
    ? BY_POST_CATALOG_PATH
    : DEFAULT_CATALOG_PATH
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

export function CakesTabletCatalog({
  cakes,
  featuredOffer,
  collectionOptions,
  initialFilterDefaults,
  lazyCustomCakesEndpoint,
  lazyCustomCakesPriceCeilingHint,
  lazyByPostCakesEndpoint,
  lazyByPostCakesPriceCeilingHint,
  catalogMode = 'all-cakes',
  lockedCollectionQueryValues = [],
  showProductTypeFilters = true,
  showDesktopFilters = true,
  showMobileFilterSheet = true,
  showPriceFilter = true,
  showCollectionFilters = true,
  mobileToolbarVariant = 'full'
}: CakesTabletCatalogProps) {
  const queryClient = useQueryClient()
  const pathname = usePathname()
  const [optimisticByPostFilter, setOptimisticByPostFilter] = useState<boolean | null>(null)
  const [optimisticCustomFilter, setOptimisticCustomFilter] = useState<boolean | null>(null)
  const [optimisticCollectionValues, setOptimisticCollectionValues] = useState<string[] | null>(null)
  const [optimisticMaxPrice, setOptimisticMaxPrice] = useState<number | null>(null)
  const [isMaxPriceAutoSyncEnabled, setIsMaxPriceAutoSyncEnabled] = useState(false)
  const optimisticByPostResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const optimisticCustomResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [lazyCustomCakes, setLazyCustomCakes] = useState<TabletCake[]>([])
  const [lazyCustomCakeCollections, setLazyCustomCakeCollections] = useState<CakesCollectionOption[]>([])
  const [isLazyCustomCakesLoading, setIsLazyCustomCakesLoading] = useState(false)
  const [hasLazyCustomCakesError, setHasLazyCustomCakesError] = useState(false)
  const [lazyByPostCakes, setLazyByPostCakes] = useState<TabletCake[]>([])
  const [lazyByPostCakeCollections, setLazyByPostCakeCollections] = useState<CakesCollectionOption[]>([])
  const [isLazyByPostCakesLoading, setIsLazyByPostCakesLoading] = useState(false)
  const [hasLazyByPostCakesError, setHasLazyByPostCakesError] = useState(false)
  const pendingPaginationScrollRef = useRef(false)
  const hasNormalizedCleanUrlDefaultsRef = useRef(false)
  const hasLoadedLazyCustomCakesRef = useRef(false)
  const hasLoadedLazyByPostCakesRef = useRef(false)
  const lazyCustomCakesRequestRef = useRef<Promise<void> | null>(null)
  const lazyCustomCakesAbortControllerRef = useRef<AbortController | null>(null)
  const previousLazyCustomCakesRef = useRef<TabletCake[] | null>(null)
  const previousLazyByPostCakesRef = useRef<TabletCake[] | null>(null)
  const maxPriceQueryWriteIdRef = useRef(0)
  const [activeMaxPriceQueryWriteId, setActiveMaxPriceQueryWriteId] = useState(0)
  const [hasHydrated, setHasHydrated] = useState(false)
  const isMobileViewport = useIsMobileViewport()
  const [isMobileFilterSortOpen, setIsMobileFilterSortOpen] = useState(false)
  const [mobileDraftSort, setMobileDraftSort] = useState<CakesSortOption>('new')
  const [mobileDraftSelectedCollectionIds, setMobileDraftSelectedCollectionIds] = useState<string[]>([])
  const [activeMobileViewMode, setActiveMobileViewMode] = useState<MobileViewMode>('grid')
  const [mobileVisibleCountByTab, setMobileVisibleCountByTab] = useState<Record<MobileTab, number>>({
    custom: MOBILE_PAGE_SIZE,
    byPost: MOBILE_PAGE_SIZE
  })
  const mobileSentinelRef = useRef<HTMLDivElement | null>(null)
  const isCategoryLanding = catalogMode === 'category-landing'
  const shouldShowProductTypeFilters = showProductTypeFilters && !isCategoryLanding
  const shouldRenderDesktopFilters = showDesktopFilters && !isCategoryLanding && (showPriceFilter || showCollectionFilters || shouldShowProductTypeFilters)
  const shouldRenderMobileFilterSheet = showMobileFilterSheet && !isCategoryLanding && (showCollectionFilters || shouldShowProductTypeFilters)
  const shouldUseInlineCompactMobileToolbar = mobileToolbarVariant === 'inline-compact'
  const catalogSectionClassName = isCategoryLanding
    ? categoryLandingProductShellClassName
    : 'mx-auto w-full max-w-[952px] px-4 pb-16 pt-0 tablet:pt-8 tablet:px-0 small-laptop:max-w-[1200px] large-laptop:max-w-[1432px]'
  const queryParsers = useMemo(() => {
    return {
      sort: parseAsStringLiteral(sortOptions).withDefault('new'),
      byPost: parseAsBoolean.withDefault(initialFilterDefaults.byPost),
      custom: parseAsBoolean.withDefault(initialFilterDefaults.custom),
      maxPrice: parseAsInteger,
      collections: parseAsArrayOf(parseAsString).withDefault([]),
      page: parseAsInteger.withDefault(1)
    }
  }, [initialFilterDefaults.byPost, initialFilterDefaults.custom])
  const [queryState, setQueryState] = useQueryStates(queryParsers, {
    history: 'replace'
  })
  const buildProductCardLinkHref = useCallback((href: string) => {
    return buildCatalogProductLinkHref({
      defaultByPost: initialFilterDefaults.byPost,
      defaultCustom: initialFilterDefaults.custom,
      href,
      maxPrice: queryState.maxPrice,
      pathname,
      page: queryState.page,
      selectedCollections: queryState.collections,
      showByPost: queryState.byPost,
      showCustom: queryState.custom,
      sort: queryState.sort
    })
  }, [
    initialFilterDefaults.byPost,
    initialFilterDefaults.custom,
    pathname,
    queryState.byPost,
    queryState.collections,
    queryState.custom,
    queryState.maxPrice,
    queryState.page,
    queryState.sort
  ])
  const effectiveByPostFilter = optimisticByPostFilter ?? queryState.byPost
  const effectiveCustomFilter = optimisticCustomFilter ?? queryState.custom
  const activeMobileTab = useMemo(() => {
    return resolveMobileTab({
      showByPost: effectiveByPostFilter,
      showCustom: effectiveCustomFilter,
      fallbackByPost: initialFilterDefaults.byPost
    })
  }, [
    effectiveByPostFilter,
    effectiveCustomFilter,
    initialFilterDefaults.byPost
  ])
  const isMaxPriceQueryWritePending = activeMaxPriceQueryWriteId !== 0
  const beginMaxPriceQueryWrite = useCallback(() => {
    const nextQueryWriteId = maxPriceQueryWriteIdRef.current + 1
    maxPriceQueryWriteIdRef.current = nextQueryWriteId
    setActiveMaxPriceQueryWriteId(nextQueryWriteId)

    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          if (maxPriceQueryWriteIdRef.current !== nextQueryWriteId) {
            return
          }

          setActiveMaxPriceQueryWriteId(0)
        })
      })
    }

    return nextQueryWriteId
  }, [])
  const finishMaxPriceQueryWrite = useCallback((queryWriteId: number) => {
    if (maxPriceQueryWriteIdRef.current !== queryWriteId) {
      return
    }

    setActiveMaxPriceQueryWriteId(0)
  }, [])

  const scheduleOptimisticByPostReset = useCallback(() => {
    if (optimisticByPostResetTimeoutRef.current) {
      clearTimeout(optimisticByPostResetTimeoutRef.current)
    }

    optimisticByPostResetTimeoutRef.current = setTimeout(() => {
      setOptimisticByPostFilter(null)
      optimisticByPostResetTimeoutRef.current = null
    }, 400)
  }, [])

  const scheduleOptimisticCustomReset = useCallback(() => {
    if (optimisticCustomResetTimeoutRef.current) {
      clearTimeout(optimisticCustomResetTimeoutRef.current)
    }

    optimisticCustomResetTimeoutRef.current = setTimeout(() => {
      setOptimisticCustomFilter(null)
      optimisticCustomResetTimeoutRef.current = null
    }, 400)
  }, [])

  useEffect(() => {
    return () => {
      if (optimisticByPostResetTimeoutRef.current) {
        clearTimeout(optimisticByPostResetTimeoutRef.current)
      }

      if (optimisticCustomResetTimeoutRef.current) {
        clearTimeout(optimisticCustomResetTimeoutRef.current)
      }
    }
  }, [])

  const hasCustomCakesInInitialData = useMemo(() => {
    return cakes.some((cake) => cake.productType === 'cake')
  }, [cakes])
  const hasByPostCakesInInitialData = useMemo(() => {
    return cakes.some((cake) => cake.productType === 'giftHamper')
  }, [cakes])
  const shouldLazyLoadCustomCakes = Boolean(lazyCustomCakesEndpoint) && !hasCustomCakesInInitialData
  const shouldLazyLoadByPostCakes = Boolean(lazyByPostCakesEndpoint) && !hasByPostCakesInInitialData
  const catalogItems = useMemo(() => {
    return mergeCatalogItems(cakes, [...lazyCustomCakes, ...lazyByPostCakes])
  }, [cakes, lazyByPostCakes, lazyCustomCakes])
  const availableCollectionOptions = useMemo(() => {
    return mergeCollectionOptions(
      mergeCollectionOptions(collectionOptions, lazyCustomCakeCollections),
      lazyByPostCakeCollections
    )
  }, [collectionOptions, lazyByPostCakeCollections, lazyCustomCakeCollections])
  const activeCollectionOptions = useMemo(() => {
    const onlyByPost = effectiveByPostFilter && !effectiveCustomFilter
    const onlyCustom = effectiveCustomFilter && !effectiveByPostFilter

    if (onlyByPost) {
      return availableCollectionOptions.filter((option) => option.productType === 'giftHamper')
    }

    if (onlyCustom) {
      return availableCollectionOptions.filter((option) => option.productType === 'cake')
    }

    return availableCollectionOptions
  }, [availableCollectionOptions, effectiveByPostFilter, effectiveCustomFilter])
  const featuredCollectionOptions = useMemo(() => {
    return activeCollectionOptions.filter((option) => option.isFeatured)
  }, [activeCollectionOptions])
  const nonFeaturedCollectionOptions = useMemo(() => {
    return activeCollectionOptions.filter((option) => !option.isFeatured)
  }, [activeCollectionOptions])
  const activeCollectionIdSet = useMemo(
    () => new Set(activeCollectionOptions.map((option) => option.id)),
    [activeCollectionOptions]
  )

  useEffect(() => {
    scrollWindowToTop()
  }, [])

  useEffect(() => {
    if (hasNormalizedCleanUrlDefaultsRef.current) {
      return
    }

    hasNormalizedCleanUrlDefaultsRef.current = true

    if (typeof window === 'undefined' || window.location.search.length > 0) {
      return
    }

    void setQueryState({
      sort: null,
      byPost: null,
      custom: null,
      maxPrice: null,
      collections: null,
      page: null
    })
  }, [setQueryState])

  useEffect(() => {
    if (!isCategoryLanding) {
      return
    }

    const hasHiddenCategoryFilters =
      queryState.byPost !== initialFilterDefaults.byPost ||
      queryState.custom !== initialFilterDefaults.custom ||
      queryState.maxPrice !== null ||
      queryState.collections.length > 0

    if (!hasHiddenCategoryFilters) {
      return
    }

    void setQueryState({
      byPost: null,
      custom: null,
      maxPrice: null,
      collections: null,
      page: null
    })
  }, [
    initialFilterDefaults.byPost,
    initialFilterDefaults.custom,
    isCategoryLanding,
    queryState.byPost,
    queryState.collections,
    queryState.custom,
    queryState.maxPrice,
    queryState.page,
    setQueryState
  ])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const currentUrl = new URL(window.location.href)
    const legacyViewValue = currentUrl.searchParams.get('view')
    const legacyViewMode = isMobileViewMode(legacyViewValue) ? legacyViewValue : null
    const nextViewMode = legacyViewMode ?? readStoredMobileViewMode()

    if (nextViewMode !== null) {
      setActiveMobileViewMode(nextViewMode)
    }

    if (legacyViewMode !== null) {
      writeStoredMobileViewMode(legacyViewMode)
    }

    if (legacyViewValue === null) {
      return
    }

    currentUrl.searchParams.delete('view')
    const nextSearch = currentUrl.searchParams.toString()
    const nextUrl = `${currentUrl.pathname}${nextSearch.length > 0 ? `?${nextSearch}` : ''}${currentUrl.hash}`
    window.history.replaceState(window.history.state, '', nextUrl)
  }, [])

  useEffect(() => {
    if (!shouldLazyLoadCustomCakes || !lazyCustomCakesEndpoint) {
      setIsLazyCustomCakesLoading(false)
      return
    }

    if (hasLoadedLazyCustomCakesRef.current) {
      setIsLazyCustomCakesLoading(false)
      return
    }

    if (!effectiveCustomFilter && lazyCustomCakesRequestRef.current === null) {
      setIsLazyCustomCakesLoading(false)
      return
    }

    if (lazyCustomCakesRequestRef.current !== null) {
      setIsLazyCustomCakesLoading(effectiveCustomFilter)
      return
    }

    const requestAbortController = new AbortController()
    const customCakesQueryKey = ['cakesCatalogLazyCustomCakes', lazyCustomCakesEndpoint] as const
    lazyCustomCakesAbortControllerRef.current = requestAbortController

    setIsLazyCustomCakesLoading(true)
    setHasLazyCustomCakesError(false)

    const loadCustomCakesRequest = (async () => {
      try {
        const payload = await queryClient.fetchQuery<LazyCatalogQueryPayload>({
          queryKey: customCakesQueryKey,
          retry: false,
          queryFn: async ({ signal }) => {
            const relayAbortSignal = () => {
              requestAbortController.abort()
            }

            signal.addEventListener('abort', relayAbortSignal)

            try {
              const response = await fetch(lazyCustomCakesEndpoint, {
                signal: requestAbortController.signal
              })

              if (!response.ok) {
                throw new Error(`Failed to fetch custom cakes: ${response.status}`)
              }

              const queryPayload = await response.json() as LazyCustomCakesResponse
              const cakesPayload = Array.isArray(queryPayload.cakes)
                ? queryPayload.cakes.filter((cake): cake is TabletCake => isTabletCake(cake))
                : []
              const collectionOptionsPayload = Array.isArray(queryPayload.collectionOptions)
                ? queryPayload.collectionOptions.filter((option): option is CakesCollectionOption => isCollectionOption(option))
                : []

              return {
                cakesPayload,
                collectionOptionsPayload
              }
            } finally {
              signal.removeEventListener('abort', relayAbortSignal)
            }
          }
        })

        if (requestAbortController.signal.aborted) {
          return
        }

        setLazyCustomCakes(payload.cakesPayload)
        setLazyCustomCakeCollections(payload.collectionOptionsPayload)
        hasLoadedLazyCustomCakesRef.current = true
      } catch (error) {
        if (requestAbortController.signal.aborted) {
          return
        }

        setHasLazyCustomCakesError(true)
        console.error('Failed to load custom cakes for catalog:', error)
      } finally {
        lazyCustomCakesRequestRef.current = null
        lazyCustomCakesAbortControllerRef.current = null
        setIsLazyCustomCakesLoading(false)
      }
    })()

    lazyCustomCakesRequestRef.current = loadCustomCakesRequest
    void loadCustomCakesRequest
  }, [effectiveCustomFilter, lazyCustomCakesEndpoint, queryClient, shouldLazyLoadCustomCakes])

  useEffect(() => {
    return () => {
      lazyCustomCakesAbortControllerRef.current?.abort()
    }
  }, [])

  useEffect(() => {
    if (!effectiveByPostFilter || !shouldLazyLoadByPostCakes || !lazyByPostCakesEndpoint) {
      setIsLazyByPostCakesLoading(false)
      return
    }

    if (hasLoadedLazyByPostCakesRef.current) {
      setIsLazyByPostCakesLoading(false)
      return
    }

    const requestAbortController = new AbortController()
    const byPostCakesQueryKey = ['cakesCatalogLazyByPostCakes', lazyByPostCakesEndpoint] as const
    let isEffectActive = true

    setIsLazyByPostCakesLoading(true)
    setHasLazyByPostCakesError(false)

    const loadByPostCakes = async () => {
      try {
        const payload = await queryClient.fetchQuery<LazyCatalogQueryPayload>({
          queryKey: byPostCakesQueryKey,
          retry: false,
          queryFn: async ({ signal }) => {
            const relayAbortSignal = () => {
              requestAbortController.abort()
            }

            signal.addEventListener('abort', relayAbortSignal)

            try {
              const response = await fetch(lazyByPostCakesEndpoint, {
                signal: requestAbortController.signal
              })

              if (!response.ok) {
                throw new Error(`Failed to fetch by-post cakes: ${response.status}`)
              }

              const queryPayload = await response.json() as LazyCustomCakesResponse
              const cakesPayload = Array.isArray(queryPayload.cakes)
                ? queryPayload.cakes.filter((cake): cake is TabletCake => isTabletCake(cake) && cake.productType === 'giftHamper')
                : []
              const collectionOptionsPayload = Array.isArray(queryPayload.collectionOptions)
                ? queryPayload.collectionOptions.filter((option): option is CakesCollectionOption => isCollectionOption(option) && option.productType === 'giftHamper')
                : []

              return {
                cakesPayload,
                collectionOptionsPayload
              }
            } finally {
              signal.removeEventListener('abort', relayAbortSignal)
            }
          }
        })

        if (!isEffectActive || requestAbortController.signal.aborted) {
          return
        }

        setLazyByPostCakes(payload.cakesPayload)
        setLazyByPostCakeCollections(payload.collectionOptionsPayload)
        hasLoadedLazyByPostCakesRef.current = true
      } catch (error) {
        if (!isEffectActive || requestAbortController.signal.aborted) {
          return
        }

        setHasLazyByPostCakesError(true)
        console.error('Failed to load by-post cakes for catalog:', error)
      } finally {
        if (isEffectActive) {
          setIsLazyByPostCakesLoading(false)
        }
      }
    }

    void loadByPostCakes()

    return () => {
      isEffectActive = false
      requestAbortController.abort()
      void queryClient.cancelQueries({ queryKey: byPostCakesQueryKey })
    }
  }, [effectiveByPostFilter, lazyByPostCakesEndpoint, queryClient, shouldLazyLoadByPostCakes])

  const collectionIdSet = useMemo(
    () => new Set(availableCollectionOptions.map((option) => option.id)),
    [availableCollectionOptions]
  )
  const collectionIdByQueryValue = useMemo(() => {
    const entries = availableCollectionOptions.flatMap((option) => {
      const aliasEntries = option.legacyQueryValues.map((value) => [value, option.id] as const)
      return [[option.queryValue, option.id] as const, ...aliasEntries]
    })

    return new Map<string, string>(entries)
  }, [availableCollectionOptions])
  const collectionQueryValueById = useMemo(() => {
    return new Map(
      availableCollectionOptions.map((option) => [option.id, option.queryValue] as const)
    )
  }, [availableCollectionOptions])
  const selectedCollectionValues = useMemo(
    () => queryState.collections.filter((value) => collectionIdByQueryValue.has(value)),
    [collectionIdByQueryValue, queryState.collections]
  )
  const lockedCollectionValues = useMemo(() => {
    return lockedCollectionQueryValues.filter((value) => collectionIdByQueryValue.has(value))
  }, [collectionIdByQueryValue, lockedCollectionQueryValues])
  const lockedCollectionIds = useMemo(() => {
    const collectionIds = lockedCollectionValues
      .map((value) => collectionIdByQueryValue.get(value))
      .filter((value): value is string => value !== undefined)

    return Array.from(new Set(collectionIds)).filter((collectionId) => collectionIdSet.has(collectionId))
  }, [collectionIdByQueryValue, collectionIdSet, lockedCollectionValues])
  const lockedCollectionIdSet = useMemo(() => new Set(lockedCollectionIds), [lockedCollectionIds])
  const effectiveCollectionValues = useMemo(() => {
    const nextCollectionValues = optimisticCollectionValues ?? selectedCollectionValues

    return Array.from(new Set([...nextCollectionValues, ...lockedCollectionValues]))
  }, [lockedCollectionValues, optimisticCollectionValues, selectedCollectionValues])
  const selectedCollectionIds = useMemo(() => {
    const collectionIds = effectiveCollectionValues
      .map((value) => collectionIdByQueryValue.get(value))
      .filter((value): value is string => value !== undefined)

    return Array.from(new Set(collectionIds)).filter((collectionId) => collectionIdSet.has(collectionId))
  }, [collectionIdByQueryValue, collectionIdSet, effectiveCollectionValues])
  const getLoadedScopePriceCeiling = useCallback(({

    showByPost,
    showCustom,
    selectedCollectionIds
  }: PriceScopeInput) => {
    const hasCategoryFilter = showByPost || showCustom
    const categoryScopedItems = hasCategoryFilter
      ? catalogItems.filter((item) => {
        const matchesByPost = showByPost && item.productType === 'giftHamper'
        const matchesCustom = showCustom && item.productType === 'cake'

        return matchesByPost || matchesCustom
      })
      : catalogItems

    if (selectedCollectionIds.length === 0) {
      return getPriceCeiling(categoryScopedItems)
    }

    const selectedCollectionSet = new Set(selectedCollectionIds)
    const collectionScopedItems = categoryScopedItems.filter((item) => {
      return item.collectionIds.some((collectionId) => selectedCollectionSet.has(collectionId))
    })

    return getPriceCeiling(collectionScopedItems)
  }, [catalogItems])
  const categoryFilteredItems = useMemo(() => {
    const hasCategoryFilter = effectiveByPostFilter || effectiveCustomFilter

    if (!hasCategoryFilter) {
      return catalogItems
    }

    return catalogItems.filter((cake) => {
      const matchesByPost = effectiveByPostFilter && cake.productType === 'giftHamper'
      const matchesCustom = effectiveCustomFilter && cake.productType === 'cake'

      return matchesByPost || matchesCustom
    })
  }, [catalogItems, effectiveByPostFilter, effectiveCustomFilter])
  const priceScopeItems = useMemo(() => {
    if (selectedCollectionIds.length === 0) {
      return categoryFilteredItems
    }

    return categoryFilteredItems.filter((cake) => {
      return cake.collectionIds.some((collectionId) => selectedCollectionIds.includes(collectionId))
    })
  }, [categoryFilteredItems, selectedCollectionIds])
  const scopedPriceCeiling = useMemo(() => {
    return getLoadedScopePriceCeiling({
      showByPost: effectiveByPostFilter,
      showCustom: effectiveCustomFilter,
      selectedCollectionIds
    })
  }, [effectiveByPostFilter, effectiveCustomFilter, getLoadedScopePriceCeiling, selectedCollectionIds])
  const shouldApplyCustomPriceCeilingHint = useMemo(() => {
    return typeof lazyCustomCakesPriceCeilingHint === 'number' &&
      effectiveCustomFilter &&
      selectedCollectionIds.length === 0 &&
      shouldLazyLoadCustomCakes &&
      lazyCustomCakes.length === 0 &&
      !hasLazyCustomCakesError
  }, [
    effectiveCustomFilter,
    hasLazyCustomCakesError,
    lazyCustomCakes.length,
    lazyCustomCakesPriceCeilingHint,
    selectedCollectionIds.length,
    shouldLazyLoadCustomCakes
  ])
  const shouldApplyByPostPriceCeilingHint = useMemo(() => {
    return typeof lazyByPostCakesPriceCeilingHint === 'number' &&
      effectiveByPostFilter &&
      selectedCollectionIds.length === 0 &&
      shouldLazyLoadByPostCakes &&
      lazyByPostCakes.length === 0 &&
      !hasLazyByPostCakesError
  }, [
    effectiveByPostFilter,
    hasLazyByPostCakesError,
    lazyByPostCakes.length,
    lazyByPostCakesPriceCeilingHint,
    selectedCollectionIds.length,
    shouldLazyLoadByPostCakes
  ])
  const priceCeiling = useMemo(() => {
    let nextPriceCeiling = scopedPriceCeiling

    if (shouldApplyCustomPriceCeilingHint && typeof lazyCustomCakesPriceCeilingHint === 'number') {
      nextPriceCeiling = Math.max(nextPriceCeiling, lazyCustomCakesPriceCeilingHint)
    }

    if (shouldApplyByPostPriceCeilingHint && typeof lazyByPostCakesPriceCeilingHint === 'number') {
      nextPriceCeiling = Math.max(nextPriceCeiling, lazyByPostCakesPriceCeilingHint)
    }

    return nextPriceCeiling
  }, [
    lazyByPostCakesPriceCeilingHint,
    lazyCustomCakesPriceCeilingHint,
    scopedPriceCeiling,
    shouldApplyByPostPriceCeilingHint,
    shouldApplyCustomPriceCeilingHint
  ])
  const queryMaxPrice = useMemo(() => {
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
  const maxPrice = optimisticMaxPrice ?? queryMaxPrice

  const selectedSort = queryState.sort
  const filters = useMemo<CakesFilterState>(() => {
    return {
      showByPost: effectiveByPostFilter,
      showCustom: effectiveCustomFilter,
      maxPrice,
      selectedCollectionIds
    }
  }, [effectiveByPostFilter, effectiveCustomFilter, maxPrice, selectedCollectionIds])

  useEffect(() => {
    const previousLazyCustomCakes = previousLazyCustomCakesRef.current
    const previousLazyByPostCakes = previousLazyByPostCakesRef.current
    previousLazyCustomCakesRef.current = lazyCustomCakes
    previousLazyByPostCakesRef.current = lazyByPostCakes

    const hasLazyCustomCakesChanged =
      previousLazyCustomCakes !== null && previousLazyCustomCakes !== lazyCustomCakes
    const hasLazyByPostCakesChanged =
      previousLazyByPostCakes !== null && previousLazyByPostCakes !== lazyByPostCakes

    if (!hasLazyCustomCakesChanged && !hasLazyByPostCakesChanged) {
      return
    }

    if (isMaxPriceQueryWritePending || !isMaxPriceAutoSyncEnabled) {
      return
    }

    const nextLoadedScopePriceCeiling = getLoadedScopePriceCeiling({
      showByPost: effectiveByPostFilter,
      showCustom: effectiveCustomFilter,
      selectedCollectionIds
    })

    if (queryState.maxPrice === nextLoadedScopePriceCeiling) {
      return
    }

    setOptimisticMaxPrice(nextLoadedScopePriceCeiling)
    const queryWriteId = beginMaxPriceQueryWrite()
    void setQueryState({
      maxPrice: nextLoadedScopePriceCeiling,
      page: null
    }).finally(() => {
      finishMaxPriceQueryWrite(queryWriteId)
    })
  }, [
    beginMaxPriceQueryWrite,
    effectiveByPostFilter,
    effectiveCustomFilter,
    finishMaxPriceQueryWrite,
    getLoadedScopePriceCeiling,
    isMaxPriceQueryWritePending,
    isMaxPriceAutoSyncEnabled,
    lazyByPostCakes,
    lazyCustomCakes,
    queryState.maxPrice,
    selectedCollectionIds,
    setQueryState
  ])

  const handleToggleByPost = useCallback((checked: boolean) => {
    const nextLoadedScopePriceCeiling = getLoadedScopePriceCeiling({
      showByPost: checked,
      showCustom: effectiveCustomFilter,
      selectedCollectionIds: []
    })

    setOptimisticByPostFilter(checked)
    setOptimisticCollectionValues([])
    setIsMaxPriceAutoSyncEnabled(true)
    setOptimisticMaxPrice(nextLoadedScopePriceCeiling)
    scheduleOptimisticByPostReset()
    const queryWriteId = beginMaxPriceQueryWrite()
    void setQueryState({
      byPost: checked,
      maxPrice: nextLoadedScopePriceCeiling,
      collections: [],
      page: null
    }).finally(() => {
      finishMaxPriceQueryWrite(queryWriteId)
    })
  }, [
    beginMaxPriceQueryWrite,
    effectiveCustomFilter,
    finishMaxPriceQueryWrite,
    getLoadedScopePriceCeiling,
    scheduleOptimisticByPostReset,
    setQueryState
  ])

  const handleToggleCustom = useCallback((checked: boolean) => {
    const nextLoadedScopePriceCeiling = getLoadedScopePriceCeiling({
      showByPost: effectiveByPostFilter,
      showCustom: checked,
      selectedCollectionIds: []
    })

    setOptimisticCustomFilter(checked)
    setOptimisticCollectionValues([])
    setIsMaxPriceAutoSyncEnabled(true)
    setOptimisticMaxPrice(nextLoadedScopePriceCeiling)
    scheduleOptimisticCustomReset()
    const queryWriteId = beginMaxPriceQueryWrite()
    void setQueryState({
      custom: checked,
      maxPrice: nextLoadedScopePriceCeiling,
      collections: [],
      page: null
    }).finally(() => {
      finishMaxPriceQueryWrite(queryWriteId)
    })
  }, [
    beginMaxPriceQueryWrite,
    effectiveByPostFilter,
    finishMaxPriceQueryWrite,
    getLoadedScopePriceCeiling,
    scheduleOptimisticCustomReset,
    setQueryState
  ])

  const handlePriceChange = useCallback((price: number) => {
    const clampedPrice = Math.min(Math.max(price, 0), priceCeiling)
    setIsMaxPriceAutoSyncEnabled(false)
    setOptimisticMaxPrice(clampedPrice)
    const queryWriteId = beginMaxPriceQueryWrite()
    void setQueryState({
      maxPrice: clampedPrice,
      page: null
    }).finally(() => {
      finishMaxPriceQueryWrite(queryWriteId)
    })
  }, [
    beginMaxPriceQueryWrite,
    priceCeiling,
    finishMaxPriceQueryWrite,
    setQueryState
  ])

  const handleToggleCollection = useCallback((collectionId: string, checked: boolean) => {
    if (lockedCollectionIdSet.has(collectionId)) {
      return
    }

    const queryValue = collectionQueryValueById.get(collectionId)

    if (!queryValue) {
      return
    }

    const nextCollectionValues = checked
      ? Array.from(
        new Set([
          ...effectiveCollectionValues.filter((value) => collectionIdByQueryValue.get(value) !== collectionId),
          queryValue
        ])
      )
      : effectiveCollectionValues.filter((value) => collectionIdByQueryValue.get(value) !== collectionId)
    const nextSelectedCollectionIds = nextCollectionValues
      .map((value) => collectionIdByQueryValue.get(value))
      .filter((value): value is string => value !== undefined)
    const normalizedNextSelectedCollectionIds = Array.from(new Set(nextSelectedCollectionIds))
      .filter((nextCollectionId) => collectionIdSet.has(nextCollectionId))
    const nextLoadedScopePriceCeiling = getLoadedScopePriceCeiling({
      showByPost: effectiveByPostFilter,
      showCustom: effectiveCustomFilter,
      selectedCollectionIds: normalizedNextSelectedCollectionIds
    })

    setOptimisticCollectionValues(nextCollectionValues)
    setIsMaxPriceAutoSyncEnabled(true)
    setOptimisticMaxPrice(nextLoadedScopePriceCeiling)
    const queryWriteId = beginMaxPriceQueryWrite()
    void setQueryState({
      collections: nextCollectionValues,
      maxPrice: nextLoadedScopePriceCeiling,
      page: null
    }).finally(() => {
      finishMaxPriceQueryWrite(queryWriteId)
    })
  }, [
    beginMaxPriceQueryWrite,
    collectionIdByQueryValue,
    collectionIdSet,
    collectionQueryValueById,
    effectiveByPostFilter,
    effectiveCustomFilter,
    effectiveCollectionValues,
    finishMaxPriceQueryWrite,
    getLoadedScopePriceCeiling,
    lockedCollectionIdSet,
    setQueryState
  ])

  const handleReset = useCallback(() => {
    if (optimisticByPostResetTimeoutRef.current) {
      clearTimeout(optimisticByPostResetTimeoutRef.current)
      optimisticByPostResetTimeoutRef.current = null
    }

    if (optimisticCustomResetTimeoutRef.current) {
      clearTimeout(optimisticCustomResetTimeoutRef.current)
      optimisticCustomResetTimeoutRef.current = null
    }

    setOptimisticByPostFilter(null)
    setOptimisticCustomFilter(null)
    setOptimisticCollectionValues(null)
    setOptimisticMaxPrice(null)
    setIsMaxPriceAutoSyncEnabled(false)
    maxPriceQueryWriteIdRef.current += 1
    setActiveMaxPriceQueryWriteId(0)
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
  const resetMobileVisibleCount = useCallback((tab: MobileTab) => {
    setMobileVisibleCountByTab((previousVisibleCountByTab) => {
      if (previousVisibleCountByTab[tab] === MOBILE_PAGE_SIZE) {
        return previousVisibleCountByTab
      }

      return {
        ...previousVisibleCountByTab,
        [tab]: MOBILE_PAGE_SIZE
      }
    })
  }, [])
  const handleOpenMobileFilterSort = useCallback(() => {
    const normalizedDraftCollectionIds = Array.from(new Set(selectedCollectionIds))
      .filter((collectionId) => activeCollectionIdSet.has(collectionId))

    setMobileDraftSort(selectedSort)
    setMobileDraftSelectedCollectionIds(normalizedDraftCollectionIds)
    setIsMobileFilterSortOpen(true)
  }, [
    activeCollectionIdSet,
    selectedCollectionIds,
    selectedSort
  ])
  const handleCancelMobileFilterSort = useCallback(() => {
    setIsMobileFilterSortOpen(false)
  }, [])
  const handleMobileDraftCollectionToggle = useCallback((collectionId: string, checked: boolean) => {
    if (lockedCollectionIdSet.has(collectionId)) {
      return
    }

    setMobileDraftSelectedCollectionIds((previousCollectionIds) => {
      const nextCollectionIds = checked
        ? [...previousCollectionIds, collectionId]
        : previousCollectionIds.filter((selectedCollectionId) => selectedCollectionId !== collectionId)

      return Array.from(new Set([...nextCollectionIds, ...lockedCollectionIds]))
        .filter((selectedCollectionId) => activeCollectionIdSet.has(selectedCollectionId))
    })
  }, [activeCollectionIdSet, lockedCollectionIdSet, lockedCollectionIds])
  const handleApplyMobileFilterSort = useCallback(() => {
    const normalizedDraftCollectionIds = Array.from(new Set([...mobileDraftSelectedCollectionIds, ...lockedCollectionIds]))
      .filter((collectionId) => activeCollectionIdSet.has(collectionId))
    const nextCollectionValues = normalizedDraftCollectionIds
      .filter((collectionId) => !lockedCollectionIdSet.has(collectionId))
      .map((collectionId) => collectionQueryValueById.get(collectionId))
      .filter((value): value is string => value !== undefined)

    setOptimisticCollectionValues(nextCollectionValues)
    setIsMobileFilterSortOpen(false)
    resetMobileVisibleCount(activeMobileTab)
    void setQueryState({
      sort: mobileDraftSort,
      collections: nextCollectionValues,
      page: null
    })
  }, [
    activeMobileTab,
    activeCollectionIdSet,
    collectionQueryValueById,
    lockedCollectionIds,
    lockedCollectionIdSet,
    mobileDraftSelectedCollectionIds,
    mobileDraftSort,
    resetMobileVisibleCount,
    setQueryState
  ])

  const handleMobileTabChange = useCallback((tab: MobileTab) => {
    if (!shouldShowProductTypeFilters || tab === activeMobileTab) {
      return
    }

    if (optimisticByPostResetTimeoutRef.current) {
      clearTimeout(optimisticByPostResetTimeoutRef.current)
      optimisticByPostResetTimeoutRef.current = null
    }

    if (optimisticCustomResetTimeoutRef.current) {
      clearTimeout(optimisticCustomResetTimeoutRef.current)
      optimisticCustomResetTimeoutRef.current = null
    }

    const showByPost = tab === 'byPost'
    const showCustom = tab === 'custom'

    setOptimisticByPostFilter(showByPost)
    setOptimisticCustomFilter(showCustom)
    setOptimisticCollectionValues(null)
    setOptimisticMaxPrice(null)
    setIsMaxPriceAutoSyncEnabled(false)
    setIsMobileFilterSortOpen(false)
    scheduleOptimisticByPostReset()
    scheduleOptimisticCustomReset()
    scrollWindowToTop()

    void setQueryState({
      byPost: showByPost,
      custom: showCustom,
      sort: null,
      collections: null,
      page: null
    })
  }, [
    activeMobileTab,
    scheduleOptimisticByPostReset,
    scheduleOptimisticCustomReset,
    shouldShowProductTypeFilters,
    setQueryState
  ])
  const handleMobileViewModeChange = useCallback((viewMode: MobileViewMode) => {
    if (viewMode === activeMobileViewMode) {
      return
    }

    setActiveMobileViewMode(viewMode)
    writeStoredMobileViewMode(viewMode)
  }, [activeMobileViewMode])

  const desktopFilteredCakes = useMemo(() => {
    const withPrice = priceScopeItems.filter((cake) => cake.price <= filters.maxPrice)
    const cakesCopy = [...withPrice]

    if (selectedSort === 'priceHighToLow') {
      return cakesCopy.sort((firstCake, secondCake) => secondCake.price - firstCake.price)
    }

    if (selectedSort === 'priceLowToHigh') {
      return cakesCopy.sort((firstCake, secondCake) => firstCake.price - secondCake.price)
    }

    return cakesCopy
  }, [filters.maxPrice, priceScopeItems, selectedSort])
  const mobileFilteredCakes = useMemo(() => {
    const cakesCopy = [...priceScopeItems]

    if (selectedSort === 'priceHighToLow') {
      return cakesCopy.sort((firstCake, secondCake) => secondCake.price - firstCake.price)
    }

    if (selectedSort === 'priceLowToHigh') {
      return cakesCopy.sort((firstCake, secondCake) => firstCake.price - secondCake.price)
    }

    return cakesCopy
  }, [priceScopeItems, selectedSort])
  const mobileTabItems = useMemo(() => {
    return getTabCatalogItems(mobileFilteredCakes, activeMobileTab)
  }, [activeMobileTab, mobileFilteredCakes])
  const mobileVisibleCount = mobileVisibleCountByTab[activeMobileTab]
  const mobileVisibleItems = useMemo(() => {
    return mobileTabItems.slice(0, mobileVisibleCount)
  }, [mobileTabItems, mobileVisibleCount])
  const hasMoreMobileItems = mobileVisibleCount < mobileTabItems.length
  const isPendingFirstCustomLazyLoad = effectiveCustomFilter &&
    shouldLazyLoadCustomCakes &&
    !hasCustomCakesInInitialData &&
    !hasLoadedLazyCustomCakesRef.current &&
    lazyCustomCakes.length === 0 &&
    !hasLazyCustomCakesError
  const isPendingFirstByPostLazyLoad = effectiveByPostFilter &&
    shouldLazyLoadByPostCakes &&
    !hasByPostCakesInInitialData &&
    !hasLoadedLazyByPostCakesRef.current &&
    lazyByPostCakes.length === 0 &&
    !hasLazyByPostCakesError
  const tabletTotalPages = useMemo(() => {
    return Math.max(1, Math.ceil(desktopFilteredCakes.length / TABLET_PAGE_SIZE))
  }, [desktopFilteredCakes.length])
  const smallLaptopTotalPages = useMemo(() => {
    return Math.max(1, Math.ceil(desktopFilteredCakes.length / SMALL_LAPTOP_PAGE_SIZE))
  }, [desktopFilteredCakes.length])
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
  const isDesktopLcpCandidate = useCallback((index: number) => {
    return index === tabletPageStartIndex || index === smallLaptopPageStartIndex
  }, [smallLaptopPageStartIndex, tabletPageStartIndex])
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
  const shouldShowCustomCakesLoadingState = (
    isLazyCustomCakesLoading &&
    effectiveCustomFilter &&
    !hasCustomCakesInInitialData &&
    lazyCustomCakes.length === 0
  ) || isPendingFirstCustomLazyLoad
  const shouldShowByPostCakesLoadingState = (
    isLazyByPostCakesLoading &&
    effectiveByPostFilter &&
    !hasByPostCakesInInitialData &&
    lazyByPostCakes.length === 0
  ) || isPendingFirstByPostLazyLoad
  const shouldShowLazyCatalogLoadingState = shouldShowCustomCakesLoadingState || shouldShowByPostCakesLoadingState
  const shouldShowLazyCatalogErrorState = (
    hasLazyCustomCakesError &&
    effectiveCustomFilter &&
    !hasCustomCakesInInitialData
  ) || (
    hasLazyByPostCakesError &&
    effectiveByPostFilter &&
    !hasByPostCakesInInitialData
  )
  const lazyCatalogLoadingMessage = shouldShowCustomCakesLoadingState
    ? 'Loading custom cakes...'
    : 'Loading cakes by post...'
  const mobileLoadingMessage = activeMobileTab === 'custom'
    ? 'Loading custom cakes...'
    : 'Loading cakes by post...'
  const shouldShowMobileLoadingState = activeMobileTab === 'custom'
    ? shouldShowCustomCakesLoadingState
    : shouldShowByPostCakesLoadingState
  const shouldShowMobileErrorState = activeMobileTab === 'custom'
    ? hasLazyCustomCakesError && !hasCustomCakesInInitialData
    : hasLazyByPostCakesError && !hasByPostCakesInInitialData
  const shouldShowMobilePreHydrationShell = !hasHydrated && !isMobileViewport
  const shouldRenderMobileLayout = isMobileViewport
  const canUseIntersectionObserver = typeof IntersectionObserver !== 'undefined'
  const shouldShowMobileLoadMoreButton = hasMoreMobileItems &&
    !shouldShowMobileLoadingState &&
    !canUseIntersectionObserver
  const loadMoreMobileItems = useCallback(() => {
    setMobileVisibleCountByTab((previousVisibleCountByTab) => {
      const previousVisibleCount = previousVisibleCountByTab[activeMobileTab]
      const nextVisibleCount = Math.min(
        previousVisibleCount + MOBILE_PAGE_SIZE,
        mobileTabItems.length
      )

      if (nextVisibleCount === previousVisibleCount) {
        return previousVisibleCountByTab
      }

      return {
        ...previousVisibleCountByTab,
        [activeMobileTab]: nextVisibleCount
      }
    })
  }, [activeMobileTab, mobileTabItems.length])

  useEffect(() => {
    if (!isMobileViewport || !hasMoreMobileItems || shouldShowMobileLoadingState) {
      return
    }

    if (!canUseIntersectionObserver) {
      return
    }

    const sentinelElement = mobileSentinelRef.current

    if (!sentinelElement) {
      return
    }

    const observer = new IntersectionObserver((entries) => {
      const shouldLoadMore = entries.some((entry) => entry.isIntersecting)

      if (!shouldLoadMore) {
        return
      }

      loadMoreMobileItems()
    }, {
      root: null,
      rootMargin: MOBILE_SENTINEL_ROOT_MARGIN,
      threshold: 0.1
    })

    observer.observe(sentinelElement)

    return () => {
      observer.disconnect()
    }
  }, [
    canUseIntersectionObserver,
    hasMoreMobileItems,
    isMobileViewport,
    loadMoreMobileItems,
    shouldShowMobileLoadingState
  ])

  useEffect(() => {
    setHasHydrated(true)
  }, [])

  useEffect(() => {
    if (isMobileViewport || !isMobileFilterSortOpen) {
      return
    }

    setIsMobileFilterSortOpen(false)
  }, [isMobileFilterSortOpen, isMobileViewport])

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
  const getPaginationHref = useCallback((targetPage: number) => {
    const searchParams = new URLSearchParams()

    if (queryState.sort !== 'new') {
      searchParams.set('sort', queryState.sort)
    }

    if (queryState.byPost !== initialFilterDefaults.byPost) {
      searchParams.set('byPost', String(queryState.byPost))
    }

    if (queryState.custom !== initialFilterDefaults.custom) {
      searchParams.set('custom', String(queryState.custom))
    }

    if (queryState.maxPrice !== null) {
      searchParams.set('maxPrice', String(queryState.maxPrice))
    }

    if (queryState.collections.length > 0) {
      searchParams.set('collections', queryState.collections.join(','))
    }

    if (targetPage > 1) {
      searchParams.set('page', String(targetPage))
    }

    const queryString = searchParams.toString()

    if (queryString.length === 0) {
      return pathname && pathname.length > 0
        ? pathname
        : getCatalogBasePath(initialFilterDefaults)
    }

    return `?${queryString}`
  }, [
    initialFilterDefaults,
    pathname,
    queryState.byPost,
    queryState.collections,
    queryState.custom,
    queryState.maxPrice,
    queryState.sort
  ])
  const handlePaginationLinkClick = useCallback((
    event: MouseEvent<HTMLAnchorElement>,
    targetPage: number,
    currentPage: number,
    totalPages: number
  ) => {
    if (!isPlainLeftClick(event)) {
      return
    }

    event.preventDefault()
    handlePageChange(targetPage, currentPage, totalPages)
  }, [handlePageChange])

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
            <a
              href={getPaginationHref(currentPage - 1)}
              aria-label={previousPageLabel}
              onClick={(event) => handlePaginationLinkClick(
                event,
                currentPage - 1,
                currentPage,
                totalPages
              )}
              className={prevNextItemClassName}
            >
              <span aria-hidden='true' className='text-base leading-none'>&lsaquo;</span>
              <span>Previous</span>
            </a>
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

            return isActivePage ? (
              <button
                type='button'
                key={pageNumber}
                aria-label={getPageLabel(pageNumber)}
                aria-current='page'
                disabled
                style={{
                  backgroundColor: 'var(--color-primary-500)',
                  color: 'var(--color-primary-50)'
                }}
                className={`${pageItemClassName} ${activePageItemClassName}`}
              >
                {pageNumber}
              </button>
            ) : (
              <a
                href={getPaginationHref(pageNumber)}
                key={pageNumber}
                aria-label={getPageLabel(pageNumber)}
                onClick={(event) => handlePaginationLinkClick(
                  event,
                  pageNumber,
                  currentPage,
                  totalPages
                )}
                className={`${pageItemClassName} ${inactivePageItemClassName}`}
              >
                {pageNumber}
              </a>
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
            <a
              href={getPaginationHref(currentPage + 1)}
              aria-label={nextPageLabel}
              onClick={(event) => handlePaginationLinkClick(
                event,
                currentPage + 1,
                currentPage,
                totalPages
              )}
              className={prevNextItemClassName}
            >
              <span>Next</span>
              <span aria-hidden='true' className='text-base leading-none'>&rsaquo;</span>
            </a>
          )}
        </div>
      </nav>
    )
  }, [
    activePageItemClassName,
    ellipsisItemClassName,
    getPaginationHref,
    handlePaginationLinkClick,
    inactivePageItemClassName,
    pageItemClassName,
    prevNextItemClassName
  ])
  const mobileTabBaseClassName = 'flex-1 border-b-2 pb-3 text-center font-moreSugar text-sm leading-5 tracking-normal transition-colors'
  const mobileTabActiveClassName = 'border-primary-500 text-primary-500'
  const mobileTabInactiveClassName = 'border-b-primary-500/20 text-primary-200'
  const mobileFilterSortLabelClassName = 'font-sans font-semibold text-[15px] leading-7 tracking-[0] align-middle text-(--color-filter-sort-mobile-text)'
  const mobileFilterSortIconButtonClassName = 'inline-flex h-6 w-6 items-center justify-center rounded-[6px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500'
  const mobileFilterSortIconBaseClassName = 'h-4 w-4 transition-colors'
  const mobileFilterSortIconActiveClassName = 'text-(--color-filter-sort-mobile-icon-active)'
  const mobileFilterSortIconInactiveClassName = 'text-(--color-filter-sort-mobile-icon-inactive)'
  const mobileGridIconClassName = `${mobileFilterSortIconBaseClassName} ${
    activeMobileViewMode === 'grid'
      ? mobileFilterSortIconActiveClassName
      : mobileFilterSortIconInactiveClassName
  }`
  const mobileOutlineIconClassName = `${mobileFilterSortIconBaseClassName} ${
    activeMobileViewMode === 'single'
      ? mobileFilterSortIconActiveClassName
      : mobileFilterSortIconInactiveClassName
  }`
  const effectiveMobileViewMode: MobileViewMode = shouldUseInlineCompactMobileToolbar ? 'grid' : activeMobileViewMode
  const mobileCatalogGridClassName = effectiveMobileViewMode === 'grid'
    ? 'mt-6 grid grid-cols-2 gap-4'
    : 'mt-6 grid grid-cols-1 gap-4'
  const isMobileLcpCandidate = useCallback((index: number) => {
    if (effectiveMobileViewMode === 'single') {
      return index === 0
    }

    return index < 2
  }, [effectiveMobileViewMode])
  function renderMobileCatalogContent({
    includeInfiniteScrollSentinel,
    includeFilterSortSheet,
    includeNoScriptCrawlLinks,
    allowLcpCandidates
  }: {
    includeInfiniteScrollSentinel: boolean
    includeFilterSortSheet: boolean
    includeNoScriptCrawlLinks: boolean
    allowLcpCandidates: boolean
  }) {
    return (
      <>
        {shouldShowProductTypeFilters ? (
          <div className='flex items-end gap-0 border-b border-base-300' role='tablist' aria-label='Catalog category tabs'>
            <button
              type='button'
              role='tab'
              aria-selected={activeMobileTab === 'byPost'}
              onClick={() => handleMobileTabChange('byPost')}
              className={`${mobileTabBaseClassName} ${
                activeMobileTab === 'byPost' ? mobileTabActiveClassName : mobileTabInactiveClassName
              }`}
            >
              Cakes by post
            </button>
            <button
              type='button'
              role='tab'
              aria-selected={activeMobileTab === 'custom'}
              onClick={() => handleMobileTabChange('custom')}
              className={`${mobileTabBaseClassName} ${
                activeMobileTab === 'custom' ? mobileTabActiveClassName : mobileTabInactiveClassName
              }`}
            >
              Custom cakes
            </button>
          </div>
        ) : null}
        <div className={`${shouldShowProductTypeFilters ? 'mt-8' : 'mt-2'} ${shouldUseInlineCompactMobileToolbar ? 'block' : 'flex items-center justify-between'}`}>
          {shouldUseInlineCompactMobileToolbar ? (
            <div className='min-w-0'>
              <p className='mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-base-content/80'>
                Sort by
              </p>
              <CakesSortBar
                selectedSort={selectedSort}
                onSelectSort={handleSortChange}
                layout='inline-compact'
              />
            </div>
          ) : (
            <>
              <button
                type='button'
                aria-label='Filter & Sort'
                onClick={handleOpenMobileFilterSort}
                className='btn btn-ghost h-auto min-h-0 border-transparent bg-transparent p-0 normal-case shadow-none hover:border-transparent hover:bg-transparent hover:shadow-none focus:border-transparent focus:bg-transparent focus:!outline-none focus:!shadow-none focus-visible:border-transparent focus-visible:bg-transparent focus-visible:!outline-none focus-visible:!shadow-none'
              >
                <span className={mobileFilterSortLabelClassName}>
                  Filter & Sort
                </span>
              </button>
              <div role='group' aria-label='Mobile catalog view mode' className='flex items-center gap-2'>
                <button
                  type='button'
                  aria-label='Grid view'
                  aria-pressed={activeMobileViewMode === 'grid'}
                  onClick={() => handleMobileViewModeChange('grid')}
                  className={mobileFilterSortIconButtonClassName}
                >
                  <svg
                    data-testid='mobile-filter-sort-grid-icon'
                    width='16'
                    height='16'
                    viewBox='0 0 16 16'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                    className={mobileGridIconClassName}
                    focusable='false'
                  >
                    <path
                      d='M4.75 9C5.99264 9 7 10.0074 7 11.25V13.75C7 14.9926 5.99264 16 4.75 16H2.25C1.00736 16 0 14.9926 0 13.75V11.25C0 10.0074 1.00736 9 2.25 9H4.75ZM13.75 9C14.9926 9 16 10.0074 16 11.25V13.75C16 14.9926 14.9926 16 13.75 16H11.25C10.0074 16 9 14.9926 9 13.75V11.25C9 10.0074 10.0074 9 11.25 9H13.75ZM4.75 0C5.99264 0 7 1.00736 7 2.25V4.75C7 5.99264 5.99264 7 4.75 7H2.25C1.00736 7 0 5.99264 0 4.75V2.25C0 1.00736 1.00736 0 2.25 0H4.75ZM13.75 0C14.9926 0 16 1.00736 16 2.25V4.75C16 5.99264 14.9926 7 13.75 7H11.25C10.0074 7 9 5.99264 9 4.75V2.25C9 1.00736 10.0074 0 11.25 0H13.75Z'
                      fill='currentColor'
                    />
                  </svg>
                </button>
                <button
                  type='button'
                  aria-label='Single-column view'
                  aria-pressed={activeMobileViewMode === 'single'}
                  onClick={() => handleMobileViewModeChange('single')}
                  className={mobileFilterSortIconButtonClassName}
                >
                  <svg
                    data-testid='mobile-filter-sort-outline-icon'
                    width='16'
                    height='16'
                    viewBox='0 0 16 16'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                    className={mobileOutlineIconClassName}
                    focusable='false'
                  >
                    <path
                      fillRule='evenodd'
                      clipRule='evenodd'
                      d='M0 5.14286C0 2.30254 2.30254 0 5.14286 0H10.8571C13.6975 0 16 2.30254 16 5.14286V10.8571C16 13.6975 13.6975 16 10.8571 16H5.14286C2.30254 16 0 13.6975 0 10.8571V5.14286ZM5.14286 3.42857C4.19608 3.42857 3.42857 4.19608 3.42857 5.14286V10.8571C3.42857 11.8039 4.19608 12.5714 5.14286 12.5714H10.8571C11.8039 12.5714 12.5714 11.8039 12.5714 10.8571V5.14286C12.5714 4.19608 11.8039 3.42857 10.8571 3.42857H5.14286Z'
                      fill='currentColor'
                    />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>

        {mobileVisibleItems.length > 0 ? (
          <div data-testid='mobile-catalog-grid' className={mobileCatalogGridClassName}>
            {mobileVisibleItems.map((cake, index) => (
              <div key={cake.id} className='h-full'>
                <CakesProductCard
                  cake={cake}
                  linkHref={buildProductCardLinkHref(cake.href)}
                  variant='mobile'
                  mobileViewMode={effectiveMobileViewMode}
                  isLcpCandidate={allowLcpCandidates && isMobileLcpCandidate(index)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className='mt-6 rounded-box border border-dashed border-base-300 bg-base-100 p-10 text-center'>
            {shouldShowMobileLoadingState ? (
              <CatalogLogoLoader
                srLabel={mobileLoadingMessage}
                testId='mobile-catalog-logo-loader'
              />
            ) : (
              <p className='text-base text-base-content/70'>
                No cakes match the selected filters yet.
              </p>
            )}
            {shouldShowMobileErrorState && (
              <p className='mt-2 text-sm text-base-content/60'>
                We could not load some products right now. Please try again.
              </p>
            )}
          </div>
        )}
        {includeNoScriptCrawlLinks &&
        mobileTabItems.length > MOBILE_PAGE_SIZE ? (
          <noscript>
            <nav aria-label='Catalog product crawl links' className='mt-6'>
              <ul className='list-disc pl-6'>
                {mobileTabItems.map((cake) => (
                  <li key={`noscript-${cake.id}`}>
                    <a href={cake.href}>{cake.name}</a>
                  </li>
                ))}
              </ul>
            </nav>
          </noscript>
        ) : null}

        {includeInfiniteScrollSentinel &&
        canUseIntersectionObserver &&
        hasMoreMobileItems &&
        !shouldShowMobileLoadingState ? (
          <div
            ref={mobileSentinelRef}
            data-testid='mobile-infinite-scroll-sentinel'
            className='mt-8 h-8 w-full'
          />
        ) : null}
        {includeInfiniteScrollSentinel && shouldShowMobileLoadMoreButton ? (
          <div className='mt-8 flex justify-center'>
            <button
              type='button'
              onClick={loadMoreMobileItems}
              className='btn btn-outline btn-primary btn-sm min-h-11 rounded-field normal-case'
            >
              Load more
            </button>
          </div>
        ) : null}
        {includeFilterSortSheet && shouldRenderMobileFilterSheet ? (
          <CakesMobileFilterSortSheet
            open={isMobileFilterSortOpen}
            selectedSort={mobileDraftSort}
            featuredCollectionOptions={featuredCollectionOptions}
            collectionOptions={nonFeaturedCollectionOptions}
            selectedCollectionIds={mobileDraftSelectedCollectionIds}
            lockedCollectionIds={lockedCollectionIds}
            onSortChange={setMobileDraftSort}
            onToggleCollection={handleMobileDraftCollectionToggle}
            onApply={handleApplyMobileFilterSort}
            onCancel={handleCancelMobileFilterSort}
          />
        ) : null}
      </>
    )
  }

  return (
    <section className={catalogSectionClassName}>
      {featuredOffer ? (
        <div className='hidden tablet:block'>
          {!shouldRenderMobileLayout ? <CakesFeaturedOffer featuredOffer={featuredOffer} /> : null}
        </div>
      ) : null}

      {shouldShowMobilePreHydrationShell ? (
        <div className='mt-2 tablet:hidden' data-testid='mobile-prehydration-shell'>
          {renderMobileCatalogContent({
            includeInfiniteScrollSentinel: false,
            includeFilterSortSheet: false,
            includeNoScriptCrawlLinks: true,
            allowLcpCandidates: false
          })}
        </div>
      ) : null}

      {shouldRenderMobileLayout ? (
        <div className='mt-2'>
          {renderMobileCatalogContent({
            includeInfiniteScrollSentinel: true,
            includeFilterSortSheet: shouldRenderMobileFilterSheet,
            includeNoScriptCrawlLinks: false,
            allowLcpCandidates: true
          })}
        </div>
      ) : (
        <div className={`hidden flex-col gap-5 tablet:flex ${shouldRenderDesktopFilters ? 'mt-10 tablet:flex-row tablet:items-start tablet:gap-6' : isCategoryLanding ? 'mt-3' : 'mt-4'}`} data-testid='desktop-catalog-layout'>
          {shouldRenderDesktopFilters ? (
            <div className='tablet:w-60 tablet:flex-none'>
              <CakesFilterSidebar
                filters={filters}
                priceMax={priceCeiling}
                collectionOptions={availableCollectionOptions}
                isByPostLoading={shouldShowByPostCakesLoadingState}
                isCustomLoading={shouldShowCustomCakesLoadingState}
                onToggleByPost={handleToggleByPost}
                onToggleCustom={handleToggleCustom}
                onPriceChange={handlePriceChange}
                onToggleCollection={handleToggleCollection}
                onReset={handleReset}
              />
            </div>
          ) : null}

          <div className={`min-w-0 ${shouldRenderDesktopFilters ? 'tablet:flex-1' : 'w-full'}`}>
            <div className={shouldRenderDesktopFilters ? '' : 'flex justify-start'}>
              <CakesSortBar selectedSort={selectedSort} onSelectSort={handleSortChange} />
            </div>
            {desktopFilteredCakes.length > 0 ? (
              <div className='mt-4 grid grid-cols-1 gap-4 tablet:auto-rows-fr tablet:grid-cols-2 small-laptop:grid-cols-3'>
                {desktopFilteredCakes.map((cake, index) => (
                  <div key={cake.id} className={getCakeItemClassName(index)}>
                    <CakesProductCard
                      cake={cake}
                      linkHref={buildProductCardLinkHref(cake.href)}
                      isLcpCandidate={isDesktopLcpCandidate(index)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className='mt-6 rounded-box border border-dashed border-base-300 bg-base-100 p-10 text-center'>
                {shouldShowLazyCatalogLoadingState ? (
                  <CatalogLogoLoader
                    srLabel={lazyCatalogLoadingMessage}
                    testId='desktop-catalog-logo-loader'
                  />
                ) : (
                  <p className='text-base text-base-content/70'>
                    No cakes match the selected filters yet.
                  </p>
                )}
                {shouldShowLazyCatalogErrorState && (
                  <p className='mt-2 text-sm text-base-content/60'>
                    We could not load some products right now. Please try again.
                  </p>
                )}
              </div>
            )}
            {desktopFilteredCakes.length > 0 && tabletTotalPages > 1
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
            {desktopFilteredCakes.length > 0 && smallLaptopTotalPages > 1
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
      )}
    </section>
  )
}









