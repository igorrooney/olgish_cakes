import fs from 'fs'
import path from 'path'

const migration = fs.readFileSync(
  path.join(
    process.cwd(),
    'supabase/migrations/20260825150000_add_privacy_hold_claim_recovery.sql'
  ),
  'utf8'
)

const getTableDefinition = (tableName: string) => {
  const start = migration.indexOf(`create table if not exists public.${tableName}`)
  const end = migration.indexOf('\n);', start)

  if (start < 0 || end < 0) {
    throw new Error(`Missing ${tableName} definition`)
  }

  return migration.slice(start, end + 3)
}

describe('privacy-retention expired-claim hold recovery migration', () => {
  it('defines one atomic, service-role-only recovery operation', () => {
    expect(migration).toContain(
      'create or replace function public.place_privacy_retention_legal_hold_with_claim_recovery('
    )
    expect(migration).toContain('language plpgsql\nsecurity definer\nset search_path = \'\'')
    expect(migration).toContain(
      "hashtextextended('privacy-retention-candidate:' || p_candidate_id, 0)"
    )
    expect(migration).toContain('for update;')
    expect(migration).toContain(
      'grant execute on function public.place_privacy_retention_legal_hold_with_claim_recovery('
    )
    expect(migration).toContain(') to service_role;')
    expect(migration).toContain('from public, anon, authenticated;')
  })

  it('requires the server record reference and never accepts a claim token', () => {
    expect(migration).toContain(
      "'RECOVER CLAIM AND HOLD ' || selected_hold.record_reference"
    )
    expect(migration).toContain('selected_claim.claim_token')
    expect(migration).not.toMatch(/p_claim_token/i)

    const signature = migration.slice(
      migration.indexOf('create or replace function public.place_privacy_retention_legal_hold_with_claim_recovery('),
      migration.indexOf('returns table (', migration.indexOf('create or replace function public.place_privacy_retention_legal_hold_with_claim_recovery('))
    )
    expect(signature).not.toMatch(/token/i)
  })

  it('implements the fail-closed claim state matrix using the server clock', () => {
    expect(migration).toContain(
      "if not found or selected_claim.state = 'finalized' then"
    )
    expect(migration).toContain("if selected_claim.state <> 'claimed'")
    expect(migration).toContain('or selected_claim.irreversible_started')
    expect(migration).toContain('or selected_claim.claim_token is null')
    expect(migration).toContain('or selected_claim.lease_expires_at is null')
    expect(migration).toContain(
      "raise exception 'RETENTION_HOLD_RECOVERY_UNSAFE'"
    )
    expect(migration).toContain(
      'if selected_claim.lease_expires_at > clock_timestamp() then'
    )
    expect(migration).toContain(
      "raise exception 'RETENTION_HOLD_RECOVERY_CLAIM_LIVE'"
    )
  })

  it('releases the exact reversible claim before placing the hold in one function', () => {
    const releasePosition = migration.indexOf(
      'select public.release_privacy_retention_deletion_claim('
    )
    const holdPosition = migration.indexOf(
      'from public.set_privacy_retention_legal_hold('
    )
    const auditPosition = migration.indexOf(
      'insert into public.privacy_retention_claim_recovery_events ('
    )

    expect(releasePosition).toBeGreaterThan(0)
    expect(holdPosition).toBeGreaterThan(releasePosition)
    expect(auditPosition).toBeGreaterThan(holdPosition)
    expect(migration).toContain("'RETENTION_CLAIM_CANCELLED_FOR_HOLD'")
    expect(migration).toContain(
      "raise exception 'RETENTION_HOLD_RECOVERY_HOLD_FAILED'"
    )
  })

  it('keeps immutable, content-free recovery evidence without claim secrets', () => {
    const table = getTableDefinition('privacy_retention_claim_recovery_events')

    expect(table).toContain('previous_claim_lease_expires_at timestamptz not null')
    expect(table).toContain('hold_reason text not null')
    expect(table).toContain('recovered_at timestamptz not null default clock_timestamp()')
    expect(table).not.toMatch(/claim_token|password|confirmation|payload|message|health/i)
    expect(migration).toContain(
      'create trigger prevent_privacy_retention_claim_recovery_event_mutation'
    )
    expect(migration).toContain(
      'alter table public.privacy_retention_claim_recovery_events enable row level security;'
    )
    expect(migration).toContain(
      'revoke all on table public.privacy_retention_claim_recovery_events'
    )
    expect(migration).toContain(
      'grant select on table public.privacy_retention_claim_recovery_events\n  to service_role;'
    )
  })
})
