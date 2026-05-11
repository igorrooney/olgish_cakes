'use client'

import { Cake } from '@/types/cake'
import { getSanityCdnImageLoader, isSanityCdnImageUrl } from '@/lib/utils/image-url'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import {
    mobileCarouselItemClassName,
    mobileCarouselViewportClassName
} from './carouselLayout'

export interface CakeWithImage extends Cake {
  imageUrl: string
  mainImage?: {
    _type: string
    asset?: {
      _ref: string
      url?: string
    }
    alt?: string
    caption?: string
  }
}

export interface BestsellerCarouselCake {
  _id: string
  name?: string
  slug: {
    current: string
  }
  category?: string
  imageUrl: string
  imageAlt?: string
}

export interface BestsellersCarouselProps {
  cakes: BestsellerCarouselCake[]
}

const formatCategoryLabel = (category?: string) => {
    if (!category) {
        return 'Signature'
    }

    return category
        .split('-')
        .map((word) => (word ? `${word[0].toUpperCase()}${word.slice(1)}` : ''))
        .filter(Boolean)
        .join(' ')
}

const mobileBestsellerImageLoader = getSanityCdnImageLoader({
  width: 560,
  height: 560,
  fit: 'crop',
  quality: 56
})

export function BestsellersCarousel({ cakes }: BestsellersCarouselProps) {
    const carouselRef = useRef<HTMLDivElement>(null)
    const [currentIndex, setCurrentIndex] = useState(0)
    const hasCakes = cakes.length > 0

    const itemWidth = 342 + 8 // width (342px) + gap (8px between items)

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
        const nextIndex = currentIndex < cakes.length - 1 ? currentIndex + 1 : 0
        scrollToIndex(nextIndex)
    }

    const handlePrevious = () => {
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : cakes.length - 1
        scrollToIndex(prevIndex)
    }

    // Update current index based on scroll position
    useEffect(() => {
        const carousel = carouselRef.current
        if (!carousel || !hasCakes) return

        const handleScroll = () => {
            const scrollLeft = carousel.scrollLeft
            // Calculate which item is currently in view
            const newIndex = Math.round(scrollLeft / itemWidth)
            setCurrentIndex(Math.max(0, Math.min(newIndex, cakes.length - 1)))
        }

        carousel.addEventListener('scroll', handleScroll)
        return () => {
            carousel.removeEventListener('scroll', handleScroll)
        }
    }, [hasCakes, itemWidth, cakes.length])

    if (!hasCakes) {
        return null
    }

    return (
        <div className="homepage-container relative -mx-4">
            <div
                ref={carouselRef}
                className={`${mobileCarouselViewportClassName} gap-2`}
            >
                {cakes.map((cake, index) => {
                    const categoryLabel = formatCategoryLabel(cake.category)
                    const safeCakeName = cake.name?.trim() || 'Olgish Cakes'
                    const imageAlt = cake.imageAlt?.trim() || `${safeCakeName} ${categoryLabel} cake by Olgish Cakes`
                    const isFirst = index === 0
                    const imageLoader = isSanityCdnImageUrl(cake.imageUrl) ? mobileBestsellerImageLoader : undefined

                    return (
                        <div
                            key={cake._id}
                            className={`${mobileCarouselItemClassName} rounded-[16px] border border-primary-50 overflow-hidden ${isFirst ? 'shadow-xl' : 'shadow-md'}`}
                            style={{
                                width: '342px',
                                height: '342px',
                                minWidth: '342px',
                                maxWidth: '342px'
                            }}
                        >
                            <Link href={`/cakes/${cake.slug.current}`} prefetch={false} className="block w-full h-full relative">
                                <Image
                                    src={cake.imageUrl}
                                    alt={imageAlt}
                                    fill
                                    className="object-cover rounded-[16px]"
                                    sizes="342px"
                                    loading="lazy"
                                    fetchPriority="low"
                                    loader={imageLoader}
                                />

                                <div
                                    className="absolute right-3 top-3 z-10 h-[73px] w-[73px]"
                                    style={{ transform: 'rotate(25.85deg)' }}
                                >
                                    <Image
                                        src="/design/mobile-home/bestseller-sticker.png"
                                        alt="Handcrafted cakes"
                                        fill
                                        className="object-contain"
                                        sizes="73px"
                                        loading="lazy"
                                        fetchPriority="low"
                                        quality={45}
                                    />
                                </div>

                            </Link>
                        </div>
                    )
                })}
            </div>
            {cakes.length > 1 && (
                <>
                    {currentIndex > 0 && (
                        <button
                            onClick={handlePrevious}
                            className="absolute rounded-full text-primary-500 z-50 flex items-center justify-center shadow-md pointer-events-auto transition-all hover:opacity-100"
                            aria-label="Previous cake"
                            type="button"
                            style={{
                                width: '44px',
                                height: '44px',
                                minWidth: '44px',
                                minHeight: '44px',
                                left: '5px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                fill: 'rgba(255, 255, 255, 0.80)',
                                backgroundColor: 'rgba(255, 255, 255, 0.80)',
                                borderWidth: '1px',
                                borderStyle: 'solid',
                                borderColor: '#2E3192',
                                opacity: 0.8
                            }}
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
                                    stroke="#2E3192"
                                    strokeWidth="1"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>
                    )}
                    {currentIndex < cakes.length - 1 && (
                        <button
                            onClick={handleNext}
                            className="absolute rounded-full text-primary-500 z-50 flex items-center justify-center shadow-md pointer-events-auto transition-all hover:opacity-100"
                            aria-label="Next cake"
                            type="button"
                            style={{
                                width: '44px',
                                height: '44px',
                                minWidth: '44px',
                                minHeight: '44px',
                                right: '0px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                fill: 'rgba(255, 255, 255, 0.80)',
                                backgroundColor: 'rgba(255, 255, 255, 0.80)',
                                borderWidth: '1px',
                                borderStyle: 'solid',
                                borderColor: '#2E3192',
                                opacity: 0.8
                            }}
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
                                    stroke="#2E3192"
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
