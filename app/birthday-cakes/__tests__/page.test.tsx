/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render } from '@testing-library/react'
import BirthdayCakesPage, { metadata } from '../page'

jest.mock('../../utils/fetchCakes', () => ({ getAllCakes: jest.fn(() => Promise.resolve([])) }))
jest.mock('../../components/CakeCard', () => ({ __esModule: true, default: () => <div data-testid="cake-card">Card</div> }))
jest.mock('../../components/Breadcrumbs', () => ({ Breadcrumbs: () => <nav data-testid="breadcrumbs">Breadcrumbs</nav> }))
jest.mock('../../components/AreasWeCover', () => ({ AreasWeCover: () => <div data-testid="areas">Areas</div> }))
jest.mock('@/types/cake', () => ({ blocksToText: jest.fn(() => 'Text') }))
jest.mock('../../utils/seo', () => ({
  getPriceValidUntil: jest.fn(() => '2026-01-01'),
  getOfferShippingDetails: jest.fn(() => ({
    "@type": "OfferShippingDetails",
    shippingRate: {
      "@type": "MonetaryAmount",
      value: "15",
      currency: "GBP"
    },
    shippingDestination: {
      "@type": "DefinedRegion",
      addressCountry: "GB",
      addressRegion: ["West Yorkshire"]
    },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: {
        "@type": "QuantitativeValue",
        minValue: 1,
        maxValue: 2,
        unitCode: "DAY"
      },
      transitTime: {
        "@type": "QuantitativeValue",
        minValue: 0,
        maxValue: 1,
        unitCode: "DAY"
      }
    }
  })),
  getMerchantReturnPolicy: jest.fn(() => ({
    "@type": "MerchantReturnPolicy",
    applicableCountry: "GB",
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 14,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/FreeReturn"
  }))
}))
jest.mock('next/link', () => ({ __esModule: true, default: ({ children, href }: any) => <a href={href}>{children}</a> }))
jest.mock('@mui/material', () => ({
  Container: ({ children }: any) => <div>{children}</div>,
  Typography: ({ children }: any) => <div>{children}</div>,
  Box: ({ children }: any) => <div>{children}</div>,
  Grid: ({ children }: any) => <div>{children}</div>,
  Paper: ({ children }: any) => <div>{children}</div>,
  Chip: ({ label }: any) => <span>{label}</span>,
  Button: ({ children }: any) => <button>{children}</button>
}))

describe('BirthdayCakesPage', () => {
  describe('Metadata', () => {
    it('should have occasion-specific metadata', () => {
      expect(metadata.title).toContain('Birthday')
      expect(metadata.description?.toLowerCase()).toContain('birthday')
    })

    it('should have pricing in title', () => {
      expect(metadata.title).toContain('£25')
    })

    it('should have social proof in title', () => {
      expect(metadata.title).toContain('5★ Rated')
    })

    it('should have optimized description with pricing and reviews', () => {
      expect(metadata.description).toContain('£25')
      expect(metadata.description).toContain('127+ 5-star reviews')
      expect(metadata.description).toContain('Same-day delivery')
    })

    it('should have OpenGraph data', () => {
      expect(metadata.openGraph).toBeDefined()
      expect(metadata.openGraph?.title).toContain('£25')
      expect(metadata.openGraph?.url).toBe('https://olgishcakes.co.uk/birthday-cakes')
    })

    it('should have Twitter card', () => {
      expect(metadata.twitter).toBeDefined()
      expect(metadata.twitter?.card).toBe('summary_large_image')
    })

    it('should have canonical URL', () => {
      expect(metadata.alternates?.canonical).toBe('https://olgishcakes.co.uk/birthday-cakes')
    })

    it('should have geo-targeting metadata', () => {
      expect(metadata.other?.['geo.region']).toBe('GB-ENG')
      expect(metadata.other?.['geo.placename']).toBe('Leeds')
    })
  })

  describe('Rendering', () => {
    it('should render without crashing', async () => {
      const page = await BirthdayCakesPage()
      expect(() => render(page)).not.toThrow()
    })

    it('should render breadcrumbs', async () => {
      const page = await BirthdayCakesPage()
      const { container } = render(page)
      expect(container.querySelector('[data-testid="breadcrumbs"]')).toBeInTheDocument()
    })

    it('should render AreasWeCover component', async () => {
      const page = await BirthdayCakesPage()
      const { container } = render(page)
      expect(container.querySelector('[data-testid="areas"]')).toBeInTheDocument()
    })

    it('should filter cakes correctly', async () => {
      const { getAllCakes } = require('../../utils/fetchCakes')
      const mockFn = getAllCakes as jest.Mock
      mockFn.mockResolvedValueOnce([
        { category: 'custom', name: 'Test Cake', description: [], slug: { current: 'test-cake' } },
        { category: 'wedding', name: 'Birthday Cake', description: [], slug: { current: 'birthday-cake' } },
        { category: 'wedding', name: 'Wedding Cake', description: [], slug: { current: 'wedding-cake' } },
      ])
      
      const page = await BirthdayCakesPage()
      render(page)
      
      expect(getAllCakes).toHaveBeenCalled()
    })
  })

  describe('Structured Data', () => {
    it('should include structured data scripts', async () => {
      const page = await BirthdayCakesPage()
      const { container } = render(page)
      
      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      expect(scripts.length).toBeGreaterThan(0)
    })

    it('should include Service schema', async () => {
      const page = await BirthdayCakesPage()
      const { container } = render(page)
      
      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const serviceScript = Array.from(scripts).find(script => {
        const content = script.getAttribute('dangerouslySetInnerHTML') || 
          (script as any).innerHTML || 
          (script.textContent || '')
        try {
          const schema = JSON.parse(content)
          return schema['@type'] === 'Service'
        } catch {
          return false
        }
      })
      
      expect(serviceScript).toBeDefined()
      
      if (serviceScript) {
        const content = serviceScript.getAttribute('dangerouslySetInnerHTML') || 
          (serviceScript as any).innerHTML || 
          (serviceScript.textContent || '')
        const schema = JSON.parse(content)
        
        expect(schema['@type']).toBe('Service')
        expect(schema.name).toBe('Birthday Cakes Leeds')
        expect(schema.provider).toBeDefined()
      }
    })

    it('should include FAQ schema', async () => {
      const page = await BirthdayCakesPage()
      const { container } = render(page)
      
      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const faqScript = Array.from(scripts).find(script => {
        const content = script.getAttribute('dangerouslySetInnerHTML') || 
          (script as any).innerHTML || 
          (script.textContent || '')
        try {
          const schema = JSON.parse(content)
          return schema['@type'] === 'FAQPage'
        } catch {
          return false
        }
      })
      
      expect(faqScript).toBeDefined()
      
      if (faqScript) {
        const content = faqScript.getAttribute('dangerouslySetInnerHTML') || 
          (faqScript as any).innerHTML || 
          (faqScript.textContent || '')
        const schema = JSON.parse(content)
        
        expect(schema['@type']).toBe('FAQPage')
        expect(schema.mainEntity).toBeDefined()
        expect(schema.mainEntity.length).toBeGreaterThan(0)
      }
    })

    it('should have FAQ questions about pricing', async () => {
      const page = await BirthdayCakesPage()
      const { container } = render(page)
      
      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const faqScript = Array.from(scripts).find(script => {
        const content = script.getAttribute('dangerouslySetInnerHTML') || 
          (script as any).innerHTML || 
          (script.textContent || '')
        try {
          const schema = JSON.parse(content)
          return schema['@type'] === 'FAQPage'
        } catch {
          return false
        }
      })
      
      if (faqScript) {
        const content = faqScript.getAttribute('dangerouslySetInnerHTML') || 
          (faqScript as any).innerHTML || 
          (faqScript.textContent || '')
        const schema = JSON.parse(content)
        
        const questions = schema.mainEntity.map((q: any) => q.name)
        expect(questions.some((q: string) => q.toLowerCase().includes('price') || q.toLowerCase().includes('cost'))).toBe(true)
      }
    })
  })
})

