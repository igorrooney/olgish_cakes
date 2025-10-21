import {
  generateEventStructuredData,
  generateEventsListStructuredData,
  generateEventSEOMetadata
} from '../generateEventStructuredData'
import type { MarketSchedule } from '@/app/types/marketSchedule'

describe('generateEventStructuredData', () => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const mockEvent: MarketSchedule = {
    _id: '1',
    title: 'Leeds Market',
    location: 'Leeds City Center',
    googleMapsUrl: 'https://maps.google.com/@53.801279,-1.548567,15z',
    date: tomorrow.toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    description: 'Weekly market event',
    specialOffers: ['Buy 2 Get 1 Free'],
    contactInfo: { phone: '+44123456789', email: 'market@example.com' },
    featured: true,
    active: true,
    weatherDependent: false,
    image: {
      asset: { _ref: 'img1', _type: 'sanity.imageAsset', url: 'https://example.com/img.jpg' },
      alt: 'Market',
      hotspot: undefined,
      crop: undefined
    }
  }

  describe('generateEventStructuredData', () => {
    it('should generate valid Event schema', () => {
      const result = generateEventStructuredData(mockEvent)

      expect(result['@context']).toBe('https://schema.org')
      expect(result['@type']).toBe('Event')
      expect(result.name).toBe('Leeds Market')
    })

    it('should include event dates', () => {
      const result = generateEventStructuredData(mockEvent)

      expect(result.startDate).toBeDefined()
      expect(result.endDate).toBeDefined()
      expect(result.startDate).toContain(mockEvent.date)
    })

    it('should include location', () => {
      const result = generateEventStructuredData(mockEvent)

      expect(result.location['@type']).toBe('Place')
      expect(result.location.name).toBe('Leeds City Center')
    })

    it('should include organizer', () => {
      const result = generateEventStructuredData(mockEvent)

      expect(result.organizer['@type']).toBe('Organization')
      expect(result.organizer.name).toBe('Olgish Cakes')
    })

    it('should include performer', () => {
      const result = generateEventStructuredData(mockEvent)

      expect(result.performer['@type']).toBe('Organization')
      expect(result.performer.name).toBe('Olgish Cakes')
    })

    it('should set eventStatus to EventScheduled', () => {
      const result = generateEventStructuredData(mockEvent)

      expect(result.eventStatus).toBe('https://schema.org/EventScheduled')
    })

    it('should set eventAttendanceMode to OfflineEventAttendanceMode', () => {
      const result = generateEventStructuredData(mockEvent)

      expect(result.eventAttendanceMode).toBe('https://schema.org/OfflineEventAttendanceMode')
    })

    it('should mark as free event', () => {
      const result = generateEventStructuredData(mockEvent)

      expect(result.isAccessibleForFree).toBe(true)
    })

    it('should include aggregateRating', () => {
      const result = generateEventStructuredData(mockEvent)

      expect(result.aggregateRating['@type']).toBe('AggregateRating')
      expect(result.aggregateRating.ratingValue).toBe('5')
    })

    it('should use custom description', () => {
      const result = generateEventStructuredData(mockEvent)

      expect(result.description).toBe('Weekly market event')
    })

    it('should generate default description when missing', () => {
      const eventWithoutDescription = { ...mockEvent, description: undefined }

      const result = generateEventStructuredData(eventWithoutDescription)

      expect(result.description).toContain('Leeds City Center')
      expect(result.description).toContain('Ukrainian')
    })

    it('should extract coordinates from Google Maps URL', () => {
      const result = generateEventStructuredData(mockEvent)

      expect(result.location.geo).toBeDefined()
      expect(result.location.geo?.['@type']).toBe('GeoCoordinates')
      expect(result.location.geo?.latitude).toBe(53.801279)
      expect(result.location.geo?.longitude).toBe(-1.548567)
    })

    it('should handle Google Maps URL without coordinates', () => {
      const eventWithoutCoords = {
        ...mockEvent,
        googleMapsUrl: 'https://maps.google.com/search/Leeds'
      }

      const result = generateEventStructuredData(eventWithoutCoords)

      expect(result.location.geo).toBeUndefined()
    })

    it('should use event image when available', () => {
      const result = generateEventStructuredData(mockEvent)

      expect(result.image).toBe('https://example.com/img.jpg')
    })

    it('should handle relative image URLs', () => {
      const eventWithRelativeImage = {
        ...mockEvent,
        image: {
          asset: { _ref: 'img1', _type: 'sanity.imageAsset' as const, url: '/images/test.jpg' },
          alt: 'Market',
          hotspot: undefined,
          crop: undefined
        }
      }

      const result = generateEventStructuredData(eventWithRelativeImage)

      expect(result.image).toBe('https://olgishcakes.co.uk/images/test.jpg')
    })

    it('should use fallback image when no image', () => {
      const eventWithoutImage = { ...mockEvent, image: undefined }

      const result = generateEventStructuredData(eventWithoutImage)

      expect(result.image).toContain('market-event-placeholder.jpg')
    })

    it('should include offers', () => {
      const result = generateEventStructuredData(mockEvent)

      expect(result.offers['@type']).toBe('Offer')
      expect(result.offers.availability).toBe('https://schema.org/InStock')
    })

    it('should use custom contact info', () => {
      const result = generateEventStructuredData(mockEvent)

      expect(result.organizer.email).toBe('market@example.com')
      expect(result.organizer.telephone).toBe('+44123456789')
    })

    it('should use default contact when not provided', () => {
      const eventWithoutContact = { ...mockEvent, contactInfo: undefined }

      const result = generateEventStructuredData(eventWithoutContact)

      expect(result.organizer.email).toBe('hello@olgishcakes.co.uk')
      expect(result.organizer.telephone).toBe('+44 786 721 8194')
    })

    it('should generate unique event ID', () => {
      const result = generateEventStructuredData(mockEvent)

      expect(result['@id']).toContain('olgishcakes.co.uk/events/')
      expect(result['@id']).toContain('leeds-market')
    })
  })

  describe('generateEventsListStructuredData', () => {
    it('should generate ItemList schema', () => {
      const result = generateEventsListStructuredData([mockEvent])

      expect(result).not.toBeNull()
      expect(result!['@context']).toBe('https://schema.org')
      expect(result!['@type']).toBe('ItemList')
    })

    it('should include numberOfItems', () => {
      const result = generateEventsListStructuredData([mockEvent])

      expect(result!.numberOfItems).toBe(1)
    })

    it('should include itemListElement', () => {
      const result = generateEventsListStructuredData([mockEvent])

      expect(result!.itemListElement).toHaveLength(1)
      expect(result!.itemListElement[0]['@type']).toBe('ListItem')
      expect(result!.itemListElement[0].position).toBe(1)
    })

    it('should filter out past events', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const pastEvent = {
        ...mockEvent,
        _id: '2',
        date: yesterday.toISOString().split('T')[0]
      }

      const result = generateEventsListStructuredData([mockEvent, pastEvent])

      expect(result!.numberOfItems).toBe(1)
    })

    it('should filter out inactive events', () => {
      const inactiveEvent = { ...mockEvent, _id: '2', active: false }

      const result = generateEventsListStructuredData([mockEvent, inactiveEvent])

      expect(result!.numberOfItems).toBe(1)
    })

    it('should filter out events with missing required fields', () => {
      const invalidEvent = { ...mockEvent, _id: '2', title: undefined } as any
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      const result = generateEventsListStructuredData([mockEvent, invalidEvent])

      expect(result!.numberOfItems).toBe(1)
      expect(consoleSpy).toHaveBeenCalledWith('Skipping event with missing required fields:', '2')

      consoleSpy.mockRestore()
    })

    it('should return null when no upcoming events', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const pastEvent = {
        ...mockEvent,
        date: yesterday.toISOString().split('T')[0]
      }

      const result = generateEventsListStructuredData([pastEvent])

      expect(result).toBeNull()
    })

    it('should include mainEntity with Organization data', () => {
      const result = generateEventsListStructuredData([mockEvent])

      expect(result!.mainEntity['@type']).toBe('Organization')
      expect(result!.mainEntity.name).toBe('Olgish Cakes')
    })

    it('should handle multiple events', () => {
      const event2 = { ...mockEvent, _id: '2', title: 'York Market' }

      const result = generateEventsListStructuredData([mockEvent, event2])

      expect(result!.numberOfItems).toBe(2)
      expect(result!.itemListElement[1].position).toBe(2)
    })
  })

  describe('generateEventSEOMetadata', () => {
    it('should generate SEO metadata', () => {
      const result = generateEventSEOMetadata([mockEvent])

      expect(result.additionalKeywords).toBeDefined()
      expect(result.eventDescription).toBeDefined()
      expect(result.eventTitle).toBeDefined()
      expect(result.nextEventDate).toBeDefined()
      expect(result.nextEventLocation).toBeDefined()
      expect(result.totalUpcomingEvents).toBeDefined()
    })

    it('should include event-specific keywords', () => {
      const result = generateEventSEOMetadata([mockEvent])

      expect(result.additionalKeywords).toContain('farmers market Leeds')
      expect(result.additionalKeywords).toContain('Leeds City Center market')
    })

    it('should generate event description', () => {
      const result = generateEventSEOMetadata([mockEvent])

      expect(result.eventDescription).toContain('Leeds City Center')
      expect(result.eventDescription).toContain('Ukrainian')
    })

    it('should generate event title', () => {
      const result = generateEventSEOMetadata([mockEvent])

      expect(result.eventTitle).toContain('Leeds Market')
      expect(result.eventTitle).toContain('Ukrainian Cakes')
    })

    it('should return empty object when no upcoming events', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const pastEvent = {
        ...mockEvent,
        date: yesterday.toISOString().split('T')[0]
      }

      const result = generateEventSEOMetadata([pastEvent])

      expect(result).toEqual({})
    })

    it('should handle events with missing optional fields', () => {
      const minimalEvent = {
        ...mockEvent,
        description: undefined,
        image: undefined
      }

      const result = generateEventSEOMetadata([minimalEvent])

      expect(result.eventDescription).toBeDefined()
      expect(result.totalUpcomingEvents).toBe(1)
    })

    it('should filter inactive events', () => {
      const inactiveEvent = { ...mockEvent, _id: '2', active: false }

      const result = generateEventSEOMetadata([mockEvent, inactiveEvent])

      expect(result.totalUpcomingEvents).toBe(1)
    })

    it('should use first upcoming event as next event', () => {
      const twoDaysAway = new Date()
      twoDaysAway.setDate(twoDaysAway.getDate() + 2)

      const event2 = {
        ...mockEvent,
        _id: '2',
        title: 'Later Event',
        date: twoDaysAway.toISOString().split('T')[0]
      }

      const result = generateEventSEOMetadata([event2, mockEvent])

      expect(result.nextEventLocation).toBe('Leeds City Center')
    })
  })
})

