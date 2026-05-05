'use client'

import dynamic from 'next/dynamic'
import type { HomepageMarket } from './MarketsClient'

const MarketsClient = dynamic(
  async () => import('./MarketsClient').then(module => module.MarketsClient)
)

type DeferredMarketsClientProps = {
  upcomingMarkets: HomepageMarket[]
}

export function DeferredMarketsClient({
  upcomingMarkets
}: DeferredMarketsClientProps) {
  return <MarketsClient upcomingMarkets={upcomingMarkets} />
}
