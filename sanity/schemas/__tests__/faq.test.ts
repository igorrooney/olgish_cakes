import {
  getFaqAnswerToneWarning,
  getFaqAnswerVoiceError,
  getFaqPolicyConsistencyError,
  getFaqQuestionToneWarning
} from '../faqTone'
import { CANONICAL_FAQS } from '../../../lib/faq-content'

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

  it('blocks first-person singular public answers', () => {
    expect(getFaqAnswerVoiceError('Tell me the date and I’ll prepare a quote.')).toMatch(
      /use “we”/i
    )
    expect(getFaqAnswerVoiceError('Tell us the date and we’ll prepare a quote.')).toBe(true)
  })

  it('locks policy-sensitive answers to the approved wording', () => {
    const paymentFaq = CANONICAL_FAQS.find((faq) => faq.question === 'How do I pay?')

    expect(paymentFaq).toBeDefined()
    expect(
      getFaqPolicyConsistencyError(paymentFaq?.answer, paymentFaq?.question)
    ).toBe(true)
    expect(
      getFaqPolicyConsistencyError(
        'Orders over GBP200 need a 50% deposit.',
        paymentFaq?.question
      )
    ).toMatch(/approved website wording/i)
  })
})
