/**
 * @jest-environment node
 */

jest.mock('@/app/utils/fetchCollections', () => ({
  getHomepageCollections: jest.fn()
}))

jest.mock('@/app/components/homepage/formOptions', () => ({
  buildOccasionOptionsFromCollections: jest.fn()
}))

import { GET } from '../route'

const mockedGetHomepageCollections = jest.requireMock('@/app/utils/fetchCollections').getHomepageCollections as jest.MockedFunction<() => Promise<Array<{ _id: string, name: string }>>>
const mockedBuildOccasionOptionsFromCollections = jest.requireMock('@/app/components/homepage/formOptions').buildOccasionOptionsFromCollections as jest.MockedFunction<(collections: Array<{ _id: string, name: string }>) => Array<{ label: string, value?: string, disabled?: boolean }>>

describe('/api/form/occasion-options', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('returns occasion options with noindex and cache headers on success', async () => {
    const collections = [{ _id: 'collection-1', name: 'Wedding Cakes' }]
    const occasionOptions = [
      { label: 'Select from list', value: '', disabled: true },
      { label: 'Wedding Cakes', value: 'Wedding Cakes' },
      { label: 'Other', value: 'other' }
    ]

    mockedGetHomepageCollections.mockResolvedValue(collections)
    mockedBuildOccasionOptionsFromCollections.mockReturnValue(occasionOptions)

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ occasionOptions })
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex, nofollow')
    expect(response.headers.get('Cache-Control')).toBe('public, s-maxage=1800, stale-while-revalidate=86400')
    expect(mockedBuildOccasionOptionsFromCollections).toHaveBeenCalledWith(collections)
  })

  it('returns 500 with noindex header on error', async () => {
    mockedGetHomepageCollections.mockRejectedValue(new Error('Fetch failed'))

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body).toEqual({ error: 'Failed to fetch occasion options' })
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex, nofollow')
  })
})