/**
 * @jest-environment jsdom
 */
import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CakesTabletCatalog } from '../CakesTabletCatalog'
import type { CakesCollectionOption, CatalogFilterDefaults, TabletCake } from '../types'

const renderedPriceValues: number[] = []

function resetRenderedPriceValues() {
  renderedPriceValues.length = 0
}

function getRenderedPriceValues() {
  return [...renderedPriceValues]
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

jest.mock('../CakesFeaturedOffer', () => ({
  CakesFeaturedOffer: () => <div data-testid='featured-offer'>Featured offer</div>
}))

jest.mock('../CakesProductCard', () => ({
  CakesProductCard: ({ cake }: { cake: { name: string } }) => (
    <article data-testid='cake-card'>{cake.name}</article>
  )
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

function createCake(index: number): TabletCake {
  return {
    id: `cake-${index}`,
    slug: `cake-${index}`,
    href: `/cakes/cake-${index}`,
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
    href: `/gift-hampers/hamper-${index}`,
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
  search = '',
  viewportWidth = 1200,
  initialFilterDefaults = { byPost: false, custom: true },
  lazyCustomCakesEndpoint,
  lazyCustomCakesPriceCeilingHint,
  lazyByPostCakesEndpoint,
  lazyByPostCakesPriceCeilingHint,
  strictMode = false
}: {
  items?: TabletCake[]
  cakeCount?: number
  search?: string
  viewportWidth?: number
  initialFilterDefaults?: CatalogFilterDefaults
  lazyCustomCakesEndpoint?: string
  lazyCustomCakesPriceCeilingHint?: number
  lazyByPostCakesEndpoint?: string
  lazyByPostCakesPriceCeilingHint?: number
  strictMode?: boolean
} = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  })
  const cakes = items ?? Array.from({ length: cakeCount }, (_, index) => createCake(index + 1))
  window.history.replaceState({}, '', `/cakes${search}`)
  setViewportWidth(viewportWidth)

  const catalog = (
    <CakesTabletCatalog
      cakes={cakes}
      featuredOffer={null}
      collectionOptions={collectionOptions}
      initialFilterDefaults={initialFilterDefaults}
      lazyCustomCakesEndpoint={lazyCustomCakesEndpoint}
      lazyCustomCakesPriceCeilingHint={lazyCustomCakesPriceCeilingHint}
      lazyByPostCakesEndpoint={lazyByPostCakesEndpoint}
      lazyByPostCakesPriceCeilingHint={lazyByPostCakesPriceCeilingHint}
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

function getCakeWrapper(cakeName: string) {
  const cakeLabel = screen.getByText(cakeName)
  return cakeLabel.parentElement
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

  beforeEach(() => {
    window.history.replaceState({}, '', '/cakes')
    setViewportWidth(1200)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    resetRenderedPriceValues()
    jest.restoreAllMocks()
    global.fetch = originalFetch
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
    expect(screen.getByRole('button', { name: 'Go to page 2' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Go to page 2' })).not.toBeInTheDocument()
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

    expect(screen.getByRole('button', { name: 'Go to page 2' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Go to small laptop page 2' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Go to small laptop page 3' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Go to small laptop page 4' })).not.toBeInTheDocument()
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
    expect(screen.queryByText('Loading custom cakes...')).not.toBeInTheDocument()
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
      expect(screen.getByText('Loading custom cakes...')).toBeInTheDocument()
    })

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

    expect(screen.queryByText('Loading custom cakes...')).not.toBeInTheDocument()
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
      expect(screen.getByText('Loading cakes by post...')).toBeInTheDocument()
    })

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

    expect(screen.queryByText('Loading cakes by post...')).not.toBeInTheDocument()
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/catalog/by-post-cakes',
      expect.objectContaining({
        signal: expect.any(AbortSignal)
      })
    )
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
    fireEvent.click(screen.getByRole('button', { name: 'Go to page 2' }))

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
      expect(screen.getByRole('button', { name: 'Go to page 10' })).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: 'Go to page 1' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Go to page 2' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Go to page 3' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Go to page 4' })).toBeInTheDocument()
    const ellipsis = screen.getByText('...').closest('span')
    expect(ellipsis).not.toBeNull()
    expect(ellipsis).toHaveAttribute('aria-hidden', 'true')
  })

  it('shows leading and trailing ellipsis on middle page when many pages exist', async () => {
    renderCatalog({ cakeCount: 60, search: '?page=5' })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Go to page 5' })).toHaveAttribute('aria-current', 'page')
    })

    expect(screen.getByRole('button', { name: 'Go to page 1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Go to page 4' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Go to page 6' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Go to page 10' })).toBeInTheDocument()
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

    expect(screen.getByRole('button', { name: 'Go to page 7' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Go to page 8' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Go to page 9' })).toBeInTheDocument()
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
    expect(screen.getByRole('button', { name: 'Next page' })).not.toBeDisabled()
    firstRender.unmount()

    renderCatalog({ cakeCount: 60, search: '?page=10' })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Previous page' })).not.toBeDisabled()
  })

  it('moves to next and previous pages with pagination buttons', async () => {
    renderCatalog({ cakeCount: 60, search: '?page=5' })

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }))

    await waitFor(() => {
      expect(window.location.search).toContain('page=6')
    })
    expect(screen.getByRole('button', { name: 'Go to page 6' })).toHaveAttribute('aria-current', 'page')

    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }))

    await waitFor(() => {
      expect(window.location.search).toContain('page=5')
    })
    expect(screen.getByRole('button', { name: 'Go to page 5' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Go to page 5' })).toBeDisabled()
  })

  it('shows all filtered cards and keeps pagination hidden via responsive classes on mobile', async () => {
    renderCatalog({ viewportWidth: 390 })

    await waitFor(() => {
      expect(screen.getAllByTestId('cake-card')).toHaveLength(10)
    })
    expectCakeHiddenOnTablet('Cake 7')
    expect(screen.getByRole('navigation', { name: 'Cake catalog pagination' })).toHaveClass('hidden', 'tablet:flex')
  })

  it('keeps empty state and hides pagination when no cards match', () => {
    renderCatalog({ cakeCount: 0 })

    expect(screen.getByText('No cakes match the selected filters yet.')).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Cake catalog pagination' })).not.toBeInTheDocument()
  })
})
