/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import MarketSchedule from '../MarketSchedule'

// Mock Next.js
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>
})

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, src, ...props }: any) => <img alt={alt} src={src} data-testid="next-image" {...props} />
}))

// Mock Sanity
jest.mock('@/sanity/lib/image', () => ({
  urlFor: jest.fn((image) => ({
    width: jest.fn().mockReturnThis(),
    height: jest.fn().mockReturnThis(),
    url: jest.fn(() => 'https://cdn.sanity.io/market.jpg')
  }))
}))

// Mock design system
jest.mock('@/lib/design-system', () => ({
  colors: {
    primary: { main: '#2E3192' },
    secondary: { main: '#FDB913' }
  },
  spacing: {},
  typography: {}
}))

// Mock animated components
jest.mock('../AnimatedSection', () => ({
  AnimatedSection: ({ children, ...props }: any) => <section {...props}>{children}</section>,
  AnimatedDiv: ({ children, ...props }: any) => <div {...props}>{children}</div>
}))

// Mock MUI
jest.mock('@/lib/mui-optimization', () => ({
  Box: ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>,
  Button: ({ children, component, href, endIcon, ...props }: any) => {
    const Component = component || 'button'
    return <Component href={href} {...props}>{children}{endIcon}</Component>
  },
  Card: ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>,
  CardContent: ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>,
  Chip: ({ label, className, ...props }: any) => <span className={className} {...props}>{label}</span>,
  Container: ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>,
  Grid: ({ children, item, ...props }: any) => <div data-grid-item={item} {...props}>{children}</div>,
  Typography: ({ children, component, variant, id, className, ...props }: any) => {
    const Component = component || 'div'
    return <Component id={id} className={className} data-variant={variant} {...props}>{children}</Component>
  },
  useTheme: () => ({ breakpoints: { down: () => false } }),
  useMediaQuery: () => false,
  CalendarTodayIcon: () => <span>📅</span>,
  LocationOnIcon: () => <span>📍</span>,
  AccessTimeIcon: () => <span>🕒</span>,
  LocalOfferIcon: () => <span>🏷️</span>,
  ArrowForwardIcon: () => <span>→</span>,
  EventIcon: () => <span>📆</span>
}))

describe('MarketSchedule', () => {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)

  const mockEvents = [
    {
      _id: '1',
      title: 'Leeds Market',
      date: tomorrow.toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '17:00',
      location: 'Leeds City Center',
      googleMapsUrl: 'https://maps.google.com/leeds',
      active: true,
      description: 'Come visit our stall',
      image: { asset: { url: 'https://image.com/market.jpg' }, alt: 'Market stall' },
      specialOffers: ['Buy 2 Get 1 Free', '10% off hampers'],
      contactInfo: { phone: '07123456789', whatsapp: '447123456789' },
      weatherDependent: false
    },
    {
      _id: '2',
      title: 'York Farmers Market',
      date: nextWeek.toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '16:00',
      location: 'York City Square',
      googleMapsUrl: 'https://maps.google.com/york',
      active: true,
      weatherDependent: true
    },
    {
      _id: '3',
      title: 'Past Event',
      date: yesterday.toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '16:00',
      location: 'Past Location',
      googleMapsUrl: 'https://maps.google.com/past',
      active: true
    },
    {
      _id: '4',
      title: 'Inactive Event',
      date: tomorrow.toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '16:00',
      location: 'Inactive Location',
      googleMapsUrl: 'https://maps.google.com/inactive',
      active: false
    }
  ]

  describe('Rendering', () => {
    it('should render section with proper heading', () => {
      render(<MarketSchedule events={mockEvents} />)

      expect(screen.getByText('Find Us at Local Markets!')).toBeInTheDocument()
    })

    it('should render subtitle', () => {
      render(<MarketSchedule events={mockEvents} />)

      expect(screen.getByText(/Meet us in person and taste our authentic Ukrainian cakes/)).toBeInTheDocument()
    })

    it('should render EventIcon', () => {
      render(<MarketSchedule events={mockEvents} />)

      expect(screen.getByText('📆')).toBeInTheDocument()
    })

    it('should use custom title', () => {
      render(<MarketSchedule events={mockEvents} title="Custom Title" />)

      expect(screen.getByText('Custom Title')).toBeInTheDocument()
    })

    it('should use custom subtitle', () => {
      render(<MarketSchedule events={mockEvents} subtitle="Custom Subtitle" />)

      expect(screen.getByText('Custom Subtitle')).toBeInTheDocument()
    })
  })

  describe('Event Filtering', () => {
    it('should filter out past events', () => {
      render(<MarketSchedule events={mockEvents} />)

      expect(screen.queryByText('Past Event')).not.toBeInTheDocument()
    })

    it('should filter out inactive events', () => {
      render(<MarketSchedule events={mockEvents} />)

      expect(screen.queryByText('Inactive Event')).not.toBeInTheDocument()
    })

    it('should show active future events', () => {
      render(<MarketSchedule events={mockEvents} />)

      expect(screen.getByText('Leeds Market')).toBeInTheDocument()
      expect(screen.getByText('York Farmers Market')).toBeInTheDocument()
    })

    it('should return null when no upcoming events', () => {
      const pastEvents = [
        {
          _id: '1',
          title: 'Old Event',
          date: yesterday.toISOString().split('T')[0],
          startTime: '10:00',
          endTime: '16:00',
          location: 'Old Location',
          googleMapsUrl: 'https://maps.google.com/old',
          active: true
        }
      ]

      const { container } = render(<MarketSchedule events={pastEvents} />)

      expect(container.firstChild).toBeNull()
    })

    it('should limit events based on maxEvents prop', () => {
      const manyEvents = Array.from({ length: 15 }, (_, i) => ({
        _id: `event-${i}`,
        title: `Event ${i}`,
        date: new Date(today.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        startTime: '10:00',
        endTime: '16:00',
        location: `Location ${i}`,
        googleMapsUrl: `https://maps.google.com/${i}`,
        active: true
      }))

      render(<MarketSchedule events={manyEvents} maxEvents={3} />)

      expect(screen.getByText('Event 0')).toBeInTheDocument()
      expect(screen.getByText('Event 1')).toBeInTheDocument()
      expect(screen.getByText('Event 2')).toBeInTheDocument()
      expect(screen.queryByText('Event 3')).not.toBeInTheDocument()
    })
  })

  describe('Event Sorting', () => {
    it('should sort events by date (earliest first)', () => {
      const unsortedEvents = [
        {
          _id: '1',
          title: 'Later Event',
          date: nextWeek.toISOString().split('T')[0],
          startTime: '10:00',
          endTime: '16:00',
          location: 'Location 1',
          googleMapsUrl: 'https://maps.google.com/1',
          active: true
        },
        {
          _id: '2',
          title: 'Earlier Event',
          date: tomorrow.toISOString().split('T')[0],
          startTime: '10:00',
          endTime: '16:00',
          location: 'Location 2',
          googleMapsUrl: 'https://maps.google.com/2',
          active: true
        }
      ]

      render(<MarketSchedule events={unsortedEvents} />)

      const events = screen.getAllByText(/Event/)
      expect(events[0]).toHaveTextContent('Earlier Event')
    })
  })

  describe('Event Display', () => {
    it('should display event title', () => {
      render(<MarketSchedule events={mockEvents} />)

      expect(screen.getByText('Leeds Market')).toBeInTheDocument()
    })

    it('should display event date', () => {
      render(<MarketSchedule events={mockEvents} />)

      // Should include calendar icon
      expect(screen.getAllByText('📅').length).toBeGreaterThan(0)
    })

    it('should display event time', () => {
      render(<MarketSchedule events={mockEvents} />)

      expect(screen.getByText('09:00 - 17:00')).toBeInTheDocument()
      expect(screen.getAllByText('🕒').length).toBeGreaterThan(0)
    })

    it('should display event location with link', () => {
      render(<MarketSchedule events={mockEvents} />)

      const link = screen.getByRole('link', { name: /View Leeds City Center on Google Maps/i })
      expect(link).toHaveAttribute('href', 'https://maps.google.com/leeds')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('should display location icon', () => {
      render(<MarketSchedule events={mockEvents} />)

      expect(screen.getAllByText('📍').length).toBeGreaterThan(0)
    })

    it('should display event description', () => {
      render(<MarketSchedule events={mockEvents} />)

      expect(screen.getByText('Come visit our stall')).toBeInTheDocument()
    })

    it('should display event image', () => {
      render(<MarketSchedule events={mockEvents} />)

      const images = screen.getAllByTestId('next-image')
      expect(images.length).toBeGreaterThan(0)
    })

    it('should use fallback image when no image provided', () => {
      const eventWithoutImage = [{
        ...mockEvents[1],
        image: undefined
      }]

      render(<MarketSchedule events={eventWithoutImage} />)

      const images = screen.getAllByTestId('next-image')
      expect(images[0]).toHaveAttribute('src', '/images/pattern.svg')
    })
  })

  describe('Special Badges', () => {
    it('should show "Today!" badge for today\'s events', () => {
      const todayEvent: any = [{
        _id: '1',
        title: 'Today Event',
        date: today.toISOString().split('T')[0],
        startTime: '10:00',
        endTime: '16:00',
        location: 'Today Location',
        googleMapsUrl: 'https://maps.google.com/today',
        active: true,
        featured: false,
        weatherDependent: false
      }]

      render(<MarketSchedule events={todayEvent} />)

      expect(screen.getByText('Today!')).toBeInTheDocument()
    })

    it('should show "In X days" badge for events within 3 days', () => {
      const twoDaysAway = new Date(today)
      twoDaysAway.setDate(twoDaysAway.getDate() + 2)

      const soonEvent: any = [{
        _id: '1',
        title: 'Soon Event',
        date: twoDaysAway.toISOString().split('T')[0],
        startTime: '10:00',
        endTime: '16:00',
        location: 'Soon Location',
        googleMapsUrl: 'https://maps.google.com/soon',
        active: true,
        featured: false,
        weatherDependent: false
      }]

      render(<MarketSchedule events={soonEvent} />)

      expect(screen.getByText('In 2 days')).toBeInTheDocument()
    })

    it('should show "In 1 day" (singular) for tomorrow', () => {
      const tomorrowEvent: any = [{
        _id: '1',
        title: 'Tomorrow Event',
        date: tomorrow.toISOString().split('T')[0],
        startTime: '10:00',
        endTime: '16:00',
        location: 'Tomorrow Location',
        googleMapsUrl: 'https://maps.google.com/tomorrow',
        active: true
      }]

      render(<MarketSchedule events={tomorrowEvent} />)

      expect(screen.getByText('In 1 day')).toBeInTheDocument()
    })

    it('should show "Weather Dependent" badge', () => {
      render(<MarketSchedule events={mockEvents} />)

      expect(screen.getByText('Weather Dependent')).toBeInTheDocument()
    })

    it('should not show "Today!" badge for future events', () => {
      render(<MarketSchedule events={mockEvents} />)

      // Only the York event (nextWeek) shouldn't have "Today!" badge
      const todayBadges = screen.queryAllByText('Today!')
      expect(todayBadges.length).toBe(0)
    })
  })

  describe('Special Offers', () => {
    it('should display special offers section', () => {
      render(<MarketSchedule events={mockEvents} />)

      expect(screen.getByText('Special Offers')).toBeInTheDocument()
    })

    it('should display first 2 special offers', () => {
      render(<MarketSchedule events={mockEvents} />)

      expect(screen.getByText('Buy 2 Get 1 Free')).toBeInTheDocument()
      expect(screen.getByText('10% off hampers')).toBeInTheDocument()
    })

    it('should show "+N more" for additional offers', () => {
      const eventWithManyOffers = [{
        ...mockEvents[0],
        specialOffers: ['Offer 1', 'Offer 2', 'Offer 3', 'Offer 4']
      }]

      render(<MarketSchedule events={eventWithManyOffers} />)

      expect(screen.getByText('+2 more')).toBeInTheDocument()
    })

    it('should not show offers section when no offers', () => {
      const eventWithoutOffers = [{
        ...mockEvents[1]
      }]

      render(<MarketSchedule events={eventWithoutOffers} />)

      expect(screen.queryByText('Special Offers')).not.toBeInTheDocument()
    })

    it('should show offer icon', () => {
      render(<MarketSchedule events={mockEvents} />)

      expect(screen.getAllByText('🏷️').length).toBeGreaterThan(0)
    })
  })

  describe('Contact Information', () => {
    it('should display phone number link', () => {
      render(<MarketSchedule events={mockEvents} />)

      const phoneLink = screen.getByRole('link', { name: /Call 07123456789 for Leeds Market/i })
      expect(phoneLink).toHaveAttribute('href', 'tel:07123456789')
    })

    it('should display WhatsApp link', () => {
      render(<MarketSchedule events={mockEvents} />)

      const whatsappLink = screen.getByRole('link', { name: /Message Leeds Market on WhatsApp/i })
      expect(whatsappLink).toHaveAttribute('href', 'https://wa.me/447123456789')
      expect(whatsappLink).toHaveAttribute('target', '_blank')
    })

    it('should not show contact section when no contact info', () => {
      const eventWithoutContact = [{
        ...mockEvents[1]
      }]

      render(<MarketSchedule events={eventWithoutContact} />)

      expect(screen.queryByText('Contact for this event:')).not.toBeInTheDocument()
    })

    it('should show only phone when no WhatsApp', () => {
      const eventWithOnlyPhone = [{
        ...mockEvents[0],
        contactInfo: { phone: '07123456789' }
      }]

      render(<MarketSchedule events={eventWithOnlyPhone} />)

      expect(screen.getByText('📞 07123456789')).toBeInTheDocument()
      expect(screen.queryByText('💬 WhatsApp')).not.toBeInTheDocument()
    })

    it('should show only WhatsApp when no phone', () => {
      const eventWithOnlyWhatsapp = [{
        ...mockEvents[0],
        contactInfo: { whatsapp: '447123456789' }
      }]

      render(<MarketSchedule events={eventWithOnlyWhatsapp} />)

      expect(screen.getByText('💬 WhatsApp')).toBeInTheDocument()
      expect(screen.queryByText(/📞/)).not.toBeInTheDocument()
    })
  })

  describe('Call to Action', () => {
    it('should show CTA section by default', () => {
      render(<MarketSchedule events={mockEvents} />)

      expect(screen.getByText(/Don't Miss Out|Don't Miss Out/)).toBeInTheDocument()
    })

    it('should hide CTA when showAllLink is false', () => {
      render(<MarketSchedule events={mockEvents} showAllLink={false} />)

      expect(screen.queryByText('Don\'t Miss Out!')).not.toBeInTheDocument()
    })

    it('should show Get in Touch button', () => {
      render(<MarketSchedule events={mockEvents} />)

      const link = screen.getByText('Get in Touch').closest('a')
      expect(link).toHaveAttribute('href', '/contact')
    })

    it('should show View Full Market Schedule button', () => {
      render(<MarketSchedule events={mockEvents} />)

      const link = screen.getByText('View Full Market Schedule').closest('a')
      expect(link).toHaveAttribute('href', '/market-schedule')
    })

    it('should show Instagram Follow button', () => {
      render(<MarketSchedule events={mockEvents} />)

      // Changed to Button with onClick in Next.js 16/React 19 for better compatibility
      const button = screen.getByText('Follow @olgish_cakes')
      expect(button).toBeInTheDocument()
      expect(button.tagName).toBe('BUTTON')
    })
  })

  describe('Structured Data', () => {
    it('should include JSON-LD script', () => {
      const { container } = render(<MarketSchedule events={mockEvents} />)

      const script = container.querySelector('script[type="application/ld+json"]')
      expect(script).toBeTruthy()
    })

    it('should generate valid ItemList schema', () => {
      const { container } = render(<MarketSchedule events={mockEvents} />)

      const script = container.querySelector('script')
      const json = JSON.parse(script?.textContent || '{}')
      expect(json['@type']).toBe('ItemList')
      expect(json['@context']).toBe('https://schema.org')
    })

    it('should include numberOfItems', () => {
      const { container } = render(<MarketSchedule events={mockEvents} />)

      const script = container.querySelector('script')
      const json = JSON.parse(script?.textContent || '{}')
      expect(json.numberOfItems).toBe(2) // 2 upcoming active events
    })

    it('should generate Event schema for each event', () => {
      const { container } = render(<MarketSchedule events={mockEvents} />)

      const script = container.querySelector('script')
      const json = JSON.parse(script?.textContent || '{}')
      expect(json.itemListElement[0].item['@type']).toBe('Event')
      expect(json.itemListElement[0].item.name).toBe('Leeds Market')
    })

    it('should include aggregateRating in events', () => {
      const { container } = render(<MarketSchedule events={mockEvents} />)

      const script = container.querySelector('script')
      const json = JSON.parse(script?.textContent || '{}')
      expect(json.itemListElement[0].item.aggregateRating['@type']).toBe('AggregateRating')
      expect(json.itemListElement[0].item.aggregateRating.ratingValue).toBe('5')
    })

    it('should include organizer information', () => {
      const { container } = render(<MarketSchedule events={mockEvents} />)

      const script = container.querySelector('script')
      const json = JSON.parse(script?.textContent || '{}')
      expect(json.itemListElement[0].item.organizer.name).toBe('Olgish Cakes')
    })

    it('should include LocalBusiness context', () => {
      const { container } = render(<MarketSchedule events={mockEvents} />)

      const script = container.querySelector('script')
      const json = JSON.parse(script?.textContent || '{}')
      expect(json.itemListElement[0].item.isRelatedTo['@type']).toBe('LocalBusiness')
    })

    it('should have numeric price in offers (not string)', () => {
      const { container } = render(<MarketSchedule events={mockEvents} />)

      const script = container.querySelector('script')
      const json = JSON.parse(script?.textContent || '{}')

      json.itemListElement.forEach((listItem: any) => {
        if (listItem.item.offers) {
          const price = listItem.item.offers.price

          // CRITICAL: Price must be a number, not a string
          expect(typeof price).toBe('number')
          expect(Number.isFinite(price)).toBe(true)
          expect(Number.isNaN(price)).toBe(false)
        }
      })
    })

    it('should have price as 0 (number) for free events', () => {
      const { container } = render(<MarketSchedule events={mockEvents} />)

      const script = container.querySelector('script')
      const json = JSON.parse(script?.textContent || '{}')

      json.itemListElement.forEach((listItem: any) => {
        if (listItem.item.offers) {
          const price = listItem.item.offers.price

          // Price should be 0 (number) for free events
          expect(typeof price).toBe('number')
          expect(price).toBe(0)
          expect(listItem.item.offers.priceCurrency).toBe('GBP')
        }
      })
    })

    it('should not have string prices in structured data', () => {
      const { container } = render(<MarketSchedule events={mockEvents} />)

      const script = container.querySelector('script')
      const json = JSON.parse(script?.textContent || '{}')

      json.itemListElement.forEach((listItem: any) => {
        if (listItem.item.offers) {
          const price = listItem.item.offers.price

          // Price should NOT be a string
          expect(typeof price).not.toBe('string')
          // If it were a string, it would contain these, but since it's a number, this check is redundant
          // The type check above is sufficient
        }
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper region role', () => {
      render(<MarketSchedule events={mockEvents} />)

      expect(screen.getByRole('region')).toBeInTheDocument()
    })

    it('should have aria-labelledby for heading', () => {
      render(<MarketSchedule events={mockEvents} />)

      const region = screen.getByRole('region')
      expect(region).toHaveAttribute('aria-labelledby', 'market-schedule-heading')
    })

    it('should have proper heading ID', () => {
      render(<MarketSchedule events={mockEvents} />)

      expect(screen.getByText('Find Us at Local Markets!').closest('[id="market-schedule-heading"]')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty events array', () => {
      const { container } = render(<MarketSchedule events={[]} />)

      expect(container.firstChild).toBeNull()
    })

    it('should handle events without descriptions', () => {
      const eventWithoutDescription = [{
        ...mockEvents[1],
        description: undefined
      }]

      expect(() => {
        render(<MarketSchedule events={eventWithoutDescription} />)
      }).not.toThrow()
    })

    it('should handle missing image alt text', () => {
      const eventWithoutAlt = [{
        ...mockEvents[0],
        image: { asset: { url: 'https://image.com/test.jpg' } }
      }]

      render(<MarketSchedule events={eventWithoutAlt} />)

      const img = screen.getAllByTestId('next-image')[0]
      expect(img).toHaveAttribute('alt', expect.stringContaining('Leeds Market market event'))
    })
  })
})

