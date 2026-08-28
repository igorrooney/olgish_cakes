import 'server-only'

const MINIMUM_PRODUCTION_JWT_SECRET_BYTES = 32

export function getAdminJwtSecret(
  configuredSecret: string | undefined = process.env.JWT_SECRET
): string {
  const secret = configuredSecret?.trim()

  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required')
  }

  if (
    process.env.NODE_ENV === 'production' &&
    new TextEncoder().encode(secret).byteLength <
      MINIMUM_PRODUCTION_JWT_SECRET_BYTES
  ) {
    throw new Error('JWT_SECRET must be at least 32 bytes in production')
  }

  return secret
}
