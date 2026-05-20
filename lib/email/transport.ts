import { Resend } from 'resend'
import type {
  CapturedEmail,
  EmailMessage,
  EmailSendResult,
  EmailTemplateId,
  RenderedEmail,
  SendMode
} from './types'

const capturedEmails: CapturedEmail[] = []
const maxCapturedEmails = 200

function appendCapturedEmail(email: CapturedEmail) {
  capturedEmails.push(email)
  if (capturedEmails.length > maxCapturedEmails) {
    capturedEmails.splice(0, capturedEmails.length - maxCapturedEmails)
  }
}

function buildMessage(message: EmailMessage, rendered: RenderedEmail): EmailMessage {
  const attachments = message.attachments?.map((attachment) => {
    if (!attachment.contentId) {
      return attachment
    }

    return {
      ...attachment,
      inlineContentId: attachment.contentId
    }
  })

  return {
    ...message,
    subject: rendered.subject,
    text: rendered.text,
    html: rendered.html,
    attachments
  }
}

export function getCapturedEmails(): CapturedEmail[] {
  return [...capturedEmails]
}

export function clearCapturedEmails() {
  capturedEmails.splice(0, capturedEmails.length)
}

export function getDefaultSendMode(): SendMode {
  const explicitMode = process.env.EMAIL_TRANSPORT_MODE?.trim().toLowerCase()
  if (explicitMode === 'capture' || explicitMode === 'live' || explicitMode === 'disabled') {
    return explicitMode
  }

  if (process.env.NODE_ENV === 'production') {
    return 'live'
  }

  return 'capture'
}

export function isLiveMode(mode?: SendMode): boolean {
  return (mode ?? getDefaultSendMode()) === 'live'
}

export async function deliverEmail(params: {
  mode?: SendMode
  templateId: EmailTemplateId
  message: EmailMessage
  rendered: RenderedEmail
}): Promise<EmailSendResult> {
  const mode = params.mode ?? getDefaultSendMode()
  const message = buildMessage(params.message, params.rendered)

  if (mode === 'disabled') {
    return {
      mode,
      accepted: false,
      id: null,
      error: null,
      rendered: params.rendered
    }
  }

  if (mode === 'capture') {
    const id = `capture-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    appendCapturedEmail({
      id,
      createdAt: new Date().toISOString(),
      templateId: params.templateId,
      mode,
      message,
      metadata: params.rendered.metadata
    })

    return {
      mode,
      accepted: true,
      id,
      error: null,
      rendered: params.rendered
    }
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || apiKey.trim().length === 0) {
    return {
      mode,
      accepted: false,
      id: null,
      error: { message: 'RESEND_API_KEY not configured for live email transport' },
      rendered: params.rendered
    }
  }

  try {
    const resend = new Resend(apiKey)
    const response = await resend.emails.send(message as never)

    if (response.error) {
      return {
        mode,
        accepted: false,
        id: null,
        error: { message: response.error.message || 'Failed to send email' },
        rendered: params.rendered
      }
    }

    return {
      mode,
      accepted: true,
      id: response.data?.id || null,
      error: null,
      rendered: params.rendered
    }
  } catch (error) {
    return {
      mode,
      accepted: false,
      id: null,
      error: {
        message: error instanceof Error ? error.message : 'Unknown email transport error'
      },
      rendered: params.rendered
    }
  }
}
