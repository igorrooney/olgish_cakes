/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

const mockGetSupabaseOrderByIdentifier = jest.fn()
const mockUpdateSupabaseOrder = jest.fn()
const mockDeleteSupabaseOrder = jest.fn()
const mockSendEmail = jest.fn()
const mockIsAdminAuthenticated = jest.fn()

jest.mock('@/lib/admin-auth', () => ({
  isAdminAuthenticated: (...args: unknown[]) => mockIsAdminAuthenticated(...args)
}))

jest.mock('@/lib/orders/supabase-orders', () => ({
  deleteSupabaseOrder: (...args: unknown[]) => mockDeleteSupabaseOrder(...args),
  getSupabaseOrderByIdentifier: (...args: unknown[]) => mockGetSupabaseOrderByIdentifier(...args),
  updateSupabaseOrder: (...args: unknown[]) => mockUpdateSupabaseOrder(...args),
  uploadSupabaseOrderNoteImage: jest.fn()
}))

jest.mock('@/lib/email/service', () => ({
  getEmailTransportMode: jest.fn(() => 'disabled'),
  requiresLiveEmailConfiguration: jest.fn(() => false),
  sendEmail: (...args: unknown[]) => mockSendEmail(...args)
}))

import { DELETE, PATCH } from '../route'

describe('/api/orders/[id] PATCH', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsAdminAuthenticated.mockResolvedValue(true)
    mockSendEmail.mockResolvedValue({
      mode: 'disabled',
      accepted: true,
      id: 'status-email-id',
      error: null,
      rendered: {
        subject: 'Order Confirmed #OC-2001 - Olgish Cakes',
        text: 'Status update text',
        html: '<p>Status update html</p>'
      }
    })
  })

  it('sends full line-item array in status update email input', async () => {
    const currentOrder = {
      _id: 'order-1',
      _createdAt: '2026-03-01T10:00:00.000Z',
      _updatedAt: '2026-03-01T10:00:00.000Z',
      orderNumber: 'OC-2001',
      status: 'new',
      orderType: 'standard',
      customer: {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '07123456789',
        address: '10 Example Street',
        city: 'London',
        postcode: 'SW1A 1AA'
      },
      items: [
        {
          productName: 'Honey Cake',
          productId: 'honey-cake',
          productType: 'cake',
          quantity: 2,
          unitPrice: 20,
          totalPrice: 40,
          designType: 'Floral piping',
          size: 'Serves 8',
          flavor: 'Vanilla',
          specialInstructions: 'No nuts'
        },
        {
          productName: 'Napoleon Slice',
          quantity: 1,
          totalPrice: 15
        }
      ],
      delivery: {
        deliveryMethod: 'collection',
        deliveryAddress: '10 Example Street, London, SW1A 1AA'
      },
      pricing: {
        total: 55,
        paymentStatus: 'pending',
        paymentMethod: 'cash-collection'
      },
      notes: []
    }

    mockGetSupabaseOrderByIdentifier.mockResolvedValueOnce(currentOrder)
    mockUpdateSupabaseOrder.mockImplementation(async (order: typeof currentOrder) => ({
      ...order,
      _updatedAt: '2026-03-01T10:10:00.000Z'
    }))

    const request = new NextRequest('http://localhost/api/orders/order-1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'confirmed'
      })
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: 'order-1' }) })

    expect(response.status).toBe(200)
    expect(mockGetSupabaseOrderByIdentifier).toHaveBeenCalledWith('order-1')
    expect(mockUpdateSupabaseOrder).toHaveBeenCalledWith(expect.objectContaining({
      status: 'confirmed'
    }))

    expect(mockSendEmail).toHaveBeenCalledTimes(1)

    const sendCall = mockSendEmail.mock.calls[0]?.[0]
    expect(sendCall.templateId).toBe('orders-status-update')
    expect(sendCall.input.orderItems).toHaveLength(2)
    expect(sendCall.input.orderItems[0]).toMatchObject({
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
    expect(sendCall.input.orderItems[1]).toMatchObject({
      productName: 'Napoleon Slice',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 15
    })
  })

  it('allows admins to clear an optional customer phone number', async () => {
    const currentOrder = {
      _id: 'order-1',
      _createdAt: '2026-03-01T10:00:00.000Z',
      _updatedAt: '2026-03-01T10:00:00.000Z',
      orderNumber: 'OC-2001',
      status: 'new',
      orderType: 'standard',
      customer: {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '07123456789',
        address: '10 Example Street',
        city: 'London',
        postcode: 'SW1A 1AA'
      },
      items: [
        {
          productName: 'Honey Cake',
          productId: 'honey-cake',
          productType: 'cake',
          quantity: 1,
          unitPrice: 20,
          totalPrice: 20
        }
      ],
      delivery: {
        deliveryMethod: 'collection',
        deliveryAddress: '10 Example Street, London, SW1A 1AA'
      },
      pricing: {
        total: 20,
        paymentStatus: 'pending',
        paymentMethod: 'cash-collection'
      },
      notes: []
    }

    mockGetSupabaseOrderByIdentifier.mockResolvedValueOnce(currentOrder)
    mockUpdateSupabaseOrder.mockImplementation(async (order: typeof currentOrder) => ({
      ...order,
      _updatedAt: '2026-03-01T10:10:00.000Z'
    }))

    const request = new NextRequest('http://localhost/api/orders/order-1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customerPhone: ''
      })
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: 'order-1' }) })
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(mockUpdateSupabaseOrder).toHaveBeenCalledWith(expect.objectContaining({
      customer: expect.objectContaining({
        phone: ''
      })
    }))
    expect(json.order.customer.phone).toBe('')
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('passes cakes by post status email fields for canonical confirmed orders', async () => {
    const currentOrder = {
      _id: 'order-1',
      _createdAt: '2026-05-12T18:00:00.000Z',
      _updatedAt: '2026-05-12T18:00:00.000Z',
      orderNumber: '26051220022842',
      status: 'new',
      orderType: 'cakes-by-post',
      customer: {
        name: 'Igor Ieromenko',
        email: 'igor@example.com',
        phone: '07123456789',
        address: '15 Allerton Grange Avenue',
        city: 'Leeds',
        postcode: 'LS17 6PR'
      },
      items: [
        {
          productName: 'Personalised Congratulations Cake Card',
          productId: 'personalised-congratulations-cake-card',
          productType: 'gift-hamper',
          quantity: 1,
          unitPrice: 8.95,
          totalPrice: 8.95,
          designType: 'standard',
          specialInstructions: 'test message'
        }
      ],
      delivery: {
        dateNeeded: '2026-05-26',
        deliveryMethod: 'postal',
        deliveryAddress: '15 Allerton Grange Avenue, Leeds, LS17 6PR',
        giftNote: 'gift note test'
      },
      pricing: {
        total: 8.95,
        paymentStatus: 'pending',
        paymentMethod: 'card'
      },
      messages: [],
      notes: [],
      metadata: {}
    }

    mockGetSupabaseOrderByIdentifier.mockResolvedValueOnce(currentOrder)
    mockUpdateSupabaseOrder.mockImplementation(async (order: typeof currentOrder) => ({
      ...order,
      _updatedAt: '2026-05-12T18:10:00.000Z'
    }))

    const request = new NextRequest('http://localhost/api/orders/order-1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'confirmed'
      })
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: 'order-1' }) })

    expect(response.status).toBe(200)

    const sendCall = mockSendEmail.mock.calls[0]?.[0]
    expect(sendCall.templateId).toBe('orders-status-update')
    expect(sendCall.input).toMatchObject({
      productType: 'gift-hamper',
      headingOverride: 'Order request confirmed',
      titleOverride: 'Order Request Confirmed #26051220022842 - Olgish Cakes',
      statusMessage: 'Great news, we\'ve confirmed your cakes by post request.',
      customerMessage: 'test message',
      giftNote: 'gift note test',
      deliveryAddress: '15 Allerton Grange Avenue, Leeds, LS17 6PR',
      paymentStatus: 'pending'
    })
  })

  it('passes cakes by post status email fields for in-progress orders', async () => {
    const currentOrder = {
      _id: 'order-1',
      _createdAt: '2026-05-12T18:00:00.000Z',
      _updatedAt: '2026-05-12T18:00:00.000Z',
      orderNumber: '26051220022842',
      status: 'confirmed',
      orderType: 'gift-hamper',
      customer: {
        name: 'Igor Ieromenko',
        email: 'igor@example.com',
        phone: '07123456789',
        address: '15 Allerton Grange Avenue',
        city: 'Leeds',
        postcode: 'LS17 6PR'
      },
      items: [
        {
          productName: 'Personalised Congratulations Cake Card',
          productId: 'personalised-congratulations-cake-card',
          productType: 'gift-hamper',
          quantity: 1,
          unitPrice: 8.95,
          totalPrice: 8.95,
          designType: 'standard',
          specialInstructions: 'test message'
        }
      ],
      delivery: {
        dateNeeded: '2026-05-26',
        deliveryMethod: 'postal',
        deliveryAddress: '15 Allerton Grange Avenue, Leeds, LS17 6PR',
        giftNote: 'gift note test'
      },
      pricing: {
        total: 8.95,
        paymentStatus: 'paid',
        paymentMethod: 'card'
      },
      messages: [],
      notes: [],
      metadata: {}
    }

    mockGetSupabaseOrderByIdentifier.mockResolvedValueOnce(currentOrder)
    mockUpdateSupabaseOrder.mockImplementation(async (order: typeof currentOrder) => ({
      ...order,
      _updatedAt: '2026-05-12T18:10:00.000Z'
    }))

    const request = new NextRequest('http://localhost/api/orders/order-1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'in-progress'
      })
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: 'order-1' }) })

    expect(response.status).toBe(200)

    const sendCall = mockSendEmail.mock.calls[0]?.[0]
    expect(sendCall.templateId).toBe('orders-status-update')
    expect(sendCall.input).toMatchObject({
      productType: 'gift-hamper',
      status: 'in-progress',
      headingOverride: 'Order in progress',
      titleOverride: 'Order In Progress #26051220022842 - Olgish Cakes',
      statusMessage: 'Your cakes by post order is now being prepared.',
      paymentStatus: 'paid'
    })
  })

  it('saves courier metadata and passes it into cakes by post out-for-delivery emails', async () => {
    const currentOrder = {
      _id: 'order-1',
      _createdAt: '2026-05-12T18:00:00.000Z',
      _updatedAt: '2026-05-12T18:00:00.000Z',
      orderNumber: '26051220022842',
      status: 'in-progress',
      orderType: 'gift-hamper',
      customer: {
        name: 'Igor Ieromenko',
        email: 'igor@example.com',
        phone: '07123456789',
        address: '15 Allerton Grange Avenue',
        city: 'Leeds',
        postcode: 'LS17 6PR'
      },
      items: [
        {
          productName: 'Personalised Congratulations Cake Card',
          productId: 'personalised-congratulations-cake-card',
          productType: 'gift-hamper',
          quantity: 1,
          unitPrice: 8.95,
          totalPrice: 8.95,
          specialInstructions: 'test message'
        }
      ],
      delivery: {
        dateNeeded: '2026-05-26',
        deliveryMethod: 'postal',
        deliveryAddress: '15 Allerton Grange Avenue, Leeds, LS17 6PR',
        trackingNumber: ''
      },
      pricing: {
        total: 8.95,
        paymentStatus: 'paid',
        paymentMethod: 'card'
      },
      messages: [],
      notes: [],
      metadata: {}
    }

    mockGetSupabaseOrderByIdentifier.mockResolvedValueOnce(currentOrder)
    mockUpdateSupabaseOrder.mockImplementation(async (order: typeof currentOrder) => ({
      ...order,
      _updatedAt: '2026-05-12T18:10:00.000Z'
    }))

    const request = new NextRequest('http://localhost/api/orders/order-1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'out-delivery',
        deliveryCourier: 'evri',
        trackingNumber: 'H02X8A0022918652'
      })
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: 'order-1' }) })

    expect(response.status).toBe(200)
    expect(mockUpdateSupabaseOrder).toHaveBeenCalledWith(expect.objectContaining({
      delivery: expect.objectContaining({
        trackingNumber: 'H02X8A0022918652'
      }),
      metadata: expect.objectContaining({
        deliveryCourier: 'evri'
      })
    }))

    const sendCall = mockSendEmail.mock.calls[0]?.[0]
    expect(sendCall.templateId).toBe('orders-status-update')
    expect(sendCall.input).toMatchObject({
      status: 'out-for-delivery',
      deliveryCourier: 'evri',
      trackingNumber: 'H02X8A0022918652',
      headingOverride: 'Order dispatched',
      titleOverride: 'Order Dispatched #26051220022842 - Olgish Cakes',
      statusMessage: 'Great news, your cakes by post order has been dispatched with Evri.'
    })
  })

  it('updates delivery address from a JSON admin edit', async () => {
    const currentOrder = {
      _id: 'order-1',
      _createdAt: '2026-05-12T18:00:00.000Z',
      _updatedAt: '2026-05-12T18:00:00.000Z',
      orderNumber: '26051220022842',
      status: 'new',
      orderType: 'gift-hamper',
      customer: {
        name: 'Igor Ieromenko',
        email: 'igor@example.com',
        phone: '07123456789'
      },
      items: [
        {
          productName: 'Personalised Congratulations Cake Card',
          productId: 'personalised-congratulations-cake-card',
          productType: 'gift-hamper',
          quantity: 1,
          unitPrice: 8.95,
          totalPrice: 8.95
        }
      ],
      delivery: {
        dateNeeded: '2026-05-26',
        deliveryMethod: 'postal',
        deliveryAddress: '15 Allerton Grange Avenue, Leeds, LS17 6PR'
      },
      pricing: {
        total: 8.95,
        paymentStatus: 'pending',
        paymentMethod: 'card'
      },
      messages: [],
      notes: [],
      metadata: {}
    }

    mockGetSupabaseOrderByIdentifier.mockResolvedValueOnce(currentOrder)
    mockUpdateSupabaseOrder.mockImplementation(async (order: typeof currentOrder) => order)

    const request = new NextRequest('http://localhost/api/orders/order-1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        deliveryAddress: '17 Allerton Grange Avenue, Leeds, LS17 6PR'
      })
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: 'order-1' }) })

    expect(response.status).toBe(200)
    expect(mockUpdateSupabaseOrder).toHaveBeenCalledWith(expect.objectContaining({
      delivery: expect.objectContaining({
        deliveryAddress: '17 Allerton Grange Avenue, Leeds, LS17 6PR'
      })
    }))
  })

  it('mirrors admin recipient edits into order metadata for fallback reads', async () => {
    const currentOrder = {
      _id: 'order-1',
      _createdAt: '2026-05-12T18:00:00.000Z',
      _updatedAt: '2026-05-12T18:00:00.000Z',
      orderNumber: '26051220022842',
      status: 'new',
      orderType: 'gift-hamper',
      customer: {
        name: 'Igor Ieromenko',
        email: 'igor@example.com',
        phone: '07123456789'
      },
      items: [
        {
          productName: 'Personalised Congratulations Cake Card',
          productId: 'personalised-congratulations-cake-card',
          productType: 'gift-hamper',
          quantity: 1,
          unitPrice: 8.95,
          totalPrice: 8.95
        }
      ],
      delivery: {
        dateNeeded: '2026-05-26',
        deliveryMethod: 'postal',
        deliveryAddress: '15 Allerton Grange Avenue, Leeds, LS17 6PR'
      },
      pricing: {
        total: 8.95,
        paymentStatus: 'pending',
        paymentMethod: 'card'
      },
      messages: [],
      notes: [],
      metadata: {
        inlineOrderContext: {
          customerMessage: 'Please send carefully'
        }
      }
    }

    mockGetSupabaseOrderByIdentifier.mockResolvedValueOnce(currentOrder)
    mockUpdateSupabaseOrder.mockImplementation(async (order: typeof currentOrder) => order)

    const request = new NextRequest('http://localhost/api/orders/order-1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        deliveryRecipientName: 'Olga'
      })
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: 'order-1' }) })

    expect(response.status).toBe(200)
    expect(mockUpdateSupabaseOrder).toHaveBeenCalledWith(expect.objectContaining({
      delivery: expect.objectContaining({
        recipientName: 'Olga'
      }),
      metadata: expect.objectContaining({
        inlineOrderContext: expect.objectContaining({
          customerMessage: 'Please send carefully',
          deliveryRecipientName: 'Olga'
        })
      })
    }))
  })

  it('clears legacy recipient metadata when admins clear the recipient field', async () => {
    const currentOrder = {
      _id: 'order-1',
      _createdAt: '2026-05-12T18:00:00.000Z',
      _updatedAt: '2026-05-12T18:00:00.000Z',
      orderNumber: '26051220022842',
      status: 'new',
      orderType: 'gift-hamper',
      customer: {
        name: 'Igor Ieromenko',
        email: 'igor@example.com',
        phone: '07123456789'
      },
      items: [
        {
          productName: 'Personalised Congratulations Cake Card',
          productId: 'personalised-congratulations-cake-card',
          productType: 'gift-hamper',
          quantity: 1,
          unitPrice: 8.95,
          totalPrice: 8.95
        }
      ],
      delivery: {
        dateNeeded: '2026-05-26',
        deliveryMethod: 'postal',
        recipientName: 'Legacy Recipient',
        deliveryAddress: '15 Allerton Grange Avenue, Leeds, LS17 6PR'
      },
      pricing: {
        total: 8.95,
        paymentStatus: 'pending',
        paymentMethod: 'card'
      },
      messages: [],
      notes: [],
      metadata: {
        deliveryRecipientName: 'Root Delivery Recipient',
        recipientName: 'Root Legacy Recipient',
        inlineOrderContext: {
          customerMessage: 'Please send carefully',
          deliveryRecipientName: 'Inline Delivery Recipient',
          recipientName: 'Inline Legacy Recipient'
        }
      }
    }

    mockGetSupabaseOrderByIdentifier.mockResolvedValueOnce(currentOrder)
    mockUpdateSupabaseOrder.mockImplementation(async (order: typeof currentOrder) => order)

    const request = new NextRequest('http://localhost/api/orders/order-1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        deliveryRecipientName: ''
      })
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: 'order-1' }) })

    expect(response.status).toBe(200)
    expect(mockUpdateSupabaseOrder).toHaveBeenCalledWith(expect.objectContaining({
      delivery: expect.objectContaining({
        recipientName: undefined
      }),
      metadata: {
        inlineOrderContext: {
          customerMessage: 'Please send carefully'
        }
      }
    }))
  })

  it('uses Evri as the default cakes by post courier for dispatch emails', async () => {
    const currentOrder = {
      _id: 'order-1',
      _createdAt: '2026-05-12T18:00:00.000Z',
      _updatedAt: '2026-05-12T18:00:00.000Z',
      orderNumber: '26051220022842',
      status: 'in-progress',
      orderType: 'gift-hamper',
      customer: {
        name: 'Igor Ieromenko',
        email: 'igor@example.com',
        phone: '07123456789'
      },
      items: [
        {
          productName: 'Personalised Congratulations Cake Card',
          productId: 'personalised-congratulations-cake-card',
          productType: 'gift-hamper',
          quantity: 1,
          unitPrice: 8.95,
          totalPrice: 8.95
        }
      ],
      delivery: {
        dateNeeded: '2026-05-26',
        deliveryMethod: 'postal',
        deliveryAddress: '15 Allerton Grange Avenue, Leeds, LS17 6PR'
      },
      pricing: {
        total: 8.95,
        paymentStatus: 'paid',
        paymentMethod: 'card'
      },
      messages: [],
      notes: [],
      metadata: {}
    }

    mockGetSupabaseOrderByIdentifier.mockResolvedValueOnce(currentOrder)
    mockUpdateSupabaseOrder.mockImplementation(async (order: typeof currentOrder) => order)

    const request = new NextRequest('http://localhost/api/orders/order-1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'out-delivery',
        trackingNumber: 'H02X8A0022918652'
      })
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: 'order-1' }) })

    expect(response.status).toBe(200)

    const sendCall = mockSendEmail.mock.calls[0]?.[0]
    expect(sendCall.input).toMatchObject({
      status: 'out-for-delivery',
      deliveryCourier: 'evri',
      statusMessage: 'Great news, your cakes by post order has been dispatched with Evri.'
    })
  })

  it('rejects delivery address updates with control characters', async () => {
    const request = new NextRequest('http://localhost/api/orders/order-1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        deliveryAddress: '17 Allerton\u0000Grange Avenue'
      })
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: 'order-1' }) })
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toEqual({
      error: 'Validation failed',
      details: 'Delivery address cannot contain control characters'
    })
    expect(mockGetSupabaseOrderByIdentifier).not.toHaveBeenCalled()
    expect(mockUpdateSupabaseOrder).not.toHaveBeenCalled()
  })

  it('rejects non-string delivery recipient JSON updates', async () => {
    const request = new NextRequest('http://localhost/api/orders/order-1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        deliveryRecipientName: 123
      })
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: 'order-1' }) })
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toEqual({
      error: 'Validation failed',
      details: 'Recipient name must be a string'
    })
    expect(mockGetSupabaseOrderByIdentifier).not.toHaveBeenCalled()
    expect(mockUpdateSupabaseOrder).not.toHaveBeenCalled()
  })

  it('rejects non-string delivery address JSON updates', async () => {
    const request = new NextRequest('http://localhost/api/orders/order-1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        deliveryAddress: {
          line1: '17 Allerton Grange Avenue'
        }
      })
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: 'order-1' }) })
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toEqual({
      error: 'Validation failed',
      details: 'Delivery address must be a string'
    })
    expect(mockGetSupabaseOrderByIdentifier).not.toHaveBeenCalled()
    expect(mockUpdateSupabaseOrder).not.toHaveBeenCalled()
  })

  it('uses cakes by post delivered wording for delivered status emails', async () => {
    const currentOrder = {
      _id: 'order-1',
      _createdAt: '2026-05-12T18:00:00.000Z',
      _updatedAt: '2026-05-12T18:00:00.000Z',
      orderNumber: '26051220022842',
      status: 'out-delivery',
      orderType: 'gift-hamper',
      customer: {
        name: 'Igor Ieromenko',
        email: 'igor@example.com',
        phone: '07123456789',
        address: '15 Allerton Grange Avenue',
        city: 'Leeds',
        postcode: 'LS17 6PR'
      },
      items: [
        {
          productName: 'Personalised Congratulations Cake Card',
          productId: 'personalised-congratulations-cake-card',
          productType: 'gift-hamper',
          quantity: 1,
          unitPrice: 8.95,
          totalPrice: 8.95,
          specialInstructions: 'test message'
        }
      ],
      delivery: {
        dateNeeded: '2026-05-26',
        deliveryMethod: 'postal',
        deliveryAddress: '15 Allerton Grange Avenue, Leeds, LS17 6PR',
        trackingNumber: '1234567'
      },
      pricing: {
        total: 8.95,
        paymentStatus: 'paid',
        paymentMethod: 'card'
      },
      messages: [],
      notes: [],
      metadata: {
        deliveryCourier: 'royal-mail'
      }
    }

    mockGetSupabaseOrderByIdentifier.mockResolvedValueOnce(currentOrder)
    mockUpdateSupabaseOrder.mockImplementation(async (order: typeof currentOrder) => ({
      ...order,
      _updatedAt: '2026-05-12T18:10:00.000Z'
    }))

    const request = new NextRequest('http://localhost/api/orders/order-1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'delivered'
      })
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: 'order-1' }) })

    expect(response.status).toBe(200)

    const sendCall = mockSendEmail.mock.calls[0]?.[0]
    expect(sendCall.templateId).toBe('orders-status-update')
    expect(sendCall.input).toMatchObject({
      productType: 'gift-hamper',
      status: 'delivered',
      deliveryCourier: 'royal-mail',
      trackingNumber: '1234567',
      headingOverride: 'Order delivered',
      titleOverride: 'Order Delivered #26051220022842 - Olgish Cakes',
      statusMessage: 'Your cakes by post order has been delivered. We hope it arrived safely and is enjoyed.'
    })
  })

  it('uses cakes by post cancelled wording for cancelled status emails', async () => {
    const currentOrder = {
      _id: 'order-1',
      _createdAt: '2026-05-12T18:00:00.000Z',
      _updatedAt: '2026-05-12T18:00:00.000Z',
      orderNumber: '26051219414558',
      status: 'confirmed',
      orderType: 'gift-hamper',
      customer: {
        name: 'Igor Ieromenko',
        email: 'igor@example.com',
        phone: '07123456789',
        address: '15 Allerton Grange Avenue',
        city: 'Leeds',
        postcode: 'LS17 6PR'
      },
      items: [
        {
          productName: 'Personalised Congratulations Cake Card',
          productId: 'personalised-congratulations-cake-card',
          productType: 'gift-hamper',
          quantity: 1,
          unitPrice: 8.95,
          totalPrice: 8.95
        }
      ],
      delivery: {
        dateNeeded: '2026-05-27',
        deliveryMethod: 'postal',
        deliveryAddress: '15 Allerton Grange Avenue, Leeds, LS17 6PR',
        trackingNumber: '12345678'
      },
      pricing: {
        total: 8.95,
        paymentStatus: 'pending',
        paymentMethod: 'card'
      },
      messages: [],
      notes: [],
      metadata: {
        deliveryCourier: 'evri'
      }
    }

    mockGetSupabaseOrderByIdentifier.mockResolvedValueOnce(currentOrder)
    mockUpdateSupabaseOrder.mockImplementation(async (order: typeof currentOrder) => ({
      ...order,
      _updatedAt: '2026-05-12T18:10:00.000Z'
    }))

    const request = new NextRequest('http://localhost/api/orders/order-1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'cancelled'
      })
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: 'order-1' }) })

    expect(response.status).toBe(200)

    const sendCall = mockSendEmail.mock.calls[0]?.[0]
    expect(sendCall.templateId).toBe('orders-status-update')
    expect(sendCall.input).toMatchObject({
      productType: 'gift-hamper',
      status: 'cancelled',
      headingOverride: 'Order cancelled',
      titleOverride: 'Order Cancelled #26051219414558 - Olgish Cakes',
      statusMessage: 'Your cakes by post order has been cancelled. If you have any questions, please contact us and we\'ll help.'
    })
  })

  it('preserves additional order items when multipart admin edits include selected cake fields', async () => {
    const currentOrder = {
      _id: 'order-1',
      _createdAt: '2026-03-01T10:00:00.000Z',
      _updatedAt: '2026-03-01T10:00:00.000Z',
      orderNumber: 'OC-2001',
      status: 'new',
      orderType: 'gift-hamper',
      customer: {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '07123456789'
      },
      items: [
        {
          productName: 'Gift Hamper',
          productId: 'hamper-1',
          productType: 'gift-hamper',
          quantity: 1,
          unitPrice: 45,
          totalPrice: 45,
          designType: 'standard',
          size: '',
          flavor: '',
          specialInstructions: 'Ribbon please'
        },
        {
          productName: 'Extra Honey Cake',
          productId: 'honey-extra',
          productType: 'cake',
          quantity: 1,
          unitPrice: 20,
          totalPrice: 20
        }
      ],
      delivery: {
        deliveryMethod: 'postal',
        deliveryAddress: '10 Example Street'
      },
      pricing: {
        total: 65,
        paymentStatus: 'pending',
        paymentMethod: 'card'
      },
      notes: []
    }

    mockGetSupabaseOrderByIdentifier.mockResolvedValueOnce(currentOrder)
    mockUpdateSupabaseOrder.mockImplementation(async (order: typeof currentOrder) => order)

    const formData = new FormData()
    formData.append('status', 'confirmed')
    formData.append('itemPrice', '45')
    formData.append('totalPrice', '65')
    formData.append('selectedCakeId', 'hamper-1')
    formData.append('selectedCakeName', 'Gift Hamper')
    formData.append('selectedCakeSize', '')
    formData.append('selectedDesignType', 'standard')

    const request = new NextRequest('http://localhost/api/orders/order-1', {
      method: 'PATCH',
      body: formData
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: 'order-1' }) })

    expect(response.status).toBe(200)
    const updatedOrder = mockUpdateSupabaseOrder.mock.calls[0]?.[0]

    expect(updatedOrder.items).toHaveLength(2)
    expect(updatedOrder.items[0]).toMatchObject({
      productName: 'Gift Hamper',
      productType: 'gift-hamper',
      totalPrice: 45
    })
    expect(updatedOrder.items[1]).toEqual(currentOrder.items[1])
  })

  it('updates the full item list from a JSON admin edit', async () => {
    const currentOrder = {
      _id: 'order-1',
      _createdAt: '2026-03-01T10:00:00.000Z',
      _updatedAt: '2026-03-01T10:00:00.000Z',
      orderNumber: 'OC-2001',
      status: 'confirmed',
      orderType: 'standard',
      customer: {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '07123456789'
      },
      items: [
        {
          productName: 'Honey Cake',
          productId: 'honey-cake',
          productType: 'cake',
          quantity: 1,
          unitPrice: 40,
          totalPrice: 40
        }
      ],
      delivery: {
        deliveryMethod: 'collection'
      },
      pricing: {
        subtotal: 40,
        total: 40,
        paymentStatus: 'partial',
        paymentMethod: 'cash-collection'
      },
      notes: []
    }

    mockGetSupabaseOrderByIdentifier.mockResolvedValueOnce(currentOrder)
    mockUpdateSupabaseOrder.mockImplementation(async (order: typeof currentOrder) => order)

    const request = new NextRequest('http://localhost/api/orders/order-1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: [
          {
            productName: 'Updated Cake',
            productId: 'honey-cake',
            productType: 'cake',
            quantity: 2,
            unitPrice: 75,
            totalPrice: 150,
            size: '8 inch',
            flavor: 'Chocolate',
            designType: 'Mario',
            specialInstructions: 'Add castle'
          }
        ],
        subtotal: 150,
        total: 150
      })
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: 'order-1' }) })

    expect(response.status).toBe(200)
    const updatedOrder = mockUpdateSupabaseOrder.mock.calls[0]?.[0]

    expect(updatedOrder.items).toHaveLength(1)
    expect(updatedOrder.items[0]).toMatchObject({
      productName: 'Updated Cake',
      productId: 'honey-cake',
      productType: 'cake',
      quantity: 2,
      unitPrice: 75,
      totalPrice: 150,
      size: '8 inch',
      flavor: 'Chocolate',
      designType: 'Mario',
      specialInstructions: 'Add castle'
    })
    expect(updatedOrder.pricing).toMatchObject({
      subtotal: 150,
      total: 150
    })
  })

  it('clears the payment method when an empty value is submitted', async () => {
    const currentOrder = {
      _id: 'order-1',
      _createdAt: '2026-03-01T10:00:00.000Z',
      _updatedAt: '2026-03-01T10:00:00.000Z',
      orderNumber: 'OC-2001',
      status: 'confirmed',
      orderType: 'standard',
      customer: {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '07123456789'
      },
      items: [
        {
          productName: 'Honey Cake',
          productId: 'honey-cake',
          productType: 'cake',
          quantity: 1,
          unitPrice: 40,
          totalPrice: 40
        }
      ],
      delivery: {
        deliveryMethod: 'collection'
      },
      pricing: {
        subtotal: 40,
        total: 40,
        paymentStatus: 'partial',
        paymentMethod: 'cash-collection'
      },
      notes: []
    }

    mockGetSupabaseOrderByIdentifier.mockResolvedValueOnce(currentOrder)
    mockUpdateSupabaseOrder.mockImplementation(async (order: typeof currentOrder) => order)

    const request = new NextRequest('http://localhost/api/orders/order-1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        paymentMethod: ''
      })
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: 'order-1' }) })

    expect(response.status).toBe(200)
    expect(mockUpdateSupabaseOrder.mock.calls[0]?.[0].pricing.paymentMethod).toBe('')
  })
})

describe('/api/orders/[id] DELETE', () => {
  const originalAdminPassword = process.env.ADMIN_PASSWORD
  const currentOrder = {
    _id: 'order-1',
    _createdAt: '2026-03-01T10:00:00.000Z',
    _updatedAt: '2026-03-01T10:00:00.000Z',
    orderNumber: 'OC-2001',
    status: 'new',
    orderType: 'standard',
    customer: {
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '07123456789'
    },
    items: [{
      productName: 'Honey Cake',
      quantity: 1,
      totalPrice: 40
    }],
    delivery: {
      deliveryMethod: 'collection'
    },
    pricing: {
      total: 40,
      paymentStatus: 'pending',
      paymentMethod: 'cash-collection'
    },
    notes: []
  }

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.ADMIN_PASSWORD = 'correct-password'
    mockIsAdminAuthenticated.mockResolvedValue(true)
    mockGetSupabaseOrderByIdentifier.mockResolvedValue(currentOrder)
    mockDeleteSupabaseOrder.mockResolvedValue(undefined)
    mockUpdateSupabaseOrder.mockImplementation(async (order: typeof currentOrder) => order)
    mockSendEmail.mockResolvedValue({
      mode: 'disabled',
      accepted: true,
      id: 'status-email-id',
      error: null
    })
  })

  afterAll(() => {
    process.env.ADMIN_PASSWORD = originalAdminPassword
  })

  it('permanently deletes an order when the admin password is valid', async () => {
    const request = new NextRequest('http://localhost/api/orders/order-1', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        permanent: true,
        password: 'correct-password'
      })
    })

    const response = await DELETE(request, { params: Promise.resolve({ id: 'order-1' }) })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({
      success: true,
      message: 'Order permanently deleted from Supabase'
    })
    expect(mockDeleteSupabaseOrder).toHaveBeenCalledWith('order-1')
    expect(mockUpdateSupabaseOrder).not.toHaveBeenCalled()
  })

  it('rejects permanent delete when the admin password is invalid', async () => {
    const request = new NextRequest('http://localhost/api/orders/order-1', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        permanent: true,
        password: 'wrong-password'
      })
    })

    const response = await DELETE(request, { params: Promise.resolve({ id: 'order-1' }) })

    expect(response.status).toBe(401)
    expect(mockDeleteSupabaseOrder).not.toHaveBeenCalled()
    expect(mockUpdateSupabaseOrder).not.toHaveBeenCalled()
  })

  it('rejects permanent delete when the admin password is missing', async () => {
    const request = new NextRequest('http://localhost/api/orders/order-1', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        permanent: true
      })
    })

    const response = await DELETE(request, { params: Promise.resolve({ id: 'order-1' }) })

    expect(response.status).toBe(400)
    expect(mockDeleteSupabaseOrder).not.toHaveBeenCalled()
    expect(mockUpdateSupabaseOrder).not.toHaveBeenCalled()
  })

  it('soft-cancels an order when permanent delete is not requested', async () => {
    const request = new NextRequest('http://localhost/api/orders/order-1', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    })

    const response = await DELETE(request, { params: Promise.resolve({ id: 'order-1' }) })

    expect(response.status).toBe(200)
    expect(mockDeleteSupabaseOrder).not.toHaveBeenCalled()
    expect(mockUpdateSupabaseOrder).toHaveBeenCalledWith(expect.objectContaining({
      status: 'cancelled',
      pricing: expect.objectContaining({
        paymentStatus: 'cancelled',
        paymentMethod: 'cancelled'
      })
    }))
  })
})
