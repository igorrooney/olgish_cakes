'use client'

import dynamic from 'next/dynamic'
import type { BestsellerCarouselCake } from './BestsellersCarousel'

const BestsellersCarousel = dynamic(
  async () => import('./BestsellersCarousel').then(module => module.BestsellersCarousel)
)

type DeferredBestsellersCarouselProps = {
  cakes: BestsellerCarouselCake[]
}

export function DeferredBestsellersCarousel({
  cakes
}: DeferredBestsellersCarouselProps) {
  return <BestsellersCarousel cakes={cakes} />
}
