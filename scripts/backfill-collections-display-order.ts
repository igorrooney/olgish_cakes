import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

interface CakeCollectionDocument {
  _id: string
  name: string
  homepageOrder?: number | null
}

interface CollectionReference {
  _ref?: string
}

interface CollectionsDisplayOrderDocument {
  cakeCollectionsOrder?: CollectionReference[]
}

export interface CakeCollectionReferenceValue {
  _type: 'reference'
  _ref: string
}

export interface BackfillCollectionsDisplayOrderResult {
  seeded: boolean
  count: number
}

const COLLECTIONS_DISPLAY_ORDER_DOCUMENT_ID = 'collectionsDisplayOrder'
const CAKE_COLLECTIONS_QUERY = `
  *[_type == "collection"] {
    _id,
    name,
    homepageOrder
  }
`
const COLLECTIONS_DISPLAY_ORDER_QUERY = `
  *[_id == $documentId][0] {
    cakeCollectionsOrder[] {
      _ref
    }
  }
`

function normalizeDocumentId(documentId: string) {
  return documentId.startsWith('drafts.')
    ? documentId.slice('drafts.'.length)
    : documentId
}

function getHomepageOrderValue(collection: CakeCollectionDocument) {
  return typeof collection.homepageOrder === 'number'
    ? collection.homepageOrder
    : Number.MAX_SAFE_INTEGER
}

export function sortCollectionsForBackfill(collections: CakeCollectionDocument[]) {
  return [...collections].sort((firstCollection, secondCollection) => {
    const orderDifference =
      getHomepageOrderValue(firstCollection) - getHomepageOrderValue(secondCollection)

    if (orderDifference !== 0) {
      return orderDifference
    }

    return firstCollection.name.localeCompare(secondCollection.name)
  })
}

export function shouldSeedCakeCollectionsOrder(
  existingOrder: CollectionsDisplayOrderDocument | null
) {
  return !Array.isArray(existingOrder?.cakeCollectionsOrder)
    || existingOrder.cakeCollectionsOrder.length === 0
}

export function toCakeCollectionsOrderReferences(
  collections: CakeCollectionDocument[]
): CakeCollectionReferenceValue[] {
  const seenDocumentIds = new Set<string>()

  return sortCollectionsForBackfill(collections).flatMap((collection) => {
    const normalizedDocumentId = normalizeDocumentId(collection._id)

    if (seenDocumentIds.has(normalizedDocumentId)) {
      return []
    }

    seenDocumentIds.add(normalizedDocumentId)

    return [{
      _type: 'reference',
      _ref: normalizedDocumentId
    }]
  })
}

export async function backfillCollectionsDisplayOrder(): Promise<BackfillCollectionsDisplayOrderResult> {
  if (!process.env.SANITY_API_TOKEN) {
    throw new Error('Missing environment variable: SANITY_API_TOKEN')
  }

  const { serverClient } = await import('../sanity/lib/client')
  const [collections, existingOrder] = await Promise.all([
    serverClient.fetch<CakeCollectionDocument[]>(CAKE_COLLECTIONS_QUERY),
    serverClient.fetch<CollectionsDisplayOrderDocument | null>(
      COLLECTIONS_DISPLAY_ORDER_QUERY,
      { documentId: COLLECTIONS_DISPLAY_ORDER_DOCUMENT_ID }
    )
  ])

  if (!shouldSeedCakeCollectionsOrder(existingOrder)) {
    const count = existingOrder?.cakeCollectionsOrder?.length ?? 0
    console.log(`Skipping backfill. collectionsDisplayOrder already has ${count} cake collections.`)

    return {
      seeded: false,
      count
    }
  }

  const cakeCollectionsOrder = toCakeCollectionsOrderReferences(collections || [])

  if (cakeCollectionsOrder.length === 0) {
    console.log('No cake collections found to seed. Skipping backfill.')

    return {
      seeded: false,
      count: 0
    }
  }

  await serverClient.createIfNotExists({
    _id: COLLECTIONS_DISPLAY_ORDER_DOCUMENT_ID,
    _type: 'collectionsDisplayOrder'
  })

  await serverClient
    .patch(COLLECTIONS_DISPLAY_ORDER_DOCUMENT_ID)
    .set({ cakeCollectionsOrder })
    .commit()

  console.log(`Seeded ${cakeCollectionsOrder.length} cake collections into collectionsDisplayOrder.`)

  return {
    seeded: true,
    count: cakeCollectionsOrder.length
  }
}

const currentFilePath = fileURLToPath(import.meta.url)
const invokedFilePath = process.argv[1]
  ? path.resolve(process.argv[1])
  : null

if (invokedFilePath === currentFilePath) {
  backfillCollectionsDisplayOrder().catch((error) => {
    console.error('Collections display order backfill failed:', error)
    process.exit(1)
  })
}
