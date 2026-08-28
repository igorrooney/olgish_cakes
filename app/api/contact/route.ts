import { logger } from '@/lib/logger'
import { resolveCanonicalOrderType } from '@/lib/order-types'
import { generateOrderNumber, generateUniqueKey } from '@/lib/order-utils'
import { withRateLimit } from '@/lib/rate-limit'
import { formatRequestIpLocation, getRequestIpLocation } from '@/lib/request-location'
import { validateCsrfToken } from '@/lib/csrf'
import { getCustomerEmailBcc } from '@/lib/email/customer-bcc'
import { BUSINESS_CONSTANTS } from '@/lib/constants'
import { getEmailTransportMode, requiresLiveEmailConfiguration, sendEmail } from '@/lib/email/service'
import { readRequiredFormData } from '@/lib/form-request'
import { sendTelegramManagerNotification } from '@/lib/notifications/telegram'
import { CURRENT_TERMS_VERSION } from '@/lib/legal/legal-config'
import { getTermsEmailAttachment } from '@/lib/legal/terms-document'
import {
  createSupabaseOrder,
  updateSupabaseOrderMetadata
} from '@/lib/orders/supabase-orders'
import { getSupabaseAdminClient } from '@/lib/supabase-admin-client'
import { getCustomCakeStorageBucket } from '@/lib/storage-buckets'
import { contactFormSchema, formatValidationErrors, validateRequest } from '@/lib/validation'
import type { OrderMessageAttachment } from '@/types/order'
import { NextRequest, NextResponse } from 'next/server'
import {
  createSensitiveDataConsentEvidence,
  parseDietaryHealthConsent
} from '@/lib/legal/sensitive-data-consent'
import { toSafeOperationalError } from '@/lib/security/safe-operational-error'

const recipientEmail = process.env.CONTACT_EMAIL_TO || 'hello@olgishcakes.co.uk'
const contactEnquiriesTable = 'contact_enquiries'

type InlineOrderProductType = 'cake' | 'gift-hamper'
type InlineOrderRequestMode = 'message' | 'custom-design'
type InlineOrderDesignType = 'standard' | 'individual'
type InlineOrderSourceType = 'browse-catalog' | 'custom-design' | 'wedding-cake' | 'gift-hamper' | 'custom-quote' | 'custom-cake' | 'cakes-by-post'

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
  dietaryHealthInformation: string | null
  dietaryHealthConsent: boolean
  dietaryHealthConsentVersion: string | null
  dietaryHealthConsentedAt: string | null
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
  return getCustomerEmailBcc(configuredBcc)
}

function isInlineOrderRequestMode(value: string): value is InlineOrderRequestMode {
  return value === 'message' || value === 'custom-design'
}

function isInlineOrderDesignType(value: string): value is InlineOrderDesignType {
  return value === 'standard' || value === 'individual'
}

const inlineOrderTypeNormalizationMap: Record<string, InlineOrderSourceType> = {
  'browse-catalog': 'browse-catalog',
  'browse our catalog': 'browse-catalog',
  'custom-design': 'custom-design',
  'custom design': 'custom-design',
  'wedding-cake': 'wedding-cake',
  'wedding cake': 'wedding-cake',
  'gift-hamper': 'gift-hamper',
  'gift hamper': 'gift-hamper',
  'cakes-by-post': 'cakes-by-post',
  'cakes by post': 'cakes-by-post',
  'custom-cake': 'custom-cake',
  'custom cake': 'custom-cake',
  'custom-quote': 'custom-quote',
  'custom quote': 'custom-quote'
}

function normalizeInlineOrderType(value: string): InlineOrderSourceType | null {
  const normalizedValue = value.trim().toLowerCase()
  if (normalizedValue.length === 0) {
    return null
  }

  return inlineOrderTypeNormalizationMap[normalizedValue] || null
}

function resolveInlineSourceOrderType(params: {
  productType: InlineOrderProductType
  normalizedIncomingOrderType: InlineOrderSourceType | null
  requestMode: InlineOrderRequestMode
}): InlineOrderSourceType {
  if (params.normalizedIncomingOrderType) {
    return params.normalizedIncomingOrderType
  }

  if (params.productType === 'gift-hamper') {
    return 'gift-hamper'
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

function normalizeDisplayLabel(value: string): string {
  const trimmedValue = value.trim()
  if (trimmedValue.length === 0 || /[A-Z]/.test(trimmedValue)) {
    return trimmedValue
  }

  return trimmedValue
    .replace(/[-_]+/g, ' ')
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase())
}

function isGeneratedProductSummary(value: string | undefined): boolean {
  const normalizedValue = value?.trim().toLowerCase() || ''

  return normalizedValue.includes('product:') &&
    normalizedValue.includes('product type:') &&
    normalizedValue.includes('price:')
}

function extractExplicitCustomerMessage(value: string | undefined): string | undefined {
  const lines = value?.split(/\r?\n/) || []
  const messageLine = lines.find((line) => {
    const normalizedLine = line.trim().toLowerCase()
    return normalizedLine.startsWith('message:') ||
      normalizedLine.startsWith('customer message:') ||
      normalizedLine.startsWith('requirements:')
  })

  if (!messageLine) {
    return undefined
  }

  return messageLine.replace(/^(message|customer message|requirements):\s*/i, '').trim() || undefined
}

function resolveInlineCustomerMessage(...values: string[]): string {
  for (const value of values) {
    const explicitMessage = extractExplicitCustomerMessage(value)
    if (explicitMessage) {
      const resolvedExplicitMessage = resolveInlineCustomerMessage(explicitMessage)
      if (resolvedExplicitMessage.length > 0) {
        return resolvedExplicitMessage
      }
    }

    const trimmedValue = value.trim()
    const normalizedValue = trimmedValue.toLowerCase()

    if (
      trimmedValue.length > 0 &&
      normalizedValue !== 'message' &&
      normalizedValue !== 'test message' &&
      !isGeneratedProductSummary(trimmedValue)
    ) {
      return trimmedValue
    }
  }

  return ''
}

const cakeRequestIntro = 'Thank you. We\'ve received your cake request. We\'ll reply as soon as we can.'
const cakeRequestPriceLabel = 'Estimated price'
const cakeRequestNextSteps = [
  'We\'ll review your requested date and the structured order details. We\'ll reply as soon as we can.',
  'If we can accept your request, we\'ll personally confirm availability, final details and price in writing.',
  'Nothing is booked or payable until you accept our final written offer or make the requested payment.'
]

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

function containsControlCharacter(value: string): boolean {
  return Array.from(value).some((character) => {
    const code = character.charCodeAt(0)
    return code <= 31 || code === 127
  })
}

function getPostalOrderRecipientNameValidationErrors(recipientName: string) {
  const errors: string[] = []

  if (recipientName.length === 0) {
    errors.push('recipientName: Recipient name is required for cakes by post orders')
  } else if (recipientName.length < 2) {
    errors.push('recipientName: Recipient name must be at least 2 characters')
  } else if (recipientName.length > 100) {
    errors.push('recipientName: Recipient name must be 100 characters or fewer')
  }

  if (containsControlCharacter(recipientName)) {
    errors.push('recipientName: Recipient name cannot contain control characters')
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
  const bucket = getCustomCakeStorageBucket()
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
    throw Object.assign(new Error('Failed to upload order reference image'), {
      code: 'STORAGE_UPLOAD_FAILED'
    })
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

function logContactEnquiryInsertFailure(error: unknown) {
  logger.error('Contact enquiry insert failed', {
    operation: 'contact_enquiries.insert',
    ...toSafeOperationalError(error)
  })
}

function isSupabaseAdminClientConfigured() {
  const supabaseUrl = process.env.SUPABASE_URL?.trim()
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

  return Boolean(supabaseUrl && supabaseServiceRoleKey)
}

async function saveContactEnquiry(params: ContactEnquiryInsertParams): Promise<string | null> {
  if (!isSupabaseAdminClientConfigured()) {
    logger.warn('Skipping contact enquiry persistence because Supabase admin client is not configured', {
      operation: 'contact_enquiries.insert',
      code: 'CLIENT_NOT_CONFIGURED'
    })
    return null
  }

  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
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
        : null,
      dietary_health_information: params.dietaryHealthInformation,
      dietary_health_consent: params.dietaryHealthConsent,
      dietary_health_consent_version: params.dietaryHealthConsentVersion,
      dietary_health_consented_at: params.dietaryHealthConsentedAt,
      dietary_health_withdrawn_at: null
    })
    .select('id')
    .single()

  if (error) {
    logContactEnquiryInsertFailure(error)
    throw new Error('Failed to save contact enquiry')
  }

  return String(data.id)
}

async function handlePOST(request: NextRequest) {
  try {
    const formDataResult = await readRequiredFormData(request)
    if (!formDataResult.ok) {
      return formDataResult.response
    }

    const { formData } = formDataResult
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

    const emailMode = getEmailTransportMode()
    if (requiresLiveEmailConfiguration(emailMode) && !process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
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
    const recipientName = toNonEmptyString(formData.get('recipientName'))
    const dateNeeded = toNonEmptyString(formData.get('dateNeeded'))
    const cakeInterest = toNonEmptyString(formData.get('cakeInterest'))
    const note = toNonEmptyString(formData.get('note'))
    const giftNote = toNonEmptyString(formData.get('giftNote'))
    const referrer = toNonEmptyString(formData.get('referrer'))
    const dietaryHealthInformation = toNonEmptyString(formData.get('dietaryHealthInformation'))
    const dietaryHealthConsent = parseDietaryHealthConsent(formData.get('dietaryHealthConsent'))
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
      note: note || undefined,
      giftNote: giftNote || undefined,
      referrer: referrer || undefined,
      dietaryHealthInformation: dietaryHealthInformation || undefined,
      dietaryHealthConsent,
      isOrderForm: isOrderInquiry
    })

    if (!validationResult.success) {
      const fieldErrors = validationResult.errors.flatten().fieldErrors
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: formatValidationErrors(validationResult.errors),
          fieldErrors
        },
        { status: 400 }
      )
    }

    const sensitiveDataEvidence = createSensitiveDataConsentEvidence(
      validationResult.data.dietaryHealthInformation,
      validationResult.data.dietaryHealthConsent === true
    )
    const hasDietaryHealthInformation =
      sensitiveDataEvidence.dietaryHealthInformation !== null

    if (isOrderInquiry && hasCompactOrderPayload) {
      const compactOrderValidationErrors: string[] = []

      if (normalizedProductType === 'gift-hamper') {
        compactOrderValidationErrors.push(
          ...getPostalOrderRecipientNameValidationErrors(recipientName),
          ...getPostalOrderAddressValidationErrors(address, city, postcode)
        )
      }

      const giftNoteErrors = getInlineGiftNoteValidationErrors(giftNote)
      compactOrderValidationErrors.push(...giftNoteErrors)
      if (compactOrderValidationErrors.length > 0) {
        return NextResponse.json(
          { error: 'Validation failed', details: compactOrderValidationErrors.join(', ') },
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

    const imageBuffer = designImage ? await designImage.arrayBuffer() : null
    const isLegacyOrderInquiry = isOrderInquiry && !hasCompactOrderPayload

    if (isLegacyOrderInquiry) {
      logger.warn('Legacy order inquiry payload received without compact inline order fields', {
        operation: 'contact.legacy-order-payload',
        code: 'COMPACT_FIELDS_MISSING'
      })
    }

    if (!isOrderInquiry) {
      let enquiryReference: string | null = null
      let adminEmailAccepted = false
      let customerEmailAccepted = false
      const contactEmailInput = {
        customerName: name,
        customerEmail: email,
        customerPhone: normalizedPhone,
        orderType: 'custom-cake-enquiry',
        address: address || undefined,
        city: city || undefined,
        postcode: postcode || undefined,
        dateNeeded: dateNeeded || undefined,
        cakeInterest: cakeInterest || undefined,
        referrer: referrer || undefined,
        nextSteps: [
          'We\'ll review the information stored securely with your enquiry.',
          'We\'ll reply with the next practical step as soon as we can.'
        ]
      }

      try {
        enquiryReference = await saveContactEnquiry({
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
          attachmentNames: designImage ? [designImage.name] : [],
          ...sensitiveDataEvidence
        })
      } catch (persistenceError) {
        logger.error('Contact enquiry persistence failed', {
          operation: 'contact_enquiries.insert',
          ...toSafeOperationalError(persistenceError)
        })

        return NextResponse.json(
          {
            error: hasDietaryHealthInformation
              ? 'We could not securely save the health-related information. Please try again.'
              : 'Failed to send email'
          },
          { status: 500 }
        )
      }

      if (!enquiryReference) {
        return NextResponse.json(
          {
            error: hasDietaryHealthInformation
              ? 'We could not securely save the health-related information. Please try again.'
              : 'Failed to send email'
          },
          { status: 500 }
        )
      }

      await sendTelegramManagerNotification({
        type: 'contact-enquiry',
        recordReference: enquiryReference,
        dateNeeded: dateNeeded || undefined,
        imageCount: designImage ? 1 : 0,
        adminPath: `/admin/enquiries/contact/${enquiryReference}`
      })

      try {
        const adminEmailResult = await sendEmail({
          templateId: 'contact-admin-inquiry',
          input: {
            ...contactEmailInput,
            orderType: undefined,
            hasDietaryHealthInformation,
            adminUrl: `${BUSINESS_CONSTANTS.BASE_URL}/admin/enquiries/contact/${enquiryReference}`,
            titleOverride: `New Contact: ${name}`
          },
          modeOverride: emailMode,
          message: {
            from: 'Olgish Cakes <hello@olgishcakes.co.uk>',
            to: recipientEmail,
            bcc: process.env.ADMIN_BCC_EMAIL || undefined,
            replyTo: email,
            attachments: []
          }
        })

        if (!adminEmailResult.accepted || adminEmailResult.error) {
          logger.error('Contact enquiry admin email failed after persistence', {
            operation: 'contact_enquiry.admin_email',
            recordReference: enquiryReference,
            ...(adminEmailResult.error
              ? toSafeOperationalError(adminEmailResult.error)
              : { code: 'EMAIL_NOT_ACCEPTED' })
          })
        } else {
          adminEmailAccepted = true
        }
      } catch (emailError) {
        logger.error('Contact enquiry admin email failed after persistence', {
          operation: 'contact_enquiry.admin_email',
          recordReference: enquiryReference,
          ...toSafeOperationalError(emailError)
        })
      }

      try {
        const customerEmailResult = await sendEmail({
          templateId: 'contact-customer-confirmation',
          input: contactEmailInput,
          modeOverride: emailMode,
          message: {
            from: 'Olgish Cakes <hello@olgishcakes.co.uk>',
            to: email,
            bcc: getCustomerEmailBcc(process.env.ADMIN_BCC_EMAIL),
            replyTo: recipientEmail,
            attachments: []
          }
        })

        if (!customerEmailResult.accepted || customerEmailResult.error) {
          logger.error('Contact enquiry customer email failed after persistence', {
            operation: 'contact_enquiry.customer_email',
            recordReference: enquiryReference,
            ...(customerEmailResult.error
              ? toSafeOperationalError(customerEmailResult.error)
              : { code: 'EMAIL_NOT_ACCEPTED' })
          })
        } else {
          customerEmailAccepted = true
        }
      } catch (emailError) {
        logger.error('Contact enquiry customer email failed after persistence', {
          operation: 'contact_enquiry.customer_email',
          recordReference: enquiryReference,
          ...toSafeOperationalError(emailError)
        })
      }

      if (!adminEmailAccepted) {
        logger.error('Contact enquiry admin email delivery incomplete', {
          operation: 'contact_enquiry.admin_email',
          recordReference: enquiryReference,
          code: customerEmailAccepted
            ? 'ADMIN_EMAIL_NOT_ACCEPTED_CUSTOMER_ACCEPTED'
            : 'ADMIN_EMAIL_NOT_ACCEPTED'
        })
      }

      return NextResponse.json({ success: true })
    }

    if (isLegacyOrderInquiry) {
      let legacyEnquiryReference: string | null = null

      try {
        legacyEnquiryReference = await saveContactEnquiry({
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
          attachmentNames: designImage ? [designImage.name] : [],
          ...sensitiveDataEvidence
        })
      } catch (persistenceError) {
        logger.error('Legacy order enquiry persistence failed', {
          operation: 'legacy_order.persistence',
          ...toSafeOperationalError(persistenceError)
        })
        return NextResponse.json(
          {
            error: hasDietaryHealthInformation
              ? 'We could not securely save the health-related information. Please try again.'
              : 'Failed to send email'
          },
          { status: 500 }
        )
      }

      if (!legacyEnquiryReference) {
        return NextResponse.json(
          {
            error: hasDietaryHealthInformation
              ? 'We could not securely save the health-related information. Please try again.'
              : 'Failed to send email'
          },
          { status: 500 }
        )
      }

      await sendTelegramManagerNotification({
        type: 'contact-enquiry',
        recordReference: legacyEnquiryReference,
        dateNeeded: dateNeeded || undefined,
        imageCount: designImage ? 1 : 0,
        adminPath: `/admin/enquiries/contact/${legacyEnquiryReference}`
      })

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
          referrer: referrer || undefined,
          hasDietaryHealthInformation,
          adminUrl: `${BUSINESS_CONSTANTS.BASE_URL}/admin/enquiries/contact/${legacyEnquiryReference}`,
          titleOverride: `New Order Inquiry: ${name}`
        },
        modeOverride: emailMode,
        message: {
          from: 'Olgish Cakes <hello@olgishcakes.co.uk>',
          to: recipientEmail,
          bcc: process.env.ADMIN_BCC_EMAIL || undefined,
          replyTo: email,
          attachments: []
        }
      })

      if (!adminEmailResult.accepted || adminEmailResult.error) {
        logger.error('Legacy order admin email failed', {
          operation: 'legacy_order.admin_email',
          ...(adminEmailResult.error
            ? toSafeOperationalError(adminEmailResult.error)
            : { code: 'EMAIL_NOT_ACCEPTED' })
        })
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    let orderCreated = false
    let orderError: unknown = null
    const requestIpLocation = getRequestIpLocation(request.headers)
    const approximateSubmittedFrom = formatRequestIpLocation(requestIpLocation)

    try {
      const resolvedProductType: InlineOrderProductType = normalizedProductType || 'cake'
      const sourceOrderType = resolveInlineSourceOrderType({
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
      const resolvedOrderType = resolveCanonicalOrderType({
        orderType: sourceOrderType,
        productType: resolvedProductType,
        deliveryMethod: inferredDeliveryMethod
      })
      const inferredDeliveryAddress = buildDeliveryAddress(address, city, postcode)
      const isCakesByPostOrder = resolvedProductType === 'gift-hamper'
      const designTypeLabel = normalizeDesignTypeLabel(designType)
      const resolvedCustomerMessage = resolveInlineCustomerMessage(customerMessage, message)

      const orderNumber = generateOrderNumber()
      let attachmentImages: OrderMessageAttachment[] = []
      if (designImage && imageBuffer) {
        try {
          attachmentImages = [
            await uploadOrderReferenceImage(orderNumber, designImage, imageBuffer)
          ]
        } catch (uploadError) {
          logger.error('Failed to upload design image to Supabase', {
            operation: 'inline_order.reference_upload',
            recordReference: orderNumber,
            ...toSafeOperationalError(uploadError)
          })
        }
      }

      const adminUrl = `${BUSINESS_CONSTANTS.BASE_URL}/admin/orders/${orderNumber}`
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
          recipientName: isCakesByPostOrder ? recipientName : undefined,
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
          termsPresentedVersion: CURRENT_TERMS_VERSION,
          dietaryHealthInformation: sensitiveDataEvidence.dietaryHealthInformation,
          dietaryHealthConsent: sensitiveDataEvidence.dietaryHealthConsent,
          dietaryHealthConsentVersion: sensitiveDataEvidence.dietaryHealthConsentVersion,
          dietaryHealthConsentedAt: sensitiveDataEvidence.dietaryHealthConsentedAt,
          referrer,
          userAgent: request.headers.get('user-agent') || '',
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          ...(requestIpLocation ? { ipLocation: requestIpLocation } : {}),
          inlineOrderContext: {
            sourceOrderType,
            occasion: occasion || undefined,
            requestMode,
            designType,
            filling: filling || undefined,
            servings: servings || undefined,
            deliveryRecipientName: isCakesByPostOrder ? recipientName : undefined,
            customerMessage: resolvedCustomerMessage || undefined
          }
        }
      }

      const createdOrder = await createSupabaseOrder(orderDoc)
      orderCreated = true
      const emailAttemptedAt = new Date().toISOString()

      await sendTelegramManagerNotification({
        type: 'inline-order',
        recordReference: createdOrder.orderNumber,
        dateNeeded: dateNeeded || undefined,
        total: totalPrice || 0,
        imageCount: designImage ? 1 : 0,
        adminPath: `/admin/orders/${createdOrder.orderNumber}`
      })

      let customerEmailSent = false
      let adminEmailSent = false
      let customerEmailError = ''
      let adminEmailError = ''

      const termsAttachment = await getTermsEmailAttachment()
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
          priceLabel: isCakesByPostOrder ? undefined : cakeRequestPriceLabel,
          dateNeeded: dateNeeded || undefined,
          occasion: normalizeDisplayLabel(occasion) || undefined,
          designType: designTypeLabel,
          filling: filling || undefined,
          servings: servings || undefined,
          deliveryRecipientName: isCakesByPostOrder ? recipientName : undefined,
          deliveryMethod: inferredDeliveryMethod,
          deliveryAddress: inferredDeliveryAddress,
          paymentMethod: inferredPaymentMethod,
          approximateSubmittedFrom,
          referrer: referrer || undefined,
          intro: isCakesByPostOrder
            ? 'Thank you. We\'ve received your cakes by post request. We\'ll reply as soon as we can.'
            : cakeRequestIntro,
          nextSteps: isCakesByPostOrder ? undefined : cakeRequestNextSteps,
          titleOverride: `Order request received #${orderNumber} - Olgish Cakes`
        },
        modeOverride: emailMode,
        message: {
          from: 'Olgish Cakes <hello@olgishcakes.co.uk>',
          to: email,
          bcc: getCustomerOrderEmailBcc(),
          attachments: [termsAttachment]
        }
      })

      if (!customerEmailResult.accepted || customerEmailResult.error) {
        customerEmailError = toSafeOperationalError(customerEmailResult.error).code
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
          occasion: normalizeDisplayLabel(occasion) || undefined,
          designType: designTypeLabel,
          filling: filling || undefined,
          servings: servings || undefined,
          deliveryRecipientName: isCakesByPostOrder ? recipientName : undefined,
          deliveryMethod: inferredDeliveryMethod,
          deliveryAddress: inferredDeliveryAddress,
          paymentMethod: inferredPaymentMethod,
          approximateSubmittedFrom,
          referrer: referrer || undefined,
          hasDietaryHealthInformation,
          adminUrl,
          titleOverride: `New inline order #${orderNumber} from ${name}`
        },
        modeOverride: emailMode,
        message: {
          from: 'Olgish Cakes <hello@olgishcakes.co.uk>',
          to: recipientEmail,
          bcc: process.env.ADMIN_BCC_EMAIL || undefined,
          replyTo: email,
          attachments: []
        }
      })

      if (!adminEmailResult.accepted || adminEmailResult.error) {
        adminEmailError = toSafeOperationalError(adminEmailResult.error).code
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
      logger.error('Exception while creating inline order', {
        operation: 'inline_order.create',
        ...toSafeOperationalError(creationError)
      })
    }

    if (!orderCreated && orderError) {
      if (hasDietaryHealthInformation) {
        return NextResponse.json(
          { error: 'We could not securely save the health-related information. Please try again.' },
          { status: 500 }
        )
      }

      const fallbackProductType: InlineOrderProductType = isInlineOrderProductType(productTypeValue) || isLegacyOrderProductType(productTypeValue)
        ? (productTypeValue === 'gift-hamper' ? 'gift-hamper' : 'cake')
        : 'cake'
      const fallbackSourceOrderType = resolveInlineSourceOrderType({
        productType: fallbackProductType,
        normalizedIncomingOrderType,
        requestMode
      })
      const fallbackDeliveryMethod = fallbackProductType === 'gift-hamper' ? 'postal' : 'collection'
      const fallbackPaymentMethod = fallbackProductType === 'gift-hamper' ? 'card' : 'cash-collection'
      const fallbackOrderType = resolveCanonicalOrderType({
        orderType: fallbackSourceOrderType,
        productType: fallbackProductType,
        deliveryMethod: fallbackDeliveryMethod
      })
      const fallbackDeliveryAddress = buildDeliveryAddress(address, city, postcode)
      const isFallbackCakesByPostOrder = fallbackProductType === 'gift-hamper'
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
          occasion: normalizeDisplayLabel(occasion) || undefined,
          designType: fallbackDesignTypeLabel,
          filling: filling || undefined,
          servings: servings || undefined,
          deliveryRecipientName: isFallbackCakesByPostOrder ? recipientName : undefined,
          deliveryMethod: fallbackDeliveryMethod,
          deliveryAddress: fallbackDeliveryAddress,
          paymentMethod: fallbackPaymentMethod,
          approximateSubmittedFrom,
          referrer: referrer || undefined,
          titleOverride: 'New order inquiry'
        },
        modeOverride: emailMode,
        message: {
          from: 'Olgish Cakes <hello@olgishcakes.co.uk>',
          to: recipientEmail,
          bcc: process.env.ADMIN_BCC_EMAIL || undefined,
          replyTo: email,
          attachments: []
        }
      })

      if (!adminFallbackResponse.accepted || adminFallbackResponse.error) {
        logger.error('Fallback admin email failed', {
          operation: 'inline_order.fallback_admin_email',
          ...toSafeOperationalError(adminFallbackResponse.error)
        })
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
      }

      const customerFallbackResponse = await sendEmail({
        templateId: 'contact-inline-order-fallback-customer',
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
          priceLabel: isFallbackCakesByPostOrder ? undefined : cakeRequestPriceLabel,
          dateNeeded: dateNeeded || undefined,
          occasion: normalizeDisplayLabel(occasion) || undefined,
          designType: fallbackDesignTypeLabel,
          filling: filling || undefined,
          servings: servings || undefined,
          deliveryRecipientName: isFallbackCakesByPostOrder ? recipientName : undefined,
          deliveryMethod: fallbackDeliveryMethod,
          deliveryAddress: fallbackDeliveryAddress,
          paymentMethod: fallbackPaymentMethod,
          approximateSubmittedFrom,
          intro: isFallbackCakesByPostOrder
            ? 'Thank you. We\'ve received your cakes by post request. We\'ll reply as soon as we can.'
            : cakeRequestIntro,
          nextSteps: isFallbackCakesByPostOrder ? undefined : cakeRequestNextSteps,
          titleOverride: 'Order request received - Olgish Cakes'
        },
        modeOverride: emailMode,
        message: {
          from: 'Olgish Cakes <hello@olgishcakes.co.uk>',
          to: email,
          bcc: getCustomerOrderEmailBcc()
        }
      })

      if (!customerFallbackResponse.accepted || customerFallbackResponse.error) {
        logger.error('Fallback customer email failed', {
          operation: 'inline_order.fallback_customer_email',
          ...toSafeOperationalError(customerFallbackResponse.error)
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Contact API Error', {
      operation: 'contact_api.handle',
      ...toSafeOperationalError(error)
    })
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}

export const POST = withRateLimit(handlePOST, {
  distributedScope: 'contact-enquiry',
  windowMs: 60 * 1000,
  maxRequests: 10
})
