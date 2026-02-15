import type { CatalogFaqItem } from '../catalogFaqItems'

interface CatalogFaqAccordionProps {
  title: string
  items: CatalogFaqItem[]
  intro?: string
  sectionId?: string
}

const sectionTitleClassName =
  'mx-auto max-w-[760px] text-center font-moreSugar text-[24px] font-normal uppercase tracking-[0.12em] text-primary-700 rotate-[-2.4deg] leading-[40px] tablet:text-[36px] tablet:leading-[52px] small-laptop:max-w-[1000px]'
const introClassName =
  'mx-auto mt-3 max-w-[760px] text-center font-oldenburg text-[15px] leading-8 tracking-[1.2px] text-base-content tablet:text-base tablet:tracking-normal'
const questionClassName =
  'collapse-title font-oldenburg text-[16px] leading-6 text-base-content tablet:text-[18px] tablet:leading-7'
const answerClassName =
  'collapse-content font-oldenburg text-[15px] leading-8 tracking-[1.2px] text-base-content tablet:text-base tablet:tracking-normal'

export function CatalogFaqAccordion({
  title,
  items,
  intro,
  sectionId = 'catalog-faq-title'
}: CatalogFaqAccordionProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <section
      aria-labelledby={sectionId}
      className='mx-auto w-full max-w-[952px] px-4 pb-16 pt-4 tablet:px-0 small-laptop:max-w-[1000px] large-laptop:max-w-[1200px]'
    >
      <h2 id={sectionId} className={sectionTitleClassName}>
        {title}
      </h2>
      {intro ? (
        <p className={introClassName}>
          {intro}
        </p>
      ) : null}
      <div className='mx-auto mt-6 max-w-[860px] space-y-4'>
        {items.map((item) => (
          <div
            key={item.question}
            className='collapse collapse-arrow rounded-box border border-base-300 bg-base-100'
          >
            <input type='checkbox' />
            <h3 className={questionClassName}>
              {item.question}
            </h3>
            <div className={answerClassName}>
              <p>{item.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
