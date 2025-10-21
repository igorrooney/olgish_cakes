/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render } from '@testing-library/react'
import { GiftHamperStructuredData } from '../GiftHamperStructuredData'

// Mock dependencies
jest.mock('@/lib/google-merchant-center-schema', () => ({
  generateHamperMerchantCenterSchema: jest.fn((hamper) => ({
    '@type': 'Product',
    name: hamper.name,
    price: hamper.price || 0
  }))
}))

describe('GiftHamperStructuredData', () => {
  const mockHamper = {
    _id: 'hamper-1',
    name: 'Deluxe Hamper',
    slug: { current: 'deluxe-hamper' },
    price: 45,
    structuredData: { enableProductSchema: true }
  }

  beforeEach(() => {
    document.head.innerHTML = ''
  })

  it('should render nothing visible', () => {
    const { container } = render(<GiftHamperStructuredData hamper={mockHamper} />)

    expect(container.firstChild).toBeNull()
  })

  it('should add script when enableProductSchema is true', () => {
    render(<GiftHamperStructuredData hamper={mockHamper} />)

    const script = document.getElementById('hamper-structured-data')
    expect(script).toBeTruthy()
  })

  it('should not add script when enableProductSchema is false', () => {
    const hamperWithoutSchema = {
      ...mockHamper,
      structuredData: { enableProductSchema: false }
    }

    render(<GiftHamperStructuredData hamper={hamperWithoutSchema} />)

    const script = document.getElementById('hamper-structured-data')
    expect(script).toBeNull()
  })

  it('should not add script when structuredData is undefined', () => {
    const hamperWithoutStructuredData = {
      ...mockHamper,
      structuredData: undefined
    }

    render(<GiftHamperStructuredData hamper={hamperWithoutStructuredData as any} />)

    const script = document.getElementById('hamper-structured-data')
    expect(script).toBeNull()
  })

  it('should add keywords when available', () => {
    const hamperWithKeywords = {
      ...mockHamper,
      seo: {
        keywords: ['gift hamper', 'ukrainian gifts', 'leeds']
      }
    }

    render(<GiftHamperStructuredData hamper={hamperWithKeywords as any} />)

    const script = document.getElementById('hamper-structured-data')
    const json = JSON.parse(script?.textContent || '{}')
    expect(json.keywords).toBe('gift hamper, ukrainian gifts, leeds')
  })

  it('should not add keywords when not available', () => {
    render(<GiftHamperStructuredData hamper={mockHamper} />)

    const script = document.getElementById('hamper-structured-data')
    const json = JSON.parse(script?.textContent || '{}')
    expect(json.keywords).toBeUndefined()
  })

  it('should remove existing script before adding new one', () => {
    const { rerender } = render(<GiftHamperStructuredData hamper={mockHamper} />)

    rerender(<GiftHamperStructuredData hamper={{ ...mockHamper, name: 'Updated Hamper' }} />)

    const scripts = document.querySelectorAll('#hamper-structured-data')
    expect(scripts.length).toBe(1)
  })

  it('should cleanup script on unmount', () => {
    const { unmount } = render(<GiftHamperStructuredData hamper={mockHamper} />)

    expect(document.getElementById('hamper-structured-data')).toBeTruthy()

    unmount()

    expect(document.getElementById('hamper-structured-data')).toBeNull()
  })

  it('should create valid JSON-LD', () => {
    render(<GiftHamperStructuredData hamper={mockHamper} />)

    const script = document.getElementById('hamper-structured-data')
    expect(script?.getAttribute('type')).toBe('application/ld+json')
    expect(() => JSON.parse(script?.textContent || '{}')).not.toThrow()
  })
})

