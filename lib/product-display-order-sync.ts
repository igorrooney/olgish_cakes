export type ProductDisplayOrderField = 'cakesOrder' | 'giftHampersOrder'

export interface ProductReferenceValue {
  _key?: string
  _type: 'reference'
  _ref: string
}

export interface ProductDisplayOrderPatch {
  ifRevisionId: (revisionId: string) => ProductDisplayOrderPatch
  set: (attributes: Partial<Record<ProductDisplayOrderField, ProductReferenceValue[]>>) => ProductDisplayOrderPatch
  commit: () => Promise<unknown>
}

export interface ProductDisplayOrderSyncClient {
  createIfNotExists: (document: { _id: string, _type: 'productsDisplayOrder' }) => Promise<unknown>
  fetch: <T>(query: string, params?: Record<string, unknown>) => Promise<T>
  patch: (documentId: string) => ProductDisplayOrderPatch
}

interface ProductsDisplayOrderSnapshot {
  _rev: string
  productExists: boolean
  orderReferences?: ProductReferenceValue[] | null
}

export interface ProductDisplayOrderSyncResult {
  documentId: string
  fieldName: ProductDisplayOrderField
  updated: boolean
  inserted: boolean
  alreadyPresent: boolean
}

const productsDisplayOrderDocumentId = 'productsDisplayOrder'
const productsDisplayOrderSnapshotQueries: Record<ProductDisplayOrderField, string> = {
  cakesOrder: `
    {
      "productExists": defined(*[_id == $productDocumentId && _type == "cake"][0]._id),
      "orderDocument": *[_id == $documentId][0] {
        _rev,
        "orderReferences": cakesOrder[] {
          _key,
          _type,
          _ref
        }
      }
    } {
      productExists,
      "orderReferences": orderDocument.orderReferences,
      "_rev": orderDocument._rev
    }
  `,
  giftHampersOrder: `
    {
      "productExists": defined(*[_id == $productDocumentId && _type == "giftHamper"][0]._id),
      "orderDocument": *[_id == $documentId][0] {
        _rev,
        "orderReferences": giftHampersOrder[] {
          _key,
          _type,
          _ref
        }
      }
    } {
      productExists,
      "orderReferences": orderDocument.orderReferences,
      "_rev": orderDocument._rev
    }
  `
}

function normalizeDocumentId(documentId: string) {
  return documentId.startsWith('drafts.')
    ? documentId.slice('drafts.'.length)
    : documentId
}

function createReferenceKey() {
  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function createReferenceValue(documentId: string): ProductReferenceValue {
  return {
    _key: createReferenceKey(),
    _type: 'reference',
    _ref: documentId
  }
}

function areReferencesEqual(
  firstReferences: ProductReferenceValue[],
  secondReferences: ProductReferenceValue[]
) {
  if (firstReferences.length !== secondReferences.length) {
    return false
  }

  return firstReferences.every((reference, index) => {
    const secondReference = secondReferences[index]

    return reference._key === secondReference?._key &&
      reference._type === secondReference?._type &&
      reference._ref === secondReference?._ref
  })
}

function buildNextReferences(
  currentReferences: ProductReferenceValue[] | null | undefined,
  documentId: string,
  shouldInsertMissingReference = true
) {
  const normalizedDocumentId = normalizeDocumentId(documentId)
  const seenDocumentIds = new Set<string>()
  const validUniqueReferences: ProductReferenceValue[] = []
  let alreadyPresent = false

  ;(currentReferences ?? []).forEach((reference) => {
    if (reference?._type !== 'reference' || typeof reference._ref !== 'string' || reference._ref.length === 0) {
      return
    }

    const normalizedReferenceId = normalizeDocumentId(reference._ref)

    if (normalizedReferenceId === normalizedDocumentId) {
      alreadyPresent = true

      if (!shouldInsertMissingReference) {
        return
      }
    }

    if (seenDocumentIds.has(normalizedReferenceId)) {
      return
    }

    seenDocumentIds.add(normalizedReferenceId)
    validUniqueReferences.push({
      ...reference,
      _type: 'reference',
      _ref: normalizedReferenceId
    })

  })

  if (alreadyPresent || !shouldInsertMissingReference) {
    return {
      references: validUniqueReferences,
      inserted: false,
      alreadyPresent,
      changed: !areReferencesEqual(currentReferences ?? [], validUniqueReferences)
    }
  }

  return {
    references: [
      createReferenceValue(normalizedDocumentId),
      ...validUniqueReferences
    ],
    inserted: true,
    alreadyPresent,
    changed: true
  }
}

function isRevisionConflictError(error: unknown) {
  if (typeof error !== 'object' || error === null) {
    return false
  }

  const mutationError = error as {
    statusCode?: number
    status?: number
    message?: string
  }

  return mutationError.statusCode === 409 ||
    mutationError.status === 409 ||
    mutationError.message?.toLowerCase().includes('revision') === true ||
    mutationError.message?.toLowerCase().includes('conflict') === true
}

export async function ensureProductDisplayOrderEntry({
  client,
  documentId,
  fieldName
}: {
  client: ProductDisplayOrderSyncClient
  documentId: string
  fieldName: ProductDisplayOrderField
}): Promise<ProductDisplayOrderSyncResult> {
  const normalizedDocumentId = normalizeDocumentId(documentId)

  await client.createIfNotExists({
    _id: productsDisplayOrderDocumentId,
    _type: 'productsDisplayOrder'
  })

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const snapshot = await client.fetch<ProductsDisplayOrderSnapshot | null>(
      productsDisplayOrderSnapshotQueries[fieldName],
      {
        documentId: productsDisplayOrderDocumentId,
        productDocumentId: normalizedDocumentId
      }
    )

    if (!snapshot?._rev) {
      throw new Error('Unable to load productsDisplayOrder for product order sync.')
    }

    const nextReferences = buildNextReferences(
      snapshot.orderReferences,
      normalizedDocumentId,
      snapshot.productExists
    )

    if (!nextReferences.changed) {
      return {
        documentId: normalizedDocumentId,
        fieldName,
        updated: false,
        inserted: false,
        alreadyPresent: nextReferences.alreadyPresent
      }
    }

    try {
      await client
        .patch(productsDisplayOrderDocumentId)
        .ifRevisionId(snapshot._rev)
        .set({ [fieldName]: nextReferences.references })
        .commit()

      return {
        documentId: normalizedDocumentId,
        fieldName,
        updated: true,
        inserted: nextReferences.inserted,
        alreadyPresent: nextReferences.alreadyPresent
      }
    } catch (error) {
      if (attempt === 0 && isRevisionConflictError(error)) {
        continue
      }

      throw error
    }
  }

  throw new Error('Unable to sync productsDisplayOrder after retry.')
}
