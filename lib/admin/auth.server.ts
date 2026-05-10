import 'server-only'
import { cookies } from 'next/headers'
import { verifyAdminAuthToken } from './auth-token'

export { verifyAdminAuthToken } from './auth-token'

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_auth_token')?.value
  return verifyAdminAuthToken(token)
}
