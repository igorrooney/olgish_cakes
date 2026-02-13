/**
 * @jest-environment jsdom
 */
import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { CakesTabletCatalog } from '../CakesTabletCatalog'
import type { CakesCollectionOption, TabletCake } from '../types'

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
    onToggleByPost: (checked: boolean) => void
    onToggleCustom: (checked: boolean) => void
    onPriceChange: (price: number) => void
    onToggleCollection: (collectionId: string, checked: boolean) => void
    onReset: () => void
  }) => {
    const firstCollection = collectionOptions[0]

    return (
      <div>
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

function setViewportWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: width
  })
}

function renderCatalog({
  cakeCount = 10,
  search = '',
  viewportWidth = 1200
}: {
  cakeCount?: number
  search?: string
  viewportWidth?: number
} = {}) {
  const cakes = Array.from({ length: cakeCount }, (_, index) => createCake(index + 1))
  window.history.replaceState({}, '', `/cakes${search}`)
  setViewportWidth(viewportWidth)

  return render(
    <CakesTabletCatalog
      cakes={cakes}
      featuredOffer={null}
      collectionOptions={collectionOptions}
    />
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
  beforeEach(() => {
    window.history.replaceState({}, '', '/cakes')
    setViewportWidth(1200)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
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
