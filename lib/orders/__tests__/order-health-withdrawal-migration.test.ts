/**
 * @jest-environment node
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const migration = readFileSync(
  join(
    process.cwd(),
    'supabase',
    'migrations',
    '20260823153000_atomic_order_health_withdrawal.sql'
  ),
  'utf8'
).toLowerCase()

describe('atomic order health-withdrawal migration', () => {
  it('locks the selected order and updates only the protected metadata keys', () => {
    expect(migration).toContain('create or replace function public.withdraw_order_dietary_health_information')
    expect(migration).toContain('for update')
    expect(migration).toContain("coalesce(metadata, '{}'::jsonb) - 'dietaryhealthinformation'")
    expect(migration).toContain("jsonb_build_object(\n        'dietaryhealthconsent', false")
    expect(migration).toContain("'dietaryhealthwithdrawnat', server_withdrawn_at")
    expect(migration).toContain('server_withdrawn_at := clock_timestamp()')
    expect(migration).toContain("jsonb_typeof(selected_order.metadata->'dietaryhealthinformation')")
    expect(migration).not.toContain('p_metadata')
  })

  it('supports not-found, no-active, withdrawn and idempotent outcomes', () => {
    expect(migration).toContain("'not-found'::text")
    expect(migration).toContain("'no-active-information'::text")
    expect(migration).toContain("'withdrawn'::text")
    expect(migration).toContain("'already-withdrawn'::text")
    expect(migration).toContain("metadata->>'dietaryhealthwithdrawnat'")
  })

  it('is invoker-safe and executable only by the service role', () => {
    expect(migration).toContain('security invoker')
    expect(migration).toContain("set search_path = ''")
    expect(migration).toContain('from public, anon, authenticated')
    expect(migration).toContain('to service_role')
    expect(migration).not.toContain('to public;')
    expect(migration).not.toContain('to anon;')
    expect(migration).not.toContain('to authenticated;')
  })

  it('prevents later stale order writes from resurrecting withdrawn health content', () => {
    expect(migration).toContain('create or replace function public.preserve_withdrawn_order_health_evidence')
    expect(migration).toContain("old.metadata->>'dietaryhealthwithdrawnat'")
    expect(migration).toContain("when jsonb_typeof(new.metadata) = 'object' then new.metadata")
    expect(migration).toContain("- 'dietaryhealthinformation'")
    expect(migration).toContain("- 'dietaryhealthconsentversion'")
    expect(migration).toContain("- 'dietaryhealthconsentedat'")
    expect(migration).toContain("- 'dietaryhealthwithdrawnat'")
    expect(migration).toContain("'dietaryhealthconsent', false")
    expect(migration).toContain("old.metadata->'dietaryhealthconsentversion'")
    expect(migration).toContain("old.metadata->'dietaryhealthconsentedat'")
    expect(migration).toContain("old.metadata->'dietaryhealthwithdrawnat'")
    expect(migration).toContain('before update of metadata on public.orders')
    expect(migration).toContain('execute function public.preserve_withdrawn_order_health_evidence()')
  })
})
