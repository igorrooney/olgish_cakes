/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import type { Testimonial } from '@/app/types/testimonial'
import type { InstagramPost } from '@/app/types/instagram'
import type { MarketSchedule } from '@/app/types/marketSchedule'
import type { DisplayCollection } from '../occasions.types'
import { DeferredBestsellersCarousel } from '../DeferredBestsellersCarousel'
import { DeferredInstagramCarousel } from '../DeferredInstagramCarousel'
import { DeferredMarketsClient } from '../DeferredMarketsClient'
import { DeferredOccasionsClient } from '../DeferredOccasionsClient'
import { DeferredReviewsCarousel } from '../DeferredReviewsCarousel'
import { HomeEnquiryFormInner } from '../HomeEnquiryFormInner'

const dynamicPropsMock = jest.fn()

function MockDynamicComponent(props: Record<string, unknown>) {
  dynamicPropsMock(props)
  return <div data-testid='dynamic-component' />
}

jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => MockDynamicComponent
}))

jest.mock('@/app/providers', () => ({
  Providers: ({ children }: { children: ReactNode }) => (
    <div data-testid='query-providers'>{children}</div>
  )
}))

const enquiryFormMock = jest.fn(() => <div data-testid='enquiry-form' />)

jest.mock('../EnquiryForm', () => ({
  EnquiryForm: (props: unknown) => enquiryFormMock(props)
}))

const testimonial: Testimonial = {
  _id: 'testimonial-1',
  _type: 'testimonial',
  _createdAt: '2026-01-01T00:00:00Z',
  _updatedAt: '2026-01-01T00:00:00Z',
  customerName: 'Olha',
  cakeType: 'Honey cake',
  rating: 5,
  date: '2026-01-10',
  text: 'Lovely cake',
  source: 'google'
}

const instagramPost: InstagramPost = {
  id: 'instagram-1',
  imageUrl: 'https://example.com/post.jpg',
  permalink: 'https://instagram.com/p/post',
  mediaType: 'IMAGE'
}

const market: MarketSchedule = {
  _id: 'market-1',
  title: 'Leeds Market',
  location: 'Leeds',
  googleMapsUrl: 'https://maps.example.com/leeds',
  date: '2099-04-01',
  startTime: '09:00',
  endTime: '14:00',
  active: true,
  featured: false,
  weatherDependent: false
}

const collection: DisplayCollection = {
  _id: 'collection-1',
  name: 'Birthday Cakes',
  imageUrl: 'https://example.com/collection.jpg',
  imageAlt: 'Birthday cakes',
  href: '/birthday-cakes'
}
describe('Deferred homepage client wrappers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('passes testimonials to the deferred reviews carousel', () => {
    render(<DeferredReviewsCarousel testimonials={[testimonial]} />)

    expect(dynamicPropsMock.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        testimonials: [testimonial]
      })
    )
    expect(screen.getByTestId('dynamic-component')).toBeInTheDocument()
  })

  it('passes Instagram props to the deferred carousel', () => {
    render(
      <DeferredInstagramCarousel
        posts={[instagramPost]}
        profileUrl='https://instagram.com/olgish_cakes'
        profileName='Olgish Cakes'
        profileHandle='@olgish_cakes'
      />
    )

    expect(dynamicPropsMock.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        posts: [instagramPost],
        profileUrl: 'https://instagram.com/olgish_cakes',
        profileName: 'Olgish Cakes',
        profileHandle: '@olgish_cakes'
      })
    )
  })

  it('passes cakes to the deferred bestsellers carousel', () => {
    render(<DeferredBestsellersCarousel cakes={[]} />)

    expect(dynamicPropsMock.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        cakes: []
      })
    )
  })

  it('passes market data to the deferred markets client', () => {
    render(<DeferredMarketsClient upcomingMarkets={[market]} />)

    expect(dynamicPropsMock.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        upcomingMarkets: [market]
      })
    )
  })

  it('passes collection data to the deferred occasions client', () => {
    render(<DeferredOccasionsClient collections={[collection]} />)

    expect(dynamicPropsMock.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        collections: [collection]
      })
    )
  })

  it('wraps the home enquiry form with query providers', () => {
    const occasionOptions = [{ label: 'Wedding', value: 'wedding' }]

    render(<HomeEnquiryFormInner occasionOptions={occasionOptions} />)

    expect(screen.getByTestId('query-providers')).toBeInTheDocument()
    expect(screen.getByTestId('enquiry-form')).toBeInTheDocument()
    expect(enquiryFormMock.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        occasionOptions
      })
    )
  })
})
