const quoteSteps = [
  {
    step: '1',
    icon: '📅',
    title: 'Tell us about your celebration',
    body: 'Share your event date, guest numbers and occasion.'
  },
  {
    step: '2',
    icon: '🎂',
    title: 'Share your cake ideas',
    body: 'Describe your style, flavours and colours. Add inspiration photos if you have them.'
  },
  {
    step: '3',
    icon: '💬',
    title: 'Receive your personalised quote',
    body: 'We\'ll review your enquiry and reply with pricing, availability and the next steps.'
  }
]

export function GetCustomQuoteProcess() {
  return (
    <section className='content-auto-section bg-base-100 px-4 py-10 tablet:px-10 tablet:py-14'>
      <div className='homepage-container grid gap-8 border-y border-base-300 py-8 tablet:py-10 small-laptop:grid-cols-[minmax(280px,0.7fr)_minmax(0,1.3fr)]'>
        <div className='max-w-[420px]'>
          <p className='font-body text-xs font-semibold uppercase tracking-[0.18em] text-primary-600'>
            How quoting works
          </p>
          <h2 className='mt-3 font-moreSugar text-[26px] uppercase leading-[1.18] tracking-[0.08em] text-primary-700 tablet:text-[34px]'>
            Get your personalised quote in 3 steps
          </h2>
          <p className='mt-4 font-oldenburg text-[15px] leading-7 tracking-[0.03em] text-base-content/80 tablet:text-base tablet:leading-8'>
            Tell us a few details. We&apos;ll reply with a personalised quote based on your cake ideas.
          </p>
        </div>

        <div className='flex flex-col gap-6'>
          <ol
            className='space-y-6'
            style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}
          >
            {quoteSteps.map((item) => (
              <li
                key={item.step}
                className='!grid !list-none grid-cols-[20px_24px_minmax(0,1fr)] items-start gap-x-2 border-l border-base-300 pl-5 tablet:pl-6'
                style={{ listStyle: 'none', marginBottom: 0 }}
              >
                <span className='pt-1 font-body text-sm font-semibold leading-6 text-primary-500'>
                  {item.step}
                </span>
                <span aria-hidden='true' className='pt-1 text-lg leading-none'>
                  {item.icon}
                </span>
                <h3 className='font-sans text-lg font-semibold leading-7 text-base-content'>
                  {item.title}
                </h3>
                <p className='col-start-3 mt-2 font-oldenburg text-[15px] leading-7 tracking-[0.03em] text-base-content/80 tablet:text-base tablet:leading-8'>
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
          <p className='border-t border-base-300 pt-5 font-body text-sm font-semibold leading-6 text-primary-700'>
            Most enquiries receive a reply within 24 hours.
          </p>
        </div>
      </div>
    </section>
  )
}
