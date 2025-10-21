/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render } from '@testing-library/react'
import { CakeStructuredData } from '../CakeStructuredData'

// Mock dependencies
jest.mock('@/lib/google-merchant-center-schema', () => ({
  generateCakeMerchantCenterSchema: jest.fn((cake) => ({
    '@type': 'Product',
    name: cake.name,
    price: cake.pricing?.standard || 0
  }))
}))

describe('CakeStructuredData', () => {
  const mockCake = {
    name: 'Honey Cake',
    slug: { current: 'honey-cake' },
    pricing: { standard: 30, individual: 35 },
    structuredData: { enableProductSchema: true }
  }

  beforeEach(() => {
    document.head.innerHTML = ''
  })

  it('should render nothing visible', () => {
    const { container } = render(<CakeStructuredData cake={mockCake} />)

    expect(container.firstChild).toBeNull()
  })

  it('should add script when enableProductSchema is true', () => {
    render(<CakeStructuredData cake={mockCake} />)

    const script = document.getElementById('cake-structured-data')
    expect(script).toBeTruthy()
  })

  it('should not add script when enableProductSchema is false', () => {
    const cakeWithoutSchema = {
      ...mockCake,
      structuredData: { enableProductSchema: false }
    }

    render(<CakeStructuredData cake={cakeWithoutSchema} />)

    const script = document.getElementById('cake-structured-data')
    expect(script).toBeNull()
  })

  it('should not add script when structuredData is undefined', () => {
    const cakeWithoutStructuredData = {
      ...mockCake,
      structuredData: undefined
    }

    render(<CakeStructuredData cake={cakeWithoutStructuredData as any} />)

    const script = document.getElementById('cake-structured-data')
    expect(script).toBeNull()
  })

  it('should add keywords when available', () => {
    const cakeWithKeywords = {
      ...mockCake,
      seo: {
        keywords: ['honey cake', 'ukrainian cake', 'leeds']
      }
    }

    render(<CakeStructuredData cake={cakeWithKeywords as any} />)

    const script = document.getElementById('cake-structured-data')
    const json = JSON.parse(script?.textContent || '{}')
    expect(json.keywords).toBe('honey cake, ukrainian cake, leeds')
  })

  it('should not add keywords when not available', () => {
    render(<CakeStructuredData cake={mockCake} />)

    const script = document.getElementById('cake-structured-data')
    const json = JSON.parse(script?.textContent || '{}')
    expect(json.keywords).toBeUndefined()
  })

  it('should remove existing script before adding new one', () => {
    const { rerender } = render(<CakeStructuredData cake={mockCake} />)

    const firstScript = document.getElementById('cake-structured-data')
    const firstContent = firstScript?.textContent

    const updatedCake = { ...mockCake, name: 'Updated Cake' }
    rerender(<CakeStructuredData cake={updatedCake} />)

    const scripts = document.querySelectorAll('#cake-structured-data')
    expect(scripts.length).toBe(1)
  })

  it('should cleanup script on unmount', () => {
    const { unmount } = render(<CakeStructuredData cake={mockCake} />)

    expect(document.getElementById('cake-structured-data')).toBeTruthy()

    unmount()

    expect(document.getElementById('cake-structured-data')).toBeNull()
  })

  it('should create valid JSON-LD', () => {
    render(<CakeStructuredData cake={mockCake} />)

    const script = document.getElementById('cake-structured-data')
    expect(script?.getAttribute('type')).toBe('application/ld+json')
    expect(() => JSON.parse(script?.textContent || '{}')).not.toThrow()
  })
})

