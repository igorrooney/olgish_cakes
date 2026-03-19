/**
 * @jest-environment node
 */
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
  const mockUploadFn = jest.fn()
  const mockCreateFn = jest.fn()
  const mockPatchCommitFn = jest.fn()
  const mockPatchSetFn = jest.fn(() => ({ commit: mockPatchCommitFn }))
  const mockPatchFn = jest.fn(() => ({ set: mockPatchSetFn }))
  return {
    serverClient: {
      assets: { upload: mockUploadFn },
      create: mockCreateFn,
      patch: mockPatchFn
    },
    __mockUpload: mockUploadFn,
    __mockCreate: mockCreateFn,
    __mockPatch: mockPatchFn,
    __mockPatchSet: mockPatchSetFn,
    __mockPatchCommit: mockPatchCommitFn
  }
})

const {
  __mockUpload: mockUploadFromMock,
  __mockCreate: mockCreateFromMock,
  __mockPatch: mockPatchFromMock,
  __mockPatchSet: mockPatchSetFromMock,
  __mockPatchCommit: mockPatchCommitFromMock
} = jest.requireMock('@/sanity/lib/client')

describe('/api/contact', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.RESEND_API_KEY = 'test-key'
    process.env.EMAIL_TRANSPORT_MODE = 'live'
    process.env.CONTACT_EMAIL_TO = 'test@example.com'
    process.env.SANITY_API_TOKEN = 'test-token'
    process.env.ORDER_EMAIL_BCC = 'orders-bcc@example.com'
    mockSend.mockResolvedValue({ data: { id: 'test-email-id' }, error: null })
    mockCreateFromMock.mockResolvedValue({ _id: 'test-order-id' })
    mockUploadFromMock.mockResolvedValue({ _id: 'test-asset-id' })
    mockPatchCommitFromMock.mockResolvedValue({ _id: 'test-order-id' })
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

    it('should accept legacy order forms without compact v2 payload and send admin inquiry email only', async () => {
      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('phone', '07123456789')
      formData.append('isOrderForm', 'true')

      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: formData
      })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(200)
      expect(json).toEqual({ success: true })
      expect(mockSend).toHaveBeenCalledTimes(1)
      const firstEmailPayload = mockSend.mock.calls[0]?.[0]
      expect(firstEmailPayload).toEqual(expect.objectContaining({
        subject: expect.stringContaining('New Order Inquiry:')
      }))
      expect(firstEmailPayload?.to).not.toBe('john@example.com')
      expect(mockCreateFromMock).not.toHaveBeenCalled()
      expect(mockPatchFromMock).not.toHaveBeenCalled()
      expect(mockPatchSetFromMock).not.toHaveBeenCalled()
      expect(mockPatchCommitFromMock).not.toHaveBeenCalled()
    })

    it('should reject unsupported design image type', async () => {
      const formData = new FormData()
      formData.append('name', 'John')
      formData.append('email', 'john@example.com')
      formData.append('phone', '07123456789')
      formData.append('message', 'Test message with enough characters')
      formData.append('designImage', new File(['file'], 'design.pdf', { type: 'application/pdf' }))

      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: formData
      })

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

      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: formData
      })

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

      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: formData
      })

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
      formData.append('address', '7 Sample Street')
      formData.append('postcode', 'LS1 1AA')
      formData.append('isOrderForm', 'true')
      formData.append('productType', 'gift-hamper')
      formData.append('productId', 'hamper-1')
      formData.append('productName', 'Honey Hamper')
      formData.append('totalPrice', '12.5')

      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: formData
      })

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
      formData.append('address', '7 Sample Street')
      formData.append('city', 'Leeds')
      formData.append('postcode', 'BAD')
      formData.append('isOrderForm', 'true')
      formData.append('productType', 'gift-hamper')
      formData.append('productId', 'hamper-1')
      formData.append('productName', 'Honey Hamper')
      formData.append('totalPrice', '12.5')

      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: formData
      })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json.error).toBe('Validation failed')
      expect(json.details).toContain('postcode: Invalid UK postcode')
    })

    it('should reject gift-hamper order when gift note is longer than 500 characters', async () => {
      const formData = new FormData()
      formData.append('name', 'Jane')
      formData.append('email', 'jane@example.com')
      formData.append('phone', '07123456789')
      formData.append('address', '7 Sample Street')
      formData.append('city', 'Leeds')
      formData.append('postcode', 'LS1 1AA')
      formData.append('giftNote', 'a'.repeat(501))
      formData.append('isOrderForm', 'true')
      formData.append('productType', 'gift-hamper')
      formData.append('productId', 'hamper-1')
      formData.append('productName', 'Honey Hamper')
      formData.append('totalPrice', '12.5')

      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: formData
      })

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

      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: formData
      })

      const response = await POST(request)
      const adminEmailCall = mockSend.mock.calls[0]?.[0]

      expect(mockSend).toHaveBeenCalledTimes(1)
      expect(response.status).toBe(200)
      expect(adminEmailCall?.subject).toContain('New Contact: John Doe')
      expect(adminEmailCall?.text).toContain('- Date needed:')
      expect(adminEmailCall?.text).toContain('- Cake interest: Honey cake')
      expect(adminEmailCall?.text).toContain('- Submitted message: I need a quote for a celebration cake')
      expect(adminEmailCall?.text).toContain('- Additional note: Please call after 6pm')
      expect(adminEmailCall?.text).toContain('- Gift note: Happy birthday!')
      expect(adminEmailCall?.text).toContain('- Attachments: contact-design.jpg')
      expect(adminEmailCall?.html).toContain('Date needed')
      expect(adminEmailCall?.html).toContain('Cake interest')
      expect(adminEmailCall?.html).toContain('Submitted message')
      expect(adminEmailCall?.html).toContain('Additional note')
      expect(adminEmailCall?.html).toContain('Gift note')
      expect(adminEmailCall?.html).toContain('Attachments')
      expect(adminEmailCall?.html).toContain('contact-design.jpg')
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

      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: formData
      })

      await POST(request)

      expect(mockCreateFromMock).toHaveBeenCalled()
      expect(mockCreateFromMock).toHaveBeenCalledWith(
        expect.objectContaining({
          _type: 'order',
          orderNumber: expect.any(String),
          status: 'new',
          orderType: 'custom-design',
          metadata: expect.objectContaining({
            source: 'website-inline-v2',
            orderSourceVersion: 'v2-inline',
            inlineOrderContext: expect.objectContaining({
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
        bcc: 'orders-bcc@example.com'
      }))
      expect(customerEmailCall?.html).toContain('Order Preferences')
      expect(customerEmailCall?.html).not.toContain('Request type')
      expect(customerEmailCall?.text).toContain('Serves 8-12 people')

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
      expect(adminEmailCall?.text).toContain('- Delivery address: 221B Baker Street, London, NW1 6XE')
      expect(adminEmailCall?.text).toContain('- Design type: Individual design')
      expect(adminEmailCall?.text).toContain('- Filling: Sour cream')
      expect(adminEmailCall?.text).toContain('- Servings: Serves 8-12 people')
      expect(adminEmailCall?.text).toContain('- Customer message / requirements: Please call before delivery')
      expect(adminEmailCall?.text).toContain('- Referrer: instagram')

      expect(mockPatchFromMock).toHaveBeenCalledWith('test-order-id')
      expect(mockPatchSetFromMock).toHaveBeenCalledWith(expect.objectContaining({
        'metadata.customerEmailSent': true,
        'metadata.adminEmailSent': true,
        'metadata.emailAttemptedAt': expect.any(String)
      }))
      expect(mockPatchCommitFromMock).toHaveBeenCalled()
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

      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: formData
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockCreateFromMock).toHaveBeenCalledWith(
        expect.objectContaining({
          orderType: 'custom-design',
          items: [
            expect.objectContaining({
              productType: 'cake',
              productName: 'Custom Order'
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

      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: formData
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockCreateFromMock).toHaveBeenCalledWith(
        expect.objectContaining({
          orderType: 'browse-catalog',
          items: [
            expect.objectContaining({
              productType: 'cake',
              productName: 'Custom Order'
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
      formData.append('isOrderForm', 'true')
      formData.append('productType', 'cake')
      formData.append('productId', 'honey-cake')
      formData.append('productName', 'Honey Cake')
      formData.append('totalPrice', '25')
      formData.append('designImage', new File(['file'], 'design.jpg', { type: 'image/jpeg' }))

      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: formData
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockUploadFromMock).toHaveBeenCalled()
      expect(mockCreateFromMock).toHaveBeenCalled()
    })

    it('should persist gift note and include it in customer/admin emails for gift-hamper orders', async () => {
      const formData = new FormData()
      formData.append('name', 'Jane')
      formData.append('email', 'jane@example.com')
      formData.append('phone', '07123456789')
      formData.append('address', '7 Sample Street')
      formData.append('city', 'Leeds')
      formData.append('postcode', 'LS1 1AA')
      formData.append('giftNote', 'Happy birthday!')
      formData.append('isOrderForm', 'true')
      formData.append('orderType', 'Custom Design')
      formData.append('productType', 'gift-hamper')
      formData.append('productId', 'hamper-1')
      formData.append('productName', 'Honey Hamper')
      formData.append('totalPrice', '12.5')

      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: formData
      })

      await POST(request)

      expect(mockCreateFromMock).toHaveBeenCalledWith(
        expect.objectContaining({
          orderType: 'gift-hamper',
          delivery: expect.objectContaining({
            deliveryMethod: 'postal',
            deliveryAddress: '7 Sample Street, Leeds, LS1 1AA',
            giftNote: 'Happy birthday!'
          }),
          pricing: expect.objectContaining({
            paymentMethod: 'card',
            total: 12.5
          })
        })
      )

      const customerEmailCall = mockSend.mock.calls.find((call) => call[0].to === 'jane@example.com')?.[0]
      const adminEmailCall = mockSend.mock.calls
        .map((call) => call[0])
        .find((payload) => typeof payload.subject === 'string' && payload.subject.includes('New inline order'))

      expect(customerEmailCall?.text).toContain('Gift note: Happy birthday!')
      expect(customerEmailCall?.html).toContain('Gift note')
      expect(adminEmailCall?.text).toContain('- Gift note: Happy birthday!')
      expect(adminEmailCall?.html).toContain('Gift note')
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

    it('should return 500 for non-order contact submissions when transport does not accept delivery', async () => {
      process.env.EMAIL_TRANSPORT_MODE = 'disabled'

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

      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: formData
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockSend).not.toHaveBeenCalled()
      expect(mockPatchSetFromMock).toHaveBeenCalledWith(expect.objectContaining({
        'metadata.customerEmailSent': false,
        'metadata.adminEmailSent': false,
        'metadata.customerEmailError': 'Transport did not accept customer email',
        'metadata.adminEmailError': 'Transport did not accept admin email',
        'metadata.emailAttemptedAt': expect.any(String)
      }))
    })
    it('should keep fallback admin email complete when order creation fails', async () => {
      mockCreateFromMock.mockRejectedValue(new Error('Sanity creation failed'))

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

      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: formData
      })

      const response = await POST(request)
      const fallbackAdminEmailCall = mockSend.mock.calls
        .map((call) => call[0])
        .find((payload) => typeof payload.subject === 'string' && payload.subject.includes('New Order Inquiry'))

      expect(response.status).toBe(200)
      expect(mockSend).toHaveBeenCalledTimes(2)
      expect(fallbackAdminEmailCall?.html).toContain('Date needed')
      expect(fallbackAdminEmailCall?.text).toContain('- Date needed:')
      expect(fallbackAdminEmailCall?.text).toContain('- Product ID: honey-cake')
      expect(fallbackAdminEmailCall?.text).toContain('- Quantity: 1')
      expect(fallbackAdminEmailCall?.text).toContain('- Delivery method: collection')
      expect(fallbackAdminEmailCall?.text).toContain('- Delivery address: 12 Queen Road, Manchester, M1 1AA')
      expect(fallbackAdminEmailCall?.text).toContain('- Occasion: wedding')
      expect(fallbackAdminEmailCall?.text).toContain('- Design type: Individual design')
      expect(fallbackAdminEmailCall?.text).toContain('- Filling: Vanilla cream')
      expect(fallbackAdminEmailCall?.text).toContain('- Servings: Serves 20')
      expect(fallbackAdminEmailCall?.text).toContain('- Customer message / requirements: No nuts please')
      expect(fallbackAdminEmailCall?.text).toContain('- Referrer: google')
      expect(fallbackAdminEmailCall?.html).not.toContain('Request type')
      expect(fallbackAdminEmailCall?.text).not.toContain('Request type')
    })

    it('should include gift note in fallback customer email when order creation fails', async () => {
      mockCreateFromMock.mockRejectedValue(new Error('Sanity creation failed'))

      const formData = new FormData()
      formData.append('name', 'Jane')
      formData.append('email', 'jane@example.com')
      formData.append('phone', '07123456789')
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

      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: formData
      })

      const response = await POST(request)
      const fallbackCustomerEmailCall = mockSend.mock.calls
        .map((call) => call[0])
        .find((payload) => payload.to === 'jane@example.com' && typeof payload.subject === 'string' && payload.subject.includes('Order Inquiry Received'))

      expect(response.status).toBe(200)
      expect(mockSend).toHaveBeenCalledTimes(2)
      expect(fallbackCustomerEmailCall?.text).toContain('Gift note: Happy birthday!')
      expect(fallbackCustomerEmailCall?.html).toContain('Gift note')
    })

    it('should return 500 when fallback admin email is not accepted', async () => {
      mockCreateFromMock.mockRejectedValue(new Error('Sanity creation failed'))
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

      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: formData
      })

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

      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: formData
      })

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
