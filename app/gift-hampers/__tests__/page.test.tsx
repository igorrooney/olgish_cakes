/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import GiftHampersPage, { dynamic, metadata } from '../page'
import {
  getCatalogCustomCakesPriceCeiling,
  getCatalogPageData
} from '../../cakes/catalogPageData'
import { getAllTestimonialsStats } from '../../utils/fetchTestimonials'
import type { CatalogPageData } from '../../cakes/catalogPageData'
import type { TabletCake } from '../../cakes/components/types'

jest.mock('../../cakes/catalogPageData', () => ({
  getCatalogPageData: jest.fn(),
  getCatalogCustomCakesPriceCeiling: jest.fn()
}))

jest.mock('../../utils/fetchTestimonials', () => ({
  getAllTestimonialsStats: jest.fn()
}))

jest.mock('../../cakes/components/CakesTabletCatalog', () => ({
  CakesTabletCatalog: ({
    initialFilterDefaults
  }: {
    initialFilterDefaults: { byPost: boolean; custom: boolean }
  }) => (
    <div
      data-testid='cakes-catalog'
      data-by-post={String(initialFilterDefaults.byPost)}
      data-custom={String(initialFilterDefaults.custom)}
    >
      Shared catalog
    </div>
  )
}))

const mockedGetCatalogPageData = getCatalogPageData as jest.MockedFunction<typeof getCatalogPageData>
const mockedGetCatalogCustomCakesPriceCeiling =
  getCatalogCustomCakesPriceCeiling as jest.MockedFunction<typeof getCatalogCustomCakesPriceCeiling>
const mockedGetAllTestimonialsStats = getAllTestimonialsStats as jest.MockedFunction<typeof getAllTestimonialsStats>

function createCake(index: number): TabletCake {
  return {
    id: `cake-${index}`,
    slug: `cake-${index}`,
    href: `/cakes/cake-${index}`,
    name: `Cake ${index}`,
    description: 'Cake description',
    price: 40 + index,
    imageUrl: '/images/cake.jpg',
    imageAlt: 'Cake',
    isByPost: false,
    isCustom: true,
    isPopular: false,
    collectionIds: [],
    productType: 'cake'
  }
}

function createHamper(index: number): TabletCake {
  return {
    id: `hamper-${index}`,
    slug: `hamper-${index}`,
    href: `/gift-hampers/hamper-${index}`,
    name: `Hamper ${index}`,
    description: 'Hamper description',
    price: 30 + index,
    imageUrl: '/images/hamper.jpg',
    imageAlt: 'Hamper',
    isByPost: true,
    isCustom: false,
    isPopular: false,
    collectionIds: [],
    productType: 'giftHamper'
  }
}

function parseJsonLdScripts(container: HTMLElement) {
  return Array.from(container.querySelectorAll('script[type="application/ld+json"]'))
    .map((script) => JSON.parse(script.textContent || '{}') as Record<string, unknown>)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

describe('GiftHampersPage', () => {
  const sampleHamper = createHamper(1)
  const sampleCatalogData: CatalogPageData = {
    cakesForUi: [createCake(1), sampleHamper],
    mappedGiftHampers: [sampleHamper],
    collectionOptions: [],
    featuredOffer: null
  }

  beforeEach(() => {
    mockedGetCatalogPageData.mockResolvedValue(sampleCatalogData)
    mockedGetCatalogCustomCakesPriceCeiling.mockResolvedValue(80)
    mockedGetAllTestimonialsStats.mockResolvedValue({
      count: 127,
      averageRating: 5
    })
  })

  it('uses static generation mode', () => {
    expect(dynamic).toBe('force-static')
  })

  it('keeps gift hampers canonical and OpenGraph URL', () => {
    expect(metadata.openGraph?.url).toBe('https://olgishcakes.co.uk/gift-hampers')
    expect(metadata.alternates?.canonical).toBe('https://olgishcakes.co.uk/gift-hampers')
  })

  it('fetches shared catalog data, custom price ceiling hint and testimonial stats', async () => {
    await GiftHampersPage()

    expect(mockedGetCatalogPageData).toHaveBeenCalledTimes(1)
    expect(mockedGetCatalogPageData).toHaveBeenCalledWith('giftHampers')
    expect(mockedGetCatalogCustomCakesPriceCeiling).toHaveBeenCalledTimes(1)
    expect(mockedGetAllTestimonialsStats).toHaveBeenCalledTimes(1)
  })

  it('renders page when optional custom-cakes price hint fetch fails', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      mockedGetCatalogCustomCakesPriceCeiling.mockRejectedValueOnce(new Error('Hint fetch failed'))

      const page = await GiftHampersPage()
      render(page)

      expect(
        screen.getByRole('heading', {
          level: 1,
          name: 'Luxury gift hampers and cakes by post across the UK'
        })
      ).toBeInTheDocument()
      expect(screen.getByTestId('cakes-catalog')).toBeInTheDocument()
      expect(warnSpy).toHaveBeenCalledWith(
        'Failed to fetch custom cakes price ceiling hint for gift hampers page:',
        expect.any(Error)
      )
    } finally {
      warnSpy.mockRestore()
    }
  })

  it('renders shared catalog template with gift-hampers defaults', async () => {
    const page = await GiftHampersPage()
    render(page)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Luxury gift hampers and cakes by post across the UK'
      })
    ).toBeInTheDocument()

    const catalog = screen.getByTestId('cakes-catalog')
    expect(catalog).toHaveAttribute('data-by-post', 'true')
    expect(catalog).toHaveAttribute('data-custom', 'false')
  })

  it('renders gift hamper faq accordion content', async () => {
    const page = await GiftHampersPage()
    render(page)

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Gift hamper FAQs'
      })
    ).toBeInTheDocument()

    expect(screen.getByText('Do you deliver gift hampers across the UK?')).toBeInTheDocument()
    expect(
      screen.getByText('What is included in each gift hamper?')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Each product page lists exact hamper contents, sizes, and key details so you can choose with confidence.')
    ).toBeInTheDocument()
  })

  it('outputs breadcrumb, item list and local business structured data without faq page schema', async () => {
    const page = await GiftHampersPage()
    const { container } = render(page)
    const jsonLdBlocks = parseJsonLdScripts(container)

    const breadcrumbBlock = jsonLdBlocks.find((block) => block['@type'] === 'BreadcrumbList')
    const faqBlock = jsonLdBlocks.find((block) => block['@type'] === 'FAQPage')
    const localBusinessBlock = jsonLdBlocks.find((block) => block['@type'] === 'LocalBusiness')
    const itemListGraphBlock = jsonLdBlocks.find((block) => Array.isArray(block['@graph']))

    expect(breadcrumbBlock).toBeDefined()
    expect(faqBlock).toBeUndefined()
    expect(localBusinessBlock).toBeDefined()
    expect(itemListGraphBlock).toBeDefined()

    const breadcrumbItems = isRecord(breadcrumbBlock)
      ? breadcrumbBlock.itemListElement
      : undefined
    expect(Array.isArray(breadcrumbItems)).toBe(true)
    expect(breadcrumbItems).toHaveLength(2)

    const graph = isRecord(itemListGraphBlock) && Array.isArray(itemListGraphBlock['@graph'])
      ? itemListGraphBlock['@graph']
      : []
    expect(graph.length).toBeGreaterThan(0)

    const itemListEntry = graph.find((entry) => isRecord(entry) && entry['@type'] === 'ItemList')
    expect(itemListEntry).toBeDefined()

    if (!isRecord(itemListEntry)) {
      throw new Error('Expected ItemList entry in @graph')
    }

    const listItems = itemListEntry.itemListElement
    expect(Array.isArray(listItems)).toBe(true)

    if (!Array.isArray(listItems) || listItems.length === 0) {
      throw new Error('Expected at least one item list element')
    }

    const firstListItem = listItems[0]
    if (!isRecord(firstListItem) || !isRecord(firstListItem.item)) {
      throw new Error('Expected first list item product data')
    }

    expect(firstListItem.item.url).toBe('https://olgishcakes.co.uk/gift-hampers/hamper-1')
  })

  it('keeps ItemList structured data aligned with visible fallback hampers', async () => {
    const fallbackVisibleHamper = createHamper(99)

    mockedGetCatalogPageData.mockResolvedValueOnce({
      ...sampleCatalogData,
      cakesForUi: [fallbackVisibleHamper],
      mappedGiftHampers: []
    })

    const page = await GiftHampersPage()
    const { container } = render(page)
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

    if (!isRecord(firstListItem) || !isRecord(firstListItem.item)) {
      throw new Error('Expected first list item product data')
    }

    expect(firstListItem.item.url).toBe('https://olgishcakes.co.uk/gift-hampers/hamper-99')
  })

  it('includes aggregate rating in local business data when reviews exist', async () => {
    const page = await GiftHampersPage()
    const { container } = render(page)
    const jsonLdBlocks = parseJsonLdScripts(container)
    const localBusinessBlock = jsonLdBlocks.find((block) => block['@type'] === 'LocalBusiness')

    if (!isRecord(localBusinessBlock)) {
      throw new Error('Expected LocalBusiness structured data')
    }

    expect(isRecord(localBusinessBlock.aggregateRating)).toBe(true)
  })
})
