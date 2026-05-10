'use client'

import { useState } from 'react'
import type { CatalogFaqItem } from '../catalogFaqItems'
import {
  categoryLandingAccordionAnswerPaddingClassName,
  categoryLandingAccordionButtonPaddingClassName,
  categoryLandingCenteredIntroBlockClassName,
  categoryLandingWideShellClassName
} from './categoryLandingLayout'

interface CatalogFaqAccordionProps {
  title: string
  items: CatalogFaqItem[]
  intro?: string
  mobileIntro?: string
  sectionId?: string
}

const sectionTitleClassName =
  `${categoryLandingCenteredIntroBlockClassName} text-[24px] font-semibold leading-[1.22] text-base-content tablet:text-[30px] small-laptop:max-w-[860px]`
const introClassName =
  `${categoryLandingCenteredIntroBlockClassName} mt-3 font-oldenburg text-[15px] leading-7 tracking-[0.03em] text-base-content/82 tablet:text-base tablet:leading-8`
const buttonClassName =
  `flex w-full items-center justify-between gap-4 rounded-[22px] text-left font-oldenburg text-[16px] leading-6 text-base-content transition-colors hover:bg-base-200/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary tablet:text-[18px] tablet:leading-7 ${categoryLandingAccordionButtonPaddingClassName}`
const answerClassName =
  `${categoryLandingAccordionAnswerPaddingClassName} font-oldenburg text-[15px] leading-7 tracking-[0.03em] text-base-content/82 tablet:text-base tablet:leading-8`

export function CatalogFaqAccordion({
  title,
  items,
  intro,
  mobileIntro,
  sectionId = 'catalog-faq-title'
}: CatalogFaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  if (items.length === 0) {
    return null
  }

  return (
    <section
      aria-labelledby={sectionId}
      className={categoryLandingWideShellClassName}
    >
      <h2 id={sectionId} className={sectionTitleClassName}>
        {title}
      </h2>
      {intro && mobileIntro ? (
        <>
          <p className={`${introClassName} tablet:hidden`}>
            {mobileIntro}
          </p>
          <p className={`${introClassName} hidden tablet:block`}>
            {intro}
          </p>
        </>
      ) : intro ? (
        <p className={introClassName}>
          {intro}
        </p>
      ) : mobileIntro ? (
        <p className={introClassName}>
          {mobileIntro}
        </p>
      ) : null}
      <div className='mx-auto mt-6 max-w-[860px] space-y-4'>
        {items.map((item, index) => {
          const isOpen = openIndex === index
          const buttonId = `${sectionId}-question-${index}`
          const panelId = `${sectionId}-panel-${index}`

          return (
            <div key={item.question} className='rounded-[24px] border border-base-300 bg-base-100 shadow-[0_14px_24px_rgba(15,23,42,0.025)]'>
              <h3>
                <button
                  id={buttonId}
                  type='button'
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className={buttonClassName}
                >
                  <span>{item.question}</span>
                  <span aria-hidden='true' className='font-sans text-[24px] font-semibold leading-none text-primary-500'>
                    {isOpen ? '-' : '+'}
                  </span>
                </button>
              </h3>
              {isOpen ? (
                <div
                  id={panelId}
                  role='region'
                  aria-labelledby={buttonId}
                  className={answerClassName}
                >
                  <p>{item.answer}</p>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}