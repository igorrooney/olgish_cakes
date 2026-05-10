drop index if exists public.orders_customer_email_idx;

alter table public.orders
  drop column if exists customer,
  drop column if exists items,
  drop column if exists delivery,
  drop column if exists pricing;
