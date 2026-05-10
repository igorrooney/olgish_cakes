import type { InstantConfigForTypeCheckInternal } from 'next/dist/build/segment-config/app/app-segment-config.js'

declare module 'next/dist/build/segment-config/app/app-segment-config.js' {
  export type PrefetchForTypeCheckInternal = InstantConfigForTypeCheckInternal
}

export {}
