/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

const mockCreateSupabaseOrder = jest.fn()
const mockUpdateSupabaseOrderMetadata = jest.fn()
const mockSendEmail = jest.fn()
const mockSendTelegramManagerNotification = jest.fn()

jest.mock('@/lib/rate-limit', () => ({
  withRateLimit: <T extends (...args: unknown[]) => unknown>(handler: T) => handler
}))

jest.mock('@/lib/admin-auth', () => ({
  isAdminAuthenticated: jest.fn()
}))

jest.mock('@/lib/order-utils', () => ({
  generateOrderNumber: jest.fn(() => 'OC-TEST-1001')
}))

jest.mock('@/lib/orders/supabase-orders', () => ({
  createSupabaseOrder: (...args: unknown[]) => mockCreateSupabaseOrder(...args),
  listSupabaseOrders: jest.fn(),
  updateSupabaseOrderMetadata: (...args: unknown[]) => mockUpdateSupabaseOrderMetadata(...args)
}))

jest.mock('@/lib/email/service', () => ({
  getEmailTransportMode: jest.fn(() => 'disabled'),
  requiresLiveEmailConfiguration: jest.fn(() => false),
  sendEmail: (...args: unknown[]) => mockSendEmail(...args)
}))

jest.mock('@/lib/notifications/telegram', () => ({
  sendTelegramManagerNotification: (...args: unknown[]) => mockSendTelegramManagerNotification(...args)
}))

import { POST } from '../route'

describe('/api/orders POST', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateSupabaseOrder.mockResolvedValue({ _id: 'order-1', orderNumber: 'OC-TEST-1001', metadata: {} })
    mockUpdateSupabaseOrderMetadata.mockResolvedValue({ _id: 'order-1', metadata: {} })
    mockSendTelegramManagerNotification.mockResolvedValue({ sent: true, skipped: false })
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
    expect(mockCreateSupabaseOrder).toHaveBeenCalledWith(expect.objectContaining({
      orderType: 'custom-cake',
      metadata: expect.objectContaining({
        sourceOrderType: 'standard'
      })
    }))
    expect(mockSendEmail).toHaveBeenCalledTimes(2)
    expect(mockUpdateSupabaseOrderMetadata).toHaveBeenCalledWith('order-1', {}, expect.objectContaining({
      emailSent: false,
      emailError: expect.stringContaining('Transport did not accept the customer email')
    }))
  })

  it('normalizes legacy cakes by post order types before saving', async () => {
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
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '07123456789',
        message: 'Please send this by post',
        orderType: 'gift-hamper',
        productType: 'gift-hamper',
        productName: 'Honey Cake Card',
        designType: 'standard',
        quantity: 1,
        unitPrice: 12.5,
        totalPrice: 12.5,
        deliveryMethod: 'postal',
        paymentMethod: 'card'
      })
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(mockCreateSupabaseOrder).toHaveBeenCalledWith(expect.objectContaining({
      orderType: 'cakes-by-post',
      metadata: expect.objectContaining({
        sourceOrderType: 'gift-hamper'
      })
    }))
    expect(mockSendEmail.mock.calls[0]?.[0].input.orderType).toBe('cakes-by-post')
    expect(mockSendEmail.mock.calls[1]?.[0].input.orderType).toBe('cakes-by-post')
  })

  it('stores approximate request location from Vercel IP headers', async () => {
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
        'Content-Type': 'application/json',
        'x-vercel-ip-city': 'Manchester',
        'x-vercel-ip-country-region': 'ENG',
        'x-vercel-ip-country': 'GB'
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
    expect(mockCreateSupabaseOrder).toHaveBeenCalledWith(expect.objectContaining({
      metadata: expect.objectContaining({
        ipLocation: {
          city: 'Manchester',
          region: 'ENG',
          country: 'GB',
          latitude: undefined,
          longitude: undefined,
          source: 'vercel-ip-headers'
        }
      })
    }))
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

  it('sends a Telegram manager notification after order creation', async () => {
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
        totalPrice: 30,
        deliveryMethod: 'collection',
        paymentMethod: 'cash-collection'
      })
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(mockSendTelegramManagerNotification).toHaveBeenCalledWith(expect.objectContaining({
      type: 'new-order',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerPhone: '07123456789',
      productName: 'Honey Cake',
      total: 30,
      messagePreview: 'Please make it less sweet',
      adminPath: '/admin/orders/OC-TEST-1001'
    }))
  })

  it('still returns success when Telegram manager notification fails', async () => {
    mockSendTelegramManagerNotification.mockResolvedValueOnce({
      sent: false,
      skipped: false,
      error: 'Telegram failed'
    })
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
        totalPrice: 30,
        deliveryMethod: 'collection',
        paymentMethod: 'cash-collection'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(expect.objectContaining({
      success: true,
      orderId: 'order-1'
    }))
  })
})
