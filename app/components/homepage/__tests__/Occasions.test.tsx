/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Occasions } from '../Occasions'
import { getHomepageCollections } from '@/app/utils/fetchCollections'
import type { HomepageCollection } from '@/app/types/collection'

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />
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

const mockGetHomepageCollections = getHomepageCollections as jest.MockedFunction<typeof getHomepageCollections>

const baseCollection: HomepageCollection = {
  _id: 'collection-1',
  name: 'Kids Birthdays',
  homepageOrder: 1,
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
    expect(screen.queryByRole('button', { name: '+ many more!' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Show less' })).not.toBeInTheDocument()
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

  it('toggles the grid when clicking the button', async () => {
    const collections = Array.from({ length: 10 }, (_, index) => ({
      _id: `collection-${index + 1}`,
      name: `Collection ${index + 1}`,
      homepageOrder: index + 1,
      image: {
        asset: { _ref: `image-${index + 1}`, _type: 'reference' },
        alt: `Collection ${index + 1} cake`
      }
    }))

    window.innerWidth = 1280
    mockGetHomepageCollections.mockResolvedValueOnce(collections)

    const element = await Occasions()
    render(element)

    await waitFor(() => {
      expect(screen.getByText('Collection 8')).toBeInTheDocument()
    })
    const collection9Label = screen.getByText('Collection 9')
    const collection9Card = collection9Label.closest('div')
    expect(collection9Card).toBeTruthy()
    expect(collection9Card).toHaveClass('hidden')
    expect(collection9Card?.className).not.toContain('small-laptop:flex')

    const moreButton = screen.getByRole('button', { name: '+ many more!' })
    fireEvent.click(moreButton)

    expect(collection9Card).not.toHaveClass('hidden')
    const showLessButton = screen.getByRole('button', { name: 'Show less' })
    fireEvent.click(showLessButton)

    expect(collection9Card).toHaveClass('hidden')
    expect(screen.getByRole('button', { name: '+ many more!' })).toBeInTheDocument()
  })
})
