import {
  STANDARD_MERCHANT_RETURN_POLICY,
  ensureMerchantReturnPolicy,
  ensureAllOffersHaveReturnPolicy,
  validateMerchantReturnPolicies
} from '../merchantReturnPolicy'

describe('merchantReturnPolicy', () => {
  describe('STANDARD_MERCHANT_RETURN_POLICY', () => {
    it('should have correct type', () => {
      expect(STANDARD_MERCHANT_RETURN_POLICY['@type']).toBe('MerchantReturnPolicy')
    })

    it('should apply to GB', () => {
      expect(STANDARD_MERCHANT_RETURN_POLICY.applicableCountry).toBe('GB')
    })

    it('should have free returns', () => {
      expect(STANDARD_MERCHANT_RETURN_POLICY.returnFees).toBe('https://schema.org/FreeReturn')
    })

    it('should have finite return window', () => {
      expect(STANDARD_MERCHANT_RETURN_POLICY.returnPolicyCategory).toBe('https://schema.org/MerchantReturnFiniteReturnWindow')
    })

    it('should have 14 day return period', () => {
      expect(STANDARD_MERCHANT_RETURN_POLICY.merchantReturnDays).toBe(14)
    })

    it('should allow return by mail', () => {
      expect(STANDARD_MERCHANT_RETURN_POLICY.returnMethod).toBe('https://schema.org/ReturnByMail')
    })
  })

  describe('ensureMerchantReturnPolicy', () => {
    it('should add return policy to offer without one', () => {
      const offer = { '@type': 'Offer', price: '30' }

      const result = ensureMerchantReturnPolicy(offer)

      expect(result.hasMerchantReturnPolicy).toEqual(STANDARD_MERCHANT_RETURN_POLICY)
    })

    it('should preserve existing return policy', () => {
      const customPolicy = { '@type': 'MerchantReturnPolicy', merchantReturnDays: 30 }
      const offer = { '@type': 'Offer', price: '30', hasMerchantReturnPolicy: customPolicy }

      const result = ensureMerchantReturnPolicy(offer)

      expect(result.hasMerchantReturnPolicy).toEqual(customPolicy)
    })

    it('should preserve other offer properties', () => {
      const offer = { '@type': 'Offer', price: '30', priceCurrency: 'GBP', availability: 'InStock' }

      const result = ensureMerchantReturnPolicy(offer)

      expect(result.price).toBe('30')
      expect(result.priceCurrency).toBe('GBP')
      expect(result.availability).toBe('InStock')
    })

    it('should not modify non-Offer objects', () => {
      const product = { '@type': 'Product', name: 'Cake' }

      const result = ensureMerchantReturnPolicy(product)

      expect(result).toEqual(product)
      expect(result.hasMerchantReturnPolicy).toBeUndefined()
    })

    it('should not modify objects without @type', () => {
      const obj = { price: '30' }

      const result = ensureMerchantReturnPolicy(obj)

      expect(result).toEqual(obj)
      expect(result.hasMerchantReturnPolicy).toBeUndefined()
    })
  })

  describe('ensureAllOffersHaveReturnPolicy', () => {
    it('should process array of offers', () => {
      const offers = [
        { '@type': 'Offer', price: '30' },
        { '@type': 'Offer', price: '45' }
      ]

      const result = ensureAllOffersHaveReturnPolicy(offers)

      expect(result).toHaveLength(2)
      expect(result[0].hasMerchantReturnPolicy).toEqual(STANDARD_MERCHANT_RETURN_POLICY)
      expect(result[1].hasMerchantReturnPolicy).toEqual(STANDARD_MERCHANT_RETURN_POLICY)
    })

    it('should handle empty array', () => {
      const result = ensureAllOffersHaveReturnPolicy([])

      expect(result).toEqual([])
    })

    it('should handle mixed array', () => {
      const offers = [
        { '@type': 'Offer', price: '30' },
        { '@type': 'Product', name: 'Cake' }
      ]

      const result = ensureAllOffersHaveReturnPolicy(offers)

      expect(result[0].hasMerchantReturnPolicy).toEqual(STANDARD_MERCHANT_RETURN_POLICY)
      expect(result[1].hasMerchantReturnPolicy).toBeUndefined()
    })
  })

  describe('validateMerchantReturnPolicies', () => {
    describe('Product validation', () => {
      it('should validate Product with missing policy', () => {
        const data = {
          '@type': 'Product',
          name: 'Honey Cake',
          offers: { '@type': 'Offer', price: '30' }
        }

        const result = validateMerchantReturnPolicies(data)

        expect(result.isValid).toBe(false)
        expect(result.missingPolicies).toContain('Product "Honey Cake" - main offer')
        expect(result.fixedData.offers.hasMerchantReturnPolicy).toEqual(STANDARD_MERCHANT_RETURN_POLICY)
      })

      it('should validate Product with existing policy', () => {
        const data = {
          '@type': 'Product',
          name: 'Honey Cake',
          offers: {
            '@type': 'Offer',
            price: '30',
            hasMerchantReturnPolicy: STANDARD_MERCHANT_RETURN_POLICY
          }
        }

        const result = validateMerchantReturnPolicies(data)

        expect(result.isValid).toBe(true)
        expect(result.missingPolicies).toHaveLength(0)
      })

      it('should not validate Product without offers', () => {
        const data = {
          '@type': 'Product',
          name: 'Honey Cake'
        }

        const result = validateMerchantReturnPolicies(data)

        expect(result.isValid).toBe(true)
      })
    })

    describe('OfferCatalog validation', () => {
      it('should validate OfferCatalog items', () => {
        const data = {
          hasOfferCatalog: {
            itemListElement: [
              { '@type': 'Offer', itemOffered: { name: 'Cake 1' } },
              { '@type': 'Offer', itemOffered: { name: 'Cake 2' } }
            ]
          }
        }

        const result = validateMerchantReturnPolicies(data)

        expect(result.isValid).toBe(false)
        expect(result.missingPolicies).toContain('OfferCatalog item 0: "Cake 1"')
        expect(result.missingPolicies).toContain('OfferCatalog item 1: "Cake 2"')
      })

      it('should handle OfferCatalog with policies', () => {
        const data = {
          hasOfferCatalog: {
            itemListElement: [
              {
                '@type': 'Offer',
                itemOffered: { name: 'Cake 1' },
                hasMerchantReturnPolicy: STANDARD_MERCHANT_RETURN_POLICY
              }
            ]
          }
        }

        const result = validateMerchantReturnPolicies(data)

        expect(result.isValid).toBe(true)
        expect(result.missingPolicies).toHaveLength(0)
      })

      it('should handle unnamed items', () => {
        const data = {
          hasOfferCatalog: {
            itemListElement: [
              { '@type': 'Offer' }
            ]
          }
        }

        const result = validateMerchantReturnPolicies(data)

        expect(result.isValid).toBe(false)
        expect(result.missingPolicies).toContain('OfferCatalog item 0: "unnamed"')
      })
    })

    describe('@graph validation', () => {
      it('should validate @graph Products', () => {
        const data = {
          '@graph': [
            {
              '@type': 'Product',
              name: 'Cake 1',
              offers: { '@type': 'Offer', price: '30' }
            },
            {
              '@type': 'Product',
              name: 'Cake 2',
              offers: { '@type': 'Offer', price: '45' }
            }
          ]
        }

        const result = validateMerchantReturnPolicies(data)

        expect(result.isValid).toBe(false)
        expect(result.missingPolicies).toContain('@graph Product 0: "Cake 1"')
        expect(result.missingPolicies).toContain('@graph Product 1: "Cake 2"')
      })

      it('should skip non-Product items in @graph', () => {
        const data = {
          '@graph': [
            { '@type': 'Organization', name: 'Olgish Cakes' },
            {
              '@type': 'Product',
              name: 'Cake',
              offers: { '@type': 'Offer', price: '30' }
            }
          ]
        }

        const result = validateMerchantReturnPolicies(data)

        expect(result.missingPolicies).toHaveLength(1)
        expect(result.missingPolicies).toContain('@graph Product 1: "Cake"')
      })

      it('should skip Products without offers in @graph', () => {
        const data = {
          '@graph': [
            { '@type': 'Product', name: 'Cake 1' },
            {
              '@type': 'Product',
              name: 'Cake 2',
              offers: { '@type': 'Offer', price: '30' }
            }
          ]
        }

        const result = validateMerchantReturnPolicies(data)

        expect(result.missingPolicies).toHaveLength(1)
        expect(result.missingPolicies).toContain('@graph Product 1: "Cake 2"')
      })
    })

    describe('Combined validation', () => {
      it('should validate all sections together', () => {
        const data = {
          '@type': 'Product',
          name: 'Main Product',
          offers: { '@type': 'Offer', price: '30' },
          hasOfferCatalog: {
            itemListElement: [
              { '@type': 'Offer', itemOffered: { name: 'Related 1' } }
            ]
          },
          '@graph': [
            {
              '@type': 'Product',
              name: 'Graph Product',
              offers: { '@type': 'Offer', price: '45' }
            }
          ]
        }

        const result = validateMerchantReturnPolicies(data)

        expect(result.isValid).toBe(false)
        expect(result.missingPolicies).toHaveLength(3)
      })

      it('should return valid when all policies present', () => {
        const data = {
          '@type': 'Product',
          name: 'Main Product',
          offers: {
            '@type': 'Offer',
            price: '30',
            hasMerchantReturnPolicy: STANDARD_MERCHANT_RETURN_POLICY
          }
        }

        const result = validateMerchantReturnPolicies(data)

        expect(result.isValid).toBe(true)
        expect(result.missingPolicies).toHaveLength(0)
      })
    })
  })
})

