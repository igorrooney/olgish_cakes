/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react'
import BirthdayCakesPage, { metadata } from '../page'

jest.mock('../../utils/fetchCakes', () => ({ getAllCakes: jest.fn(() => Promise.resolve([])) }))
jest.mock('../../components/CakeCard', () => ({ __esModule: true, default: () => <div data-testid="cake-card">Card</div> }))
jest.mock('../../components/Breadcrumbs', () => ({ Breadcrumbs: () => <nav data-testid="breadcrumbs">Breadcrumbs</nav> }))
jest.mock('../../components/AreasWeCover', () => ({ AreasWeCover: () => <div data-testid="areas">Areas</div> }))
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

describe('BirthdayCakesPage', () => {
  it('should have occasion-specific metadata', () => {
    expect(metadata.title).toContain('Birthday')
    expect(metadata.description).toContain('birthday')
  })

  it('should have pricing in title', () => {
    expect(metadata.title).toContain('£35')
  })

  it('should render without crashing', async () => {
    const page = await BirthdayCakesPage()
    expect(() => render(page)).not.toThrow()
  })
})

