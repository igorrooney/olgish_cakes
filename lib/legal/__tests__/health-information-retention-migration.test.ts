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
    '20260825130000_add_health_information_retention.sql'
  ),
  'utf8'
).toLowerCase()

const schemaPrelude = migration.slice(
  0,
  migration.indexOf('create or replace function')
)
const legacyOrderScheduleDefinition = migration.slice(
  migration.indexOf('create or replace function public.schedule_legacy_order_health_retention'),
  migration.indexOf('create or replace function public.erase_due_enquiry_dietary_health_information')
)
const erasureDefinitions = migration.slice(
  migration.indexOf('create or replace function public.erase_due_enquiry_dietary_health_information'),
  migration.indexOf('revoke all on function public.manage_enquiry_health_retention_evidence')
)

describe('dietary-health minimisation migration', () => {
  it('adds separate due and erasure evidence without guessing legacy dates', () => {
    for (const table of [
      'contact_enquiries',
      'custom_cake_enquiries',
      'workshop_enquiries',
      'orders'
    ]) {
      expect(migration).toContain(`alter table public.${table}`)
    }

    expect(migration).toContain('add column if not exists dietary_health_retention_due_at timestamptz')
    expect(migration).toContain('add column if not exists dietary_health_erased_at timestamptz')
    expect(schemaPrelude).not.toMatch(/\bupdate\s+public\./)
  })

  it('models never-supplied, active, withdrawn and retention-erased enquiry states', () => {
    expect(migration).toContain('dietary_health_information is not null')
    expect(migration).toContain('dietary_health_consent = true')
    expect(migration).toContain('dietary_health_withdrawn_at is not null')
    expect(migration).toContain('dietary_health_erased_at is not null')
    expect(migration).toContain('dietary_health_erased_at >= dietary_health_retention_due_at')
    expect(migration).toContain('orders_dietary_health_retention_check')
    expect(migration).toContain('not valid')
  })

  it('uses database-controlled lifecycle evidence for the 30-day deadline', () => {
    expect(migration).toContain('clock_timestamp() + interval \'30 days\'')
    expect(migration).toContain("old.lifecycle_status not in ('closed', 'converted')")
    expect(migration).toContain("new.lifecycle_status in ('closed', 'converted')")
    expect(migration).toContain("new.status in ('completed', 'delivered', 'cancelled')")
    expect(migration).toContain('create or replace function public.apply_verified_order_health_retention_deadline')
    expect(migration).toContain("new.action <> 'terminal-date-recorded'")
    expect(migration).toContain("set_config('app.health_retention_lifecycle', 'allowed', true)")
    expect(migration).toContain('and dietary_health_retention_due_at is null')
    expect(migration).toContain('before update on public.contact_enquiries')
    expect(migration).toContain('before insert or update on public.orders')
  })

  it('provides an explicit server-now lifecycle action for terminal legacy records', () => {
    expect(migration).toContain('create or replace function public.schedule_legacy_enquiry_health_retention')
    expect(migration).toContain('create or replace function public.schedule_legacy_order_health_retention')
    expect(migration).toContain("selected_lifecycle_status not in ('closed', 'converted')")
    expect(legacyOrderScheduleDefinition).toContain(
      "selected_order.status not in ('completed', 'delivered', 'cancelled')"
    )
    expect(legacyOrderScheduleDefinition).not.toContain("payment_status in ('refunded', 'cancelled')")
    expect(migration).toContain("'health-retention-scheduled'")
    expect(migration).toContain("'server-action'")
    expect(migration).toContain("set_config('app.health_retention_legacy_schedule', 'allowed', true)")
    expect(migration).toContain("return query select 'already-scheduled'::text")
    expect(migration).not.toContain('p_effective_on date')
  })

  it('provides atomic claim-aware and hold-aware due-erasure RPCs', () => {
    expect(migration).toContain('create or replace function public.erase_due_enquiry_dietary_health_information')
    expect(migration).toContain('create or replace function public.erase_due_order_dietary_health_information')
    expect(migration).toContain('for update')
    expect(migration).toContain('pg_try_advisory_xact_lock')
    expect(migration).toContain('privacy_retention_deletion_claims')
    expect(migration).toContain('health_retention_deletion_claim_active')
    expect(migration).toContain('health_retention_legal_hold_active')
    expect(migration).toContain('health_retention_deadline_missing')
    expect(migration).toContain('health_retention_not_due')
    expect(migration).toContain("set_config('app.health_retention_erasure', 'allowed', true)")
    expect(migration).toContain("return query select 'already-erased'::text")
    expect(erasureDefinitions).toContain(
      "claim.state in ('claimed', 'external-delete', 'retryable')"
    )
    expect(erasureDefinitions).not.toContain("claim.state <> 'finalized'")
  })

  it('erases only health content while preserving consent and lifecycle evidence', () => {
    expect(migration).toContain('dietary_health_information = null')
    expect(migration).toContain('dietary_health_consent = false')
    expect(migration).toContain('dietary_health_erased_at = server_erased_at')
    expect(migration).toContain("- 'dietaryhealthinformation' - 'dietaryhealthwithdrawnat'")
    expect(migration).toContain("jsonb_build_object('dietaryhealthconsent', false)")
    expect(migration).toContain('new.dietary_health_consent_version := old.dietary_health_consent_version')
    expect(migration).toContain('new.dietary_health_consented_at := old.dietary_health_consented_at')
  })

  it('keeps RPC execution service-role only and responses content-free', () => {
    expect(migration).toContain(
      'revoke all on function public.erase_due_enquiry_dietary_health_information(text, text)'
    )
    expect(migration).toContain(
      'grant execute on function public.erase_due_enquiry_dietary_health_information(text, text)\n  to service_role'
    )
    expect(migration).toContain(
      'revoke all on function public.erase_due_order_dietary_health_information(text)'
    )
    expect(migration).toContain(
      'grant execute on function public.erase_due_order_dietary_health_information(text)\n  to service_role'
    )
    expect(migration).toContain(
      'revoke all on function public.schedule_legacy_enquiry_health_retention(text, text)'
    )
    expect(migration).toContain(
      'grant execute on function public.schedule_legacy_order_health_retention(text)\n  to service_role'
    )
    expect(migration).toContain('returns table (\n  status text,\n  erased_at timestamptz\n)')
  })
})
