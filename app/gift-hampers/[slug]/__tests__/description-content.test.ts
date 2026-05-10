import { getGiftHamperVisibleDescriptionText, giftHamperVisibleDescriptionFallback } from '../description-content'
import type { GiftHamper } from '@/types/giftHamper'

const baseHamper: GiftHamper = {
  _id: 'hamper-1',
  _createdAt: '2026-01-01T00:00:00.000Z',
  name: 'Test Hamper',
  slug: { current: 'test-hamper' },
  price: 45
}

describe('getGiftHamperVisibleDescriptionText', () => {
  it('uses description when description has content', () => {
    const hamper: GiftHamper = {
      ...baseHamper,
      description: [
        {
          _type: 'block',
          children: [
            { text: '  Full' },
            { text: ' description  ' }
          ]
        },
        {
          _type: 'block',
          children: [
            { text: 'Second line' }
          ]
        }
      ],
      shortDescription: [
        {
          _type: 'block',
          children: [
            { text: 'Short description should not be used' }
          ]
        }
      ]
    }

    expect(getGiftHamperVisibleDescriptionText(hamper)).toBe('Full description Second line')
  })

  it('uses shortDescription when description is missing or empty', () => {
    const hamper: GiftHamper = {
      ...baseHamper,
      description: [],
      shortDescription: [
        {
          _type: 'block',
          children: [
            { text: '  Short description from CMS  ' }
          ]
        }
      ]
    }

    expect(getGiftHamperVisibleDescriptionText(hamper)).toBe('Short description from CMS')
  })

  it('returns fallback when both description and shortDescription are missing', () => {
    expect(getGiftHamperVisibleDescriptionText(baseHamper)).toBe(giftHamperVisibleDescriptionFallback)
  })

  it('uses shortDescription when description normalizes to empty text', () => {
    const hamper: GiftHamper = {
      ...baseHamper,
      description: [
        {
          _type: 'block',
          children: [
            { text: '   ' }
          ]
        }
      ],
      shortDescription: [
        {
          _type: 'block',
          children: [
            { text: '  Visible short description  ' }
          ]
        }
      ]
    }

    expect(getGiftHamperVisibleDescriptionText(hamper)).toBe('Visible short description')
  })

  it('returns fallback when selected source normalizes to empty text', () => {
    const hamper: GiftHamper = {
      ...baseHamper,
      description: [
        {
          _type: 'block',
          children: [
            { text: '   ' }
          ]
        }
      ]
    }

    expect(getGiftHamperVisibleDescriptionText(hamper)).toBe(giftHamperVisibleDescriptionFallback)
  })
})
