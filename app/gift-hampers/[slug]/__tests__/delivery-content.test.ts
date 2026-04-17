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

const globalDescription: NonNullable<GiftHamper['description']> = [
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

const customDescription: NonNullable<GiftHamper['description']> = [
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

const globalPolicy = {
  dispatchMinDays: 2,
  dispatchMaxDays: 3,
  shippingFeeGbp: 0,
  shippingDestinationCountry: 'GB',
  deliveryMethod: defaultDeliveryMethod
}

const customPolicy = {
  dispatchMinDays: 4,
  dispatchMaxDays: 6,
  shippingFeeGbp: 3.5,
  shippingDestinationCountry: 'GB',
  deliveryMethod: defaultDeliveryMethod
}

const baseHamper: GiftHamper = {
  _id: 'hamper-1',
  _createdAt: '2025-01-01T00:00:00.000Z',
  name: 'Postal hamper',
  slug: {
    current: 'postal-hamper'
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
  price: 45
}

describe('gift hamper delivery-content', () => {
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

  it('uses custom description when description source is custom and content exists', () => {
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

  it('uses custom policy when description source is custom and policy exists', () => {
    const hamper: GiftHamper = {
      ...baseHamper,
      deliverySection: {
        descriptionSource: 'custom',
        customDescription,
        customPolicy
      },
      giftHampersDeliverySection: {
        name: 'Shipping & delivery',
        description: globalDescription,
        policy: globalPolicy
      }
    }

    expect(resolveGiftHamperDeliveryPolicy(hamper)).toEqual(customPolicy)
    expect(resolveGiftHamperDeliveryContent(hamper).policy).toEqual(customPolicy)
  })

  it('uses custom policy when legacy policy source is custom and policy exists', () => {
    const hamper: GiftHamper = {
      ...baseHamper,
      deliverySection: {
        descriptionSource: 'global',
        policySource: 'custom',
        customPolicy
      },
      giftHampersDeliverySection: {
        name: 'Shipping & delivery',
        description: globalDescription,
        policy: globalPolicy
      }
    }

    expect(resolveGiftHamperDeliveryPolicy(hamper)).toEqual(customPolicy)
    expect(resolveGiftHamperDeliveryContent(hamper).policy).toEqual(customPolicy)
  })

  it('falls back to the global policy when custom source is selected without a custom policy override', () => {
    const hamper: GiftHamper = {
      ...baseHamper,
      deliverySection: {
        descriptionSource: 'custom',
        customDescription
      },
      giftHampersDeliverySection: {
        name: 'Shipping & delivery',
        description: globalDescription,
        policy: globalPolicy
      }
    }

    expect(resolveGiftHamperDeliveryPolicy(hamper)).toEqual(globalPolicy)
  })

  it('falls back to the default title, description, and policy when singleton content is missing', () => {
    expect(resolveGiftHamperDeliveryTitle(baseHamper)).toBe(defaultGiftHamperDeliveryTitle)
    expect(resolveGiftHamperDeliveryDescription(baseHamper)).toEqual(fallbackGiftHamperDeliveryDescription)
    expect(resolveGiftHamperDeliveryPolicy(baseHamper)).toEqual(fallbackGiftHamperDeliveryPolicy)
  })

  it('returns shipping fallback key points for free and paid shipping', () => {
    expect(getGiftHamperDeliveryFallbackKeyPoint(globalPolicy)).toBe('Free UK shipping')
    expect(getGiftHamperDeliveryFallbackKeyPoint({
      ...globalPolicy,
      shippingFeeGbp: 4.5
    })).toBe('UK shipping from \u00A34.50')
  })
})
