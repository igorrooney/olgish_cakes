/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { POST } from '../route'

const mockIsAdminAuthenticated = jest.fn()
const mockVerifyAdminPassword = jest.fn()
const mockSchedule = jest.fn()
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
  isValidAdminEnquiryRecordReference: (_type: string, value: string) => /^\d{1,19}$/.test(value)
}))

jest.mock('@/lib/health-retention/schedule', () => ({
  LegacyHealthRetentionScheduleError: class extends Error {
    status: number
    code: string

    constructor(code: string, status: number) {
      super(code)
      this.code = code
      this.status = status
    }
  },
  scheduleLegacyEnquiryHealthRetention: (...args: unknown[]) => mockSchedule(...args)
}))

jest.mock('@/lib/logger', () => ({
  logger: {
    error: (...args: unknown[]) => mockLoggerError(...args)
  }
}))

const makeRequest = (body: unknown) => new NextRequest(
  'http://localhost/api/admin/enquiries/contact/42/schedule-health-retention',
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

const context = { params: Promise.resolve({ type: 'contact', id: '42' }) }

describe('admin enquiry legacy health-retention schedule', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsAdminAuthenticated.mockResolvedValue(true)
    mockVerifyAdminPassword.mockReturnValue(true)
    mockSchedule.mockResolvedValue({
      status: 'scheduled',
      dueAt: '2026-09-24T12:00:00.000Z'
    })
  })

  it('requires an authenticated session, exact reference and password', async () => {
    mockIsAdminAuthenticated.mockResolvedValue(false)
    const unauthorized = await POST(
      makeRequest({ password: 'secret', confirmation: 'START HEALTH RETENTION 42' }),
      context
    )
    expect(unauthorized.status).toBe(401)

    mockIsAdminAuthenticated.mockResolvedValue(true)
    const wrongReference = await POST(
      makeRequest({ password: 'secret', confirmation: 'START HEALTH RETENTION 41' }),
      context
    )
    expect(wrongReference.status).toBe(400)

    mockVerifyAdminPassword.mockReturnValue(false)
    const wrongPassword = await POST(
      makeRequest({ password: 'wrong', confirmation: 'START HEALTH RETENTION 42' }),
      context
    )
    expect(wrongPassword.status).toBe(401)
    expect(mockSchedule).not.toHaveBeenCalled()
  })

  it.each(['scheduled', 'already-scheduled'])(
    'returns content-free deadline evidence for %s',
    async (status) => {
      mockSchedule.mockResolvedValue({
        status,
        dueAt: '2026-09-24T12:00:00.000Z'
      })

      const response = await POST(
        makeRequest({ password: 'secret', confirmation: 'START HEALTH RETENTION 42' }),
        context
      )
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(response.headers.get('cache-control')).toContain('no-store')
      expect(body).toEqual({
        status,
        dueAt: '2026-09-24T12:00:00.000Z'
      })
      expect(body).not.toHaveProperty('dietaryHealthInformation')
      expect(mockSchedule).toHaveBeenCalledWith('contact', '42')
    }
  )

  it.each(['no-active-information', 'already-withdrawn', 'already-erased'])(
    'rejects the safe no-op outcome %s',
    async (status) => {
      mockSchedule.mockResolvedValue({ status })
      const response = await POST(
        makeRequest({ password: 'secret', confirmation: 'START HEALTH RETENTION 42' }),
        context
      )
      expect(response.status).toBe(409)
      expect(await response.text()).not.toContain('SENTINEL-HEALTH-TEXT')
    }
  )

  it('sanitises unexpected persistence failures', async () => {
    mockSchedule.mockRejectedValue(Object.assign(
      new Error('SENTINEL-HEALTH-TEXT database detail'),
      { code: 'PGRST500', details: 'SENTINEL-HEALTH-TEXT' }
    ))

    const response = await POST(
      makeRequest({ password: 'secret', confirmation: 'START HEALTH RETENTION 42' }),
      context
    )

    expect(response.status).toBe(500)
    expect(await response.text()).not.toContain('SENTINEL-HEALTH-TEXT')
    expect(JSON.stringify(mockLoggerError.mock.calls)).not.toContain('SENTINEL-HEALTH-TEXT')
  })

  it('rejects extra fields and overlong credentials before password verification', async () => {
    const extraField = await POST(
      makeRequest({
        password: 'secret',
        confirmation: 'START HEALTH RETENTION 42',
        dietaryHealthInformation: 'must-not-be-accepted'
      }),
      context
    )
    expect(extraField.status).toBe(400)

    const overlongPassword = await POST(
      makeRequest({
        password: 'x'.repeat(257),
        confirmation: 'START HEALTH RETENTION 42'
      }),
      context
    )
    expect(overlongPassword.status).toBe(400)
    expect(mockVerifyAdminPassword).not.toHaveBeenCalled()
    expect(mockSchedule).not.toHaveBeenCalled()
  })

  it('maps known database conflicts to a safe admin message', async () => {
    const { LegacyHealthRetentionScheduleError } = jest.requireMock(
      '@/lib/health-retention/schedule'
    ) as {
      LegacyHealthRetentionScheduleError: new (code: string, status: number) => Error
    }
    mockSchedule.mockRejectedValue(new LegacyHealthRetentionScheduleError(
      'HEALTH_RETENTION_LEGAL_HOLD_ACTIVE',
      409
    ))

    const response = await POST(
      makeRequest({ password: 'secret', confirmation: 'START HEALTH RETENTION 42' }),
      context
    )

    expect(response.status).toBe(409)
    expect(await response.json()).toEqual({
      error: 'Review the legal hold before starting this retention period.'
    })
  })
})
