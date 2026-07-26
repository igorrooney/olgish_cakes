import {
  ALLERGEN_CROSS_CONTACT_POLICY,
  DEPOSIT_AND_FINAL_PAYMENT_POLICY,
  GIFT_HAMPER_REFUND_POLICY,
  REFUND_AFTER_WORK_POLICY,
  REFUND_BEFORE_WORK_POLICY
} from './public-policies'

export type CanonicalFaq = {
  legacyQuestion: string
  question: string
  answer: string
  policySensitive?: boolean
}

export const CANONICAL_FAQS: readonly CanonicalFaq[] = [
  {
    legacyQuestion: 'What is your process for custom cake orders?',
    question: 'How do I order a custom cake?',
    answer: 'Send the date first. Then tell us the size and what sort of cake you want. Photos help, even if they are just screenshots. That is enough for us to prepare a quote.'
  },
  {
    legacyQuestion: 'What are your delivery options?',
    question: 'Do you deliver or is it collection only?',
    answer: 'Most celebration cakes are collected from Leeds. We can deliver locally on some orders, but we need the postcode first. Posted cakes are a separate range. We do not send tall buttercream cakes by courier.'
  },
  {
    legacyQuestion: 'How far in advance should I place my order?',
    question: 'How much notice do you need?',
    answer: 'For most celebration cakes, two to three weeks. Wedding cakes and detailed work need longer, usually four to six weeks. If the date is close, still ask.'
  },
  {
    legacyQuestion: 'How do you handle dietary requirements?',
    question: 'Can you make cakes for gluten-free, dairy-free or vegan diets?',
    answer: `Sometimes. Tell us exactly what needs to be avoided before we confirm. A gluten-free request is not the same as a serious allergy, and some cakes are easier to adapt than others. ${ALLERGEN_CROSS_CONTACT_POLICY} If you have an allergy, intolerance or coeliac disease, please read our allergen information and ask before ordering.`,
    policySensitive: true
  },
  {
    legacyQuestion: 'What payment methods do you accept?',
    question: 'How do I pay?',
    answer: `We usually accept bank transfer, card or cash on collection. ${DEPOSIT_AND_FINAL_PAYMENT_POLICY} We can invoice business and event orders.`,
    policySensitive: true
  },
  {
    legacyQuestion: 'What is your cancellation and refund policy?',
    question: 'What if I need to cancel or move my order?',
    answer: `Please tell us as early as possible. ${REFUND_BEFORE_WORK_POLICY} ${REFUND_AFTER_WORK_POLICY} ${GIFT_HAMPER_REFUND_POLICY} If you need to move the date, we’ll check whether another slot is available.`,
    policySensitive: true
  },
  {
    legacyQuestion: 'Do you offer wedding cake consultations?',
    question: 'Can I book a wedding cake consultation or tasting?',
    answer: 'Yes. We can go through portions, design, flavours and delivery, and arrange a tasting if that helps. Wedding dates go much earlier than birthday cake dates, especially in spring and summer.'
  },
  {
    legacyQuestion: 'Do you offer traditional Ukrainian cake flavors?',
    question: 'Do you make Ukrainian cake flavours like Medovik or Napoleon?',
    answer: 'Yes. The ones people ask for most are Medovik, Kyiv cake and Napoleon. If you are not sure which one to choose, tell us what you usually like and we’ll narrow it down.'
  },
  {
    legacyQuestion: 'What makes Ukrainian cakes unique?',
    question: 'What is different about Ukrainian cakes?',
    answer: 'Usually it is the texture first. A lot of Ukrainian cakes are built in thin layers instead of one thick sponge, so they eat differently. Medovik is soft honey cake with cream between the layers. Napoleon is pastry with custard.'
  },
  {
    legacyQuestion: 'Do you offer corporate and event catering?',
    question: 'Do you do cakes for offices or events?',
    answer: 'Yes, if the date works. Send the guest numbers, the date and what you need, and we’ll tell you quickly if we can do it.'
  }
] as const

function normaliseFaqCopy(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function getCanonicalFaqForQuestion(question: string | undefined) {
  if (typeof question !== 'string' || question.trim() === '') {
    return null
  }

  const questionKey = normaliseFaqCopy(question)

  return CANONICAL_FAQS.find((faq) => (
    normaliseFaqCopy(faq.question) === questionKey ||
    normaliseFaqCopy(faq.legacyQuestion) === questionKey
  )) ?? null
}
