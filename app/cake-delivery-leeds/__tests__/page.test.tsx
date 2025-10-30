/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import CakeDeliveryLeedsPage, { metadata } from '../page'

jest.mock('../../components/Breadcrumbs', () => ({
  Breadcrumbs: ({ items }: any) => (
    <nav data-testid="breadcrumbs">
      {items.map((item: any, idx: number) => (
        <span key={idx} data-testid={`breadcrumb-${idx}`}>
          {item.label}
        </span>
      ))}
    </nav>
  )
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  )
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
  Container: ({ children, ...props }: any) => <div data-testid="container" {...props}>{children}</div>,
  Typography: ({ children, component, ...props }: any) => {
    const Tag = component || 'div'
    const { itemProp, ...validProps } = props
    return <Tag data-testid="typography" {...validProps}>{children}</Tag>
  },
  Box: ({ children, ...props }: any) => <div data-testid="box" {...props}>{children}</div>,
  Grid: ({ children, ...props }: any) => <div data-testid="grid" {...props}>{children}</div>,
  Paper: ({ children, ...props }: any) => <div data-testid="paper" {...props}>{children}</div>,
  Chip: ({ label, ...props }: any) => <span data-testid="chip" {...props}>{label}</span>,
  Button: ({ children, component, href, ...props }: any) => {
    const Component = component || 'button'
    return <Component href={href} {...props}>{children}</Component>
  }
}))

jest.mock('@/lib/constants', () => ({
  BUSINESS_CONSTANTS: {
    PHONE: '+44 786 721 8194'
  }
}))

describe('CakeDeliveryLeedsPage', () => {
  describe('Metadata', () => {
    it('should have correct title', () => {
      expect(metadata.title).toBe('Cake Delivery Leeds | Same-Day Delivery | 5★ Rated')
    })

    it('should have optimized description with pricing and social proof', () => {
      expect(metadata.description).toContain('cake delivery Leeds')
      expect(metadata.description).toContain('£5')
      expect(metadata.description).toContain('127+ 5-star reviews')
      expect(metadata.description).toContain('Same-day')
    })

    it('should have location-specific keywords', () => {
      expect(metadata.keywords).toContain('cake delivery Leeds')
      expect(metadata.keywords).toContain('same day cake delivery Leeds')
    })

    it('should have canonical URL', () => {
      expect(metadata.alternates?.canonical).toBe('https://olgishcakes.co.uk/cake-delivery-leeds')
    })

    it('should have OpenGraph data', () => {
      expect(metadata.openGraph).toBeDefined()
      expect(metadata.openGraph?.title).toBe('Cake Delivery Leeds | Same-Day Delivery | 5★ Rated')
      expect(metadata.openGraph?.url).toBe('https://olgishcakes.co.uk/cake-delivery-leeds')
    })

    it('should have Twitter card', () => {
      expect(metadata.twitter).toBeDefined()
      expect(metadata.twitter?.card).toBe('summary_large_image')
    })

    it('should have geo-targeting metadata', () => {
      expect(metadata.other?.['geo.region']).toBe('GB-ENG')
      expect(metadata.other?.['geo.placename']).toBe('Leeds')
    })

    it('should have verification tag', () => {
      expect(metadata.verification?.google).toBeDefined()
    })
  })

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const page = CakeDeliveryLeedsPage()
      expect(() => render(page)).not.toThrow()
    })

    it('should render breadcrumbs', () => {
      const page = CakeDeliveryLeedsPage()
      const { container } = render(page)
      expect(container.querySelector('[data-testid="breadcrumbs"]')).toBeInTheDocument()
    })

    it('should render main heading', () => {
      const page = CakeDeliveryLeedsPage()
      render(page)
      const headings = screen.getAllByTestId('typography')
      const h1Heading = headings.find(el => 
        el.textContent?.includes('Same-Day Cake Delivery Leeds')
      )
      expect(h1Heading).toBeInTheDocument()
    })

    it('should render delivery zones section', () => {
      const page = CakeDeliveryLeedsPage()
      const { container } = render(page)
      const papers = container.querySelectorAll('[data-testid="paper"]')
      expect(papers.length).toBeGreaterThan(0)
    })

    it('should render call-to-action buttons', () => {
      const page = CakeDeliveryLeedsPage()
      render(page)
      const links = screen.getAllByRole('link')
      const orderLink = links.find(link => 
        link.textContent?.includes('Order Cake Delivery')
      )
      expect(orderLink).toBeInTheDocument()
    })
  })

  describe('Structured Data', () => {
    it('should include Service schema', () => {
      const page = CakeDeliveryLeedsPage()
      const { container } = render(page)
      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      
      const serviceScript = Array.from(scripts).find(script => 
        script.getAttribute('data-testid') === 'cake-delivery-leeds-service-schema'
      )
      
      expect(serviceScript).toBeInTheDocument()
      
      if (serviceScript) {
        const content = serviceScript.getAttribute('dangerouslySetInnerHTML') || 
          (serviceScript as any).innerHTML || 
          (serviceScript.textContent || '')
        const schema = JSON.parse(content)
        
        expect(schema['@type']).toBe('Service')
        expect(schema.name).toBe('Cake Delivery Leeds')
        expect(schema.provider).toBeDefined()
        expect(schema.provider['@type']).toBe('Bakery')
      }
    })

    it('should include FAQ schema', () => {
      const page = CakeDeliveryLeedsPage()
      const { container } = render(page)
      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      
      const faqScript = Array.from(scripts).find(script => 
        script.getAttribute('data-testid') === 'cake-delivery-leeds-faq'
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

    it('should have FAQ questions about Leeds delivery', () => {
      const page = CakeDeliveryLeedsPage()
      const { container } = render(page)
      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      
      const faqScript = Array.from(scripts).find(script => 
        script.getAttribute('data-testid') === 'cake-delivery-leeds-faq'
      )
      
      if (faqScript) {
        const content = faqScript.getAttribute('dangerouslySetInnerHTML') || 
          (faqScript as any).innerHTML || 
          (faqScript.textContent || '')
        const schema = JSON.parse(content)
        
        const questions = schema.mainEntity.map((q: any) => q.name)
        expect(questions.some((q: string) => q.includes('Leeds'))).toBe(true)
        expect(questions.some((q: string) => q.includes('delivery'))).toBe(true)
        expect(questions.some((q: string) => q.includes('cost'))).toBe(true)
      }
    })

    it('should include aggregate rating in Service schema', () => {
      const page = CakeDeliveryLeedsPage()
      const { container } = render(page)
      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      
      const serviceScript = Array.from(scripts).find(script => 
        script.getAttribute('data-testid') === 'cake-delivery-leeds-service-schema'
      )
      
      if (serviceScript) {
        const content = serviceScript.getAttribute('dangerouslySetInnerHTML') || 
          (serviceScript as any).innerHTML || 
          (serviceScript.textContent || '')
        const schema = JSON.parse(content)
        
        expect(schema.provider.aggregateRating).toBeDefined()
        expect(schema.provider.aggregateRating['@type']).toBe('AggregateRating')
        expect(schema.provider.aggregateRating.ratingValue).toBe('5')
      }
    })

    it('should include delivery offers in Service schema', () => {
      const page = CakeDeliveryLeedsPage()
      const { container } = render(page)
      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      
      const serviceScript = Array.from(scripts).find(script => 
        script.getAttribute('data-testid') === 'cake-delivery-leeds-service-schema'
      )
      
      if (serviceScript) {
        const content = serviceScript.getAttribute('dangerouslySetInnerHTML') || 
          (serviceScript as any).innerHTML || 
          (serviceScript.textContent || '')
        const schema = JSON.parse(content)
        
        expect(schema.hasOfferCatalog).toBeDefined()
        expect(schema.hasOfferCatalog['@type']).toBe('OfferCatalog')
        expect(schema.hasOfferCatalog.itemListElement).toBeDefined()
        expect(schema.hasOfferCatalog.itemListElement.length).toBeGreaterThan(0)
      }
    })
  })

  describe('SEO Elements', () => {
    it('should have delivery zones with pricing information', () => {
      const page = CakeDeliveryLeedsPage()
      const { container } = render(page)
      
      // Check that zone pricing is present
      const content = container.textContent || ''
      expect(content).toMatch(/£5|£8|£12|£15/)
    })

    it('should include same-day delivery information', () => {
      const page = CakeDeliveryLeedsPage()
      const { container } = render(page)
      const content = container.textContent || ''
      
      expect(content).toMatch(/same-day|same day/i)
      expect(content).toMatch(/10am|10 am/i)
    })

    it('should include Leeds postcodes information', () => {
      const page = CakeDeliveryLeedsPage()
      const { container } = render(page)
      const content = container.textContent || ''
      
      expect(content).toMatch(/LS\d+/)
    })

    it('should have internal links to related pages', () => {
      const page = CakeDeliveryLeedsPage()
      render(page)
      const links = screen.getAllByRole('link')
      
      const contactLink = links.find(link => link.getAttribute('href') === '/contact')
      const cakesLink = links.find(link => link.getAttribute('href') === '/cakes')
      const deliveryAreasLink = links.find(link => link.getAttribute('href') === '/delivery-areas')
      
      expect(contactLink).toBeInTheDocument()
      expect(cakesLink).toBeInTheDocument()
      expect(deliveryAreasLink).toBeInTheDocument()
    })
  })

  describe('Content Structure', () => {
    it('should have delivery process steps', () => {
      const page = CakeDeliveryLeedsPage()
      const { container } = render(page)
      const content = container.textContent || ''
      
      expect(content).toMatch(/Order|Place Your Order/i)
      expect(content).toMatch(/Preparation|Prep/i)
      expect(content).toMatch(/Delivery/i)
    })

    it('should have delivery zones section', () => {
      const page = CakeDeliveryLeedsPage()
      const { container } = render(page)
      const content = container.textContent || ''
      
      expect(content).toMatch(/Zone|delivery zones/i)
      expect(content).toMatch(/City Centre|Leeds/i)
    })

    it('should explain why choose our delivery service', () => {
      const page = CakeDeliveryLeedsPage()
      const { container } = render(page)
      const content = container.textContent || ''
      
      expect(content).toMatch(/Why Choose|why choose/i)
      expect(content).toMatch(/Local|Personal|Specialized/i)
    })
  })
})

