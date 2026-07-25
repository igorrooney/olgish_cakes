'use client'

import { useState } from 'react'

type QuoteFaqItem = {
  question: string
  answer: string
}

export const getCustomQuoteFaqItems: QuoteFaqItem[] = [
  {
    question: 'What should I include in a custom cake quote request?',
    answer: 'Share your event date, approximate servings and your cake ideas. If you have inspiration photos, flavour preferences or dietary requirements, include those too.'
  },
  {
    question: 'Do I need a reference image before I enquire?',
    answer: 'No. A written brief is enough to get started. Reference images are welcome, but they are used for inspiration rather than copied exactly.'
  },
  {
    question: 'Do you offer collection, local delivery or UK delivery?',
    answer: 'Yes. Collection from Leeds is available. We also offer local delivery and UK delivery by agreement. We\'ll recommend the best option for your cake when we prepare your quote.'
  },
  {
    question: 'Can you help if I\'m not sure about the cake size yet?',
    answer: 'You don\'t need to know the exact size. An approximate guest count is enough for us to recommend the best option.'
  }
]

export function GetCustomQuoteFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className='bg-base-100 px-4 py-10 tablet:px-10 tablet:py-14' aria-labelledby='custom-quote-faq-title'>
      <div className='homepage-container grid gap-8 small-laptop:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]'>
        <div className='max-w-[420px]'>
          <h2 id='custom-quote-faq-title' className='font-moreSugar text-[26px] uppercase leading-[1.18] tracking-[0.08em] text-primary-700 tablet:text-[34px]'>
            Need help before requesting your quote?
          </h2>
          <p className='mt-4 font-oldenburg text-[15px] leading-7 tracking-[0.03em] text-base-content/80 tablet:text-base tablet:leading-8'>
            Everything you need before requesting your cake quote.
          </p>
        </div>

        <div className='space-y-4'>
          {getCustomQuoteFaqItems.map((item, index) => {
            const isOpen = openIndex === index
            const buttonId = `custom-quote-faq-question-${index}`
            const panelId = `custom-quote-faq-panel-${index}`

            return (
              <div
                key={item.question}
                className={`rounded-[24px] border border-base-300 bg-base-100 px-6 py-5 ${isOpen ? 'shadow-[0_8px_18px_rgba(15,23,42,0.02)]' : ''}`}
              >
                <h3>
                  <button
                    id={buttonId}
                    type='button'
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className='flex w-full cursor-pointer items-center justify-between gap-4 text-left font-sans text-lg font-semibold leading-7 text-base-content'
                  >
                    <span>{item.question}</span>
                    <span aria-hidden='true' className={`text-xl font-semibold leading-none text-primary-500 transition-transform ${isOpen ? 'rotate-45' : ''}`}>
                      +
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  role='region'
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                  className='mt-4 max-w-[780px] font-oldenburg text-[15px] leading-7 tracking-[0.03em] text-base-content/80 tablet:text-base tablet:leading-8'
                >
                  <p>{item.answer}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
