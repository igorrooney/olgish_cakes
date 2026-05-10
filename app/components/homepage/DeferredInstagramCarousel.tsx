'use client'

import dynamic from 'next/dynamic'
import type { InstagramCarouselPost } from './instagramCarouselContent'

const InstagramCarousel = dynamic(
  async () => import('./InstagramCarousel').then(module => module.InstagramCarousel)
)

type DeferredInstagramCarouselProps = {
  posts: InstagramCarouselPost[]
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
