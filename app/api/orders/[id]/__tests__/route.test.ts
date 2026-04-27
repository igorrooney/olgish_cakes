/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

const mockGetSupabaseOrderById = jest.fn()
const mockUpdateSupabaseOrder = jest.fn()
const mockDeleteSupabaseOrder = jest.fn()
const mockSendEmail = jest.fn()
const mockIsAdminAuthenticated = jest.fn()

jest.mock('@/lib/admin-auth', () => ({
  isAdminAuthenticated: (...args: unknown[]) => mockIsAdminAuthenticated(...args)
}))

jest.mock('@/lib/orders/supabase-orders', () => ({
  deleteSupabaseOrder: (...args: unknown[]) => mockDeleteSupabaseOrder(...args),
  getSupabaseOrderById: (...args: unknown[]) => mockGetSupabaseOrderById(...args),
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

    mockGetSupabaseOrderById.mockResolvedValueOnce(currentOrder)
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
    expect(mockGetSupabaseOrderById).toHaveBeenCalledWith('order-1')
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

    mockGetSupabaseOrderById.mockResolvedValueOnce(currentOrder)
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
    mockGetSupabaseOrderById.mockResolvedValue(currentOrder)
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
