/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { OrderDetailsPageClient } from '../OrderDetailsPageClient'
import type { Order } from '@/types/order'
import type { ReactNode } from 'react'

jest.mock('next/link', () => {
  return ({ children, href, ...props }: { children: ReactNode, href: string }) => (
    <a href={href} {...props}>{children}</a>
  )
})

const mockRouterPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush
  })
}))

const makeOrder = (overrides: Partial<Order> = {}): Order => ({
  _id: 'order-1',
  _createdAt: '2026-04-20T09:00:00.000Z',
  _updatedAt: '2026-04-21T10:30:00.000Z',
  orderNumber: '26042009000001',
  status: 'confirmed',
  orderType: 'custom',
  customer: {
    name: 'Jane Customer',
    email: 'jane@example.com',
    phone: '07123456789',
    address: '1 Cake Street',
    city: 'Leeds',
    postcode: 'LS1 1AA'
  },
  items: [
    {
      productType: 'cake',
      productId: 'cake-1',
      productName: 'Chocolate Delicia Sponge Cake',
      quantity: 1,
      unitPrice: 138,
      totalPrice: 138,
      size: 'Medium',
      flavor: 'Chocolate',
      designType: 'standard',
      specialInstructions: 'Add flowers'
    }
  ],
  delivery: {
    dateNeeded: '2026-07-26',
    deliveryMethod: 'collection',
    trackingNumber: ''
  },
  pricing: {
    subtotal: 138,
    deliveryFee: 0,
    discount: 0,
    total: 138,
    paymentStatus: 'partial',
    paymentMethod: 'card'
  },
  messages: [
    {
      message: 'Please make it special.',
      attachments: [
        {
          _type: 'image',
          asset: {
            _type: 'supabase-file',
            _id: 'orders/order-1/references/design.jpg',
            _ref: 'orders/order-1/references/design.jpg',
            url: 'https://example.com/design.jpg'
          },
          alt: 'Customer design'
        }
      ]
    }
  ],
  notes: [],
  metadata: {},
  ...overrides
})

function renderWithQueryClient(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      },
      mutations: {
        retry: false
      }
    }
  })

  return {
    queryClient,
    ...render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
    )
  }
}

describe('OrderDetailsPageClient', () => {
  let mockFetch: jest.MockedFunction<typeof fetch>
  const jsonResponse = (data: unknown, ok = true) => ({
    ok,
    json: async () => data
  }) as Response

  beforeEach(() => {
    mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>
    global.fetch = mockFetch
    mockRouterPush.mockClear()
  })

  it('loads and renders a shareable order detail page', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(makeOrder()))

    renderWithQueryClient(<OrderDetailsPageClient orderId='26042009000001' />)

    expect(screen.getByLabelText('Loading order details')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '#26042009000001' })).toBeInTheDocument()
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/orders/26042009000001', expect.objectContaining({
      credentials: 'include',
      signal: expect.any(AbortSignal)
    }))
    expect(screen.getByText('Jane Customer')).toBeInTheDocument()
    expect(screen.getByText('Jane Customer - Chocolate Delicia Sponge Cake - Needed 26/07/2026')).toBeInTheDocument()
    expect(screen.getByText('Start production when ready. Payment is partial.')).toBeInTheDocument()
    expect(screen.getAllByText('Chocolate Delicia Sponge Cake').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled()
    expect(screen.getByAltText('Customer design')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to orders' })).toHaveAttribute('href', '/admin/orders')
  })

  it('normalizes ISO date values for the date input', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(makeOrder({
      delivery: {
        dateNeeded: '2026-07-26T12:30:00.000Z',
        deliveryMethod: 'collection',
        trackingNumber: ''
      }
    })))

    renderWithQueryClient(<OrderDetailsPageClient orderId='26042009000001' />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '#26042009000001' })).toBeInTheDocument()
    })

    expect(screen.getByLabelText('Date needed')).toHaveValue('2026-07-26')
  })

  it('updates order management fields through the order API', async () => {
    const initialOrder = makeOrder()
    const updatedOrder = makeOrder({
      status: 'in-progress',
      pricing: {
        ...initialOrder.pricing,
        paymentStatus: 'paid'
      },
      notes: [
        {
          note: 'Customer confirmed collection.',
          author: 'Admin',
          createdAt: '2026-04-22T10:00:00.000Z'
        }
      ]
    })

    mockFetch
      .mockResolvedValueOnce(jsonResponse(initialOrder))
      .mockResolvedValueOnce(jsonResponse({ success: true, order: updatedOrder }))

    renderWithQueryClient(<OrderDetailsPageClient orderId='26042009000001' />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '#26042009000001' })).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('Status'), {
      target: { value: 'in-progress' }
    })
    fireEvent.change(screen.getByLabelText('Payment status'), {
      target: { value: 'paid' }
    })
    fireEvent.change(screen.getByLabelText('Add internal note'), {
      target: { value: 'Customer confirmed collection.' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenLastCalledWith('/api/orders/26042009000001', expect.objectContaining({
        method: 'PATCH',
        credentials: 'include',
        signal: expect.any(AbortSignal)
      }))
    })

    const requestBody = JSON.parse(String(mockFetch.mock.calls[1]?.[1]?.body)) as {
      status?: string
      paymentStatus?: string
      note?: string
      author?: string
    }

    expect(requestBody).toMatchObject({
      status: 'in-progress',
      paymentStatus: 'paid',
      note: 'Customer confirmed collection.',
      author: 'Admin'
    })
    expect(await screen.findByText('Order updated.')).toBeInTheDocument()
    expect(screen.getByText('Customer confirmed collection.')).toBeInTheDocument()
  })

  it('edits the customer section from the detail page', async () => {
    const initialOrder = makeOrder()
    const updatedOrder = makeOrder({
      customer: {
        ...initialOrder.customer,
        name: 'Jane Updated',
        phone: '07999999999'
      }
    })

    mockFetch
      .mockResolvedValueOnce(jsonResponse(initialOrder))
      .mockResolvedValueOnce(jsonResponse({ success: true, order: updatedOrder }))

    renderWithQueryClient(<OrderDetailsPageClient orderId='26042009000001' />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '#26042009000001' })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Edit customer' }))
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Jane Updated' }
    })
    fireEvent.change(screen.getByLabelText('Phone'), {
      target: { value: '07999999999' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save customer' }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenLastCalledWith('/api/orders/26042009000001', expect.objectContaining({
        method: 'PATCH',
        credentials: 'include',
        signal: expect.any(AbortSignal)
      }))
    })

    const requestBody = JSON.parse(String(mockFetch.mock.calls[1]?.[1]?.body)) as {
      customerName?: string
      customerPhone?: string
    }

    expect(requestBody).toMatchObject({
      customerName: 'Jane Updated',
      customerPhone: '07999999999'
    })
    expect(await screen.findByText('Customer updated.')).toBeInTheDocument()
    expect(screen.getByText('Jane Updated')).toBeInTheDocument()
  })

  it('preserves in-progress edits when the order query refetches', async () => {
    const initialOrder = makeOrder()
    const refetchedOrder = makeOrder({
      _updatedAt: '2026-04-21T11:00:00.000Z',
      status: 'ready-pickup',
      customer: {
        ...initialOrder.customer,
        name: 'Server Customer'
      },
      items: [
        {
          ...initialOrder.items[0],
          productName: 'Server Cake'
        }
      ],
      messages: [
        {
          message: 'Please make it special.',
          attachments: [
            {
              _type: 'image',
              asset: {
                _type: 'supabase-file',
                _id: 'orders/order-1/references/design.jpg',
                _ref: 'orders/order-1/references/design.jpg',
                url: 'https://example.com/refetched-design.jpg'
              },
              alt: 'Customer design'
            }
          ]
        }
      ]
    })

    mockFetch
      .mockResolvedValueOnce(jsonResponse(initialOrder))
      .mockResolvedValueOnce(jsonResponse(refetchedOrder))

    const { queryClient } = renderWithQueryClient(<OrderDetailsPageClient orderId='26042009000001' />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '#26042009000001' })).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('Add internal note'), {
      target: { value: 'Draft note before refetch' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Edit customer' }))
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Draft Customer' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Edit items' }))
    fireEvent.change(screen.getByLabelText('Item name'), {
      target: { value: 'Draft Cake' }
    })

    await act(async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-order', '26042009000001'] })
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    expect(screen.getByLabelText('Status')).toHaveValue('confirmed')
    expect(screen.getByLabelText('Add internal note')).toHaveValue('Draft note before refetch')
    expect(screen.getByLabelText('Name')).toHaveValue('Draft Customer')
    expect(screen.getByLabelText('Item name')).toHaveValue('Draft Cake')
    expect(screen.getByAltText('Customer design')).toHaveAttribute('src', 'https://example.com/refetched-design.jpg')
  })

  it('only saves fields changed from the last synced order state', async () => {
    const initialOrder = makeOrder()
    const refetchedOrder = makeOrder({
      _updatedAt: '2026-04-21T11:00:00.000Z',
      status: 'ready-pickup',
      pricing: {
        ...initialOrder.pricing,
        paymentStatus: 'paid'
      },
      delivery: {
        ...initialOrder.delivery,
        trackingNumber: 'TRACK-UPDATED'
      }
    })
    const updatedOrder = makeOrder({
      ...refetchedOrder,
      notes: [
        {
          note: 'Draft note before refetch',
          author: 'Admin',
          createdAt: '2026-04-22T10:00:00.000Z'
        }
      ]
    })

    mockFetch
      .mockResolvedValueOnce(jsonResponse(initialOrder))
      .mockResolvedValueOnce(jsonResponse(refetchedOrder))
      .mockResolvedValueOnce(jsonResponse({ success: true, order: updatedOrder }))

    const { queryClient } = renderWithQueryClient(<OrderDetailsPageClient orderId='26042009000001' />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '#26042009000001' })).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('Add internal note'), {
      target: { value: 'Draft note before refetch' }
    })

    await act(async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-order', '26042009000001'] })
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(3)
    })

    const requestBody = JSON.parse(String(mockFetch.mock.calls[2]?.[1]?.body)) as {
      status?: string
      paymentStatus?: string
      trackingNumber?: string
      note?: string
      author?: string
    }

    expect(requestBody).toEqual({
      note: 'Draft note before refetch',
      author: 'Admin'
    })
    expect(requestBody.status).toBeUndefined()
    expect(requestBody.paymentStatus).toBeUndefined()
    expect(requestBody.trackingNumber).toBeUndefined()
  })

  it('edits the items section from the detail page', async () => {
    const initialOrder = makeOrder()
    const updatedOrder = makeOrder({
      items: [
        {
          ...initialOrder.items[0],
          productName: 'Updated Cake',
          quantity: 2,
          unitPrice: 75,
          totalPrice: 150
        }
      ],
      pricing: {
        ...initialOrder.pricing,
        subtotal: 150,
        total: 150
      }
    })

    mockFetch
      .mockResolvedValueOnce(jsonResponse(initialOrder))
      .mockResolvedValueOnce(jsonResponse({ success: true, order: updatedOrder }))

    renderWithQueryClient(<OrderDetailsPageClient orderId='26042009000001' />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '#26042009000001' })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Edit items' }))
    fireEvent.change(screen.getByLabelText('Item name'), {
      target: { value: 'Updated Cake' }
    })
    fireEvent.change(screen.getByLabelText('Quantity'), {
      target: { value: '2' }
    })
    fireEvent.change(screen.getByLabelText('Unit price'), {
      target: { value: '75' }
    })
    fireEvent.change(screen.getByLabelText('Total price'), {
      target: { value: '150' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save items' }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenLastCalledWith('/api/orders/26042009000001', expect.objectContaining({
        method: 'PATCH',
        credentials: 'include',
        signal: expect.any(AbortSignal)
      }))
    })

    const requestBody = JSON.parse(String(mockFetch.mock.calls[1]?.[1]?.body)) as {
      items?: Array<{
        productName?: string
        quantity?: number
        unitPrice?: number
        totalPrice?: number
      }>
      subtotal?: number
      total?: number
    }

    expect(requestBody.items?.[0]).toMatchObject({
      productName: 'Updated Cake',
      quantity: 2,
      unitPrice: 75,
      totalPrice: 150
    })
    expect(requestBody).toMatchObject({
      subtotal: 150,
      total: 150
    })
    expect(await screen.findByText('Items updated.')).toBeInTheDocument()
    expect(screen.getAllByText('Updated Cake').length).toBeGreaterThan(0)
  })

  it('keeps the remaining item product identifiers after removing an earlier item', async () => {
    const initialOrder = makeOrder({
      items: [
        {
          productType: 'cake',
          productId: 'cake-1',
          productName: 'First Cake',
          quantity: 1,
          unitPrice: 50,
          totalPrice: 50
        },
        {
          productType: 'hamper',
          productId: 'hamper-2',
          productName: 'Second Hamper',
          quantity: 1,
          unitPrice: 35,
          totalPrice: 35
        }
      ]
    })
    const updatedOrder = makeOrder({
      items: [initialOrder.items[1]],
      pricing: {
        ...initialOrder.pricing,
        subtotal: 35,
        total: 35
      }
    })

    mockFetch
      .mockResolvedValueOnce(jsonResponse(initialOrder))
      .mockResolvedValueOnce(jsonResponse({ success: true, order: updatedOrder }))

    renderWithQueryClient(<OrderDetailsPageClient orderId='26042009000001' />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '#26042009000001' })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Edit items' }))
    fireEvent.click(screen.getAllByRole('button', { name: 'Remove' })[0])
    fireEvent.click(screen.getByRole('button', { name: 'Save items' }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenLastCalledWith('/api/orders/26042009000001', expect.objectContaining({
        method: 'PATCH'
      }))
    })

    const requestBody = JSON.parse(String(mockFetch.mock.calls[1]?.[1]?.body)) as {
      items?: Array<{
        productName?: string
        productId?: string
        productType?: string
      }>
    }

    expect(requestBody.items).toHaveLength(1)
    expect(requestBody.items?.[0]).toMatchObject({
      productName: 'Second Hamper',
      productId: 'hamper-2',
      productType: 'hamper'
    })
  })

  it('shows failed customer saves with error styling', async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse(makeOrder()))
      .mockResolvedValueOnce(jsonResponse({ error: 'Customer could not be updated.' }, false))

    renderWithQueryClient(<OrderDetailsPageClient orderId='26042009000001' />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '#26042009000001' })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Edit customer' }))
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Jane Updated' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save customer' }))

    const message = await screen.findByText('Customer could not be updated.')
    const notice = message.closest('[role="status"]')

    expect(notice).toHaveClass('alert-error')
    expect(notice).not.toHaveClass('alert-success')
  })

  it('keeps the customer message in the message section when item instructions are duplicated', async () => {
    const customerMessage = 'Please make it special.'
    mockFetch.mockResolvedValueOnce(jsonResponse(makeOrder({
      items: [
        {
          productType: 'cake',
          productId: 'cake-1',
          productName: 'Chocolate Delicia Sponge Cake',
          quantity: 1,
          unitPrice: 138,
          totalPrice: 138,
          size: 'Medium',
          flavor: 'Chocolate',
          designType: 'standard',
          specialInstructions: customerMessage
        }
      ]
    })))

    renderWithQueryClient(<OrderDetailsPageClient orderId='26042009000001' />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '#26042009000001' })).toBeInTheDocument()
    })

    expect(screen.getAllByText(customerMessage)).toHaveLength(1)
  })

  it('permanently deletes the order and returns to the orders list', async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse(makeOrder()))
      .mockResolvedValueOnce(jsonResponse({
        success: true,
        message: 'Order permanently deleted from Supabase'
      }))

    renderWithQueryClient(<OrderDetailsPageClient orderId='26042009000001' />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '#26042009000001' })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Delete order' }))
    fireEvent.change(screen.getByLabelText('Admin password'), {
      target: { value: 'correct-password' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Delete permanently' }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenLastCalledWith('/api/orders/26042009000001', expect.objectContaining({
        method: 'DELETE',
        credentials: 'include',
        signal: expect.any(AbortSignal)
      }))
    })

    const requestBody = JSON.parse(String(mockFetch.mock.calls[1]?.[1]?.body)) as {
      password?: string
      permanent?: boolean
    }

    expect(requestBody).toEqual({
      password: 'correct-password',
      permanent: true
    })
    expect(mockRouterPush).toHaveBeenCalledWith('/admin/orders')
  })
})
