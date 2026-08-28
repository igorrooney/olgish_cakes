create or replace function public.update_enquiry_retention_lifecycle(
  p_enquiry_type text,
  p_record_id text,
  p_action text,
  p_converted_order_reference text default null
)
returns table (
  status text,
  lifecycle_status text,
  last_contacted_at text,
  closed_at text,
  converted_order_id text,
  retention_due_at text,
  upload_retention_due_at text,
  legal_hold boolean,
  updated_at text
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_lifecycle text;
  current_legal_hold boolean;
  current_converted_order_id uuid;
  selected_order public.orders%rowtype;
  server_now timestamptz := clock_timestamp();
  next_lifecycle text;
  next_last_contacted_at timestamptz;
  next_closed_at timestamptz;
  next_converted_order_id uuid;
  next_retention_due_at timestamptz;
  next_upload_retention_due_at timestamptz;
  safe_record_reference text;
  event_action text;
begin
  if p_enquiry_type not in ('contact', 'custom-cake', 'workshop')
    or p_action not in ('record-contact', 'close', 'reopen', 'convert')
    or p_record_id is null
    or char_length(p_record_id) not between 1 and 40
  then
    raise exception 'RETENTION_ENQUIRY_REQUEST_INVALID';
  end if;

  if p_action = 'convert' and (
    p_converted_order_reference is null
    or char_length(btrim(p_converted_order_reference)) not between 1 and 128
  ) then
    raise exception 'RETENTION_ORDER_REFERENCE_INVALID';
  end if;
  if p_action <> 'convert' and p_converted_order_reference is not null then
    raise exception 'RETENTION_ORDER_REFERENCE_INVALID';
  end if;

  if p_enquiry_type = 'contact' and p_record_id ~ '^[0-9]{1,20}$' then
    select enquiry.lifecycle_status, enquiry.legal_hold, enquiry.converted_order_id
    into current_lifecycle, current_legal_hold, current_converted_order_id
    from public.contact_enquiries as enquiry
    where enquiry.id = p_record_id::bigint
    for update;
    safe_record_reference := 'contact-' || p_record_id;
  elsif p_enquiry_type = 'custom-cake'
    and p_record_id ~ '^[0-9a-fA-F-]{36}$'
  then
    select enquiry.lifecycle_status, enquiry.legal_hold, enquiry.converted_order_id
    into current_lifecycle, current_legal_hold, current_converted_order_id
    from public.custom_cake_enquiries as enquiry
    where enquiry.id = p_record_id::uuid
    for update;
    safe_record_reference := 'custom-cake-' || p_record_id;
  elsif p_enquiry_type = 'workshop' and p_record_id ~ '^[0-9]{1,20}$' then
    select enquiry.lifecycle_status, enquiry.legal_hold, enquiry.converted_order_id
    into current_lifecycle, current_legal_hold, current_converted_order_id
    from public.workshop_enquiries as enquiry
    where enquiry.id = p_record_id::bigint
    for update;
    safe_record_reference := 'workshop-' || p_record_id;
  else
    raise exception 'RETENTION_ENQUIRY_NOT_FOUND';
  end if;

  if not found then
    raise exception 'RETENTION_ENQUIRY_NOT_FOUND';
  end if;
  if current_legal_hold then
    raise exception 'RETENTION_LEGAL_HOLD_ACTIVE';
  end if;
  if current_lifecycle = 'converted' and p_action <> 'record-contact' then
    raise exception 'RETENTION_CONVERTED_LINK_IMMUTABLE';
  end if;

  next_lifecycle := current_lifecycle;
  next_last_contacted_at := server_now;
  next_closed_at := null;
  next_converted_order_id := current_converted_order_id;
  next_retention_due_at := null;
  next_upload_retention_due_at := null;

  if p_action = 'record-contact' then
    event_action := 'enquiry-contact-recorded';
    if p_enquiry_type = 'contact' then
      select enquiry.closed_at, enquiry.retention_due_at
      into next_closed_at, next_retention_due_at
      from public.contact_enquiries as enquiry where enquiry.id = p_record_id::bigint;
    elsif p_enquiry_type = 'custom-cake' then
      select enquiry.closed_at, enquiry.retention_due_at, enquiry.upload_retention_due_at
      into next_closed_at, next_retention_due_at, next_upload_retention_due_at
      from public.custom_cake_enquiries as enquiry where enquiry.id = p_record_id::uuid;
    else
      select enquiry.closed_at, enquiry.retention_due_at
      into next_closed_at, next_retention_due_at
      from public.workshop_enquiries as enquiry where enquiry.id = p_record_id::bigint;
    end if;
    if current_lifecycle = 'closed' then
      next_retention_due_at := server_now + interval '24 months';
      if p_enquiry_type = 'custom-cake' then
        next_upload_retention_due_at := server_now + interval '24 months';
      end if;
    end if;
  elsif p_action = 'close' then
    event_action := 'enquiry-closed';
    next_lifecycle := 'closed';
    next_closed_at := server_now;
    next_converted_order_id := null;
    next_retention_due_at := server_now + interval '24 months';
    if p_enquiry_type = 'custom-cake' then
      next_upload_retention_due_at := server_now + interval '24 months';
    end if;
  elsif p_action = 'reopen' then
    if current_lifecycle <> 'closed' then
      raise exception 'RETENTION_ENQUIRY_STATE_INVALID';
    end if;
    event_action := 'enquiry-reopened';
    next_lifecycle := 'open';
    next_closed_at := null;
    next_converted_order_id := null;
    next_retention_due_at := null;
    next_upload_retention_due_at := null;
  else
    event_action := 'enquiry-converted';
    select orders.*
    into selected_order
    from public.orders as orders
    where orders.id::text = btrim(p_converted_order_reference)
      or orders.order_number = btrim(p_converted_order_reference)
    order by case when orders.id::text = btrim(p_converted_order_reference) then 0 else 1 end
    limit 1
    for update;

    if not found then
      raise exception 'RETENTION_ORDER_NOT_FOUND';
    end if;
    if selected_order.legal_hold then
      raise exception 'RETENTION_LEGAL_HOLD_ACTIVE';
    end if;
    if exists (
      select 1 from public.privacy_retention_deletion_claims as claim
      where claim.candidate_id in (
        'order:' || selected_order.id::text,
        'order-upload:' || selected_order.id::text
      )
        and claim.state in ('claimed', 'external-delete')
    ) then
      raise exception 'RETENTION_DELETION_CLAIM_ACTIVE';
    end if;

    next_lifecycle := 'converted';
    next_closed_at := server_now;
    next_converted_order_id := selected_order.id;
    next_retention_due_at := selected_order.retention_due_at;
    if p_enquiry_type = 'custom-cake' and selected_order.completed_at is not null then
      next_upload_retention_due_at := selected_order.completed_at + interval '24 months';
    end if;
  end if;

  if p_enquiry_type = 'contact' then
    update public.contact_enquiries
    set
      lifecycle_status = next_lifecycle,
      last_contacted_at = next_last_contacted_at,
      closed_at = next_closed_at,
      converted_order_id = next_converted_order_id,
      retention_due_at = next_retention_due_at
    where id = p_record_id::bigint;
  elsif p_enquiry_type = 'custom-cake' then
    update public.custom_cake_enquiries
    set
      lifecycle_status = next_lifecycle,
      last_contacted_at = next_last_contacted_at,
      closed_at = next_closed_at,
      converted_order_id = next_converted_order_id,
      retention_due_at = next_retention_due_at,
      upload_retention_due_at = next_upload_retention_due_at
    where id = p_record_id::uuid;
  else
    update public.workshop_enquiries
    set
      lifecycle_status = next_lifecycle,
      last_contacted_at = next_last_contacted_at,
      closed_at = next_closed_at,
      converted_order_id = next_converted_order_id,
      retention_due_at = next_retention_due_at
    where id = p_record_id::bigint;
  end if;

  insert into public.privacy_retention_lifecycle_events (
    record_type,
    record_id,
    record_reference,
    action,
    effective_on,
    evidence_basis
  ) values (
    'enquiry',
    p_record_id,
    safe_record_reference,
    event_action,
    (server_now at time zone 'Europe/London')::date,
    'server-action'
  );

  return query select
    'updated'::text,
    next_lifecycle,
    next_last_contacted_at::text,
    next_closed_at::text,
    next_converted_order_id::text,
    next_retention_due_at::text,
    next_upload_retention_due_at::text,
    false,
    server_now::text;
end;
$$;

create or replace function public.protect_converted_enquiry_order_link()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if old.lifecycle_status = 'converted' and (
    new.lifecycle_status <> 'converted'
    or new.converted_order_id is distinct from old.converted_order_id
  ) then
    raise exception using
      errcode = '23514',
      message = 'A converted enquiry must remain linked to its original order';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_converted_contact_enquiry_order_link
  on public.contact_enquiries;
create trigger protect_converted_contact_enquiry_order_link
before update on public.contact_enquiries
for each row execute function public.protect_converted_enquiry_order_link();

drop trigger if exists protect_converted_custom_cake_enquiry_order_link
  on public.custom_cake_enquiries;
create trigger protect_converted_custom_cake_enquiry_order_link
before update on public.custom_cake_enquiries
for each row execute function public.protect_converted_enquiry_order_link();

drop trigger if exists protect_converted_workshop_enquiry_order_link
  on public.workshop_enquiries;
create trigger protect_converted_workshop_enquiry_order_link
before update on public.workshop_enquiries
for each row execute function public.protect_converted_enquiry_order_link();

revoke all on function public.update_enquiry_retention_lifecycle(text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.update_enquiry_retention_lifecycle(text, text, text, text)
  to service_role;

revoke all on function public.protect_converted_enquiry_order_link()
  from public, anon, authenticated;
grant execute on function public.protect_converted_enquiry_order_link()
  to service_role;
