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
jest.mock('next/link', () => ({ __esModule: true, default: ({ children, href }: any) => <a href={href}>{children}</a> }))
jest.mock('@mui/material', () => ({
  Container: ({ children }: any) => <div>{children}</div>,
  Typography: ({ children }: any) => <div>{children}</div>,
  Box: ({ children }: any) => <div>{children}</div>,
  Grid: ({ children }: any) => <div>{children}</div>,
  Paper: ({ children }: any) => <div>{children}</div>,
  Chip: ({ label }: any) => <span>{label}</span>,
  Button: ({ children }: any) => <button>{children}</button>
}))

describe('WeddingCakesPage', () => {
  it('should have wedding-specific metadata', () => {
    expect(metadata.title).toContain('Wedding')
    expect(metadata.description).toContain('wedding')
  })

  it('should render without crashing', async () => {
    const page = await WeddingCakesPage()
    expect(() => render(page)).not.toThrow()
  })
})

