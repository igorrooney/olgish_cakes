/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import GiftHampersPage, { metadata, revalidate, dynamic } from '../page'

// Mock utils
jest.mock('../../utils/fetchGiftHampers', () => ({
  getAllGiftHampers: jest.fn(() => Promise.resolve([
    {
      _id: '1',
      name: 'Deluxe Hamper',
      slug: { current: 'deluxe-hamper' },
      price: 45,
      category: 'Gift Hampers'
    }
  ]))
}))

jest.mock('../../utils/fetchCakes', () => ({
  getRevalidateTime: jest.fn(() => 60)
}))

jest.mock('../../utils/fetchTestimonials', () => ({
  getAllTestimonialsStats: jest.fn(() => Promise.resolve({ count: 127, averageRating: 5.0 }))
}))

// Mock Sanity
jest.mock('@/sanity/lib/image', () => ({
  urlFor: jest.fn(() => ({
    width: () => ({ height: () => ({ url: () => 'https://cdn.sanity.io/hamper.jpg' }) })
  }))
}))

// Mock components
jest.mock('../../components/GiftHamperCard', () => ({
  __esModule: true,
  default: () => <div data-testid="gift-hamper-card">Gift Hamper Card</div>
}))

jest.mock('../HeroSection', () => ({
  __esModule: true,
  default: () => <div data-testid="hero-section">Hero Section</div>
}))

jest.mock('../../components/Breadcrumbs', () => ({
  Breadcrumbs: () => <nav data-testid="breadcrumbs">Breadcrumbs</nav>
}))

jest.mock('@/lib/ui-components', () => ({
  StyledAccordion: ({ children, ...props }: any) => <div data-testid="styled-accordion" {...props}>{children}</div>
}))

// Mock MUI
jest.mock('@/lib/mui-optimization', () => ({
  Container: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Grid: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Typography: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Box: ({ children, ...props }: any) => <div {...props}>{children}</div>
}))

describe('GiftHampersPage', () => {
  describe('Static Configuration', () => {
    it('should have force-static dynamic', () => {
      expect(dynamic).toBe('force-static')
    })

    it('should use static revalidation time of 300 seconds', () => {
      // Changed to static revalidation as part of Next.js 16 upgrade
      expect(revalidate).toBe(300)
    })
  })

  describe('Metadata', () => {
    it('should have title', () => {
      expect(metadata.title).toContain('Gift Hampers')
    })

    it('should have description', () => {
      expect(metadata.description).toBeDefined()
      expect(metadata.description).toContain('hampers')
    })

    it('should have keywords', () => {
      expect(metadata.keywords).toBeDefined()
    })

    it('should have OpenGraph URL', () => {
      expect(metadata.openGraph?.url).toBe('https://olgishcakes.co.uk/gift-hampers')
    })

    it('should have canonical URL', () => {
      expect(metadata.alternates?.canonical).toBe('https://olgishcakes.co.uk/gift-hampers')
    })

    it('should have Google verification', () => {
      expect(metadata.verification?.google).toBeDefined()
    })

    it('should have geo metadata', () => {
      expect(metadata.other?.['geo.region']).toBe('GB-ENG')
      expect(metadata.other?.['geo.placename']).toBe('Leeds')
    })
  })

  describe('Data Fetching', () => {
    it('should fetch gift hampers', async () => {
      const { getAllGiftHampers } = require('../../utils/fetchGiftHampers')

      await GiftHampersPage()

      expect(getAllGiftHampers).toHaveBeenCalledWith(false)
    })

    it('should fetch testimonial stats', async () => {
      const { getAllTestimonialsStats } = require('../../utils/fetchTestimonials')

      await GiftHampersPage()

      expect(getAllTestimonialsStats).toHaveBeenCalled()
    })
  })

  describe('Rendering', () => {
    it('should render without crashing', async () => {
      const page = await GiftHampersPage()

      expect(() => render(page)).not.toThrow()
    })

    it('should render Hero Section', async () => {
      const page = await GiftHampersPage()

      render(page)

      expect(screen.getByTestId('hero-section')).toBeInTheDocument()
    })

    it('should render Breadcrumbs', async () => {
      const page = await GiftHampersPage()

      render(page)

      expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument()
    })

    it('should render hamper cards', async () => {
      const page = await GiftHampersPage()

      render(page)

      expect(screen.getByTestId('gift-hamper-card')).toBeInTheDocument()
    })
  })

  describe('Structured Data - GSC Compliance', () => {
    it('should have ItemList structured data', async () => {
      const page = await GiftHampersPage()
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const itemListScript = Array.from(scripts).find(script => 
        script.textContent?.includes('"@type":"ItemList"')
      )

      expect(itemListScript).toBeDefined()
    })

    it('should NOT have aggregateRating on individual products in ItemList', async () => {
      const page = await GiftHampersPage()
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const itemListScript = Array.from(scripts).find(script => 
        script.textContent?.includes('"@type":"ItemList"')
      )

      expect(itemListScript).toBeDefined()
      
      const jsonLd = JSON.parse(itemListScript!.textContent || '{}')
      
      // Verify ItemList exists
      expect(jsonLd['@type']).toBe('ItemList')
      
      // Verify products don't have aggregateRating (GSC fix for "multiple aggregate ratings" error)
      if (jsonLd.itemListElement && jsonLd.itemListElement.length > 0) {
        jsonLd.itemListElement.forEach((listItem: any) => {
          expect(listItem.item.aggregateRating).toBeUndefined()
        })
      }
    })

    it('should have offers with shipping and return policy on products', async () => {
      const page = await GiftHampersPage()
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const itemListScript = Array.from(scripts).find(script => 
        script.textContent?.includes('"@type":"ItemList"')
      )

      const jsonLd = JSON.parse(itemListScript!.textContent || '{}')
      
      if (jsonLd.itemListElement && jsonLd.itemListElement.length > 0) {
        const product = jsonLd.itemListElement[0].item
        
        // Verify offers exist
        expect(product.offers).toBeDefined()
        expect(product.offers['@type']).toBe('Offer')
        
        // Verify shipping details (GSC Merchant listings requirement)
        expect(product.offers.shippingDetails).toBeDefined()
        
        // Verify return policy (GSC Merchant listings requirement)
        expect(product.offers.hasMerchantReturnPolicy).toBeDefined()
      }
    })

    it('should have LocalBusiness with single aggregateRating', async () => {
      const page = await GiftHampersPage()
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const localBusinessScript = Array.from(scripts).find(script => 
        script.textContent?.includes('"@type":"LocalBusiness"')
      )

      expect(localBusinessScript).toBeDefined()
      
      const jsonLd = JSON.parse(localBusinessScript!.textContent || '{}')
      
      // Verify single aggregateRating exists at business level
      expect(jsonLd.aggregateRating).toBeDefined()
      expect(jsonLd.aggregateRating['@type']).toBe('AggregateRating')
      expect(jsonLd.aggregateRating.ratingValue).toBeDefined()
      expect(jsonLd.aggregateRating.reviewCount).toBeDefined()
    })

    it('should have breadcrumb structured data', async () => {
      const page = await GiftHampersPage()
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const breadcrumbScript = Array.from(scripts).find(script => 
        script.textContent?.includes('"@type":"BreadcrumbList"')
      )

      expect(breadcrumbScript).toBeDefined()
      
      const jsonLd = JSON.parse(breadcrumbScript!.textContent || '{}')
      expect(jsonLd['@type']).toBe('BreadcrumbList')
      expect(jsonLd.itemListElement).toHaveLength(2)
      expect(jsonLd.itemListElement[0].name).toBe('Home')
      expect(jsonLd.itemListElement[1].name).toBe('Gift Hampers')
    })

    it('should have FAQ structured data', async () => {
      const page = await GiftHampersPage()
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const faqScript = Array.from(scripts).find(script => 
        script.textContent?.includes('"@type":"FAQPage"')
      )

      expect(faqScript).toBeDefined()
    })
  })
})

