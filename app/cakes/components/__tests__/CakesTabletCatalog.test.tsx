/**
 * @jest-environment jsdom
 */
import React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderToString } from 'react-dom/server.node'
import { CakesTabletCatalog } from '../CakesTabletCatalog'
import type { CakesCollectionOption, CatalogFilterDefaults, TabletCake } from '../types'

const renderedPriceValues: number[] = []
const renderedCardVariants: Array<'desktop' | 'mobile'> = []
const renderedMobileViewModes: Array<'grid' | 'single'> = []
const mobileViewModeStorageKey = 'catalog-mobile-view-mode'

function resetRenderedPriceValues() {
  renderedPriceValues.length = 0
}

function getRenderedPriceValues() {
  return [...renderedPriceValues]
}

function resetRenderedCardVariants() {
  renderedCardVariants.length = 0
}

function getRenderedCardVariants() {
  return [...renderedCardVariants]
}

function resetRenderedMobileViewModes() {
  renderedMobileViewModes.length = 0
}

function getRenderedMobileViewModes() {
  return [...renderedMobileViewModes]
}

interface MockObserverInstance {
  callback: IntersectionObserverCallback
  observedElements: Set<Element>
  observer: IntersectionObserver
}

const mockObserverInstances: MockObserverInstance[] = []

class MockIntersectionObserver implements IntersectionObserver {
  root: Element | Document | null
  rootMargin: string
  thresholds: ReadonlyArray<number>
  private readonly callback: IntersectionObserverCallback
  private readonly observedElements = new Set<Element>()

  constructor(callback: IntersectionObserverCallback, options: IntersectionObserverInit = {}) {
    this.callback = callback
    this.root = options.root ?? null
    this.rootMargin = options.rootMargin ?? ''
    const threshold = options.threshold
    this.thresholds = Array.isArray(threshold)
      ? [...threshold]
      : [threshold ?? 0]

    mockObserverInstances.push({
      callback: this.callback,
      observedElements: this.observedElements,
      observer: this
    })
  }

  disconnect() {
    this.observedElements.clear()
  }

  observe(target: Element) {
    this.observedElements.add(target)
  }

  takeRecords() {
    return []
  }

  unobserve(target: Element) {
    this.observedElements.delete(target)
  }
}

function resetMockIntersectionObservers() {
  mockObserverInstances.length = 0
}

function triggerMobileInfiniteSentinelIntersection() {
  const sentinel = screen.queryByTestId('mobile-infinite-scroll-sentinel')

  if (!sentinel) {
    return
  }

  mockObserverInstances.forEach((instance) => {
    if (!instance.observedElements.has(sentinel)) {
      return
    }

    const boundingRect = sentinel.getBoundingClientRect()
    const entry = {
      time: Date.now(),
      target: sentinel,
      isIntersecting: true,
      intersectionRatio: 1,
      boundingClientRect: boundingRect,
      intersectionRect: boundingRect,
      rootBounds: null
    } satisfies IntersectionObserverEntry

    act(() => {
      instance.callback([entry], instance.observer)
    })
  })
}

jest.mock('nuqs', () => {
  const React = require('react') as typeof import('react')

  type Parser<T> = {
    defaultValue?: T
    parse: (value: string | null) => T | null
    serialize: (value: T) => string
    withDefault: (value: T) => Parser<T>
  }

  function createParser<T>(
    parse: (value: string | null) => T | null,
    serialize: (value: T) => string = (value) => String(value)
  ): Parser<T> {
    function build(defaultValue?: T): Parser<T> {
      return {
        defaultValue,
        parse,
        serialize,
        withDefault(value: T) {
          return build(value)
        }
      }
    }

    return build()
  }

  const parseAsString = createParser<string>((value) => value)
  const parseAsBoolean = createParser<boolean>((value) => {
    if (value === 'true') {
      return true
    }

    if (value === 'false') {
      return false
    }

    return null
  })
  const parseAsInteger = createParser<number>((value) => {
    if (value === null) {
      return null
    }

    const parsed = Number(value)
    return Number.isInteger(parsed) ? parsed : null
  })
  const parseAsStringLiteral = (values: readonly string[]) => createParser<string>((value) => {
    if (!value) {
      return null
    }

    return values.includes(value) ? value : null
  })
  const parseAsArrayOf = (itemParser: Parser<string>, separator = ',') => createParser<string[]>(
    (value) => {
      if (!value) {
        return []
      }

      return value
        .split(separator)
        .map((item) => itemParser.parse(item))
        .filter((item): item is string => item !== null)
    },
    (value) => value.map((item) => itemParser.serialize(item)).join(separator)
  )

  function isSameAsDefault(value: unknown, defaultValue: unknown) {
    if (Array.isArray(value) && Array.isArray(defaultValue)) {
      if (value.length !== defaultValue.length) {
        return false
      }

      return value.every((item, index) => item === defaultValue[index])
    }

    return value === defaultValue
  }

  function useQueryStates(parsers: Record<string, Parser<unknown>>) {
    const getStateFromUrl = React.useCallback(() => {
      const params = new URLSearchParams(window.location.search)
      const initialState: Record<string, unknown> = {}

      Object.entries(parsers).forEach(([key, parser]) => {
        const parsed = parser.parse(params.get(key))
        initialState[key] = parsed === null
          ? parser.defaultValue ?? null
          : parsed
      })

      return initialState
    }, [parsers])

    const [state, setState] = React.useState(() => {
      return getStateFromUrl()
    })

    React.useEffect(() => {
      const handlePopState = () => {
        setState(getStateFromUrl())
      }

      window.addEventListener('popstate', handlePopState)

      return () => {
        window.removeEventListener('popstate', handlePopState)
      }
    }, [getStateFromUrl])

    function setQueryState(updates: Record<string, unknown>) {
      setState((previousState: Record<string, unknown>) => {
        const nextState = { ...previousState }

        Object.entries(updates).forEach(([key, value]) => {
          const parser = parsers[key]
          nextState[key] = value === null
            ? parser.defaultValue ?? null
            : value
        })

        const nextSearchParams = new URLSearchParams()

        Object.entries(parsers).forEach(([key, parser]) => {
          const value = nextState[key]

          if (value === null || value === undefined || isSameAsDefault(value, parser.defaultValue)) {
            return
          }

          nextSearchParams.set(key, parser.serialize(value))
        })

        const queryString = nextSearchParams.toString()
        const nextUrl = queryString.length > 0
          ? `${window.location.pathname}?${queryString}`
          : window.location.pathname
        window.history.replaceState({}, '', nextUrl)

        return nextState
      })

      return Promise.resolve(new URLSearchParams(window.location.search))
    }

    return [state, setQueryState] as const
  }

  return {
    parseAsArrayOf,
    parseAsBoolean,
    parseAsInteger,
    parseAsString,
    parseAsStringLiteral,
    useQueryStates
  }
})

jest.mock('next/navigation', () => ({
  usePathname: () => window.location.pathname
}))

jest.mock('../CakesFeaturedOffer', () => ({
  CakesFeaturedOffer: () => <div data-testid='featured-offer'>Featured offer</div>
}))

jest.mock('../CakesProductCard', () => ({
  CakesProductCard: ({
    cake,
    linkHref,
    variant = 'desktop',
    mobileViewMode = 'grid',
    isLcpCandidate = false
  }: {
    cake: { name: string, href: string }
    linkHref?: string
    variant?: 'desktop' | 'mobile'
    mobileViewMode?: 'grid' | 'single'
    isLcpCandidate?: boolean
  }) => {
    renderedCardVariants.push(variant)
    if (variant === 'mobile') {
      renderedMobileViewModes.push(mobileViewMode)
    }

    return (
      <a href={linkHref ?? cake.href} aria-label={`View details for ${cake.name}`}>
        <article
          data-testid='cake-card'
          data-variant={variant}
          data-mobile-view-mode={mobileViewMode}
          data-is-lcp-candidate={isLcpCandidate ? 'true' : 'false'}
        >
          {cake.name}
        </article>
      </a>
    )
  }
}))

jest.mock('../CakesSortBar', () => ({
  CakesSortBar: ({
    onSelectSort
  }: {
    onSelectSort: (option: 'new' | 'priceHighToLow' | 'priceLowToHigh') => void
  }) => (
    <div>
      <button type='button' onClick={() => onSelectSort('new')}>
        Sort new
      </button>
      <button type='button' onClick={() => onSelectSort('priceHighToLow')}>
        Sort high to low
      </button>
      <button type='button' onClick={() => onSelectSort('priceLowToHigh')}>
        Sort low to high
      </button>
    </div>
  )
}))

jest.mock('../CakesFilterSidebar', () => ({
  CakesFilterSidebar: ({
    filters,
    priceMax,
    collectionOptions,
    isByPostLoading,
    isCustomLoading,
    onToggleByPost,
    onToggleCustom,
    onPriceChange,
    onToggleCollection,
    onReset
  }: {
    filters: {
      showByPost: boolean
      showCustom: boolean
      maxPrice: number
      selectedCollectionIds: string[]
    }
    priceMax: number
    collectionOptions: Array<{ id: string, label: string }>
    isByPostLoading: boolean
    isCustomLoading: boolean
    onToggleByPost: (checked: boolean) => void
    onToggleCustom: (checked: boolean) => void
    onPriceChange: (price: number) => void
    onToggleCollection: (collectionId: string, checked: boolean) => void
    onReset: () => void
  }) => {
    const firstCollection = collectionOptions[0]
    const secondCollection = collectionOptions[1]
    renderedPriceValues.push(filters.maxPrice)

    return (
      <div>
        {isByPostLoading ? <span data-testid='by-post-inline-loader' /> : null}
        {isCustomLoading ? <span data-testid='custom-inline-loader' /> : null}
        <button type='button' onClick={() => onToggleByPost(!filters.showByPost)}>
          Toggle by post
        </button>
        <button type='button' onClick={() => onToggleCustom(!filters.showCustom)}>
          Toggle custom
        </button>
        <input
          type='range'
          min={0}
          max={priceMax}
          value={filters.maxPrice}
          aria-label='Price range'
          onChange={(event) => onPriceChange(Number(event.target.value))}
        />
        <button
          type='button'
          onClick={() => {
            if (!firstCollection) {
              return
            }

            onToggleCollection(
              firstCollection.id,
              !filters.selectedCollectionIds.includes(firstCollection.id)
            )
          }}
        >
          Toggle first collection
        </button>
        <button
          type='button'
          onClick={() => {
            if (!secondCollection) {
              return
            }

            onToggleCollection(
              secondCollection.id,
              !filters.selectedCollectionIds.includes(secondCollection.id)
            )
          }}
        >
          Toggle second collection
        </button>
        <button type='button' onClick={onReset}>
          Reset filters
        </button>
      </div>
    )
  }
}))

jest.mock('../CakesMobileFilterSortSheet', () => ({
  CakesMobileFilterSortSheet: ({
    open,
    selectedSort,
    selectedCollectionIds,
    onSortChange,
    onToggleCollection,
    onApply,
    onCancel
  }: {
    open: boolean
    selectedSort: 'new' | 'priceHighToLow' | 'priceLowToHigh'
    selectedCollectionIds: string[]
    onSortChange: (option: 'new' | 'priceHighToLow' | 'priceLowToHigh') => void
    onToggleCollection: (collectionId: string, checked: boolean) => void
    onApply: () => void
    onCancel: () => void
  }) => {
    if (!open) {
      return null
    }

    return (
      <div data-testid='mobile-filter-sort-sheet'>
        <p data-testid='mobile-filter-sort-draft-sort'>{selectedSort}</p>
        <button type='button' onClick={() => onSortChange('priceHighToLow')}>
          Draft sort high to low
        </button>
        <button type='button' onClick={() => onSortChange('priceLowToHigh')}>
          Draft sort low to high
        </button>
        <button
          type='button'
          onClick={() => onToggleCollection('collection-1', !selectedCollectionIds.includes('collection-1'))}
        >
          Draft first collection
        </button>
        <button type='button' onClick={onApply}>
          Apply mobile filters
        </button>
        <button type='button' onClick={onCancel}>
          Cancel mobile filters
        </button>
        <button type='button' onClick={onCancel}>
          Dismiss mobile filters via backdrop
        </button>
        <button type='button' onClick={onCancel}>
          Dismiss mobile filters via esc
        </button>
      </div>
    )
  }
}))

const collectionOptions: CakesCollectionOption[] = [
  {
    id: 'collection-1',
    queryValue: 'c-celebration',
    legacyQueryValues: ['collection-1'],
    label: 'Celebration',
    isFeatured: false,
    productType: 'cake'
  },
  {
    id: 'collection-2',
    queryValue: 'c-signature',
    legacyQueryValues: ['collection-2'],
    label: 'Signature',
    isFeatured: false,
    productType: 'cake'
  }
]
const mixedCollectionOptions: CakesCollectionOption[] = [
  ...collectionOptions,
  {
    id: 'collection-h-postal',
    queryValue: 'h-postal-gifts',
    legacyQueryValues: ['collection-h-postal'],
    label: 'Postal gifts',
    isFeatured: false,
    productType: 'giftHamper'
  }
]

function createCake(index: number): TabletCake {
  return {
    id: `cake-${index}`,
    slug: `cake-${index}`,
    href: `/cakes/cake-${index}`,
    navigationTarget: 'product',
    name: `Cake ${index}`,
    description: `Description ${index}`,
    price: index,
    imageUrl: `/images/cake-${index}.jpg`,
    imageAlt: `Cake ${index}`,
    isByPost: false,
    isCustom: true,
    isPopular: false,
    collectionIds: ['collection-1'],
    productType: 'cake'
  }
}

function createGiftHamper(index: number): TabletCake {
  return {
    id: `hamper-${index}`,
    slug: `hamper-${index}`,
    href: `/cakes-by-post/hamper-${index}`,
    navigationTarget: 'product',
    name: `Hamper ${index}`,
    description: `Hamper description ${index}`,
    price: 20 + index,
    imageUrl: `/images/hamper-${index}.jpg`,
    imageAlt: `Hamper ${index}`,
    isByPost: true,
    isCustom: false,
    isPopular: false,
    collectionIds: ['collection-1'],
    productType: 'giftHamper'
  }
}

function createMixedCatalogItems({
  customCount,
  byPostCount
}: {
  customCount: number
  byPostCount: number
}) {
  return [
    ...Array.from({ length: customCount }, (_, index) => createCake(index + 1)),
    ...Array.from({ length: byPostCount }, (_, index) => createGiftHamper(index + 1))
  ]
}

function setViewportWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: width
  })
}

function renderCatalog({
  items,
  cakeCount = 10,
  pathname = '/cakes',
  search = '',
  viewportWidth = 1200,
  collectionOptionsOverride,
  initialFilterDefaults = { byPost: false, custom: true },
  lazyCustomCakesEndpoint,
  lazyCustomCakesPriceCeilingHint,
  lazyByPostCakesEndpoint,
  lazyByPostCakesPriceCeilingHint,
  strictMode = false,
  catalogMode = 'all-cakes',
  showProductTypeFilters = true,
  showDesktopFilters = true,
  showMobileFilterSheet = true,
  showPriceFilter = true,
  showCollectionFilters = true,
  mobileToolbarVariant = 'full'
}: {
  items?: TabletCake[]
  cakeCount?: number
  pathname?: '/cakes' | '/cakes-by-post' | '/gift-hampers'
  search?: string
  viewportWidth?: number
  collectionOptionsOverride?: CakesCollectionOption[]
  initialFilterDefaults?: CatalogFilterDefaults
  lazyCustomCakesEndpoint?: string
  lazyCustomCakesPriceCeilingHint?: number
  lazyByPostCakesEndpoint?: string
  lazyByPostCakesPriceCeilingHint?: number
  strictMode?: boolean
  catalogMode?: 'all-cakes' | 'category-landing'
  showProductTypeFilters?: boolean
  showDesktopFilters?: boolean
  showMobileFilterSheet?: boolean
  showPriceFilter?: boolean
  showCollectionFilters?: boolean
  mobileToolbarVariant?: 'full' | 'inline-compact'
} = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  })
  const cakes = items ?? Array.from({ length: cakeCount }, (_, index) => createCake(index + 1))
  window.history.replaceState({}, '', `${pathname}${search}`)
  setViewportWidth(viewportWidth)

  const catalog = (
    <CakesTabletCatalog
      cakes={cakes}
      featuredOffer={null}
      collectionOptions={collectionOptionsOverride ?? collectionOptions}
      initialFilterDefaults={initialFilterDefaults}
      lazyCustomCakesEndpoint={lazyCustomCakesEndpoint}
      lazyCustomCakesPriceCeilingHint={lazyCustomCakesPriceCeilingHint}
      lazyByPostCakesEndpoint={lazyByPostCakesEndpoint}
      lazyByPostCakesPriceCeilingHint={lazyByPostCakesPriceCeilingHint}
      catalogMode={catalogMode}
      showProductTypeFilters={showProductTypeFilters}
      showDesktopFilters={showDesktopFilters}
      showMobileFilterSheet={showMobileFilterSheet}
      showPriceFilter={showPriceFilter}
      showCollectionFilters={showCollectionFilters}
      mobileToolbarVariant={mobileToolbarVariant}
    />
  )

  return render(
    <QueryClientProvider client={queryClient}>
      {strictMode
        ? <React.StrictMode>{catalog}</React.StrictMode>
        : catalog}
    </QueryClientProvider>
  )
}

function renderCatalogToMarkup({
  items,
  cakeCount = 10,
  pathname = '/cakes',
  search = '',
  viewportWidth = 1200,
  collectionOptionsOverride,
  initialFilterDefaults = { byPost: false, custom: true },
  lazyCustomCakesEndpoint,
  lazyCustomCakesPriceCeilingHint,
  lazyByPostCakesEndpoint,
  lazyByPostCakesPriceCeilingHint,
  catalogMode = 'all-cakes',
  showProductTypeFilters = true,
  showDesktopFilters = true,
  showMobileFilterSheet = true,
  showPriceFilter = true,
  showCollectionFilters = true,
  mobileToolbarVariant = 'full'
}: {
  items?: TabletCake[]
  cakeCount?: number
  pathname?: '/cakes' | '/cakes-by-post' | '/gift-hampers'
  search?: string
  viewportWidth?: number
  collectionOptionsOverride?: CakesCollectionOption[]
  initialFilterDefaults?: CatalogFilterDefaults
  lazyCustomCakesEndpoint?: string
  lazyCustomCakesPriceCeilingHint?: number
  lazyByPostCakesEndpoint?: string
  lazyByPostCakesPriceCeilingHint?: number
  catalogMode?: 'all-cakes' | 'category-landing'
  showProductTypeFilters?: boolean
  showDesktopFilters?: boolean
  showMobileFilterSheet?: boolean
  showPriceFilter?: boolean
  showCollectionFilters?: boolean
  mobileToolbarVariant?: 'full' | 'inline-compact'
} = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  })
  const cakes = items ?? Array.from({ length: cakeCount }, (_, index) => createCake(index + 1))
  window.history.replaceState({}, '', `${pathname}${search}`)
  setViewportWidth(viewportWidth)

  return renderToString(
    <QueryClientProvider client={queryClient}>
      <CakesTabletCatalog
        cakes={cakes}
        featuredOffer={null}
        collectionOptions={collectionOptionsOverride ?? collectionOptions}
        initialFilterDefaults={initialFilterDefaults}
        lazyCustomCakesEndpoint={lazyCustomCakesEndpoint}
        lazyCustomCakesPriceCeilingHint={lazyCustomCakesPriceCeilingHint}
        lazyByPostCakesEndpoint={lazyByPostCakesEndpoint}
        lazyByPostCakesPriceCeilingHint={lazyByPostCakesPriceCeilingHint}
        catalogMode={catalogMode}
        showProductTypeFilters={showProductTypeFilters}
        showDesktopFilters={showDesktopFilters}
        showMobileFilterSheet={showMobileFilterSheet}
        showPriceFilter={showPriceFilter}
        showCollectionFilters={showCollectionFilters}
        mobileToolbarVariant={mobileToolbarVariant}
      />
    </QueryClientProvider>
  )
}

function getCakeWrapper(cakeName: string) {
  const cakeCard = screen.getByText(cakeName).closest('[data-testid="cake-card"]')

  if (!cakeCard) {
    return null
  }

  return cakeCard.parentElement?.parentElement ?? null
}

function expectCakeVisibleOnTablet(cakeName: string) {
  const wrapper = getCakeWrapper(cakeName)
  expect(wrapper).not.toBeNull()
  expect(wrapper).not.toHaveClass('tablet:hidden')
}

function expectCakeHiddenOnTablet(cakeName: string) {
  const wrapper = getCakeWrapper(cakeName)
  expect(wrapper).not.toBeNull()
  expect(wrapper).toHaveClass('tablet:hidden')
}

describe('CakesTabletCatalog', () => {
  const originalFetch = global.fetch
  const originalIntersectionObserver = global.IntersectionObserver

  beforeAll(() => {
    global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver
  })

  beforeEach(() => {
    window.history.replaceState({}, '', '/cakes')
    setViewportWidth(1200)
    window.localStorage.clear()
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    resetRenderedPriceValues()
    resetRenderedCardVariants()
    resetRenderedMobileViewModes()
    resetMockIntersectionObservers()
    jest.restoreAllMocks()
    global.fetch = originalFetch
  })

  afterAll(() => {
    global.IntersectionObserver = originalIntersectionObserver
  })

  it('shows six cards and numeric pagination on tablet', async () => {
    renderCatalog()

    await waitFor(() => {
      expect(screen.getAllByTestId('cake-card')).toHaveLength(10)
    })

    expectCakeVisibleOnTablet('Cake 1')
    expectCakeVisibleOnTablet('Cake 6')
    expectCakeHiddenOnTablet('Cake 7')
    expectCakeHiddenOnTablet('Cake 10')
    expect(screen.getByRole('navigation', { name: 'Cake catalog pagination' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Go to page 1' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Go to page 1' })).toBeDisabled()
    expect(screen.getByRole('link', { name: 'Go to page 2' })).toHaveAttribute('href', '?page=2')
  })

  it('shows a 3x3 page on small laptop without viewport-driven pagination state', async () => {
    renderCatalog({ cakeCount: 19, viewportWidth: 1280 })

    await waitFor(() => {
      expect(screen.getAllByTestId('cake-card')).toHaveLength(19)
    })

    const cakeSevenWrapper = getCakeWrapper('Cake 7')
    const cakeNineWrapper = getCakeWrapper('Cake 9')
    const cakeTenWrapper = getCakeWrapper('Cake 10')

    expect(cakeSevenWrapper).toHaveClass('tablet:hidden', 'small-laptop:block')
    expect(cakeNineWrapper).toHaveClass('tablet:hidden', 'small-laptop:block')
    expect(cakeTenWrapper).toHaveClass('tablet:hidden')
    expect(cakeTenWrapper).not.toHaveClass('small-laptop:block')

    expect(screen.getByRole('link', { name: 'Go to page 2' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Go to small laptop page 2' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Go to small laptop page 3' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Go to small laptop page 4' })).not.toBeInTheDocument()
  })

  it('keeps URL clean when defaults are route presets', async () => {
    renderCatalog({
      items: [createCake(1), createGiftHamper(1)],
      initialFilterDefaults: {
        byPost: true,
        custom: false
      }
    })

    await waitFor(() => {
      expect(screen.getByText('Hamper 1')).toBeInTheDocument()
    })

    expect(window.location.search).toBe('')
    expect(screen.queryByText('Cake 1')).not.toBeInTheDocument()
  })

  it('respects cakes-route defaults and initially shows custom cakes', async () => {
    renderCatalog({
      items: [createCake(1), createGiftHamper(1)],
      initialFilterDefaults: {
        byPost: false,
        custom: true
      }
    })

    await waitFor(() => {
      expect(screen.getByText('Cake 1')).toBeInTheDocument()
    })

    expect(screen.queryByText('Hamper 1')).not.toBeInTheDocument()
  })

  it('loads custom cakes on demand when custom filter is enabled', async () => {
    const lazyLoadedCake = createCake(99)
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        cakes: [lazyLoadedCake],
        collectionOptions
      })
    } as Response)

    renderCatalog({
      items: [createGiftHamper(1)],
      initialFilterDefaults: {
        byPost: true,
        custom: false
      },
      lazyCustomCakesEndpoint: '/api/catalog/custom-cakes'
    })

    await waitFor(() => {
      expect(screen.getByText('Hamper 1')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Toggle custom' }))

    await waitFor(() => {
      expect(screen.getByText('Cake 99')).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/catalog/custom-cakes',
      expect.objectContaining({
        signal: expect.any(AbortSignal)
      })
    )
  })

  it('exposes custom inline loader flag while custom cakes are loading', async () => {
    let resolveFetch: ((response: Response) => void) | undefined
    const fetchPromise = new Promise<Response>((resolve) => {
      resolveFetch = resolve
    })

    jest.spyOn(global, 'fetch').mockReturnValue(fetchPromise)

    renderCatalog({
      items: [createGiftHamper(1)],
      initialFilterDefaults: {
        byPost: true,
        custom: false
      },
      lazyCustomCakesEndpoint: '/api/catalog/custom-cakes'
    })

    fireEvent.click(screen.getByRole('button', { name: 'Toggle custom' }))

    await waitFor(() => {
      expect(screen.getByTestId('custom-inline-loader')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('by-post-inline-loader')).not.toBeInTheDocument()

    resolveFetch?.({
      ok: true,
      json: async () => ({
        cakes: [createCake(99)],
        collectionOptions
      })
    } as Response)

    await waitFor(() => {
      expect(screen.queryByTestId('custom-inline-loader')).not.toBeInTheDocument()
    })
  })

  it('reuses the in-flight custom-cakes request across quick custom toggles', async () => {
    const lazyLoadedCake = createCake(120)
    let resolveFetch: ((response: Response) => void) | undefined
    const fetchPromise = new Promise<Response>((resolve) => {
      resolveFetch = resolve
    })
    const fetchMock = jest.spyOn(global, 'fetch').mockReturnValue(fetchPromise)

    renderCatalog({
      items: [createGiftHamper(1)],
      initialFilterDefaults: {
        byPost: true,
        custom: false
      },
      lazyCustomCakesEndpoint: '/api/catalog/custom-cakes'
    })

    fireEvent.click(screen.getByRole('button', { name: 'Toggle custom' }))
    fireEvent.click(screen.getByRole('button', { name: 'Toggle custom' }))
    fireEvent.click(screen.getByRole('button', { name: 'Toggle custom' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled()
    })

    expect(fetchMock).toHaveBeenLastCalledWith(
      '/api/catalog/custom-cakes',
      expect.objectContaining({
        signal: expect.any(AbortSignal)
      })
    )

    resolveFetch?.({
      ok: true,
      json: async () => ({
        cakes: [lazyLoadedCake],
        collectionOptions
      })
    } as Response)

    await waitFor(() => {
      expect(screen.getByText('Cake 120')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('desktop-catalog-logo-loader')).not.toBeInTheDocument()
  })

  it('switches price ceiling immediately on custom toggle when hint is provided', async () => {
    const hamperOnlyItem = {
      ...createGiftHamper(1),
      price: 13
    }
    const fetchPromise = new Promise<Response>(() => {})
    jest.spyOn(global, 'fetch').mockReturnValue(fetchPromise)

    renderCatalog({
      items: [hamperOnlyItem],
      initialFilterDefaults: {
        byPost: true,
        custom: false
      },
      lazyCustomCakesEndpoint: '/api/catalog/custom-cakes',
      lazyCustomCakesPriceCeilingHint: 80
    })

    expect(screen.getByLabelText('Price range')).toHaveAttribute('max', '13')

    fireEvent.click(screen.getByRole('button', { name: 'Toggle custom' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Price range')).toHaveAttribute('max', '80')
    })

    fireEvent.click(screen.getByRole('button', { name: 'Toggle custom' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Price range')).toHaveAttribute('max', '13')
    })
  })

  it('switches price ceiling immediately on by-post toggle when hint is provided', async () => {
    const customOnlyItem = {
      ...createCake(40),
      price: 40
    }
    const fetchPromise = new Promise<Response>(() => {})
    jest.spyOn(global, 'fetch').mockReturnValue(fetchPromise)

    renderCatalog({
      items: [customOnlyItem],
      initialFilterDefaults: {
        byPost: false,
        custom: true
      },
      lazyByPostCakesEndpoint: '/api/catalog/by-post-cakes',
      lazyByPostCakesPriceCeilingHint: 70
    })

    expect(screen.getByLabelText('Price range')).toHaveAttribute('max', '40')

    fireEvent.click(screen.getByRole('button', { name: 'Toggle by post' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Price range')).toHaveAttribute('max', '70')
    })

    fireEvent.click(screen.getByRole('button', { name: 'Toggle by post' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Price range')).toHaveAttribute('max', '40')
    })
  })

  it('recalculates price slider max when custom filter is turned off after lazy custom load', async () => {
    const hamperOnlyItem = {
      ...createGiftHamper(1),
      price: 13
    }
    const lazyLoadedCake = {
      ...createCake(80),
      price: 80
    }

    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        cakes: [lazyLoadedCake],
        collectionOptions
      })
    } as Response)

    renderCatalog({
      items: [hamperOnlyItem],
      initialFilterDefaults: {
        byPost: true,
        custom: false
      },
      lazyCustomCakesEndpoint: '/api/catalog/custom-cakes'
    })

    await waitFor(() => {
      expect(screen.getByLabelText('Price range')).toHaveAttribute('max', '13')
    })

    fireEvent.click(screen.getByRole('button', { name: 'Toggle custom' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Price range')).toHaveAttribute('max', '80')
    })

    fireEvent.click(screen.getByRole('button', { name: 'Toggle custom' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Price range')).toHaveAttribute('max', '13')
    })
  })

  it('loads cakes by post on demand when by-post filter is enabled', async () => {
    const lazyLoadedHamper = createGiftHamper(99)
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        cakes: [lazyLoadedHamper],
        collectionOptions: [
          {
            ...collectionOptions[0],
            id: 'collection-hampers',
            queryValue: 'h-postal-gifts',
            label: 'Postal gifts',
            productType: 'giftHamper'
          }
        ]
      })
    } as Response)

    renderCatalog({
      items: [createCake(1)],
      initialFilterDefaults: {
        byPost: false,
        custom: true
      },
      lazyByPostCakesEndpoint: '/api/catalog/by-post-cakes'
    })

    await waitFor(() => {
      expect(screen.getByText('Cake 1')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Toggle by post' }))

    await waitFor(() => {
      expect(screen.getByText('Hamper 99')).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/catalog/by-post-cakes',
      expect.objectContaining({
        signal: expect.any(AbortSignal)
      })
    )
  })

  it('exposes by-post inline loader flag while by-post cakes are loading', async () => {
    let resolveFetch: ((response: Response) => void) | undefined
    const fetchPromise = new Promise<Response>((resolve) => {
      resolveFetch = resolve
    })

    jest.spyOn(global, 'fetch').mockReturnValue(fetchPromise)

    renderCatalog({
      items: [createCake(1)],
      initialFilterDefaults: {
        byPost: false,
        custom: true
      },
      lazyByPostCakesEndpoint: '/api/catalog/by-post-cakes'
    })

    fireEvent.click(screen.getByRole('button', { name: 'Toggle by post' }))

    await waitFor(() => {
      expect(screen.getByTestId('by-post-inline-loader')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('custom-inline-loader')).not.toBeInTheDocument()

    resolveFetch?.({
      ok: true,
      json: async () => ({
        cakes: [createGiftHamper(99)],
        collectionOptions: [
          {
            ...collectionOptions[0],
            id: 'collection-hampers',
            queryValue: 'h-postal-gifts',
            label: 'Postal gifts',
            productType: 'giftHamper'
          }
        ]
      })
    } as Response)

    await waitFor(() => {
      expect(screen.queryByTestId('by-post-inline-loader')).not.toBeInTheDocument()
    })
  })

  it('loads custom cakes in strict mode and clears the loading state after completion', async () => {
    const lazyLoadedCake = createCake(109)
    let resolveFetch: ((response: Response) => void) | undefined
    const fetchPromise = new Promise<Response>((resolve) => {
      resolveFetch = resolve
    })

    jest.spyOn(global, 'fetch').mockReturnValue(fetchPromise)

    renderCatalog({
      items: [createGiftHamper(1)],
      initialFilterDefaults: {
        byPost: true,
        custom: false
      },
      lazyCustomCakesEndpoint: '/api/catalog/custom-cakes',
      strictMode: true
    })

    await waitFor(() => {
      expect(screen.getByText('Hamper 1')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Toggle custom' }))
    fireEvent.click(screen.getByRole('button', { name: 'Toggle by post' }))

    await waitFor(() => {
      expect(screen.getByTestId('desktop-catalog-logo-loader')).toBeInTheDocument()
      expect(screen.getByRole('status', { name: 'Loading custom cakes...' })).toBeInTheDocument()
    })
    expect(screen.queryByText('No cakes match the selected filters yet.')).not.toBeInTheDocument()

    resolveFetch?.({
      ok: true,
      json: async () => ({
        cakes: [lazyLoadedCake],
        collectionOptions
      })
    } as Response)

    await waitFor(() => {
      expect(screen.getByText('Cake 109')).toBeInTheDocument()
    })

    expect(screen.queryByTestId('desktop-catalog-logo-loader')).not.toBeInTheDocument()
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/catalog/custom-cakes',
      expect.objectContaining({
        signal: expect.any(AbortSignal)
      })
    )
  })

  it('loads cakes by post in strict mode and clears the loading state after completion', async () => {
    const lazyLoadedHamper = createGiftHamper(109)
    let resolveFetch: ((response: Response) => void) | undefined
    const fetchPromise = new Promise<Response>((resolve) => {
      resolveFetch = resolve
    })

    jest.spyOn(global, 'fetch').mockReturnValue(fetchPromise)

    renderCatalog({
      items: [createCake(1)],
      initialFilterDefaults: {
        byPost: false,
        custom: true
      },
      lazyByPostCakesEndpoint: '/api/catalog/by-post-cakes',
      strictMode: true
    })

    await waitFor(() => {
      expect(screen.getByText('Cake 1')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Toggle by post' }))
    fireEvent.click(screen.getByRole('button', { name: 'Toggle custom' }))

    await waitFor(() => {
      expect(screen.getByTestId('desktop-catalog-logo-loader')).toBeInTheDocument()
      expect(screen.getByRole('status', { name: 'Loading cakes by post...' })).toBeInTheDocument()
    })
    expect(screen.queryByText('No cakes match the selected filters yet.')).not.toBeInTheDocument()

    resolveFetch?.({
      ok: true,
      json: async () => ({
        cakes: [lazyLoadedHamper],
        collectionOptions: [
          {
            ...collectionOptions[0],
            id: 'collection-hampers',
            queryValue: 'h-postal-gifts',
            label: 'Postal gifts',
            productType: 'giftHamper'
          }
        ]
      })
    } as Response)

    await waitFor(() => {
      expect(screen.getByText('Hamper 109')).toBeInTheDocument()
    })

    expect(screen.queryByTestId('desktop-catalog-logo-loader')).not.toBeInTheDocument()
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/catalog/by-post-cakes',
      expect.objectContaining({
        signal: expect.any(AbortSignal)
      })
    )
  })

  it('renders branded loader in mobile full-list loading state and clears it after completion', async () => {
    const lazyLoadedCake = createCake(112)
    let resolveFetch: ((response: Response) => void) | undefined
    const fetchPromise = new Promise<Response>((resolve) => {
      resolveFetch = resolve
    })

    jest.spyOn(global, 'fetch').mockReturnValue(fetchPromise)

    renderCatalog({
      viewportWidth: 390,
      items: [createGiftHamper(1)],
      initialFilterDefaults: {
        byPost: true,
        custom: false
      },
      lazyCustomCakesEndpoint: '/api/catalog/custom-cakes'
    })

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Cakes by post' })).toHaveAttribute('aria-selected', 'true')
    })

    fireEvent.click(screen.getByRole('tab', { name: 'Custom cakes' }))

    await waitFor(() => {
      expect(screen.getByTestId('mobile-catalog-logo-loader')).toBeInTheDocument()
      expect(screen.getByRole('status', { name: 'Loading custom cakes...' })).toBeInTheDocument()
    })
    expect(screen.queryByText('No cakes match the selected filters yet.')).not.toBeInTheDocument()

    resolveFetch?.({
      ok: true,
      json: async () => ({
        cakes: [lazyLoadedCake],
        collectionOptions
      })
    } as Response)

    await waitFor(() => {
      expect(screen.getByText('Cake 112')).toBeInTheDocument()
    })

    expect(screen.queryByTestId('mobile-catalog-logo-loader')).not.toBeInTheDocument()
  })

  it('keeps loader visible first and then shows empty state when lazy mobile payload has no cakes', async () => {
    let resolveFetch: ((response: Response) => void) | undefined
    const fetchPromise = new Promise<Response>((resolve) => {
      resolveFetch = resolve
    })

    jest.spyOn(global, 'fetch').mockReturnValue(fetchPromise)

    renderCatalog({
      viewportWidth: 390,
      items: [createGiftHamper(1)],
      initialFilterDefaults: {
        byPost: true,
        custom: false
      },
      lazyCustomCakesEndpoint: '/api/catalog/custom-cakes'
    })

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Cakes by post' })).toHaveAttribute('aria-selected', 'true')
    })

    fireEvent.click(screen.getByRole('tab', { name: 'Custom cakes' }))

    await waitFor(() => {
      expect(screen.getByTestId('mobile-catalog-logo-loader')).toBeInTheDocument()
    })
    expect(screen.queryByText('No cakes match the selected filters yet.')).not.toBeInTheDocument()

    resolveFetch?.({
      ok: true,
      json: async () => ({
        cakes: [],
        collectionOptions
      })
    } as Response)

    await waitFor(() => {
      expect(screen.queryByTestId('mobile-catalog-logo-loader')).not.toBeInTheDocument()
    })
    expect(screen.getByText('No cakes match the selected filters yet.')).toBeInTheDocument()
  })

  it('recalculates price slider max when custom filter is turned off after lazy by-post load', async () => {
    const customOnlyItem = {
      ...createCake(40),
      price: 40
    }
    const lazyLoadedHamper = {
      ...createGiftHamper(10),
      price: 10
    }

    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        cakes: [lazyLoadedHamper],
        collectionOptions: [
          {
            ...collectionOptions[0],
            id: 'collection-hampers',
            queryValue: 'h-postal-gifts',
            label: 'Postal gifts',
            productType: 'giftHamper'
          }
        ]
      })
    } as Response)

    renderCatalog({
      items: [customOnlyItem],
      initialFilterDefaults: {
        byPost: false,
        custom: true
      },
      lazyByPostCakesEndpoint: '/api/catalog/by-post-cakes'
    })

    await waitFor(() => {
      expect(screen.getByLabelText('Price range')).toHaveAttribute('max', '40')
    })

    fireEvent.click(screen.getByRole('button', { name: 'Toggle by post' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Price range')).toHaveAttribute('max', '40')
    })

    fireEvent.click(screen.getByRole('button', { name: 'Toggle custom' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Price range')).toHaveAttribute('max', '10')
    })
  })

  it('prioritizes lazy-loaded custom cakes before hampers to match previous listing order', async () => {
    const lazyLoadedCakes = Array.from({ length: 6 }, (_, index) => createCake(200 + index))
    const manyHampers = Array.from({ length: 8 }, (_, index) => createGiftHamper(100 + index))
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        cakes: lazyLoadedCakes,
        collectionOptions
      })
    } as Response)

    renderCatalog({
      items: manyHampers,
      initialFilterDefaults: {
        byPost: true,
        custom: false
      },
      lazyCustomCakesEndpoint: '/api/catalog/custom-cakes'
    })

    fireEvent.click(screen.getByRole('button', { name: 'Toggle custom' }))

    await waitFor(() => {
      expect(screen.getByText('Cake 200')).toBeInTheDocument()
      expect(screen.getByText('Cake 205')).toBeInTheDocument()
    })

    expectCakeHiddenOnTablet('Hamper 100')
  })

  it('scrolls to top on initial render', async () => {
    document.documentElement.scrollTop = 180
    document.body.scrollTop = 120

    renderCatalog()

    await waitFor(() => {
      expect(document.documentElement.scrollTop).toBe(0)
      expect(document.body.scrollTop).toBe(0)
    })
  })

  it('updates URL and visible cards when selecting another page', async () => {
    renderCatalog()

    await waitFor(() => {
      expect(screen.getAllByTestId('cake-card')).toHaveLength(10)
    })

    document.documentElement.scrollTop = 210
    document.body.scrollTop = 140
    fireEvent.click(screen.getByRole('link', { name: 'Go to page 2' }))

    await waitFor(() => {
      expect(window.location.search).toContain('page=2')
      expect(document.documentElement.scrollTop).toBe(0)
      expect(document.body.scrollTop).toBe(0)
    })
    expect(screen.getByRole('button', { name: 'Go to page 2' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Go to page 2' })).toBeDisabled()
    expectCakeVisibleOnTablet('Cake 7')
    expectCakeHiddenOnTablet('Cake 1')
  })

  it('resets page when changing sort', async () => {
    renderCatalog({ search: '?page=2' })

    await waitFor(() => {
      expect(screen.getByText('Cake 7')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Sort high to low' }))

    await waitFor(() => {
      expect(window.location.search).not.toContain('page=')
    })
    expect(screen.getByRole('button', { name: 'Go to page 1' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Go to page 1' })).toBeDisabled()
    expect(window.location.search).toContain('sort=priceHighToLow')
  })

  it('does not change scroll position when sort resets pagination', async () => {
    renderCatalog({ search: '?page=2' })

    await waitFor(() => {
      expect(screen.getByText('Cake 7')).toBeInTheDocument()
    })

    document.documentElement.scrollTop = 240
    document.body.scrollTop = 160
    fireEvent.click(screen.getByRole('button', { name: 'Sort high to low' }))

    await waitFor(() => {
      expect(window.location.search).not.toContain('page=')
    })
    expect(document.documentElement.scrollTop).toBe(240)
    expect(document.body.scrollTop).toBe(160)
  })

  it('resets page when toggling by post filter', async () => {
    renderCatalog({ search: '?page=2' })

    fireEvent.click(screen.getByRole('button', { name: 'Toggle by post' }))

    await waitFor(() => {
      expect(window.location.search).toContain('byPost=true')
    })
    expect(window.location.search).not.toContain('page=')
  })

  it('resets page when toggling custom filter', async () => {
    renderCatalog({ search: '?page=2' })

    fireEvent.click(screen.getByRole('button', { name: 'Toggle custom' }))

    await waitFor(() => {
      expect(window.location.search).toContain('custom=false')
    })
    expect(window.location.search).not.toContain('page=')
  })

  it('resets page when changing price filter', async () => {
    renderCatalog({ search: '?page=2' })

    fireEvent.change(screen.getByLabelText('Price range'), {
      target: { value: '5' }
    })

    await waitFor(() => {
      expect(window.location.search).toContain('maxPrice=5')
    })
    expect(window.location.search).not.toContain('page=')
  })

  it('resets page when changing collection filter', async () => {
    renderCatalog({ search: '?page=2' })

    fireEvent.click(screen.getByRole('button', { name: 'Toggle first collection' }))

    await waitFor(() => {
      expect(window.location.search).toContain('collections=c-celebration')
    })
    expect(window.location.search).not.toContain('page=')
  })

  it('resets maxPrice to loaded scope max when changing collection filter', async () => {
    renderCatalog({ search: '?page=2&maxPrice=5' })

    expect((screen.getByLabelText('Price range') as HTMLInputElement).value).toBe('5')

    fireEvent.click(screen.getByRole('button', { name: 'Toggle first collection' }))

    await waitFor(() => {
      expect(window.location.search).toContain('collections=c-celebration')
      expect(window.location.search).toContain('maxPrice=10')
      expect((screen.getByLabelText('Price range') as HTMLInputElement).value).toBe('10')
    })
  })

  it('sets maxPrice to collection ceiling when collection change lowers the price ceiling', async () => {
    const firstCollectionCake = {
      ...createCake(1),
      price: 30,
      collectionIds: ['collection-1']
    }
    const secondCollectionCake = {
      ...createCake(2),
      price: 80,
      collectionIds: ['collection-2']
    }

    renderCatalog({
      items: [firstCollectionCake, secondCollectionCake],
      search: '?maxPrice=50'
    })

    expect((screen.getByLabelText('Price range') as HTMLInputElement).value).toBe('50')

    fireEvent.click(screen.getByRole('button', { name: 'Toggle first collection' }))

    await waitFor(() => {
      expect(window.location.search).toContain('collections=c-celebration')
      expect(window.location.search).toContain('maxPrice=30')
      expect(screen.getByLabelText('Price range')).toHaveAttribute('max', '30')
      expect((screen.getByLabelText('Price range') as HTMLInputElement).value).toBe('30')
    })
  })

  it('with implicit maxPrice, collection change writes explicit loaded ceiling', async () => {
    const firstCollectionCake = {
      ...createCake(1),
      price: 30,
      collectionIds: ['collection-1']
    }
    const secondCollectionCake = {
      ...createCake(2),
      price: 80,
      collectionIds: ['collection-2']
    }

    renderCatalog({
      items: [firstCollectionCake, secondCollectionCake]
    })

    expect((screen.getByLabelText('Price range') as HTMLInputElement).value).toBe('80')
    expect(screen.getByLabelText('Price range')).toHaveAttribute('max', '80')

    fireEvent.click(screen.getByRole('button', { name: 'Toggle first collection' }))

    await waitFor(() => {
      expect(window.location.search).toContain('collections=c-celebration')
      expect(window.location.search).not.toContain('c-signature')
      expect(window.location.search).toContain('maxPrice=30')
      expect(screen.getByLabelText('Price range')).toHaveAttribute('max', '30')
      expect((screen.getByLabelText('Price range') as HTMLInputElement).value).toBe('30')
    })
  })

  it('auto-syncs maxPrice after filter reset when lazy-loaded items increase loaded-scope max', async () => {
    const byPostOnlyItem = {
      ...createGiftHamper(1),
      price: 13
    }
    const lazyLoadedCake = {
      ...createCake(80),
      price: 80
    }
    let resolveFetch: ((response: Response) => void) | undefined
    const fetchPromise = new Promise<Response>((resolve) => {
      resolveFetch = resolve
    })
    jest.spyOn(global, 'fetch').mockReturnValue(fetchPromise)

    renderCatalog({
      items: [byPostOnlyItem],
      initialFilterDefaults: {
        byPost: true,
        custom: false
      },
      lazyCustomCakesEndpoint: '/api/catalog/custom-cakes',
      search: '?maxPrice=5'
    })

    fireEvent.click(screen.getByRole('button', { name: 'Toggle custom' }))

    await waitFor(() => {
      expect(window.location.search).toContain('custom=true')
      expect(window.location.search).toContain('maxPrice=13')
      expect((screen.getByLabelText('Price range') as HTMLInputElement).value).toBe('13')
    })

    resolveFetch?.({
      ok: true,
      json: async () => ({
        cakes: [lazyLoadedCake],
        collectionOptions
      })
    } as Response)

    await waitFor(() => {
      expect(screen.getByText('Cake 80')).toBeInTheDocument()
      expect(window.location.search).toContain('maxPrice=80')
      expect((screen.getByLabelText('Price range') as HTMLInputElement).value).toBe('80')
    })
  })

  it('does not auto-sync maxPrice after manual slider override', async () => {
    const byPostOnlyItem = {
      ...createGiftHamper(1),
      price: 13
    }
    const lazyLoadedCake = {
      ...createCake(80),
      price: 80
    }
    let resolveFetch: ((response: Response) => void) | undefined
    const fetchPromise = new Promise<Response>((resolve) => {
      resolveFetch = resolve
    })
    jest.spyOn(global, 'fetch').mockReturnValue(fetchPromise)

    renderCatalog({
      items: [byPostOnlyItem],
      initialFilterDefaults: {
        byPost: true,
        custom: false
      },
      lazyCustomCakesEndpoint: '/api/catalog/custom-cakes',
      search: '?maxPrice=5'
    })

    fireEvent.click(screen.getByRole('button', { name: 'Toggle custom' }))

    await waitFor(() => {
      expect(window.location.search).toContain('maxPrice=13')
      expect((screen.getByLabelText('Price range') as HTMLInputElement).value).toBe('13')
    })

    fireEvent.change(screen.getByLabelText('Price range'), {
      target: { value: '7' }
    })

    await waitFor(() => {
      expect(window.location.search).toContain('maxPrice=7')
      expect((screen.getByLabelText('Price range') as HTMLInputElement).value).toBe('7')
    })

    resolveFetch?.({
      ok: true,
      json: async () => ({
        cakes: [lazyLoadedCake],
        collectionOptions
      })
    } as Response)

    await waitFor(() => {
      expect(screen.getByLabelText('Price range')).toHaveAttribute('max', '80')
    })

    expect(window.location.search).toContain('maxPrice=7')
    expect((screen.getByLabelText('Price range') as HTMLInputElement).value).toBe('7')
    expect(screen.getByLabelText('Price range')).toHaveAttribute('max', '80')
  })

  it('updates maxPrice without blink when filter reset applies a new loaded-scope max', async () => {
    const byPostOnlyItem = {
      ...createGiftHamper(1),
      price: 13
    }
    const customItem = {
      ...createCake(80),
      price: 80
    }

    renderCatalog({
      items: [byPostOnlyItem, customItem],
      initialFilterDefaults: {
        byPost: true,
        custom: false
      },
      search: '?maxPrice=5'
    })

    await waitFor(() => {
      expect((screen.getByLabelText('Price range') as HTMLInputElement).value).toBe('5')
    })
    resetRenderedPriceValues()

    fireEvent.click(screen.getByRole('button', { name: 'Toggle custom' }))

    await waitFor(() => {
      expect(window.location.search).toContain('maxPrice=80')
      expect((screen.getByLabelText('Price range') as HTMLInputElement).value).toBe('80')
    })

    const valuesAfterToggle = getRenderedPriceValues()
    expect(valuesAfterToggle.length).toBeGreaterThan(0)
    expect(valuesAfterToggle[0]).toBe(80)
    expect(valuesAfterToggle).not.toContain(5)
    expect(valuesAfterToggle.every((value) => value === 80)).toBe(true)
  })

  it('does not blink maxPrice when unsetting a collection filter', async () => {
    renderCatalog({ search: '?maxPrice=5' })

    await waitFor(() => {
      expect((screen.getByLabelText('Price range') as HTMLInputElement).value).toBe('5')
    })

    fireEvent.click(screen.getByRole('button', { name: 'Toggle second collection' }))

    await waitFor(() => {
      expect(window.location.search).toContain('collections=c-signature')
      expect((screen.getByLabelText('Price range') as HTMLInputElement).value).toBe('0')
    })

    resetRenderedPriceValues()
    fireEvent.click(screen.getByRole('button', { name: 'Toggle second collection' }))

    await waitFor(() => {
      expect(window.location.search).not.toContain('collections=')
      expect((screen.getByLabelText('Price range') as HTMLInputElement).value).toBe('10')
    })

    const valuesAfterUnset = getRenderedPriceValues()
    expect(valuesAfterUnset.length).toBeGreaterThan(0)
    expect(valuesAfterUnset[0]).toBe(10)
    expect(valuesAfterUnset.every((value) => value === 10)).toBe(true)
  })

  it('clears page and other query state on reset', async () => {
    renderCatalog({
      search: '?page=2&byPost=true&custom=false&maxPrice=5&collections=c-celebration&sort=priceLowToHigh'
    })

    fireEvent.click(screen.getByRole('button', { name: 'Reset filters' }))

    await waitFor(() => {
      expect(window.location.search).toBe('')
    })
  })

  it('normalizes invalid low page value to first page', async () => {
    renderCatalog({ search: '?page=0' })

    await waitFor(() => {
      expect(window.location.search).toBe('')
    })
    expect(screen.getByRole('button', { name: 'Go to page 1' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Go to page 1' })).toBeDisabled()
  })

  it('normalizes page values above range to the last page', async () => {
    renderCatalog({ search: '?page=999' })

    await waitFor(() => {
      expect(window.location.search).toContain('page=2')
    })
    expectCakeVisibleOnTablet('Cake 7')
    expectCakeHiddenOnTablet('Cake 1')
  })

  it('shows trailing ellipsis on first page when many pages exist', async () => {
    renderCatalog({ cakeCount: 60 })

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Go to page 10' })).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: 'Go to page 1' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Go to page 2' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Go to page 3' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Go to page 4' })).toBeInTheDocument()
    const ellipsis = screen.getByText('...').closest('span')
    expect(ellipsis).not.toBeNull()
    expect(ellipsis).toHaveAttribute('aria-hidden', 'true')
  })

  it('shows leading and trailing ellipsis on middle page when many pages exist', async () => {
    renderCatalog({ cakeCount: 60, search: '?page=5' })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Go to page 5' })).toHaveAttribute('aria-current', 'page')
    })

    expect(screen.getByRole('link', { name: 'Go to page 1' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Go to page 4' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Go to page 6' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Go to page 10' })).toBeInTheDocument()
    const ellipsisItems = screen.getAllByText('...').map((node) => node.closest('span'))
    expect(ellipsisItems).toHaveLength(2)
    ellipsisItems.forEach((item) => {
      expect(item).not.toBeNull()
      expect(item).toHaveAttribute('aria-hidden', 'true')
    })
  })

  it('shows leading ellipsis and final window on last page when many pages exist', async () => {
    renderCatalog({ cakeCount: 60, search: '?page=10' })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Go to page 10' })).toHaveAttribute('aria-current', 'page')
    })

    expect(screen.getByRole('link', { name: 'Go to page 7' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Go to page 8' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Go to page 9' })).toBeInTheDocument()
    const ellipsis = screen.getByText('...').closest('span')
    expect(ellipsis).not.toBeNull()
    expect(ellipsis).toHaveAttribute('aria-hidden', 'true')
  })

  it('disables previous on first page and next on last page', async () => {
    const firstRender = renderCatalog({ cakeCount: 60 })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Previous page' })).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    expect(screen.getByRole('link', { name: 'Next page' })).toBeInTheDocument()
    firstRender.unmount()

    renderCatalog({ cakeCount: 60, search: '?page=10' })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
    const previousPageLink = screen.getByRole('link', { name: 'Previous page' })
    expect(previousPageLink).toBeInTheDocument()
    expect(previousPageLink).toHaveAttribute('href', '?page=9')
    expect(document.querySelector('a[href="."]')).toBeNull()
  })

  it('uses route-stable page-1 href for cakes pagination', async () => {
    renderCatalog({ cakeCount: 60, search: '?page=2' })

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Previous page' })).toBeInTheDocument()
    })

    expect(screen.getByRole('link', { name: 'Previous page' })).toHaveAttribute('href', '/cakes')
    expect(document.querySelector('a[href="."]')).toBeNull()
  })

  it('uses route-stable page-1 href for cakes-by-post pagination', async () => {
    const byPostItems = Array.from({ length: 60 }, (_, index) => createGiftHamper(index + 1))

    renderCatalog({
      items: byPostItems,
      pathname: '/cakes-by-post',
      search: '?page=2',
      initialFilterDefaults: {
        byPost: true,
        custom: false
      }
    })

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Previous page' })).toBeInTheDocument()
    })

    expect(screen.getByRole('link', { name: 'Previous page' })).toHaveAttribute('href', '/cakes-by-post')
    expect(document.querySelector('a[href="."]')).toBeNull()
  })

  it('uses route-stable page-1 href for gift-hampers pagination alias', async () => {
    const byPostItems = Array.from({ length: 60 }, (_, index) => createGiftHamper(index + 1))

    renderCatalog({
      items: byPostItems,
      pathname: '/gift-hampers',
      search: '?page=2',
      initialFilterDefaults: {
        byPost: true,
        custom: false
      }
    })

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Previous page' })).toBeInTheDocument()
    })

    expect(screen.getByRole('link', { name: 'Previous page' })).toHaveAttribute('href', '/gift-hampers')
    expect(document.querySelector('a[href="."]')).toBeNull()
  })

  it('moves to next and previous pages with pagination links', async () => {
    renderCatalog({ cakeCount: 60, search: '?page=5' })

    fireEvent.click(screen.getByRole('link', { name: 'Next page' }))

    await waitFor(() => {
      expect(window.location.search).toContain('page=6')
    })
    expect(screen.getByRole('button', { name: 'Go to page 6' })).toHaveAttribute('aria-current', 'page')

    fireEvent.click(screen.getByRole('link', { name: 'Previous page' }))

    await waitFor(() => {
      expect(window.location.search).toContain('page=5')
    })
    expect(screen.getByRole('button', { name: 'Go to page 5' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Go to page 5' })).toBeDisabled()
  })

  it('uses desktop card variant outside mobile viewport', async () => {
    renderCatalog({ cakeCount: 4, viewportWidth: 1200 })

    await waitFor(() => {
      expect(screen.getAllByTestId('cake-card')).toHaveLength(4)
    })

    screen.getAllByTestId('cake-card').forEach((card) => {
      expect(card).toHaveAttribute('data-variant', 'desktop')
    })
  })

  it('marks only first desktop card as LCP candidate', async () => {
    renderCatalog({ cakeCount: 4, viewportWidth: 1200 })

    await waitFor(() => {
      expect(screen.getAllByTestId('cake-card')).toHaveLength(4)
    })

    const cards = screen.getAllByTestId('cake-card')
    const [firstCard, ...remainingCards] = cards

    expect(firstCard).toBeDefined()
    if (!firstCard) {
      return
    }
    expect(firstCard).toHaveAttribute('data-is-lcp-candidate', 'true')
    remainingCards.forEach((card) => {
      expect(card).toHaveAttribute('data-is-lcp-candidate', 'false')
    })
  })

  it('marks tablet and small-laptop page starts as LCP candidates on desktop page 2', async () => {
    renderCatalog({ cakeCount: 12, viewportWidth: 1200, search: '?page=2' })

    await waitFor(() => {
      expect(screen.getAllByTestId('cake-card')).toHaveLength(12)
    })

    const cards = screen.getAllByTestId('cake-card')
    const eagerCards = cards.filter((card) => card.getAttribute('data-is-lcp-candidate') === 'true')

    expect(cards[0]).toHaveAttribute('data-is-lcp-candidate', 'false')
    expect(cards[6]).toHaveAttribute('data-is-lcp-candidate', 'true')
    expect(cards[9]).toHaveAttribute('data-is-lcp-candidate', 'true')
    expect(eagerCards).toHaveLength(2)
  })

  it('applies responsive visibility gate classes to desktop catalog layout', async () => {
    renderCatalog({ cakeCount: 4, viewportWidth: 1200 })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Sort new' })).toBeInTheDocument()
    })

    const desktopLayout = screen.getByTestId('desktop-catalog-layout')
    expect(desktopLayout).toHaveClass('hidden', 'tablet:flex')
  })

  it('renders server mobile first-batch fallback content and removes it after hydration', async () => {
    const serverMarkup = renderCatalogToMarkup({ cakeCount: 4, viewportWidth: 1200 })

    expect(serverMarkup).toContain('data-testid="mobile-prehydration-shell"')
    expect(serverMarkup).toContain('aria-label="Catalog category tabs"')
    expect(serverMarkup).toContain('data-testid="mobile-catalog-grid"')
    expect(serverMarkup).toContain('data-variant="mobile"')

    renderCatalog({
      viewportWidth: 390,
      items: createMixedCatalogItems({
        customCount: 2,
        byPostCount: 0
      })
    })

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Custom cakes' })).toHaveAttribute('aria-selected', 'true')
    })
    expect(screen.queryByTestId('mobile-prehydration-shell')).not.toBeInTheDocument()
  })

  it('keeps server mobile pre-hydration cards non-LCP on desktop viewport', () => {
    const serverMarkup = renderCatalogToMarkup({ cakeCount: 4, viewportWidth: 1200 })
    const mobileCardTags = serverMarkup.match(/<article[^>]*data-variant="mobile"[^>]*>/g) ?? []

    expect(serverMarkup).toContain('data-testid="mobile-prehydration-shell"')
    expect(mobileCardTags.length).toBeGreaterThan(0)
    mobileCardTags.forEach((mobileCardTag) => {
      expect(mobileCardTag).toMatch(/data-is-lcp-candidate="false"/)
      expect(mobileCardTag).not.toMatch(/data-is-lcp-candidate="true"/)
    })
  })

  it('keeps product, pagination and no-js crawl links in server markup', () => {
    const serverMarkup = renderCatalogToMarkup({ cakeCount: 10, viewportWidth: 1200 })

    expect(serverMarkup).toContain('aria-label="Catalog product crawl links"')
    expect(serverMarkup).toContain('href="/cakes/cake-1"')
    expect(serverMarkup).toContain('href="/cakes/cake-10"')
    expect(serverMarkup).toContain('href="?page=2"')
    expect(serverMarkup).not.toContain('href="."')
  })

  it('adds a safe from param to custom cake links on the cakes-by-post route', async () => {
    renderCatalog({
      pathname: '/cakes-by-post',
      search: '?byPost=false&custom=true&sort=priceLowToHigh&page=2',
      items: createMixedCatalogItems({
        customCount: 8,
        byPostCount: 0
      }),
      initialFilterDefaults: {
        byPost: true,
        custom: false
      }
    })

    expect(screen.getByRole('link', { name: /View details for Cake 7/i })).toHaveAttribute(
      'href',
      '/cakes/cake-7?from=%2Fcakes-by-post%3Fsort%3DpriceLowToHigh%26byPost%3Dfalse%26custom%3Dtrue%26page%3D2'
    )
  })

  it('adds a safe from param to hamper links on the cakes route', () => {
    renderCatalog({
      pathname: '/cakes',
      search: '?byPost=true&custom=false&page=2',
      items: createMixedCatalogItems({
        customCount: 0,
        byPostCount: 8
      }),
      initialFilterDefaults: {
        byPost: false,
        custom: true
      }
    })

    expect(screen.getByRole('link', { name: /View details for Hamper 7/i })).toHaveAttribute(
      'href',
      '/cakes-by-post/hamper-7?from=%2Fcakes%3FbyPost%3Dtrue%26custom%3Dfalse%26page%3D2'
    )
  })

  it('limits no-js crawl links to active custom tab on cakes route', () => {
    const serverMarkup = renderCatalogToMarkup({
      items: createMixedCatalogItems({
        customCount: 10,
        byPostCount: 10
      }),
      pathname: '/cakes',
      search: ''
    })

    expect(serverMarkup).toContain('aria-label="Catalog product crawl links"')
    expect(serverMarkup).toContain('href="/cakes/cake-10"')
    expect(serverMarkup).not.toContain('href="/cakes-by-post/hamper-1"')
  })

  it('limits no-js crawl links to active by-post tab on gift-hampers route', () => {
    const serverMarkup = renderCatalogToMarkup({
      items: createMixedCatalogItems({
        customCount: 10,
        byPostCount: 10
      }),
      pathname: '/gift-hampers',
      search: '',
      initialFilterDefaults: {
        byPost: true,
        custom: false
      }
    })

    expect(serverMarkup).toContain('aria-label="Catalog product crawl links"')
    expect(serverMarkup).toContain('href="/cakes-by-post/hamper-10"')
    expect(serverMarkup).not.toContain('href="/cakes/cake-1"')
  })

  it('keeps page-1 pagination links route-stable in server markup', () => {
    const serverMarkup = renderCatalogToMarkup({
      cakeCount: 10,
      viewportWidth: 1200,
      search: '?page=2'
    })

    expect(serverMarkup).toContain('href="/cakes"')
    expect(serverMarkup).not.toContain('href="."')
  })

  it('keeps gift-hampers page-1 pagination links route-stable in server markup', () => {
    const byPostItems = Array.from({ length: 10 }, (_, index) => createGiftHamper(index + 1))
    const serverMarkup = renderCatalogToMarkup({
      items: byPostItems,
      pathname: '/gift-hampers',
      search: '?page=2',
      initialFilterDefaults: {
        byPost: true,
        custom: false
      }
    })

    expect(serverMarkup).toContain('href="/gift-hampers"')
    expect(serverMarkup).not.toContain('href="."')
  })

  it('uses mobile card variant in mobile viewport', async () => {
    renderCatalog({
      viewportWidth: 390,
      items: createMixedCatalogItems({
        customCount: 2,
        byPostCount: 0
      })
    })

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Custom cakes' })).toHaveAttribute('aria-selected', 'true')
      expect(screen.getAllByTestId('cake-card')).toHaveLength(2)
    })

    screen.getAllByTestId('cake-card').forEach((card) => {
      expect(card).toHaveAttribute('data-variant', 'mobile')
    })
    const variants = getRenderedCardVariants()
    expect(variants.length).toBeGreaterThan(0)
    expect(variants.every((variant) => variant === 'mobile')).toBe(true)
    const mobileViewModes = getRenderedMobileViewModes()
    expect(mobileViewModes.length).toBeGreaterThan(0)
    expect(mobileViewModes.every((mode) => mode === 'grid')).toBe(true)
  })

  it('marks first mobile row cards as LCP candidates in grid view', async () => {
    renderCatalog({
      viewportWidth: 390,
      items: createMixedCatalogItems({
        customCount: 3,
        byPostCount: 0
      })
    })

    await waitFor(() => {
      expect(screen.getAllByTestId('cake-card')).toHaveLength(3)
    })

    const cards = screen.getAllByTestId('cake-card')
    const [firstCard, secondCard, thirdCard] = cards

    expect(firstCard).toBeDefined()
    expect(secondCard).toBeDefined()
    expect(thirdCard).toBeDefined()
    if (!firstCard || !secondCard || !thirdCard) {
      return
    }
    expect(firstCard).toHaveAttribute('data-is-lcp-candidate', 'true')
    expect(secondCard).toHaveAttribute('data-is-lcp-candidate', 'true')
    expect(thirdCard).toHaveAttribute('data-is-lcp-candidate', 'false')
  })

  it('marks only first mobile card as LCP candidate in single-column view', async () => {
    renderCatalog({
      viewportWidth: 390,
      items: createMixedCatalogItems({
        customCount: 3,
        byPostCount: 0
      })
    })

    await waitFor(() => {
      expect(screen.getAllByTestId('cake-card')).toHaveLength(3)
    })

    fireEvent.click(screen.getByRole('button', { name: 'Single-column view' }))

    const cards = screen.getAllByTestId('cake-card')
    const [firstCard, secondCard, thirdCard] = cards

    expect(firstCard).toBeDefined()
    expect(secondCard).toBeDefined()
    expect(thirdCard).toBeDefined()
    if (!firstCard || !secondCard || !thirdCard) {
      return
    }
    expect(firstCard).toHaveAttribute('data-is-lcp-candidate', 'true')
    expect(secondCard).toHaveAttribute('data-is-lcp-candidate', 'false')
    expect(thirdCard).toHaveAttribute('data-is-lcp-candidate', 'false')
  })

  it('does not show pre-hydration shell when mobile viewport branch is active', async () => {
    renderCatalog({
      viewportWidth: 390,
      items: createMixedCatalogItems({
        customCount: 2,
        byPostCount: 0
      })
    })

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Custom cakes' })).toHaveAttribute('aria-selected', 'true')
    })
    expect(screen.queryByTestId('mobile-prehydration-shell')).not.toBeInTheDocument()
  })

  it('applies mobile tab typography tokens and toggles mobile view-mode icon colors', async () => {
    renderCatalog({
      viewportWidth: 390,
      items: createMixedCatalogItems({
        customCount: 2,
        byPostCount: 2
      })
    })

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Custom cakes' })).toHaveAttribute('aria-selected', 'true')
    })

    const customTab = screen.getByRole('tab', { name: 'Custom cakes' })
    const byPostTab = screen.getByRole('tab', { name: 'Cakes by post' })
    const tablist = screen.getByRole('tablist', { name: 'Catalog category tabs' })
    const filterSortLabel = screen.getByText('Filter & Sort')
    const gridViewButton = screen.getByRole('button', { name: 'Grid view' })
    const singleColumnViewButton = screen.getByRole('button', { name: 'Single-column view' })
    const gridIcon = screen.getByTestId('mobile-filter-sort-grid-icon')
    const outlineIcon = screen.getByTestId('mobile-filter-sort-outline-icon')
    const mobileCatalogGrid = screen.getByTestId('mobile-catalog-grid')

    expect(customTab).toHaveClass('font-moreSugar', 'text-sm', 'leading-5', 'tracking-normal')
    expect(byPostTab).toHaveClass('font-moreSugar', 'text-sm', 'leading-5', 'tracking-normal')
    expect(tablist).toHaveClass('gap-0')
    expect(tablist).not.toHaveClass('gap-4')
    expect(filterSortLabel).toHaveClass(
      'font-sans',
      'font-semibold',
      'text-[15px]',
      'leading-7',
      'tracking-[0]',
      'align-middle',
      'text-(--color-filter-sort-mobile-text)'
    )
    expect(gridViewButton).toHaveAttribute('aria-pressed', 'true')
    expect(singleColumnViewButton).toHaveAttribute('aria-pressed', 'false')
    expect(gridIcon).toHaveClass('h-4', 'w-4', 'text-(--color-filter-sort-mobile-icon-active)')
    expect(outlineIcon).toHaveClass('h-4', 'w-4', 'text-(--color-filter-sort-mobile-icon-inactive)')
    expect(mobileCatalogGrid).toHaveClass('grid-cols-2', 'gap-4')
    expect(mobileCatalogGrid).not.toHaveClass('grid-cols-1')
    expect(window.location.search).not.toContain('view=')
    const initialMobileViewModes = getRenderedMobileViewModes()
    expect(initialMobileViewModes.length).toBeGreaterThan(0)
    expect(initialMobileViewModes.every((mode) => mode === 'grid')).toBe(true)

    expect(customTab).toHaveClass('border-primary-500', 'text-primary-500')
    expect(byPostTab).toHaveClass('border-b-primary-500/20', 'text-primary-200')

    resetRenderedMobileViewModes()
    fireEvent.click(singleColumnViewButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Single-column view' })).toHaveAttribute('aria-pressed', 'true')
    })

    expect(screen.getByRole('button', { name: 'Grid view' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByTestId('mobile-filter-sort-grid-icon')).toHaveClass('text-(--color-filter-sort-mobile-icon-inactive)')
    expect(screen.getByTestId('mobile-filter-sort-outline-icon')).toHaveClass('text-(--color-filter-sort-mobile-icon-active)')
    expect(screen.getByTestId('mobile-catalog-grid')).toHaveClass('grid-cols-1', 'gap-4')
    expect(screen.getByTestId('mobile-catalog-grid')).not.toHaveClass('grid-cols-2')
    expect(window.location.search).not.toContain('view=')
    expect(window.localStorage.getItem(mobileViewModeStorageKey)).toBe('single')
    const singleModeViewModes = getRenderedMobileViewModes()
    expect(singleModeViewModes.length).toBeGreaterThan(0)
    expect(singleModeViewModes.every((mode) => mode === 'single')).toBe(true)

    resetRenderedMobileViewModes()
    fireEvent.click(screen.getByRole('button', { name: 'Grid view' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Grid view' })).toHaveAttribute('aria-pressed', 'true')
    })

    expect(screen.getByRole('button', { name: 'Single-column view' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByTestId('mobile-catalog-grid')).toHaveClass('grid-cols-2', 'gap-4')
    expect(screen.getByTestId('mobile-catalog-grid')).not.toHaveClass('grid-cols-1')
    expect(window.location.search).not.toContain('view=')
    expect(window.localStorage.getItem(mobileViewModeStorageKey)).toBe('grid')
    const gridModeViewModes = getRenderedMobileViewModes()
    expect(gridModeViewModes.length).toBeGreaterThan(0)
    expect(gridModeViewModes.every((mode) => mode === 'grid')).toBe(true)

    fireEvent.click(byPostTab)

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Cakes by post' })).toHaveAttribute('aria-selected', 'true')
    })

    expect(screen.getByRole('tab', { name: 'Cakes by post' })).toHaveClass('border-primary-500', 'text-primary-500')
    expect(screen.getByRole('tab', { name: 'Custom cakes' })).toHaveClass('border-b-primary-500/20', 'text-primary-200')
  })

  it('opens mobile filter and sort sheet from the mobile trigger', async () => {
    renderCatalog({
      viewportWidth: 390,
      items: createMixedCatalogItems({
        customCount: 6,
        byPostCount: 0
      })
    })

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Custom cakes' })).toHaveAttribute('aria-selected', 'true')
    })

    fireEvent.click(screen.getByRole('button', { name: 'Filter & Sort' }))

    await waitFor(() => {
      expect(screen.getByTestId('mobile-filter-sort-sheet')).toBeInTheDocument()
    })

    expect(screen.getByTestId('mobile-filter-sort-draft-sort')).toHaveTextContent('new')
  })

  it('keeps mobile URL and visible cards unchanged until mobile filters are applied', async () => {
    renderCatalog({
      viewportWidth: 390,
      items: createMixedCatalogItems({
        customCount: 8,
        byPostCount: 0
      })
    })

    await waitFor(() => {
      expect(screen.getAllByTestId('cake-card')).toHaveLength(6)
    })

    expect(window.location.search).toBe('')
    expect(screen.getByText('Cake 1')).toBeInTheDocument()
    expect(screen.getByText('Cake 6')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Filter & Sort' }))
    fireEvent.click(screen.getByRole('button', { name: 'Draft sort high to low' }))
    fireEvent.click(screen.getByRole('button', { name: 'Draft first collection' }))

    expect(window.location.search).toBe('')
    expect(screen.getByText('Cake 1')).toBeInTheDocument()
    expect(screen.getByText('Cake 6')).toBeInTheDocument()
    expect(screen.getByTestId('mobile-filter-sort-sheet')).toBeInTheDocument()
  })

  it('applies mobile sort and resets loaded depth to the first batch', async () => {
    renderCatalog({
      viewportWidth: 390,
      items: createMixedCatalogItems({
        customCount: 12,
        byPostCount: 0
      })
    })

    await waitFor(() => {
      expect(screen.getAllByTestId('cake-card')).toHaveLength(6)
    })

    triggerMobileInfiniteSentinelIntersection()

    await waitFor(() => {
      expect(screen.getAllByTestId('cake-card')).toHaveLength(12)
    })

    fireEvent.click(screen.getByRole('button', { name: 'Filter & Sort' }))
    fireEvent.click(screen.getByRole('button', { name: 'Draft sort high to low' }))
    fireEvent.click(screen.getByRole('button', { name: 'Apply mobile filters' }))

    await waitFor(() => {
      expect(window.location.search).toContain('sort=priceHighToLow')
      expect(screen.getAllByTestId('cake-card')).toHaveLength(6)
    })
    expect(screen.getByText('Cake 12')).toBeInTheDocument()
    expect(screen.queryByText('Cake 6')).not.toBeInTheDocument()
  })

  it('applies mobile collection filters to cards and URL', async () => {
    const customItems = Array.from({ length: 12 }, (_, index) => {
      return {
        ...createCake(index + 1),
        collectionIds: index < 6 ? ['collection-1'] : ['collection-2']
      }
    })

    renderCatalog({
      viewportWidth: 390,
      items: customItems
    })

    await waitFor(() => {
      expect(screen.getAllByTestId('cake-card')).toHaveLength(6)
    })

    fireEvent.click(screen.getByRole('button', { name: 'Filter & Sort' }))
    fireEvent.click(screen.getByRole('button', { name: 'Draft first collection' }))
    fireEvent.click(screen.getByRole('button', { name: 'Apply mobile filters' }))

    await waitFor(() => {
      expect(window.location.search).toContain('collections=c-celebration')
      expect(window.location.search).not.toContain('maxPrice=')
      expect(screen.getAllByTestId('cake-card')).toHaveLength(6)
    })
    expect(screen.getByText('Cake 6')).toBeInTheDocument()
    expect(screen.queryByText('Cake 7')).not.toBeInTheDocument()
  })

  it('drops hidden cross-category collections when applying mobile filters', async () => {
    const customItems = Array.from({ length: 8 }, (_, index) => {
      return {
        ...createCake(index + 1),
        collectionIds: ['collection-1']
      }
    })

    renderCatalog({
      viewportWidth: 390,
      items: customItems,
      search: '?collections=h-postal-gifts',
      collectionOptionsOverride: mixedCollectionOptions
    })

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Custom cakes' })).toHaveAttribute('aria-selected', 'true')
    })

    expect(window.location.search).toContain('collections=h-postal-gifts')
    expect(screen.getByText('No cakes match the selected filters yet.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Filter & Sort' }))
    fireEvent.click(screen.getByRole('button', { name: 'Apply mobile filters' }))

    await waitFor(() => {
      expect(window.location.search).not.toContain('collections=')
      expect(screen.getAllByTestId('cake-card')).toHaveLength(6)
    })

    expect(screen.getByText('Cake 6')).toBeInTheDocument()
    expect(screen.queryByText('No cakes match the selected filters yet.')).not.toBeInTheDocument()
  })

  it('ignores maxPrice from URL when rendering mobile cards', async () => {
    renderCatalog({
      viewportWidth: 390,
      items: createMixedCatalogItems({
        customCount: 8,
        byPostCount: 0
      }),
      search: '?maxPrice=5'
    })

    await waitFor(() => {
      expect(screen.getAllByTestId('cake-card')).toHaveLength(6)
    })

    expect(window.location.search).toContain('maxPrice=5')
    expect(screen.getByText('Cake 6')).toBeInTheDocument()
  })

  it('keeps existing maxPrice query value when applying mobile filters', async () => {
    const customItems = Array.from({ length: 12 }, (_, index) => {
      return {
        ...createCake(index + 1),
        collectionIds: index < 6 ? ['collection-1'] : ['collection-2']
      }
    })

    renderCatalog({
      viewportWidth: 390,
      items: customItems,
      search: '?maxPrice=5'
    })

    await waitFor(() => {
      expect(screen.getAllByTestId('cake-card')).toHaveLength(6)
    })

    fireEvent.click(screen.getByRole('button', { name: 'Filter & Sort' }))
    fireEvent.click(screen.getByRole('button', { name: 'Draft first collection' }))
    fireEvent.click(screen.getByRole('button', { name: 'Apply mobile filters' }))

    await waitFor(() => {
      expect(window.location.search).toContain('collections=c-celebration')
      expect(window.location.search).toContain('maxPrice=5')
    })
  })

  it('discards staged mobile draft changes on cancel, backdrop and esc dismiss', async () => {
    renderCatalog({
      viewportWidth: 390,
      items: createMixedCatalogItems({
        customCount: 10,
        byPostCount: 0
      })
    })

    await waitFor(() => {
      expect(screen.getAllByTestId('cake-card')).toHaveLength(6)
    })

    fireEvent.click(screen.getByRole('button', { name: 'Filter & Sort' }))
    fireEvent.click(screen.getByRole('button', { name: 'Draft sort high to low' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel mobile filters' }))
    expect(window.location.search).toBe('')

    fireEvent.click(screen.getByRole('button', { name: 'Filter & Sort' }))
    fireEvent.click(screen.getByRole('button', { name: 'Draft first collection' }))
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss mobile filters via backdrop' }))
    expect(window.location.search).toBe('')

    fireEvent.click(screen.getByRole('button', { name: 'Filter & Sort' }))
    fireEvent.click(screen.getByRole('button', { name: 'Draft first collection' }))
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss mobile filters via esc' }))
    expect(window.location.search).toBe('')
    expect(screen.getByText('Cake 6')).toBeInTheDocument()
    expect(screen.queryByText('Cake 7')).not.toBeInTheDocument()
  })

  it('migrates legacy view query param to localStorage and strips it from URL', async () => {
    renderCatalog({
      viewportWidth: 390,
      items: createMixedCatalogItems({
        customCount: 2,
        byPostCount: 2
      }),
      search: '?view=single&maxPrice=5'
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Single-column view' })).toHaveAttribute('aria-pressed', 'true')
    })

    expect(screen.getByRole('button', { name: 'Grid view' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByTestId('mobile-filter-sort-grid-icon')).toHaveClass('text-(--color-filter-sort-mobile-icon-inactive)')
    expect(screen.getByTestId('mobile-filter-sort-outline-icon')).toHaveClass('text-(--color-filter-sort-mobile-icon-active)')
    expect(screen.getByTestId('mobile-catalog-grid')).toHaveClass('grid-cols-1')
    expect(screen.getByTestId('mobile-catalog-grid')).not.toHaveClass('grid-cols-2')
    expect(window.location.search).toContain('maxPrice=5')
    expect(window.location.search).not.toContain('view=')
    expect(window.localStorage.getItem(mobileViewModeStorageKey)).toBe('single')
  })

  it('hydrates mobile view mode from localStorage', async () => {
    window.localStorage.setItem(mobileViewModeStorageKey, 'single')

    renderCatalog({
      viewportWidth: 390,
      items: createMixedCatalogItems({
        customCount: 2,
        byPostCount: 2
      }),
      search: '?maxPrice=5'
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Single-column view' })).toHaveAttribute('aria-pressed', 'true')
    })

    expect(screen.getByTestId('mobile-catalog-grid')).toHaveClass('grid-cols-1')
    expect(window.location.search).toContain('maxPrice=5')
    expect(window.location.search).not.toContain('view=')
    expect(window.localStorage.getItem(mobileViewModeStorageKey)).toBe('single')
  })

  it('keeps single-column mobile view mode while switching mobile tabs', async () => {
    window.localStorage.setItem(mobileViewModeStorageKey, 'single')

    renderCatalog({
      viewportWidth: 390,
      items: createMixedCatalogItems({
        customCount: 2,
        byPostCount: 2
      }),
      search: '?maxPrice=5'
    })

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Custom cakes' })).toHaveAttribute('aria-selected', 'true')
    })

    expect(screen.getByTestId('mobile-catalog-grid')).toHaveClass('grid-cols-1')

    fireEvent.click(screen.getByRole('tab', { name: 'Cakes by post' }))

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Cakes by post' })).toHaveAttribute('aria-selected', 'true')
    })

    expect(screen.getByTestId('mobile-catalog-grid')).toHaveClass('grid-cols-1')
    expect(window.location.search).toContain('maxPrice=5')
    expect(window.location.search).not.toContain('view=')
    expect(window.localStorage.getItem(mobileViewModeStorageKey)).toBe('single')

    fireEvent.click(screen.getByRole('tab', { name: 'Custom cakes' }))

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Custom cakes' })).toHaveAttribute('aria-selected', 'true')
    })

    expect(screen.getByTestId('mobile-catalog-grid')).toHaveClass('grid-cols-1')
    expect(window.location.search).toContain('maxPrice=5')
    expect(window.location.search).not.toContain('view=')
    expect(window.localStorage.getItem(mobileViewModeStorageKey)).toBe('single')
  })

  it('switches catalog branch when viewport width crosses the tablet breakpoint', async () => {
    renderCatalog({ cakeCount: 4, viewportWidth: 1200 })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Sort new' })).toBeInTheDocument()
    })
    expect(screen.queryByRole('tab', { name: 'Custom cakes' })).not.toBeInTheDocument()

    act(() => {
      setViewportWidth(390)
      window.dispatchEvent(new Event('resize'))
    })

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Custom cakes' })).toBeInTheDocument()
    })
    expect(screen.queryByRole('button', { name: 'Sort new' })).not.toBeInTheDocument()

    act(() => {
      setViewportWidth(1200)
      window.dispatchEvent(new Event('resize'))
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Sort new' })).toBeInTheDocument()
    })
    expect(screen.queryByRole('tab', { name: 'Custom cakes' })).not.toBeInTheDocument()
  })

  it('loads mobile catalog in batches using the infinite-scroll sentinel', async () => {
    renderCatalog({
      viewportWidth: 390,
      items: createMixedCatalogItems({
        customCount: 10,
        byPostCount: 0
      })
    })

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Custom cakes' })).toHaveAttribute('aria-selected', 'true')
    })
    expect(screen.getAllByTestId('cake-card')).toHaveLength(6)
    expect(screen.queryByRole('navigation', { name: 'Cake catalog pagination' })).not.toBeInTheDocument()

    triggerMobileInfiniteSentinelIntersection()

    await waitFor(() => {
      expect(screen.getAllByTestId('cake-card')).toHaveLength(10)
    })
    expect(screen.getByText('Cake 10')).toBeInTheDocument()
  })

  it('falls back to manual load more when IntersectionObserver is unavailable', async () => {
    const previousIntersectionObserver = global.IntersectionObserver
    global.IntersectionObserver = undefined as unknown as typeof IntersectionObserver

    try {
      renderCatalog({
        viewportWidth: 390,
        items: createMixedCatalogItems({
          customCount: 10,
          byPostCount: 0
        })
      })

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: 'Custom cakes' })).toHaveAttribute('aria-selected', 'true')
      })

      expect(screen.getAllByTestId('cake-card')).toHaveLength(6)
      expect(screen.queryByTestId('mobile-infinite-scroll-sentinel')).not.toBeInTheDocument()
      const loadMoreButton = screen.getByRole('button', { name: 'Load more' })
      expect(loadMoreButton).toBeInTheDocument()

      fireEvent.click(loadMoreButton)

      await waitFor(() => {
        expect(screen.getAllByTestId('cake-card')).toHaveLength(10)
      })
      expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument()
    } finally {
      global.IntersectionObserver = previousIntersectionObserver
    }
  })

  it('keeps mobile infinite-loading behavior for page query URLs', async () => {
    renderCatalog({
      viewportWidth: 390,
      items: createMixedCatalogItems({
        customCount: 10,
        byPostCount: 0
      }),
      search: '?page=2'
    })

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Custom cakes' })).toHaveAttribute('aria-selected', 'true')
    })

    expect(window.location.search).toContain('page=2')
    expect(screen.getAllByTestId('cake-card')).toHaveLength(6)
    expect(screen.getByText('Cake 1')).toBeInTheDocument()
    expect(screen.getByText('Cake 6')).toBeInTheDocument()
    expect(screen.queryByText('Cake 7')).not.toBeInTheDocument()

    triggerMobileInfiniteSentinelIntersection()

    await waitFor(() => {
      expect(screen.getAllByTestId('cake-card')).toHaveLength(10)
    })

    expect(window.location.search).toContain('page=2')
    expect(screen.getByText('Cake 10')).toBeInTheDocument()
  })

  it('keeps previously loaded feed depth when switching mobile tabs', async () => {
    renderCatalog({
      viewportWidth: 390,
      items: createMixedCatalogItems({
        customCount: 12,
        byPostCount: 12
      })
    })

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Custom cakes' })).toHaveAttribute('aria-selected', 'true')
    })
    expect(screen.getAllByTestId('cake-card')).toHaveLength(6)

    triggerMobileInfiniteSentinelIntersection()

    await waitFor(() => {
      expect(screen.getAllByTestId('cake-card')).toHaveLength(12)
    })
    expect(screen.getByText('Cake 12')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: 'Cakes by post' }))

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Cakes by post' })).toHaveAttribute('aria-selected', 'true')
    })
    expect(screen.getAllByTestId('cake-card')).toHaveLength(6)
    expect(screen.getByText('Hamper 6')).toBeInTheDocument()

    triggerMobileInfiniteSentinelIntersection()

    await waitFor(() => {
      expect(screen.getAllByTestId('cake-card')).toHaveLength(12)
    })
    expect(screen.getByText('Hamper 12')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: 'Custom cakes' }))

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Custom cakes' })).toHaveAttribute('aria-selected', 'true')
    })
    expect(screen.getAllByTestId('cake-card')).toHaveLength(12)
    expect(screen.getByText('Cake 12')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: 'Cakes by post' }))

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Cakes by post' })).toHaveAttribute('aria-selected', 'true')
    })
    expect(screen.getAllByTestId('cake-card')).toHaveLength(12)
    expect(screen.getByText('Hamper 12')).toBeInTheDocument()
  })

  it('scrolls to top and clears legacy query params when switching mobile tabs', async () => {
    renderCatalog({
      viewportWidth: 390,
      items: createMixedCatalogItems({
        customCount: 1,
        byPostCount: 1
      }),
      search: '?sort=priceLowToHigh&maxPrice=5&collections=c-celebration&page=2'
    })

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Custom cakes' })).toHaveAttribute('aria-selected', 'true')
    })

    document.documentElement.scrollTop = 220
    document.body.scrollTop = 120
    fireEvent.click(screen.getByRole('tab', { name: 'Cakes by post' }))

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Cakes by post' })).toHaveAttribute('aria-selected', 'true')
    })

    expect(document.documentElement.scrollTop).toBe(0)
    expect(document.body.scrollTop).toBe(0)

    const urlSearchParams = new URLSearchParams(window.location.search)
    const queryKeys = Array.from(urlSearchParams.keys()).sort()
    expect(queryKeys).toEqual(['byPost', 'custom', 'maxPrice'])
    expect(urlSearchParams.get('byPost')).toBe('true')
    expect(urlSearchParams.get('custom')).toBe('false')
    expect(urlSearchParams.get('maxPrice')).toBe('5')
  })

  it('renders an inline compact mobile sort bar for category landing pages', async () => {
    renderCatalog({
      viewportWidth: 390,
      items: createMixedCatalogItems({
        customCount: 8,
        byPostCount: 0
      }),
      catalogMode: 'category-landing',
      showProductTypeFilters: false,
      showDesktopFilters: false,
      showMobileFilterSheet: false,
      showPriceFilter: false,
      showCollectionFilters: false,
      mobileToolbarVariant: 'inline-compact'
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Sort new' })).toBeInTheDocument()
    })

    expect(screen.queryByRole('button', { name: 'Filter & Sort' })).not.toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: 'Custom cakes' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Grid view' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Single-column view' })).not.toBeInTheDocument()
    expect(screen.getAllByTestId('cake-card')).toHaveLength(6)
  })

  it('removes the desktop filter sidebar for category landing pages', async () => {
    renderCatalog({
      viewportWidth: 1200,
      cakeCount: 6,
      catalogMode: 'category-landing',
      showProductTypeFilters: false,
      showDesktopFilters: false,
      showMobileFilterSheet: false,
      showPriceFilter: false,
      showCollectionFilters: false,
      mobileToolbarVariant: 'inline-compact'
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Sort new' })).toBeInTheDocument()
    })

    expect(screen.queryByRole('button', { name: 'Reset filters' })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Price range')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Toggle first collection' })).not.toBeInTheDocument()
  })

  it('preserves pure pagination query params on category landing pages', async () => {
    renderCatalog({
      viewportWidth: 1200,
      items: createMixedCatalogItems({
        customCount: 12,
        byPostCount: 0
      }),
      search: '?sort=priceLowToHigh&page=2',
      catalogMode: 'category-landing',
      showProductTypeFilters: false,
      showDesktopFilters: false,
      showMobileFilterSheet: false,
      showPriceFilter: false,
      showCollectionFilters: false,
      mobileToolbarVariant: 'inline-compact'
    })

    await waitFor(() => {
      expect(window.location.search).toContain('sort=priceLowToHigh')
      expect(window.location.search).toContain('page=2')
    })
  })

  it('clears hidden filter query params on category landing pages while keeping sort', async () => {
    renderCatalog({
      viewportWidth: 1200,
      items: createMixedCatalogItems({
        customCount: 12,
        byPostCount: 0
      }),
      search: '?sort=priceLowToHigh&maxPrice=5&collections=c-celebration&page=2',
      catalogMode: 'category-landing',
      showProductTypeFilters: false,
      showDesktopFilters: false,
      showMobileFilterSheet: false,
      showPriceFilter: false,
      showCollectionFilters: false,
      mobileToolbarVariant: 'inline-compact'
    })

    await waitFor(() => {
      expect(window.location.search).toContain('sort=priceLowToHigh')
    })

    await waitFor(() => {
      expect(window.location.search).not.toContain('maxPrice=')
      expect(window.location.search).not.toContain('collections=')
      expect(window.location.search).not.toContain('page=')
    })
  })

  it('keeps empty state and hides pagination when no cards match', () => {
    renderCatalog({ cakeCount: 0 })

    expect(screen.getByText('No cakes match the selected filters yet.')).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Cake catalog pagination' })).not.toBeInTheDocument()
  })
})


