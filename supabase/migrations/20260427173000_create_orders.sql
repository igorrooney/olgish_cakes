create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  sanity_id text unique,
  order_number text not null unique,
  status text not null default 'new',
  order_type text not null default 'custom-quote',
  customer jsonb not null default '{}'::jsonb,
  items jsonb not null default '[]'::jsonb,
  delivery jsonb not null default '{}'::jsonb,
  pricing jsonb not null default '{}'::jsonb,
  messages jsonb not null default '[]'::jsonb,
  notes jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists orders_created_at_idx
  on public.orders (created_at desc);

create index if not exists orders_status_created_at_idx
  on public.orders (status, created_at desc);

create index if not exists orders_customer_email_idx
  on public.orders ((customer->>'email'));

create or replace function public.set_orders_updated_at()
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

drop trigger if exists set_orders_updated_at on public.orders;

create trigger set_orders_updated_at
before update on public.orders
for each row
execute function public.set_orders_updated_at();

alter table public.orders enable row level security;

revoke all on table public.orders
  from public, anon, authenticated;

grant all on table public.orders
  to service_role;
