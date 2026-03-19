import {
  applyCollectionSelectionToVariants,
  createReferenceValue,
  normalizeProductDocuments,
  sortProductsByName,
  toUniqueIds,
  type ProductDocumentRecord,
  type ProductReferenceValue,
  type RawProductDocument
} from './collectionProductAssignmentsUtils'

interface CollectionAssignmentsPatch {
  ifRevisionId: (revisionId: string) => CollectionAssignmentsPatch
  set: (attributes: { collections: ProductReferenceValue[] }) => CollectionAssignmentsPatch
  unset: (attributes: string[]) => CollectionAssignmentsPatch
}

interface CollectionAssignmentsTransaction {
  patch: (
    documentId: string,
    patchBuilder: (patch: CollectionAssignmentsPatch) => CollectionAssignmentsPatch
  ) => CollectionAssignmentsTransaction
  commit: () => Promise<unknown>
}

export interface CollectionAssignmentsSyncClient {
  fetch: <T>(query: string, params?: Record<string, unknown>) => Promise<T>
  transaction: () => CollectionAssignmentsTransaction
}

interface SanityMutationError {
  statusCode?: number
  status?: number
  message?: string
  details?: {
    type?: string
    description?: string
  }
  responseBody?: {
    error?: {
      type?: string
      description?: string
    }
  }
}

export interface SyncCollectionAssignmentsWithRetryParams {
  client: CollectionAssignmentsSyncClient
  products: ProductDocumentRecord[]
  nextSelectedIdsSet: Set<string>
  collectionBaseId: string
  refreshByIdsQuery: string
}

export interface SyncCollectionAssignmentsWithRetryResult {
  nextProducts: ProductDocumentRecord[]
  changedProductIds: string[]
}

function getChangedProductIds(
  products: ProductDocumentRecord[],
  nextSelectedIdsSet: Set<string>,
  collectionBaseId: string
) {
  return products
    .filter((product) => {
      const shouldBeSelected = nextSelectedIdsSet.has(product.baseId)

      if (product.variantDocumentIds.length === 0) {
        const hasSelectedCollection = product.collectionIds.includes(collectionBaseId)
        return hasSelectedCollection !== shouldBeSelected
      }

      return product.variantDocumentIds.some((documentId) => {
        const variantCollectionIds = product.variantCollectionIdsByDocumentId[documentId] ?? []
        const hasSelectedCollection = variantCollectionIds.includes(collectionBaseId)

        return hasSelectedCollection !== shouldBeSelected
      })
    })
    .map((product) => product.baseId)
}

function getChangedVariantDocumentIds(products: ProductDocumentRecord[], changedProductIds: string[]) {
  const changedProductIdsSet = new Set(changedProductIds)

  return toUniqueIds(
    products
      .filter((product) => changedProductIdsSet.has(product.baseId))
      .flatMap((product) => product.variantDocumentIds)
  )
}

function mergeRefreshedProducts(
  currentProducts: ProductDocumentRecord[],
  refreshedProducts: ProductDocumentRecord[]
) {
  const refreshedByBaseId = new Map(
    refreshedProducts.map((product) => [product.baseId, product] as const)
  )

  const mergedProducts = currentProducts.map((product) => {
    return refreshedByBaseId.get(product.baseId) ?? product
  })

  return sortProductsByName(mergedProducts)
}

function applySelectionToProducts(
  products: ProductDocumentRecord[],
  changedProductIds: string[],
  nextSelectedIdsSet: Set<string>,
  collectionBaseId: string
) {
  const changedProductIdsSet = new Set(changedProductIds)

  if (changedProductIdsSet.size === 0) {
    return products
  }

  const nextProducts = products.map((product) => {
    if (!changedProductIdsSet.has(product.baseId)) {
      return product
    }

    const nextProductCollections = applyCollectionSelectionToVariants(
      product.variantDocumentIds,
      product.variantCollectionIdsByDocumentId,
      collectionBaseId,
      nextSelectedIdsSet.has(product.baseId)
    )

    return {
      ...product,
      variantCollectionIdsByDocumentId: nextProductCollections.variantCollectionIdsByDocumentId,
      collectionIds: nextProductCollections.collectionIds
    }
  })

  return sortProductsByName(nextProducts)
}

function getErrorDescription(error: SanityMutationError) {
  const parts = [
    error.message,
    error.details?.description,
    error.details?.type,
    error.responseBody?.error?.description,
    error.responseBody?.error?.type
  ].filter((value): value is string => typeof value === 'string')

  return parts.join(' ').toLowerCase()
}

export function isRevisionConflictError(error: unknown) {
  if (typeof error !== 'object' || error === null) {
    return false
  }

  const mutationError = error as SanityMutationError
  const statusCode = mutationError.statusCode ?? mutationError.status

  if (statusCode === 409) {
    return true
  }

  const description = getErrorDescription(mutationError)

  return description.includes('conflict')
    || description.includes('revision')
    || description.includes('ifrevision')
}

async function commitSelectionTransaction(
  client: CollectionAssignmentsSyncClient,
  products: ProductDocumentRecord[],
  changedProductIds: string[],
  nextSelectedIdsSet: Set<string>,
  collectionBaseId: string
) {
  if (changedProductIds.length === 0) {
    return
  }

  const productById = new Map(products.map((product) => [product.baseId, product] as const))
  let transaction = client.transaction()

  changedProductIds.forEach((productId) => {
    const product = productById.get(productId)

    if (!product) {
      return
    }

    const nextProductCollections = applyCollectionSelectionToVariants(
      product.variantDocumentIds,
      product.variantCollectionIdsByDocumentId,
      collectionBaseId,
      nextSelectedIdsSet.has(product.baseId)
    )

    product.variantDocumentIds.forEach((documentId) => {
      const revisionId = product.variantRevisionByDocumentId[documentId]

      if (!revisionId) {
        throw new Error(`Missing revision id for ${documentId}`)
      }

      const nextCollectionReferences = (
        nextProductCollections.variantCollectionIdsByDocumentId[documentId] ?? []
      ).map((referenceId) => {
        return createReferenceValue(referenceId)
      })

      transaction = transaction.patch(documentId, (patch) => {
        const guardedPatch = patch.ifRevisionId(revisionId)

        return nextCollectionReferences.length === 0
          ? guardedPatch.unset(['collections'])
          : guardedPatch.set({ collections: nextCollectionReferences })
      })
    })
  })

  await transaction.commit()
}

async function loadRefreshedChangedProducts(
  client: CollectionAssignmentsSyncClient,
  refreshByIdsQuery: string,
  products: ProductDocumentRecord[],
  changedProductIds: string[]
) {
  const changedVariantDocumentIds = getChangedVariantDocumentIds(products, changedProductIds)

  if (changedVariantDocumentIds.length === 0) {
    return []
  }

  const rawProducts = await client.fetch<RawProductDocument[]>(
    refreshByIdsQuery,
    { documentIds: changedVariantDocumentIds }
  )

  return normalizeProductDocuments(rawProducts ?? [])
}

export async function syncCollectionAssignmentsWithRetry(
  params: SyncCollectionAssignmentsWithRetryParams
): Promise<SyncCollectionAssignmentsWithRetryResult> {
  const {
    client,
    collectionBaseId,
    nextSelectedIdsSet,
    products,
    refreshByIdsQuery
  } = params

  let currentProducts = products
  let hasRetried = false

  while (true) {
    const changedProductIds = getChangedProductIds(
      currentProducts,
      nextSelectedIdsSet,
      collectionBaseId
    )

    if (changedProductIds.length === 0) {
      return {
        nextProducts: currentProducts,
        changedProductIds
      }
    }

    try {
      await commitSelectionTransaction(
        client,
        currentProducts,
        changedProductIds,
        nextSelectedIdsSet,
        collectionBaseId
      )

      return {
        nextProducts: applySelectionToProducts(
          currentProducts,
          changedProductIds,
          nextSelectedIdsSet,
          collectionBaseId
        ),
        changedProductIds
      }
    } catch (error) {
      if (!isRevisionConflictError(error) || hasRetried) {
        throw error
      }

      const refreshedProducts = await loadRefreshedChangedProducts(
        client,
        refreshByIdsQuery,
        currentProducts,
        changedProductIds
      )

      if (refreshedProducts.length === 0) {
        throw error
      }

      currentProducts = mergeRefreshedProducts(currentProducts, refreshedProducts)
      hasRetried = true
    }
  }
}
