with classified_orders as (
  select
    orders.id,
    case
      when lower(btrim(orders.order_type)) in ('cakes-by-post', 'cakes by post', 'gift-hamper', 'gift hamper')
        or lower(btrim(coalesce(orders.delivery_method, ''))) in ('postal', 'postal-delivery')
        or exists (
          select 1
          from public.order_items
          where order_items.order_id = orders.id
            and lower(btrim(coalesce(order_items.product_type, ''))) in ('gift-hamper', 'gift hamper', 'hamper')
        )
        then 'cakes-by-post'
      when lower(btrim(orders.order_type)) in (
        'custom-cake',
        'custom cake',
        'browse-catalog',
        'browse our catalog',
        'custom-design',
        'custom design',
        'wedding-cake',
        'wedding cake',
        'custom-quote',
        'custom quote',
        'standard',
        'custom',
        'cake-standard-design',
        'cake standard design',
        'cake-individual-design',
        'cake individual design'
      )
        then 'custom-cake'
      else null
    end as normalized_order_type
  from public.orders
)
update public.orders
set
  order_type = classified_orders.normalized_order_type,
  metadata = case
    when coalesce(orders.metadata, '{}'::jsonb) ? 'legacyOrderType' then coalesce(orders.metadata, '{}'::jsonb)
    else jsonb_set(
      coalesce(orders.metadata, '{}'::jsonb),
      '{legacyOrderType}',
      to_jsonb(orders.order_type),
      true
    )
  end
from classified_orders
where orders.id = classified_orders.id
  and classified_orders.normalized_order_type is not null
  and orders.order_type is distinct from classified_orders.normalized_order_type;
