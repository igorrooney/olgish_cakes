/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import CakesLeedsPage, { metadata } from '../page'

jest.mock('../../utils/fetchCakes', () => ({
  getAllCakes: jest.fn(() => Promise.resolve([]))
}))

jest.mock('../../components/CakeCard', () => ({
  __esModule: true,
  default: () => <div data-testid="cake-card">Cake Card</div>
}))

jest.mock('../../components/Breadcrumbs', () => ({
  Breadcrumbs: () => <nav data-testid="breadcrumbs">Breadcrumbs</nav>
}))

jest.mock('@/types/cake', () => ({ blocksToText: jest.fn(() => 'Text') }))

jest.mock('../../utils/seo', () => ({
  getPriceValidUntil: jest.fn(() => '2026-01-01'),
  getOfferShippingDetails: jest.fn(() => ({ '@type': 'OfferShippingDetails' }))
}))

jest.mock('next/link', () => ({ __esModule: true, default: ({ children, href }: any) => <a href={href}>{children}</a> }))
jest.mock('next/script', () => ({ 
  __esModule: true, 
  default: ({ children, id, type, ...props }: any) => (
    <script data-testid={id} type={type} {...props}>{children}</script>
  )
}))
jest.mock('@mui/material', () => ({
  Container: ({ children }: any) => <div>{children}</div>,
  Typography: ({ children }: any) => <div>{children}</div>,
  Box: ({ children }: any) => <div>{children}</div>,
  Grid: ({ children }: any) => <div>{children}</div>,
  Paper: ({ children }: any) => <div>{children}</div>,
  Chip: ({ label }: any) => <span>{label}</span>,
  Button: ({ children }: any) => <button>{children}</button>
}))

describe('CakesLeedsPage', () => {
  it('should have location-specific metadata', () => {
    expect(metadata.title).toContain('Leeds')
    expect(metadata.description).toContain('Leeds')
  })

  it('should have canonical URL', () => {
    expect(metadata.alternates?.canonical).toBe('https://olgishcakes.co.uk/cakes-leeds')
  })

  it('should render without crashing', async () => {
    const page = await CakesLeedsPage()
    expect(() => render(page)).not.toThrow()
  })

  it('should include structured data', async () => {
    const page = await CakesLeedsPage()
    const { container } = render(page)
    const scripts = container.querySelectorAll('script[type="application/ld+json"]')
    expect(scripts.length).toBeGreaterThan(0)
  })
})

