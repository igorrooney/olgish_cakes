/**
 * @jest-environment jsdom
 */
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CakesPage, { generateMetadata } from '../page'
import { getAllCakes, getCakesFeaturedOffer } from '../../utils/fetchCakes'
import { getAllGiftHampers } from '../../utils/fetchGiftHampers'
import { getHomepageCollections, getHomepageGiftHamperCollections } from '../../utils/fetchCollections'
import { Cake } from '@/types/cake'
import { CakesFeaturedOffer } from '@/types/cakeFeaturedOffer'

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
  const createSerializer = (parsers: Record<string, Parser<unknown>>) => (
    base: string,
    updates: Record<string, unknown>
  ) => {
    const [pathname, rawQueryString = ''] = base.split('?')
    const nextSearchParams = new URLSearchParams(rawQueryString)

    Object.entries(updates).forEach(([key, value]) => {
      const parser = parsers[key]

      if (!parser || value === null || value === undefined || value === parser.defaultValue) {
        nextSearchParams.delete(key)
        return
      }

      nextSearchParams.set(key, parser.serialize(value))
    })

    const queryString = nextSearchParams.toString()

    return queryString.length > 0
      ? `${pathname}?${queryString}`
      : pathname
  }

  function useQueryStates(parsers: Record<string, Parser<unknown>>) {
    const [state, setState] = React.useState(() => {
      const params = new URLSearchParams(window.location.search)
      const initialState: Record<string, unknown> = {}

      Object.entries(parsers).forEach(([key, parser]) => {
        const parsed = parser.parse(params.get(key))
        initialState[key] = parsed === null
          ? parser.defaultValue ?? null
          : parsed
      })

      return initialState
    })

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

          if (value === null || value === undefined || value === parser.defaultValue) {
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
    createSerializer,
    parseAsArrayOf,
    parseAsBoolean,
    parseAsInteger,
    parseAsString,
    parseAsStringLiteral,
    useQueryStates
  }
})

jest.mock('next/navigation', () => ({
  usePathname: () => window.location.pathname,
  useSearchParams: () => new URLSearchParams(window.location.search)
}))

jest.mock('../../utils/fetchCakes', () => ({
  getAllCakes: jest.fn(),
  getCakesFeaturedOffer: jest.fn()
}))

jest.mock('../../utils/fetchGiftHampers', () => ({
  getAllGiftHampers: jest.fn()
}))

jest.mock('../../utils/fetchCollections', () => ({
  getHomepageCollections: jest.fn(),
  getHomepageGiftHamperCollections: jest.fn()
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: React.ComponentProps<'img'>) => <img alt={alt || ''} {...props} />
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...props
  }: React.PropsWithChildren<{ href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>>) => (
    <a href={href} {...props}>{children}</a>
  )
}))

const mockedGetAllCakes = getAllCakes as jest.MockedFunction<typeof getAllCakes>
const mockedGetCakesFeaturedOffer = getCakesFeaturedOffer as jest.MockedFunction<typeof getCakesFeaturedOffer>
const mockedGetAllGiftHampers = getAllGiftHampers as jest.MockedFunction<typeof getAllGiftHampers>
const mockedGetHomepageCollections = getHomepageCollections as jest.MockedFunction<typeof getHomepageCollections>
const mockedGetHomepageGiftHamperCollections = getHomepageGiftHamperCollections as jest.MockedFunction<typeof getHomepageGiftHamperCollections>

const sampleFeaturedOffer: CakesFeaturedOffer = {
  eyebrow: 'Featured',
  title: 'FREE Honey Cake Offer',
  description: 'For a limited time enjoy some honey cake on us.\nNo strings attached.',
  ctaLabel: 'Get free honey cake',
  cakeSlug: 'sample-honey-cake',
  imageUrl: 'https://cdn.sanity.io/images/project/dataset/sample.jpg',
  imageAlt: 'Featured honey cake offer from Olgish Cakes'
}

const sampleCake: Cake = {
  _id: 'cake-1',
  _createdAt: '2026-02-01T12:00:00.000Z',
  name: 'Sample Honey Cake',
  slug: { current: 'sample-honey-cake' },
  description: [
    {
      _type: 'block',
      children: [{ text: 'A rich and soft Ukrainian honey cake.' }]
    }
  ],
  shortDescription: [
    {
      _type: 'block',
      children: [{ text: 'A rich and soft Ukrainian honey cake.' }]
    }
  ],
  size: '8inch',
  pricing: {
    standard: 35,
    individual: 45
  },
  designs: {
    standard: []
  },
  category: 'Traditional',
  ingredients: ['Flour', 'Honey', 'Cream'],
  allergens: ['Gluten', 'Dairy']
}

const cakeCollection = {
  _id: 'collection-cake',
  name: 'Wedding Cakes',
  isFeatured: false
}

const sampleByPostCatalogCake = {
  id: 'hamper-1',
  slug: 'postal-gift-hamper',
  href: '/cakes-by-post/postal-gift-hamper',
  navigationTarget: 'product' as const,
  name: 'Postal Gift Hamper',
  description: 'A thoughtful by post gift hamper.',
  price: 32,
  imageUrl: '/images/placeholder-cake.jpg',
  imageAlt: 'Postal Gift Hamper by Olgish Cakes',
  isByPost: true,
  isCustom: false,
  isPopular: false,
  collectionIds: ['collection-hamper'],
  productType: 'giftHamper' as const
}

const sampleByPostCollectionOption = {
  id: 'collection-hamper',
  queryValue: 'h-postal-gifts',
  legacyQueryValues: ['collection-hamper'],
  label: 'Postal Gifts',
  isFeatured: false,
  productType: 'giftHamper' as const
}

function parseJsonLdScripts(container: HTMLElement) {
  return Array.from(container.querySelectorAll('script[type="application/ld+json"]'))
    .map((script) => JSON.parse(script.textContent || '{}') as Record<string, unknown>)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function renderCakesPage(page: React.ReactElement, searchParams = '') {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  })

  window.history.replaceState({}, '', `/cakes${searchParams}`)
  return render(
    <QueryClientProvider client={queryClient}>
      {page}
    </QueryClientProvider>
  )
}

describe('CakesPage', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    jest.restoreAllMocks()
    global.fetch = originalFetch
    mockedGetAllCakes.mockResolvedValue([sampleCake])
    mockedGetAllGiftHampers.mockResolvedValue([])
    mockedGetCakesFeaturedOffer.mockResolvedValue(sampleFeaturedOffer)
    mockedGetHomepageCollections.mockResolvedValue([])
    mockedGetHomepageGiftHamperCollections.mockResolvedValue([])
  })

  it('uses base canonical metadata when no query params are provided', async () => {
    const metadata = await generateMetadata({
      searchParams: Promise.resolve({})
    })

    expect(metadata.alternates?.canonical).toBe('https://olgishcakes.co.uk/cakes')
    expect(metadata.openGraph?.url).toBe('https://olgishcakes.co.uk/cakes')
  })

  it('uses self canonical metadata for pure pagination query', async () => {
    const metadata = await generateMetadata({
      searchParams: Promise.resolve({ page: '2' })
    })

    expect(metadata.alternates?.canonical).toBe('https://olgishcakes.co.uk/cakes?page=2')
    expect(metadata.openGraph?.url).toBe('https://olgishcakes.co.uk/cakes?page=2')
    expect(metadata.robots).toBeUndefined()
  })

  it('falls back to base canonical metadata for mixed pagination query', async () => {
    const metadata = await generateMetadata({
      searchParams: Promise.resolve({ page: '2', collections: 'c-wedding-cakes' })
    })

    expect(metadata.alternates?.canonical).toBe('https://olgishcakes.co.uk/cakes')
    expect(metadata.openGraph?.url).toBe('https://olgishcakes.co.uk/cakes')
    expect(metadata.robots).toEqual({
      index: false,
      follow: true
    })
  })

  it('keeps metadata title and description for SEO', async () => {
    const metadata = await generateMetadata({
      searchParams: Promise.resolve({})
    })

    expect(typeof metadata.title).toBe('string')
    expect(typeof metadata.description).toBe('string')

    const title = metadata.title as string
    const description = metadata.description as string

    expect(title.length).toBeGreaterThanOrEqual(50)
    expect(title.length).toBeLessThanOrEqual(60)
    expect(description.length).toBeGreaterThanOrEqual(150)
    expect(description.length).toBeLessThanOrEqual(160)
  })

  it('fetches cakes with preview disabled', async () => {
    await CakesPage()
    expect(mockedGetAllCakes).toHaveBeenCalledWith(false)
    expect(mockedGetAllGiftHampers).toHaveBeenCalledWith(false)
    expect(mockedGetCakesFeaturedOffer).toHaveBeenCalledWith(false)
    expect(mockedGetHomepageGiftHamperCollections).not.toHaveBeenCalled()
  })

  it('renders page when optional by-post price hint fetch fails', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      mockedGetAllGiftHampers.mockRejectedValueOnce(new Error('By-post hint fetch failed'))

      const page = await CakesPage()
      renderCakesPage(page)

      expect(
        screen.getByRole('heading', {
          level: 1,
          name: 'Traditional Ukrainian custom cakes in Leeds for celebrations'
        })
      ).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /View details for Sample Honey Cake/i })).toBeInTheDocument()
      expect(warnSpy).toHaveBeenCalledWith(
        'Failed to fetch by-post cakes price ceiling hint for cakes page:',
        expect.any(Error)
      )
    } finally {
      warnSpy.mockRestore()
    }
  })

  it('defaults to custom cakes and only shows hampers after by post opt in', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        cakes: [sampleByPostCatalogCake],
        collectionOptions: [sampleByPostCollectionOption]
      })
    } as Response)

    const page = await CakesPage()
    renderCakesPage(page)

    expect(screen.getByRole('link', { name: /View details for Sample Honey Cake/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /View details for Postal Gift Hamper/i })).not.toBeInTheDocument()

    const byPostCheckbox = screen.getByRole('checkbox', { name: /Cakes by post/i })
    const customCheckbox = screen.getByRole('checkbox', { name: /Custom cakes/i })

    expect(customCheckbox).toBeChecked()
    expect(byPostCheckbox).not.toBeChecked()

    fireEvent.click(byPostCheckbox)

    await screen.findByRole('link', { name: /View details for Postal Gift Hamper/i })
    expect(screen.getByRole('link', { name: /View details for Sample Honey Cake/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /View details for Postal Gift Hamper/i })).toBeInTheDocument()

    fireEvent.click(customCheckbox)

    await screen.findByRole('link', { name: /View details for Postal Gift Hamper/i })
    expect(screen.queryByRole('link', { name: /View details for Sample Honey Cake/i })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /View details for Postal Gift Hamper/i })).toBeInTheDocument()
  })

  it('restores filter state from URL params for shareable links', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        cakes: [sampleByPostCatalogCake],
        collectionOptions: [sampleByPostCollectionOption]
      })
    } as Response)

    const page = await CakesPage()
    renderCakesPage(page, '?byPost=true&custom=false')

    const customCheckbox = screen.getByRole('checkbox', { name: /Custom cakes/i })

    expect(customCheckbox).not.toBeChecked()
    expect(screen.queryByRole('link', { name: /View details for Sample Honey Cake/i })).not.toBeInTheDocument()
    expect(await screen.findByRole('link', { name: /View details for Postal Gift Hamper/i })).toBeInTheDocument()

    const byPostCheckbox = await screen.findByRole('checkbox', { name: /Cakes by post/i })
    expect(byPostCheckbox).toBeChecked()
  })

  it('uses short readable collection query values', async () => {
    mockedGetHomepageCollections.mockResolvedValueOnce([cakeCollection])
    mockedGetAllCakes.mockResolvedValueOnce([
      {
        ...sampleCake,
        _id: 'cake-collection-1',
        name: 'Wedding Cake',
        slug: { current: 'wedding-cake' },
        collections: [{ _id: 'collection-cake', name: 'Wedding Cakes' }]
      },
      {
        ...sampleCake,
        _id: 'cake-collection-2',
        name: 'Kyiv Cake',
        slug: { current: 'kyiv-cake' },
        collections: [{ _id: 'collection-other', name: 'Traditional' }]
      }
    ])

    const page = await CakesPage()
    renderCakesPage(page, '?collections=c-wedding-cakes')

    expect(screen.getByRole('link', { name: /View details for Wedding Cake/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /View details for Kyiv Cake/i })).not.toBeInTheDocument()
  })

  it('restores birthday collection filters from URL params', async () => {
    mockedGetHomepageCollections.mockResolvedValueOnce([{
      _id: 'collection-birthday',
      name: 'Birthday Cakes',
      isFeatured: false
    }])
    mockedGetAllCakes.mockResolvedValueOnce([
      {
        ...sampleCake,
        _id: 'cake-birthday-1',
        name: 'Birthday Star Cake',
        slug: { current: 'birthday-star-cake' },
        collections: [{ _id: 'collection-birthday', name: 'Birthday Cakes' }]
      },
      {
        ...sampleCake,
        _id: 'cake-birthday-2',
        name: 'Kyiv Cake',
        slug: { current: 'kyiv-cake' },
        collections: [{ _id: 'collection-other', name: 'Traditional' }]
      }
    ])

    const page = await CakesPage()
    renderCakesPage(page, '?collections=c-birthday-cakes')

    expect(screen.getByRole('link', { name: /View details for Birthday Star Cake/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /View details for Kyiv Cake/i })).not.toBeInTheDocument()
  })

  it('restores anniversary collection filters from URL params', async () => {
    mockedGetHomepageCollections.mockResolvedValueOnce([{
      _id: 'collection-anniversary',
      name: 'Anniversary Cakes',
      isFeatured: false
    }])
    mockedGetAllCakes.mockResolvedValueOnce([
      {
        ...sampleCake,
        _id: 'cake-anniversary-1',
        name: 'Anniversary Rose Cake',
        slug: { current: 'anniversary-rose-cake' },
        collections: [{ _id: 'collection-anniversary', name: 'Anniversary Cakes' }]
      },
      {
        ...sampleCake,
        _id: 'cake-anniversary-2',
        name: 'Kyiv Cake',
        slug: { current: 'kyiv-cake' },
        collections: [{ _id: 'collection-other', name: 'Traditional' }]
      }
    ])

    const page = await CakesPage()
    renderCakesPage(page, '?collections=c-anniversary-cakes')

    expect(screen.getByRole('link', { name: /View details for Anniversary Rose Cake/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /View details for Kyiv Cake/i })).not.toBeInTheDocument()
  })

  it('restores baby shower collection filters from URL params', async () => {
    mockedGetHomepageCollections.mockResolvedValueOnce([{
      _id: 'collection-baby-shower',
      name: 'Baby Shower Cakes',
      isFeatured: false
    }])
    mockedGetAllCakes.mockResolvedValueOnce([
      {
        ...sampleCake,
        _id: 'cake-baby-shower-1',
        name: 'Baby Shower Cloud Cake',
        slug: { current: 'baby-shower-cloud-cake' },
        collections: [{ _id: 'collection-baby-shower', name: 'Baby Shower Cakes' }]
      },
      {
        ...sampleCake,
        _id: 'cake-baby-shower-2',
        name: 'Kyiv Cake',
        slug: { current: 'kyiv-cake' },
        collections: [{ _id: 'collection-other', name: 'Traditional' }]
      }
    ])

    const page = await CakesPage()
    renderCakesPage(page, '?collections=c-baby-shower-cakes')

    expect(screen.getByRole('link', { name: /View details for Baby Shower Cloud Cake/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /View details for Kyiv Cake/i })).not.toBeInTheDocument()
  })

  it('keeps old collection id query values working', async () => {
    mockedGetHomepageCollections.mockResolvedValueOnce([cakeCollection])
    mockedGetAllCakes.mockResolvedValueOnce([
      {
        ...sampleCake,
        _id: 'cake-legacy-1',
        name: 'Legacy Collection Cake',
        slug: { current: 'legacy-collection-cake' },
        collections: [{ _id: 'collection-cake', name: 'Wedding Cakes' }]
      },
      {
        ...sampleCake,
        _id: 'cake-legacy-2',
        name: 'Unrelated Cake',
        slug: { current: 'unrelated-cake' },
        collections: [{ _id: 'collection-other', name: 'Traditional' }]
      }
    ])

    const page = await CakesPage()
    renderCakesPage(page, '?collections=collection-cake')

    expect(screen.getByRole('link', { name: /View details for Legacy Collection Cake/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /View details for Unrelated Cake/i })).not.toBeInTheDocument()
  })

  it('writes short collection query value when selecting collection', async () => {
    mockedGetHomepageCollections.mockResolvedValueOnce([cakeCollection])

    const page = await CakesPage()
    renderCakesPage(page)

    fireEvent.click(screen.getByRole('checkbox', { name: /Wedding Cakes/i }))

    expect(window.location.search).toContain('collections=c-wedding-cakes')
    expect(window.location.search).not.toContain('collection-cake')
  })

  it('scrolls to the top when opening with a preselected collection', async () => {
    document.documentElement.scrollTop = 180
    document.body.scrollTop = 120

    const page = await CakesPage()
    renderCakesPage(page, '?collections=c-wedding-cakes')

    expect(document.documentElement.scrollTop).toBe(0)
    expect(document.body.scrollTop).toBe(0)
  })

  it('switches collection filters by selected category', async () => {
    mockedGetHomepageCollections.mockResolvedValueOnce([cakeCollection])
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        cakes: [sampleByPostCatalogCake],
        collectionOptions: [sampleByPostCollectionOption]
      })
    } as Response)

    const page = await CakesPage()
    renderCakesPage(page)

    expect(screen.getByText('Wedding Cakes')).toBeInTheDocument()
    expect(screen.queryByText('Postal Gifts')).not.toBeInTheDocument()

    const byPostCheckbox = await screen.findByRole('checkbox', { name: /Cakes by post/i })

    fireEvent.click(byPostCheckbox)

    expect(await screen.findByText('Postal Gifts')).toBeInTheDocument()
    expect(screen.getByText('Postal Gifts')).toBeInTheDocument()
    expect(screen.getByText('Wedding Cakes')).toBeInTheDocument()

    const byPostCheckboxAfterLoad = await screen.findByRole('checkbox', { name: /Cakes by post/i })
    fireEvent.click(byPostCheckboxAfterLoad)

    await screen.findByText('Wedding Cakes')
    expect(screen.queryByText('Postal Gifts')).not.toBeInTheDocument()
  })

  it('renders featured offer, filters, sorting and cards', async () => {
    const page = await CakesPage()
    renderCakesPage(page)

    const pageHeading = screen.getByRole('heading', {
      level: 1,
      name: 'Traditional Ukrainian custom cakes in Leeds for celebrations'
    })
    const pageIntro = screen.getByText(
      'Browse handmade Ukrainian cakes prepared in Leeds with traditional recipes, quality ingredients and flavours that feel like home.'
    )

    expect(pageHeading).toBeInTheDocument()
    expect(pageHeading).toHaveClass(
      'sr-only',
      'tablet:not-sr-only',
      'tablet:!mt-2',
      'tablet:!mx-auto'
    )
    expect(pageIntro).toBeInTheDocument()
    expect(pageIntro).toHaveClass(
      'sr-only',
      'tablet:not-sr-only',
      'tablet:!mt-3',
      'tablet:!mx-auto'
    )
    const headingSection = pageHeading.closest('section')
    if (!headingSection) {
      throw new Error('Expected heading section wrapper')
    }
    expect(headingSection).toHaveClass('pt-0', 'pb-0', 'tablet:pt-8', 'tablet:pb-2')
    expect(screen.queryByText('Authentic Ukrainian cakes in Leeds, baked fresh to order')).not.toBeInTheDocument()
    expect(screen.getByText('FREE Honey Cake Offer')).toBeInTheDocument()
    expect(screen.getByText('Filter by')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Most popular' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Price: Low to high' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Get free honey cake' })).toHaveAttribute('href', '/cakes/sample-honey-cake')
    expect(screen.getByRole('link', { name: /View details for Sample Honey Cake/i })).toHaveAttribute(
      'href',
      '/cakes/sample-honey-cake?from=%2Fcakes'
    )
    expect(screen.getByRole('heading', { level: 3, name: 'Sample Honey Cake' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Cake ordering FAQs' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Do you make custom birthday and wedding cakes in Leeds?' })).toBeInTheDocument()

    const ukDeliveryButton = screen.getByRole('button', { name: 'Can any cake be delivered across the UK?' })
    fireEvent.click(ukDeliveryButton)
    expect(screen.getByText('Yes. Any cake can be delivered across the UK by agreement. During ordering, put all requests in the Requirements field in the order form so I can confirm the cake type, date, delivery details, and cost.')).toBeInTheDocument()

    const corporateClientsButton = screen.getByRole('button', { name: 'Do you work with corporate clients and events?' })
    fireEvent.click(corporateClientsButton)
    expect(screen.getByText('Yes. I work with corporate clients and can supply cakes for any event or corporate celebration. Share your date, headcount, and style, and I will suggest suitable options.')).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Catalog pagination crawl links' })).not.toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Catalog product crawl links' })).not.toBeInTheDocument()
  })

  it('shows cakes above one hundred pounds by default', async () => {
    mockedGetAllCakes.mockResolvedValueOnce([
      {
        ...sampleCake,
        _id: 'cake-2',
        name: 'Luxury Cake',
        slug: { current: 'luxury-cake' },
        pricing: {
          standard: 120,
          individual: 130
        }
      }
    ])

    const page = await CakesPage()
    renderCakesPage(page)

    expect(screen.getByRole('link', { name: /View details for Luxury Cake/i })).toHaveAttribute(
      'href',
      '/cakes/luxury-cake?from=%2Fcakes'
    )
  })

  it('hides featured offer when not configured in Sanity', async () => {
    mockedGetCakesFeaturedOffer.mockResolvedValueOnce(null)

    const page = await CakesPage()
    renderCakesPage(page)

    expect(screen.queryByText('FREE Honey Cake Offer')).not.toBeInTheDocument()
  })

  it('falls back to placeholder cakes when no cakes are fetched', async () => {
    mockedGetAllCakes.mockResolvedValueOnce([])

    const page = await CakesPage()
    renderCakesPage(page)

    expect(screen.getByRole('heading', { level: 3, name: 'Birthday cakes in Leeds' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Explore Birthday cakes in Leeds/i })).toHaveAttribute(
      'href',
      '/birthday-cakes?from=%2Fcakes'
    )
    expect(screen.queryByText('Cake by Post Gift Hamper')).not.toBeInTheDocument()
  })

  it('renders bakery, breadcrumb and ItemList structured data scripts', async () => {
    const page = await CakesPage()
    const { container } = renderCakesPage(page)
    const jsonLdBlocks = parseJsonLdScripts(container)

    const bakeryBlock = jsonLdBlocks.find((block) => block['@type'] === 'Bakery')
    const breadcrumbBlock = jsonLdBlocks.find((block) => block['@type'] === 'BreadcrumbList')
    const faqBlock = jsonLdBlocks.find((block) => block['@type'] === 'FAQPage')
    const itemListGraphBlock = jsonLdBlocks.find((block) => Array.isArray(block['@graph']))

    expect(bakeryBlock).toBeDefined()
    expect(breadcrumbBlock).toBeDefined()
    expect(faqBlock).toBeUndefined()
    expect(itemListGraphBlock).toBeDefined()

    if (!isRecord(bakeryBlock)) {
      throw new Error('Bakery structured data block is missing')
    }

    expect(bakeryBlock['@type']).toBe('Bakery')
    expect(bakeryBlock.priceRange).toBe('\u00A3\u00A3')

    if (!isRecord(itemListGraphBlock) || !Array.isArray(itemListGraphBlock['@graph'])) {
      throw new Error('Expected @graph structured data block')
    }

    const itemListEntry = itemListGraphBlock['@graph']
      .find((entry) => isRecord(entry) && entry['@type'] === 'ItemList')

    if (!isRecord(itemListEntry) || !Array.isArray(itemListEntry.itemListElement)) {
      throw new Error('Expected ItemList entry in @graph')
    }

    const firstListItem = itemListEntry.itemListElement[0]

    if (!isRecord(firstListItem) || !isRecord(firstListItem.item)) {
      throw new Error('Expected first list item product data')
    }

    expect(firstListItem.item.url).toBe('https://olgishcakes.co.uk/cakes/sample-honey-cake')
    expect(firstListItem.item).toHaveProperty('offers')
    if (!isRecord(firstListItem.item.offers)) {
      throw new Error('Expected first list item offer data')
    }
    expect(firstListItem.item.offers).not.toHaveProperty('shippingDetails')
  })

  it('uses minimum servings base price for ItemList structured data offers', async () => {
    mockedGetAllCakes.mockResolvedValueOnce([
      {
        ...sampleCake,
        pricing: {
          standard: 35,
          individual: 45
        },
        newDesignPricingByServings: {
          servings2To4: 35,
          servings4To8: 49,
          servings8To12: 62
        }
      }
    ])
    const page = await CakesPage()
    const { container } = renderCakesPage(page)
    const jsonLdBlocks = parseJsonLdScripts(container)
    const itemListGraphBlock = jsonLdBlocks.find((block) => Array.isArray(block['@graph']))
    if (!isRecord(itemListGraphBlock) || !Array.isArray(itemListGraphBlock['@graph'])) {
      throw new Error('Expected @graph structured data block')
    }
    const itemListEntry = itemListGraphBlock['@graph']
      .find((entry) => isRecord(entry) && entry['@type'] === 'ItemList')
    if (!isRecord(itemListEntry) || !Array.isArray(itemListEntry.itemListElement)) {
      throw new Error('Expected ItemList entry in @graph')
    }
    const firstListItem = itemListEntry.itemListElement[0]
    if (!isRecord(firstListItem) || !isRecord(firstListItem.item) || !isRecord(firstListItem.item.offers)) {
      throw new Error('Expected first list item offer data')
    }
    expect(firstListItem.item.offers.price).toBe(35)
  })

  it('excludes fallback landing CTAs from ItemList structured data', async () => {
    mockedGetAllCakes.mockResolvedValueOnce([])

    const page = await CakesPage()
    const { container } = renderCakesPage(page)
    const jsonLdBlocks = parseJsonLdScripts(container)
    const itemListGraphBlock = jsonLdBlocks.find((block) => Array.isArray(block['@graph']))

    if (!isRecord(itemListGraphBlock) || !Array.isArray(itemListGraphBlock['@graph'])) {
      throw new Error('Expected @graph structured data block')
    }

    const itemListEntry = itemListGraphBlock['@graph']
      .find((entry) => isRecord(entry) && entry['@type'] === 'ItemList')

    if (!isRecord(itemListEntry) || !Array.isArray(itemListEntry.itemListElement)) {
      throw new Error('Expected ItemList entry in @graph')
    }

    const urls = itemListEntry.itemListElement
      .map((entry) => {
        if (!isRecord(entry) || !isRecord(entry.item) || typeof entry.item.url !== 'string') {
          return ''
        }

        return entry.item.url
      })
      .filter((url) => url.length > 0)

    expect(urls).toEqual([])
  })
})




