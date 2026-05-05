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
const mockUpload = jest.fn()
const mockRemove = jest.fn()
const mockFrom = jest.fn(() => ({ insert: mockInsert }))
const mockStorageFrom = jest.fn(() => ({ upload: mockUpload, remove: mockRemove }))
const mockCreateClient = jest.fn(() => ({
  from: mockFrom,
  storage: { from: mockStorageFrom }
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

type StringOverrides = Partial<Record<string, string | null>>

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

describe('/api/custom-cake-enquiry', () => {
  let consoleErrorSpy: jest.SpyInstance

  const buildFormData = (overrides: StringOverrides = {}) => {
    const baseData: Record<string, string | null> = {
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '+44(0)7123456789',
      date: '2026-12-25',
      occasion: 'birthday',
      requirements: 'Quote brief\nBrief: Blue florals and vanilla sponge.',
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

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    jest.clearAllMocks()
    process.env.RESEND_API_KEY = 'test-key'
    process.env.CONTACT_EMAIL_TO = 'admin@example.com'
    process.env.SUPABASE_URL = 'https://example.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
    process.env.SUPABASE_ENQUIRY_BUCKET = 'custom-cake-enquiries'
    mockedTakeEnquiryRateLimit.mockResolvedValue(createRateLimitResult())
    mockGetEmailTransportMode.mockReturnValue('disabled')
    mockRequiresLiveEmailConfiguration.mockReturnValue(false)
    mockSendEmail.mockResolvedValue(createSendResult())
    mockSendTelegramManagerNotification.mockResolvedValue({ sent: true, skipped: false })
    mockInsert.mockResolvedValue({ error: null })
    mockUpload.mockResolvedValue({
      data: {
        path: 'enquiries/reference.jpg',
        bucketId: 'custom-cake-enquiries'
      },
      error: null
    })
    mockRemove.mockResolvedValue({ data: [{ name: 'reference.jpg' }], error: null })
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('rejects non-form request bodies before persistence or rate limit work', async () => {
    const request = new NextRequest('http://localhost/api/custom-cake-enquiry', {
      method: 'POST',
      body: JSON.stringify({ fullName: 'Test User' }),
      headers: {
        'Content-Type': 'application/json',
        Cookie: 'csrf-token=valid-token'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(415)
    expect(data.error).toContain('Unsupported content type')
    expect(mockCreateClient).not.toHaveBeenCalled()
    expect(mockedTakeEnquiryRateLimit).not.toHaveBeenCalled()
  })

  it('rejects request without CSRF token', async () => {
    const formData = buildFormData()
    formData.delete('csrfToken')

    const request = new NextRequest('http://localhost/api/custom-cake-enquiry', {
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
    expect(mockUpload).not.toHaveBeenCalled()
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('rejects request with invalid CSRF token', async () => {
    ;(validateCsrfToken as jest.Mock).mockReturnValue(false)

    const formData = buildFormData({ csrfToken: 'invalid-token' })
    const request = new NextRequest('http://localhost/api/custom-cake-enquiry', {
      method: 'POST',
      body: formData,
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
    expect(mockUpload).not.toHaveBeenCalled()
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('accepts request with valid CSRF token and nullable location fields', async () => {
    ;(validateCsrfToken as jest.Mock).mockReturnValue(true)

    const formData = buildFormData()
    const request = new NextRequest('http://localhost/api/custom-cake-enquiry', {
      method: 'POST',
      body: formData,
      headers: {
        Cookie: 'csrf-token=valid-token',
        'x-forwarded-for': '10.0.0.3'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Enquiry submitted successfully')
    expect(response.headers.get('X-RateLimit-Limit')).toBe('5')
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('4')
    expect(response.headers.get('X-RateLimit-Reset')).toBe('1798192800')
    expect(response.headers.get('Retry-After')).toBeNull()
    expect(validateCsrfToken).toHaveBeenCalledWith('valid-token', 'valid-token')
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
    expect(mockFrom).toHaveBeenCalledWith('custom_cake_enquiries')
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      full_name: 'Test User',
      email: 'test@example.com',
      phone: '+44(0)7123456789',
      address: null,
      city: null,
      postcode: null,
      occasion: 'birthday',
      date_needed: '2026-12-25',
      requirements: expect.stringContaining('Brief: Blue florals and vanilla sponge.'),
      reference_image_bucket: null,
      reference_image_path: null
    }))
    expect(mockUpload).not.toHaveBeenCalled()
    expect(mockSendEmail).toHaveBeenCalledTimes(2)
    expect(mockSendEmail).toHaveBeenNthCalledWith(1, expect.objectContaining({
      templateId: 'custom-cake-enquiry-admin',
      message: expect.objectContaining({
        to: 'hello@olgishcakes.co.uk',
        replyTo: 'test@example.com'
      }),
      input: expect.objectContaining({
        address: undefined,
        city: undefined,
        postcode: undefined,
        occasion: 'Birthday'
      })
    }))
    expect(takeEnquiryRateLimit).toHaveBeenCalledWith(
      expect.objectContaining({
        from: mockFrom,
        storage: expect.objectContaining({ from: mockStorageFrom })
      }),
      expect.objectContaining({
        scope: 'custom-cake-enquiry',
        identifier: '10.0.0.3',
        maxRequests: 5,
        windowMs: 60000
      })
    )
    expect(mockSendEmail).toHaveBeenNthCalledWith(2, expect.objectContaining({
      templateId: 'custom-cake-enquiry-customer',
      message: expect.objectContaining({
        to: 'test@example.com'
      })
    }))
    expect(mockSendTelegramManagerNotification).toHaveBeenCalledWith(expect.objectContaining({
      type: 'custom-cake-enquiry',
      customerName: 'Test User',
      customerEmail: 'test@example.com',
      customerPhone: '+44(0)7123456789',
      dateNeeded: '2026-12-25',
      productName: 'birthday',
      messagePreview: expect.stringContaining('Brief: Blue florals and vanilla sponge.'),
      adminPath: '/admin'
    }))
  })

  it('rejects submissions when both email and phone are blank', async () => {
    ;(validateCsrfToken as jest.Mock).mockReturnValue(true)

    const formData = buildFormData({
      email: null,
      phone: ''
    })
    const request = new NextRequest('http://localhost/api/custom-cake-enquiry', {
      method: 'POST',
      body: formData,
      headers: {
        Cookie: 'csrf-token=valid-token',
        'x-forwarded-for': '10.0.0.30'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Validation failed')
    expect(data.details).toEqual(expect.arrayContaining([
      expect.objectContaining({
        message: 'Add an email address or phone number',
        path: ['email']
      }),
      expect.objectContaining({
        message: 'Add an email address or phone number',
        path: ['phone']
      })
    ]))
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('accepts phone-only submissions and skips the customer confirmation email', async () => {
    ;(validateCsrfToken as jest.Mock).mockReturnValue(true)

    const formData = buildFormData({
      email: null,
      phone: '+44 7000 000 111',
      occasion: ''
    })
    const request = new NextRequest('http://localhost/api/custom-cake-enquiry', {
      method: 'POST',
      body: formData,
      headers: {
        Cookie: 'csrf-token=valid-token',
        'x-forwarded-for': '10.0.0.33'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Enquiry submitted successfully')
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      email: null,
      phone: '+44 7000 000 111',
      occasion: null
    }))
    expect(mockSendEmail).toHaveBeenCalledTimes(1)
    expect(mockSendEmail).toHaveBeenCalledWith(expect.objectContaining({
      templateId: 'custom-cake-enquiry-admin',
      message: expect.objectContaining({
        replyTo: undefined
      }),
      input: expect.objectContaining({
        customerEmail: undefined,
        customerPhone: '+44 7000 000 111',
        occasion: 'Not specified'
      })
    }))
  })
  it('persists provided location fields when they are supplied', async () => {
    ;(validateCsrfToken as jest.Mock).mockReturnValue(true)

    const formData = buildFormData({
      address: '123 Test St',
      city: 'Leeds',
      postcode: 'LS1 1AA'
    })
    const request = new NextRequest('http://localhost/api/custom-cake-enquiry', {
      method: 'POST',
      body: formData,
      headers: {
        Cookie: 'csrf-token=valid-token',
        'x-forwarded-for': '10.0.0.31'
      }
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      address: '123 Test St',
      city: 'Leeds',
      postcode: 'LS1 1AA'
    }))
  })

  it('rejects an invalid postcode when one is provided', async () => {
    ;(validateCsrfToken as jest.Mock).mockReturnValue(true)

    const formData = buildFormData({ postcode: 'INVALID' })
    const request = new NextRequest('http://localhost/api/custom-cake-enquiry', {
      method: 'POST',
      body: formData,
      headers: {
        Cookie: 'csrf-token=valid-token',
        'x-forwarded-for': '10.0.0.32'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Validation failed')
    expect(data.details).toEqual(expect.arrayContaining([
      expect.objectContaining({
        message: 'Invalid UK postcode',
        path: ['postcode']
      })
    ]))
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('rejects an invalid date format server-side', async () => {
    ;(validateCsrfToken as jest.Mock).mockReturnValue(true)

    const formData = buildFormData({ date: '25/12/2026' })
    const request = new NextRequest('http://localhost/api/custom-cake-enquiry', {
      method: 'POST',
      body: formData,
      headers: {
        Cookie: 'csrf-token=valid-token',
        'x-forwarded-for': '10.0.0.34'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Validation failed')
    expect(data.details).toEqual(expect.arrayContaining([
      expect.objectContaining({
        message: 'Please select a valid date',
        path: ['date']
      })
    ]))
    expect(mockInsert).not.toHaveBeenCalled()
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('rejects a past date server-side', async () => {
    ;(validateCsrfToken as jest.Mock).mockReturnValue(true)

    const formData = buildFormData({ date: '2000-01-01' })
    const request = new NextRequest('http://localhost/api/custom-cake-enquiry', {
      method: 'POST',
      body: formData,
      headers: {
        Cookie: 'csrf-token=valid-token',
        'x-forwarded-for': '10.0.0.35'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Validation failed')
    expect(data.details).toEqual(expect.arrayContaining([
      expect.objectContaining({
        message: 'Please select today or a future date',
        path: ['date']
      })
    ]))
    expect(mockInsert).not.toHaveBeenCalled()
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('returns 500 and does not send any emails when email service is not configured', async () => {
    ;(validateCsrfToken as jest.Mock).mockReturnValue(true)
    process.env.RESEND_API_KEY = ''
    mockGetEmailTransportMode.mockReturnValue('live')
    mockRequiresLiveEmailConfiguration.mockReturnValue(true)
    mockSendEmail.mockResolvedValue(createSendResult(false, { message: 'RESEND_API_KEY not configured for live email transport' }))

    const formData = buildFormData()
    const request = new NextRequest('http://localhost/api/custom-cake-enquiry', {
      method: 'POST',
      body: formData,
      headers: {
        Cookie: 'csrf-token=valid-token',
        'x-forwarded-for': '10.0.0.11'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Email service not configured')
    expect(mockInsert).not.toHaveBeenCalled()
    expect(mockUpload).not.toHaveBeenCalled()
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('returns 500 before uploading a reference image when live email is not configured', async () => {
    ;(validateCsrfToken as jest.Mock).mockReturnValue(true)
    process.env.RESEND_API_KEY = ''
    mockGetEmailTransportMode.mockReturnValue('live')
    mockRequiresLiveEmailConfiguration.mockReturnValue(true)

    const file = new File(['image'], 'reference.jpg', { type: 'image/jpeg' })
    const formData = buildFormData()
    formData.append('referenceImage', file)

    const request = new NextRequest('http://localhost/api/custom-cake-enquiry', {
      method: 'POST',
      body: formData,
      headers: {
        Cookie: 'csrf-token=valid-token',
        'x-forwarded-for': '10.0.0.34'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Email service not configured')
    expect(mockUpload).not.toHaveBeenCalled()
    expect(mockInsert).not.toHaveBeenCalled()
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('returns 200, logs the failure, and sends a failure alert when admin email fails', async () => {
    ;(validateCsrfToken as jest.Mock).mockReturnValue(true)
    mockSendEmail
      .mockResolvedValueOnce(createSendResult(false, { message: 'Send failed' }))
      .mockResolvedValueOnce(createSendResult())
      .mockResolvedValueOnce(createSendResult())

    const formData = buildFormData()
    const request = new NextRequest('http://localhost/api/custom-cake-enquiry', {
      method: 'POST',
      body: formData,
      headers: {
        Cookie: 'csrf-token=valid-token',
        'x-forwarded-for': '10.0.0.12'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Enquiry submitted successfully')
    expect(mockInsert).toHaveBeenCalled()
    expect(mockUpload).not.toHaveBeenCalled()
    expect(mockSendEmail).toHaveBeenCalledTimes(3)
    expect(mockSendEmail).toHaveBeenNthCalledWith(3, expect.objectContaining({
      templateId: 'custom-cake-enquiry-failure-alert',
      input: expect.objectContaining({
        message: expect.stringContaining('admin-email: Send failed')
      })
    }))
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Custom cake enquiry notification failed',
      expect.objectContaining({
        step: 'admin-email',
        errorMessage: 'Send failed'
      })
    )
  })

  it('returns 200, logs the failure, and sends a failure alert when customer email fails', async () => {
    ;(validateCsrfToken as jest.Mock).mockReturnValue(true)
    mockSendEmail
      .mockResolvedValueOnce(createSendResult())
      .mockResolvedValueOnce(createSendResult(false, { message: 'Customer send failed' }))
      .mockResolvedValueOnce(createSendResult())

    const formData = buildFormData()
    const request = new NextRequest('http://localhost/api/custom-cake-enquiry', {
      method: 'POST',
      body: formData,
      headers: {
        Cookie: 'csrf-token=valid-token',
        'x-forwarded-for': '10.0.0.22'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Enquiry submitted successfully')
    expect(mockInsert).toHaveBeenCalled()
    expect(mockSendEmail).toHaveBeenCalledTimes(3)
    expect(mockSendEmail).toHaveBeenNthCalledWith(3, expect.objectContaining({
      templateId: 'custom-cake-enquiry-failure-alert',
      input: expect.objectContaining({
        message: expect.stringContaining('customer-email: Customer send failed')
      })
    }))
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Custom cake enquiry notification failed',
      expect.objectContaining({
        step: 'customer-email',
        errorMessage: 'Customer send failed'
      })
    )
  })

  it('returns 200 and sends one failure alert when both admin and customer emails fail', async () => {
    ;(validateCsrfToken as jest.Mock).mockReturnValue(true)
    mockSendEmail
      .mockResolvedValueOnce(createSendResult(false, { message: 'Admin send failed' }))
      .mockResolvedValueOnce(createSendResult(false, { message: 'Customer send failed' }))
      .mockResolvedValueOnce(createSendResult())

    const formData = buildFormData()
    const request = new NextRequest('http://localhost/api/custom-cake-enquiry', {
      method: 'POST',
      body: formData,
      headers: {
        Cookie: 'csrf-token=valid-token',
        'x-forwarded-for': '10.0.0.23'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Enquiry submitted successfully')
    expect(mockSendEmail).toHaveBeenCalledTimes(3)
    expect(mockSendEmail).toHaveBeenNthCalledWith(3, expect.objectContaining({
      templateId: 'custom-cake-enquiry-failure-alert',
      input: expect.objectContaining({
        message: expect.stringContaining('admin-email: Admin send failed')
      })
    }))
    expect(mockSendEmail).toHaveBeenNthCalledWith(3, expect.objectContaining({
      input: expect.objectContaining({
        message: expect.stringContaining('customer-email: Customer send failed')
      })
    }))
  })

  it('returns 500 when all operator-visible notifications fail after customer email succeeds', async () => {
    ;(validateCsrfToken as jest.Mock).mockReturnValue(true)
    mockSendEmail
      .mockResolvedValueOnce(createSendResult(false, { message: 'Admin send failed' }))
      .mockResolvedValueOnce(createSendResult())
      .mockResolvedValueOnce(createSendResult(false, { message: 'Failure alert send failed' }))

    const formData = buildFormData()
    const request = new NextRequest('http://localhost/api/custom-cake-enquiry', {
      method: 'POST',
      body: formData,
      headers: {
        Cookie: 'csrf-token=valid-token',
        'x-forwarded-for': '10.0.0.24'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Enquiry saved but all operator notifications failed. Please contact Olgish Cakes directly.')
    expect(mockSendEmail).toHaveBeenCalledTimes(3)
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Custom cake enquiry failure alert failed',
      expect.objectContaining({
        errorMessage: 'Failure alert send failed',
        failedSteps: ['admin-email']
      })
    )
  })

  it('returns 500 when admin email fails, customer email fails, and failure alert fails', async () => {
    ;(validateCsrfToken as jest.Mock).mockReturnValue(true)
    mockSendEmail
      .mockResolvedValueOnce(createSendResult(false, { message: 'Admin send failed' }))
      .mockResolvedValueOnce(createSendResult(false, { message: 'Customer send failed' }))
      .mockResolvedValueOnce(createSendResult(false, { message: 'Failure alert send failed' }))

    const formData = buildFormData()
    const request = new NextRequest('http://localhost/api/custom-cake-enquiry', {
      method: 'POST',
      body: formData,
      headers: {
        Cookie: 'csrf-token=valid-token',
        'x-forwarded-for': '10.0.0.35'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Enquiry saved but all operator notifications failed. Please contact Olgish Cakes directly.')
    expect(mockSendEmail).toHaveBeenCalledTimes(3)
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Custom cake enquiry failure alert failed',
      expect.objectContaining({
        errorMessage: 'Failure alert send failed',
        failedSteps: ['admin-email', 'customer-email']
      })
    )
  })

  it('returns 500 when admin email fails, customer email is skipped, and failure alert fails', async () => {
    ;(validateCsrfToken as jest.Mock).mockReturnValue(true)
    mockSendEmail
      .mockResolvedValueOnce(createSendResult(false, { message: 'Admin send failed' }))
      .mockResolvedValueOnce(createSendResult(false, { message: 'Failure alert send failed' }))

    const formData = buildFormData({
      email: null,
      phone: '+44 7000 000 111'
    })
    const request = new NextRequest('http://localhost/api/custom-cake-enquiry', {
      method: 'POST',
      body: formData,
      headers: {
        Cookie: 'csrf-token=valid-token',
        'x-forwarded-for': '10.0.0.36'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Enquiry saved but all operator notifications failed. Please contact Olgish Cakes directly.')
    expect(mockSendEmail).toHaveBeenCalledTimes(2)
    expect(mockSendEmail).toHaveBeenNthCalledWith(2, expect.objectContaining({
      templateId: 'custom-cake-enquiry-failure-alert'
    }))
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Custom cake enquiry failure alert failed',
      expect.objectContaining({
        errorMessage: 'Failure alert send failed',
        failedSteps: ['admin-email']
      })
    )
  })

  it('returns 200 when admin email fails, customer email fails, and failure alert succeeds', async () => {
    ;(validateCsrfToken as jest.Mock).mockReturnValue(true)
    mockSendEmail
      .mockResolvedValueOnce(createSendResult(false, { message: 'Admin send failed' }))
      .mockResolvedValueOnce(createSendResult(false, { message: 'Customer send failed' }))
      .mockResolvedValueOnce(createSendResult())

    const formData = buildFormData()
    const request = new NextRequest('http://localhost/api/custom-cake-enquiry', {
      method: 'POST',
      body: formData,
      headers: {
        Cookie: 'csrf-token=valid-token',
        'x-forwarded-for': '10.0.0.37'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Enquiry submitted successfully')
    expect(mockSendEmail).toHaveBeenCalledTimes(3)
  })

  it('returns 200 when admin email succeeds and customer email fails', async () => {
    ;(validateCsrfToken as jest.Mock).mockReturnValue(true)
    mockSendEmail
      .mockResolvedValueOnce(createSendResult())
      .mockResolvedValueOnce(createSendResult(false, { message: 'Customer send failed' }))
      .mockResolvedValueOnce(createSendResult())

    const formData = buildFormData()
    const request = new NextRequest('http://localhost/api/custom-cake-enquiry', {
      method: 'POST',
      body: formData,
      headers: {
        Cookie: 'csrf-token=valid-token',
        'x-forwarded-for': '10.0.0.38'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Enquiry submitted successfully')
    expect(mockSendEmail).toHaveBeenCalledTimes(3)
  })

  it('attaches reference image when provided', async () => {
    ;(validateCsrfToken as jest.Mock).mockReturnValue(true)
    const file = new File(['image'], 'reference.jpg', { type: 'image/jpeg' })
    const formData = buildFormData()
    formData.append('referenceImage', file)

    const request = new NextRequest('http://localhost/api/custom-cake-enquiry', {
      method: 'POST',
      body: formData,
      headers: {
        Cookie: 'csrf-token=valid-token',
        'x-forwarded-for': '10.0.0.4'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Enquiry submitted successfully')
    expect(mockStorageFrom).toHaveBeenCalledWith('custom-cake-enquiries')
    expect(mockUpload).toHaveBeenCalledWith(
      expect.stringMatching(/^enquiries\//),
      expect.any(File),
      expect.objectContaining({
        cacheControl: '3600',
        contentType: 'image/jpeg',
        upsert: false
      })
    )
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      reference_image_bucket: 'custom-cake-enquiries',
      reference_image_path: 'enquiries/reference.jpg',
      reference_image_name: 'reference.jpg',
      reference_image_type: 'image/jpeg',
      reference_image_size: 5
    }))
    expect(mockSendEmail).toHaveBeenNthCalledWith(1, expect.objectContaining({
      message: expect.objectContaining({
        attachments: expect.arrayContaining([
          expect.objectContaining({ filename: 'reference.jpg' })
        ])
      })
    }))
  })

  it('rejects reference image with unsupported type', async () => {
    ;(validateCsrfToken as jest.Mock).mockReturnValue(true)
    const file = new File(['not-image'], 'reference.txt', { type: 'text/plain' })
    const formData = buildFormData()
    formData.append('referenceImage', file)

    const request = new NextRequest('http://localhost/api/custom-cake-enquiry', {
      method: 'POST',
      body: formData,
      headers: {
        Cookie: 'csrf-token=valid-token',
        'x-forwarded-for': '10.0.0.5'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Reference image must be a JPEG, PNG, or HEIC file')
    expect(mockUpload).not.toHaveBeenCalled()
    expect(mockInsert).not.toHaveBeenCalled()
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('rejects reference image larger than 5MB', async () => {
    ;(validateCsrfToken as jest.Mock).mockReturnValue(true)
    const file = new File(
      [new Uint8Array(5 * 1024 * 1024 + 1)],
      'reference.png',
      { type: 'image/png' }
    )
    const formData = buildFormData()
    formData.append('referenceImage', file)

    const request = new NextRequest('http://localhost/api/custom-cake-enquiry', {
      method: 'POST',
      body: formData,
      headers: {
        Cookie: 'csrf-token=valid-token',
        'x-forwarded-for': '10.0.0.9'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Reference image must be 5MB or smaller')
    expect(mockUpload).not.toHaveBeenCalled()
    expect(mockInsert).not.toHaveBeenCalled()
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('returns 500 when Supabase config is missing', async () => {
    ;(validateCsrfToken as jest.Mock).mockReturnValue(true)
    delete process.env.SUPABASE_SERVICE_ROLE_KEY

    const formData = buildFormData()
    const request = new NextRequest('http://localhost/api/custom-cake-enquiry', {
      method: 'POST',
      body: formData,
      headers: {
        Cookie: 'csrf-token=valid-token',
        'x-forwarded-for': '10.0.0.6'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
    expect(mockUpload).not.toHaveBeenCalled()
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('returns 500 when Supabase insert fails', async () => {
    ;(validateCsrfToken as jest.Mock).mockReturnValue(true)
    mockInsert.mockResolvedValueOnce({
      error: {
        code: 'PGRST204',
        message: 'Insert failed',
        details: 'Could not find the reference_image_bucket column of custom_cake_enquiries',
        hint: null
      }
    })

    const formData = buildFormData()
    const request = new NextRequest('http://localhost/api/custom-cake-enquiry', {
      method: 'POST',
      body: formData,
      headers: {
        Cookie: 'csrf-token=valid-token',
        'x-forwarded-for': '10.0.0.7'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
    expect(mockUpload).not.toHaveBeenCalled()
    expect(mockRemove).not.toHaveBeenCalled()
    expect(mockSendEmail).not.toHaveBeenCalled()
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Supabase insert failed',
      expect.objectContaining({
        operation: 'custom_cake_enquiries.insert',
        table: 'custom_cake_enquiries',
        errorCode: 'PGRST204',
        errorMessage: 'Insert failed',
        expectedColumns: expect.arrayContaining([
          'full_name',
          'reference_image_bucket',
          'reference_image_size'
        ]),
        troubleshootingHints: expect.arrayContaining([
          'Verify the custom_cake_enquiries table exists in Supabase.',
          'A missing or renamed column is a likely cause of this insert failure.'
        ])
      })
    )
  })

  it('cleans up reference image when Supabase insert fails', async () => {
    ;(validateCsrfToken as jest.Mock).mockReturnValue(true)
    mockInsert.mockResolvedValueOnce({ error: { message: 'Insert failed' } })
    const file = new File(['image'], 'reference.jpg', { type: 'image/jpeg' })
    const formData = buildFormData()
    formData.append('referenceImage', file)

    const request = new NextRequest('http://localhost/api/custom-cake-enquiry', {
      method: 'POST',
      body: formData,
      headers: {
        Cookie: 'csrf-token=valid-token',
        'x-forwarded-for': '10.0.0.10'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
    expect(mockUpload).toHaveBeenCalled()
    expect(mockRemove).toHaveBeenCalledWith(['enquiries/reference.jpg'])
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('returns 500 when reference image upload fails', async () => {
    ;(validateCsrfToken as jest.Mock).mockReturnValue(true)
    mockUpload.mockResolvedValueOnce({ data: null, error: { message: 'Upload failed' } })
    const file = new File(['image'], 'reference.jpg', { type: 'image/jpeg' })
    const formData = buildFormData()
    formData.append('referenceImage', file)

    const request = new NextRequest('http://localhost/api/custom-cake-enquiry', {
      method: 'POST',
      body: formData,
      headers: {
        Cookie: 'csrf-token=valid-token',
        'x-forwarded-for': '10.0.0.8'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
    expect(mockInsert).not.toHaveBeenCalled()
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('rate limits by client IP even when proxy chain changes', async () => {
    ;(validateCsrfToken as jest.Mock).mockReturnValue(true)
    const clientIp = '10.0.0.250'
    mockedTakeEnquiryRateLimit.mockResolvedValueOnce(createRateLimitResult({
      currentCount: 6,
      remaining: 0,
      rateLimited: true
    }))

    const blockedFormData = buildFormData()
    const blockedRequest = new NextRequest('http://localhost/api/custom-cake-enquiry', {
      method: 'POST',
      body: blockedFormData,
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
    expect(mockUpload).not.toHaveBeenCalled()
    expect(mockInsert).not.toHaveBeenCalled()
    expect(mockSendEmail).not.toHaveBeenCalled()
    expect(takeEnquiryRateLimit).toHaveBeenCalledWith(
      expect.objectContaining({
        from: mockFrom,
        storage: expect.objectContaining({ from: mockStorageFrom })
      }),
      expect.objectContaining({
        scope: 'custom-cake-enquiry',
        identifier: clientIp
      })
    )
  })
})








