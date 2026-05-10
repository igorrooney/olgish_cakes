import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AdminAuthGuard } from '@/components/AdminAuthGuard'
import { isAdminAuthenticated } from '@/lib/admin/auth.server'
import { listAdminEnquiries } from '@/lib/enquiries/supabase-enquiries'
import { EnquiriesDashboard } from './EnquiriesDashboard'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Enquiries | Olgish Cakes Admin',
  description: 'Review customer enquiries from website forms.',
  robots: {
    index: false,
    follow: false
  }
}

export default async function AdminEnquiriesPage() {
  const isAuthenticated = await isAdminAuthenticated()

  if (!isAuthenticated) {
    redirect('/admin/auth')
  }

  const enquiries = await listAdminEnquiries()

  return (
    <AdminAuthGuard>
      <EnquiriesDashboard enquiries={enquiries} />
    </AdminAuthGuard>
  )
}
