import {
  ADVANCED_SEO_CONFIG,
  generateAdvancedMetaDescription,
  generateAdvancedMetaTitle,
  generateAdvancedStructuredData,
  generateAISearchOptimization,
  generateEATOptimization,
  generateTopicCluster
} from '../advanced-seo'

type UnknownRecord = Record<string, unknown>

function getGraphItem(result: ReturnType<typeof generateAdvancedStructuredData>, type: string) {
  return result['@graph'].find((item) => item['@type'] === type) as UnknownRecord
}

describe('advanced SEO evidence rules', () => {
  it('uses relevant keywords without unsupported rating or award claims', () => {
    const configText = JSON.stringify(ADVANCED_SEO_CONFIG).toLowerCase()
    expect(ADVANCED_SEO_CONFIG.PRIMARY_KEYWORDS).toContain('ukrainian cakes leeds')
    expect(configText).not.toMatch(/5.?star|award.winning|same.day/)
  })

  it('creates descriptive titles and honest descriptions', () => {
    const title = generateAdvancedMetaTitle('Wedding Cakes', 'York')
    const description = generateAdvancedMetaDescription('Wedding Cakes', 'York', 'family recipes')

    expect(title).toContain('Wedding Cakes')
    expect(title).toContain('York')
    expect(description).toContain('Wedding Cakes')
    expect(description).toContain('York')
    expect(description).toContain('family recipes')
    expect(description).not.toMatch(/5.?star|award|same.day|free consultation/i)
  })

  it('emits only supported Product properties', () => {
    const result = generateAdvancedStructuredData({
      name: 'Honey Cake',
      description: 'Traditional Ukrainian honey cake',
      imageUrl: '/images/honey-cake.jpg',
      price: 30,
      category: 'Cakes',
      availability: 'InStock',
      location: 'Leeds'
    })
    const product = getGraphItem(result, 'Product')
    const offer = product.offers as UnknownRecord

    expect(product.image).toEqual(['https://olgishcakes.co.uk/images/honey-cake.jpg'])
    expect(offer.price).toBe(30)
    expect(offer).not.toHaveProperty('priceValidUntil')
    expect(offer).not.toHaveProperty('shippingDetails')
    expect(product).not.toHaveProperty('review')
    expect(product).not.toHaveProperty('aggregateRating')
    expect(JSON.stringify(result)).not.toMatch(/Sarah M\.|James K\.|00:00-23:59|award-winning/i)
  })

  it('omits optional image and offer instead of inventing fallbacks', () => {
    const result = generateAdvancedStructuredData({
      name: 'Custom Cake',
      description: 'Made to order',
      category: 'Cakes'
    })
    const product = getGraphItem(result, 'Product')

    expect(product).not.toHaveProperty('image')
    expect(product).not.toHaveProperty('offers')
  })

  it('does not invent product availability when it is not supplied', () => {
    const result = generateAdvancedStructuredData({
      name: 'Custom Cake',
      description: 'Made to order',
      imageUrl: '/images/custom-cake.jpg',
      price: 45,
      category: 'Cakes'
    })
    const product = getGraphItem(result, 'Product')
    const offer = product.offers as UnknownRecord

    expect(offer).not.toHaveProperty('availability')
  })

  it('includes factual bakery and visible ordering entities', () => {
    const result = generateAdvancedStructuredData({
      name: 'Cake',
      description: 'Cake description',
      category: 'Cakes',
      location: 'York'
    })
    const bakery = getGraphItem(result, 'Bakery')
    const howTo = getGraphItem(result, 'HowTo')

    expect(bakery.areaServed).toBe('York')
    expect(bakery).not.toHaveProperty('openingHours')
    expect(howTo).toHaveProperty('step')
  })

  it('produces neutral AI-search facts and topic clusters', () => {
    const ai = generateAISearchOptimization({
      topic: 'Ukrainian cakes',
      expertise: ['baking', 'cake design'],
      location: 'Leeds'
    })

    expect(ai.aiContext).toContain('Leeds')
    expect(JSON.stringify(ai)).not.toMatch(/leading|premier|same.day|10\+|award/i)
    expect(generateTopicCluster('custom-cakes', 'York').pillar).toContain('York')
    expect(generateTopicCluster('unknown').supporting.length).toBeGreaterThanOrEqual(5)
  })

  it('requires evidence before publishing expertise and authority claims', () => {
    const eat = generateEATOptimization()
    const text = JSON.stringify(eat)

    expect(text).toContain('only after verification')
    expect(text).toContain('source evidence')
    expect(text).not.toMatch(/award-winning|10\+ years/i)
  })
})
