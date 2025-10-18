'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import Script from 'next/script'
import { useEffect } from 'react'

interface GoogleAnalyticsProps {
  gaId: string
}

export function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!window.gtag) return

    // Exclude admin, API, and studio pages from tracking
    const isAdminPage = pathname.startsWith('/admin') || 
                       pathname.startsWith('/api') || 
                       pathname.startsWith('/studio')

    if (!isAdminPage) {
      const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
      
      window.gtag('config', gaId, {
        page_path: url,
        page_title: document.title,
        page_location: window.location.href,
        custom_map: {
          custom_parameter_1: 'business_type',
          custom_parameter_2: 'location'
        },
        send_page_view: true
      })
      
      window.gtag('config', gaId, {
        business_type: 'bakery',
        location: 'leeds'
      })
    }
  }, [pathname, searchParams, gaId])

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
          `
        }}
      />
    </>
  )
}

