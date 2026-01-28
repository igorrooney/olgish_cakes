'use client'

import { Cake } from '@/types/cake'
import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

interface CakeWithImage extends Cake {
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

interface BestsellersCarouselProps {
    cakes: CakeWithImage[]
}

export function BestsellersCarousel({ cakes }: BestsellersCarouselProps) {
    const carouselRef = useRef<HTMLDivElement>(null)
    const [currentIndex, setCurrentIndex] = useState(0)
    const hasCakes = cakes.length > 0

    const itemWidth = 342 + 8 // width (342px) + gap (8px between items)
    const firstItemOffset = 24 // First item starts 24px from left

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
                className="carousel carousel-center w-full overflow-x-auto [scroll-snap-type:x_mandatory]"
            >
                {cakes.map((cake, index) => {
                    const imageAlt = cake.mainImage?.alt || `${cake.name} - ${cake.category} honey cake by Olgish Cakes`
                    const isFirst = index === 0

                    return (
                        <div
                            key={cake._id}
                            className={`carousel-item relative flex-shrink-0 rounded-[16px] border border-primary-50 overflow-hidden ${isFirst ? 'shadow-xl' : 'shadow-md'}`}
                            style={{
                                width: '342px',
                                height: '342px',
                                minWidth: '342px',
                                maxWidth: '342px',
                                scrollSnapAlign: 'start',
                                marginLeft: index === 0 ? '24px' : '8px',
                                marginRight: index === cakes.length - 1 ? '24px' : '0'
                            }}
                        >
                            <Link href={`/cakes/${cake.slug.current}`} className="block w-full h-full relative">
                                <Image
                                    src={cake.imageUrl}
                                    alt={imageAlt}
                                    fill
                                    className="object-cover rounded-[16px]"
                                    priority={isFirst}
                                    sizes="342px"
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
                                        priority
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
                                width: '32px',
                                height: '32px',
                                minWidth: '32px',
                                minHeight: '32px',
                                left: '-10px',
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
                                width: '32px',
                                height: '32px',
                                minWidth: '32px',
                                minHeight: '32px',
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
