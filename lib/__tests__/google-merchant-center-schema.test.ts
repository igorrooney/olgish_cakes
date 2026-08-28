jest.mock('@/sanity/lib/image', () => ({
  urlFor: jest.fn(() => ({
    width: jest.fn().mockReturnThis(),
    height: jest.fn().mockReturnThis(),
    url: jest.fn(() => 'https://cdn.sanity.io/images/project/dataset/image.jpg')
  }))
}))

import {
  generateCakeMerchantCenterSchema,
  generateHamperMerchantCenterSchema,
  generateMerchantCenterProductSchema,
  generateProductSitemapData,
  validateMerchantCenterProduct
} from '../google-merchant-center-schema'

type UnknownRecord = Record<string, unknown>

describe('merchant product schema evidence rules', () => {
  const product = {
    id: 'cake-real-id',
    name: 'Honey Cake',
    description: 'A real product description',
    url: 'https://olgishcakes.co.uk/cakes/honey-cake',
    image: 'https://cdn.example.com/honey.jpg',
    price: 35,
    currency: 'GBP',
    availability: 'InStock',
    brand: 'Olgish Cakes',
    category: 'Cakes',
    condition: 'NewCondition'
  }

  it('emits a real priced offer without fabricated optional attributes', () => {
    const schema = generateMerchantCenterProductSchema(product)
    const offer = schema.offers as UnknownRecord
    const serialized = JSON.stringify(schema)

    expect(schema.image).toEqual([product.image])
    expect(offer.price).toBe(35)
    expect(offer).toHaveProperty('hasMerchantReturnPolicy')
    expect(offer).not.toHaveProperty('priceValidUntil')
    expect(offer).not.toHaveProperty('shippingDetails')
    expect(offer).not.toHaveProperty('eligibleTransactionVolume')
    expect(schema).not.toHaveProperty('review')
    expect(schema).not.toHaveProperty('aggregateRating')
    expect(schema).not.toHaveProperty('additionalProperty')
    expect(schema).not.toHaveProperty('productID')
    expect(schema['@id']).toBe(`${product.url}#product`)
    expect(serialized).not.toMatch(/Sarah M\.|20|VAT|Custom Label/)
  })

  it('includes only identifiers and shipping supplied by a trusted source', () => {
    const schema = generateMerchantCenterProductSchema({
      ...product,
      gtin: '05012345678903',
      mpn: 'REAL-MPN-1',
      sku: 'REAL-SKU-1',
      shipping: {
        country: 'GB',
        service: 'Actual service',
        price: 4.95
      }
    })
    const offer = schema.offers as UnknownRecord
    const shipping = offer.shippingDetails as UnknownRecord

    expect(schema.gtin).toBe('05012345678903')
    expect(schema.mpn).toBe('REAL-MPN-1')
    expect(schema.sku).toBe('REAL-SKU-1')
    expect(shipping).toEqual(expect.objectContaining({
      shippingRate: expect.objectContaining({ value: 4.95 }),
      shippingDestination: expect.objectContaining({ addressCountry: 'GB' })
    }))
    expect(shipping).not.toHaveProperty('deliveryTime')
  })

  it('omits image and offer when real values are unavailable', () => {
    const schema = generateMerchantCenterProductSchema({
      ...product,
      image: undefined,
      price: undefined
    })

    expect(schema).not.toHaveProperty('image')
    expect(schema).not.toHaveProperty('offers')
  })

  it('uses the actual public trading postcode', () => {
    const schema = generateMerchantCenterProductSchema(product)
    const manufacturer = schema.manufacturer as UnknownRecord
    const address = manufacturer.address as UnknownRecord

    expect(address.postalCode).toBe('LS17 6PR')
  })

  it('maps a cake without inventing price, image, shipping, tax or reviews', () => {
    const schema = generateCakeMerchantCenterSchema({
      _id: 'cake-1',
      name: 'Honey Cake',
      slug: { current: 'honey-cake' },
      description: 'A visible product description from the CMS'
    })
    const serialized = JSON.stringify(schema)

    expect(schema).not.toHaveProperty('offers')
    expect(schema).not.toHaveProperty('image')
    expect(schema.description).toBe('A visible product description from the CMS')
    expect((schema.offers as UnknownRecord | undefined)?.availability).toBeUndefined()
    expect(serialized).not.toMatch(/free delivery|review|aggregateRating|tax|VAT/i)
  })

  it('maps real cake price, image and portable text', () => {
    const schema = generateCakeMerchantCenterSchema({
      _id: 'cake-1',
      name: 'Honey Cake',
      slug: { current: 'honey-cake' },
      pricing: { standard: 42 },
      mainImage: { asset: { _ref: 'image-ref' } },
      shortDescription: [{ children: [{ text: 'Real cake description' }] }]
    })
    const offer = schema.offers as UnknownRecord

    expect(offer.price).toBe(42)
    expect(schema.image).toEqual(['https://cdn.sanity.io/images/project/dataset/image.jpg'])
    expect(schema.description).toBe('Real cake description')
    expect(offer.availability).toBeUndefined()
    expect(offer.condition).toBeUndefined()
  })

  it('maps hampers without fabricated fallbacks', () => {
    const emptySchema = generateHamperMerchantCenterSchema({
      _id: 'hamper-1',
      name: 'Gift Hamper',
      slug: { current: 'gift-hamper' },
      description: 'A visible hamper description from the CMS'
    })
    const realSchema = generateHamperMerchantCenterSchema({
      _id: 'hamper-2',
      name: 'Treat Hamper',
      slug: { current: 'treat-hamper' },
      price: 50,
      images: [{ asset: { _ref: 'image-ref' }, isMain: true }],
      description: [{ children: [{ text: 'A documented hamper description that is long enough for publication' }] }]
    })

    expect(emptySchema).not.toHaveProperty('offers')
    expect(emptySchema).not.toHaveProperty('image')
    expect(JSON.stringify(emptySchema)).not.toMatch(/free delivery|35|VAT/i)
    expect((realSchema.offers as UnknownRecord).price).toBe(50)
    expect(realSchema.image).toEqual(['https://cdn.sanity.io/images/project/dataset/image.jpg'])
  })

  it('does not invent a public hamper URL from an internal record ID', () => {
    expect(() => generateHamperMerchantCenterSchema({
      _id: 'private-record-id',
      name: 'Gift Hamper',
      description: 'A visible hamper description from the CMS'
    })).toThrow('A real public slug is required')
  })

  it('fails closed when a CMS product has no real description', () => {
    expect(() => generateCakeMerchantCenterSchema({
      _id: 'cake-1',
      name: 'Honey Cake',
      slug: { current: 'honey-cake' }
    })).toThrow('A real product description is required')
  })

  it('fails closed when a cake has no public slug', () => {
    expect(() => generateCakeMerchantCenterSchema({
      _id: 'cake-1',
      name: 'Honey Cake',
      slug: { current: ' ' },
      description: 'A visible cake description from the CMS'
    })).toThrow('A real public slug is required')
  })

  it('creates sitemap entries from real slugs and timestamps', () => {
    expect(generateProductSitemapData([{
      slug: { current: 'cakes/honey-cake' },
      _updatedAt: '2026-08-24T10:00:00Z'
    }])).toEqual([expect.objectContaining({
      url: 'https://olgishcakes.co.uk/cakes/honey-cake',
      lastModified: '2026-08-24T10:00:00Z'
    })])
  })

  it('validates required CMS fields without inventing replacements', () => {
    const invalid = validateMerchantCenterProduct({ name: 'Cake' })
    expect(invalid.isValid).toBe(false)
    expect(invalid.errors).toEqual(expect.arrayContaining([
      'Missing product ID',
      'Missing product slug',
      'No product images found - this will cause Google Merchant Center validation failures'
    ]))
    expect(invalid.warnings).toContain('Missing price information')

    const valid = validateMerchantCenterProduct({
      _id: 'cake-1',
      name: 'Cake',
      slug: { current: 'cake' },
      price: 30,
      images: [{ asset: { _ref: 'image-ref' } }],
      shortDescription: 'Real description'
    })
    expect(valid.isValid).toBe(true)
  })
})
