import Image from 'next/image'
import Link from 'next/link'
import heroCakeCenter from '@/public/homeHero/home-hero-cake-center.png'
import heroCakeLeft from '@/public/homeHero/home-hero-cake-left.png'
import heroCakeRight from '@/public/homeHero/home-hero-cake-right.png'
import { QuoteFormScrollLink } from './QuoteFormScrollLink'

export function GetCustomQuoteHero() {
  return (
    <section className='overflow-hidden bg-base-100 px-4 pb-10 pt-6 tablet:px-10 tablet:pb-14 tablet:pt-8'>
      <div className='homepage-container relative grid items-center gap-10 small-laptop:grid-cols-[minmax(0,1.12fr)_minmax(360px,0.88fr)]'>
        <div className='relative z-[1] flex flex-col items-center gap-6 small-laptop:items-start'>
          <div className='inline-flex w-fit items-center rounded-full border border-primary-100 bg-base-200/80 px-4 py-2 text-center font-body text-xs font-semibold uppercase tracking-[0.18em] text-primary-700'>
            Handmade in Leeds
          </div>
          <div className='flex w-full flex-col gap-4 text-center small-laptop:text-left'>
            <h1 className='mx-auto w-full max-w-none font-moreSugar text-[32px] uppercase leading-[1.08] tracking-[0.08em] text-primary-700 tablet:text-[52px] small-laptop:mx-0'>
              Get a custom cake quote in Leeds
            </h1>
            <p className='mx-auto max-w-[560px] font-oldenburg text-base leading-7 tracking-[0.05em] text-primary-800 tablet:text-[22px] tablet:leading-9 small-laptop:mx-0'>
              Tell me the date, guest count and the kind of cake you have in mind, and I&apos;ll come back with a quote for your birthday, anniversary, wedding or celebration cake.
            </p>
          </div>
          <div className='flex w-full flex-col gap-3 tablet:flex-row tablet:justify-center small-laptop:justify-start'>
            <QuoteFormScrollLink
              className='btn btn-primary h-12 border-none px-6 text-sm font-semibold normal-case tablet:h-14 tablet:min-w-[220px] tablet:text-base'
            >
              Start your quote
            </QuoteFormScrollLink>
            <Link
              href='/cakes'
              className='btn btn-outline h-12 border-primary-500 bg-base-100 px-6 text-sm font-semibold normal-case text-primary-700 tablet:h-14 tablet:min-w-[220px] tablet:text-base'
            >
              Browse cake designs
            </Link>
          </div>
          <p className='max-w-[580px] text-center font-body text-sm leading-6 text-base-content/75 small-laptop:text-left'>
            Collection from Leeds, local delivery where suitable, and UK delivery by agreement. If you already have reference images, you can add them too.
          </p>
        </div>

        <div className='relative mx-auto flex w-full max-w-[620px] items-end justify-center small-laptop:justify-end'>
          <div className='relative grid w-full max-w-[560px] grid-cols-[0.82fr_1fr_0.82fr] items-end gap-2 tablet:gap-2'>
            <div className='relative top-8 h-[220px] overflow-hidden rounded-[24px] border border-base-200 bg-base-100 shadow-lg tablet:h-[330px]'>
              <Image
                src={heroCakeLeft}
                alt='White buttercream celebration cake with black ribbon bows'
                sizes='(min-width: 1024px) 176px, 31vw'
                className='h-full w-full object-cover'
              />
            </div>
            <div className='relative z-[1] h-[290px] overflow-hidden rounded-[30px] border border-base-200 bg-base-100 shadow-xl tablet:h-[430px]'>
              <Image
                src={heroCakeCenter}
                alt='Red celebration cake with elegant crown topper'
                priority
                sizes='(min-width: 1024px) 230px, 39vw'
                className='h-full w-full object-cover'
              />
            </div>
            <div className='relative top-10 h-[220px] overflow-hidden rounded-[24px] border border-base-200 bg-base-100 shadow-lg tablet:h-[330px]'>
              <Image
                src={heroCakeRight}
                alt='Tall celebration cake with teal icing and gold details'
                sizes='(min-width: 1024px) 176px, 31vw'
                className='h-full w-full object-cover'
              />
            </div>
            {/* <div className='absolute left-[-10px] top-10 h-20 w-20 rounded-full bg-secondary/55 blur-2xl tablet:h-28 tablet:w-28' /> */}
            {/* <div className='absolute bottom-6 right-[-8px] h-16 w-16 rounded-full bg-accent/60 blur-2xl tablet:h-24 tablet:w-24' /> */}
          </div>
        </div>
      </div>
    </section>
  )
}
