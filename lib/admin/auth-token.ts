import 'server-only'

import { jwtVerify } from 'jose'
import { getAdminJwtSecret } from './jwt-secret.server'

interface AdminAuthConfig {
  adminUsername: string
  jwtSecret: string
}

function getAdminAuthConfig(): AdminAuthConfig | null {
  const adminUsername = process.env.ADMIN_USERNAME?.trim()

  if (!adminUsername) {
    return null
  }

  let jwtSecret: string
  try {
    jwtSecret = getAdminJwtSecret()
  } catch {
    return null
  }

  return {
    adminUsername,
    jwtSecret
  }
}

export async function verifyAdminAuthToken(token: string | null | undefined): Promise<boolean> {
  if (!token || token.trim().length === 0) {
    return false
  }

  const config = getAdminAuthConfig()
  if (!config) {
    return false
  }

  try {
    const secret = new TextEncoder().encode(config.jwtSecret)
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
      audience: 'olgish-cakes-admin',
      issuer: 'olgish-cakes',
      clockTolerance: '5s'
    })

    return payload.role === 'admin' && payload.username === config.adminUsername
  } catch {
    return false
  }
}
