import { beforeEach, describe, expect, it, vi } from 'vitest'

import type {
  EventPhotoLinkClickRow,
  EventPhotoRequestRow
} from '@/lib/types/database'

interface SupabaseError {
  message: string
}

interface SupabaseResult {
  data: unknown
  error: SupabaseError | null
}

interface Query {
  select: (columns?: string) => Query
  insert: (payload: unknown) => Promise<SupabaseResult>
  order: (column: string, options?: unknown) => Query
  eq: (column: string, value: unknown) => Query
  limit: (limit: number) => Promise<SupabaseResult>
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
  selects: [] as Array<string | undefined>,
  orders: [] as Array<{ column: string; options?: unknown }>,
  filters: [] as Array<{ method: string; args: unknown[] }>,
  limits: [] as number[]
}))

function nextResult(): SupabaseResult {
  return state.results.shift() ?? { data: [], error: null }
}

vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdmin: () => ({
    from: (table: string) => {
      state.fromTables.push(table)
      const resolve = () => Promise.resolve(nextResult())
      const query: Query = {
        select: (columns?: string) => {
          state.selects.push(columns)
          return query
        },
        insert: (payload: unknown) => {
          state.inserts.push(payload)
          return resolve()
        },
        order: (column: string, options?: unknown) => {
          state.orders.push({ column, options })
          return query
        },
        eq: (column: string, value: unknown) => {
          state.filters.push({ method: 'eq', args: [column, value] })
          return query
        },
        limit: (limit: number) => {
          state.limits.push(limit)
          return resolve()
        },
        maybeSingle: resolve,
        then: (onfulfilled, onrejected) => resolve().then(onfulfilled, onrejected)
      }

      return query
    }
  })
}))

import {
  buildTrackedFeatureLinkHref,
  getFeatureLinkByKey,
  listEventPhotoLinkClickSummary,
  listRecentEventPhotoLinkClicks,
  recordEventPhotoLinkClick
} from '@/lib/link-clicks'

const requestRow = {
  id: '2a1024bc-5b7e-4d6e-a602-2c84d9c678f0',
  event_name: 'Market'
} as Pick<EventPhotoRequestRow, 'id' | 'event_name'>

const clickRows: EventPhotoLinkClickRow[] = [
  {
    id: 1,
    request_id: requestRow.id,
    event_name: 'Market',
    link_key: 'gift-hampers',
    link_title: 'Gift hampers',
    link_href: 'https://olgishcakes.co.uk/gift-hampers',
    clicked_at: '2026-07-08T18:00:00.000Z'
  },
  {
    id: 2,
    request_id: requestRow.id,
    event_name: 'Market',
    link_key: 'gift-hampers',
    link_title: 'Gift hampers',
    link_href: 'https://olgishcakes.co.uk/gift-hampers',
    clicked_at: '2026-07-08T18:01:00.000Z'
  },
  {
    id: 3,
    request_id: requestRow.id,
    event_name: 'Market',
    link_key: 'custom-cakes',
    link_title: 'Custom cakes',
    link_href: 'https://olgishcakes.co.uk/cakes',
    clicked_at: '2026-07-08T18:02:00.000Z'
  }
]

describe('event photo link click data access', () => {
  beforeEach(() => {
    state.fromTables = []
    state.results = []
    state.inserts = []
    state.selects = []
    state.orders = []
    state.filters = []
    state.limits = []
  })

  it('looks up feature links and builds tracked success hrefs', () => {
    expect(getFeatureLinkByKey('gift-hampers')).toMatchObject({
      title: 'Gift hampers',
      href: 'https://olgishcakes.co.uk/gift-hampers'
    })
    expect(getFeatureLinkByKey('unknown')).toBeNull()
    expect(buildTrackedFeatureLinkHref('gift-hampers', requestRow.id)).toBe(
      `/success/link/gift-hampers?r=${requestRow.id}`
    )
  })

  it('records a click for a sent request using known link metadata', async () => {
    state.results.push(
      { data: requestRow, error: null },
      { data: null, error: null }
    )

    await expect(recordEventPhotoLinkClick({
      requestId: requestRow.id,
      linkKey: 'gift-hampers'
    })).resolves.toMatchObject({
      recorded: true,
      link: {
        key: 'gift-hampers'
      }
    })

    expect(state.fromTables).toEqual(['event_photo_requests', 'event_photo_link_clicks'])
    expect(state.filters).toContainEqual({ method: 'eq', args: ['id', requestRow.id] })
    expect(state.filters).toContainEqual({ method: 'eq', args: ['telegram_status', 'sent'] })
    expect(state.inserts[0]).toMatchObject({
      request_id: requestRow.id,
      event_name: 'Market',
      link_key: 'gift-hampers',
      link_title: 'Gift hampers',
      link_href: 'https://olgishcakes.co.uk/gift-hampers'
    })
  })

  it('does not record unknown links or unsent requests', async () => {
    await expect(recordEventPhotoLinkClick({
      requestId: requestRow.id,
      linkKey: 'unknown'
    })).resolves.toBeNull()

    state.results.push({ data: null, error: null })

    await expect(recordEventPhotoLinkClick({
      requestId: requestRow.id,
      linkKey: 'gift-hampers'
    })).resolves.toMatchObject({
      recorded: false
    })

    expect(state.inserts).toEqual([])
  })

  it('summarizes clicks and applies event-name filters', async () => {
    state.results.push({ data: clickRows, error: null })

    await expect(listEventPhotoLinkClickSummary({ eventName: 'Market' })).resolves.toEqual([
      {
        linkKey: 'gift-hampers',
        linkTitle: 'Gift hampers',
        linkHref: 'https://olgishcakes.co.uk/gift-hampers',
        totalClicks: 2
      },
      {
        linkKey: 'custom-cakes',
        linkTitle: 'Custom cakes',
        linkHref: 'https://olgishcakes.co.uk/cakes',
        totalClicks: 1
      }
    ])

    expect(state.filters).toContainEqual({ method: 'eq', args: ['event_name', 'Market'] })
    expect(state.orders).toContainEqual({
      column: 'clicked_at',
      options: { ascending: false }
    })
  })

  it('loads recent clicks in admin display shape', async () => {
    const recentRow = {
      ...clickRows[0],
      event_photo_requests: {
        email: 'anna@example.com'
      }
    }
    state.results.push({ data: [recentRow], error: null })

    await expect(listRecentEventPhotoLinkClicks({ eventName: 'Market', limit: 5 })).resolves.toEqual([
      {
        id: 1,
        requestId: requestRow.id,
        email: 'anna@example.com',
        eventName: 'Market',
        linkKey: 'gift-hampers',
        linkTitle: 'Gift hampers',
        linkHref: 'https://olgishcakes.co.uk/gift-hampers',
        clickedAt: '2026-07-08T18:00:00.000Z'
      }
    ])

    expect(state.limits).toEqual([5])
  })

  it('throws contextual errors from Supabase failures', async () => {
    state.results.push(
      { data: null, error: { message: 'request offline' } },
      { data: requestRow, error: null },
      { data: null, error: { message: 'insert offline' } },
      { data: null, error: { message: 'summary offline' } },
      { data: null, error: { message: 'recent offline' } }
    )

    await expect(recordEventPhotoLinkClick({
      requestId: requestRow.id,
      linkKey: 'gift-hampers'
    })).rejects.toThrow('Could not verify link click request: request offline')

    await expect(recordEventPhotoLinkClick({
      requestId: requestRow.id,
      linkKey: 'gift-hampers'
    })).rejects.toThrow('Could not record link click: insert offline')

    await expect(listEventPhotoLinkClickSummary()).rejects.toThrow(
      'Could not load link click summary: summary offline'
    )
    await expect(listRecentEventPhotoLinkClicks()).rejects.toThrow(
      'Could not load recent link clicks: recent offline'
    )
  })
})
