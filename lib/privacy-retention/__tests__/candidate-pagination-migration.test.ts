/**
 * @jest-environment node
 */

import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const migrationsDirectory = join(
  process.cwd(),
  'supabase',
  'migrations'
)

const migration = readFileSync(join(
  migrationsDirectory,
  '20260825140000_add_privacy_retention_candidate_pagination.sql'
), 'utf8')

const relatedRetentionMigrations = readdirSync(migrationsDirectory)
  .filter(fileName => /^202608251(?:20000|22500|30000|40000|50000|60000)_.+\.sql$/.test(fileName))
  .map(fileName => ({
    fileName,
    sql: readFileSync(join(migrationsDirectory, fileName), 'utf8')
  }))

describe('privacy-retention candidate paging migration', () => {
  it('uses a bounded global page with stable ordering and authoritative totals', () => {
    expect(migration).toContain('list_privacy_retention_candidate_page')
    expect(migration).toContain('order by due_at, candidate_id')
    expect(migration).toContain('(paging.effective_page - 1) * p_page_size::bigint')
    expect(migration).toContain("'page', (select paging.effective_page from paging)")
    expect(migration).toContain('limit p_page_size')
    expect(migration).toContain("'totalCount', (select paging.total_count from paging)")
    expect(migration).toContain("'dueCount', (select count(*)::bigint from candidate_index where not held)")
    expect(migration).toContain("'heldCount', (select count(*)::bigint from candidate_index where held)")
    expect(migration).toContain("'categoryCounts'")
    expect(migration).not.toContain('limit 250')
  })

  it('allows only one pending action for a candidate across concurrent runs', () => {
    expect(migration).toContain(
      'privacy_retention_actions_one_pending_candidate_idx'
    )
    expect(migration).toContain('on public.privacy_retention_actions (candidate_id)')
    expect(migration).toContain("where outcome = 'pending'")
    expect(migration).toContain(
      'RETENTION_PENDING_ACTION_DUPLICATES_REQUIRE_RECONCILIATION'
    )
  })

  it('selects the cheap index page before computing any row digest', () => {
    const pageFunction = migration.slice(
      migration.indexOf('create or replace function public.list_privacy_retention_candidate_page'),
      migration.indexOf('create or replace function public.get_privacy_retention_candidate_revision')
    )

    expect(pageFunction).toContain('from public.privacy_retention_candidate_index_rows(p_cutoff)')
    expect(pageFunction).toContain('page_index as materialized')
    expect(pageFunction).toContain('array_agg(page_index.candidate_id)')
    expect(pageFunction).toContain('public.privacy_retention_candidate_rows(')
    expect(pageFunction.indexOf('page_index as materialized'))
      .toBeLessThan(pageFunction.indexOf('public.privacy_retention_candidate_rows('))
  })

  it('uses the portable built-in SHA-256 function for every snapshot digest', () => {
    const sha256References = relatedRetentionMigrations.flatMap(({ fileName, sql }) =>
      Array.from(sql.matchAll(/(?:(?<schema>[a-z_][a-z0-9_]*)\.)?sha256\(/gi), match => ({
        fileName,
        reference: match[0],
        schema: match.groups?.schema
      }))
    )
    const digestReferences = relatedRetentionMigrations.flatMap(({ fileName, sql }) =>
      Array.from(sql.matchAll(/(?:(?:[a-z_][a-z0-9_]*)\.)?digest\(/gi), match => ({
        fileName,
        reference: match[0]
      }))
    )

    expect(sha256References).toHaveLength(15)
    expect(sha256References).toEqual(
      sha256References.map(reference => ({
        ...reference,
        reference: 'pg_catalog.sha256(',
        schema: 'pg_catalog'
      }))
    )
    expect(digestReferences).toEqual([])
  })

  it('counts full order cascades and fingerprints every parent and child row', () => {
    expect(migration).toContain("'order', to_jsonb(orders)")
    expect(migration).toContain("jsonb_agg(to_jsonb(item) order by item.id)")
    expect(migration).toContain("jsonb_agg(to_jsonb(message) order by message.id)")
    expect(migration).toContain("jsonb_agg(to_jsonb(attachment) order by attachment.id)")
    expect(migration).toContain("jsonb_agg(to_jsonb(note) order by note.id)")
    expect(migration).toContain("jsonb_agg(to_jsonb(image) order by image.id)")
    expect(migration).toContain('coalesce(children.item_rows, 0)')
    expect(migration).toContain('coalesce(storage.storage_count, 0)')
    expect(migration).toContain("'linkedEnquiries', coalesce(linked.revisions, '[]'::jsonb)")
    expect(migration).toContain("'contact:' || enquiry.id::text as record_key")
    expect(migration).toContain('to_jsonb(enquiry) as revision')
  })

  it('does not duplicate health work already covered by a due full record', () => {
    expect(migration.match(/enquiry\.lifecycle_status = 'closed'/g)?.length)
      .toBeGreaterThanOrEqual(6)
    expect(migration.match(/due_order\.retention_due_at <= p_cutoff/g))
      .toHaveLength(6)
    expect(migration).toContain("orders.status in ('completed', 'delivered', 'cancelled')")
    expect(migration).toContain('orders.retention_due_at <= p_cutoff')
    expect(migration.match(/orders\.retention_due_at <= p_cutoff/g)?.length)
      .toBeGreaterThanOrEqual(6)
  })

  it('excludes a converted enquiry upload when its linked full order is due', () => {
    expect(migration.match(/enquiry-upload:custom-cake:/g)?.length)
      .toBeGreaterThanOrEqual(4)
    expect(migration.match(/orders\.retention_due_at <= p_cutoff/g)?.length)
      .toBeGreaterThanOrEqual(7)
  })

  it('keeps legal holds in totals and fixes the event-photo bucket identity', () => {
    expect(migration).toContain('enforce_canonical_retention_storage_bucket')
    expect(migration).toContain("canonical_bucket := 'event-photo-temp-uploads'")
    expect(migration).toContain("canonical_bucket := 'custom-cake-enquiries'")
    expect(migration).toContain('list_noncanonical_retention_storage_records')
    expect(migration).toContain('orders.legal_hold or coalesce(linked.held, false)')
    expect(migration).toContain("on holds.record_type = 'event-photo-rate-limits'")
  })

  it('orders noncanonical storage records through named derived-table columns', () => {
    const functionStart = migration.indexOf(
      'create or replace function public.list_noncanonical_retention_storage_records'
    )
    const functionEnd = migration.indexOf(
      'create index if not exists contact_enquiries_retention_page_idx',
      functionStart
    )
    const definition = migration.slice(functionStart, functionEnd)

    expect(definition).toContain("'event-photo-request'::text as record_type")
    expect(definition).toContain("'event-photo-' || request.id::text as record_reference")
    expect(definition).toContain(') as records')
    expect(definition).toContain(
      'order by records.record_type, records.record_reference'
    )
    expect(definition).not.toMatch(/^\s*order by record_type, record_reference$/m)
  })

  it('deletes security evidence in the same deterministic 500-row batch that was signed', () => {
    expect(migration.match(/limit 500/g)?.length).toBeGreaterThanOrEqual(6)
    expect(migration).toContain('order by updated_at, scope, identifier, window_start')
    expect(migration).toContain('order by failed_at, id')
    expect(migration).toContain('order by attempted_at, id')
    expect(migration).toContain('with targets as materialized')
    expect(migration).toContain(
      'on public.enquiry_rate_limits (updated_at, scope, identifier, window_start)'
    )
    expect(migration).toContain(
      'on public.admin_login_attempts (failed_at, id)'
    )
    expect(migration).toContain(
      'on public.event_photo_rate_limit_attempts (attempted_at, id)'
    )
  })

  it('exposes paging and exact revision reads only to the service role', () => {
    expect(migration).toContain(
      'revoke all on function public.list_privacy_retention_candidate_page(timestamptz, integer, integer)'
    )
    expect(migration).toContain(
      'grant execute on function public.list_privacy_retention_candidate_page(timestamptz, integer, integer)'
    )
    expect(migration).toContain(
      'grant execute on function public.get_privacy_retention_candidate_revision(text, timestamptz)'
    )
  })
})
