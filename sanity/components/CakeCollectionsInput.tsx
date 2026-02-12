import { useEffect, useMemo, useState } from 'react'
import { Badge, Box, Button, Card, Checkbox, Flex, Stack, Text, TextInput } from '@sanity/ui'
import { ArrayOfObjectsInputProps, set, unset, useClient } from 'sanity'

interface RawCollectionOption {
  _id: string
  name: string
  isFeatured?: boolean
  homepageOrder?: number
}

interface CollectionOption extends RawCollectionOption {
  baseId: string
}

interface CollectionReferenceValue {
  _key: string
  _type: 'reference'
  _ref: string
  _weak?: boolean
}

const COLLECTION_OPTIONS_QUERY = `*[_type == "collection"] | order(_updatedAt desc) {
  _id,
  name,
  isFeatured,
  homepageOrder
}`

function getBaseId(documentId: string): string {
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

function createReferenceValue(collectionId: string): CollectionReferenceValue {
  return {
    _key: createReferenceKey(),
    _type: 'reference',
    _ref: collectionId
  }
}

function normalizeCollectionOptions(rawOptions: RawCollectionOption[]): CollectionOption[] {
  const dedupedByBaseId = new Map<string, CollectionOption>()

  rawOptions.forEach((rawOption) => {
    const optionName = rawOption.name?.trim()

    if (!optionName) {
      return
    }

    const option: CollectionOption = {
      ...rawOption,
      name: optionName,
      baseId: getBaseId(rawOption._id)
    }

    if (!dedupedByBaseId.has(option.baseId)) {
      dedupedByBaseId.set(option.baseId, option)
    }
  })

  return Array.from(dedupedByBaseId.values()).sort((firstOption, secondOption) => {
    const firstOrder = typeof firstOption.homepageOrder === 'number'
      ? firstOption.homepageOrder
      : Number.MAX_SAFE_INTEGER
    const secondOrder = typeof secondOption.homepageOrder === 'number'
      ? secondOption.homepageOrder
      : Number.MAX_SAFE_INTEGER

    if (firstOrder !== secondOrder) {
      return firstOrder - secondOrder
    }

    return firstOption.name.localeCompare(secondOption.name)
  })
}

export function CakeCollectionsInput(props: ArrayOfObjectsInputProps<CollectionReferenceValue>) {
  const client = useClient({ apiVersion: '2025-03-31' })
  const [options, setOptions] = useState<CollectionOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  const selectedValues = props.value
  const selectedIds = useMemo(() => {
    return new Set((selectedValues ?? []).map((value) => getBaseId(value._ref)))
  }, [selectedValues])

  const visibleOptions = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    if (!normalizedQuery) {
      return options
    }

    return options.filter((option) => option.name.toLowerCase().includes(normalizedQuery))
  }, [options, searchQuery])

  useEffect(() => {
    let isMounted = true

    async function loadCollections() {
      setIsLoading(true)
      setLoadError(null)

      try {
        const rawOptions = await client.fetch<RawCollectionOption[]>(COLLECTION_OPTIONS_QUERY)

        if (!isMounted) {
          return
        }

        setOptions(normalizeCollectionOptions(rawOptions || []))
      } catch (error) {
        if (!isMounted) {
          return
        }

        console.error('Failed to load collections for cake selector:', error)
        setLoadError('Unable to load collections right now.')
        setOptions([])
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadCollections()

    return () => {
      isMounted = false
    }
  }, [client])

  function applySelectedIds(nextIds: string[]) {
    const optionIds = new Set(options.map((option) => option.baseId))
    const currentSelectedValues = selectedValues ?? []
    const existingByRef = new Map(
      currentSelectedValues.map((reference) => [getBaseId(reference._ref), reference] as const)
    )
    const preservedUnknownReferences = currentSelectedValues.filter((reference) => {
      return !optionIds.has(getBaseId(reference._ref))
    })

    const orderedNextReferences = options
      .filter((option) => nextIds.includes(option.baseId))
      .map((option) => existingByRef.get(option.baseId) || createReferenceValue(option.baseId))

    const additionalReferences = nextIds
      .filter((id) => !optionIds.has(id))
      .map((id) => existingByRef.get(id) || createReferenceValue(id))

    const nextValue = [...preservedUnknownReferences, ...orderedNextReferences, ...additionalReferences]

    if (nextValue.length === 0) {
      props.onChange(unset())
      return
    }

    props.onChange(set(nextValue))
  }

  function toggleCollection(collectionId: string, checked: boolean) {
    const nextIds = new Set(selectedIds)

    if (checked) {
      nextIds.add(collectionId)
    } else {
      nextIds.delete(collectionId)
    }

    applySelectedIds(Array.from(nextIds))
  }

  function selectVisibleCollections() {
    const nextIds = new Set(selectedIds)
    visibleOptions.forEach((option) => nextIds.add(option.baseId))
    applySelectedIds(Array.from(nextIds))
  }

  function clearAllCollections() {
    props.onChange(unset())
  }

  const selectedCount = selectedIds.size
  const canOpenSelector = !props.readOnly && !isLoading && options.length > 0

  return (
    <Stack space={3}>
      <Flex align='center' gap={2}>
        <Button
          type='button'
          mode='ghost'
          text={selectedCount > 0 ? `${selectedCount} selected` : 'Select collections'}
          onClick={() => setIsExpanded((previous) => !previous)}
          disabled={!canOpenSelector}
        />
        {selectedCount > 0 ? (
          <Text muted size={1}>
            {selectedCount} collection{selectedCount === 1 ? '' : 's'} selected
          </Text>
        ) : null}
      </Flex>

      {isLoading ? (
        <Text muted size={1}>
          Loading collections...
        </Text>
      ) : null}

      {loadError ? (
        <Text muted size={1}>
          {loadError}
        </Text>
      ) : null}

      {isExpanded && canOpenSelector ? (
        <Card border radius={2} padding={3}>
          <Stack space={3}>
            <TextInput
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.currentTarget.value)}
              placeholder='Search collections'
            />

            <Flex align='center' gap={2}>
              <Button
                type='button'
                mode='bleed'
                text='Select visible'
                onClick={selectVisibleCollections}
                disabled={visibleOptions.length === 0}
              />
              <Button
                type='button'
                mode='bleed'
                text='Clear all'
                onClick={clearAllCollections}
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
                {visibleOptions.length > 0 ? visibleOptions.map((option) => (
                  <Box key={option.baseId} padding={1}>
                    <Flex align='center' gap={3} as='label'>
                      <Checkbox
                        checked={selectedIds.has(option.baseId)}
                        disabled={props.readOnly}
                        onChange={(event) => toggleCollection(option.baseId, event.currentTarget.checked)}
                      />
                      <Text size={2}>{option.name}</Text>
                      {option.isFeatured ? <Badge tone='primary'>Featured</Badge> : null}
                    </Flex>
                  </Box>
                )) : (
                  <Text muted size={1}>
                    No collections match your search.
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
