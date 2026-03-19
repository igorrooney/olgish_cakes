import {
  defaultCakeDeliveryTitle,
  fallbackCakeDeliveryDescription,
  fallbackCakeDeliveryPolicy,
  detectCakeDeliveryPolicyMismatch,
  getCakeDeliveryFallbackKeyPoint,
  resolveCakeDeliveryContent,
  resolveCakeDeliveryDescription,
  resolveCakeDeliveryPolicy,
  resolveCakeDeliveryTitle
} from '../delivery-content'
import { defaultDeliveryMethod } from '@/types/deliveryPolicy'
import type { Cake } from '@/types/cake'

const globalDescription: Cake['description'] = [
  {
    _type: 'block',
    children: [
      {
        _type: 'span',
        text: 'We usually prepare cake orders within 2-3 working days. Free UK delivery is included.'
      }
    ]
  }
]

const customDescription: Cake['description'] = [
  {
    _type: 'block',
    children: [
      {
        _type: 'span',
        text: 'Custom delivery description'
      }
    ]
  }
]

const baseCake: Cake = {
  _id: 'cake-1',
  _createdAt: '2025-01-01T00:00:00.000Z',
  name: 'Honey Cake',
  slug: {
    current: 'honey-cake'
  },
  description: [
    {
      _type: 'block',
      children: [
        {
          _type: 'span',
          text: 'Cake description'
        }
      ]
    }
  ],
  shortDescription: [],
  size: '8inch',
  pricing: {
    standard: 30,
    individual: 45
  },
  designs: {
    standard: [],
    individual: []
  },
  category: 'Traditional',
  ingredients: ['Flour'],
  allergens: ['Gluten']
}

describe('delivery-content', () => {
  const globalPolicy = {
    dispatchMinDays: 2,
    dispatchMaxDays: 3,
    shippingFeeGbp: 0,
    shippingDestinationCountry: 'GB',
    deliveryMethod: defaultDeliveryMethod
  }

  it('uses global delivery content by default', () => {
    const cake: Cake = {
      ...baseCake,
      cakesDeliverySection: {
        name: 'Shipping & delivery',
        description: globalDescription,
        policy: globalPolicy
      }
    }

    const resolvedPolicy = resolveCakeDeliveryPolicy(cake)
    const resolvedMismatch = detectCakeDeliveryPolicyMismatch(cake, resolvedPolicy)

    expect(resolveCakeDeliveryTitle(cake)).toBe('Shipping & delivery')
    expect(resolveCakeDeliveryDescription(cake)).toEqual(globalDescription)
    expect(resolvedPolicy).toEqual(globalPolicy)
    expect(resolvedMismatch).toEqual({
      shouldEmitShippingDetails: true
    })
    expect(resolveCakeDeliveryContent(cake)).toEqual({
      title: 'Shipping & delivery',
      description: globalDescription,
      policy: globalPolicy,
      shouldEmitShippingDetails: true,
      shippingDetailsOmissionReason: undefined,
      shippingDetailsVisibleClaims: {
        timing: true,
        shippingCost: true,
        destinationCountry: true,
        deliveryMethod: false
      }
    })
  })

  it('uses custom description when source is custom and content exists', () => {
    const cake: Cake = {
      ...baseCake,
      deliverySection: {
        descriptionSource: 'custom',
        customDescription
      },
      cakesDeliverySection: {
        name: 'Shipping & delivery',
        description: globalDescription
      }
    }

    expect(resolveCakeDeliveryTitle(cake)).toBe('Shipping & delivery')
    expect(resolveCakeDeliveryDescription(cake)).toEqual(customDescription)
  })

  it('uses custom policy when source is custom and policy exists', () => {
    const cake: Cake = {
      ...baseCake,
      deliverySection: {
        policySource: 'custom',
        customPolicy: {
          dispatchMinDays: 4,
          dispatchMaxDays: 6,
          shippingFeeGbp: 3.5,
          shippingDestinationCountry: 'GB',
          deliveryMethod: defaultDeliveryMethod
        }
      },
      cakesDeliverySection: {
        name: 'Shipping & delivery',
        description: globalDescription,
        policy: globalPolicy
      }
    }

    expect(resolveCakeDeliveryPolicy(cake)).toEqual({
      dispatchMinDays: 4,
      dispatchMaxDays: 6,
      shippingFeeGbp: 3.5,
      shippingDestinationCountry: 'GB',
      deliveryMethod: defaultDeliveryMethod
    })
  })

  it('falls back to global description when custom source is selected without content', () => {
    const cake: Cake = {
      ...baseCake,
      deliverySection: {
        descriptionSource: 'custom',
        customDescription: []
      },
      cakesDeliverySection: {
        name: 'Shipping & delivery',
        description: globalDescription
      }
    }

    expect(resolveCakeDeliveryDescription(cake)).toEqual(globalDescription)
  })

  it('falls back to title and legacy description when singleton content is missing', () => {
    const cake: Cake = {
      ...baseCake
    }

    expect(resolveCakeDeliveryTitle(cake)).toBe(defaultCakeDeliveryTitle)
    expect(resolveCakeDeliveryDescription(cake)).toEqual(fallbackCakeDeliveryDescription)
    expect(resolveCakeDeliveryPolicy(cake)).toEqual(fallbackCakeDeliveryPolicy)
  })

  it('treats unknown description source as global and keeps global content', () => {
    const cake: Cake = {
      ...baseCake,
      deliverySection: {
        descriptionSource: 'unexpected-source' as unknown as 'global' | 'custom',
        customDescription
      },
      cakesDeliverySection: {
        name: 'Shipping & delivery',
        description: globalDescription
      }
    }

    expect(resolveCakeDeliveryDescription(cake)).toEqual(globalDescription)
  })

  it('omits shippingDetails when delivery day range in text conflicts with policy', () => {
    const cake: Cake = {
      ...baseCake,
      deliverySection: {
        descriptionSource: 'custom',
        customDescription: [
          {
            _type: 'block',
            children: [
              {
                _type: 'span',
                text: 'We usually prepare cake orders within 5-7 working days. Free UK delivery is included.'
              }
            ]
          }
        ]
      },
      cakesDeliverySection: {
        name: 'Shipping & delivery',
        description: globalDescription,
        policy: globalPolicy
      }
    }

    const resolved = resolveCakeDeliveryContent(cake)

    expect(resolved.shouldEmitShippingDetails).toBe(false)
    expect(resolved.shippingDetailsOmissionReason).toContain('delivery text says 5-7 days')
  })

  it('omits shippingDetails when text says free shipping but policy has a paid fee', () => {
    const cake: Cake = {
      ...baseCake,
      deliverySection: {
        descriptionSource: 'custom',
        customDescription: [
          {
            _type: 'block',
            children: [
              {
                _type: 'span',
                text: 'Free UK delivery is included.'
              }
            ]
          }
        ]
      },
      cakesDeliverySection: {
        name: 'Shipping & delivery',
        description: globalDescription,
        policy: {
          ...globalPolicy,
          shippingFeeGbp: 5
        }
      }
    }

    const resolved = resolveCakeDeliveryContent(cake)

    expect(resolved.shouldEmitShippingDetails).toBe(false)
    expect(resolved.shippingDetailsOmissionReason).toContain('free shipping')
  })

  it('omits shippingDetails when delivery text is missing timing claim and policy country input is non-GB', () => {
    const cake: Cake = {
      ...baseCake,
      deliverySection: {
        descriptionSource: 'custom',
        customDescription: [
          {
            _type: 'block',
            children: [
              {
                _type: 'span',
                text: 'Free UK delivery is included.'
              }
            ]
          }
        ]
      },
      cakesDeliverySection: {
        name: 'Shipping & delivery',
        description: globalDescription,
        policy: {
          ...globalPolicy,
          shippingDestinationCountry: 'DE'
        }
      }
    }

    const resolved = resolveCakeDeliveryContent(cake)

    expect(resolved.shouldEmitShippingDetails).toBe(false)
    expect(resolved.shippingDetailsOmissionReason).toContain('missing required claims')
    expect(resolved.shippingDetailsOmissionReason).toContain('timing')
  })

  it('omits shippingDetails when required delivery claims are incomplete without explicit mismatch', () => {
    const cake: Cake = {
      ...baseCake,
      deliverySection: {
        descriptionSource: 'custom',
        customDescription: [
          {
            _type: 'block',
            children: [
              {
                _type: 'span',
                text: 'Free UK delivery is included.'
              }
            ]
          }
        ]
      },
      cakesDeliverySection: {
        name: 'Shipping & delivery',
        description: globalDescription,
        policy: globalPolicy
      }
    }

    const resolved = resolveCakeDeliveryContent(cake)

    expect(resolved.shouldEmitShippingDetails).toBe(false)
    expect(resolved.shippingDetailsOmissionReason).toContain('missing required claims')
    expect(resolved.shippingDetailsOmissionReason).toContain('timing')
  })

  it('omits shippingDetails when delivery text is ambiguous and makes no required claims', () => {
    const cake: Cake = {
      ...baseCake,
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
      cakesDeliverySection: {
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

    const resolved = resolveCakeDeliveryContent(cake)

    expect(resolved.shouldEmitShippingDetails).toBe(false)
    expect(resolved.shippingDetailsOmissionReason).toContain('missing required claims')
    expect(resolved.shippingDetailsOmissionReason).toContain('timing')
    expect(resolved.shippingDetailsOmissionReason).toContain('shipping-cost')
    expect(resolved.shippingDetailsOmissionReason).toContain('destination-country')
  })

  it('returns free-delivery fallback key point for zero shipping fee', () => {
    expect(getCakeDeliveryFallbackKeyPoint({
      ...globalPolicy,
      shippingFeeGbp: 0
    })).toBe('Free UK delivery')
  })

  it('returns paid-delivery fallback key point for non-zero shipping fee', () => {
    expect(getCakeDeliveryFallbackKeyPoint({
      ...globalPolicy,
      shippingFeeGbp: 4.5
    })).toBe('UK delivery from \u00A34.50')
  })

  it('returns country-aware fallback key points for non-GB policies', () => {
    expect(getCakeDeliveryFallbackKeyPoint({
      ...globalPolicy,
      shippingDestinationCountry: 'DE',
      shippingFeeGbp: 0
    })).toBe('Free DE delivery')

    expect(getCakeDeliveryFallbackKeyPoint({
      ...globalPolicy,
      shippingDestinationCountry: 'DE',
      shippingFeeGbp: 4.5
    })).toBe('DE delivery from \u00A34.50')
  })
})
