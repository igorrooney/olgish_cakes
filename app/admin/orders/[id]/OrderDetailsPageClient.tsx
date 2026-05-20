'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DesignSystemDatePicker } from '@/app/components/forms/DesignSystemDatePicker'
import { ORDER_STATUS_LABELS } from '@/lib/order-constants'
import type { Order, OrderItem, OrderMessageAttachment, OrderNoteImage } from '@/types/order'

interface OrderDetailsPageClientProps {
  orderId: string
}

interface OrderUpdateResponse {
  success?: boolean
  order?: Order
  error?: string
  details?: string
}

interface OrderDeleteResponse {
  success?: boolean
  error?: string
  details?: string
}

interface OrderDetailsFormState {
  status: string
  paymentStatus: string
  paymentMethod: string
  deliveryMethod: string
  deliveryCourier: string
  deliveryRecipientName: string
  deliveryAddress: string
  dateNeeded: string
  trackingNumber: string
  note: string
}

interface CustomerFormState {
  name: string
  email: string
  phone: string
  address: string
  city: string
  postcode: string
}

interface ItemFormState {
  sourceItemIndex: number
  sourceProductType: string
  sourceProductId: string
  productName: string
  quantity: string
  unitPrice: string
  totalPrice: string
  size: string
  flavor: string
  designType: string
  specialInstructions: string
}

interface OrderPatchPayload {
  status?: string
  paymentStatus?: string
  paymentMethod?: string
  deliveryMethod?: string
  deliveryCourier?: string
  deliveryRecipientName?: string
  deliveryAddress?: string
  dateNeeded?: string | null
  trackingNumber?: string
  note?: string
  author?: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  customerAddress?: string
  customerCity?: string
  customerPostcode?: string
  items?: OrderItem[]
  subtotal?: number
  total?: number
}

interface OrderImagePreview {
  asset: OrderMessageAttachment['asset'] | OrderNoteImage['asset']
  alt: string
  source: 'reference' | 'note'
}

interface NoticeState {
  message: string
  tone: 'success' | 'error'
}

interface DeleteOrderInput {
  orderId: string
  password: string
}

interface StoredIpLocation {
  city?: string
  region?: string
  country?: string
}

interface CustomerNoteRow {
  label: string
  value: string
}

const statusOptions = [
  'new',
  'confirmed',
  'in-progress',
  'ready-pickup',
  'out-delivery',
  'delivered',
  'completed',
  'cancelled'
]

const paymentStatusOptions = [
  'pending',
  'partial',
  'paid',
  'refunded',
  'cancelled'
]

const paymentMethodOptions = [
  'cash-collection',
  'card-collection',
  'online'
]

const deliveryMethodOptions = [
  'collection',
  'local-delivery',
  'postal',
  'postal-delivery',
  'market-pickup'
]

const deliveryCourierOptions = [
  { value: 'evri', label: 'Evri' },
  { value: 'royal-mail', label: 'Royal Mail' }
]

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(value)

const formatDate = (value?: string) => {
  if (!value) {
    return 'Not specified'
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(value))
}

const formatDateTime = (value?: string) => {
  if (!value) {
    return 'Not available'
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value))
}

const formatLabel = (value?: string) => {
  if (!value) {
    return 'Not specified'
  }

  return value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const readStringField = (record: Record<string, unknown>, field: string) => {
  const value = record[field]
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined
}

const getOrderDeliveryCourier = (order: Order) => {
  if (!isRecord(order.metadata)) {
    return 'evri'
  }

  const deliveryCourier = readStringField(order.metadata, 'deliveryCourier')
  return deliveryCourier === 'evri' || deliveryCourier === 'royal-mail' ? deliveryCourier : 'evri'
}

const getOrderIpLocation = (order: Order): StoredIpLocation | null => {
  if (!isRecord(order.metadata)) {
    return null
  }

  const ipLocation = order.metadata.ipLocation

  if (!isRecord(ipLocation)) {
    return null
  }

  const location = {
    city: readStringField(ipLocation, 'city'),
    region: readStringField(ipLocation, 'region'),
    country: readStringField(ipLocation, 'country')
  }

  return Object.values(location).some(Boolean) ? location : null
}

const formatIpLocation = (location: StoredIpLocation | null) =>
  location ? [location.city, location.region, location.country].filter(Boolean).join(', ') : 'Not captured'

const isCakesByPostOrder = (order: Order) =>
  order.orderType === 'gift-hamper' ||
  order.delivery?.deliveryMethod === 'postal' ||
  order.items.some((item) => item.productType === 'gift-hamper')

const getInlineOrderContext = (order: Order): Record<string, unknown> | null => {
  if (!isRecord(order.metadata)) {
    return null
  }

  const context = order.metadata.inlineOrderContext
  return isRecord(context) ? context : null
}

const extractMessageLine = (value: string) => {
  const messageLine = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => {
      const normalized = line.toLowerCase()
      return normalized.startsWith('message:') || normalized.startsWith('customer notes:')
    })

  return messageLine?.replace(/^(message|customer notes):\s*/i, '').trim()
}

const getCustomerMessage = (order: Order) => {
  const context = getInlineOrderContext(order)
  const contextMessage = context ? readStringField(context, 'customerMessage') : undefined
  const itemMessage = order.items
    .map((item) => item.specialInstructions?.trim())
    .find((value) => value && value.length > 0)
  const submittedMessage = (order.messages || [])
    .map((message) => extractMessageLine(message.message) || message.message.trim())
    .find((value) => value.length > 0)

  return contextMessage || itemMessage || submittedMessage
}

const getOrderGiftNote = (order: Order) => {
  const metadataGiftNote = isRecord(order.metadata)
    ? readStringField(order.metadata, 'giftNote')
    : undefined

  return order.delivery?.giftNote?.trim() || metadataGiftNote
}

const getMetadataDeliveryRecipientName = (order: Order) => {
  if (!isRecord(order.metadata)) {
    return undefined
  }

  const inlineOrderContext = isRecord(order.metadata.inlineOrderContext)
    ? order.metadata.inlineOrderContext
    : {}

  return readStringField(inlineOrderContext, 'deliveryRecipientName') ||
    readStringField(inlineOrderContext, 'recipientName') ||
    readStringField(order.metadata, 'deliveryRecipientName') ||
    readStringField(order.metadata, 'recipientName')
}

const hasExplicitDeliveryRecipientName = (order: Order) =>
  Boolean(order.delivery?.recipientName?.trim() || getMetadataDeliveryRecipientName(order))

const getEffectiveDeliveryRecipientName = (order: Order) =>
  order.delivery?.recipientName?.trim() || getMetadataDeliveryRecipientName(order) || order.customer.name || ''

const getDeliveryRecipientFormValue = (order: Order) =>
  order.delivery?.recipientName?.trim() || getMetadataDeliveryRecipientName(order) || (isCakesByPostOrder(order) ? order.customer.name : '')

const getOrderDeliveryRecipientName = (order: Order) =>
  getEffectiveDeliveryRecipientName(order) || 'Not specified'

const getCustomerAddressText = (order: Order) =>
  [order.customer.address, order.customer.city, order.customer.postcode]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(', ')

const shouldUseCustomerAddressAsDeliveryFallback = (order: Order) =>
  isCakesByPostOrder(order) || !['collection', 'market-pickup'].includes(order.delivery?.deliveryMethod || '')

const getOrderDeliveryAddress = (order: Order) => {
  const deliveryAddress = order.delivery?.deliveryAddress?.trim()

  if (deliveryAddress) {
    return deliveryAddress
  }

  const customerAddress = getCustomerAddressText(order)
  return shouldUseCustomerAddressAsDeliveryFallback(order) && customerAddress
    ? customerAddress
    : 'Not specified'
}

const getDeliveryAddressFormValue = (order: Order) => {
  const deliveryAddress = getOrderDeliveryAddress(order)
  return deliveryAddress === 'Not specified' ? '' : deliveryAddress
}

const getCustomerNoteRows = (order: Order): CustomerNoteRow[] => {
  const rows: CustomerNoteRow[] = []
  const customerMessage = getCustomerMessage(order)

  if (customerMessage) {
    rows.push({ label: 'Customer notes for Olgish Cakes', value: customerMessage })
  }

  return rows
}

const isGeneratedCakesByPostMessage = (value: string) => {
  const normalized = value.toLowerCase()
  return normalized.includes('product type: gift-hamper') && normalized.includes('price:')
}

const getOrderTotal = (order: Order) => {
  const total = order.pricing?.total
  return typeof total === 'number' && Number.isFinite(total) ? total : 0
}

const getStatusBadgeClass = (status: string) => {
  if (status === 'completed' || status === 'delivered') {
    return 'badge badge-success whitespace-nowrap'
  }

  if (status === 'cancelled') {
    return 'badge badge-error whitespace-nowrap'
  }

  if (status === 'new' || status === 'confirmed' || status === 'ready-pickup') {
    return 'badge badge-warning whitespace-nowrap'
  }

  return 'badge badge-info whitespace-nowrap'
}

const getPaymentBadgeClass = (paymentStatus?: string) => {
  if (paymentStatus === 'paid') {
    return 'badge badge-success whitespace-nowrap'
  }

  if (paymentStatus === 'refunded' || paymentStatus === 'cancelled') {
    return 'badge badge-error whitespace-nowrap'
  }

  if (paymentStatus === 'partial') {
    return 'badge badge-info whitespace-nowrap'
  }

  return 'badge badge-warning whitespace-nowrap'
}

const getImageUrl = (asset: OrderImagePreview['asset']) => asset.url || ''

const getOrderImagePreviews = (order: Order): OrderImagePreview[] => {
  const messageImages = (order.messages || []).flatMap((message) =>
    (message.attachments || [])
      .filter((attachment) => Boolean(attachment?.asset))
      .map((attachment) => ({
        asset: attachment.asset,
        alt: attachment.alt || 'Customer reference image',
        source: 'reference' as const
      }))
  )

  const noteImages = (order.notes || []).flatMap((note) =>
    (note.images || [])
      .filter((image) => Boolean(image?.asset))
      .map((image) => ({
        asset: image.asset,
        alt: image.alt || 'Admin note image',
        source: 'note' as const
      }))
  )

  return [...messageImages, ...noteImages]
}

const getDateInputValue = (value?: string) => {
  const trimmedValue = value?.trim()

  if (!trimmedValue) {
    return ''
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
    return trimmedValue
  }

  const date = new Date(trimmedValue)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).formatToParts(date)

  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  const day = parts.find((part) => part.type === 'day')?.value

  return year && month && day ? `${year}-${month}-${day}` : ''
}

const createFormState = (order: Order): OrderDetailsFormState => ({
  status: order.status,
  paymentStatus: order.pricing?.paymentStatus || 'pending',
  paymentMethod: order.pricing?.paymentMethod || '',
  deliveryMethod: order.delivery?.deliveryMethod || 'collection',
  deliveryCourier: getOrderDeliveryCourier(order),
  deliveryRecipientName: getDeliveryRecipientFormValue(order),
  deliveryAddress: getDeliveryAddressFormValue(order),
  dateNeeded: getDateInputValue(order.delivery?.dateNeeded),
  trackingNumber: order.delivery?.trackingNumber || '',
  note: ''
})

const createCustomerFormState = (order: Order): CustomerFormState => ({
  name: order.customer.name || '',
  email: order.customer.email || '',
  phone: order.customer.phone || '',
  address: order.customer.address || '',
  city: order.customer.city || '',
  postcode: order.customer.postcode || ''
})

const createItemFormState = (item: OrderItem, index: number): ItemFormState => ({
  sourceItemIndex: index,
  sourceProductType: item.productType || 'cake',
  sourceProductId: item.productId || '',
  productName: item.productName || '',
  quantity: String(item.quantity || 1),
  unitPrice: String(item.unitPrice ?? item.totalPrice ?? 0),
  totalPrice: String(item.totalPrice ?? item.unitPrice ?? 0),
  size: item.size || '',
  flavor: item.flavor || '',
  designType: item.designType || '',
  specialInstructions: item.specialInstructions || ''
})

const createItemsFormState = (order: Order): ItemFormState[] =>
  order.items.length > 0
    ? order.items.map(createItemFormState)
    : [{
        sourceItemIndex: -1,
        sourceProductType: 'cake',
        sourceProductId: '',
        productName: '',
        quantity: '1',
        unitPrice: '0',
        totalPrice: '0',
        size: '',
        flavor: '',
        designType: '',
        specialInstructions: ''
      }]

const getPrimaryItemName = (order: Order) => order.items[0]?.productName || 'Custom order'

const getHeaderContext = (order: Order) => [
  order.customer.name,
  getPrimaryItemName(order),
  `Needed ${formatDate(order.delivery?.dateNeeded)}`
].filter(Boolean).join(' - ')

const getNextActionMessage = (order: Order) => {
  const statusAction = {
    new: 'Review and confirm this order.',
    confirmed: 'Start production when ready.',
    'in-progress': 'Continue production and update when ready.',
    'ready-pickup': 'Arrange customer collection.',
    'out-delivery': 'Track delivery until complete.'
  }[order.status]

  const paymentStatus = order.pricing?.paymentStatus

  if (paymentStatus === 'pending') {
    return statusAction ? `${statusAction} Payment is pending.` : 'Payment is pending.'
  }

  if (paymentStatus === 'partial') {
    return statusAction ? `${statusAction} Payment is partial.` : 'Payment is partial.'
  }

  return statusAction || null
}

const normalizeInstructionText = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase()

const isInstructionDuplicatedInMessages = (order: Order, instruction: string) => {
  const normalizedInstruction = normalizeInstructionText(instruction)

  return (order.messages || []).some((message) =>
    normalizeInstructionText(message.message) === normalizedInstruction
  )
}

const getPaymentMethodOptions = (paymentMethod: string) => {
  if (!paymentMethod || paymentMethodOptions.includes(paymentMethod)) {
    return paymentMethodOptions
  }

  return [paymentMethod, ...paymentMethodOptions]
}

const hasFormChanges = (current: OrderDetailsFormState | null, saved: OrderDetailsFormState | null) => {
  if (!current || !saved) {
    return false
  }

  return current.status !== saved.status ||
    current.paymentStatus !== saved.paymentStatus ||
    current.paymentMethod !== saved.paymentMethod ||
    current.deliveryMethod !== saved.deliveryMethod ||
    current.deliveryCourier !== saved.deliveryCourier ||
    current.deliveryRecipientName !== saved.deliveryRecipientName ||
    current.deliveryAddress !== saved.deliveryAddress ||
    current.dateNeeded !== saved.dateNeeded ||
    current.trackingNumber !== saved.trackingNumber ||
    current.note.trim().length > 0
}

const parsePositiveNumber = (value: string, fallback: number) => {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
}

const parseQuantity = (value: string) => {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
}

const getErrorMessage = (value: unknown, fallback: string) => {
  if (!value || typeof value !== 'object') {
    return fallback
  }

  const record = value as Record<string, unknown>
  return typeof record.error === 'string' ? record.error : fallback
}

async function fetchOrder(orderId: string, signal: AbortSignal): Promise<Order> {
  const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
    credentials: 'include',
    signal
  })

  const data = await response.json().catch((): unknown => ({}))

  if (!response.ok) {
    throw new Error(getErrorMessage(data, 'Order could not be loaded'))
  }

  return data as Order
}

async function patchOrder(orderId: string, payload: OrderPatchPayload): Promise<Order> {
  const controller = new AbortController()

  const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    signal: controller.signal,
    body: JSON.stringify(payload)
  })

  const data = await response.json().catch((): OrderUpdateResponse => ({}))

  if (!response.ok || !data.order) {
    throw new Error(data.error || data.details || 'Order could not be updated')
  }

  return data.order
}

async function deleteOrder({ orderId, password }: DeleteOrderInput): Promise<void> {
  const controller = new AbortController()

  const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    signal: controller.signal,
    body: JSON.stringify({
      password,
      permanent: true
    })
  })

  const data = await response.json().catch((): OrderDeleteResponse => ({}))

  if (!response.ok || !data.success) {
    throw new Error(data.error || data.details || 'Order could not be deleted')
  }
}

function buildOrderPatchPayload(
  formState: OrderDetailsFormState,
  savedFormState: OrderDetailsFormState
): OrderPatchPayload {
  const note = formState.note.trim()
  const payload: OrderPatchPayload = {}

  if (formState.status !== savedFormState.status) {
    payload.status = formState.status
  }

  if (formState.paymentStatus !== savedFormState.paymentStatus) {
    payload.paymentStatus = formState.paymentStatus
  }

  if (formState.paymentMethod !== savedFormState.paymentMethod) {
    payload.paymentMethod = formState.paymentMethod
  }

  if (formState.deliveryMethod !== savedFormState.deliveryMethod) {
    payload.deliveryMethod = formState.deliveryMethod
  }

  if (formState.deliveryCourier !== savedFormState.deliveryCourier) {
    payload.deliveryCourier = formState.deliveryCourier
  }

  if (formState.deliveryRecipientName !== savedFormState.deliveryRecipientName) {
    payload.deliveryRecipientName = formState.deliveryRecipientName.trim()
  }

  if (formState.deliveryAddress !== savedFormState.deliveryAddress) {
    payload.deliveryAddress = formState.deliveryAddress.trim()
  }

  if (formState.dateNeeded !== savedFormState.dateNeeded) {
    payload.dateNeeded = formState.dateNeeded.trim() ? formState.dateNeeded : null
  }

  if (formState.trackingNumber !== savedFormState.trackingNumber) {
    payload.trackingNumber = formState.trackingNumber
  }

  if (note) {
    payload.note = note
    payload.author = 'Admin'
  }

  return payload
}

async function updateOrder(
  orderId: string,
  formState: OrderDetailsFormState,
  savedFormState: OrderDetailsFormState
): Promise<Order> {
  return patchOrder(orderId, buildOrderPatchPayload(formState, savedFormState))
}

interface UpdateOrderMutationInput {
  formState: OrderDetailsFormState
  savedFormState: OrderDetailsFormState
}

export function OrderDetailsPageClient({ orderId }: OrderDetailsPageClientProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [formState, setFormState] = useState<OrderDetailsFormState | null>(null)
  const [customerForm, setCustomerForm] = useState<CustomerFormState | null>(null)
  const [itemsForm, setItemsForm] = useState<ItemFormState[]>([])
  const [editingCustomer, setEditingCustomer] = useState(false)
  const [editingItems, setEditingItems] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [notice, setNotice] = useState<NoticeState | null>(null)
  const lastSyncedOrderIdRef = useRef<string | null>(null)
  const lastSyncedFormStateRef = useRef<OrderDetailsFormState | null>(null)
  const formStateRef = useRef<OrderDetailsFormState | null>(null)
  const customerFormRef = useRef<CustomerFormState | null>(null)
  const itemsFormRef = useRef<ItemFormState[]>([])
  const editingCustomerRef = useRef(false)
  const editingItemsRef = useRef(false)

  const orderQuery = useQuery({
    queryKey: ['admin-order', orderId],
    queryFn: ({ signal }) => fetchOrder(orderId, signal),
    staleTime: 30 * 1000
  })

  const order = orderQuery.data ?? null

  const savedFormState = useMemo(() => order ? createFormState(order) : null, [order])

  useEffect(() => {
    formStateRef.current = formState
  }, [formState])

  useEffect(() => {
    customerFormRef.current = customerForm
  }, [customerForm])

  useEffect(() => {
    itemsFormRef.current = itemsForm
  }, [itemsForm])

  useEffect(() => {
    editingCustomerRef.current = editingCustomer
  }, [editingCustomer])

  useEffect(() => {
    editingItemsRef.current = editingItems
  }, [editingItems])

  useEffect(() => {
    if (order) {
      const isDifferentOrder = lastSyncedOrderIdRef.current !== order._id
      const nextFormState = createFormState(order)
      const nextCustomerForm = createCustomerFormState(order)
      const nextItemsForm = createItemsFormState(order)
      const currentFormState = formStateRef.current
      const currentCustomerForm = customerFormRef.current
      const currentItemsForm = itemsFormRef.current
      const formIsDirty = Boolean(
        currentFormState &&
        lastSyncedFormStateRef.current &&
        hasFormChanges(currentFormState, lastSyncedFormStateRef.current)
      )

      if (isDifferentOrder || !currentFormState || !formIsDirty) {
        lastSyncedFormStateRef.current = nextFormState
        formStateRef.current = nextFormState
        setFormState(nextFormState)
      }

      if (isDifferentOrder || !currentCustomerForm || !editingCustomerRef.current) {
        customerFormRef.current = nextCustomerForm
        setCustomerForm(nextCustomerForm)
      }

      if (isDifferentOrder || currentItemsForm.length === 0 || !editingItemsRef.current) {
        itemsFormRef.current = nextItemsForm
        setItemsForm(nextItemsForm)
      }

      lastSyncedOrderIdRef.current = order._id
    }
  }, [order])

  const orderImages = useMemo(() => order ? getOrderImagePreviews(order) : [], [order])
  const paymentMethods = useMemo(() => getPaymentMethodOptions(formState?.paymentMethod || ''), [formState?.paymentMethod])
  const formHasChanges = hasFormChanges(formState, savedFormState)

  const updateMutation = useMutation({
    mutationFn: (input: UpdateOrderMutationInput) =>
      updateOrder(orderId, input.formState, input.savedFormState),
    onSuccess: (updatedOrder) => {
      const nextFormState = createFormState(updatedOrder)

      queryClient.setQueryData(['admin-order', orderId], updatedOrder)
      lastSyncedOrderIdRef.current = updatedOrder._id
      lastSyncedFormStateRef.current = nextFormState
      formStateRef.current = nextFormState
      setFormState(nextFormState)
      setNotice({ message: 'Order updated.', tone: 'success' })
    },
    onError: (error) => {
      setNotice({
        message: error instanceof Error ? error.message : 'Order could not be updated.',
        tone: 'error'
      })
    }
  })

  const customerMutation = useMutation({
    mutationFn: (nextCustomerForm: CustomerFormState) => patchOrder(orderId, {
      customerName: nextCustomerForm.name.trim(),
      customerEmail: nextCustomerForm.email.trim(),
      customerPhone: nextCustomerForm.phone.trim(),
      customerAddress: nextCustomerForm.address.trim(),
      customerCity: nextCustomerForm.city.trim(),
      customerPostcode: nextCustomerForm.postcode.trim()
    }),
    onSuccess: (updatedOrder) => {
      const nextCustomerForm = createCustomerFormState(updatedOrder)

      queryClient.setQueryData(['admin-order', orderId], updatedOrder)
      lastSyncedOrderIdRef.current = updatedOrder._id
      customerFormRef.current = nextCustomerForm
      setCustomerForm(nextCustomerForm)
      setEditingCustomer(false)
      setNotice({ message: 'Customer updated.', tone: 'success' })
    },
    onError: (error) => {
      setNotice({
        message: error instanceof Error ? error.message : 'Customer could not be updated.',
        tone: 'error'
      })
    }
  })

  const itemsMutation = useMutation({
    mutationFn: (nextItemsForm: ItemFormState[]) => {
      const items = nextItemsForm
        .filter((item) => item.productName.trim().length > 0)
        .map((item) => {
          const currentItem = item.sourceItemIndex >= 0 ? order?.items[item.sourceItemIndex] : undefined
          const quantity = parseQuantity(item.quantity)
          const unitPrice = parsePositiveNumber(item.unitPrice, currentItem?.unitPrice ?? 0)
          const totalPrice = parsePositiveNumber(item.totalPrice, unitPrice * quantity)

          return {
            productType: item.sourceProductType || currentItem?.productType || 'cake',
            productId: item.sourceProductId || currentItem?.productId || '',
            productName: item.productName.trim(),
            quantity,
            unitPrice,
            totalPrice,
            size: item.size.trim() || undefined,
            flavor: item.flavor.trim() || undefined,
            designType: item.designType.trim() || undefined,
            specialInstructions: item.specialInstructions.trim() || undefined
          }
        })

      const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
      const deliveryFee = order?.pricing?.deliveryFee ?? 0
      const discount = order?.pricing?.discount ?? 0

      return patchOrder(orderId, {
        items,
        subtotal,
        total: subtotal + deliveryFee - discount
      })
    },
    onSuccess: (updatedOrder) => {
      const nextItemsForm = createItemsFormState(updatedOrder)

      queryClient.setQueryData(['admin-order', orderId], updatedOrder)
      lastSyncedOrderIdRef.current = updatedOrder._id
      itemsFormRef.current = nextItemsForm
      setItemsForm(nextItemsForm)
      setEditingItems(false)
      setNotice({ message: 'Items updated.', tone: 'success' })
    },
    onError: (error) => {
      setNotice({
        message: error instanceof Error ? error.message : 'Items could not be updated.',
        tone: 'error'
      })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      router.push('/admin/orders')
    },
    onError: (error) => {
      setNotice({
        message: error instanceof Error ? error.message : 'Order could not be deleted.',
        tone: 'error'
      })
    }
  })

  const updateField = (field: keyof OrderDetailsFormState, value: string) => {
    setFormState((current) => current ? { ...current, [field]: value } : current)
  }

  const updateCustomerField = (field: keyof CustomerFormState, value: string) => {
    setCustomerForm((current) => current ? { ...current, [field]: value } : current)
  }

  const updateItemField = (index: number, field: keyof ItemFormState, value: string) => {
    setItemsForm((current) => current.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [field]: value } : item
    ))
  }

  const addItem = () => {
    setItemsForm((current) => [
      ...current,
      {
        sourceItemIndex: -1,
        sourceProductType: 'cake',
        sourceProductId: '',
        productName: '',
        quantity: '1',
        unitPrice: '0',
        totalPrice: '0',
        size: '',
        flavor: '',
        designType: '',
        specialInstructions: ''
      }
    ])
  }

  const removeItem = (index: number) => {
    setItemsForm((current) => current.filter((_, itemIndex) => itemIndex !== index))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (formState && lastSyncedFormStateRef.current) {
      setNotice(null)
      updateMutation.mutate({
        formState,
        savedFormState: lastSyncedFormStateRef.current
      })
    }
  }

  const handleCustomerSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (customerForm) {
      setNotice(null)
      customerMutation.mutate(customerForm)
    }
  }

  const handleItemsSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setNotice(null)
    itemsMutation.mutate(itemsForm)
  }

  const handleDeleteSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const password = deletePassword.trim()
    if (!password) {
      setNotice({
        message: 'Admin password is required to delete this order.',
        tone: 'error'
      })
      return
    }

    setNotice(null)
    deleteMutation.mutate({ orderId, password })
  }

  if (orderQuery.isLoading) {
    return (
      <div className='grid gap-4' aria-label='Loading order details'>
        <div className='skeleton h-32 rounded-box' />
        <div className='grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]'>
          <div className='skeleton h-96 rounded-box' />
          <div className='skeleton h-96 rounded-box' />
        </div>
      </div>
    )
  }

  if (orderQuery.isError || !order || !formState) {
    return (
      <div className='grid gap-4'>
        <Link href='/admin/orders' className='btn btn-ghost btn-sm w-fit'>
          Back to orders
        </Link>
        <div className='alert alert-error' role='alert'>
          <span>{orderQuery.error instanceof Error ? orderQuery.error.message : 'Order could not be loaded.'}</span>
        </div>
      </div>
    )
  }

  const firstItem = order.items[0]
  const nextActionMessage = getNextActionMessage(order)
  const ipLocation = getOrderIpLocation(order)
  const cakesByPostOrder = isCakesByPostOrder(order)
  const customerNoteRows = getCustomerNoteRows(order)
  const explicitDeliveryRecipientName = hasExplicitDeliveryRecipientName(order)
  const deliveryRecipientFallbackUsed = cakesByPostOrder && !explicitDeliveryRecipientName && getEffectiveDeliveryRecipientName(order).length > 0
  const deliveryAddress = getOrderDeliveryAddress(order)
  const showBuyerAddress = !cakesByPostOrder
  const buyerPhone = (order.customer.phone || '').trim()

  return (
    <div className='flex flex-col gap-6'>
      <header className='rounded-box border border-base-300 bg-base-100 p-5 shadow-sm'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
          <div className='min-w-0'>
            <Link href='/admin/orders' className='btn btn-ghost btn-sm mb-3 w-fit'>
              Back to orders
            </Link>
            <p className='text-sm font-medium uppercase tracking-wide text-base-content/60'>Order details</p>
            <div className='mt-2 flex flex-wrap items-center gap-3'>
              <h1 className='text-3xl font-semibold text-base-content'>#{order.orderNumber}</h1>
              <span className={getStatusBadgeClass(order.status)}>
                {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] || formatLabel(order.status)}
              </span>
              <span className={getPaymentBadgeClass(order.pricing?.paymentStatus)}>
                {formatLabel(order.pricing?.paymentStatus || 'pending')}
              </span>
            </div>
            <p className='mt-2 text-sm font-medium text-base-content/75'>{getHeaderContext(order)}</p>
            <p className='mt-2 text-sm text-base-content/65'>
              Created {formatDateTime(order._createdAt)} - Updated {formatDateTime(order._updatedAt)}
            </p>
          </div>
          <a href='#manage-order' className='btn btn-primary btn-sm'>
            Manage order
          </a>
        </div>
      </header>

      {nextActionMessage ? (
        <div className='alert alert-warning items-start' role='status'>
          <div>
            <p className='font-semibold'>Next action</p>
            <p className='text-sm'>{nextActionMessage}</p>
          </div>
        </div>
      ) : null}

      {notice ? (
        <div className={`alert ${notice.tone === 'error' ? 'alert-error' : 'alert-success'}`} role='status'>
          <span>{notice.message}</span>
        </div>
      ) : null}

      <section className='grid gap-3 md:grid-cols-2 xl:grid-cols-4' aria-label='Order summary'>
        <article className='rounded-box border border-base-300 bg-base-100 p-4 shadow-sm'>
          <p className='text-xs font-medium uppercase tracking-wide text-base-content/60'>Buyer</p>
          <p className='mt-2 font-semibold text-base-content'>{order.customer.name}</p>
          <p className='mt-1 text-sm text-base-content/65'>{buyerPhone || 'No phone provided'}</p>
        </article>
        <article className='rounded-box border border-base-300 bg-base-100 p-4 shadow-sm'>
          <p className='text-xs font-medium uppercase tracking-wide text-base-content/60'>Needed</p>
          <p className='mt-2 font-semibold text-base-content'>{formatDate(order.delivery?.dateNeeded)}</p>
          <p className='mt-1 text-sm text-base-content/65'>{formatLabel(order.delivery?.deliveryMethod)}</p>
        </article>
        <article className='rounded-box border border-base-300 bg-base-100 p-4 shadow-sm'>
          <p className='text-xs font-medium uppercase tracking-wide text-base-content/60'>Total</p>
          <p className='mt-2 font-semibold text-base-content'>{formatCurrency(getOrderTotal(order))}</p>
          <p className='mt-1 text-sm text-base-content/65'>{formatLabel(order.pricing?.paymentMethod)}</p>
        </article>
        <article className='rounded-box border border-base-300 bg-base-100 p-4 shadow-sm'>
          <p className='text-xs font-medium uppercase tracking-wide text-base-content/60'>Primary item</p>
          <p className='mt-2 line-clamp-2 font-semibold text-base-content'>{firstItem?.productName || 'Custom order'}</p>
          <p className='mt-1 text-sm text-base-content/65'>{firstItem ? `Qty ${firstItem.quantity}` : 'No line items'}</p>
        </article>
      </section>

      <div className='grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.85fr)]'>
        <aside id='manage-order' className='rounded-box border border-base-300 bg-base-100 p-5 shadow-sm xl:sticky xl:top-24 xl:order-2 xl:self-start'>
          <h2 className='text-lg font-semibold text-base-content'>Manage order</h2>
          <form className='mt-4 grid gap-4' onSubmit={handleSubmit}>
            <fieldset className='grid gap-4 rounded-box border border-base-300 p-4'>
              <legend className='px-1 text-sm font-semibold text-base-content'>Order workflow</legend>
            <label className='form-control w-full'>
              <span className='label-text mb-2'>Status</span>
              <select
                className='select select-bordered w-full'
                value={formState.status}
                onChange={(event) => updateField('status', event.target.value)}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {ORDER_STATUS_LABELS[status as keyof typeof ORDER_STATUS_LABELS] || formatLabel(status)}
                  </option>
                ))}
              </select>
            </label>

            <label className='form-control w-full'>
              <span className='label-text mb-2'>Payment status</span>
              <select
                className='select select-bordered w-full'
                value={formState.paymentStatus}
                onChange={(event) => updateField('paymentStatus', event.target.value)}
              >
                {paymentStatusOptions.map((status) => (
                  <option key={status} value={status}>{formatLabel(status)}</option>
                ))}
              </select>
            </label>

            <label className='form-control w-full'>
              <span className='label-text mb-2'>Payment method</span>
              <select
                className='select select-bordered w-full'
                value={formState.paymentMethod}
                onChange={(event) => updateField('paymentMethod', event.target.value)}
              >
                <option value=''>Not specified</option>
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>{formatLabel(method)}</option>
                ))}
              </select>
            </label>
            </fieldset>

            <fieldset className='grid gap-4 rounded-box border border-base-300 p-4'>
              <legend className='px-1 text-sm font-semibold text-base-content'>Delivery fulfilment</legend>
            <label className='form-control w-full'>
              <span className='label-text mb-2'>Delivery method</span>
              <select
                className='select select-bordered w-full'
                value={formState.deliveryMethod}
                onChange={(event) => updateField('deliveryMethod', event.target.value)}
              >
                {deliveryMethodOptions.map((method) => (
                  <option key={method} value={method}>{formatLabel(method)}</option>
                ))}
              </select>
            </label>

            <label className='form-control w-full'>
              <span className='label-text mb-2'>Recipient name</span>
              <input
                className='input input-bordered w-full'
                maxLength={100}
                value={formState.deliveryRecipientName}
                onChange={(event) => updateField('deliveryRecipientName', event.target.value)}
                placeholder='Recipient full name'
                aria-label='Recipient name'
              />
              {deliveryRecipientFallbackUsed ? (
                <span className='label-text-alt mt-2 text-base-content/60'>Using buyer name because no separate recipient was stored.</span>
              ) : null}
            </label>

            <label className='form-control w-full'>
              <span className='label-text mb-2'>Delivery address</span>
              <input
                className='input input-bordered w-full'
                maxLength={500}
                value={formState.deliveryAddress}
                onChange={(event) => updateField('deliveryAddress', event.target.value)}
                placeholder='Full delivery address'
                aria-label='Delivery address'
              />
            </label>

            <label className='form-control w-full'>
              <span className='label-text mb-2'>Courier</span>
              <select
                className='select select-bordered w-full'
                value={formState.deliveryCourier}
                onChange={(event) => updateField('deliveryCourier', event.target.value)}
              >
                {deliveryCourierOptions.map((courier) => (
                  <option key={courier.value} value={courier.value}>{courier.label}</option>
                ))}
              </select>
            </label>

            <DesignSystemDatePicker
              id='dateNeeded'
              label='Date needed'
              labelPlacement='outside'
              placeholder='Select a date'
              value={formState.dateNeeded}
              onValueChange={(value) => updateField('dateNeeded', value)}
            />

            <label className='form-control w-full'>
              <span className='label-text mb-2'>Tracking number</span>
              <input
                className='input input-bordered w-full'
                value={formState.trackingNumber}
                onChange={(event) => updateField('trackingNumber', event.target.value)}
                placeholder='Optional'
              />
            </label>
            </fieldset>

            <label className='form-control w-full'>
              <span className='label-text mb-2'>Add internal note</span>
              <textarea
                className='textarea textarea-bordered min-h-28 w-full rounded-box px-4 py-3 leading-relaxed'
                value={formState.note}
                onChange={(event) => updateField('note', event.target.value)}
                placeholder='Add a note for the order record'
              />
            </label>

            {formHasChanges ? (
              <p className='text-sm text-base-content/65'>Unsaved changes</p>
            ) : null}

            <button type='submit' className='btn btn-primary' disabled={!formHasChanges || updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save changes'}
            </button>
          </form>

          <section className='mt-6 border-t border-base-300 pt-5' aria-labelledby='delete-order-heading'>
            <h3 id='delete-order-heading' className='text-base font-semibold text-error'>Delete order</h3>
            <p className='mt-2 text-sm text-base-content/65'>
              Permanently remove this order from Supabase.
            </p>
            {deleteConfirmOpen ? (
              <form className='mt-4 grid gap-3' onSubmit={handleDeleteSubmit}>
                <label className='form-control w-full'>
                  <span className='label-text mb-2'>Admin password</span>
                  <input
                    type='password'
                    className='input input-bordered w-full'
                    value={deletePassword}
                    onChange={(event) => setDeletePassword(event.target.value)}
                    autoComplete='current-password'
                    autoFocus
                  />
                </label>
                <div className='flex flex-wrap gap-2'>
                  <button
                    type='submit'
                    className='btn btn-error btn-sm'
                    disabled={deletePassword.trim().length === 0 || deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? 'Deleting...' : 'Delete permanently'}
                  </button>
                  <button
                    type='button'
                    className='btn btn-ghost btn-sm'
                    disabled={deleteMutation.isPending}
                    onClick={() => {
                      setDeletePassword('')
                      setDeleteConfirmOpen(false)
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                type='button'
                className='btn btn-outline btn-error btn-sm mt-4'
                onClick={() => setDeleteConfirmOpen(true)}
              >
                Delete order
              </button>
            )}
          </section>
        </aside>

        <div className='flex flex-col gap-4 xl:order-1'>
          <section className='rounded-box border border-base-300 bg-base-100 p-5 shadow-sm' aria-labelledby='delivery-details-heading'>
            <h2 id='delivery-details-heading' className='text-lg font-semibold text-base-content'>Delivery details</h2>
            <dl className='mt-4 grid gap-3 text-sm sm:grid-cols-2'>
              <div>
                <dt className='text-base-content/60'>Recipient</dt>
                <dd className='mt-1 flex flex-wrap items-center gap-2 text-base-content'>
                  <span>{getOrderDeliveryRecipientName(order)}</span>
                  {deliveryRecipientFallbackUsed ? (
                    <span className='badge badge-outline badge-sm'>Same as buyer</span>
                  ) : null}
                </dd>
              </div>
              <div>
                <dt className='text-base-content/60'>Date needed</dt>
                <dd className='mt-1 text-base-content'>{formatDate(order.delivery?.dateNeeded)}</dd>
              </div>
              <div className='sm:col-span-2'>
                <dt className='text-base-content/60'>Delivery address</dt>
                <dd className='mt-1 text-base-content'>{deliveryAddress}</dd>
              </div>
              <div>
                <dt className='text-base-content/60'>Delivery method</dt>
                <dd className='mt-1 text-base-content'>{formatLabel(order.delivery?.deliveryMethod)}</dd>
              </div>
              <div>
                <dt className='text-base-content/60'>Courier</dt>
                <dd className='mt-1 text-base-content'>{deliveryCourierOptions.find((courier) => courier.value === getOrderDeliveryCourier(order))?.label || 'Evri'}</dd>
              </div>
              <div>
                <dt className='text-base-content/60'>Tracking</dt>
                <dd className='mt-1 text-base-content'>{order.delivery?.trackingNumber || 'Not specified'}</dd>
              </div>
              <div>
                <dt className='text-base-content/60'>Gift note to include in parcel</dt>
                <dd className='mt-1 whitespace-pre-wrap text-base-content'>{getOrderGiftNote(order) || 'Not specified'}</dd>
              </div>
            </dl>
          </section>

          <section className='rounded-box border border-base-300 bg-base-100 p-5 shadow-sm' aria-labelledby='customer-heading'>
            <div className='flex items-start justify-between gap-3'>
              <div>
                <h2 id='customer-heading' className='text-lg font-semibold text-base-content'>Ordered by</h2>
                {cakesByPostOrder ? (
                  <p className='mt-1 text-sm text-base-content/65'>Buyer contact details only. Delivery details are shown separately.</p>
                ) : null}
              </div>
              <button
                type='button'
                className='btn btn-outline btn-sm'
                onClick={() => {
                  setEditingCustomer((current) => !current)
                  setCustomerForm(createCustomerFormState(order))
                }}
              >
                {editingCustomer ? 'Cancel' : 'Edit buyer'}
              </button>
            </div>
            {editingCustomer && customerForm ? (
              <form className='mt-4 grid gap-4' onSubmit={handleCustomerSubmit}>
                <div className='grid gap-4 sm:grid-cols-2'>
                  <label className='form-control w-full'>
                    <span className='label-text mb-2'>Name</span>
                    <input
                      required
                      className='input input-bordered w-full'
                      value={customerForm.name}
                      onChange={(event) => updateCustomerField('name', event.target.value)}
                    />
                  </label>
                  <label className='form-control w-full'>
                    <span className='label-text mb-2'>Phone <span className='text-base-content/60'>(optional)</span></span>
                    <input
                      className='input input-bordered w-full'
                      value={customerForm.phone}
                      onChange={(event) => updateCustomerField('phone', event.target.value)}
                    />
                  </label>
                  <label className='form-control w-full'>
                    <span className='label-text mb-2'>Email</span>
                    <input
                      required
                      type='email'
                      className='input input-bordered w-full'
                      value={customerForm.email}
                      onChange={(event) => updateCustomerField('email', event.target.value)}
                    />
                  </label>
                  {showBuyerAddress ? (
                    <>
                      <label className='form-control w-full'>
                        <span className='label-text mb-2'>Postcode</span>
                        <input
                          className='input input-bordered w-full'
                          value={customerForm.postcode}
                          onChange={(event) => updateCustomerField('postcode', event.target.value)}
                        />
                      </label>
                      <label className='form-control w-full sm:col-span-2'>
                        <span className='label-text mb-2'>Address</span>
                        <input
                          className='input input-bordered w-full'
                          value={customerForm.address}
                          onChange={(event) => updateCustomerField('address', event.target.value)}
                        />
                      </label>
                      <label className='form-control w-full'>
                        <span className='label-text mb-2'>City</span>
                        <input
                          className='input input-bordered w-full'
                          value={customerForm.city}
                          onChange={(event) => updateCustomerField('city', event.target.value)}
                        />
                      </label>
                    </>
                  ) : null}
                </div>
                <div className='flex flex-wrap gap-2'>
                  <button type='submit' className='btn btn-primary btn-sm' disabled={customerMutation.isPending}>
                    {customerMutation.isPending ? 'Saving...' : 'Save buyer'}
                  </button>
                  <button
                    type='button'
                    className='btn btn-ghost btn-sm'
                    onClick={() => {
                      setCustomerForm(createCustomerFormState(order))
                      setEditingCustomer(false)
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <dl className='mt-4 grid gap-3 text-sm sm:grid-cols-2'>
                <div>
                  <dt className='text-base-content/60'>Name</dt>
                  <dd className='mt-1 text-base-content'>{order.customer.name}</dd>
                </div>
                <div>
                  <dt className='text-base-content/60'>Email</dt>
                  <dd className='mt-1'>
                    <a className='link link-primary break-all' href={`mailto:${order.customer.email}`}>{order.customer.email}</a>
                  </dd>
                </div>
                <div>
                  <dt className='text-base-content/60'>Phone</dt>
                  <dd className='mt-1 text-base-content'>
                    {buyerPhone ? (
                      <a className='link link-primary' href={`tel:${buyerPhone}`}>{buyerPhone}</a>
                    ) : (
                      'Not specified'
                    )}
                  </dd>
                </div>
                {showBuyerAddress ? (
                  <>
                    <div>
                      <dt className='text-base-content/60'>Address</dt>
                      <dd className='mt-1 text-base-content'>{order.customer.address || 'Not specified'}</dd>
                    </div>
                    <div>
                      <dt className='text-base-content/60'>City / postcode</dt>
                      <dd className='mt-1 text-base-content'>
                        {[order.customer.city, order.customer.postcode].filter(Boolean).join(', ') || 'Not specified'}
                      </dd>
                    </div>
                  </>
                ) : null}
                <div>
                  <dt className='text-base-content/60'>Approx. submitted from</dt>
                  <dd className='mt-1 text-base-content'>{formatIpLocation(ipLocation)}</dd>
                </div>
              </dl>
            )}
          </section>

          <section className='rounded-box border border-base-300 bg-base-100 p-5 shadow-sm' aria-labelledby='items-heading'>
            <div className='flex items-start justify-between gap-3'>
              <h2 id='items-heading' className='text-lg font-semibold text-base-content'>Items</h2>
              <button
                type='button'
                className='btn btn-outline btn-sm'
                onClick={() => {
                  setEditingItems((current) => !current)
                  setItemsForm(createItemsFormState(order))
                }}
              >
                {editingItems ? 'Cancel' : 'Edit items'}
              </button>
            </div>
            {editingItems ? (
              <form className='mt-4 grid gap-4' onSubmit={handleItemsSubmit}>
                {itemsForm.map((item, index) => (
                  <fieldset key={`item-form-${index}`} className='rounded-box border border-base-300 p-4'>
                    <div className='mb-3 flex items-center justify-between gap-3'>
                      <legend className='font-semibold text-base-content'>Item {index + 1}</legend>
                      {itemsForm.length > 1 ? (
                        <button type='button' className='btn btn-ghost btn-xs' onClick={() => removeItem(index)}>
                          Remove
                        </button>
                      ) : null}
                    </div>
                    <div className='grid gap-4 sm:grid-cols-2'>
                      <label className='form-control w-full sm:col-span-2'>
                        <span className='label-text mb-2'>Item name</span>
                        <input
                          required
                          className='input input-bordered w-full'
                          value={item.productName}
                          onChange={(event) => updateItemField(index, 'productName', event.target.value)}
                        />
                      </label>
                      <label className='form-control w-full'>
                        <span className='label-text mb-2'>Quantity</span>
                        <input
                          required
                          min='1'
                          type='number'
                          className='input input-bordered w-full'
                          value={item.quantity}
                          onChange={(event) => updateItemField(index, 'quantity', event.target.value)}
                        />
                      </label>
                      <label className='form-control w-full'>
                        <span className='label-text mb-2'>Unit price</span>
                        <input
                          required
                          min='0'
                          step='0.01'
                          type='number'
                          className='input input-bordered w-full'
                          value={item.unitPrice}
                          onChange={(event) => updateItemField(index, 'unitPrice', event.target.value)}
                        />
                      </label>
                      <label className='form-control w-full'>
                        <span className='label-text mb-2'>Total price</span>
                        <input
                          required
                          min='0'
                          step='0.01'
                          type='number'
                          className='input input-bordered w-full'
                          value={item.totalPrice}
                          onChange={(event) => updateItemField(index, 'totalPrice', event.target.value)}
                        />
                      </label>
                      <label className='form-control w-full'>
                        <span className='label-text mb-2'>Size</span>
                        <input
                          className='input input-bordered w-full'
                          value={item.size}
                          onChange={(event) => updateItemField(index, 'size', event.target.value)}
                        />
                      </label>
                      <label className='form-control w-full'>
                        <span className='label-text mb-2'>Flavour</span>
                        <input
                          className='input input-bordered w-full'
                          value={item.flavor}
                          onChange={(event) => updateItemField(index, 'flavor', event.target.value)}
                        />
                      </label>
                      <label className='form-control w-full'>
                        <span className='label-text mb-2'>Design</span>
                        <input
                          className='input input-bordered w-full'
                          value={item.designType}
                          onChange={(event) => updateItemField(index, 'designType', event.target.value)}
                        />
                      </label>
                      <label className='form-control w-full sm:col-span-2'>
                        <span className='label-text mb-2'>Special instructions</span>
                        <textarea
                          className='textarea textarea-bordered min-h-24 w-full'
                          value={item.specialInstructions}
                          onChange={(event) => updateItemField(index, 'specialInstructions', event.target.value)}
                        />
                      </label>
                    </div>
                  </fieldset>
                ))}
                <div className='flex flex-wrap gap-2'>
                  <button type='button' className='btn btn-outline btn-sm' onClick={addItem}>
                    Add item
                  </button>
                  <button type='submit' className='btn btn-primary btn-sm' disabled={itemsMutation.isPending}>
                    {itemsMutation.isPending ? 'Saving...' : 'Save items'}
                  </button>
                  <button
                    type='button'
                    className='btn btn-ghost btn-sm'
                    onClick={() => {
                      setItemsForm(createItemsFormState(order))
                      setEditingItems(false)
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className='mt-4 divide-y divide-base-300 rounded-box border border-base-300'>
                {order.items.length > 0 ? order.items.map((item, index) => (
                  <div key={`${item.productName}-${index}`} className='grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto]'>
                    <div className='min-w-0'>
                      <p className='font-semibold text-base-content'>{item.productName || 'Custom order'}</p>
                      <p className='mt-1 text-sm text-base-content/65'>
                        {[
                          item.size ? `Size ${item.size}` : '',
                          item.flavor ? `Flavour ${item.flavor}` : '',
                          item.designType ? `Design ${formatLabel(item.designType)}` : ''
                        ].filter(Boolean).join(' - ') || 'No item options recorded'}
                      </p>
                      {!cakesByPostOrder && item.specialInstructions && !isInstructionDuplicatedInMessages(order, item.specialInstructions) ? (
                        <p className='mt-2 whitespace-pre-wrap text-sm text-base-content/75'>{item.specialInstructions}</p>
                      ) : null}
                    </div>
                    <div className='text-sm sm:text-right'>
                      <p className='font-semibold text-base-content'>Qty {item.quantity}</p>
                      <p className='mt-1 text-base-content/65'>{formatCurrency(item.totalPrice || item.unitPrice || 0)}</p>
                    </div>
                  </div>
                )) : (
                  <p className='p-4 text-sm text-base-content/65'>No items recorded.</p>
                )}
              </div>
            )}
          </section>

          <section className='rounded-box border border-base-300 bg-base-100 p-5 shadow-sm' aria-labelledby='messages-heading'>
            <h2 id='messages-heading' className='text-lg font-semibold text-base-content'>
              {cakesByPostOrder ? 'Customer instructions and images' : 'Messages and images'}
            </h2>
            {cakesByPostOrder ? (
              customerNoteRows.length > 0 ? (
                <dl className='mt-4 grid gap-3'>
                  {customerNoteRows.map((row) => (
                    <div key={row.label} className='rounded-box border border-base-300 bg-base-200 p-4'>
                      <dt className='text-xs font-medium uppercase tracking-wide text-base-content/60'>{row.label}</dt>
                      <dd className='mt-2 whitespace-pre-wrap text-sm text-base-content'>{row.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className='mt-4 text-sm text-base-content/65'>No customer instructions recorded.</p>
              )
            ) : order.messages && order.messages.length > 0 ? (
              <div className='mt-4 grid gap-3'>
                {order.messages.filter((message) => !isGeneratedCakesByPostMessage(message.message)).map((message, index) => (
                  <div key={`${message.message}-${index}`} className='rounded-box border border-base-300 bg-base-200 p-4'>
                    <p className='whitespace-pre-wrap text-sm text-base-content'>{message.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className='mt-4 text-sm text-base-content/65'>No customer messages recorded.</p>
            )}
            {orderImages.length > 0 ? (
              <div className='mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'>
                {orderImages.map((image, index) => {
                  const imageUrl = getImageUrl(image.asset)

                  if (!imageUrl) {
                    return null
                  }

                  return (
                    <a
                      key={`${image.source}-${index}`}
                      href={imageUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='group overflow-hidden rounded-box border border-base-300 bg-base-200'
                    >
                      <img src={imageUrl} alt={image.alt} className='aspect-square w-full object-cover transition-opacity group-hover:opacity-90' />
                      <span className='block truncate px-3 py-2 text-xs text-base-content/65'>{formatLabel(image.source)}</span>
                    </a>
                  )
                })}
              </div>
            ) : (
              <p className='mt-4 text-sm text-base-content/65'>No images attached.</p>
            )}
          </section>

          <section className='rounded-box border border-base-300 bg-base-100 p-5 shadow-sm' aria-labelledby='notes-heading'>
            <h2 id='notes-heading' className='text-lg font-semibold text-base-content'>Internal notes</h2>
            {order.notes && order.notes.length > 0 ? (
              <div className='mt-4 grid gap-3'>
                {order.notes.map((note, index) => (
                  <article key={`${note.createdAt}-${index}`} className='rounded-box border border-base-300 bg-base-200 p-4'>
                    <p className='whitespace-pre-wrap text-sm text-base-content'>{note.note || 'Image note'}</p>
                    <p className='mt-2 text-xs text-base-content/60'>
                      {note.author} - {formatDateTime(note.createdAt)}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p className='mt-4 text-sm text-base-content/65'>No internal notes yet.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
