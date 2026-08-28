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

jest.mock('@/lib/enquiries/supabase-enquiries', () => ({
  isAdminEnquiryType: (value: string) =>
    ['contact', 'custom-cake', 'workshop'].includes(value),
  isValidAdminEnquiryRecordReference: (type: string, value: string) => {
    if (type === 'custom-cake') {
      return /^[0-9a-f-]{36}$/i.test(value)
    }

    if (!/^\d{1,19}$/.test(value)) {
      return false
    }

    const normalized = value.replace(/^0+/, '')
    return normalized.length > 0 && (
      normalized.length < 19 ||
      (normalized.length === 19 && normalized <= '9223372036854775807')
    )
  },
  withdrawAdminEnquiryDietaryHealthInformation: (...args: unknown[]) => mockWithdraw(...args)
}))

jest.mock('@/lib/logger', () => ({
  logger: {
    error: (...args: unknown[]) => mockLoggerError(...args)
  }
}))

const makeRequest = (body: unknown) => new NextRequest(
  'http://localhost/api/admin/enquiries/contact/42/withdraw-health-consent',
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

const context = (
  type = 'contact',
  id = '42'
) => ({
  params: Promise.resolve({ type, id })
})

describe('admin enquiry dietary-health withdrawal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsAdminAuthenticated.mockResolvedValue(true)
    mockVerifyAdminPassword.mockReturnValue(true)
    mockWithdraw.mockResolvedValue({
      status: 'withdrawn',
      withdrawnAt: '2026-07-31T10:00:00.000Z'
    })
  })

  it('requires an authenticated admin session', async () => {
    mockIsAdminAuthenticated.mockResolvedValue(false)

    const response = await POST(
      makeRequest({ password: 'secret', confirmation: '42' }),
      context()
    )

    expect(response.status).toBe(401)
    expect(mockWithdraw).not.toHaveBeenCalled()
  })

  it('requires the exact record reference and admin password', async () => {
    const wrongConfirmation = await POST(
      makeRequest({ password: 'secret', confirmation: '41' }),
      context()
    )
    expect(wrongConfirmation.status).toBe(400)

    mockVerifyAdminPassword.mockReturnValue(false)
    const wrongPassword = await POST(
      makeRequest({ password: 'wrong', confirmation: '42' }),
      context()
    )
    expect(wrongPassword.status).toBe(401)
    expect(mockWithdraw).not.toHaveBeenCalled()
  })

  it.each([
    ['contact', 'not-a-number'],
    ['workshop', '9223372036854775808'],
    ['custom-cake', 'not-a-uuid']
  ])('rejects an invalid %s record reference before persistence', async (type, id) => {
    const response = await POST(
      makeRequest({ password: 'secret', confirmation: id }),
      context(type, id)
    )

    expect(response.status).toBe(404)
    expect(mockWithdraw).not.toHaveBeenCalled()
  })

  it.each([
    ['not-found', 404],
    ['no-active-information', 409]
  ])('maps %s without returning protected content', async (status, expectedStatus) => {
    mockWithdraw.mockResolvedValue({ status })

    const response = await POST(
      makeRequest({ password: 'secret', confirmation: '42' }),
      context()
    )
    const body = await response.text()

    expect(response.status).toBe(expectedStatus)
    expect(body).not.toContain('SENTINEL-HEALTH-TEXT')
  })

  it.each(['withdrawn', 'already-withdrawn'])(
    'returns timestamp-only success for %s',
    async (status) => {
      mockWithdraw.mockResolvedValue({
        status,
        withdrawnAt: '2026-07-31T10:00:00.000Z'
      })

      const response = await POST(
        makeRequest({ password: 'secret', confirmation: '42' }),
        context()
      )
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body).toEqual({
        status,
        withdrawnAt: '2026-07-31T10:00:00.000Z'
      })
      expect(body).not.toHaveProperty('dietaryHealthInformation')
    }
  )

  it('sanitises persistence failures', async () => {
    mockWithdraw.mockRejectedValue(Object.assign(
      new Error('SENTINEL-HEALTH-TEXT database detail'),
      {
        code: 'PGRST500',
        details: 'SENTINEL-HEALTH-TEXT'
      }
    ))

    const response = await POST(
      makeRequest({ password: 'secret', confirmation: '42' }),
      context()
    )
    const responseText = await response.text()
    const logged = JSON.stringify(mockLoggerError.mock.calls)

    expect(response.status).toBe(500)
    expect(responseText).not.toContain('SENTINEL-HEALTH-TEXT')
    expect(logged).not.toContain('SENTINEL-HEALTH-TEXT')
    expect(logged).toContain('PGRST500')
  })
})
