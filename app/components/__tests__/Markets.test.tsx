/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import type { MarketSchedule } from '@/app/types/marketSchedule'
import { Markets } from '../homepage/Markets'

interface LinkProps {
  children: ReactNode
  href: string
  [key: string]: unknown
}

const mockGetMarketSchedule = jest.fn<Promise<MarketSchedule[]>, []>()

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: LinkProps) => (
    <a href={href} {...props}>{children}</a>
  )
}))

jest.mock('@/app/utils/fetchMarketSchedule', () => ({
  getMarketSchedule: () => mockGetMarketSchedule()
}))

const fixedNow = new Date('2026-01-15T09:00:00.000Z')

const buildDate = (offsetDays: number): string => {
  const date = new Date(fixedNow)
  date.setDate(date.getDate() + offsetDays)
  date.setHours(12, 0, 0, 0)
  return date.toISOString()
}

const formatExpectedDate = (date: string): string => (
  new Date(date).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
)

const createMarket = (
  overrides: Partial<MarketSchedule> & { _id: string, title: string, date: string }
): MarketSchedule => ({
  _id: overrides._id,
  title: overrides.title,
  date: overrides.date,
  location: overrides.location ?? 'Leeds City Center',
  googleMapsUrl: overrides.googleMapsUrl ?? 'https://maps.google.com/leeds',
  startTime: overrides.startTime ?? '09:00',
  endTime: overrides.endTime ?? '17:00',
  featured: overrides.featured ?? false,
  active: overrides.active ?? true,
  weatherDependent: overrides.weatherDependent ?? false,
  description: overrides.description,
  specialOffers: overrides.specialOffers,
  website: overrides.website,
  contactInfo: overrides.contactInfo,
  image: overrides.image
})

const renderMarkets = async () => {
  const component = await Markets()
  if (!component) {
    throw new Error('Expected Markets to render content')
  }
  return render(component as ReactElement)
}

describe('Markets', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(fixedNow)
    mockGetMarketSchedule.mockReset()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders heading and link to full schedule', async () => {
    const market = createMarket({
      _id: 'market-1',
      title: 'Leeds Market',
      date: buildDate(1)
    })

    mockGetMarketSchedule.mockResolvedValueOnce([market])

    await renderMarkets()

    expect(mockGetMarketSchedule).toHaveBeenCalledTimes(1)
    expect(
      screen.getByRole('heading', { level: 2, name: /Upcoming\s+Farmers markets/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /See all markets/i })).toHaveAttribute(
      'href',
      '/market-schedule'
    )
  })

  it('renders market details with formatted date and time', async () => {
    const market = createMarket({
      _id: 'market-2',
      title: 'York Farmers Market',
      date: buildDate(2),
      location: 'York City Square',
      startTime: '10:00',
      endTime: '16:00',
      website: 'https://york-market.example.com'
    })

    mockGetMarketSchedule.mockResolvedValueOnce([market])

    await renderMarkets()

    expect(screen.getByText('York Farmers Market')).toBeInTheDocument()
    expect(screen.getByText(formatExpectedDate(market.date))).toBeInTheDocument()
    expect(screen.getByText('10:00-16:00')).toBeInTheDocument()
    expect(screen.getByText('York City Square')).toBeInTheDocument()

    const websiteLink = screen.getByRole('link', { name: 'Visit website' })
    expect(websiteLink).toHaveAttribute('href', 'https://york-market.example.com')
    expect(websiteLink).toHaveAttribute('target', '_blank')
    expect(websiteLink).toHaveAttribute('rel', 'noopener noreferrer')

    const directionsLink = screen.getByLabelText('Get directions to York Farmers Market')
    expect(directionsLink).toHaveAttribute('href', 'https://maps.google.com/leeds')
    expect(directionsLink).toHaveAttribute('target', '_blank')
    expect(directionsLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('filters out past markets', async () => {
    const upcoming = createMarket({
      _id: 'market-3',
      title: 'Harrogate Market',
      date: buildDate(3)
    })
    const past = createMarket({
      _id: 'market-4',
      title: 'Past Market',
      date: buildDate(-2)
    })

    mockGetMarketSchedule.mockResolvedValueOnce([past, upcoming])

    await renderMarkets()

    expect(screen.getByText('Harrogate Market')).toBeInTheDocument()
    expect(screen.queryByText('Past Market')).not.toBeInTheDocument()
  })

  it('sorts upcoming markets by date', async () => {
    const first = createMarket({ _id: 'market-5', title: 'First', date: buildDate(1) })
    const second = createMarket({ _id: 'market-6', title: 'Second', date: buildDate(3) })
    const third = createMarket({ _id: 'market-7', title: 'Third', date: buildDate(2) })

    mockGetMarketSchedule.mockResolvedValueOnce([second, first, third])

    await renderMarkets()

    const titles = screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)
    expect(titles).toEqual(['First', 'Third', 'Second'])
  })

  it('limits the list to 10 upcoming markets', async () => {
    const markets = Array.from({ length: 12 }, (_, index) => (
      createMarket({
        _id: `market-${index}`,
        title: `Market ${index + 1}`,
        date: buildDate(index + 1)
      })
    ))

    mockGetMarketSchedule.mockResolvedValueOnce(markets)

    await renderMarkets()

    const headings = screen.getAllByRole('heading', { level: 3 })
    expect(headings).toHaveLength(10)
    expect(headings[0]).toHaveTextContent('Market 1')
    expect(headings[9]).toHaveTextContent('Market 10')
  })

  it('omits the website link when a market has no website', async () => {
    const market = createMarket({
      _id: 'market-8',
      title: 'Leeds Market',
      date: buildDate(4),
      website: undefined
    })

    mockGetMarketSchedule.mockResolvedValueOnce([market])

    await renderMarkets()

    expect(screen.queryByRole('link', { name: 'Visit website' })).not.toBeInTheDocument()
  })

  it('renders fallback CTA when there are no upcoming markets', async () => {
    const past = createMarket({
      _id: 'market-9',
      title: 'Old Market',
      date: buildDate(-1)
    })

    mockGetMarketSchedule.mockResolvedValueOnce([past])

    const component = await Markets()
    if (!component) {
      throw new Error('Expected fallback content when no markets are available')
    }

    render(component as ReactElement)
    expect(
      screen.getByRole('heading', { level: 2, name: /Upcoming\s+Farmers markets/i })
    ).toBeInTheDocument()
    expect(screen.getByText(/Market dates are announced soon/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /See market schedule/i })).toHaveAttribute(
      'href',
      '/market-schedule'
    )
  })
})
