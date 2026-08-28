-- Allow an administrator to recover from one narrowly-defined crash state:
-- an expired, reversible deletion claim that otherwise prevents a legal hold.
-- The claim release, hold placement and content-free audit event are one
-- transaction. Claim tokens never leave this SECURITY DEFINER function.

create table if not exists public.privacy_retention_claim_recovery_events (
  id uuid primary key default gen_random_uuid(),
  candidate_id text not null,
  record_reference text not null,
  run_id uuid,
  action_id uuid,
  previous_claim_state text not null,
  previous_claim_lease_expires_at timestamptz not null,
  hold_reason text not null,
  hold_review_at timestamptz not null,
  recovered_at timestamptz not null default clock_timestamp(),
  constraint privacy_retention_claim_recovery_events_run_fkey
    foreign key (run_id)
    references public.privacy_retention_runs (id)
    on delete restrict,
  constraint privacy_retention_claim_recovery_events_action_fkey
    foreign key (action_id)
    references public.privacy_retention_actions (id)
    on delete restrict,
  constraint privacy_retention_claim_recovery_events_candidate_check check (
    char_length(candidate_id) between 1 and 160
    and candidate_id ~ '^[A-Za-z0-9][A-Za-z0-9._:/-]*$'
  ),
  constraint privacy_retention_claim_recovery_events_reference_check check (
    char_length(record_reference) between 1 and 128
    and record_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:/-]*$'
  ),
  constraint privacy_retention_claim_recovery_events_action_identity_check check (
    (run_id is null and action_id is null)
    or (run_id is not null and action_id is not null)
  ),
  constraint privacy_retention_claim_recovery_events_state_check check (
    previous_claim_state = 'claimed'
  ),
  constraint privacy_retention_claim_recovery_events_reason_check check (
    hold_reason in (
      'active-complaint',
      'legal-claim',
      'regulatory-request',
      'fraud-investigation',
      'other-necessary-hold'
    )
  ),
  constraint privacy_retention_claim_recovery_events_time_check check (
    previous_claim_lease_expires_at <= recovered_at
    and hold_review_at > recovered_at
  )
);

create index if not exists privacy_retention_claim_recovery_events_candidate_idx
  on public.privacy_retention_claim_recovery_events (
    candidate_id,
    recovered_at desc
  );

alter table public.privacy_retention_claim_recovery_events enable row level security;

drop trigger if exists prevent_privacy_retention_claim_recovery_event_mutation
  on public.privacy_retention_claim_recovery_events;

create trigger prevent_privacy_retention_claim_recovery_event_mutation
before update or delete on public.privacy_retention_claim_recovery_events
for each row execute function public.prevent_privacy_retention_hold_event_mutation();

create or replace function public.place_privacy_retention_legal_hold_with_claim_recovery(
  p_candidate_id text,
  p_reason text,
  p_review_at timestamptz,
  p_confirmation text
)
returns table (
  status text,
  record_reference text,
  claim_recovered boolean,
  hold_review_at timestamptz,
  recovered_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_claim public.privacy_retention_deletion_claims%rowtype;
  selected_hold record;
  placed_hold record;
  claim_released boolean := false;
  recovery_time timestamptz;
begin
  if p_candidate_id is null
    or char_length(p_candidate_id) not between 1 and 160
    or p_candidate_id !~ '^[A-Za-z0-9][A-Za-z0-9._:/-]*$'
  then
    raise exception 'RETENTION_HOLD_RECOVERY_CANDIDATE_INVALID';
  end if;

  if p_reason is null
    or p_reason not in (
      'active-complaint',
      'legal-claim',
      'regulatory-request',
      'fraud-investigation',
      'other-necessary-hold'
    )
    or p_review_at is null
    or p_review_at <= clock_timestamp()
  then
    raise exception 'RETENTION_HOLD_REVIEW_DATE_INVALID';
  end if;

  if p_confirmation is null
    or char_length(p_confirmation) not between 1 and 220
  then
    raise exception 'RETENTION_CONFIRMATION_INVALID';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended('privacy-retention-candidate:' || p_candidate_id, 0)
  );

  select * into selected_hold
  from public.get_privacy_retention_legal_hold(p_candidate_id);

  if not found
    or not coalesce(selected_hold.found, false)
    or selected_hold.record_reference is null
  then
    raise exception 'RETENTION_RECORD_NOT_FOUND';
  end if;

  if p_confirmation <>
    'RECOVER CLAIM AND HOLD ' || selected_hold.record_reference
  then
    raise exception 'RETENTION_CONFIRMATION_INVALID';
  end if;

  if coalesce(selected_hold.hold_active, false) then
    raise exception 'RETENTION_HOLD_RECOVERY_ALREADY_HELD';
  end if;

  select * into selected_claim
  from public.privacy_retention_deletion_claims as claim
  where claim.candidate_id = p_candidate_id
  for update;

  if not found or selected_claim.state = 'finalized' then
    raise exception 'RETENTION_HOLD_RECOVERY_EXPIRED_CLAIM_REQUIRED';
  end if;

  -- Any provider deletion, retryable state or irreversible marker means data
  -- may already have been removed. A hold must never claim that cancellation
  -- was safe in those states.
  if selected_claim.state <> 'claimed'
    or selected_claim.irreversible_started
    or selected_claim.claim_token is null
    or selected_claim.lease_expires_at is null
  then
    raise exception 'RETENTION_HOLD_RECOVERY_UNSAFE';
  end if;

  if selected_claim.lease_expires_at > clock_timestamp() then
    raise exception 'RETENTION_HOLD_RECOVERY_CLAIM_LIVE';
  end if;

  select public.release_privacy_retention_deletion_claim(
    p_candidate_id,
    selected_claim.claim_token,
    'RETENTION_CLAIM_CANCELLED_FOR_HOLD'
  ) into claim_released;

  if not claim_released then
    raise exception 'RETENTION_HOLD_RECOVERY_RELEASE_FAILED';
  end if;

  select * into placed_hold
  from public.set_privacy_retention_legal_hold(
    p_candidate_id,
    true,
    p_reason,
    p_review_at
  );

  if not found
    or not coalesce(placed_hold.updated, false)
    or not coalesce(placed_hold.hold_active, false)
    or placed_hold.record_reference is distinct from selected_hold.record_reference
  then
    raise exception 'RETENTION_HOLD_RECOVERY_HOLD_FAILED';
  end if;

  recovery_time := clock_timestamp();

  insert into public.privacy_retention_claim_recovery_events (
    candidate_id,
    record_reference,
    run_id,
    action_id,
    previous_claim_state,
    previous_claim_lease_expires_at,
    hold_reason,
    hold_review_at,
    recovered_at
  ) values (
    p_candidate_id,
    selected_hold.record_reference,
    selected_claim.run_id,
    selected_claim.action_id,
    selected_claim.state,
    selected_claim.lease_expires_at,
    p_reason,
    p_review_at,
    recovery_time
  );

  return query select
    'held'::text,
    selected_hold.record_reference::text,
    true,
    p_review_at,
    recovery_time;
end;
$$;

revoke all on table public.privacy_retention_claim_recovery_events
  from public, anon, authenticated;

grant select on table public.privacy_retention_claim_recovery_events
  to service_role;

revoke all on function public.place_privacy_retention_legal_hold_with_claim_recovery(
  text,
  text,
  timestamptz,
  text
) from public, anon, authenticated;

grant execute on function public.place_privacy_retention_legal_hold_with_claim_recovery(
  text,
  text,
  timestamptz,
  text
) to service_role;
