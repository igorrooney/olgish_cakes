drop index if exists public.orders_created_at_idx;
drop index if exists public.orders_status_created_at_idx;
drop index if exists public.orders_customer_email_structured_idx;
drop index if exists public.orders_date_needed_idx;
drop index if exists public.orders_payment_status_idx;
drop index if exists public.orders_total_price_idx;

alter table public.order_items
  drop constraint if exists order_items_order_id_fkey;

drop trigger if exists set_orders_updated_at on public.orders;

alter table public.orders rename constraint orders_pkey to orders_reorder_backup_pkey;
alter table public.orders rename constraint orders_order_number_key to orders_reorder_backup_order_number_key;
alter table public.orders rename constraint orders_sanity_id_key to orders_reorder_backup_sanity_id_key;

alter table public.orders rename to orders_reorder_backup;

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
  messages jsonb not null default '[]'::jsonb,
  notes jsonb not null default '[]'::jsonb,
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
  messages,
  notes,
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
  messages,
  notes,
  metadata,
  created_at,
  updated_at
from public.orders_reorder_backup;

do $$
begin
  if (select count(*) from public.orders) <> (select count(*) from public.orders_reorder_backup) then
    raise exception 'orders column reorder copied an unexpected row count';
  end if;
end;
$$;

alter table public.order_items
  add constraint order_items_order_id_fkey
  foreign key (order_id) references public.orders (id) on delete cascade;

drop table public.orders_reorder_backup;

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
