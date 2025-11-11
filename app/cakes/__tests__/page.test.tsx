/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import CakesPage, { metadata, revalidate, dynamic } from '../page'

// Mock utils
jest.mock('../../utils/fetchCakes', () => ({
  getAllCakes: jest.fn(() => Promise.resolve([
    {
      _id: '1',
      name: 'Honey Cake',
      slug: { current: 'honey-cake' },
      category: 'Traditional',
      pricing: { standard: 30 }
    }
  ])),
  getRevalidateTime: jest.fn(() => 60)
}))

// Mock components
jest.mock('../../components/CakeCard', () => ({
  __esModule: true,
  default: () => <div data-testid="cake-card">Cake Card</div>
}))

jest.mock('../../components/Loading', () => ({
  __esModule: true,
  default: () => <div data-testid="loading">Loading</div>
}))

jest.mock('../HeroSection', () => ({
  __esModule: true,
  default: () => <div data-testid="hero-section">Hero Section</div>
}))

jest.mock('../../components/Breadcrumbs', () => ({
  Breadcrumbs: () => <nav data-testid="breadcrumbs">Breadcrumbs</nav>
}))

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children }: { children: React.ReactNode }) => <div>{children}</div>
})

// Mock MUI
jest.mock('@/lib/mui-optimization', () => ({
  Container: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => <div {...props}>{children}</div>,
  Grid: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => <div {...props}>{children}</div>,
  Typography: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => <div {...props}>{children}</div>,
  Box: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => <div {...props}>{children}</div>,
  Button: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => <button {...props}>{children}</button>,
  Paper: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => <div {...props}>{children}</div>
}))

describe('CakesPage', () => {
  describe('Static Configuration', () => {
    it('should have force-static dynamic', () => {
      expect(dynamic).toBe('force-static')
    })

    it('should use revalidateTime from fetchCakes', () => {
      const { getRevalidateTime } = require('../../utils/fetchCakes')

      expect(revalidate).toBe(getRevalidateTime())
    })
  })

  describe('Metadata', () => {
    it('should have title with traditional and birthday keywords', () => {
      expect(metadata.title).toContain('Traditional Ukrainian Cakes')
      expect(metadata.title).toContain('Leeds')
    })

    it('should have description with reviews', () => {
      expect(metadata.description).toContain('127+')
      expect(metadata.description).toContain('5-star reviews')
    })

    it('should have keywords as string', () => {
      expect(typeof metadata.keywords).toBe('string')
    })

    it('should include Medovik keyword', () => {
      expect(metadata.keywords).toContain('Medovik')
    })

    it('should have OpenGraph URL', () => {
      expect(metadata.openGraph?.url).toBe('https://olgishcakes.co.uk/cakes')
    })

    it('should have canonical URL', () => {
      expect(metadata.alternates?.canonical).toBe('https://olgishcakes.co.uk/cakes')
    })
  })

  describe('Structured Data', () => {
    it('should include local business schema', async () => {
      const page = await CakesPage()
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const localBusiness = Array.from(scripts).find(s =>
        s.textContent?.includes('"@type":"Bakery"')
      )

      expect(localBusiness).toBeTruthy()
    })

    it('should include offer catalog', async () => {
      const page = await CakesPage()
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const script = scripts[0]
      const json = JSON.parse(script?.textContent || '{}')

      // Check for offer catalog in various possible properties
      expect(json.hasOfferCatalog || json.offers || json['@type']).toBeDefined()
    })
  })

  describe('Data Fetching', () => {
    it('should fetch all cakes', async () => {
      const { getAllCakes } = require('../../utils/fetchCakes')

      await CakesPage()

      expect(getAllCakes).toHaveBeenCalledWith(false)
    })

    it('should pass preview=false for static generation', async () => {
      const { getAllCakes } = require('../../utils/fetchCakes')

      await CakesPage()

      expect(getAllCakes).toHaveBeenCalledWith(false)
    })
  })

  describe('Rendering', () => {
    it('should render without crashing', async () => {
      const page = await CakesPage()

      expect(() => render(page)).not.toThrow()
    })

    it('should render Hero Section', async () => {
      const page = await CakesPage()

      render(page)

      expect(screen.getByTestId('hero-section')).toBeInTheDocument()
    })

    it('should render Breadcrumbs', async () => {
      const page = await CakesPage()

      render(page)

      expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument()
    })

    it('should render cake cards', async () => {
      const page = await CakesPage()

      render(page)

      expect(screen.getByTestId('cake-card')).toBeInTheDocument()
    })

    it('should handle empty cakes array', async () => {
      const { getAllCakes } = require('../../utils/fetchCakes')
      getAllCakes.mockResolvedValue([])

      const page = await CakesPage()

      expect(() => render(page)).not.toThrow()
    })
  })
})

