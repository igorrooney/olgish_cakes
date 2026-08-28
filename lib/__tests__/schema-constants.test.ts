import {
  BRAND_ENTITY,
  BRAND_ID,
  BUSINESS_INFO,
  MAX_PRODUCTS_FOR_SCHEMA,
  getBrandEntity
} from '../schema-constants'

describe('schema constants', () => {
  it('contains the real public business identity', () => {
    expect(BUSINESS_INFO).toEqual(expect.objectContaining({
      name: 'Olgish Cakes',
      url: 'https://olgishcakes.co.uk',
      streetAddress: '15 Allerton Grange Avenue',
      postalCode: 'LS17 6PR',
      addressCountry: 'GB'
    }))
  })

  it('provides one reusable brand entity', () => {
    expect(BRAND_ID).toBe('https://olgishcakes.co.uk/#brand')
    expect(getBrandEntity()).toEqual(BRAND_ENTITY)
    expect(BRAND_ENTITY).toEqual(expect.objectContaining({
      '@type': 'Brand',
      '@id': BRAND_ID,
      name: BUSINESS_INFO.name
    }))
  })

  it('limits batch schema generation without introducing content fallbacks', () => {
    expect(MAX_PRODUCTS_FOR_SCHEMA).toBe(30)
    const exportedValues = {
      BRAND_ENTITY,
      BRAND_ID,
      BUSINESS_INFO,
      MAX_PRODUCTS_FOR_SCHEMA
    }
    expect(exportedValues).not.toHaveProperty('DEFAULT_RATING')
    expect(exportedValues).not.toHaveProperty('FALLBACK_PRICE')
    expect(exportedValues).not.toHaveProperty('DEFAULT_NUTRITION')
  })
})
