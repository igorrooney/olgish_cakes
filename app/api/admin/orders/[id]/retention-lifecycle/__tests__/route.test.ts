/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { OrderRetentionLifecycleError } from '@/lib/orders/supabase-orders'
import { POST } from '../route'

const mockIsAdminAuthenticated = jest.fn()
const mockVerifyAdminPassword = jest.fn()
const mockRecordCompletion = jest.fn()
const mockLoggerError = jest.fn()
let mockRateLimited = false

jest.mock('@/lib/admin-auth', () => ({
  isAdminAuthenticated: (...args: unknown[]) => mockIsAdminAuthenticated(...args)
}))

jest.mock('@/lib/admin/credentials.server', () => ({
  verifyAdminPassword: (...args: unknown[]) => mockVerifyAdminPassword(...args)
}))

jest.mock('@/lib/orders/supabase-orders', () => {
  const actual = jest.requireActual('@/lib/orders/supabase-orders')
  return {
    ...actual,
    recordSupabaseOrderRetentionCompletion: (...args: unknown[]) => mockRecordCompletion(...args)
  }
})

jest.mock('@/lib/logger', () => ({
  logger: { error: (...args: unknown[]) => mockLoggerError(...args) }
}))

jest.mock('@/lib/rate-limit', () => ({
  withRateLimit: (handler: (request: NextRequest) => Promise<Response>) =>
    async (request: NextRequest) => mockRateLimited
      ? Response.json({ error: 'Too many requests' }, { status: 429 })
      : handler(request)
}))

const orderId = '11111111-1111-4111-8111-111111111111'
const validBody = {
  password: 'admin-secret',
  effectiveOn: '2026-05-02',
  evidenceBasis: 'invoice-accounting-record',
  confirmation: 'SET RETENTION 26042009000001'
}

const makeRequest = (body: unknown = validBody) => new NextRequest(
  `http://localhost/api/admin/orders/${orderId}/retention-lifecycle`,
  {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'http://localhost',
      'sec-fetch-site': 'same-origin'
    },
    body: JSON.stringify(body)
  }
)

const context = { params: Promise.resolve({ id: orderId }) }

describe('POST /api/admin/orders/[id]/retention-lifecycle', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRateLimited = false
    mockIsAdminAuthenticated.mockResolvedValue(true)
    mockVerifyAdminPassword.mockReturnValue(true)
    mockRecordCompletion.mockResolvedValue({
      status: 'updated',
      completedAt: '2026-05-02T12:00:00.000Z',
      financialYearEndedAt: '2027-04-05T00:00:00.000Z',
      retentionDueAt: '2033-04-06T00:00:00.000Z'
    })
  })

  it('records a verified date through the controlled repository operation', async () => {
    const response = await POST(makeRequest(), context)

    expect(response.status).toBe(200)
    expect(mockRecordCompletion).toHaveBeenCalledWith({
      orderReference: orderId,
      effectiveOn: validBody.effectiveOn,
      evidenceBasis: validBody.evidenceBasis,
      confirmation: validBody.confirmation
    })
    expect(await response.json()).toEqual(expect.objectContaining({
      status: 'updated',
      retentionDueAt: '2033-04-06T00:00:00.000Z'
    }))
  })

  it('requires authentication and the admin password', async () => {
    mockIsAdminAuthenticated.mockResolvedValueOnce(false)
    expect((await POST(makeRequest(), context)).status).toBe(401)

    mockIsAdminAuthenticated.mockResolvedValueOnce(true)
    mockVerifyAdminPassword.mockReturnValueOnce(false)
    expect((await POST(makeRequest(), context)).status).toBe(401)
    expect(mockRecordCompletion).not.toHaveBeenCalled()
  })

  it.each([
    { ...validBody, unexpected: true },
    { ...validBody, effectiveOn: '02/05/2026' },
    { ...validBody, effectiveOn: '2026-99-99' },
    { ...validBody, evidenceBasis: 'free-text-evidence' },
    { ...validBody, confirmation: '' }
  ])('rejects malformed or unallowlisted input', async (body) => {
    const response = await POST(makeRequest(body), context)
    expect(response.status).toBe(400)
    expect(mockRecordCompletion).not.toHaveBeenCalled()
  })

  it('returns safe conflict errors without logging customer data', async () => {
    mockRecordCompletion.mockRejectedValue(new OrderRetentionLifecycleError(
      'RETENTION_ORDER_LEGAL_HOLD_ACTIVE',
      409
    ))

    const response = await POST(makeRequest(), context)
    expect(response.status).toBe(409)
    expect(await response.json()).toEqual({
      error: 'Review the legal hold before changing this order lifecycle.',
      code: 'RETENTION_ORDER_LEGAL_HOLD_ACTIVE'
    })
    expect(mockLoggerError).not.toHaveBeenCalled()
  })

  it('fails safely on persistence errors and honours rate limiting', async () => {
    const sentinel = 'PRIVATE_ORDER_CONTENT'
    mockRecordCompletion.mockRejectedValueOnce(new Error(sentinel))
    const failed = await POST(makeRequest(), context)
    expect(failed.status).toBe(500)
    expect(JSON.stringify(mockLoggerError.mock.calls)).not.toContain(sentinel)

    mockRateLimited = true
    const limited = await POST(makeRequest(), context)
    expect(limited.status).toBe(429)
  })
})
