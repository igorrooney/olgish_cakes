/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react'
import CakesByPostPage, { generateMetadata } from '../page'
import {
  getCatalogCustomCakesPriceCeiling,
  getCatalogPageData
} from '../../cakes/catalogPageData'
import { getAllTestimonialsStats } from '../../utils/fetchTestimonials'
import type { CatalogPageData } from '../../cakes/catalogPageData'
import type { TabletCake } from '../../cakes/components/types'

let shouldSuspendCatalog = false

jest.mock('nuqs/adapters/next/app', () => ({
  NuqsAdapter: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

jest.mock('next/headers', () => ({
  headers: jest.fn(async () => new Headers())
}))

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
    initialFilterDefaults: { byPost: boolean, custom: boolean }
  }) => {
    if (shouldSuspendCatalog) {
      throw new Promise(() => {})
    }

    return (
      <div
        data-testid='cakes-catalog'
        data-by-post={String(initialFilterDefaults.byPost)}
        data-custom={String(initialFilterDefaults.custom)}
      >
        Shared catalog
      </div>
    )
  }
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
    navigationTarget: 'product',
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
    href: `/cakes-by-post/hamper-${index}`,
    navigationTarget: 'product',
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

describe('CakesByPostPage', () => {
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

  afterEach(() => {
    shouldSuspendCatalog = false
  })

  it('uses base cakes-by-post canonical metadata when no query params are provided', async () => {
    const metadata = await generateMetadata({})

    expect(metadata.alternates?.canonical).toBe('https://olgishcakes.co.uk/cakes-by-post')
    expect(metadata.openGraph?.url).toBe('https://olgishcakes.co.uk/cakes-by-post')
  })

  it('uses self canonical cakes-by-post metadata for pure pagination query', async () => {
    const metadata = await generateMetadata({
      searchParams: Promise.resolve({ page: '2' })
    })

    expect(metadata.alternates?.canonical).toBe('https://olgishcakes.co.uk/cakes-by-post?page=2')
    expect(metadata.openGraph?.url).toBe('https://olgishcakes.co.uk/cakes-by-post?page=2')
    expect(metadata.robots).toBeUndefined()
  })

  it('noindexes filtered cakes-by-post query metadata', async () => {
    const metadata = await generateMetadata({
      searchParams: Promise.resolve({ collections: 'h-postal-gifts' })
    })

    expect(metadata.alternates?.canonical).toBe('https://olgishcakes.co.uk/cakes-by-post')
    expect(metadata.openGraph?.url).toBe('https://olgishcakes.co.uk/cakes-by-post')
    expect(metadata.robots).toEqual({
      index: false,
      follow: true
    })
  })

  it('fetches shared catalog data, custom price ceiling hint and testimonial stats', async () => {
    await CakesByPostPage()

    expect(mockedGetCatalogPageData).toHaveBeenCalledTimes(1)
    expect(mockedGetCatalogPageData).toHaveBeenCalledWith('giftHampers')
    expect(mockedGetCatalogCustomCakesPriceCeiling).toHaveBeenCalledTimes(1)
    expect(mockedGetAllTestimonialsStats).toHaveBeenCalledTimes(1)
  })

  it('renders page when optional custom-cakes price hint fetch fails', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

    try {
      mockedGetCatalogCustomCakesPriceCeiling.mockRejectedValueOnce(new Error('Hint fetch failed'))

      const page = await CakesByPostPage()
      render(page)

      expect(
        screen.getByRole('heading', {
          level: 1,
          name: 'Personalised cake cards and cake slices by post'
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
    const page = await CakesByPostPage()
    render(page)

    const pageHeading = screen.getByRole('heading', {
      level: 1,
      name: 'Personalised cake cards and cake slices by post'
    })
    const pageIntro = screen.getByText(
      'Send handmade Ukrainian honey cake slices and personalised cake cards by post, made in Yorkshire and delivered across the UK.'
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
    expect(screen.queryByText('Cakes by post from Leeds with reliable UK-wide delivery')).not.toBeInTheDocument()
    expect(screen.queryByText(
      'Our cakes-by-post collection is designed for people who want reliable UK delivery without giving up handmade quality. Every order is prepared in Leeds and packed carefully for travel, with clear product pages covering flavours, contents, portion guidance and delivery expectations. You can compare by budget and occasion, then choose the best option for birthdays, thank-you gifts, corporate sending or family surprises. Ukrainian-inspired favourites such as honey cake slices and caramel biscuits are made with balanced sweetness and packaging selected for safe letterbox-friendly delivery. If you are unsure what to choose, start with recipient preferences and delivery date, and I can recommend the most suitable cake-by-post option.'
    )).not.toBeInTheDocument()

    const catalog = screen.getByTestId('cakes-catalog')
    expect(catalog).toHaveAttribute('data-by-post', 'true')
    expect(catalog).toHaveAttribute('data-custom', 'false')
    expect(screen.queryByRole('navigation', { name: 'Catalog pagination crawl links' })).not.toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Catalog product crawl links' })).not.toBeInTheDocument()
  })

  it('renders cakes by post faq accordion content', async () => {
    const page = await CakesByPostPage()
    render(page)

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Cakes by post FAQs'
      })
    ).toBeInTheDocument()
    expect(screen.getByText('UK delivery and gifting FAQs for cakes by post.')).toBeInTheDocument()
    expect(
      screen.getByText('Quick answers about UK delivery, gifting options, and what to expect from cakes by post.')
    ).toBeInTheDocument()

    expect(screen.getByRole('button', { name: 'Do you deliver cakes by post across the UK?' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Can I include a personalised gift message?' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'How long do cakes by post stay fresh after delivery?' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Are your cake by post suitable for corporate gifting?' })).toBeInTheDocument()

    const freshnessButton = screen.getByRole('button', { name: 'How long do cakes by post stay fresh after delivery?' })
    fireEvent.click(freshnessButton)

    expect(
      screen.getByText('Our honey cake slices and caramel biscuits by post stay fresh for 5 to 7 days when kept refrigerated.')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Please check the label for the best-before date.')
    ).toBeInTheDocument()

    const cakeByPostContentsButton = screen.getByRole('button', { name: 'What is included in each cake by post?' })
    fireEvent.click(cakeByPostContentsButton)

    expect(
      screen.getByText('Each cake by post includes a free personalised gift note and UK-wide delivery.')
    ).toBeInTheDocument()
    expect(
      screen.getByText('For corporate orders, branded cake slices and larger hamper orders are available by request.')
    ).toBeInTheDocument()
  })

  it('renders catalog suspense fallback during catalog suspension', async () => {
    shouldSuspendCatalog = true

    try {
      const page = await CakesByPostPage()
      render(page)

      expect(screen.getByLabelText('Loading catalog products')).toBeInTheDocument()
    } finally {
      shouldSuspendCatalog = false
    }
  })

  it('outputs breadcrumb, item list and local business structured data without faq page schema', async () => {
    const page = await CakesByPostPage()
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

    expect(firstListItem.item.url).toBe('https://olgishcakes.co.uk/cakes-by-post/hamper-1')
  })

  it('keeps ItemList structured data aligned with visible fallback hampers', async () => {
    const fallbackVisibleHamper = createHamper(99)

    mockedGetCatalogPageData.mockResolvedValueOnce({
      ...sampleCatalogData,
      cakesForUi: [fallbackVisibleHamper],
      mappedGiftHampers: []
    })

    const page = await CakesByPostPage()
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

    expect(firstListItem.item.url).toBe('https://olgishcakes.co.uk/cakes-by-post/hamper-99')
  })

  it('includes aggregate rating in local business data when reviews exist', async () => {
    const page = await CakesByPostPage()
    const { container } = render(page)
    const jsonLdBlocks = parseJsonLdScripts(container)
    const localBusinessBlock = jsonLdBlocks.find((block) => block['@type'] === 'LocalBusiness')

    if (!isRecord(localBusinessBlock)) {
      throw new Error('Expected LocalBusiness structured data')
    }

    expect(isRecord(localBusinessBlock.aggregateRating)).toBe(true)
  })
})
