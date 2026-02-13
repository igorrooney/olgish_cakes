import { getHomepageCollections, getHomepageGiftHamperCollections } from '../fetchCollections'
import type { HomepageCollection } from '@/app/types/collection'

// Mock unstable_cache to bypass Next.js context requirement
jest.mock('next/cache', () => ({
  unstable_cache: jest.fn((fn) => fn)
}))

// Mock Sanity client
jest.mock('@/sanity/lib/client', () => {
  const mockFetch = jest.fn()
  return {
    client: { fetch: mockFetch },
    USE_REAL_TIME_DATA: false,
    __mockFetch: mockFetch
  }
})

const { __mockFetch: mockFetch } = jest.requireMock('@/sanity/lib/client')

describe('fetchCollections', () => {
  const mockCollection: HomepageCollection = {
    _id: 'collection-1',
    name: 'Kids Birthdays',
    isFeatured: true,
    image: {
      asset: { _ref: 'image-1', _type: 'reference' },
      alt: 'Kids birthday cake'
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fetches homepage collections', async () => {
    mockFetch
      .mockResolvedValueOnce([mockCollection])
      .mockResolvedValueOnce(null)

    const result = await getHomepageCollections()

    expect(result).toEqual([mockCollection])
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('returns empty array on error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    mockFetch.mockRejectedValue(new Error('Fetch failed'))

    const result = await getHomepageCollections()

    expect(result).toEqual([])
    expect(consoleSpy).toHaveBeenCalledWith('Error fetching homepage collections:', expect.any(Error))
    consoleSpy.mockRestore()
  })

  it('queries all collections ordered for homepage', async () => {
    mockFetch
      .mockResolvedValueOnce([mockCollection])
      .mockResolvedValueOnce(null)

    await getHomepageCollections()

    const collectionsQuery = mockFetch.mock.calls[0][0]
    const orderSettingsQuery = mockFetch.mock.calls[1][0]

    expect(collectionsQuery).toContain('_type == "collection"')
    expect(collectionsQuery).toContain('isFeatured')
    expect(collectionsQuery).toContain('order(name asc)')
    expect(orderSettingsQuery).toContain('_type == "collectionsDisplayOrder"')
  })

  it('prioritizes drag and drop order for cake collections', async () => {
    const firstCollection: HomepageCollection = {
      ...mockCollection,
      _id: 'collection-1',
      name: 'Collection One'
    }
    const secondCollection: HomepageCollection = {
      ...mockCollection,
      _id: 'collection-2',
      name: 'Collection Two'
    }

    mockFetch
      .mockResolvedValueOnce([firstCollection, secondCollection])
      .mockResolvedValueOnce({
        cakeCollectionsOrder: [{ _ref: 'collection-2' }, { _ref: 'collection-1' }]
      })

    const result = await getHomepageCollections()

    expect(result.map((collection) => collection._id)).toEqual(['collection-2', 'collection-1'])
  })

  it('falls back to alphabetical order when drag and drop order is empty', async () => {
    const firstCollection: HomepageCollection = {
      ...mockCollection,
      _id: 'collection-1',
      name: 'Collection Z'
    }
    const secondCollection: HomepageCollection = {
      ...mockCollection,
      _id: 'collection-2',
      name: 'Collection A'
    }

    mockFetch
      .mockResolvedValueOnce([firstCollection, secondCollection])
      .mockResolvedValueOnce({
        cakeCollectionsOrder: []
      })

    const result = await getHomepageCollections()

    expect(result.map((collection) => collection._id)).toEqual(['collection-2', 'collection-1'])
  })

  it('keeps homepage collections visible when order settings request fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    const firstCollection: HomepageCollection = {
      ...mockCollection,
      _id: 'collection-1',
      name: 'Collection Z'
    }
    const secondCollection: HomepageCollection = {
      ...mockCollection,
      _id: 'collection-2',
      name: 'Collection A'
    }

    mockFetch
      .mockResolvedValueOnce([firstCollection, secondCollection])
      .mockRejectedValueOnce(new Error('Display order request failed'))

    const result = await getHomepageCollections()

    expect(result.map((collection) => collection._id)).toEqual(['collection-2', 'collection-1'])
    expect(consoleSpy).toHaveBeenCalledWith('Error fetching collections display order settings:', expect.any(Error))
    consoleSpy.mockRestore()
  })

  it('fetches gift hamper collections', async () => {
    mockFetch
      .mockResolvedValueOnce([mockCollection])
      .mockResolvedValueOnce(null)

    const result = await getHomepageGiftHamperCollections()

    expect(result).toEqual([mockCollection])
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('returns empty array when gift hamper collections fetch fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    mockFetch.mockRejectedValue(new Error('Fetch failed'))

    const result = await getHomepageGiftHamperCollections()

    expect(result).toEqual([])
    expect(consoleSpy).toHaveBeenCalledWith('Error fetching homepage gift hamper collections:', expect.any(Error))
    consoleSpy.mockRestore()
  })

  it('queries gift hamper collections ordered for homepage', async () => {
    mockFetch
      .mockResolvedValueOnce([mockCollection])
      .mockResolvedValueOnce(null)

    await getHomepageGiftHamperCollections()

    const collectionsQuery = mockFetch.mock.calls[0][0]
    const orderSettingsQuery = mockFetch.mock.calls[1][0]

    expect(collectionsQuery).toContain('_type == "giftHamperCollection"')
    expect(collectionsQuery).toContain('isFeatured')
    expect(collectionsQuery).toContain('order(name asc)')
    expect(orderSettingsQuery).toContain('_type == "collectionsDisplayOrder"')
  })

  it('normalizes draft ids from drag and drop order for gift hamper collections', async () => {
    const firstCollection: HomepageCollection = {
      ...mockCollection,
      _id: 'gift-1',
      name: 'Gift One'
    }
    const secondCollection: HomepageCollection = {
      ...mockCollection,
      _id: 'gift-2',
      name: 'Gift Two'
    }

    mockFetch
      .mockResolvedValueOnce([firstCollection, secondCollection])
      .mockResolvedValueOnce({
        giftHamperCollectionsOrder: [{ _ref: 'drafts.gift-2' }, { _ref: 'gift-1' }]
      })

    const result = await getHomepageGiftHamperCollections()

    expect(result.map((collection) => collection._id)).toEqual(['gift-2', 'gift-1'])
  })

  it('keeps gift hamper collections visible when order settings request fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    const firstCollection: HomepageCollection = {
      ...mockCollection,
      _id: 'gift-1',
      name: 'Gift Z'
    }
    const secondCollection: HomepageCollection = {
      ...mockCollection,
      _id: 'gift-2',
      name: 'Gift A'
    }

    mockFetch
      .mockResolvedValueOnce([firstCollection, secondCollection])
      .mockRejectedValueOnce(new Error('Display order request failed'))

    const result = await getHomepageGiftHamperCollections()

    expect(result.map((collection) => collection._id)).toEqual(['gift-2', 'gift-1'])
    expect(consoleSpy).toHaveBeenCalledWith('Error fetching collections display order settings:', expect.any(Error))
    consoleSpy.mockRestore()
  })
})
