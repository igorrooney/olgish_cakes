/**
 * @jest-environment node
 */
import {
  buildTelegramManagerMessage,
  sendTelegramManagerNotification
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
      customerName: 'Jane Doe'
    })

    expect(result).toEqual({ sent: false, skipped: true })
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('posts the manager message to Telegram sendMessage', async () => {
    mockFetch.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }))

    const result = await sendTelegramManagerNotification({
      type: 'new-order',
      customerName: 'Jane Doe',
      customerEmail: 'jane@example.com',
      customerPhone: '07123456789',
      dateNeeded: '2026-05-01',
      productName: 'Honey Cake',
      total: 58,
      messagePreview: 'Please make it less sweet and add flowers.',
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
    expect(body?.text).toContain('New order\n\nCustomer\nName: Jane Doe')
    expect(body?.text).toContain('Total: £58.00')
    expect(body?.text).toContain('Images: 1 attached')
    expect(body?.text).toContain('Admin\nhttps://olgishcakes.co.uk/admin/orders')
    expect(body?.text).not.toContain('New order Customer')
  })

  it('returns a failure without exposing the bot token when Telegram rejects the request', async () => {
    mockFetch.mockResolvedValue(new Response(JSON.stringify({
      ok: false,
      description: 'Bad Request: chat not found'
    }), { status: 400 }))

    const result = await sendTelegramManagerNotification({
      type: 'contact-enquiry',
      customerName: 'Jane Doe'
    })

    expect(result).toEqual({
      sent: false,
      skipped: false,
      error: 'Bad Request: chat not found'
    })

    const loggedText = consoleErrorSpy.mock.calls
      .map((call) => call.map((entry) => String(entry)).join(' '))
      .join(' ')

    expect(loggedText).not.toContain('secret-token')
  })

  it('builds concise plain-text messages', () => {
    const message = buildTelegramManagerMessage({
      type: 'custom-cake-enquiry',
      customerName: 'Jane Doe',
      messagePreview: 'A'.repeat(300),
      adminPath: '/admin'
    })

    expect(message).toContain('New custom cake enquiry')
    expect(message).toContain('\n\nMessage\n')
    expect(message.length).toBeLessThanOrEqual(4096)
  })
})
