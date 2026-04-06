'use client'

import dynamic from 'next/dynamic'
import type { CakeWithImage } from './BestsellersCarousel'

const BestsellersCarousel = dynamic(
  async () => import('./BestsellersCarousel').then(module => module.BestsellersCarousel)
)

type DeferredBestsellersCarouselProps = {
  cakes: CakeWithImage[]
}

export function DeferredBestsellersCarousel({
  cakes
}: DeferredBestsellersCarouselProps) {
  return <BestsellersCarousel cakes={cakes} />
}
