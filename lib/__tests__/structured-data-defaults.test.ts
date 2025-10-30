import {
  DEFAULT_REVIEWS,
  DEFAULT_KYIV_CAKE_REVIEW,
  DEFAULT_AGGREGATE_RATING
} from '../structured-data-defaults'

describe('structured-data-defaults', () => {
  describe('DEFAULT_REVIEWS', () => {
    it('should be an array', () => {
      expect(Array.isArray(DEFAULT_REVIEWS)).toBe(true)
    })

    it('should have 2 reviews', () => {
      expect(DEFAULT_REVIEWS.length).toBe(2)
    })

    it('should have schema.org context', () => {
      DEFAULT_REVIEWS.forEach(review => {
        expect(review['@context']).toBe('https://schema.org')
      })
    })

    it('should have Review type', () => {
      DEFAULT_REVIEWS.forEach(review => {
        expect(review['@type']).toBe('Review')
      })
    })

    it('should have itemReviewed with @id reference', () => {
      DEFAULT_REVIEWS.forEach(review => {
        expect(review.itemReviewed).toBeDefined()
        expect((review.itemReviewed as any)['@id']).toBe('https://olgishcakes.co.uk/#product')
      })
    })

    it('should have author information', () => {
      DEFAULT_REVIEWS.forEach(review => {
        expect(review.author).toBeDefined()
        expect((review.author as any)['@type']).toBe('Person')
        expect((review.author as any).name).toBeDefined()
      })
    })

    it('should have rating values', () => {
      DEFAULT_REVIEWS.forEach(review => {
        expect(review.reviewRating).toBeDefined()
        expect((review.reviewRating as any)['@type']).toBe('Rating')
        expect((review.reviewRating as any).ratingValue).toBe('5')
        expect((review.reviewRating as any).bestRating).toBe('5')
        expect((review.reviewRating as any).worstRating).toBe('1')
      })
    })

    it('should have review body text', () => {
      DEFAULT_REVIEWS.forEach(review => {
        expect(review.reviewBody).toBeDefined()
        expect(typeof review.reviewBody).toBe('string')
        expect((review.reviewBody as any).length).toBeGreaterThan(0)
      })
    })

    it('should have publication dates', () => {
      DEFAULT_REVIEWS.forEach(review => {
        expect(review.datePublished).toBeDefined()
        expect(review.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      })
    })

    it('should have different authors', () => {
      expect(DEFAULT_REVIEWS[0].author.name).toBe('Sarah M.')
      expect(DEFAULT_REVIEWS[1].author.name).toBe('James K.')
    })

    it('should have different publication dates', () => {
      expect(DEFAULT_REVIEWS[0].datePublished).not.toBe(DEFAULT_REVIEWS[1].datePublished)
    })

    it('should reference main product by @id', () => {
      DEFAULT_REVIEWS.forEach(review => {
        expect((review.itemReviewed as any)['@id']).toBe('https://olgishcakes.co.uk/#product')
      })
    })

    it('should have valid date format', () => {
      DEFAULT_REVIEWS.forEach(review => {
        const date = new Date(review.datePublished as any)
        expect(date).toBeInstanceOf(Date)
        expect(isNaN(date.getTime())).toBe(false)
      })
    })

    it('should have recent dates (2025)', () => {
      DEFAULT_REVIEWS.forEach(review => {
        expect(review.datePublished.startsWith('2025-')).toBe(true)
      })
    })
  })

  describe('DEFAULT_KYIV_CAKE_REVIEW', () => {
    it('should have schema.org context', () => {
      expect(DEFAULT_KYIV_CAKE_REVIEW['@context']).toBe('https://schema.org')
    })

    it('should have Review type', () => {
      expect(DEFAULT_KYIV_CAKE_REVIEW['@type']).toBe('Review')
    })

    it('should reference Kyiv Cake product by @id', () => {
      expect((DEFAULT_KYIV_CAKE_REVIEW.itemReviewed as any)['@id']).toBe('https://olgishcakes.co.uk/cakes/kyiv-cake#product')
    })

    it('should have author', () => {
      expect(DEFAULT_KYIV_CAKE_REVIEW.author).toBeDefined()
      expect(DEFAULT_KYIV_CAKE_REVIEW.author['@type']).toBe('Person')
      expect(DEFAULT_KYIV_CAKE_REVIEW.author.name).toBe('Sarah M.')
    })

    it('should have 5-star rating', () => {
      expect(DEFAULT_KYIV_CAKE_REVIEW.reviewRating).toBeDefined()
      expect(DEFAULT_KYIV_CAKE_REVIEW.reviewRating['@type']).toBe('Rating')
      expect(DEFAULT_KYIV_CAKE_REVIEW.reviewRating.ratingValue).toBe('5')
    })

    it('should have rating range', () => {
      expect(DEFAULT_KYIV_CAKE_REVIEW.reviewRating.bestRating).toBe('5')
      expect(DEFAULT_KYIV_CAKE_REVIEW.reviewRating.worstRating).toBe('1')
    })

    it('should have review body', () => {
      expect(DEFAULT_KYIV_CAKE_REVIEW.reviewBody).toBeDefined()
      expect(typeof DEFAULT_KYIV_CAKE_REVIEW.reviewBody).toBe('string')
      expect(DEFAULT_KYIV_CAKE_REVIEW.reviewBody).toContain('Kyiv cake')
    })

    it('should have publication date', () => {
      expect(DEFAULT_KYIV_CAKE_REVIEW.datePublished).toBeDefined()
      expect(DEFAULT_KYIV_CAKE_REVIEW.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('should have valid date format', () => {
      const date = new Date(DEFAULT_KYIV_CAKE_REVIEW.datePublished)
      expect(date).toBeInstanceOf(Date)
      expect(isNaN(date.getTime())).toBe(false)
    })

    it('should have recent date (2025)', () => {
      expect(DEFAULT_KYIV_CAKE_REVIEW.datePublished.startsWith('2025-')).toBe(true)
    })

    it('should be positive review', () => {
      expect(DEFAULT_KYIV_CAKE_REVIEW.reviewBody).toContain('amazing')
      expect(DEFAULT_KYIV_CAKE_REVIEW.reviewBody).toContain('recommend')
    })
  })

  describe('DEFAULT_AGGREGATE_RATING', () => {
    it('should have AggregateRating type', () => {
      expect(DEFAULT_AGGREGATE_RATING['@type']).toBe('AggregateRating')
    })

    it('should have rating value of 5.0', () => {
      expect(DEFAULT_AGGREGATE_RATING.ratingValue).toBe('5.0')
    })

    it('should have review count matching DEFAULT_REVIEWS length', () => {
      expect(DEFAULT_AGGREGATE_RATING.reviewCount).toBe('2')
    })

    it('should have best rating of 5', () => {
      expect(DEFAULT_AGGREGATE_RATING.bestRating).toBe('5')
    })

    it('should have worst rating of 1', () => {
      expect(DEFAULT_AGGREGATE_RATING.worstRating).toBe('1')
    })

    it('should be a const object at compile time', () => {
      // Type check - as const provides type-level immutability
      expect(DEFAULT_AGGREGATE_RATING).toBeDefined()
      expect(DEFAULT_AGGREGATE_RATING.ratingValue).toBe('5.0')
    })

    it('should have all required properties', () => {
      const requiredProps = ['@type', 'ratingValue', 'reviewCount', 'bestRating', 'worstRating']

      requiredProps.forEach(prop => {
        expect(DEFAULT_AGGREGATE_RATING).toHaveProperty(prop)
      })
    })

    it('should have string values for all rating fields', () => {
      expect(typeof DEFAULT_AGGREGATE_RATING.ratingValue).toBe('string')
      expect(typeof DEFAULT_AGGREGATE_RATING.reviewCount).toBe('string')
      expect(typeof DEFAULT_AGGREGATE_RATING.bestRating).toBe('string')
      expect(typeof DEFAULT_AGGREGATE_RATING.worstRating).toBe('string')
    })

    it('should not have @context (for embedding)', () => {
      expect(DEFAULT_AGGREGATE_RATING).not.toHaveProperty('@context')
    })
  })

  describe('Integration', () => {
    it('should have matching review count between DEFAULT_REVIEWS and DEFAULT_AGGREGATE_RATING', () => {
      const actualCount = DEFAULT_REVIEWS.length
      const expectedCount = parseInt(DEFAULT_AGGREGATE_RATING.reviewCount)

      expect(actualCount).toBe(expectedCount)
    })

    it('should have consistent rating values', () => {
      const allFiveStars = DEFAULT_REVIEWS.every(r => r.reviewRating.ratingValue === '5')
      const aggregateIsFiveStar = DEFAULT_AGGREGATE_RATING.ratingValue === '5.0'

      expect(allFiveStars).toBe(true)
      expect(aggregateIsFiveStar).toBe(true)
    })

    it('should have consistent rating ranges', () => {
      DEFAULT_REVIEWS.forEach(review => {
        expect(review.reviewRating.bestRating).toBe(DEFAULT_AGGREGATE_RATING.bestRating)
        expect(review.reviewRating.worstRating).toBe(DEFAULT_AGGREGATE_RATING.worstRating)
      })
    })

    it('should provide complete review data structure', () => {
      DEFAULT_REVIEWS.forEach(review => {
        expect(review['@context']).toBeDefined()
        expect(review['@type']).toBeDefined()
        expect(review.itemReviewed).toBeDefined()
        expect(review.author).toBeDefined()
        expect(review.reviewRating).toBeDefined()
        expect(review.reviewBody).toBeDefined()
        expect(review.datePublished).toBeDefined()
      })
    })
  })

  describe('Schema.org Compliance', () => {
    it('should use correct schema.org types', () => {
      expect(DEFAULT_REVIEWS[0]['@type']).toBe('Review')
      expect((DEFAULT_REVIEWS[0].itemReviewed as any)['@id']).toBeDefined()
      expect(DEFAULT_REVIEWS[0].author['@type']).toBe('Person')
      expect(DEFAULT_REVIEWS[0].reviewRating['@type']).toBe('Rating')
      expect(DEFAULT_KYIV_CAKE_REVIEW['@type']).toBe('Review')
      expect((DEFAULT_KYIV_CAKE_REVIEW.itemReviewed as any)['@id']).toBeDefined()
      expect(DEFAULT_AGGREGATE_RATING['@type']).toBe('AggregateRating')
    })

    it('should have valid schema.org context URL', () => {
      expect(DEFAULT_REVIEWS[0]['@context']).toBe('https://schema.org')
      expect(DEFAULT_KYIV_CAKE_REVIEW['@context']).toBe('https://schema.org')
    })
  })
})

