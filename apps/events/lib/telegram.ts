import { z } from 'zod'

import { SITE_URL } from '@/lib/constants'
import { getBooleanEnv, getRequiredEnv } from '@/lib/env'
import type { TempDocument } from '@/lib/storage'

const TELEGRAM_TIMEOUT_MS = 25000
const TELEGRAM_CAPTION_MAX_LENGTH = 1024

const telegramResponseSchema = z.discriminatedUnion('ok', [
  z.object({
    ok: z.literal(true),
    result: z.object({
      message_id: z.number()
    })
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

async function readTelegramMessageId(response: Response, fallback: string): Promise<number> {
  const parsed = telegramResponseSchema.safeParse(await response.json() as unknown)

  if (!parsed.success) {
    throw new Error(fallback)
  }

  if (!parsed.data.ok) {
    throw new Error(parsed.data.description ?? fallback)
  }

  return parsed.data.result.message_id
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
  index: number,
  total: number,
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

  return readTelegramMessageId(response, `Telegram image ${index + 1} was not sent.`)
}

export async function sendTelegramNotification(
  input: TelegramNotificationInput
): Promise<number[]> {
  if (!getBooleanEnv('TELEGRAM_NOTIFICATIONS_ENABLED', true)) {
    return []
  }

  const messageIds: number[] = []

  try {
    for (let index = 0; index < input.documents.length; index += 1) {
      const caption = index === 0
        ? buildManagerMessage(input)
        : `Request ${input.requestId}: image ${index + 1}/${input.documents.length}`

      messageIds.push(
        await sendDocument(input.documents[index], index, input.documents.length, caption)
      )
    }

    return messageIds
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Telegram delivery failed.'
    throw new TelegramDeliveryError(message, messageIds)
  }
}
