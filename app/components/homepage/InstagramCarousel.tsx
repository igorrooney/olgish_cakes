'use client'

import Image from 'next/image'
import { useEffect, useId, useRef, useState } from 'react'
import type { InstagramPost } from '@/app/types/instagram'
import { CarouselNavButton } from './CarouselNavButton'

interface InstagramCarouselProps {
  posts: InstagramPost[]
  profileUrl: string
  profileName: string
  profileHandle: string
  profileImageSrc?: string
}

const defaultProfileImage = '/design/mobile-home/instagram-avatar.png'

const sanitizeCaptionText = (caption?: string | null) => {
  if (!caption) return null

  const withoutUrls = caption.replace(/https?:\/\/\S+/gi, '')
  const withoutTags = withoutUrls.replace(/[#@][\w-]+/g, '')
  const collapsed = withoutTags.replace(/\s+/g, ' ').trim()

  return collapsed.length > 0 ? collapsed : null
}

const getPostAlt = (post: InstagramPost) => {
  const sanitizedCaption = sanitizeCaptionText(post.caption)
  const firstLine = post.caption?.split(/\r?\n/)[0]
  const sanitizedFirstLine = sanitizeCaptionText(firstLine)
  const altText = sanitizedFirstLine || sanitizedCaption

  if (!altText) {
    return 'Olgish Cakes Instagram post'
  }

  if (altText.length <= 120) {
    return altText
  }

  return `${altText.slice(0, 117)}...`
}

const getPostCaptionLine = (post: InstagramPost) => {
  const trimmedCaption = post.caption?.trim()
  if (!trimmedCaption) {
    return null
  }

  const firstLine = trimmedCaption.split(/\r?\n/)[0]?.trim()
  return sanitizeCaptionText(firstLine)
}

export function InstagramCarousel({
  posts,
  profileUrl,
  profileName,
  profileHandle,
  profileImageSrc = defaultProfileImage
}: InstagramCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const firstCardRef = useRef<HTMLDivElement>(null)
  const lastCardRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAtStart, setIsAtStart] = useState(true)
  const [isAtEnd, setIsAtEnd] = useState(false)
  const [canScroll, setCanScroll] = useState(false)
  const hasPosts = posts.length > 0
  const carouselId = useId().replace(/:/g, '')

  const itemWidth = 342 + 24

  const getVisibilityState = () => {
    const carousel = carouselRef.current
    const firstCard = firstCardRef.current
    const lastCard = lastCardRef.current
    if (!carousel || !firstCard || !lastCard) return null

    const carouselRect = carousel.getBoundingClientRect()
    const firstRect = firstCard.getBoundingClientRect()
    const lastRect = lastCard.getBoundingClientRect()
    const atStart = firstRect.left >= carouselRect.left - 1
    const atEnd = lastRect.right <= carouselRect.right + 1

    return {
      atStart,
      atEnd,
      allVisible: atStart && atEnd
    }
  }

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
    if (currentIndex >= posts.length - 1 || isAtEnd) return
    scrollToIndex(currentIndex + 1)
  }

  const handlePrevious = () => {
    if (currentIndex <= 0 || isAtStart) return
    scrollToIndex(currentIndex - 1)
  }

  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel || !hasPosts) return

    const handleScroll = () => {
      const scrollLeft = carousel.scrollLeft
      const newIndex = Math.round(scrollLeft / itemWidth)
      setCurrentIndex(Math.max(0, Math.min(newIndex, posts.length - 1)))
      const visibility = getVisibilityState()
      if (visibility) {
        setIsAtStart(visibility.atStart)
        setIsAtEnd(visibility.atEnd)
        setCanScroll(!visibility.allVisible)
      }
    }

    carousel.addEventListener('scroll', handleScroll)
    return () => {
      carousel.removeEventListener('scroll', handleScroll)
    }
  }, [hasPosts, itemWidth, posts.length])

  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel || !hasPosts) return

    const updateCanScroll = () => {
      const visibility = getVisibilityState()
      if (!visibility) return

      setIsAtStart(visibility.atStart)
      setIsAtEnd(visibility.atEnd)
      setCanScroll(!visibility.allVisible)

      if (visibility.allVisible) {
        if (carousel.scrollLeft !== 0) {
          carousel.scrollTo({ left: 0 })
        }
        setCurrentIndex(0)
      }
    }

    const rafId = window.requestAnimationFrame(updateCanScroll)

    if (typeof ResizeObserver === 'undefined') {
      const handleResize = () => {
        updateCanScroll()
      }
      window.addEventListener('resize', handleResize)
      return () => {
        window.removeEventListener('resize', handleResize)
        window.cancelAnimationFrame(rafId)
      }
    }

    const observer = new ResizeObserver(() => {
      updateCanScroll()
    })

    observer.observe(carousel)
    return () => {
      observer.disconnect()
      window.cancelAnimationFrame(rafId)
    }
  }, [hasPosts, posts.length])

  if (!hasPosts) {
    return null
  }

  return (
    <div className="homepage-container relative -mx-4">
      <div
        ref={carouselRef}
        id={carouselId}
        className="carousel carousel-center w-full overflow-x-auto [scroll-snap-type:x_mandatory] ml-[15px]"
      >
        {posts.map((post, index) => {
          const imageAlt = getPostAlt(post)
          const postCaption = getPostCaptionLine(post)

          return (
            <div
              key={post.id}
              className="carousel-item relative flex-shrink-0"
              ref={index === 0 ? firstCardRef : index === posts.length - 1 ? lastCardRef : undefined}
              style={{
                width: '342px',
                minWidth: '342px',
                maxWidth: '342px',
                scrollSnapAlign: 'start',
                marginLeft: index === 0 ? '24px' : '24px',
                marginRight: index === posts.length - 1 ? '24px' : '0'
              }}
            >
              <div className="flex h-full w-full flex-col rounded-[16px] border border-base-300 bg-[var(--color-instagram-card)] p-4 shadow-sm">
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
                    className="btn btn-xs rounded-full normal-case btn-instagram tablet:text-[12px]"
                  >
                    View Profile
                  </a>
                </div>

                <a
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative mt-3 block h-[342px] w-full overflow-hidden rounded-[12px] bg-base-200"
                >
                  <Image
                    src={post.imageUrl}
                    alt={imageAlt}
                    fill
                    className="object-cover"
                    sizes="342px"
                  />
                </a>

                {postCaption && (
                  <p className="mt-3 font-sans text-xs text-base-content">
                    {postCaption}
                  </p>
                )}

                <div className="mt-auto pt-2">
                  <a
                    href={profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-sans text-xs font-semibold text-[var(--color-instagram)]"
                  >
                    View More on Instagram
                  </a>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {posts.length > 1 && canScroll && (
        <>
          {!isAtStart && (
            <button
              onClick={handlePrevious}
              className="absolute rounded-full text-primary-500 z-50 flex items-center justify-center shadow-md pointer-events-auto transition-all hover:opacity-100 tablet:hidden w-8 h-8 min-w-8 min-h-8 left-[5px] top-1/2 -translate-y-1/2 border border-primary-500 bg-base-100/80"
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
          {!isAtEnd && (
            <button
              onClick={handleNext}
              className="absolute rounded-full text-primary-500 z-50 flex items-center justify-center shadow-md pointer-events-auto transition-all hover:opacity-100 tablet:hidden w-8 h-8 min-w-8 min-h-8 right-0 top-1/2 -translate-y-1/2 border border-primary-500 bg-base-100/80"
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
          <div className="hidden tablet:flex justify-center gap-3 mt-5">
            <CarouselNavButton
              ariaControls={carouselId}
              ariaLabel="Previous post"
              direction="previous"
              disabled={isAtStart}
              onClick={handlePrevious}
            />
            <CarouselNavButton
              ariaControls={carouselId}
              ariaLabel="Next post"
              direction="next"
              disabled={isAtEnd}
              onClick={handleNext}
            />
          </div>
        </>
      )}
    </div>
  )
}
