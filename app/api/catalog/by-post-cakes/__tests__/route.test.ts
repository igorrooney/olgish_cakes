/**
 * @jest-environment node
 */
jest.mock('../../../../cakes/catalogPageData', () => ({
  getCatalogByPostCakesData: jest.fn()
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

  it('returns noindex header and keeps cache control on success', async () => {
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
    expect(response.headers.get('Cache-Control')).toBe('public, s-maxage=1800, stale-while-revalidate=86400')
  })

  it('returns noindex header on error', async () => {
    mockedGetCatalogByPostCakesData.mockRejectedValue(new Error('Catalog fetch failed'))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Failed to fetch by-post cakes catalog data' })
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex, nofollow')
  })
})
