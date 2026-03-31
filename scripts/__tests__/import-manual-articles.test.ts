/**
 * @jest-environment node
 */

import {
  applyImageAlt,
  collectProductSlugsFromSeeds,
  manualArticleScheduleBaseline,
  pickProductImage,
  retiredArticleSlugs,
  seedArticles,
  toArticleDocumentId,
  toArticleTopicDocumentId,
  topicSeeds,
  validateSeedConfiguration,
  type ProductRecord
} from '../import-manual-articles'

const expectedArchiveOrder = [
  ['2026-03-31', 'ukrainian-cakes-guide'],
  ['2026-03-30', 'napoleon-cake-guide'],
  ['2026-03-29', 'medovik-honey-cake-near-me-guide'],
  ['2026-03-28', 'kyiv-cake-guide'],
  ['2026-03-27', 'cake-delivery-leeds-guide'],
  ['2026-03-26', 'nut-free-cakes-leeds-guide'],
  ['2026-03-25', 'best-cakes-you-can-send-by-post-uk'],
  ['2026-03-24', 'cake-by-post-uk-complete-guide'],
  ['2026-03-23', 'gift-cakes-by-post-guide'],
  ['2026-03-22', 'top-5-reasons-order-letterbox-cakes-online'],
  ['2026-03-21', 'birthday-gifts-by-post'],
  ['2026-03-20', 'cake-cards-and-cake-slice-gifts'],
  ['2026-03-19', 'wedding-cake-flavours-guide'],
  ['2026-03-18', 'cake-delivery-wakefield-guide'],
  ['2026-03-17', 'cake-delivery-huddersfield-guide'],
  ['2026-03-16', 'cake-delivery-bradford-guide'],
  ['2026-03-15', 'cake-delivery-york-guide'],
  ['2026-03-14', 'nut-free-birthday-cakes-guide'],
  ['2026-03-13', 'cake-storage-and-preservation-guide'],
  ['2026-03-12', 'cake-size-and-portions-guide'],
  ['2026-03-11', 'how-surprise-someone-cake-delivery-post'],
  ['2026-03-10', 'valentines-cake-delivery-guide'],
  ['2026-03-09', 'easter-cakes-to-order-guide'],
  ['2026-03-08', 'halloween-cakes-delivery-guide'],
  ['2026-03-07', 'ukrainian-christmas-cakes-and-desserts-guide']
] as const

describe('import-manual-articles', () => {
  it('keeps the final archive topic set in the expected order', () => {
    expect(topicSeeds).toEqual([
      expect.objectContaining({ slug: 'cake-by-post', order: 0 }),
      expect.objectContaining({ slug: 'celebration-planning', order: 1 }),
      expect.objectContaining({ slug: 'custom-cakes', order: 2 }),
      expect.objectContaining({ slug: 'ukrainian-cake-guides', order: 3 }),
      expect.objectContaining({ slug: 'gift-ideas', order: 4 }),
      expect.objectContaining({ slug: 'local-cake-delivery', order: 5 }),
      expect.objectContaining({ slug: 'seasonal-cake-guides', order: 6 }),
      expect.objectContaining({ slug: 'cake-care-and-sizing', order: 7 })
    ])
  })

  it('keeps article and topic document ids deterministic', () => {
    expect(toArticleTopicDocumentId('gift-ideas')).toBe('articleTopic-gift-ideas')
    expect(toArticleDocumentId('napoleon-cake-guide')).toBe('article-napoleon-cake-guide')
  })

  it('validates the final seeded archive without editorial or schema breaches', () => {
    expect(() => validateSeedConfiguration()).not.toThrow()
  })

  it('allows explicit by-post wording when it is tied to standard honey cake, slice gifts, or delivery by agreement', () => {
    const targetIndex = seedArticles.findIndex((article) => article.slug === 'best-cakes-you-can-send-by-post-uk')
    const updatedArticles = seedArticles.map((article, index) => {
      if (index !== targetIndex) {
        return article
      }

      return {
        ...article,
        body: [
          ...article.body,
          {
            _key: 'policy-check',
            _type: 'block',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _key: 'policy-span',
                _type: 'span',
                marks: [],
                text: 'Standard honey cake by post, gift hampers with honey cake slices, and caramel biscuits can go across the UK. If a whole celebration cake needs to travel further, I only offer that by agreement.'
              }
            ]
          }
        ]
      }
    })

    expect(() => validateSeedConfiguration(updatedArticles)).not.toThrow()
  })

  it('rejects broad wording that treats any whole cake as a postal product', () => {
    const updatedArticles = seedArticles.map((article) => {
      if (article.slug !== 'best-cakes-you-can-send-by-post-uk') {
        return article
      }

      return {
        ...article,
        dek: 'Any cake can be delivered across the UK by post, and a full cake by post is always the easiest option.'
      }
    })

    expect(() => validateSeedConfiguration(updatedArticles)).toThrow(
      'Disallowed delivery claim found for best-cakes-you-can-send-by-post-uk'
    )
  })

  it('keeps the archive on an exact daily backdated schedule from March 31, 2026', () => {
    expect(manualArticleScheduleBaseline).toBe('2026-03-31T00:01:00.000Z')
    expect(seedArticles).toHaveLength(expectedArchiveOrder.length)

    const actualOrder = seedArticles.map((article) => [
      article.publishedAt.slice(0, 10),
      article.slug
    ])

    expect(actualOrder).toEqual(expectedArchiveOrder)
  })

  it('removes the retired article from the active archive set', () => {
    expect(retiredArticleSlugs).toEqual(['less-sweet-celebration-cakes'])
    expect(seedArticles.map((article) => article.slug)).not.toContain('less-sweet-celebration-cakes')
  })

  it('keeps optional primary products only on the planned informational articles', () => {
    const withoutPrimaryProduct = seedArticles
      .filter((article) => !article.primaryProductSlug)
      .map((article) => article.slug)

    expect(withoutPrimaryProduct).toEqual([
      'ukrainian-cakes-guide',
      'cake-delivery-leeds-guide',
      'nut-free-cakes-leeds-guide',
      'cake-delivery-wakefield-guide',
      'cake-delivery-huddersfield-guide',
      'cake-delivery-bradford-guide',
      'cake-delivery-york-guide',
      'nut-free-birthday-cakes-guide',
      'cake-size-and-portions-guide'
    ])
  })

  it('keeps related product mapping within the article schema limits', () => {
    for (const article of seedArticles) {
      expect(article.relatedProductSlugs.length).toBeLessThanOrEqual(4)
      expect(article.relatedProductSlugs).not.toContain(article.primaryProductSlug)
    }
  })

  it('collects a de-duplicated set of product slugs from the seeded archive', () => {
    expect(collectProductSlugsFromSeeds()).toEqual(
      expect.arrayContaining([
        'honey-cake-medovik',
        'napoleon-cake',
        'kyiv-cake',
        'cake-by-post',
        'birthday-gift-by-post',
        'happy-birthday-cake-card',
        'easter-cake-paska',
        'christmas-food-hamper-with-authentic-honey-cake'
      ])
    )
  })

  it('prefers a cake main image when one is available', () => {
    const product: ProductRecord = {
      _id: 'cake-1',
      _type: 'cake',
      name: 'Test cake',
      slug: 'test-cake',
      mainImage: {
        _type: 'image',
        alt: 'Cake main image',
        asset: {
          _type: 'reference',
          _ref: 'image-main'
        }
      },
      images: [
        {
          _type: 'image',
          alt: 'Secondary image',
          asset: {
            _type: 'reference',
            _ref: 'image-secondary'
          },
          isMain: true
        }
      ]
    }

    expect(pickProductImage(product)).toEqual({
      _type: 'image',
      alt: 'Cake main image',
      asset: {
        _type: 'reference',
        _ref: 'image-main'
      },
      caption: undefined
    })
  })

  it('falls back to a marked main hamper image when no mainImage field exists', () => {
    const product: ProductRecord = {
      _id: 'gift-1',
      _type: 'giftHamper',
      name: 'Test hamper',
      slug: 'test-hamper',
      images: [
        {
          _type: 'image',
          alt: 'Primary hamper image',
          asset: {
            _type: 'reference',
            _ref: 'image-gift-main'
          },
          isMain: true
        },
        {
          _type: 'image',
          alt: 'Secondary hamper image',
          asset: {
            _type: 'reference',
            _ref: 'image-gift-secondary'
          }
        }
      ]
    }

    expect(pickProductImage(product)).toEqual({
      _type: 'image',
      alt: 'Primary hamper image',
      asset: {
        _type: 'reference',
        _ref: 'image-gift-main'
      },
      caption: undefined
    })
  })

  it('applies explicit alt text to the normalized image object', () => {
    expect(
      applyImageAlt(
        {
          _type: 'image',
          alt: 'Original alt',
          asset: {
            _type: 'reference',
            _ref: 'image-1'
          }
        },
        'Updated alt'
      )
    ).toEqual({
      _type: 'image',
      alt: 'Updated alt',
      asset: {
        _type: 'reference',
        _ref: 'image-1'
      },
      caption: undefined
    })
  })
})
