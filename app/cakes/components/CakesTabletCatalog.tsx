'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
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
import {
  CakesCollectionOption,
  CakesFilterState,
  CakesSortOption,
  CakesTabletCatalogProps,
  TabletCake
} from './types'

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
  lazyByPostCakesPriceCeilingHint
}: CakesTabletCatalogProps) {
  const queryClient = useQueryClient()
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
  const effectiveByPostFilter = optimisticByPostFilter ?? queryState.byPost
  const effectiveCustomFilter = optimisticCustomFilter ?? queryState.custom
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
  const effectiveCollectionValues = optimisticCollectionValues ?? selectedCollectionValues
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

  const filteredCakes = useMemo(() => {
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
  const shouldShowCustomCakesLoadingState = isLazyCustomCakesLoading &&
    effectiveCustomFilter &&
    !hasCustomCakesInInitialData &&
    lazyCustomCakes.length === 0
  const shouldShowByPostCakesLoadingState = isLazyByPostCakesLoading &&
    effectiveByPostFilter &&
    !hasByPostCakesInInitialData &&
    lazyByPostCakes.length === 0
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
              <p className='text-base text-base-content/70'>
                {shouldShowLazyCatalogLoadingState
                  ? lazyCatalogLoadingMessage
                  : 'No cakes match the selected filters yet.'}
              </p>
              {shouldShowLazyCatalogErrorState && (
                <p className='mt-2 text-sm text-base-content/60'>
                  We could not load some products right now. Please try again.
                </p>
              )}
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
