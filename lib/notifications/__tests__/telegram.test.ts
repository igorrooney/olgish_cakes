/**
 * @jest-environment node
 */
import {
  buildTelegramManagerMessage,
  sendTelegramManagerNotification,
  type TelegramManagerNotificationInput
} from '@/lib/notifications/telegram'

describe('Telegram manager notifications', () => {
  const originalTelegramBotToken = process.env.TELEGRAM_BOT_TOKEN
  const originalTelegramManagerChatId = process.env.TELEGRAM_MANAGER_CHAT_ID
  const originalTelegramNotificationsEnabled = process.env.TELEGRAM_NOTIFICATIONS_ENABLED
  let mockFetch: jest.MockedFunction<typeof fetch>
  let consoleErrorSpy: jest.SpyInstance

  const restoreEnv = (key: string, value: string | undefined) => {
    if (typeof value === 'string') {
      process.env[key] = value
    } else {
      delete process.env[key]
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useRealTimers()
    process.env.TELEGRAM_BOT_TOKEN = 'secret-token'
    process.env.TELEGRAM_MANAGER_CHAT_ID = '123456'
    delete process.env.TELEGRAM_NOTIFICATIONS_ENABLED
    mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>
    global.fetch = mockFetch
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    restoreEnv('TELEGRAM_BOT_TOKEN', originalTelegramBotToken)
    restoreEnv('TELEGRAM_MANAGER_CHAT_ID', originalTelegramManagerChatId)
    restoreEnv('TELEGRAM_NOTIFICATIONS_ENABLED', originalTelegramNotificationsEnabled)
    consoleErrorSpy.mockRestore()
  })

  it('skips when Telegram credentials are missing', async () => {
    delete process.env.TELEGRAM_BOT_TOKEN

    const result = await sendTelegramManagerNotification({
      type: 'new-order',
      recordReference: 'OC-1001'
    })

    expect(result).toEqual({ sent: false, skipped: true })
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('posts the manager message to Telegram sendMessage', async () => {
    mockFetch.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }))

    const result = await sendTelegramManagerNotification({
      type: 'new-order',
      recordReference: 'OC-1001',
      dateNeeded: '2026-05-01',
      total: 58,
      imageCount: 1,
      adminPath: '/admin/orders'
    })

    expect(result).toEqual({ sent: true, skipped: false })
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.telegram.org/botsecret-token/sendMessage',
      expect.objectContaining({
        method: 'POST',
        signal: expect.any(AbortSignal)
      })
    )

    const fetchOptions = mockFetch.mock.calls[0]?.[1]
    const body = typeof fetchOptions?.body === 'string'
      ? JSON.parse(fetchOptions.body) as {
        chat_id: string
        text: string
        link_preview_options?: { is_disabled?: boolean }
      }
      : null

    expect(body).toMatchObject({
      chat_id: '123456',
      link_preview_options: {
        is_disabled: true
      }
    })
    expect(body?.text).toContain('New order\n\nReference: OC-1001')
    expect(body?.text).toContain('Total: £58.00')
    expect(body?.text).toContain('Images: 1 attached')
    expect(body?.text).toContain('Admin\nhttps://olgishcakes.co.uk/admin/orders')
    expect(body?.text).not.toContain('Jane Doe')
    expect(body?.text).not.toContain('Please make it less sweet')
    expect(body?.text).not.toContain('Honey Cake')
    expect(body?.text).not.toContain('New order Customer')
  })

  it('returns a failure without exposing the bot token when Telegram rejects the request', async () => {
    mockFetch.mockResolvedValue(new Response(JSON.stringify({
      ok: false,
      description: 'Bad Request: chat not found'
    }), { status: 400 }))

    const result = await sendTelegramManagerNotification({
      type: 'contact-enquiry',
      recordReference: '42'
    })

    expect(result).toEqual({
      sent: false,
      skipped: false,
      error: 'TELEGRAM_HTTP_400'
    })

    const loggedText = JSON.stringify(consoleErrorSpy.mock.calls)

    expect(loggedText).not.toContain('secret-token')
    expect(loggedText).not.toContain('chat not found')
    expect(loggedText).not.toContain('Telegram manager notification failed')
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringMatching(/^\[ERROR\] /),
      {
        operation: 'telegram.notification.contact-enquiry',
        code: 'TELEGRAM_HTTP_400',
        status: 400
      }
    )
  })

  it('ignores legacy customer-authored product text even if a caller supplies it', () => {
    const input = {
      type: 'new-order',
      recordReference: 'OC-1002',
      productName: 'SENTINEL-CUSTOMER-FREE-TEXT',
      adminPath: '/admin/orders/OC-1002'
    } as TelegramManagerNotificationInput & { productName: string }

    const message = buildTelegramManagerMessage(input)

    expect(message).not.toContain('SENTINEL-CUSTOMER-FREE-TEXT')
    expect(message).toContain('Reference: OC-1002')
  })

  it('ignores protected-health presence and content even if legacy extra properties are supplied', () => {
    const input = {
      type: 'contact-enquiry',
      recordReference: 'CONTACT-HEALTH-1',
      hasDietaryHealthInformation: true,
      dietaryHealthInformation: 'SENTINEL-PROTECTED-HEALTH-CONTENT',
      adminPath: '/admin/enquiries/contact/CONTACT-HEALTH-1'
    } as TelegramManagerNotificationInput & {
      hasDietaryHealthInformation: boolean
      dietaryHealthInformation: string
    }

    const message = buildTelegramManagerMessage(input)

    expect(message).toContain('Reference: CONTACT-HEALTH-1')
    expect(message).not.toContain('SENTINEL-PROTECTED-HEALTH-CONTENT')
    expect(message).not.toContain('Protected health information')
    expect(message).not.toContain('health information')
  })

  it('builds concise plain-text messages', () => {
    const message = buildTelegramManagerMessage({
      type: 'custom-cake-enquiry',
      recordReference: '42',
      imageCount: 2,
      adminPath: '/admin/enquiries/custom-cake/42'
    })

    expect(message).toContain('New custom cake enquiry')
    expect(message).toContain('Reference: 42')
    expect(message).toContain('Images: 2 attached')
    expect(message).not.toContain('Customer')
    expect(message).not.toContain('Message')
    expect(message.length).toBeLessThanOrEqual(4096)
  })
})
