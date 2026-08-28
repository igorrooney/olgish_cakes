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
import type { OrdersStatusUpdateInput } from '@/lib/email/types'
import { verifyAdminAuthToken } from '@/lib/admin/auth-token'
import { CURRENT_TERMS_VERSION } from '@/lib/legal/legal-config'
import { getTermsEmailAttachment } from '@/lib/legal/terms-document'
import {
  isProductionEnvironment,
  productionRouteNotFound,
  requireSameOriginMutation
} from '@/lib/security/internal-route'
import { toSafeOperationalError } from '@/lib/security/safe-operational-error'

const testSendRequestSchema = z.object({
  templateId: z.string(),
  to: z.string().email('Valid recipient email is required'),
  input: z.unknown().optional(),
  scenarioId: z.string().optional()
})

const finalOfferTextLimit = 2000
const maxRequestBodyBytes = 32 * 1024

type BoundedJsonResult =
  | { ok: true, value: unknown }
  | { ok: false, reason: 'invalid-json' | 'too-large' }

async function readBoundedJsonBody(request: NextRequest): Promise<BoundedJsonResult> {
  const contentLength = request.headers.get('content-length')?.trim()
  if (contentLength && /^\d+$/.test(contentLength) && Number(contentLength) > maxRequestBodyBytes) {
    return { ok: false, reason: 'too-large' }
  }

  const reader = request.body?.getReader()
  if (!reader) {
    return { ok: false, reason: 'invalid-json' }
  }

  const chunks: Uint8Array[] = []
  let totalBytes = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        break
      }

      totalBytes += value.byteLength
      if (totalBytes > maxRequestBodyBytes) {
        await reader.cancel()
        return { ok: false, reason: 'too-large' }
      }
      chunks.push(value)
    }
  } catch {
    return { ok: false, reason: 'invalid-json' }
  } finally {
    reader.releaseLock()
  }

  const bodyBytes = new Uint8Array(totalBytes)
  let offset = 0
  chunks.forEach((chunk) => {
    bodyBytes.set(chunk, offset)
    offset += chunk.byteLength
  })

  try {
    const bodyText = new TextDecoder('utf-8', { fatal: true }).decode(bodyBytes)
    return { ok: true, value: JSON.parse(bodyText) as unknown }
  } catch {
    return { ok: false, reason: 'invalid-json' }
  }
}

function sanitizeOrderStatusTestInput(input: OrdersStatusUpdateInput): OrdersStatusUpdateInput {
  const isConfirmed = input.status?.trim().toLowerCase() === 'confirmed'
  const orderItems = Array.isArray(input.orderItems)
    ? input.orderItems.map((item) => ({
        productName: item.productName,
        productId: item.productId,
        productType: item.productType,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        designType: item.designType,
        filling: item.filling,
        servings: item.servings
      }))
    : undefined

  return {
    ...input,
    customerFacingOfferDescription: input.customerFacingOfferDescription?.trim(),
    allergenStatement: input.allergenStatement?.trim(),
    customerMessage: undefined,
    message: undefined,
    note: undefined,
    giftNote: undefined,
    attachmentNames: undefined,
    referenceImageUrls: undefined,
    nextSteps: undefined,
    intro: undefined,
    hasDietaryHealthInformation: undefined,
    adminUrl: undefined,
    approximateSubmittedFrom: undefined,
    orderItems,
    ...(isConfirmed
      ? {
          titleOverride: `Final Order Offer #${input.orderNumber || 'TEST'} - Olgish Cakes`,
          headingOverride: 'Your final order offer',
          statusMessage: `This email is our final written offer for the details and price shown below under terms version ${CURRENT_TERMS_VERSION}. Please accept it in writing or make the requested payment. Your contract starts only when you do so.`
        }
      : {})
  }
}

function validateConfirmedFinalOffer(input: OrdersStatusUpdateInput): string | null {
  if (input.status?.trim().toLowerCase() !== 'confirmed') {
    return null
  }

  const offerDescription = input.customerFacingOfferDescription?.trim() || ''
  const allergenStatement = input.allergenStatement?.trim() || ''

  if (offerDescription.length === 0) {
    return 'Customer-facing offer description is required for a confirmed final-offer send'
  }
  if (allergenStatement.length === 0) {
    return 'Product-specific allergen information is required for a confirmed final-offer send'
  }
  if (offerDescription.length > finalOfferTextLimit) {
    return 'Customer-facing offer description must be 2,000 characters or fewer'
  }
  if (allergenStatement.length > finalOfferTextLimit) {
    return 'Product-specific allergen information must be 2,000 characters or fewer'
  }

  return null
}

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
  if (isProductionEnvironment()) {
    return productionRouteNotFound()
  }

  const originError = requireSameOriginMutation(request)
  if (originError) {
    return originError
  }

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

  const bodyResult = await readBoundedJsonBody(request)
  if (!bodyResult.ok) {
    return reject({
      templateId: 'contact-admin-inquiry',
      recipient: '',
      actorTokenHash,
      mode: 'live',
      reason: bodyResult.reason === 'too-large'
        ? 'Request payload is too large'
        : 'Invalid JSON body',
      status: bodyResult.reason === 'too-large' ? 413 : 400
    })
  }

  const parsed = testSendRequestSchema.safeParse(bodyResult.value)
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
      reason: 'Unsupported templateId',
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
    const builtInput = buildEffectiveTemplateInput({
      templateId: templateIdRaw,
      scenarioId: parsed.data.scenarioId,
      rawInput: parsed.data.input
    })
    const input = templateIdRaw === 'orders-status-update'
      ? sanitizeOrderStatusTestInput(builtInput)
      : builtInput
    const finalOfferValidationError = templateIdRaw === 'orders-status-update'
      ? validateConfirmedFinalOffer(input)
      : null

    if (finalOfferValidationError) {
      return reject({
        templateId: templateIdRaw,
        recipient,
        actorTokenHash,
        mode: 'live',
        reason: finalOfferValidationError,
        status: 400
      })
    }

    const termsAttachment = templateIdRaw === 'orders-status-update' &&
      input.status?.trim().toLowerCase() === 'confirmed'
      ? await getTermsEmailAttachment()
      : null

    const result = await sendEmail({
      templateId: templateIdRaw,
      input,
      modeOverride: 'live',
      subjectPrefix: getSubjectPrefix(),
      message: {
        from: process.env.NEXT_PUBLIC_EMAIL_FROM || 'Olgish Cakes <hello@olgishcakes.co.uk>',
        to: recipient,
        replyTo: process.env.CONTACT_EMAIL_TO || 'hello@olgishcakes.co.uk',
        ...(termsAttachment ? { attachments: [termsAttachment] } : {})
      }
    })

    if (!result.accepted) {
      const reason = result.error
        ? toSafeOperationalError(result.error).code
        : 'TRANSPORT_REJECTED'
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
    const reason = toSafeOperationalError(error).code
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
