import { logger } from '@/lib/logger'
import { generateOrderNumber, generateUniqueKey } from '@/lib/order-utils'
import { withRateLimit } from '@/lib/rate-limit'
import { validateCsrfToken } from '@/lib/csrf'
import { getEmailTransportMode, requiresLiveEmailConfiguration, sendEmail } from '@/lib/email/service'
import { sendTelegramManagerNotification } from '@/lib/notifications/telegram'
import {
  createSupabaseOrder,
  updateSupabaseOrderMetadata
} from '@/lib/orders/supabase-orders'
import { getSupabaseAdminClient } from '@/lib/supabase-admin-client'
import { contactFormSchema, formatValidationErrors, validateRequest } from '@/lib/validation'
import type { OrderMessageAttachment } from '@/types/order'
import { NextRequest, NextResponse } from 'next/server'

const recipientEmail = process.env.CONTACT_EMAIL_TO || 'hello@olgishcakes.co.uk'
const contactEnquiriesTable = 'contact_enquiries'

type InlineOrderProductType = 'cake' | 'gift-hamper'
type InlineOrderRequestMode = 'message' | 'custom-design'
type InlineOrderDesignType = 'standard' | 'individual'
type InlineOrderType = 'browse-catalog' | 'custom-design' | 'wedding-cake' | 'gift-hamper' | 'custom-quote'

const ukPostcodePattern = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i

type ContactEnquiryInsertParams = {
  name: string
  email: string
  phone?: string
  address: string
  city: string
  postcode: string
  cakeInterest: string
  dateNeeded: string
  message: string
  note: string
  giftNote: string
  referrer: string
  attachmentNames: string[]
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

async function uploadOrderReferenceImage(orderNumber: string, file: File, imageBuffer: ArrayBuffer): Promise<OrderMessageAttachment> {
  const supabase = getSupabaseAdminClient()
  const bucket = process.env.SUPABASE_ENQUIRY_BUCKET || 'custom-cake-enquiries'
  const extension = file.name.includes('.') ? file.name.split('.').pop() : 'jpg'
  const safeName = file.name
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'reference'
  const path = `orders/${orderNumber}/references/${Date.now()}-${safeName}.${extension}`

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, imageBuffer, {
      contentType: file.type || 'image/jpeg',
      upsert: false
    })

  if (error) {
    throw new Error(`Failed to upload order reference image to Supabase Storage: ${error.message}`)
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
    alt: file.name || 'Uploaded reference image',
    caption: ''
  }
}

function buildContactEnquiryInsertHints(errorDetails: string) {
  const normalizedDetails = errorDetails.toLowerCase()
  const hints = new Set<string>([
    'Verify the contact_enquiries table exists in Supabase.',
    'Verify the table contains every column expected by the route insert payload.',
    'Verify the service-role key has insert permission for contact_enquiries.'
  ])

  if (normalizedDetails.includes('does not exist')) {
    hints.add('The table or one of the referenced columns may not exist yet.')
  }

  if (normalizedDetails.includes('column')) {
    hints.add('A missing or renamed column is a likely cause of this insert failure.')
  }

  if (normalizedDetails.includes('permission') || normalizedDetails.includes('policy')) {
    hints.add('Check database permissions or row-level security policies for this table.')
  }

  if (normalizedDetails.includes('invalid input syntax') || normalizedDetails.includes('type')) {
    hints.add('Check that the column data types match the values inserted by the route.')
  }

  if (normalizedDetails.includes('violates') || normalizedDetails.includes('constraint')) {
    hints.add('Check not-null, unique, or check constraints on contact_enquiries.')
  }

  return [...hints]
}

function logContactEnquiryInsertFailure(error: unknown) {
  const errorRecord = typeof error === 'object' && error !== null
    ? error as Record<string, unknown>
    : null
  const details = JSON.stringify(errorRecord ?? error)

  logger.error('Contact enquiry insert failed', {
    operation: 'contact_enquiries.insert',
    table: contactEnquiriesTable,
    errorName: errorRecord?.name ?? null,
    errorCode: errorRecord?.code ?? null,
    errorMessage: errorRecord?.message ?? null,
    errorDetails: errorRecord?.details ?? null,
    errorHint: errorRecord?.hint ?? null,
    rawError: errorRecord ?? error,
    expectedColumns: [
      'full_name',
      'email',
      'phone',
      'address',
      'city',
      'postcode',
      'cake_interest',
      'date_needed',
      'message',
      'note',
      'gift_note',
      'referrer',
      'attachment_names'
    ],
    troubleshootingHints: buildContactEnquiryInsertHints(details)
  })
}

function isSupabaseAdminClientConfigured() {
  const supabaseUrl = process.env.SUPABASE_URL?.trim()
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

  return Boolean(supabaseUrl && supabaseServiceRoleKey)
}

async function saveContactEnquiry(params: ContactEnquiryInsertParams) {
  if (!isSupabaseAdminClientConfigured()) {
    logger.warn('Skipping contact enquiry persistence because Supabase admin client is not configured', {
      operation: 'contact_enquiries.insert',
      table: contactEnquiriesTable
    })
    return false
  }

  const supabase = getSupabaseAdminClient()
  const { error } = await supabase
    .from(contactEnquiriesTable)
    .insert({
      full_name: params.name,
      email: params.email,
      phone: params.phone || null,
      address: params.address || null,
      city: params.city || null,
      postcode: params.postcode || null,
      cake_interest: params.cakeInterest || null,
      date_needed: params.dateNeeded || null,
      message: params.message,
      note: params.note || null,
      gift_note: params.giftNote || null,
      referrer: params.referrer || null,
      attachment_names: params.attachmentNames.length > 0
        ? params.attachmentNames
        : null
    })

  if (error) {
    logContactEnquiryInsertFailure(error)
    throw new Error('Failed to save contact enquiry')
  }

  return true
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
    const submittedCsrfToken = toNonEmptyString(formData.get('csrfToken'))
    const cookieCsrfToken = request.cookies.get('csrf-token')?.value || ''

    if (!cookieCsrfToken || !submittedCsrfToken) {
      return NextResponse.json(
        { error: 'CSRF token missing' },
        { status: 403 }
      )
    }

    if (!validateCsrfToken(submittedCsrfToken, cookieCsrfToken)) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      )
    }

    const name = toNonEmptyString(formData.get('name'))
    const email = toNonEmptyString(formData.get('email'))
    const phone = toNonEmptyString(formData.get('phone'))
    const normalizedPhone = phone || undefined
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

    if (!isOrderInquiry) {
      let enquiryPersisted = false
      let adminEmailAccepted = false

      try {
        enquiryPersisted = await saveContactEnquiry({
          name,
          email,
          phone: normalizedPhone,
          address,
          city,
          postcode,
          cakeInterest,
          dateNeeded,
          message,
          note,
          giftNote,
          referrer,
          attachmentNames: designImage ? [designImage.name] : []
        })
      } catch (persistenceError) {
        logger.error('Continuing contact enquiry flow after persistence failure', {
          persistenceError,
          customerEmail: email,
          referrer: referrer || null
        })
      }

      if (enquiryPersisted) {
        await sendTelegramManagerNotification({
          type: 'contact-enquiry',
          customerName: name,
          customerEmail: email,
          customerPhone: normalizedPhone,
          dateNeeded: dateNeeded || undefined,
          productName: cakeInterest || undefined,
          messagePreview: message || note || giftNote,
          imageCount: designImage ? 1 : 0,
          adminPath: '/admin'
        })
      }

      try {
        const adminEmailResult = await sendEmail({
          templateId: 'contact-admin-inquiry',
          input: {
            customerName: name,
            customerEmail: email,
            customerPhone: normalizedPhone,
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
            titleOverride: `New Contact: ${name}`
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

        adminEmailAccepted = true
      } catch (emailError) {
        logger.error('Contact enquiry email failed after persistence', {
          emailError,
          customerEmail: email,
          referrer: referrer || null
        })
      }

      if (!enquiryPersisted && !adminEmailAccepted) {
        logger.error('Contact enquiry was not persisted or emailed', {
          customerEmail: email,
          referrer: referrer || null
        })
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    if (isLegacyOrderInquiry) {
      const adminEmailResult = await sendEmail({
        templateId: 'contact-admin-inquiry',
        input: {
          customerName: name,
          customerEmail: email,
          customerPhone: normalizedPhone,
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
          titleOverride: `New Order Inquiry: ${name}`
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
      let attachmentImages: OrderMessageAttachment[] = []
      if (designImage && imageBuffer) {
        try {
          attachmentImages = [
            await uploadOrderReferenceImage(orderNumber, designImage, imageBuffer)
          ]
        } catch (uploadError) {
          logger.error('Failed to upload design image to Supabase', {
            error: uploadError
          })
        }
      }

      const orderDoc = {
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
          dateNeeded: dateNeeded || undefined,
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

      const createdOrder = await createSupabaseOrder(orderDoc)
      orderCreated = true
      const emailAttemptedAt = new Date().toISOString()

      await sendTelegramManagerNotification({
        type: 'inline-order',
        customerName: name,
        customerEmail: email,
        customerPhone: normalizedPhone,
        dateNeeded: dateNeeded || undefined,
        productName,
        total: totalPrice || 0,
        messagePreview: resolvedCustomerMessage || note || giftNote,
        imageCount: designImage ? 1 : 0,
        adminPath: '/admin/orders'
      })

      let customerEmailSent = false
      let adminEmailSent = false
      let customerEmailError = ''
      let adminEmailError = ''

      const customerEmailResult = await sendEmail({
        templateId: 'contact-inline-order-customer',
        input: {
          customerName: name,
          customerEmail: email,
          customerPhone: normalizedPhone,
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
          customerPhone: normalizedPhone,
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
        customerEmailSent,
        adminEmailSent,
        emailAttemptedAt
      }
      if (customerEmailError.length > 0) {
        metadataPatch.customerEmailError = customerEmailError
      }
      if (adminEmailError.length > 0) {
        metadataPatch.adminEmailError = adminEmailError
      }

      await updateSupabaseOrderMetadata(createdOrder._id, createdOrder.metadata, metadataPatch)
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
          customerPhone: normalizedPhone,
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

      if (!adminFallbackResponse.accepted || adminFallbackResponse.error) {
        const adminFallbackError = adminFallbackResponse.error?.message || 'Transport did not accept admin fallback email'

        logger.error('Fallback admin email failed', adminFallbackError)
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
      }

      const customerFallbackResponse = await sendEmail({
        templateId: 'contact-inline-order-fallback-customer',
        input: {
          customerName: name,
          customerEmail: email,
          customerPhone: normalizedPhone,
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

      if (!customerFallbackResponse.accepted || customerFallbackResponse.error) {
        logger.error(
          'Fallback customer email failed',
          customerFallbackResponse.error?.message || 'Transport did not accept customer fallback email'
        )
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
