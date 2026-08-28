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
  const makeComplianceOrder = () => ({
    _id: 'order-compliance',
    _createdAt: '2026-08-23T09:00:00.000Z',
    _updatedAt: '2026-08-23T09:00:00.000Z',
    orderNumber: 'OC-COMPLIANCE',
    status: 'in-progress',
    orderType: 'standard',
    customer: {
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '07123456789'
    },
    items: [{
      productName: 'Honey Cake',
      quantity: 1,
      unitPrice: 40,
      totalPrice: 40
    }],
    delivery: { deliveryMethod: 'collection' },
    pricing: {
      total: 40,
      paymentStatus: 'paid'
    },
    notes: [],
    metadata: {
      customerAcceptedOffer: true,
      customerFacingOfferDescription: 'One handmade Honey Cake for collection.',
      allergenStatement: 'Contains wheat (gluten), eggs and milk.'
    }
  })

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

  it.each([
    [{ status: 'production' }, 'Order status is invalid.'],
    [{ status: 42 }, 'Order status is invalid.'],
    [{ customerFacingOfferDescription: 42 }, 'Final-offer description must be text.'],
    [{ allergenStatement: false }, 'Allergen information must be text.'],
    [{ customerAcceptedOffer: 'true' }, 'Customer acceptance must be true or false.'],
    [{ allergenLabelIncluded: 'true' }, 'Written allergen label confirmation must be true or false.']
  ])('rejects malformed compliance updates before reading or persisting the order: %p', async (body, details) => {
    const request = new NextRequest('http://localhost/api/orders/order-compliance', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    const response = await PATCH(request, {
      params: Promise.resolve({ id: 'order-compliance' })
    })

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: 'Validation failed',
      details
    })
    expect(mockGetSupabaseOrderByIdentifier).not.toHaveBeenCalled()
    expect(mockUpdateSupabaseOrder).not.toHaveBeenCalled()
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it.each([
    [
      'customerFacingOfferDescription',
      'Final-offer description must be 2,000 characters or fewer.'
    ],
    [
      'allergenStatement',
      'Allergen information must be 2,000 characters or fewer.'
    ]
  ] as const)('rejects an overlong %s value', async (field, details) => {
    mockGetSupabaseOrderByIdentifier.mockResolvedValueOnce(makeComplianceOrder())

    const request = new NextRequest('http://localhost/api/orders/order-compliance', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: 'x'.repeat(2001) })
    })

    const response = await PATCH(request, {
      params: Promise.resolve({ id: 'order-compliance' })
    })
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json).toEqual({
      error: 'Validation failed',
      details
    })
    expect(mockUpdateSupabaseOrder).not.toHaveBeenCalled()
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it.each([
    'ready-pickup',
    'out-delivery',
    'delivered',
    'completed'
  ] as const)('blocks the %s fulfilment status without written allergen information', async (status) => {
    mockGetSupabaseOrderByIdentifier.mockResolvedValueOnce(makeComplianceOrder())

    const request = new NextRequest('http://localhost/api/orders/order-compliance', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })

    const response = await PATCH(request, {
      params: Promise.resolve({ id: 'order-compliance' })
    })
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json).toEqual({
      error: 'Written allergen label required',
      details: 'Confirm that the written product-specific allergen information is included with the food.'
    })
    expect(mockUpdateSupabaseOrder).not.toHaveBeenCalled()
    expect(mockSendEmail).not.toHaveBeenCalled()
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
        status: 'confirmed',
        customerFacingOfferDescription: 'Two handmade cakes with floral piping and vanilla filling.',
        allergenStatement: 'Contains wheat (gluten), eggs and milk.'
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
      servings: 'Serves 8'
    })
    expect(sendCall.input.orderItems[0].specialInstructions).toBeUndefined()
    expect(sendCall.input.customerFacingOfferDescription).toBe('Two handmade cakes with floral piping and vanilla filling.')
    expect(sendCall.input.orderItems[1]).toMatchObject({
      productName: 'Napoleon Slice',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 15
    })
    expect(sendCall.input.statusMessage).toContain('terms version 2026-07-28')
    expect(sendCall.input.allergenStatement).toBe('Contains wheat (gluten), eggs and milk.')
    expect(sendCall.message.attachments).toEqual([
      expect.objectContaining({
        filename: 'olgish-cakes-terms-2026-07-28.pdf',
        contentType: 'application/pdf',
        content: expect.any(Buffer)
      })
    ])
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
        status: 'confirmed',
        customerFacingOfferDescription: 'A gift hamper prepared for postal delivery.',
        allergenStatement: 'Contains wheat (gluten), eggs and milk.'
      })
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: 'order-1' }) })

    expect(response.status).toBe(200)

    const sendCall = mockSendEmail.mock.calls[0]?.[0]
    expect(sendCall.templateId).toBe('orders-status-update')
    expect(sendCall.input).toMatchObject({
      productType: 'gift-hamper',
      headingOverride: 'Your final order offer',
      titleOverride: 'Final Order Offer #26051220022842 - Olgish Cakes',
      statusMessage: 'This email is our final written offer for the details and price shown below under terms version 2026-07-28. Please accept it in writing or make the requested payment. Your contract starts only when you do so.',
      customerFacingOfferDescription: 'A gift hamper prepared for postal delivery.',
      allergenStatement: 'Contains wheat (gluten), eggs and milk.',
      deliveryAddress: '15 Allerton Grange Avenue, Leeds, LS17 6PR',
      paymentStatus: 'pending'
    })
    expect(sendCall.input.customerMessage).toBeUndefined()
    expect(sendCall.input.giftNote).toBeUndefined()
    expect(sendCall.input.orderItems[0].specialInstructions).toBeUndefined()
    expect(JSON.stringify(sendCall.input)).not.toContain('gift note test')
    expect(JSON.stringify(sendCall.input)).not.toContain('test message')
    expect(sendCall.message.attachments[0]).toMatchObject({
      filename: 'olgish-cakes-terms-2026-07-28.pdf',
      contentType: 'application/pdf'
    })
  })

  it('blocks a final offer without product-specific allergen information', async () => {
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
      items: [{ productName: 'Honey Cake', quantity: 1, totalPrice: 40 }],
      delivery: { deliveryMethod: 'collection' },
      pricing: { total: 40, paymentStatus: 'pending' },
      notes: [],
      metadata: {}
    }

    mockGetSupabaseOrderByIdentifier.mockResolvedValueOnce(currentOrder)

    const request = new NextRequest('http://localhost/api/orders/order-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'confirmed',
        customerFacingOfferDescription: 'One handmade Honey Cake for collection.'
      })
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: 'order-1' }) })
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.error).toBe('Allergen information required')
    expect(mockUpdateSupabaseOrder).not.toHaveBeenCalled()
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('blocks a final offer without a staff-authored customer-facing description', async () => {
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
      items: [{ productName: 'Honey Cake', quantity: 1, totalPrice: 40 }],
      delivery: { deliveryMethod: 'collection' },
      pricing: { total: 40, paymentStatus: 'pending' },
      notes: [],
      metadata: {}
    }

    mockGetSupabaseOrderByIdentifier.mockResolvedValueOnce(currentOrder)

    const request = new NextRequest('http://localhost/api/orders/order-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'confirmed',
        allergenStatement: 'Contains wheat (gluten), eggs and milk.'
      })
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: 'order-1' }) })
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.error).toBe('Final-offer description required')
    expect(mockUpdateSupabaseOrder).not.toHaveBeenCalled()
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('blocks production until the customer accepts or pays', async () => {
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
      items: [{ productName: 'Honey Cake', quantity: 1, totalPrice: 40 }],
      delivery: { deliveryMethod: 'collection' },
      pricing: { total: 40, paymentStatus: 'pending' },
      notes: [],
      metadata: {
        allergenStatement: 'Contains wheat (gluten), eggs and milk.'
      }
    }

    mockGetSupabaseOrderByIdentifier.mockResolvedValueOnce(currentOrder)

    const request = new NextRequest('http://localhost/api/orders/order-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'in-progress' })
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: 'order-1' }) })
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.error).toBe('Customer acceptance required')
    expect(mockUpdateSupabaseOrder).not.toHaveBeenCalled()
    expect(mockSendEmail).not.toHaveBeenCalled()
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
    expect(sendCall.input.giftNote).toBeUndefined()
    expect(sendCall.input.orderItems[0].specialInstructions).toBeUndefined()
    expect(JSON.stringify(sendCall.input)).not.toContain('gift note test')
    expect(JSON.stringify(sendCall.input)).not.toContain('test message')
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
        trackingNumber: 'H02X8A0022918652',
        allergenLabelIncluded: true
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
      statusMessage: 'Great news, your cake by post order has been dispatched with Evri.'
    })
  })

  it('uses cake wording for custom cake postal dispatch emails', async () => {
    const currentOrder = {
      _id: 'order-1',
      _createdAt: '2026-05-12T18:00:00.000Z',
      _updatedAt: '2026-05-12T18:00:00.000Z',
      orderNumber: '26051220022842',
      status: 'in-progress',
      orderType: 'custom-cake',
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
          productName: 'Vintage Red Velvet Cake',
          productId: 'vintage-red-velvet-cake',
          productType: 'cake',
          quantity: 1,
          unitPrice: 38,
          totalPrice: 38
        }
      ],
      delivery: {
        dateNeeded: '2026-07-08',
        deliveryMethod: 'postal',
        deliveryAddress: '15 Allerton Grange Avenue, Leeds, LS17 6PR',
        trackingNumber: ''
      },
      pricing: {
        total: 38,
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
        deliveryCourier: 'royal-mail',
        trackingNumber: '12345',
        allergenLabelIncluded: true
      })
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: 'order-1' }) })

    expect(response.status).toBe(200)

    const sendCall = mockSendEmail.mock.calls[0]?.[0]
    expect(sendCall.input).toMatchObject({
      status: 'out-for-delivery',
      deliveryCourier: 'royal-mail',
      trackingNumber: '12345',
      headingOverride: 'Order out for delivery',
      titleOverride: 'Order Out for Delivery #26051220022842 - Olgish Cakes',
      statusMessage: 'Great news, your cake order has been dispatched with Royal Mail.'
    })
    expect(sendCall.input.statusMessage).not.toContain('cake by post order')
  })

  it('filters generated product summary from custom cake status customer message', async () => {
    const generatedSummary = [
      'Product: Vintage Red Velvet Cake',
      'Product type: cake',
      'Design type: standard',
      'Filling: Red Velvet',
      'Serves 8-12 people',
      'Price: \u00A338'
    ].join('\n')
    const currentOrder = {
      _id: 'order-1',
      _createdAt: '2026-05-12T18:00:00.000Z',
      _updatedAt: '2026-05-12T18:00:00.000Z',
      orderNumber: '26060623195079',
      status: 'in-progress',
      orderType: 'custom-cake',
      customer: {
        name: 'Igor Ieromenko',
        email: 'igor@example.com',
        phone: '07123456789'
      },
      items: [
        {
          productName: 'Vintage Red Velvet Cake',
          productId: 'vintage-red-velvet-cake',
          productType: 'cake',
          quantity: 1,
          unitPrice: 38,
          totalPrice: 38,
          designType: 'standard',
          size: 'Serves 8-12 people',
          flavor: 'Red Velvet',
          specialInstructions: generatedSummary
        }
      ],
      delivery: {
        dateNeeded: '2026-07-11',
        deliveryMethod: 'local-delivery',
        deliveryAddress: '15 Allerton Grange Avenue, Leeds, LS17 6PR'
      },
      pricing: {
        total: 38,
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
        allergenLabelIncluded: true
      })
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: 'order-1' }) })

    expect(response.status).toBe(200)

    const sendCall = mockSendEmail.mock.calls[0]?.[0]
    expect(sendCall.input.customerMessage).toBeUndefined()
    expect(sendCall.input.statusMessage).toBe('Great news! Your order is out for local delivery and will be with you soon.')
  })

  it('does not echo a metadata customer message in a status email', async () => {
    const currentOrder = {
      _id: 'order-1',
      _createdAt: '2026-05-12T18:00:00.000Z',
      _updatedAt: '2026-05-12T18:00:00.000Z',
      orderNumber: '26060623195079',
      status: 'in-progress',
      orderType: 'custom-cake',
      customer: {
        name: 'Igor Ieromenko',
        email: 'igor@example.com',
        phone: '07123456789'
      },
      items: [
        {
          productName: 'Vintage Red Velvet Cake',
          productId: 'vintage-red-velvet-cake',
          productType: 'cake',
          quantity: 1,
          unitPrice: 38,
          totalPrice: 38,
          designType: 'standard',
          size: 'Serves 8-12 people',
          flavor: 'Red Velvet'
        }
      ],
      delivery: {
        dateNeeded: '2026-07-11',
        deliveryMethod: 'local-delivery',
        deliveryAddress: '15 Allerton Grange Avenue, Leeds, LS17 6PR'
      },
      pricing: {
        total: 38,
        paymentStatus: 'paid',
        paymentMethod: 'card'
      },
      messages: [],
      notes: [],
      metadata: {
        inlineOrderContext: {
          customerMessage: 'Please write Happy Birthday on the cake'
        }
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
        status: 'out-delivery',
        allergenLabelIncluded: true
      })
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: 'order-1' }) })

    expect(response.status).toBe(200)

    const sendCall = mockSendEmail.mock.calls[0]?.[0]
    expect(sendCall.input.customerMessage).toBeUndefined()
  })

  it('does not echo an order message in a status email', async () => {
    const currentOrder = {
      _id: 'order-1',
      _createdAt: '2026-05-12T18:00:00.000Z',
      _updatedAt: '2026-05-12T18:00:00.000Z',
      orderNumber: '26060501334629',
      status: 'in-progress',
      orderType: 'custom-cake',
      customer: {
        name: 'Igor Ieromenko',
        email: 'igor@example.com',
        phone: '07123456789'
      },
      items: [
        {
          productName: 'Vintage Red Velvet Cake',
          productId: 'vintage-red-velvet-cake',
          productType: 'cake',
          quantity: 1,
          unitPrice: 38,
          totalPrice: 38,
          designType: 'standard',
          size: 'Serves 8-12 people',
          flavor: 'Red Velvet'
        }
      ],
      delivery: {
        dateNeeded: '2026-07-08',
        deliveryMethod: 'postal',
        deliveryAddress: '15 Allerton Grange Avenue, Leeds, LS17 6PR'
      },
      pricing: {
        total: 38,
        paymentStatus: 'paid',
        paymentMethod: 'card'
      },
      messages: [
        {
          message: 'Product: Vintage Red Velvet Cake\nMessage: Please add candles'
        }
      ],
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
        allergenLabelIncluded: true
      })
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: 'order-1' }) })

    expect(response.status).toBe(200)

    const sendCall = mockSendEmail.mock.calls[0]?.[0]
    expect(sendCall.input.customerMessage).toBeUndefined()
  })

  it('filters generated metadata customer message from status emails', async () => {
    const generatedSummary = [
      'Product: Vintage Red Velvet Cake',
      'Product type: cake',
      'Design type: standard',
      'Filling: Red Velvet',
      'Serves 8-12 people',
      'Price: \u00A338'
    ].join('\n')
    const currentOrder = {
      _id: 'order-1',
      _createdAt: '2026-05-12T18:00:00.000Z',
      _updatedAt: '2026-05-12T18:00:00.000Z',
      orderNumber: '26060623195079',
      status: 'in-progress',
      orderType: 'custom-cake',
      customer: {
        name: 'Igor Ieromenko',
        email: 'igor@example.com',
        phone: '07123456789'
      },
      items: [
        {
          productName: 'Vintage Red Velvet Cake',
          productId: 'vintage-red-velvet-cake',
          productType: 'cake',
          quantity: 1,
          unitPrice: 38,
          totalPrice: 38
        }
      ],
      delivery: {
        dateNeeded: '2026-07-11',
        deliveryMethod: 'local-delivery',
        deliveryAddress: '15 Allerton Grange Avenue, Leeds, LS17 6PR'
      },
      pricing: {
        total: 38,
        paymentStatus: 'paid',
        paymentMethod: 'card'
      },
      messages: [],
      notes: [],
      metadata: {
        inlineOrderContext: {
          customerMessage: generatedSummary
        }
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
        status: 'out-delivery',
        allergenLabelIncluded: true
      })
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: 'order-1' }) })

    expect(response.status).toBe(200)

    const sendCall = mockSendEmail.mock.calls[0]?.[0]
    expect(sendCall.input.customerMessage).toBeUndefined()
  })

  it('uses custom cake wording for delivered postal cake orders', async () => {
    const currentOrder = {
      _id: 'order-1',
      _createdAt: '2026-05-12T18:00:00.000Z',
      _updatedAt: '2026-05-12T18:00:00.000Z',
      orderNumber: '26060623310313',
      status: 'out-for-delivery',
      orderType: 'custom-cake',
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
          productName: 'Vintage Red Velvet Cake',
          productId: 'vintage-red-velvet-cake',
          productType: 'cake',
          quantity: 1,
          unitPrice: 38,
          totalPrice: 38
        }
      ],
      delivery: {
        dateNeeded: '2026-07-11',
        deliveryMethod: 'postal',
        deliveryAddress: '15 Allerton Grange Avenue, Leeds, LS17 6PR',
        trackingNumber: '12345'
      },
      pricing: {
        total: 38,
        paymentStatus: 'paid',
        paymentMethod: 'card'
      },
      messages: [],
      notes: [],
      metadata: {
        deliveryCourier: 'royal-mail',
        allergenLabelIncluded: true
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
    expect(sendCall.input).toMatchObject({
      status: 'delivered',
      productType: 'cake',
      deliveryMethod: 'postal',
      headingOverride: 'Order delivered',
      titleOverride: 'Order Delivered #26060623310313 - Olgish Cakes',
      statusMessage: 'Your order has been delivered. We hope you enjoy your cake.'
    })
    expect(sendCall.input.statusMessage).not.toContain('cakes by post')
    expect(sendCall.input.statusMessage).not.toContain('cake by post')
  })

  it('uses cake wording when a stale cakes-by-post order type contains cake items', async () => {
    const currentOrder = {
      _id: 'order-1',
      _createdAt: '2026-05-12T18:00:00.000Z',
      _updatedAt: '2026-05-12T18:00:00.000Z',
      orderNumber: '26060501382235',
      status: 'out-for-delivery',
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
          productName: 'Vintage Red Velvet Cake',
          productId: 'vintage-red-velvet-cake',
          productType: 'cake',
          quantity: 1,
          unitPrice: 38,
          totalPrice: 38
        }
      ],
      delivery: {
        dateNeeded: '2026-07-07',
        deliveryMethod: 'postal',
        deliveryAddress: '15 Allerton Grange Avenue, Leeds, LS17 6PR',
        trackingNumber: '12345'
      },
      pricing: {
        total: 38,
        paymentStatus: 'paid',
        paymentMethod: 'card'
      },
      messages: [],
      notes: [],
      metadata: {
        deliveryCourier: 'evri',
        allergenLabelIncluded: true
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
    expect(sendCall.input).toMatchObject({
      orderType: 'cakes-by-post',
      productType: 'cake',
      status: 'delivered',
      headingOverride: 'Order delivered',
      titleOverride: 'Order Delivered #26060501382235 - Olgish Cakes',
      statusMessage: 'Your order has been delivered. We hope you enjoy your cake.'
    })
    expect(sendCall.input.statusMessage).not.toContain('cakes by post')
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
        trackingNumber: 'H02X8A0022918652',
        allergenLabelIncluded: true
      })
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: 'order-1' }) })

    expect(response.status).toBe(200)

    const sendCall = mockSendEmail.mock.calls[0]?.[0]
    expect(sendCall.input).toMatchObject({
      status: 'out-for-delivery',
      deliveryCourier: 'evri',
      statusMessage: 'Great news, your cake by post order has been dispatched with Evri.'
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
        deliveryCourier: 'royal-mail',
        allergenLabelIncluded: true
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
    formData.append('customerFacingOfferDescription', 'A gift hamper and a jar of local honey.')
    formData.append('allergenStatement', 'Contains wheat (gluten), eggs and milk.')
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

  it('requires an authenticated admin session before reading the order', async () => {
    mockIsAdminAuthenticated.mockResolvedValueOnce(false)
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

    expect(response.status).toBe(401)
    expect(mockGetSupabaseOrderByIdentifier).not.toHaveBeenCalled()
    expect(mockDeleteSupabaseOrder).not.toHaveBeenCalled()
  })

  it('routes every permanent deletion through the selective retention centre', async () => {
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

    expect(response.status).toBe(409)
    expect(body).toEqual({
      error: 'Permanent deletion is available only for due records in the Privacy retention centre.',
      code: 'RETENTION_CENTRE_REQUIRED'
    })
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
