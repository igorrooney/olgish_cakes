/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

const mockCreate = jest.fn()
const mockPatchCommit = jest.fn()
const mockPatchSet = jest.fn(() => ({ commit: mockPatchCommit }))
const mockPatch = jest.fn(() => ({ set: mockPatchSet }))
const mockSendEmail = jest.fn()

jest.mock('@/lib/rate-limit', () => ({
  withRateLimit: <T extends (...args: unknown[]) => unknown>(handler: T) => handler
}))

jest.mock('@/lib/admin-auth', () => ({
  isAdminAuthenticated: jest.fn()
}))

jest.mock('@/lib/order-utils', () => ({
  generateOrderNumber: jest.fn(() => 'OC-TEST-1001')
}))

jest.mock('@/sanity/lib/client', () => ({
  serverClient: {
    create: (...args: unknown[]) => mockCreate(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
    fetch: jest.fn()
  }
}))

jest.mock('@/lib/email/service', () => ({
  getEmailTransportMode: jest.fn(() => 'disabled'),
  requiresLiveEmailConfiguration: jest.fn(() => false),
  sendEmail: (...args: unknown[]) => mockSendEmail(...args)
}))

import { POST } from '../route'

describe('/api/orders POST', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreate.mockResolvedValue({ _id: 'order-1' })
    mockPatchCommit.mockResolvedValue({ _id: 'order-1' })
    process.env.CONTACT_EMAIL_TO = 'admin@example.com'
  })

  it('marks customer email as failed when transport does not accept message', async () => {
    mockSendEmail
      .mockResolvedValueOnce({
        mode: 'disabled',
        accepted: false,
        id: null,
        error: null,
        rendered: {
          subject: 'Customer subject',
          text: 'Customer text',
          html: '<p>Customer</p>'
        }
      })
      .mockResolvedValueOnce({
        mode: 'disabled',
        accepted: true,
        id: 'admin-id-1',
        error: null,
        rendered: {
          subject: 'Admin subject',
          text: 'Admin text',
          html: '<p>Admin</p>'
        }
      })

    const request = new NextRequest('http://localhost/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '07123456789',
        message: 'Please make it less sweet',
        orderType: 'standard',
        productType: 'cake',
        productName: 'Honey Cake',
        designType: 'standard',
        quantity: 1,
        unitPrice: 30,
        totalPrice: 30,
        deliveryMethod: 'collection',
        paymentMethod: 'cash-collection'
      })
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(mockSendEmail).toHaveBeenCalledTimes(2)
    expect(mockPatch).toHaveBeenCalledWith('order-1')
    expect(mockPatchSet).toHaveBeenCalledWith(expect.objectContaining({
      'metadata.emailSent': false,
      'metadata.emailError': expect.stringContaining('Transport did not accept the customer email')
    }))
    expect(mockPatchCommit).toHaveBeenCalled()
  })
  it('passes all line items to customer and admin order emails', async () => {
    mockSendEmail
      .mockResolvedValueOnce({
        mode: 'disabled',
        accepted: true,
        id: 'customer-id-1',
        error: null,
        rendered: {
          subject: 'Customer subject',
          text: 'Customer text',
          html: '<p>Customer</p>'
        }
      })
      .mockResolvedValueOnce({
        mode: 'disabled',
        accepted: true,
        id: 'admin-id-1',
        error: null,
        rendered: {
          subject: 'Admin subject',
          text: 'Admin text',
          html: '<p>Admin</p>'
        }
      })

    const request = new NextRequest('http://localhost/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '07123456789',
        message: 'Please make it less sweet',
        orderType: 'standard',
        productType: 'cake',
        productName: 'Honey Cake',
        designType: 'standard',
        quantity: 1,
        unitPrice: 30,
        totalPrice: 55,
        deliveryMethod: 'collection',
        paymentMethod: 'cash-collection',
        items: [
          {
            productName: 'Honey Cake',
            productId: 'honey-cake',
            productType: 'cake',
            quantity: 2,
            unitPrice: 20,
            totalPrice: 40,
            designType: 'Floral piping',
            flavor: 'Vanilla',
            size: 'Serves 8',
            specialInstructions: 'No nuts'
          },
          {
            productName: 'Napoleon Slice',
            totalPrice: 15
          }
        ]
      })
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(mockSendEmail).toHaveBeenCalledTimes(2)

    const customerCall = mockSendEmail.mock.calls[0]?.[0]
    const adminCall = mockSendEmail.mock.calls[1]?.[0]

    expect(customerCall.templateId).toBe('orders-customer-confirmation')
    expect(adminCall.templateId).toBe('orders-admin-notification')

    expect(customerCall.input.orderItems).toHaveLength(2)
    expect(adminCall.input.orderItems).toHaveLength(2)

    expect(customerCall.input.orderItems[0]).toMatchObject({
      productName: 'Honey Cake',
      productId: 'honey-cake',
      productType: 'cake',
      quantity: 2,
      unitPrice: 20,
      totalPrice: 40,
      designType: 'Floral piping',
      filling: 'Vanilla',
      servings: 'Serves 8',
      specialInstructions: 'No nuts'
    })

    expect(customerCall.input.orderItems[1]).toMatchObject({
      productName: 'Napoleon Slice',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 15
    })

    expect(adminCall.input.orderItems[0]).toMatchObject({
      productName: 'Honey Cake',
      quantity: 2,
      totalPrice: 40
    })

    expect(adminCall.input.orderItems[1]).toMatchObject({
      productName: 'Napoleon Slice',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 15
    })
  })

  it('passes reference image URLs to the admin email when attachments are present', async () => {
    mockSendEmail
      .mockResolvedValueOnce({
        mode: 'disabled',
        accepted: true,
        id: 'customer-id-1',
        error: null,
        rendered: {
          subject: 'Customer subject',
          text: 'Customer text',
          html: '<p>Customer</p>'
        }
      })
      .mockResolvedValueOnce({
        mode: 'disabled',
        accepted: true,
        id: 'admin-id-1',
        error: null,
        rendered: {
          subject: 'Admin subject',
          text: 'Admin text',
          html: '<p>Admin</p>'
        }
      })

    const request = new NextRequest('http://localhost/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '07123456789',
        message: 'Please match the reference design',
        orderType: 'standard',
        productType: 'cake',
        productName: 'Honey Cake',
        designType: 'individual',
        quantity: 1,
        unitPrice: 30,
        totalPrice: 30,
        deliveryMethod: 'collection',
        paymentMethod: 'cash-collection',
        attachments: [
          {
            _type: 'reference',
            asset: {
              _type: 'image',
              _id: 'image-1',
              _ref: 'image-ref-1',
              url: 'https://cdn.sanity.io/images/demo/reference-1.jpg'
            },
            alt: 'Design reference'
          }
        ]
      })
    })

    const response = await POST(request)

    expect(response.status).toBe(200)

    const customerCall = mockSendEmail.mock.calls[0]?.[0]
    const adminCall = mockSendEmail.mock.calls[1]?.[0]

    expect(customerCall.input.attachmentNames).toEqual(['Design reference'])
    expect(customerCall.input.referenceImageUrls).toBeUndefined()
    expect(adminCall.input.attachmentNames).toEqual(['Design reference'])
    expect(adminCall.input.referenceImageUrls).toEqual([
      'https://cdn.sanity.io/images/demo/reference-1.jpg'
    ])
  })
})
