import { getAllCakes } from '@/app/utils/fetchCakes'
import { urlFor } from '@/sanity/lib/image'
import { blocksToText, Cake } from '@/types/cake'
import Image from 'next/image'
import Link from 'next/link'
import { BestsellersCarousel } from './BestsellersCarousel'

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

export async function Bestsellers() {
  const cakes = await getAllCakes()

  // Get main image for each cake
  const cakesWithImages = cakes
    .map((cake: Cake) => {
      // First try to use the dedicated mainImage field
      let mainImage = cake.mainImage

      // Fallback to designs.standard array
      if (!mainImage?.asset?._ref) {
        mainImage =
          cake.designs?.standard?.find((img) => img.isMain && img.asset?._ref) ||
          cake.designs?.standard?.find((img) => img.asset?._ref) ||
          cake.designs?.standard?.[0]
      }

      // Generate image URL
      const imageUrl = mainImage?.asset?._ref
        ? urlFor(mainImage).width(800).height(800).url()
        : null

      if (!imageUrl) {
        return null
      }

      return {
        ...cake,
        imageUrl,
        mainImage
      }
    })
    .filter((cake): cake is NonNullable<typeof cake> => cake !== null) // Only include cakes with images
  const flaggedBestsellers = cakesWithImages.filter((cake) => cake.isBestseller).slice(0, 3)
  const displayCakes = flaggedBestsellers.length > 0 ? flaggedBestsellers : cakesWithImages.slice(0, 3)
  const tabletLinkClassName = 'flex items-center gap-2 font-oldenburg text-base text-base-content transition-colors hover:text-primary-500 tablet:text-[20px]'
  const tabletArrowClassName = 'font-oldenburg text-primary-500 text-lg mt-1'
  const tabletTextClassName = 'flex flex-col items-center text-center gap-3 tablet:max-w-[450px]'
  const imageClassName =
    'relative w-full max-w-[342px] overflow-hidden rounded-[16px] border border-primary-50 bg-base-100 aspect-square shadow-bestseller border-none large-laptop:max-w-[378px]'

  return (
    <section id="bestsellers" className="relative bg-accent-50 px-4 py-8 mt-8 pb-7 mb-7 tablet:py-18 tablet:pb-18">
      {/* <div className="absolute left-0 right-0 top-[-30px]">
        <svg xmlns="http://www.w3.org/2000/svg" width="390" height="78" viewBox="0 0 390 78" fill="none">
          <path d="M0 0.00771332V32.5405C0.37791 32.5322 0.757092 32.5281 1.1375 32.5281C28.2284 32.5281 49.075 53.4907 49.075 78H81.575C81.575 53.4907 102.422 32.5281 129.512 32.5281C156.603 32.5281 177.45 53.4907 177.45 78H209.95C209.95 53.4907 230.797 32.5281 257.887 32.5281C284.978 32.5281 305.825 53.4907 305.825 78H338.325C338.325 53.4907 359.172 32.5281 386.262 32.5281C387.522 32.5281 388.769 32.5734 390 32.6623V0.0834961C388.76 0.0280228 387.514 0 386.262 0C360.303 0 336.865 12.0499 322.075 30.9579C307.285 12.0499 283.847 0 257.887 0C231.928 0 208.49 12.0499 193.7 30.9579C178.91 12.0499 155.472 0 129.512 0C103.553 0 80.1149 12.0499 65.325 30.9579C50.5351 12.0499 27.0968 0 1.1375 0C0.757791 0 0.378616 0.00257874 0 0.00771332Z" fill="#FFEBE5" />
        </svg>
      </div> */}
      <div
        className="absolute left-0 right-0 top-[-30px] h-[78px] overflow-hidden"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='390' height='78' viewBox='0 0 390 78' fill='none'%3E%3Cpath d='M0 0.00771332V32.5405C0.37791 32.5322 0.757092 32.5281 1.1375 32.5281C28.2284 32.5281 49.075 53.4907 49.075 78H81.575C81.575 53.4907 102.422 32.5281 129.512 32.5281C156.603 32.5281 177.45 53.4907 177.45 78H209.95C209.95 53.4907 230.797 32.5281 257.887 32.5281C284.978 32.5281 305.825 53.4907 305.825 78H338.325C338.325 53.4907 359.172 32.5281 386.262 32.5281C387.522 32.5281 388.769 32.5734 390 32.6623V0.0834961C388.76 0.0280228 387.514 0 386.262 0C360.303 0 336.865 12.0499 322.075 30.9579C307.285 12.0499 283.847 0 257.887 0C231.928 0 208.49 12.0499 193.7 30.9579C178.91 12.0499 155.472 0 129.512 0C103.553 0 80.1149 12.0499 65.325 30.9579C50.5351 12.0499 27.0968 0 1.1375 0C0.757791 0 0.378616 0.00257874 0 0.00771332Z' fill='%23FFEBE5'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat-x',
          backgroundSize: '390px 78px'
        }}
      />
      <div className="homepage-container relative flex flex-col gap-6 small-laptop:max-w-[864px]">
        <div className="flex justify-center">
          <h2 className="font-moreSugar text-[24px] font-normal uppercase tracking-[0.12em] text-primary-700 rotate-[-2.4deg] leading-[40px] text-center tablet:text-[36px] tablet:leading-[40px]">
            our bestsellers
          </h2>
        </div>

        {displayCakes.length > 0 ? (
          <>
            <div className="tablet:hidden">
              <BestsellersCarousel cakes={displayCakes} />
            </div>
            <div className="hidden tablet:flex tablet:flex-col tablet:gap-[83px]">
              {displayCakes.map((cake, index) => {
                const fallbackSummaryText = blocksToText(cake.shortDescription ?? cake.description)
                const fallbackDescriptionText = blocksToText(cake.description)
                const safeSummary = fallbackSummaryText || `${cake.name} is a customer favourite baked fresh in Leeds.`
                const safeDescription = fallbackDescriptionText || safeSummary
                const bestsellerStory = typeof cake.bestsellerCustomerStory === 'string' ? cake.bestsellerCustomerStory.trim() : ''
                const bestsellerDetails = typeof cake.bestsellerStoryDetails === 'string' ? cake.bestsellerStoryDetails.trim() : ''
                const bestsellerShortText = blocksToText(cake.bestsellerShortDescription ?? [])
                const quoteSource = bestsellerStory || safeSummary
                const bodySource = bestsellerShortText || safeDescription
                const quoteText = quoteSource.length > 110 ? `${quoteSource.slice(0, 107).trimEnd()}...` : quoteSource
                const bodyText = bodySource.length > 220 ? `${bodySource.slice(0, 217).trimEnd()}...` : bodySource
                const categoryLabel = formatCategoryLabel(cake.category)
                const safeCakeName = cake.name?.trim() || 'Olgish Cakes'
                const storyDetailsText = bestsellerDetails
                  ? `- ${bestsellerDetails.replace(/^-\s*/, '')}`
                  : `- ${safeCakeName}, ${categoryLabel} cake`
                const imageAlt = cake.mainImage?.alt?.trim() || `${safeCakeName} ${categoryLabel} cake by Olgish Cakes`
                const isReversed = index % 2 === 1

                return (
                  <div
                    key={cake._id}
                    className={`flex flex-col items-center gap-6 tablet:flex-row tablet:items-center tablet:justify-between ${isReversed ? 'tablet:flex-row-reverse' : ''}`}
                  >
                    <div className={imageClassName}>
                      <Link href={`/cakes/${cake.slug.current}`} className="block h-full w-full relative">
                        <Image
                          src={cake.imageUrl}
                          alt={imageAlt}
                          fill
                          sizes="(min-width: 1024px) 360px, 100vw"
                          className="object-cover rounded-[16px]"
                          priority={index === 0}
                        />
                      </Link>
                    </div>
                    <div className={tabletTextClassName}>
                      <div className="space-y-3">
                        <p className="font-oldenburg font-normal text-[20px] leading-[28px] text-primary-800 tablet:text-[24px] tablet:leading-[28px] tablet:text-center large-laptop:text-[32px] large-laptop:mb-6">
                          "{quoteText}"
                        </p>
                        <p className="font-oldenburg text-[14px] leading-[20px] tracking-[0.06em] text-base-content tablet:text-[16px]">
                          {storyDetailsText}
                        </p>
                      </div>
                      <p className="font-oldenburg text-[15px] leading-[26px] text-base-content tablet:text-[16px]">
                        {bodyText}
                      </p>
                      <Link href={`/cakes/${cake.slug.current}`} className={tabletLinkClassName}>
                        <span>Shop {cake.name}</span>
                        <span className={tabletArrowClassName}>{'>'}</span>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <div className="relative h-[342px] w-full rounded-[16px] border border-primary-50 overflow-hidden shadow-xl bg-base-200 flex items-center justify-center">
            <p className="text-base-content">Loading cakes...</p>
          </div>
        )}
      </div>
      <div className="relative flex justify-end z-1 mr-5 tablet:hidden">
        <Link
          href="/cakes"
          className="flex items-center gap-2 text-black"
        >
          <span className="font-oldenburg">Shop bestsellers</span>
          <span className="font-oldenburg text-primary-500 text-lg mt-1">{">"}</span>
        </Link>
      </div>
      <div className="absolute left-0 right-0 bottom-[-32px]">
        <svg xmlns="http://www.w3.org/2000/svg" width="390" height="78" viewBox="0 0 390 78" fill="none">
          <path d="M0 77.9923V45.4595C0.37791 45.4678 0.757092 45.4719 1.1375 45.4719C28.2284 45.4719 49.075 24.5093 49.075 0H81.575C81.575 24.5093 102.422 45.4719 129.512 45.4719C156.603 45.4719 177.45 24.5093 177.45 0H209.95C209.95 24.5093 230.797 45.4719 257.887 45.4719C284.978 45.4719 305.825 24.5093 305.825 0H338.325C338.325 24.5093 359.172 45.4719 386.262 45.4719C387.522 45.4719 388.769 45.4266 390 45.3377V77.9165C388.76 77.972 387.514 78 386.262 78C360.303 78 336.865 65.9501 322.075 47.0421C307.285 65.9501 283.847 78 257.887 78C231.928 78 208.49 65.9501 193.7 47.0421C178.91 65.9501 155.472 78 129.512 78C103.553 78 80.1149 65.9501 65.325 47.0421C50.5351 65.9501 27.0968 78 1.1375 78C0.757791 78 0.378616 77.9974 0 77.9923Z" fill="#FFEBE5" />
        </svg>
      </div>
      <div
        className="absolute left-0 right-0 bottom-[-32px] h-[78px] overflow-hidden"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='390' height='78' viewBox='0 0 390 78' fill='none'%3E%3Cpath d='M0 77.9923V45.4595C0.37791 45.4678 0.757092 45.4719 1.1375 45.4719C28.2284 45.4719 49.075 24.5093 49.075 0H81.575C81.575 24.5093 102.422 45.4719 129.512 45.4719C156.603 45.4719 177.45 24.5093 177.45 0H209.95C209.95 24.5093 230.797 45.4719 257.887 45.4719C284.978 45.4719 305.825 24.5093 305.825 0H338.325C338.325 24.5093 359.172 45.4719 386.262 45.4719C387.522 45.4719 388.769 45.4266 390 45.3377V77.9165C388.76 77.972 387.514 78 386.262 78C360.303 78 336.865 65.9501 322.075 47.0421C307.285 65.9501 283.847 78 257.887 78C231.928 78 208.49 65.9501 193.7 47.0421C178.91 65.9501 155.472 78 129.512 78C103.553 78 80.1149 65.9501 65.325 47.0421C50.5351 65.9501 27.0968 78 1.1375 78C0.757791 78 0.378616 77.9974 0 77.9923Z' fill='%23FFEBE5'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat-x',
          backgroundSize: '390px 78px'
        }}
      />
    </section>
  )
}
