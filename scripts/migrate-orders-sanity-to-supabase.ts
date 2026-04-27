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

const isWriteMode = process.argv.includes('--write')

function requireEnv(name: string): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

function buildPayload(order: SanityOrder): SupabaseOrderPayload {
  return {
    sanity_id: order._id,
    order_number: order.orderNumber,
    status: order.status || 'new',
    order_type: order.orderType || 'custom-quote',
    customer: order.customer || {
      name: '',
      email: '',
      phone: ''
    },
    items: order.items || [],
    delivery: order.delivery || {
      deliveryMethod: 'collection'
    },
    pricing: order.pricing || {
      total: 0,
      paymentStatus: 'pending'
    },
    messages: order.messages || [],
    notes: order.notes || [],
    metadata: {
      ...(order.metadata || {}),
      migratedFromSanity: true,
      sanityId: order._id
    },
    created_at: order._createdAt,
    updated_at: order._updatedAt
  }
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
    console.log('Re-run with --write after applying supabase/migrations/20260427173000_create_orders.sql.')
    return
  }

  let migratedCount = 0

  for (const order of validOrders) {
    const { error } = await supabase
      .from('orders')
      .upsert(buildPayload(order), {
        onConflict: 'order_number'
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
