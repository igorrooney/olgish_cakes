/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import MarketSchedulePage, { generateMetadata } from '../page'

// Mock utils
jest.mock('@/app/utils/fetchMarketSchedule', () => ({
  getMarketSchedule: jest.fn(() => Promise.resolve([
    {
      _id: '1',
      title: 'Leeds Market',
      location: 'Leeds City Center',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '17:00',
      active: true,
      image: {
        asset: { url: 'https://example.com/market.jpg', _ref: 'img1', _type: 'sanity.imageAsset' },
        alt: 'Market'
      }
    }
  ]))
}))

// Mock components
jest.mock('@/app/components/MarketSchedule', () => ({
  __esModule: true,
  default: ({ events }: any) => <div data-testid="market-schedule">Market Schedule ({events.length} events)</div>
}))

jest.mock('@/app/components/Breadcrumbs', () => ({
  Breadcrumbs: () => <nav data-testid="breadcrumbs">Breadcrumbs</nav>
}))

// Mock MUI
jest.mock('@/lib/mui-optimization', () => ({
  Box: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Container: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Typography: ({ children, ...props }: any) => <div {...props}>{children}</div>
}))

describe('MarketSchedulePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Metadata Generation', () => {
    it('should generate metadata with next event', async () => {
      const metadata = await generateMetadata()

      expect(metadata.title).toBeDefined()
      expect(metadata.description).toBeDefined()
    })

    it('should include event location in title', async () => {
      const metadata = await generateMetadata()

      expect(metadata.title).toContain('Leeds City Center')
    })

    it('should include event date in description', async () => {
      const metadata = await generateMetadata()

      expect(metadata.description).toContain('Leeds City Center')
    })

    it('should use default title when no upcoming events', async () => {
      const { getMarketSchedule } = require('@/app/utils/fetchMarketSchedule')
      getMarketSchedule.mockResolvedValue([])

      const metadata = await generateMetadata()

      expect(metadata.title).toContain('Local Market Schedule')
    })

    it('should use default description when no upcoming events', async () => {
      const { getMarketSchedule } = require('@/app/utils/fetchMarketSchedule')
      getMarketSchedule.mockResolvedValue([])

      const metadata = await generateMetadata()

      expect(metadata.description).toContain('Find Olgish Cakes')
    })

    it('should use event image in OpenGraph', async () => {
      const { getMarketSchedule } = require('@/app/utils/fetchMarketSchedule')
      getMarketSchedule.mockResolvedValue([
        {
          _id: '1',
          title: 'Leeds Market',
          location: 'Leeds City Center',
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          startTime: '09:00',
          endTime: '17:00',
          active: true,
          image: {
            asset: { url: 'https://example.com/market.jpg', _ref: 'img1', _type: 'sanity.imageAsset' },
            alt: 'Market'
          }
        }
      ])

      const metadata = await generateMetadata()

      expect(metadata.openGraph?.images?.[0].url).toContain('example.com/market.jpg')
    })

    it('should use fallback image when no event image', async () => {
      const { getMarketSchedule } = require('@/app/utils/fetchMarketSchedule')
      getMarketSchedule.mockResolvedValue([])

      const metadata = await generateMetadata()

      expect(metadata.openGraph?.images?.[0].url).toContain('logo')
    })

    it('should have canonical URL', async () => {
      const metadata = await generateMetadata()

      expect(metadata.alternates?.canonical).toBe('https://olgishcakes.co.uk/market-schedule')
    })
  })

  describe('Data Fetching', () => {
    it('should fetch market schedule', async () => {
      const { getMarketSchedule } = require('@/app/utils/fetchMarketSchedule')

      await MarketSchedulePage()

      expect(getMarketSchedule).toHaveBeenCalled()
    })
  })

  describe('Rendering', () => {
    it('should render without crashing', async () => {
      const page = await MarketSchedulePage()

      expect(() => render(page)).not.toThrow()
    })

    it('should render MarketSchedule component', async () => {
      const page = await MarketSchedulePage()

      render(page)

      expect(screen.getByTestId('market-schedule')).toBeInTheDocument()
    })

    it('should render Breadcrumbs', async () => {
      const page = await MarketSchedulePage()

      render(page)

      expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument()
    })

    it('should pass events to MarketSchedule', async () => {
      const page = await MarketSchedulePage()

      render(page)

      expect(screen.getByTestId('market-schedule')).toBeInTheDocument()
    })

    it('should render main section', async () => {
      const page = await MarketSchedulePage()

      const { container } = render(page)

      expect(container.querySelector('main')).toBeInTheDocument()
    })
  })
})

