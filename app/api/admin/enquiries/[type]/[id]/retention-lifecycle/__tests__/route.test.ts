/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { AdminEnquiryRetentionLifecycleError } from '@/lib/enquiries/supabase-enquiries'
import { POST } from '../route'

const mockIsAdminAuthenticated = jest.fn()
const mockVerifyAdminPassword = jest.fn()
const mockUpdateLifecycle = jest.fn()
const mockLoggerError = jest.fn()
let mockRateLimited = false

jest.mock('@/lib/admin-auth', () => ({
  isAdminAuthenticated: (...args: unknown[]) => mockIsAdminAuthenticated(...args)
}))

jest.mock('@/lib/admin/credentials.server', () => ({
  verifyAdminPassword: (...args: unknown[]) => mockVerifyAdminPassword(...args)
}))

jest.mock('@/lib/enquiries/supabase-enquiries', () => {
  const actual = jest.requireActual('@/lib/enquiries/supabase-enquiries')
  return {
    ...actual,
    updateAdminEnquiryRetentionLifecycle: (...args: unknown[]) => mockUpdateLifecycle(...args)
  }
})

jest.mock('@/lib/logger', () => ({
  logger: {
    error: (...args: unknown[]) => mockLoggerError(...args)
  }
}))

jest.mock('@/lib/rate-limit', () => ({
  withRateLimit: (handler: (request: NextRequest) => Promise<Response>) =>
    async (request: NextRequest) => mockRateLimited
      ? Response.json({ error: 'Too many requests' }, { status: 429 })
      : handler(request)
}))

const orderId = '11111111-1111-4111-8111-111111111111'

const makeRequest = (body: unknown, rawBody?: string) => new NextRequest(
  'http://localhost/api/admin/enquiries/contact/42/retention-lifecycle',
  {
    method: 'POST',
    body: rawBody === undefined ? JSON.stringify(body) : rawBody,
    headers: {
      'content-type': 'application/json',
      origin: 'http://localhost',
      'sec-fetch-site': 'same-origin'
    }
  }
)

const context = (type = 'contact', id = '42') => ({
  params: Promise.resolve({ type, id })
})

describe('POST /api/admin/enquiries/[type]/[id]/retention-lifecycle', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRateLimited = false
    mockIsAdminAuthenticated.mockResolvedValue(true)
    mockVerifyAdminPassword.mockReturnValue(true)
    mockUpdateLifecycle.mockResolvedValue({
      lifecycle: {
        status: 'closed',
        legalHold: false
      },
      updatedAt: '2026-08-25T12:00:00.000Z'
    })
  })

  it.each([
    ['record-contact', undefined],
    ['close', undefined],
    ['reopen', undefined],
    ['convert', orderId]
  ])('updates the %s lifecycle action with a server timestamp', async (
    action,
    convertedOrderId
  ) => {
    const response = await POST(
      makeRequest({
        password: 'admin-password',
        action,
        ...(convertedOrderId ? { convertedOrderId } : {})
      }),
      context()
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toEqual({
      status: 'updated',
      updatedAt: expect.any(String)
    })
    expect(mockUpdateLifecycle).toHaveBeenCalledWith(
      'contact',
      '42',
      expect.objectContaining({
        action,
        convertedOrderId
      })
    )
    expect(payload.updatedAt).toBe('2026-08-25T12:00:00.000Z')
  })

  it('requires an authenticated admin session before inspecting the record', async () => {
    mockIsAdminAuthenticated.mockResolvedValue(false)

    const response = await POST(
      makeRequest({ password: 'admin-password', action: 'close' }),
      context()
    )

    expect(response.status).toBe(401)
    expect(mockVerifyAdminPassword).not.toHaveBeenCalled()
    expect(mockUpdateLifecycle).not.toHaveBeenCalled()
  })

  it.each([
    ['unknown', '42'],
    ['contact', 'not-a-number'],
    ['workshop', '9223372036854775808'],
    ['custom-cake', 'not-a-uuid']
  ])('rejects invalid %s/%s record routing before mutation', async (type, id) => {
    const response = await POST(
      makeRequest({ password: 'admin-password', action: 'close' }),
      context(type, id)
    )

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ error: 'Enquiry not found' })
    expect(mockVerifyAdminPassword).not.toHaveBeenCalled()
    expect(mockUpdateLifecycle).not.toHaveBeenCalled()
  })

  it('strictly validates JSON, actions and conversion references', async () => {
    const requests = [
      makeRequest(undefined, '{'),
      makeRequest({ password: 'admin-password', action: 'archive' }),
      makeRequest({ password: 'admin-password', action: 'close', unexpected: true }),
      makeRequest({ password: 'admin-password', action: 'convert' }),
      makeRequest({
        password: 'admin-password',
        action: 'convert',
        convertedOrderId: 'not an order id'
      })
    ]

    for (const request of requests) {
      const response = await POST(request, context())
      expect(response.status).toBe(400)
      expect(await response.json()).toEqual({
        error: 'Invalid retention-lifecycle request.'
      })
    }

    expect(mockVerifyAdminPassword).not.toHaveBeenCalled()
    expect(mockUpdateLifecycle).not.toHaveBeenCalled()
  })

  it('requires a valid admin password after request validation', async () => {
    mockVerifyAdminPassword.mockReturnValue(false)

    const response = await POST(
      makeRequest({ password: 'wrong', action: 'close' }),
      context()
    )

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Invalid admin password' })
    expect(mockUpdateLifecycle).not.toHaveBeenCalled()
  })

  it('returns not found when the record disappears before update', async () => {
    mockUpdateLifecycle.mockResolvedValue(null)

    const response = await POST(
      makeRequest({ password: 'admin-password', action: 'close' }),
      context()
    )

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ error: 'Enquiry not found' })
  })

  it.each([
    [
      'RETENTION_ORDER_REFERENCE_INVALID',
      400,
      'Enter a valid linked order reference.'
    ],
    [
      'RETENTION_ORDER_NOT_FOUND',
      404,
      'The linked order was not found.'
    ],
    [
      'RETENTION_LEGAL_HOLD_ACTIVE',
      409,
      'Release the legal hold before changing this lifecycle.'
    ],
    [
      'RETENTION_CONVERTED_LINK_IMMUTABLE',
      409,
      'A converted enquiry must remain linked to its order. Create a new enquiry for later work.'
    ]
  ])('maps %s to a safe response', async (code, status, message) => {
    mockUpdateLifecycle.mockRejectedValue(
      new AdminEnquiryRetentionLifecycleError(code, status)
    )

    const response = await POST(
      makeRequest({
        password: 'admin-password',
        action: 'convert',
        convertedOrderId: orderId
      }),
      context()
    )

    expect(response.status).toBe(status)
    expect(await response.json()).toEqual({ error: message })
    expect(mockLoggerError).not.toHaveBeenCalled()
  })

  it('sanitises persistence failures and logs only safe context', async () => {
    const sentinel = 'SENTINEL-CUSTOMER-MESSAGE-AND-HEALTH-DATA'
    mockUpdateLifecycle.mockRejectedValue(Object.assign(
      new Error(sentinel),
      { code: 'RETENTION_LIFECYCLE_UPDATE_FAILED', details: sentinel }
    ))

    const response = await POST(
      makeRequest({ password: 'admin-password', action: 'close' }),
      context()
    )
    const responseText = await response.text()
    const logged = JSON.stringify(mockLoggerError.mock.calls)

    expect(response.status).toBe(500)
    expect(responseText).not.toContain(sentinel)
    expect(logged).not.toContain(sentinel)
    expect(logged).toContain('RETENTION_LIFECYCLE_UPDATE_FAILED')
    expect(mockLoggerError).toHaveBeenCalledWith(
      'Admin enquiry retention lifecycle update failed',
      expect.objectContaining({
        operation: 'admin.enquiry-retention-lifecycle.update',
        recordReference: '42',
        code: 'RETENTION_LIFECYCLE_UPDATE_FAILED'
      })
    )
  })

  it('rate limits before authentication and persistence', async () => {
    mockRateLimited = true

    const response = await POST(
      makeRequest({ password: 'admin-password', action: 'close' }),
      context()
    )

    expect(response.status).toBe(429)
    expect(mockIsAdminAuthenticated).not.toHaveBeenCalled()
    expect(mockUpdateLifecycle).not.toHaveBeenCalled()
  })
})
