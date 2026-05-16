import { isAdminAuthenticated } from '@/lib/admin-auth'
import { getEmailTransportMode, requiresLiveEmailConfiguration, sendEmail } from '@/lib/email/service'
import { logger } from '@/lib/logger'
import {
  deleteSupabaseOrder,
  getSupabaseOrderByIdentifier,
  updateSupabaseOrder,
  uploadSupabaseOrderNoteImage
} from '@/lib/orders/supabase-orders'
import type { Order, OrderItem, OrderNote, OrderNoteImage, OrderUpdate } from '@/types/order'
import { NextRequest, NextResponse } from 'next/server'

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
    specialInstructions: item.specialInstructions,
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
  const courier = getDeliveryCourier(order) || 'royal-mail'

  return deliveryCourierLabels[courier]
}

function getFormString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key)
  return typeof value === 'string' ? value : undefined
}

function parseDeleteRequestBody(value: unknown): { password?: string, permanent?: boolean } {
  if (!value || typeof value !== 'object') {
    return {}
  }

  const record = value as Record<string, unknown>

  return {
    password: typeof record.password === 'string' ? record.password : undefined,
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

  if (updates.customerPhone) {
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
    logger.error('Failed to fetch order', error)
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
        selectedDesignType: getFormString(formData, 'selectedDesignType')
      }

      images = formData
        .getAll('images')
        .filter((value): value is File => value instanceof File && value.size > 0)
    } else {
      updates = await request.json() as OrderUpdate
    }

    const currentOrder = await getSupabaseOrderByIdentifier(id)

    if (!currentOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    const nextOrder = applyOrderUpdates(currentOrder, updates)

    if ((updates.note && updates.note.trim()) || images.length > 0) {
      const uploadedImages: OrderNoteImage[] = []

      for (const imageFile of images) {
        try {
          uploadedImages.push(await uploadSupabaseOrderNoteImage(currentOrder._id, imageFile))
        } catch (imageError) {
          logger.error('Failed to upload image', imageError)
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
    logger.error('Failed to update order', error)
    return NextResponse.json(
      { error: 'Failed to update order', details: error instanceof Error ? error.message : 'Unknown error' },
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
      const password = body.password?.trim() || ''

      if (!password) {
        return NextResponse.json(
          { error: 'Admin password is required' },
          { status: 400 }
        )
      }

      const adminPassword = process.env.ADMIN_PASSWORD
      if (!adminPassword) {
        return NextResponse.json(
          { error: 'Admin password not configured' },
          { status: 500 }
        )
      }

      if (password !== adminPassword) {
        return NextResponse.json(
          { error: 'Invalid password' },
          { status: 401 }
        )
      }

      await deleteSupabaseOrder(currentOrder._id)

      return NextResponse.json({
        success: true,
        message: 'Order permanently deleted from Supabase'
      })
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
    logger.error('Failed to delete order', error)
    return NextResponse.json(
      { error: 'Failed to delete order', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function sendStatusUpdateEmail(order: Order, newStatus: string) {
  const emailMode = getEmailTransportMode()

  if (requiresLiveEmailConfiguration(emailMode) && !process.env.RESEND_API_KEY) {
    logger.error('RESEND_API_KEY not configured - skipping status update email')
    return
  }

  const isCakesByPostOrder = order.orderType === 'gift-hamper' ||
    order.delivery.deliveryMethod === 'postal' ||
    order.delivery.deliveryMethod === 'postal-delivery' ||
    order.items.some((item) => item.productType === 'gift-hamper')

  const statusMessages = {
    confirmed: {
      subject: isCakesByPostOrder
        ? `Order Request Confirmed #${order.orderNumber} - Olgish Cakes`
        : `Order Confirmed #${order.orderNumber} - Olgish Cakes`,
      heading: isCakesByPostOrder ? 'Order request confirmed' : 'Order confirmed',
      message: isCakesByPostOrder
        ? 'Great news, we\'ve confirmed your cakes by post request.'
        : 'Great news! Your order has been confirmed and we\'ve started working on it. We\'ll keep you updated on progress.'
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

          return order.delivery.trackingNumber
            ? `Great news, your cakes by post order has been dispatched with ${courierLabel}.`
            : `Great news, your cakes by post order has been dispatched with ${courierLabel} and is on the way.`
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
        customerMessage: firstItem?.specialInstructions,
        deliveryMethod: order.delivery.deliveryMethod,
        deliveryAddress: order.delivery.deliveryAddress,
        paymentMethod: order.pricing?.paymentMethod,
        paymentStatus: order.pricing?.paymentStatus,
        trackingNumber: order.delivery.trackingNumber || undefined,
        deliveryCourier: getDeliveryCourier(order),
        giftNote: order.delivery.giftNote || undefined,
        titleOverride: statusInfo.subject,
        headingOverride: statusInfo.heading,
        statusMessage: statusInfo.message
      },
      modeOverride: emailMode,
      message: {
        from: 'Olgish Cakes <hello@olgishcakes.co.uk>',
        to: order.customer.email,
        bcc: process.env.ADMIN_BCC_EMAIL || undefined
      }
    })

    if (sendResult.error) {
      throw new Error(sendResult.error.message)
    }
  } catch (emailError) {
    logger.error('Failed to send status update email', emailError)
  }
}
