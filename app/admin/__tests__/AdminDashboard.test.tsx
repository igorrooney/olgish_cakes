/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { AdminDashboard } from '../AdminDashboard'
import type { Order } from '@/types/order'
import type { AnchorHTMLAttributes, ReactNode } from 'react'

jest.mock('@/components/AdminAuthGuard', () => ({
  AdminAuthGuard: ({ children }: { children: ReactNode }) => (
    <div data-testid='admin-auth-guard'>{children}</div>
  )
}))

jest.mock('next/link', () => {
  return ({ children, href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>{children}</a>
  )
})

const makeOrder = (overrides: Partial<Order>): Order => ({
  _id: 'order-1',
  _createdAt: '2026-04-20T09:00:00.000Z',
  _updatedAt: '2026-04-20T09:00:00.000Z',
  orderNumber: 'OC-1001',
  status: 'new',
  orderType: 'custom',
  customer: {
    name: 'Jane Customer',
    email: 'jane@example.com',
    phone: '07123456789'
  },
  items: [],
  delivery: {
    dateNeeded: '2026-05-01',
    deliveryMethod: 'collection'
  },
  pricing: {
    total: 80,
    paymentStatus: 'pending'
  },
  ...overrides
})

let mockFetch: jest.MockedFunction<typeof fetch>

describe('AdminDashboard', () => {
  beforeEach(() => {
    global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>
    mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
  })

  it('renders summary stats and operational links after dashboard data loads', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          orders: [
            makeOrder({ _id: 'order-1', orderNumber: 'OC-1001', status: 'new' }),
            makeOrder({ _id: 'order-2', orderNumber: 'OC-1002', status: 'confirmed' }),
            makeOrder({ _id: 'order-3', orderNumber: 'OC-1003', status: 'ready-pickup' }),
            makeOrder({ _id: 'order-4', orderNumber: 'OC-1004', status: 'completed' })
          ]
        })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          totalRevenue: 260,
          currentMonth: 120,
          averageOrderValue: 130
        })
      } as Response)

    render(<AdminDashboard />)

    expect(screen.getByLabelText('Loading dashboard')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Total orders')).toBeInTheDocument()
    })

    const needsActionCard = screen.getByText('Needs action').closest('article')
    if (!needsActionCard) {
      throw new Error('Needs action card was not rendered')
    }

    const activeOrdersSummary = screen.getByText('Active orders').parentElement
    if (!activeOrdersSummary) {
      throw new Error('Active orders summary was not rendered')
    }

    expect(screen.getByText('Total orders')).toBeInTheDocument()
    expect(needsActionCard).toHaveTextContent('2')
    expect(activeOrdersSummary).toHaveTextContent('3')
    expect(screen.getByText('£260.00')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Open orders' })).toHaveLength(2)
    screen.getAllByRole('link', { name: 'Open orders' }).forEach((link) => {
      expect(link).toHaveAttribute('href', '/admin/orders')
    })
    expect(screen.getByRole('link', { name: 'Open enquiries' })).toHaveAttribute('href', '/admin/enquiries')
    expect(screen.getByRole('link', { name: 'View earnings' })).toHaveAttribute('href', '/admin/earnings')
    expect(screen.getAllByText('#OC-1001')).toHaveLength(2)
    expect(screen.getAllByText('Jane Customer').length).toBeGreaterThan(0)
  })

  it('shows a useful empty state when no recent orders exist', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ orders: [] })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ totalRevenue: 0, currentMonth: 0, averageOrderValue: 0 })
      } as Response)

    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByText('No recent orders')).toBeInTheDocument()
    })

    expect(screen.getByText('No active delivery dates in current orders.')).toBeInTheDocument()
  })

  it('uses all fetched orders when choosing the next due order', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          orders: [
            makeOrder({ _id: 'order-1', orderNumber: 'OC-1001', delivery: { dateNeeded: '2026-05-10', deliveryMethod: 'collection' } }),
            makeOrder({ _id: 'order-2', orderNumber: 'OC-1002', delivery: { dateNeeded: '2026-05-09', deliveryMethod: 'collection' } }),
            makeOrder({ _id: 'order-3', orderNumber: 'OC-1003', delivery: { dateNeeded: '2026-05-08', deliveryMethod: 'collection' } }),
            makeOrder({ _id: 'order-4', orderNumber: 'OC-1004', delivery: { dateNeeded: '2026-05-07', deliveryMethod: 'collection' } }),
            makeOrder({ _id: 'order-5', orderNumber: 'OC-1005', delivery: { dateNeeded: '2026-05-06', deliveryMethod: 'collection' } }),
            makeOrder({
              _id: 'order-6',
              orderNumber: 'OC-1006',
              customer: {
                name: 'Earliest Customer',
                email: 'earliest@example.com',
                phone: '07123456789'
              },
              delivery: { dateNeeded: '2026-04-30', deliveryMethod: 'collection' }
            })
          ]
        })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ totalRevenue: 480, currentMonth: 120, averageOrderValue: 80 })
      } as Response)

    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Next due')).toBeInTheDocument()
    })

    expect(screen.getByText('#OC-1006')).toBeInTheDocument()
    expect(screen.getByText('Earliest Customer')).toBeInTheDocument()
  })

  it('shows an error state when dashboard APIs fail', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Unauthorized' })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ totalRevenue: 0 })
      } as Response)

    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Dashboard data could not be loaded')
    })

    expect(screen.getByText('Needs check')).toBeInTheDocument()
  })

  it('revalidates cache from the dashboard action', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ orders: [] })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ totalRevenue: 0 })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      } as Response)

    render(<AdminDashboard />)

    const button = await screen.findByRole('button', { name: 'Revalidate cache' })
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenLastCalledWith('/api/admin/clear-cache', expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        signal: expect.any(AbortSignal)
      }))
    })

    expect(await screen.findByText('Website cache revalidated. Public pages can rebuild with fresh content.')).toBeInTheDocument()
  })
})
