'use client'

import dynamic from 'next/dynamic'
import type { MarketSchedule } from '@/app/types/marketSchedule'

const MarketsClient = dynamic(
  async () => import('./MarketsClient').then(module => module.MarketsClient)
)

type DeferredMarketsClientProps = {
  upcomingMarkets: MarketSchedule[]
}

export function DeferredMarketsClient({
  upcomingMarkets
}: DeferredMarketsClientProps) {
  return <MarketsClient upcomingMarkets={upcomingMarkets} />
}
