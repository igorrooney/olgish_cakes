'use client'

import { useState } from 'react'

type QuoteFaqItem = {
  question: string
  answer: string
}

export const getCustomQuoteFaqItems: QuoteFaqItem[] = [
  {
    question: 'What should I include in a custom cake quote request?',
    answer: 'The date, approximate servings and a short design brief are the most helpful starting points. If you already have colours, flavours, dietary notes or inspiration photos, add them, but keep the brief focused on what matters most.'
  },
  {
    question: 'Do I need a reference image before I enquire?',
    answer: 'No. A clear written brief is enough to start. Reference images help when you want to show a finish or mood, but they are optional and should guide the direction rather than lock you into an exact copy.'
  },
  {
    question: 'Do you offer collection, local delivery or UK delivery?',
    answer: 'Collection from Leeds is available, local delivery can be discussed when the size, finish and timing of the cake are clear, and UK delivery is possible by agreement. The safest option depends on how delicate the decoration is and when the cake needs to arrive.'
  },
  {
    question: 'Can you help if I am not sure about size yet?',
    answer: 'Yes. An approximate guest count is enough for the first quote. Once I know whether the cake is for a smaller dinner, family party or bigger celebration, I can suggest a more realistic starting size.'
  }
]

export function GetCustomQuoteFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className='bg-base-100 px-4 py-10 tablet:px-10 tablet:py-14' aria-labelledby='custom-quote-faq-title'>
      <div className='homepage-container grid gap-8 small-laptop:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]'>
        <div className='max-w-[420px]'>
          <p className='font-body text-xs font-semibold uppercase tracking-[0.18em] text-primary-600'>
            Before you send the form
          </p>
          <h2 id='custom-quote-faq-title' className='mt-3 font-moreSugar text-[26px] uppercase leading-[1.18] tracking-[0.08em] text-primary-700 tablet:text-[34px]'>
            A few practical answers
          </h2>
          <p className='mt-4 font-oldenburg text-[15px] leading-7 tracking-[0.03em] text-base-content/80 tablet:text-base tablet:leading-8'>
            These are the questions people usually ask before they are ready to send through a proper cake brief.
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
                {isOpen ? (
                  <div
                    id={panelId}
                    role='region'
                    aria-labelledby={buttonId}
                    className='mt-4 max-w-[780px] font-oldenburg text-[15px] leading-7 tracking-[0.03em] text-base-content/80 tablet:text-base tablet:leading-8'
                  >
                    <p>{item.answer}</p>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
