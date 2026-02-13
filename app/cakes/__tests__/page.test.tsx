/**
 * @jest-environment jsdom
 */
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import CakesPage, { dynamic, metadata } from '../page'
import { getAllCakes, getCakesFeaturedOffer } from '../../utils/fetchCakes'
import { getAllGiftHampers } from '../../utils/fetchGiftHampers'
import { getHomepageCollections, getHomepageGiftHamperCollections } from '../../utils/fetchCollections'
import { Cake } from '@/types/cake'
import { GiftHamper } from '@/types/giftHamper'
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

const sampleGiftHamper: GiftHamper = {
  _id: 'hamper-1',
  _createdAt: '2026-02-01T12:00:00.000Z',
  name: 'Postal Gift Hamper',
  slug: { current: 'postal-gift-hamper' },
  shortDescription: [
    {
      _type: 'block',
      children: [{ text: 'A thoughtful by post gift hamper.' }]
    }
  ],
  price: 32,
  images: []
}

const cakeCollection = {
  _id: 'collection-cake',
  name: 'Wedding Cakes',
  isFeatured: false
}

const giftHamperCollection = {
  _id: 'collection-hamper',
  name: 'Postal Gifts',
  isFeatured: false
}

function renderCakesPage(page: React.ReactElement, searchParams = '') {
  window.history.replaceState({}, '', `/cakes${searchParams}`)
  return render(page)
}

describe('CakesPage', () => {
  beforeEach(() => {
    mockedGetAllCakes.mockResolvedValue([sampleCake])
    mockedGetAllGiftHampers.mockResolvedValue([])
    mockedGetCakesFeaturedOffer.mockResolvedValue(sampleFeaturedOffer)
    mockedGetHomepageCollections.mockResolvedValue([])
    mockedGetHomepageGiftHamperCollections.mockResolvedValue([])
  })

  it('uses static generation mode', () => {
    expect(dynamic).toBe('force-static')
  })

  it('keeps metadata with canonical url', () => {
    expect(metadata.alternates?.canonical).toBe('https://olgishcakes.co.uk/cakes')
  })

  it('keeps metadata title and description for SEO', () => {
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
    expect(mockedGetHomepageGiftHamperCollections).toHaveBeenCalled()
  })

  it('defaults to custom cakes and only shows hampers after by post opt in', async () => {
    mockedGetAllGiftHampers.mockResolvedValueOnce([sampleGiftHamper])

    const page = await CakesPage()
    renderCakesPage(page)

    expect(screen.getByRole('link', { name: 'View details for Sample Honey Cake' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'View details for Postal Gift Hamper' })).not.toBeInTheDocument()

    const byPostCheckbox = screen.getByRole('checkbox', { name: /Cakes by post/i })
    const customCheckbox = screen.getByRole('checkbox', { name: /Custom cakes/i })

    expect(customCheckbox).toBeChecked()
    expect(byPostCheckbox).not.toBeChecked()

    fireEvent.click(byPostCheckbox)

    expect(screen.getByRole('link', { name: 'View details for Sample Honey Cake' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View details for Postal Gift Hamper' })).toBeInTheDocument()

    fireEvent.click(customCheckbox)

    expect(screen.queryByRole('link', { name: 'View details for Sample Honey Cake' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View details for Postal Gift Hamper' })).toBeInTheDocument()
  })

  it('restores filter state from URL params for shareable links', async () => {
    mockedGetAllGiftHampers.mockResolvedValueOnce([sampleGiftHamper])

    const page = await CakesPage()
    renderCakesPage(page, '?byPost=true&custom=false')

    const byPostCheckbox = screen.getByRole('checkbox', { name: /Cakes by post/i })
    const customCheckbox = screen.getByRole('checkbox', { name: /Custom cakes/i })

    expect(byPostCheckbox).toBeChecked()
    expect(customCheckbox).not.toBeChecked()
    expect(screen.queryByRole('link', { name: 'View details for Sample Honey Cake' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View details for Postal Gift Hamper' })).toBeInTheDocument()
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

    expect(screen.getByRole('link', { name: 'View details for Wedding Cake' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'View details for Kyiv Cake' })).not.toBeInTheDocument()
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

    expect(screen.getByRole('link', { name: 'View details for Legacy Collection Cake' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'View details for Unrelated Cake' })).not.toBeInTheDocument()
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
    mockedGetAllGiftHampers.mockResolvedValueOnce([sampleGiftHamper])
    mockedGetHomepageCollections.mockResolvedValueOnce([cakeCollection])
    mockedGetHomepageGiftHamperCollections.mockResolvedValueOnce([giftHamperCollection])

    const page = await CakesPage()
    renderCakesPage(page)

    expect(screen.getByText('Wedding Cakes')).toBeInTheDocument()
    expect(screen.queryByText('Postal Gifts')).not.toBeInTheDocument()

    const byPostCheckbox = screen.getByRole('checkbox', { name: /Cakes by post/i })

    fireEvent.click(byPostCheckbox)

    expect(screen.getByText('Postal Gifts')).toBeInTheDocument()
    expect(screen.getByText('Wedding Cakes')).toBeInTheDocument()

    fireEvent.click(byPostCheckbox)

    expect(screen.getByText('Wedding Cakes')).toBeInTheDocument()
    expect(screen.queryByText('Postal Gifts')).not.toBeInTheDocument()
  })

  it('renders featured offer, filters, sorting and cards', async () => {
    const page = await CakesPage()
    renderCakesPage(page)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Traditional Ukrainian cakes by post and custom cakes in Leeds'
      })
    ).toBeInTheDocument()
    expect(screen.getByText('Authentic Ukrainian cakes in Leeds, baked fresh to order')).toBeInTheDocument()
    expect(screen.getByText('FREE Honey Cake Offer')).toBeInTheDocument()
    expect(screen.getByText('Filter by')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Most popular' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Price: Low to high' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Get free honey cake' })).toHaveAttribute('href', '/cakes/sample-honey-cake')
    expect(screen.getByRole('link', { name: 'View details for Sample Honey Cake' })).toHaveAttribute('href', '/cakes/sample-honey-cake')
    expect(screen.getByText('Sample Honey Cake')).toBeInTheDocument()
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

    expect(screen.getByRole('link', { name: 'View details for Luxury Cake' })).toHaveAttribute('href', '/cakes/luxury-cake')
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

    expect(screen.getByText('Birthday Celebration Cake')).toBeInTheDocument()
    expect(screen.queryByText('Cake by Post Gift Hamper')).not.toBeInTheDocument()
  })

  it('renders bakery and breadcrumb structured data scripts', async () => {
    const page = await CakesPage()
    const { container } = renderCakesPage(page)

    const scripts = container.querySelectorAll('script[type="application/ld+json"]')
    const bakeryScript = Array.from(scripts).find((script) =>
      script.textContent?.includes('"@type":"Bakery"')
    )
    const breadcrumbScript = Array.from(scripts).find((script) =>
      script.textContent?.includes('"@type":"BreadcrumbList"')
    )

    expect(bakeryScript).toBeTruthy()
    expect(breadcrumbScript).toBeTruthy()

    if (!bakeryScript?.textContent) {
      throw new Error('Bakery structured data script is missing')
    }

    const parsedBakery = JSON.parse(bakeryScript.textContent) as {
      '@type'?: string
      priceRange?: string
    }

    expect(parsedBakery['@type']).toBe('Bakery')
    expect(parsedBakery.priceRange).toBe('££')
  })
})
