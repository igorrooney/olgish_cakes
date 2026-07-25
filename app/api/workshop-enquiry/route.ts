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
  const errorRecord =
    typeof error === 'object' && error !== null
      ? error as Record<string, unknown>
      : null

  console.error('Workshop enquiry insert failed', {
    operation: 'workshop_enquiries.insert',
    table: 'workshop_enquiries',
    errorName: errorRecord?.name ?? null,
    errorCode: errorRecord?.code ?? null
  })
}

const logNotificationFailure = (step: NotificationError['step']) => {
  console.error('Workshop enquiry notification failed', {
    operation: 'workshop-enquiry.notification',
    step
  })
}

type NotificationError = {
  step: 'admin-email' | 'customer-email'
  message: string
}

const logFailureAlertFailure = (notificationErrors: NotificationError[]) => {
  console.error('Workshop enquiry failure alert failed', {
    operation: 'workshop-enquiry.failure-alert',
    failedSteps: notificationErrors.map((entry) => entry.step)
  })
}

const logWorkshopProcessingFailure = (error: unknown) => {
  const errorRecord =
    typeof error === 'object' && error !== null
      ? error as Record<string, unknown>
      : null

  console.error('Workshop enquiry processing failed', {
    operation: 'workshop-enquiry.process',
    errorName: errorRecord?.name ?? null,
    errorCode: errorRecord?.code ?? null
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

const buildFailureAlertMessage = (notificationErrors: NotificationError[]) =>
  notificationErrors
    .map((entry) => `${entry.step}: ${entry.message}`)
    .join('\n')

const sendFailureAlertEmail = async (params: {
  customerName: string
  customerEmail: string
  customerPhone?: string
  preferredDate: string
  eventType: string
  groupSize: string
  location: string
  decorationTheme?: string
  brief: string
  notificationErrors: NotificationError[]
  emailMode: ReturnType<typeof getEmailTransportMode>
}) => {
  const failureAlertResponse = await sendEmail({
    templateId: 'workshop-enquiry-failure-alert',
    input: {
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      customerPhone: params.customerPhone,
      orderType: 'workshop-enquiry',
      productName: 'Cake Decorating Workshop',
      productType: 'workshop',
      dateNeeded: params.preferredDate,
      occasion: params.eventType,
      servings: params.groupSize,
      deliveryAddress: params.location,
      designType: params.decorationTheme,
      customerMessage: params.brief,
      message: `Failed notifications:\n${buildFailureAlertMessage(params.notificationErrors)}`,
      note: 'The enquiry was saved in the database successfully. Review notification logs and follow up manually if needed.'
    },
    modeOverride: params.emailMode,
    message: {
      from: getEmailFromAddress(),
      to: getRecipientEmail(),
      bcc: process.env.ADMIN_BCC_EMAIL || undefined,
      replyTo: params.customerEmail
    }
  })

  return failureAlertResponse.accepted && !failureAlertResponse.error
    ? { sent: true as const }
    : {
        sent: false as const,
        errorMessage: failureAlertResponse.error?.message || 'Transport did not accept failure alert email'
      }
}

export async function POST(request: NextRequest) {
  try {
    const emailMode = getEmailTransportMode()
    const body = await request.formData()
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
    const resolvedEventType = resolveEventType(validated.eventType)
    const { error: insertError } = await supabase
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
        brief: validated.brief
      })

    if (insertError) {
      logSupabaseInsertFailure(insertError)
      throw new Error('Failed to save workshop enquiry')
    }

    await sendTelegramManagerNotification({
      type: 'workshop-enquiry',
      customerName: validated.fullName,
      customerEmail: validated.email,
      customerPhone: validated.phone || undefined,
      dateNeeded: validated.preferredDate,
      productName: resolvedEventType,
      messagePreview: validated.brief,
      adminPath: '/admin'
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
          deliveryAddress: validated.location,
          designType: validated.decorationTheme,
          customerMessage: validated.brief
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
          message: adminEmailResponse.error?.message || 'Transport did not accept admin email'
        })
      }
    } catch (error) {
      notificationErrors.push({
        step: 'admin-email',
        message: error instanceof Error ? error.message : 'Admin email request failed'
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
          deliveryAddress: validated.location,
          designType: validated.decorationTheme,
          customerMessage: validated.brief,
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
          message: customerEmailResponse.error?.message || 'Transport did not accept customer email'
        })
      }
    } catch (error) {
      notificationErrors.push({
        step: 'customer-email',
        message: error instanceof Error ? error.message : 'Customer email request failed'
      })
    }

    let failureAlertSent = false

    if (notificationErrors.length > 0) {
      notificationErrors.forEach((entry) => {
        logNotificationFailure(entry.step)
      })

      const failureAlertResult = await sendFailureAlertEmail({
        customerName: validated.fullName,
        customerEmail: validated.email,
        customerPhone: validated.phone || undefined,
        preferredDate: validated.preferredDate,
        eventType: resolvedEventType,
        groupSize: validated.groupSize,
        location: validated.location,
        decorationTheme: validated.decorationTheme,
        brief: validated.brief,
        notificationErrors,
        emailMode
      })

      failureAlertSent = failureAlertResult.sent

      if (!failureAlertResult.sent) {
        logFailureAlertFailure(notificationErrors)
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
