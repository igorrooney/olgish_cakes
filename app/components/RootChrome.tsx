import type { ReactNode } from 'react'
import { DeferredNonCriticalClientFeatures } from './DeferredNonCriticalClientFeatures'
import { DeferredVercelObservability } from './DeferredVercelObservability'
import { LightweightConsentBanner } from './LightweightConsentBanner'

interface RootChromeProps {
  children: ReactNode
  isVercelDeployment: boolean
  siteFooter: ReactNode
  siteHeader: ReactNode
}

export function RootChrome({
  children,
  isVercelDeployment,
  siteFooter,
  siteHeader
}: RootChromeProps) {
  return (
    <div className='public-root-chrome flex min-h-screen flex-col'>
      <div className='public-root-consent'>
        <LightweightConsentBanner />
      </div>
      <div className='public-root-deferred-features'>
        <DeferredNonCriticalClientFeatures />
      </div>
      <div className='public-root-header'>
        {siteHeader}
      </div>
      <main className='flex-grow'>{children}</main>
      <div className='public-root-footer'>
        {siteFooter}
      </div>
      {isVercelDeployment ? <DeferredVercelObservability /> : null}
    </div>
  )
}
