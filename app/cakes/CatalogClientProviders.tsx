'use client'

import type { ReactNode } from 'react'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Providers } from '../providers'

interface CatalogClientProvidersProps {
  children: ReactNode
}

export function CatalogClientProviders({ children }: CatalogClientProvidersProps) {
  return (
    <NuqsAdapter>
      <Providers>{children}</Providers>
    </NuqsAdapter>
  )
}
