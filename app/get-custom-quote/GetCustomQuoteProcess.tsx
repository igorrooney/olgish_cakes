const quoteSteps = [
  {
    step: '01',
    title: 'Start with the practical details',
    body: 'Share the date, rough servings and the occasion. That helps me judge what is realistic, and whether collection, local delivery or UK delivery by agreement would work best.'
  },
  {
    step: '02',
    title: 'Add the style direction',
    body: 'A short description is enough. Colours, finish, flavour ideas and one or two inspiration images usually tell me more than a long wishlist.'
  },
  {
    step: '03',
    title: 'Get a quote you can work with',
    body: 'My reply will be based on your date and brief, so you get a quote that fits the cake you actually need.'
  }
]

export function GetCustomQuoteProcess() {
  return (
    <section className='bg-base-100 px-4 py-10 tablet:px-10 tablet:py-14'>
      <div className='homepage-container grid gap-8 border-y border-base-300 py-8 tablet:py-10 small-laptop:grid-cols-[minmax(280px,0.7fr)_minmax(0,1.3fr)]'>
        <div className='max-w-[420px]'>
          <p className='font-body text-xs font-semibold uppercase tracking-[0.18em] text-primary-600'>
            How quoting works
          </p>
          <h2 className='mt-3 font-moreSugar text-[26px] uppercase leading-[1.18] tracking-[0.08em] text-primary-700 tablet:text-[34px]'>
            A clear process from the start
          </h2>
          <p className='mt-4 font-oldenburg text-[15px] leading-7 tracking-[0.03em] text-base-content/80 tablet:text-base tablet:leading-8'>
            The best cake quotes come from a brief that is specific enough to price properly, but still easy to send in a few minutes.
          </p>
        </div>

        <ol
          className='space-y-6'
          style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}
        >
          {quoteSteps.map((item) => (
            <li
              key={item.step}
              className='grid gap-3 border-l border-base-300 pl-5 tablet:grid-cols-[72px_minmax(0,1fr)] tablet:gap-5 tablet:pl-6'
              style={{ listStyle: 'none', marginBottom: 0 }}
            >
              <span className='font-body text-xs font-semibold uppercase tracking-[0.18em] text-primary-500'>
                {item.step}
              </span>
              <div>
                <h3 className='font-sans text-lg font-semibold leading-7 text-base-content'>
                  {item.title}
                </h3>
                <p className='mt-2 font-oldenburg text-[15px] leading-7 tracking-[0.03em] text-base-content/80 tablet:text-base tablet:leading-8'>
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
