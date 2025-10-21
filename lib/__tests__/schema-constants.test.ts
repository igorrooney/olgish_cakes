import {
  MAX_PRODUCTS_FOR_SCHEMA,
  DEFAULT_PRICE_VALID_DAYS,
  SKU_PREFIX,
  MAX_SKU_NAME_LENGTH,
  SKU_PADDING_LENGTH,
  DEFAULT_NUTRITION,
  BUSINESS_INFO,
  DELIVERY_SETTINGS,
  RETURN_POLICY,
  DEFAULT_RATING,
  FALLBACK_PRICE,
  FALLBACK_IMAGE,
  MIN_REVIEW_COUNT_FOR_DISPLAY
} from '../schema-constants'

describe('schema-constants', () => {
  describe('Product Schema Limits', () => {
    it('should have MAX_PRODUCTS_FOR_SCHEMA defined', () => {
      expect(MAX_PRODUCTS_FOR_SCHEMA).toBe(30)
    })

    it('should have reasonable product limit', () => {
      expect(MAX_PRODUCTS_FOR_SCHEMA).toBeGreaterThan(0)
      expect(MAX_PRODUCTS_FOR_SCHEMA).toBeLessThanOrEqual(100)
    })
  })

  describe('Price Validity', () => {
    it('should have DEFAULT_PRICE_VALID_DAYS defined', () => {
      expect(DEFAULT_PRICE_VALID_DAYS).toBe(30)
    })

    it('should have reasonable validity period', () => {
      expect(DEFAULT_PRICE_VALID_DAYS).toBeGreaterThan(0)
    })
  })

  describe('SKU Configuration', () => {
    it('should have SKU_PREFIX', () => {
      expect(SKU_PREFIX).toBe('OC')
    })

    it('should have MAX_SKU_NAME_LENGTH', () => {
      expect(MAX_SKU_NAME_LENGTH).toBe(15)
    })

    it('should have SKU_PADDING_LENGTH', () => {
      expect(SKU_PADDING_LENGTH).toBe(3)
    })

    it('should have reasonable SKU settings', () => {
      expect(MAX_SKU_NAME_LENGTH).toBeGreaterThan(SKU_PADDING_LENGTH)
    })
  })

  describe('DEFAULT_NUTRITION', () => {
    it('should have all nutrition fields', () => {
      expect(DEFAULT_NUTRITION.calories).toBe('350 calories')
      expect(DEFAULT_NUTRITION.fatContent).toBe('15 grams')
      expect(DEFAULT_NUTRITION.saturatedFatContent).toBe('8 grams')
      expect(DEFAULT_NUTRITION.carbohydrateContent).toBe('40 grams')
      expect(DEFAULT_NUTRITION.sugarContent).toBe('25 grams')
      expect(DEFAULT_NUTRITION.proteinContent).toBe('6 grams')
      expect(DEFAULT_NUTRITION.servingSize).toBe('100g')
    })

    it('should have valid calorie format', () => {
      expect(DEFAULT_NUTRITION.calories).toContain('calories')
    })

    it('should have valid serving size', () => {
      expect(DEFAULT_NUTRITION.servingSize).toMatch(/^\d+g$/)
    })

    it('should have all macronutrients', () => {
      expect(DEFAULT_NUTRITION.fatContent).toBeDefined()
      expect(DEFAULT_NUTRITION.carbohydrateContent).toBeDefined()
      expect(DEFAULT_NUTRITION.proteinContent).toBeDefined()
    })

    it('should specify saturated fat separately', () => {
      expect(DEFAULT_NUTRITION.saturatedFatContent).toBeDefined()
      expect(DEFAULT_NUTRITION.saturatedFatContent).toContain('grams')
    })

    it('should specify sugar content', () => {
      expect(DEFAULT_NUTRITION.sugarContent).toBeDefined()
      expect(DEFAULT_NUTRITION.sugarContent).toContain('grams')
    })
  })

  describe('BUSINESS_INFO', () => {
    it('should have business name', () => {
      expect(BUSINESS_INFO.name).toBe('Olgish Cakes')
    })

    it('should have website URL', () => {
      expect(BUSINESS_INFO.url).toBe('https://olgishcakes.co.uk')
    })

    it('should have logo URL', () => {
      expect(BUSINESS_INFO.logo).toBe('https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png')
    })

    it('should have address locality', () => {
      expect(BUSINESS_INFO.addressLocality).toBe('Leeds')
    })

    it('should have address region', () => {
      expect(BUSINESS_INFO.addressRegion).toBe('West Yorkshire')
    })

    it('should have address country', () => {
      expect(BUSINESS_INFO.addressCountry).toBe('GB')
    })

    it('should use valid country code', () => {
      expect(BUSINESS_INFO.addressCountry).toMatch(/^[A-Z]{2}$/)
    })

    it('should have valid URL format', () => {
      expect(BUSINESS_INFO.url).toMatch(/^https:\/\//)
      expect(BUSINESS_INFO.logo).toMatch(/^https:\/\//)
    })
  })

  describe('DELIVERY_SETTINGS', () => {
    it('should have deliveryLeadTimeDays', () => {
      expect(DELIVERY_SETTINGS.deliveryLeadTimeDays).toBe(1)
    })

    it('should have handlingTimeMinDays', () => {
      expect(DELIVERY_SETTINGS.handlingTimeMinDays).toBe(0)
    })

    it('should have handlingTimeMaxDays', () => {
      expect(DELIVERY_SETTINGS.handlingTimeMaxDays).toBe(1)
    })

    it('should have transitTimeMinDays', () => {
      expect(DELIVERY_SETTINGS.transitTimeMinDays).toBe(1)
    })

    it('should have transitTimeMaxDays', () => {
      expect(DELIVERY_SETTINGS.transitTimeMaxDays).toBe(3)
    })

    it('should have shippingRate', () => {
      expect(DELIVERY_SETTINGS.shippingRate).toBe(0)
    })

    it('should have logical time ranges', () => {
      expect(DELIVERY_SETTINGS.handlingTimeMinDays).toBeLessThanOrEqual(DELIVERY_SETTINGS.handlingTimeMaxDays)
      expect(DELIVERY_SETTINGS.transitTimeMinDays).toBeLessThanOrEqual(DELIVERY_SETTINGS.transitTimeMaxDays)
    })

    it('should have non-negative values', () => {
      expect(DELIVERY_SETTINGS.deliveryLeadTimeDays).toBeGreaterThanOrEqual(0)
      expect(DELIVERY_SETTINGS.handlingTimeMinDays).toBeGreaterThanOrEqual(0)
      expect(DELIVERY_SETTINGS.transitTimeMinDays).toBeGreaterThanOrEqual(0)
      expect(DELIVERY_SETTINGS.shippingRate).toBeGreaterThanOrEqual(0)
    })
  })

  describe('RETURN_POLICY', () => {
    it('should have return days', () => {
      expect(RETURN_POLICY.returnDays).toBe(14)
    })

    it('should have return fees schema URL', () => {
      expect(RETURN_POLICY.returnFees).toBe('https://schema.org/FreeReturn')
    })

    it('should have return policy category', () => {
      expect(RETURN_POLICY.returnPolicyCategory).toBe('https://schema.org/MerchantReturnFiniteReturnWindow')
    })

    it('should have return method', () => {
      expect(RETURN_POLICY.returnMethod).toBe('https://schema.org/ReturnByMail')
    })

    it('should use valid schema.org URLs', () => {
      expect(RETURN_POLICY.returnFees).toMatch(/^https:\/\/schema\.org\//)
      expect(RETURN_POLICY.returnPolicyCategory).toMatch(/^https:\/\/schema\.org\//)
      expect(RETURN_POLICY.returnMethod).toMatch(/^https:\/\/schema\.org\//)
    })

    it('should have reasonable return period', () => {
      expect(RETURN_POLICY.returnDays).toBeGreaterThan(0)
      expect(RETURN_POLICY.returnDays).toBeLessThanOrEqual(365)
    })
  })

  describe('DEFAULT_RATING', () => {
    it('should have bestRating', () => {
      expect(DEFAULT_RATING.bestRating).toBe('5')
    })

    it('should have worstRating', () => {
      expect(DEFAULT_RATING.worstRating).toBe('1')
    })

    it('should have defaultValue', () => {
      expect(DEFAULT_RATING.defaultValue).toBe('5.0')
    })

    it('should have logical rating range', () => {
      const best = parseInt(DEFAULT_RATING.bestRating)
      const worst = parseInt(DEFAULT_RATING.worstRating)
      const def = parseFloat(DEFAULT_RATING.defaultValue)

      expect(best).toBeGreaterThan(worst)
      expect(def).toBeGreaterThanOrEqual(worst)
      expect(def).toBeLessThanOrEqual(best)
    })

    it('should use string values for schema compatibility', () => {
      expect(typeof DEFAULT_RATING.bestRating).toBe('string')
      expect(typeof DEFAULT_RATING.worstRating).toBe('string')
      expect(typeof DEFAULT_RATING.defaultValue).toBe('string')
    })
  })

  describe('Fallback Values', () => {
    it('should have FALLBACK_PRICE', () => {
      expect(FALLBACK_PRICE).toBe(25)
    })

    it('should have FALLBACK_IMAGE', () => {
      expect(FALLBACK_IMAGE).toBe('https://olgishcakes.co.uk/images/placeholder-cake.jpg')
    })

    it('should have MIN_REVIEW_COUNT_FOR_DISPLAY', () => {
      expect(MIN_REVIEW_COUNT_FOR_DISPLAY).toBe(2)
    })

    it('should have positive fallback price', () => {
      expect(FALLBACK_PRICE).toBeGreaterThan(0)
    })

    it('should have valid fallback image URL', () => {
      expect(FALLBACK_IMAGE).toMatch(/^https:\/\//)
      expect(FALLBACK_IMAGE).toMatch(/\.(jpg|jpeg|png|webp)$/)
    })

    it('should require at least one review', () => {
      expect(MIN_REVIEW_COUNT_FOR_DISPLAY).toBeGreaterThan(0)
    })
  })

  describe('Type Safety', () => {
    it('should have readonly nutrition values', () => {
      expect(DEFAULT_NUTRITION).toBeDefined()
    })

    it('should have readonly business info', () => {
      expect(BUSINESS_INFO).toBeDefined()
    })

    it('should have readonly delivery settings', () => {
      expect(DELIVERY_SETTINGS).toBeDefined()
    })

    it('should have readonly return policy', () => {
      expect(RETURN_POLICY).toBeDefined()
    })

    it('should have readonly rating defaults', () => {
      expect(DEFAULT_RATING).toBeDefined()
    })
  })

  describe('Schema.org Compliance', () => {
    it('should use schema.org URLs for return policy', () => {
      expect(RETURN_POLICY.returnFees).toContain('schema.org')
      expect(RETURN_POLICY.returnPolicyCategory).toContain('schema.org')
      expect(RETURN_POLICY.returnMethod).toContain('schema.org')
    })

    it('should use standard country codes', () => {
      expect(BUSINESS_INFO.addressCountry).toBe('GB')
    })

    it('should use consistent business URLs', () => {
      expect(BUSINESS_INFO.url).toContain('olgishcakes.co.uk')
      expect(BUSINESS_INFO.logo).toContain('olgishcakes.co.uk')
    })
  })

  describe('Data Consistency', () => {
    it('should align nutrition serving size with standard', () => {
      expect(DEFAULT_NUTRITION.servingSize).toBe('100g')
    })

    it('should use consistent units for nutrition', () => {
      expect(DEFAULT_NUTRITION.fatContent).toContain('grams')
      expect(DEFAULT_NUTRITION.carbohydrateContent).toContain('grams')
      expect(DEFAULT_NUTRITION.proteinContent).toContain('grams')
    })

    it('should have business name matching brand', () => {
      expect(BUSINESS_INFO.name).toBe('Olgish Cakes')
    })
  })
})

