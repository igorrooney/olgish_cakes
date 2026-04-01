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
    <section style={{ padding: '12px' }} aria-labelledby="homepage-faq-title">
      <div className="win2k-window" style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Title bar */}
        <div className="win2k-titlebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '14px' }}>❓</span>
            <span className="win2k-titlebar-text">Help - Frequently Asked Questions</span>
          </div>
          <div className="win2k-titlebar-controls">
            <div className="win2k-titlebar-btn" aria-hidden="true">_</div>
            <div className="win2k-titlebar-btn" aria-hidden="true">□</div>
            <div className="win2k-titlebar-btn" aria-hidden="true">×</div>
          </div>
        </div>

        <div style={{ padding: '8px', backgroundColor: '#D4D0C8' }}>
          {/* Help header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#000080',
              color: '#FFFFFF',
              padding: '6px 8px',
              marginBottom: '8px',
            }}
          >
            <span style={{ fontSize: '20px' }}>&#8505;</span>
            <div>
              <div id="homepage-faq-title" style={{ fontWeight: 'bold', fontSize: '12px' }}>Cake FAQ</div>
              <div style={{ fontSize: '10px' }}>
                Quick answers from a Ukrainian bakery in Leeds
              </div>
            </div>
          </div>

          {/* FAQ items as expandable sections */}
          <div
            className="win2k-inset"
            style={{ backgroundColor: '#FFFFFF', padding: '0' }}
          >
            {faqItems.map((item, index) => (
              <details
                key={item.question}
                style={{
                  borderBottom: index < faqItems.length - 1 ? '1px solid #D4D0C8' : 'none',
                }}
              >
                <summary
                  style={{
                    padding: '6px 10px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    listStyle: 'none',
                    fontFamily: 'Tahoma, Arial, sans-serif',
                  }}
                >
                  <span style={{ color: '#000080', fontSize: '10px' }}>&#9658;</span>
                  {item.question}
                </summary>
                <div style={{
                  padding: '4px 10px 8px 22px',
                  fontSize: '11px',
                  backgroundColor: '#FFFBEB',
                  borderTop: '1px solid #D4D0C8',
                  fontFamily: 'Tahoma, Arial, sans-serif',
                }}>
                  {item.answer}
                </div>
              </details>
            ))}
          </div>

          {/* Footer buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '8px' }}>
            <button type="button" className="win2k-btn" style={{ fontSize: '11px' }}>
              Close
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
