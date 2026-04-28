import 'server-only'

import { BUSINESS_CONSTANTS } from '@/lib/constants'
import { logger } from '@/lib/logger'

export type TelegramManagerNotificationType =
  | 'new-order'
  | 'inline-order'
  | 'contact-enquiry'
  | 'custom-cake-enquiry'
  | 'workshop-enquiry'

export interface TelegramManagerNotificationInput {
  type: TelegramManagerNotificationType
  customerName: string
  customerEmail?: string
  customerPhone?: string
  dateNeeded?: string
  productName?: string
  total?: number
  messagePreview?: string
  imageCount?: number
  adminPath?: '/admin' | '/admin/orders' | `/admin/orders/${string}`
}

export interface TelegramManagerNotificationResult {
  sent: boolean
  skipped: boolean
  error?: string
}

interface TelegramApiResponse {
  ok?: boolean
  description?: string
}

const notificationTypeLabels: Record<TelegramManagerNotificationType, string> = {
  'new-order': 'New order',
  'inline-order': 'New inline order',
  'contact-enquiry': 'New contact enquiry',
  'custom-cake-enquiry': 'New custom cake enquiry',
  'workshop-enquiry': 'New workshop enquiry'
}

const maxTelegramMessageLength = 4096
const maxPreviewLength = 220
const telegramTimeoutMs = 5000

function isTelegramExplicitlyDisabled() {
  const value = process.env.TELEGRAM_NOTIFICATIONS_ENABLED?.trim().toLowerCase()
  return value === 'false' || value === '0' || value === 'off' || value === 'disabled'
}

function getTelegramConfig() {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim()
  const chatId = process.env.TELEGRAM_MANAGER_CHAT_ID?.trim()

  if (isTelegramExplicitlyDisabled() || !token || !chatId) {
    return null
  }

  return { token, chatId }
}

function truncateText(value: string, maxLength: number) {
  const normalizedValue = value.replace(/\s+/g, ' ').trim()

  if (normalizedValue.length <= maxLength) {
    return normalizedValue
  }

  return `${normalizedValue.slice(0, maxLength - 1)}...`
}

function truncateMessage(value: string, maxLength: number) {
  const normalizedValue = value
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  if (normalizedValue.length <= maxLength) {
    return normalizedValue
  }

  return `${normalizedValue.slice(0, maxLength - 1)}...`
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(value)
}

function resolveAdminUrl(path: TelegramManagerNotificationInput['adminPath']) {
  return `${BUSINESS_CONSTANTS.BASE_URL}${path || '/admin'}`
}

export function buildTelegramManagerMessage(input: TelegramManagerNotificationInput) {
  const lines = [
    notificationTypeLabels[input.type],
    '',
    'Customer',
    `Name: ${input.customerName}`
  ]

  if (input.customerPhone) {
    lines.push(`Phone: ${input.customerPhone}`)
  }

  if (input.customerEmail) {
    lines.push(`Email: ${input.customerEmail}`)
  }

  const orderLines: string[] = []

  if (input.dateNeeded) {
    orderLines.push(`Needed date: ${input.dateNeeded}`)
  }

  if (input.productName) {
    orderLines.push(`Item: ${input.productName}`)
  }

  if (typeof input.total === 'number' && Number.isFinite(input.total)) {
    orderLines.push(`Total: ${formatCurrency(input.total)}`)
  }

  if (typeof input.imageCount === 'number' && input.imageCount > 0) {
    orderLines.push(`Images: ${input.imageCount} attached`)
  }

  if (orderLines.length > 0) {
    lines.push('', 'Order', ...orderLines)
  }

  if (input.messagePreview) {
    lines.push('', 'Message', truncateText(input.messagePreview, maxPreviewLength))
  }

  lines.push('', 'Admin', resolveAdminUrl(input.adminPath))

  return truncateMessage(lines.join('\n'), maxTelegramMessageLength)
}

export async function sendTelegramManagerNotification(
  input: TelegramManagerNotificationInput
): Promise<TelegramManagerNotificationResult> {
  const config = getTelegramConfig()

  if (!config) {
    return { sent: false, skipped: true }
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), telegramTimeoutMs)

  try {
    const response = await fetch(`https://api.telegram.org/bot${config.token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: config.chatId,
        text: buildTelegramManagerMessage(input),
        link_preview_options: {
          is_disabled: true
        }
      }),
      signal: controller.signal
    })

    const data = await response.json().catch((): TelegramApiResponse => ({}))
    if (!response.ok || data.ok === false) {
      const error = data.description || `Telegram API responded with ${response.status}`
      logger.error('Telegram manager notification failed', {
        notificationType: input.type,
        error
      })
      return { sent: false, skipped: false, error }
    }

    return { sent: true, skipped: false }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Telegram notification request failed'
    logger.error('Telegram manager notification failed', {
      notificationType: input.type,
      error: errorMessage
    })
    return { sent: false, skipped: false, error: errorMessage }
  } finally {
    clearTimeout(timeoutId)
  }
}
