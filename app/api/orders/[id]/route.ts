import { isAdminAuthenticated } from '@/lib/admin-auth'
import { getCustomerEmailBcc } from '@/lib/email/customer-bcc'
import { getEmailTransportMode, requiresLiveEmailConfiguration, sendEmail } from '@/lib/email/service'
import { CURRENT_TERMS_VERSION } from '@/lib/legal/legal-config'
import { getTermsEmailAttachment } from '@/lib/legal/terms-document'
import { logger } from '@/lib/logger'
import { ORDER_STATUS_LABELS } from '@/lib/order-constants'
import { isCakesByPostOrderType, isCakesByPostProductType } from '@/lib/order-types'
import {
  getSupabaseOrderByIdentifier,
  updateSupabaseOrder,
  uploadSupabaseOrderNoteImage
} from '@/lib/orders/supabase-orders'
import type { Order, OrderItem, OrderNote, OrderNoteImage, OrderUpdate } from '@/types/order'
import { NextRequest, NextResponse } from 'next/server'
import { toSafeOperationalError } from '@/lib/security/safe-operational-error'

type DeliveryCourier = 'royal-mail' | 'evri'

const deliveryCourierLabels: Record<DeliveryCourier, string> = {
  'royal-mail': 'Royal Mail',
  evri: 'Evri'
}

function normalizeEmailOrderItems(items: OrderItem[] | undefined) {
  if (!Array.isArray(items)) {
    return []
  }

  return items.map((item) => ({
    productName: item.productName || 'Custom Order',
    quantity: typeof item.quantity === 'number' && Number.isFinite(item.quantity) ? item.quantity : 1,
    unitPrice: typeof item.unitPrice === 'number' && Number.isFinite(item.unitPrice) ? item.unitPrice : 0,
    totalPrice: typeof item.totalPrice === 'number' && Number.isFinite(item.totalPrice) ? item.totalPrice : 0,
    designType: item.designType,
    filling: item.flavor,
    servings: item.size,
    productType: item.productType,
    productId: item.productId
  }))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function normalizeDeliveryCourier(value: string | undefined): DeliveryCourier | undefined {
  if (value === 'royal-mail' || value === 'evri') {
    return value
  }

  return undefined
}

function getDeliveryCourier(order: Order): DeliveryCourier | undefined {
  if (!isRecord(order.metadata)) {
    return undefined
  }

  return normalizeDeliveryCourier(typeof order.metadata.deliveryCourier === 'string' ? order.metadata.deliveryCourier : undefined)
}

function getDeliveryCourierLabel(order: Order): string {
  const courier = getDeliveryCourier(order) || 'evri'

  return deliveryCourierLabels[courier]
}

function getPostalOrderDescription(order: Order): 'cake by post order' | 'cake order' {
  return isCakesByPostSourceOrder(order) ? 'cake by post order' : 'cake order'
}

function getOrderAllergenStatement(order: Order): string | undefined {
  const value = order.metadata?.allergenStatement
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined
}

function getCustomerFacingOfferDescription(order: Order): string | undefined {
  const value = order.metadata?.customerFacingOfferDescription
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined
}

function hasWrittenAllergenLabel(order: Order): boolean {
  return order.metadata?.allergenLabelIncluded === true
}

function hasCustomerAcceptedOffer(order: Order): boolean {
  return order.metadata?.customerAcceptedOffer === true ||
    order.pricing.paymentStatus === 'paid' ||
    order.pricing.paymentStatus === 'partial'
}

function isCakesByPostSourceOrder(order: Order): boolean {
  const productTypes = order.items
    .map((item) => item.productType?.trim())
    .filter((productType): productType is string => Boolean(productType))

  if (productTypes.length > 0) {
    return productTypes.some(isCakesByPostProductType)
  }

  return isCakesByPostOrderType(order.orderType)
}

function getFormString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key)
  return typeof value === 'string' ? value : undefined
}

function getFormBoolean(formData: FormData, key: string): boolean | undefined {
  const value = formData.get(key)
  if (value === null) {
    return undefined
  }

  return value === 'true' || value === 'on' || value === '1'
}

function containsControlCharacter(value: string): boolean {
  return Array.from(value).some((character) => {
    const code = character.charCodeAt(0)
    return code <= 31 || code === 127
  })
}

function getDeliveryRecipientNameError(value: unknown): string | null {
  if (typeof value !== 'string') {
    return 'Recipient name must be a string'
  }

  const trimmed = value.trim()

  if (trimmed.length > 0 && trimmed.length < 2) {
    return 'Recipient name must be at least 2 characters'
  }

  if (trimmed.length > 100) {
    return 'Recipient name must be 100 characters or fewer'
  }

  if (containsControlCharacter(trimmed)) {
    return 'Recipient name cannot contain control characters'
  }

  return null
}

function getDeliveryAddressError(value: unknown): string | null {
  if (typeof value !== 'string') {
    return 'Delivery address must be a string'
  }

  const trimmed = value.trim()

  if (trimmed.length > 500) {
    return 'Delivery address must be 500 characters or fewer'
  }

  if (containsControlCharacter(trimmed)) {
    return 'Delivery address cannot contain control characters'
  }

  return null
}

function parseDeleteRequestBody(value: unknown): { permanent?: boolean } {
  if (!value || typeof value !== 'object') {
    return {}
  }

  const record = value as Record<string, unknown>

  return {
    permanent: typeof record.permanent === 'boolean' ? record.permanent : undefined
  }
}

function applyOrderUpdates(currentOrder: Order, updates: OrderUpdate): Order {
  const nextOrder: Order = {
    ...currentOrder,
    customer: { ...currentOrder.customer },
    delivery: { ...currentOrder.delivery },
    pricing: { ...currentOrder.pricing },
    items: currentOrder.items.map((item) => ({ ...item })),
    messages: currentOrder.messages?.map((message) => ({
      ...message,
      attachments: message.attachments?.map((attachment) => ({ ...attachment }))
    })),
    notes: currentOrder.notes?.map((note) => ({
      ...note,
      images: note.images?.map((image) => ({ ...image }))
    })),
    metadata: currentOrder.metadata ? { ...currentOrder.metadata } : undefined
  }

  if (updates.status && updates.status !== currentOrder.status) {
    nextOrder.status = updates.status
  }

  if (updates.trackingNumber !== undefined) {
    nextOrder.delivery.trackingNumber = updates.trackingNumber
  }

  if (updates.deliveryMethod) {
    nextOrder.delivery.deliveryMethod = updates.deliveryMethod
  }

  if (updates.deliveryRecipientName !== undefined) {
    const deliveryRecipientName = updates.deliveryRecipientName.trim()
    nextOrder.delivery.recipientName = deliveryRecipientName || undefined

    const nextMetadata = { ...(nextOrder.metadata || {}) }
    const inlineOrderContext = isRecord(nextMetadata.inlineOrderContext)
      ? { ...nextMetadata.inlineOrderContext }
      : {}

    delete inlineOrderContext.recipientName
    delete nextMetadata.deliveryRecipientName
    delete nextMetadata.recipientName

    if (deliveryRecipientName.length > 0) {
      inlineOrderContext.deliveryRecipientName = deliveryRecipientName
    } else {
      delete inlineOrderContext.deliveryRecipientName
    }

    nextMetadata.inlineOrderContext = inlineOrderContext
    nextOrder.metadata = nextMetadata
  }

  if (updates.deliveryAddress !== undefined) {
    nextOrder.delivery.deliveryAddress = updates.deliveryAddress.trim() || undefined
  }

  if (updates.deliveryCourier !== undefined) {
    const deliveryCourier = normalizeDeliveryCourier(updates.deliveryCourier)
    const nextMetadata = { ...(nextOrder.metadata || {}) }

    if (deliveryCourier) {
      nextMetadata.deliveryCourier = deliveryCourier
    } else {
      delete nextMetadata.deliveryCourier
    }

    nextOrder.metadata = nextMetadata
  }

  if (updates.dateNeeded !== undefined) {
    nextOrder.delivery.dateNeeded = updates.dateNeeded ?? undefined
  }

  if (updates.paymentStatus) {
    nextOrder.pricing.paymentStatus = updates.paymentStatus
  }

  if (updates.paymentMethod !== undefined) {
    nextOrder.pricing.paymentMethod = updates.paymentMethod
  }

  if (updates.customerName) {
    nextOrder.customer.name = updates.customerName
  }

  if (updates.customerEmail) {
    nextOrder.customer.email = updates.customerEmail
  }

  if (updates.customerPhone !== undefined) {
    nextOrder.customer.phone = updates.customerPhone
  }

  if (updates.customerAddress !== undefined) {
    nextOrder.customer.address = updates.customerAddress
  }

  if (updates.customerCity !== undefined) {
    nextOrder.customer.city = updates.customerCity
  }

  if (updates.customerPostcode !== undefined) {
    nextOrder.customer.postcode = updates.customerPostcode
  }

  if (updates.subtotal !== undefined) {
    nextOrder.pricing.subtotal = updates.subtotal
  }

  if (updates.deliveryFee !== undefined) {
    nextOrder.pricing.deliveryFee = updates.deliveryFee
  }

  if (updates.discount !== undefined) {
    nextOrder.pricing.discount = updates.discount
  }

  if (updates.total !== undefined) {
    nextOrder.pricing.total = updates.total
  }

  if (updates.allergenStatement !== undefined) {
    const allergenStatement = updates.allergenStatement.trim()
    nextOrder.metadata = {
      ...(nextOrder.metadata ?? {}),
      allergenStatement,
      allergenConfirmedAt: allergenStatement.length > 0 ? new Date().toISOString() : undefined
    }
  }

  if (updates.customerFacingOfferDescription !== undefined) {
    const customerFacingOfferDescription = updates.customerFacingOfferDescription.trim()
    nextOrder.metadata = {
      ...(nextOrder.metadata ?? {}),
      customerFacingOfferDescription
    }
  }

  if (updates.allergenLabelIncluded !== undefined) {
    nextOrder.metadata = {
      ...(nextOrder.metadata ?? {}),
      allergenLabelIncluded: updates.allergenLabelIncluded
    }
  }

  if (updates.customerAcceptedOffer !== undefined) {
    nextOrder.metadata = {
      ...(nextOrder.metadata ?? {}),
      customerAcceptedOffer: updates.customerAcceptedOffer,
      customerAcceptedAt: updates.customerAcceptedOffer ? new Date().toISOString() : undefined
    }
  }

  if (Array.isArray(updates.items)) {
    nextOrder.items = updates.items
      .filter((item) => typeof item.productName === 'string' && item.productName.trim().length > 0)
      .map((item) => ({
        productType: item.productType || 'cake',
        productId: item.productId || '',
        productName: item.productName.trim(),
        quantity: Number.isFinite(item.quantity) && item.quantity > 0 ? item.quantity : 1,
        unitPrice: typeof item.unitPrice === 'number' && Number.isFinite(item.unitPrice) ? item.unitPrice : 0,
        totalPrice: Number.isFinite(item.totalPrice) ? item.totalPrice : 0,
        size: item.size?.trim() || undefined,
        flavor: item.flavor?.trim() || undefined,
        designType: item.designType?.trim() || undefined,
        specialInstructions: item.specialInstructions?.trim() || undefined
      }))
  }

  if (updates.itemPrice !== undefined) {
    const newItemPrice = parseFloat(updates.itemPrice)

    if (!Number.isNaN(newItemPrice) && nextOrder.items.length > 0) {
      nextOrder.items = nextOrder.items.map((item, index) =>
        index === 0 ? { ...item, totalPrice: newItemPrice, unitPrice: newItemPrice } : item
      )
    }
  }

  if (updates.totalPrice !== undefined) {
    const newTotal = parseFloat(updates.totalPrice)

    if (!Number.isNaN(newTotal)) {
      nextOrder.pricing.total = newTotal
    }
  }

  if (
    updates.selectedCakeId !== undefined ||
    updates.selectedCakeName !== undefined ||
    updates.selectedCakeSize !== undefined ||
    updates.selectedDesignType !== undefined
  ) {
    const currentItem = nextOrder.items[0]
    const itemPrice = updates.itemPrice ? parseFloat(updates.itemPrice) : (currentItem?.unitPrice ?? 0)

    const updatedItem: OrderItem = {
      productType: currentItem?.productType || 'cake',
      productId: updates.selectedCakeId || currentItem?.productId || '',
      productName: updates.selectedCakeName || currentItem?.productName || 'Custom Order',
      designType: updates.selectedDesignType || currentItem?.designType || 'standard',
      quantity: currentItem?.quantity || 1,
      unitPrice: Number.isNaN(itemPrice) ? (currentItem?.unitPrice ?? 0) : itemPrice,
      totalPrice: Number.isNaN(itemPrice) ? (currentItem?.totalPrice ?? 0) : itemPrice,
      size: updates.selectedCakeSize || currentItem?.size || '',
      flavor: currentItem?.flavor || '',
      specialInstructions: currentItem?.specialInstructions || ''
    }

    nextOrder.items = nextOrder.items.length > 0
      ? nextOrder.items.map((item, index) => index === 0 ? updatedItem : item)
      : [updatedItem]
  }

  return nextOrder
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthenticated = await isAdminAuthenticated(request)
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const { id } = await params
    const order = await getSupabaseOrderByIdentifier(id)

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    logger.error('Failed to fetch order', {
      operation: 'orders.detail',
      ...toSafeOperationalError(error)
    })
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthenticated = await isAdminAuthenticated(request)
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const { id } = await params
    let updates: OrderUpdate = {}
    let images: File[] = []
    const contentType = request.headers.get('content-type')

    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData()

      updates = {
        status: getFormString(formData, 'status'),
        trackingNumber: getFormString(formData, 'trackingNumber'),
        deliveryCourier: getFormString(formData, 'deliveryCourier'),
        deliveryMethod: getFormString(formData, 'deliveryMethod'),
        deliveryRecipientName: getFormString(formData, 'deliveryRecipientName'),
        deliveryAddress: getFormString(formData, 'deliveryAddress'),
        dateNeeded: (() => {
          const dateNeeded = getFormString(formData, 'dateNeeded')
          return dateNeeded && dateNeeded.trim() ? dateNeeded : null
        })(),
        paymentStatus: getFormString(formData, 'paymentStatus'),
        paymentMethod: getFormString(formData, 'paymentMethod'),
        note: getFormString(formData, 'note'),
        customerName: getFormString(formData, 'customerName'),
        customerEmail: getFormString(formData, 'customerEmail'),
        customerPhone: getFormString(formData, 'customerPhone'),
        customerAddress: getFormString(formData, 'customerAddress'),
        customerCity: getFormString(formData, 'customerCity'),
        customerPostcode: getFormString(formData, 'customerPostcode'),
        itemPrice: getFormString(formData, 'itemPrice'),
        totalPrice: getFormString(formData, 'totalPrice'),
        selectedCakeId: getFormString(formData, 'selectedCakeId'),
        selectedCakeName: getFormString(formData, 'selectedCakeName'),
        selectedCakeSize: getFormString(formData, 'selectedCakeSize'),
        selectedDesignType: getFormString(formData, 'selectedDesignType'),
        customerFacingOfferDescription: getFormString(formData, 'customerFacingOfferDescription'),
        allergenStatement: getFormString(formData, 'allergenStatement'),
        allergenLabelIncluded: getFormBoolean(formData, 'allergenLabelIncluded'),
        customerAcceptedOffer: getFormBoolean(formData, 'customerAcceptedOffer')
      }

      images = formData
        .getAll('images')
        .filter((value): value is File => value instanceof File && value.size > 0)
    } else {
      updates = await request.json() as OrderUpdate
    }

    if (updates.deliveryRecipientName !== undefined) {
      const recipientNameError = getDeliveryRecipientNameError(updates.deliveryRecipientName)

      if (recipientNameError) {
        return NextResponse.json(
          { error: 'Validation failed', details: recipientNameError },
          { status: 400 }
        )
      }
    }

    if (updates.deliveryAddress !== undefined) {
      const deliveryAddressError = getDeliveryAddressError(updates.deliveryAddress)

      if (deliveryAddressError) {
        return NextResponse.json(
          { error: 'Validation failed', details: deliveryAddressError },
          { status: 400 }
        )
      }
    }

    if (
      updates.status !== undefined &&
      (
        typeof updates.status !== 'string' ||
        !Object.prototype.hasOwnProperty.call(ORDER_STATUS_LABELS, updates.status)
      )
    ) {
      return NextResponse.json(
        { error: 'Validation failed', details: 'Order status is invalid.' },
        { status: 400 }
      )
    }

    if (
      updates.customerFacingOfferDescription !== undefined &&
      typeof updates.customerFacingOfferDescription !== 'string'
    ) {
      return NextResponse.json(
        { error: 'Validation failed', details: 'Final-offer description must be text.' },
        { status: 400 }
      )
    }

    if (
      updates.allergenStatement !== undefined &&
      typeof updates.allergenStatement !== 'string'
    ) {
      return NextResponse.json(
        { error: 'Validation failed', details: 'Allergen information must be text.' },
        { status: 400 }
      )
    }

    if (
      updates.customerAcceptedOffer !== undefined &&
      typeof updates.customerAcceptedOffer !== 'boolean'
    ) {
      return NextResponse.json(
        { error: 'Validation failed', details: 'Customer acceptance must be true or false.' },
        { status: 400 }
      )
    }

    if (
      updates.allergenLabelIncluded !== undefined &&
      typeof updates.allergenLabelIncluded !== 'boolean'
    ) {
      return NextResponse.json(
        { error: 'Validation failed', details: 'Written allergen label confirmation must be true or false.' },
        { status: 400 }
      )
    }

    const currentOrder = await getSupabaseOrderByIdentifier(id)

    if (!currentOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    const nextOrder = applyOrderUpdates(currentOrder, updates)

    if (
      typeof updates.allergenStatement === 'string' &&
      updates.allergenStatement.trim().length > 2000
    ) {
      return NextResponse.json(
        { error: 'Validation failed', details: 'Allergen information must be 2,000 characters or fewer.' },
        { status: 400 }
      )
    }

    if (
      typeof updates.customerFacingOfferDescription === 'string' &&
      updates.customerFacingOfferDescription.trim().length > 2000
    ) {
      return NextResponse.json(
        { error: 'Validation failed', details: 'Final-offer description must be 2,000 characters or fewer.' },
        { status: 400 }
      )
    }

    if (updates.status === 'confirmed' && !getCustomerFacingOfferDescription(nextOrder)) {
      return NextResponse.json(
        {
          error: 'Final-offer description required',
          details: 'Add the staff-authored customer-facing description before sending the final order offer.'
        },
        { status: 400 }
      )
    }

    if (updates.status === 'confirmed' && !getOrderAllergenStatement(nextOrder)) {
      return NextResponse.json(
        {
          error: 'Allergen information required',
          details: 'Add the exact product-specific allergen statement before sending the final order offer.'
        },
        { status: 400 }
      )
    }

    if (
      updates.status !== undefined &&
      ['ready-pickup', 'out-delivery', 'delivered', 'completed'].includes(updates.status) &&
      !hasWrittenAllergenLabel(nextOrder)
    ) {
      return NextResponse.json(
        {
          error: 'Written allergen label required',
          details: 'Confirm that the written product-specific allergen information is included with the food.'
        },
        { status: 400 }
      )
    }

    if (
      updates.status !== undefined &&
      ['in-progress', 'ready-pickup', 'out-delivery', 'delivered', 'completed'].includes(updates.status) &&
      !hasCustomerAcceptedOffer(nextOrder)
    ) {
      return NextResponse.json(
        {
          error: 'Customer acceptance required',
          details: 'Record the customer’s written acceptance or a received payment before production or fulfilment.'
        },
        { status: 400 }
      )
    }

    if ((updates.note && updates.note.trim()) || images.length > 0) {
      const uploadedImages: OrderNoteImage[] = []

      for (const imageFile of images) {
        try {
          uploadedImages.push(await uploadSupabaseOrderNoteImage(currentOrder._id, imageFile))
        } catch (imageError) {
          logger.error('Failed to upload image', {
            operation: 'orders.note_image_upload',
            recordReference: currentOrder.orderNumber,
            ...toSafeOperationalError(imageError)
          })
        }
      }

      const newNote: OrderNote = {
        note: (updates.note && updates.note.trim()) || '',
        author: updates.author || 'Admin',
        createdAt: new Date().toISOString(),
        images: uploadedImages
      }

      nextOrder.notes = [...(nextOrder.notes || []), newNote]
    }

    const updatedOrder = await updateSupabaseOrder(nextOrder)

    if (updates.status && updates.status !== currentOrder.status) {
      await sendStatusUpdateEmail(updatedOrder, updates.status)
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: 'Order updated successfully'
    })
  } catch (error) {
    logger.error('Failed to update order', {
      operation: 'orders.update',
      ...toSafeOperationalError(error)
    })
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthenticated = await isAdminAuthenticated(request)
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const { id } = await params
    const body = parseDeleteRequestBody(await request.json().catch(() => ({})))
    const currentOrder = await getSupabaseOrderByIdentifier(id)

    if (!currentOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    if (body.permanent) {
      return NextResponse.json({
        error: 'Permanent deletion is available only for due records in the Privacy retention centre.',
        code: 'RETENTION_CENTRE_REQUIRED'
      }, { status: 409 })
    }

    const cancelledOrder = await updateSupabaseOrder({
      ...currentOrder,
      status: 'cancelled',
      pricing: {
        ...currentOrder.pricing,
        paymentStatus: 'cancelled',
        paymentMethod: 'cancelled'
      }
    })

    await sendStatusUpdateEmail(cancelledOrder, 'cancelled')

    return NextResponse.json({
      success: true,
      order: cancelledOrder,
      message: 'Order cancelled successfully'
    })
  } catch (error) {
    logger.error('Failed to delete order', {
      operation: 'orders.delete',
      ...toSafeOperationalError(error)
    })
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    )
  }
}

async function sendStatusUpdateEmail(order: Order, newStatus: string) {
  const emailMode = getEmailTransportMode()

  if (requiresLiveEmailConfiguration(emailMode) && !process.env.RESEND_API_KEY) {
    logger.error('RESEND_API_KEY not configured - skipping status update email', {
      operation: 'orders.status_email',
      recordReference: order.orderNumber,
      code: 'EMAIL_NOT_CONFIGURED'
    })
    return
  }

  const isCakesByPostOrder = isCakesByPostSourceOrder(order)
  const termsVersion = typeof order.metadata?.termsPresentedVersion === 'string'
    ? order.metadata.termsPresentedVersion
    : CURRENT_TERMS_VERSION

  const statusMessages = {
    confirmed: {
      subject: isCakesByPostOrder
        ? `Final Order Offer #${order.orderNumber} - Olgish Cakes`
        : `Final Order Offer #${order.orderNumber} - Olgish Cakes`,
      heading: 'Your final order offer',
      message: `This email is our final written offer for the details and price shown below under terms version ${termsVersion}. Please accept it in writing or make the requested payment. Your contract starts only when you do so.`
    },
    'in-progress': {
      subject: `Order In Progress #${order.orderNumber} - Olgish Cakes`,
      heading: 'Order in progress',
      message: isCakesByPostOrder
        ? 'Your cakes by post order is now being prepared.'
        : 'Your order is now in progress. Our team is preparing your cake with care.'
    },
    'ready-pickup': {
      subject: `Order Ready for Collection #${order.orderNumber} - Olgish Cakes`,
      heading: 'Order ready for collection',
      message: 'Your order is ready for collection. Please contact us to arrange pickup.'
    },
    'out-delivery': {
      subject: isCakesByPostOrder
        ? `Order Dispatched #${order.orderNumber} - Olgish Cakes`
        : `Order Out for Delivery #${order.orderNumber} - Olgish Cakes`,
      heading: isCakesByPostOrder ? 'Order dispatched' : 'Order out for delivery',
      message: (() => {
        const deliveryMethod = order.delivery.deliveryMethod

        if (deliveryMethod === 'postal' || deliveryMethod === 'postal-delivery') {
          const courierLabel = getDeliveryCourierLabel(order)
          const orderDescription = getPostalOrderDescription(order)

          return order.delivery.trackingNumber
            ? `Great news, your ${orderDescription} has been dispatched with ${courierLabel}.`
            : `Great news, your ${orderDescription} has been dispatched with ${courierLabel} and is on the way.`
        }

        if (deliveryMethod === 'local-delivery') {
          return 'Great news! Your order is out for local delivery and will be with you soon.'
        }

        if (deliveryMethod === 'market-pickup') {
          return 'Great news! Your order is ready for collection at our market stall. Please contact us to arrange pickup.'
        }

        return 'Great news! Your order is on its way to you.'
      })()
    },
    delivered: {
      subject: `Order Delivered #${order.orderNumber} - Olgish Cakes`,
      heading: 'Order delivered',
      message: isCakesByPostOrder
        ? 'Your cakes by post order has been delivered. We hope it arrived safely and is enjoyed.'
        : 'Your order has been delivered. We hope you enjoy your cake.'
    },
    completed: {
      subject: `Order Completed #${order.orderNumber} - Olgish Cakes`,
      heading: 'Order completed',
      message: 'Thank you for choosing Olgish Cakes. Your order is completed and we look forward to serving you again.'
    },
    cancelled: {
      subject: `Order Cancelled #${order.orderNumber} - Olgish Cakes`,
      heading: 'Order cancelled',
      message: isCakesByPostOrder
        ? 'Your cakes by post order has been cancelled. If you have any questions, please contact us and we\'ll help.'
        : 'Your order has been cancelled. If you have any questions, please contact us and we\'ll help.'
    }
  } as const

  const statusInfo = statusMessages[newStatus as keyof typeof statusMessages]
  if (!statusInfo) {
    return
  }

  const firstItem = order.items?.[0]
  const totalPrice = (() => {
    if (typeof order.pricing?.total === 'number' && order.pricing.total > 0) {
      return order.pricing.total
    }

    if (Array.isArray(order.items) && order.items.length > 0) {
      return order.items.reduce((sum, item) => {
        const itemTotal = typeof item.totalPrice === 'number' ? item.totalPrice : item.unitPrice || 0
        return sum + itemTotal
      }, 0)
    }

    return 0
  })()

  const normalizedStatus = newStatus === 'ready-pickup'
    ? 'ready'
    : newStatus === 'out-delivery'
      ? 'out-for-delivery'
      : newStatus

  try {
    const termsAttachment = newStatus === 'confirmed'
      ? await getTermsEmailAttachment(termsVersion)
      : null
    const sendResult = await sendEmail({
      templateId: 'orders-status-update',
      input: {
        customerName: order.customer.name,
        customerEmail: order.customer.email,
        customerPhone: order.customer.phone,
        address: order.customer.address,
        city: order.customer.city,
        postcode: order.customer.postcode,
        orderNumber: order.orderNumber,
        orderType: order.orderType,
        productName: firstItem?.productName,
        productId: firstItem?.productId,
        productType: firstItem?.productType,
        quantity: firstItem?.quantity,
        unitPrice: firstItem?.unitPrice,
        totalPrice,
        orderItems: normalizeEmailOrderItems(order.items),
        dateNeeded: order.delivery.dateNeeded || undefined,
        status: normalizedStatus,
        designType: firstItem?.designType,
        filling: firstItem?.flavor,
        servings: firstItem?.size,
        customerFacingOfferDescription: getCustomerFacingOfferDescription(order),
        deliveryMethod: order.delivery.deliveryMethod,
        deliveryRecipientName: order.delivery.recipientName || order.customer.name,
        deliveryAddress: order.delivery.deliveryAddress,
        paymentMethod: order.pricing?.paymentMethod,
        paymentStatus: order.pricing?.paymentStatus,
        allergenStatement: getOrderAllergenStatement(order),
        trackingNumber: order.delivery.trackingNumber || undefined,
        deliveryCourier: getDeliveryCourier(order) || 'evri',
        titleOverride: statusInfo.subject,
        headingOverride: statusInfo.heading,
        statusMessage: statusInfo.message
      },
      modeOverride: emailMode,
      message: {
        from: 'Olgish Cakes <hello@olgishcakes.co.uk>',
        to: order.customer.email,
        bcc: getCustomerEmailBcc(process.env.ADMIN_BCC_EMAIL),
        ...(termsAttachment ? { attachments: [termsAttachment] } : {})
      }
    })

    if (sendResult.error) {
      throw Object.assign(new Error('Status email was not accepted'), {
        code: toSafeOperationalError(sendResult.error).code
      })
    }
  } catch (emailError) {
    logger.error('Failed to send status update email', {
      operation: 'orders.status_email',
      recordReference: order.orderNumber,
      ...toSafeOperationalError(emailError)
    })
  }
}
