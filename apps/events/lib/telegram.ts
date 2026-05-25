import { z } from 'zod'

import { SITE_URL } from '@/lib/constants'
import { getBooleanEnv, getRequiredEnv } from '@/lib/env'
import type { TempDocument } from '@/lib/storage'

const TELEGRAM_TIMEOUT_MS = 25000
const TELEGRAM_CAPTION_MAX_LENGTH = 1024

const telegramMessageSchema = z.object({
  message_id: z.number()
})

const telegramSingleResponseSchema = z.discriminatedUnion('ok', [
  z.object({
    ok: z.literal(true),
    result: telegramMessageSchema
  }),
  z.object({
    ok: z.literal(false),
    description: z.string().optional()
  })
])

const telegramMediaGroupResponseSchema = z.discriminatedUnion('ok', [
  z.object({
    ok: z.literal(true),
    result: z.array(telegramMessageSchema).min(1)
  }),
  z.object({
    ok: z.literal(false),
    description: z.string().optional()
  })
])

export class TelegramDeliveryError extends Error {
  readonly messageIds: number[]

  constructor(message: string, messageIds: number[]) {
    super(message)
    this.name = 'TelegramDeliveryError'
    this.messageIds = messageIds
  }
}

export interface TelegramNotificationInput {
  requestId: string
  eventName: string
  fullName: string
  email: string
  documents: TempDocument[]
}

async function fetchTelegram(endpoint: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TELEGRAM_TIMEOUT_MS)

  try {
    return await fetch(endpoint, {
      ...init,
      signal: controller.signal
    })
  } finally {
    clearTimeout(timeout)
  }
}

async function readTelegramJson(response: Response, fallback: string): Promise<unknown> {
  try {
    return await response.json() as unknown
  } catch {
    throw new Error(fallback)
  }
}

async function readTelegramMessageId(response: Response, fallback: string): Promise<number> {
  const parsed = telegramSingleResponseSchema.safeParse(
    await readTelegramJson(response, fallback)
  )

  if (!parsed.success) {
    throw new Error(fallback)
  }

  if (!parsed.data.ok) {
    throw new Error(parsed.data.description ?? fallback)
  }

  return parsed.data.result.message_id
}

async function readTelegramMessageIds(response: Response, fallback: string): Promise<number[]> {
  const parsed = telegramMediaGroupResponseSchema.safeParse(
    await readTelegramJson(response, fallback)
  )

  if (!parsed.success) {
    throw new Error(fallback)
  }

  if (!parsed.data.ok) {
    throw new Error(parsed.data.description ?? fallback)
  }

  return parsed.data.result.map((message) => message.message_id)
}

function buildTelegramUrl(method: string): string {
  return `https://api.telegram.org/bot${getRequiredEnv('TELEGRAM_BOT_TOKEN')}/${method}`
}

function buildManagerMessage(input: TelegramNotificationInput): string {
  const adminUrl = `${SITE_URL}/admin/${input.requestId}`

  return [
    'New cake-slice image request',
    `Request ID: ${input.requestId}`,
    `Event: ${input.eventName}`,
    `Name: ${input.fullName}`,
    `Email: ${input.email}`,
    `Image count: ${input.documents.length}`,
    `Admin: ${adminUrl}`
  ].join('\n')
}

function fitTelegramCaption(text: string): string {
  if (text.length <= TELEGRAM_CAPTION_MAX_LENGTH) {
    return text
  }

  return `${text.slice(0, TELEGRAM_CAPTION_MAX_LENGTH - 3)}...`
}

async function sendDocument(
  document: TempDocument,
  caption: string
): Promise<number> {
  const formData = new FormData()
  formData.set('chat_id', getRequiredEnv('TELEGRAM_MANAGER_CHAT_ID'))
  formData.set('caption', fitTelegramCaption(caption))
  formData.set('document', document.blob, document.fileName)

  const response = await fetchTelegram(buildTelegramUrl('sendDocument'), {
    method: 'POST',
    body: formData
  })

  return readTelegramMessageId(response, 'Telegram image was not sent.')
}

async function sendDocumentGroup(input: TelegramNotificationInput): Promise<number[]> {
  const formData = new FormData()
  const media = input.documents.map((_, index) => ({
    type: 'document',
    media: `attach://document${index}`,
    ...(index === 0
      ? { caption: fitTelegramCaption(buildManagerMessage(input)) }
      : {})
  }))

  formData.set('chat_id', getRequiredEnv('TELEGRAM_MANAGER_CHAT_ID'))
  formData.set('media', JSON.stringify(media))

  input.documents.forEach((document, index) => {
    formData.set(`document${index}`, document.blob, document.fileName)
  })

  const response = await fetchTelegram(buildTelegramUrl('sendMediaGroup'), {
    method: 'POST',
    body: formData
  })

  return readTelegramMessageIds(response, 'Telegram images were not sent.')
}

export async function sendTelegramNotification(
  input: TelegramNotificationInput
): Promise<number[]> {
  if (!getBooleanEnv('TELEGRAM_NOTIFICATIONS_ENABLED', true)) {
    return []
  }

  const messageIds: number[] = []

  try {
    if (input.documents.length === 0) {
      return []
    }

    if (input.documents.length === 1) {
      messageIds.push(await sendDocument(input.documents[0], buildManagerMessage(input)))
      return messageIds
    }

    return await sendDocumentGroup(input)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Telegram delivery failed.'
    throw new TelegramDeliveryError(message, messageIds)
  }
}
