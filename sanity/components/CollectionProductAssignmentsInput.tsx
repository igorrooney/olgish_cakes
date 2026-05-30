import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { Box, Button, Card, Checkbox, Flex, Stack, Text, TextInput } from '@sanity/ui'
import { ArrayOfObjectsInputProps, set, unset, useClient, useFormValue } from 'sanity'
import {
  STUDIO_CAKE_COLLECTION_ASSIGNMENT_OPTIONS_QUERY,
  STUDIO_GIFT_HAMPER_COLLECTION_ASSIGNMENT_OPTIONS_QUERY,
  STUDIO_PRODUCT_COLLECTION_ASSIGNMENT_BY_IDS_QUERY,
  STUDIO_PUBLISHED_DOCUMENT_EXISTS_QUERY
} from '../lib/queries'
import {
  createMirrorValue,
  isSameStringArray,
  normalizeDocumentId,
  normalizeProductDocuments,
  toNormalizedReferenceIds,
  toOrderedSelectedIds,
  type ProductDocumentRecord,
  type ProductReferenceValue,
  type RawProductDocument
} from './collectionProductAssignmentsUtils'
import {
  isRevisionConflictError,
  syncCollectionAssignmentsWithRetry,
  type CollectionAssignmentsSyncClient
} from './collectionProductAssignmentsSync'

interface CollectionAssignmentInputConfig {
  query: string
  emptyLabel: string
}

function createCollectionProductAssignmentsInput(config: CollectionAssignmentInputConfig) {
  const { query, emptyLabel } = config

  return function CollectionProductAssignmentsInput(props: ArrayOfObjectsInputProps<ProductReferenceValue>) {
    const {
      onChange,
      readOnly,
      value
    } = props
    const client = useClient({ apiVersion: '2025-03-31' })
    const documentIdFromForm = useFormValue(['_id'])
    const documentRevisionFromForm = useFormValue(['_rev'])

    const [products, setProducts] = useState<ProductDocumentRecord[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSyncing, setIsSyncing] = useState(false)
    const [loadError, setLoadError] = useState<string | null>(null)
    const [syncError, setSyncError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [isExpanded, setIsExpanded] = useState(false)
    const [hasPublishedCollectionDocument, setHasPublishedCollectionDocument] = useState(false)
    const [isCheckingPublishState, setIsCheckingPublishState] = useState(false)

    const hasPersistedRevision = (
      typeof documentRevisionFromForm === 'string'
      && documentRevisionFromForm.length > 0
    )
    const documentId = typeof documentIdFromForm === 'string' && documentIdFromForm.length > 0
      ? documentIdFromForm
      : null
    const isDraftCollection = documentId?.startsWith('drafts.') ?? false

    const collectionBaseId = useMemo(() => {
      if (!hasPersistedRevision || !documentId) {
        return null
      }

      return normalizeDocumentId(documentId)
    }, [documentId, hasPersistedRevision])

    useEffect(() => {
      let isMounted = true

      if (!collectionBaseId) {
        setHasPublishedCollectionDocument(false)
        setIsCheckingPublishState(false)

        return () => {
          isMounted = false
        }
      }

      if (!isDraftCollection) {
        setHasPublishedCollectionDocument(true)
        setIsCheckingPublishState(false)

        return () => {
          isMounted = false
        }
      }

      async function checkPublishedDocumentExists() {
        setIsCheckingPublishState(true)

        try {
          const publishedDocumentCount = await client.fetch<number>(
            STUDIO_PUBLISHED_DOCUMENT_EXISTS_QUERY,
            { documentId: collectionBaseId }
          )

          if (!isMounted) {
            return
          }

          setHasPublishedCollectionDocument(publishedDocumentCount > 0)
        } catch (error) {
          if (!isMounted) {
            return
          }

          console.error('Failed to check collection publish state for assignment selector:', error)
          setHasPublishedCollectionDocument(false)
        } finally {
          if (isMounted) {
            setIsCheckingPublishState(false)
          }
        }
      }

      checkPublishedDocumentExists()

      return () => {
        isMounted = false
      }
    }, [client, collectionBaseId, isDraftCollection])

    const canAssignPublishedReferences = (
      collectionBaseId !== null
      && (!isDraftCollection || hasPublishedCollectionDocument)
    )

    const selectedProductIds = useMemo(() => {
      if (!collectionBaseId) {
        return new Set<string>()
      }

      return new Set(
        products
          .filter((product) => product.collectionIds.includes(collectionBaseId))
          .map((product) => product.baseId)
      )
    }, [collectionBaseId, products])

    const orderedSelectedProductIds = useMemo(() => {
      return toOrderedSelectedIds(selectedProductIds, products)
    }, [products, selectedProductIds])

    const valueProductIds = useMemo(() => {
      return toNormalizedReferenceIds(value)
    }, [value])

    const visibleProducts = useMemo(() => {
      const normalizedQuery = searchQuery.trim().toLowerCase()

      if (!normalizedQuery) {
        return products
      }

      return products.filter((product) => {
        return product.name.toLowerCase().includes(normalizedQuery)
      })
    }, [products, searchQuery])

    useEffect(() => {
      let isMounted = true

      async function loadProducts() {
        setIsLoading(true)
        setLoadError(null)

        try {
          const rawProducts = await client.fetch<RawProductDocument[]>(query)

          if (!isMounted) {
            return
          }

          setProducts(normalizeProductDocuments(rawProducts ?? []))
        } catch (error) {
          if (!isMounted) {
            return
          }

          console.error('Failed to load products for collection assignment selector:', error)
          setLoadError(`Unable to load ${emptyLabel} right now.`)
          setProducts([])
        } finally {
          if (isMounted) {
            setIsLoading(false)
          }
        }
      }

      loadProducts()

      return () => {
        isMounted = false
      }
    }, [client])

    useEffect(() => {
      if (readOnly || isLoading || loadError || isSyncing || !canAssignPublishedReferences) {
        return
      }

      if (isSameStringArray(valueProductIds, orderedSelectedProductIds)) {
        return
      }

      const nextMirrorValue = createMirrorValue(orderedSelectedProductIds, value, products)

      if (nextMirrorValue.length === 0) {
        onChange(unset())
        return
      }

      onChange(set(nextMirrorValue))
    }, [
      canAssignPublishedReferences,
      isLoading,
      isSyncing,
      loadError,
      onChange,
      orderedSelectedProductIds,
      products,
      readOnly,
      value,
      valueProductIds
    ])

    async function applySelection(nextSelectedIds: string[]) {
      const currentCollectionBaseId = collectionBaseId

      if (
        readOnly
        || isSyncing
        || !canAssignPublishedReferences
        || !currentCollectionBaseId
      ) {
        return
      }

      const nextSelectedIdsSet = new Set(nextSelectedIds)

      setSyncError(null)
      setIsSyncing(true)

      try {
        const { nextProducts } = await syncCollectionAssignmentsWithRetry({
          client: client as unknown as CollectionAssignmentsSyncClient,
          products,
          nextSelectedIdsSet,
          collectionBaseId: currentCollectionBaseId,
          refreshByIdsQuery: STUDIO_PRODUCT_COLLECTION_ASSIGNMENT_BY_IDS_QUERY
        })
        setProducts(nextProducts)

        const nextMirrorValue = createMirrorValue(
          toOrderedSelectedIds(nextSelectedIdsSet, nextProducts),
          value,
          nextProducts
        )

        if (nextMirrorValue.length === 0) {
          onChange(unset())
        } else {
          onChange(set(nextMirrorValue))
        }
      } catch (error) {
        console.error('Failed to sync collection assignment to products:', error)
        setSyncError(
          isRevisionConflictError(error)
            ? `Unable to sync ${emptyLabel} because these items were updated in another Studio session. Refresh and try again.`
            : `Unable to sync ${emptyLabel} right now. Please try again.`
        )
      } finally {
        setIsSyncing(false)
      }
    }

    function toggleProduct(productId: string, checked: boolean) {
      const nextSelectedIds = new Set(selectedProductIds)

      if (checked) {
        nextSelectedIds.add(productId)
      } else {
        nextSelectedIds.delete(productId)
      }

      applySelection(Array.from(nextSelectedIds))
    }

    function selectVisibleProducts() {
      const nextSelectedIds = new Set(selectedProductIds)

      visibleProducts.forEach((product) => {
        nextSelectedIds.add(product.baseId)
      })

      applySelection(Array.from(nextSelectedIds))
    }

    function clearAllProducts() {
      applySelection([])
    }

    const selectedCount = selectedProductIds.size
    const hasProducts = products.length > 0
    const canEdit = (
      !readOnly
      && !isLoading
      && !isSyncing
      && !isCheckingPublishState
      && hasProducts
      && canAssignPublishedReferences
    )

    return (
      <Stack space={3}>
        <Flex align='center' gap={2}>
          <Button
            type='button'
            mode='ghost'
            text={selectedCount > 0 ? `${selectedCount} selected` : 'Select products'}
            onClick={() => setIsExpanded((previous) => !previous)}
            disabled={!canEdit}
          />
          {selectedCount > 0 ? (
            <Text muted size={1}>
              {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
            </Text>
          ) : null}
        </Flex>

        {isLoading ? (
          <Text muted size={1}>
            Loading {emptyLabel}...
          </Text>
        ) : null}

        {!collectionBaseId ? (
          <Text muted size={1}>
            Save this collection first, then assign {emptyLabel}.
          </Text>
        ) : null}

        {collectionBaseId && isDraftCollection && isCheckingPublishState ? (
          <Text muted size={1}>
            Checking publish status...
          </Text>
        ) : null}

        {collectionBaseId && isDraftCollection && !isCheckingPublishState && !hasPublishedCollectionDocument ? (
          <Text muted size={1}>
            Publish this collection first, then assign {emptyLabel}.
          </Text>
        ) : null}

        {isSyncing ? (
          <Text muted size={1}>
            Syncing {emptyLabel}...
          </Text>
        ) : null}

        {loadError ? (
          <Text muted size={1}>
            {loadError}
          </Text>
        ) : null}

        {syncError ? (
          <Text muted size={1}>
            {syncError}
          </Text>
        ) : null}

        {isExpanded && canEdit ? (
          <Card border radius={2} padding={3}>
            <Stack space={3}>
              <TextInput
                value={searchQuery}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setSearchQuery(event.currentTarget.value)}
                placeholder={`Search ${emptyLabel}`}
              />

              <Flex align='center' gap={2}>
                <Button
                  type='button'
                  mode='bleed'
                  text='Select visible'
                  onClick={selectVisibleProducts}
                  disabled={visibleProducts.length === 0}
                />
                <Button
                  type='button'
                  mode='bleed'
                  text='Clear all'
                  onClick={clearAllProducts}
                  disabled={selectedCount === 0}
                />
              </Flex>

              <Card
                border
                radius={2}
                padding={2}
                style={{ maxHeight: 240, overflowY: 'auto' }}
              >
                <Stack space={2}>
                  {visibleProducts.length > 0 ? visibleProducts.map((product) => (
                    <Box key={product.baseId} padding={1}>
                      <Flex align='center' gap={3} as='label'>
                        <Checkbox
                          checked={selectedProductIds.has(product.baseId)}
                          disabled={isSyncing || readOnly}
                          onChange={(event: ChangeEvent<HTMLInputElement>) => toggleProduct(product.baseId, event.currentTarget.checked)}
                        />
                        <Text size={2}>{product.name}</Text>
                      </Flex>
                    </Box>
                  )) : (
                    <Text muted size={1}>
                      No {emptyLabel} match your search.
                    </Text>
                  )}
                </Stack>
              </Card>
            </Stack>
          </Card>
        ) : null}
      </Stack>
    )
  }
}

export const CollectionCakesInput = createCollectionProductAssignmentsInput({
  query: STUDIO_CAKE_COLLECTION_ASSIGNMENT_OPTIONS_QUERY,
  emptyLabel: 'cakes'
})

export const GiftHamperCollectionProductsInput = createCollectionProductAssignmentsInput({
  query: STUDIO_GIFT_HAMPER_COLLECTION_ASSIGNMENT_OPTIONS_QUERY,
  emptyLabel: 'gift hampers'
})
