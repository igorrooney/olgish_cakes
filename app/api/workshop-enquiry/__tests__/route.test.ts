/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { validateCsrfToken } from '@/lib/csrf'
import type { EnquiryRateLimitResult } from '@/lib/enquiry-rate-limit'
import { takeEnquiryRateLimit } from '@/lib/enquiry-rate-limit'
import { POST } from '../route'

const mockSendEmail = jest.fn()
const mockSendTelegramManagerNotification = jest.fn()
const mockGetEmailTransportMode = jest.fn(() => 'disabled')
const mockRequiresLiveEmailConfiguration = jest.fn(() => false)
const mockInsert = jest.fn()
const mockFrom = jest.fn(() => ({ insert: mockInsert }))
const mockCreateClient = jest.fn(() => ({
  from: mockFrom
}))
const mockedTakeEnquiryRateLimit = takeEnquiryRateLimit as jest.MockedFunction<typeof takeEnquiryRateLimit>

jest.mock('@/lib/csrf', () => ({
  validateCsrfToken: jest.fn()
}))

jest.mock('@/lib/enquiry-rate-limit', () => {
  const actual = jest.requireActual('@/lib/enquiry-rate-limit')

  return {
    ...actual,
    takeEnquiryRateLimit: jest.fn()
  }
})

jest.mock('@supabase/supabase-js', () => ({
  createClient: (...args: unknown[]) => mockCreateClient(...args)
}))

jest.mock('@/lib/email/service', () => ({
  getEmailTransportMode: () => mockGetEmailTransportMode(),
  requiresLiveEmailConfiguration: (...args: unknown[]) => mockRequiresLiveEmailConfiguration(...args),
  sendEmail: (...args: unknown[]) => mockSendEmail(...args)
}))

jest.mock('@/lib/notifications/telegram', () => ({
  sendTelegramManagerNotification: (...args: unknown[]) => mockSendTelegramManagerNotification(...args)
}))

const createSendResult = (accepted = true, error: { message: string } | null = null) => ({
  mode: 'disabled',
  accepted,
  id: accepted ? 'email-id' : null,
  error,
  rendered: {
    subject: 'Test subject',
    text: 'Test body',
    html: '<p>Test body</p>'
  }
  })

type StringOverrides = Partial<Record<string, string | null>>
const fixedWorkshopNow = new Date('2026-12-24T12:00:00.000Z')
const workshopTodayDate = '2026-12-24'
const workshopTomorrowDate = '2026-12-25'
const notificationFailureErrorMessage =
  'Enquiry saved but all operator notifications failed. Please contact Olgish Cakes directly.'

const createRateLimitResult = (
  overrides: Partial<EnquiryRateLimitResult> = {}
): EnquiryRateLimitResult => ({
  limit: 5,
  currentCount: 1,
  remaining: 4,
  resetAt: Date.parse('2026-12-25T10:00:00.000Z'),
  retryAfterSeconds: 60,
  rateLimited: false,
  ...overrides
})

function buildFormData(overrides: StringOverrides = {}) {
  const baseData: Record<string, string | null> = {
    fullName: 'Test User',
    email: 'test@example.com',
    phone: '',
    eventType: 'Corporate event',
    groupSize: '18 guests',
    location: 'Shoreditch, London',
    preferredDate: '2026-12-25',
    decorationTheme: 'Soft florals',
    brief: 'Office team social with a calm, polished decoration direction.',
    csrfToken: 'valid-token',
    ...overrides
  }

  const formData = new FormData()
  Object.entries(baseData).forEach(([key, value]) => {
    if (typeof value === 'string') {
      formData.append(key, value)
    }
  })

  return formData
}

describe('/api/workshop-enquiry', () => {
  let consoleErrorSpy: jest.SpyInstance
  const originalUrl = process.env.SUPABASE_URL
  const originalServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    jest.clearAllMocks()
    process.env.RESEND_API_KEY = 'test-key'
    process.env.CONTACT_EMAIL_TO = 'admin@example.com'
    process.env.SUPABASE_URL = 'https://example.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
    mockedTakeEnquiryRateLimit.mockResolvedValue(createRateLimitResult())
    mockGetEmailTransportMode.mockReturnValue('disabled')
    mockRequiresLiveEmailConfiguration.mockReturnValue(false)
    mockSendEmail.mockResolvedValue(createSendResult())
    mockSendTelegramManagerNotification.mockResolvedValue({ sent: true, skipped: false })
    mockInsert.mockResolvedValue({ error: null })
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
    process.env.SUPABASE_URL = originalUrl
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceRoleKey
  })

  it('rejects a request without a csrf token', async () => {
    const formData = buildFormData()
    formData.delete('csrfToken')

    const request = new NextRequest('http://localhost/api/workshop-enquiry', {
      method: 'POST',
      body: formData,
      headers: {
        Cookie: 'csrf-token=valid-token',
        'x-forwarded-for': '10.0.0.1'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('CSRF token missing')
    expect(takeEnquiryRateLimit).not.toHaveBeenCalled()
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('rejects a request with an invalid csrf token', async () => {
    ;(validateCsrfToken as jest.Mock).mockReturnValue(false)

    const request = new NextRequest('http://localhost/api/workshop-enquiry', {
      method: 'POST',
      body: buildFormData({ csrfToken: 'invalid-token' }),
      headers: {
        Cookie: 'csrf-token=invalid-token',
        'x-forwarded-for': '10.0.0.2'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('Invalid CSRF token')
    expect(validateCsrfToken).toHaveBeenCalledWith('invalid-token', 'invalid-token')
    expect(takeEnquiryRateLimit).not.toHaveBeenCalled()
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('requires an email address even when a phone number is provided', async () => {
    ;(validateCsrfToken as jest.Mock).mockReturnValue(true)

    const request = new NextRequest('http://localhost/api/workshop-enquiry', {
      method: 'POST',
      body: buildFormData({
        email: '',
        phone: '+44 7000 000 111'
      }),
      headers: {
        Cookie: 'csrf-token=valid-token',
        'x-forwarded-for': '10.0.0.3'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Validation failed')
    expect(data.details).toEqual(expect.arrayContaining([
      expect.objectContaining({
        message: 'Please add an email address',
        path: ['email']
      })
    ]))
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('rejects malformed workshop dates before persistence', async () => {
    ;(validateCsrfToken as jest.Mock).mockReturnValue(true)

    const request = new NextRequest('http://localhost/api/workshop-enquiry', {
      method: 'POST',
      body: buildFormData({ preferredDate: '2026-12-40' }),
      headers: {
        Cookie: 'csrf-token=valid-token',
        'x-forwarded-for': '10.0.0.4'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Validation failed')
    expect(data.details).toEqual(expect.arrayContaining([
      expect.objectContaining({
        message: 'Please select a valid date',
        path: ['preferredDate']
      })
    ]))
    expect(mockInsert).not.toHaveBeenCalled()
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('rejects same-day workshop dates and requires a future date', async () => {
    jest.useFakeTimers()
    jest.setSystemTime(fixedWorkshopNow)

    try {
      ;(validateCsrfToken as jest.Mock).mockReturnValue(true)

      const request = new NextRequest('http://localhost/api/workshop-enquiry', {
        method: 'POST',
        body: buildFormData({ preferredDate: workshopTodayDate }),
        headers: {
          Cookie: 'csrf-token=valid-token',
          'x-forwarded-for': '10.0.0.5'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
      expect(data.details).toEqual(expect.arrayContaining([
        expect.objectContaining({
          message: 'Please select a future date',
          path: ['preferredDate']
        })
      ]))
      expect(mockInsert).not.toHaveBeenCalled()
      expect(mockSendEmail).not.toHaveBeenCalled()
    } finally {
      jest.useRealTimers()
    }
  })

  it('saves the enquiry in Supabase and sends both emails for a tomorrow workshop date', async () => {
    jest.useFakeTimers()
    jest.setSystemTime(fixedWorkshopNow)

    try {
      ;(validateCsrfToken as jest.Mock).mockReturnValue(true)

      const request = new NextRequest('http://localhost/api/workshop-enquiry', {
        method: 'POST',
        body: buildFormData({ preferredDate: workshopTomorrowDate }),
        headers: {
          Cookie: 'csrf-token=valid-token',
          'x-forwarded-for': '10.0.0.6'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Workshop enquiry submitted successfully')
      expect(response.headers.get('X-RateLimit-Limit')).toBe('5')
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('4')
      expect(response.headers.get('X-RateLimit-Reset')).toBe('1798192800')
      expect(response.headers.get('Retry-After')).toBeNull()
      expect(mockCreateClient).toHaveBeenCalledWith(
        'https://example.supabase.co',
        'test-service-role-key',
        expect.objectContaining({
          auth: expect.objectContaining({
            autoRefreshToken: false,
            persistSession: false
          })
        })
      )
      expect(takeEnquiryRateLimit).toHaveBeenCalledWith(
        expect.objectContaining({ from: mockFrom }),
        expect.objectContaining({
          scope: 'workshop-enquiry',
          identifier: '10.0.0.6',
          maxRequests: 5,
          windowMs: 60000
        })
      )
      expect(mockFrom).toHaveBeenCalledWith('workshop_enquiries')
      expect(mockInsert).toHaveBeenCalledWith({
        full_name: 'Test User',
        email: 'test@example.com',
        phone: null,
        event_type: 'Corporate event',
        group_size: '18 guests',
        location: 'Shoreditch, London',
        preferred_date: workshopTomorrowDate,
        decoration_theme: 'Soft florals',
        brief: 'Office team social with a calm, polished decoration direction.'
      })
      expect(mockSendEmail).toHaveBeenCalledTimes(2)
      expect(mockSendEmail).toHaveBeenNthCalledWith(1, expect.objectContaining({
        templateId: 'workshop-enquiry-admin',
        input: expect.objectContaining({
          customerName: 'Test User',
          customerEmail: 'test@example.com',
          customerPhone: undefined,
          occasion: 'Corporate event'
        }),
        message: expect.objectContaining({
          to: 'admin@example.com',
          replyTo: 'test@example.com'
        })
      }))
      expect(mockSendEmail).toHaveBeenNthCalledWith(2, expect.objectContaining({
        templateId: 'workshop-enquiry-customer',
        message: expect.objectContaining({
          to: 'test@example.com',
          replyTo: 'admin@example.com'
        })
      }))
      expect(mockSendTelegramManagerNotification).toHaveBeenCalledWith(expect.objectContaining({
        type: 'workshop-enquiry',
        customerName: 'Test User',
        customerEmail: 'test@example.com',
        customerPhone: undefined,
        dateNeeded: workshopTomorrowDate,
        productName: 'Corporate event',
        messagePreview: 'Office team social with a calm, polished decoration direction.',
        adminPath: '/admin'
      }))
    } finally {
      jest.useRealTimers()
    }
  })

  it('returns 200 and sends a failure alert when admin email fails', async () => {
    ;(validateCsrfToken as jest.Mock).mockReturnValue(true)
    mockSendEmail
      .mockResolvedValueOnce(createSendResult(false, { message: 'Admin send failed' }))
      .mockResolvedValueOnce(createSendResult())
      .mockResolvedValueOnce(createSendResult())

    const request = new NextRequest('http://localhost/api/workshop-enquiry', {
      method: 'POST',
      body: buildFormData(),
      headers: {
        Cookie: 'csrf-token=valid-token',
        'x-forwarded-for': '10.0.0.7'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Workshop enquiry submitted successfully')
    expect(mockSendEmail).toHaveBeenCalledTimes(3)
    expect(mockSendEmail).toHaveBeenNthCalledWith(3, expect.objectContaining({
      templateId: 'workshop-enquiry-failure-alert',
      input: expect.objectContaining({
        message: expect.stringContaining('admin-email: Admin send failed')
      })
    }))
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Workshop enquiry notification failed',
      expect.objectContaining({
        step: 'admin-email',
        errorMessage: 'Admin send failed'
      })
    )
  })

  it('returns 200 when customer email fails but operator visibility is preserved', async () => {
    ;(validateCsrfToken as jest.Mock).mockReturnValue(true)
    mockSendEmail
      .mockResolvedValueOnce(createSendResult())
      .mockResolvedValueOnce(createSendResult(false, { message: 'Customer send failed' }))
      .mockResolvedValueOnce(createSendResult())

    const request = new NextRequest('http://localhost/api/workshop-enquiry', {
      method: 'POST',
      body: buildFormData(),
      headers: {
        Cookie: 'csrf-token=valid-token',
        'x-forwarded-for': '10.0.0.8'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Workshop enquiry submitted successfully')
    expect(mockSendEmail).toHaveBeenCalledTimes(3)
    expect(mockSendEmail).toHaveBeenNthCalledWith(3, expect.objectContaining({
      templateId: 'workshop-enquiry-failure-alert',
      input: expect.objectContaining({
        message: expect.stringContaining('customer-email: Customer send failed')
      })
    }))
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Workshop enquiry notification failed',
      expect.objectContaining({
        step: 'customer-email',
        errorMessage: 'Customer send failed'
      })
    )
  })

  it('returns 500 when live email is not configured and skips persistence', async () => {
    process.env.RESEND_API_KEY = ''
    mockGetEmailTransportMode.mockReturnValue('live')
    mockRequiresLiveEmailConfiguration.mockReturnValue(true)

    const request = new NextRequest('http://localhost/api/workshop-enquiry', {
      method: 'POST',
      body: buildFormData(),
      headers: {
        Cookie: 'csrf-token=valid-token',
        'x-forwarded-for': '10.0.0.9'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Email service not configured')
    expect(mockInsert).not.toHaveBeenCalled()
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('returns 500 when all operator-visible notifications fail after the enquiry is saved', async () => {
    ;(validateCsrfToken as jest.Mock).mockReturnValue(true)
    mockSendEmail
      .mockResolvedValueOnce(createSendResult(false, { message: 'Admin send failed' }))
      .mockResolvedValueOnce(createSendResult())
      .mockResolvedValueOnce(createSendResult(false, { message: 'Failure alert send failed' }))

    const request = new NextRequest('http://localhost/api/workshop-enquiry', {
      method: 'POST',
      body: buildFormData(),
      headers: {
        Cookie: 'csrf-token=valid-token',
        'x-forwarded-for': '10.0.0.10'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe(notificationFailureErrorMessage)
    expect(mockInsert).toHaveBeenCalledTimes(1)
    expect(mockSendEmail).toHaveBeenCalledTimes(3)
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Workshop enquiry failure alert failed',
      expect.objectContaining({
        errorMessage: 'Failure alert send failed',
        failedSteps: ['admin-email']
      })
    )
  })

  it('returns 500 when admin, customer, and failure alert emails all fail', async () => {
    ;(validateCsrfToken as jest.Mock).mockReturnValue(true)
    mockSendEmail
      .mockResolvedValueOnce(createSendResult(false, { message: 'Admin send failed' }))
      .mockResolvedValueOnce(createSendResult(false, { message: 'Customer send failed' }))
      .mockResolvedValueOnce(createSendResult(false, { message: 'Failure alert send failed' }))

    const request = new NextRequest('http://localhost/api/workshop-enquiry', {
      method: 'POST',
      body: buildFormData(),
      headers: {
        Cookie: 'csrf-token=valid-token',
        'x-forwarded-for': '10.0.0.10'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe(notificationFailureErrorMessage)
    expect(mockInsert).toHaveBeenCalledTimes(1)
    expect(mockSendEmail).toHaveBeenCalledTimes(3)
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Workshop enquiry failure alert failed',
      expect.objectContaining({
        errorMessage: 'Failure alert send failed',
        failedSteps: ['admin-email', 'customer-email']
      })
    )
  })

  it('returns 500 when the Supabase admin credentials are missing', async () => {
    ;(validateCsrfToken as jest.Mock).mockReturnValue(true)
    delete process.env.SUPABASE_SERVICE_ROLE_KEY

    const request = new NextRequest('http://localhost/api/workshop-enquiry', {
      method: 'POST',
      body: buildFormData(),
      headers: {
        Cookie: 'csrf-token=valid-token',
        'x-forwarded-for': '10.0.0.11'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('returns 500 when the Supabase insert fails and does not send emails', async () => {
    ;(validateCsrfToken as jest.Mock).mockReturnValue(true)
    mockInsert.mockResolvedValue({
      error: {
        message: 'Insert failed',
        code: '23502',
        details: 'null value in column',
        hint: null
      }
    })

    const request = new NextRequest('http://localhost/api/workshop-enquiry', {
      method: 'POST',
      body: buildFormData(),
      headers: {
        Cookie: 'csrf-token=valid-token',
        'x-forwarded-for': '10.0.0.12'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
    expect(mockSendEmail).not.toHaveBeenCalled()
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Workshop enquiry insert failed',
      expect.objectContaining({
        operation: 'workshop_enquiries.insert',
        table: 'workshop_enquiries',
        errorCode: '23502'
      })
    )
  })

  it('rate limits by client ip when requests exceed the limit', async () => {
    const clientIp = '10.0.0.99'
    ;(validateCsrfToken as jest.Mock).mockReturnValue(true)
    mockedTakeEnquiryRateLimit.mockResolvedValueOnce(createRateLimitResult({
      currentCount: 6,
      remaining: 0,
      rateLimited: true
    }))

    const blockedRequest = new NextRequest('http://localhost/api/workshop-enquiry', {
      method: 'POST',
      body: buildFormData(),
      headers: {
        Cookie: 'csrf-token=valid-token',
        'x-forwarded-for': `${clientIp}, 172.16.0.1`
      }
    })

    const blockedResponse = await POST(blockedRequest)
    const blockedData = await blockedResponse.json()

    expect(blockedResponse.status).toBe(429)
    expect(blockedData.error).toBe('Too many requests. Please try again later.')
    expect(blockedResponse.headers.get('X-RateLimit-Limit')).toBe('5')
    expect(blockedResponse.headers.get('X-RateLimit-Remaining')).toBe('0')
    expect(blockedResponse.headers.get('X-RateLimit-Reset')).toBe('1798192800')
    expect(blockedResponse.headers.get('Retry-After')).toBe('60')
    expect(takeEnquiryRateLimit).toHaveBeenCalledWith(
      expect.objectContaining({ from: mockFrom }),
      expect.objectContaining({
        scope: 'workshop-enquiry',
        identifier: clientIp
      })
    )
  })
})
