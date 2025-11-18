/**
 * @jest-environment jsdom
 */
import {
  isNumericPrice,
  isValidStructuredDataOffer,
  type StructuredDataOffer
} from '../structured-data'

describe('isNumericPrice', () => {
  describe('valid numbers', () => {
    it('should return true for positive integers', () => {
      expect(isNumericPrice(25)).toBe(true)
      expect(isNumericPrice(0)).toBe(true)
      expect(isNumericPrice(1000)).toBe(true)
    })

    it('should return true for positive decimals', () => {
      expect(isNumericPrice(25.99)).toBe(true)
      expect(isNumericPrice(0.01)).toBe(true)
      expect(isNumericPrice(100.5)).toBe(true)
    })

    it('should return true for zero', () => {
      expect(isNumericPrice(0)).toBe(true)
      expect(isNumericPrice(0.0)).toBe(true)
    })
  })

  describe('invalid values', () => {
    it('should return false for strings', () => {
      expect(isNumericPrice('25')).toBe(false)
      expect(isNumericPrice('25.99')).toBe(false)
      expect(isNumericPrice('From £25')).toBe(false)
      expect(isNumericPrice('Free')).toBe(false)
    })

    it('should return false for NaN', () => {
      expect(isNumericPrice(NaN)).toBe(false)
    })

    it('should return false for Infinity', () => {
      expect(isNumericPrice(Infinity)).toBe(false)
      expect(isNumericPrice(-Infinity)).toBe(false)
    })

    it('should return false for null and undefined', () => {
      expect(isNumericPrice(null)).toBe(false)
      expect(isNumericPrice(undefined)).toBe(false)
    })

    it('should return false for objects and arrays', () => {
      expect(isNumericPrice({})).toBe(false)
      expect(isNumericPrice([])).toBe(false)
      expect(isNumericPrice({ price: 25 })).toBe(false)
    })

    it('should return false for booleans', () => {
      expect(isNumericPrice(true)).toBe(false)
      expect(isNumericPrice(false)).toBe(false)
    })
  })
})

describe('isValidStructuredDataOffer', () => {
  describe('valid offers', () => {
    it('should validate a complete offer with numeric price', () => {
      const offer: StructuredDataOffer = {
        '@type': 'Offer',
        price: 25,
        priceCurrency: 'GBP',
        availability: 'https://schema.org/InStock',
        priceValidUntil: '2026-01-01'
      }
      expect(isValidStructuredDataOffer(offer)).toBe(true)
    })

    it('should validate a minimal offer with required fields', () => {
      const offer: StructuredDataOffer = {
        '@type': 'Offer',
        price: 30,
        priceCurrency: 'GBP'
      }
      expect(isValidStructuredDataOffer(offer)).toBe(true)
    })

    it('should validate offers with decimal prices', () => {
      const offer: StructuredDataOffer = {
        '@type': 'Offer',
        price: 25.99,
        priceCurrency: 'GBP'
      }
      expect(isValidStructuredDataOffer(offer)).toBe(true)
    })

    it('should validate offers with zero price', () => {
      const offer: StructuredDataOffer = {
        '@type': 'Offer',
        price: 0,
        priceCurrency: 'GBP'
      }
      expect(isValidStructuredDataOffer(offer)).toBe(true)
    })

    it('should validate offers with optional fields', () => {
      const offer: StructuredDataOffer = {
        '@type': 'Offer',
        price: 25,
        priceCurrency: 'GBP',
        url: 'https://example.com',
        seller: {
          '@type': 'Organization',
          name: 'Test Seller'
        },
        shippingDetails: {
          '@type': 'OfferShippingDetails',
          shippingRate: {
            '@type': 'MonetaryAmount',
            value: 5,
            currency: 'GBP'
          }
        }
      }
      expect(isValidStructuredDataOffer(offer)).toBe(true)
    })
  })

  describe('invalid offers', () => {
    it('should reject null', () => {
      expect(isValidStructuredDataOffer(null)).toBe(false)
    })

    it('should reject undefined', () => {
      expect(isValidStructuredDataOffer(undefined)).toBe(false)
    })

    it('should reject non-objects', () => {
      expect(isValidStructuredDataOffer('not an object')).toBe(false)
      expect(isValidStructuredDataOffer(25)).toBe(false)
      expect(isValidStructuredDataOffer([])).toBe(false)
    })

    it('should reject objects without @type', () => {
      expect(isValidStructuredDataOffer({
        price: 25,
        priceCurrency: 'GBP'
      })).toBe(false)
    })

    it('should reject objects with wrong @type', () => {
      expect(isValidStructuredDataOffer({
        '@type': 'Product',
        price: 25,
        priceCurrency: 'GBP'
      })).toBe(false)
    })

    it('should reject offers with string prices', () => {
      expect(isValidStructuredDataOffer({
        '@type': 'Offer',
        price: '25',
        priceCurrency: 'GBP'
      })).toBe(false)

      expect(isValidStructuredDataOffer({
        '@type': 'Offer',
        price: 'From £25',
        priceCurrency: 'GBP'
      })).toBe(false)
    })

    it('should reject offers with invalid price types', () => {
      expect(isValidStructuredDataOffer({
        '@type': 'Offer',
        price: NaN,
        priceCurrency: 'GBP'
      })).toBe(false)

      expect(isValidStructuredDataOffer({
        '@type': 'Offer',
        price: Infinity,
        priceCurrency: 'GBP'
      })).toBe(false)
    })

    it('should reject offers without priceCurrency', () => {
      expect(isValidStructuredDataOffer({
        '@type': 'Offer',
        price: 25
      })).toBe(false)
    })

    it('should reject offers with invalid priceCurrency type', () => {
      expect(isValidStructuredDataOffer({
        '@type': 'Offer',
        price: 25,
        priceCurrency: 123
      })).toBe(false)
    })
  })
})

