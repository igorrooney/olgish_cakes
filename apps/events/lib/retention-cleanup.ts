import { getSupabaseAdmin } from '@/lib/supabase/admin'

export interface EventPhotoCleanupClaim {
  status: 'claimed' | 'busy' | 'skipped'
  claimToken: string | null
  bucket: string | null
  paths: string[]
}

export interface EventPhotoOrphanCleanupCursor {
  status: 'claimed' | 'busy'
  cursorToken: string | null
  objectCursor: string | null
}

export interface EventPhotoOrphanCleanupPosition {
  objectCursor: string | null
}

const getCandidateId = (requestId: string) =>
  `enquiry-upload:event-photo:${requestId}`

const readFirstRow = <Row>(value: Row[] | null): Row | null =>
  Array.isArray(value) && value.length > 0 ? value[0] : null

export async function claimEventPhotoTempCleanup(
  requestId: string,
  cutoffIso: string
): Promise<EventPhotoCleanupClaim> {
  const { data, error } = await getSupabaseAdmin().rpc(
    'claim_event_photo_temp_cleanup',
    {
      p_request_id: requestId,
      p_cutoff: cutoffIso
    }
  )

  if (error) {
    throw new Error('EVENT_PHOTO_CLEANUP_CLAIM_FAILED')
  }

  const row = readFirstRow(data)
  if (!row) {
    throw new Error('EVENT_PHOTO_CLEANUP_CLAIM_FAILED')
  }

  return {
    status: row.status,
    claimToken: row.claim_token,
    bucket: row.temp_image_bucket,
    paths: row.temp_image_paths
  }
}

export async function beginEventPhotoTempExternalDeletion(
  requestId: string,
  claimToken: string,
  bucket: string,
  paths: string[]
): Promise<void> {
  const { data, error } = await getSupabaseAdmin().rpc(
    'begin_privacy_retention_external_deletion',
    {
      p_candidate_id: getCandidateId(requestId),
      p_claim_token: claimToken,
      p_bucket: bucket,
      p_paths: paths
    }
  )

  if (error || data !== true) {
    throw new Error('EVENT_PHOTO_CLEANUP_CLAIM_INVALID')
  }
}

export async function finalizeEventPhotoTempCleanup(
  requestId: string,
  claimToken: string
): Promise<'deleted' | 'skipped'> {
  const { data, error } = await getSupabaseAdmin().rpc(
    'finalize_event_photo_temp_cleanup',
    {
      p_request_id: requestId,
      p_claim_token: claimToken
    }
  )

  if (error) {
    throw new Error('EVENT_PHOTO_CLEANUP_FINALIZE_FAILED')
  }

  const row = readFirstRow(data)
  if (!row || (row.status !== 'deleted' && row.status !== 'skipped')) {
    throw new Error('EVENT_PHOTO_CLEANUP_FINALIZE_FAILED')
  }

  return row.status
}

export async function releaseEventPhotoTempCleanup(
  requestId: string,
  claimToken: string,
  errorCode: string
): Promise<void> {
  const { error } = await getSupabaseAdmin().rpc(
    'release_privacy_retention_deletion_claim',
    {
      p_candidate_id: getCandidateId(requestId),
      p_claim_token: claimToken,
      p_error_code: errorCode
    }
  )

  if (error) {
    throw new Error('EVENT_PHOTO_CLEANUP_RELEASE_FAILED')
  }
}

export async function claimEventPhotoOrphanCleanupCursor(): Promise<EventPhotoOrphanCleanupCursor> {
  const { data, error } = await getSupabaseAdmin().rpc(
    'claim_event_photo_orphan_cleanup_cursor',
    {}
  )

  if (error) {
    throw new Error('EVENT_PHOTO_ORPHAN_CURSOR_CLAIM_FAILED')
  }

  const row = readFirstRow(data)
  if (
    !row ||
    (row.status !== 'claimed' && row.status !== 'busy') ||
    !(row.cursor_token === null || typeof row.cursor_token === 'string') ||
    !(
      row.object_cursor === null ||
      (
        typeof row.object_cursor === 'string' &&
        row.object_cursor.length > 0 &&
        row.object_cursor.length <= 4096
      )
    ) ||
    (row.status === 'claimed' && !row.cursor_token) ||
    (row.status === 'busy' && row.cursor_token !== null)
  ) {
    throw new Error('EVENT_PHOTO_ORPHAN_CURSOR_CLAIM_FAILED')
  }

  return {
    status: row.status,
    cursorToken: row.cursor_token,
    objectCursor: row.object_cursor
  }
}

export async function finalizeEventPhotoOrphanCleanupCursor(
  cursorToken: string,
  position: EventPhotoOrphanCleanupPosition
): Promise<void> {
  const { data, error } = await getSupabaseAdmin().rpc(
    'finalize_event_photo_orphan_cleanup_cursor',
    {
      p_cursor_token: cursorToken,
      p_object_cursor: position.objectCursor
    }
  )

  if (error || data !== true) {
    throw new Error('EVENT_PHOTO_ORPHAN_CURSOR_FINALIZE_FAILED')
  }
}

export async function releaseEventPhotoOrphanCleanupCursor(
  cursorToken: string
): Promise<void> {
  const { data, error } = await getSupabaseAdmin().rpc(
    'release_event_photo_orphan_cleanup_cursor',
    { p_cursor_token: cursorToken }
  )

  if (error || data !== true) {
    throw new Error('EVENT_PHOTO_ORPHAN_CURSOR_RELEASE_FAILED')
  }
}

export async function filterReferencedEventPhotoTempPaths(
  paths: string[]
): Promise<string[]> {
  if (paths.length === 0) {
    return []
  }
  if (paths.length > 100) {
    throw new Error('EVENT_PHOTO_REFERENCE_FILTER_FAILED')
  }

  const { data, error } = await getSupabaseAdmin().rpc(
    'filter_referenced_event_photo_temp_paths',
    { p_paths: paths }
  )

  if (
    error ||
    !Array.isArray(data) ||
    data.some((row) => !row || typeof row.temp_image_path !== 'string')
  ) {
    throw new Error('EVENT_PHOTO_REFERENCE_FILTER_FAILED')
  }

  return data.map((row) => row.temp_image_path)
}
