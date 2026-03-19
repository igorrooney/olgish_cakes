/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

const mockFetch = jest.fn()
const mockPatchCommit = jest.fn()
const mockPatchSet = jest.fn(() => ({ commit: mockPatchCommit }))
const mockPatch = jest.fn(() => ({ set: mockPatchSet }))
const mockSendEmail = jest.fn()
const mockIsAdminAuthenticated = jest.fn()

jest.mock('@/lib/admin-auth', () => ({
  isAdminAuthenticated: (...args: unknown[]) => mockIsAdminAuthenticated(...args)
}))

jest.mock('@/lib/order-utils', () => ({
  generateUniqueKey: jest.fn(() => 'note-key-1')
}))

jest.mock('@/sanity/lib/client', () => ({
  serverClient: {
    fetch: (...args: unknown[]) => mockFetch(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
    assets: {
      upload: jest.fn()
    },
    delete: jest.fn()
  }
}))

jest.mock('@/lib/email/service', () => ({
  getEmailTransportMode: jest.fn(() => 'disabled'),
  requiresLiveEmailConfiguration: jest.fn(() => false),
  sendEmail: (...args: unknown[]) => mockSendEmail(...args)
}))

import { PATCH } from '../route'

describe('/api/orders/[id] PATCH', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsAdminAuthenticated.mockResolvedValue(true)
    mockPatchCommit.mockResolvedValue({ _id: 'order-1', status: 'confirmed' })
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
    mockFetch
      .mockResolvedValueOnce({
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
          }
        ],
        delivery: {
          deliveryMethod: 'collection',
          deliveryAddress: '10 Example Street, London, SW1A 1AA'
        },
        pricing: {
          total: 40,
          paymentStatus: 'pending',
          paymentMethod: 'cash-collection'
        },
        notes: []
      })
      .mockResolvedValueOnce({
        _id: 'order-1',
        _createdAt: '2026-03-01T10:00:00.000Z',
        _updatedAt: '2026-03-01T10:10:00.000Z',
        orderNumber: 'OC-2001',
        status: 'confirmed',
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
        messages: []
      })

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
    expect(mockFetch).toHaveBeenCalledTimes(2)
    expect(mockPatch).toHaveBeenCalledWith('order-1')
    expect(mockPatchSet).toHaveBeenCalledWith(expect.objectContaining({
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
})
