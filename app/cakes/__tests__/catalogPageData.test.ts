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
import type { Cake } from '@/types/cake'
import type { GiftHamper } from '@/types/giftHamper'

jest.mock('@/sanity/lib/image', () => ({
  ...(() => {
    const mockImageUrl = jest.fn(() => 'https://example.com/image.jpg')
    const mockHeight = jest.fn(() => ({
      url: mockImageUrl
    }))
    const mockWidth = jest.fn(() => ({
      height: mockHeight
    }))
    const mockUrlFor = jest.fn(() => ({
      width: mockWidth
    }))

    return {
      urlFor: mockUrlFor,
      __mocks: {
        mockImageUrl,
        mockHeight,
        mockWidth,
        mockUrlFor
      }
    }
  })()
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
const imageModule = jest.requireMock('@/sanity/lib/image') as {
  __mocks: {
    mockImageUrl: jest.Mock<string, []>
    mockHeight: jest.Mock<{ url: jest.Mock<string, []> }, [number]>
    mockWidth: jest.Mock<{ height: jest.Mock<{ url: jest.Mock<string, []> }, [number]> }, [number]>
    mockUrlFor: jest.Mock<{ width: jest.Mock<{ height: jest.Mock<{ url: jest.Mock<string, []> }, [number]> }, [number]> }, [unknown]>
  }
}
const {
  mockHeight,
  mockWidth,
  mockUrlFor
} = imageModule.__mocks
const sampleCake: Cake = {
  _id: 'cake-1',
  _createdAt: '2025-01-01T00:00:00.000Z',
  name: 'Honey Cake',
  slug: {
    current: 'honey-cake'
  },
  description: [
    {
      _type: 'block',
      children: [{ text: 'Cake description' }]
    }
  ],
  shortDescription: [],
  size: '8inch',
  pricing: {
    standard: 25,
    individual: 35
  },
  mainImage: {
    _type: 'image',
    asset: {
      _ref: 'image-cake-main-1'
    },
    alt: 'Honey cake main image'
  },
  images: [],
  designs: {
    standard: []
  },
  category: 'Traditional',
  collections: [],
  ingredients: [],
  allergens: []
}
const sampleGiftHamper: GiftHamper = {
  _id: 'hamper-1',
  _createdAt: '2025-01-01T00:00:00.000Z',
  name: 'By-post hamper',
  slug: {
    current: 'by-post-hamper'
  },
  price: 38,
  images: [
    {
      _type: 'image',
      asset: {
        _ref: 'image-hamper-main-1'
      },
      isMain: true,
      alt: 'Gift hamper image'
    }
  ],
  collections: []
}

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

  it('requests 900x900 transformed image URLs for mapped cakes', async () => {
    mockedGetAllCakes.mockResolvedValue([sampleCake])

    const data = await getCatalogPageData('cakes')

    expect(data.cakesForUi).toHaveLength(1)
    expect(data.cakesForUi[0]).toMatchObject({
      name: sampleCake.name,
      imageUrl: 'https://example.com/image.jpg'
    })
    expect(mockUrlFor).toHaveBeenCalledWith(sampleCake.mainImage)
    expect(mockWidth).toHaveBeenCalledWith(900)
    expect(mockHeight).toHaveBeenCalledWith(900)
  })

  it('maps Kyiv-style custom cake price to 2-4 servings default when provided', async () => {
    mockedGetAllCakes.mockResolvedValue([
      {
        ...sampleCake,
        pricing: {
          standard: 34,
          individual: 45
        },
        newDesignPricingByServings: {
          servings2To4: 20,
          servings4To8: 34,
          servings8To12: 48,
          servings2To4IsDefault: true
        }
      }
    ])
    const data = await getCatalogPageData('cakes')
    expect(data.cakesForUi).toHaveLength(1)
    expect(data.cakesForUi[0]?.price).toBe(20)
  })
  it('maps custom cake price to minimum serving when no default flag is provided', async () => {
    mockedGetAllCakes.mockResolvedValue([
      {
        ...sampleCake,
        pricing: {
          standard: 25,
          individual: 35
        },
        newDesignPricingByServings: {
          servings2To4: 25,
          servings4To8: 40,
          servings8To12: 55
        }
      }
    ])
    const data = await getCatalogPageData('cakes')
    expect(data.cakesForUi).toHaveLength(1)
    expect(data.cakesForUi[0]?.price).toBe(25)
  })
  it('falls back to legacy standard price when servings pricing is unavailable', async () => {
    mockedGetAllCakes.mockResolvedValue([
      {
        ...sampleCake,
        pricing: {
          standard: 31,
          individual: 41
        },
        newDesignPricingByServings: undefined
      }
    ])
    const data = await getCatalogPageData('cakes')
    expect(data.cakesForUi).toHaveLength(1)
    expect(data.cakesForUi[0]?.price).toBe(31)
  })

  it('requests 900x900 transformed image URLs for mapped gift hampers', async () => {
    mockedGetAllGiftHampers.mockResolvedValue([sampleGiftHamper])

    const data = await getCatalogByPostCakesData()

    expect(data.cakes).toHaveLength(1)
    expect(data.cakes[0]).toMatchObject({
      name: sampleGiftHamper.name,
      imageUrl: 'https://example.com/image.jpg'
    })
    expect(mockUrlFor).toHaveBeenCalledWith(sampleGiftHamper.images?.[0])
    expect(mockWidth).toHaveBeenCalledWith(900)
    expect(mockHeight).toHaveBeenCalledWith(900)
  })
})

