import type { CakePricing, CakePricingByServings } from '@/types/cake'

export type CakeServingsPriceKey =
  | 'servings2To4'
  | 'servings4To8'
  | 'servings8To12'
  | 'servings12To20'
  | 'servings20Plus'

export type CakeServingsDefaultFlagKey =
  | 'servings2To4IsDefault'
  | 'servings4To8IsDefault'
  | 'servings8To12IsDefault'
  | 'servings12To20IsDefault'
  | 'servings20PlusIsDefault'

interface CakeServingsRow {
  key: CakeServingsPriceKey
  defaultFlagKey: CakeServingsDefaultFlagKey
}

interface CakeServingsPricingOption extends CakeServingsRow {
  price: number
}

interface ResolveCakeBasePriceInput {
  newDesignPricingByServings?: CakePricingByServings
  pricing?: Partial<CakePricing>
}

const cakeServingsRows: CakeServingsRow[] = [
  { key: 'servings2To4', defaultFlagKey: 'servings2To4IsDefault' },
  { key: 'servings4To8', defaultFlagKey: 'servings4To8IsDefault' },
  { key: 'servings8To12', defaultFlagKey: 'servings8To12IsDefault' },
  { key: 'servings12To20', defaultFlagKey: 'servings12To20IsDefault' },
  { key: 'servings20Plus', defaultFlagKey: 'servings20PlusIsDefault' }
]

function isValidPrice(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

export function getCakeServingsPricingOptions(newDesignPricingByServings?: CakePricingByServings): CakeServingsPricingOption[] {
  if (!newDesignPricingByServings) {
    return []
  }

  return cakeServingsRows.flatMap((row) => {
    const maybePrice = newDesignPricingByServings[row.key]

    if (!isValidPrice(maybePrice)) {
      return []
    }

    return [{
      ...row,
      price: maybePrice
    }]
  })
}

function resolveCakeDefaultServingsOption(newDesignPricingByServings?: CakePricingByServings): CakeServingsPricingOption | null {
  const pricedServingsOptions = getCakeServingsPricingOptions(newDesignPricingByServings)

  if (pricedServingsOptions.length === 0) {
    return null
  }

  const minimumServingsPrice = Math.min(...pricedServingsOptions.map((servingsOption) => servingsOption.price))
  const minimumPricedServingsOptions = pricedServingsOptions.filter((servingsOption) => {
    return servingsOption.price === minimumServingsPrice
  })
  const explicitlyDefaultServingsOptions = minimumPricedServingsOptions.filter((servingsOption) => {
    return newDesignPricingByServings?.[servingsOption.defaultFlagKey] === true
  })

  if (explicitlyDefaultServingsOptions.length === 1) {
    return explicitlyDefaultServingsOptions[0]
  }

  if (explicitlyDefaultServingsOptions.length > 1) {
    return explicitlyDefaultServingsOptions[0]
  }

  return minimumPricedServingsOptions[0]
}

export function resolveCakeDefaultServingsKey(newDesignPricingByServings?: CakePricingByServings): CakeServingsPriceKey | null {
  return resolveCakeDefaultServingsOption(newDesignPricingByServings)?.key ?? null
}

export function resolveCakeBasePrice({
  newDesignPricingByServings,
  pricing
}: ResolveCakeBasePriceInput): number {
  const defaultServingsOption = resolveCakeDefaultServingsOption(newDesignPricingByServings)

  if (defaultServingsOption) {
    return defaultServingsOption.price
  }

  const validLegacyPrices = [pricing?.standard, pricing?.individual].filter((candidatePrice): candidatePrice is number => {
    return isValidPrice(candidatePrice)
  })
  if (validLegacyPrices.length > 0) {
    return Math.min(...validLegacyPrices)
  }

  return 0
}