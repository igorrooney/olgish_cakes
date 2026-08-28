/**
 * @jest-environment node
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const migrationName = '20260825120000_add_privacy_retention_lifecycle.sql'
const migration = readFileSync(
  join(process.cwd(), 'supabase', 'migrations', migrationName),
  'utf8'
)
const healthMigration = readFileSync(
  join(
    process.cwd(),
    'supabase',
    'migrations',
    '20260825130000_add_health_information_retention.sql'
  ),
  'utf8'
)

const enquiryTables = [
  'contact_enquiries',
  'custom_cake_enquiries',
  'workshop_enquiries'
]

const lifecycleTables = [
  ...enquiryTables,
  'event_photo_requests'
]

const holdReasons = [
  'active-complaint',
  'legal-claim',
  'regulatory-request',
  'fraud-investigation',
  'other-necessary-hold'
]

const categories = [
  'expired-enquiry',
  'expired-enquiry-upload',
  'expired-order-upload',
  'expired-order',
  'expired-health-information',
  'expired-security-record'
]

const getCreateTableDefinition = (table: string): string => {
  const start = migration.indexOf(`create table if not exists public.${table} (`)
  const nextStatement = migration.indexOf('\n\ncreate ', start + 1)

  if (start === -1) {
    throw new Error(`Missing ${table} definition`)
  }

  return migration.slice(start, nextStatement === -1 ? undefined : nextStatement)
}

const getFirstAlterTableDefinition = (table: string): string => {
  const start = migration.indexOf(`alter table public.${table}\n`)
  const end = migration.indexOf(';', start)

  if (start === -1 || end === -1) {
    throw new Error(`Missing ${table} alter-table definition`)
  }

  return migration.slice(start, end + 1)
}

describe('privacy-retention lifecycle migration', () => {
  it('runs after the existing consent withdrawal migration', () => {
    expect(Number.parseInt(migrationName.slice(0, 14), 10)).toBeGreaterThan(20260823153000)
  })

  it('keeps health-dependent statements deferred until the later health migration exists', () => {
    const outsideDeferredHealthBlocks = migration.replace(
      /\$health\$[\s\S]*?\$health\$/g,
      ''
    )

    expect(outsideDeferredHealthBlocks).not.toContain(
      'enquiry.dietary_health_retention_due_at'
    )
    expect(outsideDeferredHealthBlocks).not.toContain(
      'orders.dietary_health_retention_due_at'
    )
    expect(outsideDeferredHealthBlocks).not.toContain(
      'from public.erase_due_enquiry_dietary_health_information('
    )
    expect(outsideDeferredHealthBlocks).not.toContain(
      'from public.erase_due_order_dietary_health_information('
    )
    expect(healthMigration).toContain(
      'add column if not exists dietary_health_retention_due_at timestamptz'
    )
    expect(healthMigration).toContain(
      'create or replace function public.erase_due_enquiry_dietary_health_information('
    )
    expect(healthMigration).toContain(
      'create or replace function public.erase_due_order_dietary_health_information('
    )
  })

  it('records manually verified legacy order completion evidence through a service-role-only RPC', () => {
    const table = getCreateTableDefinition('privacy_retention_lifecycle_events')
    const functionStart = migration.indexOf('create or replace function public.record_order_retention_completion(')
    const functionEnd = migration.indexOf('\n$$;', functionStart)
    const definition = migration.slice(functionStart, functionEnd + 4)

    expect(table).toContain("record_type text not null check (record_type in ('order', 'enquiry', 'event-photo'))")
    expect(table).toContain("'terminal-date-recorded'")
    expect(table).toContain('evidence_basis text not null check')
    expect(migration).toContain('Privacy-retention lifecycle evidence is append-only')
    expect(definition).toContain('for update;')
    expect(definition).toContain("p_confirmation is distinct from 'SET RETENTION ' || selected_order.order_number")
    expect(definition).toContain("selected_order.status not in ('completed', 'delivered', 'cancelled')")
    expect(definition).not.toContain('selected_order.payment_status')
    expect(definition).toContain("p_effective_on > uk_today")
    expect(definition).toContain("selected_financial_year_end + interval '6 years' + interval '1 day'")
    expect(definition).toContain('insert into public.privacy_retention_lifecycle_events')
    expect(definition).toContain('update public.contact_enquiries')
    expect(definition).toContain('update public.custom_cake_enquiries')
    expect(definition).toContain('update public.workshop_enquiries')
    expect(migration).toContain('revoke all on function public.record_order_retention_completion(text, date, text, text)')
    expect(migration).toContain('grant execute on function public.record_order_retention_completion(text, date, text, text)')
  })

  it('adds safe nullable lifecycle dates without scheduling existing records for deletion', () => {
    const schemaSection = migration.slice(
      0,
      migration.indexOf('create or replace function public.set_future_order_retention_lifecycle()')
    )

    for (const table of lifecycleTables) {
      expect(migration).toContain(`alter table public.${table}`)
      expect(migration).toContain("add column if not exists lifecycle_status text not null default 'open'")
      expect(migration).toContain('add column if not exists last_contacted_at timestamptz')
      expect(migration).toContain('add column if not exists closed_at timestamptz')
      expect(migration).toContain('add column if not exists retention_due_at timestamptz')
      expect(migration).toContain(`${table}_lifecycle_check`)
      expect(schemaSection).not.toContain(`update public.${table}`)
    }

    for (const table of enquiryTables) {
      expect(migration).toContain(`${table}_converted_order_id_fkey`)
      expect(migration).toContain('references public.orders (id)')
      expect(migration).toContain('on delete cascade')
    }
  })

  it('tracks upload expiry separately from whole-record expiry', () => {
    for (const table of ['custom_cake_enquiries', 'event_photo_requests']) {
      expect(getFirstAlterTableDefinition(table)).toContain('add column if not exists upload_retention_due_at timestamptz')
      expect(migration).toContain(`${table}_upload_retention_due_check`)
      expect(migration).toContain(`${table}_upload_retention_due_idx`)
    }

    for (const table of ['contact_enquiries', 'workshop_enquiries']) {
      expect(getFirstAlterTableDefinition(table)).not.toContain('upload_retention_due_at')
    }
  })

  it('adds future-only order financial retention dates without backfilling old orders', () => {
    expect(migration).toContain('add column if not exists completed_at timestamptz')
    expect(migration).toContain('add column if not exists financial_year_ended_at date')
    expect(migration).toContain('orders_retention_lifecycle_check')
    expect(migration).toContain("extract(month from financial_year_ended_at) = 4")
    expect(migration).toContain("extract(day from financial_year_ended_at) = 5")
    expect(migration).toContain("financial_year_ended_at + interval '6 years'")
    expect(migration).toContain('set_future_order_retention_lifecycle')
    expect(migration).toContain("new.status in ('completed', 'delivered', 'cancelled')")
    expect(migration).toContain("old.status not in ('completed', 'delivered', 'cancelled')")
    expect(migration).not.toMatch(/^update public\.orders/m)
  })

  it('keeps converted enquiry correspondence on the linked order lifecycle', () => {
    for (const table of enquiryTables) {
      expect(migration).toContain(`update public.${table}`)
      expect(migration).toContain('where converted_order_id = new.id')
      expect(migration).toContain(`${table}_converted_order_id_fkey`)
    }

    expect(migration).toContain("lifecycle_status = 'converted'")
    expect(migration).toContain('retention_due_at = new.retention_due_at')
    expect(migration).toContain("upload_retention_due_at = new.completed_at + interval '24 months'")
    expect(migration).toContain('on delete cascade')
  })

  it('blocks cascade deletion when the order bundle has a legal hold', () => {
    expect(migration).toContain('public.prevent_held_order_bundle_deletion()')
    expect(migration).toContain('old.legal_hold = true or exists')

    for (const table of enquiryTables) {
      expect(migration).toContain(`from public.${table}`)
    }

    expect(migration).toContain('before delete on public.orders')
    expect(migration).toContain("errcode = '23514'")
    expect(migration).toContain('revoke all on function public.prevent_held_order_bundle_deletion()')
    expect(migration).toContain('grant execute on function public.prevent_held_order_bundle_deletion()\n  to service_role')
  })

  it('blocks converted custom-cake upload redaction when its order is held', () => {
    expect(migration).toContain('public.prevent_held_converted_upload_redaction()')
    expect(migration).toContain('old.converted_order_id is null or removes_upload_information = false')
    expect(migration).toContain("nullif(btrim(old.reference_image_path), '') is not null")
    expect(migration).toContain("nullif(btrim(new.reference_image_path), '') is null")
    expect(migration).toContain('where orders.id = old.converted_order_id')
    expect(migration).toContain('for share')
    expect(migration).toContain('before update of\n  reference_image_bucket,\n  reference_image_path,')
    expect(migration).toContain('on public.custom_cake_enquiries')
    expect(migration).toContain('revoke all on function public.prevent_held_converted_upload_redaction()')
    expect(migration).toContain('grant execute on function public.prevent_held_converted_upload_redaction()\n  to service_role')
  })

  it('closes future event-photo requests when temporary files are cleared', () => {
    expect(migration).toContain('public.close_event_photo_request_after_file_cleanup()')
    expect(migration).toContain('old.files_deleted_at is null and new.files_deleted_at is not null')
    expect(migration).toContain("new.lifecycle_status := 'closed'")
    expect(migration).toContain('new.last_contacted_at := coalesce(new.last_contacted_at, effective_closed_at)')
    expect(migration).toContain('new.closed_at := effective_closed_at')
    expect(migration).toContain("effective_closed_at + interval '24 months'")
    expect(migration).toContain('new.upload_retention_due_at := null')
    expect(migration).toContain('before update of files_deleted_at on public.event_photo_requests')
    expect(migration).toContain('revoke all on function public.close_event_photo_request_after_file_cleanup()')
    expect(migration).toContain('grant execute on function public.close_event_photo_request_after_file_cleanup()\n  to service_role')
    expect(migration).toContain('update public.event_photo_requests')
    expect(migration).toContain("where files_deleted_at is not null\n  and lifecycle_status = 'open'")
  })

  it('requires a controlled reason and review date for every legal hold', () => {
    for (const table of [...lifecycleTables, 'orders']) {
      expect(migration).toContain(`${table}_legal_hold_check`)
    }

    for (const reason of holdReasons) {
      expect(migration).toContain(`'${reason}'`)
    }

    expect(migration).toContain('legal_hold = false')
    expect(migration).toContain('legal_hold_reason is null')
    expect(migration).toContain('legal_hold_review_at is null')
    expect(migration).toContain('legal_hold = true')
    expect(migration).toContain('legal_hold_reason is not null')
    expect(migration).toContain('legal_hold_review_at is not null')
  })

  it('creates partial indexes for due records, uploads and hold reviews', () => {
    for (const table of [...lifecycleTables, 'orders']) {
      expect(migration).toContain(`${table}_retention_due_idx`)
      expect(migration).toContain(`on public.${table} (retention_due_at, legal_hold)`)
      expect(migration).toContain('where retention_due_at is not null')
      expect(migration).toContain(`${table}_legal_hold_review_idx`)
      expect(migration).toContain('where legal_hold = true')
    }

    expect(migration).toContain('where upload_retention_due_at is not null')
  })

  it('uses constrained, non-sensitive retention audit metadata', () => {
    const runs = getCreateTableDefinition('privacy_retention_runs')
    const actions = getCreateTableDefinition('privacy_retention_actions')

    expect(runs).toContain('run_reference text not null unique')
    expect(runs).toContain("run_mode in ('discovery', 'manual', 'owner-review')")
    expect(runs).toContain("'pending',\n      'running',\n      'completed',\n      'partial',\n      'failed'")
    expect(runs).toContain("initiator in ('admin', 'scheduled')")
    expect(runs).toContain('reviewed_schedule boolean not null default false')
    expect(runs).toContain('reviewed_external_systems boolean not null default false')
    expect(runs).toContain('privacy_retention_runs_owner_review_evidence_check')
    expect(actions).toContain('candidate_id text not null')
    expect(actions).toContain('category text not null')
    expect(actions).toContain('record_reference text not null')
    expect(actions).toContain('due_at timestamptz not null')
    expect(actions).toContain('snapshot_revision text not null')
    expect(actions).toContain("snapshot_revision ~ '^[0-9a-f]{64}$'")
    expect(actions).toContain('selected boolean not null default false')

    for (const category of categories) {
      expect(runs).toContain(`'${category}'`)
      expect(actions).toContain(`'${category}'`)
    }

    for (const actionType of [
      'delete-enquiry-record',
      'delete-enquiry-upload',
      'delete-order-upload',
      'delete-order-record',
      'delete-security-batch',
      'erase-health-information'
    ]) {
      expect(actions).toContain(`'${actionType}'`)
    }

    for (const recordType of [
      'Contact enquiry',
      'Custom-cake enquiry',
      'Workshop enquiry',
      'Event-photo request',
      'Custom-cake enquiry upload',
      'Event-photo request upload',
      'Order record',
      'Order uploads',
      'Enquiry rate-limit records',
      'Admin login-attempt records',
      'Event-photo rate-limit records'
    ]) {
      expect(actions).toContain(`'${recordType}'`)
    }

    for (const unsafeColumn of [
      'metadata jsonb',
      'payload jsonb',
      'message text',
      'details text',
      'filename text',
      'health_information'
    ]) {
      expect(runs).not.toContain(unsafeColumn)
      expect(actions).not.toContain(unsafeColumn)
    }
  })

  it('keeps both audit tables service-role only behind RLS', () => {
    for (const table of ['privacy_retention_runs', 'privacy_retention_actions']) {
      expect(migration).toContain(`alter table public.${table} enable row level security`)
      expect(migration).toContain(`revoke all on table public.${table}\n  from public, anon, authenticated`)
      expect(migration).toContain(`grant select on table public.${table}\n  to service_role`)
      expect(migration).not.toContain(`grant select, insert, update, delete on table public.${table}\n  to service_role`)
    }

    for (const table of [...lifecycleTables, 'orders']) {
      expect(migration).toContain(`revoke all on table public.${table}\n  from public, anon, authenticated`)
    }

    expect(migration).toContain('error_code is not null')
    expect(migration).toContain("error_code ~ '^[A-Z][A-Z0-9_]{0,63}$'")
  })

  it('keeps lifecycle and audit updated-at values current through private triggers', () => {
    for (const table of lifecycleTables) {
      expect(migration).toContain(`create trigger set_${table}_updated_at`)
    }

    expect(migration).toContain('create trigger set_privacy_retention_runs_updated_at')
    expect(migration).toContain('create trigger set_privacy_retention_run_completed_at')
    expect(migration).toContain('revoke all on function public.set_privacy_retention_updated_at()')
    expect(migration).toContain('revoke all on function public.set_privacy_retention_run_completed_at()')
  })

  it('redacts only Supabase upload references after storage deletion', () => {
    expect(migration).toContain('public.redact_order_uploaded_files')
    expect(migration).toContain('select orders.legal_hold, orders.status::text\n  into selected_order_held, selected_order_status')
    expect(migration).toContain("selected_order_status not in ('completed', 'delivered', 'cancelled')")
    expect(migration).toContain('selected_order_held = true or exists')
    expect(migration).toContain('A legal hold prevents upload redaction for this order bundle')
    expect(migration).toContain("attachment.asset_type = 'supabase-file'")
    expect(migration).toContain('attachment.asset_type is null')
    expect(migration).toContain("attachment.legacy_attachment #>> '{asset,_type}' = 'supabase-file'")
    expect(migration).toContain('relational_attachment.line_number = legacy_attachment.position')
    expect(migration).toContain("when relational_attachment.asset_type = 'supabase-file' then true")
    expect(migration).toContain('when relational_attachment.asset_type is null then')
    expect(migration).toContain("image.asset_type = 'supabase-file'")
    expect(migration).toContain('image.asset_type is null')
    expect(migration).toContain("image.legacy_image #>> '{asset,_type}' = 'supabase-file'")
    expect(migration).toContain('relational_image.line_number = legacy_image.position')
    expect(migration).toContain("when relational_image.asset_type = 'supabase-file' then true")
    expect(migration).toContain('when relational_image.asset_type is null then')
    expect(migration).toContain('else false')
    expect(migration).toContain('returns table (\n  status text,\n  affected_count bigint')
    expect(migration).toContain('revoke all on function public.redact_order_uploaded_files(uuid)')
    expect(migration).toContain('grant execute on function public.redact_order_uploaded_files(uuid)\n  to service_role')
  })

  it('uses a fixed allowlist RPC for bulk security-record deletion', () => {
    expect(migration).toContain('public.delete_expired_privacy_security_records')
    expect(migration).toContain('returns table (\n  deleted_count bigint\n)')
    expect(migration).toContain("when 'enquiry-rate-limits' then")
    expect(migration).toContain('where updated_at < p_cutoff')
    expect(migration).toContain("when 'admin-login-attempts' then")
    expect(migration).toContain('where failed_at < p_cutoff')
    expect(migration).toContain("when 'event-photo-rate-limits' then")
    expect(migration).toContain('where attempted_at < p_cutoff')
    expect(migration).not.toContain('execute format')
    expect(migration).toContain('revoke all on function public.delete_expired_privacy_security_records(text, timestamptz)')
    expect(migration).toContain('grant execute on function public.delete_expired_privacy_security_records(text, timestamptz)\n  to service_role')
  })

  it('claims each candidate atomically before irreversible Storage removal', () => {
    const claims = getCreateTableDefinition('privacy_retention_deletion_claims')

    expect(claims).toContain('candidate_id text primary key')
    expect(claims).toContain('claim_token uuid')
    expect(claims).toContain("state in ('claimed', 'external-delete', 'retryable', 'finalized')")
    expect(claims).toContain('irreversible_started boolean not null default false')
    expect(claims).toContain("state = 'retryable'")
    expect(claims).toContain('claim_token is null')
    expect(claims).toContain('run_id uuid')
    expect(claims).toContain('action_id uuid')
    expect(claims).toContain('cutoff_at timestamptz not null')
    expect(claims).toContain('terminal_outcome text')
    expect(claims).toContain('finalized_at timestamptz')

    for (const unsafeColumn of [
      'storage_path',
      'filename',
      'payload',
      'health_information',
      'customer_content'
    ]) {
      expect(claims).not.toContain(unsafeColumn)
    }

    expect(migration).toContain('public.claim_privacy_retention_candidate')
    expect(migration).toContain('for update')
    expect(migration.match(/previous_irreversible := coalesce\(previous_irreversible, false\)/g)).toHaveLength(2)
    expect(migration).toContain("lifecycle_status <> 'closed'")
    expect(migration).toContain("order_status not in ('completed', 'delivered', 'cancelled')")
    expect(migration).toContain('public.begin_privacy_retention_external_deletion')
    expect(migration).toContain("state = 'external-delete'")
    expect(migration).toContain('public.release_privacy_retention_deletion_claim')
    expect(migration).toContain("state = 'retryable'")
  })

  it('finalizes only inside the matching server-token transaction', () => {
    expect(migration).toContain('public.finalize_privacy_retention_deletion')
    expect(migration).toContain('claim.claim_token = p_claim_token')
    expect(migration).toContain("perform set_config(\n    'app.privacy_retention_claim_token'")
    expect(migration).toContain('A matching server-generated deletion claim is required')
    expect(migration).toContain("state = 'finalized'")
    expect(migration).toContain('terminal_outcome = terminal_status')
    expect(migration).toContain('action_id = selected_action.id')
    expect(migration).toContain('and claim_token = p_claim_token')
  })

  it('blocks lifecycle, hold and bundle changes while a claim is pending or retryable', () => {
    expect(migration).toContain('public.assert_privacy_retention_mutation_allowed')
    expect(migration).toContain('old_linked_order_id')
    expect(migration).toContain('new_linked_order_id')
    expect(migration).toContain("tg_op = 'INSERT'")

    for (const table of [
      'contact_enquiries',
      'custom_cake_enquiries',
      'workshop_enquiries',
      'event_photo_requests',
      'orders',
      'order_items',
      'order_messages',
      'order_message_attachments',
      'order_notes',
      'order_note_images'
    ]) {
      expect(migration).toContain(`on public.${table}`)
    }

    expect(migration).toContain("'order:' || old_linked_order_id")
    expect(migration).toContain("'order:' || new_linked_order_id")
    expect(migration).toContain("'enquiry-upload:custom-cake:' || enquiry.id::text")
    expect(migration).toContain("hashtextextended('privacy-retention-order-bundle:' || order_id")
  })

  it('requires an exact token-bound full-record claim for every parent delete', () => {
    expect(migration).toContain('public.require_privacy_retention_claim_for_parent_delete')
    expect(migration).toContain("current_setting('app.privacy_retention_claim_token', true)")
    expect(migration).toContain('claim.claim_token::text = session_claim_token')
    expect(migration).toContain('A matching full-record deletion claim is required')

    for (const table of [...lifecycleTables, 'orders']) {
      expect(migration).toContain(`before delete on public.${table}`)
    }
  })

  it('protects held parent and child evidence while allowing exact health redaction', () => {
    expect(migration).toContain('public.prevent_held_retention_record_mutation')
    expect(migration).toContain("current_setting('app.privacy_retention_hold_mutation', true)")
    expect(migration).toContain("'hold:health:order:' || record_id")
    expect(migration).toContain("not (coalesce(new.metadata, '{}'::jsonb) ? 'dietaryHealthInformation')")
    expect(migration).toContain("nullif(btrim(new_json->>'dietary_health_information'), '') is null")
    expect(migration).toContain('public.prevent_held_order_child_mutation')

    for (const table of [
      'order_items',
      'order_messages',
      'order_message_attachments',
      'order_notes',
      'order_note_images'
    ]) {
      expect(migration).toContain(`before update or delete on public.${table}`)
    }
  })

  it('changes holds only through the service-role RPC without propagating child holds', () => {
    expect(migration).toContain('public.set_privacy_retention_legal_hold')
    expect(migration).toContain("'app.privacy_retention_hold_mutation'")
    expect(migration).toContain("'hold:' || p_candidate_id")
    expect(migration).toContain('update public.orders set')
    expect(migration).not.toContain('update public.contact_enquiries set\n        legal_hold = p_hold\n      where converted_order_id')
    expect(migration).toContain('revoke all on function public.set_privacy_retention_legal_hold(text, boolean, text, timestamptz)')
    expect(migration).toContain('grant execute on function public.set_privacy_retention_legal_hold(text, boolean, text, timestamptz)\n  to service_role')
  })

  it('supports held security batches and makes the purge RPC honour them', () => {
    const holds = getCreateTableDefinition('privacy_retention_security_holds')

    for (const recordType of [
      'enquiry-rate-limits',
      'admin-login-attempts',
      'event-photo-rate-limits'
    ]) {
      expect(holds).toContain(`'${recordType}'`)
    }
    for (const reason of holdReasons) {
      expect(holds).toContain(`'${reason}'`)
    }

    expect(migration).toContain('from public.privacy_retention_security_holds as hold')
    expect(migration).toContain('A legal hold prevents deletion of these security records')
    expect(migration).toContain("claim.candidate_id = 'security:' || p_record_type")
    expect(migration).toContain('add column if not exists cleared_at timestamptz')
    expect(migration).toContain('public.protect_privacy_retention_security_evidence')
    expect(migration).toContain('Security evidence deletion requires a matching retention claim')
    expect(migration).toContain("(to_jsonb(new) - 'cleared_at') = (to_jsonb(old) - 'cleared_at')")

    for (const table of [
      'enquiry_rate_limits',
      'admin_login_attempts',
      'event_photo_rate_limit_attempts'
    ]) {
      expect(migration).toContain(`before insert or update or delete on public.${table}`)
    }
  })

  it('keeps claim and security-hold state service-role only', () => {
    for (const table of [
      'privacy_retention_security_holds',
      'privacy_retention_deletion_claims'
    ]) {
      expect(migration).toContain(`alter table public.${table} enable row level security`)
      expect(migration).toContain(`revoke all on table public.${table}\n  from public, anon, authenticated`)
      expect(migration).toContain(`grant select on table public.${table}\n  to service_role`)
    }

    for (const signature of [
      'claim_privacy_retention_candidate(text, uuid, timestamptz)',
      'begin_privacy_retention_external_deletion(text, uuid, text, text[])',
      'release_privacy_retention_deletion_claim(text, uuid, text)',
      'finalize_privacy_retention_deletion(text, uuid, timestamptz)'
    ]) {
      expect(migration).toContain(`revoke all on function public.${signature}\n  from public, anon, authenticated`)
      expect(migration).toContain(`grant execute on function public.${signature}\n  to service_role`)
    }
  })

  it('provides a claim-first event-photo temp cleanup contract', () => {
    expect(migration).toContain('public.claim_event_photo_temp_cleanup')
    expect(migration).toContain('request.created_at')
    expect(migration).toContain('request.legal_hold')
    expect(migration).toContain('for update')
    expect(migration).toContain("selected_bucket <> 'event-photo-temp-uploads'")
    expect(migration).toContain("hashtextextended('privacy-retention-candidate:' || target_candidate_id")
    expect(migration).toContain("'enquiry:event-photo:' || p_request_id::text")
    expect(migration).toContain('from public.privacy_retention_deletion_claims as sibling_claim')
    expect(migration).toContain('public.finalize_event_photo_temp_cleanup')
    expect(migration).toContain("claim.state = 'external-delete'")
    expect(migration).toContain('claim.claim_token = p_claim_token')
    expect(migration).toContain('files_deleted_at = completion_time')
    expect(migration).toContain("when telegram_status = 'pending' then 'failed'")
    expect(migration).toContain("then 'Temporary uploaded files were removed after 24 hours.'")
    expect(migration).toContain('public.list_referenced_event_photo_temp_paths')
    expect(migration).toContain('select distinct path')
    expect(migration).toContain("request.temp_image_bucket = 'event-photo-temp-uploads'")

    for (const signature of [
      'claim_event_photo_temp_cleanup(uuid, timestamptz)',
      'finalize_event_photo_temp_cleanup(uuid, uuid)',
      'list_referenced_event_photo_temp_paths()'
    ]) {
      expect(migration).toContain(`revoke all on function public.${signature}\n  from public, anon, authenticated`)
      expect(migration).toContain(`grant execute on function public.${signature}\n  to service_role`)
    }
  })

  it('keeps legal-hold history append-only and supports non-due hold lookup', () => {
    const events = getCreateTableDefinition('privacy_retention_hold_events')

    expect(events).toContain("event_type in ('placed', 'extended', 'released')")
    expect(events).toContain('previous_hold_active boolean not null')
    expect(events).toContain('new_hold_active boolean not null')
    expect(events).toContain('occurred_at timestamptz not null default clock_timestamp()')
    expect(migration).toContain('Privacy-retention legal-hold events are append-only')
    expect(migration).toContain('insert into public.privacy_retention_hold_events')
    expect(migration).toContain('create or replace function public.get_privacy_retention_legal_hold')
    expect(migration).toContain('grant execute on function public.get_privacy_retention_legal_hold(text)\n  to service_role')
  })

  it('rejects ambiguous, shared or wrongly owned storage plans before deletion', () => {
    expect(migration).toContain('public.privacy_retention_order_storage_references_are_unambiguous')
    expect(migration).toContain('RETENTION_STORAGE_REFERENCE_AMBIGUOUS')
    expect(migration).toContain('RETENTION_STORAGE_REFERENCE_SHARED')
    expect(migration).toContain('RETENTION_STORAGE_PATH_OWNERSHIP_INVALID')
    expect(migration).toContain("'orders/' || target_order_id::text || '/'")
    expect(migration).toContain("'orders/' || target_order_number || '/'")
    expect(migration).toContain("path !~ '^enquiries/[^/].*$'")
    expect(migration).toContain("path !~ '^incoming/[^/].*$'")
    expect(migration).toContain('expected_paths is distinct from supplied_paths')
  })

  it('binds finalization to the server-persisted cutoff and pending action', () => {
    expect(migration).toContain('claim_cutoff timestamptz := least(p_now, clock_timestamp())')
    expect(migration).toContain('p_cutoff_at is distinct from selected_claim.cutoff_at')
    expect(migration).toContain('selected_action.outcome <> \'pending\'')
    expect(migration).toContain('retention_due_at <= selected_claim.cutoff_at')
    expect(migration).toContain("selected_claim.cutoff_at - interval '90 days'")
    expect(migration).not.toContain("p_cutoff_at - interval '90 days'")
  })

  it('makes audit transitions controlled and preserves retryable irreversible claims', () => {
    expect(migration).toContain('Privacy-retention run audit rows are append-safe')
    expect(migration).toContain('Privacy-retention action audit rows are append-safe')
    expect(migration).toContain("old.outcome <> 'pending'")
    expect(migration).toContain("old.status <> 'running'")
    expect(migration).toContain('public.complete_privacy_retention_action')
    expect(migration).toContain('public.complete_privacy_retention_run')
    expect(migration).toContain("if selected_claim.irreversible_started then")
    expect(migration).toContain("state = 'retryable'")
    expect(migration).toContain("outcome = 'failed'")
    expect(migration).toContain('The action outcome is durable in this same transaction')
  })

  it('creates a manual run and its exact immutable action set in one transaction', () => {
    const functionStart = migration.indexOf(
      'create or replace function public.create_privacy_retention_manual_run('
    )
    const functionEnd = migration.indexOf('\n$$;', functionStart)
    const definition = migration.slice(functionStart, functionEnd + 4)

    expect(definition).toContain("'app.privacy_retention_manual_initialization'")
    expect(definition).toContain('from public.create_privacy_retention_run(')
    expect(definition).toContain('select public.create_privacy_retention_actions(')
    expect(definition).toContain('total_action_count <> p_selected_count')
    expect(definition).toContain('RETENTION_ACTIONS_CREATE_COUNT_MISMATCH')
    expect(migration).toContain('RETENTION_MANUAL_RUN_REQUIRES_ATOMIC_ACTIONS')
    expect(migration).toContain('RETENTION_ACTIONS_REQUIRE_ATOMIC_INITIALIZATION')
    expect(migration).toContain(
      'revoke all on function public.create_privacy_retention_actions(uuid, jsonb)\n  from public, anon, authenticated, service_role'
    )
    expect(migration).toContain(
      'grant execute on function public.create_privacy_retention_manual_run(\n  text, text, text[], integer, integer, jsonb\n)\n  to service_role'
    )
  })

  it('forbids implicit terminal order reopening and stale deadline edits', () => {
    expect(migration).toContain('public.protect_terminal_order_retention_lifecycle')
    expect(migration).toContain('if not new_terminal or new.status is distinct from old.status then')
    expect(migration).toContain('Terminal order retention dates require a controlled audited transition')
    expect(migration).toContain("'app.privacy_retention_lifecycle_mutation'")
    expect(migration).toContain('grant execute on function public.protect_terminal_order_retention_lifecycle()\n  to service_role')
  })
})
