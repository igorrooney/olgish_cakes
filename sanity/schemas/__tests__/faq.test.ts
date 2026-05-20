import {
  getFaqAnswerToneWarning,
  getFaqQuestionToneWarning
} from '../faqTone'

describe('faq schema tone validation', () => {
  it('allows direct customer-style questions', () => {
    expect(getFaqQuestionToneWarning('Can I order a custom cake for Leeds delivery?')).toBe(true)
    expect(getFaqQuestionToneWarning('How much notice do you need for a birthday cake?')).toBe(true)
  })

  it('warns on heading-style or synthetic questions', () => {
    expect(getFaqQuestionToneWarning('Everything you need to know about cake delivery')).toMatch(/content heading/i)
    expect(getFaqQuestionToneWarning('Cake delivery across the UK')).toMatch(/customer would actually ask/i)
    expect(getFaqQuestionToneWarning('Common questions before ordering')).toMatch(/content heading/i)
  })

  it('allows direct answers with practical detail', () => {
    expect(
      getFaqAnswerToneWarning('Yes. Posted cakes can go across the UK, but custom buttercream cakes are usually for Leeds collection or local delivery.')
    ).toBe(true)
  })

  it('warns on padded sales language in answers', () => {
    expect(
      getFaqAnswerToneWarning('We would be delighted to create the perfect cake for your special day with a seamless experience from start to finish.')
    ).toMatch(/padded or salesy/i)
  })

  it('warns on generic reassurance without useful detail', () => {
    expect(
      getFaqAnswerToneWarning('Yes, absolutely. I can help with that and will confirm the best option once I have a few details from you.')
    ).toMatch(/generic reassurance/i)
  })

  it('warns when a long answer stays vague', () => {
    expect(
      getFaqAnswerToneWarning('It depends on the order. There are different options available. Each order is handled individually. The best approach depends on your requirements.')
    ).toMatch(/long but still vague|still sounds generic/i)
  })

  it('warns when vague filler is repeated instead of giving the actual answer', () => {
    expect(
      getFaqAnswerToneWarning('It depends on the order. There are different options available. Contact us to discuss the best option for your requirements.')
    ).toMatch(/circles around the point|still sounds generic/i)
  })
})
