/**
 * @jest-environment node
 */
import {
  getCatalogByPostCakesData,
  getCatalogByPostCakesPriceCeiling,
  getCatalogPageData
} from '../catalogPageData'
import { getAllGiftHampers } from '../../utils/fetchGiftHampers'
import {
  getHomepageCollections,
  getHomepageGiftHamperCollections
} from '../../utils/fetchCollections'
import { getAllCakes, getCakesFeaturedOffer } from '../../utils/fetchCakes'

jest.mock('@/sanity/lib/image', () => ({
  urlFor: jest.fn(() => ({
    width: () => ({
      height: () => ({
        url: () => 'https://example.com/image.jpg'
      })
    })
  }))
}))

jest.mock('../../utils/fetchGiftHampers', () => ({
  getAllGiftHampers: jest.fn()
}))

jest.mock('../../utils/fetchCollections', () => ({
  getHomepageCollections: jest.fn(),
  getHomepageGiftHamperCollections: jest.fn()
}))

jest.mock('../../utils/fetchCakes', () => ({
  getAllCakes: jest.fn(),
  getCakesFeaturedOffer: jest.fn()
}))

const mockedGetAllGiftHampers = getAllGiftHampers as jest.MockedFunction<typeof getAllGiftHampers>
const mockedGetHomepageGiftHamperCollections =
  getHomepageGiftHamperCollections as jest.MockedFunction<typeof getHomepageGiftHamperCollections>
const mockedGetHomepageCollections =
  getHomepageCollections as jest.MockedFunction<typeof getHomepageCollections>
const mockedGetAllCakes = getAllCakes as jest.MockedFunction<typeof getAllCakes>
const mockedGetCakesFeaturedOffer = getCakesFeaturedOffer as jest.MockedFunction<typeof getCakesFeaturedOffer>

describe('catalogPageData gift-hamper fallbacks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedGetAllGiftHampers.mockResolvedValue([])
    mockedGetHomepageGiftHamperCollections.mockResolvedValue([])
    mockedGetHomepageCollections.mockResolvedValue([])
    mockedGetAllCakes.mockResolvedValue([])
    mockedGetCakesFeaturedOffer.mockResolvedValue(null)
  })

  it('returns empty by-post API payload when no gift hampers are available', async () => {
    const data = await getCatalogByPostCakesData()

    expect(data.cakes).toEqual([])
    expect(data.collectionOptions).toEqual([])
  })

  it('returns a zero by-post price ceiling when no gift hampers are available', async () => {
    const priceCeiling = await getCatalogByPostCakesPriceCeiling()

    expect(priceCeiling).toBe(0)
  })

  it('preserves empty-state semantics for gift hampers page data', async () => {
    const data = await getCatalogPageData('giftHampers')

    expect(data.cakesForUi).toEqual([])
    expect(data.mappedGiftHampers).toEqual([])
    expect(data.collectionOptions).toEqual([])
    expect(data.featuredOffer).toBeNull()
  })
})
