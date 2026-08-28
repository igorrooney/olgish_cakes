/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EarningsDashboard } from '../EarningsDashboard'

const renderDashboard = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false }
    }
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <EarningsDashboard />
    </QueryClientProvider>
  )
}

describe('EarningsDashboard', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('loads earnings through an abortable query', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        currentMonth: 120,
        lastMonth: 80,
        totalRevenue: 200,
        totalOrders: 4,
        averageOrderValue: 50,
        currentMonthOrdersCount: 2,
        lastMonthOrdersCount: 2,
        historicalMonthlyData: []
      })
    })

    renderDashboard()

    expect(screen.getByLabelText('Loading earnings')).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Earnings' })).toBeInTheDocument()
    expect(global.fetch).toHaveBeenCalledWith('/api/admin/earnings', {
      credentials: 'include',
      signal: expect.any(AbortSignal)
    })
  })

  it('retries through React Query without an undefined signal', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failed to fetch earnings data' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ historicalMonthlyData: [] })
      })

    renderDashboard()

    expect(await screen.findByRole('alert')).toHaveTextContent('Failed to fetch earnings data')
    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    for (const call of (global.fetch as jest.Mock).mock.calls) {
      expect(call[1]).toEqual(expect.objectContaining({
        signal: expect.any(AbortSignal)
      }))
    }
  })
})
