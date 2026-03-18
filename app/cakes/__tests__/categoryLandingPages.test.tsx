/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import type { Metadata } from 'next'
import { generateCategoryLandingMetadata, renderCategoryLandingPage } from '../renderCategoryLandingPage'
import { getCategoryLandingPostCatalogContent } from '../components/categoryLandingEditorial'
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

const mockedGetCatalogPageData = getCatalogPageData as jest.MockedFunction<typeof getCatalogPageData>

describe('category landing pages', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedGetCatalogPageData.mockResolvedValue({
      cakesForUi: [
        {
          id: 'cake-wedding-1',
          slug: 'wedding-elegance',
          href: '/cakes/wedding-elegance',
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

    expect(screen.getByRole('heading', { level: 1, name: 'Anniversary Cakes in Leeds' })).toBeInTheDocument()
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

      expect(config.heroPrimaryAction.href).toBe('/get-custom-quote')
      expect(config.ctaBand.primaryAction.href).toBe('/get-custom-quote')
    })
  })

  it('renders wedding landing pages with commercial sections, page-specific links and matching structured data', async () => {
    const page = await renderCategoryLandingPage('wedding-cakes')
    render(page)

    expect(screen.getByRole('heading', { level: 1, name: 'Wedding Cakes in Leeds' })).toBeInTheDocument()
    expect(screen.getByText('Elegant handmade wedding cakes for modern celebrations, carefully finished around your venue, style and serving plans.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Browse wedding cake designs' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Wedding cake planning should feel specific to your day, not borrowed from a generic template' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Flavour, tier and finish choices should support the way the cake will actually be served' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Why couples usually choose a bespoke wedding cake from a local maker' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'A calmer wedding cake process starts with the details that matter most' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Cake size guide' }).closest('a')).toHaveAttribute('href', '/cake-size-guide')
    expect(screen.getAllByRole('link', { name: /Leeds delivery guide/i }).every((element) => element.getAttribute('href') === '/cake-delivery-leeds')).toBe(true)
    expect(screen.getByRole('heading', { level: 3, name: 'Get a custom quote' }).closest('a')).toHaveAttribute('href', '/get-custom-quote')
    expect(screen.getByRole('heading', { level: 2, name: 'Wedding cake FAQs' })).toBeInTheDocument()
    expect(screen.getByText('How far ahead should I enquire about a wedding cake?')).toBeInTheDocument()
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
      { name: 'Wedding Cakes in Leeds', item: '/wedding-cakes' }
    ])
    expect(templateProps.preCatalogContent).toBeUndefined()
    expect(templateProps.catalogSectionIntro).toBeDefined()
    expect(templateProps.catalogData.cakesForUi).toEqual([
      expect.objectContaining({ name: 'Wedding Elegance' })
    ])
    expect(templateProps.additionalStructuredData?.[0]).toMatchObject({
      '@graph': [
        expect.any(Object),
        expect.objectContaining({ name: 'Wedding Cakes in Leeds' })
      ]
    })
    expect(templateProps.additionalStructuredData?.[1]).toMatchObject({
      '@type': 'FAQPage',
      mainEntity: expect.arrayContaining([
        expect.objectContaining({
          name: 'How far ahead should I enquire about a wedding cake?'
        })
      ])
    })

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

    render(
      <>
        {getCategoryLandingPostCatalogContent('wedding-cakes', weddingConfig)}
        {getCategoryLandingPostCatalogContent('birthday-cakes', birthdayConfig)}
        {getCategoryLandingPostCatalogContent('anniversary-cakes-leeds', anniversaryConfig)}
        {getCategoryLandingPostCatalogContent('baby-shower-cakes', babyShowerConfig)}
      </>
    )

    expect(screen.getByRole('heading', { level: 2, name: 'Wedding cake planning should feel specific to your day, not borrowed from a generic template' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Birthday cakes work best when the brief fits the person, not just the party theme' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Anniversary cakes should fit the scale of the milestone and the way you are actually celebrating' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Baby shower cakes should feel warm, personal and easy to place into the celebration' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Children\'s birthdays need a readable theme' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Intimate anniversary dinners need restraint' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Baby shower tables need a softer design language' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 3, name: 'Cake pricing' })[0].closest('a')).toHaveAttribute('href', '/cake-pricing')
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
