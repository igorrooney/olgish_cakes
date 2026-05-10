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
      ...params.message,
      subject: finalRendered.subject,
      text: finalRendered.text,
      html: finalRendered.html
    },
    rendered: finalRendered
  })
}
