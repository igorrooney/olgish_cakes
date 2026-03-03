/**
 * @jest-environment node
 */
import { POST } from '../route'
import { NextRequest } from 'next/server'
import { validateCsrfToken } from '@/lib/csrf'

const mockSend = jest.fn()
const mockInsert = jest.fn()
const mockUpload = jest.fn()
const mockRemove = jest.fn()
const mockFrom = jest.fn(() => ({ insert: mockInsert }))
const mockStorageFrom = jest.fn(() => ({ upload: mockUpload, remove: mockRemove }))
const mockCreateClient = jest.fn(() => ({
  from: mockFrom,
  storage: { from: mockStorageFrom }
}))

// Mock the CSRF validation
jest.mock('@/lib/csrf', () => ({
  validateCsrfToken: jest.fn()
}))

jest.mock('@supabase/supabase-js', () => ({
  createClient: (...args: unknown[]) => mockCreateClient(...args)
}))

jest.mock('resend', () => ({
  Resend: jest.fn(() => ({
    emails: { send: mockSend }
  }))
}))

describe('/api/custom-cake-enquiry', () => {
  const buildFormData = (overrides: Partial<Record<string, string>> = {}) => {
    const baseData = {
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '+44(0)7123456789',
      address: '123 Test St',
      city: 'Leeds',
      postcode: 'LS1 1AA',
      date: '2024-12-25',
      csrfToken: 'valid-token',
      ...overrides,
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
    jest.clearAllMocks()
    process.env.RESEND_API_KEY = 'test-key'
    process.env.EMAIL_TRANSPORT_MODE = 'live'
    process.env.CONTACT_EMAIL_TO = 'admin@example.com'
    process.env.SUPABASE_URL = 'https://example.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
    process.env.SUPABASE_ENQUIRY_BUCKET = 'custom-cake-enquiries'
    mockSend.mockResolvedValue({ error: null })
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

  it('rejects request without CSRF token', async () => {
    const formData = buildFormData({})
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
    expect(mockCreateClient).not.toHaveBeenCalled()
    expect(mockUpload).not.toHaveBeenCalled()
    expect(mockSend).not.toHaveBeenCalled()
  })

  it('rejects request with invalid CSRF token', async () => {
    (validateCsrfToken as jest.Mock).mockReturnValue(false)

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
    expect(validateCsrfToken).toHaveBeenCalled()
    expect(mockCreateClient).not.toHaveBeenCalled()
    expect(mockUpload).not.toHaveBeenCalled()
    expect(mockSend).not.toHaveBeenCalled()
  })

  it('accepts request with valid CSRF token', async () => {
    (validateCsrfToken as jest.Mock).mockReturnValue(true)

    const formData = buildFormData({ csrfToken: 'valid-token' })
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
      address: '123 Test St',
      city: 'Leeds',
      postcode: 'LS1 1AA',
      date_needed: '2024-12-25',
      reference_image_bucket: null,
      reference_image_path: null
    }))
    expect(mockUpload).not.toHaveBeenCalled()
    expect(mockSend).toHaveBeenCalledTimes(2)
    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
      to: 'test@example.com'
    }))
  })

  it('returns 500 when email service is not configured', async () => {
    (validateCsrfToken as jest.Mock).mockReturnValue(true)
    process.env.RESEND_API_KEY = ''

    const formData = buildFormData({ csrfToken: 'valid-token' })
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

    expect(response.status).toBe(500)
    expect(data.error).toBe('Email service not configured')
    expect(mockInsert).toHaveBeenCalled()
    expect(mockUpload).not.toHaveBeenCalled()
    expect(mockSend).not.toHaveBeenCalled()
  })

  it('returns 500 when email sending fails', async () => {
    (validateCsrfToken as jest.Mock).mockReturnValue(true)
    mockSend.mockResolvedValueOnce({ error: { message: 'Send failed' } })

    const formData = buildFormData({ csrfToken: 'valid-token' })
    const request = new NextRequest('http://localhost/api/custom-cake-enquiry', {
      method: 'POST',
      body: formData,
      headers: {
        Cookie: 'csrf-token=valid-token',
        'x-forwarded-for': '10.0.0.2'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
    expect(mockInsert).toHaveBeenCalled()
    expect(mockUpload).not.toHaveBeenCalled()
    expect(mockSend).toHaveBeenCalledTimes(1)
  })

  it('returns 500 when transport does not accept delivery', async () => {
    (validateCsrfToken as jest.Mock).mockReturnValue(true)
    process.env.EMAIL_TRANSPORT_MODE = 'disabled'

    const formData = buildFormData({ csrfToken: 'valid-token' })
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

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
    expect(mockInsert).toHaveBeenCalled()
    expect(mockSend).not.toHaveBeenCalled()
  })
  it('attaches reference image when provided', async () => {
    (validateCsrfToken as jest.Mock).mockReturnValue(true)
    const file = new File(['image'], 'reference.jpg', { type: 'image/jpeg' })
    const formData = buildFormData({ csrfToken: 'valid-token' })
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
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      full_name: 'Test User',
      email: 'test@example.com'
    }))
    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
      attachments: expect.arrayContaining([
        expect.objectContaining({ filename: 'reference.jpg' })
      ])
    }))
  })

  it('rejects reference image with unsupported type', async () => {
    (validateCsrfToken as jest.Mock).mockReturnValue(true)
    const file = new File(['not-image'], 'reference.txt', { type: 'text/plain' })
    const formData = buildFormData({ csrfToken: 'valid-token' })
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
    expect(mockCreateClient).not.toHaveBeenCalled()
    expect(mockUpload).not.toHaveBeenCalled()
    expect(mockInsert).not.toHaveBeenCalled()
    expect(mockSend).not.toHaveBeenCalled()
  })

  it('rejects reference image larger than 5MB', async () => {
    (validateCsrfToken as jest.Mock).mockReturnValue(true)
    const file = new File(
      [new Uint8Array(5 * 1024 * 1024 + 1)],
      'reference.png',
      { type: 'image/png' }
    )
    const formData = buildFormData({ csrfToken: 'valid-token' })
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
    expect(mockCreateClient).not.toHaveBeenCalled()
    expect(mockUpload).not.toHaveBeenCalled()
    expect(mockInsert).not.toHaveBeenCalled()
    expect(mockSend).not.toHaveBeenCalled()
  })

  it('returns 500 when Supabase config is missing', async () => {
    (validateCsrfToken as jest.Mock).mockReturnValue(true)
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
    const formData = buildFormData({ csrfToken: 'valid-token' })
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
    expect(mockSend).not.toHaveBeenCalled()
  })

  it('returns 500 when Supabase insert fails', async () => {
    (validateCsrfToken as jest.Mock).mockReturnValue(true)
    mockInsert.mockResolvedValueOnce({ error: { message: 'Insert failed' } })
    const formData = buildFormData({ csrfToken: 'valid-token' })
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
    expect(mockSend).not.toHaveBeenCalled()
  })

  it('cleans up reference image when Supabase insert fails', async () => {
    (validateCsrfToken as jest.Mock).mockReturnValue(true)
    mockInsert.mockResolvedValueOnce({ error: { message: 'Insert failed' } })
    const file = new File(['image'], 'reference.jpg', { type: 'image/jpeg' })
    const formData = buildFormData({ csrfToken: 'valid-token' })
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
    expect(mockSend).not.toHaveBeenCalled()
  })

  it('returns 500 when reference image upload fails', async () => {
    (validateCsrfToken as jest.Mock).mockReturnValue(true)
    mockUpload.mockResolvedValueOnce({ data: null, error: { message: 'Upload failed' } })
    const file = new File(['image'], 'reference.jpg', { type: 'image/jpeg' })
    const formData = buildFormData({ csrfToken: 'valid-token' })
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
    expect(mockSend).not.toHaveBeenCalled()
  })

  it('rate limits by client IP even when proxy chain changes', async () => {
    (validateCsrfToken as jest.Mock).mockReturnValue(true)
    const clientIp = '10.0.0.250'

    for (let index = 0; index < 5; index += 1) {
      const formData = buildFormData({ csrfToken: 'valid-token' })
      const request = new NextRequest('http://localhost/api/custom-cake-enquiry', {
        method: 'POST',
        body: formData,
        headers: {
          Cookie: 'csrf-token=valid-token',
          'x-forwarded-for': `${clientIp}, 192.168.0.${index}`
        }
      })

      const response = await POST(request)
      expect(response.status).toBe(200)
    }

    const blockedFormData = buildFormData({ csrfToken: 'valid-token' })
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
  })
})
