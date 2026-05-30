export const faqItems = [
  {
    question: 'What is Medovik honey cake?',
    answer:
      'Medovik is a traditional Ukrainian honey cake with thin honey layers and buttercream made with condensed milk. Made in Leeds from a Ukrainian recipe with real honey, then rested overnight for a soft, rich texture and deep honey flavour.'
  },
  {
    question: 'Do you make Napoleon cake in Leeds?',
    answer:
      'Yes, our Napoleon cake is handmade in Leeds with puff pastry layers and fresh patisserie cream made with fresh cream. A lovely choice for birthdays, tea parties, and family celebrations.'
  },
  {
    question: 'Looking for a bakery or dessert near me in Leeds?',
    answer:
      'Order online and choose local delivery or collection in Leeds. You\'ll also find us at local farmers\' markets during the year. Follow our schedule for upcoming market dates.'
  },
  {
    question: 'Do you deliver cakes across the UK?',
    answer:
      'Yes, selected cakes can go by post across the UK. I\'ll confirm the best option when you place your order.'
  },
  {
    question: 'Can you make custom birthday or wedding cakes?',
    answer:
      'Yes, we make custom birthday and wedding cakes with flavours including Ukrainian Medovik, Napoleon, chocolate cake, red velvet, and more. Share your date and ideas, and we\'ll suggest sizes and designs.'
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
              <input type="checkbox" aria-label={`Toggle answer for ${item.question}`} />
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
