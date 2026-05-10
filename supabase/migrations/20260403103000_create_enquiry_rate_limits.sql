create table if not exists public.enquiry_rate_limits (
  scope text not null,
  identifier text not null,
  window_start timestamptz not null,
  count integer not null default 0,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint enquiry_rate_limits_pkey primary key (scope, identifier, window_start),
  constraint enquiry_rate_limits_count_check check (count >= 0)
);

create index if not exists enquiry_rate_limits_window_start_idx
  on public.enquiry_rate_limits (window_start);

create or replace function public.take_enquiry_rate_limit(
  p_scope text,
  p_identifier text,
  p_window_seconds integer,
  p_max_requests integer,
  p_now timestamptz default timezone('utc'::text, now())
)
returns table (
  allowed boolean,
  current_count integer,
  remaining integer,
  reset_at timestamptz,
  retry_after_seconds integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := coalesce(p_now, timezone('utc'::text, now()));
  v_window_start timestamptz;
  v_reset_at timestamptz;
  v_current_count integer;
begin
  if coalesce(btrim(p_scope), '') = '' then
    raise exception 'p_scope is required';
  end if;

  if coalesce(btrim(p_identifier), '') = '' then
    raise exception 'p_identifier is required';
  end if;

  if p_window_seconds is null or p_window_seconds <= 0 then
    raise exception 'p_window_seconds must be greater than zero';
  end if;

  if p_max_requests is null or p_max_requests <= 0 then
    raise exception 'p_max_requests must be greater than zero';
  end if;

  v_window_start := to_timestamp(
    floor(extract(epoch from v_now) / p_window_seconds) * p_window_seconds
  );
  v_reset_at := v_window_start + make_interval(secs => p_window_seconds);

  insert into public.enquiry_rate_limits (
    scope,
    identifier,
    window_start,
    count,
    created_at,
    updated_at
  )
  values (
    p_scope,
    p_identifier,
    v_window_start,
    1,
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  )
  on conflict (scope, identifier, window_start)
  do update
    set count = public.enquiry_rate_limits.count + 1,
        updated_at = timezone('utc'::text, now())
  returning public.enquiry_rate_limits.count into v_current_count;

  return query
  select
    v_current_count <= p_max_requests as allowed,
    v_current_count as current_count,
    greatest(p_max_requests - v_current_count, 0) as remaining,
    v_reset_at as reset_at,
    greatest(ceil(extract(epoch from (v_reset_at - v_now)))::integer, 0) as retry_after_seconds;
end;
$$;

create or replace function public.cleanup_enquiry_rate_limits(p_before timestamptz)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted bigint;
begin
  delete from public.enquiry_rate_limits
  where window_start < p_before;

  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

revoke all on function public.take_enquiry_rate_limit(text, text, integer, integer, timestamptz)
  from public, anon, authenticated;
revoke all on function public.cleanup_enquiry_rate_limits(timestamptz)
  from public, anon, authenticated;

grant execute on function public.take_enquiry_rate_limit(text, text, integer, integer, timestamptz)
  to service_role;
grant execute on function public.cleanup_enquiry_rate_limits(timestamptz)
  to service_role;
