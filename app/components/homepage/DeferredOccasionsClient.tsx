'use client'

import dynamic from 'next/dynamic'
import type { DisplayCollection } from './occasions.types'

const OccasionsClient = dynamic(
  async () => import('./OccasionsClient').then(module => module.OccasionsClient)
)

type DeferredOccasionsClientProps = {
  collections: DisplayCollection[]
}

export function DeferredOccasionsClient({
  collections
}: DeferredOccasionsClientProps) {
  return <OccasionsClient collections={collections} />
}
