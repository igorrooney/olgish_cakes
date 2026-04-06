/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { GET, POST } from '../route'

const mockSendEmail = jest.fn()
const mockGetEmailTransportMode = jest.fn()
const mockRequiresLiveEmailConfiguration = jest.fn()

jest.mock('@/lib/email/service', () => ({
  getEmailTransportMode: () => mockGetEmailTransportMode(),
  requiresLiveEmailConfiguration: (mode: unknown) => mockRequiresLiveEmailConfiguration(mode),
  sendEmail: (...args: unknown[]) => mockSendEmail(...args)
}))

const createSendResult = (accepted = true, error: { message: string } | null = null) => ({
  mode: 'capture' as const,
  accepted,
  id: accepted ? 'email-id' : null,
  error,
  rendered: {
    subject: 'Instagram token reminder',
    text: 'Reminder text',
    html: '<p>Reminder text</p>'
  }
})

describe('/api/cron/instagram-token-reminder', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.CRON_SECRET = 'cron-secret'
    delete process.env.REVALIDATE_SECRET
    process.env.CONTACT_EMAIL_TO = 'hello@olgishcakes.co.uk'
    process.env.NEXT_PUBLIC_EMAIL_FROM = 'Olgish Cakes <hello@olgishcakes.co.uk>'
    process.env.ADMIN_BCC_EMAIL = 'admin@example.com'
    process.env.INSTAGRAM_TOKEN_EXPIRES_AT = new Date(Date.now() + (5 * 24 * 60 * 60 * 1000)).toISOString()
    process.env.INSTAGRAM_TOKEN_ALERT_WINDOW_DAYS = '10'
    process.env.RESEND_API_KEY = 'test-resend-key'
    delete process.env.INSTAGRAM_TOKEN_ALERT_TO
    mockGetEmailTransportMode.mockReturnValue('capture')
    mockRequiresLiveEmailConfiguration.mockReturnValue(false)
    mockSendEmail.mockResolvedValue(createSendResult())
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('rejects unauthorized requests', async () => {
    const request = new NextRequest('http://localhost/api/cron/instagram-token-reminder')

    const response = await GET(request)

    expect(response.status).toBe(401)
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('rejects requests that use only the revalidate secret', async () => {
    delete process.env.CRON_SECRET
    process.env.REVALIDATE_SECRET = 'revalidate-secret'

    const request = new NextRequest('http://localhost/api/cron/instagram-token-reminder', {
      headers: { authorization: 'Bearer revalidate-secret' }
    })

    const response = await GET(request)

    expect(response.status).toBe(401)
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('returns 500 when live email is required but not configured', async () => {
    mockGetEmailTransportMode.mockReturnValue('live')
    mockRequiresLiveEmailConfiguration.mockReturnValue(true)
    delete process.env.RESEND_API_KEY

    const request = new NextRequest('http://localhost/api/cron/instagram-token-reminder', {
      headers: { authorization: 'Bearer cron-secret' }
    })

    const response = await GET(request)
    const payload = await response.json()

    expect(response.status).toBe(500)
    expect(payload).toEqual({ error: 'Email service not configured' })
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('returns a no-op response when the token expiry is outside the alert window', async () => {
    process.env.INSTAGRAM_TOKEN_EXPIRES_AT = new Date(Date.now() + (20 * 24 * 60 * 60 * 1000)).toISOString()

    const request = new NextRequest('http://localhost/api/cron/instagram-token-reminder', {
      headers: { authorization: 'Bearer cron-secret' }
    })

    const response = await GET(request)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.success).toBe(true)
    expect(payload.notificationSent).toBe(false)
    expect(payload.reason).toBe('outside-alert-window')
    expect(payload.shouldNotify).toBe(false)
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('sends a reminder email when the expiry falls within the alert window', async () => {
    const request = new NextRequest('http://localhost/api/cron/instagram-token-reminder', {
      method: 'POST',
      headers: { authorization: 'Bearer cron-secret' }
    })

    const response = await POST(request)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.success).toBe(true)
    expect(payload.notificationSent).toBe(true)
    expect(payload.forced).toBe(false)
    expect(payload.shouldNotify).toBe(true)
    expect(mockSendEmail).toHaveBeenCalledWith(expect.objectContaining({
      templateId: 'instagram-token-refresh-alert',
      input: expect.objectContaining({
        productName: 'Instagram access token'
      }),
      message: expect.objectContaining({
        to: 'hello@olgishcakes.co.uk',
        bcc: 'admin@example.com'
      })
    }))
  })

  it('uses a same-day reminder subject when the token expires later today', async () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-06-05T08:00:00.000Z'))
    process.env.INSTAGRAM_TOKEN_EXPIRES_AT = '2026-06-05T22:00:00.000Z'

    const request = new NextRequest('http://localhost/api/cron/instagram-token-reminder', {
      headers: { authorization: 'Bearer cron-secret' }
    })

    const response = await GET(request)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.daysRemaining).toBe(0)
    expect(payload.isExpired).toBe(false)
    expect(mockSendEmail).toHaveBeenCalledWith(expect.objectContaining({
      input: expect.objectContaining({
        titleOverride: 'Instagram token expires today',
        message: expect.stringContaining('expires today')
      })
    }))
  })

  it('uses a tomorrow reminder subject for the next London calendar day', async () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-06-05T22:30:00.000Z'))
    process.env.INSTAGRAM_TOKEN_EXPIRES_AT = '2026-06-06T00:30:00.000Z'

    const request = new NextRequest('http://localhost/api/cron/instagram-token-reminder', {
      headers: { authorization: 'Bearer cron-secret' }
    })

    const response = await GET(request)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.daysRemaining).toBe(1)
    expect(payload.isExpired).toBe(false)
    expect(mockSendEmail).toHaveBeenCalledWith(expect.objectContaining({
      input: expect.objectContaining({
        titleOverride: 'Instagram token expires tomorrow',
        message: expect.stringContaining('expires tomorrow')
      })
    }))
  })

  it('sends an expired-token alert when the expiry date has already passed', async () => {
    process.env.INSTAGRAM_TOKEN_EXPIRES_AT = new Date(Date.now() - (24 * 60 * 60 * 1000)).toISOString()
    process.env.INSTAGRAM_TOKEN_ALERT_TO = 'alerts@example.com'

    const request = new NextRequest('http://localhost/api/cron/instagram-token-reminder', {
      headers: { authorization: 'Bearer cron-secret' }
    })

    const response = await GET(request)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.notificationSent).toBe(true)
    expect(payload.isExpired).toBe(true)
    expect(mockSendEmail).toHaveBeenCalledWith(expect.objectContaining({
      input: expect.objectContaining({
        titleOverride: 'Instagram token expired'
      }),
      message: expect.objectContaining({
        to: 'alerts@example.com'
      })
    }))
  })

  it('supports force=true for manual reminder tests', async () => {
    process.env.INSTAGRAM_TOKEN_EXPIRES_AT = new Date(Date.now() + (25 * 24 * 60 * 60 * 1000)).toISOString()

    const request = new NextRequest('http://localhost/api/cron/instagram-token-reminder?force=true', {
      headers: { authorization: 'Bearer cron-secret' }
    })

    const response = await GET(request)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.notificationSent).toBe(true)
    expect(payload.forced).toBe(true)
    expect(mockSendEmail).toHaveBeenCalledTimes(1)
  })

  it('returns a no-op response when the expiry env is missing', async () => {
    delete process.env.INSTAGRAM_TOKEN_EXPIRES_AT

    const request = new NextRequest('http://localhost/api/cron/instagram-token-reminder', {
      headers: { authorization: 'Bearer cron-secret' }
    })

    const response = await GET(request)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toEqual({
      success: true,
      notificationSent: false,
      reason: 'not-configured'
    })
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('returns a no-op response when expiry metadata is missing even if live email is unconfigured', async () => {
    delete process.env.INSTAGRAM_TOKEN_EXPIRES_AT
    mockGetEmailTransportMode.mockReturnValue('live')
    mockRequiresLiveEmailConfiguration.mockReturnValue(true)
    delete process.env.RESEND_API_KEY

    const request = new NextRequest('http://localhost/api/cron/instagram-token-reminder', {
      headers: { authorization: 'Bearer cron-secret' }
    })

    const response = await GET(request)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toEqual({
      success: true,
      notificationSent: false,
      reason: 'not-configured'
    })
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('returns 500 when the expiry env is invalid', async () => {
    process.env.INSTAGRAM_TOKEN_EXPIRES_AT = 'not-a-date'

    const request = new NextRequest('http://localhost/api/cron/instagram-token-reminder', {
      headers: { authorization: 'Bearer cron-secret' }
    })

    const response = await GET(request)
    const payload = await response.json()

    expect(response.status).toBe(500)
    expect(payload).toEqual({ error: 'INSTAGRAM_TOKEN_EXPIRES_AT must be a valid ISO-8601 date' })
  })

  it('returns 500 when the reminder email send fails', async () => {
    mockSendEmail.mockResolvedValue(createSendResult(false, { message: 'Transport did not accept reminder email' }))

    const request = new NextRequest('http://localhost/api/cron/instagram-token-reminder', {
      headers: { authorization: 'Bearer cron-secret' }
    })

    const response = await GET(request)
    const payload = await response.json()

    expect(response.status).toBe(500)
    expect(payload).toEqual({ error: 'Failed to send Instagram token reminder' })
  })
})
