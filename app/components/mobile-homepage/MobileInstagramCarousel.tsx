'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import type { InstagramPost } from '@/app/types/instagram'

interface MobileInstagramCarouselProps {
  posts: InstagramPost[]
  profileUrl: string
  profileName: string
  profileHandle: string
  profileImageSrc?: string
}

const defaultProfileImage = '/design/mobile-home/instagram-avatar.png'

const formatLikeCount = (likeCount?: number) => {
  if (!likeCount || likeCount <= 0) {
    return null
  }

  return `${new Intl.NumberFormat('en-GB').format(likeCount)} likes`
}

const getPostAlt = (post: InstagramPost) => {
  const trimmedCaption = post.caption?.trim()
  if (!trimmedCaption) {
    return 'Olgish Cakes Instagram post'
  }

  if (trimmedCaption.length <= 120) {
    return trimmedCaption
  }

  return `${trimmedCaption.slice(0, 117)}...`
}

export function MobileInstagramCarousel({
  posts,
  profileUrl,
  profileName,
  profileHandle,
  profileImageSrc = defaultProfileImage
}: MobileInstagramCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const hasPosts = posts.length > 0

  const itemWidth = 342 + 8

  const scrollToIndex = (index: number) => {
    if (!carouselRef.current) return
    const scrollPosition = index * itemWidth
    carouselRef.current.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    })
    setCurrentIndex(index)
  }

  const handleNext = () => {
    const nextIndex = currentIndex < posts.length - 1 ? currentIndex + 1 : 0
    scrollToIndex(nextIndex)
  }

  const handlePrevious = () => {
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : posts.length - 1
    scrollToIndex(prevIndex)
  }

  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel || !hasPosts) return

    const handleScroll = () => {
      const scrollLeft = carousel.scrollLeft
      const newIndex = Math.round(scrollLeft / itemWidth)
      setCurrentIndex(Math.max(0, Math.min(newIndex, posts.length - 1)))
    }

    carousel.addEventListener('scroll', handleScroll)
    return () => {
      carousel.removeEventListener('scroll', handleScroll)
    }
  }, [hasPosts, itemWidth, posts.length])

  if (!hasPosts) {
    return null
  }

  return (
    <div className="relative w-full -mx-4 max-w-[390px] mx-auto">
      <div
        ref={carouselRef}
        className="carousel carousel-center w-full overflow-x-auto [scroll-snap-type:x_mandatory]"
      >
        {posts.map((post, index) => {
          const imageAlt = getPostAlt(post)
          const likeLabel = formatLikeCount(post.likeCount)

          return (
            <div
              key={post.id}
              className="carousel-item relative flex-shrink-0"
              style={{
                width: '342px',
                minWidth: '342px',
                maxWidth: '342px',
                scrollSnapAlign: 'start',
                marginLeft: index === 0 ? '24px' : '8px',
                marginRight: index === posts.length - 1 ? '24px' : '0'
              }}
            >
              <div className="w-full rounded-[16px] border border-base-300 bg-base-100 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative h-[30px] w-[30px]">
                      <Image
                        src={profileImageSrc}
                        alt={`${profileName} Instagram avatar`}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col leading-none">
                      <span className="font-sans text-xs text-base-content">
                        {profileName}
                      </span>
                      <span className="font-sans text-xs text-base-content/60">
                        {profileHandle}
                      </span>
                    </div>
                  </div>
                  <a
                    href={profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-xs rounded-full normal-case"
                  >
                    View Profile
                  </a>
                </div>

                <a
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative mt-3 block h-[180px] w-full overflow-hidden rounded-[12px] bg-base-200"
                >
                  <Image
                    src={post.imageUrl}
                    alt={imageAlt}
                    fill
                    className="object-cover"
                    priority={index === 0}
                    sizes="342px"
                  />
                </a>

                <div className="mt-3 flex items-center gap-3">
                  <div className="relative h-6 w-6">
                    <Image
                      src="/design/mobile-home/icon-like.png"
                      alt="Like"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="relative h-6 w-6">
                    <Image
                      src="/design/mobile-home/icon-comment.png"
                      alt="Comment"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="relative h-6 w-6">
                    <Image
                      src="/design/mobile-home/icon-share.png"
                      alt="Share"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <div className="relative h-6 w-6">
                      <Image
                        src="/design/mobile-home/icon-save.png"
                        alt="Save"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="relative h-6 w-6">
                      <Image
                        src="/design/mobile-home/icon-ig-mark.png"
                        alt="Instagram mark"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex flex-col gap-1">
                  {likeLabel && (
                    <p className="font-sans text-xs text-base-content">
                      {likeLabel}
                    </p>
                  )}
                  <a
                    href={post.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-sans text-xs font-semibold text-primary-500"
                  >
                    View More on Instagram
                  </a>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {posts.length > 1 && (
        <>
          {currentIndex > 0 && (
            <button
              onClick={handlePrevious}
              className="absolute left-[-10px] top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-primary-500 bg-base-100 text-primary-500 opacity-80 shadow-md pointer-events-auto transition-all hover:opacity-100"
              aria-label="Previous post"
              type="button"
            >
              <svg
                width="10"
                height="6"
                viewBox="0 0 10 6"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ transform: 'rotate(90deg)' }}
              >
                <path
                  d="M1 1L5 5L9 1"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
          {currentIndex < posts.length - 1 && (
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-primary-500 bg-base-100 text-primary-500 opacity-80 shadow-md pointer-events-auto transition-all hover:opacity-100"
              aria-label="Next post"
              type="button"
            >
              <svg
                width="10"
                height="6"
                viewBox="0 0 10 6"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ transform: 'rotate(-90deg)' }}
              >
                <path
                  d="M1 1L5 5L9 1"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </>
      )}
    </div>
  )
}
