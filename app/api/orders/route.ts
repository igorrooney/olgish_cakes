import { isAdminAuthenticated } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { generateOrderNumber } from '@/lib/order-utils'
import { withRateLimit } from '@/lib/rate-limit'
import { getRequestIpLocation } from '@/lib/request-location'
import { formatValidationErrors, orderSchema, validateRequest } from '@/lib/validation'
import { getEmailTransportMode, requiresLiveEmailConfiguration, sendEmail } from '@/lib/email/service'
import { sendTelegramManagerNotification } from '@/lib/notifications/telegram'
import { resolveCanonicalOrderType } from '@/lib/order-types'
import { urlFor } from '@/sanity/lib/image'
import {
  createSupabaseOrder,
  listSupabaseOrders,
  updateSupabaseOrderMetadata
} from '@/lib/orders/supabase-orders'
import type { Attachment, OrderItem } from '@/types/order'
import { NextRequest, NextResponse } from 'next/server'

interface RawOrderRequest {
  name?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  postcode?: string
  message?: string
  dateNeeded?: string
  orderType?: string
  productType?: string
  productId?: string
  productName?: string
  designType?: string
  quantity?: number
  unitPrice?: number
  totalPrice?: number
  size?: string
  flavor?: string
  specialInstructions?: string
  deliveryMethod?: string
  deliveryAddress?: string
  deliveryNotes?: string
  giftNote?: string
  note?: string
  paymentMethod?: string
  referrer?: string
  subtotal?: number
  deliveryFee?: number
  discount?: number
  total?: number
  items?: OrderItem[]
  attachments?: Attachment[]
}

function toDeliveryMethodLabel(value: string): string {
  if (value === 'local-delivery') {
    return 'Local delivery'
  }

  if (value === 'collection') {
    return 'Collection'
  }

  if (value === 'postal' || value === 'postal-delivery') {
    return 'Postal delivery'
  }

  return value || 'Delivery'
}

function toPaymentMethodLabel(value: string): string {
  if (value === 'cash-collection') {
    return 'Cash on collection'
  }

  if (value === 'card-collection') {
    return 'Card on collection'
  }

  if (value === 'card') {
    return 'Card'
  }

  return value || 'Online payment'
}

function normalizeEmailOrderItems(items: OrderItem[]) {
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

function getAttachmentLabel(attachment: Attachment) {
  return attachment.alt || attachment.caption || 'Attachment'
}

function getReferenceImageUrls(attachments: Attachment[]) {
  return attachments.flatMap((attachment) => {
    if (!attachment.asset) {
      return []
    }

    try {
      return [urlFor(attachment.asset).width(400).height(300).url()]
    } catch {
      return attachment.asset.url ? [attachment.asset.url] : []
    }
  })
}

async function handlePOST(request: NextRequest) {
  try {
    const orderData = await request.json() as RawOrderRequest

    const validationResult = await validateRequest(orderSchema, {
      name: orderData.name,
      email: orderData.email,
      phone: orderData.phone,
      address: orderData.address || undefined,
      city: orderData.city || undefined,
      postcode: orderData.postcode || undefined,
      message: orderData.message || '',
      dateNeeded: orderData.dateNeeded || undefined,
      orderType: orderData.orderType || 'custom-cake',
      productType: orderData.productType || 'custom',
      productId: orderData.productId || undefined,
      productName: orderData.productName || 'Custom Order',
      designType: orderData.designType || 'individual',
      quantity: orderData.quantity || 1,
      unitPrice: orderData.unitPrice || 0,
      totalPrice: orderData.totalPrice || 0,
      size: orderData.size || undefined,
      flavor: orderData.flavor || undefined,
      specialInstructions: orderData.specialInstructions || undefined,
      deliveryMethod: orderData.deliveryMethod || 'collection',
      deliveryAddress: orderData.deliveryAddress || undefined,
      deliveryNotes: orderData.deliveryNotes || undefined,
      giftNote: orderData.giftNote || undefined,
      note: orderData.note || undefined,
      paymentMethod: orderData.paymentMethod || 'cash-collection',
      referrer: orderData.referrer || undefined
    })

    if (!validationResult.success) {
      logger.error('Orders API: Validation failed', formatValidationErrors(validationResult.errors))
      return NextResponse.json(
        { error: 'Validation failed', details: formatValidationErrors(validationResult.errors) },
        { status: 400 }
      )
    }

    const validatedOrderData = validationResult.data
    const orderNumber = generateOrderNumber()

    const fallbackItem: OrderItem = {
      productType: validatedOrderData.productType,
      productId: validatedOrderData.productId || '',
      productName: validatedOrderData.productName,
      designType: validatedOrderData.designType,
      quantity: validatedOrderData.quantity || 1,
      unitPrice: validatedOrderData.unitPrice || 0,
      totalPrice: validatedOrderData.totalPrice || 0,
      size: validatedOrderData.size || '',
      flavor: validatedOrderData.flavor || '',
      specialInstructions: validatedOrderData.specialInstructions || ''
    }

    const items = Array.isArray(orderData.items) && orderData.items.length > 0
      ? orderData.items
      : [fallbackItem]
    const canonicalOrderType = resolveCanonicalOrderType({
      orderType: validatedOrderData.orderType,
      productType: validatedOrderData.productType,
      deliveryMethod: validatedOrderData.deliveryMethod,
      itemProductTypes: items.map((item) => item.productType)
    })

    const attachments = Array.isArray(orderData.attachments) ? orderData.attachments : []
    const attachmentNames = attachments.map(getAttachmentLabel)
    const referenceImageUrls = getReferenceImageUrls(attachments)

    const requestIpLocation = getRequestIpLocation(request.headers)
    const orderDoc = {
      orderNumber,
      status: 'new',
      orderType: canonicalOrderType,
      customer: {
        name: validatedOrderData.name,
        email: validatedOrderData.email,
        phone: validatedOrderData.phone,
        address: validatedOrderData.address || '',
        city: validatedOrderData.city || '',
        postcode: validatedOrderData.postcode || ''
      },
      items,
      delivery: {
        dateNeeded: validatedOrderData.dateNeeded || undefined,
        deliveryMethod: validatedOrderData.deliveryMethod || 'collection',
        deliveryAddress: validatedOrderData.deliveryAddress || '',
        deliveryNotes: validatedOrderData.deliveryNotes || '',
        giftNote: validatedOrderData.giftNote || ''
      },
      pricing: {
        subtotal: orderData.subtotal || validatedOrderData.totalPrice || 0,
        deliveryFee: orderData.deliveryFee || 0,
        discount: orderData.discount || 0,
        total: orderData.total || validatedOrderData.totalPrice || 0,
        paymentStatus: 'pending',
        paymentMethod: validatedOrderData.paymentMethod
      },
      messages: (() => {
        const messages: Array<{ message: string, attachments: Attachment[] }> = []

        if (validatedOrderData.message) {
          messages.push({
            message: validatedOrderData.message,
            attachments
          })
        }

        if (validatedOrderData.deliveryNotes || validatedOrderData.note) {
          const additionalNote = validatedOrderData.deliveryNotes || validatedOrderData.note
          if (additionalNote) {
            messages.push({
              message: `Additional Notes: ${additionalNote}`,
              attachments: []
            })
          }
        }

        if (validatedOrderData.giftNote) {
          messages.push({
            message: `Gift Note: ${validatedOrderData.giftNote}`,
            attachments: []
          })
        }

        return messages
      })(),
      metadata: {
        source: 'website',
        sourceOrderType: validatedOrderData.orderType,
        referrer: validatedOrderData.referrer || '',
        userAgent: request.headers.get('user-agent') || '',
        ipAddress: request.headers.get('x-forwarded-for') ||
          request.headers.get('x-real-ip') ||
          'unknown',
        ...(requestIpLocation ? { ipLocation: requestIpLocation } : {})
      }
    }

    const createdOrder = await createSupabaseOrder(orderDoc)
    const emailMode = getEmailTransportMode()
    const firstItem = items[0]

    await sendTelegramManagerNotification({
      type: 'new-order',
      customerName: validatedOrderData.name,
      customerEmail: validatedOrderData.email,
      customerPhone: validatedOrderData.phone,
      dateNeeded: validatedOrderData.dateNeeded,
      productName: firstItem?.productName || validatedOrderData.productName,
      total: orderData.total || validatedOrderData.totalPrice,
      messagePreview: validatedOrderData.message || firstItem?.specialInstructions,
      imageCount: attachments.length,
      adminPath: `/admin/orders/${createdOrder.orderNumber}`
    })

    try {
      if (requiresLiveEmailConfiguration(emailMode) && !process.env.RESEND_API_KEY) {
        logger.error('RESEND_API_KEY not configured - skipping confirmation email')
        throw new Error('Email service not configured')
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(validatedOrderData.email)) {
        logger.error('Orders API: Invalid email address format', validatedOrderData.email)
        throw new Error(`Invalid email address format: ${validatedOrderData.email}`)
      }

      const customerEmailResult = await sendEmail({
        templateId: 'orders-customer-confirmation',
        input: {
          customerName: validatedOrderData.name,
          customerEmail: validatedOrderData.email,
          customerPhone: validatedOrderData.phone,
          address: validatedOrderData.address,
          city: validatedOrderData.city,
          postcode: validatedOrderData.postcode,
          orderNumber,
          orderType: canonicalOrderType,
          productName: firstItem?.productName || validatedOrderData.productName,
          productId: firstItem?.productId || validatedOrderData.productId,
          productType: firstItem?.productType || validatedOrderData.productType,
          quantity: firstItem?.quantity || validatedOrderData.quantity,
          unitPrice: firstItem?.unitPrice || validatedOrderData.unitPrice,
          totalPrice: orderData.total || validatedOrderData.totalPrice,
          orderItems: normalizeEmailOrderItems(items),
          dateNeeded: validatedOrderData.dateNeeded,
          designType: firstItem?.designType,
          filling: firstItem?.flavor,
          servings: firstItem?.size,
          customerMessage: firstItem?.specialInstructions || validatedOrderData.specialInstructions,
          deliveryMethod: toDeliveryMethodLabel(validatedOrderData.deliveryMethod || 'collection'),
          deliveryAddress: validatedOrderData.deliveryAddress,
          paymentMethod: toPaymentMethodLabel(validatedOrderData.paymentMethod || 'cash-collection'),
          giftNote: validatedOrderData.giftNote,
          note: validatedOrderData.note,
          attachmentNames
        },
        modeOverride: emailMode,
        message: {
          from: 'Olgish Cakes <hello@olgishcakes.co.uk>',
          to: validatedOrderData.email,
          bcc: process.env.ADMIN_BCC_EMAIL || undefined
        }
      })

      if (!customerEmailResult.accepted || customerEmailResult.error) {
        const customerEmailFailureReason = customerEmailResult.error?.message || 'Transport did not accept the customer email'
        throw new Error(`Failed to send customer email: ${customerEmailFailureReason}`)
      }

      await updateSupabaseOrderMetadata(createdOrder._id, createdOrder.metadata, {
        emailSent: true,
        emailAttemptedAt: new Date().toISOString()
      })
    } catch (emailError) {
      logger.error('Orders API: Failed to send confirmation email', {
        error: emailError,
        orderId: createdOrder._id
      })

      try {
        await updateSupabaseOrderMetadata(createdOrder._id, createdOrder.metadata, {
          emailSent: false,
          emailError: emailError instanceof Error ? emailError.message : 'Unknown error',
          emailAttemptedAt: new Date().toISOString()
        })
      } catch (metadataError) {
        logger.error('Orders API: Failed to update order metadata', metadataError)
      }
    }

    try {
      if (requiresLiveEmailConfiguration(emailMode) && !process.env.RESEND_API_KEY) {
        logger.error('Orders API: RESEND_API_KEY not configured - skipping admin notification')
        throw new Error('Email service not configured')
      }

      const adminEmailResult = await sendEmail({
        templateId: 'orders-admin-notification',
        input: {
          customerName: validatedOrderData.name,
          customerEmail: validatedOrderData.email,
          customerPhone: validatedOrderData.phone,
          address: validatedOrderData.address,
          city: validatedOrderData.city,
          postcode: validatedOrderData.postcode,
          orderNumber,
          orderType: canonicalOrderType,
          productName: firstItem?.productName || validatedOrderData.productName,
          productId: firstItem?.productId || validatedOrderData.productId,
          productType: firstItem?.productType || validatedOrderData.productType,
          quantity: firstItem?.quantity || validatedOrderData.quantity,
          unitPrice: firstItem?.unitPrice || validatedOrderData.unitPrice,
          totalPrice: orderData.total || validatedOrderData.totalPrice,
          orderItems: normalizeEmailOrderItems(items),
          dateNeeded: validatedOrderData.dateNeeded,
          designType: firstItem?.designType,
          filling: firstItem?.flavor,
          servings: firstItem?.size,
          customerMessage: firstItem?.specialInstructions || validatedOrderData.specialInstructions,
          deliveryMethod: toDeliveryMethodLabel(validatedOrderData.deliveryMethod || 'collection'),
          deliveryAddress: validatedOrderData.deliveryAddress,
          paymentMethod: toPaymentMethodLabel(validatedOrderData.paymentMethod || 'cash-collection'),
          referrer: validatedOrderData.referrer,
          message: validatedOrderData.message,
          note: validatedOrderData.note,
          giftNote: validatedOrderData.giftNote,
          attachmentNames,
          referenceImageUrls
        },
        modeOverride: emailMode,
        message: {
          from: 'Olgish Cakes <hello@olgishcakes.co.uk>',
          to: process.env.CONTACT_EMAIL_TO || 'hello@olgishcakes.co.uk',
          bcc: process.env.ADMIN_BCC_EMAIL || undefined,
          replyTo: validatedOrderData.email
        }
      })

      if (adminEmailResult.error) {
        logger.error('Orders API: Admin email error', {
          error: adminEmailResult.error,
          orderNumber
        })
      }
    } catch (emailError) {
      logger.error('Orders API: Failed to send admin notification', emailError)
    }

    return NextResponse.json({
      success: true,
      orderId: createdOrder._id,
      orderNumber,
      message: 'Order created successfully'
    })
  } catch (error) {
    logger.error('Orders API: Order creation error', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })

    const errorMessage = process.env.NODE_ENV === 'production'
      ? 'Failed to create order'
      : (error instanceof Error ? error.message : 'Unknown error')

    return NextResponse.json(
      {
        error: 'Failed to create order',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export const POST = withRateLimit(handlePOST, {
  windowMs: 60 * 1000,
  maxRequests: 5
})

export async function GET(request: NextRequest) {
  const isAuthenticated = await isAdminAuthenticated(request)
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const validStatuses = [
      'new',
      'confirmed',
      'in-progress',
      'ready-pickup',
      'out-delivery',
      'delivered',
      'completed',
      'cancelled'
    ]

    if (status) {
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status value' },
          { status: 400 }
        )
      }
    }

    const { orders, totalCount } = await listSupabaseOrders({
      status,
      limit,
      offset
    })

    return NextResponse.json({
      orders,
      totalCount,
      hasMore: offset + limit < totalCount
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0'
      }
    })
  } catch (error) {
    logger.error('Failed to fetch orders', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
