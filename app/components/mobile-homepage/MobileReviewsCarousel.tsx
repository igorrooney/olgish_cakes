'use client'

import { useEffect, useRef, useState } from 'react'
import { Testimonial } from '@/app/types/testimonial'

interface ReviewProps {
    testimonials: Testimonial[]
}

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
}

function StarRating() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="107" height="20" viewBox="0 0 107 20" fill="none">
            <g clipPath="url(#clip0_2136_116)">
                <path d="M20 0H0V20H20V0Z" fill="#219653" />
                <path d="M41.6667 0H21.6667V20H41.6667V0Z" fill="#219653" />
                <path d="M63.3333 0H43.3333V20H63.3333V0Z" fill="#219653" />
                <path d="M85 0H65V20H85V0Z" fill="#219653" />
                <path d="M106.667 0H86.6667V20H106.667V0Z" fill="#219653" />
                <path d="M9.99973 13.4792L13.0414 12.7083L14.3122 16.625L9.99973 13.4792ZM16.9997 8.41667H11.6456L9.99973 3.375L8.35389 8.41667H2.99973L7.33306 11.5417L5.68723 16.5833L10.0206 13.4583L12.6872 11.5417L16.9997 8.41667Z" fill="white" />
                <path d="M31.6664 13.4792L34.7081 12.7083L35.9789 16.625L31.6664 13.4792ZM38.6664 8.41667H33.3122L31.6664 3.375L30.0206 8.41667H24.6664L28.9997 11.5417L27.3539 16.5833L31.6872 13.4583L34.3539 11.5417L38.6664 8.41667Z" fill="white" />
                <path d="M53.3331 13.4792L56.3747 12.7083L57.6456 16.625L53.3331 13.4792ZM60.3331 8.41667H54.9789L53.3331 3.375L51.6872 8.41667H46.3331L50.6664 11.5417L49.0206 16.5833L53.3539 13.4583L56.0206 11.5417L60.3331 8.41667Z" fill="white" />
                <path d="M74.9997 13.4792L78.0414 12.7083L79.3122 16.625L74.9997 13.4792ZM81.9997 8.41667H76.6456L74.9997 3.375L73.3539 8.41667H67.9997L72.3331 11.5417L70.6872 16.5833L75.0206 13.4583L77.6872 11.5417L81.9997 8.41667Z" fill="white" />
                <path d="M96.6664 13.4792L99.7081 12.7083L100.979 16.625L96.6664 13.4792ZM103.666 8.41667H98.3122L96.6664 3.375L95.0206 8.41667H89.6664L93.9997 11.5417L92.3539 16.5833L96.6872 13.4583L99.3539 11.5417L103.666 8.41667Z" fill="white" />
            </g>
            <defs>
                <clipPath id="clip0_2136_116">
                    <rect width="106.667" height="20" fill="white" />
                </clipPath>
            </defs>
        </svg>
    )
}

function getReviewTitle(text: string): string {
    const firstSentence = text.split('.')[0]
    if (firstSentence.length > 40) {
        return firstSentence.substring(0, 40) + '...'
    }
    return firstSentence
}

export function MobileReviewsCarousel({ testimonials }: ReviewProps) {
    const carouselRef = useRef<HTMLDivElement>(null)
    const [currentIndex, setCurrentIndex] = useState(0)

    const itemWidth = 342 + 20 // card width (342px) + gap (20px between items)
    const firstItemOffset = 16 // First item starts 16px from left

    const scrollToIndex = (index: number) => {
        if (!carouselRef.current) return
        // Item positions: index 0 at 0, index 1 at 378px (16+342+20), index 2 at 740px, etc.
        const scrollPosition = index === 0 ? 0 : firstItemOffset + index * itemWidth
        carouselRef.current.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
        })
        setCurrentIndex(index)
    }

    const handleNext = () => {
        if (currentIndex >= testimonials.length - 1) return
        const nextIndex = currentIndex + 1
        scrollToIndex(nextIndex)
    }

    const handlePrevious = () => {
        if (currentIndex <= 0) return
        const prevIndex = currentIndex - 1
        scrollToIndex(prevIndex)
    }

    const isFirstReview = currentIndex === 0
    const isLastReview = currentIndex === testimonials.length - 1

    useEffect(() => {
        const carousel = carouselRef.current
        if (!carousel) return

        // Pre-calculate expected scroll positions for each item
        const expectedPositions = testimonials.map((_, idx) =>
            idx === 0 ? 0 : firstItemOffset + idx * itemWidth
        )

        const handleScroll = () => {
            const scrollLeft = carousel.scrollLeft
            // Find which item we're closest to based on expected scroll positions
            let closestIndex = 0
            let minDistance = Math.abs(scrollLeft - expectedPositions[0])
            for (let i = 1; i < expectedPositions.length; i++) {
                const distance = Math.abs(scrollLeft - expectedPositions[i])
                if (distance < minDistance) {
                    minDistance = distance
                    closestIndex = i
                }
            }
            setCurrentIndex(closestIndex)
        }

        carousel.addEventListener('scroll', handleScroll)
        return () => {
            carousel.removeEventListener('scroll', handleScroll)
        }
    }, [itemWidth, firstItemOffset, testimonials])

    if (testimonials.length === 0) {
        return null
    }

    return (
        <section className="bg-base-100 px-4 py-8">
            <div className="homepage-container flex flex-col gap-6">
                <h2 className="font-moreSugar text-[24px] uppercase tracking-[0.12em] text-primary-700 rotate-[-2.4deg] leading-[40px] text-center">
                    Our reviews
                </h2>

                <div className="homepage-container relative -mx-4">
                    <div
                        ref={carouselRef}
                        className="carousel carousel-center w-full overflow-x-auto [scroll-snap-type:x_mandatory]"
                    >
                        {testimonials.map((testimonial, index) => {
                            const reviewTitle = getReviewTitle(testimonial.text)
                            const formattedDate = formatTimeAgo(testimonial.date)
                            const displayName = testimonial.customerName || 'Anonymous'

                            return (
                                <div
                                    key={testimonial._id}
                                    className="carousel-item flex-shrink-0"
                                    style={{
                                        width: '342px',
                                        minWidth: '342px',
                                        maxWidth: '342px',
                                        scrollSnapAlign: 'start',
                                        marginLeft: index === 0 ? '16px' : '20px',
                                        marginRight: index === testimonials.length - 1 ? '16px' : '0'
                                    }}
                                >
                                    <div className="w-full rounded-[16px] border border-[rgba(0,0,0,0.2)] bg-amber-50 p-5 shadow-[0px_2px_4px_rgba(7,4,146,0.1),0px_24px_60px_rgba(6,47,125,0.05),0px_12px_24px_rgba(27,59,119,0.05)]">
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <StarRating />
                                                </div>
                                                <span className="font-sans text-xs text-base-content">
                                                    {formattedDate}
                                                </span>
                                            </div>
                                            <h3 className="font-sans text-lg font-medium text-black">
                                                {reviewTitle}
                                            </h3>
                                            <p className="font-sans text-sm text-black leading-[22px]">
                                                {testimonial.text}
                                            </p>
                                            <div className="h-px w-[60px] bg-base-300" />
                                            <p className="font-sans text-sm font-bold text-base-content">
                                                {displayName}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {testimonials.length > 1 && (
                        <div className="flex justify-center gap-3 mt-5">
                            <button
                                onClick={handlePrevious}
                                disabled={isFirstReview}
                                className={`flex h-8 w-8 items-center justify-center ${isFirstReview ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                                aria-label="Previous review"
                                type="button"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                                    <circle cx="16" cy="16" r="15.5" stroke={isFirstReview ? '#9CA3AF' : '#2E3192'} />
                                    <g transform="translate(16, 16) scale(-1, 1) translate(-10, -10)">
                                        <path
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                            d="M7.20938 14.7698C6.92228 14.4713 6.93159 13.9965 7.23017 13.7094L11.1679 10L7.23017 6.29062C6.93159 6.00353 6.92228 5.52875 7.20938 5.23017C7.49647 4.93159 7.97125 4.92228 8.26983 5.20937L12.7698 9.45937C12.9169 9.60078 13 9.79599 13 10C13 10.204 12.9169 10.3992 12.7698 10.5406L8.26983 14.7906C7.97125 15.0777 7.49647 15.0684 7.20938 14.7698Z"
                                            fill={isFirstReview ? '#9CA3AF' : '#2E3192'}
                                        />
                                    </g>
                                </svg>
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={isLastReview}
                                className={`flex h-8 w-8 items-center justify-center ${isLastReview ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                                aria-label="Next review"
                                type="button"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                                    <circle cx="16" cy="16" r="15.5" stroke={isLastReview ? '#9CA3AF' : '#2E3192'} />
                                    <g transform="translate(6, 6)">
                                        <path
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                            d="M7.20938 14.7698C6.92228 14.4713 6.93159 13.9965 7.23017 13.7094L11.1679 10L7.23017 6.29062C6.93159 6.00353 6.92228 5.52875 7.20938 5.23017C7.49647 4.93159 7.97125 4.92228 8.26983 5.20937L12.7698 9.45937C12.9169 9.60078 13 9.79599 13 10C13 10.204 12.9169 10.3992 12.7698 10.5406L8.26983 14.7906C7.97125 15.0777 7.49647 15.0684 7.20938 14.7698Z"
                                            fill={isLastReview ? '#9CA3AF' : '#2E3192'}
                                        />
                                    </g>
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
