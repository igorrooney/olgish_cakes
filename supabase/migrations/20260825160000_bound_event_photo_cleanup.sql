-- Bound the Events cleanup cron and keep retries fair. Candidate scheduling
-- contains only opaque request IDs and operational timestamps. The orphan
-- cursor contains only an opaque provider traversal token; no customer content
-- is persisted.

create table if not exists public.event_photo_cleanup_candidate_schedule (
  request_id uuid primary key
    references public.event_photo_requests (id)
    on delete cascade,
  next_attempt_at timestamptz not null,
  selected_at timestamptz not null,
  selection_count bigint not null default 1,
  constraint event_photo_cleanup_candidate_schedule_count_check check (
    selection_count > 0
  ),
  constraint event_photo_cleanup_candidate_schedule_time_check check (
    next_attempt_at > selected_at
  )
);

create index if not exists event_photo_cleanup_candidate_schedule_retry_idx
  on public.event_photo_cleanup_candidate_schedule (next_attempt_at, request_id);

alter table public.event_photo_cleanup_candidate_schedule enable row level security;

create table if not exists public.event_photo_orphan_cleanup_cursor (
  singleton boolean primary key default true check (singleton),
  object_cursor text,
  lease_token uuid,
  lease_expires_at timestamptz,
  updated_at timestamptz not null default clock_timestamp(),
  constraint event_photo_orphan_cleanup_cursor_token_check check (
    object_cursor is null
    or char_length(object_cursor) between 1 and 4096
  ),
  constraint event_photo_orphan_cleanup_cursor_lease_check check (
    (lease_token is null and lease_expires_at is null)
    or (lease_token is not null and lease_expires_at is not null)
  )
);

insert into public.event_photo_orphan_cleanup_cursor (singleton)
values (true)
on conflict (singleton) do nothing;

alter table public.event_photo_orphan_cleanup_cursor enable row level security;

create or replace function public.list_event_photo_cleanup_candidates(
  p_cutoff timestamptz,
  p_limit integer default 25
)
returns table (id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_ids uuid[] := '{}';
  selection_time timestamptz := clock_timestamp();
begin
  if p_cutoff is null
    or p_cutoff > selection_time
    or p_limit is null
    or p_limit not between 1 and 50
  then
    raise exception 'EVENT_PHOTO_CLEANUP_CANDIDATE_REQUEST_INVALID';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended('event-photo-cleanup-candidate-scheduler', 0)
  );

  select coalesce(array_agg(candidate.id order by candidate.queue_at, candidate.created_at, candidate.id), '{}')
  into selected_ids
  from (
    select
      request.id,
      request.created_at,
      coalesce(schedule.next_attempt_at, '-infinity'::timestamptz) as queue_at
    from public.event_photo_requests as request
    left join public.event_photo_cleanup_candidate_schedule as schedule
      on schedule.request_id = request.id
    where request.telegram_status in ('pending', 'failed', 'sent')
      and request.created_at < p_cutoff
      and request.legal_hold = false
      and request.files_deleted_at is null
      and coalesce(array_length(request.temp_image_paths, 1), 0) > 0
      and coalesce(schedule.next_attempt_at, '-infinity'::timestamptz) <= selection_time
    order by
      coalesce(schedule.next_attempt_at, '-infinity'::timestamptz),
      request.created_at,
      request.id
    limit p_limit
    for update of request skip locked
  ) as candidate;

  if coalesce(array_length(selected_ids, 1), 0) = 0 then
    return;
  end if;

  insert into public.event_photo_cleanup_candidate_schedule (
    request_id,
    next_attempt_at,
    selected_at,
    selection_count
  )
  select
    selected_id,
    selection_time + interval '15 minutes',
    selection_time,
    1
  from unnest(selected_ids) as selected(selected_id)
  on conflict (request_id) do update set
    next_attempt_at = excluded.next_attempt_at,
    selected_at = excluded.selected_at,
    selection_count =
      public.event_photo_cleanup_candidate_schedule.selection_count + 1;

  return query
  select selected.id
  from unnest(selected_ids) with ordinality as selected(id, position)
  order by selected.position;
end;
$$;

create or replace function public.claim_event_photo_orphan_cleanup_cursor()
returns table (
  status text,
  cursor_token uuid,
  object_cursor text,
  lease_expires_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_cursor public.event_photo_orphan_cleanup_cursor%rowtype;
  new_token uuid := gen_random_uuid();
  new_lease timestamptz := clock_timestamp() + interval '10 minutes';
begin
  perform pg_advisory_xact_lock(
    hashtextextended('event-photo-orphan-cleanup-cursor', 0)
  );

  select * into selected_cursor
  from public.event_photo_orphan_cleanup_cursor
  where singleton = true
  for update;

  if not found then
    raise exception 'EVENT_PHOTO_ORPHAN_CURSOR_MISSING';
  end if;

  if selected_cursor.lease_token is not null
    and selected_cursor.lease_expires_at > clock_timestamp()
  then
    return query select
      'busy'::text,
      null::uuid,
      selected_cursor.object_cursor,
      selected_cursor.lease_expires_at;
    return;
  end if;

  update public.event_photo_orphan_cleanup_cursor
  set
    lease_token = new_token,
    lease_expires_at = new_lease,
    updated_at = clock_timestamp()
  where singleton = true;

  return query select
    'claimed'::text,
    new_token,
    selected_cursor.object_cursor,
    new_lease;
end;
$$;

create or replace function public.finalize_event_photo_orphan_cleanup_cursor(
  p_cursor_token uuid,
  p_object_cursor text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  changed_count bigint := 0;
begin
  if p_cursor_token is null
    or (
      p_object_cursor is not null
      and char_length(p_object_cursor) not between 1 and 4096
    )
  then
    raise exception 'EVENT_PHOTO_ORPHAN_CURSOR_POSITION_INVALID';
  end if;

  update public.event_photo_orphan_cleanup_cursor
  set
    object_cursor = p_object_cursor,
    lease_token = null,
    lease_expires_at = null,
    updated_at = clock_timestamp()
  where singleton = true
    and lease_token = p_cursor_token;
  get diagnostics changed_count = row_count;

  return changed_count = 1;
end;
$$;

create or replace function public.release_event_photo_orphan_cleanup_cursor(
  p_cursor_token uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  changed_count bigint := 0;
begin
  if p_cursor_token is null then
    return false;
  end if;

  update public.event_photo_orphan_cleanup_cursor
  set
    lease_token = null,
    lease_expires_at = null,
    updated_at = clock_timestamp()
  where singleton = true
    and lease_token = p_cursor_token;
  get diagnostics changed_count = row_count;

  return changed_count = 1;
end;
$$;

create or replace function public.filter_referenced_event_photo_temp_paths(
  p_paths text[]
)
returns table (temp_image_path text)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(array_length(p_paths, 1), 0) not between 1 and 100
    or exists (
      select 1
      from unnest(p_paths) as supplied(path)
      where supplied.path is null
        or char_length(supplied.path) not between 1 and 1024
        or supplied.path !~ '^incoming/[^/].*$'
        or supplied.path like '%\%'
        or supplied.path like '%..%'
        or supplied.path like '%//%'
    )
  then
    raise exception 'EVENT_PHOTO_REFERENCE_FILTER_INVALID';
  end if;

  return query
  select distinct referenced.path
  from public.event_photo_requests as request
  cross join lateral unnest(
    coalesce(request.temp_image_paths, '{}'::text[])
  ) as referenced(path)
  where referenced.path = any(p_paths)
  order by referenced.path;
end;
$$;

revoke all on table public.event_photo_cleanup_candidate_schedule
  from public, anon, authenticated;
revoke all on table public.event_photo_orphan_cleanup_cursor
  from public, anon, authenticated;

grant select on table public.event_photo_cleanup_candidate_schedule
  to service_role;
grant select on table public.event_photo_orphan_cleanup_cursor
  to service_role;

revoke all on function public.list_event_photo_cleanup_candidates(timestamptz, integer)
  from public, anon, authenticated;
revoke all on function public.claim_event_photo_orphan_cleanup_cursor()
  from public, anon, authenticated;
revoke all on function public.finalize_event_photo_orphan_cleanup_cursor(uuid, text)
  from public, anon, authenticated;
revoke all on function public.release_event_photo_orphan_cleanup_cursor(uuid)
  from public, anon, authenticated;
revoke all on function public.filter_referenced_event_photo_temp_paths(text[])
  from public, anon, authenticated;

grant execute on function public.list_event_photo_cleanup_candidates(timestamptz, integer)
  to service_role;
grant execute on function public.claim_event_photo_orphan_cleanup_cursor()
  to service_role;
grant execute on function public.finalize_event_photo_orphan_cleanup_cursor(uuid, text)
  to service_role;
grant execute on function public.release_event_photo_orphan_cleanup_cursor(uuid)
  to service_role;
grant execute on function public.filter_referenced_event_photo_temp_paths(text[])
  to service_role;
