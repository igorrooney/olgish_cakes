/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import CakesPage, { dynamic, metadata } from '../page'
import { getAllCakes, getCakesFeaturedOffer } from '../../utils/fetchCakes'
import { Cake } from '@/types/cake'
import { CakesFeaturedOffer } from '@/types/cakeFeaturedOffer'

jest.mock('../../utils/fetchCakes', () => ({
  getAllCakes: jest.fn(),
  getCakesFeaturedOffer: jest.fn()
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: React.ComponentProps<'img'>) => <img alt={alt || ''} {...props} />
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode, href: string }) => (
    <a href={href}>{children}</a>
  )
}))

const mockedGetAllCakes = getAllCakes as jest.MockedFunction<typeof getAllCakes>
const mockedGetCakesFeaturedOffer = getCakesFeaturedOffer as jest.MockedFunction<typeof getCakesFeaturedOffer>

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

describe('CakesPage', () => {
  beforeEach(() => {
    mockedGetAllCakes.mockResolvedValue([sampleCake])
    mockedGetCakesFeaturedOffer.mockResolvedValue(sampleFeaturedOffer)
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
    expect(mockedGetCakesFeaturedOffer).toHaveBeenCalledWith(false)
  })

  it('renders featured offer, filters, sorting and cards', async () => {
    const page = await CakesPage()
    render(page)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Traditional Ukrainian cakes by post and custom cakes in Leeds'
      })
    ).toBeInTheDocument()
    expect(screen.getByText('Authentic Ukrainian cakes in Leeds, baked fresh to order')).toBeInTheDocument()
    expect(screen.getByText('FREE Honey Cake Offer')).toBeInTheDocument()
    expect(screen.getByText('Filter by')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Most popular' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Price: Low to high' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Get free honey cake' })).toHaveAttribute('href', '/cakes/sample-honey-cake')
    expect(screen.getByRole('link', { name: 'View Sample Honey Cake' })).toHaveAttribute('href', '/cakes/sample-honey-cake')
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
    render(page)

    expect(screen.getByRole('link', { name: 'View Luxury Cake' })).toHaveAttribute('href', '/cakes/luxury-cake')
  })

  it('hides featured offer when not configured in Sanity', async () => {
    mockedGetCakesFeaturedOffer.mockResolvedValueOnce(null)

    const page = await CakesPage()
    render(page)

    expect(screen.queryByText('FREE Honey Cake Offer')).not.toBeInTheDocument()
  })

  it('falls back to placeholder cakes when no cakes are fetched', async () => {
    mockedGetAllCakes.mockResolvedValueOnce([])

    const page = await CakesPage()
    render(page)

    expect(screen.getByText('Honey Cake')).toBeInTheDocument()
  })

  it('renders bakery and breadcrumb structured data scripts', async () => {
    const page = await CakesPage()
    const { container } = render(page)

    const scripts = container.querySelectorAll('script[type="application/ld+json"]')
    const bakeryScript = Array.from(scripts).find((script) =>
      script.textContent?.includes('"@type":"Bakery"')
    )
    const breadcrumbScript = Array.from(scripts).find((script) =>
      script.textContent?.includes('"@type":"BreadcrumbList"')
    )

    expect(bakeryScript).toBeTruthy()
    expect(breadcrumbScript).toBeTruthy()
  })
})
