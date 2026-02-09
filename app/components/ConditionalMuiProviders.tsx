'use client'

import type { ReactNode } from 'react'
import dynamic from 'next/dynamic'

const MuiProviders = dynamic(
  () => import('./MuiProviders').then((mod) => mod.MuiProviders)
)

interface ConditionalMuiProvidersProps {
  children: ReactNode
}

export function ConditionalMuiProviders({ children }: ConditionalMuiProvidersProps) {
  return <MuiProviders>{children}</MuiProviders>
}
