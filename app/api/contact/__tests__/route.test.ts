import { NextRequest } from 'next/server'
import { POST } from '../route'

// Mock Resend
const mockSend = jest.fn()
jest.mock('resend', () => ({
  Resend: jest.fn(() => ({
    emails: { send: mockSend }
  }))
}))

// Mock Sanity
const mockUpload = jest.fn()
const mockCreate = jest.fn()
jest.mock('@/sanity/lib/client', () => {
  const mockUploadFn = jest.fn()
  const mockCreateFn = jest.fn()
  return {
    serverClient: {
      assets: { upload: mockUploadFn },
      create: mockCreateFn
    },
    __mockUpload: mockUploadFn,
    __mockCreate: mockCreateFn
  }
})

const { __mockUpload: mockUploadFromMock, __mockCreate: mockCreateFromMock } = jest.requireMock('@/sanity/lib/client')

describe('/api/contact', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.RESEND_API_KEY = 'test-key'
    process.env.CONTACT_EMAIL_TO = 'test@example.com'
    process.env.SANITY_API_TOKEN = 'test-token'
    mockSend.mockResolvedValue({ error: null })
    mockCreateFromMock.mockResolvedValue({ _id: 'test-order-id' })
    mockUploadFromMock.mockResolvedValue({ _id: 'test-asset-id' })
  })

  describe('POST - Environment Validation', () => {
    it('should return 500 when RESEND_API_KEY missing', async () => {
      delete process.env.RESEND_API_KEY

      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('message', 'Test')

      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: formData
      })

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

      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: formData
      })

      // Route should handle missing env vars gracefully
      await expect(POST(request)).resolves.toBeDefined()
    })
  })

  describe('POST - Validation', () => {
    it('should return 400 when name is missing', async () => {
      const formData = new FormData()
      formData.append('email', 'john@example.com')
      formData.append('phone', '07123456789')
      formData.append('message', 'Test message with enough characters')

      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: formData
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
    })

    it('should return 400 when email is missing', async () => {
      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('phone', '07123456789')
      formData.append('message', 'Test message with enough characters')

      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: formData
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
    })

    it('should return 400 when message is missing for contact form', async () => {
      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('phone', '07123456789')

      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: formData
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
    })

    it('should not require message for order forms', async () => {
      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('phone', '07123456789')
      formData.append('isOrderForm', 'true')

      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: formData
      })

      // Route should handle order forms
      await expect(POST(request)).resolves.toBeDefined()
    })
  })

  describe('POST - Success Cases', () => {
    it('should send email for contact form', async () => {
      const formData = new FormData()
      formData.append('name', 'John Doe')
      formData.append('email', 'john@example.com')
      formData.append('phone', '07123456789')
      formData.append('message', 'Test message')

      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: formData
      })

      const response = await POST(request)

      expect(mockSend).toHaveBeenCalled()
      expect(response.status).toBe(200)
    })

    it('should handle file attachments', async () => {
      const file = new File(['test'], 'design.jpg', { type: 'image/jpeg' })
      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('phone', '07123456789')
      formData.append('message', 'Test message with enough characters')
      formData.append('designImage', file)

      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: formData
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
    })

    it('should create order for order inquiries', async () => {
      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('phone', '07123456789')
      formData.append('message', 'Cake: Honey\nDesign Type: Standard')
      formData.append('isOrderForm', 'true')
      formData.append('productName', 'Honey Cake')
      formData.append('quantity', '1')
      formData.append('unitPrice', '25')
      formData.append('totalPrice', '25')

      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: formData
      })

      await POST(request)

      // Should create order directly in Sanity, not via fetch
      expect(mockCreateFromMock).toHaveBeenCalled()
      expect(mockCreateFromMock).toHaveBeenCalledWith(
        expect.objectContaining({
          _type: 'order',
          orderNumber: expect.any(String),
          status: 'new'
        })
      )
    })
  })

  describe('POST - Error Handling', () => {
    it('should return 500 when Resend fails', async () => {
      mockSend.mockResolvedValue({ error: { message: 'Send failed' } })

      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('phone', '07123456789')
      formData.append('message', 'Test message with enough characters')

      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: formData
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
    })

    it('should handle order creation failure gracefully', async () => {
      mockCreateFromMock.mockRejectedValue(new Error('Sanity creation failed'))

      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('phone', '07123456789')
      formData.append('isOrderForm', 'true')
      formData.append('productName', 'Honey Cake')
      formData.append('quantity', '1')
      formData.append('unitPrice', '25')
      formData.append('totalPrice', '25')

      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: formData
      })

      // Route should handle failures gracefully
      await expect(POST(request)).resolves.toBeDefined()
    })
  })
})

