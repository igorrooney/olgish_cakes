create table if not exists public.order_messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  line_number integer not null check (line_number > 0),
  message text not null default '',
  legacy_message jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint order_messages_order_id_line_number_key unique (order_id, line_number)
);

create table if not exists public.order_message_attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.order_messages (id) on delete cascade,
  line_number integer not null check (line_number > 0),
  attachment_type text,
  asset_type text,
  asset_id text,
  asset_ref text,
  asset_url text,
  alt text,
  caption text,
  legacy_attachment jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint order_message_attachments_message_id_line_number_key unique (message_id, line_number)
);

create table if not exists public.order_notes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  line_number integer not null check (line_number > 0),
  note text not null default '',
  author text,
  note_created_at timestamptz,
  legacy_note jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint order_notes_order_id_line_number_key unique (order_id, line_number)
);

create table if not exists public.order_note_images (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.order_notes (id) on delete cascade,
  line_number integer not null check (line_number > 0),
  image_type text,
  asset_type text,
  asset_id text,
  asset_ref text,
  asset_url text,
  alt text,
  caption text,
  legacy_image jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint order_note_images_note_id_line_number_key unique (note_id, line_number)
);

create or replace function public.set_order_activity_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.updated_at is not distinct from old.updated_at then
    new.updated_at = timezone('utc'::text, now());
  end if;

  return new;
end;
$$;

with source_messages as materialized (
  select
    gen_random_uuid() as message_id,
    o.id as order_id,
    message_item.line_number::integer as line_number,
    message_item.message_json as message_json
  from public.orders o
  cross join lateral jsonb_array_elements(
    case
      when jsonb_typeof(o.messages) = 'array' then o.messages
      else '[]'::jsonb
    end
  ) with ordinality as message_item(message_json, line_number)
), inserted_messages as (
  insert into public.order_messages (
    id,
    order_id,
    line_number,
    message,
    legacy_message
  )
  select
    message_id,
    order_id,
    line_number,
    coalesce(message_json->>'message', ''),
    message_json
  from source_messages
  on conflict (order_id, line_number) do nothing
  returning id
)
insert into public.order_message_attachments (
  message_id,
  line_number,
  attachment_type,
  asset_type,
  asset_id,
  asset_ref,
  asset_url,
  alt,
  caption,
  legacy_attachment
)
select
  sm.message_id,
  attachment_item.line_number::integer,
  attachment_item.attachment_json->>'_type',
  attachment_item.attachment_json #>> '{asset,_type}',
  attachment_item.attachment_json #>> '{asset,_id}',
  attachment_item.attachment_json #>> '{asset,_ref}',
  attachment_item.attachment_json #>> '{asset,url}',
  attachment_item.attachment_json->>'alt',
  attachment_item.attachment_json->>'caption',
  attachment_item.attachment_json
from source_messages sm
join inserted_messages im on im.id = sm.message_id
cross join lateral jsonb_array_elements(
  case
    when jsonb_typeof(sm.message_json->'attachments') = 'array' then sm.message_json->'attachments'
    else '[]'::jsonb
  end
) with ordinality as attachment_item(attachment_json, line_number);

with source_notes as materialized (
  select
    gen_random_uuid() as note_id,
    o.id as order_id,
    note_item.line_number::integer as line_number,
    note_item.note_json as note_json
  from public.orders o
  cross join lateral jsonb_array_elements(
    case
      when jsonb_typeof(o.notes) = 'array' then o.notes
      else '[]'::jsonb
    end
  ) with ordinality as note_item(note_json, line_number)
), inserted_notes as (
  insert into public.order_notes (
    id,
    order_id,
    line_number,
    note,
    author,
    note_created_at,
    legacy_note
  )
  select
    note_id,
    order_id,
    line_number,
    coalesce(note_json->>'note', ''),
    nullif(note_json->>'author', ''),
    case
      when note_json->>'createdAt' ~ '^\d{4}-\d{2}-\d{2}' then (note_json->>'createdAt')::timestamptz
      else null
    end,
    note_json
  from source_notes
  on conflict (order_id, line_number) do nothing
  returning id
)
insert into public.order_note_images (
  note_id,
  line_number,
  image_type,
  asset_type,
  asset_id,
  asset_ref,
  asset_url,
  alt,
  caption,
  legacy_image
)
select
  sn.note_id,
  image_item.line_number::integer,
  image_item.image_json->>'_type',
  image_item.image_json #>> '{asset,_type}',
  image_item.image_json #>> '{asset,_id}',
  image_item.image_json #>> '{asset,_ref}',
  image_item.image_json #>> '{asset,url}',
  image_item.image_json->>'alt',
  image_item.image_json->>'caption',
  image_item.image_json
from source_notes sn
join inserted_notes inserted on inserted.id = sn.note_id
cross join lateral jsonb_array_elements(
  case
    when jsonb_typeof(sn.note_json->'images') = 'array' then sn.note_json->'images'
    else '[]'::jsonb
  end
) with ordinality as image_item(image_json, line_number);

do $$
begin
  if (
    select count(*)
    from public.orders o
    cross join lateral jsonb_array_elements(
      case
        when jsonb_typeof(o.messages) = 'array' then o.messages
        else '[]'::jsonb
      end
    ) message_json
  ) <> (select count(*) from public.order_messages) then
    raise exception 'order message backfill copied an unexpected row count';
  end if;

  if (
    select count(*)
    from public.orders o
    cross join lateral jsonb_array_elements(
      case
        when jsonb_typeof(o.notes) = 'array' then o.notes
        else '[]'::jsonb
      end
    ) note_json
  ) <> (select count(*) from public.order_notes) then
    raise exception 'order note backfill copied an unexpected row count';
  end if;
end;
$$;

create trigger set_order_messages_updated_at
before update on public.order_messages
for each row
execute function public.set_order_activity_updated_at();

create trigger set_order_message_attachments_updated_at
before update on public.order_message_attachments
for each row
execute function public.set_order_activity_updated_at();

create trigger set_order_notes_updated_at
before update on public.order_notes
for each row
execute function public.set_order_activity_updated_at();

create trigger set_order_note_images_updated_at
before update on public.order_note_images
for each row
execute function public.set_order_activity_updated_at();

alter table public.order_messages enable row level security;
alter table public.order_message_attachments enable row level security;
alter table public.order_notes enable row level security;
alter table public.order_note_images enable row level security;

revoke all on table public.order_messages from public, anon, authenticated;
revoke all on table public.order_message_attachments from public, anon, authenticated;
revoke all on table public.order_notes from public, anon, authenticated;
revoke all on table public.order_note_images from public, anon, authenticated;

grant all on table public.order_messages to service_role;
grant all on table public.order_message_attachments to service_role;
grant all on table public.order_notes to service_role;
grant all on table public.order_note_images to service_role;

drop index if exists public.orders_created_at_idx;
drop index if exists public.orders_status_created_at_idx;
drop index if exists public.orders_customer_email_structured_idx;
drop index if exists public.orders_date_needed_idx;
drop index if exists public.orders_payment_status_idx;
drop index if exists public.orders_total_price_idx;

alter table public.order_items
  drop constraint if exists order_items_order_id_fkey;

alter table public.order_messages
  drop constraint if exists order_messages_order_id_fkey;

alter table public.order_notes
  drop constraint if exists order_notes_order_id_fkey;

drop trigger if exists set_orders_updated_at on public.orders;

alter table public.orders rename constraint orders_pkey to orders_message_backup_pkey;
alter table public.orders rename constraint orders_order_number_key to orders_message_backup_order_number_key;
alter table public.orders rename constraint orders_sanity_id_key to orders_message_backup_sanity_id_key;

alter table public.orders rename to orders_message_backup;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  sanity_id text unique,
  status text not null default 'new',
  order_type text not null default 'custom-quote',
  customer_name text,
  customer_email text,
  customer_phone text,
  customer_address text,
  customer_city text,
  customer_postcode text,
  date_needed date,
  delivery_method text,
  delivery_address text,
  delivery_notes text,
  gift_note text,
  tracking_number text,
  subtotal numeric(10, 2),
  delivery_fee numeric(10, 2),
  discount numeric(10, 2),
  total_price numeric(10, 2),
  payment_status text,
  payment_method text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

insert into public.orders (
  id,
  order_number,
  sanity_id,
  status,
  order_type,
  customer_name,
  customer_email,
  customer_phone,
  customer_address,
  customer_city,
  customer_postcode,
  date_needed,
  delivery_method,
  delivery_address,
  delivery_notes,
  gift_note,
  tracking_number,
  subtotal,
  delivery_fee,
  discount,
  total_price,
  payment_status,
  payment_method,
  metadata,
  created_at,
  updated_at
)
select
  id,
  order_number,
  sanity_id,
  status,
  order_type,
  customer_name,
  customer_email,
  customer_phone,
  customer_address,
  customer_city,
  customer_postcode,
  date_needed,
  delivery_method,
  delivery_address,
  delivery_notes,
  gift_note,
  tracking_number,
  subtotal,
  delivery_fee,
  discount,
  total_price,
  payment_status,
  payment_method,
  metadata,
  created_at,
  updated_at
from public.orders_message_backup;

do $$
begin
  if (select count(*) from public.orders) <> (select count(*) from public.orders_message_backup) then
    raise exception 'orders message cleanup copied an unexpected row count';
  end if;
end;
$$;

alter table public.order_items
  add constraint order_items_order_id_fkey
  foreign key (order_id) references public.orders (id) on delete cascade;

alter table public.order_messages
  add constraint order_messages_order_id_fkey
  foreign key (order_id) references public.orders (id) on delete cascade;

alter table public.order_notes
  add constraint order_notes_order_id_fkey
  foreign key (order_id) references public.orders (id) on delete cascade;

drop table public.orders_message_backup;

create index if not exists orders_created_at_idx
  on public.orders (created_at desc);

create index if not exists orders_status_created_at_idx
  on public.orders (status, created_at desc);

create index if not exists orders_customer_email_structured_idx
  on public.orders (lower(customer_email))
  where customer_email is not null;

create index if not exists orders_date_needed_idx
  on public.orders (date_needed)
  where date_needed is not null;

create index if not exists orders_payment_status_idx
  on public.orders (payment_status)
  where payment_status is not null;

create index if not exists orders_total_price_idx
  on public.orders (total_price)
  where total_price is not null;

create trigger set_orders_updated_at
before update on public.orders
for each row
execute function public.set_orders_updated_at();

alter table public.orders enable row level security;

revoke all on table public.orders
  from public, anon, authenticated;

grant all on table public.orders
  to service_role;

create or replace function public.replace_order_with_children(
  p_order_id uuid,
  p_order_payload jsonb,
  p_item_payloads jsonb default '[]'::jsonb,
  p_message_payloads jsonb default '[]'::jsonb,
  p_message_attachment_payloads jsonb default '[]'::jsonb,
  p_note_payloads jsonb default '[]'::jsonb,
  p_note_image_payloads jsonb default '[]'::jsonb,
  p_upsert_by_order_number boolean default false
)
returns public.orders
language plpgsql
set search_path = public
as $$
declare
  saved_order public.orders%rowtype;
begin
  if p_order_payload is null or jsonb_typeof(p_order_payload) <> 'object' then
    raise exception 'order payload must be a JSON object';
  end if;

  if p_order_id is null then
    if p_upsert_by_order_number then
      insert into public.orders (
        sanity_id,
        order_number,
        status,
        order_type,
        customer_name,
        customer_email,
        customer_phone,
        customer_address,
        customer_city,
        customer_postcode,
        date_needed,
        delivery_method,
        delivery_address,
        delivery_notes,
        gift_note,
        tracking_number,
        subtotal,
        delivery_fee,
        discount,
        total_price,
        payment_status,
        payment_method,
        metadata,
        created_at,
        updated_at
      )
      values (
        nullif(p_order_payload->>'sanity_id', ''),
        nullif(p_order_payload->>'order_number', ''),
        coalesce(nullif(p_order_payload->>'status', ''), 'new'),
        coalesce(nullif(p_order_payload->>'order_type', ''), 'custom-quote'),
        nullif(p_order_payload->>'customer_name', ''),
        nullif(p_order_payload->>'customer_email', ''),
        nullif(p_order_payload->>'customer_phone', ''),
        nullif(p_order_payload->>'customer_address', ''),
        nullif(p_order_payload->>'customer_city', ''),
        nullif(p_order_payload->>'customer_postcode', ''),
        nullif(p_order_payload->>'date_needed', '')::date,
        nullif(p_order_payload->>'delivery_method', ''),
        nullif(p_order_payload->>'delivery_address', ''),
        nullif(p_order_payload->>'delivery_notes', ''),
        nullif(p_order_payload->>'gift_note', ''),
        nullif(p_order_payload->>'tracking_number', ''),
        nullif(p_order_payload->>'subtotal', '')::numeric(10, 2),
        nullif(p_order_payload->>'delivery_fee', '')::numeric(10, 2),
        nullif(p_order_payload->>'discount', '')::numeric(10, 2),
        nullif(p_order_payload->>'total_price', '')::numeric(10, 2),
        nullif(p_order_payload->>'payment_status', ''),
        nullif(p_order_payload->>'payment_method', ''),
        case
          when jsonb_typeof(p_order_payload->'metadata') = 'object' then p_order_payload->'metadata'
          else '{}'::jsonb
        end,
        coalesce(nullif(p_order_payload->>'created_at', '')::timestamptz, timezone('utc'::text, now())),
        coalesce(nullif(p_order_payload->>'updated_at', '')::timestamptz, timezone('utc'::text, now()))
      )
      on conflict (order_number) do update
      set
        sanity_id = excluded.sanity_id,
        status = excluded.status,
        order_type = excluded.order_type,
        customer_name = excluded.customer_name,
        customer_email = excluded.customer_email,
        customer_phone = excluded.customer_phone,
        customer_address = excluded.customer_address,
        customer_city = excluded.customer_city,
        customer_postcode = excluded.customer_postcode,
        date_needed = excluded.date_needed,
        delivery_method = excluded.delivery_method,
        delivery_address = excluded.delivery_address,
        delivery_notes = excluded.delivery_notes,
        gift_note = excluded.gift_note,
        tracking_number = excluded.tracking_number,
        subtotal = excluded.subtotal,
        delivery_fee = excluded.delivery_fee,
        discount = excluded.discount,
        total_price = excluded.total_price,
        payment_status = excluded.payment_status,
        payment_method = excluded.payment_method,
        metadata = excluded.metadata,
        created_at = case
          when p_order_payload ? 'created_at' and nullif(p_order_payload->>'created_at', '') is not null then excluded.created_at
          else orders.created_at
        end,
        updated_at = case
          when p_order_payload ? 'updated_at' and nullif(p_order_payload->>'updated_at', '') is not null then excluded.updated_at
          else orders.updated_at
        end
      returning * into saved_order;
    else
      insert into public.orders (
        sanity_id,
        order_number,
        status,
        order_type,
        customer_name,
        customer_email,
        customer_phone,
        customer_address,
        customer_city,
        customer_postcode,
        date_needed,
        delivery_method,
        delivery_address,
        delivery_notes,
        gift_note,
        tracking_number,
        subtotal,
        delivery_fee,
        discount,
        total_price,
        payment_status,
        payment_method,
        metadata,
        created_at,
        updated_at
      )
      values (
        nullif(p_order_payload->>'sanity_id', ''),
        nullif(p_order_payload->>'order_number', ''),
        coalesce(nullif(p_order_payload->>'status', ''), 'new'),
        coalesce(nullif(p_order_payload->>'order_type', ''), 'custom-quote'),
        nullif(p_order_payload->>'customer_name', ''),
        nullif(p_order_payload->>'customer_email', ''),
        nullif(p_order_payload->>'customer_phone', ''),
        nullif(p_order_payload->>'customer_address', ''),
        nullif(p_order_payload->>'customer_city', ''),
        nullif(p_order_payload->>'customer_postcode', ''),
        nullif(p_order_payload->>'date_needed', '')::date,
        nullif(p_order_payload->>'delivery_method', ''),
        nullif(p_order_payload->>'delivery_address', ''),
        nullif(p_order_payload->>'delivery_notes', ''),
        nullif(p_order_payload->>'gift_note', ''),
        nullif(p_order_payload->>'tracking_number', ''),
        nullif(p_order_payload->>'subtotal', '')::numeric(10, 2),
        nullif(p_order_payload->>'delivery_fee', '')::numeric(10, 2),
        nullif(p_order_payload->>'discount', '')::numeric(10, 2),
        nullif(p_order_payload->>'total_price', '')::numeric(10, 2),
        nullif(p_order_payload->>'payment_status', ''),
        nullif(p_order_payload->>'payment_method', ''),
        case
          when jsonb_typeof(p_order_payload->'metadata') = 'object' then p_order_payload->'metadata'
          else '{}'::jsonb
        end,
        coalesce(nullif(p_order_payload->>'created_at', '')::timestamptz, timezone('utc'::text, now())),
        coalesce(nullif(p_order_payload->>'updated_at', '')::timestamptz, timezone('utc'::text, now()))
      )
      returning * into saved_order;
    end if;
  else
    update public.orders
    set
      order_number = nullif(p_order_payload->>'order_number', ''),
      status = coalesce(nullif(p_order_payload->>'status', ''), 'new'),
      order_type = coalesce(nullif(p_order_payload->>'order_type', ''), 'custom-quote'),
      customer_name = nullif(p_order_payload->>'customer_name', ''),
      customer_email = nullif(p_order_payload->>'customer_email', ''),
      customer_phone = nullif(p_order_payload->>'customer_phone', ''),
      customer_address = nullif(p_order_payload->>'customer_address', ''),
      customer_city = nullif(p_order_payload->>'customer_city', ''),
      customer_postcode = nullif(p_order_payload->>'customer_postcode', ''),
      date_needed = nullif(p_order_payload->>'date_needed', '')::date,
      delivery_method = nullif(p_order_payload->>'delivery_method', ''),
      delivery_address = nullif(p_order_payload->>'delivery_address', ''),
      delivery_notes = nullif(p_order_payload->>'delivery_notes', ''),
      gift_note = nullif(p_order_payload->>'gift_note', ''),
      tracking_number = nullif(p_order_payload->>'tracking_number', ''),
      subtotal = nullif(p_order_payload->>'subtotal', '')::numeric(10, 2),
      delivery_fee = nullif(p_order_payload->>'delivery_fee', '')::numeric(10, 2),
      discount = nullif(p_order_payload->>'discount', '')::numeric(10, 2),
      total_price = nullif(p_order_payload->>'total_price', '')::numeric(10, 2),
      payment_status = nullif(p_order_payload->>'payment_status', ''),
      payment_method = nullif(p_order_payload->>'payment_method', ''),
      metadata = case
        when jsonb_typeof(p_order_payload->'metadata') = 'object' then p_order_payload->'metadata'
        else '{}'::jsonb
      end,
      updated_at = case
        when p_order_payload ? 'updated_at' and nullif(p_order_payload->>'updated_at', '') is not null then nullif(p_order_payload->>'updated_at', '')::timestamptz
        else updated_at
      end
    where id = p_order_id
    returning * into saved_order;

    if not found then
      raise exception 'order % was not found', p_order_id;
    end if;
  end if;

  delete from public.order_items
  where order_id = saved_order.id;

  delete from public.order_messages
  where order_id = saved_order.id;

  delete from public.order_notes
  where order_id = saved_order.id;

  insert into public.order_items (
    order_id,
    line_number,
    product_type,
    product_id,
    product_name,
    quantity,
    unit_price,
    total_price,
    size,
    flavor,
    design_type,
    special_instructions,
    legacy_item
  )
  select
    saved_order.id,
    (item_payload->>'line_number')::integer,
    nullif(item_payload->>'product_type', ''),
    nullif(item_payload->>'product_id', ''),
    coalesce(nullif(item_payload->>'product_name', ''), 'Custom Order'),
    coalesce(nullif(item_payload->>'quantity', '')::integer, 1),
    nullif(item_payload->>'unit_price', '')::numeric(10, 2),
    coalesce(nullif(item_payload->>'total_price', '')::numeric(10, 2), 0),
    nullif(item_payload->>'size', ''),
    nullif(item_payload->>'flavor', ''),
    nullif(item_payload->>'design_type', ''),
    nullif(item_payload->>'special_instructions', ''),
    case
      when jsonb_typeof(item_payload->'legacy_item') = 'object' then item_payload->'legacy_item'
      else '{}'::jsonb
    end
  from jsonb_array_elements(
    case
      when jsonb_typeof(p_item_payloads) = 'array' then p_item_payloads
      else '[]'::jsonb
    end
  ) as item_data(item_payload);

  insert into public.order_messages (
    id,
    order_id,
    line_number,
    message,
    legacy_message
  )
  select
    coalesce(nullif(message_payload->>'id', '')::uuid, gen_random_uuid()),
    saved_order.id,
    (message_payload->>'line_number')::integer,
    coalesce(message_payload->>'message', ''),
    case
      when jsonb_typeof(message_payload->'legacy_message') = 'object' then message_payload->'legacy_message'
      else '{}'::jsonb
    end
  from jsonb_array_elements(
    case
      when jsonb_typeof(p_message_payloads) = 'array' then p_message_payloads
      else '[]'::jsonb
    end
  ) as message_data(message_payload);

  insert into public.order_message_attachments (
    message_id,
    line_number,
    attachment_type,
    asset_type,
    asset_id,
    asset_ref,
    asset_url,
    alt,
    caption,
    legacy_attachment
  )
  select
    nullif(attachment_payload->>'message_id', '')::uuid,
    (attachment_payload->>'line_number')::integer,
    nullif(attachment_payload->>'attachment_type', ''),
    nullif(attachment_payload->>'asset_type', ''),
    nullif(attachment_payload->>'asset_id', ''),
    nullif(attachment_payload->>'asset_ref', ''),
    nullif(attachment_payload->>'asset_url', ''),
    nullif(attachment_payload->>'alt', ''),
    nullif(attachment_payload->>'caption', ''),
    case
      when jsonb_typeof(attachment_payload->'legacy_attachment') = 'object' then attachment_payload->'legacy_attachment'
      else '{}'::jsonb
    end
  from jsonb_array_elements(
    case
      when jsonb_typeof(p_message_attachment_payloads) = 'array' then p_message_attachment_payloads
      else '[]'::jsonb
    end
  ) as attachment_data(attachment_payload);

  insert into public.order_notes (
    id,
    order_id,
    line_number,
    note,
    author,
    note_created_at,
    legacy_note
  )
  select
    coalesce(nullif(note_payload->>'id', '')::uuid, gen_random_uuid()),
    saved_order.id,
    (note_payload->>'line_number')::integer,
    coalesce(note_payload->>'note', ''),
    nullif(note_payload->>'author', ''),
    nullif(note_payload->>'note_created_at', '')::timestamptz,
    case
      when jsonb_typeof(note_payload->'legacy_note') = 'object' then note_payload->'legacy_note'
      else '{}'::jsonb
    end
  from jsonb_array_elements(
    case
      when jsonb_typeof(p_note_payloads) = 'array' then p_note_payloads
      else '[]'::jsonb
    end
  ) as note_data(note_payload);

  insert into public.order_note_images (
    note_id,
    line_number,
    image_type,
    asset_type,
    asset_id,
    asset_ref,
    asset_url,
    alt,
    caption,
    legacy_image
  )
  select
    nullif(image_payload->>'note_id', '')::uuid,
    (image_payload->>'line_number')::integer,
    nullif(image_payload->>'image_type', ''),
    nullif(image_payload->>'asset_type', ''),
    nullif(image_payload->>'asset_id', ''),
    nullif(image_payload->>'asset_ref', ''),
    nullif(image_payload->>'asset_url', ''),
    nullif(image_payload->>'alt', ''),
    nullif(image_payload->>'caption', ''),
    case
      when jsonb_typeof(image_payload->'legacy_image') = 'object' then image_payload->'legacy_image'
      else '{}'::jsonb
    end
  from jsonb_array_elements(
    case
      when jsonb_typeof(p_note_image_payloads) = 'array' then p_note_image_payloads
      else '[]'::jsonb
    end
  ) as image_data(image_payload);

  return saved_order;
end;
$$;

revoke all on function public.replace_order_with_children(uuid, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, boolean)
  from public, anon, authenticated;

grant execute on function public.replace_order_with_children(uuid, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, boolean)
  to service_role;
