'use client'

import type { ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'

const Providers = dynamic(
  () => import('../providers').then((mod) => mod.Providers)
)

interface ConditionalQueryProvidersProps {
  children: ReactNode
}

function isLightweightContentRoute(pathname: string | null) {
  return pathname === '/blog' || pathname?.startsWith('/blog/') === true
}

export function ConditionalQueryProviders({ children }: ConditionalQueryProvidersProps) {
  const pathname = usePathname()

  if (isLightweightContentRoute(pathname)) {
    return <>{children}</>
  }

  return <Providers>{children}</Providers>
}
