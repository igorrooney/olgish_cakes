'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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

interface OrderDetailsFormState {
  status: string
  paymentStatus: string
  paymentMethod: string
  deliveryMethod: string
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
  const queryClient = useQueryClient()
  const [formState, setFormState] = useState<OrderDetailsFormState | null>(null)
  const [customerForm, setCustomerForm] = useState<CustomerFormState | null>(null)
  const [itemsForm, setItemsForm] = useState<ItemFormState[]>([])
  const [editingCustomer, setEditingCustomer] = useState(false)
  const [editingItems, setEditingItems] = useState(false)
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
          <p className='text-xs font-medium uppercase tracking-wide text-base-content/60'>Customer</p>
          <p className='mt-2 font-semibold text-base-content'>{order.customer.name}</p>
          <p className='mt-1 text-sm text-base-content/65'>{order.customer.phone}</p>
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
              <span className='label-text mb-2'>Date needed</span>
              <input
                type='date'
                className='input input-bordered w-full'
                value={formState.dateNeeded}
                onChange={(event) => updateField('dateNeeded', event.target.value)}
              />
            </label>

            <label className='form-control w-full'>
              <span className='label-text mb-2'>Tracking number</span>
              <input
                className='input input-bordered w-full'
                value={formState.trackingNumber}
                onChange={(event) => updateField('trackingNumber', event.target.value)}
                placeholder='Optional'
              />
            </label>

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
        </aside>

        <div className='flex flex-col gap-4 xl:order-1'>
          <section className='rounded-box border border-base-300 bg-base-100 p-5 shadow-sm' aria-labelledby='customer-heading'>
            <div className='flex items-start justify-between gap-3'>
              <h2 id='customer-heading' className='text-lg font-semibold text-base-content'>Customer</h2>
              <button
                type='button'
                className='btn btn-outline btn-sm'
                onClick={() => {
                  setEditingCustomer((current) => !current)
                  setCustomerForm(createCustomerFormState(order))
                }}
              >
                {editingCustomer ? 'Cancel' : 'Edit customer'}
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
                    <span className='label-text mb-2'>Phone</span>
                    <input
                      required
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
                </div>
                <div className='flex flex-wrap gap-2'>
                  <button type='submit' className='btn btn-primary btn-sm' disabled={customerMutation.isPending}>
                    {customerMutation.isPending ? 'Saving...' : 'Save customer'}
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
                  <dt className='text-base-content/60'>Email</dt>
                  <dd className='mt-1'>
                    <a className='link link-primary break-all' href={`mailto:${order.customer.email}`}>{order.customer.email}</a>
                  </dd>
                </div>
                <div>
                  <dt className='text-base-content/60'>Phone</dt>
                  <dd className='mt-1'>
                    <a className='link link-primary' href={`tel:${order.customer.phone}`}>{order.customer.phone}</a>
                  </dd>
                </div>
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
                      {item.specialInstructions && !isInstructionDuplicatedInMessages(order, item.specialInstructions) ? (
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
            <h2 id='messages-heading' className='text-lg font-semibold text-base-content'>Messages and images</h2>
            {order.messages && order.messages.length > 0 ? (
              <div className='mt-4 grid gap-3'>
                {order.messages.map((message, index) => (
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
            ) : null}
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
