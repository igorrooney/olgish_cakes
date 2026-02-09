/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react'
import WeddingCakesPage, { metadata } from '../page'

jest.mock('../../utils/fetchCakes', () => ({ getAllCakes: jest.fn(() => Promise.resolve([])) }))
jest.mock('../../components/CakeCard', () => ({ __esModule: true, default: () => <div>Card</div> }))
jest.mock('../../components/Breadcrumbs', () => ({ Breadcrumbs: () => <nav>Breadcrumbs</nav> }))
jest.mock('../../components/AreasWeCover', () => ({ AreasWeCover: () => <div>Areas</div> }))
jest.mock('@/types/cake', () => ({ blocksToText: jest.fn(() => 'Text') }))
jest.mock('../../utils/seo', () => ({ getPriceValidUntil: jest.fn(() => '2026-01-01') }))
jest.mock('../../utils/review-stats', () => ({
  formatReviewCount: jest.fn((count: number) => count.toString())
}))

jest.mock('../../utils/review-stats.server', () => ({
  getReviewStats: jest.fn(async () => ({ count: 13, averageRating: 5 }))
}))
jest.mock('next/link', () => ({ __esModule: true, default: ({ children, href }: MockProps) => <a href={href}>{children}</a> }))
jest.mock('@mui/material', () => ({
  Container: ({ children }: MockProps) => <div>{children}</div>,
  Typography: ({ children }: MockProps) => <div>{children}</div>,
  Box: ({ children }: MockProps) => <div>{children}</div>,
  Grid: ({ children }: MockProps) => <div>{children}</div>,
  Paper: ({ children }: MockProps) => <div>{children}</div>,
  Chip: ({ label }: MockProps) => <span>{label}</span>,
  Button: ({ children }: MockProps) => <button>{children}</button>
}))

describe('WeddingCakesPage', () => {
  it('should have wedding-specific metadata', () => {
    expect(metadata.title).toContain('Wedding')
    expect(metadata.description.toLowerCase()).toContain('wedding')
  })

  it('should render without crashing', async () => {
    const page = await WeddingCakesPage()
    expect(() => render(page)).not.toThrow()
  })
})
