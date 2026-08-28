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
  scheduleLegacyOrderHealthRetention: (...args: unknown[]) => mockSchedule(...args)
}))

jest.mock('@/lib/logger', () => ({
  logger: {
    error: (...args: unknown[]) => mockLoggerError(...args)
  }
}))

const makeRequest = (body: unknown) => new NextRequest(
  'http://localhost/api/admin/orders/order-42/schedule-health-retention',
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

const context = { params: Promise.resolve({ id: 'order-42' }) }

describe('admin order legacy health-retention schedule', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsAdminAuthenticated.mockResolvedValue(true)
    mockVerifyAdminPassword.mockReturnValue(true)
    mockSchedule.mockResolvedValue({
      status: 'scheduled',
      dueAt: '2026-09-24T12:00:00.000Z'
    })
  })

  it('requires exact confirmation and the admin password', async () => {
    const wrongReference = await POST(
      makeRequest({ password: 'secret', confirmation: 'START HEALTH RETENTION different' }),
      context
    )
    expect(wrongReference.status).toBe(400)

    mockVerifyAdminPassword.mockReturnValue(false)
    const wrongPassword = await POST(
      makeRequest({ password: 'wrong', confirmation: 'START HEALTH RETENTION order-42' }),
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
        makeRequest({ password: 'secret', confirmation: 'START HEALTH RETENTION order-42' }),
        context
      )
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(response.headers.get('cache-control')).toContain('no-store')
      expect(body).toEqual({
        status,
        dueAt: '2026-09-24T12:00:00.000Z'
      })
      expect(body).not.toHaveProperty('metadata')
      expect(mockSchedule).toHaveBeenCalledWith('order-42')
    }
  )

  it('maps absent active information without exposing it', async () => {
    mockSchedule.mockResolvedValue({ status: 'no-active-information' })
    const response = await POST(
      makeRequest({ password: 'secret', confirmation: 'START HEALTH RETENTION order-42' }),
      context
    )

    expect(response.status).toBe(409)
    expect(await response.text()).not.toContain('SENTINEL-HEALTH-TEXT')
  })

  it('sanitises unexpected persistence failures', async () => {
    mockSchedule.mockRejectedValue(Object.assign(
      new Error('SENTINEL-HEALTH-TEXT database detail'),
      { code: 'PGRST500', details: 'SENTINEL-HEALTH-TEXT' }
    ))
    const response = await POST(
      makeRequest({ password: 'secret', confirmation: 'START HEALTH RETENTION order-42' }),
      context
    )

    expect(response.status).toBe(500)
    expect(await response.text()).not.toContain('SENTINEL-HEALTH-TEXT')
    expect(JSON.stringify(mockLoggerError.mock.calls)).not.toContain('SENTINEL-HEALTH-TEXT')
  })

  it('rejects extra fields and overlong confirmation before password verification', async () => {
    const extraField = await POST(
      makeRequest({
        password: 'secret',
        confirmation: 'START HEALTH RETENTION order-42',
        dueAt: '2020-01-01T00:00:00.000Z'
      }),
      context
    )
    expect(extraField.status).toBe(400)

    const overlongConfirmation = await POST(
      makeRequest({ password: 'secret', confirmation: 'x'.repeat(161) }),
      context
    )
    expect(overlongConfirmation.status).toBe(400)
    expect(mockVerifyAdminPassword).not.toHaveBeenCalled()
    expect(mockSchedule).not.toHaveBeenCalled()
  })
})
