import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { validateCsrfToken } from '@/lib/csrf'
import {
  applyEnquiryRateLimitHeaders,
  getEnquiryRateLimitIdentifier,
  takeEnquiryRateLimit
} from '@/lib/enquiry-rate-limit'
import { getEmailTransportMode, requiresLiveEmailConfiguration, sendEmail } from '@/lib/email/service'
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

const recipientEmail = process.env.CONTACT_EMAIL_TO || 'hello@olgishcakes.co.uk'
const ukPostcodePattern = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i
const notificationFailureErrorMessage =
  'Enquiry saved but all operator notifications failed. Please contact Olgish Cakes directly.'

const getReferenceImageBucket = () =>
  process.env.SUPABASE_ENQUIRY_BUCKET || 'custom-cake-enquiries'

const emailFromAddress =
  process.env.NEXT_PUBLIC_EMAIL_FROM || 'Olgish Cakes <hello@olgishcakes.co.uk>'

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

const buildSupabaseInsertHints = (errorDetails: string) => {
  const normalizedDetails = errorDetails.toLowerCase()
  const hints = new Set<string>([
    'Verify the custom_cake_enquiries table exists in Supabase.',
    'Verify the table contains every column expected by the route insert payload.',
    'Verify the service-role key has insert permission for custom_cake_enquiries.'
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
    hints.add('Check not-null, unique, or check constraints on custom_cake_enquiries.')
  }

  return [...hints]
}

const logSupabaseInsertFailure = (error: unknown) => {
  const errorRecord = typeof error === 'object' && error !== null
    ? error as Record<string, unknown>
    : null
  const details = JSON.stringify(errorRecord ?? error)

  console.error('Supabase insert failed', {
    operation: 'custom_cake_enquiries.insert',
    table: 'custom_cake_enquiries',
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
      'occasion',
      'date_needed',
      'requirements',
      'reference_image_bucket',
      'reference_image_path',
      'reference_image_name',
      'reference_image_type',
      'reference_image_size'
    ],
    troubleshootingHints: buildSupabaseInsertHints(details)
  })
}

type NotificationError = {
  step: 'admin-email' | 'customer-email'
  message: string
}

const logNotificationFailure = (
  step: NotificationError['step'],
  errorMessage: string,
  context: {
    customerName: string
    customerEmail?: string
    dateNeeded: string
  }
) => {
  console.error('Custom cake enquiry notification failed', {
    step,
    errorMessage,
    customerName: context.customerName,
    customerEmail: context.customerEmail ?? null,
    dateNeeded: context.dateNeeded
  })
}

const logFailureAlertFailure = (
  errorMessage: string,
  context: {
    customerName: string
    customerEmail?: string
    dateNeeded: string
    notificationErrors: NotificationError[]
  }
) => {
  console.error('Custom cake enquiry failure alert failed', {
    errorMessage,
    customerName: context.customerName,
    customerEmail: context.customerEmail ?? null,
    dateNeeded: context.dateNeeded,
    failedSteps: context.notificationErrors.map((entry) => entry.step)
  })
}

const buildFailureAlertMessage = (
  notificationErrors: NotificationError[]
) => notificationErrors
  .map((entry) => `${entry.step}: ${entry.message}`)
  .join('\n')

const sendFailureAlertEmail = async (params: {
  customerName: string
  customerEmail?: string
  customerPhone?: string
  address?: string
  city?: string
  postcode?: string
  dateNeeded: string
  occasion: string
  requirements: string
  attachmentNames: string[]
  notificationErrors: NotificationError[]
  emailMode: ReturnType<typeof getEmailTransportMode>
}) => {
  const failureAlertResponse = await sendEmail({
    templateId: 'custom-cake-enquiry-failure-alert',
    input: {
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      customerPhone: params.customerPhone,
      address: params.address,
      city: params.city,
      postcode: params.postcode,
      dateNeeded: params.dateNeeded,
      occasion: params.occasion,
      customerMessage: params.requirements,
      attachmentNames: params.attachmentNames,
      message: `Failed notifications:\n${buildFailureAlertMessage(params.notificationErrors)}`,
      note: 'The enquiry was saved in the database successfully. Review notification logs and resend manually if needed.'
    },
    modeOverride: params.emailMode,
    message: {
      from: emailFromAddress,
      to: recipientEmail,
      bcc: process.env.ADMIN_BCC_EMAIL || undefined,
      replyTo: params.customerEmail || undefined
    }
  })

  return failureAlertResponse.accepted && !failureAlertResponse.error
    ? { sent: true as const }
    : {
        sent: false as const,
        errorMessage: failureAlertResponse.error?.message || 'Transport did not accept failure alert email'
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
    console.error('Supabase storage upload failed:', error)
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
    console.error('Supabase storage cleanup failed:', error)
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
  csrfToken: z.string().min(1, 'CSRF token is required')
}).superRefine((values, ctx) => {
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

    const emailMode = getEmailTransportMode()
    const canSendLiveEmail =
      !requiresLiveEmailConfiguration(emailMode) || Boolean(process.env.RESEND_API_KEY)

    if (!canSendLiveEmail) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
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
      csrfToken
    })

    const { csrfToken: _, ...formData } = validated

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

    const { error: insertError } = await supabase
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
        reference_image_bucket: referenceImageBucket,
        reference_image_path: referenceImagePath,
        reference_image_name: referenceImage?.name || null,
        reference_image_type: referenceImage?.type || null,
        reference_image_size: referenceImage ? referenceImage.size : null
      })

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

    await sendTelegramManagerNotification({
      type: 'custom-cake-enquiry',
      customerName: formData.fullName,
      customerEmail: formData.email || undefined,
      customerPhone: formData.phone || undefined,
      dateNeeded: formData.date,
      productName: occasionValue || undefined,
      messagePreview: requirementsValue,
      imageCount: referenceImage ? 1 : 0,
      adminPath: '/admin'
    })

    const formattedDate = new Date(formData.date).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    const rawOccasion = formData.occasion?.trim() || ''
    const normalizedOccasion = rawOccasion.toLowerCase()
    const resolvedOccasion =
      occasionLabels[normalizedOccasion] ||
      occasionLabels[normalizedOccasion.replace(/\s+/g, '_')] ||
      rawOccasion ||
      'Not specified'
    const resolvedRequirements = formData.requirements?.trim() || 'Not specified'
    const notificationErrors: NotificationError[] = []

    const attachmentBuffer = referenceImage
      ? Buffer.from(await referenceImage.arrayBuffer())
      : null

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
        customerMessage: resolvedRequirements,
        attachmentNames: referenceImage ? [referenceImage.name] : []
      },
      modeOverride: emailMode,
      message: {
        from: emailFromAddress,
        to: recipientEmail,
        bcc: process.env.ADMIN_BCC_EMAIL || undefined,
        replyTo: formData.email || undefined,
        attachments: referenceImage && attachmentBuffer
          ? [
              {
                filename: referenceImage.name,
                content: attachmentBuffer,
                contentType: referenceImage.type || undefined
              }
            ]
          : []
      }
    })

    const adminEmailSent = adminEmailResponse.accepted && !adminEmailResponse.error

    if (!adminEmailSent) {
      notificationErrors.push({
        step: 'admin-email',
        message: adminEmailResponse.error?.message || 'Transport did not accept admin email'
      })
    }

    let customerEmailSent = false

    if (formData.email) {
      const customerEmailResponse = await sendEmail({
        templateId: 'custom-cake-enquiry-customer',
        input: {
          customerName: formData.fullName,
          customerEmail: formData.email || undefined,
          dateNeeded: formData.date,
          occasion: resolvedOccasion,
          customerMessage: resolvedRequirements,
          message: 'Date needed: ' + formattedDate
        },
        modeOverride: emailMode,
        message: {
          from: emailFromAddress,
          to: formData.email,
          bcc: process.env.ADMIN_BCC_EMAIL || undefined,
          replyTo: recipientEmail,
          attachments: referenceImage && attachmentBuffer
            ? [
                {
                  filename: referenceImage.name,
                  content: attachmentBuffer,
                  contentType: referenceImage.type || undefined
                }
              ]
            : []
        }
      })

      customerEmailSent = customerEmailResponse.accepted && !customerEmailResponse.error

      if (!customerEmailSent) {
        notificationErrors.push({
          step: 'customer-email',
          message: customerEmailResponse.error?.message || 'Transport did not accept customer email'
        })
      }
    }

    let failureAlertSent = false

    if (notificationErrors.length > 0) {
      notificationErrors.forEach((entry) => {
        logNotificationFailure(entry.step, entry.message, {
          customerName: formData.fullName,
          customerEmail: formData.email || undefined,
          dateNeeded: formData.date
        })
      })

      const failureAlertResult = await sendFailureAlertEmail({
        customerName: formData.fullName,
        customerEmail: formData.email || undefined,
        customerPhone: formData.phone || undefined,
        address: formData.address,
        city: formData.city,
        postcode: formData.postcode,
        dateNeeded: formData.date,
        occasion: resolvedOccasion,
        requirements: resolvedRequirements,
        attachmentNames: referenceImage ? [referenceImage.name] : [],
        notificationErrors,
        emailMode
      })

      failureAlertSent = failureAlertResult.sent

      if (!failureAlertResult.sent) {
        logFailureAlertFailure(failureAlertResult.errorMessage, {
          customerName: formData.fullName,
          customerEmail: formData.email || undefined,
          dateNeeded: formData.date,
          notificationErrors
        })
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

    console.error('Error processing enquiry:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}







