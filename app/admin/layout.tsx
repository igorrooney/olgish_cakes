import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Admin | Olgish Cakes',
  description: 'Admin access and management tools for Olgish Cakes.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false
    }
  }
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
