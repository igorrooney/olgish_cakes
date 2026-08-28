alter table public.contact_enquiries
  add column if not exists lifecycle_status text not null default 'open',
  add column if not exists last_contacted_at timestamptz,
  add column if not exists closed_at timestamptz,
  add column if not exists converted_order_id uuid,
  add column if not exists retention_due_at timestamptz,
  add column if not exists legal_hold boolean not null default false,
  add column if not exists legal_hold_reason text,
  add column if not exists legal_hold_review_at timestamptz;

alter table public.custom_cake_enquiries
  add column if not exists lifecycle_status text not null default 'open',
  add column if not exists last_contacted_at timestamptz,
  add column if not exists closed_at timestamptz,
  add column if not exists converted_order_id uuid,
  add column if not exists retention_due_at timestamptz,
  add column if not exists upload_retention_due_at timestamptz,
  add column if not exists legal_hold boolean not null default false,
  add column if not exists legal_hold_reason text,
  add column if not exists legal_hold_review_at timestamptz;

alter table public.workshop_enquiries
  add column if not exists lifecycle_status text not null default 'open',
  add column if not exists last_contacted_at timestamptz,
  add column if not exists closed_at timestamptz,
  add column if not exists converted_order_id uuid,
  add column if not exists retention_due_at timestamptz,
  add column if not exists legal_hold boolean not null default false,
  add column if not exists legal_hold_reason text,
  add column if not exists legal_hold_review_at timestamptz;

alter table public.event_photo_requests
  add column if not exists lifecycle_status text not null default 'open',
  add column if not exists last_contacted_at timestamptz,
  add column if not exists closed_at timestamptz,
  add column if not exists retention_due_at timestamptz,
  add column if not exists upload_retention_due_at timestamptz,
  add column if not exists legal_hold boolean not null default false,
  add column if not exists legal_hold_reason text,
  add column if not exists legal_hold_review_at timestamptz;

alter table public.orders
  add column if not exists completed_at timestamptz,
  add column if not exists financial_year_ended_at date,
  add column if not exists retention_due_at timestamptz,
  add column if not exists legal_hold boolean not null default false,
  add column if not exists legal_hold_reason text,
  add column if not exists legal_hold_review_at timestamptz;

-- Successful authentication may mark a failed-attempt row as cleared without
-- erasing the underlying security evidence. Expired rows are still removed
-- only by the claim-bound retention finalizer below.
alter table public.admin_login_attempts
  add column if not exists cleared_at timestamptz;

alter table public.contact_enquiries
  drop constraint if exists contact_enquiries_lifecycle_check,
  add constraint contact_enquiries_lifecycle_check check (
    (
      lifecycle_status = 'open'
      and closed_at is null
      and converted_order_id is null
      and retention_due_at is null
    )
    or
    (
      lifecycle_status = 'closed'
      and closed_at is not null
      and converted_order_id is null
      and retention_due_at is not null
      and closed_at >= created_at
      and retention_due_at >= closed_at
    )
    or
    (
      lifecycle_status = 'converted'
      and closed_at is not null
      and converted_order_id is not null
      and closed_at >= created_at
      and (
        retention_due_at is null
        or retention_due_at >= closed_at
      )
    )
  ),
  drop constraint if exists contact_enquiries_last_contacted_at_check,
  add constraint contact_enquiries_last_contacted_at_check check (
    last_contacted_at is null
    or last_contacted_at >= created_at
  ),
  drop constraint if exists contact_enquiries_legal_hold_check,
  add constraint contact_enquiries_legal_hold_check check (
    (
      legal_hold = false
      and legal_hold_reason is null
      and legal_hold_review_at is null
    )
    or
    (
      legal_hold = true
      and legal_hold_reason is not null
      and legal_hold_reason in (
        'active-complaint',
        'legal-claim',
        'regulatory-request',
        'fraud-investigation',
        'other-necessary-hold'
      )
      and legal_hold_review_at is not null
    )
  ),
  drop constraint if exists contact_enquiries_converted_order_id_fkey,
  add constraint contact_enquiries_converted_order_id_fkey
    foreign key (converted_order_id)
    references public.orders (id)
    on delete cascade;

alter table public.custom_cake_enquiries
  drop constraint if exists custom_cake_enquiries_lifecycle_check,
  add constraint custom_cake_enquiries_lifecycle_check check (
    (
      lifecycle_status = 'open'
      and closed_at is null
      and converted_order_id is null
      and retention_due_at is null
    )
    or
    (
      lifecycle_status = 'closed'
      and closed_at is not null
      and converted_order_id is null
      and retention_due_at is not null
      and closed_at >= created_at
      and retention_due_at >= closed_at
    )
    or
    (
      lifecycle_status = 'converted'
      and closed_at is not null
      and converted_order_id is not null
      and closed_at >= created_at
      and (
        retention_due_at is null
        or retention_due_at >= closed_at
      )
    )
  ),
  drop constraint if exists custom_cake_enquiries_last_contacted_at_check,
  add constraint custom_cake_enquiries_last_contacted_at_check check (
    last_contacted_at is null
    or last_contacted_at >= created_at
  ),
  drop constraint if exists custom_cake_enquiries_upload_retention_due_check,
  add constraint custom_cake_enquiries_upload_retention_due_check check (
    upload_retention_due_at is null
    or upload_retention_due_at >= created_at
  ),
  drop constraint if exists custom_cake_enquiries_legal_hold_check,
  add constraint custom_cake_enquiries_legal_hold_check check (
    (
      legal_hold = false
      and legal_hold_reason is null
      and legal_hold_review_at is null
    )
    or
    (
      legal_hold = true
      and legal_hold_reason is not null
      and legal_hold_reason in (
        'active-complaint',
        'legal-claim',
        'regulatory-request',
        'fraud-investigation',
        'other-necessary-hold'
      )
      and legal_hold_review_at is not null
    )
  ),
  drop constraint if exists custom_cake_enquiries_converted_order_id_fkey,
  add constraint custom_cake_enquiries_converted_order_id_fkey
    foreign key (converted_order_id)
    references public.orders (id)
    on delete cascade;

alter table public.workshop_enquiries
  drop constraint if exists workshop_enquiries_lifecycle_check,
  add constraint workshop_enquiries_lifecycle_check check (
    (
      lifecycle_status = 'open'
      and closed_at is null
      and converted_order_id is null
      and retention_due_at is null
    )
    or
    (
      lifecycle_status = 'closed'
      and closed_at is not null
      and converted_order_id is null
      and retention_due_at is not null
      and closed_at >= created_at
      and retention_due_at >= closed_at
    )
    or
    (
      lifecycle_status = 'converted'
      and closed_at is not null
      and converted_order_id is not null
      and closed_at >= created_at
      and (
        retention_due_at is null
        or retention_due_at >= closed_at
      )
    )
  ),
  drop constraint if exists workshop_enquiries_last_contacted_at_check,
  add constraint workshop_enquiries_last_contacted_at_check check (
    last_contacted_at is null
    or last_contacted_at >= created_at
  ),
  drop constraint if exists workshop_enquiries_legal_hold_check,
  add constraint workshop_enquiries_legal_hold_check check (
    (
      legal_hold = false
      and legal_hold_reason is null
      and legal_hold_review_at is null
    )
    or
    (
      legal_hold = true
      and legal_hold_reason is not null
      and legal_hold_reason in (
        'active-complaint',
        'legal-claim',
        'regulatory-request',
        'fraud-investigation',
        'other-necessary-hold'
      )
      and legal_hold_review_at is not null
    )
  ),
  drop constraint if exists workshop_enquiries_converted_order_id_fkey,
  add constraint workshop_enquiries_converted_order_id_fkey
    foreign key (converted_order_id)
    references public.orders (id)
    on delete cascade;

alter table public.event_photo_requests
  drop constraint if exists event_photo_requests_lifecycle_check,
  add constraint event_photo_requests_lifecycle_check check (
    (
      lifecycle_status = 'open'
      and closed_at is null
      and retention_due_at is null
    )
    or
    (
      lifecycle_status = 'closed'
      and closed_at is not null
      and retention_due_at is not null
      and closed_at >= created_at
      and retention_due_at >= closed_at
    )
  ),
  drop constraint if exists event_photo_requests_last_contacted_at_check,
  add constraint event_photo_requests_last_contacted_at_check check (
    last_contacted_at is null
    or last_contacted_at >= created_at
  ),
  drop constraint if exists event_photo_requests_upload_retention_due_check,
  add constraint event_photo_requests_upload_retention_due_check check (
    upload_retention_due_at is null
    or upload_retention_due_at >= created_at
  ),
  drop constraint if exists event_photo_requests_legal_hold_check,
  add constraint event_photo_requests_legal_hold_check check (
    (
      legal_hold = false
      and legal_hold_reason is null
      and legal_hold_review_at is null
    )
    or
    (
      legal_hold = true
      and legal_hold_reason is not null
      and legal_hold_reason in (
        'active-complaint',
        'legal-claim',
        'regulatory-request',
        'fraud-investigation',
        'other-necessary-hold'
      )
      and legal_hold_review_at is not null
    )
  );

alter table public.orders
  drop constraint if exists orders_retention_lifecycle_check,
  add constraint orders_retention_lifecycle_check check (
    (
      completed_at is null
      and financial_year_ended_at is null
      and retention_due_at is null
    )
    or
    (
      completed_at is not null
      and financial_year_ended_at is not null
      and retention_due_at is not null
      and completed_at >= created_at
      and financial_year_ended_at >= completed_at::date
      and extract(month from financial_year_ended_at) = 4
      and extract(day from financial_year_ended_at) = 5
      and retention_due_at::date >= (
        financial_year_ended_at + interval '6 years'
      )::date
    )
  ),
  drop constraint if exists orders_legal_hold_check,
  add constraint orders_legal_hold_check check (
    (
      legal_hold = false
      and legal_hold_reason is null
      and legal_hold_review_at is null
    )
    or
    (
      legal_hold = true
      and legal_hold_reason is not null
      and legal_hold_reason in (
        'active-complaint',
        'legal-claim',
        'regulatory-request',
        'fraud-investigation',
        'other-necessary-hold'
      )
      and legal_hold_review_at is not null
    )
  );

create index if not exists contact_enquiries_retention_due_idx
  on public.contact_enquiries (retention_due_at, legal_hold)
  where retention_due_at is not null;

create index if not exists contact_enquiries_legal_hold_review_idx
  on public.contact_enquiries (legal_hold_review_at)
  where legal_hold = true;

create index if not exists custom_cake_enquiries_retention_due_idx
  on public.custom_cake_enquiries (retention_due_at, legal_hold)
  where retention_due_at is not null;

create index if not exists custom_cake_enquiries_legal_hold_review_idx
  on public.custom_cake_enquiries (legal_hold_review_at)
  where legal_hold = true;

create index if not exists custom_cake_enquiries_upload_retention_due_idx
  on public.custom_cake_enquiries (upload_retention_due_at, legal_hold)
  where upload_retention_due_at is not null;

create index if not exists workshop_enquiries_retention_due_idx
  on public.workshop_enquiries (retention_due_at, legal_hold)
  where retention_due_at is not null;

create index if not exists workshop_enquiries_legal_hold_review_idx
  on public.workshop_enquiries (legal_hold_review_at)
  where legal_hold = true;

create index if not exists event_photo_requests_retention_due_idx
  on public.event_photo_requests (retention_due_at, legal_hold)
  where retention_due_at is not null;

create index if not exists event_photo_requests_legal_hold_review_idx
  on public.event_photo_requests (legal_hold_review_at)
  where legal_hold = true;

create index if not exists event_photo_requests_upload_retention_due_idx
  on public.event_photo_requests (upload_retention_due_at, legal_hold)
  where upload_retention_due_at is not null;

create index if not exists orders_retention_due_idx
  on public.orders (retention_due_at, legal_hold)
  where retention_due_at is not null;

create index if not exists orders_legal_hold_review_idx
  on public.orders (legal_hold_review_at)
  where legal_hold = true;

create table if not exists public.privacy_retention_runs (
  id uuid primary key default gen_random_uuid(),
  run_reference text not null unique,
  run_mode text not null,
  status text not null default 'pending',
  initiator text not null,
  selected_categories text[] not null default '{}',
  candidate_count integer not null default 0,
  selected_count integer not null default 0,
  succeeded_count integer not null default 0,
  skipped_count integer not null default 0,
  failed_count integer not null default 0,
  reviewed_schedule boolean not null default false,
  reviewed_external_systems boolean not null default false,
  started_at timestamptz not null default clock_timestamp(),
  completed_at timestamptz,
  updated_at timestamptz not null default clock_timestamp(),
  constraint privacy_retention_runs_reference_check check (
    char_length(run_reference) between 1 and 96
    and run_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:-]*$'
  ),
  constraint privacy_retention_runs_mode_check check (
    run_mode in ('discovery', 'manual', 'owner-review')
  ),
  constraint privacy_retention_runs_status_check check (
    status in (
      'pending',
      'running',
      'completed',
      'partial',
      'failed'
    )
  ),
  constraint privacy_retention_runs_initiator_check check (
    initiator in ('admin', 'scheduled')
  ),
  constraint privacy_retention_runs_categories_check check (
    selected_categories <@ array[
      'expired-enquiry',
      'expired-enquiry-upload',
      'expired-order-upload',
      'expired-order',
      'expired-security-record',
      'expired-health-information'
    ]::text[]
  ),
  constraint privacy_retention_runs_counts_check check (
    candidate_count >= 0
    and selected_count >= 0
    and succeeded_count >= 0
    and skipped_count >= 0
    and failed_count >= 0
    and selected_count <= candidate_count
    and succeeded_count + skipped_count + failed_count <= selected_count
  ),
  constraint privacy_retention_runs_owner_review_evidence_check check (
    (
      run_mode = 'owner-review'
      and reviewed_schedule = true
      and reviewed_external_systems = true
    )
    or
    (
      run_mode <> 'owner-review'
      and reviewed_schedule = false
      and reviewed_external_systems = false
    )
  ),
  constraint privacy_retention_runs_completion_check check (
    (
      status in ('pending', 'running')
      and completed_at is null
    )
    or
    (
      status in ('completed', 'partial', 'failed')
      and completed_at is not null
      and completed_at >= started_at
    )
  )
);

create table if not exists public.privacy_retention_actions (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null,
  candidate_id text not null,
  category text not null,
  record_type text not null,
  record_reference text not null,
  due_at timestamptz not null,
  snapshot_revision text not null,
  selected boolean not null default false,
  action_type text not null,
  outcome text not null default 'pending',
  reason_code text,
  error_code text,
  occurred_at timestamptz not null default clock_timestamp(),
  constraint privacy_retention_actions_run_id_fkey
    foreign key (run_id)
    references public.privacy_retention_runs (id)
    on delete restrict,
  constraint privacy_retention_actions_candidate_id_check check (
    char_length(candidate_id) between 1 and 160
    and candidate_id ~ '^[A-Za-z0-9][A-Za-z0-9._:/-]*$'
  ),
  constraint privacy_retention_actions_category_check check (
    category in (
      'expired-enquiry',
      'expired-enquiry-upload',
      'expired-order-upload',
      'expired-order',
      'expired-security-record',
      'expired-health-information'
    )
  ),
  constraint privacy_retention_actions_record_type_check check (
    record_type in (
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
      'Event-photo rate-limit records',
      'Enquiry health information',
      'Order health information'
    )
  ),
  constraint privacy_retention_actions_record_reference_check check (
    char_length(record_reference) between 1 and 128
    and record_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:/-]*$'
  ),
  constraint privacy_retention_actions_action_type_check check (
    action_type in (
      'delete-enquiry-record',
      'delete-enquiry-upload',
      'delete-order-upload',
      'delete-order-record',
      'delete-security-batch',
      'erase-health-information'
    )
  ),
  constraint privacy_retention_actions_category_action_check check (
    (category = 'expired-enquiry' and action_type = 'delete-enquiry-record')
    or (
      category = 'expired-enquiry-upload'
      and action_type = 'delete-enquiry-upload'
    )
    or (
      category = 'expired-order-upload'
      and action_type = 'delete-order-upload'
    )
    or (category = 'expired-order' and action_type = 'delete-order-record')
    or (
      category = 'expired-security-record'
      and action_type = 'delete-security-batch'
    )
    or (
      category = 'expired-health-information'
      and action_type = 'erase-health-information'
    )
  ),
  constraint privacy_retention_actions_outcome_check check (
    outcome in (
      'pending',
      'deleted',
      'skipped',
      'failed'
    )
  ),
  constraint privacy_retention_actions_reason_code_check check (
    reason_code is null
    or reason_code in (
      'retention-expired',
      'legal-hold',
      'manual-exclusion',
      'not-found',
      'operation-failed'
    )
  ),
  constraint privacy_retention_actions_error_code_check check (
    (
      outcome = 'failed'
      and error_code is not null
      and error_code ~ '^[A-Z][A-Z0-9_]{0,63}$'
    )
    or
    (
      outcome <> 'failed'
      and error_code is null
    )
  ),
  constraint privacy_retention_actions_due_at_check check (
    due_at <= occurred_at
  ),
  constraint privacy_retention_actions_snapshot_revision_check check (
    snapshot_revision ~ '^[0-9a-f]{64}$'
  ),
  constraint privacy_retention_actions_selection_check check (
    outcome in ('pending', 'skipped')
    or selected = true
  ),
  constraint privacy_retention_actions_run_candidate_key unique (
    run_id,
    candidate_id
  )
);

-- A row in this table is the legal-hold state for one of the three fixed
-- security/abuse-prevention batches. It deliberately contains no IP address,
-- request payload, provider response or other underlying security record.
create table if not exists public.privacy_retention_security_holds (
  record_type text primary key,
  reason text not null,
  review_at timestamptz not null,
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp(),
  constraint privacy_retention_security_holds_record_type_check check (
    record_type in (
      'enquiry-rate-limits',
      'admin-login-attempts',
      'event-photo-rate-limits'
    )
  ),
  constraint privacy_retention_security_holds_reason_check check (
    reason in (
      'active-complaint',
      'legal-claim',
      'regulatory-request',
      'fraud-investigation',
      'other-necessary-hold'
    )
  ),
  constraint privacy_retention_security_holds_review_at_check check (
    review_at > created_at
  )
);

-- Legal-hold history is intentionally non-sensitive and append-only. It
-- records only the fixed reason code, review date and safe record reference;
-- customer content, filenames and storage paths are never stored here.
create table if not exists public.privacy_retention_hold_events (
  id uuid primary key default gen_random_uuid(),
  candidate_id text not null,
  record_type text not null,
  record_reference text not null,
  event_type text not null,
  previous_hold_active boolean not null,
  previous_hold_reason text,
  previous_hold_review_at timestamptz,
  new_hold_active boolean not null,
  new_hold_reason text,
  new_hold_review_at timestamptz,
  occurred_at timestamptz not null default clock_timestamp(),
  constraint privacy_retention_hold_events_candidate_check check (
    char_length(candidate_id) between 1 and 160
    and candidate_id ~ '^[A-Za-z0-9][A-Za-z0-9._:/-]*$'
  ),
  constraint privacy_retention_hold_events_reference_check check (
    char_length(record_reference) between 1 and 128
    and record_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:/-]*$'
  ),
  constraint privacy_retention_hold_events_record_type_check check (
    record_type in (
      'contact-enquiry',
      'custom-cake-enquiry',
      'workshop-enquiry',
      'event-photo-request',
      'order',
      'security-batch'
    )
  ),
  constraint privacy_retention_hold_events_type_check check (
    event_type in ('placed', 'extended', 'released')
  ),
  constraint privacy_retention_hold_events_reason_check check (
    (
      previous_hold_reason is null
      or previous_hold_reason in (
        'active-complaint',
        'legal-claim',
        'regulatory-request',
        'fraud-investigation',
        'other-necessary-hold'
      )
    )
    and (
      new_hold_reason is null
      or new_hold_reason in (
        'active-complaint',
        'legal-claim',
        'regulatory-request',
        'fraud-investigation',
        'other-necessary-hold'
      )
    )
  ),
  constraint privacy_retention_hold_events_previous_state_check check (
    (
      previous_hold_active
      and previous_hold_reason is not null
      and previous_hold_review_at is not null
    )
    or (
      not previous_hold_active
      and previous_hold_reason is null
      and previous_hold_review_at is null
    )
  ),
  constraint privacy_retention_hold_events_new_state_check check (
    (
      new_hold_active
      and new_hold_reason is not null
      and new_hold_review_at is not null
    )
    or (
      not new_hold_active
      and new_hold_reason is null
      and new_hold_review_at is null
    )
  ),
  constraint privacy_retention_hold_events_transition_check check (
    (event_type = 'placed' and not previous_hold_active and new_hold_active)
    or (event_type = 'extended' and previous_hold_active and new_hold_active)
    or (event_type = 'released' and previous_hold_active and not new_hold_active)
  )
);

-- This is a non-sensitive deletion outbox/claim. The candidate identifier is
-- an opaque table/id reference already used by the audit log; storage paths,
-- filenames and customer content must never be written here.
create table if not exists public.privacy_retention_deletion_claims (
  candidate_id text primary key,
  category text not null,
  run_id uuid,
  action_id uuid,
  state text not null default 'claimed',
  claim_token uuid,
  irreversible_started boolean not null default false,
  lease_expires_at timestamptz,
  cutoff_at timestamptz not null,
  last_error_code text,
  terminal_outcome text,
  affected_count bigint,
  finalized_at timestamptz,
  claimed_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp(),
  constraint privacy_retention_deletion_claims_run_fkey
    foreign key (run_id)
    references public.privacy_retention_runs (id)
    on delete restrict,
  constraint privacy_retention_deletion_claims_action_fkey
    foreign key (action_id)
    references public.privacy_retention_actions (id)
    on delete restrict,
  constraint privacy_retention_deletion_claims_candidate_id_check check (
    char_length(candidate_id) between 1 and 160
    and candidate_id ~ '^[A-Za-z0-9][A-Za-z0-9._:/-]*$'
  ),
  constraint privacy_retention_deletion_claims_category_check check (
    category in (
      'expired-enquiry',
      'expired-enquiry-upload',
      'expired-order-upload',
      'expired-order',
      'expired-security-record',
      'expired-health-information'
    )
  ),
  constraint privacy_retention_deletion_claims_state_check check (
    state in ('claimed', 'external-delete', 'retryable', 'finalized')
  ),
  constraint privacy_retention_deletion_claims_lease_check check (
    (
      state in ('claimed', 'external-delete')
      and claim_token is not null
      and lease_expires_at is not null
      and lease_expires_at > claimed_at
    )
    or
    (
      state = 'retryable'
      and claim_token is null
      and lease_expires_at is null
    )
    or
    (
      state = 'finalized'
      and claim_token is null
      and lease_expires_at is null
    )
  ),
  constraint privacy_retention_deletion_claims_irreversible_check check (
    state <> 'external-delete' or irreversible_started = true
  ),
  constraint privacy_retention_deletion_claims_error_check check (
    last_error_code is null
    or last_error_code ~ '^[A-Z][A-Z0-9_]{0,63}$'
  ),
  constraint privacy_retention_deletion_claims_action_identity_check check (
    (run_id is null and action_id is null)
    or (run_id is not null and action_id is not null)
  ),
  constraint privacy_retention_deletion_claims_cutoff_check check (
    cutoff_at <= claimed_at + interval '5 minutes'
  ),
  constraint privacy_retention_deletion_claims_terminal_check check (
    (
      state = 'finalized'
      and terminal_outcome in ('deleted', 'skipped')
      and affected_count is not null
      and affected_count >= 0
      and finalized_at is not null
    )
    or (
      state <> 'finalized'
      and terminal_outcome is null
      and affected_count is null
      and finalized_at is null
    )
  )
);

create index if not exists privacy_retention_runs_started_at_idx
  on public.privacy_retention_runs (started_at desc);

create index if not exists privacy_retention_actions_run_id_idx
  on public.privacy_retention_actions (run_id, occurred_at);

create index if not exists privacy_retention_deletion_claims_state_idx
  on public.privacy_retention_deletion_claims (state, updated_at);

create index if not exists privacy_retention_deletion_claims_action_idx
  on public.privacy_retention_deletion_claims (run_id, action_id);

create index if not exists privacy_retention_hold_events_candidate_idx
  on public.privacy_retention_hold_events (candidate_id, occurred_at desc);

create or replace function public.set_future_order_retention_lifecycle()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  uk_completion_date date;
  uk_completion_year integer;
  should_set_retention boolean := false;
begin
  if tg_op = 'INSERT' then
    should_set_retention := new.status in ('completed', 'delivered', 'cancelled');
  elsif tg_op = 'UPDATE' then
    should_set_retention :=
      new.status in ('completed', 'delivered', 'cancelled')
      and old.status not in ('completed', 'delivered', 'cancelled');
  end if;

  if should_set_retention then
    new.completed_at := coalesce(new.completed_at, clock_timestamp());
    uk_completion_date := (new.completed_at at time zone 'Europe/London')::date;
    uk_completion_year := extract(year from uk_completion_date)::integer;

    new.financial_year_ended_at := coalesce(
      new.financial_year_ended_at,
      case
        when uk_completion_date <= make_date(uk_completion_year, 4, 5)
          then make_date(uk_completion_year, 4, 5)
        else make_date(uk_completion_year + 1, 4, 5)
      end
    );

    new.retention_due_at := coalesce(
      new.retention_due_at,
      (
        new.financial_year_ended_at
        + interval '6 years'
        + interval '1 day'
      ) at time zone 'Europe/London'
    );

    update public.contact_enquiries
    set retention_due_at = new.retention_due_at
    where converted_order_id = new.id
      and lifecycle_status = 'converted';

    update public.custom_cake_enquiries
    set
      retention_due_at = new.retention_due_at,
      upload_retention_due_at = new.completed_at + interval '24 months'
    where converted_order_id = new.id
      and lifecycle_status = 'converted';

    update public.workshop_enquiries
    set retention_due_at = new.retention_due_at
    where converted_order_id = new.id
      and lifecycle_status = 'converted';
  end if;

  return new;
end;
$$;

create or replace function public.protect_terminal_order_retention_lifecycle()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  old_terminal boolean := old.status::text in ('completed', 'delivered', 'cancelled');
  new_terminal boolean := new.status::text in ('completed', 'delivered', 'cancelled');
  lifecycle_authorization text := nullif(
    current_setting('app.privacy_retention_lifecycle_mutation', true),
    ''
  );
begin
  if not old_terminal then
    return new;
  end if;

  if not new_terminal or new.status is distinct from old.status then
    raise exception using
      errcode = '23514',
      message = 'A terminal order cannot be reopened or moved to another terminal lifecycle implicitly';
  end if;

  if (
    new.completed_at is distinct from old.completed_at
    or new.financial_year_ended_at is distinct from old.financial_year_ended_at
    or new.retention_due_at is distinct from old.retention_due_at
  ) and lifecycle_authorization <> 'order:' || old.id::text then
    raise exception using
      errcode = '42501',
      message = 'Terminal order retention dates require a controlled audited transition';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_terminal_order_retention_lifecycle
  on public.orders;

create trigger protect_terminal_order_retention_lifecycle
before update on public.orders
for each row
execute function public.protect_terminal_order_retention_lifecycle();

drop trigger if exists set_future_order_retention_lifecycle
  on public.orders;

create trigger set_future_order_retention_lifecycle
before insert or update of status on public.orders
for each row
execute function public.set_future_order_retention_lifecycle();

create or replace function public.prevent_held_order_bundle_deletion()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if old.legal_hold = true or exists (
    select 1
    from public.contact_enquiries
    where converted_order_id = old.id
      and lifecycle_status = 'converted'
      and legal_hold = true
    union all
    select 1
    from public.custom_cake_enquiries
    where converted_order_id = old.id
      and lifecycle_status = 'converted'
      and legal_hold = true
    union all
    select 1
    from public.workshop_enquiries
    where converted_order_id = old.id
      and lifecycle_status = 'converted'
      and legal_hold = true
  ) then
    raise exception using
      errcode = '23514',
      message = 'A legal hold prevents deletion of this order bundle';
  end if;

  return old;
end;
$$;

drop trigger if exists prevent_held_order_bundle_deletion
  on public.orders;

create trigger prevent_held_order_bundle_deletion
before delete on public.orders
for each row
execute function public.prevent_held_order_bundle_deletion();

create or replace function public.prevent_held_converted_upload_redaction()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  linked_order_held boolean := false;
  removes_upload_information boolean := false;
begin
  removes_upload_information :=
    (
      nullif(btrim(old.reference_image_bucket), '') is not null
      and nullif(btrim(new.reference_image_bucket), '') is null
    )
    or (
      nullif(btrim(old.reference_image_path), '') is not null
      and nullif(btrim(new.reference_image_path), '') is null
    )
    or (
      nullif(btrim(old.reference_image_name), '') is not null
      and nullif(btrim(new.reference_image_name), '') is null
    )
    or (
      nullif(btrim(old.reference_image_type), '') is not null
      and nullif(btrim(new.reference_image_type), '') is null
    )
    or (old.reference_image_size is not null and new.reference_image_size is null);

  if old.converted_order_id is null or removes_upload_information = false then
    return new;
  end if;

  select orders.legal_hold
  into linked_order_held
  from public.orders as orders
  where orders.id = old.converted_order_id
  for share;

  if coalesce(linked_order_held, false) then
    raise exception using
      errcode = '23514',
      message = 'A linked order legal hold prevents upload redaction';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_held_converted_upload_redaction
  on public.custom_cake_enquiries;

create trigger prevent_held_converted_upload_redaction
before update of
  reference_image_bucket,
  reference_image_path,
  reference_image_name,
  reference_image_type,
  reference_image_size
on public.custom_cake_enquiries
for each row
execute function public.prevent_held_converted_upload_redaction();

create or replace function public.close_event_photo_request_after_file_cleanup()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  effective_closed_at timestamptz;
begin
  if old.files_deleted_at is null and new.files_deleted_at is not null then
    effective_closed_at := coalesce(new.closed_at, new.files_deleted_at);
    new.lifecycle_status := 'closed';
    new.last_contacted_at := coalesce(new.last_contacted_at, effective_closed_at);
    new.closed_at := effective_closed_at;
    new.retention_due_at := coalesce(
      new.retention_due_at,
      effective_closed_at + interval '24 months'
    );
    new.upload_retention_due_at := null;
  end if;

  return new;
end;
$$;

drop trigger if exists close_event_photo_request_after_file_cleanup
  on public.event_photo_requests;

create trigger close_event_photo_request_after_file_cleanup
before update of files_deleted_at on public.event_photo_requests
for each row
execute function public.close_event_photo_request_after_file_cleanup();

-- Existing cleanup timestamps are reliable lifecycle evidence, so use them
-- without inventing a date or deleting anything during migration.
update public.event_photo_requests
set
  lifecycle_status = 'closed',
  last_contacted_at = coalesce(last_contacted_at, files_deleted_at),
  closed_at = coalesce(closed_at, files_deleted_at),
  retention_due_at = coalesce(
    retention_due_at,
    files_deleted_at + interval '24 months'
  ),
  upload_retention_due_at = null
where files_deleted_at is not null
  and lifecycle_status = 'open'
  and retention_due_at is null;

create or replace function public.assert_privacy_retention_mutation_allowed(
  p_candidate_ids text[]
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  session_claim_token text := nullif(
    current_setting('app.privacy_retention_claim_token', true),
    ''
  );
begin
  if exists (
    select 1
    from public.privacy_retention_deletion_claims as claim
    where claim.candidate_id = any(p_candidate_ids)
      and claim.state <> 'finalized'
      and (
        session_claim_token is null
        or claim.claim_token is null
        or claim.claim_token::text <> session_claim_token
      )
  ) then
    raise exception using
      errcode = '55P03',
      message = 'A privacy-retention deletion claim protects this record';
  end if;
end;
$$;

create or replace function public.prevent_claimed_enquiry_mutation()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  old_json jsonb := case when tg_op = 'INSERT' then '{}'::jsonb else to_jsonb(old) end;
  new_json jsonb := case when tg_op = 'DELETE' then '{}'::jsonb else to_jsonb(new) end;
  record_id text := coalesce(new_json->>'id', old_json->>'id');
  enquiry_type text;
  old_linked_order_id text := nullif(old_json->>'converted_order_id', '');
  new_linked_order_id text := nullif(new_json->>'converted_order_id', '');
  linked_order_id text;
  candidate_ids text[];
begin
  enquiry_type := case tg_table_name
    when 'contact_enquiries' then 'contact'
    when 'custom_cake_enquiries' then 'custom-cake'
    when 'workshop_enquiries' then 'workshop'
    when 'event_photo_requests' then 'event-photo'
    else null
  end;

  if enquiry_type is null or record_id is null then
    raise exception 'Unsupported enquiry retention trigger target';
  end if;

  candidate_ids := array[
    'enquiry:' || enquiry_type || ':' || record_id,
    'enquiry-upload:' || enquiry_type || ':' || record_id,
    'health:enquiry:' || enquiry_type || ':' || record_id
  ];

  -- Serialize normal writes with both full-record and upload claims. Without
  -- these locks a mutation that began just before a claim committed could add
  -- evidence after the candidate bundle was frozen.
  if not pg_try_advisory_xact_lock(
    hashtextextended(
      'privacy-retention-candidate:enquiry:' || enquiry_type || ':' || record_id,
      0
    )
  ) then
    raise exception using
      errcode = '55P03',
      message = 'A privacy-retention operation is claiming this enquiry';
  end if;
  if not pg_try_advisory_xact_lock(
    hashtextextended(
      'privacy-retention-candidate:enquiry-upload:' || enquiry_type || ':' || record_id,
      0
    )
  ) then
    raise exception using
      errcode = '55P03',
      message = 'A privacy-retention operation is claiming this enquiry';
  end if;

  if old_linked_order_id is not null then
    candidate_ids := candidate_ids || array[
      'order:' || old_linked_order_id,
      'order-upload:' || old_linked_order_id
    ];
  end if;

  if new_linked_order_id is not null then
    candidate_ids := candidate_ids || array[
      'order:' || new_linked_order_id,
      'order-upload:' || new_linked_order_id
    ];
  end if;

  for linked_order_id in
    select distinct value
    from unnest(array[old_linked_order_id, new_linked_order_id]) as item(value)
    where value is not null
    order by value
  loop
    if not pg_try_advisory_xact_lock(
      hashtextextended(
        'privacy-retention-order-bundle:' || linked_order_id,
        0
      )
    ) then
      raise exception using
        errcode = '55P03',
        message = 'A privacy-retention operation is claiming this order bundle';
    end if;
  end loop;

  select candidate_ids || coalesce(array_agg(
    'enquiry-upload:custom-cake:' || enquiry.id::text
  ), '{}'::text[])
  into candidate_ids
  from public.custom_cake_enquiries as enquiry
  where enquiry.lifecycle_status = 'converted'
    and enquiry.converted_order_id::text in (
      old_linked_order_id,
      new_linked_order_id
    );

  perform public.assert_privacy_retention_mutation_allowed(candidate_ids);
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create or replace function public.prevent_claimed_order_mutation()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  order_id text := case when tg_op = 'DELETE' then old.id::text else new.id::text end;
  candidate_ids text[] := array[
    'order:' || order_id,
    'order-upload:' || order_id,
    'health:order:' || order_id
  ];
begin
  if not pg_try_advisory_xact_lock(
    hashtextextended('privacy-retention-order-bundle:' || order_id, 0)
  ) then
    raise exception using
      errcode = '55P03',
      message = 'A privacy-retention operation is claiming this order bundle';
  end if;

  select candidate_ids || coalesce(array_agg(
    'enquiry-upload:custom-cake:' || enquiry.id::text
  ), '{}'::text[])
  into candidate_ids
  from public.custom_cake_enquiries as enquiry
  where enquiry.converted_order_id::text = order_id
    and enquiry.lifecycle_status = 'converted';

  perform public.assert_privacy_retention_mutation_allowed(candidate_ids);
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create or replace function public.prevent_claimed_order_child_mutation()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  old_json jsonb := case when tg_op = 'INSERT' then '{}'::jsonb else to_jsonb(old) end;
  new_json jsonb := case when tg_op = 'DELETE' then '{}'::jsonb else to_jsonb(new) end;
  order_ids text[] := '{}';
  order_id text;
begin
  if tg_table_name in ('order_items', 'order_messages', 'order_notes') then
    order_ids := array[
      nullif(old_json->>'order_id', ''),
      nullif(new_json->>'order_id', '')
    ];
  elsif tg_table_name = 'order_message_attachments' then
    select coalesce(array_agg(distinct message.order_id::text), '{}'::text[])
    into order_ids
    from public.order_messages as message
    where message.id::text in (
      old_json->>'message_id',
      new_json->>'message_id'
    );
  elsif tg_table_name = 'order_note_images' then
    select coalesce(array_agg(distinct note.order_id::text), '{}'::text[])
    into order_ids
    from public.order_notes as note
    where note.id::text in (
      old_json->>'note_id',
      new_json->>'note_id'
    );
  end if;

  select coalesce(array_agg(candidate_id), '{}'::text[])
  into order_ids
  from (
    select 'order:' || value as candidate_id
    from unnest(order_ids) as value
    where value is not null
    union
    select 'order-upload:' || value as candidate_id
    from unnest(order_ids) as value
    where value is not null
  ) as candidates;

  select order_ids || coalesce(array_agg(
    'enquiry-upload:custom-cake:' || enquiry.id::text
  ), '{}'::text[])
  into order_ids
  from public.custom_cake_enquiries as enquiry
  where enquiry.lifecycle_status = 'converted'
    and 'order:' || enquiry.converted_order_id::text = any(order_ids);

  if coalesce(array_length(order_ids, 1), 0) > 0 then
    for order_id in
      select distinct replace(candidate_id, 'order:', '')
      from unnest(order_ids) as candidate(candidate_id)
      where candidate_id like 'order:%'
      order by 1
    loop
      if not pg_try_advisory_xact_lock(
        hashtextextended('privacy-retention-order-bundle:' || order_id, 0)
      ) then
        raise exception using
          errcode = '55P03',
          message = 'A privacy-retention operation is claiming this order bundle';
      end if;
    end loop;
    perform public.assert_privacy_retention_mutation_allowed(order_ids);
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create or replace function public.prevent_claimed_security_hold_mutation()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  record_type text := case
    when tg_op = 'DELETE' then old.record_type
    else new.record_type
  end;
begin
  if not pg_try_advisory_xact_lock(
    hashtextextended('privacy-retention-candidate:security:' || record_type, 0)
  ) then
    raise exception using
      errcode = '55P03',
      message = 'A privacy-retention operation is claiming this security batch';
  end if;
  perform public.assert_privacy_retention_mutation_allowed(
    array['security:' || record_type]
  );
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

-- Parent records are never permanently deleted by a raw service-role table
-- operation. Cascaded converted enquiries may use the same order-bundle claim
-- token, but standalone enquiries require their own exact full-record claim.
create or replace function public.require_privacy_retention_claim_for_parent_delete()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  record_json jsonb := to_jsonb(old);
  record_id text := record_json->>'id';
  enquiry_type text;
  linked_order_id text := nullif(record_json->>'converted_order_id', '');
  candidate_ids text[] := '{}';
  session_claim_token text := nullif(
    current_setting('app.privacy_retention_claim_token', true),
    ''
  );
begin
  if tg_table_name = 'orders' then
    candidate_ids := array['order:' || record_id];
  else
    enquiry_type := case tg_table_name
      when 'contact_enquiries' then 'contact'
      when 'custom_cake_enquiries' then 'custom-cake'
      when 'workshop_enquiries' then 'workshop'
      when 'event_photo_requests' then 'event-photo'
      else null
    end;
    if enquiry_type is null then
      raise exception 'Unsupported retention parent deletion target';
    end if;
    candidate_ids := array[
      'enquiry:' || enquiry_type || ':' || record_id
    ];
    if linked_order_id is not null
      and record_json->>'lifecycle_status' = 'converted'
    then
      candidate_ids := candidate_ids || array['order:' || linked_order_id];
    end if;
  end if;

  if session_claim_token is null or not exists (
    select 1
    from public.privacy_retention_deletion_claims as claim
    where claim.candidate_id = any(candidate_ids)
      and claim.claim_token::text = session_claim_token
      and claim.state in ('claimed', 'external-delete')
  ) then
    raise exception using
      errcode = '42501',
      message = 'A matching full-record deletion claim is required';
  end if;

  return old;
end;
$$;

drop trigger if exists prevent_claimed_contact_enquiry_mutation
  on public.contact_enquiries;
create trigger prevent_claimed_contact_enquiry_mutation
before update or delete on public.contact_enquiries
for each row execute function public.prevent_claimed_enquiry_mutation();
drop trigger if exists prevent_claimed_contact_enquiry_insert
  on public.contact_enquiries;
create trigger prevent_claimed_contact_enquiry_insert
after insert on public.contact_enquiries
for each row execute function public.prevent_claimed_enquiry_mutation();

drop trigger if exists prevent_claimed_custom_cake_enquiry_mutation
  on public.custom_cake_enquiries;
create trigger prevent_claimed_custom_cake_enquiry_mutation
before update or delete on public.custom_cake_enquiries
for each row execute function public.prevent_claimed_enquiry_mutation();
drop trigger if exists prevent_claimed_custom_cake_enquiry_insert
  on public.custom_cake_enquiries;
create trigger prevent_claimed_custom_cake_enquiry_insert
after insert on public.custom_cake_enquiries
for each row execute function public.prevent_claimed_enquiry_mutation();

drop trigger if exists prevent_claimed_workshop_enquiry_mutation
  on public.workshop_enquiries;
create trigger prevent_claimed_workshop_enquiry_mutation
before update or delete on public.workshop_enquiries
for each row execute function public.prevent_claimed_enquiry_mutation();
drop trigger if exists prevent_claimed_workshop_enquiry_insert
  on public.workshop_enquiries;
create trigger prevent_claimed_workshop_enquiry_insert
after insert on public.workshop_enquiries
for each row execute function public.prevent_claimed_enquiry_mutation();

drop trigger if exists prevent_claimed_event_photo_request_mutation
  on public.event_photo_requests;
create trigger prevent_claimed_event_photo_request_mutation
before update or delete on public.event_photo_requests
for each row execute function public.prevent_claimed_enquiry_mutation();
drop trigger if exists prevent_claimed_event_photo_request_insert
  on public.event_photo_requests;
create trigger prevent_claimed_event_photo_request_insert
after insert on public.event_photo_requests
for each row execute function public.prevent_claimed_enquiry_mutation();

drop trigger if exists prevent_claimed_order_mutation on public.orders;
create trigger prevent_claimed_order_mutation
before update or delete on public.orders
for each row execute function public.prevent_claimed_order_mutation();

drop trigger if exists prevent_claimed_order_message_mutation
  on public.order_messages;
create trigger prevent_claimed_order_message_mutation
before update or delete on public.order_messages
for each row execute function public.prevent_claimed_order_child_mutation();

drop trigger if exists prevent_claimed_order_item_mutation
  on public.order_items;
create trigger prevent_claimed_order_item_mutation
before update or delete on public.order_items
for each row execute function public.prevent_claimed_order_child_mutation();
drop trigger if exists prevent_claimed_order_item_insert
  on public.order_items;
create trigger prevent_claimed_order_item_insert
after insert on public.order_items
for each row execute function public.prevent_claimed_order_child_mutation();
drop trigger if exists prevent_claimed_order_message_insert
  on public.order_messages;
create trigger prevent_claimed_order_message_insert
after insert on public.order_messages
for each row execute function public.prevent_claimed_order_child_mutation();

drop trigger if exists prevent_claimed_order_attachment_mutation
  on public.order_message_attachments;
create trigger prevent_claimed_order_attachment_mutation
before update or delete on public.order_message_attachments
for each row execute function public.prevent_claimed_order_child_mutation();
drop trigger if exists prevent_claimed_order_attachment_insert
  on public.order_message_attachments;
create trigger prevent_claimed_order_attachment_insert
after insert on public.order_message_attachments
for each row execute function public.prevent_claimed_order_child_mutation();

drop trigger if exists prevent_claimed_order_note_mutation
  on public.order_notes;
create trigger prevent_claimed_order_note_mutation
before update or delete on public.order_notes
for each row execute function public.prevent_claimed_order_child_mutation();
drop trigger if exists prevent_claimed_order_note_insert
  on public.order_notes;
create trigger prevent_claimed_order_note_insert
after insert on public.order_notes
for each row execute function public.prevent_claimed_order_child_mutation();

drop trigger if exists prevent_claimed_order_note_image_mutation
  on public.order_note_images;
create trigger prevent_claimed_order_note_image_mutation
before update or delete on public.order_note_images
for each row execute function public.prevent_claimed_order_child_mutation();
drop trigger if exists prevent_claimed_order_note_image_insert
  on public.order_note_images;
create trigger prevent_claimed_order_note_image_insert
after insert on public.order_note_images
for each row execute function public.prevent_claimed_order_child_mutation();

drop trigger if exists prevent_claimed_security_hold_mutation
  on public.privacy_retention_security_holds;
create trigger prevent_claimed_security_hold_mutation
before insert or update or delete on public.privacy_retention_security_holds
for each row execute function public.prevent_claimed_security_hold_mutation();

drop trigger if exists require_retention_claim_for_contact_enquiry_delete
  on public.contact_enquiries;
create trigger require_retention_claim_for_contact_enquiry_delete
before delete on public.contact_enquiries
for each row execute function public.require_privacy_retention_claim_for_parent_delete();

drop trigger if exists require_retention_claim_for_custom_cake_enquiry_delete
  on public.custom_cake_enquiries;
create trigger require_retention_claim_for_custom_cake_enquiry_delete
before delete on public.custom_cake_enquiries
for each row execute function public.require_privacy_retention_claim_for_parent_delete();

drop trigger if exists require_retention_claim_for_workshop_enquiry_delete
  on public.workshop_enquiries;
create trigger require_retention_claim_for_workshop_enquiry_delete
before delete on public.workshop_enquiries
for each row execute function public.require_privacy_retention_claim_for_parent_delete();

drop trigger if exists require_retention_claim_for_event_photo_request_delete
  on public.event_photo_requests;
create trigger require_retention_claim_for_event_photo_request_delete
before delete on public.event_photo_requests
for each row execute function public.require_privacy_retention_claim_for_parent_delete();

drop trigger if exists require_retention_claim_for_order_delete on public.orders;
create trigger require_retention_claim_for_order_delete
before delete on public.orders
for each row execute function public.require_privacy_retention_claim_for_parent_delete();

create or replace function public.prevent_held_retention_record_mutation()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  old_json jsonb := to_jsonb(old);
  new_json jsonb := case when tg_op = 'UPDATE' then to_jsonb(new) else '{}'::jsonb end;
  evidence_held boolean :=
    coalesce((old_json->>'legal_hold')::boolean, false)
    or coalesce((new_json->>'legal_hold')::boolean, false);
  old_linked_order_id uuid := nullif(old_json->>'converted_order_id', '')::uuid;
  new_linked_order_id uuid := nullif(new_json->>'converted_order_id', '')::uuid;
  hold_mutation_key text := nullif(
    current_setting('app.privacy_retention_hold_mutation', true),
    ''
  );
  record_id text := coalesce(new_json->>'id', old_json->>'id');
  enquiry_type text := case tg_table_name
    when 'contact_enquiries' then 'contact'
    when 'custom_cake_enquiries' then 'custom-cake'
    when 'workshop_enquiries' then 'workshop'
    when 'event_photo_requests' then 'event-photo'
    else null
  end;
  controlled_hold_change boolean := false;
  safe_health_redaction boolean := false;
begin
  controlled_hold_change := tg_op = 'UPDATE'
    and (
      (
        tg_table_name = 'orders'
        and hold_mutation_key in (
          'hold:order:' || record_id,
          'hold:order-upload:' || record_id,
          'hold:health:order:' || record_id
        )
      )
      or (
        enquiry_type is not null
        and hold_mutation_key in (
          'hold:enquiry:' || enquiry_type || ':' || record_id,
          'hold:enquiry-upload:' || enquiry_type || ':' || record_id,
          'hold:health:enquiry:' || enquiry_type || ':' || record_id
        )
      )
    )
    and (
      new_json - array[
        'legal_hold',
        'legal_hold_reason',
        'legal_hold_review_at',
        'updated_at'
      ]
    ) = (
      old_json - array[
        'legal_hold',
        'legal_hold_reason',
        'legal_hold_review_at',
        'updated_at'
      ]
    );

  if tg_table_name <> 'orders' and (
    old_linked_order_id is not null or new_linked_order_id is not null
  ) then
    evidence_held := evidence_held or exists (
      select 1
      from public.orders as orders
      where orders.id in (old_linked_order_id, new_linked_order_id)
        and orders.legal_hold = true
    );
  end if;

  if not evidence_held then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  if controlled_hold_change then
    return new;
  end if;

  if tg_op = 'UPDATE' and tg_table_name = 'orders' then
    safe_health_redaction :=
      (new_json - array[
        'metadata',
        'dietary_health_retention_due_at',
        'dietary_health_erased_at',
        'updated_at'
      ]) = (
        old_json - array[
          'metadata',
          'dietary_health_retention_due_at',
          'dietary_health_erased_at',
          'updated_at'
        ]
      )
      and (
        coalesce(new.metadata, '{}'::jsonb) - array[
          'dietaryHealthInformation',
          'dietaryHealthConsent',
          'dietaryHealthWithdrawnAt'
        ]
      ) = (
        coalesce(old.metadata, '{}'::jsonb) - array[
          'dietaryHealthInformation',
          'dietaryHealthConsent',
          'dietaryHealthWithdrawnAt'
        ]
      )
      and not (coalesce(new.metadata, '{}'::jsonb) ? 'dietaryHealthInformation')
      and coalesce(new.metadata->>'dietaryHealthConsent', 'false') = 'false'
      and nullif(btrim(new.metadata->>'dietaryHealthWithdrawnAt'), '') is not null
      and nullif(new_json->>'dietary_health_retention_due_at', '') is null
      and new_json->>'dietary_health_erased_at' is not distinct from
        old_json->>'dietary_health_erased_at';
  elsif tg_op = 'UPDATE' and tg_table_name in (
    'contact_enquiries',
    'custom_cake_enquiries',
    'workshop_enquiries'
  ) then
    safe_health_redaction :=
      (new_json - array[
        'dietary_health_information',
        'dietary_health_consent',
        'dietary_health_withdrawn_at',
        'dietary_health_retention_due_at',
        'dietary_health_erased_at',
        'updated_at'
      ]) = (
        old_json - array[
          'dietary_health_information',
          'dietary_health_consent',
          'dietary_health_withdrawn_at',
          'dietary_health_retention_due_at',
          'dietary_health_erased_at',
          'updated_at'
        ]
      )
      and nullif(btrim(new_json->>'dietary_health_information'), '') is null
      and coalesce((new_json->>'dietary_health_consent')::boolean, false) = false
      and nullif(btrim(new_json->>'dietary_health_withdrawn_at'), '') is not null
      and nullif(new_json->>'dietary_health_retention_due_at', '') is null
      and new_json->>'dietary_health_erased_at' is not distinct from
        old_json->>'dietary_health_erased_at';
  end if;

  if safe_health_redaction then
    return new;
  end if;

  raise exception using
    errcode = '23514',
    message = 'A legal hold protects this retained record from mutation';
end;
$$;

create or replace function public.prevent_held_order_child_mutation()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  old_json jsonb := case when tg_op = 'INSERT' then '{}'::jsonb else to_jsonb(old) end;
  new_json jsonb := case when tg_op = 'DELETE' then '{}'::jsonb else to_jsonb(new) end;
  order_ids uuid[] := '{}';
begin
  if tg_op = 'INSERT' then
    return new;
  end if;

  if tg_table_name in ('order_items', 'order_messages', 'order_notes') then
    order_ids := array[
      nullif(old_json->>'order_id', '')::uuid,
      nullif(new_json->>'order_id', '')::uuid
    ];
  elsif tg_table_name = 'order_message_attachments' then
    select coalesce(array_agg(distinct message.order_id), '{}'::uuid[])
    into order_ids
    from public.order_messages as message
    where message.id::text in (
      old_json->>'message_id',
      new_json->>'message_id'
    );
  elsif tg_table_name = 'order_note_images' then
    select coalesce(array_agg(distinct note.order_id), '{}'::uuid[])
    into order_ids
    from public.order_notes as note
    where note.id::text in (
      old_json->>'note_id',
      new_json->>'note_id'
    );
  end if;

  if exists (
    select 1
    from public.orders as orders
    where orders.id = any(order_ids)
      and orders.legal_hold = true
  ) then
    raise exception using
      errcode = '23514',
      message = 'A legal hold protects this order evidence from mutation';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create or replace function public.protect_privacy_retention_security_evidence()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  record_type text := case tg_table_name
    when 'enquiry_rate_limits' then 'enquiry-rate-limits'
    when 'admin_login_attempts' then 'admin-login-attempts'
    when 'event_photo_rate_limit_attempts' then 'event-photo-rate-limits'
    else null
  end;
  candidate_id text;
  session_claim_token text := nullif(
    current_setting('app.privacy_retention_claim_token', true),
    ''
  );
  claim_exists boolean := false;
  claim_authorized boolean := false;
  legal_hold_active boolean := false;
  safe_login_clear boolean := false;
begin
  if record_type is null then
    raise exception 'Unsupported security-evidence trigger target';
  end if;

  -- A hold preserves evidence that already exists; it must not prevent the
  -- application from appending a new abuse-prevention event. New rows use
  -- current server/window timestamps and therefore cannot enter the claimed
  -- historical cutoff.
  if tg_op = 'INSERT' then
    return new;
  end if;
  candidate_id := 'security:' || record_type;

  if not pg_try_advisory_xact_lock(
    hashtextextended('privacy-retention-candidate:' || candidate_id, 0)
  ) then
    raise exception using
      errcode = '55P03',
      message = 'A privacy-retention operation is claiming this security batch';
  end if;

  select
    count(*) > 0,
    coalesce(bool_or(
      claim.claim_token::text = session_claim_token
      and claim.state in ('claimed', 'external-delete')
    ), false)
  into claim_exists, claim_authorized
  from public.privacy_retention_deletion_claims as claim
  where claim.candidate_id = candidate_id
    and claim.state <> 'finalized';

  select exists (
    select 1
    from public.privacy_retention_security_holds as hold
    where hold.record_type = record_type
  ) into legal_hold_active;

  -- A successful login may only append a server-time cleared marker. It must
  -- not erase or rewrite the failed-attempt evidence protected by a hold.
  if tg_op = 'UPDATE' and tg_table_name = 'admin_login_attempts' then
    safe_login_clear :=
      (to_jsonb(new) - 'cleared_at') = (to_jsonb(old) - 'cleared_at')
      and old.cleared_at is null
      and new.cleared_at is not null
      and new.cleared_at >= old.failed_at
      and new.cleared_at between
        clock_timestamp() - interval '5 minutes'
        and clock_timestamp() + interval '5 minutes';
  end if;

  if claim_exists and not claim_authorized then
    raise exception using
      errcode = '55P03',
      message = 'A privacy-retention deletion claim protects this security evidence';
  end if;

  if tg_op = 'DELETE' and not claim_authorized then
    raise exception using
      errcode = '42501',
      message = 'Security evidence deletion requires a matching retention claim';
  end if;

  if legal_hold_active and not safe_login_clear then
    raise exception using
      errcode = '23514',
      message = 'A legal hold protects this security evidence from mutation';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_held_contact_enquiry_mutation
  on public.contact_enquiries;
create trigger prevent_held_contact_enquiry_mutation
before update or delete on public.contact_enquiries
for each row execute function public.prevent_held_retention_record_mutation();

drop trigger if exists prevent_held_custom_cake_enquiry_mutation
  on public.custom_cake_enquiries;
create trigger prevent_held_custom_cake_enquiry_mutation
before update or delete on public.custom_cake_enquiries
for each row execute function public.prevent_held_retention_record_mutation();

drop trigger if exists prevent_held_workshop_enquiry_mutation
  on public.workshop_enquiries;
create trigger prevent_held_workshop_enquiry_mutation
before update or delete on public.workshop_enquiries
for each row execute function public.prevent_held_retention_record_mutation();

drop trigger if exists prevent_held_event_photo_request_mutation
  on public.event_photo_requests;
create trigger prevent_held_event_photo_request_mutation
before update or delete on public.event_photo_requests
for each row execute function public.prevent_held_retention_record_mutation();

drop trigger if exists prevent_held_order_mutation on public.orders;
create trigger prevent_held_order_mutation
before update or delete on public.orders
for each row execute function public.prevent_held_retention_record_mutation();

drop trigger if exists prevent_held_order_item_mutation on public.order_items;
create trigger prevent_held_order_item_mutation
before update or delete on public.order_items
for each row execute function public.prevent_held_order_child_mutation();

drop trigger if exists prevent_held_order_message_mutation on public.order_messages;
create trigger prevent_held_order_message_mutation
before update or delete on public.order_messages
for each row execute function public.prevent_held_order_child_mutation();

drop trigger if exists prevent_held_order_attachment_mutation
  on public.order_message_attachments;
create trigger prevent_held_order_attachment_mutation
before update or delete on public.order_message_attachments
for each row execute function public.prevent_held_order_child_mutation();

drop trigger if exists prevent_held_order_note_mutation on public.order_notes;
create trigger prevent_held_order_note_mutation
before update or delete on public.order_notes
for each row execute function public.prevent_held_order_child_mutation();

drop trigger if exists prevent_held_order_note_image_mutation
  on public.order_note_images;
create trigger prevent_held_order_note_image_mutation
before update or delete on public.order_note_images
for each row execute function public.prevent_held_order_child_mutation();

drop trigger if exists protect_enquiry_rate_limit_evidence
  on public.enquiry_rate_limits;
create trigger protect_enquiry_rate_limit_evidence
before insert or update or delete on public.enquiry_rate_limits
for each row execute function public.protect_privacy_retention_security_evidence();

drop trigger if exists protect_admin_login_attempt_evidence
  on public.admin_login_attempts;
create trigger protect_admin_login_attempt_evidence
before insert or update or delete on public.admin_login_attempts
for each row execute function public.protect_privacy_retention_security_evidence();

drop trigger if exists protect_event_photo_rate_limit_evidence
  on public.event_photo_rate_limit_attempts;
create trigger protect_event_photo_rate_limit_evidence
before insert or update or delete on public.event_photo_rate_limit_attempts
for each row execute function public.protect_privacy_retention_security_evidence();

create or replace function public.redact_order_uploaded_files(
  p_order_id uuid
)
returns table (
  status text,
  affected_count bigint
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  deleted_message_attachments bigint := 0;
  deleted_note_images bigint := 0;
  redacted_legacy_attachments bigint := 0;
  redacted_legacy_images bigint := 0;
  total_affected bigint := 0;
  selected_order_held boolean := false;
  selected_order_status text;
  session_claim_token text := nullif(
    current_setting('app.privacy_retention_claim_token', true),
    ''
  );
begin
  if not exists (
    select 1
    from public.privacy_retention_deletion_claims as claim
    where claim.candidate_id = 'order-upload:' || p_order_id::text
      and claim.claim_token::text = session_claim_token
      and claim.state in ('claimed', 'external-delete')
  ) then
    raise exception using
      errcode = '42501',
      message = 'A matching deletion claim is required for order upload redaction';
  end if;

  select orders.legal_hold, orders.status::text
  into selected_order_held, selected_order_status
  from public.orders as orders
  where orders.id = p_order_id
  for update;

  if not found then
    return query select 'not-found'::text, 0::bigint;
    return;
  end if;

  if selected_order_status not in ('completed', 'delivered', 'cancelled') then
    return query select 'not-terminal'::text, 0::bigint;
    return;
  end if;

  if selected_order_held = true or exists (
    select 1
    from public.contact_enquiries
    where converted_order_id = p_order_id
      and lifecycle_status = 'converted'
      and legal_hold = true
    union all
    select 1
    from public.custom_cake_enquiries
    where converted_order_id = p_order_id
      and lifecycle_status = 'converted'
      and legal_hold = true
    union all
    select 1
    from public.workshop_enquiries
    where converted_order_id = p_order_id
      and lifecycle_status = 'converted'
      and legal_hold = true
  ) then
    raise exception using
      errcode = '23514',
      message = 'A legal hold prevents upload redaction for this order bundle';
  end if;

  select count(*)::bigint
  into redacted_legacy_attachments
  from public.order_messages as message
  cross join lateral jsonb_array_elements(
    case
      when jsonb_typeof(message.legacy_message->'attachments') = 'array'
        then message.legacy_message->'attachments'
      else '[]'::jsonb
    end
  ) with ordinality as legacy_attachment(value, position)
  left join public.order_message_attachments as relational_attachment
    on relational_attachment.message_id = message.id
    and relational_attachment.line_number = legacy_attachment.position
  where message.order_id = p_order_id
    and jsonb_typeof(message.legacy_message->'attachments') = 'array'
    and case
      when relational_attachment.id is null then
        coalesce(
          legacy_attachment.value #>> '{asset,_type}',
          ''
        ) = 'supabase-file'
      when relational_attachment.asset_type = 'supabase-file' then true
      when relational_attachment.asset_type is null then
        coalesce(
          relational_attachment.legacy_attachment #>> '{asset,_type}',
          legacy_attachment.value #>> '{asset,_type}',
          ''
        ) = 'supabase-file'
      else false
    end;

  update public.order_messages as message
  set legacy_message = jsonb_set(
    message.legacy_message,
    '{attachments}',
    (
      select coalesce(
        jsonb_agg(legacy_attachment.value order by legacy_attachment.position),
        '[]'::jsonb
      )
      from jsonb_array_elements(
        case
          when jsonb_typeof(message.legacy_message->'attachments') = 'array'
            then message.legacy_message->'attachments'
          else '[]'::jsonb
        end
      ) with ordinality as legacy_attachment(value, position)
      left join public.order_message_attachments as relational_attachment
        on relational_attachment.message_id = message.id
        and relational_attachment.line_number = legacy_attachment.position
      where not case
        when relational_attachment.id is null then
          coalesce(
            legacy_attachment.value #>> '{asset,_type}',
            ''
          ) = 'supabase-file'
        when relational_attachment.asset_type = 'supabase-file' then true
        when relational_attachment.asset_type is null then
          coalesce(
            relational_attachment.legacy_attachment #>> '{asset,_type}',
            legacy_attachment.value #>> '{asset,_type}',
            ''
          ) = 'supabase-file'
        else false
      end
    ),
    false
  )
  where message.order_id = p_order_id
    and jsonb_typeof(message.legacy_message->'attachments') = 'array'
    and exists (
      select 1
      from jsonb_array_elements(
        case
          when jsonb_typeof(message.legacy_message->'attachments') = 'array'
            then message.legacy_message->'attachments'
          else '[]'::jsonb
        end
      ) with ordinality as legacy_attachment(value, position)
      left join public.order_message_attachments as relational_attachment
        on relational_attachment.message_id = message.id
        and relational_attachment.line_number = legacy_attachment.position
      where case
        when relational_attachment.id is null then
          coalesce(
            legacy_attachment.value #>> '{asset,_type}',
            ''
          ) = 'supabase-file'
        when relational_attachment.asset_type = 'supabase-file' then true
        when relational_attachment.asset_type is null then
          coalesce(
            relational_attachment.legacy_attachment #>> '{asset,_type}',
            legacy_attachment.value #>> '{asset,_type}',
            ''
          ) = 'supabase-file'
        else false
      end
    );

  select count(*)::bigint
  into redacted_legacy_images
  from public.order_notes as note
  cross join lateral jsonb_array_elements(
    case
      when jsonb_typeof(note.legacy_note->'images') = 'array'
        then note.legacy_note->'images'
      else '[]'::jsonb
    end
  ) with ordinality as legacy_image(value, position)
  left join public.order_note_images as relational_image
    on relational_image.note_id = note.id
    and relational_image.line_number = legacy_image.position
  where note.order_id = p_order_id
    and jsonb_typeof(note.legacy_note->'images') = 'array'
    and case
      when relational_image.id is null then
        coalesce(
          legacy_image.value #>> '{asset,_type}',
          ''
        ) = 'supabase-file'
      when relational_image.asset_type = 'supabase-file' then true
      when relational_image.asset_type is null then
        coalesce(
          relational_image.legacy_image #>> '{asset,_type}',
          legacy_image.value #>> '{asset,_type}',
          ''
        ) = 'supabase-file'
      else false
    end;

  update public.order_notes as note
  set legacy_note = jsonb_set(
    note.legacy_note,
    '{images}',
    (
      select coalesce(
        jsonb_agg(legacy_image.value order by legacy_image.position),
        '[]'::jsonb
      )
      from jsonb_array_elements(
        case
          when jsonb_typeof(note.legacy_note->'images') = 'array'
            then note.legacy_note->'images'
          else '[]'::jsonb
        end
      ) with ordinality as legacy_image(value, position)
      left join public.order_note_images as relational_image
        on relational_image.note_id = note.id
        and relational_image.line_number = legacy_image.position
      where not case
        when relational_image.id is null then
          coalesce(
            legacy_image.value #>> '{asset,_type}',
            ''
          ) = 'supabase-file'
        when relational_image.asset_type = 'supabase-file' then true
        when relational_image.asset_type is null then
          coalesce(
            relational_image.legacy_image #>> '{asset,_type}',
            legacy_image.value #>> '{asset,_type}',
            ''
          ) = 'supabase-file'
        else false
      end
    ),
    false
  )
  where note.order_id = p_order_id
    and jsonb_typeof(note.legacy_note->'images') = 'array'
    and exists (
      select 1
      from jsonb_array_elements(
        case
          when jsonb_typeof(note.legacy_note->'images') = 'array'
            then note.legacy_note->'images'
          else '[]'::jsonb
        end
      ) with ordinality as legacy_image(value, position)
      left join public.order_note_images as relational_image
        on relational_image.note_id = note.id
        and relational_image.line_number = legacy_image.position
      where case
        when relational_image.id is null then
          coalesce(
            legacy_image.value #>> '{asset,_type}',
            ''
          ) = 'supabase-file'
        when relational_image.asset_type = 'supabase-file' then true
        when relational_image.asset_type is null then
          coalesce(
            relational_image.legacy_image #>> '{asset,_type}',
            legacy_image.value #>> '{asset,_type}',
            ''
          ) = 'supabase-file'
        else false
      end
    );

  delete from public.order_message_attachments as attachment
  using public.order_messages as message
  where attachment.message_id = message.id
    and message.order_id = p_order_id
    and (
      attachment.asset_type = 'supabase-file'
      or (
        attachment.asset_type is null
        and attachment.legacy_attachment #>> '{asset,_type}' = 'supabase-file'
      )
    );

  get diagnostics deleted_message_attachments = row_count;

  delete from public.order_note_images as image
  using public.order_notes as note
  where image.note_id = note.id
    and note.order_id = p_order_id
    and (
      image.asset_type = 'supabase-file'
      or (
        image.asset_type is null
        and image.legacy_image #>> '{asset,_type}' = 'supabase-file'
      )
    );

  get diagnostics deleted_note_images = row_count;

  total_affected :=
    deleted_message_attachments
    + deleted_note_images
    + redacted_legacy_attachments
    + redacted_legacy_images;

  return query
  select
    case
      when total_affected = 0 then 'no-upload-references'
      else 'redacted'
    end,
    total_affected;
end;
$$;

create or replace function public.delete_expired_privacy_security_records(
  p_record_type text,
  p_cutoff timestamptz
)
returns table (
  deleted_count bigint
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  affected_count bigint := 0;
  session_claim_token text := nullif(
    current_setting('app.privacy_retention_claim_token', true),
    ''
  );
begin
  if p_cutoff is null or p_cutoff > clock_timestamp() then
    raise exception 'A current or past cutoff is required';
  end if;

  if exists (
    select 1
    from public.privacy_retention_security_holds as hold
    where hold.record_type = p_record_type
  ) then
    raise exception using
      errcode = '23514',
      message = 'A legal hold prevents deletion of these security records';
  end if;

  if not exists (
    select 1
    from public.privacy_retention_deletion_claims as claim
    where claim.candidate_id = 'security:' || p_record_type
      and claim.claim_token::text = session_claim_token
      and claim.state in ('claimed', 'external-delete')
  ) then
    raise exception using
      errcode = '42501',
      message = 'A matching deletion claim is required for security-record deletion';
  end if;

  case p_record_type
    when 'enquiry-rate-limits' then
      delete from public.enquiry_rate_limits
      where updated_at < p_cutoff;
    when 'admin-login-attempts' then
      delete from public.admin_login_attempts
      where failed_at < p_cutoff;
    when 'event-photo-rate-limits' then
      delete from public.event_photo_rate_limit_attempts
      where attempted_at < p_cutoff;
    else
      raise exception 'Unsupported privacy security record type';
  end case;

  get diagnostics affected_count = row_count;
  return query select affected_count;
end;
$$;

create or replace function public.claim_privacy_retention_candidate(
  p_candidate_id text,
  p_run_id uuid,
  p_now timestamptz
)
returns table (
  status text,
  claim_token uuid,
  irreversible_started boolean,
  cutoff_at timestamptz,
  terminal_outcome text,
  affected_count bigint,
  finalized_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  candidate_parts text[] := string_to_array(p_candidate_id, ':');
  candidate_kind text := candidate_parts[1];
  enquiry_type text;
  record_id text;
  target_order_id uuid;
  linked_order_id uuid;
  lifecycle_status text;
  retention_due_at timestamptz;
  upload_due_at timestamptz;
  completed_at timestamptz;
  order_status text;
  legal_hold boolean := false;
  linked_order_hold boolean := false;
  has_upload boolean := false;
  has_health_information boolean := false;
  health_consent boolean := false;
  health_erased_at timestamptz;
  health_withdrawn_at timestamptz;
  candidate_category text;
  new_claim_token uuid := gen_random_uuid();
  current_state text;
  current_lease timestamptz;
  current_claim_token uuid;
  current_run_id uuid;
  current_action_id uuid;
  current_cutoff_at timestamptz;
  current_terminal_outcome text;
  current_affected_count bigint;
  current_finalized_at timestamptz;
  previous_irreversible boolean := false;
  record_found boolean := false;
  selected_action_id uuid;
  selected_action_outcome text;
  selected_action_selected boolean;
  selected_run_status text;
  selected_run_mode text;
  selected_row_count bigint := 0;
  claim_cutoff timestamptz := least(p_now, clock_timestamp());
begin
  if p_candidate_id is null
    or char_length(p_candidate_id) not between 1 and 160
    or p_run_id is null
    or p_now is null
    or p_now > clock_timestamp() + interval '5 minutes'
  then
    raise exception 'Invalid privacy-retention claim request';
  end if;

  select
    action.id,
    action.outcome,
    action.selected,
    run.status,
    run.run_mode
  into
    selected_action_id,
    selected_action_outcome,
    selected_action_selected,
    selected_run_status,
    selected_run_mode
  from public.privacy_retention_actions as action
  join public.privacy_retention_runs as run on run.id = action.run_id
  where action.run_id = p_run_id
    and action.candidate_id = p_candidate_id
  for update of action, run;

  if not found then
    raise exception 'RETENTION_ACTION_NOT_FOUND';
  end if;

  if selected_action_outcome <> 'pending' then
    select
      claim.terminal_outcome,
      claim.affected_count,
      claim.finalized_at
    into
      current_terminal_outcome,
      current_affected_count,
      current_finalized_at
    from public.privacy_retention_deletion_claims as claim
    where claim.candidate_id = p_candidate_id
      and claim.run_id = p_run_id
      and claim.action_id = selected_action_id
      and claim.state = 'finalized';

    if found and selected_action_outcome = current_terminal_outcome then
      return query select
        'completed'::text,
        null::uuid,
        true,
        null::timestamptz,
        current_terminal_outcome,
        current_affected_count,
        current_finalized_at;
      return;
    end if;

    raise exception 'RETENTION_ACTION_ALREADY_TERMINAL';
  end if;

  if not selected_action_selected
    or selected_run_mode <> 'manual'
    or selected_run_status <> 'running'
  then
    raise exception 'RETENTION_ACTION_NOT_EXECUTABLE';
  end if;

  if candidate_kind in ('enquiry', 'enquiry-upload')
    and array_length(candidate_parts, 1) = 3
  then
    -- Full-record and upload candidates are sibling views of the same row.
    -- Always lock them in one canonical order so sibling claims cannot race.
    perform pg_advisory_xact_lock(
      hashtextextended(
        'privacy-retention-candidate:enquiry:' ||
          candidate_parts[2] || ':' || candidate_parts[3],
        0
      )
    );
    perform pg_advisory_xact_lock(
      hashtextextended(
        'privacy-retention-candidate:enquiry-upload:' ||
          candidate_parts[2] || ':' || candidate_parts[3],
        0
      )
    );
  else
    perform pg_advisory_xact_lock(
      hashtextextended('privacy-retention-candidate:' || p_candidate_id, 0)
    );
  end if;

  select
    claim.state,
    claim.lease_expires_at,
    claim.irreversible_started,
    claim.claim_token,
    claim.run_id,
    claim.action_id,
    claim.cutoff_at,
    claim.terminal_outcome,
    claim.affected_count,
    claim.finalized_at
  into
    current_state,
    current_lease,
    previous_irreversible,
    current_claim_token,
    current_run_id,
    current_action_id,
    current_cutoff_at,
    current_terminal_outcome,
    current_affected_count,
    current_finalized_at
  from public.privacy_retention_deletion_claims as claim
  where claim.candidate_id = p_candidate_id
  for update;

  previous_irreversible := coalesce(previous_irreversible, false);

  if found then
    if current_state = 'finalized'
      and current_run_id = p_run_id
      and current_action_id = selected_action_id
    then
      return query select
        'completed'::text,
        null::uuid,
        previous_irreversible,
        current_cutoff_at,
        current_terminal_outcome,
        current_affected_count,
        current_finalized_at;
      return;
    end if;

    if current_state in ('claimed', 'external-delete')
      and current_lease > clock_timestamp()
    then
      if current_run_id = p_run_id and current_action_id = selected_action_id then
        return query select
          'claimed'::text,
          current_claim_token,
          previous_irreversible,
          current_cutoff_at,
          null::text,
          null::bigint,
          null::timestamptz;
      else
        return query select
          'busy'::text,
          null::uuid,
          previous_irreversible,
          null::timestamptz,
          null::text,
          null::bigint,
          null::timestamptz;
      end if;
      return;
    end if;

    -- An expired retryable lease may be reclaimed. Storage deletion is
    -- idempotent and the database pointers remain protected until the exact
    -- new token finalizes, so a prior partial provider deletion is safe to
    -- resume under the serialized candidate lock.
  end if;

  if candidate_kind = 'enquiry' and array_length(candidate_parts, 1) = 3 then
    enquiry_type := candidate_parts[2];
    record_id := candidate_parts[3];
    candidate_category := 'expired-enquiry';

    if enquiry_type = 'contact' and record_id ~ '^[0-9]{1,20}$' then
      select enquiry.lifecycle_status, enquiry.retention_due_at, enquiry.legal_hold
      into lifecycle_status, retention_due_at, legal_hold
      from public.contact_enquiries as enquiry
      where enquiry.id = record_id::bigint
      for update;
    elsif enquiry_type = 'custom-cake'
      and record_id ~ '^[0-9a-fA-F-]{36}$'
    then
      select enquiry.lifecycle_status, enquiry.retention_due_at, enquiry.legal_hold
      into lifecycle_status, retention_due_at, legal_hold
      from public.custom_cake_enquiries as enquiry
      where enquiry.id = record_id::uuid
      for update;
    elsif enquiry_type = 'workshop' and record_id ~ '^[0-9]{1,20}$' then
      select enquiry.lifecycle_status, enquiry.retention_due_at, enquiry.legal_hold
      into lifecycle_status, retention_due_at, legal_hold
      from public.workshop_enquiries as enquiry
      where enquiry.id = record_id::bigint
      for update;
    elsif enquiry_type = 'event-photo'
      and record_id ~ '^[0-9a-fA-F-]{36}$'
    then
      select enquiry.lifecycle_status, enquiry.retention_due_at, enquiry.legal_hold
      into lifecycle_status, retention_due_at, legal_hold
      from public.event_photo_requests as enquiry
      where enquiry.id = record_id::uuid
      for update;
    else
      raise exception 'Unsupported privacy-retention enquiry candidate';
    end if;

    record_found := found;
    if not record_found
      or lifecycle_status <> 'closed'
      or legal_hold
      or retention_due_at is null
      or retention_due_at > claim_cutoff
    then
      delete from public.privacy_retention_deletion_claims
      where candidate_id = p_candidate_id
        and state <> 'finalized';
      return query select 'skipped'::text, null::uuid, false,
        null::timestamptz, null::text, null::bigint, null::timestamptz;
      return;
    end if;

    if exists (
      select 1
      from public.privacy_retention_deletion_claims as claim
      where claim.candidate_id in (
          'enquiry-upload:' || enquiry_type || ':' || record_id,
          'health:enquiry:' || enquiry_type || ':' || record_id
        )
        and claim.state <> 'finalized'
    ) then
      return query select 'busy'::text, null::uuid, previous_irreversible,
        null::timestamptz, null::text, null::bigint, null::timestamptz;
      return;
    end if;
  elsif candidate_kind = 'enquiry-upload'
    and array_length(candidate_parts, 1) = 3
  then
    enquiry_type := candidate_parts[2];
    record_id := candidate_parts[3];
    candidate_category := 'expired-enquiry-upload';

    if enquiry_type = 'custom-cake'
      and record_id ~ '^[0-9a-fA-F-]{36}$'
    then
      select enquiry.converted_order_id
      into linked_order_id
      from public.custom_cake_enquiries as enquiry
      where enquiry.id = record_id::uuid;

      if linked_order_id is not null then
        perform pg_advisory_xact_lock(
          hashtextextended(
            'privacy-retention-order-bundle:' || linked_order_id::text,
            0
          )
        );
        select orders.legal_hold
        into linked_order_hold
        from public.orders as orders
        where orders.id = linked_order_id
        for update;
      end if;

      select
        enquiry.lifecycle_status,
        enquiry.retention_due_at,
        enquiry.upload_retention_due_at,
        enquiry.legal_hold,
        enquiry.converted_order_id,
        nullif(btrim(enquiry.reference_image_path), '') is not null
      into
        lifecycle_status,
        retention_due_at,
        upload_due_at,
        legal_hold,
        target_order_id,
        has_upload
      from public.custom_cake_enquiries as enquiry
      where enquiry.id = record_id::uuid
      for update;

      record_found := found;
      if target_order_id is distinct from linked_order_id then
        record_found := false;
      end if;
    elsif enquiry_type = 'event-photo'
      and record_id ~ '^[0-9a-fA-F-]{36}$'
    then
      select
        enquiry.lifecycle_status,
        enquiry.retention_due_at,
        enquiry.upload_retention_due_at,
        enquiry.legal_hold,
        coalesce(array_length(enquiry.temp_image_paths, 1), 0) > 0
      into
        lifecycle_status,
        retention_due_at,
        upload_due_at,
        legal_hold,
        has_upload
      from public.event_photo_requests as enquiry
      where enquiry.id = record_id::uuid
      for update;
      record_found := found;
    else
      raise exception 'Unsupported privacy-retention upload candidate';
    end if;

    if not record_found
      or legal_hold
      or linked_order_hold
      or not has_upload
      or upload_due_at is null
      or upload_due_at > claim_cutoff
      or (retention_due_at is not null and retention_due_at <= claim_cutoff)
    then
      delete from public.privacy_retention_deletion_claims
      where candidate_id = p_candidate_id
        and state <> 'finalized';
      return query select 'skipped'::text, null::uuid, false,
        null::timestamptz, null::text, null::bigint, null::timestamptz;
      return;
    end if;

    if exists (
      select 1
      from public.privacy_retention_deletion_claims as claim
      where claim.candidate_id in (
          'enquiry:' || enquiry_type || ':' || record_id,
          'health:enquiry:' || enquiry_type || ':' || record_id
        )
        and claim.state <> 'finalized'
        or (
          linked_order_id is not null
          and claim.state <> 'finalized'
          and claim.candidate_id in (
            'order:' || linked_order_id::text,
            'order-upload:' || linked_order_id::text
          )
        )
    ) then
      return query select 'busy'::text, null::uuid, previous_irreversible,
        null::timestamptz, null::text, null::bigint, null::timestamptz;
      return;
    end if;
  elsif candidate_kind in ('order', 'order-upload')
    and array_length(candidate_parts, 1) = 2
    and candidate_parts[2] ~ '^[0-9a-fA-F-]{36}$'
  then
    target_order_id := candidate_parts[2]::uuid;
    candidate_category := case
      when candidate_kind = 'order' then 'expired-order'
      else 'expired-order-upload'
    end;
    perform pg_advisory_xact_lock(
      hashtextextended('privacy-retention-order-bundle:' || target_order_id::text, 0)
    );

    select
      orders.completed_at,
      orders.retention_due_at,
      orders.legal_hold,
      orders.status::text
    into completed_at, retention_due_at, legal_hold, order_status
    from public.orders as orders
    where orders.id = target_order_id
    for update;
    record_found := found;

    perform 1 from public.contact_enquiries
    where converted_order_id = target_order_id and lifecycle_status = 'converted'
    for update;
    perform 1 from public.custom_cake_enquiries
    where converted_order_id = target_order_id and lifecycle_status = 'converted'
    for update;
    perform 1 from public.workshop_enquiries
    where converted_order_id = target_order_id and lifecycle_status = 'converted'
    for update;
    perform 1 from public.order_messages as message
    where message.order_id = target_order_id for update;
    perform 1 from public.order_notes as note
    where note.order_id = target_order_id for update;
    perform 1 from public.order_items as item
    where item.order_id = target_order_id for update;
    perform 1
    from public.order_message_attachments as attachment
    join public.order_messages as message on message.id = attachment.message_id
    where message.order_id = target_order_id
    for update of attachment;
    perform 1
    from public.order_note_images as image
    join public.order_notes as note on note.id = image.note_id
    where note.order_id = target_order_id
    for update of image;

    if not record_found
      or legal_hold
      or order_status not in ('completed', 'delivered', 'cancelled')
      or exists (
        select 1 from public.contact_enquiries
        where converted_order_id = target_order_id
          and lifecycle_status = 'converted'
          and legal_hold = true
        union all
        select 1 from public.custom_cake_enquiries
        where converted_order_id = target_order_id
          and lifecycle_status = 'converted'
          and legal_hold = true
        union all
        select 1 from public.workshop_enquiries
        where converted_order_id = target_order_id
          and lifecycle_status = 'converted'
          and legal_hold = true
      )
      or (
        candidate_kind = 'order'
        and (retention_due_at is null or retention_due_at > claim_cutoff)
      )
      or (
        candidate_kind = 'order-upload'
        and (
          completed_at is null
          or completed_at + interval '24 months' > claim_cutoff
          or (retention_due_at is not null and retention_due_at <= claim_cutoff)
        )
      )
    then
      delete from public.privacy_retention_deletion_claims
      where candidate_id = p_candidate_id
        and state <> 'finalized';
      return query select 'skipped'::text, null::uuid, false,
        null::timestamptz, null::text, null::bigint, null::timestamptz;
      return;
    end if;

    if exists (
      select 1
      from public.privacy_retention_deletion_claims as claim
      where claim.candidate_id <> p_candidate_id
        and claim.state <> 'finalized'
        and (
          claim.candidate_id in (
            'order:' || target_order_id::text,
            'order-upload:' || target_order_id::text
          )
          or (
            candidate_kind = 'order'
            and claim.candidate_id = 'health:order:' || target_order_id::text
          )
          or claim.candidate_id in (
            select 'enquiry-upload:custom-cake:' || enquiry.id::text
            from public.custom_cake_enquiries as enquiry
            where enquiry.converted_order_id = target_order_id
              and enquiry.lifecycle_status = 'converted'
          )
          or (
            candidate_kind = 'order'
            and claim.candidate_id in (
              select 'health:enquiry:contact:' || enquiry.id::text
              from public.contact_enquiries as enquiry
              where enquiry.converted_order_id = target_order_id
                and enquiry.lifecycle_status = 'converted'
              union all
              select 'health:enquiry:custom-cake:' || enquiry.id::text
              from public.custom_cake_enquiries as enquiry
              where enquiry.converted_order_id = target_order_id
                and enquiry.lifecycle_status = 'converted'
              union all
              select 'health:enquiry:workshop:' || enquiry.id::text
              from public.workshop_enquiries as enquiry
              where enquiry.converted_order_id = target_order_id
                and enquiry.lifecycle_status = 'converted'
            )
          )
        )
    ) then
      return query select 'busy'::text, null::uuid, previous_irreversible,
        null::timestamptz, null::text, null::bigint, null::timestamptz;
      return;
    end if;
  elsif candidate_kind = 'health'
    and candidate_parts[2] = 'enquiry'
    and array_length(candidate_parts, 1) = 4
  then
    enquiry_type := candidate_parts[3];
    record_id := candidate_parts[4];
    candidate_category := 'expired-health-information';
    perform pg_advisory_xact_lock(
      hashtextextended(
        'privacy-retention-candidate:enquiry:' || enquiry_type || ':' || record_id,
        0
      )
    );
    perform pg_advisory_xact_lock(
      hashtextextended(
        'privacy-retention-candidate:enquiry-upload:' || enquiry_type || ':' || record_id,
        0
      )
    );

    if enquiry_type = 'contact' and record_id ~ '^[0-9]{1,20}$' then
      -- These columns are added by the later health-retention migration. Keep
      -- this lifecycle migration independently installable on a fresh schema
      -- by planning the health-only query when the candidate is executed.
      execute $health$
        select
          nullif(btrim(enquiry.dietary_health_information), '') is not null,
          enquiry.dietary_health_consent,
          enquiry.dietary_health_retention_due_at,
          enquiry.dietary_health_erased_at,
          enquiry.dietary_health_withdrawn_at,
          enquiry.legal_hold,
          enquiry.converted_order_id
        from public.contact_enquiries as enquiry
        where enquiry.id = $1::bigint
        for update
      $health$
      into
        has_health_information,
        health_consent,
        retention_due_at,
        health_erased_at,
        health_withdrawn_at,
        legal_hold,
        linked_order_id
      using record_id;
      get diagnostics selected_row_count = row_count;
    elsif enquiry_type = 'custom-cake'
      and record_id ~ '^[0-9a-fA-F-]{36}$'
    then
      execute $health$
        select
          nullif(btrim(enquiry.dietary_health_information), '') is not null,
          enquiry.dietary_health_consent,
          enquiry.dietary_health_retention_due_at,
          enquiry.dietary_health_erased_at,
          enquiry.dietary_health_withdrawn_at,
          enquiry.legal_hold,
          enquiry.converted_order_id
        from public.custom_cake_enquiries as enquiry
        where enquiry.id = $1::uuid
        for update
      $health$
      into
        has_health_information,
        health_consent,
        retention_due_at,
        health_erased_at,
        health_withdrawn_at,
        legal_hold,
        linked_order_id
      using record_id;
      get diagnostics selected_row_count = row_count;
    elsif enquiry_type = 'workshop' and record_id ~ '^[0-9]{1,20}$' then
      execute $health$
        select
          nullif(btrim(enquiry.dietary_health_information), '') is not null,
          enquiry.dietary_health_consent,
          enquiry.dietary_health_retention_due_at,
          enquiry.dietary_health_erased_at,
          enquiry.dietary_health_withdrawn_at,
          enquiry.legal_hold,
          enquiry.converted_order_id
        from public.workshop_enquiries as enquiry
        where enquiry.id = $1::bigint
        for update
      $health$
      into
        has_health_information,
        health_consent,
        retention_due_at,
        health_erased_at,
        health_withdrawn_at,
        legal_hold,
        linked_order_id
      using record_id;
      get diagnostics selected_row_count = row_count;
    else
      raise exception 'Unsupported health-retention enquiry candidate';
    end if;
    record_found := selected_row_count = 1;

    if linked_order_id is not null then
      perform pg_advisory_xact_lock(
        hashtextextended(
          'privacy-retention-order-bundle:' || linked_order_id::text,
          0
        )
      );
      select orders.legal_hold into linked_order_hold
      from public.orders as orders
      where orders.id = linked_order_id
      for update;
    end if;

    if not record_found
      or legal_hold
      or linked_order_hold
      or not has_health_information
      or not health_consent
      or health_erased_at is not null
      or health_withdrawn_at is not null
      or retention_due_at is null
      or retention_due_at > claim_cutoff
    then
      delete from public.privacy_retention_deletion_claims
      where candidate_id = p_candidate_id
        and state <> 'finalized';
      return query select 'skipped'::text, null::uuid, false,
        null::timestamptz, null::text, null::bigint, null::timestamptz;
      return;
    end if;

    if exists (
      select 1 from public.privacy_retention_deletion_claims as claim
      where claim.state <> 'finalized'
        and claim.candidate_id in (
          'enquiry:' || enquiry_type || ':' || record_id,
          'enquiry-upload:' || enquiry_type || ':' || record_id,
          'order:' || coalesce(linked_order_id::text, ''),
          'order-upload:' || coalesce(linked_order_id::text, '')
        )
    ) then
      return query select 'busy'::text, null::uuid, previous_irreversible,
        null::timestamptz, null::text, null::bigint, null::timestamptz;
      return;
    end if;
  elsif candidate_kind = 'health'
    and candidate_parts[2] = 'order'
    and array_length(candidate_parts, 1) = 3
    and candidate_parts[3] ~ '^[0-9a-fA-F-]{36}$'
  then
    target_order_id := candidate_parts[3]::uuid;
    candidate_category := 'expired-health-information';
    perform pg_advisory_xact_lock(
      hashtextextended('privacy-retention-order-bundle:' || target_order_id::text, 0)
    );
    execute $health$
      select
        nullif(btrim(orders.metadata->>'dietaryHealthInformation'), '') is not null,
        orders.metadata->'dietaryHealthConsent' = 'true'::jsonb,
        orders.dietary_health_retention_due_at,
        orders.dietary_health_erased_at,
        nullif(btrim(orders.metadata->>'dietaryHealthWithdrawnAt'), '')::timestamptz,
        orders.legal_hold
      from public.orders as orders
      where orders.id = $1
      for update
    $health$
    into
      has_health_information,
      health_consent,
      retention_due_at,
      health_erased_at,
      health_withdrawn_at,
      legal_hold
    using target_order_id;
    get diagnostics selected_row_count = row_count;
    record_found := selected_row_count = 1;

    if not record_found
      or legal_hold
      or exists (
        select 1 from public.contact_enquiries
        where converted_order_id = target_order_id and legal_hold = true
        union all
        select 1 from public.custom_cake_enquiries
        where converted_order_id = target_order_id and legal_hold = true
        union all
        select 1 from public.workshop_enquiries
        where converted_order_id = target_order_id and legal_hold = true
      )
      or not has_health_information
      or not health_consent
      or health_erased_at is not null
      or health_withdrawn_at is not null
      or retention_due_at is null
      or retention_due_at > claim_cutoff
    then
      delete from public.privacy_retention_deletion_claims
      where candidate_id = p_candidate_id
        and state <> 'finalized';
      return query select 'skipped'::text, null::uuid, false,
        null::timestamptz, null::text, null::bigint, null::timestamptz;
      return;
    end if;

    if exists (
      select 1 from public.privacy_retention_deletion_claims as claim
      where claim.state <> 'finalized'
        and claim.candidate_id in (
          'order:' || target_order_id::text,
          'order-upload:' || target_order_id::text
        )
    ) then
      return query select 'busy'::text, null::uuid, previous_irreversible,
        null::timestamptz, null::text, null::bigint, null::timestamptz;
      return;
    end if;
  elsif candidate_kind = 'security'
    and array_length(candidate_parts, 1) = 2
    and candidate_parts[2] in (
      'enquiry-rate-limits',
      'admin-login-attempts',
      'event-photo-rate-limits'
    )
  then
    record_id := candidate_parts[2];
    candidate_category := 'expired-security-record';

    if exists (
      select 1 from public.privacy_retention_security_holds
      where record_type = record_id
    ) then
      delete from public.privacy_retention_deletion_claims
      where candidate_id = p_candidate_id
        and state <> 'finalized';
      return query select 'skipped'::text, null::uuid, false,
        null::timestamptz, null::text, null::bigint, null::timestamptz;
      return;
    end if;

    if record_id = 'enquiry-rate-limits' then
      select exists (
        select 1 from public.enquiry_rate_limits
        where updated_at < claim_cutoff - interval '90 days'
      ) into record_found;
    elsif record_id = 'admin-login-attempts' then
      select exists (
        select 1 from public.admin_login_attempts
        where failed_at < claim_cutoff - interval '90 days'
      ) into record_found;
    else
      select exists (
        select 1 from public.event_photo_rate_limit_attempts
        where attempted_at < claim_cutoff - interval '90 days'
      ) into record_found;
    end if;

    if not record_found then
      delete from public.privacy_retention_deletion_claims
      where candidate_id = p_candidate_id
        and state <> 'finalized';
      return query select 'skipped'::text, null::uuid, false,
        null::timestamptz, null::text, null::bigint, null::timestamptz;
      return;
    end if;
  else
    raise exception 'Unsupported privacy-retention candidate';
  end if;

  insert into public.privacy_retention_deletion_claims (
    candidate_id,
    category,
    run_id,
    action_id,
    state,
    claim_token,
    irreversible_started,
    lease_expires_at,
    cutoff_at,
    last_error_code,
    terminal_outcome,
    affected_count,
    finalized_at,
    claimed_at,
    updated_at
  ) values (
    p_candidate_id,
    candidate_category,
    p_run_id,
    selected_action_id,
    'claimed',
    new_claim_token,
    previous_irreversible,
    clock_timestamp() + interval '15 minutes',
    claim_cutoff,
    null,
    null,
    null,
    null,
    clock_timestamp(),
    clock_timestamp()
  )
  on conflict (candidate_id) do update
  set
    category = excluded.category,
    run_id = excluded.run_id,
    action_id = excluded.action_id,
    state = 'claimed',
    claim_token = excluded.claim_token,
    irreversible_started =
      public.privacy_retention_deletion_claims.irreversible_started,
    lease_expires_at = excluded.lease_expires_at,
    cutoff_at = excluded.cutoff_at,
    last_error_code = null,
    terminal_outcome = null,
    affected_count = null,
    finalized_at = null,
    claimed_at = excluded.claimed_at,
    updated_at = excluded.updated_at;

  return query select
    'claimed'::text,
    new_claim_token,
    previous_irreversible,
    claim_cutoff,
    null::text,
    null::bigint,
    null::timestamptz;
end;
$$;

create or replace function public.claim_event_photo_temp_cleanup(
  p_request_id uuid,
  p_cutoff timestamptz
)
returns table (
  status text,
  claim_token uuid,
  temp_image_bucket text,
  temp_image_paths text[]
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_candidate_id text := 'enquiry-upload:event-photo:' || p_request_id::text;
  new_claim_token uuid := gen_random_uuid();
  current_state text;
  current_lease timestamptz;
  previous_irreversible boolean := false;
  selected_created_at timestamptz;
  selected_legal_hold boolean;
  selected_files_deleted_at timestamptz;
  selected_bucket text;
  selected_paths text[];
begin
  if p_cutoff is null or p_cutoff > clock_timestamp() then
    raise exception 'A current or past event-photo cleanup cutoff is required';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(
      'privacy-retention-candidate:enquiry:event-photo:' || p_request_id::text,
      0
    )
  );
  perform pg_advisory_xact_lock(
    hashtextextended('privacy-retention-candidate:' || target_candidate_id, 0)
  );

  select claim.state, claim.lease_expires_at, claim.irreversible_started
  into current_state, current_lease, previous_irreversible
  from public.privacy_retention_deletion_claims as claim
  where claim.candidate_id = target_candidate_id
  for update;

  previous_irreversible := coalesce(previous_irreversible, false);

  if found
    and current_state in ('claimed', 'external-delete')
    and current_lease > clock_timestamp()
  then
    return query select
      'busy'::text,
      null::uuid,
      null::text,
      '{}'::text[];
    return;
  end if;

  if exists (
    select 1
    from public.privacy_retention_deletion_claims as sibling_claim
    where sibling_claim.candidate_id =
      'enquiry:event-photo:' || p_request_id::text
      and sibling_claim.state <> 'finalized'
  ) then
    return query select
      'busy'::text,
      null::uuid,
      null::text,
      '{}'::text[];
    return;
  end if;

  select
    request.created_at,
    request.legal_hold,
    request.files_deleted_at,
    request.temp_image_bucket,
    request.temp_image_paths
  into
    selected_created_at,
    selected_legal_hold,
    selected_files_deleted_at,
    selected_bucket,
    selected_paths
  from public.event_photo_requests as request
  where request.id = p_request_id
  for update;

  if not found
    or selected_created_at >= p_cutoff
    or selected_legal_hold
    or selected_files_deleted_at is not null
    or selected_bucket <> 'event-photo-temp-uploads'
    or coalesce(array_length(selected_paths, 1), 0) = 0
    or exists (
      select 1
      from unnest(coalesce(selected_paths, '{}'::text[])) as path
      where path !~ '^incoming/[^/].*$'
        or path like '%\\%'
        or path like '%..%'
        or char_length(path) > 1024
    )
  then
    delete from public.privacy_retention_deletion_claims
    where privacy_retention_deletion_claims.candidate_id =
      target_candidate_id
      and state <> 'finalized';
    return query select
      'skipped'::text,
      null::uuid,
      null::text,
      '{}'::text[];
    return;
  end if;

  insert into public.privacy_retention_deletion_claims (
    candidate_id,
    category,
    state,
    claim_token,
    irreversible_started,
    lease_expires_at,
    cutoff_at,
    last_error_code,
    terminal_outcome,
    affected_count,
    finalized_at,
    claimed_at,
    updated_at
  ) values (
    target_candidate_id,
    'expired-enquiry-upload',
    'claimed',
    new_claim_token,
    previous_irreversible,
    clock_timestamp() + interval '15 minutes',
    p_cutoff,
    null,
    null,
    null,
    null,
    clock_timestamp(),
    clock_timestamp()
  )
  on conflict (candidate_id) do update
  set
    category = excluded.category,
    state = 'claimed',
    claim_token = excluded.claim_token,
    irreversible_started =
      public.privacy_retention_deletion_claims.irreversible_started,
    lease_expires_at = excluded.lease_expires_at,
    cutoff_at = excluded.cutoff_at,
    last_error_code = null,
    terminal_outcome = null,
    affected_count = null,
    finalized_at = null,
    claimed_at = excluded.claimed_at,
    updated_at = excluded.updated_at;

  return query select
    'claimed'::text,
    new_claim_token,
    selected_bucket,
    selected_paths;
end;
$$;

create or replace function public.privacy_retention_order_storage_references_are_unambiguous(
  p_order_id uuid
)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select not exists (
    select 1
    from public.order_message_attachments as attachment
    join public.order_messages as message on message.id = attachment.message_id
    left join lateral (
      select item.value
      from jsonb_array_elements(
        case when jsonb_typeof(message.legacy_message->'attachments') = 'array'
          then message.legacy_message->'attachments' else '[]'::jsonb end
      ) with ordinality as item(value, position)
      where item.position = attachment.line_number
    ) as legacy_item on true
    where message.order_id = p_order_id
      and (
        select count(distinct nullif(btrim(reference.value), ''))
        from (values
          (attachment.asset_ref),
          (attachment.asset_id),
          (attachment.legacy_attachment #>> '{asset,_ref}'),
          (attachment.legacy_attachment #>> '{asset,_id}'),
          (legacy_item.value #>> '{asset,_ref}'),
          (legacy_item.value #>> '{asset,_id}')
        ) as reference(value)
      ) > 1
  ) and not exists (
    select 1
    from public.order_messages as message
    cross join lateral jsonb_array_elements(
      case when jsonb_typeof(message.legacy_message->'attachments') = 'array'
        then message.legacy_message->'attachments' else '[]'::jsonb end
    ) with ordinality as legacy_item(value, position)
    left join public.order_message_attachments as attachment
      on attachment.message_id = message.id
      and attachment.line_number = legacy_item.position
    where message.order_id = p_order_id
      and (
        select count(distinct nullif(btrim(reference.value), ''))
        from (values
          (attachment.asset_ref),
          (attachment.asset_id),
          (attachment.legacy_attachment #>> '{asset,_ref}'),
          (attachment.legacy_attachment #>> '{asset,_id}'),
          (legacy_item.value #>> '{asset,_ref}'),
          (legacy_item.value #>> '{asset,_id}')
        ) as reference(value)
      ) > 1
  ) and not exists (
    select 1
    from public.order_note_images as image
    join public.order_notes as note on note.id = image.note_id
    left join lateral (
      select item.value
      from jsonb_array_elements(
        case when jsonb_typeof(note.legacy_note->'images') = 'array'
          then note.legacy_note->'images' else '[]'::jsonb end
      ) with ordinality as item(value, position)
      where item.position = image.line_number
    ) as legacy_item on true
    where note.order_id = p_order_id
      and (
        select count(distinct nullif(btrim(reference.value), ''))
        from (values
          (image.asset_ref),
          (image.asset_id),
          (image.legacy_image #>> '{asset,_ref}'),
          (image.legacy_image #>> '{asset,_id}'),
          (legacy_item.value #>> '{asset,_ref}'),
          (legacy_item.value #>> '{asset,_id}')
        ) as reference(value)
      ) > 1
  ) and not exists (
    select 1
    from public.order_notes as note
    cross join lateral jsonb_array_elements(
      case when jsonb_typeof(note.legacy_note->'images') = 'array'
        then note.legacy_note->'images' else '[]'::jsonb end
    ) with ordinality as legacy_item(value, position)
    left join public.order_note_images as image
      on image.note_id = note.id
      and image.line_number = legacy_item.position
    where note.order_id = p_order_id
      and (
        select count(distinct nullif(btrim(reference.value), ''))
        from (values
          (image.asset_ref),
          (image.asset_id),
          (image.legacy_image #>> '{asset,_ref}'),
          (image.legacy_image #>> '{asset,_id}'),
          (legacy_item.value #>> '{asset,_ref}'),
          (legacy_item.value #>> '{asset,_id}')
        ) as reference(value)
      ) > 1
  );
$$;

create or replace function public.privacy_retention_order_storage_references(
  p_order_id uuid
)
returns table (path text)
language sql
stable
security invoker
set search_path = ''
as $$
  select distinct btrim(reference.path)
  from (
    select attachment.asset_ref as path
    from public.order_message_attachments as attachment
    join public.order_messages as message on message.id = attachment.message_id
    where message.order_id = p_order_id
      and (
        attachment.asset_type = 'supabase-file'
        or attachment.legacy_attachment #>> '{asset,_type}' = 'supabase-file'
      )
    union all
    select attachment.asset_id
    from public.order_message_attachments as attachment
    join public.order_messages as message on message.id = attachment.message_id
    where message.order_id = p_order_id
      and (
        attachment.asset_type = 'supabase-file'
        or attachment.legacy_attachment #>> '{asset,_type}' = 'supabase-file'
      )
    union all
    select attachment.legacy_attachment #>> '{asset,_ref}'
    from public.order_message_attachments as attachment
    join public.order_messages as message on message.id = attachment.message_id
    where message.order_id = p_order_id
      and (
        attachment.asset_type = 'supabase-file'
        or attachment.legacy_attachment #>> '{asset,_type}' = 'supabase-file'
      )
    union all
    select attachment.legacy_attachment #>> '{asset,_id}'
    from public.order_message_attachments as attachment
    join public.order_messages as message on message.id = attachment.message_id
    where message.order_id = p_order_id
      and (
        attachment.asset_type = 'supabase-file'
        or attachment.legacy_attachment #>> '{asset,_type}' = 'supabase-file'
      )
    union all
    select image.asset_ref
    from public.order_note_images as image
    join public.order_notes as note on note.id = image.note_id
    where note.order_id = p_order_id
      and (
        image.asset_type = 'supabase-file'
        or image.legacy_image #>> '{asset,_type}' = 'supabase-file'
      )
    union all
    select image.asset_id
    from public.order_note_images as image
    join public.order_notes as note on note.id = image.note_id
    where note.order_id = p_order_id
      and (
        image.asset_type = 'supabase-file'
        or image.legacy_image #>> '{asset,_type}' = 'supabase-file'
      )
    union all
    select image.legacy_image #>> '{asset,_ref}'
    from public.order_note_images as image
    join public.order_notes as note on note.id = image.note_id
    where note.order_id = p_order_id
      and (
        image.asset_type = 'supabase-file'
        or image.legacy_image #>> '{asset,_type}' = 'supabase-file'
      )
    union all
    select image.legacy_image #>> '{asset,_id}'
    from public.order_note_images as image
    join public.order_notes as note on note.id = image.note_id
    where note.order_id = p_order_id
      and (
        image.asset_type = 'supabase-file'
        or image.legacy_image #>> '{asset,_type}' = 'supabase-file'
      )
    union all
    select legacy_item #>> '{asset,_ref}'
    from public.order_messages as message
    cross join lateral jsonb_array_elements(
      case when jsonb_typeof(message.legacy_message->'attachments') = 'array'
        then message.legacy_message->'attachments' else '[]'::jsonb end
    ) as legacy_item
    where message.order_id = p_order_id
      and legacy_item #>> '{asset,_type}' = 'supabase-file'
    union all
    select legacy_item #>> '{asset,_id}'
    from public.order_messages as message
    cross join lateral jsonb_array_elements(
      case when jsonb_typeof(message.legacy_message->'attachments') = 'array'
        then message.legacy_message->'attachments' else '[]'::jsonb end
    ) as legacy_item
    where message.order_id = p_order_id
      and legacy_item #>> '{asset,_type}' = 'supabase-file'
    union all
    select legacy_item #>> '{asset,_ref}'
    from public.order_notes as note
    cross join lateral jsonb_array_elements(
      case when jsonb_typeof(note.legacy_note->'images') = 'array'
        then note.legacy_note->'images' else '[]'::jsonb end
    ) as legacy_item
    where note.order_id = p_order_id
      and legacy_item #>> '{asset,_type}' = 'supabase-file'
    union all
    select legacy_item #>> '{asset,_id}'
    from public.order_notes as note
    cross join lateral jsonb_array_elements(
      case when jsonb_typeof(note.legacy_note->'images') = 'array'
        then note.legacy_note->'images' else '[]'::jsonb end
    ) as legacy_item
    where note.order_id = p_order_id
      and legacy_item #>> '{asset,_type}' = 'supabase-file'
  ) as reference
  where nullif(btrim(reference.path), '') is not null;
$$;

create or replace function public.privacy_retention_storage_reference_owners(
  p_path text
)
returns table (owner_key text)
language sql
stable
security invoker
set search_path = ''
as $$
  select 'enquiry:custom-cake:' || enquiry.id::text
  from public.custom_cake_enquiries as enquiry
  where enquiry.reference_image_path = p_path
  union
  select 'enquiry:event-photo:' || request.id::text
  from public.event_photo_requests as request
  where p_path = any(coalesce(request.temp_image_paths, '{}'::text[]))
  union
  select 'order:' || orders.id::text
  from public.orders as orders
  where exists (
    select 1
    from public.privacy_retention_order_storage_references(orders.id) as reference
    where reference.path = p_path
  );
$$;

create or replace function public.begin_privacy_retention_external_deletion(
  p_candidate_id text,
  p_claim_token uuid,
  p_bucket text,
  p_paths text[]
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  candidate_parts text[] := string_to_array(p_candidate_id, ':');
  candidate_kind text := candidate_parts[1];
  enquiry_type text;
  record_id text;
  target_order_id uuid;
  target_order_number text;
  expected_paths text[] := '{}';
  supplied_paths text[] := '{}';
  allowed_owners text[] := '{}';
  updated_count bigint := 0;
begin
  if p_bucket is null
    or p_bucket !~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$'
    or coalesce(array_length(p_paths, 1), 0) = 0
  then
    raise exception 'RETENTION_STORAGE_PLAN_INVALID';
  end if;

  select coalesce(array_agg(distinct btrim(path) order by btrim(path)), '{}')
  into supplied_paths
  from unnest(p_paths) as path
  where nullif(btrim(path), '') is not null;

  if array_length(supplied_paths, 1) is distinct from array_length(p_paths, 1)
    or exists (
      select 1 from unnest(supplied_paths) as path
      where path like '/%'
        or path like '%\%'
        or path like '%..%'
        or path like '%//%'
        or char_length(path) > 1024
    )
  then
    raise exception 'RETENTION_STORAGE_PLAN_INVALID';
  end if;

  perform 1
  from public.privacy_retention_deletion_claims as claim
  where claim.candidate_id = p_candidate_id
    and claim.claim_token = p_claim_token
    and claim.state in ('claimed', 'external-delete')
  for update;
  if not found then
    raise exception 'RETENTION_CLAIM_TOKEN_MISMATCH';
  end if;

  if candidate_kind in ('order', 'order-upload')
    and array_length(candidate_parts, 1) = 2
    and candidate_parts[2] ~ '^[0-9a-fA-F-]{36}$'
  then
    target_order_id := candidate_parts[2]::uuid;
    if p_bucket <> 'custom-cake-enquiries' then
      raise exception 'RETENTION_STORAGE_BUCKET_INVALID';
    end if;
    select orders.order_number into target_order_number
    from public.orders as orders
    where orders.id = target_order_id
    for update;
    if not found then
      raise exception 'RETENTION_ORDER_IDENTITY_INVALID';
    end if;
    if not public.privacy_retention_order_storage_references_are_unambiguous(
      target_order_id
    ) then
      raise exception 'RETENTION_STORAGE_REFERENCE_AMBIGUOUS';
    end if;

    select coalesce(array_agg(distinct reference.path order by reference.path), '{}')
    into expected_paths
    from public.privacy_retention_order_storage_references(target_order_id) as reference;
    allowed_owners := array['order:' || target_order_id::text];

    if candidate_kind = 'order' then
      select coalesce(array_agg(distinct path order by path), '{}')
      into expected_paths
      from (
        select unnest(expected_paths) as path
        union all
        select enquiry.reference_image_path
        from public.custom_cake_enquiries as enquiry
        where enquiry.converted_order_id = target_order_id
          and enquiry.lifecycle_status = 'converted'
          and nullif(btrim(enquiry.reference_image_path), '') is not null
      ) as all_paths;
      allowed_owners := allowed_owners || coalesce((
        select array_agg('enquiry:custom-cake:' || enquiry.id::text)
        from public.custom_cake_enquiries as enquiry
        where enquiry.converted_order_id = target_order_id
          and enquiry.lifecycle_status = 'converted'
      ), '{}'::text[]);
    end if;

    if exists (
      select 1
      from public.privacy_retention_order_storage_references(target_order_id) as reference
      where left(reference.path, char_length('orders/' || target_order_id::text || '/')) <>
          'orders/' || target_order_id::text || '/'
        and left(reference.path, char_length('orders/' || target_order_number || '/')) <>
          'orders/' || target_order_number || '/'
    ) then
      raise exception 'RETENTION_STORAGE_PATH_OWNERSHIP_INVALID';
    end if;

    if candidate_kind = 'order' and exists (
      select 1 from public.custom_cake_enquiries as enquiry
      where enquiry.converted_order_id = target_order_id
        and enquiry.lifecycle_status = 'converted'
        and nullif(btrim(enquiry.reference_image_path), '') is not null
        and (
          enquiry.reference_image_bucket is distinct from p_bucket
          or enquiry.reference_image_path !~ '^enquiries/[^/].*$'
        )
    ) then
      raise exception 'RETENTION_STORAGE_PATH_OWNERSHIP_INVALID';
    end if;
  elsif candidate_kind in ('enquiry', 'enquiry-upload')
    and array_length(candidate_parts, 1) = 3
  then
    enquiry_type := candidate_parts[2];
    record_id := candidate_parts[3];
    if enquiry_type = 'custom-cake' and record_id ~ '^[0-9a-fA-F-]{36}$' then
      select
        case when nullif(btrim(enquiry.reference_image_path), '') is null
          then '{}'::text[] else array[enquiry.reference_image_path] end
      into expected_paths
      from public.custom_cake_enquiries as enquiry
      where enquiry.id = record_id::uuid
        and enquiry.reference_image_bucket = p_bucket
      for update;
      allowed_owners := array['enquiry:custom-cake:' || record_id];
      if exists (
        select 1 from unnest(coalesce(expected_paths, '{}'::text[])) as path
        where path !~ '^enquiries/[^/].*$'
      ) then
        raise exception 'RETENTION_STORAGE_PATH_OWNERSHIP_INVALID';
      end if;
    elsif enquiry_type = 'event-photo' and record_id ~ '^[0-9a-fA-F-]{36}$' then
      select coalesce(request.temp_image_paths, '{}'::text[])
      into expected_paths
      from public.event_photo_requests as request
      where request.id = record_id::uuid
        and request.temp_image_bucket = p_bucket
      for update;
      allowed_owners := array['enquiry:event-photo:' || record_id];
      if p_bucket <> 'event-photo-temp-uploads' or exists (
        select 1 from unnest(coalesce(expected_paths, '{}'::text[])) as path
        where path !~ '^incoming/[^/].*$'
      ) then
        raise exception 'RETENTION_STORAGE_PATH_OWNERSHIP_INVALID';
      end if;
    else
      raise exception 'RETENTION_STORAGE_PLAN_INVALID';
    end if;
  else
    raise exception 'RETENTION_STORAGE_PLAN_INVALID';
  end if;

  select coalesce(array_agg(distinct btrim(path) order by btrim(path)), '{}')
  into expected_paths
  from unnest(coalesce(expected_paths, '{}'::text[])) as path
  where nullif(btrim(path), '') is not null;

  if expected_paths is distinct from supplied_paths then
    raise exception 'RETENTION_STORAGE_PLAN_STALE';
  end if;

  if exists (
    select 1
    from unnest(expected_paths) as expected_path
    cross join lateral public.privacy_retention_storage_reference_owners(
      expected_path
    ) as owner
    where not (owner.owner_key = any(allowed_owners))
  ) then
    raise exception 'RETENTION_STORAGE_REFERENCE_SHARED';
  end if;

  update public.privacy_retention_deletion_claims
  set
    state = 'external-delete',
    irreversible_started = true,
    lease_expires_at = clock_timestamp() + interval '15 minutes',
    updated_at = clock_timestamp()
  where candidate_id = p_candidate_id
    and claim_token = p_claim_token
    and state in ('claimed', 'external-delete');
  get diagnostics updated_count = row_count;
  return updated_count = 1;
end;
$$;

create or replace function public.release_privacy_retention_deletion_claim(
  p_candidate_id text,
  p_claim_token uuid,
  p_error_code text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_claim public.privacy_retention_deletion_claims%rowtype;
  selected_action public.privacy_retention_actions%rowtype;
  updated_count bigint := 0;
begin
  if p_error_code is null
    or p_error_code !~ '^[A-Z][A-Z0-9_]{0,63}$'
  then
    raise exception 'A safe retention error code is required';
  end if;

  select * into selected_claim
  from public.privacy_retention_deletion_claims
  where candidate_id = p_candidate_id
    and claim_token = p_claim_token
  for update;

  if not found then
    return false;
  end if;

  if selected_claim.irreversible_started then
    update public.privacy_retention_deletion_claims
    set
      state = 'retryable',
      claim_token = null,
      lease_expires_at = null,
      last_error_code = p_error_code,
      updated_at = clock_timestamp()
    where candidate_id = p_candidate_id;
  elsif selected_claim.action_id is not null then
    select action.* into selected_action
    from public.privacy_retention_actions as action
    where action.id = selected_claim.action_id
      and action.run_id = selected_claim.run_id
      and action.candidate_id = selected_claim.candidate_id
    for update;
    if not found or selected_action.outcome <> 'pending' then
      raise exception 'RETENTION_ACTION_NOT_PENDING';
    end if;

    perform set_config(
      'app.privacy_retention_audit_action',
      selected_action.id::text,
      true
    );
    update public.privacy_retention_actions
    set
      outcome = 'failed',
      error_code = p_error_code,
      occurred_at = clock_timestamp()
    where id = selected_action.id
      and outcome = 'pending';
    get diagnostics updated_count = row_count;
    if updated_count <> 1 then
      raise exception 'RETENTION_ACTION_UPDATE_COUNT_MISMATCH';
    end if;

    -- The action outcome is durable in this same transaction before the
    -- non-irreversible claim is removed. A crash can therefore never leave a
    -- missing outbox together with an unaudited failed action.
    delete from public.privacy_retention_deletion_claims
    where candidate_id = p_candidate_id;
  else
    delete from public.privacy_retention_deletion_claims
    where candidate_id = p_candidate_id;
  end if;

  return true;
end;
$$;

create or replace function public.set_privacy_retention_legal_hold(
  p_candidate_id text,
  p_hold boolean,
  p_reason text,
  p_review_at timestamptz
)
returns table (
  updated boolean,
  record_reference text,
  hold_active boolean,
  hold_reason text,
  hold_review_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  candidate_parts text[] := string_to_array(p_candidate_id, ':');
  candidate_kind text := candidate_parts[1];
  enquiry_type text;
  record_id text;
  changed_count bigint := 0;
  safe_record_reference text;
  safe_record_type text;
  previous_hold_active boolean := false;
  previous_hold_reason text;
  previous_hold_review_at timestamptz;
  hold_event_type text;
begin
  if p_candidate_id is null
    or char_length(p_candidate_id) not between 1 and 160
    or p_candidate_id !~ '^[A-Za-z0-9][A-Za-z0-9._:/-]*$'
    or p_hold is null
  then
    raise exception 'A valid privacy-retention candidate and hold state are required';
  end if;
  if p_hold and (
    p_reason is null
    or p_reason not in (
      'active-complaint',
      'legal-claim',
      'regulatory-request',
      'fraud-investigation',
      'other-necessary-hold'
    )
    or p_review_at is null
    or p_review_at <= clock_timestamp()
  ) then
    raise exception 'A valid legal-hold reason and future review date are required';
  end if;
  if not p_hold and (p_reason is not null or p_review_at is not null) then
    raise exception 'Released legal holds cannot retain an active reason or review date';
  end if;

  if candidate_kind = 'health'
    and candidate_parts[2] = 'enquiry'
    and array_length(candidate_parts, 1) = 4
  then
    candidate_kind := 'enquiry';
    enquiry_type := candidate_parts[3];
    record_id := candidate_parts[4];
  elsif candidate_kind = 'health'
    and candidate_parts[2] = 'order'
    and array_length(candidate_parts, 1) = 3
  then
    candidate_kind := 'order';
    record_id := candidate_parts[3];
  elsif candidate_kind in ('order', 'order-upload')
    and array_length(candidate_parts, 1) = 2
  then
    record_id := candidate_parts[2];
  elsif candidate_kind in ('enquiry', 'enquiry-upload')
    and array_length(candidate_parts, 1) = 3
  then
    enquiry_type := candidate_parts[2];
    record_id := candidate_parts[3];
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended('privacy-retention-candidate:' || p_candidate_id, 0)
  );
  perform set_config(
    'app.privacy_retention_hold_mutation',
    'hold:' || p_candidate_id,
    true
  );

  if candidate_kind in ('enquiry', 'enquiry-upload')
    and record_id is not null
  then
    enquiry_type := coalesce(enquiry_type, candidate_parts[2]);
    record_id := coalesce(record_id, candidate_parts[3]);
    if enquiry_type = 'contact'
      and candidate_kind = 'enquiry'
      and record_id ~ '^[0-9]{1,20}$'
    then
      select enquiry.legal_hold, enquiry.legal_hold_reason, enquiry.legal_hold_review_at
      into previous_hold_active, previous_hold_reason, previous_hold_review_at
      from public.contact_enquiries as enquiry
      where enquiry.id = record_id::bigint
      for update;
      if not found then
        return query select false, null::text, null::boolean, null::text, null::timestamptz;
        return;
      end if;
      update public.contact_enquiries set
        legal_hold = p_hold,
        legal_hold_reason = case when p_hold then p_reason else null end,
        legal_hold_review_at = case when p_hold then p_review_at else null end
      where id = record_id::bigint;
      safe_record_reference := 'contact-' || record_id;
      safe_record_type := 'contact-enquiry';
    elsif enquiry_type = 'custom-cake'
      and record_id ~ '^[0-9a-fA-F-]{36}$'
    then
      select enquiry.legal_hold, enquiry.legal_hold_reason, enquiry.legal_hold_review_at
      into previous_hold_active, previous_hold_reason, previous_hold_review_at
      from public.custom_cake_enquiries as enquiry
      where enquiry.id = record_id::uuid
      for update;
      if not found then
        return query select false, null::text, null::boolean, null::text, null::timestamptz;
        return;
      end if;
      update public.custom_cake_enquiries set
        legal_hold = p_hold,
        legal_hold_reason = case when p_hold then p_reason else null end,
        legal_hold_review_at = case when p_hold then p_review_at else null end
      where id = record_id::uuid;
      safe_record_reference := 'custom-cake-' || record_id;
      safe_record_type := 'custom-cake-enquiry';
    elsif enquiry_type = 'workshop'
      and candidate_kind = 'enquiry'
      and record_id ~ '^[0-9]{1,20}$'
    then
      select enquiry.legal_hold, enquiry.legal_hold_reason, enquiry.legal_hold_review_at
      into previous_hold_active, previous_hold_reason, previous_hold_review_at
      from public.workshop_enquiries as enquiry
      where enquiry.id = record_id::bigint
      for update;
      if not found then
        return query select false, null::text, null::boolean, null::text, null::timestamptz;
        return;
      end if;
      update public.workshop_enquiries set
        legal_hold = p_hold,
        legal_hold_reason = case when p_hold then p_reason else null end,
        legal_hold_review_at = case when p_hold then p_review_at else null end
      where id = record_id::bigint;
      safe_record_reference := 'workshop-' || record_id;
      safe_record_type := 'workshop-enquiry';
    elsif enquiry_type = 'event-photo'
      and record_id ~ '^[0-9a-fA-F-]{36}$'
    then
      select request.legal_hold, request.legal_hold_reason, request.legal_hold_review_at
      into previous_hold_active, previous_hold_reason, previous_hold_review_at
      from public.event_photo_requests as request
      where request.id = record_id::uuid
      for update;
      if not found then
        return query select false, null::text, null::boolean, null::text, null::timestamptz;
        return;
      end if;
      update public.event_photo_requests set
        legal_hold = p_hold,
        legal_hold_reason = case when p_hold then p_reason else null end,
        legal_hold_review_at = case when p_hold then p_review_at else null end
      where id = record_id::uuid;
      safe_record_reference := 'event-photo-' || record_id;
      safe_record_type := 'event-photo-request';
    else
      raise exception 'Unsupported legal-hold enquiry candidate';
    end if;
    get diagnostics changed_count = row_count;
  elsif candidate_kind in ('order', 'order-upload')
    and record_id ~ '^[0-9a-fA-F-]{36}$'
  then
    select
      orders.legal_hold,
      orders.legal_hold_reason,
      orders.legal_hold_review_at,
      orders.order_number
    into
      previous_hold_active,
      previous_hold_reason,
      previous_hold_review_at,
      safe_record_reference
    from public.orders as orders
    where orders.id = record_id::uuid
    for update;
    if not found then
      return query select false, null::text, null::boolean, null::text, null::timestamptz;
      return;
    end if;
    update public.orders set
      legal_hold = p_hold,
      legal_hold_reason = case when p_hold then p_reason else null end,
      legal_hold_review_at = case when p_hold then p_review_at else null end
    where id = record_id::uuid;
    get diagnostics changed_count = row_count;
    safe_record_type := 'order';
  elsif candidate_kind = 'security'
    and array_length(candidate_parts, 1) = 2
    and candidate_parts[2] in (
      'enquiry-rate-limits',
      'admin-login-attempts',
      'event-photo-rate-limits'
    )
  then
    select true, hold.reason, hold.review_at
    into previous_hold_active, previous_hold_reason, previous_hold_review_at
    from public.privacy_retention_security_holds as hold
    where hold.record_type = candidate_parts[2]
    for update;
    previous_hold_active := coalesce(previous_hold_active, false);
    if p_hold then
      insert into public.privacy_retention_security_holds (
        record_type,
        reason,
        review_at
      ) values (
        candidate_parts[2],
        p_reason,
        p_review_at
      )
      on conflict (record_type) do update set
        reason = excluded.reason,
        review_at = excluded.review_at;
      changed_count := 1;
      safe_record_reference := candidate_parts[2];
      safe_record_type := 'security-batch';
    else
      if not previous_hold_active then
        return query select false, null::text, null::boolean, null::text, null::timestamptz;
        return;
      end if;
      delete from public.privacy_retention_security_holds
      where record_type = candidate_parts[2];
      get diagnostics changed_count = row_count;
      safe_record_reference := candidate_parts[2];
      safe_record_type := 'security-batch';
    end if;
  else
    raise exception 'Unsupported privacy-retention legal-hold candidate';
  end if;

  if changed_count = 1 then
    if p_hold and previous_hold_active then
      hold_event_type := 'extended';
    elsif p_hold then
      hold_event_type := 'placed';
    elsif previous_hold_active then
      hold_event_type := 'released';
    else
      raise exception 'RETENTION_HOLD_TRANSITION_INVALID';
    end if;

    insert into public.privacy_retention_hold_events (
      candidate_id,
      record_type,
      record_reference,
      event_type,
      previous_hold_active,
      previous_hold_reason,
      previous_hold_review_at,
      new_hold_active,
      new_hold_reason,
      new_hold_review_at
    ) values (
      p_candidate_id,
      safe_record_type,
      safe_record_reference,
      hold_event_type,
      previous_hold_active,
      previous_hold_reason,
      previous_hold_review_at,
      p_hold,
      case when p_hold then p_reason else null end,
      case when p_hold then p_review_at else null end
    );
  end if;

  return query select
    changed_count = 1,
    case when changed_count = 1 then safe_record_reference else null end,
    case when changed_count = 1 then p_hold else null end,
    case when changed_count = 1 and p_hold then p_reason else null end,
    case when changed_count = 1 and p_hold then p_review_at else null end;
end;
$$;

create or replace function public.get_privacy_retention_legal_hold(
  p_candidate_id text
)
returns table (
  found boolean,
  record_reference text,
  hold_active boolean,
  hold_reason text,
  hold_review_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  candidate_parts text[] := string_to_array(p_candidate_id, ':');
  candidate_kind text := candidate_parts[1];
  enquiry_type text;
  record_id text;
begin
  if candidate_kind = 'health'
    and candidate_parts[2] = 'enquiry'
    and array_length(candidate_parts, 1) = 4
  then
    candidate_kind := 'enquiry';
    enquiry_type := candidate_parts[3];
    record_id := candidate_parts[4];
  elsif candidate_kind = 'health'
    and candidate_parts[2] = 'order'
    and array_length(candidate_parts, 1) = 3
  then
    candidate_kind := 'order';
    record_id := candidate_parts[3];
  elsif candidate_kind in ('enquiry', 'enquiry-upload')
    and array_length(candidate_parts, 1) = 3
  then
    enquiry_type := candidate_parts[2];
    record_id := candidate_parts[3];
  elsif candidate_kind in ('order', 'order-upload')
    and array_length(candidate_parts, 1) = 2
  then
    record_id := candidate_parts[2];
  end if;

  if candidate_kind in ('enquiry', 'enquiry-upload') then
    if enquiry_type = 'contact' and record_id ~ '^[0-9]{1,20}$' then
      return query select
        true,
        'contact-' || record_id,
        enquiry.legal_hold,
        enquiry.legal_hold_reason,
        enquiry.legal_hold_review_at
      from public.contact_enquiries as enquiry
      where enquiry.id = record_id::bigint;
    elsif enquiry_type = 'custom-cake' and record_id ~ '^[0-9a-fA-F-]{36}$' then
      return query select
        true,
        'custom-cake-' || record_id,
        enquiry.legal_hold,
        enquiry.legal_hold_reason,
        enquiry.legal_hold_review_at
      from public.custom_cake_enquiries as enquiry
      where enquiry.id = record_id::uuid;
    elsif enquiry_type = 'workshop' and record_id ~ '^[0-9]{1,20}$' then
      return query select
        true,
        'workshop-' || record_id,
        enquiry.legal_hold,
        enquiry.legal_hold_reason,
        enquiry.legal_hold_review_at
      from public.workshop_enquiries as enquiry
      where enquiry.id = record_id::bigint;
    elsif enquiry_type = 'event-photo' and record_id ~ '^[0-9a-fA-F-]{36}$' then
      return query select
        true,
        'event-photo-' || record_id,
        request.legal_hold,
        request.legal_hold_reason,
        request.legal_hold_review_at
      from public.event_photo_requests as request
      where request.id = record_id::uuid;
    end if;
  elsif candidate_kind in ('order', 'order-upload')
    and record_id ~ '^[0-9a-fA-F-]{36}$'
  then
    return query select
      true,
      orders.order_number,
      orders.legal_hold,
      orders.legal_hold_reason,
      orders.legal_hold_review_at
    from public.orders as orders
    where orders.id = record_id::uuid;
  elsif candidate_kind = 'security'
    and candidate_parts[2] in (
      'enquiry-rate-limits',
      'admin-login-attempts',
      'event-photo-rate-limits'
    )
  then
    return query select
      true,
      candidate_parts[2],
      hold.record_type is not null,
      hold.reason,
      hold.review_at
    from (select 1) as singleton
    left join public.privacy_retention_security_holds as hold
      on hold.record_type = candidate_parts[2];
  end if;

  return query select false, null::text, false, null::text, null::timestamptz;
end;
$$;

create or replace function public.finalize_privacy_retention_deletion(
  p_candidate_id text,
  p_claim_token uuid,
  p_cutoff_at timestamptz
)
returns table (
  status text,
  affected_count bigint
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  candidate_parts text[] := string_to_array(p_candidate_id, ':');
  candidate_kind text := candidate_parts[1];
  enquiry_type text;
  record_id text;
  order_id uuid;
  selected_claim public.privacy_retention_deletion_claims%rowtype;
  selected_action public.privacy_retention_actions%rowtype;
  has_storage_references boolean := false;
  terminal_status text;
  changed_count bigint := 0;
  rpc_count bigint := 0;
  updated_count bigint := 0;
begin
  select claim.*
  into selected_claim
  from public.privacy_retention_deletion_claims as claim
  where claim.candidate_id = p_candidate_id
    and claim.claim_token = p_claim_token
    and claim.state in ('claimed', 'external-delete')
  for update;

  if not found then
    raise exception using
      errcode = '42501',
      message = 'A matching server-generated deletion claim is required';
  end if;

  if p_cutoff_at is null or p_cutoff_at is distinct from selected_claim.cutoff_at then
    raise exception 'RETENTION_CLAIM_CUTOFF_MISMATCH';
  end if;

  if selected_claim.run_id is null or selected_claim.action_id is null then
    raise exception 'RETENTION_ACTION_IDENTITY_MISSING';
  end if;

  select action.*
  into selected_action
  from public.privacy_retention_actions as action
  where action.id = selected_claim.action_id
    and action.run_id = selected_claim.run_id
    and action.candidate_id = p_candidate_id
  for update;

  if not found or selected_action.outcome <> 'pending' then
    raise exception 'RETENTION_ACTION_NOT_PENDING';
  end if;

  if candidate_kind in ('enquiry', 'enquiry-upload')
    and array_length(candidate_parts, 1) = 3
  then
    enquiry_type := candidate_parts[2];
    record_id := candidate_parts[3];
    if enquiry_type = 'custom-cake' then
      select nullif(btrim(enquiry.reference_image_path), '') is not null
      into has_storage_references
      from public.custom_cake_enquiries as enquiry
      where enquiry.id = record_id::uuid;
    elsif enquiry_type = 'event-photo' then
      select coalesce(array_length(request.temp_image_paths, 1), 0) > 0
      into has_storage_references
      from public.event_photo_requests as request
      where request.id = record_id::uuid;
    end if;
  elsif candidate_kind in ('order', 'order-upload')
    and array_length(candidate_parts, 1) = 2
  then
    order_id := candidate_parts[2]::uuid;
    select exists (
      select 1
      from public.privacy_retention_order_storage_references(order_id)
    ) or (
      candidate_kind = 'order' and exists (
        select 1 from public.custom_cake_enquiries as enquiry
        where enquiry.converted_order_id = order_id
          and enquiry.lifecycle_status = 'converted'
          and nullif(btrim(enquiry.reference_image_path), '') is not null
      )
    ) into has_storage_references;
  end if;

  if coalesce(has_storage_references, false)
    and selected_claim.state <> 'external-delete'
  then
    raise exception 'RETENTION_EXTERNAL_DELETION_REQUIRED';
  end if;

  perform set_config(
    'app.privacy_retention_claim_token',
    p_claim_token::text,
    true
  );

  if candidate_kind = 'enquiry' and array_length(candidate_parts, 1) = 3 then
    enquiry_type := candidate_parts[2];
    record_id := candidate_parts[3];
    if enquiry_type = 'contact' then
      delete from public.contact_enquiries
      where id = record_id::bigint
        and lifecycle_status = 'closed'
        and legal_hold = false
        and retention_due_at <= selected_claim.cutoff_at;
    elsif enquiry_type = 'custom-cake' then
      delete from public.custom_cake_enquiries
      where id = record_id::uuid
        and lifecycle_status = 'closed'
        and legal_hold = false
        and retention_due_at <= selected_claim.cutoff_at;
    elsif enquiry_type = 'workshop' then
      delete from public.workshop_enquiries
      where id = record_id::bigint
        and lifecycle_status = 'closed'
        and legal_hold = false
        and retention_due_at <= selected_claim.cutoff_at;
    elsif enquiry_type = 'event-photo' then
      delete from public.event_photo_requests
      where id = record_id::uuid
        and lifecycle_status = 'closed'
        and legal_hold = false
        and retention_due_at <= selected_claim.cutoff_at;
    else
      raise exception 'Unsupported privacy-retention enquiry finalizer';
    end if;
    get diagnostics changed_count = row_count;
  elsif candidate_kind = 'enquiry-upload'
    and array_length(candidate_parts, 1) = 3
  then
    enquiry_type := candidate_parts[2];
    record_id := candidate_parts[3];
    if enquiry_type = 'custom-cake' then
      update public.custom_cake_enquiries
      set
        reference_image_bucket = null,
        reference_image_path = null,
        reference_image_name = null,
        reference_image_type = null,
        reference_image_size = null,
        upload_retention_due_at = null
      where id = record_id::uuid
        and legal_hold = false
        and upload_retention_due_at <= selected_claim.cutoff_at
        and (
          retention_due_at is null
          or retention_due_at > selected_claim.cutoff_at
        );
    elsif enquiry_type = 'event-photo' then
      update public.event_photo_requests
      set
        temp_image_bucket = null,
        temp_image_paths = '{}',
        image_filenames = '{}',
        image_mime_types = '{}',
        image_sizes = '{}',
        files_deleted_at = clock_timestamp(),
        upload_retention_due_at = null
      where id = record_id::uuid
        and legal_hold = false
        and upload_retention_due_at <= selected_claim.cutoff_at
        and (
          retention_due_at is null
          or retention_due_at > selected_claim.cutoff_at
        );
    else
      raise exception 'Unsupported privacy-retention upload finalizer';
    end if;
    get diagnostics changed_count = row_count;
  elsif candidate_kind = 'order-upload'
    and array_length(candidate_parts, 1) = 2
  then
    order_id := candidate_parts[2]::uuid;
    select result.status, result.affected_count
    into terminal_status, changed_count
    from public.redact_order_uploaded_files(order_id) as result;
    if terminal_status = 'no-upload-references' then
      changed_count := 0;
    end if;
  elsif candidate_kind = 'order'
    and array_length(candidate_parts, 1) = 2
  then
    order_id := candidate_parts[2]::uuid;
    delete from public.orders
    where id = order_id
      and legal_hold = false
      and status::text in ('completed', 'delivered', 'cancelled')
      and retention_due_at <= selected_claim.cutoff_at;
    get diagnostics changed_count = row_count;
  elsif candidate_kind = 'health'
    and candidate_parts[2] = 'enquiry'
    and array_length(candidate_parts, 1) = 4
  then
    -- The erasure RPC is installed by the later health-retention migration.
    -- Dynamic dispatch keeps this prerequisite migration valid in isolation.
    execute $health$
      select result.status
      from public.erase_due_enquiry_dietary_health_information($1, $2) as result
    $health$
    into terminal_status
    using candidate_parts[3], candidate_parts[4];
    changed_count := case when terminal_status = 'erased' then 1 else 0 end;
  elsif candidate_kind = 'health'
    and candidate_parts[2] = 'order'
    and array_length(candidate_parts, 1) = 3
  then
    execute $health$
      select result.status
      from public.erase_due_order_dietary_health_information($1) as result
    $health$
    into terminal_status
    using candidate_parts[3];
    changed_count := case when terminal_status = 'erased' then 1 else 0 end;
  elsif candidate_kind = 'security'
    and array_length(candidate_parts, 1) = 2
  then
    record_id := candidate_parts[2];
    select result.deleted_count
    into rpc_count
    from public.delete_expired_privacy_security_records(
      record_id,
      selected_claim.cutoff_at - interval '90 days'
    ) as result;
    changed_count := coalesce(rpc_count, 0);
  else
    raise exception 'Unsupported privacy-retention finalizer candidate';
  end if;

  terminal_status := case
    when coalesce(changed_count, 0) > 0 then 'deleted'
    else 'skipped'
  end;

  perform set_config(
    'app.privacy_retention_audit_action',
    selected_action.id::text,
    true
  );
  update public.privacy_retention_actions
  set
    outcome = terminal_status,
    error_code = null,
    occurred_at = clock_timestamp()
  where id = selected_action.id
    and run_id = selected_claim.run_id
    and candidate_id = p_candidate_id
    and outcome = 'pending';
  get diagnostics updated_count = row_count;
  if updated_count <> 1 then
    raise exception 'RETENTION_ACTION_UPDATE_COUNT_MISMATCH';
  end if;

  update public.privacy_retention_deletion_claims
  set
    state = 'finalized',
    claim_token = null,
    lease_expires_at = null,
    last_error_code = null,
    terminal_outcome = terminal_status,
    affected_count = coalesce(changed_count, 0),
    finalized_at = clock_timestamp(),
    updated_at = clock_timestamp()
  where candidate_id = p_candidate_id
    and claim_token = p_claim_token
    and action_id = selected_action.id
    and state in ('claimed', 'external-delete');
  get diagnostics updated_count = row_count;
  if updated_count <> 1 then
    raise exception 'RETENTION_CLAIM_FINALIZE_COUNT_MISMATCH';
  end if;

  return query select
    terminal_status,
    coalesce(changed_count, 0);
end;
$$;

create or replace function public.finalize_event_photo_temp_cleanup(
  p_request_id uuid,
  p_claim_token uuid
)
returns table (
  status text,
  affected_count bigint,
  finalized_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_candidate_id text := 'enquiry-upload:event-photo:' || p_request_id::text;
  changed_count bigint := 0;
  completion_time timestamptz := clock_timestamp();
begin
  perform 1
  from public.privacy_retention_deletion_claims as claim
  where claim.candidate_id = target_candidate_id
    and claim.claim_token = p_claim_token
    and claim.state = 'external-delete'
    and claim.irreversible_started = true
  for update;

  if not found then
    raise exception using
      errcode = '42501',
      message = 'A matching event-photo cleanup claim is required';
  end if;

  perform set_config(
    'app.privacy_retention_claim_token',
    p_claim_token::text,
    true
  );

  update public.event_photo_requests
  set
    temp_image_bucket = null,
    temp_image_paths = '{}',
    image_filenames = '{}',
    image_mime_types = '{}',
    image_sizes = '{}',
    files_deleted_at = completion_time,
    upload_retention_due_at = null,
    telegram_status = case
      when telegram_status = 'pending' then 'failed'
      else telegram_status
    end,
    telegram_error = case
      when telegram_status = 'sent' then telegram_error
      when telegram_error is null
        then 'Temporary uploaded files were removed after 24 hours.'
      else telegram_error
    end
  where id = p_request_id
    and legal_hold = false
    and files_deleted_at is null;
  get diagnostics changed_count = row_count;

  update public.privacy_retention_deletion_claims as claim
  set
    state = 'finalized',
    claim_token = null,
    lease_expires_at = null,
    last_error_code = null,
    terminal_outcome = case when changed_count = 1 then 'deleted' else 'skipped' end,
    affected_count = changed_count,
    finalized_at = completion_time,
    updated_at = completion_time
  where claim.candidate_id = target_candidate_id
    and claim.claim_token = p_claim_token
    and claim.state = 'external-delete';

  if not found then
    raise exception 'RETENTION_CLAIM_FINALIZE_COUNT_MISMATCH';
  end if;

  return query select
    case when changed_count = 1 then 'deleted' else 'skipped' end,
    changed_count,
    completion_time;
end;
$$;

create or replace function public.list_referenced_event_photo_temp_paths()
returns table (
  temp_image_path text
)
language sql
security invoker
set search_path = ''
as $$
  select distinct path
  from public.event_photo_requests as request
  cross join lateral unnest(
    coalesce(request.temp_image_paths, '{}'::text[])
  ) as path
  where request.temp_image_bucket = 'event-photo-temp-uploads'
    and nullif(btrim(path), '') is not null
$$;

create or replace function public.set_privacy_retention_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.updated_at is not distinct from old.updated_at then
    new.updated_at = clock_timestamp();
  end if;

  return new;
end;
$$;

create or replace function public.set_privacy_retention_run_completed_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.status in ('completed', 'partial', 'failed') then
    if tg_op = 'INSERT' then
      new.completed_at := clock_timestamp();
    elsif new.completed_at is null then
      new.completed_at := clock_timestamp();
    end if;
  else
    new.completed_at := null;
  end if;

  return new;
end;
$$;

create or replace function public.protect_privacy_retention_run_audit()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  authorized_run_id text := nullif(
    current_setting('app.privacy_retention_audit_run', true),
    ''
  );
begin
  if tg_op = 'DELETE' then
    raise exception using
      errcode = '42501',
      message = 'Privacy-retention run audit rows are append-safe';
  end if;

  if authorized_run_id <> old.id::text
    or old.status <> 'running'
    or new.status not in ('completed', 'partial', 'failed')
    or (
      to_jsonb(new) - array[
        'status',
        'succeeded_count',
        'skipped_count',
        'failed_count',
        'completed_at',
        'updated_at'
      ]
    ) <> (
      to_jsonb(old) - array[
        'status',
        'succeeded_count',
        'skipped_count',
        'failed_count',
        'completed_at',
        'updated_at'
      ]
    )
  then
    raise exception using
      errcode = '42501',
      message = 'Privacy-retention run audit mutation requires its controlled transition';
  end if;

  return new;
end;
$$;

create or replace function public.protect_privacy_retention_action_audit()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  authorized_action_id text := nullif(
    current_setting('app.privacy_retention_audit_action', true),
    ''
  );
begin
  if tg_op = 'DELETE' then
    raise exception using
      errcode = '42501',
      message = 'Privacy-retention action audit rows are append-safe';
  end if;

  if authorized_action_id <> old.id::text
    or old.outcome <> 'pending'
    or new.outcome not in ('deleted', 'skipped', 'failed')
    or (
      to_jsonb(new) - array['outcome', 'error_code', 'occurred_at']
    ) <> (
      to_jsonb(old) - array['outcome', 'error_code', 'occurred_at']
    )
  then
    raise exception using
      errcode = '42501',
      message = 'Privacy-retention action audit mutation requires its controlled transition';
  end if;

  return new;
end;
$$;

create or replace function public.prevent_privacy_retention_hold_event_mutation()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception using
    errcode = '42501',
    message = 'Privacy-retention legal-hold events are append-only';
end;
$$;

create or replace function public.create_privacy_retention_run(
  p_run_reference text,
  p_run_mode text,
  p_initiator text,
  p_selected_categories text[],
  p_candidate_count integer,
  p_selected_count integer,
  p_reviewed_schedule boolean,
  p_reviewed_external_systems boolean
)
returns table (
  run_id uuid,
  recovered boolean,
  run_status text,
  started_at timestamptz,
  completed_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_run public.privacy_retention_runs%rowtype;
  initial_status text := case when p_run_mode = 'manual' then 'running' else 'completed' end;
  server_time timestamptz := clock_timestamp();
begin
  if p_run_mode = 'manual' and nullif(
    current_setting('app.privacy_retention_manual_initialization', true),
    ''
  ) is distinct from p_run_reference then
    raise exception 'RETENTION_MANUAL_RUN_REQUIRES_ATOMIC_ACTIONS';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended('privacy-retention-run:' || coalesce(p_run_reference, ''), 0)
  );

  select run.* into selected_run
  from public.privacy_retention_runs as run
  where run.run_reference = p_run_reference
  for update;

  if found then
    if selected_run.run_mode is distinct from p_run_mode
      or selected_run.initiator is distinct from p_initiator
      or selected_run.selected_categories is distinct from p_selected_categories
      or selected_run.candidate_count is distinct from p_candidate_count
      or selected_run.selected_count is distinct from p_selected_count
      or selected_run.reviewed_schedule is distinct from p_reviewed_schedule
      or selected_run.reviewed_external_systems is distinct from p_reviewed_external_systems
    then
      raise exception 'RETENTION_RUN_REFERENCE_CONFLICT';
    end if;

    return query select
      selected_run.id,
      true,
      selected_run.status,
      selected_run.started_at,
      selected_run.completed_at;
    return;
  end if;

  insert into public.privacy_retention_runs (
    run_reference,
    run_mode,
    status,
    initiator,
    selected_categories,
    candidate_count,
    selected_count,
    reviewed_schedule,
    reviewed_external_systems,
    started_at,
    completed_at,
    updated_at
  ) values (
    p_run_reference,
    p_run_mode,
    initial_status,
    p_initiator,
    p_selected_categories,
    p_candidate_count,
    p_selected_count,
    p_reviewed_schedule,
    p_reviewed_external_systems,
    server_time,
    case when initial_status = 'completed' then server_time else null end,
    server_time
  )
  returning * into selected_run;

  return query select
    selected_run.id,
    false,
    selected_run.status,
    selected_run.started_at,
    selected_run.completed_at;
end;
$$;

create or replace function public.create_privacy_retention_actions(
  p_run_id uuid,
  p_actions jsonb
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted_count bigint := 0;
  selected_run public.privacy_retention_runs%rowtype;
begin
  if jsonb_typeof(p_actions) <> 'array'
    or jsonb_array_length(p_actions) not between 1 and 100
  then
    raise exception 'RETENTION_ACTIONS_INVALID';
  end if;

  select run.* into selected_run
  from public.privacy_retention_runs as run
  where run.id = p_run_id
  for update;
  if not found
    or selected_run.run_mode <> 'manual'
  then
    raise exception 'RETENTION_RUN_NOT_EXECUTABLE';
  end if;

  if nullif(
    current_setting('app.privacy_retention_manual_initialization', true),
    ''
  ) is distinct from selected_run.run_reference then
    raise exception 'RETENTION_ACTIONS_REQUIRE_ATOMIC_INITIALIZATION';
  end if;

  if selected_run.status = 'running' then
    insert into public.privacy_retention_actions (
    run_id,
    candidate_id,
    category,
    record_type,
    record_reference,
    due_at,
    snapshot_revision,
    selected,
    action_type,
    outcome
  )
  select
    p_run_id,
    action.candidate_id,
    action.category,
    action.record_type,
    action.record_reference,
    action.due_at,
    action.snapshot_revision,
    true,
    action.action_type,
    'pending'
  from jsonb_to_recordset(p_actions) as action(
    candidate_id text,
    category text,
    record_type text,
    record_reference text,
    due_at timestamptz,
    snapshot_revision text,
    selected boolean,
    action_type text,
    outcome text
  )
    on conflict (run_id, candidate_id) do nothing;
    get diagnostics inserted_count = row_count;
  elsif selected_run.status not in ('completed', 'partial', 'failed') then
    raise exception 'RETENTION_RUN_NOT_EXECUTABLE';
  end if;

  if inserted_count = jsonb_array_length(p_actions) then
    return inserted_count;
  end if;

  if (
    select count(*)
    from public.privacy_retention_actions as existing
    join jsonb_to_recordset(p_actions) as requested(
      candidate_id text,
      category text,
      record_type text,
      record_reference text,
      due_at timestamptz,
      snapshot_revision text,
      selected boolean,
      action_type text,
      outcome text
    ) on requested.candidate_id = existing.candidate_id
    where existing.run_id = p_run_id
      and existing.category = requested.category
      and existing.record_type = requested.record_type
      and existing.record_reference = requested.record_reference
      and existing.due_at = requested.due_at
      and existing.snapshot_revision = requested.snapshot_revision
      and existing.action_type = requested.action_type
      and existing.selected = true
  ) = jsonb_array_length(p_actions) then
    return jsonb_array_length(p_actions);
  end if;

  raise exception 'RETENTION_ACTION_IDENTITY_CONFLICT';
end;
$$;

create or replace function public.create_privacy_retention_manual_run(
  p_run_reference text,
  p_initiator text,
  p_selected_categories text[],
  p_candidate_count integer,
  p_selected_count integer,
  p_actions jsonb
)
returns table (
  run_id uuid,
  recovered boolean,
  run_status text,
  started_at timestamptz,
  completed_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_run record;
  persisted_action_count bigint;
  total_action_count bigint;
  requested_categories text[];
begin
  if jsonb_typeof(p_actions) <> 'array'
    or jsonb_array_length(p_actions) <> p_selected_count
    or p_selected_count not between 1 and 100
  then
    raise exception 'RETENTION_ACTIONS_INVALID';
  end if;

  select array_agg(category order by category)
  into requested_categories
  from (
    select distinct action.category
    from jsonb_to_recordset(p_actions) as action(category text)
  ) as requested;

  if requested_categories is distinct from (
    select array_agg(category order by category)
    from (
      select distinct category
      from unnest(p_selected_categories) as selected_category(category)
    ) as selected
  ) then
    raise exception 'RETENTION_ACTION_CATEGORIES_INVALID';
  end if;

  perform set_config(
    'app.privacy_retention_manual_initialization',
    p_run_reference,
    true
  );
  select * into selected_run
  from public.create_privacy_retention_run(
    p_run_reference,
    'manual',
    p_initiator,
    p_selected_categories,
    p_candidate_count,
    p_selected_count,
    false,
    false
  );

  if selected_run.recovered then
    select count(*) into total_action_count
    from public.privacy_retention_actions as action
    where action.run_id = selected_run.run_id;
    if total_action_count <> p_selected_count then
      raise exception 'RETENTION_RUN_AUDIT_INITIALIZATION_INCOMPLETE';
    end if;
  end if;

  select public.create_privacy_retention_actions(
    selected_run.run_id,
    p_actions
  ) into persisted_action_count;
  if persisted_action_count <> p_selected_count then
    raise exception 'RETENTION_ACTIONS_CREATE_COUNT_MISMATCH';
  end if;

  select count(*) into total_action_count
  from public.privacy_retention_actions as action
  where action.run_id = selected_run.run_id;
  if total_action_count <> p_selected_count then
    raise exception 'RETENTION_ACTIONS_CREATE_COUNT_MISMATCH';
  end if;

  return query select
    selected_run.run_id::uuid,
    selected_run.recovered::boolean,
    selected_run.run_status::text,
    selected_run.started_at::timestamptz,
    selected_run.completed_at::timestamptz;
end;
$$;

create or replace function public.complete_privacy_retention_action(
  p_run_id uuid,
  p_candidate_id text,
  p_outcome text,
  p_error_code text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_action public.privacy_retention_actions%rowtype;
  updated_count bigint := 0;
begin
  if p_outcome not in ('deleted', 'skipped', 'failed')
    or (p_outcome = 'failed' and p_error_code !~ '^[A-Z][A-Z0-9_]{0,63}$')
    or (p_outcome <> 'failed' and p_error_code is not null)
  then
    raise exception 'RETENTION_ACTION_OUTCOME_INVALID';
  end if;

  select action.* into selected_action
  from public.privacy_retention_actions as action
  where action.run_id = p_run_id
    and action.candidate_id = p_candidate_id
  for update;
  if not found then
    raise exception 'RETENTION_ACTION_NOT_FOUND';
  end if;

  if selected_action.outcome <> 'pending' then
    if selected_action.outcome = p_outcome
      and selected_action.error_code is not distinct from p_error_code
    then
      return true;
    end if;
    raise exception 'RETENTION_ACTION_ALREADY_TERMINAL';
  end if;

  if exists (
    select 1
    from public.privacy_retention_deletion_claims as claim
    where claim.action_id = selected_action.id
      and claim.run_id = selected_action.run_id
      and claim.state <> 'finalized'
  ) then
    raise exception 'RETENTION_CLAIM_RETRY_REQUIRED';
  end if;

  perform set_config(
    'app.privacy_retention_audit_action',
    selected_action.id::text,
    true
  );
  update public.privacy_retention_actions
  set
    outcome = p_outcome,
    error_code = p_error_code,
    occurred_at = clock_timestamp()
  where id = selected_action.id
    and outcome = 'pending';
  get diagnostics updated_count = row_count;
  if updated_count <> 1 then
    raise exception 'RETENTION_ACTION_UPDATE_COUNT_MISMATCH';
  end if;
  return true;
end;
$$;

create or replace function public.complete_privacy_retention_run(
  p_run_id uuid,
  p_status text,
  p_succeeded_count integer,
  p_skipped_count integer,
  p_failed_count integer
)
returns table (
  completed boolean,
  completed_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_run public.privacy_retention_runs%rowtype;
  actual_succeeded integer;
  actual_skipped integer;
  actual_failed integer;
  actual_pending integer;
  completion_time timestamptz := clock_timestamp();
  updated_count bigint := 0;
begin
  if p_status not in ('completed', 'partial', 'failed')
    or least(p_succeeded_count, p_skipped_count, p_failed_count) < 0
  then
    raise exception 'RETENTION_RUN_OUTCOME_INVALID';
  end if;

  select run.* into selected_run
  from public.privacy_retention_runs as run
  where run.id = p_run_id
  for update;
  if not found then
    raise exception 'RETENTION_RUN_NOT_FOUND';
  end if;

  if selected_run.status <> 'running' then
    if selected_run.status = p_status
      and selected_run.succeeded_count = p_succeeded_count
      and selected_run.skipped_count = p_skipped_count
      and selected_run.failed_count = p_failed_count
      and selected_run.completed_at is not null
    then
      return query select true, selected_run.completed_at;
      return;
    end if;
    raise exception 'RETENTION_RUN_ALREADY_TERMINAL';
  end if;

  select
    count(*) filter (where action.outcome = 'deleted'),
    count(*) filter (where action.outcome = 'skipped'),
    count(*) filter (where action.outcome = 'failed'),
    count(*) filter (where action.outcome = 'pending')
  into actual_succeeded, actual_skipped, actual_failed, actual_pending
  from public.privacy_retention_actions as action
  where action.run_id = p_run_id;

  if actual_pending <> 0
    or actual_succeeded <> p_succeeded_count
    or actual_skipped <> p_skipped_count
    or actual_failed <> p_failed_count
    or actual_succeeded + actual_skipped + actual_failed <>
      selected_run.selected_count
  then
    raise exception 'RETENTION_RUN_COUNTS_MISMATCH';
  end if;

  if (
    p_status = 'completed'
    and (actual_skipped <> 0 or actual_failed <> 0)
  ) or (
    p_status = 'failed'
    and (
      actual_failed = 0
      or actual_succeeded <> 0
      or actual_skipped <> 0
    )
  ) or (
    p_status = 'partial'
    and not (
      actual_skipped > 0
      or (actual_failed > 0 and actual_succeeded > 0)
    )
  ) then
    raise exception 'RETENTION_RUN_STATUS_MISMATCH';
  end if;

  perform set_config(
    'app.privacy_retention_audit_run',
    selected_run.id::text,
    true
  );
  update public.privacy_retention_runs
  set
    status = p_status,
    succeeded_count = p_succeeded_count,
    skipped_count = p_skipped_count,
    failed_count = p_failed_count,
    completed_at = completion_time,
    updated_at = completion_time
  where id = p_run_id
    and status = 'running';
  get diagnostics updated_count = row_count;
  if updated_count <> 1 then
    raise exception 'RETENTION_RUN_UPDATE_COUNT_MISMATCH';
  end if;

  return query select true, completion_time;
end;
$$;

drop trigger if exists set_contact_enquiries_updated_at
  on public.contact_enquiries;

create trigger set_contact_enquiries_updated_at
before update on public.contact_enquiries
for each row
execute function public.set_privacy_retention_updated_at();

drop trigger if exists set_custom_cake_enquiries_updated_at
  on public.custom_cake_enquiries;

create trigger set_custom_cake_enquiries_updated_at
before update on public.custom_cake_enquiries
for each row
execute function public.set_privacy_retention_updated_at();

drop trigger if exists set_workshop_enquiries_updated_at
  on public.workshop_enquiries;

create trigger set_workshop_enquiries_updated_at
before update on public.workshop_enquiries
for each row
execute function public.set_privacy_retention_updated_at();

drop trigger if exists set_event_photo_requests_updated_at
  on public.event_photo_requests;

create trigger set_event_photo_requests_updated_at
before update on public.event_photo_requests
for each row
execute function public.set_privacy_retention_updated_at();

drop trigger if exists protect_privacy_retention_run_audit
  on public.privacy_retention_runs;

create trigger protect_privacy_retention_run_audit
before update or delete on public.privacy_retention_runs
for each row execute function public.protect_privacy_retention_run_audit();

drop trigger if exists protect_privacy_retention_action_audit
  on public.privacy_retention_actions;

create trigger protect_privacy_retention_action_audit
before update or delete on public.privacy_retention_actions
for each row execute function public.protect_privacy_retention_action_audit();

drop trigger if exists prevent_privacy_retention_hold_event_mutation
  on public.privacy_retention_hold_events;

create trigger prevent_privacy_retention_hold_event_mutation
before update or delete on public.privacy_retention_hold_events
for each row execute function public.prevent_privacy_retention_hold_event_mutation();

drop trigger if exists set_privacy_retention_runs_updated_at
  on public.privacy_retention_runs;

create trigger set_privacy_retention_runs_updated_at
before update on public.privacy_retention_runs
for each row
execute function public.set_privacy_retention_updated_at();

drop trigger if exists set_privacy_retention_security_holds_updated_at
  on public.privacy_retention_security_holds;

create trigger set_privacy_retention_security_holds_updated_at
before update on public.privacy_retention_security_holds
for each row
execute function public.set_privacy_retention_updated_at();

drop trigger if exists set_privacy_retention_deletion_claims_updated_at
  on public.privacy_retention_deletion_claims;

create trigger set_privacy_retention_deletion_claims_updated_at
before update on public.privacy_retention_deletion_claims
for each row
execute function public.set_privacy_retention_updated_at();

drop trigger if exists set_privacy_retention_run_completed_at
  on public.privacy_retention_runs;

create trigger set_privacy_retention_run_completed_at
before insert or update of status on public.privacy_retention_runs
for each row
execute function public.set_privacy_retention_run_completed_at();

alter table public.privacy_retention_runs enable row level security;
alter table public.privacy_retention_actions enable row level security;
alter table public.privacy_retention_security_holds enable row level security;
alter table public.privacy_retention_deletion_claims enable row level security;
alter table public.privacy_retention_hold_events enable row level security;

revoke all on table public.contact_enquiries
  from public, anon, authenticated;

revoke all on table public.custom_cake_enquiries
  from public, anon, authenticated;

revoke all on table public.workshop_enquiries
  from public, anon, authenticated;

revoke all on table public.event_photo_requests
  from public, anon, authenticated;

revoke all on table public.orders
  from public, anon, authenticated;

revoke all on table public.privacy_retention_runs
  from public, anon, authenticated;

revoke all on table public.privacy_retention_actions
  from public, anon, authenticated;

revoke all on table public.privacy_retention_security_holds
  from public, anon, authenticated;

revoke all on table public.privacy_retention_deletion_claims
  from public, anon, authenticated;

revoke all on table public.privacy_retention_hold_events
  from public, anon, authenticated;

grant select on table public.privacy_retention_runs
  to service_role;

grant select on table public.privacy_retention_actions
  to service_role;

grant select on table public.privacy_retention_security_holds
  to service_role;

grant select on table public.privacy_retention_deletion_claims
  to service_role;

grant select on table public.privacy_retention_hold_events
  to service_role;

revoke all on function public.set_future_order_retention_lifecycle()
  from public, anon, authenticated;

grant execute on function public.set_future_order_retention_lifecycle()
  to service_role;

revoke all on function public.protect_terminal_order_retention_lifecycle()
  from public, anon, authenticated;

grant execute on function public.protect_terminal_order_retention_lifecycle()
  to service_role;

revoke all on function public.prevent_held_order_bundle_deletion()
  from public, anon, authenticated;

grant execute on function public.prevent_held_order_bundle_deletion()
  to service_role;

revoke all on function public.prevent_held_converted_upload_redaction()
  from public, anon, authenticated;

grant execute on function public.prevent_held_converted_upload_redaction()
  to service_role;

revoke all on function public.close_event_photo_request_after_file_cleanup()
  from public, anon, authenticated;

grant execute on function public.close_event_photo_request_after_file_cleanup()
  to service_role;

revoke all on function public.redact_order_uploaded_files(uuid)
  from public, anon, authenticated;

grant execute on function public.redact_order_uploaded_files(uuid)
  to service_role;

revoke all on function public.delete_expired_privacy_security_records(text, timestamptz)
  from public, anon, authenticated;

grant execute on function public.delete_expired_privacy_security_records(text, timestamptz)
  to service_role;

revoke all on function public.assert_privacy_retention_mutation_allowed(text[])
  from public, anon, authenticated;

grant execute on function public.assert_privacy_retention_mutation_allowed(text[])
  to service_role;

revoke all on function public.prevent_claimed_enquiry_mutation()
  from public, anon, authenticated;

grant execute on function public.prevent_claimed_enquiry_mutation()
  to service_role;

revoke all on function public.prevent_claimed_order_mutation()
  from public, anon, authenticated;

grant execute on function public.prevent_claimed_order_mutation()
  to service_role;

revoke all on function public.prevent_claimed_order_child_mutation()
  from public, anon, authenticated;

grant execute on function public.prevent_claimed_order_child_mutation()
  to service_role;

revoke all on function public.prevent_claimed_security_hold_mutation()
  from public, anon, authenticated;

grant execute on function public.prevent_claimed_security_hold_mutation()
  to service_role;

revoke all on function public.require_privacy_retention_claim_for_parent_delete()
  from public, anon, authenticated;

grant execute on function public.require_privacy_retention_claim_for_parent_delete()
  to service_role;

revoke all on function public.prevent_held_retention_record_mutation()
  from public, anon, authenticated;

grant execute on function public.prevent_held_retention_record_mutation()
  to service_role;

revoke all on function public.prevent_held_order_child_mutation()
  from public, anon, authenticated;

grant execute on function public.prevent_held_order_child_mutation()
  to service_role;

revoke all on function public.protect_privacy_retention_security_evidence()
  from public, anon, authenticated;

grant execute on function public.protect_privacy_retention_security_evidence()
  to service_role;

revoke all on function public.claim_privacy_retention_candidate(text, uuid, timestamptz)
  from public, anon, authenticated;

grant execute on function public.claim_privacy_retention_candidate(text, uuid, timestamptz)
  to service_role;

revoke all on function public.claim_event_photo_temp_cleanup(uuid, timestamptz)
  from public, anon, authenticated;

grant execute on function public.claim_event_photo_temp_cleanup(uuid, timestamptz)
  to service_role;

revoke all on function public.begin_privacy_retention_external_deletion(text, uuid, text, text[])
  from public, anon, authenticated;

grant execute on function public.begin_privacy_retention_external_deletion(text, uuid, text, text[])
  to service_role;

revoke all on function public.release_privacy_retention_deletion_claim(text, uuid, text)
  from public, anon, authenticated;

grant execute on function public.release_privacy_retention_deletion_claim(text, uuid, text)
  to service_role;

revoke all on function public.set_privacy_retention_legal_hold(text, boolean, text, timestamptz)
  from public, anon, authenticated;

grant execute on function public.set_privacy_retention_legal_hold(text, boolean, text, timestamptz)
  to service_role;

revoke all on function public.get_privacy_retention_legal_hold(text)
  from public, anon, authenticated;

grant execute on function public.get_privacy_retention_legal_hold(text)
  to service_role;

revoke all on function public.finalize_privacy_retention_deletion(text, uuid, timestamptz)
  from public, anon, authenticated;

grant execute on function public.finalize_privacy_retention_deletion(text, uuid, timestamptz)
  to service_role;

revoke all on function public.finalize_event_photo_temp_cleanup(uuid, uuid)
  from public, anon, authenticated;

grant execute on function public.finalize_event_photo_temp_cleanup(uuid, uuid)
  to service_role;

revoke all on function public.list_referenced_event_photo_temp_paths()
  from public, anon, authenticated;

grant execute on function public.list_referenced_event_photo_temp_paths()
  to service_role;

revoke all on function public.set_privacy_retention_updated_at()
  from public, anon, authenticated;

grant execute on function public.set_privacy_retention_updated_at()
  to service_role;

revoke all on function public.set_privacy_retention_run_completed_at()
  from public, anon, authenticated;

grant execute on function public.set_privacy_retention_run_completed_at()
  to service_role;

revoke all on function public.privacy_retention_order_storage_references(uuid)
  from public, anon, authenticated;

revoke all on function public.privacy_retention_order_storage_references_are_unambiguous(uuid)
  from public, anon, authenticated;

revoke all on function public.privacy_retention_storage_reference_owners(text)
  from public, anon, authenticated;

revoke all on function public.protect_privacy_retention_run_audit()
  from public, anon, authenticated;

revoke all on function public.protect_privacy_retention_action_audit()
  from public, anon, authenticated;

revoke all on function public.prevent_privacy_retention_hold_event_mutation()
  from public, anon, authenticated;

revoke all on function public.create_privacy_retention_run(
  text, text, text, text[], integer, integer, boolean, boolean
)
  from public, anon, authenticated;

grant execute on function public.create_privacy_retention_run(
  text, text, text, text[], integer, integer, boolean, boolean
)
  to service_role;

revoke all on function public.create_privacy_retention_actions(uuid, jsonb)
  from public, anon, authenticated, service_role;

revoke all on function public.create_privacy_retention_manual_run(
  text, text, text[], integer, integer, jsonb
)
  from public, anon, authenticated;

grant execute on function public.create_privacy_retention_manual_run(
  text, text, text[], integer, integer, jsonb
)
  to service_role;

revoke all on function public.complete_privacy_retention_action(uuid, text, text, text)
  from public, anon, authenticated;

grant execute on function public.complete_privacy_retention_action(uuid, text, text, text)
  to service_role;

revoke all on function public.complete_privacy_retention_run(
  uuid, text, integer, integer, integer
)
  from public, anon, authenticated;

grant execute on function public.complete_privacy_retention_run(
  uuid, text, integer, integer, integer
)
  to service_role;

create table if not exists public.privacy_retention_lifecycle_events (
  id uuid primary key default gen_random_uuid(),
  record_type text not null check (record_type in ('order', 'enquiry', 'event-photo')),
  record_id text not null,
  record_reference text not null,
  action text not null check (action in (
    'terminal-date-recorded',
    'event-closed',
    'enquiry-contact-recorded',
    'enquiry-closed',
    'enquiry-reopened',
    'enquiry-converted'
  )),
  effective_on date not null,
  evidence_basis text not null check (
    evidence_basis in (
      'order-status-record',
      'payment-provider-record',
      'invoice-accounting-record',
      'customer-correspondence',
      'server-action'
    )
  ),
  recorded_at timestamptz not null default clock_timestamp()
);

create index if not exists privacy_retention_lifecycle_events_record_idx
  on public.privacy_retention_lifecycle_events (record_type, record_id, recorded_at desc);

alter table public.privacy_retention_lifecycle_events enable row level security;

create or replace function public.prevent_privacy_retention_lifecycle_event_mutation()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception using
    errcode = '42501',
    message = 'Privacy-retention lifecycle evidence is append-only';
end;
$$;

drop trigger if exists prevent_privacy_retention_lifecycle_event_mutation
  on public.privacy_retention_lifecycle_events;

create trigger prevent_privacy_retention_lifecycle_event_mutation
before update or delete on public.privacy_retention_lifecycle_events
for each row execute function public.prevent_privacy_retention_lifecycle_event_mutation();

create or replace function public.record_order_retention_completion(
  p_order_reference text,
  p_effective_on date,
  p_evidence_basis text,
  p_confirmation text
)
returns table (
  status text,
  completed_at text,
  financial_year_ended_at text,
  retention_due_at text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_order public.orders%rowtype;
  effective_timestamp timestamptz;
  selected_financial_year_end date;
  selected_retention_due_at timestamptz;
  effective_year integer;
  uk_today date := (clock_timestamp() at time zone 'Europe/London')::date;
begin
  if p_order_reference is null
    or char_length(btrim(p_order_reference)) not between 1 and 128
  then
    raise exception 'RETENTION_ORDER_NOT_FOUND';
  end if;

  if p_effective_on is null then
    raise exception 'RETENTION_ORDER_COMPLETION_DATE_INVALID';
  end if;

  if p_evidence_basis is null or p_evidence_basis not in (
      'order-status-record',
      'payment-provider-record',
      'invoice-accounting-record',
      'customer-correspondence'
    )
  then
    raise exception 'RETENTION_ORDER_EVIDENCE_INVALID';
  end if;

  select orders.*
  into selected_order
  from public.orders as orders
  where orders.id::text = btrim(p_order_reference)
    or orders.order_number = btrim(p_order_reference)
  order by case when orders.id::text = btrim(p_order_reference) then 0 else 1 end
  limit 1
  for update;

  if not found then
    raise exception 'RETENTION_ORDER_NOT_FOUND';
  end if;

  if p_confirmation is distinct from 'SET RETENTION ' || selected_order.order_number then
    raise exception 'RETENTION_ORDER_CONFIRMATION_INVALID';
  end if;

  if selected_order.legal_hold then
    raise exception 'RETENTION_ORDER_LEGAL_HOLD_ACTIVE';
  end if;

  if exists (
    select 1 from public.contact_enquiries
    where converted_order_id = selected_order.id
      and lifecycle_status = 'converted'
      and legal_hold = true
    union all
    select 1 from public.custom_cake_enquiries
    where converted_order_id = selected_order.id
      and lifecycle_status = 'converted'
      and legal_hold = true
    union all
    select 1 from public.workshop_enquiries
    where converted_order_id = selected_order.id
      and lifecycle_status = 'converted'
      and legal_hold = true
  ) then
    raise exception 'RETENTION_ORDER_LEGAL_HOLD_ACTIVE';
  end if;

  if exists (
    select 1
    from public.privacy_retention_deletion_claims as claim
    where claim.state <> 'finalized'
      and (
        claim.candidate_id in (
          'order:' || selected_order.id::text,
          'order-upload:' || selected_order.id::text,
          'health:order:' || selected_order.id::text
        )
        or claim.candidate_id in (
          select 'enquiry-upload:custom-cake:' || enquiry.id::text
          from public.custom_cake_enquiries as enquiry
          where enquiry.converted_order_id = selected_order.id
            and enquiry.lifecycle_status = 'converted'
          union all
          select 'health:enquiry:contact:' || enquiry.id::text
          from public.contact_enquiries as enquiry
          where enquiry.converted_order_id = selected_order.id
            and enquiry.lifecycle_status = 'converted'
          union all
          select 'health:enquiry:custom-cake:' || enquiry.id::text
          from public.custom_cake_enquiries as enquiry
          where enquiry.converted_order_id = selected_order.id
            and enquiry.lifecycle_status = 'converted'
          union all
          select 'health:enquiry:workshop:' || enquiry.id::text
          from public.workshop_enquiries as enquiry
          where enquiry.converted_order_id = selected_order.id
            and enquiry.lifecycle_status = 'converted'
        )
      )
  ) then
    raise exception 'RETENTION_DELETION_CLAIM_ACTIVE';
  end if;

  if selected_order.status not in ('completed', 'delivered', 'cancelled') then
    raise exception 'RETENTION_ORDER_NOT_TERMINAL';
  end if;

  if p_effective_on < (selected_order.created_at at time zone 'Europe/London')::date
    or p_effective_on > uk_today
  then
    raise exception 'RETENTION_ORDER_COMPLETION_DATE_INVALID';
  end if;

  if selected_order.completed_at is not null
    or selected_order.financial_year_ended_at is not null
    or selected_order.retention_due_at is not null
  then
    if selected_order.completed_at is not null
      and (selected_order.completed_at at time zone 'Europe/London')::date = p_effective_on
      and selected_order.financial_year_ended_at is not null
      and selected_order.retention_due_at is not null
    then
      return query select
        'already-recorded'::text,
        selected_order.completed_at::text,
        selected_order.financial_year_ended_at::text,
        selected_order.retention_due_at::text;
      return;
    end if;

    raise exception 'RETENTION_ORDER_ALREADY_RECORDED';
  end if;

  effective_year := extract(year from p_effective_on)::integer;
  selected_financial_year_end := case
    when p_effective_on <= make_date(effective_year, 4, 5)
      then make_date(effective_year, 4, 5)
    else make_date(effective_year + 1, 4, 5)
  end;
  effective_timestamp := p_effective_on::timestamp at time zone 'Europe/London';
  selected_retention_due_at := (
    selected_financial_year_end + interval '6 years' + interval '1 day'
  ) at time zone 'Europe/London';

  perform set_config(
    'app.privacy_retention_lifecycle_mutation',
    'order:' || selected_order.id::text,
    true
  );

  update public.orders
  set
    completed_at = effective_timestamp,
    financial_year_ended_at = selected_financial_year_end,
    retention_due_at = selected_retention_due_at
  where id = selected_order.id;

  update public.contact_enquiries
  set retention_due_at = selected_retention_due_at
  where converted_order_id = selected_order.id
    and lifecycle_status = 'converted';

  update public.custom_cake_enquiries
  set
    retention_due_at = selected_retention_due_at,
    upload_retention_due_at = effective_timestamp + interval '24 months'
  where converted_order_id = selected_order.id
    and lifecycle_status = 'converted';

  update public.workshop_enquiries
  set retention_due_at = selected_retention_due_at
  where converted_order_id = selected_order.id
    and lifecycle_status = 'converted';

  insert into public.privacy_retention_lifecycle_events (
    record_type,
    record_id,
    record_reference,
    action,
    effective_on,
    evidence_basis
  ) values (
    'order',
    selected_order.id::text,
    selected_order.order_number,
    'terminal-date-recorded',
    p_effective_on,
    p_evidence_basis
  );

  return query select
    'updated'::text,
    effective_timestamp::text,
    selected_financial_year_end::text,
    selected_retention_due_at::text;
end;
$$;

revoke all on table public.privacy_retention_lifecycle_events
  from public, anon, authenticated;

grant select on table public.privacy_retention_lifecycle_events
  to service_role;

revoke all on function public.prevent_privacy_retention_lifecycle_event_mutation()
  from public, anon, authenticated;

grant execute on function public.prevent_privacy_retention_lifecycle_event_mutation()
  to service_role;

revoke all on function public.record_order_retention_completion(text, date, text, text)
  from public, anon, authenticated;

grant execute on function public.record_order_retention_completion(text, date, text, text)
  to service_role;

create or replace function public.close_event_photo_retention_lifecycle(
  p_request_id uuid,
  p_confirmation text
)
returns table (
  status text,
  closed_at timestamptz,
  retention_due_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_request public.event_photo_requests%rowtype;
  server_time timestamptz := clock_timestamp();
  selected_retention_due_at timestamptz;
begin
  if p_request_id is null then
    raise exception 'RETENTION_EVENT_NOT_FOUND';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(
      'privacy-retention-candidate:enquiry:event-photo:' || p_request_id::text,
      0
    )
  );
  perform pg_advisory_xact_lock(
    hashtextextended(
      'privacy-retention-candidate:enquiry-upload:event-photo:' || p_request_id::text,
      0
    )
  );

  select request.* into selected_request
  from public.event_photo_requests as request
  where request.id = p_request_id
  for update;
  if not found then
    raise exception 'RETENTION_EVENT_NOT_FOUND';
  end if;

  if p_confirmation is distinct from 'CLOSE EVENT ' || p_request_id::text then
    raise exception 'RETENTION_EVENT_CONFIRMATION_INVALID';
  end if;
  if selected_request.lifecycle_status = 'closed' then
    raise exception 'RETENTION_EVENT_ALREADY_CLOSED';
  end if;
  if selected_request.legal_hold then
    raise exception 'RETENTION_EVENT_LEGAL_HOLD_ACTIVE';
  end if;
  if exists (
    select 1
    from public.privacy_retention_deletion_claims as claim
    where claim.candidate_id in (
      'enquiry:event-photo:' || p_request_id::text,
      'enquiry-upload:event-photo:' || p_request_id::text
    )
      and claim.state <> 'finalized'
  ) then
    raise exception 'RETENTION_EVENT_DELETION_CLAIM_ACTIVE';
  end if;

  selected_retention_due_at := server_time + interval '24 months';
  update public.event_photo_requests
  set
    lifecycle_status = 'closed',
    last_contacted_at = server_time,
    closed_at = server_time,
    retention_due_at = selected_retention_due_at,
    upload_retention_due_at = case
      when coalesce(array_length(temp_image_paths, 1), 0) > 0
        then server_time + interval '24 months'
      else null
    end
  where id = p_request_id
    and lifecycle_status <> 'closed'
    and legal_hold = false;
  if not found then
    raise exception 'RETENTION_EVENT_UPDATE_FAILED';
  end if;

  insert into public.privacy_retention_lifecycle_events (
    record_type,
    record_id,
    record_reference,
    action,
    effective_on,
    evidence_basis
  ) values (
    'event-photo',
    p_request_id::text,
    'event-photo-' || p_request_id::text,
    'event-closed',
    (server_time at time zone 'Europe/London')::date,
    'server-action'
  );

  return query select
    'closed'::text,
    server_time,
    selected_retention_due_at;
end;
$$;

revoke all on function public.close_event_photo_retention_lifecycle(uuid, text)
  from public, anon, authenticated;

grant execute on function public.close_event_photo_retention_lifecycle(uuid, text)
  to service_role;
