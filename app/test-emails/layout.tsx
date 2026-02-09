import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Email Testing | Olgish Cakes',
  description: 'Internal email testing tools for Olgish Cakes.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false
    }
  }
}

export default function TestEmailsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
