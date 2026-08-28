import 'server-only'

import { BUSINESS_CONSTANTS } from '@/lib/constants'
import { logger } from '@/lib/logger'
import { toSafeOperationalError } from '@/lib/security/safe-operational-error'

export type TelegramManagerNotificationType =
  | 'new-order'
  | 'inline-order'
  | 'contact-enquiry'
  | 'custom-cake-enquiry'
  | 'workshop-enquiry'

export interface TelegramManagerNotificationInput {
  type: TelegramManagerNotificationType
  recordReference?: string
  dateNeeded?: string
  total?: number
  imageCount?: number
  adminPath?: '/admin' | '/admin/orders' | '/admin/enquiries' | `/admin/orders/${string}` | `/admin/enquiries/${string}/${string}`
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

const notificationOperations: Record<TelegramManagerNotificationType, string> = {
  'new-order': 'telegram.notification.new-order',
  'inline-order': 'telegram.notification.inline-order',
  'contact-enquiry': 'telegram.notification.contact-enquiry',
  'custom-cake-enquiry': 'telegram.notification.custom-cake-enquiry',
  'workshop-enquiry': 'telegram.notification.workshop-enquiry'
}

const maxTelegramMessageLength = 4096
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
    notificationTypeLabels[input.type]
  ]

  if (input.recordReference) {
    lines.push('', `Reference: ${input.recordReference}`)
  }

  const orderLines: string[] = []

  if (input.dateNeeded) {
    orderLines.push(`Needed date: ${input.dateNeeded}`)
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
      const error = `TELEGRAM_HTTP_${response.status}`
      logger.error('Telegram manager notification failed', {
        operation: notificationOperations[input.type],
        code: error,
        status: response.status
      })
      return { sent: false, skipped: false, error }
    }

    return { sent: true, skipped: false }
  } catch (error) {
    const safeError = toSafeOperationalError(error)
    logger.error('Telegram manager notification failed', {
      operation: notificationOperations[input.type],
      ...safeError
    })
    return { sent: false, skipped: false, error: safeError.code }
  } finally {
    clearTimeout(timeoutId)
  }
}
