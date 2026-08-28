/**
 * @jest-environment node
 */
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { NextRequest } from 'next/server'

jest.mock('node:child_process', () => ({
  execFileSync: jest.fn()
}))

jest.mock('@/lib/admin/auth-token', () => ({
  verifyAdminAuthToken: jest.fn()
}))

import { verifyAdminAuthToken } from '@/lib/admin/auth-token'
import { handleBackupRequest } from '../backup-route'

const mockExecFileSync = execFileSync as jest.MockedFunction<typeof execFileSync>
const mockVerifyAdminAuthToken = verifyAdminAuthToken as jest.MockedFunction<
  typeof verifyAdminAuthToken
>

describe('backup operational route handler', () => {
  const originalAdminSecret = process.env.ADMIN_SECRET_TOKEN
  const originalCronSecret = process.env.CRON_SECRET
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.ADMIN_SECRET_TOKEN = 'admin-secret'
    process.env.CRON_SECRET = 'cron-secret'
    mockVerifyAdminAuthToken.mockResolvedValue(false)
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  afterAll(() => {
    process.env.ADMIN_SECRET_TOKEN = originalAdminSecret
    process.env.CRON_SECRET = originalCronSecret
  })

  it('rejects unauthenticated requests without starting a backup', async () => {
    const response = await handleBackupRequest(
      new NextRequest('http://localhost/api/backup-daily'),
      'daily'
    )

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Unauthorized' })
    expect(mockExecFileSync).not.toHaveBeenCalled()
  })

  it.each(['daily', 'weekly', 'monthly'] as const)(
    'runs the fixed %s scheduler command for an authenticated cron request',
    async (frequency) => {
      const request = new NextRequest(`http://localhost/api/backup-${frequency}`, {
        headers: { authorization: 'Bearer cron-secret' }
      })

      const response = await handleBackupRequest(request, frequency)
      const payload = await response.json()

      expect(response.status).toBe(200)
      expect(payload).toEqual(expect.objectContaining({
        success: true,
        type: frequency
      }))
      expect(payload).not.toHaveProperty('output')
      expect(mockExecFileSync).toHaveBeenCalledWith(
        process.execPath,
        [
          path.join(process.cwd(), 'scripts', 'backup-scheduler-simple.js'),
          '--run',
          frequency
        ],
        expect.objectContaining({
          cwd: process.cwd(),
          stdio: 'pipe',
          windowsHide: true
        })
      )
    }
  )

  it('accepts an authenticated admin session for manual operations', async () => {
    mockVerifyAdminAuthToken.mockResolvedValue(true)

    const request = new NextRequest('http://localhost/api/backup-daily', {
      headers: { cookie: 'admin_auth_token=valid-cookie' }
    })
    const response = await handleBackupRequest(request, 'daily')

    expect(response.status).toBe(200)
    expect(mockVerifyAdminAuthToken).toHaveBeenCalledWith('valid-cookie')
    expect(mockExecFileSync).toHaveBeenCalledTimes(1)
  })

  it('never returns or logs raw command errors or output', async () => {
    const sentinel = 'SENTINEL private command output and credentials'
    mockExecFileSync.mockImplementation(() => {
      throw Object.assign(new Error(sentinel), {
        code: 'EACCES',
        stdout: sentinel,
        stderr: sentinel
      })
    })

    const request = new NextRequest('http://localhost/api/backup-weekly', {
      headers: { authorization: 'Bearer admin-secret' }
    })
    const response = await handleBackupRequest(request, 'weekly')
    const payload = await response.json()

    expect(response.status).toBe(500)
    expect(payload).toEqual({
      success: false,
      error: 'Backup operation failed',
      code: 'EACCES'
    })
    expect(JSON.stringify(payload)).not.toContain(sentinel)
    expect(JSON.stringify(consoleErrorSpy.mock.calls)).not.toContain(sentinel)
    expect(consoleErrorSpy).toHaveBeenCalledWith('Backup operation failed', {
      operation: 'backup-weekly',
      code: 'EACCES'
    })
  })
})
