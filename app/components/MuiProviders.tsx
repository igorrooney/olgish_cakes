'use client'

import type { ReactNode } from 'react'
import { CssBaseline, ThemeProvider } from '@/lib/mui-optimization'
import { theme } from '@/lib/theme'
import { EmotionCacheProvider } from './EmotionCacheProvider'

interface MuiProvidersProps {
  children: ReactNode
}

export function MuiProviders({ children }: MuiProvidersProps) {
  return (
    <EmotionCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </EmotionCacheProvider>
  )
}
