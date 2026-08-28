import 'server-only'

import { createHash, timingSafeEqual } from 'node:crypto'

const digest = (value: string) => createHash('sha256').update(value).digest()

const verifyConfiguredValue = (
  submittedValue: string,
  configuredValue: string | undefined
): boolean => {
  if (!configuredValue || submittedValue.length === 0) {
    return false
  }

  return timingSafeEqual(digest(submittedValue), digest(configuredValue))
}

export function verifyAdminPassword(password: string): boolean {
  return verifyConfiguredValue(password, process.env.ADMIN_PASSWORD)
}

export function verifyAdminUsername(username: string): boolean {
  return verifyConfiguredValue(username, process.env.ADMIN_USERNAME?.trim())
}

export function verifyAdminCredentials(
  username: string,
  password: string
): boolean {
  const usernameMatches = verifyAdminUsername(username)
  const passwordMatches = verifyAdminPassword(password)

  return usernameMatches && passwordMatches
}
