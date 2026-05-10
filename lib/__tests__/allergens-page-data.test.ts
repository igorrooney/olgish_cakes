import {
  buildAllergensPageDataFromCatalog,
  getAllergensPageData
} from '../allergens-page-data'
import { cachedSanityFetch } from '../sanity-cache'

jest.mock('../sanity-cache', () => ({
  cachedSanityFetch: jest.fn()
}))

const mockedCachedSanityFetch = cachedSanityFetch as jest.MockedFunction<typeof cachedSanityFetch>

describe('allergens-page-data', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('builds allergen summaries from cakes and gift hampers', () => {
    const result = buildAllergensPageDataFromCatalog({
      cakes: [
        {
          name: 'Kyiv Cake',
          slug: 'kyiv-cake',
          allergens: ['Eggs', 'Nuts (Cashew nuts)', 'Milk'],
          ingredientReference: {
            ingredients: [
              {
                _type: 'block',
                children: [{ text: 'May contain: Peanuts, sesame.' }]
              }
            ]
          }
        },
        {
          name: 'Honey Cake',
          slug: 'honey-cake',
          allergens: ['Gluten (wheat)', 'Eggs', 'Milk']
        },
        {
          name: 'Chocolate Walnut Cake',
          slug: 'chocolate-walnut-cake',
          ingredientReference: {
            ingredients: [
              {
                _type: 'block',
                children: [{ text: 'Ingredients: wheat flour, eggs, milk chocolate and walnuts.' }]
              }
            ]
          }
        }
      ],
      giftHampers: [
        {
          name: 'Honey Cake by Post',
          slug: 'honey-cake-by-post',
          allergens: ['Gluten (wheat)', 'Eggs', 'Milk'],
          ingredientReference: {
            ingredients: [
              {
                _type: 'block',
                children: [{ text: 'May contain: nuts, soya, sulphur dioxide.' }]
              }
            ]
          }
        }
      ]
    })

    expect(result.totalCakeCount).toBe(3)
    expect(result.totalGiftHamperCount).toBe(1)
    expect(result.totalProductCount).toBe(4)
    expect(result.cakeCommonAllergens).toEqual([
      { label: 'Eggs', count: 3 },
      { label: 'Milk', count: 3 },
      { label: 'Gluten (wheat)', count: 2 },
      { label: 'Nuts', count: 2 }
    ])
    expect(result.giftHamperCommonAllergens).toEqual([
      { label: 'Eggs', count: 1 },
      { label: 'Gluten (wheat)', count: 1 },
      { label: 'Milk', count: 1 }
    ])
    expect(result.nutOrPeanutCakeNames).toEqual(['Kyiv Cake', 'Chocolate Walnut Cake'])
    expect(result.advisoryAllergens).toEqual(['Nuts', 'Soya', 'Sulphur dioxide'])
    expect(result.referencedCakeCount).toBe(2)
    expect(result.referencedGiftHamperCount).toBe(1)
  })

  it('fetches the audit data through the cached sanity helper', async () => {
    mockedCachedSanityFetch.mockResolvedValue({
      cakes: [],
      giftHampers: []
    })

    const result = await getAllergensPageData()

    expect(mockedCachedSanityFetch).toHaveBeenCalledTimes(1)
    expect(mockedCachedSanityFetch).toHaveBeenCalledWith(
      expect.any(String),
      {},
      {
        tags: ['cakes', 'cakes-by-post', 'gift-hampers', 'ingredients', 'pages']
      }
    )
    expect(result).toEqual({
      totalCakeCount: 0,
      totalGiftHamperCount: 0,
      totalProductCount: 0,
      cakeCommonAllergens: [],
      giftHamperCommonAllergens: [],
      overallCommonAllergens: [],
      nutOrPeanutCakeNames: [],
      advisoryAllergens: [],
      referencedCakeCount: 0,
      referencedGiftHamperCount: 0
    })
  })
})
