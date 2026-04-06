'use client'

import dynamic from 'next/dynamic'
import type { InstagramPost } from '@/app/types/instagram'

const InstagramCarousel = dynamic(
  async () => import('./InstagramCarousel').then(module => module.InstagramCarousel)
)

type DeferredInstagramCarouselProps = {
  posts: InstagramPost[]
  profileUrl: string
  profileName: string
  profileHandle: string
}

export function DeferredInstagramCarousel({
  posts,
  profileUrl,
  profileName,
  profileHandle
}: DeferredInstagramCarouselProps) {
  return (
    <InstagramCarousel
      posts={posts}
      profileUrl={profileUrl}
      profileName={profileName}
      profileHandle={profileHandle}
    />
  )
}
