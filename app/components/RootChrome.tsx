'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { DeferredVercelObservability } from './DeferredVercelObservability'
import { NonCriticalClientFeatures } from './NonCriticalClientFeatures'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './homepage/SiteHeader'

interface RootChromeProps {
  children: ReactNode
  isVercelDeployment: boolean
}

const isAdminPath = (pathname: string | null) => pathname === '/admin' || Boolean(pathname?.startsWith('/admin/'))

export function RootChrome({ children, isVercelDeployment }: RootChromeProps) {
  const pathname = usePathname()

  if (isAdminPath(pathname)) {
    return (
      <div className='min-h-screen'>
        {children}
        {isVercelDeployment ? <DeferredVercelObservability /> : null}
      </div>
    )
  }

  return (
    <div className='flex min-h-screen flex-col'>
      <NonCriticalClientFeatures />
      <SiteHeader />
      <main className='flex-grow'>{children}</main>
      <SiteFooter />
      {isVercelDeployment ? <DeferredVercelObservability /> : null}
    </div>
  )
}
