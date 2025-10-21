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

    it('should use revalidateTime', () => {
      expect(revalidate).toBe(60)
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
})

