import { FEATURE_LINKS } from '@/lib/constants'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import type {
  EventPhotoLinkClickInsert,
  EventPhotoLinkClickRow
} from '@/lib/types/database'

export type FeatureLink = (typeof FEATURE_LINKS)[number]

export interface EventPhotoLinkClickListFilters {
  eventName?: string
}

export interface EventPhotoLinkClickSummaryRow {
  linkKey: string
  linkTitle: string
  linkHref: string
  totalClicks: number
}

export interface RecentEventPhotoLinkClickRow {
  id: number
  requestId: string
  email: string
  eventName: string
  linkKey: string
  linkTitle: string
  linkHref: string
  clickedAt: string
}

export interface RecordEventPhotoLinkClickInput {
  requestId: string
  linkKey: string
}

export interface RecordEventPhotoLinkClickResult {
  link: FeatureLink
  recorded: boolean
}

export function getFeatureLinkByKey(linkKey: string): FeatureLink | null {
  return FEATURE_LINKS.find((link) => link.key === linkKey) ?? null
}

export function buildTrackedFeatureLinkHref(linkKey: string, requestId: string): string {
  return `/success/link/${encodeURIComponent(linkKey)}?r=${encodeURIComponent(requestId)}`
}

export async function recordEventPhotoLinkClick(
  input: RecordEventPhotoLinkClickInput
): Promise<RecordEventPhotoLinkClickResult | null> {
  const link = getFeatureLinkByKey(input.linkKey)

  if (!link) {
    return null
  }

  const supabase = getSupabaseAdmin()
  const { data: requestRow, error: requestError } = await supabase
    .from('event_photo_requests')
    .select('id,event_name')
    .eq('id', input.requestId)
    .eq('telegram_status', 'sent')
    .maybeSingle()

  if (requestError) {
    throw new Error(`Could not verify link click request: ${requestError.message}`)
  }

  if (!requestRow) {
    return {
      link,
      recorded: false
    }
  }

  const payload: EventPhotoLinkClickInsert = {
    request_id: requestRow.id,
    event_name: requestRow.event_name,
    link_key: link.key,
    link_title: link.title,
    link_href: link.href
  }

  const { error: insertError } = await supabase
    .from('event_photo_link_clicks')
    .insert(payload)

  if (insertError) {
    throw new Error(`Could not record link click: ${insertError.message}`)
  }

  return {
    link,
    recorded: true
  }
}

export async function listEventPhotoLinkClickSummary(
  filters: EventPhotoLinkClickListFilters = {}
): Promise<EventPhotoLinkClickSummaryRow[]> {
  const rows = await listEventPhotoLinkClicks(filters)
  const summaryByKey = new Map<string, EventPhotoLinkClickSummaryRow>()

  for (const row of rows) {
    const current = summaryByKey.get(row.link_key)

    if (current) {
      current.totalClicks += 1
    } else {
      summaryByKey.set(row.link_key, {
        linkKey: row.link_key,
        linkTitle: row.link_title,
        linkHref: row.link_href,
        totalClicks: 1
      })
    }
  }

  return [...summaryByKey.values()].sort((left, right) => (
    right.totalClicks - left.totalClicks || left.linkTitle.localeCompare(right.linkTitle)
  ))
}

export async function listRecentEventPhotoLinkClicks(
  filters: EventPhotoLinkClickListFilters & { limit?: number } = {}
): Promise<RecentEventPhotoLinkClickRow[]> {
  const supabase = getSupabaseAdmin()
  let query = supabase
    .from('event_photo_link_clicks')
    .select('*,event_photo_requests(email)')

  if (filters.eventName) {
    query = query.eq('event_name', filters.eventName)
  }

  const { data, error } = await query
    .order('clicked_at', { ascending: false })
    .limit(filters.limit ?? 10)

  if (error) {
    throw new Error(`Could not load recent link clicks: ${error.message}`)
  }

  return data.map(mapRecentClickRow)
}

async function listEventPhotoLinkClicks(
  filters: EventPhotoLinkClickListFilters
): Promise<EventPhotoLinkClickRow[]> {
  const supabase = getSupabaseAdmin()
  let query = supabase
    .from('event_photo_link_clicks')
    .select('*')

  if (filters.eventName) {
    query = query.eq('event_name', filters.eventName)
  }

  const { data, error } = await query
    .order('clicked_at', { ascending: false })

  if (error) {
    throw new Error(`Could not load link click summary: ${error.message}`)
  }

  return data
}

function mapRecentClickRow(row: EventPhotoLinkClickRow): RecentEventPhotoLinkClickRow {
  const request = row.event_photo_requests as { email?: unknown } | null | undefined

  return {
    id: row.id,
    requestId: row.request_id,
    email: typeof request?.email === 'string' ? request.email : 'Unknown',
    eventName: row.event_name,
    linkKey: row.link_key,
    linkTitle: row.link_title,
    linkHref: row.link_href,
    clickedAt: row.clicked_at
  }
}
