import Image from 'next/image'
import Link from 'next/link'
import { CakesFeaturedOfferData } from './types'

interface CakesFeaturedOfferProps {
  featuredOffer: CakesFeaturedOfferData
}

export function CakesFeaturedOffer({ featuredOffer }: CakesFeaturedOfferProps) {
  return (
    <section
      aria-label='Featured offer'
      className='overflow-hidden rounded-box border border-base-300 bg-secondary/20 shadow-[0px_8px_24px_-18px_rgba(0,0,0,0.45)] tablet:h-[208px] tablet:bg-base-100 tablet:shadow-xl'
    >
      <div className='grid h-full grid-cols-1 tablet:grid-cols-[208px_minmax(0,1fr)]'>
        <div className='relative h-52 tablet:h-[208px]'>
          <Image
            src={featuredOffer.imageUrl}
            alt={featuredOffer.imageAlt}
            fill
            className='object-cover tablet:rounded-l-[8px]'
            priority
          />
        </div>
        <div className='h-full bg-secondary/20 px-7 py-5 tablet:bg-[var(--color-featured-offer)] tablet:px-8 tablet:py-8'>
          <div className='flex h-full flex-col gap-4 tablet:gap-2'>
            <p
              className='text-[14px] leading-5 text-base-content/75 tablet:text-base-content tablet:[font-family:var(--t-font-family-theme-primary)] tablet:[font-weight:var(--t-font-weight-normal)] tablet:[font-style:normal] tablet:[font-size:12px] tablet:[leading-trim:none] tablet:[line-height:var(--t-font-lineHeight-leading-5)] tablet:[letter-spacing:0] tablet:align-middle'
            >
              {featuredOffer.eyebrow}
            </p>
            <h2
              className='mt-1 text-4xl font-semibold leading-tight text-base-content tablet:mt-0 tablet:[font-family:var(--t-font-family-theme-primary)] tablet:[font-weight:var(--t-font-weight-semibold)] tablet:[font-style:normal] tablet:[font-size:var(--t-font-size-xl)] tablet:[leading-trim:none] tablet:[line-height:var(--t-font-lineHeight-leading-7)] tablet:[letter-spacing:0] tablet:align-middle'
            >
              {featuredOffer.title}
            </h2>
            <p
              className='mt-2 whitespace-pre-line text-base leading-8 text-base-content/82 tablet:mt-0 tablet:text-base-content tablet:[font-family:var(--t-font-family-theme-primary)] tablet:[font-weight:var(--t-font-weight-normal)] tablet:[font-style:normal] tablet:[font-size:var(--t-font-size-sm)] tablet:[leading-trim:none] tablet:[line-height:var(--t-font-lineHeight-leading-5)] tablet:[letter-spacing:0] tablet:align-middle'
            >
              {featuredOffer.description}
            </p>
            <div className='flex justify-start tablet:justify-end'>
              <Link
                href={`/cakes/${featuredOffer.cakeSlug}`}
                className='btn btn-outline btn-primary btn-sm h-12 min-h-12 rounded-field px-5 normal-case tablet:h-8 tablet:min-h-8 tablet:w-auto tablet:min-w-fit tablet:whitespace-nowrap tablet:shadow-sm tablet:[font-weight:var(--t-font-weight-semibold)] tablet:[font-style:normal] tablet:[font-size:var(--t-font-size-sm)] tablet:[leading-trim:none] tablet:[line-height:var(--d-lineHeight-14)] tablet:[letter-spacing:0] tablet:text-center tablet:align-middle'
              >
                {featuredOffer.ctaLabel}
              </Link>   
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
