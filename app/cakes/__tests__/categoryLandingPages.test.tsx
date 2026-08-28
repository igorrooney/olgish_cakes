/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import type { Metadata } from 'next'
import { generateCategoryLandingMetadata, renderCategoryLandingPage } from '../renderCategoryLandingPage'
import { getCategoryLandingPostCatalogContent } from '../components/categoryLandingEditorial'
import { Reviews } from '@/app/components/homepage/Reviews'
import {
  categoryLandingCanonicalPaths,
  getCategoryLandingConfig,
  getCategoryLandingPathByQueryValue
} from '../categoryLandingConfig'
import { getCatalogPageData } from '../catalogPageData'

const categoryLandingSlugs = [
  'wedding-cakes',
  'birthday-cakes',
  'anniversary-cakes-leeds',
  'baby-shower-cakes'
] as const

const mockNotFound = jest.fn(() => {
  throw new Error('NEXT_NOT_FOUND')
})
const mockCatalogPageTemplate = jest.fn((props: Record<string, unknown>) => {
  return (
    <div>
      <div data-testid='catalog-mode'>{String(props.catalogMode)}</div>
      <div data-testid='locked-collections'>{JSON.stringify(props.lockedCollectionQueryValues)}</div>
      <div data-testid='show-product-type-filters'>{String(props.showProductTypeFilters)}</div>
      <div data-testid='show-desktop-filters'>{String(props.showDesktopFilters)}</div>
      <div data-testid='show-mobile-filter-sheet'>{String(props.showMobileFilterSheet)}</div>
      <div data-testid='mobile-toolbar-variant'>{String(props.mobileToolbarVariant)}</div>
      <div data-testid='include-breadcrumb-structured-data'>{String(props.includeBreadcrumbStructuredData)}</div>
      {props.heroSection as React.ReactNode}
      {props.preCatalogContent as React.ReactNode}
      {props.catalogSectionIntro as React.ReactNode}
      {props.postCatalogContent as React.ReactNode}
    </div>
  )
})

jest.mock('next/navigation', () => ({
  notFound: () => mockNotFound()
}))

jest.mock('../CatalogPageTemplate', () => ({
  CatalogPageTemplate: (props: Record<string, unknown>) => mockCatalogPageTemplate(props)
}))

jest.mock('../catalogPageData', () => ({
  getCatalogPageData: jest.fn()
}))

jest.mock('@/app/components/homepage/Reviews', () => {
  const React = jest.requireActual('react')

  return {
    Reviews: jest.fn(async ({ titleClassName }: { titleClassName?: string } = {}) => React.createElement(
      'section',
      { 'data-testid': 'homepage-reviews' },
      React.createElement('h2', { className: titleClassName }, 'Our reviews')
    ))
  }
})

const mockedGetCatalogPageData = getCatalogPageData as jest.MockedFunction<typeof getCatalogPageData>
const mockedReviews = Reviews as jest.MockedFunction<typeof Reviews>

describe('category landing pages', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedGetCatalogPageData.mockResolvedValue({
      cakesForUi: [
        {
          id: 'cake-wedding-1',
          slug: 'wedding-elegance',
          href: '/cakes/wedding-elegance',
          navigationTarget: 'product',
          name: 'Wedding Elegance',
          description: 'Wedding cake description',
          price: 120,
          imageUrl: '/images/wedding.jpg',
          imageAlt: 'Wedding Elegance',
          isByPost: false,
          isCustom: true,
          isPopular: true,
          collectionIds: ['collection-wedding'],
          productType: 'cake'
        },
        {
          id: 'cake-birthday-1',
          slug: 'birthday-spark',
          href: '/cakes/birthday-spark',
          navigationTarget: 'product',
          name: 'Birthday Spark',
          description: 'Birthday cake description',
          price: 80,
          imageUrl: '/images/birthday.jpg',
          imageAlt: 'Birthday Spark',
          isByPost: false,
          isCustom: true,
          isPopular: false,
          collectionIds: ['collection-birthday'],
          productType: 'cake'
        },
        {
          id: 'cake-anniversary-1',
          slug: 'anniversary-gold',
          href: '/cakes/anniversary-gold',
          navigationTarget: 'product',
          name: 'Anniversary Gold',
          description: 'Anniversary cake description',
          price: 110,
          imageUrl: '/images/anniversary.jpg',
          imageAlt: 'Anniversary Gold',
          isByPost: false,
          isCustom: true,
          isPopular: false,
          collectionIds: ['collection-anniversary'],
          productType: 'cake'
        },
        {
          id: 'cake-baby-1',
          slug: 'baby-shower-soft',
          href: '/cakes/baby-shower-soft',
          navigationTarget: 'product',
          name: 'Baby Shower Soft',
          description: 'Baby shower cake description',
          price: 90,
          imageUrl: '/images/baby.jpg',
          imageAlt: 'Baby Shower Soft',
          isByPost: false,
          isCustom: true,
          isPopular: false,
          collectionIds: ['collection-baby'],
          productType: 'cake'
        }
      ],
      mappedGiftHampers: [],
      collectionOptions: [
        {
          id: 'collection-wedding',
          queryValue: 'c-wedding-cakes',
          legacyQueryValues: ['collection-wedding'],
          label: 'Wedding Cakes',
          isFeatured: true,
          productType: 'cake'
        },
        {
          id: 'collection-birthday',
          queryValue: 'c-birthday-cakes',
          legacyQueryValues: ['collection-birthday'],
          label: 'Birthday Cakes',
          isFeatured: false,
          productType: 'cake'
        },
        {
          id: 'collection-anniversary',
          queryValue: 'c-anniversary-cakes',
          legacyQueryValues: ['collection-anniversary', 'c-anniversary-cakes-leeds'],
          label: 'Anniversary Cakes',
          isFeatured: false,
          productType: 'cake'
        },
        {
          id: 'collection-baby',
          queryValue: 'c-baby-shower-cakes',
          legacyQueryValues: ['collection-baby'],
          label: 'Baby Shower Cakes',
          isFeatured: false,
          productType: 'cake'
        }
      ],
      featuredOffer: null
    })
  })

  it('generates self-canonical metadata and noindex on filtered category URLs', async () => {
    const metadata: Metadata = await generateCategoryLandingMetadata({
      slug: 'wedding-cakes',
      searchParams: Promise.resolve({ sort: 'priceLowToHigh' })
    })

    expect(metadata.alternates?.canonical).toBe('https://olgishcakes.co.uk/wedding-cakes')
    expect(metadata.openGraph?.url).toBe('https://olgishcakes.co.uk/wedding-cakes')
    expect(metadata.robots).toEqual({
      index: false,
      follow: true
    })
  })

  it('generates self-canonical metadata and keeps pure pagination indexable', async () => {
    const metadata: Metadata = await generateCategoryLandingMetadata({
      slug: 'wedding-cakes',
      searchParams: Promise.resolve({ page: '2' })
    })

    expect(metadata.alternates?.canonical).toBe('https://olgishcakes.co.uk/wedding-cakes?page=2')
    expect(metadata.openGraph?.url).toBe('https://olgishcakes.co.uk/wedding-cakes?page=2')
    expect(metadata.robots).toBeUndefined()
  })

  it('keeps birthday and anniversary metadata specific to each landing page', async () => {
    const birthdayMetadata = await generateCategoryLandingMetadata({
      slug: 'birthday-cakes'
    })
    const anniversaryMetadata = await generateCategoryLandingMetadata({
      slug: 'anniversary-cakes-leeds'
    })

    expect(birthdayMetadata.title).toBe('Birthday Cakes Leeds | Handmade Custom Birthday Cakes')
    expect(birthdayMetadata.description).toBe('Explore birthday cakes in Leeds by Olgish Cakes. Find handmade custom cakes for children, adults and milestone celebrations with flavour and design flexibility.')
    expect(birthdayMetadata.alternates?.canonical).toBe('https://olgishcakes.co.uk/birthday-cakes')

    expect(anniversaryMetadata.title).toBe('Anniversary Cakes Leeds | Handmade Cakes for Milestones')
    expect(anniversaryMetadata.description).toBe('Discover anniversary cakes in Leeds by Olgish Cakes. Find handmade designs for intimate dinners, family milestones and elegant celebrations with bespoke finishing.')
    expect(anniversaryMetadata.alternates?.canonical).toBe('https://olgishcakes.co.uk/anniversary-cakes-leeds')
  })

  it('resolves anniversary landing with the corrected primary collection query value', async () => {
    const anniversaryConfig = getCategoryLandingConfig('anniversary-cakes-leeds')
    expect(anniversaryConfig.collectionQueryValue).toBe('c-anniversary-cakes')

    const page = await renderCategoryLandingPage('anniversary-cakes-leeds')
    render(page)

    expect(screen.getByRole('heading', { level: 1, name: anniversaryConfig.heroTitle })).toBeInTheDocument()
    expect(screen.getByTestId('locked-collections')).toHaveTextContent('c-anniversary-cakes')
  })

  it('maps anniversary primary and alias query values to the canonical landing path', () => {
    expect(getCategoryLandingPathByQueryValue('c-anniversary-cakes')).toBe('/anniversary-cakes-leeds')
    expect(getCategoryLandingPathByQueryValue('c-anniversary-cakes-leeds')).toBe('/anniversary-cakes-leeds')
  })

  it('exports every category landing canonical path from shared config', () => {
    expect(categoryLandingCanonicalPaths).toEqual([
      '/wedding-cakes',
      '/birthday-cakes',
      '/anniversary-cakes-leeds',
      '/baby-shower-cakes'
    ])
  })

  it('points all category primary quote ctas to the canonical quote page', () => {
    categoryLandingSlugs.forEach((slug) => {
      const config = getCategoryLandingConfig(slug)

      expect(config.heroPrimaryAction.href).toBe('/custom-cakes')
      expect(config.ctaBand.primaryAction.href).toBe('/custom-cakes')
    })
  })

  it('renders wedding landing pages with commercial sections, page-specific links and matching structured data', async () => {
    const weddingConfig = getCategoryLandingConfig('wedding-cakes')
    const page = await renderCategoryLandingPage('wedding-cakes')
    render(page)

    expect(screen.getByRole('heading', { level: 1, name: 'Bespoke Wedding Cakes in Leeds' })).toBeInTheDocument()
    expect(screen.getByText('Elegant wedding cakes for celebrations across Yorkshire and the UK.')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 2, name: 'Browse wedding cake designs' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: weddingConfig.audienceIntroTitle })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: weddingConfig.flavourSectionTitle })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: weddingConfig.proofSectionTitle })).toBeInTheDocument()
    expect(screen.getByTestId('homepage-reviews')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Our reviews' })).toHaveClass(
      'text-center',
      'font-oldenburg',
      'text-3xl',
      'tracking-[0.08em]',
      'text-base-content',
      'tablet:text-4xl'
    )
    expect(mockedReviews).toHaveBeenCalledWith({
      titleClassName: 'text-center font-oldenburg text-3xl tracking-[0.08em] text-base-content tablet:text-4xl'
    })
    expect(screen.getByRole('heading', { level: 2, name: weddingConfig.orderingSectionTitle })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Wedding cake FAQs' })).toBeInTheDocument()
    expect(screen.getByText(weddingConfig.faqItems[0].question)).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: /breadcrumb/i })).not.toBeInTheDocument()
    expect(screen.queryByText('Why customers choose Olgish Cakes')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Start your enquiry' })).toBeInTheDocument()
    expect(screen.getByTestId('catalog-mode')).toHaveTextContent('category-landing')
    expect(screen.getByTestId('locked-collections')).toHaveTextContent('c-wedding-cakes')
    expect(screen.getByTestId('show-product-type-filters')).toHaveTextContent('false')
    expect(screen.getByTestId('show-desktop-filters')).toHaveTextContent('false')
    expect(screen.getByTestId('show-mobile-filter-sheet')).toHaveTextContent('false')
    expect(screen.getByTestId('mobile-toolbar-variant')).toHaveTextContent('inline-compact')
    expect(screen.getByTestId('include-breadcrumb-structured-data')).toHaveTextContent('true')

    const templateProps = mockCatalogPageTemplate.mock.calls[0][0] as {
      additionalStructuredData?: Array<Record<string, unknown>>
      breadcrumbItems?: Array<{ name: string, item: string }>
      catalogData: { cakesForUi: Array<{ name: string }> }
      includeBreadcrumbStructuredData?: boolean
      preCatalogContent?: React.ReactNode
      catalogSectionIntro?: React.ReactNode
    }

    expect(templateProps.includeBreadcrumbStructuredData).toBe(true)
    expect(templateProps.breadcrumbItems).toEqual([
      { name: 'Home', item: '/' },
      { name: 'Cakes', item: '/cakes' },
      { name: 'Bespoke Wedding Cakes in Leeds', item: '/wedding-cakes' }
    ])
    expect(templateProps.preCatalogContent).toBeUndefined()
    expect(templateProps.catalogSectionIntro).toBeUndefined()
    expect(templateProps.catalogData.cakesForUi).toEqual([
      expect.objectContaining({ name: 'Wedding Elegance' })
    ])
    expect(templateProps.additionalStructuredData?.[0]).toMatchObject({
      '@graph': [
        expect.any(Object),
        expect.objectContaining({ name: 'Wedding Cakes in Leeds' })
      ]
    })
    expect(templateProps.additionalStructuredData).toHaveLength(1)
    expect(templateProps.additionalStructuredData?.some(
      (block) => block['@type'] === 'FAQPage'
    )).toBe(false)

    const itemListGraphEntry = templateProps.additionalStructuredData?.[0]

    if (!itemListGraphEntry || !Array.isArray(itemListGraphEntry['@graph'])) {
      throw new Error('Expected ItemList structured data graph')
    }

    const itemListEntry = itemListGraphEntry['@graph']
      .find((entry) => typeof entry === 'object' && entry !== null && entry['@type'] === 'ItemList')

    if (
      !itemListEntry ||
      typeof itemListEntry !== 'object' ||
      !Array.isArray(itemListEntry.itemListElement)
    ) {
      throw new Error('Expected ItemList entry in category landing graph')
    }

    const firstListItem = itemListEntry.itemListElement[0]

    if (
      !firstListItem ||
      typeof firstListItem !== 'object' ||
      typeof firstListItem.item !== 'object' ||
      firstListItem.item === null ||
      typeof firstListItem.item.offers !== 'object' ||
      firstListItem.item.offers === null
    ) {
      throw new Error('Expected first category landing list item offer data')
    }

    expect(firstListItem.item.offers).not.toHaveProperty('shippingDetails')
  })

  it('resolves unique post-catalog editorial content for each category slug', () => {
    const weddingConfig = getCategoryLandingConfig('wedding-cakes')
    const birthdayConfig = getCategoryLandingConfig('birthday-cakes')
    const anniversaryConfig = getCategoryLandingConfig('anniversary-cakes-leeds')
    const babyShowerConfig = getCategoryLandingConfig('baby-shower-cakes')
    const anniversaryFlavourItems = anniversaryConfig.flavourSectionItems

    if (!weddingConfig.audienceIntroTitle) {
      throw new Error('Expected wedding audience intro title')
    }

    if (!babyShowerConfig.audienceIntroTitle || !babyShowerConfig.useCases) {
      throw new Error('Expected baby shower overview content')
    }

    if (!anniversaryFlavourItems) {
      throw new Error('Expected anniversary flavour section items')
    }

    render(
      <>
        {getCategoryLandingPostCatalogContent('wedding-cakes', weddingConfig)}
        {getCategoryLandingPostCatalogContent('birthday-cakes', birthdayConfig)}
        {getCategoryLandingPostCatalogContent('anniversary-cakes-leeds', anniversaryConfig)}
        {getCategoryLandingPostCatalogContent('baby-shower-cakes', babyShowerConfig)}
      </>
    )

    expect(screen.getByRole('heading', { level: 2, name: weddingConfig.audienceIntroTitle })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 2, name: birthdayConfig.proofSectionTitle }).length).toBeGreaterThan(0)
    expect(screen.getByRole('heading', { level: 2, name: anniversaryConfig.flavourSectionTitle })).toBeInTheDocument()
    expect(screen.getByText(anniversaryConfig.flavourSectionIntro)).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: babyShowerConfig.audienceIntroTitle })).toBeInTheDocument()
    expect(screen.getByText(birthdayConfig.proofPoints[0])).toBeInTheDocument()
    expect(anniversaryConfig.audienceIntroTitle).toBeUndefined()
    expect(anniversaryConfig.useCases).toBeUndefined()
    expect(screen.getAllByRole('heading', { level: 3, name: anniversaryFlavourItems[0].title })).toHaveLength(1)
    expect(screen.getByText(anniversaryFlavourItems[0].body)).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: babyShowerConfig.useCases[0].title })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /contact page/i }).every((element) => element.getAttribute('href') === '/contact')).toBe(true)
    expect(screen.getAllByText('Step 1')).toHaveLength(4)
  })

  it('calls notFound when the configured collection cannot be resolved', async () => {
    mockedGetCatalogPageData.mockResolvedValueOnce({
      cakesForUi: [],
      mappedGiftHampers: [],
      collectionOptions: [],
      featuredOffer: null
    })

    await expect(renderCategoryLandingPage('wedding-cakes')).rejects.toThrow('NEXT_NOT_FOUND')
    expect(mockNotFound).toHaveBeenCalled()
  })
})
