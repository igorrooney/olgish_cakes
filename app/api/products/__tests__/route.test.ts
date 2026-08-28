/**
 * @jest-environment node
 */
const mockCachedSanityFetch = jest.fn()
const mockGetCacheConfig = jest.fn((key: string) => ({ key }))
const mockLoggerError = jest.fn()

jest.mock('@/lib/sanity-cache', () => ({
  cachedSanityFetch: (...args: unknown[]) => mockCachedSanityFetch(...args),
  getCacheConfig: (key: string) => mockGetCacheConfig(key)
}))

jest.mock('@/lib/logger', () => ({
  logger: {
    error: (...args: unknown[]) => mockLoggerError(...args)
  }
}))

import { GET } from '../route'

describe('/api/products', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns transformed cake and hamper products', async () => {
    mockCachedSanityFetch
      .mockResolvedValueOnce([{
        _id: 'cake-1',
        name: 'Honey Cake',
        size: '8',
        pricing: { standard: 45, individual: 6 },
        category: 'Traditional',
        slug: { current: 'honey-cake' }
      }])
      .mockResolvedValueOnce([{
        _id: 'hamper-1',
        name: 'Gift Hamper',
        price: 30,
        category: 'Gifts',
        slug: { current: 'gift-hamper' }
      }])

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.products).toEqual([
      expect.objectContaining({
        id: 'cake-1',
        type: 'cake',
        displayName: 'Honey Cake (8 inch)',
        standardPrice: 45
      }),
      expect.objectContaining({
        id: 'hamper-1',
        type: 'gift-hamper',
        displayName: 'Gift Hamper',
        standardPrice: 30
      })
    ])
    expect(response.headers.get('Cache-Control')).toBe('no-store')
  })

  it('returns a generic response and logs no raw provider details', async () => {
    const sentinel = 'PRIVATE_PRODUCTS_SANITY_MESSAGE'
    mockCachedSanityFetch.mockRejectedValueOnce(new Error(sentinel))

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body).toEqual({ error: 'Failed to fetch products' })
    expect(mockLoggerError).toHaveBeenCalledWith(
      'Failed to fetch products',
      {
        operation: 'products.fetch',
        code: 'OPERATION_FAILED'
      }
    )
    expect(JSON.stringify({ body, logs: mockLoggerError.mock.calls })).not.toContain(sentinel)
  })
})
