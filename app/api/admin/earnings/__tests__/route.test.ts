/**
 * @jest-environment node
 */
const mockIsAdminAuthenticated = jest.fn()
const mockListEarnings = jest.fn()
const mockLoggerError = jest.fn()

jest.mock('@/lib/admin-auth', () => ({
  isAdminAuthenticated: (...args: unknown[]) => mockIsAdminAuthenticated(...args)
}))

jest.mock('@/lib/orders/supabase-orders', () => ({
  listSupabaseOrderEarningsSummaries: (...args: unknown[]) => mockListEarnings(...args)
}))

jest.mock('@/lib/logger', () => ({
  logger: {
    error: (...args: unknown[]) => mockLoggerError(...args)
  }
}))

import { NextRequest } from 'next/server'
import { GET } from '../route'

const createRequest = () => new NextRequest('http://localhost/api/admin/earnings')

describe('/api/admin/earnings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsAdminAuthenticated.mockResolvedValue(true)
    mockListEarnings.mockResolvedValue([])
  })

  it('rejects unauthenticated requests before reading order data', async () => {
    mockIsAdminAuthenticated.mockResolvedValue(false)

    const response = await GET(createRequest())

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' })
    expect(mockListEarnings).not.toHaveBeenCalled()
  })

  it('returns an empty earnings summary for an authenticated admin', async () => {
    const response = await GET(createRequest())
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual(expect.objectContaining({
      currentMonth: 0,
      lastMonth: 0,
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      historicalMonthlyData: []
    }))
  })

  it('returns a generic response and logs no raw database details', async () => {
    const sentinel = 'PRIVATE_EARNINGS_DATABASE_MESSAGE'
    mockListEarnings.mockRejectedValue(new Error(sentinel))

    const response = await GET(createRequest())
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body).toEqual({ error: 'Failed to fetch earnings data' })
    expect(mockLoggerError).toHaveBeenCalledWith(
      'Failed to fetch earnings',
      {
        operation: 'admin.earnings.fetch',
        code: 'OPERATION_FAILED'
      }
    )
    expect(JSON.stringify({ body, logs: mockLoggerError.mock.calls })).not.toContain(sentinel)
  })
})
