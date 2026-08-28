import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { BUSINESS_CONSTANTS } from '@/lib/constants'
import { validateCsrfToken } from '@/lib/csrf'
import {
  applyEnquiryRateLimitHeaders,
  getEnquiryRateLimitIdentifier,
  takeEnquiryRateLimit
} from '@/lib/enquiry-rate-limit'
import { getEmailTransportMode, requiresLiveEmailConfiguration, sendEmail } from '@/lib/email/service'
import { getCustomerEmailBcc } from '@/lib/email/customer-bcc'
import {
  createUnsupportedFormContentTypeResponse,
  isSupportedFormContentType,
  readRequiredFormData
} from '@/lib/form-request'
import { sendTelegramManagerNotification } from '@/lib/notifications/telegram'
import {
  getSupabaseAdminClient,
  type SupabaseAdminClient
} from '@/lib/supabase-admin-client'
import {
  addSensitiveDataConsentIssue,
  createSensitiveDataConsentEvidence,
  dietaryHealthConsentSchema,
  dietaryHealthInformationSchema,
  parseDietaryHealthConsent
} from '@/lib/legal/sensitive-data-consent'
import { logger } from '@/lib/logger'
import { toSafeOperationalError } from '@/lib/security/safe-operational-error'
import { getCustomCakeStorageBucket } from '@/lib/storage-buckets'

const recipientEmail = process.env.CONTACT_EMAIL_TO || 'hello@olgishcakes.co.uk'
const ukPostcodePattern = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i
const notificationFailureErrorMessage =
  'Enquiry saved but all operator notifications failed. Please contact Olgish Cakes directly.'

const getReferenceImageBucket = getCustomCakeStorageBucket

const defaultEmailFromAddress = 'Olgish Cakes <hello@olgishcakes.co.uk>'

const getEmailFromAddress = () => {
  const configuredEmailFromAddress = process.env.NEXT_PUBLIC_EMAIL_FROM?.trim()

  if (!configuredEmailFromAddress) {
    return defaultEmailFromAddress
  }

  if (configuredEmailFromAddress.includes('<') && configuredEmailFromAddress.includes('>')) {
    return configuredEmailFromAddress
  }

  return `Olgish Cakes <${configuredEmailFromAddress}>`
}

const referenceImageConfig = {
  acceptedTypes: ['image/jpeg', 'image/png', 'image/heic'],
  maxBytes: 5 * 1024 * 1024
}

const optionalTrimmedStringSchema = z.string().trim().optional()
const optionalEmailSchema = z.union([
  z.literal(''),
  z.string().trim().email('Invalid email address')
])
const optionalPhoneSchema = z.string().trim()
const dateNeededErrorMessage = 'Please select a valid date'
const datePastErrorMessage = 'Please select today or a future date'

const optionalPostcodeSchema = z
  .string()
  .trim()
  .refine((value) => value.length === 0 || ukPostcodePattern.test(value), {
    message: 'Invalid UK postcode'
  })
  .optional()

const getReferenceImageError = (file: File) => {
  if (!referenceImageConfig.acceptedTypes.includes(file.type)) {
    return 'Reference image must be a JPEG, PNG, or HEIC file'
  }

  if (file.size > referenceImageConfig.maxBytes) {
    return 'Reference image must be 5MB or smaller'
  }

  return null
}

const sanitizeFileName = (fileName: string) => {
  const cleanedName = fileName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]/g, '')

  return cleanedName || 'reference-image'
}

const buildReferenceImagePath = (fileName: string) =>
  `enquiries/${Date.now()}-${crypto.randomUUID()}-${sanitizeFileName(fileName)}`

const getCurrentUkDateInputValue = (date = new Date()) => {
  const dateParts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date)

  const year = dateParts.find((part) => part.type === 'year')?.value
  const month = dateParts.find((part) => part.type === 'month')?.value
  const day = dateParts.find((part) => part.type === 'day')?.value

  if (!year || !month || !day) {
    return date.toISOString().slice(0, 10)
  }

  return `${year}-${month}-${day}`
}

const dateNeededSchema = z
  .string()
  .trim()
  .min(1, 'Please select a date')
  .date(dateNeededErrorMessage)
  .refine((value) => value >= getCurrentUkDateInputValue(), {
    message: datePastErrorMessage
  })

const logSupabaseInsertFailure = (error: unknown) => {
  logger.error('Supabase insert failed', {
    operation: 'custom_cake_enquiries.insert',
    ...toSafeOperationalError(error)
  })
}

type NotificationError = {
  step: 'admin-email' | 'customer-email' | 'telegram-manager'
  message: string
}

const notificationOperationByStep: Record<NotificationError['step'], string> = {
  'admin-email': 'custom-cake-enquiry.notification.admin-email',
  'customer-email': 'custom-cake-enquiry.notification.customer-email',
  'telegram-manager': 'custom-cake-enquiry.notification.telegram-manager'
}

const getNotificationFailureAlertCode = (notificationErrors: NotificationError[]) => {
  const failedSteps = new Set(notificationErrors.map((entry) => entry.step))
  const adminFailed = failedSteps.has('admin-email')
  const customerFailed = failedSteps.has('customer-email')
  const telegramFailed = failedSteps.has('telegram-manager')

  if (adminFailed && customerFailed && telegramFailed) return 'ALL_NOTIFICATIONS_FAILED'
  if (adminFailed && customerFailed) return 'ADMIN_AND_CUSTOMER_EMAIL_FAILED'
  if (adminFailed && telegramFailed) return 'ADMIN_EMAIL_AND_TELEGRAM_FAILED'
  if (customerFailed && telegramFailed) return 'CUSTOMER_EMAIL_AND_TELEGRAM_FAILED'
  if (adminFailed) return 'ADMIN_EMAIL_FAILED'
  if (customerFailed) return 'CUSTOMER_EMAIL_FAILED'
  if (telegramFailed) return 'TELEGRAM_NOTIFICATION_FAILED'
  return 'NOTIFICATION_FAILED'
}

type InsertedEnquiryRow = {
  id: string | number
}

const isInsertedEnquiryRow = (value: unknown): value is InsertedEnquiryRow => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const record = value as Record<string, unknown>
  return typeof record.id === 'string' || typeof record.id === 'number'
}

const getInsertedEnquiryId = (value: unknown) =>
  isInsertedEnquiryRow(value) ? String(value.id) : null

const buildAdminUrl = (path: string) => `${BUSINESS_CONSTANTS.BASE_URL}${path}`

const logNotificationFailure = (
  step: NotificationError['step'],
  errorCode: string,
  recordReference?: string
) => {
  logger.error('Custom cake enquiry notification failed', {
    operation: notificationOperationByStep[step],
    code: errorCode,
    ...(recordReference ? { recordReference } : {})
  })
}

const logFailureAlertFailure = (
  errorCode: string,
  recordReference?: string
) => {
  logger.error('Custom cake enquiry failure alert failed', {
    operation: 'custom-cake-enquiry.failure-alert',
    code: errorCode,
    ...(recordReference ? { recordReference } : {})
  })
}

const getTelegramFailureAlertEmail = () =>
  process.env.TELEGRAM_FAILURE_ALERT_EMAIL?.trim() ||
  process.env.CONTACT_EMAIL_TO?.trim() ||
  'hello@olgishcakes.co.uk'

const sendFailureAlertEmail = async (params: {
  recordReference?: string
  failureCode: string
  emailMode: ReturnType<typeof getEmailTransportMode>
  adminUrl: string
}) => {
  const failureAlertResponse = await sendEmail({
    templateId: 'custom-cake-enquiry-failure-alert',
    input: {
      operation: 'custom-cake-enquiry.notification',
      operationalCode: params.failureCode,
      recordReference: params.recordReference,
      adminUrl: params.adminUrl
    },
    modeOverride: params.emailMode,
    message: {
      from: getEmailFromAddress(),
      to: recipientEmail,
      bcc: process.env.ADMIN_BCC_EMAIL || undefined
    }
  })

  return failureAlertResponse.accepted && !failureAlertResponse.error
    ? { sent: true as const }
    : {
        sent: false as const,
        errorMessage: failureAlertResponse.error
          ? toSafeOperationalError(failureAlertResponse.error).code
          : 'EMAIL_NOT_ACCEPTED'
      }
}

const sendTelegramFailureAlertEmail = async (params: {
  recordReference?: string
  failureCode: string
  emailMode: ReturnType<typeof getEmailTransportMode>
  adminUrl: string
}) => {
  const response = await sendEmail({
    templateId: 'custom-cake-enquiry-failure-alert',
    input: {
      operation: 'custom-cake-enquiry.notification.telegram-manager',
      operationalCode: params.failureCode,
      recordReference: params.recordReference,
      adminUrl: params.adminUrl
    },
    modeOverride: params.emailMode,
    subjectPrefix: '[Telegram alert]',
    message: {
      from: getEmailFromAddress(),
      to: getTelegramFailureAlertEmail()
    }
  })

  if (!response.accepted || response.error) {
    logger.error('Telegram failure alert email failed', {
      operation: 'custom-cake-enquiry.telegram-failure-alert',
      code: response.error
        ? toSafeOperationalError(response.error).code
        : 'EMAIL_NOT_ACCEPTED',
      ...(params.recordReference ? { recordReference: params.recordReference } : {})
    })
  }
}

const hasOperationalNotificationSuccess = (params: {
  adminEmailSent: boolean
  failureAlertSent: boolean
}) => params.adminEmailSent || params.failureAlertSent

const uploadReferenceImage = async (supabase: SupabaseAdminClient, file: File) => {
  const bucket = getReferenceImageBucket()
  const filePath = buildReferenceImagePath(file.name)
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined
    })

  if (error || !data) {
    logger.error('Supabase storage upload failed', {
      operation: 'custom-cake-enquiry.reference-upload',
      ...toSafeOperationalError(error)
    })
    throw new Error('Failed to upload reference image')
  }

  return {
    bucket,
    path: data.path
  }
}

const removeReferenceImage = async (
  supabase: SupabaseAdminClient,
  bucket: string,
  path: string
) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) {
    logger.error('Supabase storage cleanup failed', {
      operation: 'custom-cake-enquiry.reference-cleanup',
      ...toSafeOperationalError(error)
    })
  }
}

const formSchema = z.object({
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: optionalEmailSchema,
  phone: optionalPhoneSchema,
  address: optionalTrimmedStringSchema,
  city: optionalTrimmedStringSchema,
  postcode: optionalPostcodeSchema,
  occasion: optionalTrimmedStringSchema,
  date: dateNeededSchema,
  requirements: optionalTrimmedStringSchema,
  dietaryHealthInformation: dietaryHealthInformationSchema,
  dietaryHealthConsent: dietaryHealthConsentSchema,
  csrfToken: z.string().min(1, 'CSRF token is required')
}).superRefine((values, ctx) => {
  addSensitiveDataConsentIssue(values, ctx)

  if (values.email.length > 0 || values.phone.length > 0) {
    return
  }

  const message = 'Add an email address or phone number'
  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    path: ['email'],
    message
  })
  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    path: ['phone'],
    message
  })
})

const RATE_LIMIT = 5
const RATE_LIMIT_WINDOW = 60 * 1000

const occasionLabels: Record<string, string> = {
  birthday: 'Birthday',
  wedding: 'Wedding',
  anniversary: 'Anniversary',
  baby_shower: 'Baby shower',
  corporate_event: 'Corporate event',
  christening: 'Christening',
  other: 'Other'
}

export async function POST(request: NextRequest) {
  try {
    if (!isSupportedFormContentType(request)) {
      return createUnsupportedFormContentTypeResponse()
    }

    const supabase = getSupabaseAdminClient()
    const rateLimitResult = await takeEnquiryRateLimit(supabase, {
      scope: 'custom-cake-enquiry',
      identifier: getEnquiryRateLimitIdentifier(request),
      maxRequests: RATE_LIMIT,
      windowMs: RATE_LIMIT_WINDOW
    })

    if (rateLimitResult.rateLimited) {
      return applyEnquiryRateLimitHeaders(
        NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        ),
        rateLimitResult
      )
    }

    const formDataResult = await readRequiredFormData(request)
    if (!formDataResult.ok) {
      return formDataResult.response
    }

    const { formData: body } = formDataResult
    const getString = (value: FormDataEntryValue | null) =>
      typeof value === 'string' ? value : ''

    const fullName = getString(body.get('fullName'))
    const email = getString(body.get('email'))
    const phone = getString(body.get('phone'))
    const addressValue = getString(body.get('address')).trim()
    const cityValue = getString(body.get('city')).trim()
    const postcodeValue = getString(body.get('postcode')).trim()
    const date = getString(body.get('date'))
    const occasionValue = getString(body.get('occasion')).trim()
    const requirementsValue = getString(body.get('requirements')).trim()
    const dietaryHealthInformationValue = getString(body.get('dietaryHealthInformation')).trim()
    const dietaryHealthConsent = parseDietaryHealthConsent(body.get('dietaryHealthConsent'))
    const csrfToken = getString(body.get('csrfToken'))
    const referenceImageEntry = body.get('referenceImage')
    const referenceImage =
      referenceImageEntry instanceof File && referenceImageEntry.size > 0
        ? referenceImageEntry
        : null

    const cookieToken = request.cookies.get('csrf-token')?.value || null
    const submittedToken = csrfToken

    if (!cookieToken || !submittedToken) {
      return NextResponse.json(
        { error: 'CSRF token missing' },
        { status: 403 }
      )
    }

    if (!validateCsrfToken(submittedToken, cookieToken)) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      )
    }

    const emailMode = getEmailTransportMode()
    const canSendLiveEmail =
      !requiresLiveEmailConfiguration(emailMode) || Boolean(process.env.RESEND_API_KEY)

    if (!canSendLiveEmail) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }

    const validated = formSchema.parse({
      fullName,
      email,
      phone,
      address: addressValue || undefined,
      city: cityValue || undefined,
      postcode: postcodeValue || undefined,
      occasion: occasionValue || undefined,
      date,
      requirements: requirementsValue || undefined,
      dietaryHealthInformation: dietaryHealthInformationValue || undefined,
      dietaryHealthConsent,
      csrfToken
    })

    const { csrfToken: _, ...formData } = validated
    const sensitiveDataEvidence = createSensitiveDataConsentEvidence(
      formData.dietaryHealthInformation,
      formData.dietaryHealthConsent === true
    )

    const referenceImageError = referenceImage ? getReferenceImageError(referenceImage) : null
    if (referenceImageError) {
      return NextResponse.json(
        { error: referenceImageError },
        { status: 400 }
      )
    }

    let referenceImageBucket: string | null = null
    let referenceImagePath: string | null = null

    if (referenceImage) {
      const uploaded = await uploadReferenceImage(supabase, referenceImage)
      referenceImageBucket = uploaded.bucket
      referenceImagePath = uploaded.path
    }

    const { data: insertedEnquiry, error: insertError } = await supabase
      .from('custom_cake_enquiries')
      .insert({
        full_name: formData.fullName,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        city: formData.city || null,
        postcode: formData.postcode || null,
        occasion: occasionValue || null,
        date_needed: formData.date,
        requirements: requirementsValue || null,
        dietary_health_information: sensitiveDataEvidence.dietaryHealthInformation,
        dietary_health_consent: sensitiveDataEvidence.dietaryHealthConsent,
        dietary_health_consent_version: sensitiveDataEvidence.dietaryHealthConsentVersion,
        dietary_health_consented_at: sensitiveDataEvidence.dietaryHealthConsentedAt,
        reference_image_bucket: referenceImageBucket,
        reference_image_path: referenceImagePath,
        reference_image_name: referenceImage?.name || null,
        reference_image_type: referenceImage?.type || null,
        reference_image_size: referenceImage ? referenceImage.size : null
      })
      .select('id')
      .single()

    if (insertError) {
      if (referenceImageBucket && referenceImagePath) {
        await removeReferenceImage(
          supabase,
          referenceImageBucket,
          referenceImagePath
        )
      }

      logSupabaseInsertFailure(insertError)
      throw new Error('Failed to save enquiry')
    }

    const enquiryId = getInsertedEnquiryId(insertedEnquiry)
    const adminPath = enquiryId
      ? `/admin/enquiries/custom-cake/${enquiryId}` as const
      : '/admin/enquiries'
    const adminUrl = buildAdminUrl(adminPath)

    const rawOccasion = formData.occasion?.trim() || ''
    const normalizedOccasion = rawOccasion.toLowerCase()
    const resolvedOccasion =
      occasionLabels[normalizedOccasion] ||
      occasionLabels[normalizedOccasion.replace(/\s+/g, '_')] ||
      rawOccasion ||
      'Not specified'
    const hasDietaryHealthInformation =
      sensitiveDataEvidence.dietaryHealthInformation !== null
    const notificationErrors: NotificationError[] = []

    const telegramNotificationResult = await sendTelegramManagerNotification({
      type: 'custom-cake-enquiry',
      recordReference: enquiryId || undefined,
      dateNeeded: formData.date,
      imageCount: referenceImage ? 1 : 0,
      adminPath
    })

    if (!telegramNotificationResult.sent && !telegramNotificationResult.skipped) {
      await sendTelegramFailureAlertEmail({
        recordReference: enquiryId || undefined,
        failureCode: telegramNotificationResult.error
          ? toSafeOperationalError({ code: telegramNotificationResult.error }).code
          : 'TELEGRAM_NOTIFICATION_FAILED',
        emailMode,
        adminUrl
      })
    }

    const adminEmailResponse = await sendEmail({
      templateId: 'custom-cake-enquiry-admin',
      input: {
        customerName: formData.fullName,
        customerEmail: formData.email || undefined,
        customerPhone: formData.phone || undefined,
        address: formData.address,
        city: formData.city,
        postcode: formData.postcode,
        dateNeeded: formData.date,
        occasion: resolvedOccasion,
        hasDietaryHealthInformation,
        adminUrl
      },
      modeOverride: emailMode,
      message: {
        from: getEmailFromAddress(),
        to: recipientEmail,
        bcc: process.env.ADMIN_BCC_EMAIL || undefined,
        replyTo: formData.email || undefined
      }
    })

    const adminEmailSent = adminEmailResponse.accepted && !adminEmailResponse.error

    if (!adminEmailSent) {
      notificationErrors.push({
        step: 'admin-email',
        message: adminEmailResponse.error
          ? toSafeOperationalError(adminEmailResponse.error).code
          : 'EMAIL_NOT_ACCEPTED'
      })
    }

    let customerEmailSent = false

    if (formData.email) {
      const customerEmailResponse = await sendEmail({
        templateId: 'custom-cake-enquiry-customer',
        input: {
          customerName: formData.fullName,
          customerEmail: formData.email || undefined,
          customerPhone: formData.phone || undefined,
          address: formData.address,
          city: formData.city,
          postcode: formData.postcode,
          orderType: 'custom-cake-enquiry',
          dateNeeded: formData.date,
          occasion: resolvedOccasion,
          nextSteps: [
            'We\'ll check the date, your notes and the delivery details.',
            'We\'ll reply with availability, any questions, and a quote if we can make it for that date.',
            'Nothing is booked or payable until we agree the design, price and collection or delivery details.'
          ]
        },
        modeOverride: emailMode,
        message: {
          from: getEmailFromAddress(),
          to: formData.email,
          bcc: getCustomerEmailBcc(process.env.ADMIN_BCC_EMAIL),
          replyTo: recipientEmail,
          attachments: []
        }
      })

      customerEmailSent = customerEmailResponse.accepted && !customerEmailResponse.error

      if (!customerEmailSent) {
        notificationErrors.push({
          step: 'customer-email',
          message: customerEmailResponse.error
            ? toSafeOperationalError(customerEmailResponse.error).code
            : 'EMAIL_NOT_ACCEPTED'
        })
      }
    }

    let failureAlertSent = false

    if (notificationErrors.length > 0) {
      notificationErrors.forEach((entry) => {
        logNotificationFailure(entry.step, entry.message, enquiryId || undefined)
      })

      const failureAlertResult = await sendFailureAlertEmail({
        recordReference: enquiryId || undefined,
        failureCode: getNotificationFailureAlertCode(notificationErrors),
        emailMode,
        adminUrl
      })

      failureAlertSent = failureAlertResult.sent

      if (!failureAlertResult.sent) {
        logFailureAlertFailure(failureAlertResult.errorMessage, enquiryId || undefined)
      }
    }

    if (!hasOperationalNotificationSuccess({ adminEmailSent, failureAlertSent })) {
      return NextResponse.json(
        {
          error: notificationFailureErrorMessage
        },
        { status: 500 }
      )
    }

    return applyEnquiryRateLimitHeaders(
      NextResponse.json(
        { message: 'Enquiry submitted successfully' },
        { status: 200 }
      ),
      rateLimitResult
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    logger.error('Custom cake enquiry processing failed', {
      operation: 'custom-cake-enquiry.process',
      ...toSafeOperationalError(error)
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}







