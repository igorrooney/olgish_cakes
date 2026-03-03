import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  checkRealSendRateLimit,
  getClientIpFromHeaders,
  getSubjectPrefix,
  hashToken,
  isRealSendEnabled,
  isRecipientAllowlisted,
  recordRealSendAudit
} from '@/lib/email/dev-security'
import { isEmailTemplateId } from '@/lib/email/renderers'
import { buildEffectiveTemplateInput } from '@/lib/email/dev-input'
import { sendEmail } from '@/lib/email/service'
import { verifyAdminAuthToken } from '@/lib/admin/auth-token'

const testSendRequestSchema = z.object({
  templateId: z.string(),
  to: z.string().email('Valid recipient email is required'),
  input: z.unknown().optional(),
  scenarioId: z.string().optional()
})

function getAdminAuthToken(request: NextRequest): string {
  return request.cookies.get('admin_auth_token')?.value?.trim() || ''
}

function reject(params: {
  templateId: string
  recipient: string
  actorTokenHash: string
  mode: string
  reason: string
  status: number
}) {
  recordRealSendAudit({
    timestamp: new Date().toISOString(),
    actorTokenHash: params.actorTokenHash,
    templateId: isEmailTemplateId(params.templateId)
      ? params.templateId
      : 'contact-admin-inquiry',
    recipient: params.recipient,
    outcome: 'rejected',
    reason: params.reason,
    mode: params.mode
  })

  return NextResponse.json(
    {
      accepted: false,
      reason: params.reason
    },
    { status: params.status }
  )
}

export async function POST(request: NextRequest) {
  const token = getAdminAuthToken(request)
  const actorTokenHash = token.length > 0 ? hashToken(token) : 'missing-admin-cookie'
  const ipAddress = getClientIpFromHeaders(request.headers)

  const isAuthorized = await verifyAdminAuthToken(token)
  if (!isAuthorized) {
    return reject({
      templateId: 'contact-admin-inquiry',
      recipient: '',
      actorTokenHash,
      mode: 'live',
      reason: 'Unauthorized',
      status: 401
    })
  }

  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return reject({
      templateId: 'contact-admin-inquiry',
      recipient: '',
      actorTokenHash,
      mode: 'live',
      reason: 'Invalid JSON body',
      status: 400
    })
  }

  const parsed = testSendRequestSchema.safeParse(rawBody)
  if (!parsed.success) {
    return reject({
      templateId: 'contact-admin-inquiry',
      recipient: '',
      actorTokenHash,
      mode: 'live',
      reason: 'Invalid request payload',
      status: 400
    })
  }

  const templateIdRaw = parsed.data.templateId
  const recipient = parsed.data.to.trim().toLowerCase()

  if (!isEmailTemplateId(templateIdRaw)) {
    return reject({
      templateId: templateIdRaw,
      recipient,
      actorTokenHash,
      mode: 'live',
      reason: `Unsupported templateId: ${templateIdRaw}`,
      status: 400
    })
  }

  if (!isRealSendEnabled()) {
    return reject({
      templateId: templateIdRaw,
      recipient,
      actorTokenHash,
      mode: 'live',
      reason: 'Real send is disabled (EMAIL_REAL_SEND_ENABLED is not true)',
      status: 403
    })
  }

  if (!isRecipientAllowlisted(recipient)) {
    return reject({
      templateId: templateIdRaw,
      recipient,
      actorTokenHash,
      mode: 'live',
      reason: 'Recipient is not in EMAIL_TEST_RECIPIENT_ALLOWLIST',
      status: 403
    })
  }

  const rateLimitKey = `${actorTokenHash}:${ipAddress}`
  const rateLimitResult = checkRealSendRateLimit(rateLimitKey)
  if (!rateLimitResult.allowed) {
    return reject({
      templateId: templateIdRaw,
      recipient,
      actorTokenHash,
      mode: 'live',
      reason: `Rate limit exceeded. Retry in ${rateLimitResult.retryAfterSeconds} seconds`,
      status: 429
    })
  }

  try {
    const input = buildEffectiveTemplateInput({
      templateId: templateIdRaw,
      scenarioId: parsed.data.scenarioId,
      rawInput: parsed.data.input
    })

    const result = await sendEmail({
      templateId: templateIdRaw,
      input,
      modeOverride: 'live',
      subjectPrefix: getSubjectPrefix(),
      message: {
        from: process.env.NEXT_PUBLIC_EMAIL_FROM || 'Olgish Cakes <hello@olgishcakes.co.uk>',
        to: recipient,
        replyTo: process.env.CONTACT_EMAIL_TO || 'hello@olgishcakes.co.uk'
      }
    })

    if (!result.accepted) {
      const reason = result.error?.message || 'Live transport did not accept email'
      recordRealSendAudit({
        timestamp: new Date().toISOString(),
        actorTokenHash,
        templateId: templateIdRaw,
        recipient,
        outcome: 'rejected',
        reason,
        mode: result.mode
      })

      return NextResponse.json(
        {
          accepted: false,
          reason,
          mode: result.mode
        },
        { status: 500 }
      )
    }

    recordRealSendAudit({
      timestamp: new Date().toISOString(),
      actorTokenHash,
      templateId: templateIdRaw,
      recipient,
      outcome: 'accepted',
      mode: result.mode,
      emailId: result.id || undefined
    })

    return NextResponse.json({
      accepted: true,
      mode: result.mode,
      transportId: result.id,
      subject: result.rendered.subject
    })
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Unknown send error'
    recordRealSendAudit({
      timestamp: new Date().toISOString(),
      actorTokenHash,
      templateId: templateIdRaw,
      recipient,
      outcome: 'rejected',
      reason,
      mode: 'live'
    })

    return NextResponse.json(
      {
        accepted: false,
        reason
      },
      { status: 500 }
    )
  }
}