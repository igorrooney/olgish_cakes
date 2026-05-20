import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import type {
  EmailMessage,
  EmailRenderInputMap,
  EmailSendResult,
  EmailTemplateId,
  RenderedEmail,
  SendMode
} from './types'
import { renderEmailTemplate } from './renderers'
import { deliverEmail, getDefaultSendMode, isLiveMode } from './transport'

const emailLogoContentId = 'olgish-cakes-email-logo'
const emailLogoCid = `cid:${emailLogoContentId}`
const emailLogoPath = join(process.cwd(), 'public', 'images', 'olgish-cakes-email-logo.png')

interface SendEmailParams<T extends EmailTemplateId> {
  templateId: T
  input: EmailRenderInputMap[T]
  message: Omit<EmailMessage, 'subject' | 'text' | 'html'>
  modeOverride?: SendMode
  subjectPrefix?: string
}

export function getEmailTransportMode(): SendMode {
  return getDefaultSendMode()
}

export function requiresLiveEmailConfiguration(mode?: SendMode): boolean {
  return isLiveMode(mode)
}

function withInlineEmailLogo(message: Omit<EmailMessage, 'subject' | 'text' | 'html'>, html: string): Omit<EmailMessage, 'subject' | 'text' | 'html'> {
  if (!html.includes(emailLogoCid) || !existsSync(emailLogoPath)) {
    return message
  }

  const attachments = message.attachments ?? []
  if (attachments.some((attachment) => attachment.contentId === emailLogoContentId)) {
    return message
  }

  return {
    ...message,
    attachments: [
      ...attachments,
      {
        filename: 'olgish-cakes-email-logo.png',
        content: readFileSync(emailLogoPath),
        contentType: 'image/png',
        contentId: emailLogoContentId
      }
    ]
  }
}

export async function sendEmail<T extends EmailTemplateId>(
  params: SendEmailParams<T>
): Promise<EmailSendResult> {
  const rendered = renderEmailTemplate(params.templateId, params.input)
  const subjectPrefix = params.subjectPrefix?.trim()

  const finalRendered: RenderedEmail = {
    ...rendered,
    subject: subjectPrefix && subjectPrefix.length > 0
      ? `${subjectPrefix} ${rendered.subject}`
      : rendered.subject
  }

  return deliverEmail({
    mode: params.modeOverride,
    templateId: params.templateId,
    message: {
      ...withInlineEmailLogo(params.message, finalRendered.html),
      subject: finalRendered.subject,
      text: finalRendered.text,
      html: finalRendered.html
    },
    rendered: finalRendered
  })
}
