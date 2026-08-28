/**
 * @jest-environment node
 */

import {
  verifyAdminCredentials,
  verifyAdminPassword,
  verifyAdminUsername
} from '../credentials.server'

describe('admin credential verification', () => {
  const originalAdminPassword = process.env.ADMIN_PASSWORD
  const originalAdminUsername = process.env.ADMIN_USERNAME

  afterEach(() => {
    if (originalAdminPassword === undefined) {
      delete process.env.ADMIN_PASSWORD
    } else {
      process.env.ADMIN_PASSWORD = originalAdminPassword
    }

    if (originalAdminUsername === undefined) {
      delete process.env.ADMIN_USERNAME
    } else {
      process.env.ADMIN_USERNAME = originalAdminUsername
    }
  })

  it('accepts only the configured password', () => {
    process.env.ADMIN_PASSWORD = 'release-admin-password'

    expect(verifyAdminPassword('release-admin-password')).toBe(true)
    expect(verifyAdminPassword('release-admin-passworD')).toBe(false)
    expect(verifyAdminPassword('short')).toBe(false)
  })

  it('rejects empty submissions and missing configuration', () => {
    process.env.ADMIN_PASSWORD = 'release-admin-password'
    expect(verifyAdminPassword('')).toBe(false)

    delete process.env.ADMIN_PASSWORD
    expect(verifyAdminPassword('release-admin-password')).toBe(false)
  })

  it('verifies the configured username with the same constant-time boundary', () => {
    process.env.ADMIN_USERNAME = 'release-admin'

    expect(verifyAdminUsername('release-admin')).toBe(true)
    expect(verifyAdminUsername('Release-admin')).toBe(false)
    expect(verifyAdminUsername('')).toBe(false)

    delete process.env.ADMIN_USERNAME
    expect(verifyAdminUsername('release-admin')).toBe(false)
  })

  it('requires both configured credentials to match', () => {
    process.env.ADMIN_USERNAME = 'release-admin'
    process.env.ADMIN_PASSWORD = 'release-admin-password'

    expect(verifyAdminCredentials(
      'release-admin',
      'release-admin-password'
    )).toBe(true)
    expect(verifyAdminCredentials(
      'wrong-admin',
      'release-admin-password'
    )).toBe(false)
    expect(verifyAdminCredentials(
      'release-admin',
      'wrong-password'
    )).toBe(false)
  })
})
