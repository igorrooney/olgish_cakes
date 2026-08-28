-- Minimise special-category dietary-health content after its operational
-- purpose ends. This migration intentionally does not backfill a deadline:
-- legacy active records without reliable closure or fulfilment evidence remain
-- protected for an explicit lifecycle review.

alter table public.contact_enquiries
  add column if not exists dietary_health_retention_due_at timestamptz,
  add column if not exists dietary_health_erased_at timestamptz;

alter table public.custom_cake_enquiries
  add column if not exists dietary_health_retention_due_at timestamptz,
  add column if not exists dietary_health_erased_at timestamptz;

alter table public.workshop_enquiries
  add column if not exists dietary_health_retention_due_at timestamptz,
  add column if not exists dietary_health_erased_at timestamptz;

alter table public.orders
  add column if not exists dietary_health_retention_due_at timestamptz,
  add column if not exists dietary_health_erased_at timestamptz;

alter table public.privacy_retention_lifecycle_events
  drop constraint if exists privacy_retention_lifecycle_events_action_check,
  add constraint privacy_retention_lifecycle_events_action_check check (action in (
    'terminal-date-recorded',
    'event-closed',
    'enquiry-contact-recorded',
    'enquiry-closed',
    'enquiry-reopened',
    'enquiry-converted',
    'health-retention-scheduled'
  ));

alter table public.contact_enquiries
  drop constraint if exists contact_enquiries_sensitive_data_consent_check,
  add constraint contact_enquiries_sensitive_data_consent_check check (
    (
      dietary_health_information is null
      and dietary_health_consent = false
      and dietary_health_consent_version is null
      and dietary_health_consented_at is null
      and dietary_health_withdrawn_at is null
      and dietary_health_retention_due_at is null
      and dietary_health_erased_at is null
    )
    or
    (
      dietary_health_information is not null
      and length(btrim(dietary_health_information)) > 0
      and dietary_health_consent = true
      and dietary_health_consent_version is not null
      and dietary_health_consented_at is not null
      and dietary_health_withdrawn_at is null
      and dietary_health_erased_at is null
      and (
        dietary_health_retention_due_at is null
        or dietary_health_retention_due_at >= dietary_health_consented_at
      )
    )
    or
    (
      dietary_health_information is null
      and dietary_health_consent = false
      and dietary_health_consent_version is not null
      and dietary_health_consented_at is not null
      and dietary_health_withdrawn_at is not null
      and dietary_health_retention_due_at is null
      and dietary_health_erased_at is null
      and dietary_health_withdrawn_at >= dietary_health_consented_at
    )
    or
    (
      dietary_health_information is null
      and dietary_health_consent = false
      and dietary_health_consent_version is not null
      and dietary_health_consented_at is not null
      and dietary_health_withdrawn_at is null
      and dietary_health_retention_due_at is not null
      and dietary_health_erased_at is not null
      and dietary_health_retention_due_at >= dietary_health_consented_at
      and dietary_health_erased_at >= dietary_health_retention_due_at
    )
  );

alter table public.custom_cake_enquiries
  drop constraint if exists custom_cake_enquiries_sensitive_data_consent_check,
  add constraint custom_cake_enquiries_sensitive_data_consent_check check (
    (
      dietary_health_information is null
      and dietary_health_consent = false
      and dietary_health_consent_version is null
      and dietary_health_consented_at is null
      and dietary_health_withdrawn_at is null
      and dietary_health_retention_due_at is null
      and dietary_health_erased_at is null
    )
    or
    (
      dietary_health_information is not null
      and length(btrim(dietary_health_information)) > 0
      and dietary_health_consent = true
      and dietary_health_consent_version is not null
      and dietary_health_consented_at is not null
      and dietary_health_withdrawn_at is null
      and dietary_health_erased_at is null
      and (
        dietary_health_retention_due_at is null
        or dietary_health_retention_due_at >= dietary_health_consented_at
      )
    )
    or
    (
      dietary_health_information is null
      and dietary_health_consent = false
      and dietary_health_consent_version is not null
      and dietary_health_consented_at is not null
      and dietary_health_withdrawn_at is not null
      and dietary_health_retention_due_at is null
      and dietary_health_erased_at is null
      and dietary_health_withdrawn_at >= dietary_health_consented_at
    )
    or
    (
      dietary_health_information is null
      and dietary_health_consent = false
      and dietary_health_consent_version is not null
      and dietary_health_consented_at is not null
      and dietary_health_withdrawn_at is null
      and dietary_health_retention_due_at is not null
      and dietary_health_erased_at is not null
      and dietary_health_retention_due_at >= dietary_health_consented_at
      and dietary_health_erased_at >= dietary_health_retention_due_at
    )
  );

alter table public.workshop_enquiries
  drop constraint if exists workshop_enquiries_sensitive_data_consent_check,
  add constraint workshop_enquiries_sensitive_data_consent_check check (
    (
      dietary_health_information is null
      and dietary_health_consent = false
      and dietary_health_consent_version is null
      and dietary_health_consented_at is null
      and dietary_health_withdrawn_at is null
      and dietary_health_retention_due_at is null
      and dietary_health_erased_at is null
    )
    or
    (
      dietary_health_information is not null
      and length(btrim(dietary_health_information)) > 0
      and dietary_health_consent = true
      and dietary_health_consent_version is not null
      and dietary_health_consented_at is not null
      and dietary_health_withdrawn_at is null
      and dietary_health_erased_at is null
      and (
        dietary_health_retention_due_at is null
        or dietary_health_retention_due_at >= dietary_health_consented_at
      )
    )
    or
    (
      dietary_health_information is null
      and dietary_health_consent = false
      and dietary_health_consent_version is not null
      and dietary_health_consented_at is not null
      and dietary_health_withdrawn_at is not null
      and dietary_health_retention_due_at is null
      and dietary_health_erased_at is null
      and dietary_health_withdrawn_at >= dietary_health_consented_at
    )
    or
    (
      dietary_health_information is null
      and dietary_health_consent = false
      and dietary_health_consent_version is not null
      and dietary_health_consented_at is not null
      and dietary_health_withdrawn_at is null
      and dietary_health_retention_due_at is not null
      and dietary_health_erased_at is not null
      and dietary_health_retention_due_at >= dietary_health_consented_at
      and dietary_health_erased_at >= dietary_health_retention_due_at
    )
  );

-- The order payload remains in metadata. NOT VALID deliberately leaves any
-- legacy malformed record available for review while enforcing the four safe
-- states on every new or subsequently updated order.
alter table public.orders
  drop constraint if exists orders_dietary_health_retention_check,
  add constraint orders_dietary_health_retention_check check (
    (
      nullif(btrim(metadata->>'dietaryHealthInformation'), '') is null
      and coalesce(metadata->'dietaryHealthConsent', 'false'::jsonb) = 'false'::jsonb
      and nullif(btrim(metadata->>'dietaryHealthConsentVersion'), '') is null
      and nullif(btrim(metadata->>'dietaryHealthConsentedAt'), '') is null
      and nullif(btrim(metadata->>'dietaryHealthWithdrawnAt'), '') is null
      and dietary_health_retention_due_at is null
      and dietary_health_erased_at is null
    )
    or
    (
      jsonb_typeof(metadata->'dietaryHealthInformation') = 'string'
      and length(btrim(metadata->>'dietaryHealthInformation')) > 0
      and metadata->'dietaryHealthConsent' = 'true'::jsonb
      and nullif(btrim(metadata->>'dietaryHealthConsentVersion'), '') is not null
      and nullif(btrim(metadata->>'dietaryHealthConsentedAt'), '') is not null
      and nullif(btrim(metadata->>'dietaryHealthWithdrawnAt'), '') is null
      and dietary_health_erased_at is null
    )
    or
    (
      nullif(btrim(metadata->>'dietaryHealthInformation'), '') is null
      and coalesce(metadata->'dietaryHealthConsent', 'false'::jsonb) = 'false'::jsonb
      and nullif(btrim(metadata->>'dietaryHealthConsentVersion'), '') is not null
      and nullif(btrim(metadata->>'dietaryHealthConsentedAt'), '') is not null
      and nullif(btrim(metadata->>'dietaryHealthWithdrawnAt'), '') is not null
      and dietary_health_retention_due_at is null
      and dietary_health_erased_at is null
    )
    or
    (
      nullif(btrim(metadata->>'dietaryHealthInformation'), '') is null
      and coalesce(metadata->'dietaryHealthConsent', 'false'::jsonb) = 'false'::jsonb
      and nullif(btrim(metadata->>'dietaryHealthConsentVersion'), '') is not null
      and nullif(btrim(metadata->>'dietaryHealthConsentedAt'), '') is not null
      and nullif(btrim(metadata->>'dietaryHealthWithdrawnAt'), '') is null
      and dietary_health_retention_due_at is not null
      and dietary_health_erased_at is not null
      and dietary_health_erased_at >= dietary_health_retention_due_at
    )
  ) not valid;

create index if not exists contact_enquiries_health_retention_due_idx
  on public.contact_enquiries (dietary_health_retention_due_at)
  where dietary_health_retention_due_at is not null
    and dietary_health_erased_at is null;

create index if not exists custom_cake_enquiries_health_retention_due_idx
  on public.custom_cake_enquiries (dietary_health_retention_due_at)
  where dietary_health_retention_due_at is not null
    and dietary_health_erased_at is null;

create index if not exists workshop_enquiries_health_retention_due_idx
  on public.workshop_enquiries (dietary_health_retention_due_at)
  where dietary_health_retention_due_at is not null
    and dietary_health_erased_at is null;

create index if not exists orders_health_retention_due_idx
  on public.orders (dietary_health_retention_due_at)
  where dietary_health_retention_due_at is not null
    and dietary_health_erased_at is null;

create or replace function public.manage_enquiry_health_retention_evidence()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  old_active boolean :=
    old.dietary_health_information is not null
    and length(btrim(old.dietary_health_information)) > 0
    and old.dietary_health_consent = true
    and old.dietary_health_withdrawn_at is null
    and old.dietary_health_erased_at is null;
  new_active boolean;
  withdrawal_requested boolean;
  controlled_erasure boolean :=
    current_setting('app.health_retention_erasure', true) = 'allowed';
  controlled_legacy_schedule boolean :=
    current_setting('app.health_retention_legacy_schedule', true) = 'allowed';
  terminal_transition boolean :=
    old.lifecycle_status not in ('closed', 'converted')
    and new.lifecycle_status in ('closed', 'converted');
  reopened boolean :=
    old.lifecycle_status in ('closed', 'converted')
    and new.lifecycle_status = 'open';
  server_timestamp timestamptz;
begin
  if old.dietary_health_withdrawn_at is not null then
    new.dietary_health_information := null;
    new.dietary_health_consent := false;
    new.dietary_health_consent_version := old.dietary_health_consent_version;
    new.dietary_health_consented_at := old.dietary_health_consented_at;
    new.dietary_health_withdrawn_at := old.dietary_health_withdrawn_at;
    new.dietary_health_retention_due_at := null;
    new.dietary_health_erased_at := null;
    return new;
  end if;

  if old.dietary_health_erased_at is not null then
    new.dietary_health_information := null;
    new.dietary_health_consent := false;
    new.dietary_health_consent_version := old.dietary_health_consent_version;
    new.dietary_health_consented_at := old.dietary_health_consented_at;
    new.dietary_health_withdrawn_at := null;
    new.dietary_health_retention_due_at := old.dietary_health_retention_due_at;
    new.dietary_health_erased_at := old.dietary_health_erased_at;
    return new;
  end if;

  withdrawal_requested :=
    old_active
    and nullif(btrim(new.dietary_health_information), '') is null
    and new.dietary_health_consent = false
    and new.dietary_health_withdrawn_at is not null;

  if withdrawal_requested then
    server_timestamp := clock_timestamp();
    new.dietary_health_information := null;
    new.dietary_health_consent := false;
    new.dietary_health_consent_version := old.dietary_health_consent_version;
    new.dietary_health_consented_at := old.dietary_health_consented_at;
    new.dietary_health_withdrawn_at := server_timestamp;
    new.dietary_health_retention_due_at := null;
    new.dietary_health_erased_at := null;
    return new;
  end if;

  if controlled_erasure then
    if not old_active
      or nullif(btrim(new.dietary_health_information), '') is not null
      or new.dietary_health_consent = true
      or new.dietary_health_consent_version is distinct from old.dietary_health_consent_version
      or new.dietary_health_consented_at is distinct from old.dietary_health_consented_at
      or new.dietary_health_withdrawn_at is not null
      or new.dietary_health_retention_due_at is distinct from old.dietary_health_retention_due_at
      or new.dietary_health_erased_at is null
    then
      raise exception using
        errcode = '42501',
        message = 'Invalid controlled dietary-health erasure';
    end if;
    return new;
  end if;

  if controlled_legacy_schedule then
    if not old_active
      or old.lifecycle_status not in ('closed', 'converted')
      or new.lifecycle_status is distinct from old.lifecycle_status
      or old.dietary_health_retention_due_at is not null
      or new.dietary_health_information is distinct from old.dietary_health_information
      or new.dietary_health_consent is distinct from old.dietary_health_consent
      or new.dietary_health_consent_version is distinct from old.dietary_health_consent_version
      or new.dietary_health_consented_at is distinct from old.dietary_health_consented_at
      or new.dietary_health_withdrawn_at is distinct from old.dietary_health_withdrawn_at
      or new.dietary_health_erased_at is distinct from old.dietary_health_erased_at
    then
      raise exception using
        errcode = '42501',
        message = 'Invalid controlled legacy dietary-health schedule';
    end if;
    new.dietary_health_retention_due_at :=
      clock_timestamp() + interval '30 days';
    return new;
  end if;

  if old_active and (
    new.dietary_health_information is distinct from old.dietary_health_information
    or new.dietary_health_consent is distinct from old.dietary_health_consent
    or new.dietary_health_consent_version is distinct from old.dietary_health_consent_version
    or new.dietary_health_consented_at is distinct from old.dietary_health_consented_at
    or new.dietary_health_withdrawn_at is distinct from old.dietary_health_withdrawn_at
    or new.dietary_health_erased_at is distinct from old.dietary_health_erased_at
  ) then
    raise exception using
      errcode = '42501',
      message = 'A controlled operation is required to alter dietary-health evidence';
  end if;

  new.dietary_health_erased_at := old.dietary_health_erased_at;
  new.dietary_health_withdrawn_at := old.dietary_health_withdrawn_at;
  new_active :=
    new.dietary_health_information is not null
    and length(btrim(new.dietary_health_information)) > 0
    and new.dietary_health_consent = true
    and new.dietary_health_withdrawn_at is null
    and new.dietary_health_erased_at is null;

  if terminal_transition and new_active then
    new.dietary_health_retention_due_at :=
      clock_timestamp() + interval '30 days';
  elsif reopened and new_active then
    new.dietary_health_retention_due_at := null;
  else
    new.dietary_health_retention_due_at := old.dietary_health_retention_due_at;
  end if;

  return new;
end;
$$;

drop trigger if exists zz_manage_contact_enquiry_health_retention_evidence
  on public.contact_enquiries;
create trigger zz_manage_contact_enquiry_health_retention_evidence
before update on public.contact_enquiries
for each row execute function public.manage_enquiry_health_retention_evidence();

drop trigger if exists zz_manage_custom_cake_enquiry_health_retention_evidence
  on public.custom_cake_enquiries;
create trigger zz_manage_custom_cake_enquiry_health_retention_evidence
before update on public.custom_cake_enquiries
for each row execute function public.manage_enquiry_health_retention_evidence();

drop trigger if exists zz_manage_workshop_enquiry_health_retention_evidence
  on public.workshop_enquiries;
create trigger zz_manage_workshop_enquiry_health_retention_evidence
before update on public.workshop_enquiries
for each row execute function public.manage_enquiry_health_retention_evidence();

create or replace function public.manage_order_health_retention_evidence()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  old_metadata jsonb := case
    when tg_op = 'UPDATE' and jsonb_typeof(old.metadata) = 'object' then old.metadata
    else '{}'::jsonb
  end;
  new_metadata jsonb := case
    when jsonb_typeof(new.metadata) = 'object' then new.metadata
    else '{}'::jsonb
  end;
  old_active boolean :=
    tg_op = 'UPDATE'
    and jsonb_typeof(old_metadata->'dietaryHealthInformation') = 'string'
    and length(btrim(old_metadata->>'dietaryHealthInformation')) > 0
    and old_metadata->'dietaryHealthConsent' = 'true'::jsonb
    and nullif(btrim(old_metadata->>'dietaryHealthWithdrawnAt'), '') is null
    and old.dietary_health_erased_at is null;
  new_active boolean :=
    jsonb_typeof(new_metadata->'dietaryHealthInformation') = 'string'
    and length(btrim(new_metadata->>'dietaryHealthInformation')) > 0
    and new_metadata->'dietaryHealthConsent' = 'true'::jsonb
    and nullif(btrim(new_metadata->>'dietaryHealthWithdrawnAt'), '') is null
    and new.dietary_health_erased_at is null;
  old_withdrawn_at text := case when tg_op = 'UPDATE' then
    nullif(btrim(old_metadata->>'dietaryHealthWithdrawnAt'), '')
  else null end;
  new_withdrawn_at text :=
    nullif(btrim(new_metadata->>'dietaryHealthWithdrawnAt'), '');
  controlled_erasure boolean :=
    current_setting('app.health_retention_erasure', true) = 'allowed';
  controlled_lifecycle boolean :=
    current_setting('app.health_retention_lifecycle', true) = 'allowed';
  controlled_legacy_schedule boolean :=
    current_setting('app.health_retention_legacy_schedule', true) = 'allowed';
  terminal_transition boolean :=
    tg_op = 'UPDATE'
    and old.status not in ('completed', 'delivered', 'cancelled')
    and new.status in ('completed', 'delivered', 'cancelled');
  server_timestamp timestamptz;
begin
  if tg_op = 'UPDATE' and old_withdrawn_at is not null then
    new.metadata := (
      new_metadata - array[
        'dietaryHealthInformation',
        'dietaryHealthConsent',
        'dietaryHealthConsentVersion',
        'dietaryHealthConsentedAt',
        'dietaryHealthWithdrawnAt'
      ]
    ) || jsonb_build_object(
      'dietaryHealthConsent', false,
      'dietaryHealthWithdrawnAt', old_metadata->'dietaryHealthWithdrawnAt'
    );
    if old_metadata ? 'dietaryHealthConsentVersion' then
      new.metadata := new.metadata || jsonb_build_object(
        'dietaryHealthConsentVersion',
        old_metadata->'dietaryHealthConsentVersion'
      );
    end if;
    if old_metadata ? 'dietaryHealthConsentedAt' then
      new.metadata := new.metadata || jsonb_build_object(
        'dietaryHealthConsentedAt',
        old_metadata->'dietaryHealthConsentedAt'
      );
    end if;
    new.dietary_health_retention_due_at := null;
    new.dietary_health_erased_at := null;
    return new;
  end if;

  if tg_op = 'UPDATE' and old.dietary_health_erased_at is not null then
    new.metadata := (
      new_metadata - array[
        'dietaryHealthInformation',
        'dietaryHealthConsent',
        'dietaryHealthConsentVersion',
        'dietaryHealthConsentedAt',
        'dietaryHealthWithdrawnAt'
      ]
    ) || jsonb_build_object('dietaryHealthConsent', false);
    if old_metadata ? 'dietaryHealthConsentVersion' then
      new.metadata := new.metadata || jsonb_build_object(
        'dietaryHealthConsentVersion',
        old_metadata->'dietaryHealthConsentVersion'
      );
    end if;
    if old_metadata ? 'dietaryHealthConsentedAt' then
      new.metadata := new.metadata || jsonb_build_object(
        'dietaryHealthConsentedAt',
        old_metadata->'dietaryHealthConsentedAt'
      );
    end if;
    new.dietary_health_retention_due_at := old.dietary_health_retention_due_at;
    new.dietary_health_erased_at := old.dietary_health_erased_at;
    return new;
  end if;

  if tg_op = 'UPDATE'
    and old_active
    and not new_active
    and new_withdrawn_at is not null
    and coalesce(new_metadata->'dietaryHealthConsent', 'false'::jsonb) = 'false'::jsonb
  then
    server_timestamp := clock_timestamp();
    new.metadata := (
      new_metadata - array[
        'dietaryHealthInformation',
        'dietaryHealthConsent',
        'dietaryHealthConsentVersion',
        'dietaryHealthConsentedAt',
        'dietaryHealthWithdrawnAt'
      ]
    ) || jsonb_build_object(
      'dietaryHealthConsent', false,
      'dietaryHealthWithdrawnAt', server_timestamp
    );
    if old_metadata ? 'dietaryHealthConsentVersion' then
      new.metadata := new.metadata || jsonb_build_object(
        'dietaryHealthConsentVersion',
        old_metadata->'dietaryHealthConsentVersion'
      );
    end if;
    if old_metadata ? 'dietaryHealthConsentedAt' then
      new.metadata := new.metadata || jsonb_build_object(
        'dietaryHealthConsentedAt',
        old_metadata->'dietaryHealthConsentedAt'
      );
    end if;
    new.dietary_health_retention_due_at := null;
    new.dietary_health_erased_at := null;
    return new;
  end if;

  if tg_op = 'UPDATE' and controlled_erasure then
    if not old_active
      or nullif(btrim(new_metadata->>'dietaryHealthInformation'), '') is not null
      or coalesce(new_metadata->'dietaryHealthConsent', 'false'::jsonb) <> 'false'::jsonb
      or new_metadata->'dietaryHealthConsentVersion' is distinct from old_metadata->'dietaryHealthConsentVersion'
      or new_metadata->'dietaryHealthConsentedAt' is distinct from old_metadata->'dietaryHealthConsentedAt'
      or nullif(btrim(new_metadata->>'dietaryHealthWithdrawnAt'), '') is not null
      or new.dietary_health_retention_due_at is distinct from old.dietary_health_retention_due_at
      or new.dietary_health_erased_at is null
    then
      raise exception using
        errcode = '42501',
        message = 'Invalid controlled dietary-health erasure';
    end if;
    return new;
  end if;

  if tg_op = 'UPDATE' and controlled_lifecycle then
    if not old_active
      or old.dietary_health_retention_due_at is not null
      or new.metadata is distinct from old.metadata
      or new.dietary_health_erased_at is distinct from old.dietary_health_erased_at
      or new.completed_at is null
      or new.completed_at is distinct from old.completed_at
    then
      raise exception using
        errcode = '42501',
        message = 'Invalid controlled dietary-health lifecycle update';
    end if;
    new.dietary_health_retention_due_at :=
      clock_timestamp() + interval '30 days';
    return new;
  end if;

  if tg_op = 'UPDATE' and controlled_legacy_schedule then
    if not old_active
      or old.status not in ('completed', 'delivered', 'cancelled')
      or new.status is distinct from old.status
      or new.payment_status is distinct from old.payment_status
      or new.metadata is distinct from old.metadata
      or old.dietary_health_retention_due_at is not null
      or new.dietary_health_erased_at is distinct from old.dietary_health_erased_at
    then
      raise exception using
        errcode = '42501',
        message = 'Invalid controlled legacy dietary-health schedule';
    end if;
    new.dietary_health_retention_due_at :=
      clock_timestamp() + interval '30 days';
    return new;
  end if;

  if tg_op = 'UPDATE' and old_active and (
    new_metadata->'dietaryHealthInformation' is distinct from old_metadata->'dietaryHealthInformation'
    or new_metadata->'dietaryHealthConsent' is distinct from old_metadata->'dietaryHealthConsent'
    or new_metadata->'dietaryHealthConsentVersion' is distinct from old_metadata->'dietaryHealthConsentVersion'
    or new_metadata->'dietaryHealthConsentedAt' is distinct from old_metadata->'dietaryHealthConsentedAt'
    or new_metadata->'dietaryHealthWithdrawnAt' is distinct from old_metadata->'dietaryHealthWithdrawnAt'
  ) then
    raise exception using
      errcode = '42501',
      message = 'A controlled operation is required to alter dietary-health evidence';
  end if;

  if tg_op = 'INSERT' then
    new.dietary_health_erased_at := null;
    new_active :=
      jsonb_typeof(new_metadata->'dietaryHealthInformation') = 'string'
      and length(btrim(new_metadata->>'dietaryHealthInformation')) > 0
      and new_metadata->'dietaryHealthConsent' = 'true'::jsonb
      and nullif(btrim(new_metadata->>'dietaryHealthWithdrawnAt'), '') is null;
    if new.status in ('completed', 'delivered', 'cancelled') and new_active then
      new.dietary_health_retention_due_at :=
        clock_timestamp() + interval '30 days';
    else
      new.dietary_health_retention_due_at := null;
    end if;
    return new;
  end if;

  new.dietary_health_erased_at := old.dietary_health_erased_at;
  new_active :=
    jsonb_typeof(new_metadata->'dietaryHealthInformation') = 'string'
    and length(btrim(new_metadata->>'dietaryHealthInformation')) > 0
    and new_metadata->'dietaryHealthConsent' = 'true'::jsonb
    and nullif(btrim(new_metadata->>'dietaryHealthWithdrawnAt'), '') is null
    and new.dietary_health_erased_at is null;
  if terminal_transition and new_active then
    new.dietary_health_retention_due_at :=
      clock_timestamp() + interval '30 days';
  else
    new.dietary_health_retention_due_at := old.dietary_health_retention_due_at;
  end if;

  return new;
end;
$$;

drop trigger if exists zz_manage_order_health_retention_evidence
  on public.orders;
create trigger zz_manage_order_health_retention_evidence
before insert or update on public.orders
for each row execute function public.manage_order_health_retention_evidence();

-- Verified legacy completion is recorded by record_order_retention_completion
-- as an append-only lifecycle event. Starting the health deadline from that
-- event prevents a direct orders.completed_at write from supplying the clock.
create or replace function public.apply_verified_order_health_retention_deadline()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target_order_id uuid;
begin
  if new.record_type <> 'order'
    or new.action <> 'terminal-date-recorded'
  then
    return new;
  end if;

  if new.record_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  then
    raise exception 'Invalid verified order lifecycle record';
  end if;
  target_order_id := new.record_id::uuid;
  perform set_config('app.health_retention_lifecycle', 'allowed', true);

  update public.orders set
    dietary_health_retention_due_at = clock_timestamp() + interval '30 days'
  where id = target_order_id
    and completed_at is not null
    and status in ('completed', 'delivered', 'cancelled')
    and dietary_health_retention_due_at is null
    and dietary_health_erased_at is null
    and jsonb_typeof(metadata->'dietaryHealthInformation') = 'string'
    and length(btrim(metadata->>'dietaryHealthInformation')) > 0
    and metadata->'dietaryHealthConsent' = 'true'::jsonb
    and nullif(btrim(metadata->>'dietaryHealthWithdrawnAt'), '') is null;

  perform set_config('app.health_retention_lifecycle', '', true);

  return new;
end;
$$;

drop trigger if exists apply_verified_order_health_retention_deadline
  on public.privacy_retention_lifecycle_events;
create trigger apply_verified_order_health_retention_deadline
after insert on public.privacy_retention_lifecycle_events
for each row execute function public.apply_verified_order_health_retention_deadline();

create or replace function public.schedule_legacy_enquiry_health_retention(
  p_enquiry_type text,
  p_record_id text
)
returns table (
  status text,
  due_at timestamptz
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  safe_type text := btrim(coalesce(p_enquiry_type, ''));
  safe_id text := btrim(coalesce(p_record_id, ''));
  record_found boolean := false;
  selected_lifecycle_status text;
  selected_information text;
  selected_consent boolean;
  selected_withdrawn_at timestamptz;
  selected_due_at timestamptz;
  selected_erased_at timestamptz;
  selected_legal_hold boolean;
  selected_linked_order_id uuid;
  scheduled_due_at timestamptz;
  candidate_ids text[];
begin
  if safe_type not in ('contact', 'custom-cake', 'workshop')
    or char_length(safe_id) not between 1 and 64
    or (
      safe_type in ('contact', 'workshop')
      and safe_id !~ '^[0-9]{1,19}$'
    )
    or (
      safe_type = 'custom-cake'
      and safe_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    )
  then
    raise exception 'HEALTH_RETENTION_ENQUIRY_NOT_FOUND';
  end if;

  if not pg_try_advisory_xact_lock(
    hashtextextended(
      'privacy-retention-candidate:enquiry:' || safe_type || ':' || safe_id,
      0
    )
  ) or not pg_try_advisory_xact_lock(
    hashtextextended(
      'privacy-retention-candidate:enquiry-upload:' || safe_type || ':' || safe_id,
      0
    )
  ) or not pg_try_advisory_xact_lock(
    hashtextextended(
      'privacy-retention-candidate:health:enquiry:' || safe_type || ':' || safe_id,
      0
    )
  ) then
    raise exception using
      errcode = '55P03',
      message = 'HEALTH_RETENTION_DELETION_CLAIM_ACTIVE';
  end if;

  if safe_type = 'contact' then
    select converted_order_id into selected_linked_order_id
    from public.contact_enquiries where id = safe_id::bigint;
  elsif safe_type = 'custom-cake' then
    select converted_order_id into selected_linked_order_id
    from public.custom_cake_enquiries where id = safe_id::uuid;
  else
    select converted_order_id into selected_linked_order_id
    from public.workshop_enquiries where id = safe_id::bigint;
  end if;

  if selected_linked_order_id is not null and not pg_try_advisory_xact_lock(
    hashtextextended(
      'privacy-retention-order-bundle:' || selected_linked_order_id::text,
      0
    )
  ) then
    raise exception using
      errcode = '55P03',
      message = 'HEALTH_RETENTION_DELETION_CLAIM_ACTIVE';
  end if;

  if safe_type = 'contact' then
    select
      true,
      lifecycle_status,
      dietary_health_information,
      dietary_health_consent,
      dietary_health_withdrawn_at,
      dietary_health_retention_due_at,
      dietary_health_erased_at,
      legal_hold,
      converted_order_id
    into
      record_found,
      selected_lifecycle_status,
      selected_information,
      selected_consent,
      selected_withdrawn_at,
      selected_due_at,
      selected_erased_at,
      selected_legal_hold,
      selected_linked_order_id
    from public.contact_enquiries
    where id = safe_id::bigint
    for update;
  elsif safe_type = 'custom-cake' then
    select
      true,
      lifecycle_status,
      dietary_health_information,
      dietary_health_consent,
      dietary_health_withdrawn_at,
      dietary_health_retention_due_at,
      dietary_health_erased_at,
      legal_hold,
      converted_order_id
    into
      record_found,
      selected_lifecycle_status,
      selected_information,
      selected_consent,
      selected_withdrawn_at,
      selected_due_at,
      selected_erased_at,
      selected_legal_hold,
      selected_linked_order_id
    from public.custom_cake_enquiries
    where id = safe_id::uuid
    for update;
  else
    select
      true,
      lifecycle_status,
      dietary_health_information,
      dietary_health_consent,
      dietary_health_withdrawn_at,
      dietary_health_retention_due_at,
      dietary_health_erased_at,
      legal_hold,
      converted_order_id
    into
      record_found,
      selected_lifecycle_status,
      selected_information,
      selected_consent,
      selected_withdrawn_at,
      selected_due_at,
      selected_erased_at,
      selected_legal_hold,
      selected_linked_order_id
    from public.workshop_enquiries
    where id = safe_id::bigint
    for update;
  end if;

  if not record_found then
    return query select 'not-found'::text, null::timestamptz;
    return;
  end if;

  candidate_ids := array[
    'enquiry:' || safe_type || ':' || safe_id,
    'enquiry-upload:' || safe_type || ':' || safe_id,
    'health:enquiry:' || safe_type || ':' || safe_id
  ];
  if selected_linked_order_id is not null then
    candidate_ids := candidate_ids || array[
      'order:' || selected_linked_order_id::text,
      'order-upload:' || selected_linked_order_id::text,
      'health:order:' || selected_linked_order_id::text
    ];
  end if;

  if exists (
    select 1 from public.privacy_retention_deletion_claims as claim
    where (
      claim.candidate_id = any(candidate_ids)
      or (
        selected_linked_order_id is not null
        and claim.candidate_id in (
          select 'enquiry-upload:custom-cake:' || enquiry.id::text
          from public.custom_cake_enquiries as enquiry
          where enquiry.lifecycle_status = 'converted'
            and enquiry.converted_order_id = selected_linked_order_id
        )
      )
    )
      and claim.state in ('claimed', 'external-delete', 'retryable')
  ) then
    raise exception using
      errcode = '55P03',
      message = 'HEALTH_RETENTION_DELETION_CLAIM_ACTIVE';
  end if;

  if selected_legal_hold or (
    selected_linked_order_id is not null and exists (
      select 1 from public.orders
      where id = selected_linked_order_id and legal_hold = true
    )
  ) then
    raise exception 'HEALTH_RETENTION_LEGAL_HOLD_ACTIVE';
  end if;
  if selected_erased_at is not null then
    return query select 'already-erased'::text, null::timestamptz;
    return;
  end if;
  if selected_withdrawn_at is not null then
    return query select 'already-withdrawn'::text, null::timestamptz;
    return;
  end if;
  if selected_information is null
    or length(btrim(selected_information)) = 0
    or selected_consent is distinct from true
  then
    return query select 'no-active-information'::text, null::timestamptz;
    return;
  end if;
  if selected_due_at is not null then
    return query select 'already-scheduled'::text, selected_due_at;
    return;
  end if;
  if selected_lifecycle_status not in ('closed', 'converted') then
    raise exception 'HEALTH_RETENTION_RECORD_NOT_TERMINAL';
  end if;

  perform set_config('app.health_retention_legacy_schedule', 'allowed', true);
  if safe_type = 'contact' then
    update public.contact_enquiries set
      dietary_health_retention_due_at = clock_timestamp() + interval '30 days'
    where id = safe_id::bigint
    returning dietary_health_retention_due_at into scheduled_due_at;
  elsif safe_type = 'custom-cake' then
    update public.custom_cake_enquiries set
      dietary_health_retention_due_at = clock_timestamp() + interval '30 days'
    where id = safe_id::uuid
    returning dietary_health_retention_due_at into scheduled_due_at;
  else
    update public.workshop_enquiries set
      dietary_health_retention_due_at = clock_timestamp() + interval '30 days'
    where id = safe_id::bigint
    returning dietary_health_retention_due_at into scheduled_due_at;
  end if;
  perform set_config('app.health_retention_legacy_schedule', '', true);

  insert into public.privacy_retention_lifecycle_events (
    record_type,
    record_id,
    record_reference,
    action,
    effective_on,
    evidence_basis
  ) values (
    'enquiry',
    safe_id,
    safe_type || '-' || safe_id,
    'health-retention-scheduled',
    (clock_timestamp() at time zone 'Europe/London')::date,
    'server-action'
  );

  return query select 'scheduled'::text, scheduled_due_at;
end;
$$;

create or replace function public.schedule_legacy_order_health_retention(
  p_identifier text
)
returns table (
  status text,
  due_at timestamptz
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  safe_identifier text := btrim(coalesce(p_identifier, ''));
  target_order_id uuid;
  selected_order public.orders%rowtype;
  selected_information text;
  selected_withdrawn_at text;
  scheduled_due_at timestamptz;
begin
  if char_length(safe_identifier) not between 1 and 128 then
    raise exception 'HEALTH_RETENTION_ORDER_NOT_FOUND';
  end if;

  select orders.id into target_order_id
  from public.orders as orders
  where orders.id::text = safe_identifier
    or orders.order_number = safe_identifier
  order by case when orders.id::text = safe_identifier then 0 else 1 end
  limit 1;

  if target_order_id is null then
    return query select 'not-found'::text, null::timestamptz;
    return;
  end if;

  if not pg_try_advisory_xact_lock(
    hashtextextended('privacy-retention-order-bundle:' || target_order_id::text, 0)
  ) or not pg_try_advisory_xact_lock(
    hashtextextended(
      'privacy-retention-candidate:health:order:' || target_order_id::text,
      0
    )
  ) then
    raise exception using
      errcode = '55P03',
      message = 'HEALTH_RETENTION_DELETION_CLAIM_ACTIVE';
  end if;

  select orders.* into selected_order
  from public.orders as orders
  where orders.id = target_order_id
  for update;

  if not found then
    return query select 'not-found'::text, null::timestamptz;
    return;
  end if;

  if exists (
    select 1 from public.privacy_retention_deletion_claims as claim
    where (
      claim.candidate_id in (
        'order:' || target_order_id::text,
        'order-upload:' || target_order_id::text,
        'health:order:' || target_order_id::text
      )
      or claim.candidate_id in (
        select 'enquiry-upload:custom-cake:' || enquiry.id::text
        from public.custom_cake_enquiries as enquiry
        where enquiry.lifecycle_status = 'converted'
          and enquiry.converted_order_id = target_order_id
      )
    )
      and claim.state in ('claimed', 'external-delete', 'retryable')
  ) then
    raise exception using
      errcode = '55P03',
      message = 'HEALTH_RETENTION_DELETION_CLAIM_ACTIVE';
  end if;

  if selected_order.legal_hold or exists (
    select 1 from public.contact_enquiries
    where converted_order_id = target_order_id and legal_hold = true
    union all
    select 1 from public.custom_cake_enquiries
    where converted_order_id = target_order_id and legal_hold = true
    union all
    select 1 from public.workshop_enquiries
    where converted_order_id = target_order_id and legal_hold = true
  ) then
    raise exception 'HEALTH_RETENTION_LEGAL_HOLD_ACTIVE';
  end if;
  if selected_order.dietary_health_erased_at is not null then
    return query select 'already-erased'::text, null::timestamptz;
    return;
  end if;

  selected_withdrawn_at := nullif(
    btrim(selected_order.metadata->>'dietaryHealthWithdrawnAt'),
    ''
  );
  if selected_withdrawn_at is not null then
    return query select 'already-withdrawn'::text, null::timestamptz;
    return;
  end if;
  selected_information := nullif(
    btrim(selected_order.metadata->>'dietaryHealthInformation'),
    ''
  );
  if selected_information is null
    or selected_order.metadata->'dietaryHealthConsent' is distinct from 'true'::jsonb
  then
    return query select 'no-active-information'::text, null::timestamptz;
    return;
  end if;
  if selected_order.dietary_health_retention_due_at is not null then
    return query select
      'already-scheduled'::text,
      selected_order.dietary_health_retention_due_at;
    return;
  end if;
  if selected_order.status not in ('completed', 'delivered', 'cancelled') then
    raise exception 'HEALTH_RETENTION_RECORD_NOT_TERMINAL';
  end if;

  perform set_config('app.health_retention_legacy_schedule', 'allowed', true);
  update public.orders set
    dietary_health_retention_due_at = clock_timestamp() + interval '30 days'
  where id = target_order_id
  returning dietary_health_retention_due_at into scheduled_due_at;
  perform set_config('app.health_retention_legacy_schedule', '', true);

  insert into public.privacy_retention_lifecycle_events (
    record_type,
    record_id,
    record_reference,
    action,
    effective_on,
    evidence_basis
  ) values (
    'order',
    target_order_id::text,
    selected_order.order_number,
    'health-retention-scheduled',
    (clock_timestamp() at time zone 'Europe/London')::date,
    'server-action'
  );

  return query select 'scheduled'::text, scheduled_due_at;
end;
$$;

create or replace function public.erase_due_enquiry_dietary_health_information(
  p_enquiry_type text,
  p_record_id text
)
returns table (
  status text,
  erased_at timestamptz
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  safe_type text := btrim(coalesce(p_enquiry_type, ''));
  safe_id text := btrim(coalesce(p_record_id, ''));
  record_found boolean := false;
  selected_information text;
  selected_consent boolean;
  selected_version text;
  selected_consented_at timestamptz;
  selected_withdrawn_at timestamptz;
  selected_due_at timestamptz;
  selected_erased_at timestamptz;
  selected_legal_hold boolean;
  selected_linked_order_id uuid;
  server_erased_at timestamptz;
  candidate_ids text[];
  session_claim_token text := nullif(
    current_setting('app.privacy_retention_claim_token', true),
    ''
  );
begin
  if safe_type not in ('contact', 'custom-cake', 'workshop')
    or char_length(safe_id) not between 1 and 64
    or (
      safe_type in ('contact', 'workshop')
      and safe_id !~ '^[0-9]{1,19}$'
    )
    or (
      safe_type = 'custom-cake'
      and safe_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    )
  then
    raise exception 'HEALTH_RETENTION_ENQUIRY_NOT_FOUND';
  end if;

  if not pg_try_advisory_xact_lock(
    hashtextextended(
      'privacy-retention-candidate:enquiry:' || safe_type || ':' || safe_id,
      0
    )
  ) then
    raise exception using
      errcode = '55P03',
      message = 'HEALTH_RETENTION_DELETION_CLAIM_ACTIVE';
  end if;
  if not pg_try_advisory_xact_lock(
    hashtextextended(
      'privacy-retention-candidate:enquiry-upload:' || safe_type || ':' || safe_id,
      0
    )
  ) then
    raise exception using
      errcode = '55P03',
      message = 'HEALTH_RETENTION_DELETION_CLAIM_ACTIVE';
  end if;
  if not pg_try_advisory_xact_lock(
    hashtextextended(
      'privacy-retention-candidate:health:enquiry:' || safe_type || ':' || safe_id,
      0
    )
  ) then
    raise exception using
      errcode = '55P03',
      message = 'HEALTH_RETENTION_DELETION_CLAIM_ACTIVE';
  end if;

  if safe_type = 'contact' then
    select converted_order_id into selected_linked_order_id
    from public.contact_enquiries where id = safe_id::bigint;
  elsif safe_type = 'custom-cake' then
    select converted_order_id into selected_linked_order_id
    from public.custom_cake_enquiries where id = safe_id::uuid;
  else
    select converted_order_id into selected_linked_order_id
    from public.workshop_enquiries where id = safe_id::bigint;
  end if;

  if selected_linked_order_id is not null and not pg_try_advisory_xact_lock(
    hashtextextended(
      'privacy-retention-order-bundle:' || selected_linked_order_id::text,
      0
    )
  ) then
    raise exception using
      errcode = '55P03',
      message = 'HEALTH_RETENTION_DELETION_CLAIM_ACTIVE';
  end if;

  if safe_type = 'contact' then
    select
      true,
      dietary_health_information,
      dietary_health_consent,
      dietary_health_consent_version,
      dietary_health_consented_at,
      dietary_health_withdrawn_at,
      dietary_health_retention_due_at,
      dietary_health_erased_at,
      legal_hold,
      converted_order_id
    into
      record_found,
      selected_information,
      selected_consent,
      selected_version,
      selected_consented_at,
      selected_withdrawn_at,
      selected_due_at,
      selected_erased_at,
      selected_legal_hold,
      selected_linked_order_id
    from public.contact_enquiries
    where id = safe_id::bigint
    for update;
  elsif safe_type = 'custom-cake' then
    select
      true,
      dietary_health_information,
      dietary_health_consent,
      dietary_health_consent_version,
      dietary_health_consented_at,
      dietary_health_withdrawn_at,
      dietary_health_retention_due_at,
      dietary_health_erased_at,
      legal_hold,
      converted_order_id
    into
      record_found,
      selected_information,
      selected_consent,
      selected_version,
      selected_consented_at,
      selected_withdrawn_at,
      selected_due_at,
      selected_erased_at,
      selected_legal_hold,
      selected_linked_order_id
    from public.custom_cake_enquiries
    where id = safe_id::uuid
    for update;
  else
    select
      true,
      dietary_health_information,
      dietary_health_consent,
      dietary_health_consent_version,
      dietary_health_consented_at,
      dietary_health_withdrawn_at,
      dietary_health_retention_due_at,
      dietary_health_erased_at,
      legal_hold,
      converted_order_id
    into
      record_found,
      selected_information,
      selected_consent,
      selected_version,
      selected_consented_at,
      selected_withdrawn_at,
      selected_due_at,
      selected_erased_at,
      selected_legal_hold,
      selected_linked_order_id
    from public.workshop_enquiries
    where id = safe_id::bigint
    for update;
  end if;

  if not record_found then
    return query select 'not-found'::text, null::timestamptz;
    return;
  end if;

  candidate_ids := array[
    'enquiry:' || safe_type || ':' || safe_id,
    'enquiry-upload:' || safe_type || ':' || safe_id,
    'health:enquiry:' || safe_type || ':' || safe_id
  ];
  if selected_linked_order_id is not null then
    candidate_ids := candidate_ids || array[
      'order:' || selected_linked_order_id::text,
      'order-upload:' || selected_linked_order_id::text
    ];
  end if;

  if exists (
    select 1 from public.privacy_retention_deletion_claims as claim
    where (
      claim.candidate_id = any(candidate_ids)
      or (
        selected_linked_order_id is not null
        and claim.candidate_id in (
          select 'enquiry-upload:custom-cake:' || enquiry.id::text
          from public.custom_cake_enquiries as enquiry
          where enquiry.lifecycle_status = 'converted'
            and enquiry.converted_order_id = selected_linked_order_id
        )
      )
    )
      and claim.state in ('claimed', 'external-delete', 'retryable')
      and not (
        claim.candidate_id =
          'health:enquiry:' || safe_type || ':' || safe_id
        and claim.claim_token::text = session_claim_token
        and claim.state in ('claimed', 'external-delete')
      )
  ) then
    raise exception using
      errcode = '55P03',
      message = 'HEALTH_RETENTION_DELETION_CLAIM_ACTIVE';
  end if;

  if selected_legal_hold or (
    selected_linked_order_id is not null and exists (
      select 1 from public.orders
      where id = selected_linked_order_id and legal_hold = true
    )
  ) then
    raise exception 'HEALTH_RETENTION_LEGAL_HOLD_ACTIVE';
  end if;

  if selected_erased_at is not null then
    return query select 'already-erased'::text, selected_erased_at;
    return;
  end if;
  if selected_withdrawn_at is not null then
    return query select 'already-withdrawn'::text, null::timestamptz;
    return;
  end if;
  if selected_information is null
    or length(btrim(selected_information)) = 0
    or selected_consent is distinct from true
  then
    return query select 'no-active-information'::text, null::timestamptz;
    return;
  end if;
  if selected_version is null or selected_consented_at is null then
    raise exception 'HEALTH_RETENTION_EVIDENCE_INVALID';
  end if;
  if selected_due_at is null then
    raise exception 'HEALTH_RETENTION_DEADLINE_MISSING';
  end if;
  if selected_due_at > clock_timestamp() then
    raise exception 'HEALTH_RETENTION_NOT_DUE';
  end if;

  server_erased_at := clock_timestamp();
  perform set_config('app.health_retention_erasure', 'allowed', true);

  if safe_type = 'contact' then
    update public.contact_enquiries set
      dietary_health_information = null,
      dietary_health_consent = false,
      dietary_health_erased_at = server_erased_at
    where id = safe_id::bigint;
  elsif safe_type = 'custom-cake' then
    update public.custom_cake_enquiries set
      dietary_health_information = null,
      dietary_health_consent = false,
      dietary_health_erased_at = server_erased_at
    where id = safe_id::uuid;
  else
    update public.workshop_enquiries set
      dietary_health_information = null,
      dietary_health_consent = false,
      dietary_health_erased_at = server_erased_at
    where id = safe_id::bigint;
  end if;

  perform set_config('app.health_retention_erasure', '', true);

  return query select 'erased'::text, server_erased_at;
end;
$$;

create or replace function public.erase_due_order_dietary_health_information(
  p_identifier text
)
returns table (
  status text,
  erased_at timestamptz
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  safe_identifier text := btrim(coalesce(p_identifier, ''));
  target_order_id uuid;
  selected_order public.orders%rowtype;
  selected_information text;
  selected_withdrawn_at text;
  server_erased_at timestamptz;
  session_claim_token text := nullif(
    current_setting('app.privacy_retention_claim_token', true),
    ''
  );
begin
  if char_length(safe_identifier) not between 1 and 128 then
    raise exception 'HEALTH_RETENTION_ORDER_NOT_FOUND';
  end if;

  select orders.id into target_order_id
  from public.orders as orders
  where orders.id::text = safe_identifier
    or orders.order_number = safe_identifier
  order by case when orders.id::text = safe_identifier then 0 else 1 end
  limit 1;

  if target_order_id is null then
    return query select 'not-found'::text, null::timestamptz;
    return;
  end if;

  if not pg_try_advisory_xact_lock(
    hashtextextended('privacy-retention-order-bundle:' || target_order_id::text, 0)
  ) then
    raise exception using
      errcode = '55P03',
      message = 'HEALTH_RETENTION_DELETION_CLAIM_ACTIVE';
  end if;
  if not pg_try_advisory_xact_lock(
    hashtextextended(
      'privacy-retention-candidate:health:order:' || target_order_id::text,
      0
    )
  ) then
    raise exception using
      errcode = '55P03',
      message = 'HEALTH_RETENTION_DELETION_CLAIM_ACTIVE';
  end if;

  select orders.* into selected_order
  from public.orders as orders
  where orders.id = target_order_id
  for update;

  if not found then
    return query select 'not-found'::text, null::timestamptz;
    return;
  end if;

  if exists (
    select 1 from public.privacy_retention_deletion_claims as claim
    where (
      claim.candidate_id in (
        'order:' || target_order_id::text,
        'order-upload:' || target_order_id::text,
        'health:order:' || target_order_id::text
      )
      or claim.candidate_id in (
        select 'enquiry-upload:custom-cake:' || enquiry.id::text
        from public.custom_cake_enquiries as enquiry
        where enquiry.lifecycle_status = 'converted'
          and enquiry.converted_order_id = target_order_id
      )
    )
      and claim.state in ('claimed', 'external-delete', 'retryable')
      and not (
        claim.candidate_id = 'health:order:' || target_order_id::text
        and claim.claim_token::text = session_claim_token
        and claim.state in ('claimed', 'external-delete')
      )
  ) then
    raise exception using
      errcode = '55P03',
      message = 'HEALTH_RETENTION_DELETION_CLAIM_ACTIVE';
  end if;

  if selected_order.legal_hold or exists (
    select 1 from public.contact_enquiries
    where converted_order_id = target_order_id and legal_hold = true
    union all
    select 1 from public.custom_cake_enquiries
    where converted_order_id = target_order_id and legal_hold = true
    union all
    select 1 from public.workshop_enquiries
    where converted_order_id = target_order_id and legal_hold = true
  ) then
    raise exception 'HEALTH_RETENTION_LEGAL_HOLD_ACTIVE';
  end if;

  if selected_order.dietary_health_erased_at is not null then
    return query select
      'already-erased'::text,
      selected_order.dietary_health_erased_at;
    return;
  end if;

  selected_withdrawn_at := nullif(
    btrim(selected_order.metadata->>'dietaryHealthWithdrawnAt'),
    ''
  );
  if selected_withdrawn_at is not null then
    return query select 'already-withdrawn'::text, null::timestamptz;
    return;
  end if;

  selected_information := nullif(
    btrim(selected_order.metadata->>'dietaryHealthInformation'),
    ''
  );
  if selected_information is null
    or selected_order.metadata->'dietaryHealthConsent' is distinct from 'true'::jsonb
  then
    return query select 'no-active-information'::text, null::timestamptz;
    return;
  end if;
  if nullif(btrim(selected_order.metadata->>'dietaryHealthConsentVersion'), '') is null
    or nullif(btrim(selected_order.metadata->>'dietaryHealthConsentedAt'), '') is null
  then
    raise exception 'HEALTH_RETENTION_EVIDENCE_INVALID';
  end if;
  if selected_order.dietary_health_retention_due_at is null then
    raise exception 'HEALTH_RETENTION_DEADLINE_MISSING';
  end if;
  if selected_order.dietary_health_retention_due_at > clock_timestamp() then
    raise exception 'HEALTH_RETENTION_NOT_DUE';
  end if;

  server_erased_at := clock_timestamp();
  perform set_config('app.health_retention_erasure', 'allowed', true);

  update public.orders set
    metadata = (
      (case
        when jsonb_typeof(metadata) = 'object' then metadata
        else '{}'::jsonb
      end) - 'dietaryHealthInformation' - 'dietaryHealthWithdrawnAt'
    ) || jsonb_build_object('dietaryHealthConsent', false),
    dietary_health_erased_at = server_erased_at,
    updated_at = server_erased_at
  where id = target_order_id;

  perform set_config('app.health_retention_erasure', '', true);

  return query select 'erased'::text, server_erased_at;
end;
$$;

revoke all on function public.manage_enquiry_health_retention_evidence()
  from public, anon, authenticated;
grant execute on function public.manage_enquiry_health_retention_evidence()
  to service_role;

revoke all on function public.manage_order_health_retention_evidence()
  from public, anon, authenticated;
grant execute on function public.manage_order_health_retention_evidence()
  to service_role;

revoke all on function public.apply_verified_order_health_retention_deadline()
  from public, anon, authenticated;
grant execute on function public.apply_verified_order_health_retention_deadline()
  to service_role;

revoke all on function public.schedule_legacy_enquiry_health_retention(text, text)
  from public, anon, authenticated;
grant execute on function public.schedule_legacy_enquiry_health_retention(text, text)
  to service_role;

revoke all on function public.schedule_legacy_order_health_retention(text)
  from public, anon, authenticated;
grant execute on function public.schedule_legacy_order_health_retention(text)
  to service_role;

revoke all on function public.erase_due_enquiry_dietary_health_information(text, text)
  from public, anon, authenticated;
grant execute on function public.erase_due_enquiry_dietary_health_information(text, text)
  to service_role;

revoke all on function public.erase_due_order_dietary_health_information(text)
  from public, anon, authenticated;
grant execute on function public.erase_due_order_dietary_health_information(text)
  to service_role;
