import {
  defaultGiftHamperDeliveryTitle,
  fallbackGiftHamperDeliveryDescription,
  fallbackGiftHamperDeliveryPolicy,
  detectGiftHamperDeliveryPolicyMismatch,
  getGiftHamperDeliveryFallbackKeyPoint,
  resolveGiftHamperDeliveryContent,
  resolveGiftHamperDeliveryDescription,
  resolveGiftHamperDeliveryPolicy,
  resolveGiftHamperDeliveryTitle
} from '../delivery-content'
import { defaultDeliveryMethod } from '@/types/deliveryPolicy'
import type { GiftHamper } from '@/types/giftHamper'

const globalDescription: GiftHamper['description'] = [
  {
    _type: 'block',
    children: [
      {
        _type: 'span',
        text: 'We dispatch cake-by-post orders within 2-3 working days. Free UK shipping is included.'
      }
    ]
  }
]

const customDescription: GiftHamper['description'] = [
  {
    _type: 'block',
    children: [
      {
        _type: 'span',
        text: 'Custom hamper delivery description'
      }
    ]
  }
]

const baseHamper: GiftHamper = {
  _id: 'hamper-1',
  _createdAt: '2025-01-01T00:00:00.000Z',
  name: 'Cake by post hamper',
  slug: {
    current: 'cake-by-post-hamper'
  },
  description: [
    {
      _type: 'block',
      children: [
        {
          _type: 'span',
          text: 'Hamper description'
        }
      ]
    }
  ],
  shortDescription: [],
  price: 9,
  ingredientReference: {
    _id: 'ingredient-1',
    ingredients: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Flour'
          }
        ]
      }
    ]
  }
}

describe('gift-hampers delivery-content', () => {
  const globalPolicy = {
    dispatchMinDays: 2,
    dispatchMaxDays: 3,
    shippingFeeGbp: 0,
    shippingDestinationCountry: 'GB',
    deliveryMethod: defaultDeliveryMethod
  }

  it('uses global delivery content by default', () => {
    const hamper: GiftHamper = {
      ...baseHamper,
      giftHampersDeliverySection: {
        name: 'Shipping & delivery',
        description: globalDescription,
        policy: globalPolicy
      }
    }

    const resolvedPolicy = resolveGiftHamperDeliveryPolicy(hamper)
    const resolvedMismatch = detectGiftHamperDeliveryPolicyMismatch(hamper, resolvedPolicy)

    expect(resolveGiftHamperDeliveryTitle(hamper)).toBe('Shipping & delivery')
    expect(resolveGiftHamperDeliveryDescription(hamper)).toEqual(globalDescription)
    expect(resolvedPolicy).toEqual(globalPolicy)
    expect(resolvedMismatch).toEqual({
      shouldEmitShippingDetails: true
    })
    expect(resolveGiftHamperDeliveryContent(hamper)).toEqual({
      title: 'Shipping & delivery',
      description: globalDescription,
      policy: globalPolicy,
      shouldEmitShippingDetails: true,
      shippingDetailsOmissionReason: undefined,
      shippingDetailsVisibleClaims: {
        timing: true,
        shippingCost: true,
        destinationCountry: true,
        deliveryMethod: true
      }
    })
  })

  it('uses custom description when source is custom and content exists', () => {
    const hamper: GiftHamper = {
      ...baseHamper,
      deliverySection: {
        descriptionSource: 'custom',
        customDescription
      },
      giftHampersDeliverySection: {
        name: 'Shipping & delivery',
        description: globalDescription
      }
    }

    expect(resolveGiftHamperDeliveryTitle(hamper)).toBe('Shipping & delivery')
    expect(resolveGiftHamperDeliveryDescription(hamper)).toEqual(customDescription)
  })

  it('uses custom policy when source is custom and policy exists', () => {
    const hamper: GiftHamper = {
      ...baseHamper,
      deliverySection: {
        descriptionSource: 'custom',
        customPolicy: {
          dispatchMinDays: 4,
          dispatchMaxDays: 6,
          shippingFeeGbp: 2.75,
          shippingDestinationCountry: 'GB',
          deliveryMethod: defaultDeliveryMethod
        }
      },
      giftHampersDeliverySection: {
        name: 'Shipping & delivery',
        description: globalDescription,
        policy: globalPolicy
      }
    }

    expect(resolveGiftHamperDeliveryPolicy(hamper)).toEqual({
      dispatchMinDays: 4,
      dispatchMaxDays: 6,
      shippingFeeGbp: 2.75,
      shippingDestinationCountry: 'GB',
      deliveryMethod: defaultDeliveryMethod
    })
  })

  it('uses custom policy when legacy policy source is custom and policy exists', () => {
    const hamper: GiftHamper = {
      ...baseHamper,
      deliverySection: {
        descriptionSource: 'global',
        policySource: 'custom',
        customPolicy: {
          dispatchMinDays: 4,
          dispatchMaxDays: 6,
          shippingFeeGbp: 2.75,
          shippingDestinationCountry: 'GB',
          deliveryMethod: defaultDeliveryMethod
        }
      },
      giftHampersDeliverySection: {
        name: 'Shipping & delivery',
        description: globalDescription,
        policy: globalPolicy
      }
    }

    expect(resolveGiftHamperDeliveryPolicy(hamper)).toEqual({
      dispatchMinDays: 4,
      dispatchMaxDays: 6,
      shippingFeeGbp: 2.75,
      shippingDestinationCountry: 'GB',
      deliveryMethod: defaultDeliveryMethod
    })
  })

  it('falls back to global description when custom source is selected without content', () => {
    const hamper: GiftHamper = {
      ...baseHamper,
      deliverySection: {
        descriptionSource: 'custom',
        customDescription: []
      },
      giftHampersDeliverySection: {
        name: 'Shipping & delivery',
        description: globalDescription
      }
    }

    expect(resolveGiftHamperDeliveryDescription(hamper)).toEqual(globalDescription)
  })

  it('falls back to title and legacy description when singleton content is missing', () => {
    const hamper: GiftHamper = {
      ...baseHamper
    }

    expect(resolveGiftHamperDeliveryTitle(hamper)).toBe(defaultGiftHamperDeliveryTitle)
    expect(resolveGiftHamperDeliveryDescription(hamper)).toEqual(fallbackGiftHamperDeliveryDescription)
    expect(resolveGiftHamperDeliveryPolicy(hamper)).toEqual(fallbackGiftHamperDeliveryPolicy)
  })

  it('treats unknown description source as global and keeps global content', () => {
    const hamper: GiftHamper = {
      ...baseHamper,
      deliverySection: {
        descriptionSource: 'unexpected-source' as unknown as 'global' | 'custom',
        customDescription
      },
      giftHampersDeliverySection: {
        name: 'Shipping & delivery',
        description: globalDescription
      }
    }

    expect(resolveGiftHamperDeliveryDescription(hamper)).toEqual(globalDescription)
  })

  it('omits shippingDetails when delivery day range in text conflicts with policy', () => {
    const hamper: GiftHamper = {
      ...baseHamper,
      deliverySection: {
        descriptionSource: 'custom',
        customDescription: [
          {
            _type: 'block',
            children: [
              {
                _type: 'span',
                text: 'We dispatch cake-by-post orders within 5-7 working days. Free UK shipping is included.'
              }
            ]
          }
        ]
      },
      giftHampersDeliverySection: {
        name: 'Shipping & delivery',
        description: globalDescription,
        policy: globalPolicy
      }
    }

    const resolved = resolveGiftHamperDeliveryContent(hamper)

    expect(resolved.shouldEmitShippingDetails).toBe(false)
    expect(resolved.shippingDetailsOmissionReason).toContain('delivery text says 5-7 days')
  })

  it('omits shippingDetails when text says free shipping but policy has a paid fee', () => {
    const hamper: GiftHamper = {
      ...baseHamper,
      deliverySection: {
        descriptionSource: 'custom',
        customDescription: [
          {
            _type: 'block',
            children: [
              {
                _type: 'span',
                text: 'Free UK shipping is included.'
              }
            ]
          }
        ]
      },
      giftHampersDeliverySection: {
        name: 'Shipping & delivery',
        description: globalDescription,
        policy: {
          ...globalPolicy,
          shippingFeeGbp: 6
        }
      }
    }

    const resolved = resolveGiftHamperDeliveryContent(hamper)

    expect(resolved.shouldEmitShippingDetails).toBe(false)
    expect(resolved.shippingDetailsOmissionReason).toContain('free shipping')
  })

  it('omits shippingDetails when delivery text is missing timing claim and policy country input is non-GB', () => {
    const hamper: GiftHamper = {
      ...baseHamper,
      deliverySection: {
        descriptionSource: 'custom',
        customDescription: [
          {
            _type: 'block',
            children: [
              {
                _type: 'span',
                text: 'Free UK shipping is included.'
              }
            ]
          }
        ]
      },
      giftHampersDeliverySection: {
        name: 'Shipping & delivery',
        description: globalDescription,
        policy: {
          ...globalPolicy,
          shippingDestinationCountry: 'DE'
        }
      }
    }

    const resolved = resolveGiftHamperDeliveryContent(hamper)

    expect(resolved.shouldEmitShippingDetails).toBe(false)
    expect(resolved.shippingDetailsOmissionReason).toContain('missing required claims')
    expect(resolved.shippingDetailsOmissionReason).toContain('timing')
  })

  it('omits shippingDetails when required delivery claims are incomplete without explicit mismatch', () => {
    const hamper: GiftHamper = {
      ...baseHamper,
      deliverySection: {
        descriptionSource: 'custom',
        customDescription: [
          {
            _type: 'block',
            children: [
              {
                _type: 'span',
                text: 'Free UK shipping is included.'
              }
            ]
          }
        ]
      },
      giftHampersDeliverySection: {
        name: 'Shipping & delivery',
        description: globalDescription,
        policy: globalPolicy
      }
    }

    const resolved = resolveGiftHamperDeliveryContent(hamper)

    expect(resolved.shouldEmitShippingDetails).toBe(false)
    expect(resolved.shippingDetailsOmissionReason).toContain('missing required claims')
    expect(resolved.shippingDetailsOmissionReason).toContain('timing')
  })

  it('omits shippingDetails when delivery text is ambiguous and makes no required claims', () => {
    const hamper: GiftHamper = {
      ...baseHamper,
      deliverySection: {
        descriptionSource: 'custom',
        customDescription: [
          {
            _type: 'block',
            children: [
              {
                _type: 'span',
                text: 'Delivery details are confirmed at checkout.'
              }
            ]
          }
        ]
      },
      giftHampersDeliverySection: {
        name: 'Shipping & delivery',
        description: globalDescription,
        policy: {
          ...globalPolicy,
          dispatchMinDays: 4,
          dispatchMaxDays: 6,
          shippingFeeGbp: 8
        }
      }
    }

    const resolved = resolveGiftHamperDeliveryContent(hamper)

    expect(resolved.shouldEmitShippingDetails).toBe(false)
    expect(resolved.shippingDetailsOmissionReason).toContain('missing required claims')
    expect(resolved.shippingDetailsOmissionReason).toContain('timing')
    expect(resolved.shippingDetailsOmissionReason).toContain('shipping-cost')
    expect(resolved.shippingDetailsOmissionReason).toContain('destination-country')
  })

  it('returns free-shipping fallback key point for zero shipping fee', () => {
    expect(getGiftHamperDeliveryFallbackKeyPoint({
      ...globalPolicy,
      shippingFeeGbp: 0
    })).toBe('Free UK shipping')
  })

  it('returns paid-shipping fallback key point for non-zero shipping fee', () => {
    expect(getGiftHamperDeliveryFallbackKeyPoint({
      ...globalPolicy,
      shippingFeeGbp: 6.25
    })).toBe('UK shipping from \u00A36.25')
  })

  it('returns country-aware fallback key points for non-GB policies', () => {
    expect(getGiftHamperDeliveryFallbackKeyPoint({
      ...globalPolicy,
      shippingDestinationCountry: 'DE',
      shippingFeeGbp: 0
    })).toBe('Free DE shipping')

    expect(getGiftHamperDeliveryFallbackKeyPoint({
      ...globalPolicy,
      shippingDestinationCountry: 'DE',
      shippingFeeGbp: 6.25
    })).toBe('DE shipping from \u00A36.25')
  })
})
