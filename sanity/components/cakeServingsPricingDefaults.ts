export const cakeServingsRows = [
  {
    priceFieldName: 'servings2To4',
    defaultFieldName: 'servings2To4IsDefault',
    label: '2-4 people'
  },
  {
    priceFieldName: 'servings4To8',
    defaultFieldName: 'servings4To8IsDefault',
    label: '4-8 people'
  },
  {
    priceFieldName: 'servings8To12',
    defaultFieldName: 'servings8To12IsDefault',
    label: '8-12 people'
  },
  {
    priceFieldName: 'servings12To20',
    defaultFieldName: 'servings12To20IsDefault',
    label: '12-20 people'
  },
  {
    priceFieldName: 'servings20Plus',
    defaultFieldName: 'servings20PlusIsDefault',
    label: '20+ people'
  }
] as const

export type CakeServingsPriceFieldName = typeof cakeServingsRows[number]['priceFieldName']
export type CakeServingsDefaultFieldName = typeof cakeServingsRows[number]['defaultFieldName']

export interface CakeServingsPricingValue {
  servings2To4?: number
  servings4To8?: number
  servings8To12?: number
  servings12To20?: number
  servings20Plus?: number
  servings2To4IsDefault?: boolean
  servings4To8IsDefault?: boolean
  servings8To12IsDefault?: boolean
  servings12To20IsDefault?: boolean
  servings20PlusIsDefault?: boolean
}

export interface CakeServingsDefaultResolution {
  selectedDefaultFieldName: CakeServingsDefaultFieldName | null
  selectedDefaultsCount: number
  hasExactlyOneDefault: boolean
  minimumPricedDefaultFieldNames: CakeServingsDefaultFieldName[]
}

function isValidServingsPrice(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

export function getMinimumPricedDefaultFieldNames(
  value: CakeServingsPricingValue | undefined
): CakeServingsDefaultFieldName[] {
  if (!value) {
    return []
  }

  const pricedServingRows = cakeServingsRows.filter((row) => {
    return isValidServingsPrice(value[row.priceFieldName])
  })

  if (pricedServingRows.length === 0) {
    return []
  }

  const minimumServingsPrice = Math.min(
    ...pricedServingRows.map((row) => value[row.priceFieldName] as number)
  )

  return pricedServingRows
    .filter((row) => value[row.priceFieldName] === minimumServingsPrice)
    .map((row) => row.defaultFieldName)
}

export function resolveCakeServingsDefaultState(
  value: CakeServingsPricingValue | undefined
): CakeServingsDefaultResolution {
  const minimumPricedDefaultFieldNames = getMinimumPricedDefaultFieldNames(value)
  const selectedDefaultFieldNames = cakeServingsRows
    .filter((row) => value?.[row.defaultFieldName] === true)
    .map((row) => row.defaultFieldName)

  if (selectedDefaultFieldNames.length === 1) {
    return {
      selectedDefaultFieldName: selectedDefaultFieldNames[0],
      selectedDefaultsCount: 1,
      hasExactlyOneDefault: true,
      minimumPricedDefaultFieldNames
    }
  }

  return {
    selectedDefaultFieldName: null,
    selectedDefaultsCount: selectedDefaultFieldNames.length,
    hasExactlyOneDefault: false,
    minimumPricedDefaultFieldNames
  }
}

export function validateCakeServingsPricing(value: unknown): true | string {
  if (typeof value !== 'object' || value === null) {
    return 'New design pricing by servings is required.'
  }

  const pricingValue = value as CakeServingsPricingValue
  const configuredServingRows = cakeServingsRows.filter((row) => {
    return isValidServingsPrice(pricingValue[row.priceFieldName])
  })

  if (configuredServingRows.length === 0) {
    return 'Add at least one servings price.'
  }

  const selectedDefaultRows = cakeServingsRows.filter((row) => {
    return pricingValue[row.defaultFieldName] === true
  })

  if (selectedDefaultRows.length !== 1) {
    return 'Select exactly one default servings option.'
  }

  const selectedDefaultRow = selectedDefaultRows[0]
  if (!selectedDefaultRow) {
    return 'Select exactly one default servings option.'
  }

  const hasPriceForSelectedDefault = configuredServingRows.some((row) => {
    return row.defaultFieldName === selectedDefaultRow.defaultFieldName
  })

  if (!hasPriceForSelectedDefault) {
    return 'Default servings option must have a price.'
  }

  const minimumPricedDefaultFieldNames = getMinimumPricedDefaultFieldNames(pricingValue)

  if (!minimumPricedDefaultFieldNames.includes(selectedDefaultRow.defaultFieldName)) {
    return 'Default servings option must be one of the lowest-priced tiers.'
  }

  return true
}