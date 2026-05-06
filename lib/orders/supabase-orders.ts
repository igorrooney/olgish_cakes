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
export const orderItemsTable = 'order_items'
export const orderMessagesTable = 'order_messages'
export const orderMessageAttachmentsTable = 'order_message_attachments'
export const orderNotesTable = 'order_notes'
export const orderNoteImagesTable = 'order_note_images'

type JsonObject = Record<string, unknown>
type SupabaseAdminClient = ReturnType<typeof getSupabaseAdminClient>

interface SupabaseOrderItemRow {
  id?: string
  order_id: string
  line_number: number
  product_type: string | null
  product_id: string | null
  product_name: string | null
  quantity: number | string | null
  unit_price: number | string | null
  total_price: number | string | null
  size: string | null
  flavor: string | null
  design_type: string | null
  special_instructions: string | null
  legacy_item: unknown
}

interface SupabaseOrderMessageAttachmentRow {
  id?: string
  message_id: string
  line_number: number
  attachment_type: string | null
  asset_type: string | null
  asset_id: string | null
  asset_ref: string | null
  asset_url: string | null
  alt: string | null
  caption: string | null
  legacy_attachment: unknown
}

interface SupabaseOrderMessageRow {
  id?: string
  order_id: string
  line_number: number
  message: string | null
  legacy_message: unknown
}

interface SupabaseOrderNoteImageRow {
  id?: string
  note_id: string
  line_number: number
  image_type: string | null
  asset_type: string | null
  asset_id: string | null
  asset_ref: string | null
  asset_url: string | null
  alt: string | null
  caption: string | null
  legacy_image: unknown
}

interface SupabaseOrderNoteRow {
  id?: string
  order_id: string
  line_number: number
  note: string | null
  author: string | null
  note_created_at: string | null
  created_at: string
  legacy_note: unknown
}

interface SupabaseOrderRow {
  id: string
  sanity_id: string | null
  order_number: string
  status: string
  order_type: string
  metadata: unknown
  customer_name?: string | null
  customer_email?: string | null
  customer_phone?: string | null
  customer_address?: string | null
  customer_city?: string | null
  customer_postcode?: string | null
  date_needed?: string | null
  delivery_method?: string | null
  delivery_address?: string | null
  delivery_notes?: string | null
  gift_note?: string | null
  tracking_number?: string | null
  subtotal?: number | string | null
  delivery_fee?: number | string | null
  discount?: number | string | null
  total_price?: number | string | null
  payment_status?: string | null
  payment_method?: string | null
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

interface SupabaseOrderMessagePayloads {
  messages: JsonObject[]
  attachments: JsonObject[]
}

interface SupabaseOrderNotePayloads {
  notes: JsonObject[]
  images: JsonObject[]
}

interface SupabaseOrderChildren {
  itemsByOrderId: Map<string, OrderItem[]>
  messagesByOrderId: Map<string, OrderMessage[]>
  notesByOrderId: Map<string, OrderNote[]>
}

const isRecord = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const asRecord = (value: unknown): JsonObject => isRecord(value) ? value : {}

const getStringField = (record: JsonObject, key: string): string | undefined => {
  const value = record[key]
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

const getNumberValue = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number.parseFloat(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }

  return undefined
}

const getNumberField = (record: JsonObject, key: string): number | undefined =>
  getNumberValue(record[key])

const getPositiveIntegerValue = (value: unknown): number | undefined => {
  const numberValue = getNumberValue(value)
  if (numberValue === undefined) {
    return undefined
  }

  const integerValue = Math.trunc(numberValue)
  return integerValue > 0 ? integerValue : undefined
}

const nullIfEmpty = (value: string | undefined): string | null =>
  value && value.trim().length > 0 ? value.trim() : null

const numberOrNull = (value: unknown): number | null =>
  getNumberValue(value) ?? null

const getRecordArray = (value: unknown): JsonObject[] =>
  Array.isArray(value) ? value.filter(isRecord) : []

const getValidPostgresDate = (value: string): string | null => {
  const dateValue = value.slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return null
  }

  const date = new Date(`${dateValue}T00:00:00.000Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === dateValue
    ? dateValue
    : null
}

const normalizeDateForPostgres = (value: string | undefined): string | null => {
  if (!value || value.trim().length === 0) {
    return null
  }

  return getValidPostgresDate(value.trim())
}

const asOrderMetadata = (value: unknown): OrderMetadata | undefined => {
  if (!isRecord(value)) {
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

function mapSupabaseOrderCustomer(row: SupabaseOrderRow): OrderCustomer {
  return {
    name: row.customer_name || '',
    email: row.customer_email || '',
    phone: row.customer_phone || '',
    address: row.customer_address || undefined,
    city: row.customer_city || undefined,
    postcode: row.customer_postcode || undefined
  }
}

function mapSupabaseOrderDelivery(row: SupabaseOrderRow): OrderDelivery {
  return {
    dateNeeded: row.date_needed || undefined,
    deliveryMethod: row.delivery_method || 'collection',
    deliveryAddress: row.delivery_address || undefined,
    deliveryNotes: row.delivery_notes || undefined,
    giftNote: row.gift_note || undefined,
    trackingNumber: row.tracking_number || undefined
  }
}

function mapSupabaseOrderPricing(row: SupabaseOrderRow): OrderPricing {
  return {
    subtotal: getNumberValue(row.subtotal),
    deliveryFee: getNumberValue(row.delivery_fee),
    discount: getNumberValue(row.discount),
    total: getNumberValue(row.total_price) ?? 0,
    paymentStatus: row.payment_status || 'pending',
    paymentMethod: row.payment_method || undefined
  }
}

export function mapSupabaseOrderItemRow(row: SupabaseOrderItemRow): OrderItem {
  const legacyItem = asRecord(row.legacy_item)
  const item: OrderItem & JsonObject = {
    ...legacyItem,
    productType: row.product_type || getStringField(legacyItem, 'productType'),
    productId: row.product_id || getStringField(legacyItem, 'productId'),
    productName: row.product_name || getStringField(legacyItem, 'productName') || 'Custom Order',
    quantity: getPositiveIntegerValue(row.quantity) ?? getPositiveIntegerValue(legacyItem.quantity) ?? 1,
    unitPrice: getNumberValue(row.unit_price) ?? getNumberField(legacyItem, 'unitPrice'),
    totalPrice: getNumberValue(row.total_price) ?? getNumberField(legacyItem, 'totalPrice') ?? 0,
    size: row.size || getStringField(legacyItem, 'size'),
    flavor: row.flavor || getStringField(legacyItem, 'flavor'),
    designType: row.design_type || getStringField(legacyItem, 'designType'),
    specialInstructions: row.special_instructions || getStringField(legacyItem, 'specialInstructions')
  }

  return item
}

export function mapSupabaseOrderMessageAttachmentRow(row: SupabaseOrderMessageAttachmentRow): OrderMessageAttachment {
  const legacyAttachment = asRecord(row.legacy_attachment)
  const legacyAsset = asRecord(legacyAttachment.asset)
  const assetId = row.asset_id || getStringField(legacyAsset, '_id') || row.asset_ref || getStringField(legacyAsset, '_ref') || ''
  const assetRef = row.asset_ref || getStringField(legacyAsset, '_ref') || assetId
  const attachment: OrderMessageAttachment & JsonObject = {
    ...legacyAttachment,
    _type: row.attachment_type || getStringField(legacyAttachment, '_type') || 'image',
    asset: {
      ...legacyAsset,
      _type: row.asset_type || getStringField(legacyAsset, '_type') || 'supabase-file',
      _id: assetId,
      _ref: assetRef,
      url: row.asset_url || getStringField(legacyAsset, 'url') || ''
    },
    alt: row.alt || getStringField(legacyAttachment, 'alt'),
    caption: row.caption || getStringField(legacyAttachment, 'caption')
  }

  return attachment
}

export function mapSupabaseOrderMessageRow(
  row: SupabaseOrderMessageRow,
  relationalAttachments?: OrderMessageAttachment[]
): OrderMessage {
  const legacyMessage = asRecord(row.legacy_message)
  const legacyAttachments = Array.isArray(legacyMessage.attachments)
    ? legacyMessage.attachments as OrderMessageAttachment[]
    : undefined
  const message: OrderMessage & JsonObject = {
    ...legacyMessage,
    message: row.message || getStringField(legacyMessage, 'message') || '',
    attachments: relationalAttachments && relationalAttachments.length > 0
      ? relationalAttachments
      : legacyAttachments
  }

  return message
}

export function mapSupabaseOrderNoteImageRow(row: SupabaseOrderNoteImageRow): OrderNoteImage {
  const legacyImage = asRecord(row.legacy_image)
  const legacyAsset = asRecord(legacyImage.asset)
  const assetId = row.asset_id || getStringField(legacyAsset, '_id') || undefined
  const assetRef = row.asset_ref || getStringField(legacyAsset, '_ref') || assetId
  const image: OrderNoteImage & JsonObject = {
    ...legacyImage,
    _type: row.image_type || getStringField(legacyImage, '_type') || 'image',
    asset: {
      ...legacyAsset,
      _type: row.asset_type || getStringField(legacyAsset, '_type') || 'supabase-file',
      _id: assetId,
      _ref: assetRef,
      url: row.asset_url || getStringField(legacyAsset, 'url')
    },
    alt: row.alt || getStringField(legacyImage, 'alt'),
    caption: row.caption || getStringField(legacyImage, 'caption')
  }

  return image
}

export function mapSupabaseOrderNoteRow(
  row: SupabaseOrderNoteRow,
  relationalImages?: OrderNoteImage[]
): OrderNote {
  const legacyNote = asRecord(row.legacy_note)
  const legacyImages = Array.isArray(legacyNote.images)
    ? legacyNote.images as OrderNoteImage[]
    : undefined
  const note: OrderNote & JsonObject = {
    ...legacyNote,
    note: row.note || getStringField(legacyNote, 'note') || '',
    author: row.author || getStringField(legacyNote, 'author') || 'Admin',
    createdAt: row.note_created_at || getStringField(legacyNote, 'createdAt') || row.created_at,
    images: relationalImages && relationalImages.length > 0
      ? relationalImages
      : legacyImages
  }

  return note
}

export function mapSupabaseOrderRow(
  row: SupabaseOrderRow,
  relationalItems?: OrderItem[],
  relationalMessages?: OrderMessage[],
  relationalNotes?: OrderNote[]
): Order {
  return {
    _id: row.id,
    _createdAt: row.created_at,
    _updatedAt: row.updated_at,
    orderNumber: row.order_number,
    status: row.status,
    orderType: row.order_type,
    customer: mapSupabaseOrderCustomer(row),
    items: relationalItems ?? [],
    delivery: mapSupabaseOrderDelivery(row),
    pricing: mapSupabaseOrderPricing(row),
    messages: relationalMessages ?? [],
    notes: relationalNotes ?? [],
    metadata: asOrderMetadata(row.metadata)
  }
}

function buildOrderStructuredPayload(params: {
  customer: OrderCustomer
  delivery: OrderDelivery
  pricing: OrderPricing
}): JsonObject {
  return {
    customer_name: params.customer.name,
    customer_email: params.customer.email,
    customer_phone: params.customer.phone,
    customer_address: params.customer.address ?? null,
    customer_city: params.customer.city ?? null,
    customer_postcode: params.customer.postcode ?? null,
    date_needed: normalizeDateForPostgres(params.delivery.dateNeeded),
    delivery_method: params.delivery.deliveryMethod,
    delivery_address: params.delivery.deliveryAddress ?? null,
    delivery_notes: params.delivery.deliveryNotes ?? null,
    gift_note: params.delivery.giftNote ?? null,
    tracking_number: params.delivery.trackingNumber ?? null,
    subtotal: numberOrNull(params.pricing.subtotal),
    delivery_fee: numberOrNull(params.pricing.deliveryFee),
    discount: numberOrNull(params.pricing.discount),
    total_price: numberOrNull(params.pricing.total),
    payment_status: params.pricing.paymentStatus,
    payment_method: params.pricing.paymentMethod ?? null
  }
}

export function buildSupabaseOrderPayload(input: SupabaseOrderInput): JsonObject {
  return {
    sanity_id: input.sanityId ?? null,
    order_number: input.orderNumber,
    status: input.status,
    order_type: input.orderType,
    metadata: input.metadata ?? {},
    ...buildOrderStructuredPayload(input),
    ...(input.createdAt ? { created_at: input.createdAt } : {}),
    ...(input.updatedAt ? { updated_at: input.updatedAt } : {})
  }
}

export function buildSupabaseOrderPayloadFromOrder(order: Order): JsonObject {
  return {
    order_number: order.orderNumber,
    status: order.status,
    order_type: order.orderType,
    metadata: order.metadata ?? {},
    ...buildOrderStructuredPayload(order)
  }
}

export function buildSupabaseOrderItemPayloads(orderId: string, items: OrderItem[]): JsonObject[] {
  return items.map((item, index) => ({
    order_id: orderId,
    line_number: index + 1,
    product_type: nullIfEmpty(item.productType),
    product_id: nullIfEmpty(item.productId),
    product_name: item.productName || 'Custom Order',
    quantity: getPositiveIntegerValue(item.quantity) ?? 1,
    unit_price: numberOrNull(item.unitPrice),
    total_price: getNumberValue(item.totalPrice) ?? 0,
    size: nullIfEmpty(item.size),
    flavor: nullIfEmpty(item.flavor),
    design_type: nullIfEmpty(item.designType),
    special_instructions: nullIfEmpty(item.specialInstructions),
    legacy_item: item
  }))
}

export function buildSupabaseOrderMessagePayloads(
  orderId: string,
  messages: OrderMessage[] | undefined
): SupabaseOrderMessagePayloads {
  return (messages ?? []).reduce<SupabaseOrderMessagePayloads>((payloads, message, messageIndex) => {
    const messageRecord = asRecord(message)
    const messageId = randomUUID()
    const messagePayload: JsonObject = {
      id: messageId,
      order_id: orderId,
      line_number: messageIndex + 1,
      message: getStringField(messageRecord, 'message') || '',
      legacy_message: messageRecord
    }
    const attachmentPayloads = getRecordArray(messageRecord.attachments)
      .map((attachment, attachmentIndex): JsonObject => {
        const asset = asRecord(attachment.asset)

        return {
          message_id: messageId,
          line_number: attachmentIndex + 1,
          attachment_type: nullIfEmpty(getStringField(attachment, '_type')),
          asset_type: nullIfEmpty(getStringField(asset, '_type')),
          asset_id: nullIfEmpty(getStringField(asset, '_id')),
          asset_ref: nullIfEmpty(getStringField(asset, '_ref')),
          asset_url: nullIfEmpty(getStringField(asset, 'url')),
          alt: nullIfEmpty(getStringField(attachment, 'alt')),
          caption: nullIfEmpty(getStringField(attachment, 'caption')),
          legacy_attachment: attachment
        }
      })

    return {
      messages: [...payloads.messages, messagePayload],
      attachments: [...payloads.attachments, ...attachmentPayloads]
    }
  }, {
    messages: [],
    attachments: []
  })
}

export function buildSupabaseOrderNotePayloads(
  orderId: string,
  notes: OrderNote[] | undefined
): SupabaseOrderNotePayloads {
  return (notes ?? []).reduce<SupabaseOrderNotePayloads>((payloads, note, noteIndex) => {
    const noteRecord = asRecord(note)
    const noteId = randomUUID()
    const notePayload: JsonObject = {
      id: noteId,
      order_id: orderId,
      line_number: noteIndex + 1,
      note: getStringField(noteRecord, 'note') || '',
      author: getStringField(noteRecord, 'author') || null,
      note_created_at: getStringField(noteRecord, 'createdAt') || null,
      legacy_note: noteRecord
    }
    const imagePayloads = getRecordArray(noteRecord.images)
      .map((image, imageIndex): JsonObject => {
        const asset = asRecord(image.asset)

        return {
          note_id: noteId,
          line_number: imageIndex + 1,
          image_type: nullIfEmpty(getStringField(image, '_type')),
          asset_type: nullIfEmpty(getStringField(asset, '_type')),
          asset_id: nullIfEmpty(getStringField(asset, '_id')),
          asset_ref: nullIfEmpty(getStringField(asset, '_ref')),
          asset_url: nullIfEmpty(getStringField(asset, 'url')),
          alt: nullIfEmpty(getStringField(image, 'alt')),
          caption: nullIfEmpty(getStringField(image, 'caption')),
          legacy_image: image
        }
      })

    return {
      notes: [...payloads.notes, notePayload],
      images: [...payloads.images, ...imagePayloads]
    }
  }, {
    notes: [],
    images: []
  })
}

async function fetchSupabaseOrderItemsByOrderIds(
  supabase: SupabaseAdminClient,
  orderIds: string[]
): Promise<Map<string, OrderItem[]>> {
  const itemsByOrderId = new Map<string, OrderItem[]>()

  if (orderIds.length === 0) {
    return itemsByOrderId
  }

  const { data, error } = await supabase
    .from(orderItemsTable)
    .select('*')
    .in('order_id', orderIds)
    .order('line_number', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch Supabase order items: ${error.message}`)
  }

  const rows = Array.isArray(data) ? data as SupabaseOrderItemRow[] : []
  rows.forEach((row) => {
    const currentItems = itemsByOrderId.get(row.order_id) ?? []
    itemsByOrderId.set(row.order_id, [...currentItems, mapSupabaseOrderItemRow(row)])
  })

  return itemsByOrderId
}

async function fetchSupabaseOrderMessagesByOrderIds(
  supabase: SupabaseAdminClient,
  orderIds: string[]
): Promise<Map<string, OrderMessage[]>> {
  const messagesByOrderId = new Map<string, OrderMessage[]>()

  if (orderIds.length === 0) {
    return messagesByOrderId
  }

  const { data: messageData, error: messageError } = await supabase
    .from(orderMessagesTable)
    .select('*')
    .in('order_id', orderIds)
    .order('line_number', { ascending: true })

  if (messageError) {
    throw new Error(`Failed to fetch Supabase order messages: ${messageError.message}`)
  }

  const messageRows = Array.isArray(messageData) ? messageData as SupabaseOrderMessageRow[] : []
  const messageIds = messageRows
    .map((row) => row.id)
    .filter((id): id is string => typeof id === 'string' && id.length > 0)
  const attachmentsByMessageId = new Map<string, OrderMessageAttachment[]>()

  if (messageIds.length > 0) {
    const { data: attachmentData, error: attachmentError } = await supabase
      .from(orderMessageAttachmentsTable)
      .select('*')
      .in('message_id', messageIds)
      .order('line_number', { ascending: true })

    if (attachmentError) {
      throw new Error(`Failed to fetch Supabase order message attachments: ${attachmentError.message}`)
    }

    const attachmentRows = Array.isArray(attachmentData) ? attachmentData as SupabaseOrderMessageAttachmentRow[] : []
    attachmentRows.forEach((row) => {
      const currentAttachments = attachmentsByMessageId.get(row.message_id) ?? []
      attachmentsByMessageId.set(row.message_id, [...currentAttachments, mapSupabaseOrderMessageAttachmentRow(row)])
    })
  }

  messageRows.forEach((row) => {
    const currentMessages = messagesByOrderId.get(row.order_id) ?? []
    const attachments = row.id ? attachmentsByMessageId.get(row.id) : undefined
    messagesByOrderId.set(row.order_id, [...currentMessages, mapSupabaseOrderMessageRow(row, attachments)])
  })

  return messagesByOrderId
}

async function fetchSupabaseOrderNotesByOrderIds(
  supabase: SupabaseAdminClient,
  orderIds: string[]
): Promise<Map<string, OrderNote[]>> {
  const notesByOrderId = new Map<string, OrderNote[]>()

  if (orderIds.length === 0) {
    return notesByOrderId
  }

  const { data: noteData, error: noteError } = await supabase
    .from(orderNotesTable)
    .select('*')
    .in('order_id', orderIds)
    .order('line_number', { ascending: true })

  if (noteError) {
    throw new Error(`Failed to fetch Supabase order notes: ${noteError.message}`)
  }

  const noteRows = Array.isArray(noteData) ? noteData as SupabaseOrderNoteRow[] : []
  const noteIds = noteRows
    .map((row) => row.id)
    .filter((id): id is string => typeof id === 'string' && id.length > 0)
  const imagesByNoteId = new Map<string, OrderNoteImage[]>()

  if (noteIds.length > 0) {
    const { data: imageData, error: imageError } = await supabase
      .from(orderNoteImagesTable)
      .select('*')
      .in('note_id', noteIds)
      .order('line_number', { ascending: true })

    if (imageError) {
      throw new Error(`Failed to fetch Supabase order note images: ${imageError.message}`)
    }

    const imageRows = Array.isArray(imageData) ? imageData as SupabaseOrderNoteImageRow[] : []
    imageRows.forEach((row) => {
      const currentImages = imagesByNoteId.get(row.note_id) ?? []
      imagesByNoteId.set(row.note_id, [...currentImages, mapSupabaseOrderNoteImageRow(row)])
    })
  }

  noteRows.forEach((row) => {
    const currentNotes = notesByOrderId.get(row.order_id) ?? []
    const images = row.id ? imagesByNoteId.get(row.id) : undefined
    notesByOrderId.set(row.order_id, [...currentNotes, mapSupabaseOrderNoteRow(row, images)])
  })

  return notesByOrderId
}

async function fetchSupabaseOrderChildrenByOrderIds(
  supabase: SupabaseAdminClient,
  orderIds: string[]
): Promise<SupabaseOrderChildren> {
  const [
    itemsByOrderId,
    messagesByOrderId,
    notesByOrderId
  ] = await Promise.all([
    fetchSupabaseOrderItemsByOrderIds(supabase, orderIds),
    fetchSupabaseOrderMessagesByOrderIds(supabase, orderIds),
    fetchSupabaseOrderNotesByOrderIds(supabase, orderIds)
  ])

  return {
    itemsByOrderId,
    messagesByOrderId,
    notesByOrderId
  }
}

interface PersistSupabaseOrderWithChildrenParams {
  orderId?: string
  orderPayload: JsonObject
  order: Pick<Order, 'items' | 'messages' | 'notes'>
  upsertByOrderNumber?: boolean
}

const childPayloadOrderIdPlaceholder = '00000000-0000-0000-0000-000000000000'

async function persistSupabaseOrderWithChildren(
  supabase: SupabaseAdminClient,
  params: PersistSupabaseOrderWithChildrenParams
): Promise<SupabaseOrderRow> {
  const payloadOrderId = params.orderId ?? childPayloadOrderIdPlaceholder
  const messagePayloads = buildSupabaseOrderMessagePayloads(payloadOrderId, params.order.messages)
  const notePayloads = buildSupabaseOrderNotePayloads(payloadOrderId, params.order.notes)
  const { data, error } = await supabase.rpc('replace_order_with_children', {
    p_order_id: params.orderId ?? null,
    p_order_payload: params.orderPayload,
    p_item_payloads: buildSupabaseOrderItemPayloads(payloadOrderId, params.order.items),
    p_message_payloads: messagePayloads.messages,
    p_message_attachment_payloads: messagePayloads.attachments,
    p_note_payloads: notePayloads.notes,
    p_note_image_payloads: notePayloads.images,
    p_upsert_by_order_number: params.upsertByOrderNumber ?? false
  })

  if (error) {
    throw new Error(`Failed to persist Supabase order with children: ${error.message}`)
  }

  const row: unknown = Array.isArray(data) ? data[0] : data
  if (!isRecord(row) || typeof row.id !== 'string') {
    throw new Error('Failed to persist Supabase order with children: RPC returned no order row')
  }

  return row as unknown as SupabaseOrderRow
}

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

export async function createSupabaseOrder(input: SupabaseOrderInput): Promise<Order> {
  const supabase = getSupabaseAdminClient()
  const row = await persistSupabaseOrderWithChildren(supabase, {
    orderPayload: buildSupabaseOrderPayload(input),
    order: input
  })

  return mapSupabaseOrderRow(row, input.items, input.messages ?? [], input.notes ?? [])
}

export async function upsertSupabaseOrder(input: SupabaseOrderInput): Promise<Order> {
  const supabase = getSupabaseAdminClient()
  const row = await persistSupabaseOrderWithChildren(supabase, {
    orderPayload: buildSupabaseOrderPayload(input),
    order: input,
    upsertByOrderNumber: true
  })

  return mapSupabaseOrderRow(row, input.items, input.messages ?? [], input.notes ?? [])
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

  if (!data) {
    return null
  }

  const row = data as SupabaseOrderRow
  const children = await fetchSupabaseOrderChildrenByOrderIds(supabase, [row.id])

  return signSupabaseOrderImageUrls(mapSupabaseOrderRow(
    row,
    children.itemsByOrderId.get(row.id),
    children.messagesByOrderId.get(row.id),
    children.notesByOrderId.get(row.id)
  ))
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

  if (!data) {
    return null
  }

  const row = data as SupabaseOrderRow
  const children = await fetchSupabaseOrderChildrenByOrderIds(supabase, [row.id])

  return signSupabaseOrderImageUrls(mapSupabaseOrderRow(
    row,
    children.itemsByOrderId.get(row.id),
    children.messagesByOrderId.get(row.id),
    children.notesByOrderId.get(row.id)
  ))
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

  const rows = Array.isArray(data) ? data as SupabaseOrderRow[] : []
  const children = await fetchSupabaseOrderChildrenByOrderIds(supabase, rows.map((row) => row.id))
  const orders = await Promise.all(rows.map((row) =>
    signSupabaseOrderImageUrls(mapSupabaseOrderRow(
      row,
      children.itemsByOrderId.get(row.id),
      children.messagesByOrderId.get(row.id),
      children.notesByOrderId.get(row.id)
    ))
  ))

  return {
    orders,
    totalCount: count ?? 0
  }
}

export async function updateSupabaseOrder(order: Order): Promise<Order> {
  const supabase = getSupabaseAdminClient()
  const row = await persistSupabaseOrderWithChildren(supabase, {
    orderId: order._id,
    orderPayload: buildSupabaseOrderPayloadFromOrder(order),
    order
  })

  return signSupabaseOrderImageUrls(mapSupabaseOrderRow(row, order.items, order.messages ?? [], order.notes ?? []))
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

  const row = data as SupabaseOrderRow
  const children = await fetchSupabaseOrderChildrenByOrderIds(supabase, [row.id])

  return mapSupabaseOrderRow(
    row,
    children.itemsByOrderId.get(row.id),
    children.messagesByOrderId.get(row.id),
    children.notesByOrderId.get(row.id)
  )
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
      .select('created_at,status,total_price,payment_status')
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1)

    if (error) {
      throw new Error(`Failed to fetch Supabase earnings orders: ${error.message}`)
    }

    const rows = Array.isArray(data)
      ? data as Array<Pick<SupabaseOrderRow, 'created_at' | 'status' | 'total_price' | 'payment_status'>>
      : []

    summaries.push(...rows.map((row) => {
      return {
        createdAt: row.created_at,
        status: row.status,
        total: getNumberValue(row.total_price) ?? 0,
        paymentStatus: row.payment_status || 'pending'
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
