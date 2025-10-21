/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import ContactPage, { metadata } from '../page'

// Mock components
jest.mock('../../components/ContactForm', () => ({
  ContactForm: () => <div data-testid="contact-form">Contact Form</div>
}))

jest.mock('../../components/Breadcrumbs', () => ({
  Breadcrumbs: () => <nav data-testid="breadcrumbs">Breadcrumbs</nav>
}))

// Mock Next.js Link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>
}))

// Mock MUI
jest.mock('@/lib/mui-optimization', () => ({
  Container: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Typography: ({ children, component, ...props }: any) => {
    const Component = component || 'div'
    return <Component {...props}>{children}</Component>
  },
  Box: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Stack: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Link: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
  Grid: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Paper: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Divider: () => <hr />,
  PhoneIcon: () => <span>📞</span>,
  EmailIcon: () => <span>📧</span>,
  InstagramIcon: () => <span>📷</span>,
  FacebookIcon: () => <span>📘</span>,
  WhatsAppIcon: () => <span>💬</span>
}))

describe('ContactPage', () => {
  describe('Metadata', () => {
    it('should have title', () => {
      expect(metadata.title).toContain('Contact')
      expect(metadata.title).toContain('Olgish Cakes')
    })

    it('should have description', () => {
      expect(metadata.description).toBeDefined()
      expect(metadata.description).toContain('touch')
    })

    it('should have OpenGraph data', () => {
      expect(metadata.openGraph).toBeDefined()
      expect(metadata.openGraph?.title).toBeDefined()
      expect(metadata.openGraph?.url).toBe('https://olgishcakes.co.uk/contact')
    })

    it('should have Twitter card data', () => {
      expect(metadata.twitter).toBeDefined()
      expect(metadata.twitter?.card).toBe('summary_large_image')
    })

    it('should have canonical URL', () => {
      expect(metadata.alternates?.canonical).toBe('https://olgishcakes.co.uk/contact')
    })

    it('should have keywords', () => {
      expect(metadata.keywords).toBeDefined()
    })
  })

  describe('Rendering', () => {
    it('should render without crashing', () => {
      expect(() => render(<ContactPage />)).not.toThrow()
    })

    it('should render ContactForm', () => {
      render(<ContactPage />)

      expect(screen.getByTestId('contact-form')).toBeInTheDocument()
    })

    it('should render Breadcrumbs', () => {
      render(<ContactPage />)

      expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument()
    })
  })
})

