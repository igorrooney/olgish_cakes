import 'server-only'
import { NextRequest } from 'next/server'
import { verifyAdminAuthToken } from '@/lib/admin/auth-token'
import {
  isBearerTokenAuthorized,
  isCronRequestAuthorized
} from './internal-route'

export async function isAdminOrCronRequestAuthorized(
  request: NextRequest
): Promise<boolean> {
  const adminCookie = request.cookies.get('admin_auth_token')?.value?.trim() || ''

  if (await verifyAdminAuthToken(adminCookie)) {
    return true
  }

  return isBearerTokenAuthorized(request, process.env.ADMIN_SECRET_TOKEN) ||
    isCronRequestAuthorized(request)
}
