import { Box, Card, Stack, Text } from '@sanity/ui'
import type { Path, PathSegment, ValidationMarker } from '@sanity/types'
import { useValidationStatus, type DocumentLayoutProps } from 'sanity'

function toSentenceCase(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function toDisplayLabel(value: string) {
  return toSentenceCase(value)
    .replace(/^\w/, (character) => character.toUpperCase())
}

function formatPathSegment(segment: PathSegment) {
  if (typeof segment === 'string') {
    return toDisplayLabel(segment)
  }

  if (typeof segment === 'number') {
    return `Item ${segment + 1}`
  }

  if (Array.isArray(segment)) {
    const [fromIndex, toIndex] = segment
    const fromLabel = typeof fromIndex === 'number' ? fromIndex + 1 : fromIndex
    const toLabel = typeof toIndex === 'number' ? toIndex + 1 : toIndex

    return `Items ${fromLabel}-${toLabel}`
  }

  if ('_key' in segment && typeof segment._key === 'string') {
    return `Item ${segment._key}`
  }

  return 'Item'
}

export function formatValidationPath(path: Path) {
  if (path.length === 0) {
    return 'Document'
  }

  return path
    .map((segment) => formatPathSegment(segment))
    .join(' > ')
}

export function getBlockingValidationErrors(validation: ValidationMarker[]) {
  return validation.filter((marker) => marker.level === 'error')
}

export function DocumentPublishValidationLayout(props: DocumentLayoutProps) {
  const { documentId, documentType } = props
  const { isValidating, validation } = useValidationStatus(documentId, documentType)
  const blockingErrors = getBlockingValidationErrors(validation)
  const hasBlockingErrors = blockingErrors.length > 0

  return (
    <Stack space={4}>
      {props.renderDefault(props)}

      {isValidating || hasBlockingErrors ? (
        <Card
          border
          padding={4}
          radius={3}
          tone={hasBlockingErrors ? 'critical' : 'caution'}
        >
          <Stack space={4}>
            <Stack space={2}>
              <Text size={2} weight='semibold'>
                {hasBlockingErrors
                  ? `Publish is blocked by ${blockingErrors.length} ${blockingErrors.length === 1 ? 'error' : 'errors'}`
                  : 'Checking publish blockers'}
              </Text>
              <Text size={1}>
                {hasBlockingErrors
                  ? 'Fix these validation errors to enable the Publish button.'
                  : 'Sanity is still validating this document.'}
              </Text>
            </Stack>

            {hasBlockingErrors ? (
              <Box as='ol' margin={0} paddingLeft={4}>
                <Stack space={4}>
                  {blockingErrors.map((marker, index) => (
                    <Box
                      as='li'
                      key={`${formatValidationPath(marker.path)}-${marker.message}-${index}`}
                    >
                      <Stack space={2}>
                        <Text size={1} weight='semibold'>
                          {marker.message}
                        </Text>
                        <Text size={1}>
                          {formatValidationPath(marker.path)}
                        </Text>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Box>
            ) : null}
          </Stack>
        </Card>
      ) : null}
    </Stack>
  )
}
