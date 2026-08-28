import { getSupabaseAdmin } from '@/lib/supabase/admin'
import type {
  EventPhotoRequestInsert,
  EventPhotoRequestRow,
  TelegramStatus
} from '@/lib/types/database'

export interface EventPhotoRequestListFilters {
  eventName?: string
}

export interface CreateEventPhotoRequestInput {
  fullName: string
  email: string
  eventName: string
  imageFilenames: string[]
  imageMimeTypes: string[]
  imageSizes: number[]
  tempImageBucket: string
  tempImagePaths: string[]
}

export interface UploadedDocument {
  path: string
  fileName: string
  mimeType: string
  size: number
}

export const EVENT_PHOTO_CLEANUP_REQUEST_LIST_FAILED =
  'EVENT_PHOTO_CLEANUP_REQUEST_LIST_FAILED'
export const EVENT_PHOTO_CLEANUP_REQUEST_BATCH_SIZE = 12

export type EventPhotoCleanupRequest = Pick<EventPhotoRequestRow, 'id'>

export async function createEventPhotoRequest(
  input: CreateEventPhotoRequestInput
): Promise<EventPhotoRequestRow> {
  const supabase = getSupabaseAdmin()
  const payload: EventPhotoRequestInsert = {
    full_name: input.fullName,
    email: input.email,
    event_name: input.eventName,
    image_count: input.imageFilenames.length,
    image_filenames: input.imageFilenames,
    image_mime_types: input.imageMimeTypes,
    image_sizes: input.imageSizes,
    temp_image_bucket: input.tempImageBucket,
    temp_image_paths: input.tempImagePaths,
    telegram_status: 'pending'
  }

  const { data, error } = await supabase
    .from('event_photo_requests')
    .insert(payload)
    .select('*')
    .single()

  if (error) {
    throw new Error(`Could not save event request: ${error.message}`)
  }

  return data
}

export async function listEventPhotoRequests(
  filters: EventPhotoRequestListFilters = {}
): Promise<EventPhotoRequestRow[]> {
  const supabase = getSupabaseAdmin()
  let query = supabase
    .from('event_photo_requests')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters.eventName) {
    query = query.eq('event_name', filters.eventName)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Could not load event requests: ${error.message}`)
  }

  return data
}

export async function getEventPhotoRequest(id: string): Promise<EventPhotoRequestRow | null> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('event_photo_requests')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw new Error(`Could not load event request: ${error.message}`)
  }

  return data
}

export async function getSentEventPhotoRequest(
  id: string
): Promise<Pick<EventPhotoRequestRow, 'id'> | null> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('event_photo_requests')
    .select('id')
    .eq('id', id)
    .eq('telegram_status', 'sent')
    .maybeSingle()

  if (error) {
    throw new Error(`Could not verify event request: ${error.message}`)
  }

  return data
}

export async function listEventNames(): Promise<string[]> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('event_photo_requests')
    .select('event_name')
    .order('event_name', { ascending: true })

  if (error) {
    throw new Error(`Could not load event names: ${error.message}`)
  }

  return [...new Set(data.map((row) => row.event_name))]
}

export async function updateTelegramStatus(
  id: string,
  status: TelegramStatus,
  messageIds: number[],
  errorMessage: string | null,
  clearTempPaths: boolean
): Promise<void> {
  const supabase = getSupabaseAdmin()
  const cleanupPatch = clearTempPaths
    ? {
        temp_image_paths: [],
        files_deleted_at: new Date().toISOString()
      }
    : {}
  const { error } = await supabase
    .from('event_photo_requests')
    .update({
      telegram_status: status,
      telegram_message_ids: messageIds,
      telegram_error: errorMessage,
      ...cleanupPatch,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) {
    throw new Error(`Could not update Telegram status: ${error.message}`)
  }
}

export async function listRequestsForCleanup(
  cutoffIso: string,
  limit = EVENT_PHOTO_CLEANUP_REQUEST_BATCH_SIZE
): Promise<EventPhotoCleanupRequest[]> {
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw new Error(EVENT_PHOTO_CLEANUP_REQUEST_LIST_FAILED)
  }

  const { data, error } = await getSupabaseAdmin().rpc(
    'list_event_photo_cleanup_candidates',
    {
      p_cutoff: cutoffIso,
      p_limit: limit
    }
  )

  if (error) {
    throw new Error(EVENT_PHOTO_CLEANUP_REQUEST_LIST_FAILED)
  }

  if (
    !Array.isArray(data) ||
    data.length > limit ||
    data.some((row) => !row || typeof row.id !== 'string')
  ) {
    throw new Error(EVENT_PHOTO_CLEANUP_REQUEST_LIST_FAILED)
  }

  return data.map((row) => ({ id: row.id }))
}
