import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { EventPhotoRequestRow } from '@/lib/types/database'

interface SupabaseError {
  message: string
}

interface SupabaseResult {
  data: unknown
  error: SupabaseError | null
}

interface Query {
  select: (columns?: string) => Query
  insert: (payload: unknown) => Query
  update: (payload: unknown) => Query
  order: (column: string, options?: unknown) => Query
  eq: (column: string, value: unknown) => Query | Promise<SupabaseResult>
  in: (column: string, values: unknown[]) => Query
  lt: (column: string, value: unknown) => Query
  not: (column: string, operator: string, value: unknown) => Promise<SupabaseResult>
  single: () => Promise<SupabaseResult>
  maybeSingle: () => Promise<SupabaseResult>
  then: <TResult1 = SupabaseResult, TResult2 = never>(
    onfulfilled?: ((value: SupabaseResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ) => Promise<TResult1 | TResult2>
}

const state = vi.hoisted(() => ({
  fromTables: [] as string[],
  results: [] as SupabaseResult[],
  inserts: [] as unknown[],
  updates: [] as unknown[],
  selects: [] as Array<string | undefined>,
  orders: [] as Array<{ column: string; options?: unknown }>,
  filters: [] as Array<{ method: string; args: unknown[] }>
}))

function nextResult(): SupabaseResult {
  return state.results.shift() ?? { data: [], error: null }
}

vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdmin: () => ({
    from: (table: string) => {
      state.fromTables.push(table)
      let mode: 'select' | 'insert' | 'update' = 'select'
      const resolve = () => Promise.resolve(nextResult())
      const query: Query = {
        select: (columns?: string) => {
          state.selects.push(columns)
          return query
        },
        insert: (payload: unknown) => {
          mode = 'insert'
          state.inserts.push(payload)
          return query
        },
        update: (payload: unknown) => {
          mode = 'update'
          state.updates.push(payload)
          return query
        },
        order: (column: string, options?: unknown) => {
          state.orders.push({ column, options })
          return query
        },
        eq: (column: string, value: unknown) => {
          state.filters.push({ method: 'eq', args: [column, value] })
          return mode === 'update' ? resolve() : query
        },
        in: (column: string, values: unknown[]) => {
          state.filters.push({ method: 'in', args: [column, values] })
          return query
        },
        lt: (column: string, value: unknown) => {
          state.filters.push({ method: 'lt', args: [column, value] })
          return query
        },
        not: (column: string, operator: string, value: unknown) => {
          state.filters.push({ method: 'not', args: [column, operator, value] })
          return resolve()
        },
        single: resolve,
        maybeSingle: resolve,
        then: (onfulfilled, onrejected) => resolve().then(onfulfilled, onrejected)
      }

      return query
    }
  })
}))

import {
  createEventPhotoRequest,
  getEventPhotoRequest,
  getSentEventPhotoRequest,
  listEventNames,
  listEventPhotoRequests,
  listRequestsForCleanup,
  updateTelegramStatus
} from '@/lib/requests'

const requestRow: EventPhotoRequestRow = {
  id: 'request-1',
  full_name: 'Anna Smith',
  email: 'anna@example.com',
  event_name: 'Market',
  image_count: 1,
  image_filenames: ['photo.jpg'],
  image_mime_types: ['image/jpeg'],
  image_sizes: [1234],
  temp_image_bucket: 'event-photo-temp-uploads',
  temp_image_paths: ['incoming/photo.jpg'],
  telegram_status: 'pending',
  telegram_message_ids: [],
  telegram_error: null,
  files_deleted_at: null,
  source: 'events-subdomain',
  created_at: '2026-05-20T12:00:00.000Z',
  updated_at: '2026-05-20T12:00:00.000Z'
}

describe('event photo request data access', () => {
  beforeEach(() => {
    state.fromTables = []
    state.results = []
    state.inserts = []
    state.updates = []
    state.selects = []
    state.orders = []
    state.filters = []
  })

  it('maps public request input to the database insert shape', async () => {
    state.results.push({ data: requestRow, error: null })

    await expect(createEventPhotoRequest({
      fullName: 'Anna Smith',
      email: 'anna@example.com',
      eventName: 'Market',
      imageFilenames: ['photo.jpg'],
      imageMimeTypes: ['image/jpeg'],
      imageSizes: [1234],
      tempImageBucket: 'event-photo-temp-uploads',
      tempImagePaths: ['incoming/photo.jpg']
    })).resolves.toBe(requestRow)

    expect(state.fromTables).toEqual(['event_photo_requests'])
    expect(state.inserts[0]).toMatchObject({
      full_name: 'Anna Smith',
      email: 'anna@example.com',
      event_name: 'Market',
      image_count: 1,
      telegram_status: 'pending'
    })
  })

  it('applies event-name filters and returns matching rows', async () => {
    state.results.push({ data: [requestRow], error: null })

    await expect(listEventPhotoRequests({ eventName: 'Market' })).resolves.toEqual([requestRow])

    expect(state.orders).toContainEqual({
      column: 'created_at',
      options: { ascending: false }
    })
    expect(state.filters).toContainEqual({
      method: 'eq',
      args: ['event_name', 'Market']
    })
  })

  it('loads detail and sent-success rows by id', async () => {
    state.results.push(
      { data: requestRow, error: null },
      { data: { id: requestRow.id }, error: null }
    )

    await expect(getEventPhotoRequest(requestRow.id)).resolves.toBe(requestRow)
    await expect(getSentEventPhotoRequest(requestRow.id)).resolves.toEqual({ id: requestRow.id })

    expect(state.filters).toContainEqual({ method: 'eq', args: ['id', requestRow.id] })
    expect(state.filters).toContainEqual({ method: 'eq', args: ['telegram_status', 'sent'] })
  })

  it('deduplicates event names for the admin filter', async () => {
    state.results.push({
      data: [
        { event_name: 'Market' },
        { event_name: 'Market' },
        { event_name: 'Festival' }
      ],
      error: null
    })

    await expect(listEventNames()).resolves.toEqual(['Market', 'Festival'])
  })

  it('updates Telegram state and optionally clears temporary paths', async () => {
    state.results.push({ data: null, error: null })

    await updateTelegramStatus(requestRow.id, 'sent', [101], null, true)

    expect(state.updates[0]).toMatchObject({
      telegram_status: 'sent',
      telegram_message_ids: [101],
      telegram_error: null,
      temp_image_paths: []
    })
    expect(state.updates[0]).toHaveProperty('files_deleted_at')
  })

  it('loads stale rows that still have temp paths for cleanup', async () => {
    state.results.push({ data: [requestRow], error: null })

    await expect(listRequestsForCleanup('2026-05-20T00:00:00.000Z')).resolves.toEqual([requestRow])

    expect(state.filters).toContainEqual({
      method: 'in',
      args: ['telegram_status', ['pending', 'failed', 'sent']]
    })
    expect(state.filters).toContainEqual({
      method: 'not',
      args: ['temp_image_paths', 'eq', '{}']
    })
  })

  it('throws contextual errors from Supabase failures', async () => {
    state.results.push(
      { data: null, error: { message: 'insert offline' } },
      { data: null, error: { message: 'list offline' } },
      { data: null, error: { message: 'detail offline' } },
      { data: null, error: { message: 'success offline' } },
      { data: null, error: { message: 'names offline' } },
      { data: null, error: { message: 'update offline' } },
      { data: null, error: { message: 'cleanup offline' } }
    )

    await expect(createEventPhotoRequest({
      fullName: 'Anna Smith',
      email: 'anna@example.com',
      eventName: 'Market',
      imageFilenames: ['photo.jpg'],
      imageMimeTypes: ['image/jpeg'],
      imageSizes: [1234],
      tempImageBucket: 'event-photo-temp-uploads',
      tempImagePaths: ['incoming/photo.jpg']
    })).rejects.toThrow('Could not save event request: insert offline')

    await expect(listEventPhotoRequests()).rejects.toThrow(
      'Could not load event requests: list offline'
    )
    await expect(getEventPhotoRequest(requestRow.id)).rejects.toThrow(
      'Could not load event request: detail offline'
    )
    await expect(getSentEventPhotoRequest(requestRow.id)).rejects.toThrow(
      'Could not verify event request: success offline'
    )
    await expect(listEventNames()).rejects.toThrow(
      'Could not load event names: names offline'
    )
    await expect(updateTelegramStatus(requestRow.id, 'failed', [], 'failed', false)).rejects.toThrow(
      'Could not update Telegram status: update offline'
    )
    await expect(listRequestsForCleanup('2026-05-20T00:00:00.000Z')).rejects.toThrow(
      'Could not load cleanup requests: cleanup offline'
    )
  })
})
