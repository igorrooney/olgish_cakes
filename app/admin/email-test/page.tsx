import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { EmailTestPageClient } from './EmailTestPageClient'
import { isAdminAuthenticated } from '@/lib/admin/auth.server'

export const metadata: Metadata = {
  title: 'Email Test Console | Olgish Cakes Admin',
  description: 'Preview and run controlled real-send email smoke tests',
  robots: {
    index: false,
    follow: false
  }
}

export default async function EmailTestPage() {
  const authenticated = await isAdminAuthenticated()

  if (!authenticated) {
    redirect('/admin/auth')
  }

  return <EmailTestPageClient />
}
