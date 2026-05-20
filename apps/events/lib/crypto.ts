import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

export function createRandomToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url')
}

export function signValue(value: string, secret: string): string {
  return createHmac('sha256', secret).update(value).digest('base64url')
}

export function verifySignature(value: string, signature: string, secret: string): boolean {
  const expected = signValue(value, secret)
  const expectedBuffer = Buffer.from(expected)
  const actualBuffer = Buffer.from(signature)

  if (expectedBuffer.length !== actualBuffer.length) {
    return false
  }

  return timingSafeEqual(expectedBuffer, actualBuffer)
}

export function constantTimeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }

  return timingSafeEqual(leftBuffer, rightBuffer)
}

export function encodeJsonToken(value: object, secret: string): string {
  const payload = Buffer.from(JSON.stringify(value)).toString('base64url')
  const signature = signValue(payload, secret)

  return `${payload}.${signature}`
}

export function decodeJsonToken(token: string, secret: string): unknown | null {
  const [payload, signature] = token.split('.')

  if (!payload || !signature || !verifySignature(payload, signature, secret)) {
    return null
  }

  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as unknown
  } catch {
    return null
  }
}
