create table if not exists public.custom_cake_enquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  phone text,
  address text,
  city text,
  postcode text,
  occasion text,
  date_needed text not null,
  requirements text,
  reference_image_bucket text,
  reference_image_path text,
  reference_image_name text,
  reference_image_type text,
  reference_image_size bigint,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.custom_cake_enquiries
  add column if not exists updated_at timestamptz not null default timezone('utc'::text, now());

alter table public.custom_cake_enquiries enable row level security;

revoke all on table public.custom_cake_enquiries
  from public, anon, authenticated;

grant all on table public.custom_cake_enquiries
  to service_role;

do $$
begin
  if to_regclass('public.custom_cake_enquiries_id_seq') is not null then
    grant usage, select on sequence public.custom_cake_enquiries_id_seq
      to service_role;
  end if;
end $$;

create index if not exists custom_cake_enquiries_created_at_idx
  on public.custom_cake_enquiries (created_at desc);

alter table public.enquiry_rate_limits enable row level security;

revoke all on table public.enquiry_rate_limits
  from public, anon, authenticated;

grant select, insert, update, delete on table public.enquiry_rate_limits
  to service_role;

create index if not exists contact_enquiries_created_at_idx
  on public.contact_enquiries (created_at desc);

create index if not exists workshop_enquiries_created_at_idx
  on public.workshop_enquiries (created_at desc);
