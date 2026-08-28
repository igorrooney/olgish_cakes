import { jwtVerify } from 'jose'
import { logger } from './logger'
import { verifyAdminAuthToken } from './admin/auth-token'
import { getAdminJwtSecret } from './admin/jwt-secret.server'
import { toSafeOperationalError } from './security/safe-operational-error'

type AdminAuthOperation = 'admin-auth.verify-token' | 'admin-auth.check'

function logAdminAuthFailure(
  operation: AdminAuthOperation,
  error: unknown
): void {
  logger.error('Admin authentication operation failed', {
    operation,
    ...toSafeOperationalError(error)
  })
}

export async function verifyAdminToken(token: string): Promise<{ username: string; role: string } | null> {
  try {
    const secret = new TextEncoder().encode(getAdminJwtSecret())
    const { payload } = await jwtVerify(token, secret, {
      issuer: 'olgish-cakes',
      audience: 'olgish-cakes-admin',
      algorithms: ['HS256']
    })

    if (typeof payload.username !== 'string' || typeof payload.role !== 'string') {
      return null
    }

    return {
      username: payload.username,
      role: payload.role
    }
  } catch (error) {
    logAdminAuthFailure('admin-auth.verify-token', error)
    return null
  }
}

export async function isAdminAuthenticated(request: Request): Promise<boolean> {
  try {
    const token = request.headers.get('cookie')
      ?.split(';')
      .find(c => c.trim().startsWith('admin_auth_token='))
      ?.split('=')[1]

    if (!token) {
      return false
    }

    return verifyAdminAuthToken(token)
  } catch (error) {
    logAdminAuthFailure('admin-auth.check', error)
    return false
  }
}
