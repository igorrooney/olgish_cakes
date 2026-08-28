/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { POST } from '../route'

const mockIsAdminAuthenticated = jest.fn()
const mockVerifyAdminPassword = jest.fn()
const mockWithdraw = jest.fn()
const mockLoggerError = jest.fn()

jest.mock('@/lib/admin-auth', () => ({
  isAdminAuthenticated: (...args: unknown[]) => mockIsAdminAuthenticated(...args)
}))

jest.mock('@/lib/admin/credentials.server', () => ({
  verifyAdminPassword: (...args: unknown[]) => mockVerifyAdminPassword(...args)
}))

jest.mock('@/lib/orders/supabase-orders', () => ({
  withdrawSupabaseOrderDietaryHealthInformation: (...args: unknown[]) => mockWithdraw(...args)
}))

jest.mock('@/lib/logger', () => ({
  logger: {
    error: (...args: unknown[]) => mockLoggerError(...args)
  }
}))

const makeRequest = (body: unknown) => new NextRequest(
  'http://localhost/api/admin/orders/OC-100/withdraw-health-consent',
  {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
      origin: 'http://localhost',
      'sec-fetch-site': 'same-origin'
    }
  }
)

const context = (id = 'OC-100') => ({
  params: Promise.resolve({ id })
})

describe('admin order dietary-health withdrawal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsAdminAuthenticated.mockResolvedValue(true)
    mockVerifyAdminPassword.mockReturnValue(true)
    mockWithdraw.mockResolvedValue({
      status: 'withdrawn',
      withdrawnAt: '2026-07-31T10:00:00.000Z'
    })
  })

  it('requires authentication, exact confirmation and password', async () => {
    mockIsAdminAuthenticated.mockResolvedValue(false)
    const unauthorized = await POST(
      makeRequest({ password: 'secret', confirmation: 'OC-100' }),
      context()
    )
    expect(unauthorized.status).toBe(401)

    mockIsAdminAuthenticated.mockResolvedValue(true)
    const wrongReference = await POST(
      makeRequest({ password: 'secret', confirmation: 'OC-101' }),
      context()
    )
    expect(wrongReference.status).toBe(400)

    mockVerifyAdminPassword.mockReturnValue(false)
    const wrongPassword = await POST(
      makeRequest({ password: 'wrong', confirmation: 'OC-100' }),
      context()
    )
    expect(wrongPassword.status).toBe(401)
    expect(mockWithdraw).not.toHaveBeenCalled()
  })

  it.each([
    ['not-found', 404],
    ['no-active-information', 409]
  ])('maps %s to a safe response', async (status, expectedStatus) => {
    mockWithdraw.mockResolvedValue({ status })

    const response = await POST(
      makeRequest({ password: 'secret', confirmation: 'OC-100' }),
      context()
    )

    expect(response.status).toBe(expectedStatus)
    expect(await response.text()).not.toContain('SENTINEL-HEALTH-TEXT')
  })

  it.each(['withdrawn', 'already-withdrawn'])(
    'returns idempotent timestamp-only success for %s',
    async (status) => {
      mockWithdraw.mockResolvedValue({
        status,
        withdrawnAt: '2026-07-31T10:00:00.000Z'
      })

      const response = await POST(
        makeRequest({ password: 'secret', confirmation: 'OC-100' }),
        context()
      )
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body).toEqual({
        status,
        withdrawnAt: '2026-07-31T10:00:00.000Z'
      })
      expect(body).not.toHaveProperty('order')
    }
  )

  it('does not leak protected content from persistence failures', async () => {
    mockWithdraw.mockRejectedValue(Object.assign(
      new Error('SENTINEL-HEALTH-TEXT'),
      {
        code: 'DB_WRITE_FAILED',
        hint: 'SENTINEL-HEALTH-TEXT'
      }
    ))

    const response = await POST(
      makeRequest({ password: 'secret', confirmation: 'OC-100' }),
      context()
    )
    const responseText = await response.text()
    const logged = JSON.stringify(mockLoggerError.mock.calls)

    expect(response.status).toBe(500)
    expect(responseText).not.toContain('SENTINEL-HEALTH-TEXT')
    expect(logged).not.toContain('SENTINEL-HEALTH-TEXT')
    expect(logged).toContain('DB_WRITE_FAILED')
  })
})
