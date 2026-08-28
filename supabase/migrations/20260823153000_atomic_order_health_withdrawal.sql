create or replace function public.withdraw_order_dietary_health_information(
  p_identifier text
)
returns table (
  status text,
  withdrawn_at text
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  selected_order public.orders%rowtype;
  existing_withdrawn_at text;
  server_withdrawn_at timestamptz;
begin
  select orders.*
  into selected_order
  from public.orders as orders
  where orders.id::text = p_identifier
    or orders.order_number = p_identifier
  order by case when orders.id::text = p_identifier then 0 else 1 end
  limit 1
  for update;

  if not found then
    return query select 'not-found'::text, null::text;
    return;
  end if;

  existing_withdrawn_at := nullif(
    btrim(coalesce(selected_order.metadata->>'dietaryHealthWithdrawnAt', '')),
    ''
  );

  if existing_withdrawn_at is not null then
    update public.orders
    set
      metadata = (
        (coalesce(metadata, '{}'::jsonb) - 'dietaryHealthInformation')
        || jsonb_build_object('dietaryHealthConsent', false)
      ),
      updated_at = clock_timestamp()
    where id = selected_order.id;

    return query select 'already-withdrawn'::text, existing_withdrawn_at;
    return;
  end if;

  if
    jsonb_typeof(selected_order.metadata->'dietaryHealthInformation') is distinct from 'string'
    or length(btrim(selected_order.metadata->>'dietaryHealthInformation')) = 0
  then
    return query select 'no-active-information'::text, null::text;
    return;
  end if;

  server_withdrawn_at := clock_timestamp();

  update public.orders
  set
    metadata = (
      (coalesce(metadata, '{}'::jsonb) - 'dietaryHealthInformation')
      || jsonb_build_object(
        'dietaryHealthConsent', false,
        'dietaryHealthWithdrawnAt', server_withdrawn_at
      )
    ),
    updated_at = server_withdrawn_at
  where id = selected_order.id;

  return query select 'withdrawn'::text, server_withdrawn_at::text;
end;
$$;

revoke all on function public.withdraw_order_dietary_health_information(text)
  from public, anon, authenticated;

grant execute on function public.withdraw_order_dietary_health_information(text)
  to service_role;

create or replace function public.preserve_withdrawn_order_health_evidence()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if nullif(
    btrim(coalesce(old.metadata->>'dietaryHealthWithdrawnAt', '')),
    ''
  ) is null then
    return new;
  end if;

  new.metadata := (
    case
      when jsonb_typeof(new.metadata) = 'object' then new.metadata
      else '{}'::jsonb
    end
    - 'dietaryHealthInformation'
    - 'dietaryHealthConsent'
    - 'dietaryHealthConsentVersion'
    - 'dietaryHealthConsentedAt'
    - 'dietaryHealthWithdrawnAt'
  ) || jsonb_build_object(
    'dietaryHealthConsent', false,
    'dietaryHealthWithdrawnAt', old.metadata->'dietaryHealthWithdrawnAt'
  );

  if old.metadata ? 'dietaryHealthConsentVersion' then
    new.metadata := new.metadata || jsonb_build_object(
      'dietaryHealthConsentVersion',
      old.metadata->'dietaryHealthConsentVersion'
    );
  end if;

  if old.metadata ? 'dietaryHealthConsentedAt' then
    new.metadata := new.metadata || jsonb_build_object(
      'dietaryHealthConsentedAt',
      old.metadata->'dietaryHealthConsentedAt'
    );
  end if;

  return new;
end;
$$;

revoke all on function public.preserve_withdrawn_order_health_evidence()
  from public, anon, authenticated;

grant execute on function public.preserve_withdrawn_order_health_evidence()
  to service_role;

drop trigger if exists preserve_withdrawn_order_health_evidence
  on public.orders;

create trigger preserve_withdrawn_order_health_evidence
before update of metadata on public.orders
for each row
execute function public.preserve_withdrawn_order_health_evidence();
