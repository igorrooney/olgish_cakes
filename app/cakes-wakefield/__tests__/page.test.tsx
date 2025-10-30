/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react'
import CakesWakefieldPage, { metadata } from '../page'

jest.mock('../../utils/fetchCakes', () => ({
  getAllCakes: jest.fn(() => Promise.resolve([]))
}))

jest.mock('../../components/CakeCard', () => ({
  __esModule: true,
  default: () => <div data-testid="cake-card">Cake Card</div>
}))

jest.mock('../../components/Breadcrumbs', () => ({
  Breadcrumbs: () => <nav data-testid="breadcrumbs">Breadcrumbs</nav>
}))

jest.mock('next/link', () => ({ 
  __esModule: true, 
  default: ({ children, href }: any) => <a href={href}>{children}</a> 
}))

jest.mock('next/script', () => ({ 
  __esModule: true, 
  default: ({ id, type, dangerouslySetInnerHTML }: any) => {
    const content = dangerouslySetInnerHTML?.__html
    return (
      <script
        data-testid={id}
        type={type}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }
}))

jest.mock('@mui/material', () => ({
  Container: ({ children }: any) => <div>{children}</div>,
  Typography: ({ children }: any) => <div>{children}</div>,
  Box: ({ children }: any) => <div>{children}</div>,
  Grid: ({ children }: any) => <div>{children}</div>,
  Paper: ({ children }: any) => <div>{children}</div>,
  Chip: ({ label }: any) => <span>{label}</span>,
  Button: ({ children }: any) => <button>{children}</button>
}))

describe('CakesWakefieldPage', () => {
  describe('Metadata', () => {
    it('should have optimized title with social proof', () => {
      expect(metadata.title).toContain('Wakefield')
      expect(metadata.title).toContain('5★ Rated')
      expect(metadata.title).toContain('Same-Day Delivery')
    })

    it('should have description with pricing and social proof', () => {
      expect(metadata.description).toContain('Wakefield')
      expect(metadata.description).toContain('£25')
      expect(metadata.description).toContain('127+ 5-star reviews')
      expect(metadata.description).toContain('Same-day delivery')
    })

    it('should have canonical URL', () => {
      expect(metadata.alternates?.canonical).toBe('https://olgishcakes.co.uk/cakes-wakefield')
    })

    it('should have OpenGraph data matching title', () => {
      expect(metadata.openGraph).toBeDefined()
      expect(metadata.openGraph?.title).toContain('5★ Rated')
    })
  })

  describe('Structured Data', () => {
    it('should include FAQ schema', async () => {
      const page = await CakesWakefieldPage()
      const { container } = render(page)
      
      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const faqScript = Array.from(scripts).find(script => 
        script.getAttribute('data-testid') === 'cakes-wakefield-faq'
      )
      
      expect(faqScript).toBeInTheDocument()
      
      if (faqScript) {
        const content = faqScript.getAttribute('dangerouslySetInnerHTML') || 
          (faqScript as any).innerHTML || 
          (faqScript.textContent || '')
        const schema = JSON.parse(content)
        
        expect(schema['@type']).toBe('FAQPage')
        expect(schema.mainEntity).toBeDefined()
        expect(schema.mainEntity.length).toBeGreaterThanOrEqual(4)
      }
    })

    it('should have FAQ questions about Wakefield delivery', async () => {
      const page = await CakesWakefieldPage()
      const { container } = render(page)
      
      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const faqScript = Array.from(scripts).find(script => 
        script.getAttribute('data-testid') === 'cakes-wakefield-faq'
      )
      
      if (faqScript) {
        const content = faqScript.getAttribute('dangerouslySetInnerHTML') || 
          (faqScript as any).innerHTML || 
          (faqScript.textContent || '')
        const schema = JSON.parse(content)
        
        const questions = schema.mainEntity.map((q: any) => q.name)
        expect(questions.some((q: string) => q.includes('Wakefield'))).toBe(true)
        expect(questions.some((q: string) => q.includes('delivery'))).toBe(true)
      }
    })

    it('should include aggregate rating in LocalBusiness schema', async () => {
      const page = await CakesWakefieldPage()
      const { container } = render(page)
      
      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const businessScript = Array.from(scripts).find(script => 
        script.getAttribute('data-testid') === 'cakes-wakefield-structured-data'
      )
      
      if (businessScript) {
        const content = businessScript.getAttribute('dangerouslySetInnerHTML') || 
          (businessScript as any).innerHTML || 
          (businessScript.textContent || '')
        const schema = JSON.parse(content)
        
        expect(schema.aggregateRating).toBeDefined()
        expect(schema.aggregateRating['@type']).toBe('AggregateRating')
        expect(schema.aggregateRating.ratingValue).toBe('5')
      }
    })
  })

  describe('Rendering', () => {
    it('should render without crashing', async () => {
      const page = await CakesWakefieldPage()
      expect(() => render(page)).not.toThrow()
    })

    it('should include structured data scripts', async () => {
      const page = await CakesWakefieldPage()
      const { container } = render(page)
      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      expect(scripts.length).toBeGreaterThanOrEqual(2) // LocalBusiness + FAQ
    })
  })
})


