import { useEffect, useMemo, useState } from 'react'
import { Stack, Text } from '@sanity/ui'
import { ArrayOfObjectsInputProps, set, unset, useClient } from 'sanity'

type OrderableDocumentType = 'collection' | 'giftHamperCollection' | 'cake' | 'giftHamper'

interface OrderableOption {
  _id: string
}

interface OrderableReferenceValue {
  _key: string
  _type: 'reference'
  _ref: string
  _weak?: boolean
}

const ORDERABLE_DOCUMENT_QUERY: Record<OrderableDocumentType, string> = {
  collection: `*[_type == "collection"] | order(name asc) {
    _id
  }`,
  giftHamperCollection: `*[_type == "giftHamperCollection"] | order(name asc) {
    _id
  }`,
  cake: `*[_type == "cake"] | order(order asc, _createdAt desc, name asc) {
    _id
  }`,
  giftHamper: `*[_type == "giftHamper"] | order(name asc, _createdAt desc) {
    _id
  }`
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

function createReferenceValue(collectionId: string): OrderableReferenceValue {
  return {
    _key: createReferenceKey(),
    _type: 'reference',
    _ref: collectionId
  }
}

function areStringArraysEqual(firstArray: string[], secondArray: string[]) {
  if (firstArray.length !== secondArray.length) {
    return false
  }

  return firstArray.every((value, index) => value === secondArray[index])
}

function createOrderInput(
  documentType: OrderableDocumentType,
  loadErrorMessage: string
) {
  return function CollectionsOrderInput(props: ArrayOfObjectsInputProps<OrderableReferenceValue>) {
    const {
      onChange,
      readOnly,
      value
    } = props
    const client = useClient({ apiVersion: '2025-03-31' })
    const [collectionIds, setCollectionIds] = useState<string[]>([])
    const [hasLoaded, setHasLoaded] = useState(false)
    const [loadError, setLoadError] = useState<string | null>(null)

    const normalizedCurrentIds = useMemo(() => {
      return (value ?? [])
        .map((reference) => {
          const referenceId = reference?._ref
          return typeof referenceId === 'string' && referenceId.length > 0
            ? normalizeDocumentId(referenceId)
            : null
        })
        .filter((referenceId): referenceId is string => referenceId !== null)
    }, [value])

    useEffect(() => {
      let isMounted = true

      async function loadCollections() {
        setHasLoaded(false)
        setLoadError(null)

        try {
          const options = await client.fetch<OrderableOption[]>(
            ORDERABLE_DOCUMENT_QUERY[documentType]
          )

          if (!isMounted) {
            return
          }

          const uniqueIds = Array.from(
            new Set((options ?? []).map((option) => normalizeDocumentId(option._id)))
          )

          setCollectionIds(uniqueIds)
        } catch (error) {
          if (!isMounted) {
            return
          }

          console.error('Failed to auto-load items for display ordering:', error)
          setLoadError(loadErrorMessage)
        } finally {
          if (isMounted) {
            setHasLoaded(true)
          }
        }
      }

      loadCollections()

      return () => {
        isMounted = false
      }
    }, [client])

    useEffect(() => {
      if (!hasLoaded || loadError || readOnly) {
        return
      }

      const availableIds = collectionIds
      const availableIdsSet = new Set(availableIds)

      const currentValues = value ?? []
      const currentReferencesById = new Map<string, OrderableReferenceValue>()
      const currentKnownIds: string[] = []
      const currentKnownIdsSet = new Set<string>()

      currentValues.forEach((reference) => {
        if (!reference?._ref) {
          return
        }

        const normalizedId = normalizeDocumentId(reference._ref)

        if (!currentReferencesById.has(normalizedId)) {
          currentReferencesById.set(normalizedId, reference)
        }

        if (availableIdsSet.has(normalizedId) && !currentKnownIdsSet.has(normalizedId)) {
          currentKnownIdsSet.add(normalizedId)
          currentKnownIds.push(normalizedId)
        }
      })

      const missingIds = availableIds.filter((collectionId) => !currentKnownIdsSet.has(collectionId))
      const nextOrderedIds = [...missingIds, ...currentKnownIds]

      const hasInvalidCurrentReferences = normalizedCurrentIds.length !== currentValues.length
      const isSameOrder = areStringArraysEqual(normalizedCurrentIds, nextOrderedIds)

      if (!hasInvalidCurrentReferences && isSameOrder) {
        return
      }

      const nextValue = nextOrderedIds.map((collectionId) => {
        const existingReference = currentReferencesById.get(collectionId)

        if (existingReference) {
          return existingReference._ref === collectionId
            ? existingReference
            : { ...existingReference, _ref: collectionId }
        }

        return createReferenceValue(collectionId)
      })

      if (nextValue.length === 0) {
        onChange(unset())
        return
      }

      onChange(set(nextValue))
    }, [collectionIds, hasLoaded, loadError, normalizedCurrentIds, onChange, readOnly, value])

    return (
      <Stack space={3}>
        {loadError ? (
          <Text muted size={1}>
            {loadError}
          </Text>
        ) : null}
        {props.renderDefault(
          props as unknown as Parameters<typeof props.renderDefault>[0]
        )}
      </Stack>
    )
  }
}

export const CakeCollectionsOrderInput = createOrderInput(
  'collection',
  'Unable to auto-load collections right now.'
)

export const GiftHamperCollectionsOrderInput = createOrderInput(
  'giftHamperCollection',
  'Unable to auto-load collections right now.'
)

export const CakesOrderInput = createOrderInput(
  'cake',
  'Unable to auto-load cakes right now.'
)

export const GiftHampersOrderInput = createOrderInput(
  'giftHamper',
  'Unable to auto-load gift hampers right now.'
)
