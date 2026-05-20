import {
  detectDeliveryPolicyMismatch,
  extractDeliveryPolicyVisibleClaims,
  getMissingRequiredShippingDetailsClaimLabels,
  getDeliveryCountryLabel,
  hasRequiredShippingDetailsVisibleClaims,
  normalizeDeliveryPolicy
} from '../delivery-policy'
import { defaultDeliveryMethod } from '@/types/deliveryPolicy'

describe('delivery-policy', () => {
  const defaultPolicy = {
    dispatchMinDays: 2,
    dispatchMaxDays: 3,
    shippingFeeGbp: 0,
    shippingDestinationCountry: 'GB',
    deliveryMethod: defaultDeliveryMethod
  }

  it('keeps shippingDetails when currency appears outside delivery context', () => {
    const mismatch = detectDeliveryPolicyMismatch(
      'Our cakes start from \u00A330. We dispatch in 2-3 working days and UK delivery is \u00A30.',
      defaultPolicy
    )

    expect(mismatch).toEqual({
      shouldEmitShippingDetails: true
    })
  })

  it('omits shippingDetails when delivery context includes a paid currency claim', () => {
    const mismatch = detectDeliveryPolicyMismatch(
      'Dispatch in 2-3 working days. UK delivery is \u00A35.',
      defaultPolicy
    )

    expect(mismatch.shouldEmitShippingDetails).toBe(false)
    expect(mismatch.reason).toContain('paid shipping')
  })

  it('omits shippingDetails when delivery text says "delivery is free" but policy fee is paid', () => {
    const mismatch = detectDeliveryPolicyMismatch(
      'Dispatch in 2-3 working days. UK delivery is free.',
      {
        ...defaultPolicy,
        shippingFeeGbp: 5
      }
    )

    expect(mismatch.shouldEmitShippingDetails).toBe(false)
    expect(mismatch.reason).toContain('free shipping')
  })

  it('omits shippingDetails when delivery context includes a zero-fee shipping claim but policy is paid', () => {
    const mismatch = detectDeliveryPolicyMismatch(
      'Dispatch in 2-3 working days. UK shipping is \u00A30.',
      {
        ...defaultPolicy,
        shippingFeeGbp: 4
      }
    )

    expect(mismatch.shouldEmitShippingDetails).toBe(false)
    expect(mismatch.reason).toContain('free shipping')
  })

  it('keeps shippingDetails when paid shipping claim matches paid policy', () => {
    const mismatch = detectDeliveryPolicyMismatch(
      'Dispatch in 2-3 working days. UK delivery is \u00A36.',
      {
        ...defaultPolicy,
        shippingFeeGbp: 6
      }
    )

    expect(mismatch).toEqual({
      shouldEmitShippingDetails: true
    })
  })

  it('keeps shippingDetails when free shipping text includes an order-threshold amount', () => {
    const mismatch = detectDeliveryPolicyMismatch(
      'Dispatch in 2-3 working days. Free UK delivery on orders over \u00A340.',
      defaultPolicy
    )

    expect(mismatch).toEqual({
      shouldEmitShippingDetails: true
    })
  })

  it('omits shippingDetails when explicit delivery fee in text differs from policy fee', () => {
    const mismatch = detectDeliveryPolicyMismatch(
      'Dispatch in 2-3 working days. UK delivery is \u00A35.',
      {
        ...defaultPolicy,
        shippingFeeGbp: 6
      }
    )

    expect(mismatch.shouldEmitShippingDetails).toBe(false)
    expect(mismatch.reason).toContain('shipping fee \u00A35')
    expect(mismatch.reason).toContain('policy fee is \u00A36')
  })

  it('keeps shippingDetails when explicit delivery fee in text matches policy fee within tolerance', () => {
    const mismatch = detectDeliveryPolicyMismatch(
      'Dispatch in 2-3 working days. UK delivery is \u00A36.00.',
      {
        ...defaultPolicy,
        shippingFeeGbp: 6
      }
    )

    expect(mismatch).toEqual({
      shouldEmitShippingDetails: true
    })
  })

  it('omits shippingDetails when business-day range in text conflicts with policy', () => {
    const mismatch = detectDeliveryPolicyMismatch(
      'Dispatch in 4-6 business days. Free UK delivery is included.',
      defaultPolicy
    )

    expect(mismatch.shouldEmitShippingDetails).toBe(false)
    expect(mismatch.reason).toContain('4-6 days')
  })

  it('keeps shippingDetails when non-delivery day mention appears outside delivery context', () => {
    const mismatch = detectDeliveryPolicyMismatch(
      'Cake stays fresh for 4-6 days. We dispatch in 2-3 working days and UK delivery is \u00A30.',
      defaultPolicy
    )

    expect(mismatch).toEqual({
      shouldEmitShippingDetails: true
    })
  })

  it('keeps shippingDetails when order lead-time text is separate from delivery policy claims', () => {
    const mismatch = detectDeliveryPolicyMismatch(
      'Please place your order 7 days in advance for custom designs. We dispatch in 2-3 working days. Free UK delivery is included.',
      defaultPolicy
    )

    expect(mismatch).toEqual({
      shouldEmitShippingDetails: true
    })
  })

  it('omits shippingDetails when delivery text has no required claims', () => {
    const mismatch = detectDeliveryPolicyMismatch(
      'Please add any additional delivery notes in your order request.',
      defaultPolicy
    )

    expect(mismatch.shouldEmitShippingDetails).toBe(false)
    expect(mismatch.reason).toContain('missing required claims')
  })

  it('keeps shippingDetails when policy country input is non-GB (normalized to GB)', () => {
    const mismatch = detectDeliveryPolicyMismatch(
      'Dispatch in 2-3 working days. Free UK delivery is included.',
      {
        ...defaultPolicy,
        shippingDestinationCountry: 'DE'
      }
    )

    expect(mismatch).toEqual({
      shouldEmitShippingDetails: true
    })
  })

  it('omits shippingDetails when delivery text explicitly claims a non-UK country', () => {
    const mismatch = detectDeliveryPolicyMismatch(
      'Dispatch in 2-3 working days. Free DE delivery is included.',
      defaultPolicy
    )

    expect(mismatch.shouldEmitShippingDetails).toBe(false)
    expect(mismatch.reason).toContain('policy destination is GB')
  })

  it('omits shippingDetails when delivery text explicitly claims a lowercase non-UK country', () => {
    const mismatch = detectDeliveryPolicyMismatch(
      'Dispatch in 2-3 working days. Free de delivery is included.',
      defaultPolicy
    )

    expect(mismatch.shouldEmitShippingDetails).toBe(false)
    expect(mismatch.reason).toContain('policy destination is GB')
  })

  it('omits shippingDetails when only delivery-method claim is present', () => {
    const mismatch = detectDeliveryPolicyMismatch(
      'By post delivery is available in summer.',
      defaultPolicy
    )

    expect(mismatch.shouldEmitShippingDetails).toBe(false)
    expect(mismatch.reason).toContain('missing required claims')
  })

  it('omits shippingDetails when destination country is not explicitly visible in delivery text', () => {
    const mismatch = detectDeliveryPolicyMismatch(
      'Made in the UK with traditional methods. Free delivery is included.',
      {
        ...defaultPolicy,
        shippingDestinationCountry: 'DE'
      }
    )

    expect(mismatch.shouldEmitShippingDetails).toBe(false)
    expect(mismatch.reason).toContain('destination-country')
  })

  it('omits shippingDetails when delivery text has no explicit policy claims', () => {
    const mismatch = detectDeliveryPolicyMismatch(
      'Delivery details are confirmed at checkout.',
      {
        ...defaultPolicy,
        shippingDestinationCountry: 'DE'
      }
    )

    expect(mismatch.shouldEmitShippingDetails).toBe(false)
    expect(mismatch.reason).toContain('missing required claims')
  })

  it('omits shippingDetails when delivery text says pickup/collection but policy is mail', () => {
    const mismatch = detectDeliveryPolicyMismatch(
      'Collection only from our Leeds studio.',
      defaultPolicy
    )

    expect(mismatch.shouldEmitShippingDetails).toBe(false)
    expect(mismatch.reason).toContain('collection/pickup')
  })

  it('formats delivery country label from policy country code', () => {
    expect(getDeliveryCountryLabel('gb')).toBe('UK')
    expect(getDeliveryCountryLabel('de')).toBe('DE')
  })

  it('normalizes lowercase UK country code to GB', () => {
    const normalizedPolicy = normalizeDeliveryPolicy({
      ...defaultPolicy,
      shippingDestinationCountry: 'uk'
    })

    expect(normalizedPolicy.shippingDestinationCountry).toBe('GB')
  })

  it('normalizes dotted UK country code variant to GB', () => {
    const normalizedPolicy = normalizeDeliveryPolicy({
      ...defaultPolicy,
      shippingDestinationCountry: 'U.K.'
    })

    expect(normalizedPolicy.shippingDestinationCountry).toBe('GB')
  })

  it('falls back to GB when country code is malformed', () => {
    const normalizedPolicy = normalizeDeliveryPolicy({
      ...defaultPolicy,
      shippingDestinationCountry: 'United Kingdom'
    })

    expect(normalizedPolicy.shippingDestinationCountry).toBe('GB')
  })

  it('keeps shippingDetails for UK delivery text when policy country is UK alias', () => {
    const mismatch = detectDeliveryPolicyMismatch(
      'Dispatch in 2-3 working days. Free UK delivery is included.',
      {
        ...defaultPolicy,
        shippingDestinationCountry: 'UK'
      }
    )

    expect(mismatch).toEqual({
      shouldEmitShippingDetails: true
    })
  })

  it('falls back to default delivery method when policy method is not supported', () => {
    const normalizedPolicy = normalizeDeliveryPolicy({
      ...defaultPolicy,
      deliveryMethod: 'https://example.com/custom-delivery-method'
    })

    expect(normalizedPolicy.deliveryMethod).toBe(defaultDeliveryMethod)
  })

  it('returns empty visible claims when delivery text has no explicit policy signals', () => {
    const visibleClaims = extractDeliveryPolicyVisibleClaims(
      'Delivery details are confirmed at checkout.'
    )

    expect(visibleClaims).toEqual({
      timing: false,
      shippingCost: false,
      destinationCountry: false,
      deliveryMethod: false
    })
  })

  it('returns explicit visible claims for timing, cost, destination and method', () => {
    const visibleClaims = extractDeliveryPolicyVisibleClaims(
      'Cake-by-post dispatch in 2-3 working days with free UK shipping.'
    )

    expect(visibleClaims).toEqual({
      timing: true,
      shippingCost: true,
      destinationCountry: true,
      deliveryMethod: true
    })
  })

  it('extracts destination-country claim for non-UK ISO delivery text', () => {
    const visibleClaims = extractDeliveryPolicyVisibleClaims(
      'Free DE delivery is included.'
    )

    expect(visibleClaims).toEqual({
      timing: false,
      shippingCost: true,
      destinationCountry: true,
      deliveryMethod: false
    })
  })

  it('does not treat ambiguous lowercase words as destination-country claims', () => {
    const visibleClaims = extractDeliveryPolicyVisibleClaims(
      'Delivery is free and dispatch is in 2-3 working days.'
    )

    expect(visibleClaims).toEqual({
      timing: true,
      shippingCost: true,
      destinationCountry: false,
      deliveryMethod: false
    })
  })

  it('reports missing required visible claims for shipping details emission', () => {
    expect(hasRequiredShippingDetailsVisibleClaims({
      timing: true,
      shippingCost: true,
      destinationCountry: true,
      deliveryMethod: false
    })).toBe(true)

    expect(getMissingRequiredShippingDetailsClaimLabels({
      timing: false,
      shippingCost: true,
      destinationCountry: false,
      deliveryMethod: false
    })).toEqual(['timing', 'destination-country'])

    expect(hasRequiredShippingDetailsVisibleClaims({
      timing: false,
      shippingCost: true,
      destinationCountry: false,
      deliveryMethod: true
    })).toBe(false)
  })
})
