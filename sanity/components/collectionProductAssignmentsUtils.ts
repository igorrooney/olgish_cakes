export interface ProductReferenceValue {
  _key: string
  _type: 'reference'
  _ref: string
  _weak?: boolean
}

export interface RawProductDocument {
  _id: string
  _rev?: string
  name?: string
  collections?: Array<{
    _ref?: string
  }>
}

export interface ProductDocumentRecord {
  baseId: string
  name: string
  variantDocumentIds: string[]
  variantRevisionByDocumentId: Record<string, string>
  variantCollectionIdsByDocumentId: Record<string, string[]>
  collectionIds: string[]
}

export function normalizeDocumentId(documentId: string) {
  return documentId.startsWith('drafts.')
    ? documentId.slice('drafts.'.length)
    : documentId
}

export function createReferenceKey() {
  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function createReferenceValue(referenceId: string): ProductReferenceValue {
  return {
    _key: createReferenceKey(),
    _type: 'reference',
    _ref: referenceId
  }
}

export function isSameStringArray(firstArray: string[], secondArray: string[]) {
  if (firstArray.length !== secondArray.length) {
    return false
  }

  return firstArray.every((value, index) => value === secondArray[index])
}

export function toUniqueIds(values: string[]) {
  return Array.from(new Set(values))
}

export function toNormalizedReferenceIds(value: ProductReferenceValue[] | undefined) {
  return toUniqueIds(
    (value ?? [])
      .map((reference) => {
        if (typeof reference?._ref !== 'string' || reference._ref.length === 0) {
          return null
        }

        return normalizeDocumentId(reference._ref)
      })
      .filter((referenceId): referenceId is string => referenceId !== null)
  )
}

export function toNormalizedCollectionIds(references: RawProductDocument['collections']) {
  return toUniqueIds(
    (references ?? [])
      .map((reference) => {
        if (typeof reference?._ref !== 'string' || reference._ref.length === 0) {
          return null
        }

        return normalizeDocumentId(reference._ref)
      })
      .filter((referenceId): referenceId is string => referenceId !== null)
  )
}

function isDraftDocumentId(documentId: string) {
  return documentId.startsWith('drafts.')
}

export function mergeVariantCollectionIds(
  variantDocumentIds: string[],
  variantCollectionIdsByDocumentId: Record<string, string[]>
) {
  return toUniqueIds(
    variantDocumentIds.flatMap((documentId) => {
      return variantCollectionIdsByDocumentId[documentId] ?? []
    })
  )
}

export function applyCollectionSelectionToVariants(
  variantDocumentIds: string[],
  variantCollectionIdsByDocumentId: Record<string, string[]>,
  collectionBaseId: string,
  shouldSelectCollection: boolean
) {
  const nextVariantCollectionIdsByDocumentId: Record<string, string[]> = {}

  variantDocumentIds.forEach((documentId) => {
    const existingCollectionIds = variantCollectionIdsByDocumentId[documentId] ?? []
    const otherCollectionIds = existingCollectionIds.filter((referenceId) => {
      return referenceId !== collectionBaseId
    })
    const nextCollectionIds = shouldSelectCollection
      ? [...otherCollectionIds, collectionBaseId]
      : otherCollectionIds

    nextVariantCollectionIdsByDocumentId[documentId] = toUniqueIds(nextCollectionIds)
  })

  return {
    variantCollectionIdsByDocumentId: nextVariantCollectionIdsByDocumentId,
    collectionIds: mergeVariantCollectionIds(
      variantDocumentIds,
      nextVariantCollectionIdsByDocumentId
    )
  }
}

function sortProductsByNameUnsafe(products: ProductDocumentRecord[]) {
  return [...products].sort((firstDocument, secondDocument) => {
    return firstDocument.name.localeCompare(secondDocument.name)
  })
}

export function sortProductsByName(products: ProductDocumentRecord[]) {
  return sortProductsByNameUnsafe(products)
}

export function normalizeProductDocuments(rawDocuments: RawProductDocument[]) {
  const documentsByBaseId = new Map<string, ProductDocumentRecord>()

  rawDocuments.forEach((rawDocument) => {
    if (!rawDocument?._id) {
      return
    }

    const baseId = normalizeDocumentId(rawDocument._id)
    const normalizedName = typeof rawDocument.name === 'string'
      ? rawDocument.name.trim()
      : ''
    const normalizedCollectionIds = toNormalizedCollectionIds(rawDocument.collections)
    const hasDraftId = isDraftDocumentId(rawDocument._id)
    const normalizedRevision = typeof rawDocument._rev === 'string' && rawDocument._rev.length > 0
      ? rawDocument._rev
      : ''

    const existingDocument = documentsByBaseId.get(baseId)

    if (!existingDocument) {
      documentsByBaseId.set(baseId, {
        baseId,
        name: normalizedName.length > 0 ? normalizedName : `Untitled ${baseId}`,
        variantDocumentIds: [rawDocument._id],
        variantRevisionByDocumentId: normalizedRevision
          ? { [rawDocument._id]: normalizedRevision }
          : {},
        variantCollectionIdsByDocumentId: {
          [rawDocument._id]: normalizedCollectionIds
        },
        collectionIds: normalizedCollectionIds
      })
      return
    }

    if (!existingDocument.variantDocumentIds.includes(rawDocument._id)) {
      existingDocument.variantDocumentIds.push(rawDocument._id)
    }

    if (hasDraftId && normalizedName.length > 0) {
      existingDocument.name = normalizedName
    } else if (existingDocument.name.startsWith('Untitled ') && normalizedName.length > 0) {
      existingDocument.name = normalizedName
    }

    existingDocument.variantCollectionIdsByDocumentId = {
      ...existingDocument.variantCollectionIdsByDocumentId,
      [rawDocument._id]: normalizedCollectionIds
    }

    if (normalizedRevision) {
      existingDocument.variantRevisionByDocumentId = {
        ...existingDocument.variantRevisionByDocumentId,
        [rawDocument._id]: normalizedRevision
      }
    }

    existingDocument.collectionIds = mergeVariantCollectionIds(
      existingDocument.variantDocumentIds,
      existingDocument.variantCollectionIdsByDocumentId
    )
  })

  return sortProductsByNameUnsafe(Array.from(documentsByBaseId.values()))
}

export function toOrderedSelectedIds(selectedIds: Set<string>, products: ProductDocumentRecord[]) {
  return products
    .filter((product) => selectedIds.has(product.baseId))
    .map((product) => product.baseId)
}

function getPreferredReferenceId(productId: string, productsById: Map<string, ProductDocumentRecord>) {
  const product = productsById.get(productId)

  if (!product) {
    return productId
  }

  if (product.variantDocumentIds.includes(productId)) {
    return productId
  }

  const draftReferenceId = `drafts.${productId}`

  if (product.variantDocumentIds.includes(draftReferenceId)) {
    return draftReferenceId
  }

  return productId
}

export function createMirrorValue(
  selectedBaseIds: string[],
  currentValue: ProductReferenceValue[] | undefined,
  products: ProductDocumentRecord[]
) {
  const existingById = new Map<string, ProductReferenceValue>()

  ;(currentValue ?? []).forEach((reference) => {
    const referenceId = typeof reference?._ref === 'string'
      ? normalizeDocumentId(reference._ref)
      : ''

    if (!referenceId || existingById.has(referenceId)) {
      return
    }

    existingById.set(referenceId, reference)
  })

  const selectedSet = new Set(selectedBaseIds)
  const orderedIds = toOrderedSelectedIds(selectedSet, products)
  const productsById = new Map(products.map((product) => [product.baseId, product] as const))

  return orderedIds.map((productId) => {
    const existingReference = existingById.get(productId)
    const preferredReferenceId = getPreferredReferenceId(productId, productsById)

    if (existingReference) {
      return existingReference._ref === preferredReferenceId
        ? existingReference
        : { ...existingReference, _ref: preferredReferenceId }
    }

    return createReferenceValue(preferredReferenceId)
  })
}
