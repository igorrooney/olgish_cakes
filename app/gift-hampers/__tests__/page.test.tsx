/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import GiftHampersPage, { dynamic, metadata, revalidate } from '../page'

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
jest.mock('@/lib/schema-constants', () => ({
  BRAND_ID: 'https://olgishcakes.co.uk/#brand'
}))

jest.mock('@/lib/constants', () => ({
  BUSINESS_CONSTANTS: {
    NAME: 'Olgish Cakes',
    WEBSITE: 'https://olgishcakes.co.uk'
  }
}))

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
      
      // Extract ItemList from @graph if present
      const itemList = jsonLd['@graph'] 
        ? jsonLd['@graph'].find((item: any) => item['@type'] === 'ItemList')
        : jsonLd
      
      // Verify ItemList exists
      expect(itemList['@type']).toBe('ItemList')
      
      // Verify products don't have aggregateRating (GSC fix for "multiple aggregate ratings" error)
      if (itemList.itemListElement && itemList.itemListElement.length > 0) {
        itemList.itemListElement.forEach((listItem: any) => {
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

    describe('Brand Field Duplication Prevention', () => {
      it('should use @graph format for ItemList structured data', async () => {
        const page = await GiftHampersPage()
        const { container } = render(page)

        const scripts = container.querySelectorAll('script[type="application/ld+json"]')
        const itemListScript = Array.from(scripts).find(script => 
          script.textContent?.includes('"@type":"ItemList"') || script.textContent?.includes('"@graph"')
        )

        expect(itemListScript).toBeDefined()
        
        const jsonLd = JSON.parse(itemListScript!.textContent || '{}')
        
        // Should use @graph format to prevent duplicate brand fields
        expect(jsonLd['@graph']).toBeDefined()
        expect(Array.isArray(jsonLd['@graph'])).toBe(true)
      })

      it('should have exactly one Brand entity in @graph', async () => {
        const page = await GiftHampersPage()
        const { container } = render(page)

        const scripts = container.querySelectorAll('script[type="application/ld+json"]')
        const itemListScript = Array.from(scripts).find(script => 
          script.textContent?.includes('"@graph"')
        )

        expect(itemListScript).toBeDefined()
        
        const jsonLd = JSON.parse(itemListScript!.textContent || '{}')
        const graph = jsonLd['@graph'] || []
        
        // Count Brand entities
        const brandEntities = graph.filter((entity: any) => entity['@type'] === 'Brand')
        
        // Should have exactly one Brand entity
        expect(brandEntities).toHaveLength(1)
        
        // Brand should have unique @id
        expect(brandEntities[0]['@id']).toBe('https://olgishcakes.co.uk/#brand')
        expect(brandEntities[0].name).toBe('Olgish Cakes')
      })

      it('should reference brand by @id in all products, not inline objects', async () => {
        const page = await GiftHampersPage()
        const { container } = render(page)

        const scripts = container.querySelectorAll('script[type="application/ld+json"]')
        const itemListScript = Array.from(scripts).find(script => 
          script.textContent?.includes('"@graph"')
        )

        expect(itemListScript).toBeDefined()
        
        const jsonLd = JSON.parse(itemListScript!.textContent || '{}')
        const graph = jsonLd['@graph'] || []
        
        // Find ItemList
        const itemList = graph.find((entity: any) => entity['@type'] === 'ItemList')
        expect(itemList).toBeDefined()
        
        // Check all products in ItemList
        if (itemList?.itemListElement && itemList.itemListElement.length > 0) {
          itemList.itemListElement.forEach((listItem: any) => {
            const product = listItem.item
            
            // Brand should be a reference by @id, not an inline object
            expect(product.brand).toBeDefined()
            expect(product.brand['@id']).toBe('https://olgishcakes.co.uk/#brand')
            
            // Should NOT have inline brand object with @type
            expect(product.brand['@type']).toBeUndefined()
            expect(product.brand.name).toBeUndefined()
          })
        }
      })

      it('should NOT have duplicate brand fields in structured data', async () => {
        const page = await GiftHampersPage()
        const { container } = render(page)

        const scripts = container.querySelectorAll('script[type="application/ld+json"]')
        const itemListScript = Array.from(scripts).find(script => 
          script.textContent?.includes('"@graph"')
        )

        expect(itemListScript).toBeDefined()
        
        const jsonLd = JSON.parse(itemListScript!.textContent || '{}')
        const graph = jsonLd['@graph'] || []
        
        // Find ItemList
        const itemList = graph.find((entity: any) => entity['@type'] === 'ItemList')
        expect(itemList).toBeDefined()
        
        // Count inline brand objects (should be 0)
        let inlineBrandCount = 0
        
        if (itemList?.itemListElement && itemList.itemListElement.length > 0) {
          itemList.itemListElement.forEach((listItem: any) => {
            const product = listItem.item
            
            // Check if brand is an inline object (has @type)
            if (product.brand && product.brand['@type'] === 'Brand') {
              inlineBrandCount++
            }
          })
        }
        
        // Should have 0 inline brand objects (all should use @id references)
        expect(inlineBrandCount).toBe(0)
      })

      it('should have consistent brand @id across all structured data', async () => {
        const page = await GiftHampersPage()
        const { container } = render(page)

        const scripts = container.querySelectorAll('script[type="application/ld+json"]')
        const itemListScript = Array.from(scripts).find(script => 
          script.textContent?.includes('"@graph"')
        )

        expect(itemListScript).toBeDefined()
        
        const jsonLd = JSON.parse(itemListScript!.textContent || '{}')
        const graph = jsonLd['@graph'] || []
        
        // Find Brand entity
        const brandEntity = graph.find((entity: any) => entity['@type'] === 'Brand')
        expect(brandEntity).toBeDefined()
        const brandId = brandEntity['@id']
        
        // Find ItemList
        const itemList = graph.find((entity: any) => entity['@type'] === 'ItemList')
        expect(itemList).toBeDefined()
        
        // Verify all products reference the same brand @id
        if (itemList?.itemListElement && itemList.itemListElement.length > 0) {
          itemList.itemListElement.forEach((listItem: any) => {
            const product = listItem.item
            
            expect(product.brand['@id']).toBe(brandId)
          })
        }
      })
    })
  })
})

