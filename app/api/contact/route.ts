import { logger } from '@/lib/logger'
import { generateOrderNumber, generateUniqueKey } from '@/lib/order-utils'
import { withRateLimit } from '@/lib/rate-limit'
import { getEmailTransportMode, requiresLiveEmailConfiguration, sendEmail } from '@/lib/email/service'
import { contactFormSchema, formatValidationErrors, validateRequest } from '@/lib/validation'
import { serverClient } from '@/sanity/lib/client'
import { NextRequest, NextResponse } from 'next/server'

const recipientEmail = process.env.CONTACT_EMAIL_TO || 'hello@olgishcakes.co.uk'

type InlineOrderProductType = 'cake' | 'gift-hamper'
type InlineOrderRequestMode = 'message' | 'custom-design'
type InlineOrderDesignType = 'standard' | 'individual'
type InlineOrderType = 'browse-catalog' | 'custom-design' | 'wedding-cake' | 'gift-hamper' | 'custom-quote'

const ukPostcodePattern = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i

interface SanityImageReference {
  _type: 'image'
  asset: {
    _type: 'reference'
    _ref: string
  }
}

function toNonEmptyString(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.trim() : ''
}

function toPositiveNumber(value: FormDataEntryValue | null): number | null {
  const parsed = Number.parseFloat(toNonEmptyString(value))
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null
  }

  return parsed
}

function isInlineOrderProductType(value: string): value is InlineOrderProductType {
  return value === 'cake' || value === 'gift-hamper'
}

function isLegacyOrderProductType(value: string): value is 'custom' {
  return value === 'custom'
}

function resolveInlineOrderProductType(value: string): InlineOrderProductType | null {
  if (value === 'gift-hamper') {
    return 'gift-hamper'
  }

  if (value === 'cake' || value === 'custom') {
    return 'cake'
  }

  return null
}

function getCustomerOrderEmailBcc(): string | undefined {
  const configuredBcc = process.env.ORDER_EMAIL_BCC?.trim() || process.env.ADMIN_BCC_EMAIL?.trim()
  if (!configuredBcc || configuredBcc.length === 0) {
    return undefined
  }

  return configuredBcc
}

function isInlineOrderRequestMode(value: string): value is InlineOrderRequestMode {
  return value === 'message' || value === 'custom-design'
}

function isInlineOrderDesignType(value: string): value is InlineOrderDesignType {
  return value === 'standard' || value === 'individual'
}

const inlineOrderTypeNormalizationMap: Record<string, InlineOrderType> = {
  'browse-catalog': 'browse-catalog',
  'browse our catalog': 'browse-catalog',
  'custom-design': 'custom-design',
  'custom design': 'custom-design',
  'wedding-cake': 'wedding-cake',
  'wedding cake': 'wedding-cake',
  'gift-hamper': 'gift-hamper',
  'gift hamper': 'gift-hamper',
  'custom-quote': 'custom-quote',
  'custom quote': 'custom-quote'
}

function normalizeInlineOrderType(value: string): InlineOrderType | null {
  const normalizedValue = value.trim().toLowerCase()
  if (normalizedValue.length === 0) {
    return null
  }

  return inlineOrderTypeNormalizationMap[normalizedValue] || null
}

function resolveInlineOrderType(params: {
  productType: InlineOrderProductType
  normalizedIncomingOrderType: InlineOrderType | null
  requestMode: InlineOrderRequestMode
}): InlineOrderType {
  if (params.productType === 'gift-hamper') {
    return 'gift-hamper'
  }

  if (params.normalizedIncomingOrderType && params.normalizedIncomingOrderType !== 'gift-hamper') {
    return params.normalizedIncomingOrderType
  }

  if (params.requestMode === 'custom-design') {
    return 'custom-design'
  }

  return 'browse-catalog'
}

function buildDeliveryAddress(address?: string | null, city?: string | null, postcode?: string | null) {
  return [address, city, postcode]
    .map((entry) => typeof entry === 'string' ? entry.trim() : '')
    .filter((entry) => entry.length > 0)
    .join(', ')
}

function normalizeDesignTypeLabel(designType: InlineOrderDesignType): string {
  return designType === 'individual' ? 'Individual design' : 'Standard design'
}

function getPostalOrderAddressValidationErrors(address: string, city: string, postcode: string) {
  const errors: string[] = []

  if (address.length === 0) {
    errors.push('address: Address is required for cakes by post orders')
  } else if (address.length < 5) {
    errors.push('address: Address must be at least 5 characters')
  }

  if (city.length === 0) {
    errors.push('city: City is required for cakes by post orders')
  } else if (city.length < 2) {
    errors.push('city: City must be at least 2 characters')
  }

  if (postcode.length === 0) {
    errors.push('postcode: Postcode is required for cakes by post orders')
  } else if (!ukPostcodePattern.test(postcode)) {
    errors.push('postcode: Invalid UK postcode')
  }

  return errors
}

function getInlineGiftNoteValidationErrors(giftNote: string) {
  const errors: string[] = []

  if (giftNote.length > 500) {
    errors.push('giftNote: Gift note must be 500 characters or fewer')
  }

  return errors
}
const designImageConfig = {
  acceptedTypes: ['image/jpeg', 'image/png', 'image/heic'],
  maxBytes: 5 * 1024 * 1024
}

function getDesignImageError(file: File): string | null {
  if (!designImageConfig.acceptedTypes.includes(file.type)) {
    return 'Reference image must be a JPEG, PNG, or HEIC file'
  }

  if (file.size > designImageConfig.maxBytes) {
    return 'Reference image must be 5MB or smaller'
  }

  return null
}

async function handlePOST(request: NextRequest) {
  if (requiresLiveEmailConfiguration(getEmailTransportMode()) && !process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: 'Email service not configured' },
      { status: 500 }
    )
  }

  try {
    const formData = await request.formData()

    const name = toNonEmptyString(formData.get('name'))
    const email = toNonEmptyString(formData.get('email'))
    const phone = toNonEmptyString(formData.get('phone'))
    const message = toNonEmptyString(formData.get('message'))
    const address = toNonEmptyString(formData.get('address'))
    const city = toNonEmptyString(formData.get('city'))
    const postcode = toNonEmptyString(formData.get('postcode'))
    const dateNeeded = toNonEmptyString(formData.get('dateNeeded'))
    const cakeInterest = toNonEmptyString(formData.get('cakeInterest'))
    const note = toNonEmptyString(formData.get('note'))
    const giftNote = toNonEmptyString(formData.get('giftNote'))
    const referrer = toNonEmptyString(formData.get('referrer'))
    const isOrderInquiry = toNonEmptyString(formData.get('isOrderForm')) === 'true'
    const designImageEntry = formData.get('designImage')
    const designImage = designImageEntry instanceof File && designImageEntry.size > 0
      ? designImageEntry
      : null

    const productTypeValue = toNonEmptyString(formData.get('productType'))
    const normalizedProductType = resolveInlineOrderProductType(productTypeValue)
    const orderTypeRaw = toNonEmptyString(formData.get('orderType'))
    const normalizedIncomingOrderType = normalizeInlineOrderType(orderTypeRaw)
    const productId = toNonEmptyString(formData.get('productId'))
    const productName = toNonEmptyString(formData.get('productName'))
    const totalPrice = toPositiveNumber(formData.get('totalPrice'))
    const hasLegacyProductType = isLegacyOrderProductType(productTypeValue)
    const hasProductId = productId.length > 0 || hasLegacyProductType
    const hasCompactOrderPayload = Boolean(normalizedProductType) && hasProductId && productName.length > 0 && totalPrice !== null
    const requestModeRaw = toNonEmptyString(formData.get('requestMode'))
    const designTypeRaw = toNonEmptyString(formData.get('designType'))
    const occasion = toNonEmptyString(formData.get('occasion'))
    const filling = toNonEmptyString(formData.get('filling'))
    const servings = toNonEmptyString(formData.get('servings'))
    const customerMessage = toNonEmptyString(formData.get('customerMessage'))
    const requestMode: InlineOrderRequestMode = isInlineOrderRequestMode(requestModeRaw)
      ? requestModeRaw
      : 'message'
    const designType: InlineOrderDesignType = isInlineOrderDesignType(designTypeRaw)
      ? designTypeRaw
      : 'standard'

    const validationResult = await validateRequest(contactFormSchema, {
      name,
      email,
      phone,
      message: message.length > 0 ? message : undefined,
      address: address || undefined,
      city: city || undefined,
      postcode: postcode || undefined,
      dateNeeded: dateNeeded || undefined,
      cakeInterest: cakeInterest || undefined,
      isOrderForm: isOrderInquiry
    })

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatValidationErrors(validationResult.errors) },
        { status: 400 }
      )
    }

    if (isOrderInquiry && hasCompactOrderPayload) {
      if (normalizedProductType === 'gift-hamper') {
        const postalOrderAddressErrors = getPostalOrderAddressValidationErrors(address, city, postcode)

        if (postalOrderAddressErrors.length > 0) {
          return NextResponse.json(
            { error: 'Validation failed', details: postalOrderAddressErrors.join(', ') },
            { status: 400 }
          )
        }
      }

      const giftNoteErrors = getInlineGiftNoteValidationErrors(giftNote)
      if (giftNoteErrors.length > 0) {
        return NextResponse.json(
          { error: 'Validation failed', details: giftNoteErrors.join(', ') },
          { status: 400 }
        )
      }
    }

    if (designImage) {
      const imageError = getDesignImageError(designImage)
      if (imageError) {
        return NextResponse.json(
          { error: imageError },
          { status: 400 }
        )
      }
    }

    const emailMode = getEmailTransportMode()
    const imageBuffer = designImage ? await designImage.arrayBuffer() : null
    const isLegacyOrderInquiry = isOrderInquiry && !hasCompactOrderPayload

    if (isLegacyOrderInquiry) {
      logger.warn('Legacy order inquiry payload received without compact inline order fields', {
        isOrderInquiry,
        missingCompactFields: {
          productType: normalizedProductType === null,
          productId: !hasProductId,
          productName: productName.length === 0,
          totalPrice: totalPrice === null
        }
      })
    }

    if (!isOrderInquiry || isLegacyOrderInquiry) {
      const adminEmailResult = await sendEmail({
        templateId: 'contact-admin-inquiry',
        input: {
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          address: address || undefined,
          city: city || undefined,
          postcode: postcode || undefined,
          dateNeeded: dateNeeded || undefined,
          cakeInterest: cakeInterest || undefined,
          message: message || undefined,
          note: note || undefined,
          giftNote: giftNote || undefined,
          referrer: referrer || undefined,
          attachmentNames: designImage ? [designImage.name] : [],
          titleOverride: isLegacyOrderInquiry ? `New Order Inquiry: ${name}` : `New Contact: ${name}`
        },
        modeOverride: emailMode,
        message: {
          from: 'Olgish Cakes <hello@olgishcakes.co.uk>',
          to: recipientEmail,
          bcc: process.env.ADMIN_BCC_EMAIL || undefined,
          replyTo: email,
          attachments: designImage && imageBuffer
            ? [
                {
                  filename: designImage.name,
                  content: Buffer.from(imageBuffer)
                }
              ]
            : []
        }
      })

      if (!adminEmailResult.accepted || adminEmailResult.error) {
        throw new Error(adminEmailResult.error?.message || 'Transport did not accept admin email')
      }

      return NextResponse.json({ success: true })
    }

    let orderCreated = false
    let orderError: unknown = null

    try {
      let attachmentImages: SanityImageReference[] = []
      if (designImage && imageBuffer) {
        try {
          const uploaded = await serverClient.assets.upload('image', Buffer.from(imageBuffer), {
            filename: designImage.name,
            contentType: designImage.type
          })

          attachmentImages = [
            {
              _type: 'image',
              asset: { _type: 'reference', _ref: uploaded._id }
            }
          ]
        } catch (uploadError) {
          logger.error('Failed to upload design image to Sanity', {
            error: uploadError
          })
        }
      }

      const resolvedProductType: InlineOrderProductType = normalizedProductType || 'cake'
      const resolvedOrderType = resolveInlineOrderType({
        productType: resolvedProductType,
        normalizedIncomingOrderType,
        requestMode
      })
      const inferredDeliveryMethod = resolvedProductType === 'gift-hamper'
        ? 'postal'
        : 'collection'
      const inferredPaymentMethod = resolvedProductType === 'gift-hamper'
        ? 'card'
        : 'cash-collection'
      const inferredDeliveryAddress = buildDeliveryAddress(address, city, postcode)
      const designTypeLabel = normalizeDesignTypeLabel(designType)
      const resolvedCustomerMessage = customerMessage.length > 0
        ? customerMessage
        : message

      const orderNumber = generateOrderNumber()
      const orderDoc = {
        _type: 'order',
        orderNumber,
        status: 'new',
        orderType: resolvedOrderType,
        customer: {
          name,
          email,
          phone,
          address: address || '',
          city: city || '',
          postcode: postcode || ''
        },
        items: [
          {
            _key: generateUniqueKey('item'),
            productId,
            productName,
            productType: resolvedProductType,
            designType,
            quantity: 1,
            unitPrice: totalPrice || 0,
            totalPrice: totalPrice || 0,
            size: servings,
            flavor: filling,
            specialInstructions: resolvedCustomerMessage
          }
        ],
        delivery: {
          dateNeeded: dateNeeded || null,
          deliveryMethod: inferredDeliveryMethod,
          deliveryAddress: inferredDeliveryAddress,
          deliveryNotes: '',
          giftNote: giftNote || ''
        },
        pricing: {
          subtotal: totalPrice || 0,
          deliveryFee: 0,
          discount: 0,
          total: totalPrice || 0,
          paymentStatus: 'pending',
          paymentMethod: inferredPaymentMethod
        },
        messages: [
          {
            _key: generateUniqueKey('msg'),
            message: message || 'Order created via inline form',
            attachments: attachmentImages
          }
        ],
        notes: [],
        metadata: {
          source: 'website-inline-v2',
          orderSourceVersion: 'v2-inline',
          referrer,
          userAgent: request.headers.get('user-agent') || '',
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          inlineOrderContext: {
            occasion: occasion || undefined,
            requestMode,
            designType,
            filling: filling || undefined,
            servings: servings || undefined,
            customerMessage: resolvedCustomerMessage || undefined
          }
        }
      }

      const createdOrder = await serverClient.create(orderDoc)
      orderCreated = true
      const emailAttemptedAt = new Date().toISOString()

      let customerEmailSent = false
      let adminEmailSent = false
      let customerEmailError = ''
      let adminEmailError = ''

      const customerEmailResult = await sendEmail({
        templateId: 'contact-inline-order-customer',
        input: {
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          address: address || undefined,
          city: city || undefined,
          postcode: postcode || undefined,
          orderNumber,
          orderType: resolvedOrderType,
          productName,
          productId,
          productType: resolvedProductType,
          quantity: 1,
          unitPrice: totalPrice || 0,
          totalPrice: totalPrice || 0,
          dateNeeded: dateNeeded || undefined,
          occasion: occasion || undefined,
          designType: designTypeLabel,
          filling: filling || undefined,
          servings: servings || undefined,
          customerMessage: resolvedCustomerMessage || undefined,
          giftNote: giftNote || undefined,
          deliveryMethod: inferredDeliveryMethod,
          deliveryAddress: inferredDeliveryAddress,
          paymentMethod: inferredPaymentMethod,
          referrer: referrer || undefined,
          titleOverride: `Order Confirmation #${orderNumber} - Olgish Cakes`
        },
        modeOverride: emailMode,
        message: {
          from: 'Olgish Cakes <hello@olgishcakes.co.uk>',
          to: email,
          bcc: getCustomerOrderEmailBcc()
        }
      })

      if (!customerEmailResult.accepted || customerEmailResult.error) {
        customerEmailError = customerEmailResult.error?.message || 'Transport did not accept customer email'
      } else {
        customerEmailSent = true
      }

      const adminEmailResult = await sendEmail({
        templateId: 'contact-inline-order-admin',
        input: {
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          address: address || undefined,
          city: city || undefined,
          postcode: postcode || undefined,
          orderNumber,
          orderType: resolvedOrderType,
          productName,
          productId,
          productType: resolvedProductType,
          quantity: 1,
          unitPrice: totalPrice || 0,
          totalPrice: totalPrice || 0,
          dateNeeded: dateNeeded || undefined,
          occasion: occasion || undefined,
          designType: designTypeLabel,
          filling: filling || undefined,
          servings: servings || undefined,
          customerMessage: resolvedCustomerMessage || undefined,
          deliveryMethod: inferredDeliveryMethod,
          deliveryAddress: inferredDeliveryAddress,
          paymentMethod: inferredPaymentMethod,
          referrer: referrer || undefined,
          message: message || undefined,
          note: note || undefined,
          giftNote: giftNote || undefined,
          attachmentNames: designImage ? [designImage.name] : [],
          titleOverride: `New inline order #${orderNumber} from ${name}`
        },
        modeOverride: emailMode,
        message: {
          from: 'Olgish Cakes <hello@olgishcakes.co.uk>',
          to: recipientEmail,
          bcc: process.env.ADMIN_BCC_EMAIL || undefined,
          replyTo: email,
          attachments: designImage && imageBuffer
            ? [
                {
                  filename: designImage.name,
                  content: Buffer.from(imageBuffer)
                }
              ]
            : []
        }
      })

      if (!adminEmailResult.accepted || adminEmailResult.error) {
        adminEmailError = adminEmailResult.error?.message || 'Transport did not accept admin email'
      } else {
        adminEmailSent = true
      }

      const metadataPatch: Record<string, unknown> = {
        'metadata.customerEmailSent': customerEmailSent,
        'metadata.adminEmailSent': adminEmailSent,
        'metadata.emailAttemptedAt': emailAttemptedAt
      }
      if (customerEmailError.length > 0) {
        metadataPatch['metadata.customerEmailError'] = customerEmailError
      }
      if (adminEmailError.length > 0) {
        metadataPatch['metadata.adminEmailError'] = adminEmailError
      }

      await serverClient
        .patch(createdOrder._id)
        .set(metadataPatch)
        .commit()
    } catch (creationError) {
      orderError = creationError
      logger.error('Exception while creating inline order', creationError)
    }

    if (!orderCreated && orderError) {
      const fallbackProductType: InlineOrderProductType = isInlineOrderProductType(productTypeValue) || isLegacyOrderProductType(productTypeValue)
        ? (productTypeValue === 'gift-hamper' ? 'gift-hamper' : 'cake')
        : 'cake'
      const fallbackOrderType = resolveInlineOrderType({
        productType: fallbackProductType,
        normalizedIncomingOrderType,
        requestMode
      })
      const fallbackDeliveryMethod = fallbackProductType === 'gift-hamper' ? 'postal' : 'collection'
      const fallbackPaymentMethod = fallbackProductType === 'gift-hamper' ? 'card' : 'cash-collection'
      const fallbackDeliveryAddress = buildDeliveryAddress(address, city, postcode)
      const fallbackDesignTypeLabel = normalizeDesignTypeLabel(designType)

      const adminFallbackResponse = await sendEmail({
        templateId: 'contact-inline-order-fallback-admin',
        input: {
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          address: address || undefined,
          city: city || undefined,
          postcode: postcode || undefined,
          orderType: fallbackOrderType,
          productName: productName || undefined,
          productId: productId || undefined,
          productType: fallbackProductType,
          quantity: 1,
          unitPrice: totalPrice || 0,
          totalPrice: totalPrice || 0,
          dateNeeded: dateNeeded || undefined,
          occasion: occasion || undefined,
          designType: fallbackDesignTypeLabel,
          filling: filling || undefined,
          servings: servings || undefined,
          customerMessage: customerMessage || undefined,
          deliveryMethod: fallbackDeliveryMethod,
          deliveryAddress: fallbackDeliveryAddress,
          paymentMethod: fallbackPaymentMethod,
          referrer: referrer || undefined,
          message: message || undefined,
          note: note || undefined,
          giftNote: giftNote || undefined,
          attachmentNames: designImage ? [designImage.name] : [],
          titleOverride: `New Order Inquiry from ${name}`
        },
        modeOverride: emailMode,
        message: {
          from: 'Olgish Cakes <hello@olgishcakes.co.uk>',
          to: recipientEmail,
          bcc: process.env.ADMIN_BCC_EMAIL || undefined,
          replyTo: email,
          attachments: designImage && imageBuffer
            ? [
                {
                  filename: designImage.name,
                  content: Buffer.from(imageBuffer)
                }
              ]
            : []
        }
      })

      if (adminFallbackResponse.error) {
        logger.error('Fallback admin email failed', adminFallbackResponse.error)
      }

      const customerFallbackResponse = await sendEmail({
        templateId: 'contact-inline-order-fallback-customer',
        input: {
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          dateNeeded: dateNeeded || undefined,
          occasion: occasion || undefined,
          designType: fallbackDesignTypeLabel,
          filling: filling || undefined,
          servings: servings || undefined,
          customerMessage: customerMessage || undefined,
          giftNote: giftNote || undefined,
          titleOverride: 'Order Inquiry Received - Olgish Cakes'
        },
        modeOverride: emailMode,
        message: {
          from: 'Olgish Cakes <hello@olgishcakes.co.uk>',
          to: email,
          bcc: getCustomerOrderEmailBcc()
        }
      })

      if (customerFallbackResponse.error) {
        logger.error('Fallback customer email failed', customerFallbackResponse.error)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Contact API Error', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}

export const POST = withRateLimit(handlePOST, {
  windowMs: 60 * 1000,
  maxRequests: 10
})
