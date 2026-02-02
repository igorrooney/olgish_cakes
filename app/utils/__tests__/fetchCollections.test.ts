import { getHomepageCollections } from '../fetchCollections'
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
    homepageOrder: 1,
    image: {
      asset: { _ref: 'image-1', _type: 'reference' },
      alt: 'Kids birthday cake'
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fetches homepage collections', async () => {
    mockFetch.mockResolvedValue([mockCollection])

    const result = await getHomepageCollections()

    expect(result).toEqual([mockCollection])
    expect(mockFetch).toHaveBeenCalled()
  })

  it('returns empty array on error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    mockFetch.mockRejectedValue(new Error('Fetch failed'))

    const result = await getHomepageCollections()

    expect(result).toEqual([])
    expect(consoleSpy).toHaveBeenCalledWith('Error fetching homepage collections:', expect.any(Error))
    consoleSpy.mockRestore()
  })

  it('queries collections marked for homepage', async () => {
    mockFetch.mockResolvedValue([mockCollection])

    await getHomepageCollections()

    const query = mockFetch.mock.calls[0][0]
    expect(query).toContain('showOnHomepage')
  })
})
