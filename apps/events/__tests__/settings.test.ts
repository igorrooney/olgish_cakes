import { beforeEach, describe, expect, it, vi } from 'vitest'

interface SupabaseResult {
  data: unknown
  error: { message: string } | null
}

interface Query {
  select: (columns?: string) => Query
  eq: (column: string, value: unknown) => Query
  maybeSingle: () => Promise<SupabaseResult>
  single: () => Promise<SupabaseResult>
}

const state = vi.hoisted(() => ({
  results: [] as SupabaseResult[],
  inserts: [] as unknown[],
  upserts: [] as unknown[],
  filters: [] as Array<{ column: string; value: unknown }>
}))

function nextResult(): SupabaseResult {
  return state.results.shift() ?? { data: null, error: null }
}

function makeQuery(): Query {
  const query: Query = {
    select: () => query,
    eq: (column: string, value: unknown) => {
      state.filters.push({ column, value })
      return query
    },
    maybeSingle: () => Promise.resolve(nextResult()),
    single: () => Promise.resolve(nextResult())
  }

  return query
}

vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdmin: () => ({
    from: (table: string) => {
      if (table !== 'event_photo_settings') {
        throw new Error(`Unexpected table: ${table}`)
      }

      return {
        select: makeQuery().select,
        insert: (payload: unknown) => {
          state.inserts.push(payload)
          return makeQuery()
        },
        upsert: (payload: unknown) => {
          state.upserts.push(payload)
          return makeQuery()
        }
      }
    }
  })
}))

import {
  getEventPhotoSettings,
  updateEventPhotoSettings
} from '@/lib/settings'

describe('event photo settings data access', () => {
  beforeEach(() => {
    state.results = []
    state.inserts = []
    state.upserts = []
    state.filters = []
  })

  it('returns existing singleton settings', async () => {
    state.results.push({
      data: {
        id: true,
        event_name: 'Leeds Market',
        max_images: 3,
        created_at: '2026-05-20T00:00:00.000Z',
        updated_at: '2026-05-20T00:00:00.000Z'
      },
      error: null
    })

    await expect(getEventPhotoSettings()).resolves.toEqual({
      eventName: 'Leeds Market',
      maxImages: 3
    })
    expect(state.filters).toContainEqual({ column: 'id', value: true })
    expect(state.inserts).toHaveLength(0)
  })

  it('creates default settings when the singleton row is missing', async () => {
    state.results.push(
      { data: null, error: null },
      {
        data: {
          id: true,
          event_name: 'Olgish Cakes event',
          max_images: 1,
          created_at: '2026-05-20T00:00:00.000Z',
          updated_at: '2026-05-20T00:00:00.000Z'
        },
        error: null
      }
    )

    await expect(getEventPhotoSettings()).resolves.toEqual({
      eventName: 'Olgish Cakes event',
      maxImages: 1
    })
    expect(state.inserts[0]).toEqual({
      id: true,
      event_name: 'Olgish Cakes event',
      max_images: 1
    })
  })

  it('upserts admin changes to the singleton row', async () => {
    state.results.push({
      data: {
        id: true,
        event_name: 'Festival',
        max_images: 5,
        created_at: '2026-05-20T00:00:00.000Z',
        updated_at: '2026-05-20T00:00:00.000Z'
      },
      error: null
    })

    await expect(updateEventPhotoSettings({
      eventName: 'Festival',
      maxImages: 5
    })).resolves.toEqual({
      eventName: 'Festival',
      maxImages: 5
    })
    expect(state.upserts[0]).toMatchObject({
      id: true,
      event_name: 'Festival',
      max_images: 5
    })
  })

  it('throws contextual errors when settings cannot be loaded', async () => {
    state.results.push({ data: null, error: { message: 'database offline' } })

    await expect(getEventPhotoSettings()).rejects.toThrow(
      'Could not load event settings: database offline'
    )
  })
})
