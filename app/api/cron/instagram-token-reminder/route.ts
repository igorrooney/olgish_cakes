import { NextRequest, NextResponse } from 'next/server'
import {
  getEmailTransportMode,
  requiresLiveEmailConfiguration,
  sendEmail
} from '@/lib/email/service'
import {
  getInstagramTokenAlertWindowDays,
  getInstagramTokenExpiresAt,
  getInstagramTokenReminderStatus
} from '@/lib/instagram-token-reminder'

const getCronAuthorizationToken = () => process.env.CRON_SECRET

const isAuthorized = (request: NextRequest) => {
  const expectedToken = getCronAuthorizationToken()
  const authHeader = request.headers.get('authorization')

  return Boolean(expectedToken) && authHeader === `Bearer ${expectedToken}`
}

const getEmailFromAddress = () =>
  process.env.NEXT_PUBLIC_EMAIL_FROM || 'Olgish Cakes <hello@olgishcakes.co.uk>'

const getAlertRecipientEmail = () =>
  process.env.INSTAGRAM_TOKEN_ALERT_TO?.trim() ||
  process.env.CONTACT_EMAIL_TO ||
  'hello@olgishcakes.co.uk'

const canSendOperationalEmails = (emailMode: ReturnType<typeof getEmailTransportMode>) =>
  !requiresLiveEmailConfiguration(emailMode) || Boolean(process.env.RESEND_API_KEY)

const getConfiguredInstagramTokenExpiresAt = () => {
  const expiresAt = process.env.INSTAGRAM_TOKEN_EXPIRES_AT?.trim()
  return expiresAt && expiresAt.length > 0 ? expiresAt : null
}

const shouldForceReminder = (request: NextRequest) =>
  request.nextUrl.searchParams.get('force') === 'true'

const buildReminderSubject = (status: {
  daysRemaining: number
  isExpired: boolean
}) => {
  if (status.isExpired) {
    return 'Instagram token expired'
  }

  if (status.daysRemaining === 0) {
    return 'Instagram token expires today'
  }

  if (status.daysRemaining === 1) {
    return 'Instagram token expires tomorrow'
  }

  return `Instagram token expires in ${status.daysRemaining} days`
}

const buildReminderMessage = (status: {
  daysRemaining: number
  expiresAt: string
  isExpired: boolean
}) => {
  const expiryLabel = new Date(status.expiresAt).toLocaleString('en-GB', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Europe/London'
  })

  if (status.isExpired) {
    return [
      'The Instagram access token used by the site has expired.',
      `It expired on ${expiryLabel}.`,
      'Refresh or replace it now to avoid losing Instagram posts on the homepage.'
    ].join('\n')
  }

  if (status.daysRemaining === 0) {
    return [
      'The Instagram access token used by the site expires today.',
      `Expiry: ${expiryLabel}.`,
      'Refresh it before the expiry time so Instagram posts keep loading normally.'
    ].join('\n')
  }

  if (status.daysRemaining === 1) {
    return [
      'The Instagram access token used by the site expires tomorrow.',
      `Expiry: ${expiryLabel}.`,
      'Refresh it before the expiry time so Instagram posts keep loading normally.'
    ].join('\n')
  }

  return [
    `The Instagram access token used by the site expires in ${status.daysRemaining} days.`,
    `Expiry: ${expiryLabel}.`,
    'Refresh it before the expiry date so Instagram posts keep loading normally.'
  ].join('\n')
}

const buildReminderNote = () => [
  'Run pnpm instagram:refresh-token once the token is at least 24 hours old.',
  'Then update INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_TOKEN_EXPIRES_AT in local env and Vercel env.',
  'If the refresh fails because the token already expired, generate a new dashboard token in Meta.'
].join('\n')

async function handleRequest(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const configuredExpiresAt = getConfiguredInstagramTokenExpiresAt()

    if (!configuredExpiresAt) {
      return NextResponse.json({
        success: true,
        notificationSent: false,
        reason: 'not-configured'
      })
    }

    const emailMode = getEmailTransportMode()

    if (!canSendOperationalEmails(emailMode)) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    const expiresAt = getInstagramTokenExpiresAt(process.env)
    const alertWindowDays = getInstagramTokenAlertWindowDays(process.env)
    const reminderStatus = getInstagramTokenReminderStatus({
      alertWindowDays,
      expiresAt
    })

    if (!shouldForceReminder(request) && !reminderStatus.shouldNotify) {
      return NextResponse.json({
        success: true,
        notificationSent: false,
        reason: 'outside-alert-window',
        ...reminderStatus
      })
    }

    const recipientEmail = getAlertRecipientEmail()
    const sendResult = await sendEmail({
      templateId: 'instagram-token-refresh-alert',
      input: {
        customerName: 'Olgish Cakes team',
        customerEmail: recipientEmail,
        orderType: 'system-alert',
        productName: 'Instagram access token',
        dateNeeded: reminderStatus.expiresAt,
        titleOverride: buildReminderSubject(reminderStatus),
        intro: reminderStatus.isExpired
          ? 'The Instagram access token has expired and needs to be replaced.'
          : 'The Instagram access token is approaching expiry and needs to be refreshed.',
        message: buildReminderMessage(reminderStatus),
        note: buildReminderNote()
      },
      modeOverride: emailMode,
      message: {
        from: getEmailFromAddress(),
        to: recipientEmail,
        bcc: process.env.ADMIN_BCC_EMAIL || undefined
      }
    })

    if (!sendResult.accepted || sendResult.error) {
      console.error('Instagram token reminder email failed', {
        errorMessage: sendResult.error?.message || 'Transport did not accept reminder email',
        expiresAt: reminderStatus.expiresAt,
        daysRemaining: reminderStatus.daysRemaining,
        isExpired: reminderStatus.isExpired
      })

      return NextResponse.json(
        { error: 'Failed to send Instagram token reminder' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      notificationSent: true,
      forced: shouldForceReminder(request),
      ...reminderStatus
    })
  } catch (error) {
    console.error('Instagram token reminder route failed', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return handleRequest(request)
}

export async function POST(request: NextRequest) {
  return handleRequest(request)
}
