'use client'

import type { ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'

const MuiProviders = dynamic(
  () => import('./MuiProviders').then((mod) => mod.MuiProviders)
)

interface ConditionalMuiProvidersProps {
  children: ReactNode
}

function isLightweightContentRoute(pathname: string | null) {
  return pathname === '/blog' || pathname?.startsWith('/blog/') === true
}

export function ConditionalMuiProviders({ children }: ConditionalMuiProvidersProps) {
  const pathname = usePathname()

  if (isLightweightContentRoute(pathname)) {
    return <>{children}</>
  }

  return <MuiProviders>{children}</MuiProviders>
}
