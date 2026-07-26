import path from 'node:path'
import sharp from 'sharp'
import { CANONICAL_FAQS } from '../faq-content'
import {
  ALLERGEN_CROSS_CONTACT_POLICY,
  DEPOSIT_AND_FINAL_PAYMENT_POLICY,
  GIFT_HAMPER_REFUND_POLICY,
  REFUND_AFTER_WORK_POLICY,
  REFUND_BEFORE_WORK_POLICY
} from '../public-policies'

describe('canonical FAQ content', () => {
  it('defines the ten expected records without first-person singular answers', () => {
    expect(CANONICAL_FAQS).toHaveLength(10)

    CANONICAL_FAQS.forEach((faq) => {
      expect(faq.question).not.toBe('')
      expect(faq.answer).not.toBe('')
      expect(faq.answer).not.toMatch(
        /\b(?:i|me|my|mine|myself)\b|\bi['’](?:d|ll|m|ve)\b/i
      )
    })
  })

  it('uses the shared allergen, payment and cancellation policies', () => {
    const dietaryAnswer = CANONICAL_FAQS.find(
      (faq) => faq.question === 'Can you make cakes for gluten-free, dairy-free or vegan diets?'
    )?.answer
    const paymentAnswer = CANONICAL_FAQS.find(
      (faq) => faq.question === 'How do I pay?'
    )?.answer
    const cancellationAnswer = CANONICAL_FAQS.find(
      (faq) => faq.question === 'What if I need to cancel or move my order?'
    )?.answer

    expect(dietaryAnswer).toContain(ALLERGEN_CROSS_CONTACT_POLICY)
    expect(paymentAnswer).toContain(DEPOSIT_AND_FINAL_PAYMENT_POLICY)
    expect(cancellationAnswer).toContain(REFUND_BEFORE_WORK_POLICY)
    expect(cancellationAnswer).toContain(REFUND_AFTER_WORK_POLICY)
    expect(cancellationAnswer).toContain(GIFT_HAMPER_REFUND_POLICY)
    expect(paymentAnswer).not.toMatch(/GBP200|50%|seven days/i)
    expect(cancellationAnswer).not.toMatch(/more than 14 days|refund half|inside 7 days/i)
  })

  it('ships a correctly sized FAQ social card', async () => {
    const socialCardPath = path.join(
      process.cwd(),
      'public',
      'images',
      'faqs',
      'faqs-social-card.png'
    )
    const metadata = await sharp(socialCardPath).metadata()

    expect(metadata.format).toBe('png')
    expect(metadata.width).toBe(1200)
    expect(metadata.height).toBe(630)
  })
})
