import { at, defineMigration, set } from 'sanity/migrate'

const preferredDefaultField = 'servings4To8IsDefault'
const orderedDefaultFields = [
  preferredDefaultField,
  'servings2To4IsDefault',
  'servings8To12IsDefault',
  'servings12To20IsDefault',
  'servings20PlusIsDefault'
] as const

export default defineMigration({
  title: 'Backfill cake serving defaults',
  documentTypes: ['cake'],
  migrate: {
    document(doc) {
      const pricingByServings = doc.newDesignPricingByServings

      if (typeof pricingByServings !== 'object' || pricingByServings === null) {
        return
      }

      const pricingByServingsRecord = pricingByServings as Record<string, unknown>
      const selectedDefaultFields = orderedDefaultFields.filter((fieldName) => {
        return pricingByServingsRecord[fieldName] === true
      })

      if (selectedDefaultFields.length === 1) {
        return
      }

      const defaultFieldToKeep = selectedDefaultFields.length > 0
        ? (selectedDefaultFields.includes(preferredDefaultField)
            ? preferredDefaultField
            : selectedDefaultFields[0])
        : preferredDefaultField

      return orderedDefaultFields.map((fieldName) => {
        return at(
          `newDesignPricingByServings.${fieldName}`,
          set(fieldName === defaultFieldToKeep)
        )
      })
    }
  }
})
