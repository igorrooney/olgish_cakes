/**
 * @jest-environment node
 */

jest.mock('@/app/utils/fetchCollections', () => ({
  getHomepageCollections: jest.fn()
}))

jest.mock('@/app/components/homepage/formOptions', () => ({
  buildOccasionOptionsFromCollections: jest.fn()
}))

const mockLoggerError = jest.fn()

jest.mock('@/lib/logger', () => ({
  logger: {
    error: (...args: unknown[]) => mockLoggerError(...args)
  }
}))

import { GET } from '../route'

const mockedGetHomepageCollections = jest.requireMock('@/app/utils/fetchCollections').getHomepageCollections as jest.MockedFunction<() => Promise<Array<{ _id: string, name: string }>>>
const mockedBuildOccasionOptionsFromCollections = jest.requireMock('@/app/components/homepage/formOptions').buildOccasionOptionsFromCollections as jest.MockedFunction<(collections: Array<{ _id: string, name: string }>) => Array<{ label: string, value?: string, disabled?: boolean }>>

describe('/api/form/occasion-options', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('returns occasion options with noindex and no-store headers on success', async () => {
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
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(mockedBuildOccasionOptionsFromCollections).toHaveBeenCalledWith(collections)
  })

  it('returns a generic 500 and safely logs an upstream error', async () => {
    const sentinel = 'PRIVATE_COLLECTION_PROVIDER_MESSAGE'
    mockedGetHomepageCollections.mockRejectedValue(new Error(sentinel))

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body).toEqual({ error: 'Failed to fetch occasion options' })
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex, nofollow')
    expect(mockLoggerError).toHaveBeenCalledWith(
      'Failed to fetch occasion options',
      {
        operation: 'form.occasion-options.fetch',
        code: 'OPERATION_FAILED'
      }
    )
    expect(JSON.stringify({ body, logs: mockLoggerError.mock.calls })).not.toContain(sentinel)
  })
})
