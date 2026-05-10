import { useEffect, useMemo, useState } from 'react'
import { Box, Button, Card, Checkbox, Flex, Stack, Text, TextInput } from '@sanity/ui'
import { ArrayOfObjectsInputProps, set, unset, useClient } from 'sanity'

interface RawFillingTypeOption {
  _id: string
  name: string
}

interface FillingTypeOption extends RawFillingTypeOption {
  baseId: string
}

interface FillingTypeReferenceValue {
  _key: string
  _type: 'reference'
  _ref: string
  _weak?: boolean
}

const FILLING_TYPE_OPTIONS_QUERY = `*[_type == "cakeFillingType"] | order(_updatedAt desc) {
  _id,
  name
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

function createReferenceValue(fillingTypeId: string): FillingTypeReferenceValue {
  return {
    _key: createReferenceKey(),
    _type: 'reference',
    _ref: fillingTypeId
  }
}

function normalizeFillingTypeOptions(rawOptions: RawFillingTypeOption[]): FillingTypeOption[] {
  const dedupedByBaseId = new Map<string, FillingTypeOption>()

  rawOptions.forEach((rawOption) => {
    const optionName = rawOption.name?.trim()

    if (!optionName) {
      return
    }

    const option: FillingTypeOption = {
      ...rawOption,
      name: optionName,
      baseId: getBaseId(rawOption._id)
    }

    if (!dedupedByBaseId.has(option.baseId)) {
      dedupedByBaseId.set(option.baseId, option)
    }
  })

  return Array.from(dedupedByBaseId.values()).sort((firstOption, secondOption) => {
    return firstOption.name.localeCompare(secondOption.name)
  })
}

export function CakeFillingTypesInput(props: ArrayOfObjectsInputProps<FillingTypeReferenceValue>) {
  const client = useClient({ apiVersion: '2025-03-31' })
  const [options, setOptions] = useState<FillingTypeOption[]>([])
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
    const abortController = new AbortController()

    async function loadFillingTypes() {
      setIsLoading(true)
      setLoadError(null)

      try {
        const rawOptions = await client.fetch<RawFillingTypeOption[]>(
          FILLING_TYPE_OPTIONS_QUERY,
          {},
          { signal: abortController.signal }
        )

        if (!isMounted) {
          return
        }

        setOptions(normalizeFillingTypeOptions(rawOptions || []))
      } catch (error) {
        if (!isMounted || abortController.signal.aborted) {
          return
        }

        console.error('Failed to load filling types for cake selector:', error)
        setLoadError('Unable to load filling types right now.')
        setOptions([])
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadFillingTypes()

    return () => {
      isMounted = false
      abortController.abort()
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

  function toggleFillingType(fillingTypeId: string, checked: boolean) {
    const nextIds = new Set(selectedIds)

    if (checked) {
      nextIds.add(fillingTypeId)
    } else {
      nextIds.delete(fillingTypeId)
    }

    applySelectedIds(Array.from(nextIds))
  }

  function selectVisibleFillingTypes() {
    const nextIds = new Set(selectedIds)
    visibleOptions.forEach((option) => nextIds.add(option.baseId))
    applySelectedIds(Array.from(nextIds))
  }

  function clearAllFillingTypes() {
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
          text={selectedCount > 0 ? `${selectedCount} selected` : 'Select filling types'}
          onClick={() => setIsExpanded((previous) => !previous)}
          disabled={!canOpenSelector}
        />
        {selectedCount > 0 ? (
          <Text muted size={1}>
            {selectedCount} filling type{selectedCount === 1 ? '' : 's'} selected
          </Text>
        ) : null}
      </Flex>

      {isLoading ? (
        <Text muted size={1}>
          Loading filling types...
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
              placeholder='Search filling types'
            />

            <Flex align='center' gap={2}>
              <Button
                type='button'
                mode='bleed'
                text='Select visible'
                onClick={selectVisibleFillingTypes}
                disabled={visibleOptions.length === 0}
              />
              <Button
                type='button'
                mode='bleed'
                text='Clear all'
                onClick={clearAllFillingTypes}
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
                        onChange={(event) => toggleFillingType(option.baseId, event.currentTarget.checked)}
                      />
                      <Text size={2}>{option.name}</Text>
                    </Flex>
                  </Box>
                )) : (
                  <Text muted size={1}>
                    No filling types match your search.
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
