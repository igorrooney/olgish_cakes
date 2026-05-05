'use client'

import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

interface CatalogClientProvidersProps {
  children: ReactNode
}

export function CatalogClientProviders({ children }: CatalogClientProvidersProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: false
      }
    }
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        {children}
      </NuqsAdapter>
    </QueryClientProvider>
  )
}
