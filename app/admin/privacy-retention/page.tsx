import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AdminAuthGuard } from '@/components/AdminAuthGuard'
import { isAdminAuthenticated } from '@/lib/admin/auth.server'
import { PrivacyRetentionCentre } from './PrivacyRetentionCentre'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Privacy Retention | Olgish Cakes Admin',
  description: 'Review and selectively remove records that have reached their retention deadline.',
  robots: {
    index: false,
    follow: false
  }
}

export default async function PrivacyRetentionPage() {
  const isAuthenticated = await isAdminAuthenticated()

  if (!isAuthenticated) {
    redirect('/admin/auth')
  }

  return (
    <AdminAuthGuard>
      <PrivacyRetentionCentre />
    </AdminAuthGuard>
  )
}
