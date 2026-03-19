import { createHmac, randomBytes } from 'crypto'

const CSRF_TOKEN_COOKIE = 'csrf-token'
const CSRF_SECRET_MIN_LENGTH = 32

function getCsrfSecret(): string {
  const csrfSecret = process.env.CSRF_SECRET?.trim()

  if (!csrfSecret || csrfSecret.length < CSRF_SECRET_MIN_LENGTH) {
    throw new Error(
      'CSRF_SECRET environment variable must be set to a cryptographically secure value (min 32 chars). ' +
      'Generate with: openssl rand -hex 32'
    )
  }

  return csrfSecret
}

/**
 * Generate a CSRF token
 * Uses HMAC for token generation to prevent token forgery
 */
export function generateCsrfToken(): string {
  const secret = randomBytes(32).toString('hex')
  const token = randomBytes(32).toString('hex')
  const hmac = createHmac('sha256', getCsrfSecret())
  hmac.update(secret + token)
  const signature = hmac.digest('hex')

  return `${secret}:${token}:${signature}`
}

/**
 * Validate a CSRF token
 * Verifies the token signature to ensure it wasn't tampered with
 */
export function validateCsrfToken(token: string, cookieToken: string): boolean {
  if (!token || !cookieToken) {
    return false
  }

  // Tokens must match
  if (token !== cookieToken) {
    return false
  }

  // Verify token structure: secret:token:signature
  const parts = token.split(':')
  if (parts.length !== 3) {
    return false
  }

  const [secret, tokenPart, signature] = parts

  // Verify signature
  const hmac = createHmac('sha256', getCsrfSecret())
  hmac.update(secret + tokenPart)
  const expectedSignature = hmac.digest('hex')

  return signature === expectedSignature
}

/**
 * Get CSRF token cookie name
 */
export function getCsrfTokenCookieName(): string {
  return CSRF_TOKEN_COOKIE
}
