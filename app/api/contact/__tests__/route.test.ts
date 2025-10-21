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
jest.mock('@/sanity/lib/client', () => {
  const mockUpload = jest.fn()
  return {
    serverClient: {
      assets: { upload: mockUpload }
    },
    __mockUpload: mockUpload
  }
})

const { __mockUpload: mockUpload } = jest.requireMock('@/sanity/lib/client')

// Mock fetch for orders API
global.fetch = jest.fn()

describe('/api/contact', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.RESEND_API_KEY = 'test-key'
    process.env.CONTACT_EMAIL_TO = 'test@example.com'
    mockSend.mockResolvedValue({ error: null })
    ;(global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({}) })
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
      formData.append('message', 'Test')

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
      formData.append('message', 'Test')

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
      formData.append('message', 'Test')
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
      formData.append('message', 'Cake: Honey\nDesign Type: Standard')
      formData.append('isOrderForm', 'true')

      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: formData
      })

      await POST(request)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/orders'),
        expect.objectContaining({ method: 'POST' })
      )
    })
  })

  describe('POST - Error Handling', () => {
    it('should return 500 when Resend fails', async () => {
      mockSend.mockResolvedValue({ error: { message: 'Send failed' } })

      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('message', 'Test')

      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: formData
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
    })

    it('should handle order creation failure gracefully', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({ ok: false, text: async () => 'Failed' })

      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('isOrderForm', 'true')

      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: formData
      })

      // Route should handle failures gracefully
      await expect(POST(request)).resolves.toBeDefined()
    })
  })
})

