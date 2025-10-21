import { NextRequest } from 'next/server'
import { POST } from '../route'

const mockSend = jest.fn()
jest.mock('resend', () => ({
  Resend: jest.fn(() => ({
    emails: { send: mockSend }
  }))
}))

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

global.fetch = jest.fn()

describe('/api/quote', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.RESEND_API_KEY = 'test-key'
    process.env.CONTACT_EMAIL_TO = 'test@example.com'
    mockSend.mockResolvedValue({ error: null })
    ;(global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({}) })
  })

  describe('POST - Validation', () => {
    it('should return 400 when required fields missing', async () => {
      const formData = new FormData()
      formData.append('name', 'John')

      const request = new NextRequest('http://localhost/api/quote', {
        method: 'POST',
        body: formData
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
    })

    it('should validate all required fields', async () => {
      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('phone', '07123456789')
      formData.append('occasion', 'Wedding')
      formData.append('cakeType', 'Honey Cake')
      formData.append('dateNeeded', '2025-12-01')
      formData.append('budget', '£200-300')

      const request = new NextRequest('http://localhost/api/quote', {
        method: 'POST',
        body: formData
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
    })
  })

  describe('POST - Success', () => {
    it('should send quote email', async () => {
      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('phone', '07123456789')
      formData.append('occasion', 'Wedding')
      formData.append('cakeType', 'Custom')
      formData.append('dateNeeded', '2025-12-01')
      formData.append('budget', '£300+')

      const request = new NextRequest('http://localhost/api/quote', {
        method: 'POST',
        body: formData
      })

      const response = await POST(request)

      expect(mockSend).toHaveBeenCalled()
      expect(response.status).toBe(200)
    })

    it('should handle image attachment', async () => {
      const file = new File(['test'], 'design.jpg', { type: 'image/jpeg' })
      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('phone', '07123456789')
      formData.append('occasion', 'Birthday')
      formData.append('cakeType', 'Custom')
      formData.append('dateNeeded', '2025-12-01')
      formData.append('budget', '£200-300')
      formData.append('designImage', file)

      const request = new NextRequest('http://localhost/api/quote', {
        method: 'POST',
        body: formData
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
    })

    it('should create order in system', async () => {
      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('phone', '07123456789')
      formData.append('occasion', 'Wedding')
      formData.append('cakeType', 'Honey Cake')
      formData.append('dateNeeded', '2025-12-01')
      formData.append('budget', '£300+')

      const request = new NextRequest('http://localhost/api/quote', {
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
    it('should return 500 when email sending fails', async () => {
      mockSend.mockResolvedValue({ error: { message: 'Failed' } })

      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('phone', '07123456789')
      formData.append('occasion', 'Wedding')
      formData.append('cakeType', 'Custom')
      formData.append('dateNeeded', '2025-12-01')
      formData.append('budget', '£200-300')

      const request = new NextRequest('http://localhost/api/quote', {
        method: 'POST',
        body: formData
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
    })

    it('should return 500 when RESEND_API_KEY missing', async () => {
      delete process.env.RESEND_API_KEY

      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('phone', '07123456789')
      formData.append('occasion', 'Wedding')
      formData.append('cakeType', 'Custom')
      formData.append('dateNeeded', '2025-12-01')
      formData.append('budget', '£200-300')

      const request = new NextRequest('http://localhost/api/quote', {
        method: 'POST',
        body: formData
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
    })
  })
})

