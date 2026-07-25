import Link from 'next/link'

const inspirationLinks = [
  {
    href: '/birthday-cakes',
    title: 'Birthday Cakes',
    body: 'Browse recent birthday cake designs.'
  },
  {
    href: '/wedding-cakes',
    title: 'Wedding Cakes',
    body: 'See elegant wedding cakes in different sizes and styles.'
  },
  {
    href: '/anniversary-cakes-leeds',
    title: 'Anniversary Cakes',
    body: 'Explore personalised anniversary cake ideas.'
  }
]

export function GetCustomQuoteInspiration() {
  return (
    <section className='bg-base-200/35 px-4 py-10 tablet:px-10 tablet:py-14'>
      <div className='homepage-container grid gap-8 small-laptop:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]'>
        <div className='max-w-[420px]'>
          <h2 className='font-moreSugar text-[26px] uppercase leading-[1.18] tracking-[0.08em] text-primary-700 tablet:text-[34px]'>
            Looking for cake ideas?
          </h2>
          <p className='mt-4 font-oldenburg text-[15px] leading-7 tracking-[0.03em] text-base-content/80 tablet:text-base tablet:leading-8'>
            Browse our most popular cake galleries before requesting your quote.
          </p>
        </div>

        <div className='grid self-start gap-4 tablet:grid-cols-3'>
          {inspirationLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className='group flex h-full flex-col justify-between rounded-[28px] border border-base-300 bg-base-100 p-6 transition-colors hover:border-primary-300 hover:bg-base-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
            >
              <div>
                <h3 className='font-sans text-lg font-semibold leading-7 text-base-content transition-colors group-hover:text-primary-700'>
                  {item.title}
                </h3>
                <p className='mt-3 font-oldenburg text-[15px] leading-7 tracking-[0.03em] text-base-content/78'>
                  {item.body}
                </p>
              </div>
              <span className='mt-6 flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-[0.18em] text-primary-600'>
                View gallery
                <span aria-hidden='true' className='transition-transform group-hover:translate-x-1'>
                  →
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
