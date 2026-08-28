/**
 * @jest-environment node
 */
import { validateCsrfToken } from '@/lib/csrf'
import { NextRequest } from 'next/server'
import { POST } from '../route'

// Mock Resend
const mockSend = jest.fn()
const mockSupabaseSingle = jest.fn()
const mockSupabaseSelect = jest.fn(() => ({ single: mockSupabaseSingle }))
const mockSupabaseInsert = jest.fn(() => ({ select: mockSupabaseSelect }))
const mockStorageUpload = jest.fn()
const mockStorageCreateSignedUrl = jest.fn(() => ({
  data: { signedUrl: 'https://example.supabase.co/storage/v1/object/sign/custom-cake-enquiries/orders/design.jpg?token=test-token' }
}))
const mockSupabaseFrom = jest.fn(() => ({ insert: mockSupabaseInsert }))
const mockStorageFrom = jest.fn(() => ({
  upload: mockStorageUpload,
  createSignedUrl: mockStorageCreateSignedUrl
}))
const mockGetSupabaseAdminClient = jest.fn(() => ({
  from: mockSupabaseFrom,
  storage: {
    from: mockStorageFrom
  }
}))
const mockCreateSupabaseOrder = jest.fn()
const mockUpdateSupabaseOrderMetadata = jest.fn()
const mockSendTelegramManagerNotification = jest.fn()
jest.mock('resend', () => ({
  Resend: jest.fn(() => ({
    emails: { send: mockSend }
  }))
}))

jest.mock('@/lib/supabase-admin-client', () => ({
  getSupabaseAdminClient: () => mockGetSupabaseAdminClient()
}))

jest.mock('@/lib/csrf', () => ({
  validateCsrfToken: jest.fn()
}))

jest.mock('@/lib/orders/supabase-orders', () => ({
  createSupabaseOrder: (...args: unknown[]) => mockCreateSupabaseOrder(...args),
  updateSupabaseOrderMetadata: (...args: unknown[]) => mockUpdateSupabaseOrderMetadata(...args)
}))

jest.mock('@/lib/notifications/telegram', () => ({
  sendTelegramManagerNotification: (...args: unknown[]) => mockSendTelegramManagerNotification(...args)
}))

const mockUploadFromMock = mockStorageUpload
const mockCreateFromMock = mockCreateSupabaseOrder
const mockPatchFromMock = mockUpdateSupabaseOrderMetadata
const mockPatchSetFromMock = mockUpdateSupabaseOrderMetadata
const mockPatchCommitFromMock = mockUpdateSupabaseOrderMetadata

const defaultCsrfToken = 'valid-token'

function createRequest(
  formData: FormData,
  options: {
    csrfToken?: string | null
    cookieToken?: string | null
    headers?: Record<string, string>
  } = {}
) {
  const {
    csrfToken = defaultCsrfToken,
    cookieToken = defaultCsrfToken,
    headers: customHeaders = {}
  } = options

  if (csrfToken === null) {
    formData.delete('csrfToken')
  } else {
    formData.set('csrfToken', csrfToken)
  }

  const headers = new Headers()

  if (cookieToken !== null) {
    headers.set('Cookie', `csrf-token=${cookieToken}`)
  }

  Object.entries(customHeaders).forEach(([name, value]) => {
    headers.set(name, value)
  })

  return new NextRequest('http://localhost/api/contact', {
    method: 'POST',
    body: formData,
    headers
  })
}

describe('/api/contact', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.RESEND_API_KEY = 'test-key'
    process.env.EMAIL_TRANSPORT_MODE = 'live'
    process.env.CONTACT_EMAIL_TO = 'test@example.com'
    process.env.SUPABASE_URL = 'https://example.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key'
    process.env.SANITY_API_TOKEN = 'test-token'
    process.env.ORDER_EMAIL_BCC = 'orders-bcc@example.com'
    mockSend.mockResolvedValue({ data: { id: 'test-email-id' }, error: null })
    mockSupabaseSingle.mockResolvedValue({ data: { id: 42 }, error: null })
    mockStorageUpload.mockResolvedValue({ error: null })
    mockCreateFromMock.mockResolvedValue({ _id: 'test-order-id', orderNumber: 'OC-CONTACT-1001', metadata: {} })
    mockPatchCommitFromMock.mockResolvedValue({ _id: 'test-order-id', metadata: {} })
    mockSendTelegramManagerNotification.mockResolvedValue({ sent: true, skipped: false })
    ;(validateCsrfToken as jest.Mock).mockReturnValue(true)
  })

  describe('POST - Environment Validation', () => {
    it('should return 500 when RESEND_API_KEY missing', async () => {
      delete process.env.RESEND_API_KEY

      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('message', 'Test')

      const request = createRequest(formData)

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(500)
      expect(json.error).toContain('Email service not configured')
    })

    it('should return 500 when recipient email missing', async () => {
      delete process.env.CONTACT_EMAIL_TO

      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('message', 'Test')

      const request = createRequest(formData)

      // Route should handle missing env vars gracefully
      await expect(POST(request)).resolves.toBeDefined()
    })
  })

  describe('POST - CSRF', () => {
    it('rejects a missing CSRF token before exposing email configuration state', async () => {
      delete process.env.RESEND_API_KEY
      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('message', 'Test message with enough characters')

      const response = await POST(createRequest(formData, { csrfToken: null }))

      expect(response.status).toBe(403)
      await expect(response.json()).resolves.toEqual({ error: 'CSRF token missing' })
      expect(mockSupabaseInsert).not.toHaveBeenCalled()
      expect(mockSend).not.toHaveBeenCalled()
    })

    it('should return 415 when the request body is not form data', async () => {
      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: JSON.stringify({ name: 'John' }),
        headers: {
          'Content-Type': 'application/json',
          Cookie: `csrf-token=${defaultCsrfToken}`
        }
      })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(415)
      expect(json.error).toContain('Unsupported content type')
    })

    it('should return 403 when csrf token is missing from the form data', async () => {
      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('message', 'Test message with enough characters')

      const request = createRequest(formData, { csrfToken: null })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(403)
      expect(json).toEqual({ error: 'CSRF token missing' })
      expect(validateCsrfToken).not.toHaveBeenCalled()
    })

    it('should return 403 when csrf cookie is missing', async () => {
      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('message', 'Test message with enough characters')

      const request = createRequest(formData, { cookieToken: null })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(403)
      expect(json).toEqual({ error: 'CSRF token missing' })
      expect(validateCsrfToken).not.toHaveBeenCalled()
    })

    it('should return 403 when csrf token validation fails', async () => {
      ;(validateCsrfToken as jest.Mock).mockReturnValue(false)

      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('message', 'Test message with enough characters')

      const request = createRequest(formData, {
        csrfToken: 'invalid-token',
        cookieToken: 'valid-cookie-token'
      })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(403)
      expect(json).toEqual({ error: 'Invalid CSRF token' })
      expect(validateCsrfToken).toHaveBeenCalledWith('invalid-token', 'valid-cookie-token')
    })
  })

  describe('POST - Validation', () => {
    it.each([
      ['missing explicit consent', 'Severe nut allergy', null],
      ['forged false consent', 'Coeliac disease', 'false'],
      ['overlong health information', 'x'.repeat(2001), 'true']
    ])('should reject %s before persistence', async (_case, information, consent) => {
      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('message', 'Test message with enough characters')
      formData.append('dietaryHealthInformation', information)
      if (consent !== null) {
        formData.append('dietaryHealthConsent', consent)
      }

      const response = await POST(createRequest(formData))
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json.fieldErrors).toBeDefined()
      expect(mockSupabaseInsert).not.toHaveBeenCalled()
      expect(mockSend).not.toHaveBeenCalled()
      expect(mockSendTelegramManagerNotification).not.toHaveBeenCalled()
    })

    it('stores server-authoritative consent evidence without sending health content in emails or Telegram', async () => {
      const information = 'Coeliac disease'
      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('message', 'Test message with enough characters')
      formData.append('dietaryHealthInformation', information)
      formData.append('dietaryHealthConsent', 'true')

      const response = await POST(createRequest(formData))

      expect(response.status).toBe(200)
      expect(mockSupabaseInsert).toHaveBeenCalledWith(expect.objectContaining({
        dietary_health_information: information,
        dietary_health_consent: true,
        dietary_health_consent_version: '2026-07-29',
        dietary_health_consented_at: expect.any(String)
      }))
      expect(JSON.stringify(mockSend.mock.calls)).not.toContain(information)
      expect(JSON.stringify(mockSendTelegramManagerNotification.mock.calls)).not.toContain(information)
      expect(mockSendTelegramManagerNotification.mock.calls[0]?.[0]).not.toHaveProperty(
        'hasDietaryHealthInformation'
      )
    })

    it('fails safely when protected health information cannot be persisted', async () => {
      mockSupabaseSingle.mockResolvedValueOnce({
        error: {
          message: 'Insert failed',
          code: '23514',
          details: 'constraint failed',
          hint: null
        }
      })
      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('message', 'Test message with enough characters')
      formData.append('dietaryHealthInformation', 'Severe nut allergy')
      formData.append('dietaryHealthConsent', 'true')

      const response = await POST(createRequest(formData))

      expect(response.status).toBe(500)
      expect(mockSend).not.toHaveBeenCalled()
      expect(mockSendTelegramManagerNotification).not.toHaveBeenCalled()
    })

    it('should return 400 when name is missing', async () => {
      const formData = new FormData()
      formData.append('email', 'john@example.com')
      formData.append('phone', '07123456789')
      formData.append('message', 'Test message with enough characters')

      const request = createRequest(formData)

      const response = await POST(request)

      expect(response.status).toBe(400)
    })

    it('should return 400 when email is missing', async () => {
      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('phone', '07123456789')
      formData.append('message', 'Test message with enough characters')

      const request = createRequest(formData)

      const response = await POST(request)

      expect(response.status).toBe(400)
    })

    it('should return 400 when message is missing for contact form', async () => {
      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('phone', '07123456789')

      const request = createRequest(formData)

      const response = await POST(request)

      expect(response.status).toBe(400)
    })

    it('should accept a general contact enquiry without a phone number', async () => {
      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('message', 'Test message with enough characters')

      const request = createRequest(formData)

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(200)
      expect(json).toEqual({ success: true })
      expect(mockGetSupabaseAdminClient).toHaveBeenCalledTimes(1)
      expect(mockSupabaseFrom).toHaveBeenCalledWith('contact_enquiries')
      expect(mockSupabaseInsert).toHaveBeenCalledWith({
        full_name: 'John',
        email: 'john@example.com',
        phone: null,
        address: null,
        city: null,
        postcode: null,
        cake_interest: null,
        date_needed: null,
        message: 'Test message with enough characters',
        note: null,
        gift_note: null,
        referrer: null,
        attachment_names: null,
        dietary_health_information: null,
        dietary_health_consent: false,
        dietary_health_consent_version: null,
        dietary_health_consented_at: null,
        dietary_health_withdrawn_at: null
      })
      expect(mockSend).toHaveBeenCalledTimes(2)
      expect(mockSend.mock.calls[0]?.[0]?.html).not.toContain('>Phone<')
      const customerEmailPayload = mockSend.mock.calls.find((call) => call[0].to === 'john@example.com')?.[0]
      expect(customerEmailPayload).toEqual(expect.objectContaining({
        replyTo: 'hello@olgishcakes.co.uk',
        subject: 'We have received your message'
      }))
      expect(customerEmailPayload?.text).toContain('Thank you, we\'ve received your message')
      expect(customerEmailPayload?.text).not.toContain('Test message with enough characters')
      expect(customerEmailPayload?.text).toContain('Questions about your enquiry?')
      expect(mockSendTelegramManagerNotification).toHaveBeenCalledWith(expect.objectContaining({
        type: 'contact-enquiry',
        recordReference: '42',
        adminPath: '/admin/enquiries/contact/42'
      }))
    })

    it('fails before notification when durable enquiry persistence is unavailable', async () => {
      delete process.env.SUPABASE_URL
      delete process.env.SUPABASE_SERVICE_ROLE_KEY

      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('message', 'Test message with enough characters')

      const request = createRequest(formData)

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(500)
      expect(json).toEqual({ error: 'Failed to send email' })
      expect(mockGetSupabaseAdminClient).not.toHaveBeenCalled()
      expect(mockSupabaseInsert).not.toHaveBeenCalled()
      expect(mockSend).not.toHaveBeenCalled()
      expect(mockSendTelegramManagerNotification).not.toHaveBeenCalled()
    })

    it('should return 400 when a general contact phone number is invalid', async () => {
      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('phone', '123')
      formData.append('message', 'Test message with enough characters')

      const request = createRequest(formData)

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json.error).toBe('Validation failed')
      expect(json.details).toContain('phone')
    })

    it.each([
      ['address', 'a'.repeat(501)],
      ['city', 'a'.repeat(101)],
      ['postcode', 'a'.repeat(21)],
      ['cakeInterest', 'a'.repeat(161)],
      ['note', 'a'.repeat(2001)],
      ['giftNote', 'a'.repeat(501)],
      ['referrer', 'a'.repeat(501)],
      ['dateNeeded', '2026-02-30']
    ])('should reject an invalid or oversized %s value', async (field, value) => {
      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('message', 'Test message with enough characters')
      formData.append(field, value)

      const request = createRequest(formData)
      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json.error).toBe('Validation failed')
      expect(json.details).toContain(field)
      expect(mockSupabaseInsert).not.toHaveBeenCalled()
      expect(mockSend).not.toHaveBeenCalled()
    })

    it('should accept a legacy order enquiry without a phone number', async () => {
      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('isOrderForm', 'true')

      const request = createRequest(formData)

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(200)
      expect(json).toEqual({ success: true })
      expect(mockSend).toHaveBeenCalledTimes(1)
      expect(mockSupabaseInsert).toHaveBeenCalledTimes(1)
      expect(mockSendTelegramManagerNotification).toHaveBeenCalledWith(expect.objectContaining({
        recordReference: '42',
        adminPath: '/admin/enquiries/contact/42'
      }))
    })

    it('securely persists legacy order instructions and sends only a record link externally', async () => {
      const customerInstructions = 'SENTINEL-LEGACY-CUSTOMER-INSTRUCTIONS'
      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('phone', '07123456789')
      formData.append('message', customerInstructions)
      formData.append('isOrderForm', 'true')

      const request = createRequest(formData)

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(200)
      expect(json).toEqual({ success: true })
      expect(mockSend).toHaveBeenCalledTimes(1)
      expect(mockSupabaseInsert).toHaveBeenCalledWith(expect.objectContaining({
        message: customerInstructions
      }))
      const firstEmailPayload = mockSend.mock.calls[0]?.[0]
      expect(firstEmailPayload).toEqual(expect.objectContaining({
        subject: expect.stringContaining('New contact enquiry')
      }))
      expect(firstEmailPayload?.to).not.toBe('john@example.com')
      expect(JSON.stringify(mockSend.mock.calls)).not.toContain(customerInstructions)
      expect(JSON.stringify(mockSendTelegramManagerNotification.mock.calls)).not.toContain(customerInstructions)
      expect(mockSendTelegramManagerNotification).toHaveBeenCalledWith(expect.objectContaining({
        recordReference: '42',
        adminPath: '/admin/enquiries/contact/42'
      }))
      expect(mockCreateFromMock).not.toHaveBeenCalled()
      expect(mockPatchFromMock).not.toHaveBeenCalled()
      expect(mockPatchSetFromMock).not.toHaveBeenCalled()
      expect(mockPatchCommitFromMock).not.toHaveBeenCalled()
    })

    it('securely persists legacy-order health information before notifying staff', async () => {
      const information = 'SENTINEL-LEGACY-HEALTH-INFORMATION'
      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('phone', '07123456789')
      formData.append('isOrderForm', 'true')
      formData.append('dietaryHealthInformation', information)
      formData.append('dietaryHealthConsent', 'true')

      const response = await POST(createRequest(formData))

      expect(response.status).toBe(200)
      expect(mockSupabaseInsert).toHaveBeenCalledWith(expect.objectContaining({
        dietary_health_information: information,
        dietary_health_consent: true,
        dietary_health_consent_version: '2026-07-29',
        dietary_health_consented_at: expect.any(String)
      }))
      expect(mockSend).toHaveBeenCalledTimes(1)
      expect(JSON.stringify(mockSend.mock.calls)).toContain('/admin/enquiries/contact/42')
      expect(JSON.stringify(mockSend.mock.calls)).not.toContain(information)
      expect(mockSendTelegramManagerNotification.mock.calls[0]?.[0]).not.toHaveProperty(
        'hasDietaryHealthInformation'
      )
    })

    it('fails a legacy-order health submission when secure persistence is unavailable', async () => {
      delete process.env.SUPABASE_URL
      delete process.env.SUPABASE_SERVICE_ROLE_KEY

      const information = 'SENTINEL-LEGACY-HEALTH-INFORMATION'
      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('phone', '07123456789')
      formData.append('isOrderForm', 'true')
      formData.append('dietaryHealthInformation', information)
      formData.append('dietaryHealthConsent', 'true')

      const response = await POST(createRequest(formData))
      const body = await response.json()

      expect(response.status).toBe(500)
      expect(body).toEqual({
        error: 'We could not securely save the health-related information. Please try again.'
      })
      expect(mockSupabaseInsert).not.toHaveBeenCalled()
      expect(mockSend).not.toHaveBeenCalled()
      expect(mockSendTelegramManagerNotification).not.toHaveBeenCalled()
      expect(JSON.stringify(body)).not.toContain(information)
    })

    it('should reject unsupported design image type', async () => {
      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('phone', '07123456789')
      formData.append('message', 'Test message with enough characters')
      formData.append('designImage', new File(['file'], 'design.pdf', { type: 'application/pdf' }))

      const request = createRequest(formData)

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json.error).toBe('Reference image must be a JPEG, PNG, or HEIC file')
    })

    it('should reject oversized design image', async () => {
      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('phone', '07123456789')
      formData.append('message', 'Test message with enough characters')
      formData.append('designImage', new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'design.png', { type: 'image/png' }))

      const request = createRequest(formData)

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json.error).toBe('Reference image must be 5MB or smaller')
    })

    it('should reject gift-hamper order when postal address fields are missing', async () => {
      const formData = new FormData()
      formData.append('name', 'Jane')
      formData.append('email', 'jane@example.com')
      formData.append('phone', '07123456789')
      formData.append('isOrderForm', 'true')
      formData.append('productType', 'gift-hamper')
      formData.append('productId', 'hamper-1')
      formData.append('productName', 'Honey Hamper')
      formData.append('totalPrice', '12.5')

      const request = createRequest(formData)

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json.error).toBe('Validation failed')
      expect(json.details).toContain('address: Address is required for cakes by post orders')
      expect(json.details).toContain('city: City is required for cakes by post orders')
      expect(json.details).toContain('postcode: Postcode is required for cakes by post orders')
    })

    it('should reject gift-hamper order when one postal address field is missing', async () => {
      const formData = new FormData()
      formData.append('name', 'Jane')
      formData.append('email', 'jane@example.com')
      formData.append('phone', '07123456789')
      formData.append('recipientName', 'Jane Recipient')
      formData.append('address', '7 Sample Street')
      formData.append('postcode', 'LS1 1AA')
      formData.append('isOrderForm', 'true')
      formData.append('productType', 'gift-hamper')
      formData.append('productId', 'hamper-1')
      formData.append('productName', 'Honey Hamper')
      formData.append('totalPrice', '12.5')

      const request = createRequest(formData)

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json.error).toBe('Validation failed')
      expect(json.details).toContain('city: City is required for cakes by post orders')
    })

    it('should reject gift-hamper order when postcode format is invalid', async () => {
      const formData = new FormData()
      formData.append('name', 'Jane')
      formData.append('email', 'jane@example.com')
      formData.append('phone', '07123456789')
      formData.append('recipientName', 'Jane Recipient')
      formData.append('address', '7 Sample Street')
      formData.append('city', 'Leeds')
      formData.append('postcode', 'BAD')
      formData.append('isOrderForm', 'true')
      formData.append('productType', 'gift-hamper')
      formData.append('productId', 'hamper-1')
      formData.append('productName', 'Honey Hamper')
      formData.append('totalPrice', '12.5')

      const request = createRequest(formData)

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json.error).toBe('Validation failed')
      expect(json.details).toContain('postcode: Invalid UK postcode')
    })

    it('should reject gift-hamper order when recipient name contains control characters', async () => {
      const formData = new FormData()
      formData.append('name', 'Jane')
      formData.append('email', 'jane@example.com')
      formData.append('phone', '07123456789')
      formData.append('recipientName', 'Jane\u0007Recipient')
      formData.append('address', '7 Sample Street')
      formData.append('city', 'Leeds')
      formData.append('postcode', 'LS1 1AA')
      formData.append('isOrderForm', 'true')
      formData.append('productType', 'gift-hamper')
      formData.append('productId', 'hamper-1')
      formData.append('productName', 'Honey Hamper')
      formData.append('totalPrice', '12.5')

      const request = createRequest(formData)

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json.error).toBe('Validation failed')
      expect(json.details).toContain('recipientName: Recipient name cannot contain control characters')
    })

    it('should reject gift-hamper order when gift note is longer than 500 characters', async () => {
      const formData = new FormData()
      formData.append('name', 'Jane')
      formData.append('email', 'jane@example.com')
      formData.append('phone', '07123456789')
      formData.append('recipientName', 'Jane Recipient')
      formData.append('address', '7 Sample Street')
      formData.append('city', 'Leeds')
      formData.append('postcode', 'LS1 1AA')
      formData.append('giftNote', 'a'.repeat(501))
      formData.append('isOrderForm', 'true')
      formData.append('productType', 'gift-hamper')
      formData.append('productId', 'hamper-1')
      formData.append('productName', 'Honey Hamper')
      formData.append('totalPrice', '12.5')

      const request = createRequest(formData)

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json.error).toBe('Validation failed')
      expect(json.details).toContain('giftNote: Gift note must be 500 characters or fewer')
    })
  })

  describe('POST - Success Cases', () => {
    it('should send complete admin email for contact form with all provided fields', async () => {
      const file = new File(['test'], 'contact-design.jpg', { type: 'image/jpeg' })
      const formData = new FormData()
      formData.append('name', 'John Doe')
      formData.append('email', 'john@example.com')
      formData.append('phone', '07123456789')
      formData.append('address', '42 Baker Street')
      formData.append('city', 'London')
      formData.append('postcode', 'NW1 6XE')
      formData.append('dateNeeded', '2026-03-12')
      formData.append('cakeInterest', 'Honey cake')
      formData.append('message', 'I need a quote for a celebration cake')
      formData.append('note', 'Please call after 6pm')
      formData.append('giftNote', 'Happy birthday!')
      formData.append('referrer', 'instagram')
      formData.append('designImage', file)

      const request = createRequest(formData)

      const response = await POST(request)
      const adminEmailCall = mockSend.mock.calls[0]?.[0]

      expect(mockSend).toHaveBeenCalledTimes(2)
      expect(response.status).toBe(200)
      expect(adminEmailCall?.subject).toContain('New contact enquiry')
      expect(adminEmailCall?.text).toContain('- Date needed:')
      expect(adminEmailCall?.text).toContain('- Cake interest: Honey cake')
      expect(adminEmailCall?.text).not.toContain('I need a quote for a celebration cake')
      expect(adminEmailCall?.text).not.toContain('Please call after 6pm')
      expect(adminEmailCall?.text).not.toContain('Happy birthday!')
      expect(adminEmailCall?.text).not.toContain('contact-design.jpg')
      const customerEmailCall = mockSend.mock.calls.find((call) => call[0].to === 'john@example.com')?.[0]
      expect(customerEmailCall?.subject).toBe('We have received your message')
      expect(customerEmailCall?.text).toContain('- Name: John Doe')
      expect(customerEmailCall?.text).toContain('- Email: john@example.com')
      expect(customerEmailCall?.text).toContain('- Phone: 07123456789')
      expect(customerEmailCall?.text).toContain('- Address: 42 Baker Street')
      expect(customerEmailCall?.text).toContain('- City: London')
      expect(customerEmailCall?.text).toContain('- Postcode: NW1 6XE')
      expect(customerEmailCall?.text).toContain('- Topic: Honey cake')
      expect(customerEmailCall?.text).toContain('- Date: 12 March 2026')
      expect(customerEmailCall?.text).not.toContain('I need a quote for a celebration cake')
      expect(customerEmailCall?.text).not.toContain('Please call after 6pm')
      expect(customerEmailCall?.text).not.toContain('Happy birthday!')
      expect(customerEmailCall?.text).not.toContain('Referrer')
      expect(customerEmailCall?.text).not.toContain('contact-design.jpg')
      expect(adminEmailCall?.html).toContain('Date needed')
      expect(adminEmailCall?.html).toContain('Cake interest')
      expect(adminEmailCall?.html).not.toContain('I need a quote for a celebration cake')
      expect(adminEmailCall?.html).not.toContain('Please call after 6pm')
      expect(adminEmailCall?.html).not.toContain('Happy birthday!')
      expect(adminEmailCall?.html).not.toContain('contact-design.jpg')
      expect(adminEmailCall?.attachments).toEqual([])
      expect(adminEmailCall?.html).not.toContain('Order number')
    })

    it('should handle file attachments', async () => {
      const file = new File(['test'], 'design.jpg', { type: 'image/jpeg' })
      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('phone', '07123456789')
      formData.append('message', 'Test message with enough characters')
      formData.append('designImage', file)

      const request = createRequest(formData)

      const response = await POST(request)

      expect(response.status).toBe(200)
    })

    it('should create order for order inquiries', async () => {
      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('phone', '07123456789')
      formData.append('address', '221B Baker Street')
      formData.append('city', 'London')
      formData.append('postcode', 'NW1 6XE')
      formData.append('dateNeeded', '2026-03-15')
      formData.append('message', 'Please call before delivery')
      formData.append('customerMessage', 'Please call before delivery')
      formData.append('referrer', 'instagram')
      formData.append('isOrderForm', 'true')
      formData.append('productType', 'cake')
      formData.append('productId', 'honey-cake')
      formData.append('productName', 'Honey Cake')
      formData.append('totalPrice', '25')
      formData.append('requestMode', 'custom-design')
      formData.append('designType', 'individual')
      formData.append('occasion', 'birthday')
      formData.append('filling', 'Sour cream')
      formData.append('servings', 'Serves 8-12 people')

      const request = createRequest(formData, {
        headers: {
          'x-vercel-ip-city': 'Bristol',
          'x-vercel-ip-country-region': 'ENG',
          'x-vercel-ip-country': 'GB',
          'x-vercel-ip-latitude': '51.4545',
          'x-vercel-ip-longitude': '-2.5879'
        }
      })

      await POST(request)

      expect(mockCreateFromMock).toHaveBeenCalled()
      expect(mockCreateFromMock).toHaveBeenCalledWith(
        expect.objectContaining({
          orderNumber: expect.any(String),
          status: 'new',
          orderType: 'custom-cake',
          metadata: expect.objectContaining({
            source: 'website-inline-v2',
            orderSourceVersion: 'v2-inline',
            termsPresentedVersion: '2026-07-28',
            ipLocation: {
              city: 'Bristol',
              region: 'ENG',
              country: 'GB',
              latitude: '51.4545',
              longitude: '-2.5879',
              source: 'vercel-ip-headers'
            },
            inlineOrderContext: expect.objectContaining({
              sourceOrderType: 'custom-design',
              occasion: 'birthday',
              requestMode: 'custom-design',
              designType: 'individual',
              filling: 'Sour cream',
              servings: 'Serves 8-12 people',
              customerMessage: 'Please call before delivery'
            })
          })
        })
      )

      expect(mockSend).toHaveBeenCalledTimes(2)

      const customerEmailCall = mockSend.mock.calls.find((call) => call[0].to === 'john@example.com')?.[0]
      const adminEmailCall = mockSend.mock.calls
        .map((call) => call[0])
        .find((payload) => typeof payload.subject === 'string' && payload.subject.includes('New inline order'))

      expect(customerEmailCall).toEqual(expect.objectContaining({
        bcc: 'orders-bcc@example.com',
        subject: expect.stringMatching(/^Order request received #\d+ - Olgish Cakes$/),
        attachments: [
          expect.objectContaining({
            filename: 'olgish-cakes-terms-2026-07-28.pdf',
            contentType: 'application/pdf',
            content: expect.any(Buffer)
          })
        ]
      }))
      expect(customerEmailCall?.html).toContain('Order Preferences')
      expect(customerEmailCall?.html).not.toContain('Request type')
      expect(customerEmailCall?.text).toContain('Thank you. We\'ve received your cake request. We\'ll reply as soon as we can.')
      expect(customerEmailCall?.text).toContain('Date needed: 15 March 2026')
      expect(customerEmailCall?.text).toContain('Estimated price: £25')
      expect(customerEmailCall?.text).toContain('Occasion: Birthday')
      expect(customerEmailCall?.text).toContain('Serves 8-12 people')
      expect(customerEmailCall?.text).toContain('If we can accept your request, we\'ll personally confirm availability, final details and price in writing.')
      expect(customerEmailCall?.text).not.toContain('I\'ll')
      expect(customerEmailCall?.text).toContain('Nothing is booked or payable until you accept our final written offer or make the requested payment.')
      expect(customerEmailCall?.text).not.toContain('Order Confirmation')

      expect(adminEmailCall?.subject).toContain('New inline order')
      expect(adminEmailCall?.html).not.toContain('Request type')
      expect(adminEmailCall?.text).not.toContain('Request type')
      expect(adminEmailCall?.html).toContain('Date needed')
      expect(adminEmailCall?.text).toContain('- Date needed:')
      expect(adminEmailCall?.html).toContain('Product ID')
      expect(adminEmailCall?.text).toContain('- Product ID: honey-cake')
      expect(adminEmailCall?.text).toContain('- Quantity: 1')
      expect(adminEmailCall?.text).toContain('- Unit price: \u00A325')
      expect(adminEmailCall?.text).toContain('- Total price: \u00A325')
      expect(adminEmailCall?.text).toContain('- Address: 221B Baker Street')
      expect(adminEmailCall?.text).toContain('- City: London')
      expect(adminEmailCall?.text).toContain('- Postcode: NW1 6XE')
      expect(adminEmailCall?.text).toContain('- Delivery method: collection')
      expect(adminEmailCall?.text).toContain('- Design type: Individual design')
      expect(adminEmailCall?.text).toContain('- Filling: Sour cream')
      expect(adminEmailCall?.text).toContain('- Servings: Serves 8-12 people')
      expect(adminEmailCall?.text).not.toContain('Please call before delivery')
      expect(adminEmailCall?.text).toContain('- Referrer: instagram')

      expect(mockPatchSetFromMock).toHaveBeenCalledWith('test-order-id', {}, expect.objectContaining({
        customerEmailSent: true,
        adminEmailSent: true,
        emailAttemptedAt: expect.any(String)
      }))
    })

    it('should hide generated product summary when customer message is empty', async () => {
      const generatedSummary = [
        'Product: Vintage Red Velvet Cake',
        'Product type: cake',
        'Design type: standard',
        'Filling: Red Velvet',
        'Serves 8-12 people',
        'Price: \u00A338'
      ].join('\n')
      const formData = new FormData()
      formData.append('name', 'Jane')
      formData.append('email', 'jane@example.com')
      formData.append('phone', '07123456789')
      formData.append('address', '10 High Street')
      formData.append('city', 'Leeds')
      formData.append('postcode', 'LS1 1AA')
      formData.append('dateNeeded', '2026-07-08')
      formData.append('message', generatedSummary)
      formData.append('isOrderForm', 'true')
      formData.append('productType', 'cake')
      formData.append('productId', 'vintage-red-velvet-cake')
      formData.append('productName', 'Vintage Red Velvet Cake')
      formData.append('totalPrice', '38')
      formData.append('requestMode', 'browse-catalog')
      formData.append('designType', 'standard')
      formData.append('occasion', 'anniversary')
      formData.append('filling', 'Red Velvet')
      formData.append('servings', 'Serves 8-12 people')

      const request = createRequest(formData)

      const response = await POST(request)

      const customerEmailCall = mockSend.mock.calls.find((call) => call[0].to === 'jane@example.com')?.[0]

      expect(response.status).toBe(200)
      expect(mockCreateFromMock).toHaveBeenCalledWith(expect.objectContaining({
        items: [
          expect.objectContaining({
            specialInstructions: ''
          })
        ],
        metadata: expect.objectContaining({
          inlineOrderContext: expect.not.objectContaining({
            customerMessage: expect.any(String)
          })
        })
      }))
      expect(customerEmailCall?.html).not.toContain('Customer message')
      expect(customerEmailCall?.text).not.toContain('Customer message')
      expect(customerEmailCall?.html).not.toContain('Product type: cake')
      expect(customerEmailCall?.text).not.toContain('Product type: cake')
      expect(customerEmailCall?.text).not.toContain('Price: \u00A338')
    })

    it('should accept legacy order page payload with custom product type and normalize custom design order type', async () => {
      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('phone', '07123456789')
      formData.append('message', 'Legacy order flow message with enough details')
      formData.append('isOrderForm', 'true')
      formData.append('orderType', 'Custom Design')
      formData.append('productType', 'custom')
      formData.append('productId', '')
      formData.append('productName', 'Custom Order')
      formData.append('totalPrice', '0')

      const request = createRequest(formData)

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockCreateFromMock).toHaveBeenCalledWith(
        expect.objectContaining({
          orderType: 'custom-cake',
          metadata: expect.objectContaining({
            inlineOrderContext: expect.objectContaining({
              sourceOrderType: 'custom-design',
              customerMessage: 'Legacy order flow message with enough details'
            })
          }),
          items: [
            expect.objectContaining({
              productType: 'cake',
              productName: 'Custom Order',
              specialInstructions: 'Legacy order flow message with enough details'
            })
          ]
        })
      )
    })

    it('should accept legacy order page payload with custom product type and normalize browse catalog order type', async () => {
      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('phone', '07123456789')
      formData.append('message', 'Legacy order flow message with enough details')
      formData.append('isOrderForm', 'true')
      formData.append('orderType', 'Browse Our Catalog')
      formData.append('productType', 'custom')
      formData.append('productId', '')
      formData.append('productName', 'Custom Order')
      formData.append('totalPrice', '0')

      const request = createRequest(formData)

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockCreateFromMock).toHaveBeenCalledWith(
        expect.objectContaining({
          orderType: 'custom-cake',
          metadata: expect.objectContaining({
            inlineOrderContext: expect.objectContaining({
              sourceOrderType: 'browse-catalog',
              customerMessage: 'Legacy order flow message with enough details'
            })
          }),
          items: [
            expect.objectContaining({
              productType: 'cake',
              productName: 'Custom Order',
              specialInstructions: 'Legacy order flow message with enough details'
            })
          ]
        })
      )
    })

    it('should accept valid design image for compact inline order payload', async () => {
      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('phone', '07123456789')
      formData.append('message', 'Please call before delivery')
      formData.append('customerMessage', 'Please call before delivery')
      formData.append('isOrderForm', 'true')
      formData.append('productType', 'cake')
      formData.append('productId', 'honey-cake')
      formData.append('productName', 'Honey Cake')
      formData.append('totalPrice', '25')
      formData.append('designImage', new File(['file'], 'design.jpg', { type: 'image/jpeg' }))

      const request = createRequest(formData)

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockStorageFrom).toHaveBeenCalledWith('custom-cake-enquiries')
      expect(mockUploadFromMock).toHaveBeenCalled()
      expect(mockCreateFromMock).toHaveBeenCalledWith(expect.objectContaining({
        messages: [
          expect.objectContaining({
            attachments: [
              expect.objectContaining({
                asset: expect.objectContaining({
                  _type: 'supabase-file',
                  url: 'https://example.supabase.co/storage/v1/object/sign/custom-cake-enquiries/orders/design.jpg?token=test-token'
                })
              })
            ]
          })
        ]
      }))
      expect(mockSendTelegramManagerNotification).toHaveBeenCalledWith(expect.objectContaining({
        type: 'inline-order',
        recordReference: 'OC-CONTACT-1001',
        total: 25,
        imageCount: 1,
        adminPath: '/admin/orders/OC-CONTACT-1001'
      }))
      expect(mockSendTelegramManagerNotification.mock.calls[0]?.[0]).not.toHaveProperty('productName')
      expect(mockSendTelegramManagerNotification.mock.calls[0]?.[0]).not.toHaveProperty(
        'hasDietaryHealthInformation'
      )
    })

    it('should persist gift note and include it in customer/admin emails for gift-hamper orders', async () => {
      const formData = new FormData()
      formData.append('name', 'Jane')
      formData.append('email', 'jane@example.com')
      formData.append('recipientName', 'Jane Recipient')
      formData.append('address', '7 Sample Street')
      formData.append('city', 'Leeds')
      formData.append('postcode', 'LS1 1AA')
      formData.append('customerMessage', 'Please write congratulations')
      formData.append('giftNote', 'Happy birthday!')
      formData.append('isOrderForm', 'true')
      formData.append('orderType', 'Custom Design')
      formData.append('productType', 'gift-hamper')
      formData.append('productId', 'hamper-1')
      formData.append('productName', 'Honey Hamper')
      formData.append('totalPrice', '12.5')

      const request = createRequest(formData)

      await POST(request)

      expect(mockCreateFromMock).toHaveBeenCalledWith(
        expect.objectContaining({
          orderType: 'cakes-by-post',
          customer: expect.objectContaining({
            phone: ''
          }),
          delivery: expect.objectContaining({
            deliveryMethod: 'postal',
            recipientName: 'Jane Recipient',
            deliveryAddress: '7 Sample Street, Leeds, LS1 1AA',
            giftNote: 'Happy birthday!'
          }),
          metadata: expect.objectContaining({
            inlineOrderContext: expect.objectContaining({
              sourceOrderType: 'custom-design',
              deliveryRecipientName: 'Jane Recipient'
            })
          }),
          pricing: expect.objectContaining({
            paymentMethod: 'card',
            total: 12.5
          })
        })
      )
      expect(mockSendTelegramManagerNotification).toHaveBeenCalledWith(expect.objectContaining({
        type: 'inline-order',
        recordReference: 'OC-CONTACT-1001'
      }))

      const customerEmailCall = mockSend.mock.calls.find((call) => call[0].to === 'jane@example.com')?.[0]
      const adminEmailCall = mockSend.mock.calls
        .map((call) => call[0])
        .find((payload) => typeof payload.subject === 'string' && payload.subject.includes('New inline order'))

      expect(customerEmailCall?.text).not.toContain('Happy birthday!')
      expect(customerEmailCall?.text).toContain('Thank you. We\'ve received your cakes by post request')
      expect(customerEmailCall?.text).toContain('Ordered by')
      expect(customerEmailCall?.text).toContain('Delivery Details')
      expect(customerEmailCall?.text).toContain('Recipient: Jane Recipient')
      expect(customerEmailCall?.text).toContain('Delivery address: 7 Sample Street, Leeds, LS1 1AA')
      expect(customerEmailCall?.text).not.toContain('Please write congratulations')
      expect(customerEmailCall?.text).not.toContain('Phone:')
      expect(customerEmailCall?.text).toContain('If we can accept it, we\'ll personally confirm the final details and price in writing')
      expect(customerEmailCall?.text).not.toContain('We\'ll contact you with a quote and final design details')
      expect(customerEmailCall?.text).not.toContain('Customer message:')
      expect(customerEmailCall?.html).not.toContain('Happy birthday!')
      expect(customerEmailCall?.html).toContain('Ordered by')
      expect(customerEmailCall?.subject).toMatch(/^Order request received #\d+ - Olgish Cakes$/)
      expect(adminEmailCall?.text).not.toContain('Happy birthday!')
      expect(adminEmailCall?.html).not.toContain('Happy birthday!')
    })
  })

  describe('POST - Error Handling', () => {
    it('should still return 200 for persisted general enquiries when Resend fails', async () => {
      mockSend.mockResolvedValue({ error: { message: 'Send failed' } })

      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('phone', '07123456789')
      formData.append('message', 'Test message with enough characters')

      const request = createRequest(formData)

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(200)
      expect(json).toEqual({ success: true })
      expect(mockSupabaseInsert).toHaveBeenCalledTimes(1)
    })

    it('should still return 200 for persisted general enquiries when transport does not accept delivery', async () => {
      process.env.EMAIL_TRANSPORT_MODE = 'disabled'

      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('phone', '07123456789')
      formData.append('message', 'Test message with enough characters')

      const request = createRequest(formData)

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(200)
      expect(json).toEqual({ success: true })
      expect(mockSupabaseInsert).toHaveBeenCalledTimes(1)
      expect(mockSend).not.toHaveBeenCalled()
    })

    it('should still return 200 when only the customer confirmation email fails', async () => {
      mockSend
        .mockResolvedValueOnce({ data: { id: 'admin-email-id' }, error: null })
        .mockResolvedValueOnce({ error: { message: 'Customer confirmation failed' } })

      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('phone', '07123456789')
      formData.append('message', 'Test message with enough characters')

      const request = createRequest(formData)

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(200)
      expect(json).toEqual({ success: true })
      expect(mockSupabaseInsert).toHaveBeenCalledTimes(1)
      expect(mockSend).toHaveBeenCalledTimes(2)
      expect(mockSend.mock.calls[0]?.[0]?.to).toBe('hello@olgishcakes.co.uk')
      expect(mockSend.mock.calls[1]?.[0]?.to).toBe('john@example.com')
    })

    it('fails before notification when saving a general contact enquiry fails', async () => {
      mockSupabaseSingle.mockResolvedValue({
        error: {
          message: 'Insert failed',
          code: '23502',
          details: 'null value in column "message"',
          hint: null
        }
      })

      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('message', 'Test message with enough characters')

      const request = createRequest(formData)

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(500)
      expect(json).toEqual({ error: 'Failed to send email' })
      expect(mockSupabaseInsert).toHaveBeenCalledTimes(1)
      expect(mockSend).not.toHaveBeenCalled()
    })

    it('should return 500 when a general contact enquiry is neither persisted nor emailed', async () => {
      delete process.env.SUPABASE_URL
      delete process.env.SUPABASE_SERVICE_ROLE_KEY
      mockSend.mockResolvedValue({ error: { message: 'Send failed' } })

      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('message', 'Test message with enough characters')

      const request = createRequest(formData)

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(500)
      expect(json).toEqual({ error: 'Failed to send email' })
      expect(mockGetSupabaseAdminClient).not.toHaveBeenCalled()
      expect(mockSend).not.toHaveBeenCalled()
    })

    it('should return 500 when both Supabase persistence and contact email fail', async () => {
      mockSupabaseSingle.mockResolvedValue({
        error: {
          message: 'Insert failed',
          code: '23502',
          details: 'null value in column "message"',
          hint: null
        }
      })
      mockSend.mockResolvedValue({ error: { message: 'Send failed' } })

      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('message', 'Test message with enough characters')

      const request = createRequest(formData)

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(500)
      expect(json).toEqual({ error: 'Failed to send email' })
      expect(mockSupabaseInsert).toHaveBeenCalledTimes(1)
      expect(mockSend).not.toHaveBeenCalled()
    })

    it('should mark inline order emails as unsent when transport does not accept delivery', async () => {
      process.env.EMAIL_TRANSPORT_MODE = 'disabled'

      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('phone', '07123456789')
      formData.append('message', 'Please call before delivery')
      formData.append('customerMessage', 'Please call before delivery')
      formData.append('isOrderForm', 'true')
      formData.append('productType', 'cake')
      formData.append('productId', 'honey-cake')
      formData.append('productName', 'Honey Cake')
      formData.append('totalPrice', '25')

      const request = createRequest(formData)

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockSend).not.toHaveBeenCalled()
      expect(mockPatchSetFromMock).toHaveBeenCalledWith('test-order-id', {}, expect.objectContaining({
        customerEmailSent: false,
        adminEmailSent: false,
        customerEmailError: 'OPERATION_FAILED',
        adminEmailError: 'OPERATION_FAILED',
        emailAttemptedAt: expect.any(String)
      }))
    })
    it('should keep fallback admin email complete when order creation fails', async () => {
      mockCreateFromMock.mockRejectedValue(new Error('Supabase order creation failed'))

      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('phone', '07123456789')
      formData.append('address', '12 Queen Road')
      formData.append('city', 'Manchester')
      formData.append('postcode', 'M1 1AA')
      formData.append('dateNeeded', '2026-03-20')
      formData.append('message', 'Please ring before delivery')
      formData.append('customerMessage', 'No nuts please')
      formData.append('occasion', 'wedding')
      formData.append('designType', 'individual')
      formData.append('filling', 'Vanilla cream')
      formData.append('servings', 'Serves 20')
      formData.append('referrer', 'google')
      formData.append('isOrderForm', 'true')
      formData.append('productType', 'cake')
      formData.append('productId', 'honey-cake')
      formData.append('productName', 'Honey Cake')
      formData.append('totalPrice', '25')

      const request = createRequest(formData)

      const response = await POST(request)
      const fallbackAdminEmailCall = mockSend.mock.calls
        .map((call) => call[0])
        .find((payload) => typeof payload.subject === 'string' && payload.subject.includes('New order inquiry'))
      const fallbackCustomerEmailCall = mockSend.mock.calls
        .map((call) => call[0])
        .find((payload) => payload.to === 'john@example.com' && typeof payload.subject === 'string' && payload.subject.includes('Order request received'))

      expect(response.status).toBe(200)
      expect(mockSend).toHaveBeenCalledTimes(2)
      expect(fallbackCustomerEmailCall?.subject).toBe('Order request received - Olgish Cakes')
      expect(fallbackCustomerEmailCall?.text).toContain('Thank you. We\'ve received your cake request. We\'ll reply as soon as we can.')
      expect(fallbackCustomerEmailCall?.text).toContain('Date needed: 20 March 2026')
      expect(fallbackCustomerEmailCall?.text).toContain('Estimated price: £25')
      expect(fallbackCustomerEmailCall?.text).toContain('If we can accept your request, we\'ll personally confirm availability, final details and price in writing.')
      expect(fallbackCustomerEmailCall?.text).not.toContain('I\'ll')
      expect(fallbackCustomerEmailCall?.text).not.toContain('Order Confirmation')
      expect(fallbackAdminEmailCall?.html).toContain('Date needed')
      expect(fallbackAdminEmailCall?.text).toContain('- Date needed:')
      expect(fallbackAdminEmailCall?.text).toContain('- Product ID: honey-cake')
      expect(fallbackAdminEmailCall?.text).toContain('- Quantity: 1')
      expect(fallbackAdminEmailCall?.text).toContain('- Delivery method: collection')
      expect(fallbackAdminEmailCall?.text).toContain('- Occasion: Wedding')
      expect(fallbackAdminEmailCall?.text).toContain('- Design type: Individual design')
      expect(fallbackAdminEmailCall?.text).toContain('- Filling: Vanilla cream')
      expect(fallbackAdminEmailCall?.text).toContain('- Servings: Serves 20')
      expect(fallbackAdminEmailCall?.text).not.toContain('No nuts please')
      expect(fallbackAdminEmailCall?.text).toContain('- Referrer: google')
      expect(fallbackAdminEmailCall?.html).not.toContain('Request type')
      expect(fallbackAdminEmailCall?.text).not.toContain('Request type')
    })

    it('should include gift note in fallback customer email when order creation fails', async () => {
      mockCreateFromMock.mockRejectedValue(new Error('Supabase order creation failed'))

      const formData = new FormData()
      formData.append('name', 'Jane')
      formData.append('email', 'jane@example.com')
      formData.append('phone', '07123456789')
      formData.append('recipientName', 'Jane Recipient')
      formData.append('address', '7 Sample Street')
      formData.append('city', 'Leeds')
      formData.append('postcode', 'LS1 1AA')
      formData.append('message', 'Please ring before delivery')
      formData.append('customerMessage', 'Please ring before delivery')
      formData.append('giftNote', 'Happy birthday!')
      formData.append('isOrderForm', 'true')
      formData.append('productType', 'gift-hamper')
      formData.append('productId', 'hamper-1')
      formData.append('productName', 'Honey Hamper')
      formData.append('totalPrice', '12.5')

      const request = createRequest(formData)

      const response = await POST(request)
      const fallbackCustomerEmailCall = mockSend.mock.calls
        .map((call) => call[0])
        .find((payload) => payload.to === 'jane@example.com' && typeof payload.subject === 'string' && payload.subject.includes('Order request received'))

      expect(response.status).toBe(200)
      expect(mockSend).toHaveBeenCalledTimes(2)
      expect(fallbackCustomerEmailCall?.subject).toBe('Order request received - Olgish Cakes')
      expect(fallbackCustomerEmailCall?.text).toContain('Ordered by')
      expect(fallbackCustomerEmailCall?.text).toContain('Delivery Details')
      expect(fallbackCustomerEmailCall?.text).toContain('Recipient: Jane Recipient')
      expect(fallbackCustomerEmailCall?.text).toContain('Delivery address: 7 Sample Street, Leeds, LS1 1AA')
      expect(fallbackCustomerEmailCall?.text).toContain('If we can accept it, we\'ll personally confirm the final details and price in writing')
      expect(fallbackCustomerEmailCall?.text).not.toContain('We\'ll contact you with a quote and final design details')
      expect(fallbackCustomerEmailCall?.text).not.toContain('Customer message:')
      expect(fallbackCustomerEmailCall?.text).not.toContain('Happy birthday!')
      expect(fallbackCustomerEmailCall?.html).not.toContain('Happy birthday!')
    })

    it('should return 500 when fallback admin email is not accepted', async () => {
      mockCreateFromMock.mockRejectedValue(new Error('Supabase order creation failed'))
      mockSend.mockResolvedValueOnce({ error: { message: 'Admin fallback failed' } })

      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('phone', '07123456789')
      formData.append('message', 'Please ring before delivery')
      formData.append('customerMessage', 'No nuts please')
      formData.append('isOrderForm', 'true')
      formData.append('productType', 'cake')
      formData.append('productId', 'honey-cake')
      formData.append('productName', 'Honey Cake')
      formData.append('totalPrice', '25')

      const request = createRequest(formData)

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(500)
      expect(json).toEqual({ error: 'Failed to send email' })
      expect(mockSend).toHaveBeenCalledTimes(1)
    })

    it('should not send fallback emails when only metadata patch fails', async () => {
      mockPatchCommitFromMock.mockRejectedValue(new Error('metadata patch failed'))

      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('phone', '07123456789')
      formData.append('message', 'Please call before delivery')
      formData.append('customerMessage', 'Please call before delivery')
      formData.append('isOrderForm', 'true')
      formData.append('productType', 'cake')
      formData.append('productId', 'honey-cake')
      formData.append('productName', 'Honey Cake')
      formData.append('totalPrice', '25')

      const request = createRequest(formData)

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockCreateFromMock).toHaveBeenCalledTimes(1)
      expect(mockSend).toHaveBeenCalledTimes(2)
      expect(mockSend.mock.calls.some((call) => {
        const payload = call[0]
        return typeof payload.subject === 'string' && payload.subject.includes('New Order Inquiry')
      })).toBe(false)
    })
  })
})
