/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { Bestsellers } from '../Bestsellers'
import { getAllCakes } from '@/app/utils/fetchCakes'
import type { Cake } from '@/types/cake'

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  )
}))

jest.mock('../DeferredBestsellersCarousel', () => ({
  DeferredBestsellersCarousel: ({ cakes }: { cakes: Cake[] }) => (
    <div data-testid="bestsellers-carousel" data-count={cakes.length} />
  )
}))

jest.mock('@/sanity/lib/image', () => {
  const build = () => ({
    width: () => build(),
    height: () => build(),
    url: () => 'https://example.com/cake.jpg'
  })

  return {
    urlFor: jest.fn(() => build())
  }
})

jest.mock('@/app/utils/fetchCakes', () => ({
  getAllCakes: jest.fn()
}))

const mockGetAllCakes = getAllCakes as jest.MockedFunction<typeof getAllCakes>

const baseCake: Cake = {
  _id: 'cake-1',
  _createdAt: '2025-01-01',
  name: 'Honey Cake',
  slug: { current: 'honey-cake' },
  description: [
    {
      _type: 'block',
      children: [{ text: 'A rich, layered honey cake loved by customers.' }]
    }
  ],
  shortDescription: [],
  size: '8',
  pricing: { standard: 30, individual: 45 },
  mainImage: {
    _type: 'image',
    asset: { _ref: 'image-1' },
    alt: 'Honey cake'
  },
  images: [],
  designs: { standard: [] },
  category: 'traditional',
  ingredients: ['Honey', 'Flour'],
  allergens: ['Gluten'],
  isBestseller: true
}

const createBlock = (text: string) => [
  {
    _type: 'block',
    children: [{ text }]
  }
]

describe('Bestsellers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('uses bestseller fields when provided', async () => {
    mockGetAllCakes.mockResolvedValueOnce([
      {
        ...baseCake,
        bestsellerCustomerStory: 'Customer story from Sanity.',
        bestsellerStoryDetails: '- For Anna, 30th birthday.',
        bestsellerShortDescription: createBlock('Short description from Sanity.')
      }
    ])

    const element = await Bestsellers()
    render(element)

    expect(screen.getByText(/Customer story from Sanity/)).toBeInTheDocument()
    expect(screen.getByText('- For Anna, 30th birthday.')).toBeInTheDocument()
    expect(screen.getByText('Short description from Sanity.')).toBeInTheDocument()
  })

  it('falls back to existing text when bestseller fields are missing', async () => {
    mockGetAllCakes.mockResolvedValueOnce([
      {
        ...baseCake,
        name: 'Walnut Cake',
        category: 'custom',
        shortDescription: createBlock('Short description fallback.'),
        description: createBlock('Full description fallback.'),
        bestsellerCustomerStory: '',
        bestsellerStoryDetails: '',
        bestsellerShortDescription: []
      }
    ])

    const element = await Bestsellers()
    render(element)

    expect(screen.getByText(/Short description fallback/)).toBeInTheDocument()
    expect(screen.getByText('- Walnut Cake, Custom cake')).toBeInTheDocument()
    expect(screen.getByText('Full description fallback.')).toBeInTheDocument()
  })
})
