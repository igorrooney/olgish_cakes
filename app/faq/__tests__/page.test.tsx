/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import FAQPage, { metadata } from '../page'

// Mock utils
jest.mock('../../utils/fetchFaqs', () => ({
  getFaqs: jest.fn(() => Promise.resolve([
    { _id: '1', question: 'Test Question?', answer: 'Test Answer', order: 1 }
  ]))
}))

// Mock components
jest.mock('../../components/Breadcrumbs', () => ({
  Breadcrumbs: () => <nav data-testid="breadcrumbs">Breadcrumbs</nav>
}))

jest.mock('../FAQItems', () => ({
  FAQItems: () => <div data-testid="faq-items">FAQ Items</div>
}))

// Mock Next.js Link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>
}))

// Mock MUI
jest.mock('@mui/material', () => ({
  Container: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Typography: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Box: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Button: ({ children, component, href, ...props }: any) => {
    const Component = component || 'button'
    return <Component href={href} {...props}>{children}</Component>
  }
}))

describe('FAQPage', () => {
  describe('Metadata', () => {
    it('should have title', () => {
      expect(metadata.title).toContain('FAQ')
      expect(metadata.title).toContain('Olgish Cakes')
    })

    it('should have description', () => {
      expect(metadata.description).toBeDefined()
      expect(metadata.description).toContain('questions')
    })

    it('should have OpenGraph data', () => {
      expect(metadata.openGraph).toBeDefined()
      expect(metadata.openGraph?.url).toBe('https://olgishcakes.co.uk/faq')
    })

    it('should have Twitter card', () => {
      expect(metadata.twitter).toBeDefined()
      expect(metadata.twitter?.card).toBe('summary_large_image')
    })

    it('should have canonical URL', () => {
      expect(metadata.alternates?.canonical).toBe('https://olgishcakes.co.uk/faq')
    })

    it('should have keywords', () => {
      expect(metadata.keywords).toBeDefined()
      expect(Array.isArray(metadata.keywords)).toBe(true)
    })
  })

  describe('Data Fetching', () => {
    it('should fetch FAQs', async () => {
      const { getFaqs } = require('../../utils/fetchFaqs')

      await FAQPage()

      expect(getFaqs).toHaveBeenCalled()
    })
  })

  describe('Rendering', () => {
    it('should render without crashing', async () => {
      const page = await FAQPage()

      expect(() => render(page)).not.toThrow()
    })

    it('should render FAQItems', async () => {
      const page = await FAQPage()

      render(page)

      expect(screen.getByTestId('faq-items')).toBeInTheDocument()
    })

    it('should render Breadcrumbs', async () => {
      const page = await FAQPage()

      render(page)

      expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument()
    })
  })
})

