import 'server-only'

import { randomUUID } from 'crypto'
import { getSupabaseAdminClient } from '@/lib/supabase-admin-client'
import type {
  Order,
  OrderCustomer,
  OrderDelivery,
  OrderItem,
  OrderMessage,
  OrderMessageAttachment,
  OrderMetadata,
  OrderNote,
  OrderNoteImage,
  OrderPricing
} from '@/types/order'

export const ordersTable = 'orders'

type JsonObject = Record<string, unknown>

interface SupabaseOrderRow {
  id: string
  sanity_id: string | null
  order_number: string
  status: string
  order_type: string
  customer: unknown
  items: unknown
  delivery: unknown
  pricing: unknown
  messages: unknown
  notes: unknown
  metadata: unknown
  created_at: string
  updated_at: string
}

export interface SupabaseOrderInput {
  sanityId?: string | null
  orderNumber: string
  status: string
  orderType: string
  customer: OrderCustomer
  items: OrderItem[]
  delivery: OrderDelivery
  pricing: OrderPricing
  messages?: OrderMessage[]
  notes?: OrderNote[]
  metadata?: OrderMetadata
  createdAt?: string
  updatedAt?: string
}

export interface OrderListParams {
  status?: string | null
  limit: number
  offset: number
}

export interface OrderListResult {
  orders: Order[]
  totalCount: number
}

export interface OrderEarningsSummary {
  createdAt: string
  status: string
  total: number
  paymentStatus: string
}

const asOrderCustomer = (value: unknown): OrderCustomer => value as OrderCustomer
const asOrderDelivery = (value: unknown): OrderDelivery => value as OrderDelivery
const asOrderPricing = (value: unknown): OrderPricing => value as OrderPricing
const asOrderItems = (value: unknown): OrderItem[] => Array.isArray(value) ? value as OrderItem[] : []
const asOrderMessages = (value: unknown): OrderMessage[] | undefined => Array.isArray(value) ? value as OrderMessage[] : undefined
const asOrderNotes = (value: unknown): OrderNote[] | undefined => Array.isArray(value) ? value as OrderNote[] : undefined
const asOrderMetadata = (value: unknown): OrderMetadata | undefined => {
  if (!value || typeof value !== 'object') {
    return undefined
  }

  return value as OrderMetadata
}

const getOrderImageBucket = () => process.env.SUPABASE_ENQUIRY_BUCKET || 'custom-cake-enquiries'

const isSupabaseFileAsset = (asset: { _type?: string } | undefined): boolean =>
  asset?._type === 'supabase-file'

const getSupabaseAssetPath = (asset: { _id?: string, _ref?: string }): string =>
  asset._ref || asset._id || ''

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)

async function signOrderMessageAttachment(attachment: OrderMessageAttachment): Promise<OrderMessageAttachment> {
  if (!isSupabaseFileAsset(attachment.asset)) {
    return attachment
  }

  const path = getSupabaseAssetPath(attachment.asset)
  if (!path) {
    return attachment
  }

  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase.storage
    .from(getOrderImageBucket())
    .createSignedUrl(path, 60 * 60)

  if (error || !data?.signedUrl) {
    return attachment
  }

  return {
    ...attachment,
    asset: {
      ...attachment.asset,
      url: data.signedUrl
    }
  }
}

async function signOrderNoteImage(image: OrderNoteImage): Promise<OrderNoteImage> {
  if (!isSupabaseFileAsset(image.asset)) {
    return image
  }

  const path = getSupabaseAssetPath(image.asset)
  if (!path) {
    return image
  }

  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase.storage
    .from(getOrderImageBucket())
    .createSignedUrl(path, 60 * 60)

  if (error || !data?.signedUrl) {
    return image
  }

  return {
    ...image,
    asset: {
      ...image.asset,
      url: data.signedUrl
    }
  }
}

export async function signSupabaseOrderImageUrls(order: Order): Promise<Order> {
  const signedMessages = order.messages
    ? await Promise.all(order.messages.map(async (message) => ({
        ...message,
        attachments: message.attachments
          ? await Promise.all(message.attachments.map(signOrderMessageAttachment))
          : message.attachments
      })))
    : order.messages

  const signedNotes = order.notes
    ? await Promise.all(order.notes.map(async (note) => ({
        ...note,
        images: note.images
          ? await Promise.all(note.images.map(signOrderNoteImage))
          : note.images
      })))
    : order.notes

  return {
    ...order,
    messages: signedMessages,
    notes: signedNotes
  }
}

export function mapSupabaseOrderRow(row: SupabaseOrderRow): Order {
  return {
    _id: row.id,
    _createdAt: row.created_at,
    _updatedAt: row.updated_at,
    orderNumber: row.order_number,
    status: row.status,
    orderType: row.order_type,
    customer: asOrderCustomer(row.customer),
    items: asOrderItems(row.items),
    delivery: asOrderDelivery(row.delivery),
    pricing: asOrderPricing(row.pricing),
    messages: asOrderMessages(row.messages),
    notes: asOrderNotes(row.notes),
    metadata: asOrderMetadata(row.metadata)
  }
}

export function buildSupabaseOrderPayload(input: SupabaseOrderInput): JsonObject {
  return {
    sanity_id: input.sanityId ?? null,
    order_number: input.orderNumber,
    status: input.status,
    order_type: input.orderType,
    customer: input.customer,
    items: input.items,
    delivery: input.delivery,
    pricing: input.pricing,
    messages: input.messages ?? [],
    notes: input.notes ?? [],
    metadata: input.metadata ?? {},
    ...(input.createdAt ? { created_at: input.createdAt } : {}),
    ...(input.updatedAt ? { updated_at: input.updatedAt } : {})
  }
}

export function buildSupabaseOrderPayloadFromOrder(order: Order): JsonObject {
  return {
    order_number: order.orderNumber,
    status: order.status,
    order_type: order.orderType,
    customer: order.customer,
    items: order.items,
    delivery: order.delivery,
    pricing: order.pricing,
    messages: order.messages ?? [],
    notes: order.notes ?? [],
    metadata: order.metadata ?? {}
  }
}

export async function createSupabaseOrder(input: SupabaseOrderInput): Promise<Order> {
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from(ordersTable)
    .insert(buildSupabaseOrderPayload(input))
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create Supabase order: ${error.message}`)
  }

  return mapSupabaseOrderRow(data as SupabaseOrderRow)
}

export async function upsertSupabaseOrder(input: SupabaseOrderInput): Promise<Order> {
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from(ordersTable)
    .upsert(buildSupabaseOrderPayload(input), {
      onConflict: 'order_number'
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to upsert Supabase order: ${error.message}`)
  }

  return mapSupabaseOrderRow(data as SupabaseOrderRow)
}

export async function getSupabaseOrderById(id: string): Promise<Order | null> {
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from(ordersTable)
    .select()
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to fetch Supabase order: ${error.message}`)
  }

  return data ? signSupabaseOrderImageUrls(mapSupabaseOrderRow(data as SupabaseOrderRow)) : null
}

export async function getSupabaseOrderByIdentifier(identifier: string): Promise<Order | null> {
  const orderById = isUuid(identifier) ? await getSupabaseOrderById(identifier) : null

  if (orderById) {
    return orderById
  }

  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from(ordersTable)
    .select()
    .eq('order_number', identifier)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to fetch Supabase order: ${error.message}`)
  }

  return data ? signSupabaseOrderImageUrls(mapSupabaseOrderRow(data as SupabaseOrderRow)) : null
}

export async function listSupabaseOrders(params: OrderListParams): Promise<OrderListResult> {
  const supabase = getSupabaseAdminClient()
  let query = supabase
    .from(ordersTable)
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(params.offset, params.offset + params.limit - 1)

  if (params.status) {
    query = query.eq('status', params.status)
  }

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to list Supabase orders: ${error.message}`)
  }

  const orders = Array.isArray(data)
    ? await Promise.all(data.map((row) => signSupabaseOrderImageUrls(mapSupabaseOrderRow(row as SupabaseOrderRow))))
    : []

  return {
    orders,
    totalCount: count ?? 0
  }
}

export async function updateSupabaseOrder(order: Order): Promise<Order> {
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from(ordersTable)
    .update(buildSupabaseOrderPayloadFromOrder(order))
    .eq('id', order._id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update Supabase order: ${error.message}`)
  }

  return signSupabaseOrderImageUrls(mapSupabaseOrderRow(data as SupabaseOrderRow))
}

export async function updateSupabaseOrderMetadata(
  id: string,
  metadata: OrderMetadata | undefined,
  patch: OrderMetadata
): Promise<Order> {
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from(ordersTable)
    .update({
      metadata: {
        ...(metadata ?? {}),
        ...patch
      }
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update Supabase order metadata: ${error.message}`)
  }

  return mapSupabaseOrderRow(data as SupabaseOrderRow)
}

export async function deleteSupabaseOrder(id: string): Promise<void> {
  const supabase = getSupabaseAdminClient()
  const { error } = await supabase
    .from(ordersTable)
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete Supabase order: ${error.message}`)
  }
}

export async function listSupabaseOrderEarningsSummaries(): Promise<OrderEarningsSummary[]> {
  const supabase = getSupabaseAdminClient()
  const pageSize = 1000
  let offset = 0
  const summaries: OrderEarningsSummary[] = []

  while (true) {
    const { data, error } = await supabase
      .from(ordersTable)
      .select('created_at,status,pricing')
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1)

    if (error) {
      throw new Error(`Failed to fetch Supabase earnings orders: ${error.message}`)
    }

    const rows = Array.isArray(data) ? data as Array<Pick<SupabaseOrderRow, 'created_at' | 'status' | 'pricing'>> : []

    summaries.push(...rows.map((row) => {
      const pricing = asOrderPricing(row.pricing)

      return {
        createdAt: row.created_at,
        status: row.status,
        total: typeof pricing.total === 'number' ? pricing.total : 0,
        paymentStatus: pricing.paymentStatus || 'pending'
      }
    }))

    if (rows.length < pageSize) {
      break
    }

    offset += pageSize
  }

  return summaries
}

export async function uploadSupabaseOrderNoteImage(orderId: string, imageFile: File): Promise<OrderNoteImage> {
  const supabase = getSupabaseAdminClient()
  const bucket = getOrderImageBucket()
  const extension = imageFile.name.includes('.') ? imageFile.name.split('.').pop() : 'jpg'
  const safeName = imageFile.name
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'image'
  const path = `orders/${orderId}/notes/${Date.now()}-${randomUUID()}-${safeName}.${extension}`

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, await imageFile.arrayBuffer(), {
      contentType: imageFile.type || 'image/jpeg',
      upsert: false
    })

  if (error) {
    throw new Error(`Failed to upload order image to Supabase Storage: ${error.message}`)
  }

  const { data } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 60 * 60)

  return {
    _type: 'image',
    asset: {
      _type: 'supabase-file',
      _id: path,
      _ref: path,
      url: data?.signedUrl || ''
    },
    alt: imageFile.name || 'Uploaded image',
    caption: ''
  }
}
