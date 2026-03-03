import { at, defineMigration, set } from 'sanity/migrate'

const servingsRows = [
  { priceField: 'servings2To4', defaultField: 'servings2To4IsDefault' },
  { priceField: 'servings4To8', defaultField: 'servings4To8IsDefault' },
  { priceField: 'servings8To12', defaultField: 'servings8To12IsDefault' },
  { priceField: 'servings12To20', defaultField: 'servings12To20IsDefault' },
  { priceField: 'servings20Plus', defaultField: 'servings20PlusIsDefault' }
] as const

type ServingsRow = typeof servingsRows[number]

function isValidPrice(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

function resolveDefaultRow(rows: ServingsRow[], pricingByServingsRecord: Record<string, unknown>) {
  const selectedMinimumDefaultRows = rows.filter((row) => {
    return pricingByServingsRecord[row.defaultField] === true
  })

  if (selectedMinimumDefaultRows.length === 1) {
    return selectedMinimumDefaultRows[0]
  }

  return rows[0]
}

export default defineMigration({
  title: 'Enforce cake serving default on lowest price',
  documentTypes: ['cake'],
  migrate: {
    document(doc) {
      const pricingByServings = doc.newDesignPricingByServings

      if (typeof pricingByServings !== 'object' || pricingByServings === null) {
        return
      }

      const pricingByServingsRecord = pricingByServings as Record<string, unknown>
      const pricedRows = servingsRows.filter((row) => {
        return isValidPrice(pricingByServingsRecord[row.priceField])
      })

      if (pricedRows.length === 0) {
        return
      }

      const minimumServingsPrice = Math.min(...pricedRows.map((row) => pricingByServingsRecord[row.priceField] as number))
      const minimumPricedRows = pricedRows.filter((row) => {
        return pricingByServingsRecord[row.priceField] === minimumServingsPrice
      })

      const defaultRowToKeep = resolveDefaultRow(minimumPricedRows, pricingByServingsRecord)

      return servingsRows.map((row) => {
        return at(
          `newDesignPricingByServings.${row.defaultField}`,
          set(row.defaultField === defaultRowToKeep.defaultField)
        )
      })
    }
  }
})