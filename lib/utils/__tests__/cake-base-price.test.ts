import {
  getCakeServingsPricingOptions,
  resolveCakeBasePrice,
  resolveCakeDefaultServingsKey
} from '../cake-base-price'

describe('cake-base-price', () => {
  it('returns minimum servings price even when a higher tier is flagged default', () => {
    const resolvedPrice = resolveCakeBasePrice({
      pricing: {
        standard: 30,
        individual: 45
      },
      newDesignPricingByServings: {
        servings2To4: 30,
        servings4To8: 45,
        servings8To12: 60,
        servings2To4IsDefault: false,
        servings4To8IsDefault: false,
        servings8To12IsDefault: true
      }
    })

    expect(resolvedPrice).toBe(30)
  })

  it('uses flagged default when multiple servings share minimum price', () => {
    const resolvedPrice = resolveCakeBasePrice({
      pricing: {
        standard: 30,
        individual: 45
      },
      newDesignPricingByServings: {
        servings2To4: 30,
        servings4To8: 30,
        servings8To12: 60,
        servings2To4IsDefault: false,
        servings4To8IsDefault: true,
        servings8To12IsDefault: false
      }
    })

    expect(resolvedPrice).toBe(30)
    expect(resolveCakeDefaultServingsKey({
      servings2To4: 30,
      servings4To8: 30,
      servings8To12: 60,
      servings2To4IsDefault: false,
      servings4To8IsDefault: true,
      servings8To12IsDefault: false
    })).toBe('servings4To8')
  })

  it('uses first serving order among minimum tiers when minimum tiers have no default', () => {
    const resolvedPrice = resolveCakeBasePrice({
      pricing: {
        standard: 30,
        individual: 45
      },
      newDesignPricingByServings: {
        servings2To4: 25,
        servings4To8: 25,
        servings8To12: 60,
        servings2To4IsDefault: false,
        servings4To8IsDefault: false,
        servings8To12IsDefault: true
      }
    })

    expect(resolvedPrice).toBe(25)
    expect(resolveCakeDefaultServingsKey({
      servings2To4: 25,
      servings4To8: 25,
      servings8To12: 60,
      servings2To4IsDefault: false,
      servings4To8IsDefault: false,
      servings8To12IsDefault: true
    })).toBe('servings2To4')
  })

  it('uses first serving order when multiple minimum tiers are flagged as default', () => {
    const servingsKey = resolveCakeDefaultServingsKey({
      servings2To4: 25,
      servings4To8: 25,
      servings8To12: 60,
      servings2To4IsDefault: true,
      servings4To8IsDefault: true,
      servings8To12IsDefault: false
    })

    expect(servingsKey).toBe('servings2To4')
  })

  it('falls back to minimum legacy price when no servings pricing is available', () => {
    const resolvedPrice = resolveCakeBasePrice({
      pricing: {
        standard: 32,
        individual: 29
      },
      newDesignPricingByServings: undefined
    })

    expect(resolvedPrice).toBe(29)
  })

  it('falls back to valid legacy individual price when standard is invalid', () => {
    const resolvedPrice = resolveCakeBasePrice({
      pricing: {
        standard: Number.NaN,
        individual: 49
      },
      newDesignPricingByServings: undefined
    })

    expect(resolvedPrice).toBe(49)
  })

  it('returns 0 when no valid servings or legacy prices are available', () => {
    const resolvedPrice = resolveCakeBasePrice({
      pricing: {
        standard: Number.NaN,
        individual: Number.NaN
      },
      newDesignPricingByServings: {
        servings2To4: Number.NaN
      }
    })

    expect(resolvedPrice).toBe(0)
  })

  it('returns null default servings key when no priced options are configured', () => {
    const servingsKey = resolveCakeDefaultServingsKey({
      servings2To4IsDefault: true,
      servings4To8IsDefault: false
    })

    expect(servingsKey).toBeNull()
  })

  it('returns only numeric servings options', () => {
    const servingsOptions = getCakeServingsPricingOptions({
      servings2To4: 30,
      servings4To8: Number.NaN,
      servings8To12: 60,
      servings12To20: -10,
      servings20Plus: 90
    })

    expect(servingsOptions.map((servingsOption) => servingsOption.key)).toEqual([
      'servings2To4',
      'servings8To12',
      'servings20Plus'
    ])
  })
})