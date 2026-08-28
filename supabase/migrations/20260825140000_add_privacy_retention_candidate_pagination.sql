-- Bounded, server-authoritative privacy-retention discovery.
-- This migration intentionally follows the health-retention migration because
-- its candidate set includes the health-specific deadline columns.

create or replace function public.enforce_canonical_retention_storage_bucket()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  new_bucket text;
  old_bucket text;
  canonical_bucket text;
begin
  if tg_table_name = 'event_photo_requests' then
    new_bucket := new.temp_image_bucket;
    old_bucket := case when tg_op = 'UPDATE' then old.temp_image_bucket else null end;
    canonical_bucket := 'event-photo-temp-uploads';
  elsif tg_table_name = 'custom_cake_enquiries' then
    new_bucket := new.reference_image_bucket;
    old_bucket := case when tg_op = 'UPDATE' then old.reference_image_bucket else null end;
    canonical_bucket := 'custom-cake-enquiries';
  else
    raise exception 'Unsupported retention storage table';
  end if;

  -- Existing legacy rows remain updateable and can be remediated by copying
  -- the object first, then changing only the bucket to the canonical value.
  if nullif(btrim(new_bucket), '') is not null
    and new_bucket <> canonical_bucket
    and (tg_op = 'INSERT' or new_bucket is distinct from old_bucket)
  then
    raise exception 'RETENTION_STORAGE_BUCKET_NONCANONICAL';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_event_photo_retention_bucket
  on public.event_photo_requests;
create trigger enforce_event_photo_retention_bucket
before insert or update of temp_image_bucket
on public.event_photo_requests
for each row execute function public.enforce_canonical_retention_storage_bucket();

drop trigger if exists enforce_custom_cake_retention_bucket
  on public.custom_cake_enquiries;
create trigger enforce_custom_cake_retention_bucket
before insert or update of reference_image_bucket
on public.custom_cake_enquiries
for each row execute function public.enforce_canonical_retention_storage_bucket();

create or replace function public.list_noncanonical_retention_storage_records()
returns table (
  record_type text,
  record_reference text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    records.record_type,
    records.record_reference
  from (
    select
      'event-photo-request'::text as record_type,
      'event-photo-' || request.id::text as record_reference
    from public.event_photo_requests as request
    where nullif(btrim(request.temp_image_bucket), '') is not null
      and request.temp_image_bucket <> 'event-photo-temp-uploads'
      and cardinality(coalesce(request.temp_image_paths, '{}'::text[])) > 0

    union all

    select
      'custom-cake-enquiry'::text as record_type,
      'custom-cake-' || enquiry.id::text as record_reference
    from public.custom_cake_enquiries as enquiry
    where nullif(btrim(enquiry.reference_image_bucket), '') is not null
      and enquiry.reference_image_bucket <> 'custom-cake-enquiries'
      and nullif(btrim(enquiry.reference_image_path), '') is not null
  ) as records
  order by records.record_type, records.record_reference
$$;

create index if not exists contact_enquiries_retention_page_idx
  on public.contact_enquiries (retention_due_at, id)
  where lifecycle_status = 'closed' and retention_due_at is not null;

create index if not exists custom_cake_enquiries_retention_page_idx
  on public.custom_cake_enquiries (retention_due_at, id)
  where lifecycle_status = 'closed' and retention_due_at is not null;

create index if not exists workshop_enquiries_retention_page_idx
  on public.workshop_enquiries (retention_due_at, id)
  where lifecycle_status = 'closed' and retention_due_at is not null;

create index if not exists event_photo_requests_retention_page_idx
  on public.event_photo_requests (retention_due_at, id)
  where lifecycle_status = 'closed' and retention_due_at is not null;

create index if not exists orders_retention_page_idx
  on public.orders (retention_due_at, id)
  where status in ('completed', 'delivered', 'cancelled')
    and retention_due_at is not null;

create index if not exists enquiry_rate_limits_retention_page_idx
  on public.enquiry_rate_limits (updated_at, scope, identifier, window_start);

create index if not exists admin_login_attempts_retention_page_idx
  on public.admin_login_attempts (failed_at, id);

create index if not exists event_photo_rate_limit_attempts_retention_page_idx
  on public.event_photo_rate_limit_attempts (attempted_at, id);

-- One unresolved candidate belongs to one persisted run. The unique partial
-- index closes the race between two admins creating runs from fresh previews;
-- the already-running action must be resumed instead of duplicated.
do $$
begin
  if exists (
    select 1
    from public.privacy_retention_actions as action
    where action.outcome = 'pending'
    group by action.candidate_id
    having count(*) > 1
  ) then
    raise exception 'RETENTION_PENDING_ACTION_DUPLICATES_REQUIRE_RECONCILIATION';
  end if;
end;
$$;

create unique index if not exists privacy_retention_actions_one_pending_candidate_idx
  on public.privacy_retention_actions (candidate_id)
  where outcome = 'pending';

create or replace function public.privacy_retention_candidate_rows(
  p_cutoff timestamptz,
  p_candidate_ids text[]
)
returns table (
  candidate_id text,
  category text,
  record_type text,
  record_reference text,
  due_at timestamptz,
  reason text,
  removes text[],
  retains text[],
  item_count bigint,
  held boolean,
  hold_reason text,
  hold_review_at timestamptz,
  snapshot_revision text
)
language sql
stable
security definer
set search_path = ''
as $$
  with linked_enquiries as materialized (
    select
      linked.order_id,
      count(*)::bigint as row_count,
      bool_or(linked.legal_hold) as held,
      (array_agg(linked.legal_hold_reason order by linked.record_key)
        filter (where linked.legal_hold))[1] as hold_reason,
      (array_agg(linked.legal_hold_review_at order by linked.record_key)
        filter (where linked.legal_hold))[1] as hold_review_at,
      coalesce(
        jsonb_agg(linked.revision order by linked.record_key),
        '[]'::jsonb
      ) as revisions,
      count(distinct linked.storage_path)
        filter (where linked.storage_path is not null)::bigint as storage_count
    from (
      select
        enquiry.converted_order_id as order_id,
        'contact:' || enquiry.id::text as record_key,
        enquiry.legal_hold,
        enquiry.legal_hold_reason,
        enquiry.legal_hold_review_at,
        null::text as storage_path,
        to_jsonb(enquiry) as revision
      from public.contact_enquiries as enquiry
      where enquiry.converted_order_id is not null
        and enquiry.lifecycle_status = 'converted'
        and (
          'order:' || enquiry.converted_order_id::text = any(p_candidate_ids)
          or 'order-upload:' || enquiry.converted_order_id::text = any(p_candidate_ids)
          or 'health:order:' || enquiry.converted_order_id::text = any(p_candidate_ids)
          or 'health:enquiry:contact:' || enquiry.id::text = any(p_candidate_ids)
        )

      union all

      select
        enquiry.converted_order_id,
        'custom-cake:' || enquiry.id::text,
        enquiry.legal_hold,
        enquiry.legal_hold_reason,
        enquiry.legal_hold_review_at,
        nullif(btrim(enquiry.reference_image_path), ''),
        to_jsonb(enquiry)
      from public.custom_cake_enquiries as enquiry
      where enquiry.converted_order_id is not null
        and enquiry.lifecycle_status = 'converted'
        and (
          'order:' || enquiry.converted_order_id::text = any(p_candidate_ids)
          or 'order-upload:' || enquiry.converted_order_id::text = any(p_candidate_ids)
          or 'health:order:' || enquiry.converted_order_id::text = any(p_candidate_ids)
          or 'enquiry-upload:custom-cake:' || enquiry.id::text = any(p_candidate_ids)
          or 'health:enquiry:custom-cake:' || enquiry.id::text = any(p_candidate_ids)
        )

      union all

      select
        enquiry.converted_order_id,
        'workshop:' || enquiry.id::text,
        enquiry.legal_hold,
        enquiry.legal_hold_reason,
        enquiry.legal_hold_review_at,
        null::text,
        to_jsonb(enquiry)
      from public.workshop_enquiries as enquiry
      where enquiry.converted_order_id is not null
        and enquiry.lifecycle_status = 'converted'
        and (
          'order:' || enquiry.converted_order_id::text = any(p_candidate_ids)
          or 'order-upload:' || enquiry.converted_order_id::text = any(p_candidate_ids)
          or 'health:order:' || enquiry.converted_order_id::text = any(p_candidate_ids)
          or 'health:enquiry:workshop:' || enquiry.id::text = any(p_candidate_ids)
        )
    ) as linked
    group by linked.order_id
  ),
  order_child_counts as materialized (
    select
      orders.id as order_id,
      (select count(*) from public.order_items where order_id = orders.id)::bigint as item_rows,
      (select count(*) from public.order_messages where order_id = orders.id)::bigint as message_rows,
      (
        select count(*)
        from public.order_message_attachments as attachment
        join public.order_messages as message on message.id = attachment.message_id
        where message.order_id = orders.id
      )::bigint as attachment_rows,
      (select count(*) from public.order_notes where order_id = orders.id)::bigint as note_rows,
      (
        select count(*)
        from public.order_note_images as image
        join public.order_notes as note on note.id = image.note_id
        where note.order_id = orders.id
      )::bigint as image_rows,
      jsonb_build_object(
        'order', to_jsonb(orders),
        'items', coalesce((
          select jsonb_agg(to_jsonb(item) order by item.id)
          from public.order_items as item
          where item.order_id = orders.id
        ), '[]'::jsonb),
        'messages', coalesce((
          select jsonb_agg(to_jsonb(message) order by message.id)
          from public.order_messages as message
          where message.order_id = orders.id
        ), '[]'::jsonb),
        'attachments', coalesce((
          select jsonb_agg(to_jsonb(attachment) order by attachment.id)
          from public.order_message_attachments as attachment
          join public.order_messages as message on message.id = attachment.message_id
          where message.order_id = orders.id
        ), '[]'::jsonb),
        'notes', coalesce((
          select jsonb_agg(to_jsonb(note) order by note.id)
          from public.order_notes as note
          where note.order_id = orders.id
        ), '[]'::jsonb),
        'images', coalesce((
          select jsonb_agg(to_jsonb(image) order by image.id)
          from public.order_note_images as image
          join public.order_notes as note on note.id = image.note_id
          where note.order_id = orders.id
        ), '[]'::jsonb)
      ) as revision
    from public.orders as orders
    where (
      orders.status in ('completed', 'delivered', 'cancelled')
      and (
        (orders.retention_due_at is not null and orders.retention_due_at <= p_cutoff)
        or (
          orders.completed_at is not null
          and orders.completed_at + interval '24 months' <= p_cutoff
        )
      )
    ) and (
      'order:' || orders.id::text = any(p_candidate_ids)
      or 'order-upload:' || orders.id::text = any(p_candidate_ids)
    ) or (
      orders.dietary_health_retention_due_at is not null
      and orders.dietary_health_retention_due_at <= p_cutoff
      and orders.dietary_health_erased_at is null
      and 'health:order:' || orders.id::text = any(p_candidate_ids)
    )
  ),
  order_storage_references as materialized (
    select distinct reference.order_id, reference.path
    from (
      select
        message.order_id,
        nullif(btrim(attachment.asset_ref), '') as path
      from public.order_message_attachments as attachment
      join public.order_messages as message on message.id = attachment.message_id
      where attachment.asset_type = 'supabase-file'
        and (
          'order:' || message.order_id::text = any(p_candidate_ids)
          or 'order-upload:' || message.order_id::text = any(p_candidate_ids)
        )

      union all

      select
        message.order_id,
        nullif(btrim(attachment.asset_id), '')
      from public.order_message_attachments as attachment
      join public.order_messages as message on message.id = attachment.message_id
      where attachment.asset_type = 'supabase-file'
        and (
          'order:' || message.order_id::text = any(p_candidate_ids)
          or 'order-upload:' || message.order_id::text = any(p_candidate_ids)
        )

      union all

      select
        note.order_id,
        nullif(btrim(image.asset_ref), '')
      from public.order_note_images as image
      join public.order_notes as note on note.id = image.note_id
      where image.asset_type = 'supabase-file'
        and (
          'order:' || note.order_id::text = any(p_candidate_ids)
          or 'order-upload:' || note.order_id::text = any(p_candidate_ids)
        )

      union all

      select
        note.order_id,
        nullif(btrim(image.asset_id), '')
      from public.order_note_images as image
      join public.order_notes as note on note.id = image.note_id
      where image.asset_type = 'supabase-file'
        and (
          'order:' || note.order_id::text = any(p_candidate_ids)
          or 'order-upload:' || note.order_id::text = any(p_candidate_ids)
        )

      union all

      select
        message.order_id,
        nullif(btrim(legacy_attachment->'asset'->>'_ref'), '')
      from public.order_messages as message
      cross join lateral jsonb_array_elements(
        case
          when jsonb_typeof(message.legacy_message->'attachments') = 'array'
            then message.legacy_message->'attachments'
          else '[]'::jsonb
        end
      ) as legacy_attachment
      where legacy_attachment->'asset'->>'_type' = 'supabase-file'
        and (
          'order:' || message.order_id::text = any(p_candidate_ids)
          or 'order-upload:' || message.order_id::text = any(p_candidate_ids)
        )

      union all

      select
        message.order_id,
        nullif(btrim(legacy_attachment->'asset'->>'_id'), '')
      from public.order_messages as message
      cross join lateral jsonb_array_elements(
        case
          when jsonb_typeof(message.legacy_message->'attachments') = 'array'
            then message.legacy_message->'attachments'
          else '[]'::jsonb
        end
      ) as legacy_attachment
      where legacy_attachment->'asset'->>'_type' = 'supabase-file'
        and (
          'order:' || message.order_id::text = any(p_candidate_ids)
          or 'order-upload:' || message.order_id::text = any(p_candidate_ids)
        )

      union all

      select
        note.order_id,
        nullif(btrim(legacy_image->'asset'->>'_ref'), '')
      from public.order_notes as note
      cross join lateral jsonb_array_elements(
        case
          when jsonb_typeof(note.legacy_note->'images') = 'array'
            then note.legacy_note->'images'
          else '[]'::jsonb
        end
      ) as legacy_image
      where legacy_image->'asset'->>'_type' = 'supabase-file'
        and (
          'order:' || note.order_id::text = any(p_candidate_ids)
          or 'order-upload:' || note.order_id::text = any(p_candidate_ids)
        )

      union all

      select
        note.order_id,
        nullif(btrim(legacy_image->'asset'->>'_id'), '')
      from public.order_notes as note
      cross join lateral jsonb_array_elements(
        case
          when jsonb_typeof(note.legacy_note->'images') = 'array'
            then note.legacy_note->'images'
          else '[]'::jsonb
        end
      ) as legacy_image
      where legacy_image->'asset'->>'_type' = 'supabase-file'
        and (
          'order:' || note.order_id::text = any(p_candidate_ids)
          or 'order-upload:' || note.order_id::text = any(p_candidate_ids)
        )

      union all

      select
        enquiry.converted_order_id,
        nullif(btrim(enquiry.reference_image_path), '')
      from public.custom_cake_enquiries as enquiry
      where enquiry.converted_order_id is not null
        and enquiry.lifecycle_status = 'converted'
        and 'order:' || enquiry.converted_order_id::text = any(p_candidate_ids)
    ) as reference
    where reference.path is not null
  ),
  order_storage_counts as materialized (
    select
      reference.order_id,
      count(*)::bigint as storage_count,
      jsonb_agg(reference.path order by reference.path) as revisions
    from order_storage_references as reference
    group by reference.order_id
  ),
  candidates as materialized (
    select
      'enquiry:contact:' || enquiry.id::text as candidate_id,
      'expired-enquiry'::text as category,
      'Contact enquiry'::text as record_type,
      'contact-' || enquiry.id::text as record_reference,
      enquiry.retention_due_at as due_at,
      'The documented enquiry-retention deadline has passed.'::text as reason,
      array['The enquiry record and its customer information']::text[] as removes,
      array['Only the non-sensitive deletion audit entry']::text[] as retains,
      1::bigint as item_count,
      enquiry.legal_hold as held,
      enquiry.legal_hold_reason as hold_reason,
      enquiry.legal_hold_review_at as hold_review_at,
      encode(pg_catalog.sha256(convert_to(to_jsonb(enquiry)::text, 'UTF8')), 'hex') as snapshot_revision
    from public.contact_enquiries as enquiry
    where enquiry.lifecycle_status = 'closed'
      and enquiry.retention_due_at is not null
      and enquiry.retention_due_at <= p_cutoff
      and 'enquiry:contact:' || enquiry.id::text = any(p_candidate_ids)

    union all

    select
      'enquiry:custom-cake:' || enquiry.id::text,
      'expired-enquiry',
      'Custom-cake enquiry',
      'custom-cake-' || enquiry.id::text,
      enquiry.retention_due_at,
      'The documented enquiry-retention deadline has passed.',
      array['The enquiry record and its customer information'] ||
        case when nullif(btrim(enquiry.reference_image_path), '') is not null
          then array['Its remaining uploaded files']::text[] else '{}'::text[] end,
      array['Only the non-sensitive deletion audit entry'],
      1::bigint + case when nullif(btrim(enquiry.reference_image_path), '') is not null then 1 else 0 end,
      enquiry.legal_hold,
      enquiry.legal_hold_reason,
      enquiry.legal_hold_review_at,
      encode(pg_catalog.sha256(convert_to(to_jsonb(enquiry)::text, 'UTF8')), 'hex')
    from public.custom_cake_enquiries as enquiry
    where enquiry.lifecycle_status = 'closed'
      and enquiry.retention_due_at is not null
      and enquiry.retention_due_at <= p_cutoff
      and 'enquiry:custom-cake:' || enquiry.id::text = any(p_candidate_ids)

    union all

    select
      'enquiry:workshop:' || enquiry.id::text,
      'expired-enquiry',
      'Workshop enquiry',
      'workshop-' || enquiry.id::text,
      enquiry.retention_due_at,
      'The documented enquiry-retention deadline has passed.',
      array['The enquiry record and its customer information'],
      array['Only the non-sensitive deletion audit entry'],
      1::bigint,
      enquiry.legal_hold,
      enquiry.legal_hold_reason,
      enquiry.legal_hold_review_at,
      encode(pg_catalog.sha256(convert_to(to_jsonb(enquiry)::text, 'UTF8')), 'hex')
    from public.workshop_enquiries as enquiry
    where enquiry.lifecycle_status = 'closed'
      and enquiry.retention_due_at is not null
      and enquiry.retention_due_at <= p_cutoff
      and 'enquiry:workshop:' || enquiry.id::text = any(p_candidate_ids)

    union all

    select
      'enquiry:event-photo:' || enquiry.id::text,
      'expired-enquiry',
      'Event-photo request',
      'event-photo-' || enquiry.id::text,
      enquiry.retention_due_at,
      'The documented enquiry-retention deadline has passed.',
      array['The enquiry record and its customer information'] ||
        case when cardinality(coalesce(enquiry.temp_image_paths, '{}'::text[])) > 0
          then array['Its remaining uploaded files']::text[] else '{}'::text[] end,
      array['Only the non-sensitive deletion audit entry'],
      1::bigint + cardinality(coalesce(enquiry.temp_image_paths, '{}'::text[])),
      enquiry.legal_hold,
      enquiry.legal_hold_reason,
      enquiry.legal_hold_review_at,
      encode(pg_catalog.sha256(convert_to(to_jsonb(enquiry)::text, 'UTF8')), 'hex')
    from public.event_photo_requests as enquiry
    where enquiry.lifecycle_status = 'closed'
      and enquiry.retention_due_at is not null
      and enquiry.retention_due_at <= p_cutoff
      and 'enquiry:event-photo:' || enquiry.id::text = any(p_candidate_ids)

    union all

    select
      'enquiry-upload:custom-cake:' || enquiry.id::text,
      'expired-enquiry-upload',
      'Custom-cake enquiry upload',
      'custom-cake-' || enquiry.id::text,
      enquiry.upload_retention_due_at,
      'The separate upload-retention deadline has passed.',
      array['The stored uploaded file and its file metadata'],
      array['The underlying enquiry or order record until its own deadline'],
      1::bigint,
      enquiry.legal_hold or coalesce(orders.legal_hold, false),
      case when enquiry.legal_hold then enquiry.legal_hold_reason else orders.legal_hold_reason end,
      case when enquiry.legal_hold then enquiry.legal_hold_review_at else orders.legal_hold_review_at end,
      encode(pg_catalog.sha256(convert_to(jsonb_build_object(
        'enquiry', to_jsonb(enquiry), 'orderHold', jsonb_build_object(
          'held', orders.legal_hold,
          'reason', orders.legal_hold_reason,
          'reviewAt', orders.legal_hold_review_at
        )
      )::text, 'UTF8')), 'hex')
    from public.custom_cake_enquiries as enquiry
    left join public.orders as orders on orders.id = enquiry.converted_order_id
    where enquiry.upload_retention_due_at is not null
      and enquiry.upload_retention_due_at <= p_cutoff
      and nullif(btrim(enquiry.reference_image_path), '') is not null
      and (enquiry.retention_due_at is null or enquiry.retention_due_at > p_cutoff)
      and not (
        orders.status in ('completed', 'delivered', 'cancelled')
        and orders.retention_due_at is not null
        and orders.retention_due_at <= p_cutoff
      )
      and 'enquiry-upload:custom-cake:' || enquiry.id::text = any(p_candidate_ids)

    union all

    select
      'enquiry-upload:event-photo:' || enquiry.id::text,
      'expired-enquiry-upload',
      'Event-photo request upload',
      'event-photo-' || enquiry.id::text,
      enquiry.upload_retention_due_at,
      'The separate upload-retention deadline has passed.',
      array['The stored uploaded file and its file metadata'],
      array['The underlying enquiry or order record until its own deadline'],
      cardinality(enquiry.temp_image_paths)::bigint,
      enquiry.legal_hold,
      enquiry.legal_hold_reason,
      enquiry.legal_hold_review_at,
      encode(pg_catalog.sha256(convert_to(to_jsonb(enquiry)::text, 'UTF8')), 'hex')
    from public.event_photo_requests as enquiry
    where enquiry.upload_retention_due_at is not null
      and enquiry.upload_retention_due_at <= p_cutoff
      and cardinality(coalesce(enquiry.temp_image_paths, '{}'::text[])) > 0
      and (enquiry.retention_due_at is null or enquiry.retention_due_at > p_cutoff)
      and 'enquiry-upload:event-photo:' || enquiry.id::text = any(p_candidate_ids)

    union all

    select
      'order:' || orders.id::text,
      'expired-order',
      'Order record',
      orders.order_number,
      orders.retention_due_at,
      'The six-year order and financial-record retention deadline has passed.',
      array[
        'The core order, customer, delivery, payment and accounting fields',
        'Every order item linked to the order',
        'Every customer/staff message and its attachment metadata',
        'Every internal note and its image metadata',
        'Any remaining Supabase-hosted order or converted-enquiry uploads'
      ]::text[],
      array['Only the non-sensitive deletion audit entry'],
      1::bigint +
        coalesce(children.item_rows, 0) +
        coalesce(children.message_rows, 0) +
        coalesce(children.attachment_rows, 0) +
        coalesce(children.note_rows, 0) +
        coalesce(children.image_rows, 0) +
        coalesce(linked.row_count, 0) +
        coalesce(storage.storage_count, 0),
      orders.legal_hold or coalesce(linked.held, false),
      case when orders.legal_hold then orders.legal_hold_reason else linked.hold_reason end,
      case when orders.legal_hold then orders.legal_hold_review_at else linked.hold_review_at end,
      encode(pg_catalog.sha256(convert_to(jsonb_build_object(
        'children', children.revision,
        'linkedEnquiries', coalesce(linked.revisions, '[]'::jsonb),
        'storageReferences', coalesce(storage.revisions, '[]'::jsonb)
      )::text, 'UTF8')), 'hex')
    from public.orders as orders
    join order_child_counts as children on children.order_id = orders.id
    left join linked_enquiries as linked on linked.order_id = orders.id
    left join order_storage_counts as storage on storage.order_id = orders.id
    where orders.status in ('completed', 'delivered', 'cancelled')
      and orders.retention_due_at is not null
      and orders.retention_due_at <= p_cutoff
      and 'order:' || orders.id::text = any(p_candidate_ids)

    union all

    select
      'order-upload:' || orders.id::text,
      'expired-order-upload',
      'Order uploads',
      orders.order_number,
      orders.completed_at + interval '24 months',
      'The 24-month order-upload retention deadline has passed.',
      array['Customer reference uploads, staff note images and their file metadata'],
      array['The core order, payment and accounting record until its own deadline'],
      storage.storage_count,
      orders.legal_hold or coalesce(linked.held, false),
      case when orders.legal_hold then orders.legal_hold_reason else linked.hold_reason end,
      case when orders.legal_hold then orders.legal_hold_review_at else linked.hold_review_at end,
      encode(pg_catalog.sha256(convert_to(jsonb_build_object(
        'children', children.revision,
        'linkedEnquiries', coalesce(linked.revisions, '[]'::jsonb),
        'storageReferences', storage.revisions
      )::text, 'UTF8')), 'hex')
    from public.orders as orders
    join order_child_counts as children on children.order_id = orders.id
    join order_storage_counts as storage on storage.order_id = orders.id
    left join linked_enquiries as linked on linked.order_id = orders.id
    where orders.status in ('completed', 'delivered', 'cancelled')
      and orders.completed_at is not null
      and orders.completed_at + interval '24 months' <= p_cutoff
      and (orders.retention_due_at is null or orders.retention_due_at > p_cutoff)
      and 'order-upload:' || orders.id::text = any(p_candidate_ids)

    union all

    select
      'health:enquiry:contact:' || enquiry.id::text,
      'expired-health-information',
      'Enquiry health information',
      'contact-' || enquiry.id::text,
      enquiry.dietary_health_retention_due_at,
      'The short operational retention deadline for protected dietary-health information has passed.',
      array['The dietary-health information supplied with this enquiry'],
      array['Consent and erasure evidence without the dietary-health wording'],
      1::bigint,
      enquiry.legal_hold or coalesce(orders.legal_hold, false),
      case when enquiry.legal_hold then enquiry.legal_hold_reason else orders.legal_hold_reason end,
      case when enquiry.legal_hold then enquiry.legal_hold_review_at else orders.legal_hold_review_at end,
      encode(pg_catalog.sha256(convert_to(jsonb_build_object(
        'enquiry', to_jsonb(enquiry),
        'linkedOrder', to_jsonb(orders)
      )::text, 'UTF8')), 'hex')
    from public.contact_enquiries as enquiry
    left join public.orders as orders on orders.id = enquiry.converted_order_id
    where enquiry.dietary_health_retention_due_at is not null
      and enquiry.dietary_health_retention_due_at <= p_cutoff
      and enquiry.dietary_health_erased_at is null
      and enquiry.dietary_health_withdrawn_at is null
      and enquiry.dietary_health_consent = true
      and nullif(btrim(enquiry.dietary_health_information), '') is not null
      and not (
        enquiry.lifecycle_status = 'closed'
        and enquiry.retention_due_at is not null
        and enquiry.retention_due_at <= p_cutoff
      )
      and not exists (
        select 1 from public.orders as due_order
        where due_order.id = enquiry.converted_order_id
          and due_order.status in ('completed', 'delivered', 'cancelled')
          and due_order.retention_due_at is not null
          and due_order.retention_due_at <= p_cutoff
      )
      and 'health:enquiry:contact:' || enquiry.id::text = any(p_candidate_ids)

    union all

    select
      'health:enquiry:custom-cake:' || enquiry.id::text,
      'expired-health-information',
      'Enquiry health information',
      'custom-cake-' || enquiry.id::text,
      enquiry.dietary_health_retention_due_at,
      'The short operational retention deadline for protected dietary-health information has passed.',
      array['The dietary-health information supplied with this enquiry'],
      array['Consent and erasure evidence without the dietary-health wording'],
      1::bigint,
      enquiry.legal_hold or coalesce(orders.legal_hold, false),
      case when enquiry.legal_hold then enquiry.legal_hold_reason else orders.legal_hold_reason end,
      case when enquiry.legal_hold then enquiry.legal_hold_review_at else orders.legal_hold_review_at end,
      encode(pg_catalog.sha256(convert_to(jsonb_build_object(
        'enquiry', to_jsonb(enquiry),
        'linkedOrder', to_jsonb(orders)
      )::text, 'UTF8')), 'hex')
    from public.custom_cake_enquiries as enquiry
    left join public.orders as orders on orders.id = enquiry.converted_order_id
    where enquiry.dietary_health_retention_due_at is not null
      and enquiry.dietary_health_retention_due_at <= p_cutoff
      and enquiry.dietary_health_erased_at is null
      and enquiry.dietary_health_withdrawn_at is null
      and enquiry.dietary_health_consent = true
      and nullif(btrim(enquiry.dietary_health_information), '') is not null
      and not (
        enquiry.lifecycle_status = 'closed'
        and enquiry.retention_due_at is not null
        and enquiry.retention_due_at <= p_cutoff
      )
      and not exists (
        select 1 from public.orders as due_order
        where due_order.id = enquiry.converted_order_id
          and due_order.status in ('completed', 'delivered', 'cancelled')
          and due_order.retention_due_at is not null
          and due_order.retention_due_at <= p_cutoff
      )
      and 'health:enquiry:custom-cake:' || enquiry.id::text = any(p_candidate_ids)

    union all

    select
      'health:enquiry:workshop:' || enquiry.id::text,
      'expired-health-information',
      'Enquiry health information',
      'workshop-' || enquiry.id::text,
      enquiry.dietary_health_retention_due_at,
      'The short operational retention deadline for protected dietary-health information has passed.',
      array['The dietary-health information supplied with this enquiry'],
      array['Consent and erasure evidence without the dietary-health wording'],
      1::bigint,
      enquiry.legal_hold or coalesce(orders.legal_hold, false),
      case when enquiry.legal_hold then enquiry.legal_hold_reason else orders.legal_hold_reason end,
      case when enquiry.legal_hold then enquiry.legal_hold_review_at else orders.legal_hold_review_at end,
      encode(pg_catalog.sha256(convert_to(jsonb_build_object(
        'enquiry', to_jsonb(enquiry),
        'linkedOrder', to_jsonb(orders)
      )::text, 'UTF8')), 'hex')
    from public.workshop_enquiries as enquiry
    left join public.orders as orders on orders.id = enquiry.converted_order_id
    where enquiry.dietary_health_retention_due_at is not null
      and enquiry.dietary_health_retention_due_at <= p_cutoff
      and enquiry.dietary_health_erased_at is null
      and enquiry.dietary_health_withdrawn_at is null
      and enquiry.dietary_health_consent = true
      and nullif(btrim(enquiry.dietary_health_information), '') is not null
      and not (
        enquiry.lifecycle_status = 'closed'
        and enquiry.retention_due_at is not null
        and enquiry.retention_due_at <= p_cutoff
      )
      and not exists (
        select 1 from public.orders as due_order
        where due_order.id = enquiry.converted_order_id
          and due_order.status in ('completed', 'delivered', 'cancelled')
          and due_order.retention_due_at is not null
          and due_order.retention_due_at <= p_cutoff
      )
      and 'health:enquiry:workshop:' || enquiry.id::text = any(p_candidate_ids)

    union all

    select
      'health:order:' || orders.id::text,
      'expired-health-information',
      'Order health information',
      orders.order_number,
      orders.dietary_health_retention_due_at,
      'The short operational retention deadline for protected dietary-health information has passed.',
      array['The dietary-health information supplied with this order'],
      array['Consent and erasure evidence without the dietary-health wording'],
      1::bigint,
      orders.legal_hold or coalesce(linked.held, false),
      case when orders.legal_hold then orders.legal_hold_reason else linked.hold_reason end,
      case when orders.legal_hold then orders.legal_hold_review_at else linked.hold_review_at end,
      encode(pg_catalog.sha256(convert_to(jsonb_build_object(
        'order', to_jsonb(orders),
        'linkedEnquiries', coalesce(linked.revisions, '[]'::jsonb)
      )::text, 'UTF8')), 'hex')
    from public.orders as orders
    left join linked_enquiries as linked on linked.order_id = orders.id
    where orders.dietary_health_retention_due_at is not null
      and orders.dietary_health_retention_due_at <= p_cutoff
      and orders.dietary_health_erased_at is null
      and nullif(btrim(orders.metadata->>'dietaryHealthWithdrawnAt'), '') is null
      and orders.metadata->'dietaryHealthConsent' = 'true'::jsonb
      and nullif(btrim(orders.metadata->>'dietaryHealthInformation'), '') is not null
      and not (
        orders.status in ('completed', 'delivered', 'cancelled')
        and orders.retention_due_at is not null
        and orders.retention_due_at <= p_cutoff
      )
      and 'health:order:' || orders.id::text = any(p_candidate_ids)

    union all

    select
      'security:enquiry-rate-limits',
      'expired-security-record',
      'Enquiry rate-limit records',
      'enquiry-rate-limits',
      p_cutoff - interval '90 days',
      'These security records are older than the published 90-day period.',
      array[counts.item_count::text || ' expired security or abuse-prevention records'],
      array['Newer security records and aggregate deletion counts'],
      counts.item_count,
      holds.record_type is not null,
      holds.reason,
      holds.review_at,
      counts.snapshot_revision
    from (
      select
        count(*)::bigint as item_count,
        encode(pg_catalog.sha256(convert_to(coalesce(
          jsonb_agg(to_jsonb(row_value) order by row_value.updated_at, row_value.scope, row_value.identifier, row_value.window_start)::text,
          '[]'
        ), 'UTF8')), 'hex') as snapshot_revision
      from (
        select * from public.enquiry_rate_limits
        where updated_at < p_cutoff - interval '90 days'
        order by updated_at, scope, identifier, window_start
        limit 500
      ) as row_value
    ) as counts
    left join public.privacy_retention_security_holds as holds
      on holds.record_type = 'enquiry-rate-limits'
    where counts.item_count > 0
      and 'security:enquiry-rate-limits' = any(p_candidate_ids)

    union all

    select
      'security:admin-login-attempts',
      'expired-security-record',
      'Admin login-attempt records',
      'admin-login-attempts',
      p_cutoff - interval '90 days',
      'These security records are older than the published 90-day period.',
      array[counts.item_count::text || ' expired security or abuse-prevention records'],
      array['Newer security records and aggregate deletion counts'],
      counts.item_count,
      holds.record_type is not null,
      holds.reason,
      holds.review_at,
      counts.snapshot_revision
    from (
      select
        count(*)::bigint as item_count,
        encode(pg_catalog.sha256(convert_to(coalesce(
          jsonb_agg(to_jsonb(row_value) order by row_value.failed_at, row_value.id)::text,
          '[]'
        ), 'UTF8')), 'hex') as snapshot_revision
      from (
        select * from public.admin_login_attempts
        where failed_at < p_cutoff - interval '90 days'
        order by failed_at, id
        limit 500
      ) as row_value
    ) as counts
    left join public.privacy_retention_security_holds as holds
      on holds.record_type = 'admin-login-attempts'
    where counts.item_count > 0
      and 'security:admin-login-attempts' = any(p_candidate_ids)

    union all

    select
      'security:event-photo-rate-limits',
      'expired-security-record',
      'Event-photo rate-limit records',
      'event-photo-rate-limits',
      p_cutoff - interval '90 days',
      'These security records are older than the published 90-day period.',
      array[counts.item_count::text || ' expired security or abuse-prevention records'],
      array['Newer security records and aggregate deletion counts'],
      counts.item_count,
      holds.record_type is not null,
      holds.reason,
      holds.review_at,
      counts.snapshot_revision
    from (
      select
        count(*)::bigint as item_count,
        encode(pg_catalog.sha256(convert_to(coalesce(
          jsonb_agg(to_jsonb(row_value) order by row_value.attempted_at, row_value.id)::text,
          '[]'
        ), 'UTF8')), 'hex') as snapshot_revision
      from (
        select * from public.event_photo_rate_limit_attempts
        where attempted_at < p_cutoff - interval '90 days'
        order by attempted_at, id
        limit 500
      ) as row_value
    ) as counts
    left join public.privacy_retention_security_holds as holds
      on holds.record_type = 'event-photo-rate-limits'
    where counts.item_count > 0
      and 'security:event-photo-rate-limits' = any(p_candidate_ids)
  )
  select * from candidates
$$;

create or replace function public.privacy_retention_candidate_index_rows(
  p_cutoff timestamptz
)
returns table (
  candidate_id text,
  category text,
  due_at timestamptz,
  held boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  with linked_order_holds as materialized (
    select linked.order_id, bool_or(linked.legal_hold) as held
    from (
      select converted_order_id as order_id, legal_hold
      from public.contact_enquiries
      where converted_order_id is not null and lifecycle_status = 'converted'
      union all
      select converted_order_id, legal_hold
      from public.custom_cake_enquiries
      where converted_order_id is not null and lifecycle_status = 'converted'
      union all
      select converted_order_id, legal_hold
      from public.workshop_enquiries
      where converted_order_id is not null and lifecycle_status = 'converted'
    ) as linked
    group by linked.order_id
  ),
  orders_with_storage as materialized (
    select distinct storage_order.order_id
    from (
      select message.order_id
      from public.order_message_attachments as attachment
      join public.order_messages as message on message.id = attachment.message_id
      where attachment.asset_type = 'supabase-file'
        and coalesce(
          nullif(btrim(attachment.asset_ref), ''),
          nullif(btrim(attachment.asset_id), '')
        ) is not null
      union all
      select note.order_id
      from public.order_note_images as image
      join public.order_notes as note on note.id = image.note_id
      where image.asset_type = 'supabase-file'
        and coalesce(
          nullif(btrim(image.asset_ref), ''),
          nullif(btrim(image.asset_id), '')
        ) is not null
      union all
      select message.order_id
      from public.order_messages as message
      cross join lateral jsonb_array_elements(
        case when jsonb_typeof(message.legacy_message->'attachments') = 'array'
          then message.legacy_message->'attachments' else '[]'::jsonb end
      ) as attachment
      where attachment->'asset'->>'_type' = 'supabase-file'
        and coalesce(
          nullif(btrim(attachment->'asset'->>'_ref'), ''),
          nullif(btrim(attachment->'asset'->>'_id'), '')
        ) is not null
      union all
      select note.order_id
      from public.order_notes as note
      cross join lateral jsonb_array_elements(
        case when jsonb_typeof(note.legacy_note->'images') = 'array'
          then note.legacy_note->'images' else '[]'::jsonb end
      ) as image
      where image->'asset'->>'_type' = 'supabase-file'
        and coalesce(
          nullif(btrim(image->'asset'->>'_ref'), ''),
          nullif(btrim(image->'asset'->>'_id'), '')
        ) is not null
      union all
      select enquiry.converted_order_id
      from public.custom_cake_enquiries as enquiry
      where enquiry.converted_order_id is not null
        and enquiry.lifecycle_status = 'converted'
        and nullif(btrim(enquiry.reference_image_path), '') is not null
    ) as storage_order
  ),
  index_rows as (
    select
      'enquiry:contact:' || enquiry.id::text,
      'expired-enquiry'::text,
      enquiry.retention_due_at,
      enquiry.legal_hold
    from public.contact_enquiries as enquiry
    where enquiry.lifecycle_status = 'closed'
      and enquiry.retention_due_at is not null
      and enquiry.retention_due_at <= p_cutoff

    union all
    select
      'enquiry:custom-cake:' || enquiry.id::text,
      'expired-enquiry',
      enquiry.retention_due_at,
      enquiry.legal_hold
    from public.custom_cake_enquiries as enquiry
    where enquiry.lifecycle_status = 'closed'
      and enquiry.retention_due_at is not null
      and enquiry.retention_due_at <= p_cutoff

    union all
    select
      'enquiry:workshop:' || enquiry.id::text,
      'expired-enquiry',
      enquiry.retention_due_at,
      enquiry.legal_hold
    from public.workshop_enquiries as enquiry
    where enquiry.lifecycle_status = 'closed'
      and enquiry.retention_due_at is not null
      and enquiry.retention_due_at <= p_cutoff

    union all
    select
      'enquiry:event-photo:' || enquiry.id::text,
      'expired-enquiry',
      enquiry.retention_due_at,
      enquiry.legal_hold
    from public.event_photo_requests as enquiry
    where enquiry.lifecycle_status = 'closed'
      and enquiry.retention_due_at is not null
      and enquiry.retention_due_at <= p_cutoff

    union all
    select
      'enquiry-upload:custom-cake:' || enquiry.id::text,
      'expired-enquiry-upload',
      enquiry.upload_retention_due_at,
      enquiry.legal_hold or coalesce(orders.legal_hold, false)
    from public.custom_cake_enquiries as enquiry
    left join public.orders as orders on orders.id = enquiry.converted_order_id
    where enquiry.upload_retention_due_at is not null
      and enquiry.upload_retention_due_at <= p_cutoff
      and nullif(btrim(enquiry.reference_image_path), '') is not null
      and (enquiry.retention_due_at is null or enquiry.retention_due_at > p_cutoff)
      and not (
        orders.status in ('completed', 'delivered', 'cancelled')
        and orders.retention_due_at is not null
        and orders.retention_due_at <= p_cutoff
      )

    union all
    select
      'enquiry-upload:event-photo:' || enquiry.id::text,
      'expired-enquiry-upload',
      enquiry.upload_retention_due_at,
      enquiry.legal_hold
    from public.event_photo_requests as enquiry
    where enquiry.upload_retention_due_at is not null
      and enquiry.upload_retention_due_at <= p_cutoff
      and cardinality(coalesce(enquiry.temp_image_paths, '{}'::text[])) > 0
      and (enquiry.retention_due_at is null or enquiry.retention_due_at > p_cutoff)

    union all
    select
      'order:' || orders.id::text,
      'expired-order',
      orders.retention_due_at,
      orders.legal_hold or coalesce(linked.held, false)
    from public.orders as orders
    left join linked_order_holds as linked on linked.order_id = orders.id
    where orders.status in ('completed', 'delivered', 'cancelled')
      and orders.retention_due_at is not null
      and orders.retention_due_at <= p_cutoff

    union all
    select
      'order-upload:' || orders.id::text,
      'expired-order-upload',
      orders.completed_at + interval '24 months',
      orders.legal_hold or coalesce(linked.held, false)
    from public.orders as orders
    join orders_with_storage as storage on storage.order_id = orders.id
    left join linked_order_holds as linked on linked.order_id = orders.id
    where orders.status in ('completed', 'delivered', 'cancelled')
      and orders.completed_at is not null
      and orders.completed_at + interval '24 months' <= p_cutoff
      and (orders.retention_due_at is null or orders.retention_due_at > p_cutoff)

    union all
    select
      'health:enquiry:contact:' || enquiry.id::text,
      'expired-health-information',
      enquiry.dietary_health_retention_due_at,
      enquiry.legal_hold or coalesce(orders.legal_hold, false)
    from public.contact_enquiries as enquiry
    left join public.orders as orders on orders.id = enquiry.converted_order_id
    where enquiry.dietary_health_retention_due_at is not null
      and enquiry.dietary_health_retention_due_at <= p_cutoff
      and enquiry.dietary_health_erased_at is null
      and enquiry.dietary_health_withdrawn_at is null
      and enquiry.dietary_health_consent = true
      and nullif(btrim(enquiry.dietary_health_information), '') is not null
      and not (
        enquiry.lifecycle_status = 'closed'
        and enquiry.retention_due_at is not null
        and enquiry.retention_due_at <= p_cutoff
      )
      and not exists (
        select 1 from public.orders as due_order
        where due_order.id = enquiry.converted_order_id
          and due_order.status in ('completed', 'delivered', 'cancelled')
          and due_order.retention_due_at is not null
          and due_order.retention_due_at <= p_cutoff
      )

    union all
    select
      'health:enquiry:custom-cake:' || enquiry.id::text,
      'expired-health-information',
      enquiry.dietary_health_retention_due_at,
      enquiry.legal_hold or coalesce(orders.legal_hold, false)
    from public.custom_cake_enquiries as enquiry
    left join public.orders as orders on orders.id = enquiry.converted_order_id
    where enquiry.dietary_health_retention_due_at is not null
      and enquiry.dietary_health_retention_due_at <= p_cutoff
      and enquiry.dietary_health_erased_at is null
      and enquiry.dietary_health_withdrawn_at is null
      and enquiry.dietary_health_consent = true
      and nullif(btrim(enquiry.dietary_health_information), '') is not null
      and not (
        enquiry.lifecycle_status = 'closed'
        and enquiry.retention_due_at is not null
        and enquiry.retention_due_at <= p_cutoff
      )
      and not exists (
        select 1 from public.orders as due_order
        where due_order.id = enquiry.converted_order_id
          and due_order.status in ('completed', 'delivered', 'cancelled')
          and due_order.retention_due_at is not null
          and due_order.retention_due_at <= p_cutoff
      )

    union all
    select
      'health:enquiry:workshop:' || enquiry.id::text,
      'expired-health-information',
      enquiry.dietary_health_retention_due_at,
      enquiry.legal_hold or coalesce(orders.legal_hold, false)
    from public.workshop_enquiries as enquiry
    left join public.orders as orders on orders.id = enquiry.converted_order_id
    where enquiry.dietary_health_retention_due_at is not null
      and enquiry.dietary_health_retention_due_at <= p_cutoff
      and enquiry.dietary_health_erased_at is null
      and enquiry.dietary_health_withdrawn_at is null
      and enquiry.dietary_health_consent = true
      and nullif(btrim(enquiry.dietary_health_information), '') is not null
      and not (
        enquiry.lifecycle_status = 'closed'
        and enquiry.retention_due_at is not null
        and enquiry.retention_due_at <= p_cutoff
      )
      and not exists (
        select 1 from public.orders as due_order
        where due_order.id = enquiry.converted_order_id
          and due_order.status in ('completed', 'delivered', 'cancelled')
          and due_order.retention_due_at is not null
          and due_order.retention_due_at <= p_cutoff
      )

    union all
    select
      'health:order:' || orders.id::text,
      'expired-health-information',
      orders.dietary_health_retention_due_at,
      orders.legal_hold or coalesce(linked.held, false)
    from public.orders as orders
    left join linked_order_holds as linked on linked.order_id = orders.id
    where orders.dietary_health_retention_due_at is not null
      and orders.dietary_health_retention_due_at <= p_cutoff
      and orders.dietary_health_erased_at is null
      and nullif(btrim(orders.metadata->>'dietaryHealthWithdrawnAt'), '') is null
      and orders.metadata->'dietaryHealthConsent' = 'true'::jsonb
      and nullif(btrim(orders.metadata->>'dietaryHealthInformation'), '') is not null
      and not (
        orders.status in ('completed', 'delivered', 'cancelled')
        and orders.retention_due_at is not null
        and orders.retention_due_at <= p_cutoff
      )

    union all
    select
      'security:enquiry-rate-limits',
      'expired-security-record',
      p_cutoff - interval '90 days',
      holds.record_type is not null
    from (select 1) as singleton
    left join public.privacy_retention_security_holds as holds
      on holds.record_type = 'enquiry-rate-limits'
    where exists (
      select 1 from public.enquiry_rate_limits
      where updated_at < p_cutoff - interval '90 days'
    )

    union all
    select
      'security:admin-login-attempts',
      'expired-security-record',
      p_cutoff - interval '90 days',
      holds.record_type is not null
    from (select 1) as singleton
    left join public.privacy_retention_security_holds as holds
      on holds.record_type = 'admin-login-attempts'
    where exists (
      select 1 from public.admin_login_attempts
      where failed_at < p_cutoff - interval '90 days'
    )

    union all
    select
      'security:event-photo-rate-limits',
      'expired-security-record',
      p_cutoff - interval '90 days',
      holds.record_type is not null
    from (select 1) as singleton
    left join public.privacy_retention_security_holds as holds
      on holds.record_type = 'event-photo-rate-limits'
    where exists (
      select 1 from public.event_photo_rate_limit_attempts
      where attempted_at < p_cutoff - interval '90 days'
    )
  )
  select * from index_rows
$$;

create or replace function public.list_privacy_retention_candidate_page(
  p_cutoff timestamptz,
  p_page integer default 1,
  p_page_size integer default 50
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  if p_cutoff is null then
    raise exception 'RETENTION_CUTOFF_INVALID';
  end if;
  if p_page is null or p_page < 1 or p_page > 10000 then
    raise exception 'RETENTION_PAGE_INVALID';
  end if;
  if p_page_size is null or p_page_size < 1 or p_page_size > 100 then
    raise exception 'RETENTION_PAGE_SIZE_INVALID';
  end if;

  with candidate_index as materialized (
    select *
    from public.privacy_retention_candidate_index_rows(p_cutoff)
  ),
  category_ids(category, sort_order) as (
    values
      ('expired-enquiry'::text, 1),
      ('expired-enquiry-upload'::text, 2),
      ('expired-order-upload'::text, 3),
      ('expired-order'::text, 4),
      ('expired-health-information'::text, 5),
      ('expired-security-record'::text, 6)
  ),
  category_counts as (
    select
      category_ids.category,
      count(candidate_index.candidate_id)::bigint as total,
      count(candidate_index.candidate_id) filter (where not candidate_index.held)::bigint as due,
      count(candidate_index.candidate_id) filter (where candidate_index.held)::bigint as held,
      category_ids.sort_order
    from category_ids
    left join candidate_index on candidate_index.category = category_ids.category
    group by category_ids.category, category_ids.sort_order
  ),
  candidate_total as (
    select count(*)::bigint as total_count
    from candidate_index
  ),
  paging as (
    select
      least(
        p_page::bigint,
        greatest(
          1::bigint,
          ceil(candidate_total.total_count::numeric / p_page_size::numeric)::bigint
        )
      ) as effective_page,
      candidate_total.total_count
    from candidate_total
  ),
  page_index as materialized (
    select *
    from candidate_index
    order by due_at, candidate_id
    offset (
      select (paging.effective_page - 1) * p_page_size::bigint
      from paging
    )
    limit p_page_size
  ),
  page_rows as materialized (
    select detail.*
    from public.privacy_retention_candidate_rows(
      p_cutoff,
      coalesce(
        (select array_agg(page_index.candidate_id) from page_index),
        '{}'::text[]
      )
    ) as detail
  )
  select jsonb_build_object(
    'candidates', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', page_rows.candidate_id,
        'category', page_rows.category,
        'recordType', page_rows.record_type,
        'recordReference', page_rows.record_reference,
        'dueAt', page_rows.due_at,
        'reason', page_rows.reason,
        'removes', page_rows.removes,
        'retains', page_rows.retains,
        'itemCount', page_rows.item_count,
        'held', page_rows.held,
        'holdReason', page_rows.hold_reason,
        'holdReviewAt', page_rows.hold_review_at,
        'snapshotRevision', page_rows.snapshot_revision
      ) order by page_rows.due_at, page_rows.candidate_id)
      from page_rows
    ), '[]'::jsonb),
    'categoryCounts', (
      select jsonb_agg(jsonb_build_object(
        'category', category_counts.category,
        'total', category_counts.total,
        'due', category_counts.due,
        'held', category_counts.held
      ) order by category_counts.sort_order)
      from category_counts
    ),
    'totalCount', (select paging.total_count from paging),
    'dueCount', (select count(*)::bigint from candidate_index where not held),
    'heldCount', (select count(*)::bigint from candidate_index where held),
    'page', (select paging.effective_page from paging),
    'pageSize', p_page_size,
    'hasMore', (
      select paging.effective_page * p_page_size::bigint < paging.total_count
      from paging
    )
  ) into result;

  return result;
end;
$$;

create or replace function public.get_privacy_retention_candidate_revision(
  p_candidate_id text,
  p_cutoff timestamptz
)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select candidate.snapshot_revision
  from public.privacy_retention_candidate_rows(
    p_cutoff,
    array[p_candidate_id]
  ) as candidate
  where candidate.candidate_id = p_candidate_id
  limit 1
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
      with targets as materialized (
        select ctid
        from public.enquiry_rate_limits
        where updated_at < p_cutoff
        order by updated_at, scope, identifier, window_start
        limit 500
      )
      delete from public.enquiry_rate_limits as row_value
      using targets
      where row_value.ctid = targets.ctid;
    when 'admin-login-attempts' then
      with targets as materialized (
        select id
        from public.admin_login_attempts
        where failed_at < p_cutoff
        order by failed_at, id
        limit 500
      )
      delete from public.admin_login_attempts as row_value
      using targets
      where row_value.id = targets.id;
    when 'event-photo-rate-limits' then
      with targets as materialized (
        select id
        from public.event_photo_rate_limit_attempts
        where attempted_at < p_cutoff
        order by attempted_at, id
        limit 500
      )
      delete from public.event_photo_rate_limit_attempts as row_value
      using targets
      where row_value.id = targets.id;
    else
      raise exception 'Unsupported privacy security record type';
  end case;

  get diagnostics affected_count = row_count;
  return query select affected_count;
end;
$$;

revoke all on function public.privacy_retention_candidate_rows(timestamptz, text[])
  from public, anon, authenticated, service_role;

revoke all on function public.privacy_retention_candidate_index_rows(timestamptz)
  from public, anon, authenticated, service_role;

revoke all on function public.enforce_canonical_retention_storage_bucket()
  from public, anon, authenticated;

grant execute on function public.enforce_canonical_retention_storage_bucket()
  to service_role;

revoke all on function public.list_noncanonical_retention_storage_records()
  from public, anon, authenticated;

grant execute on function public.list_noncanonical_retention_storage_records()
  to service_role;

revoke all on function public.list_privacy_retention_candidate_page(timestamptz, integer, integer)
  from public, anon, authenticated;

grant execute on function public.list_privacy_retention_candidate_page(timestamptz, integer, integer)
  to service_role;

revoke all on function public.get_privacy_retention_candidate_revision(text, timestamptz)
  from public, anon, authenticated;

grant execute on function public.get_privacy_retention_candidate_revision(text, timestamptz)
  to service_role;

revoke all on function public.delete_expired_privacy_security_records(text, timestamptz)
  from public, anon, authenticated;

grant execute on function public.delete_expired_privacy_security_records(text, timestamptz)
  to service_role;
