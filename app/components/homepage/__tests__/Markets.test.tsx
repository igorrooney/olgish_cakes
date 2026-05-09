/**
 * @jest-environment jsdom
 */
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { Markets } from '../Markets'
import { getMarketSchedule } from '@/app/utils/fetchMarketSchedule'
import type { MarketSchedule } from '@/app/types/marketSchedule'
import type { HomepageMarket } from '../MarketsClient'

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    href
  }: {
    children: React.ReactNode
    href: string
  }) => <a href={href}>{children}</a>
}))

jest.mock('@/app/utils/fetchMarketSchedule', () => ({
  getMarketSchedule: jest.fn()
}))

jest.mock('../DeferredMarketsClient', () => ({
  DeferredMarketsClient: ({ upcomingMarkets }: { upcomingMarkets: HomepageMarket[] }) => {
    const { MarketsClient } = jest.requireActual('../MarketsClient') as typeof import('../MarketsClient')
    return <MarketsClient upcomingMarkets={upcomingMarkets} />
  }
}))

const mockGetMarketSchedule = getMarketSchedule as jest.MockedFunction<typeof getMarketSchedule>

const createMarket = (overrides: Partial<MarketSchedule> = {}): MarketSchedule => ({
  _id: overrides._id ?? 'market-1',
  title: overrides.title ?? 'Leeds Farmers Market',
  location: overrides.location ?? 'Leeds City Centre',
  googleMapsUrl: overrides.googleMapsUrl ?? 'https://maps.google.com/?q=Leeds+City+Centre',
  date: overrides.date ?? '2099-04-01',
  startTime: overrides.startTime ?? '09:00',
  endTime: overrides.endTime ?? '14:00',
  description: overrides.description,
  specialOffers: overrides.specialOffers,
  website: overrides.website,
  contactInfo: overrides.contactInfo,
  featured: overrides.featured ?? false,
  active: overrides.active ?? true,
  weatherDependent: overrides.weatherDependent ?? false,
  image: overrides.image
})

describe('Markets', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('shows a semantic reveal control and exposes additional markets on demand', async () => {
    mockGetMarketSchedule.mockResolvedValueOnce([
      createMarket({ _id: 'market-1', title: 'Market 1', date: '2099-04-01' }),
      createMarket({ _id: 'market-2', title: 'Market 2', date: '2099-04-02' }),
      createMarket({ _id: 'market-3', title: 'Market 3', date: '2099-04-03' }),
      createMarket({ _id: 'market-4', title: 'Market 4', date: '2099-04-04' }),
      createMarket({ _id: 'market-5', title: 'Market 5', date: '2099-04-05' })
    ])

    const element = await Markets()
    render(element)

    const marketList = document.getElementById('homepage-markets-list')
    const revealButton = screen.getByRole('button', { name: /show all markets/i })
    const market3Wrapper = screen.getByTestId('market-item-market-3')
    const market4Wrapper = screen.getByTestId('market-item-market-4')
    const market5Wrapper = screen.getByTestId('market-item-market-5')

    expect(marketList).toBeInTheDocument()
    expect(revealButton).toHaveAttribute('aria-expanded', 'false')
    expect(revealButton).toHaveAttribute('aria-controls', 'homepage-markets-list')
    expect(screen.getByText('Market 3')).toBeInTheDocument()
    expect(screen.getByText('Market 4')).toBeInTheDocument()
    expect(screen.getByText('Market 5')).toBeInTheDocument()
    expect(market3Wrapper.className).toContain('hidden')
    expect(market3Wrapper.className).toContain('large-laptop:contents')
    expect(market4Wrapper.className).toBe('hidden')
    expect(market5Wrapper.className).toBe('hidden')

    fireEvent.click(revealButton)

    expect(screen.getByRole('button', { name: /show fewer markets/i })).toHaveAttribute('aria-expanded', 'true')
    expect(market3Wrapper.className).toBe('contents')
    expect(market4Wrapper.className).toBe('contents')
    expect(market5Wrapper.className).toBe('contents')
    expect(screen.queryByRole('link', { name: /see all markets/i })).not.toBeInTheDocument()
  })

  it('renders market event json-ld for upcoming markets on the homepage', async () => {
    mockGetMarketSchedule.mockResolvedValueOnce([
      createMarket({ _id: 'market-1', title: 'Market 1', date: '2099-04-01' }),
      createMarket({ _id: 'market-2', title: 'Market 2', date: '2099-04-02' }),
      createMarket({ _id: 'market-3', title: 'Market 3', date: '2099-04-03' }),
      createMarket({ _id: 'market-4', title: 'Market 4', date: '2099-04-04' })
    ])

    const element = await Markets()
    const { container } = render(element)

    const script = container.querySelector('script[type="application/ld+json"]')

    expect(script).toBeTruthy()
    expect(script?.textContent).toContain('"@type":"Event"')
    expect(script?.textContent).toContain('"name":"Market 1"')
  })

  it('formats market dates in UK time for deterministic client rendering', async () => {
    mockGetMarketSchedule.mockResolvedValueOnce([
      createMarket({
        _id: 'market-1',
        title: 'Market 1',
        date: '2099-04-01'
      })
    ])

    const element = await Markets()
    render(element)

    expect(screen.getByText('Wednesday 1 April')).toBeInTheDocument()
  })

  it('filters markets using the current Europe/London calendar date', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-05-09T23:30:00.000Z'))
    mockGetMarketSchedule.mockResolvedValueOnce([
      createMarket({
        _id: 'market-past',
        title: 'Morley Makers Market',
        date: '2026-05-09'
      }),
      createMarket({
        _id: 'market-today',
        title: 'Sunday Market',
        date: '2026-05-10'
      })
    ])

    const element = await Markets()
    render(element)

    expect(screen.queryByText('Morley Makers Market')).not.toBeInTheDocument()
    expect(screen.getByText('Sunday Market')).toBeInTheDocument()
  })

  it('does not render a reveal control when only two upcoming markets exist', async () => {
    mockGetMarketSchedule.mockResolvedValueOnce([
      createMarket({ _id: 'market-1', title: 'Market 1', date: '2099-04-01' }),
      createMarket({ _id: 'market-2', title: 'Market 2', date: '2099-04-02' })
    ])

    const element = await Markets()
    render(element)

    expect(screen.getByText('Market 1')).toBeInTheDocument()
    expect(screen.getByText('Market 2')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /show all markets/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /see all markets/i })).not.toBeInTheDocument()
  })

  it('keeps the reveal control for compact layouts but hides it on large laptops when only three markets exist', async () => {
    mockGetMarketSchedule.mockResolvedValueOnce([
      createMarket({ _id: 'market-1', title: 'Market 1', date: '2099-04-01' }),
      createMarket({ _id: 'market-2', title: 'Market 2', date: '2099-04-02' }),
      createMarket({ _id: 'market-3', title: 'Market 3', date: '2099-04-03' })
    ])

    const element = await Markets()
    render(element)

    const revealButton = screen.getByRole('button', { name: /show all markets/i })
    const revealWrapper = revealButton.parentElement

    expect(revealButton).toBeInTheDocument()
    expect(revealWrapper).toHaveClass('flex', 'justify-center', 'large-laptop:hidden')
  })

  it('collapses back to the initial mobile subset after showing all markets', async () => {
    mockGetMarketSchedule.mockResolvedValueOnce([
      createMarket({ _id: 'market-1', title: 'Market 1', date: '2099-04-01' }),
      createMarket({ _id: 'market-2', title: 'Market 2', date: '2099-04-02' }),
      createMarket({ _id: 'market-3', title: 'Market 3', date: '2099-04-03' }),
      createMarket({ _id: 'market-4', title: 'Market 4', date: '2099-04-04' })
    ])

    const element = await Markets()
    render(element)

    const market4Wrapper = screen.getByTestId('market-item-market-4')

    fireEvent.click(screen.getByRole('button', { name: /show all markets/i }))
    expect(market4Wrapper.className).toBe('contents')

    fireEvent.click(screen.getByRole('button', { name: /show fewer markets/i }))
    expect(screen.getByText('Market 4')).toBeInTheDocument()
    expect(market4Wrapper.className).toBe('hidden')
  })

  it('renders the empty state when there are no upcoming markets', async () => {
    mockGetMarketSchedule.mockResolvedValueOnce([])

    const element = await Markets()
    render(element)

    expect(screen.getByText('Market dates are announced soon. Contact us for the latest updates.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /contact us about dates/i })).toHaveAttribute('href', '/contact')
  })
})
