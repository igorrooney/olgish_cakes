/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render } from '@testing-library/react'
import {
  StructuredData,
  OrganizationStructuredData,
  LocalBusinessStructuredData,
  WebsiteStructuredData,
  WebPageStructuredData,
  BreadcrumbStructuredData,
  ProductStructuredData,
  FAQStructuredData,
  AggregateRatingStructuredData,
  ReviewStructuredData,
  ImageObjectStructuredData,
  ServiceStructuredData,
  EventStructuredData,
  ArticleStructuredData,
  HowToStructuredData,
  RecipeStructuredData
} from '../StructuredData'

// Mock all SEO utils
jest.mock('@/app/utils/seo', () => ({
  generateOrganizationSchema: jest.fn(() => ({ '@type': 'Organization', name: 'Olgish Cakes' })),
  generateLocalBusinessSchema: jest.fn(() => ({ '@type': 'LocalBusiness', name: 'Olgish Cakes' })),
  generateWebSiteSchema: jest.fn(() => ({ '@type': 'WebSite', url: 'https://olgishcakes.co.uk' })),
  generateWebPageSchema: jest.fn((data) => ({ '@type': 'WebPage', ...data })),
  generateBreadcrumbData: jest.fn((data) => ({ '@type': 'BreadcrumbList', itemListElement: data })),
  generateProductSchema: jest.fn((data) => ({ '@type': 'Product', ...data })),
  generateFAQSchema: jest.fn((data) => ({ '@type': 'FAQPage', mainEntity: data })),
  generateAggregateRatingSchema: jest.fn((rating, count) => ({ '@type': 'AggregateRating', ratingValue: rating })),
  generateReviewSchema: jest.fn((data) => ({ '@type': 'Review', ...data })),
  generateImageObjectSchema: jest.fn((data) => ({ '@type': 'ImageObject', ...data })),
  generateServiceSchema: jest.fn((data) => ({ '@type': 'Service', ...data })),
  generateEventSchema: jest.fn((data) => ({ '@type': 'Event', ...data })),
  generateArticleSchema: jest.fn((data) => ({ '@type': 'Article', ...data })),
  generateHowToSchema: jest.fn((data) => ({ '@type': 'HowTo', ...data })),
  generateRecipeSchema: jest.fn((data) => ({ '@type': 'Recipe', ...data }))
}))

describe('StructuredData', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
  })

  describe('Basic Functionality', () => {
    it('should render nothing visible', () => {
      const { container } = render(<StructuredData type="organization" data={{}} />)

      expect(container.firstChild).toBeNull()
    })

    it('should add script to document head', () => {
      render(<StructuredData type="organization" data={{}} />)

      const script = document.head.querySelector('script[type="application/ld+json"]')
      expect(script).toBeTruthy()
    })

    it('should generate organization schema', () => {
      render(<StructuredData type="organization" data={{}} />)

      const script = document.head.querySelector('script')
      const json = JSON.parse(script?.textContent || '{}')
      expect(json['@type']).toBe('Organization')
    })

    it('should remove script on unmount', () => {
      const { unmount } = render(<StructuredData type="organization" data={{}} id="test-script" />)

      expect(document.getElementById('test-script')).toBeTruthy()

      unmount()

      expect(document.getElementById('test-script')).toBeNull()
    })

    it('should replace existing script with same id', () => {
      const { rerender } = render(<StructuredData type="organization" data={{}} id="same-id" />)

      const firstScript = document.getElementById('same-id')
      
      rerender(<StructuredData type="localBusiness" data={{}} id="same-id" />)

      const scripts = document.querySelectorAll('#same-id')
      expect(scripts.length).toBe(1)
    })

    it('should generate unique id when not provided', () => {
      render(<StructuredData type="organization" data={{}} />)

      const script = document.head.querySelector('script')
      expect(script?.id).toContain('structured-data-organization')
    })
  })

  describe('Schema Types', () => {
    const allTypes = [
      'organization',
      'localBusiness',
      'website',
      'webpage',
      'breadcrumb',
      'product',
      'faq',
      'aggregateRating',
      'review',
      'imageObject',
      'service',
      'event',
      'article',
      'howTo',
      'recipe'
    ]

    allTypes.forEach(type => {
      it(`should handle ${type} type`, () => {
        const data = type === 'aggregateRating' ? { rating: 5, reviewCount: 10 } : {}
        render(<StructuredData type={type as any} data={data} />)

        const script = document.head.querySelector('script')
        expect(script).toBeTruthy()
      })
    })

    it('should return early for invalid type', () => {
      render(<StructuredData type={'invalid' as any} data={{}} />)

      const scripts = document.head.querySelectorAll('script')
      expect(scripts.length).toBe(0)
    })
  })

  describe('Convenience Components', () => {
    it('should render OrganizationStructuredData', () => {
      render(<OrganizationStructuredData />)

      const script = document.head.querySelector('script')
      expect(script).toBeTruthy()
    })

    it('should render LocalBusinessStructuredData', () => {
      render(<LocalBusinessStructuredData />)

      const script = document.head.querySelector('script')
      expect(script).toBeTruthy()
    })

    it('should render WebsiteStructuredData', () => {
      render(<WebsiteStructuredData />)

      const script = document.head.querySelector('script')
      expect(script).toBeTruthy()
    })

    it('should render WebPageStructuredData', () => {
      render(<WebPageStructuredData name="Test" description="Desc" url="/test" />)

      const script = document.head.querySelector('script')
      expect(script).toBeTruthy()
    })

    it('should render BreadcrumbStructuredData', () => {
      render(<BreadcrumbStructuredData items={[{ name: 'Home', url: '/' }]} />)

      const script = document.head.querySelector('script')
      expect(script).toBeTruthy()
    })

    it('should render ProductStructuredData', () => {
      render(<ProductStructuredData product={{ name: 'Test' }} />)

      const script = document.head.querySelector('script')
      expect(script).toBeTruthy()
    })

    it('should render FAQStructuredData', () => {
      render(<FAQStructuredData questions={[{ question: 'Q?', answer: 'A' }]} />)

      const script = document.head.querySelector('script')
      expect(script).toBeTruthy()
    })

    it('should render AggregateRatingStructuredData', () => {
      render(<AggregateRatingStructuredData rating={5} reviewCount={10} />)

      const script = document.head.querySelector('script')
      expect(script).toBeTruthy()
    })

    it('should render ReviewStructuredData', () => {
      render(<ReviewStructuredData review={{ author: 'Test' }} />)

      const script = document.head.querySelector('script')
      expect(script).toBeTruthy()
    })

    it('should render ImageObjectStructuredData', () => {
      render(<ImageObjectStructuredData image={{ url: '/test.jpg' }} />)

      const script = document.head.querySelector('script')
      expect(script).toBeTruthy()
    })

    it('should render ServiceStructuredData', () => {
      render(<ServiceStructuredData service={{ name: 'Test Service' }} />)

      const script = document.head.querySelector('script')
      expect(script).toBeTruthy()
    })

    it('should render EventStructuredData', () => {
      render(<EventStructuredData event={{ name: 'Test Event' }} />)

      const script = document.head.querySelector('script')
      expect(script).toBeTruthy()
    })

    it('should render ArticleStructuredData', () => {
      render(<ArticleStructuredData article={{ title: 'Test Article' }} />)

      const script = document.head.querySelector('script')
      expect(script).toBeTruthy()
    })

    it('should render HowToStructuredData', () => {
      render(<HowToStructuredData howTo={{ name: 'How To' }} />)

      const script = document.head.querySelector('script')
      expect(script).toBeTruthy()
    })

    it('should render RecipeStructuredData', () => {
      render(<RecipeStructuredData recipe={{ name: 'Recipe' }} />)

      const script = document.head.querySelector('script')
      expect(script).toBeTruthy()
    })
  })
})

