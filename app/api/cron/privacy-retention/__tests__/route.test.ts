/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { GET } from '../route'

const mockDiscover = jest.fn()
const mockLoggerError = jest.fn()

jest.mock('@/lib/privacy-retention/service', () => ({
  discoverPrivacyRetentionCandidates: (...args: unknown[]) => mockDiscover(...args)
}))

jest.mock('@/lib/logger', () => ({
  logger: {
    error: (...args: unknown[]) => mockLoggerError(...args)
  }
}))

const makeRequest = (token?: string) => new NextRequest(
  'http://localhost/api/cron/privacy-retention',
  token
    ? { headers: { authorization: `Bearer ${token}` } }
    : undefined
)

describe('GET /api/cron/privacy-retention', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.CRON_SECRET = 'retention-cron-secret'
    delete process.env.REVALIDATE_SECRET
    mockDiscover.mockResolvedValue({
      status: 'completed',
      runReference: 'RET-20260825-A1B2C3D4',
      discoveredAt: '2026-08-25T08:00:00.000Z',
      dueCount: 4,
      heldCount: 1
    })
  })

  afterAll(() => {
    delete process.env.CRON_SECRET
    delete process.env.REVALIDATE_SECRET
  })

  it('rejects missing, wrong and unrelated bearer secrets', async () => {
    expect((await GET(makeRequest())).status).toBe(401)
    expect((await GET(makeRequest('wrong-secret'))).status).toBe(401)

    delete process.env.CRON_SECRET
    process.env.REVALIDATE_SECRET = 'revalidate-only'
    expect((await GET(makeRequest('revalidate-only'))).status).toBe(401)

    expect(mockDiscover).not.toHaveBeenCalled()
  })

  it('performs discovery only and returns safe aggregate counts', async () => {
    const response = await GET(makeRequest('retention-cron-secret'))
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toEqual({
      status: 'completed',
      runReference: 'RET-20260825-A1B2C3D4',
      discoveredAt: '2026-08-25T08:00:00.000Z',
      dueCount: 4,
      heldCount: 1
    })
    expect(payload).not.toHaveProperty('candidates')
    expect(payload).not.toHaveProperty('deletedCount')
    expect(mockDiscover).toHaveBeenCalledTimes(1)
    expect(response.headers.get('cache-control')).toBe('no-cache, no-store, must-revalidate')
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow')
  })

  it('does not leak database errors or protected record content', async () => {
    const sentinel = 'SENTINEL-PRIVATE-RECORD-CONTENT'
    mockDiscover.mockRejectedValue(Object.assign(
      new Error(`${sentinel} database failure`),
      { code: 'DISCOVERY_QUERY_FAILED', details: sentinel, hint: sentinel }
    ))

    const response = await GET(makeRequest('retention-cron-secret'))
    const body = await response.text()
    const logged = JSON.stringify(mockLoggerError.mock.calls)

    expect(response.status).toBe(500)
    expect(body).toBe(JSON.stringify({
      error: 'Privacy-retention discovery could not be completed safely.'
    }))
    expect(body).not.toContain(sentinel)
    expect(logged).not.toContain(sentinel)
    expect(logged).toContain('DISCOVERY_QUERY_FAILED')
    expect(mockLoggerError).toHaveBeenCalledWith(
      'Privacy-retention discovery failed',
      expect.objectContaining({
        operation: 'cron.privacy-retention.discovery',
        code: 'DISCOVERY_QUERY_FAILED'
      })
    )
  })
})
