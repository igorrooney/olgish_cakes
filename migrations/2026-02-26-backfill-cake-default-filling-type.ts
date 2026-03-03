import { at, defineMigration, set } from 'sanity/migrate'

function toBaseReferenceId(referenceId: string) {
  return referenceId.startsWith('drafts.')
    ? referenceId.slice('drafts.'.length)
    : referenceId
}

function getReferenceId(value: unknown) {
  if (typeof value !== 'object' || value === null) {
    return null
  }

  const maybeReference = value as { _ref?: unknown }

  return typeof maybeReference._ref === 'string' && maybeReference._ref.length > 0
    ? maybeReference._ref
    : null
}

export default defineMigration({
  title: 'Backfill cake default filling type',
  documentTypes: ['cake'],
  migrate: {
    document(doc) {
      const fillingTypes = Array.isArray(doc.fillingTypes)
        ? doc.fillingTypes
        : []

      const selectedReferenceIds = fillingTypes
        .map((fillingTypeReference) => getReferenceId(fillingTypeReference))
        .filter((referenceId): referenceId is string => referenceId !== null)

      if (selectedReferenceIds.length === 0) {
        return
      }

      const selectedBaseReferenceIds = new Set(
        selectedReferenceIds.map((referenceId) => toBaseReferenceId(referenceId))
      )

      const currentDefaultReferenceId = getReferenceId(doc.defaultFillingType)

      if (
        currentDefaultReferenceId &&
        selectedBaseReferenceIds.has(toBaseReferenceId(currentDefaultReferenceId))
      ) {
        return
      }

      const fallbackDefaultReferenceId = selectedReferenceIds[0]

      return at('defaultFillingType', set({
        _type: 'reference',
        _ref: fallbackDefaultReferenceId
      }))
    }
  }
})
