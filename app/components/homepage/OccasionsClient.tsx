'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { isSanityCdnImageUrl } from '@/lib/utils/image-url'
import type { DisplayCollection } from './occasions.types'

type OccasionsClientProps = {
  collections: DisplayCollection[]
}

const sectionClassName = 'bg-base-100 px-4 py-8 tablet:px-10 tablet:py-12'
const containerClassName = 'homepage-container relative flex flex-col items-center gap-6 tablet:gap-8'
const headingClassName =
  'font-moreSugar text-[24px] uppercase tracking-[0.12em] text-primary-700 rotate-[-2.4deg] leading-[40px] text-center tablet:text-[36px] tablet:leading-[52px]'
const gridClassName =
  'grid w-full grid-cols-3 gap-4 justify-items-center max-w-[342px] tablet:gap-6 tablet:max-w-[696px] small-laptop:grid-cols-4 small-laptop:max-w-[936px]'
const cardBaseClassName = 'w-full tablet:max-w-[344px] small-laptop:max-w-none'
const cardLinkClassName =
  'flex w-full flex-col items-center gap-2 text-center tablet:gap-3 focus-visible:!outline-none'
const imageWrapperClassName =
  'relative h-[100px] w-[100px] overflow-hidden rounded-[16px] border border-primary-50 bg-base-100 tablet:h-[218px] tablet:w-[218px] tablet:shadow-sm'
const labelClassName = 'font-oldenburg text-xs text-base-content leading-[15px] tablet:text-base tablet:leading-[18px]'

const MOBILE_INITIAL_COLLECTIONS = 6
const SMALL_LAPTOP_INITIAL_COLLECTIONS = 8
const moreButtonClassName =
  'font-oldenburg cursor-pointer text-[24px] text-base-content text-center transition-colors hover:text-primary-500 focus-visible:text-primary-500'

const getVisibilityClassName = (index: number, showAll: boolean) => {
  if (showAll) {
    return 'flex'
  }

  if (index >= SMALL_LAPTOP_INITIAL_COLLECTIONS) {
    return 'hidden'
  }

  if (index >= MOBILE_INITIAL_COLLECTIONS) {
    return 'hidden small-laptop:flex'
  }

  return 'flex'
}

export function OccasionsClient({ collections }: OccasionsClientProps) {
  const [showAll, setShowAll] = useState(false)
  const sectionRef = useRef<HTMLElement | null>(null)
  const canExpand = collections.length > MOBILE_INITIAL_COLLECTIONS
  const hideButtonOnSmallLaptop = collections.length <= SMALL_LAPTOP_INITIAL_COLLECTIONS

  const handleToggle = () => {
    const wasShowingAll = showAll
    setShowAll(!showAll)

    if (!wasShowingAll) {
      return
    }

    const scrollToSection = () => {
      sectionRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
    }

    if (typeof window !== 'undefined' && 'requestAnimationFrame' in window) {
      window.requestAnimationFrame(scrollToSection)
      return
    }

    setTimeout(scrollToSection, 0)
  }

  return (
    <section ref={sectionRef} className={sectionClassName}>
      <div className={containerClassName}>
        <h2 className={headingClassName}>
          <span className='inline tablet:block'>Cakes for any</span>{' '}
          <span className='inline tablet:block'>occasion</span>
        </h2>
        <div className={gridClassName}>
          {collections.map((collection, index) => (
            <div
              key={collection._id}
              className={`${cardBaseClassName} ${getVisibilityClassName(index, showAll)}`.trim()}
            >
              <Link href={collection.href} scroll className={cardLinkClassName}>
                <div className={imageWrapperClassName}>
                  <Image
                    src={collection.imageUrl}
                    alt={collection.imageAlt}
                    fill
                    className='object-cover'
                    sizes='(min-width: 1024px) 216px, (min-width: 768px) 216px, 98px'
                    unoptimized={isSanityCdnImageUrl(collection.imageUrl)}
                  />
                </div>
                <p className={labelClassName}>
                  {collection.name}
                </p>
              </Link>
            </div>
          ))}
        </div>
        {canExpand ? (
          <button
            type='button'
            className={`${moreButtonClassName} ${hideButtonOnSmallLaptop ? 'small-laptop:hidden' : ''}`.trim()}
            onClick={handleToggle}
            aria-expanded={showAll}
          >
            {showAll ? 'Show less' : '+ many more!'}
          </button>
        ) : null}
      </div>
    </section>
  )
}
