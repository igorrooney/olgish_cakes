/**
 * @jest-environment node
 */
jest.mock('../../../../cakes/catalogPageData', () => ({
  getCatalogByPostCakesData: jest.fn()
}))

const mockLoggerError = jest.fn()

jest.mock('@/lib/logger', () => ({
  logger: {
    error: (...args: unknown[]) => mockLoggerError(...args)
  }
}))

type CatalogByPostCakesData = {
  cakes: Array<{
    id: string
    slug: string
    href: string
    navigationTarget: 'product' | 'landing'
    name: string
    description: string
    price: number
    imageUrl: string
    imageAlt: string
    isByPost: boolean
    isCustom: boolean
    isPopular: boolean
    collectionIds: string[]
    productType: 'cake' | 'giftHamper'
  }>
  collectionOptions: unknown[]
}

const mockedGetCatalogByPostCakesData = jest.requireMock('../../../../cakes/catalogPageData').getCatalogByPostCakesData as jest.MockedFunction<() => Promise<CatalogByPostCakesData>>
import { GET } from '../route'

describe('/api/catalog/by-post-cakes', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('returns noindex and no-store headers on success', async () => {
    const payload = {
      cakes: [
        {
          id: 'hamper-1',
          slug: 'sample-hamper',
          href: '/cakes-by-post/sample-hamper',
          navigationTarget: 'product' as const,
          name: 'Sample Hamper',
          description: 'Sample by post description',
          price: 32,
          imageUrl: '/images/sample-hamper.jpg',
          imageAlt: 'Sample Hamper',
          isByPost: true,
          isCustom: false,
          isPopular: false,
          collectionIds: [],
          productType: 'giftHamper' as const
        }
      ],
      collectionOptions: []
    }
    mockedGetCatalogByPostCakesData.mockResolvedValue(payload)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(payload)
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex, nofollow')
    expect(response.headers.get('Cache-Control')).toBe('no-store')
  })

  it('returns a generic error and logs only safe operational fields', async () => {
    const sentinel = 'PRIVATE_BY_POST_PROVIDER_MESSAGE'
    mockedGetCatalogByPostCakesData.mockRejectedValue(new Error(sentinel))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Failed to fetch by-post cakes catalog data' })
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex, nofollow')
    expect(mockLoggerError).toHaveBeenCalledWith(
      'Failed to fetch by-post cakes catalog data',
      {
        operation: 'catalog.by-post-cakes.fetch',
        code: 'OPERATION_FAILED'
      }
    )
    expect(JSON.stringify({ data, logs: mockLoggerError.mock.calls })).not.toContain(sentinel)
  })
})
