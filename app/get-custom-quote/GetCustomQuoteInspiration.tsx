import Link from 'next/link'

const inspirationLinks = [
  {
    href: '/birthday-cakes',
    title: 'Birthday cakes',
    body: 'A useful place to start if you know the occasion but want clearer design ideas before asking for a quote.'
  },
  {
    href: '/wedding-cakes',
    title: 'Wedding cakes',
    body: 'Helpful when you need to think about style, servings and delivery before sending your brief.'
  },
  {
    href: '/anniversary-cakes-leeds',
    title: 'Anniversary cakes',
    body: 'A good starting point for a more personal design that still feels simple and considered.'
  }
]

export function GetCustomQuoteInspiration() {
  return (
    <section className='bg-base-200/35 px-4 py-10 tablet:px-10 tablet:py-14'>
      <div className='homepage-container grid gap-8 small-laptop:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]'>
        <div className='max-w-[420px]'>
          <p className='font-body text-xs font-semibold uppercase tracking-[0.18em] text-primary-600'>
            Need visual direction first?
          </p>
          <h2 className='mt-3 font-moreSugar text-[26px] uppercase leading-[1.18] tracking-[0.08em] text-primary-700 tablet:text-[34px]'>
            Browse a few good places to start
          </h2>
          <p className='mt-4 font-oldenburg text-[15px] leading-7 tracking-[0.03em] text-base-content/80 tablet:text-base tablet:leading-8'>
            If you know the event but not the exact finish, these pages will help you narrow the brief before you fill in the form.
          </p>
        </div>

        <div className='grid gap-4 tablet:grid-cols-3'>
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
              <span className='mt-6 font-body text-xs font-semibold uppercase tracking-[0.18em] text-primary-600'>
                View ideas
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
