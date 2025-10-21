import {
  getMarketSchedule,
  getFeaturedMarketEvents,
  getUpcomingEvents,
  searchMarketEvents,
  getNextUpcomingEvent
} from '../fetchMarketSchedule'
import type { MarketSchedule } from '@/app/types/marketSchedule'

// Mock Sanity client
jest.mock('@/sanity/lib/client', () => {
  const mockFetch = jest.fn()
  return {
    client: { fetch: mockFetch },
    __mockFetch: mockFetch
  }
})

const { __mockFetch: mockFetch } = jest.requireMock('@/sanity/lib/client')

jest.mock('next-sanity', () => ({
  groq: (strings: TemplateStringsArray) => strings[0]
}))

describe('fetchMarketSchedule', () => {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const mockEvent: MarketSchedule = {
    _id: '1',
    title: 'Leeds Market',
    location: 'Leeds City Center',
    googleMapsUrl: 'https://maps.google.com/leeds',
    date: tomorrow.toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    description: 'Weekly market',
    specialOffers: ['Buy 2 Get 1 Free'],
    contactInfo: { phone: '07123456789', whatsapp: '447123456789' },
    featured: true,
    active: true,
    weatherDependent: false,
    image: {
      asset: { _ref: 'img1', _type: 'sanity.imageAsset', url: 'https://example.com/img.jpg' },
      alt: 'Market stall',
      hotspot: undefined,
      crop: undefined
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getMarketSchedule', () => {
    it('should fetch market schedule', async () => {
      mockFetch.mockResolvedValue([mockEvent])

      const result = await getMarketSchedule()

      expect(result).toEqual([mockEvent])
      expect(mockFetch).toHaveBeenCalled()
    })

    it('should return empty array on error', async () => {
      mockFetch.mockRejectedValue(new Error('Fetch failed'))

      const result = await getMarketSchedule()

      expect(result).toEqual([])
    })

    it('should log error on failure', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockFetch.mockRejectedValue(new Error('Fetch failed'))

      await getMarketSchedule()

      expect(consoleSpy).toHaveBeenCalledWith('Error fetching market schedule:', expect.any(Error))
      consoleSpy.mockRestore()
    })

    it('should filter active events only', async () => {
      mockFetch.mockResolvedValue([mockEvent])

      await getMarketSchedule()

      const query = mockFetch.mock.calls[0][0]
      expect(query).toContain('active == true')
    })

    it('should order by date ascending', async () => {
      mockFetch.mockResolvedValue([mockEvent])

      await getMarketSchedule()

      const query = mockFetch.mock.calls[0][0]
      expect(query).toContain('order(date asc)')
    })

    it('should return empty array when result is null', async () => {
      mockFetch.mockResolvedValue(null)

      const result = await getMarketSchedule()

      expect(result).toEqual([])
    })
  })

  describe('getFeaturedMarketEvents', () => {
    it('should fetch featured events with default limit', async () => {
      mockFetch.mockResolvedValue([mockEvent, mockEvent, mockEvent])

      const result = await getFeaturedMarketEvents()

      expect(result).toHaveLength(3)
    })

    it('should fetch featured events with custom limit', async () => {
      mockFetch.mockResolvedValue([mockEvent, mockEvent, mockEvent, mockEvent, mockEvent])

      const result = await getFeaturedMarketEvents(5)

      expect(result).toHaveLength(5)
    })

    it('should filter featured events only', async () => {
      mockFetch.mockResolvedValue([mockEvent])

      await getFeaturedMarketEvents()

      const query = mockFetch.mock.calls[0][0]
      expect(query).toContain('featured == true')
    })

    it('should return empty array on error', async () => {
      mockFetch.mockRejectedValue(new Error('Fetch failed'))

      const result = await getFeaturedMarketEvents()

      expect(result).toEqual([])
    })

    it('should log error on failure', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockFetch.mockRejectedValue(new Error('Fetch failed'))

      await getFeaturedMarketEvents()

      expect(consoleSpy).toHaveBeenCalledWith('Error fetching featured market events:', expect.any(Error))
      consoleSpy.mockRestore()
    })
  })

  describe('getUpcomingEvents', () => {
    it('should fetch upcoming events', async () => {
      mockFetch.mockResolvedValue([{
        _id: '1',
        title: 'Leeds Market',
        location: 'Leeds',
        date: tomorrow.toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '17:00',
        featured: true,
        active: true
      }])

      const result = await getUpcomingEvents()

      expect(result).toHaveLength(1)
      expect(result[0]).toHaveProperty('isToday')
      expect(result[0]).toHaveProperty('isThisWeek')
      expect(result[0]).toHaveProperty('daysUntil')
      expect(result[0]).toHaveProperty('formattedDate')
      expect(result[0]).toHaveProperty('formattedTime')
    })

    it('should filter events within next 30 days', async () => {
      mockFetch.mockResolvedValue([])

      await getUpcomingEvents()

      const params = mockFetch.mock.calls[0][1]
      expect(params.today).toBeDefined()
      expect(params.futureDate).toBeDefined()
    })

    it('should apply custom limit', async () => {
      mockFetch.mockResolvedValue([{
        _id: '1',
        title: 'Event',
        location: 'Location',
        date: tomorrow.toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '17:00',
        featured: true,
        active: true
      }])

      await getUpcomingEvents(10)

      const query = mockFetch.mock.calls[0][0]
      expect(query).toContain('[0...10]')
    })

    it('should return empty array on error', async () => {
      mockFetch.mockRejectedValue(new Error('Fetch failed'))

      const result = await getUpcomingEvents()

      expect(result).toEqual([])
    })

    it('should enhance events with date info', async () => {
      mockFetch.mockResolvedValue([{
        _id: '1',
        title: 'Today Event',
        location: 'Leeds',
        date: today.toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '17:00',
        featured: true,
        active: true
      }])

      const result = await getUpcomingEvents()

      expect(result[0].isToday).toBe(true)
      expect(Math.abs(result[0].daysUntil)).toBeLessThanOrEqual(1)
    })

    it('should format time correctly', async () => {
      mockFetch.mockResolvedValue([{
        _id: '1',
        title: 'Event',
        location: 'Leeds',
        date: tomorrow.toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '17:00',
        featured: true,
        active: true
      }])

      const result = await getUpcomingEvents()

      expect(result[0].formattedTime).toBe('09:00 - 17:00')
    })
  })

  describe('searchMarketEvents', () => {
    it('should search without filters', async () => {
      mockFetch.mockResolvedValue([mockEvent])

      const result = await searchMarketEvents()

      expect(result).toEqual([mockEvent])
    })

    it('should filter by featured', async () => {
      mockFetch.mockResolvedValue([mockEvent])

      await searchMarketEvents({ featured: true })

      const query = mockFetch.mock.calls[0][0]
      expect(query).toContain('featured == true')
    })

    it('should filter by upcoming', async () => {
      mockFetch.mockResolvedValue([mockEvent])

      await searchMarketEvents({ upcoming: true })

      const query = mockFetch.mock.calls[0][0]
      expect(query).toContain('date >= $today')
      const params = mockFetch.mock.calls[0][1]
      expect(params.today).toBeDefined()
    })

    it('should filter by dateFrom', async () => {
      mockFetch.mockResolvedValue([mockEvent])

      await searchMarketEvents({ dateFrom: '2025-01-01' })

      const query = mockFetch.mock.calls[0][0]
      expect(query).toContain('date >= $dateFrom')
      const params = mockFetch.mock.calls[0][1]
      expect(params.dateFrom).toBe('2025-01-01')
    })

    it('should filter by dateTo', async () => {
      mockFetch.mockResolvedValue([mockEvent])

      await searchMarketEvents({ dateTo: '2025-12-31' })

      const query = mockFetch.mock.calls[0][0]
      expect(query).toContain('date <= $dateTo')
      const params = mockFetch.mock.calls[0][1]
      expect(params.dateTo).toBe('2025-12-31')
    })

    it('should filter by location', async () => {
      mockFetch.mockResolvedValue([mockEvent])

      await searchMarketEvents({ location: 'Leeds' })

      const query = mockFetch.mock.calls[0][0]
      expect(query).toContain('location match $location')
      const params = mockFetch.mock.calls[0][1]
      expect(params.location).toBe('*Leeds*')
    })

    it('should combine multiple filters', async () => {
      mockFetch.mockResolvedValue([mockEvent])

      await searchMarketEvents({
        featured: true,
        upcoming: true,
        dateFrom: '2025-01-01',
        dateTo: '2025-12-31',
        location: 'Leeds'
      })

      const query = mockFetch.mock.calls[0][0]
      expect(query).toContain('featured == true')
      expect(query).toContain('date >= $today')
      expect(query).toContain('date >= $dateFrom')
      expect(query).toContain('date <= $dateTo')
      expect(query).toContain('location match $location')
    })

    it('should return empty array on error', async () => {
      mockFetch.mockRejectedValue(new Error('Search failed'))

      const result = await searchMarketEvents()

      expect(result).toEqual([])
    })

    it('should log error on failure', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockFetch.mockRejectedValue(new Error('Search failed'))

      await searchMarketEvents()

      expect(consoleSpy).toHaveBeenCalledWith('Error searching market events:', expect.any(Error))
      consoleSpy.mockRestore()
    })
  })

  describe('getNextUpcomingEvent', () => {
    it('should fetch next upcoming event', async () => {
      mockFetch.mockResolvedValue([{
        _id: '1',
        title: 'Next Event',
        location: 'Leeds',
        date: tomorrow.toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '17:00',
        featured: true,
        active: true
      }])

      const result = await getNextUpcomingEvent()

      expect(result).not.toBeNull()
      expect(result?.title).toBe('Next Event')
    })

    it('should return null when no events', async () => {
      mockFetch.mockResolvedValue([])

      const result = await getNextUpcomingEvent()

      expect(result).toBeNull()
    })

    it('should return null on error', async () => {
      mockFetch.mockRejectedValue(new Error('Fetch failed'))

      const result = await getNextUpcomingEvent()

      expect(result).toBeNull()
    })

    it('should log error on failure', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockFetch.mockRejectedValue(new Error('Fetch failed'))

      await getNextUpcomingEvent()

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })
})

