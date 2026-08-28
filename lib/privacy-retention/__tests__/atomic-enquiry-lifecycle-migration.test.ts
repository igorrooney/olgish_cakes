/**
 * @jest-environment node
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const migration = readFileSync(
  join(process.cwd(), 'supabase', 'migrations', '20260825122500_atomic_enquiry_retention_lifecycle.sql'),
  'utf8'
)

describe('atomic enquiry lifecycle migration', () => {
  it('locks and validates every supported record before a state transition', () => {
    expect(migration).toContain('create or replace function public.update_enquiry_retention_lifecycle(')
    expect((migration.match(/for update;/g) || [])).toHaveLength(4)
    expect(migration).toContain("p_enquiry_type not in ('contact', 'custom-cake', 'workshop')")
    expect(migration).toContain("current_lifecycle = 'converted' and p_action <> 'record-contact'")
    expect(migration).toContain("raise exception 'RETENTION_CONVERTED_LINK_IMMUTABLE'")
    expect(migration).toContain("raise exception 'RETENTION_LEGAL_HOLD_ACTIVE'")
    expect(migration).toContain("claim.state in ('claimed', 'external-delete')")
  })

  it('uses only server time and appends non-sensitive lifecycle evidence', () => {
    expect(migration).toContain('server_now timestamptz := clock_timestamp()')
    expect(migration).toContain("server_now + interval '24 months'")
    expect(migration).toContain('insert into public.privacy_retention_lifecycle_events')
    expect(migration).toContain("'server-action'")
    expect(migration).not.toContain('customer_name')
    expect(migration).not.toContain('dietary_health_information')
  })

  it('protects converted order provenance and restricts the RPC to service role', () => {
    expect(migration).toContain('create or replace function public.protect_converted_enquiry_order_link()')
    expect(migration).toContain('A converted enquiry must remain linked to its original order')
    expect(migration).toContain('revoke all on function public.update_enquiry_retention_lifecycle(text, text, text, text)')
    expect(migration).toContain('grant execute on function public.update_enquiry_retention_lifecycle(text, text, text, text)')
    expect(migration).toContain('to service_role')
  })
})
