'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { DisplayCollection } from './occasions.types'

type OccasionsClientProps = {
  collections: DisplayCollection[]
}

const TABLET_INITIAL_COLLECTIONS = 6
const SMALL_LAPTOP_INITIAL_COLLECTIONS = 8

const sectionClassName = 'bg-base-100 px-4 py-8 tablet:px-10 tablet:py-12'
const containerClassName = 'homepage-container relative flex flex-col items-center gap-6 tablet:gap-8'
const headingClassName =
  'font-moreSugar text-[24px] uppercase tracking-[0.12em] text-primary-700 rotate-[-2.4deg] leading-[40px] text-center tablet:text-[36px] tablet:leading-[52px]'
const gridClassName =
  'grid w-full grid-cols-3 gap-4 justify-items-center max-w-[342px] tablet:gap-6 tablet:max-w-[696px] small-laptop:grid-cols-4 small-laptop:max-w-[936px]'
const cardBaseClassName =
  'w-full flex-col items-center gap-2 text-center tablet:gap-3 tablet:max-w-[344px] small-laptop:max-w-none'
const imageWrapperClassName =
  'relative h-[100px] w-[100px] overflow-hidden rounded-[16px] border border-primary-50 bg-base-100 tablet:h-[218px] tablet:w-[218px] tablet:shadow-sm'
const labelClassName = 'font-oldenburg text-xs text-base-content leading-[15px] tablet:text-base tablet:leading-[18px]'
const moreButtonClassName =
  'font-oldenburg text-[24px] text-base-content text-center transition-colors hover:text-primary-500 focus-visible:text-primary-500'

const getVisibilityClassName = (index: number, showAll: boolean) => {
  if (showAll) {
    return 'flex'
  }

  if (index >= SMALL_LAPTOP_INITIAL_COLLECTIONS) {
    return 'hidden'
  }

  if (index >= TABLET_INITIAL_COLLECTIONS) {
    return 'hidden small-laptop:flex'
  }

  return 'flex'
}

export function OccasionsClient({ collections }: OccasionsClientProps) {
  const [showAll, setShowAll] = useState(false)
  const canExpand = collections.length > TABLET_INITIAL_COLLECTIONS
  const hideButtonOnLarge = collections.length <= SMALL_LAPTOP_INITIAL_COLLECTIONS

  return (
    <section className={sectionClassName}>
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
              <div className={imageWrapperClassName}>
                <Image
                  src={collection.imageUrl}
                  alt={collection.imageAlt}
                  fill
                  className='object-cover'
                  sizes='(min-width: 1024px) 216px, (min-width: 768px) 216px, 98px'
                />
              </div>
              <p className={labelClassName}>
                {collection.name}
              </p>
            </div>
          ))}
        </div>
        {canExpand ? (
          <button
            type='button'
            className={`${moreButtonClassName} ${hideButtonOnLarge ? 'small-laptop:hidden' : ''}`.trim()}
            onClick={() => setShowAll((prev) => !prev)}
            aria-expanded={showAll}
          >
            {showAll ? 'Show less' : '+ many more!'}
          </button>
        ) : null}
      </div>
    </section>
  )
}
