/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

jest.mock('@/lib/admin/auth-token', () => ({
  verifyAdminAuthToken: jest.fn()
}))

import { verifyAdminAuthToken } from '@/lib/admin/auth-token'
import { isAdminOrCronRequestAuthorized } from '../internal-route-auth'

const mockVerifyAdminAuthToken = verifyAdminAuthToken as jest.MockedFunction<
  typeof verifyAdminAuthToken
>

describe('internal operational route authentication', () => {
  const originalAdminSecret = process.env.ADMIN_SECRET_TOKEN
  const originalCronSecret = process.env.CRON_SECRET

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.ADMIN_SECRET_TOKEN = 'admin-secret'
    process.env.CRON_SECRET = 'cron-secret'
    mockVerifyAdminAuthToken.mockResolvedValue(false)
  })

  afterAll(() => {
    process.env.ADMIN_SECRET_TOKEN = originalAdminSecret
    process.env.CRON_SECRET = originalCronSecret
  })

  it('accepts a verified admin cookie before bearer fallbacks', async () => {
    mockVerifyAdminAuthToken.mockResolvedValue(true)

    const request = new NextRequest('http://localhost/api/task', {
      headers: { cookie: 'admin_auth_token=valid-admin-cookie' }
    })

    await expect(isAdminOrCronRequestAuthorized(request)).resolves.toBe(true)
    expect(mockVerifyAdminAuthToken).toHaveBeenCalledWith('valid-admin-cookie')
  })

  it.each(['admin-secret', 'cron-secret'])(
    'accepts the %s bearer fallback after cookie verification fails',
    async (token) => {
      const request = new NextRequest('http://localhost/api/task', {
        headers: { authorization: `Bearer ${token}` }
      })

      await expect(isAdminOrCronRequestAuthorized(request)).resolves.toBe(true)
      expect(mockVerifyAdminAuthToken).toHaveBeenCalledWith('')
    }
  )

  it('rejects requests when all configured credentials fail', async () => {
    const request = new NextRequest('http://localhost/api/task', {
      headers: { authorization: 'Bearer wrong-secret' }
    })

    await expect(isAdminOrCronRequestAuthorized(request)).resolves.toBe(false)
  })
})
