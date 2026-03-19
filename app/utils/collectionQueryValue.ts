export type CollectionQueryValueProductType = 'cake' | 'giftHamper'

interface CollectionQueryValueInput {
  _id: string
  name: string
}

function getProductPrefix(productType: CollectionQueryValueProductType) {
  return productType === 'cake' ? 'c' : 'h'
}

export function normalizeDocumentId(documentId: string) {
  return documentId.startsWith('drafts.')
    ? documentId.slice('drafts.'.length)
    : documentId
}

function normalizeQueryValueSegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['\u2019]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function toShortDocumentId(documentId: string) {
  return normalizeDocumentId(documentId)
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 8)
    .toLowerCase()
}

function toStableDocumentSegment(documentId: string) {
  const stableSegment = normalizeDocumentId(documentId)
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase()
    .slice(0, 16)

  if (stableSegment.length > 0) {
    return stableSegment
  }

  return toShortDocumentId(documentId)
}

function createCollectionQueryValue(
  collectionId: string,
  label: string,
  productType: CollectionQueryValueProductType
) {
  const prefix = getProductPrefix(productType)
  const slug = normalizeQueryValueSegment(label).slice(0, 40)

  if (slug.length > 0) {
    return `${prefix}-${slug}`
  }

  return `${prefix}-${toShortDocumentId(collectionId)}`
}

function createUniqueQueryValue(
  baseQueryValue: string,
  fallbackIdSegment: string,
  usedQueryValues: Set<string>
) {
  let queryValue = baseQueryValue
  let suffix = 1

  while (usedQueryValues.has(queryValue)) {
    const duplicateSuffix = suffix === 1 ? fallbackIdSegment : `${fallbackIdSegment}-${suffix}`
    queryValue = `${baseQueryValue}-${duplicateSuffix}`
    suffix += 1
  }

  usedQueryValues.add(queryValue)
  return queryValue
}

export function createCollectionQueryValueMap(
  collections: CollectionQueryValueInput[],
  productType: CollectionQueryValueProductType
) {
  const usedQueryValues = new Set<string>()
  const queryValueById = new Map<string, string>()

  collections.forEach((collection) => {
    const normalizedId = normalizeDocumentId(collection._id)
    const label = collection.name.trim()

    if (label.length === 0) {
      return
    }

    const baseQueryValue = createCollectionQueryValue(
      normalizedId,
      label,
      productType
    )
    const queryValue = createUniqueQueryValue(
      baseQueryValue,
      toShortDocumentId(normalizedId),
      usedQueryValues
    )

    queryValueById.set(normalizedId, queryValue)
  })

  return queryValueById
}

export function createCollectionIdByQueryValueMap(
  collections: CollectionQueryValueInput[],
  productType: CollectionQueryValueProductType
) {
  const queryValueById = createCollectionQueryValueMap(collections, productType)
  const collectionIdByQueryValue = new Map<string, string>()

  collections.forEach((collection) => {
    const normalizedId = normalizeDocumentId(collection._id)
    const queryValue = queryValueById.get(normalizedId)

    if (!queryValue) {
      return
    }

    collectionIdByQueryValue.set(queryValue, normalizedId)
    collectionIdByQueryValue.set(normalizedId, normalizedId)
    const stableIdAlias = `${getProductPrefix(productType)}-${toStableDocumentSegment(normalizedId)}`

    if (!collectionIdByQueryValue.has(stableIdAlias)) {
      collectionIdByQueryValue.set(stableIdAlias, normalizedId)
    }
  })

  return collectionIdByQueryValue
}
