import { redirect } from 'next/navigation'

export default function AdminLoginRedirectPage() {
  redirect('/admin/auth')
}
