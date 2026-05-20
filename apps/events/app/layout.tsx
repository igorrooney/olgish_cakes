import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://events.olgishcakes.co.uk'),
  title: 'Cake Slice Photo Request | Olgish Cakes Events',
  description: 'Send your image to Olgish Cakes so it can be printed on your cake slice at the event.',
  robots: {
    index: false,
    follow: false
  },
  icons: {
    icon: '/favicon-32x32.png',
    apple: '/android-chrome-512x512.png'
  }
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" data-theme="olgish">
      <body>{children}</body>
    </html>
  )
}
