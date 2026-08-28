/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

jest.mock('@/lib/admin/auth-token', () => ({
  verifyAdminAuthToken: jest.fn()
}))

import { verifyAdminAuthToken } from '@/lib/admin/auth-token'
import { GET } from '../route'

const mockVerifyAdminAuthToken = verifyAdminAuthToken as jest.MockedFunction<
  typeof verifyAdminAuthToken
>

describe('/api/backup-status', () => {
  const originalCronSecret = process.env.CRON_SECRET

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.CRON_SECRET = 'cron-secret'
    mockVerifyAdminAuthToken.mockResolvedValue(false)
  })

  afterAll(() => {
    process.env.CRON_SECRET = originalCronSecret
  })

  it('returns no backup metadata without authentication', async () => {
    const response = await GET(new NextRequest('http://localhost/api/backup-status'))

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Unauthorized' })
    expect(response.headers.get('cache-control')).toContain('no-store')
  })

  it('returns aggregate status without filesystem names when authorized', async () => {
    const response = await GET(new NextRequest('http://localhost/api/backup-status', {
      headers: { authorization: 'Bearer cron-secret' }
    }))
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.backups).toEqual(expect.objectContaining({
      daily: expect.objectContaining({ totalBackups: expect.any(Number) }),
      weekly: expect.objectContaining({ totalBackups: expect.any(Number) }),
      monthly: expect.objectContaining({ totalBackups: expect.any(Number) }),
      manual: expect.objectContaining({ totalBackups: expect.any(Number) })
    }))
    expect(JSON.stringify(payload)).not.toContain('sanity-backup-')
    expect(JSON.stringify(payload)).not.toContain('backup-report-')
    expect(JSON.stringify(payload)).not.toContain('name')
  })
})
