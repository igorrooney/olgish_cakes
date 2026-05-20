alter table public.orders
  add column if not exists delivery_recipient_name text;

update public.orders
set delivery_recipient_name = nullif(coalesce(
  metadata #>> '{inlineOrderContext,deliveryRecipientName}',
  metadata #>> '{inlineOrderContext,recipientName}',
  metadata->>'deliveryRecipientName',
  metadata->>'recipientName',
  ''
), '')
where delivery_recipient_name is null;
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
        delivery_recipient_name,
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
        nullif(p_order_payload->>'delivery_recipient_name', ''),
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
        delivery_recipient_name = excluded.delivery_recipient_name,
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
        delivery_recipient_name,
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
        nullif(p_order_payload->>'delivery_recipient_name', ''),
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
      delivery_recipient_name = nullif(p_order_payload->>'delivery_recipient_name', ''),
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
