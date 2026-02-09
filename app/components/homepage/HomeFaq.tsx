export const faqItems = [
  {
    question: 'What is Medovik honey cake?',
    answer:
      'Medovik is a traditional Ukrainian honey cake with thin honey layers and light cream. I bake it in Leeds from a family recipe and let it rest overnight so it goes soft and rich.'
  },
  {
    question: 'Do you make Napoleon cake in Leeds?',
    answer:
      'Yes — it’s handmade in Leeds with flaky pastry layers and smooth custard cream. Lovely for birthdays and tea parties.'
  },
  {
    question: 'Looking for a bakery or dessert near me in Leeds?',
    answer:
      'You can order online and choose local delivery or collection in Leeds. I’m also at selected farmers’ markets during the year.'
  },
  {
    question: 'Do you deliver cakes across the UK?',
    answer:
      'Yes, selected cakes can go by post across the UK. I’ll confirm the best option when you place your order.'
  },
  {
    question: 'Can you make custom birthday or wedding cakes?',
    answer:
      'Yes — I make custom birthday and wedding cakes with Ukrainian flavours like Medovik and Napoleon. Share your date and ideas and I’ll suggest sizes and designs.'
  }
]

const sectionTitleClassName =
  'font-moreSugar text-[24px] font-normal uppercase tracking-[0.12em] text-primary-700 rotate-[-2.4deg] leading-[40px] text-center tablet:text-[36px] tablet:leading-[40px]'
const introClassName =
  'font-oldenburg text-[15px] leading-7 text-base-content text-center tablet:text-base'
const collapseClassName = 'collapse collapse-arrow border border-base-300 bg-base-100 rounded-box'
const collapseTitleClassName =
  'collapse-title font-oldenburg text-[16px] leading-6 text-base-content tablet:text-[18px]'
const collapseContentClassName = 'collapse-content font-oldenburg text-[15px] leading-7 text-base-content'

export function HomeFaq() {
  return (
    <section className="bg-base-100 px-4 py-8" aria-labelledby="homepage-faq-title">
      <div className="homepage-container flex flex-col gap-6">
        <div className="flex justify-center">
          <h2 id="homepage-faq-title" className={sectionTitleClassName}>
            Cake FAQ
          </h2>
        </div>
        <p className={introClassName}>
          Quick answers from a Ukrainian bakery in Leeds — Medovik honey cake, Napoleon cake and delivery
          options.
        </p>
        <div className="flex flex-col gap-4">
          {faqItems.map((item) => (
            <div key={item.question} className={collapseClassName}>
              <input type="checkbox" />
              <div className={collapseTitleClassName}>{item.question}</div>
              <div className={collapseContentClassName}>
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
