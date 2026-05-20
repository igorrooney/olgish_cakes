import { randomUUID } from 'crypto'
import { createClient as createSanityClient } from '@sanity/client'
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import type {
  OrderCustomer,
  OrderDelivery,
  OrderItem,
  OrderMessage,
  OrderMetadata,
  OrderNote,
  OrderPricing
} from '@/types/order'

config({ path: '.env.local' })
config({ path: '.env' })

interface SanityOrder {
  _id: string
  _createdAt: string
  _updatedAt: string
  orderNumber: string
  status?: string
  orderType?: string
  customer?: OrderCustomer
  items?: OrderItem[]
  delivery?: OrderDelivery
  pricing?: OrderPricing
  messages?: OrderMessage[]
  notes?: OrderNote[]
  metadata?: OrderMetadata
}

type SupabaseOrderPayload = Record<string, unknown>
type SupabaseOrderItemPayload = Record<string, unknown>
type SupabaseOrderMessagePayload = Record<string, unknown>
type SupabaseOrderMessageAttachmentPayload = Record<string, unknown>
type SupabaseOrderNotePayload = Record<string, unknown>
type SupabaseOrderNoteImagePayload = Record<string, unknown>

interface SupabaseOrderMessagePayloads {
  messages: SupabaseOrderMessagePayload[]
  attachments: SupabaseOrderMessageAttachmentPayload[]
}

interface SupabaseOrderNotePayloads {
  notes: SupabaseOrderNotePayload[]
  images: SupabaseOrderNoteImagePayload[]
}

const isWriteMode = process.argv.includes('--write')
const childPayloadOrderIdPlaceholder = '00000000-0000-0000-0000-000000000000'

function requireEnv(name: string): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

function buildPayload(order: SanityOrder): SupabaseOrderPayload {
  const customer = order.customer || {
    name: '',
    email: '',
    phone: ''
  }
  const delivery = order.delivery || {
    deliveryMethod: 'collection'
  }
  const pricing = order.pricing || {
    total: 0,
    paymentStatus: 'pending'
  }

  return {
    sanity_id: order._id,
    order_number: order.orderNumber,
    status: order.status || 'new',
    order_type: order.orderType || 'custom-quote',
    metadata: {
      ...(order.metadata || {}),
      migratedFromSanity: true,
      sanityId: order._id
    },
    customer_name: customer.name,
    customer_email: customer.email,
    customer_phone: customer.phone,
    customer_address: customer.address || null,
    customer_city: customer.city || null,
    customer_postcode: customer.postcode || null,
    date_needed: delivery.dateNeeded ? delivery.dateNeeded.slice(0, 10) : null,
    delivery_method: delivery.deliveryMethod,
    delivery_address: delivery.deliveryAddress || null,
    delivery_notes: delivery.deliveryNotes || null,
    gift_note: delivery.giftNote || null,
    tracking_number: delivery.trackingNumber || null,
    subtotal: pricing.subtotal ?? null,
    delivery_fee: pricing.deliveryFee ?? null,
    discount: pricing.discount ?? null,
    total_price: pricing.total,
    payment_status: pricing.paymentStatus,
    payment_method: pricing.paymentMethod || null,
    created_at: order._createdAt,
    updated_at: order._updatedAt
  }
}

function buildOrderItemPayloads(orderId: string, items: OrderItem[] | undefined): SupabaseOrderItemPayload[] {
  return (items || []).map((item, index) => ({
    order_id: orderId,
    line_number: index + 1,
    product_type: item.productType || null,
    product_id: item.productId || null,
    product_name: item.productName || 'Custom Order',
    quantity: Number.isFinite(item.quantity) && item.quantity > 0 ? item.quantity : 1,
    unit_price: typeof item.unitPrice === 'number' && Number.isFinite(item.unitPrice) ? item.unitPrice : null,
    total_price: Number.isFinite(item.totalPrice) ? item.totalPrice : 0,
    size: item.size || null,
    flavor: item.flavor || null,
    design_type: item.designType || null,
    special_instructions: item.specialInstructions || null,
    legacy_item: item
  }))
}

function buildOrderMessagePayloads(orderId: string, messages: OrderMessage[] | undefined): SupabaseOrderMessagePayloads {
  return (messages || []).reduce<SupabaseOrderMessagePayloads>((payloads, message, messageIndex) => {
    const messageId = randomUUID()
    const messagePayload: SupabaseOrderMessagePayload = {
      id: messageId,
      order_id: orderId,
      line_number: messageIndex + 1,
      message: message.message || '',
      legacy_message: message
    }
    const attachmentPayloads = (message.attachments || []).map((attachment, attachmentIndex) => ({
      message_id: messageId,
      line_number: attachmentIndex + 1,
      attachment_type: attachment._type || null,
      asset_type: attachment.asset._type || null,
      asset_id: attachment.asset._id || null,
      asset_ref: attachment.asset._ref || null,
      asset_url: attachment.asset.url || null,
      alt: attachment.alt || null,
      caption: attachment.caption || null,
      legacy_attachment: attachment
    }))

    return {
      messages: [...payloads.messages, messagePayload],
      attachments: [...payloads.attachments, ...attachmentPayloads]
    }
  }, {
    messages: [],
    attachments: []
  })
}

function buildOrderNotePayloads(orderId: string, notes: OrderNote[] | undefined): SupabaseOrderNotePayloads {
  return (notes || []).reduce<SupabaseOrderNotePayloads>((payloads, note, noteIndex) => {
    const noteId = randomUUID()
    const notePayload: SupabaseOrderNotePayload = {
      id: noteId,
      order_id: orderId,
      line_number: noteIndex + 1,
      note: note.note || '',
      author: note.author || null,
      note_created_at: note.createdAt || null,
      legacy_note: note
    }
    const imagePayloads = (note.images || []).map((image, imageIndex) => ({
      note_id: noteId,
      line_number: imageIndex + 1,
      image_type: image._type || null,
      asset_type: image.asset._type || null,
      asset_id: image.asset._id || null,
      asset_ref: image.asset._ref || null,
      asset_url: image.asset.url || null,
      alt: image.alt || null,
      caption: image.caption || null,
      legacy_image: image
    }))

    return {
      notes: [...payloads.notes, notePayload],
      images: [...payloads.images, ...imagePayloads]
    }
  }, {
    notes: [],
    images: []
  })
}

async function main() {
  const sanityClient = createSanityClient({
    projectId: requireEnv('NEXT_PUBLIC_SANITY_PROJECT_ID'),
    dataset: requireEnv('NEXT_PUBLIC_SANITY_DATASET'),
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-03-31',
    token: requireEnv('SANITY_API_TOKEN'),
    useCdn: false,
    perspective: 'published'
  })
  const supabase = createClient(
    requireEnv('SUPABASE_URL'),
    requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    }
  )

  const orders = await sanityClient.fetch<SanityOrder[]>(`
    *[_type == "order"] | order(_createdAt asc) {
      _id,
      _createdAt,
      _updatedAt,
      orderNumber,
      status,
      orderType,
      customer,
      items,
      delivery,
      pricing,
      messages[]{
        message,
        attachments[]{
          _type,
          "asset": {
            "_type": coalesce(asset->_type, "sanity.imageAsset"),
            "_id": asset->_id,
            "_ref": asset->_id,
            "url": asset->url
          },
          alt,
          caption
        }
      },
      notes[]{
        note,
        author,
        createdAt,
        images[]{
          _type,
          "asset": {
            "_type": coalesce(asset->_type, "sanity.imageAsset"),
            "_id": asset->_id,
            "_ref": asset->_id,
            "url": asset->url
          },
          alt,
          caption
        }
      },
      metadata
    }
  `)

  const validOrders = orders.filter((order) => order.orderNumber)

  if (!isWriteMode) {
    console.log(`Dry run: found ${orders.length} Sanity orders, ${validOrders.length} with order numbers.`)
    console.log('Re-run with --write after applying the Supabase order normalization migrations.')
    return
  }

  let migratedCount = 0

  for (const order of validOrders) {
    const messagePayloads = buildOrderMessagePayloads(childPayloadOrderIdPlaceholder, order.messages)
    const notePayloads = buildOrderNotePayloads(childPayloadOrderIdPlaceholder, order.notes)
    const { error } = await supabase.rpc('replace_order_with_children', {
      p_order_id: null,
      p_order_payload: buildPayload(order),
      p_item_payloads: buildOrderItemPayloads(childPayloadOrderIdPlaceholder, order.items),
      p_message_payloads: messagePayloads.messages,
      p_message_attachment_payloads: messagePayloads.attachments,
      p_note_payloads: notePayloads.notes,
      p_note_image_payloads: notePayloads.images,
      p_upsert_by_order_number: true
    })

    if (error) {
      throw new Error(`Failed to migrate order ${order.orderNumber}: ${error.message}`)
    }

    migratedCount += 1
  }

  console.log(`Migrated ${migratedCount} orders from Sanity to Supabase.`)
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
