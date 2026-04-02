import {
  getMinimumPricedDefaultFieldNames,
  resolveCakeServingsDefaultState,
  validateCakeServingsPricing
} from '../cakeServingsPricingDefaults'

describe('resolveCakeServingsDefaultState', () => {
  it('returns selected default when exactly one default flag is true', () => {
    const result = resolveCakeServingsDefaultState({
      servings2To4: 30,
      servings4To8: 45,
      servings2To4IsDefault: false,
      servings4To8IsDefault: true,
      servings8To12IsDefault: false,
      servings12To20IsDefault: false,
      servings20PlusIsDefault: false
    })

    expect(result).toEqual({
      selectedDefaultFieldName: 'servings4To8IsDefault',
      selectedDefaultsCount: 1,
      hasExactlyOneDefault: true,
      minimumPricedDefaultFieldNames: ['servings2To4IsDefault']
    })
  })

  it('returns invalid state when no default flags are true', () => {
    const result = resolveCakeServingsDefaultState({
      servings2To4: 30,
      servings4To8: 45,
      servings2To4IsDefault: false,
      servings4To8IsDefault: false,
      servings8To12IsDefault: false,
      servings12To20IsDefault: false,
      servings20PlusIsDefault: false
    })

    expect(result).toEqual({
      selectedDefaultFieldName: null,
      selectedDefaultsCount: 0,
      hasExactlyOneDefault: false,
      minimumPricedDefaultFieldNames: ['servings2To4IsDefault']
    })
  })

  it('returns invalid state when multiple default flags are true', () => {
    const result = resolveCakeServingsDefaultState({
      servings2To4: 30,
      servings4To8: 45,
      servings2To4IsDefault: true,
      servings4To8IsDefault: false,
      servings8To12IsDefault: true,
      servings12To20IsDefault: false,
      servings20PlusIsDefault: false
    })

    expect(result).toEqual({
      selectedDefaultFieldName: null,
      selectedDefaultsCount: 2,
      hasExactlyOneDefault: false,
      minimumPricedDefaultFieldNames: ['servings2To4IsDefault']
    })
  })
})

describe('getMinimumPricedDefaultFieldNames', () => {
  it('returns all minimum-priced serving tiers in serving order', () => {
    const result = getMinimumPricedDefaultFieldNames({
      servings2To4: 30,
      servings4To8: 30,
      servings8To12: 45
    })

    expect(result).toEqual(['servings2To4IsDefault', 'servings4To8IsDefault'])
  })
})

describe('validateCakeServingsPricing', () => {
  it('returns an error when all serving prices are missing', () => {
    const result = validateCakeServingsPricing({
      servings2To4IsDefault: false,
      servings4To8IsDefault: true,
      servings8To12IsDefault: false,
      servings12To20IsDefault: false,
      servings20PlusIsDefault: false
    })

    expect(result).toBe('Add at least one servings price.')
  })

  it('returns an error when default serving has no price', () => {
    const result = validateCakeServingsPricing({
      servings4To8: 45,
      servings2To4IsDefault: true,
      servings4To8IsDefault: false,
      servings8To12IsDefault: false,
      servings12To20IsDefault: false,
      servings20PlusIsDefault: false
    })

    expect(result).toBe('Default servings option must have a price.')
  })

  it('returns an error when default serving is not the minimum-priced tier', () => {
    const result = validateCakeServingsPricing({
      servings2To4: 30,
      servings4To8: 45,
      servings2To4IsDefault: false,
      servings4To8IsDefault: true,
      servings8To12IsDefault: false,
      servings12To20IsDefault: false,
      servings20PlusIsDefault: false
    })

    expect(result).toBe('Default servings option must be one of the lowest-priced tiers.')
  })

  it('returns true when minimum tier is selected as default', () => {
    const result = validateCakeServingsPricing({
      servings2To4: 30,
      servings4To8: 45,
      servings2To4IsDefault: true,
      servings4To8IsDefault: false,
      servings8To12IsDefault: false,
      servings12To20IsDefault: false,
      servings20PlusIsDefault: false
    })

    expect(result).toBe(true)
  })

  it('returns true when one equal-minimum tier is selected as default', () => {
    const result = validateCakeServingsPricing({
      servings2To4: 30,
      servings4To8: 30,
      servings8To12: 45,
      servings2To4IsDefault: false,
      servings4To8IsDefault: true,
      servings8To12IsDefault: false,
      servings12To20IsDefault: false,
      servings20PlusIsDefault: false
    })

    expect(result).toBe(true)
  })
})
