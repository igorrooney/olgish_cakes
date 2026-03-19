import Link from 'next/link'
import { QuoteFormScrollLink } from './QuoteFormScrollLink'

export function GetCustomQuoteCtaBand() {
  return (
    <section className='bg-base-200/45 px-4 py-10 tablet:px-10 tablet:py-14'>
      <div className='homepage-container rounded-[32px] border border-base-300 bg-base-100 px-6 py-8 tablet:px-10 tablet:py-10'>
        <div className='grid gap-6 small-laptop:grid-cols-[minmax(0,1fr)_auto] small-laptop:items-end'>
          <div className='max-w-[720px]'>
            <p className='font-body text-xs font-semibold uppercase tracking-[0.18em] text-primary-600'>
              Ready when the brief is clear
            </p>
            <h2 className='mt-3 font-moreSugar text-[24px] uppercase leading-[1.18] tracking-[0.08em] text-primary-700 tablet:text-[32px]'>
              Send the essentials and I will take it from there
            </h2>
            <p className='mt-4 font-oldenburg text-[15px] leading-7 tracking-[0.03em] text-base-content/80 tablet:text-base tablet:leading-8'>
              If you already know the date, servings and general style, the quote form is enough to start a sensible conversation about your cake.
            </p>
          </div>

          <div className='flex flex-col gap-3 tablet:flex-row small-laptop:flex-col'>
            <QuoteFormScrollLink
              className='btn btn-primary h-12 border-none px-6 text-sm font-semibold normal-case tablet:h-14 tablet:min-w-[220px] tablet:text-base'
            >
              Go to the quote form
            </QuoteFormScrollLink>
            <Link
              href='/cakes'
              className='btn btn-outline h-12 border-primary-500 bg-base-100 px-6 text-sm font-semibold normal-case text-primary-700 tablet:h-14 tablet:min-w-[220px] tablet:text-base'
            >
              Browse cake designs
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
