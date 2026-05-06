create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  line_number integer not null check (line_number > 0),
  product_type text,
  product_id text,
  product_name text not null,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric(10, 2),
  total_price numeric(10, 2) not null default 0,
  size text,
  flavor text,
  design_type text,
  special_instructions text,
  legacy_item jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint order_items_order_id_line_number_key unique (order_id, line_number)
);

alter table public.orders
  add column if not exists customer_name text,
  add column if not exists customer_email text,
  add column if not exists customer_phone text,
  add column if not exists customer_address text,
  add column if not exists customer_city text,
  add column if not exists customer_postcode text,
  add column if not exists date_needed date,
  add column if not exists delivery_method text,
  add column if not exists delivery_address text,
  add column if not exists delivery_notes text,
  add column if not exists gift_note text,
  add column if not exists tracking_number text,
  add column if not exists subtotal numeric(10, 2),
  add column if not exists delivery_fee numeric(10, 2),
  add column if not exists discount numeric(10, 2),
  add column if not exists total_price numeric(10, 2),
  add column if not exists payment_status text,
  add column if not exists payment_method text;

update public.orders
set
  customer_name = coalesce(customer_name, nullif(customer->>'name', '')),
  customer_email = coalesce(customer_email, nullif(customer->>'email', '')),
  customer_phone = coalesce(customer_phone, nullif(customer->>'phone', '')),
  customer_address = coalesce(customer_address, nullif(customer->>'address', '')),
  customer_city = coalesce(customer_city, nullif(customer->>'city', '')),
  customer_postcode = coalesce(customer_postcode, nullif(customer->>'postcode', '')),
  date_needed = coalesce(
    date_needed,
    case
      when delivery->>'dateNeeded' ~ '^\d{4}-\d{2}-\d{2}' then left(delivery->>'dateNeeded', 10)::date
      else null
    end
  ),
  delivery_method = coalesce(delivery_method, nullif(delivery->>'deliveryMethod', '')),
  delivery_address = coalesce(delivery_address, nullif(delivery->>'deliveryAddress', '')),
  delivery_notes = coalesce(delivery_notes, nullif(delivery->>'deliveryNotes', '')),
  gift_note = coalesce(gift_note, nullif(delivery->>'giftNote', '')),
  tracking_number = coalesce(tracking_number, nullif(delivery->>'trackingNumber', '')),
  subtotal = coalesce(
    subtotal,
    case
      when pricing->>'subtotal' ~ '^-?\d+(\.\d+)?$' then (pricing->>'subtotal')::numeric(10, 2)
      else null
    end
  ),
  delivery_fee = coalesce(
    delivery_fee,
    case
      when pricing->>'deliveryFee' ~ '^-?\d+(\.\d+)?$' then (pricing->>'deliveryFee')::numeric(10, 2)
      else null
    end
  ),
  discount = coalesce(
    discount,
    case
      when pricing->>'discount' ~ '^-?\d+(\.\d+)?$' then (pricing->>'discount')::numeric(10, 2)
      else null
    end
  ),
  total_price = coalesce(
    total_price,
    case
      when pricing->>'total' ~ '^-?\d+(\.\d+)?$' then (pricing->>'total')::numeric(10, 2)
      else null
    end
  ),
  payment_status = coalesce(payment_status, nullif(pricing->>'paymentStatus', '')),
  payment_method = coalesce(payment_method, nullif(pricing->>'paymentMethod', ''));

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
  orders.id,
  item_data.line_number::integer,
  nullif(item_data.item->>'productType', ''),
  nullif(item_data.item->>'productId', ''),
  coalesce(nullif(item_data.item->>'productName', ''), 'Custom Order'),
  case
    when item_data.item->>'quantity' ~ '^\d+$' and (item_data.item->>'quantity')::integer > 0 then (item_data.item->>'quantity')::integer
    else 1
  end,
  case
    when item_data.item->>'unitPrice' ~ '^-?\d+(\.\d+)?$' then (item_data.item->>'unitPrice')::numeric(10, 2)
    else null
  end,
  case
    when item_data.item->>'totalPrice' ~ '^-?\d+(\.\d+)?$' then (item_data.item->>'totalPrice')::numeric(10, 2)
    else 0
  end,
  nullif(item_data.item->>'size', ''),
  nullif(item_data.item->>'flavor', ''),
  nullif(item_data.item->>'designType', ''),
  nullif(item_data.item->>'specialInstructions', ''),
  item_data.item
from public.orders
cross join lateral jsonb_array_elements(
  case
    when jsonb_typeof(orders.items) = 'array' then orders.items
    else '[]'::jsonb
  end
) with ordinality as item_data(item, line_number)
on conflict (order_id, line_number) do update
set
  product_type = excluded.product_type,
  product_id = excluded.product_id,
  product_name = excluded.product_name,
  quantity = excluded.quantity,
  unit_price = excluded.unit_price,
  total_price = excluded.total_price,
  size = excluded.size,
  flavor = excluded.flavor,
  design_type = excluded.design_type,
  special_instructions = excluded.special_instructions,
  legacy_item = excluded.legacy_item,
  updated_at = timezone('utc'::text, now());

create index if not exists order_items_order_id_line_number_idx
  on public.order_items (order_id, line_number);

create index if not exists order_items_product_id_idx
  on public.order_items (product_id)
  where product_id is not null;

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

create or replace function public.set_order_items_updated_at()
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

drop trigger if exists set_order_items_updated_at on public.order_items;

create trigger set_order_items_updated_at
before update on public.order_items
for each row
execute function public.set_order_items_updated_at();

alter table public.order_items enable row level security;

revoke all on table public.order_items
  from public, anon, authenticated;

grant all on table public.order_items
  to service_role;
