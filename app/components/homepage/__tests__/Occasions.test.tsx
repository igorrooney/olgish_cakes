/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Occasions } from '../Occasions'
import { getHomepageCollections } from '@/app/utils/fetchCollections'
import type { HomepageCollection } from '@/app/types/collection'
import type { DisplayCollection } from '../occasions.types'

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    href
  }: {
    children: React.ReactNode
    href: string
  }) => <a href={href}>{children}</a>
}))

jest.mock('@/sanity/lib/image', () => {
  const build = () => ({
    width: () => build(),
    height: () => build(),
    url: () => 'https://example.com/collection.jpg'
  })

  return {
    urlFor: jest.fn(() => build())
  }
})

jest.mock('@/app/utils/fetchCollections', () => ({
  getHomepageCollections: jest.fn()
}))

jest.mock('../DeferredOccasionsClient', () => ({
  DeferredOccasionsClient: ({ collections }: { collections: DisplayCollection[] }) => {
    const { OccasionsClient } = jest.requireActual('../OccasionsClient') as typeof import('../OccasionsClient')
    return <OccasionsClient collections={collections} />
  }
}))

const mockGetHomepageCollections = getHomepageCollections as jest.MockedFunction<typeof getHomepageCollections>

const baseCollection: HomepageCollection = {
  _id: 'collection-1',
  name: 'Kids Birthdays',
  image: {
    asset: { _ref: 'image-1', _type: 'reference' },
    alt: 'Kids birthday cake'
  }
}

describe('Occasions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders homepage collections with images', async () => {
    mockGetHomepageCollections.mockResolvedValueOnce([baseCollection])

    const element = await Occasions()
    render(element)

    expect(screen.getByText('Kids Birthdays')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Kids Birthdays/i })).toHaveAttribute(
      'href',
      '/cakes?collections=c-kids-birthdays'
    )
    expect(screen.queryByRole('button', { name: '+ many more!' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Show less' })).not.toBeInTheDocument()
  })

  it('routes anniversary collections to the canonical landing page', async () => {
    const anniversaryCollection: HomepageCollection = {
      _id: 'collection-anniversary',
      name: 'Anniversary Cakes',
      image: {
        asset: { _ref: 'image-anniversary', _type: 'reference' },
        alt: 'Anniversary cake'
      }
    }

    const element = await Occasions({ collections: [anniversaryCollection] })
    render(element)

    expect(screen.getByRole('link', { name: /Anniversary Cakes/i })).toHaveAttribute(
      'href',
      '/anniversary-cakes-leeds'
    )
    expect(mockGetHomepageCollections).not.toHaveBeenCalled()
  })

  it('returns null when no collections are available', async () => {
    mockGetHomepageCollections.mockResolvedValueOnce([])

    const element = await Occasions()

    expect(element).toBeNull()
  })

  it('filters out collections without image assets', async () => {
    mockGetHomepageCollections.mockResolvedValueOnce([
      baseCollection,
      { _id: 'collection-2', name: 'Missing Image' }
    ])

    const element = await Occasions()
    render(element)

    expect(screen.getByText('Kids Birthdays')).toBeInTheDocument()
    expect(screen.queryByText('Missing Image')).not.toBeInTheDocument()
  })

  it('shows a mobile toggle button to reveal all collections', async () => {
    const collections = Array.from({ length: 10 }, (_, index) => ({
      _id: `collection-${index + 1}`,
      name: `Collection ${index + 1}`,
      image: {
        asset: { _ref: `image-${index + 1}`, _type: 'reference' },
        alt: `Collection ${index + 1} cake`
      }
    }))

    mockGetHomepageCollections.mockResolvedValueOnce(collections)

    const element = await Occasions()
    render(element)

    expect(screen.getByText('Collection 6')).toBeInTheDocument()
    const collection7Label = screen.getByText('Collection 7')
    const collection7Card = collection7Label.closest('div')
    expect(collection7Card).toBeTruthy()
    expect(collection7Card).toHaveClass('hidden')
    expect(collection7Card?.className).toContain('small-laptop:flex')

    const collection9Label = screen.getByText('Collection 9')
    const collection9Card = collection9Label.closest('div')
    expect(collection9Card).toBeTruthy()
    expect(collection9Card).toHaveClass('hidden')
    expect(collection9Card?.className).not.toContain('small-laptop:flex')

    const moreButton = screen.getByRole('button', { name: '+ many more!' })
    expect(moreButton).toHaveClass('cursor-pointer')
    fireEvent.click(moreButton)

    expect(collection7Card).not.toHaveClass('hidden')
    const showLessButton = screen.getByRole('button', { name: 'Show less' })
    fireEvent.click(showLessButton)

    expect(collection7Card).toHaveClass('hidden')
    expect(screen.getByRole('button', { name: '+ many more!' })).toBeInTheDocument()
  })

  it('uses provided collections prop without fetching homepage collections', async () => {
    const providedCollections: HomepageCollection[] = [baseCollection]

    const element = await Occasions({ collections: providedCollections })
    render(element)

    expect(mockGetHomepageCollections).not.toHaveBeenCalled()
    expect(screen.getByText('Kids Birthdays')).toBeInTheDocument()
  })
})
