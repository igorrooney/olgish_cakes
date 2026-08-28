import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { BUSINESS_CONSTANTS } from '@/lib/constants'
import { validateCsrfToken } from '@/lib/csrf'
import {
  getEmailTransportMode,
  requiresLiveEmailConfiguration,
  sendEmail
} from '@/lib/email/service'
import { getCustomerEmailBcc } from '@/lib/email/customer-bcc'
import { sendTelegramManagerNotification } from '@/lib/notifications/telegram'
import {
  applyEnquiryRateLimitHeaders,
  getEnquiryRateLimitIdentifier,
  takeEnquiryRateLimit
} from '@/lib/enquiry-rate-limit'
import { getSupabaseAdminClient } from '@/lib/supabase-admin-client'
import { workshopEnquirySchema } from '@/lib/validation'
import {
  createSensitiveDataConsentEvidence,
  parseDietaryHealthConsent
} from '@/lib/legal/sensitive-data-consent'
import { logger } from '@/lib/logger'
import { toSafeOperationalError } from '@/lib/security/safe-operational-error'
import { readRequiredFormData } from '@/lib/form-request'

const RATE_LIMIT = 5
const RATE_LIMIT_WINDOW = 60 * 1000
const notificationFailureErrorMessage =
  'Enquiry saved but all operator notifications failed. Please contact Olgish Cakes directly.'
const customerConfirmationFailureErrorMessage =
  'Your enquiry was saved, but we could not send the confirmation email. We will follow up manually.'
const eventTypeLabels: Record<string, string> = {
  'corporate event': 'Corporate event',
  'team building': 'Team building',
  birthday: 'Birthday',
  'hen party': 'Hen party',
  'private party': 'Private party',
  other: 'Other'
}

const getString = (value: FormDataEntryValue | null) =>
  typeof value === 'string' ? value : ''

const resolveEventType = (value: string) => {
  const trimmedValue = value.trim()
  const normalizedValue = trimmedValue.toLowerCase()

  return eventTypeLabels[normalizedValue] || trimmedValue
}

const logSupabaseInsertFailure = (error: unknown) => {
  logger.error('Workshop enquiry insert failed', {
    operation: 'workshop_enquiries.insert',
    ...toSafeOperationalError(error)
  })
}

type NotificationError = {
  step: 'admin-email' | 'customer-email'
  message: string
}

const notificationOperationByStep: Record<NotificationError['step'], string> = {
  'admin-email': 'workshop-enquiry.notification.admin-email',
  'customer-email': 'workshop-enquiry.notification.customer-email'
}

const getNotificationFailureAlertCode = (notificationErrors: NotificationError[]) => {
  const failedSteps = new Set(notificationErrors.map((entry) => entry.step))
  const adminFailed = failedSteps.has('admin-email')
  const customerFailed = failedSteps.has('customer-email')

  if (adminFailed && customerFailed) return 'ADMIN_AND_CUSTOMER_EMAIL_FAILED'
  if (adminFailed) return 'ADMIN_EMAIL_FAILED'
  if (customerFailed) return 'CUSTOMER_EMAIL_FAILED'
  return 'NOTIFICATION_FAILED'
}

const logNotificationFailure = (entry: NotificationError, recordReference?: string) => {
  logger.error('Workshop enquiry notification failed', {
    operation: notificationOperationByStep[entry.step],
    code: entry.message,
    ...(recordReference ? { recordReference } : {})
  })
}

const logFailureAlertFailure = (errorCode: string, recordReference?: string) => {
  logger.error('Workshop enquiry failure alert failed', {
    operation: 'workshop-enquiry.failure-alert',
    code: errorCode,
    ...(recordReference ? { recordReference } : {})
  })
}

const logWorkshopProcessingFailure = (error: unknown) => {
  logger.error('Workshop enquiry processing failed', {
    operation: 'workshop-enquiry.process',
    ...toSafeOperationalError(error)
  })
}

const getRecipientEmail = () => process.env.CONTACT_EMAIL_TO || 'hello@olgishcakes.co.uk'

const getEmailFromAddress = () => {
  const configuredFromAddress = process.env.NEXT_PUBLIC_EMAIL_FROM?.trim()
  const defaultFromAddress = `${BUSINESS_CONSTANTS.NAME} <${BUSINESS_CONSTANTS.EMAIL}>`

  if (!configuredFromAddress) {
    return defaultFromAddress
  }

  if (configuredFromAddress.includes('<')) {
    return configuredFromAddress
  }

  if (configuredFromAddress === BUSINESS_CONSTANTS.EMAIL) {
    return defaultFromAddress
  }

  return configuredFromAddress
}

const canSendOperationalEmails = (emailMode: ReturnType<typeof getEmailTransportMode>) =>
  !requiresLiveEmailConfiguration(emailMode) || Boolean(process.env.RESEND_API_KEY)

const sendFailureAlertEmail = async (params: {
  recordReference?: string
  failureCode: string
  emailMode: ReturnType<typeof getEmailTransportMode>
  adminUrl: string
}) => {
  const failureAlertResponse = await sendEmail({
    templateId: 'workshop-enquiry-failure-alert',
    input: {
      operation: 'workshop-enquiry.notification',
      operationalCode: params.failureCode,
      recordReference: params.recordReference,
      adminUrl: params.adminUrl
    },
    modeOverride: params.emailMode,
    message: {
      from: getEmailFromAddress(),
      to: getRecipientEmail(),
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

export async function POST(request: NextRequest) {
  try {
    const emailMode = getEmailTransportMode()
    const formDataResult = await readRequiredFormData(request)
    if (!formDataResult.ok) {
      return formDataResult.response
    }

    const { formData: body } = formDataResult
    const submissionData = {
      fullName: getString(body.get('fullName')),
      email: getString(body.get('email')),
      phone: getString(body.get('phone')),
      eventType: getString(body.get('eventType')),
      groupSize: getString(body.get('groupSize')),
      location: getString(body.get('location')),
      preferredDate: getString(body.get('preferredDate')),
      decorationTheme: getString(body.get('decorationTheme')) || undefined,
      brief: getString(body.get('brief')),
      dietaryHealthInformation: getString(body.get('dietaryHealthInformation')) || undefined,
      dietaryHealthConsent: parseDietaryHealthConsent(body.get('dietaryHealthConsent')),
      csrfToken: getString(body.get('csrfToken'))
    }

    const cookieToken = request.cookies.get('csrf-token')?.value || null

    if (!cookieToken || !submissionData.csrfToken) {
      return NextResponse.json(
        { error: 'CSRF token missing' },
        { status: 403 }
      )
    }

    if (!validateCsrfToken(submissionData.csrfToken, cookieToken)) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      )
    }

    const supabase = getSupabaseAdminClient()
    const rateLimitResult = await takeEnquiryRateLimit(supabase, {
      scope: 'workshop-enquiry',
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

    if (!canSendOperationalEmails(emailMode)) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }

    const validated = workshopEnquirySchema.parse(submissionData)
    const sensitiveDataEvidence = createSensitiveDataConsentEvidence(
      validated.dietaryHealthInformation,
      validated.dietaryHealthConsent === true
    )
    const hasDietaryHealthInformation =
      sensitiveDataEvidence.dietaryHealthInformation !== null
    const resolvedEventType = resolveEventType(validated.eventType)
    const { data: insertedEnquiry, error: insertError } = await supabase
      .from('workshop_enquiries')
      .insert({
        full_name: validated.fullName,
        email: validated.email,
        phone: validated.phone || null,
        event_type: validated.eventType,
        group_size: validated.groupSize,
        location: validated.location,
        preferred_date: validated.preferredDate,
        decoration_theme: validated.decorationTheme || null,
        brief: validated.brief,
        dietary_health_information: sensitiveDataEvidence.dietaryHealthInformation,
        dietary_health_consent: sensitiveDataEvidence.dietaryHealthConsent,
        dietary_health_consent_version: sensitiveDataEvidence.dietaryHealthConsentVersion,
        dietary_health_consented_at: sensitiveDataEvidence.dietaryHealthConsentedAt
      })
      .select('id')
      .single()

    if (insertError) {
      logSupabaseInsertFailure(insertError)
      throw new Error('Failed to save workshop enquiry')
    }

    const enquiryId = insertedEnquiry?.id ? String(insertedEnquiry.id) : null
    const adminUrl = enquiryId
      ? `${BUSINESS_CONSTANTS.BASE_URL}/admin/enquiries/workshop/${enquiryId}`
      : `${BUSINESS_CONSTANTS.BASE_URL}/admin/enquiries`

    await sendTelegramManagerNotification({
      type: 'workshop-enquiry',
      recordReference: enquiryId || undefined,
      dateNeeded: validated.preferredDate,
      adminPath: enquiryId
        ? `/admin/enquiries/workshop/${enquiryId}`
        : '/admin/enquiries'
    })

    const notificationErrors: NotificationError[] = []
    let adminEmailSent = false
    let customerEmailSent = false
    try {
      const adminEmailResponse = await sendEmail({
        templateId: 'workshop-enquiry-admin',
        input: {
          customerName: validated.fullName,
          customerEmail: validated.email,
          customerPhone: validated.phone || undefined,
          orderType: 'workshop-enquiry',
          productName: 'Cake Decorating Workshop',
          productType: 'workshop',
          dateNeeded: validated.preferredDate,
          occasion: resolvedEventType,
          servings: validated.groupSize,
          hasDietaryHealthInformation,
          adminUrl
        },
        modeOverride: emailMode,
        message: {
          from: getEmailFromAddress(),
          to: getRecipientEmail(),
          bcc: process.env.ADMIN_BCC_EMAIL || undefined,
          replyTo: validated.email
        }
      })

      adminEmailSent = adminEmailResponse.accepted && !adminEmailResponse.error

      if (!adminEmailSent) {
        notificationErrors.push({
          step: 'admin-email',
          message: adminEmailResponse.error
            ? toSafeOperationalError(adminEmailResponse.error).code
            : 'EMAIL_NOT_ACCEPTED'
        })
      }
    } catch (error) {
      notificationErrors.push({
        step: 'admin-email',
        message: toSafeOperationalError(error).code
      })
    }

    try {
      const customerEmailResponse = await sendEmail({
        templateId: 'workshop-enquiry-customer',
        input: {
          customerName: validated.fullName,
          customerEmail: validated.email,
          orderType: 'workshop-enquiry',
          productName: 'Cake Decorating Workshop',
          productType: 'workshop',
          dateNeeded: validated.preferredDate,
          occasion: resolvedEventType,
          servings: validated.groupSize,
          nextSteps: [
            'We will review the date and location details first.',
            'If the workshop format is a fit, we will come back with the next practical steps.'
          ]
        },
        modeOverride: emailMode,
        message: {
          from: getEmailFromAddress(),
          to: validated.email,
          bcc: getCustomerEmailBcc(process.env.ADMIN_BCC_EMAIL),
          replyTo: getRecipientEmail()
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
    } catch (error) {
      notificationErrors.push({
        step: 'customer-email',
        message: toSafeOperationalError(error).code
      })
    }

    let failureAlertSent = false

    if (notificationErrors.length > 0) {
      notificationErrors.forEach((entry) => {
        logNotificationFailure(entry, enquiryId || undefined)
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

    if (!adminEmailSent && !failureAlertSent) {
      return NextResponse.json(
        { error: notificationFailureErrorMessage },
        { status: 500 }
      )
    }

    if (!customerEmailSent) {
      return applyEnquiryRateLimitHeaders(
        NextResponse.json(
          {
            message: 'Workshop enquiry submitted successfully',
            warning: customerConfirmationFailureErrorMessage
          },
          { status: 200 }
        ),
        rateLimitResult
      )
    }

    return applyEnquiryRateLimitHeaders(
      NextResponse.json(
        { message: 'Workshop enquiry submitted successfully' },
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

    logWorkshopProcessingFailure(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
