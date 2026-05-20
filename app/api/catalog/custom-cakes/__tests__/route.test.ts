/**
 * @jest-environment node
 */
jest.mock('../../../../cakes/catalogPageData', () => ({
  getCatalogCustomCakesData: jest.fn()
}))

type CatalogCustomCakesData = {
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

const mockedGetCatalogCustomCakesData = jest.requireMock('../../../../cakes/catalogPageData').getCatalogCustomCakesData as jest.MockedFunction<() => Promise<CatalogCustomCakesData>>
import { GET } from '../route'

describe('/api/catalog/custom-cakes', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('returns noindex and no-store headers on success', async () => {
    const payload = {
      cakes: [
        {
          id: 'cake-1',
          slug: 'sample-cake',
          href: '/cakes/sample-cake',
          navigationTarget: 'product' as const,
          name: 'Sample Cake',
          description: 'Sample description',
          price: 35,
          imageUrl: '/images/sample-cake.jpg',
          imageAlt: 'Sample Cake',
          isByPost: false,
          isCustom: true,
          isPopular: false,
          collectionIds: [],
          productType: 'cake' as const
        }
      ],
      collectionOptions: []
    }
    mockedGetCatalogCustomCakesData.mockResolvedValue(payload)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(payload)
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex, nofollow')
    expect(response.headers.get('Cache-Control')).toBe('no-store')
  })

  it('returns noindex header on error', async () => {
    mockedGetCatalogCustomCakesData.mockRejectedValue(new Error('Catalog fetch failed'))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Failed to fetch custom cakes catalog data' })
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex, nofollow')
  })
})
