/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { UtilityBar } from '../UtilityBar'
import { ReviewStatsProvider } from '../ReviewStatsProvider'

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href, ...props }: MockProps) => <a href={href} {...props}>{children}</a>
})

// Mock dependencies
jest.mock('@/lib/design-system', () => ({
  designTokens: {
    colors: {
      background: { paper: '#FFF' },
      border: { light: '#E0E0E0' },
      primary: { main: '#2E3192' },
      secondary: { main: '#FEF102' },
      text: { secondary: '#666' }
    },
    typography: { fontSize: { sm: '0.875rem' } },
    spacing: { md: '1rem' }
  }
}))

jest.mock('@/lib/business-info', () => ({
  CLIENT_BUSINESS_INFO: {
    telLink: 'tel:+441234567890',
    displayPhone: '+44 123 456 7890'
  }
}))

jest.mock('@/lib/constants', () => ({
  BUSINESS_CONSTANTS: {
    SOCIAL: {
      youtube: 'https://youtube.com/test',
      whatsapp: 'https://wa.me/123'
    }
  }
}))

const renderWithStats = (stats = { count: 13, averageRating: 5 }) => {
  return render(
    <ReviewStatsProvider stats={stats}>
      <UtilityBar />
    </ReviewStatsProvider>
  )
}

jest.mock('@/lib/daisy-ui', () => ({
  Box: ({ children, component, role, sx, ...props }: MockProps) => {
    const Component = component || 'div'
    return <Component data-testid="box" role={role} {...props}>{children}</Component>
  },
  Typography: ({ children, variant, sx, ...props }: MockProps) => (
    <div data-testid="typography" data-variant={variant} {...props}>{children}</div>
  ),
  Tooltip: ({ children, title, ...props }: MockProps) => (
    <div data-testid="tooltip" title={title} {...props}>{children}</div>
  ),
  PhoneIcon: (props: MockProps) => <span data-testid="phone-icon" {...props}>📞</span>,
  EmailIcon: (props: MockProps) => <span data-testid="email-icon" {...props}>📧</span>,
  StarIcon: (props: MockProps) => <span data-testid="star-icon" {...props}>⭐</span>,
  InstagramIcon: (props: MockProps) => <span data-testid="instagram-icon" {...props}>📷</span>,
  FacebookIcon: (props: MockProps) => <span data-testid="facebook-icon" {...props}>👍</span>,
  YouTubeIcon: (props: MockProps) => <span data-testid="youtube-icon" {...props}>📺</span>,
  WhatsAppIcon: (props: MockProps) => <span data-testid="whatsapp-icon" {...props}>💬</span>
}))

jest.mock('@/lib/ui-components', () => ({
  Container: ({ children, sx, ...props }: MockProps) => <div data-testid="design-container" {...props}>{children}</div>,
  AccessibleIconButton: ({ children, component, href, ariaLabel, title, sx, ...props }: MockProps) => {
    const Component = component || 'button'
    return (
      <Component
        data-testid="accessible-icon-button"
        href={href}
        aria-label={ariaLabel}
        title={title}
        {...props}
      >
        {children}
      </Component>
    )
  }
}))

describe('UtilityBar', () => {
  it('should render without crashing', () => {
    renderWithStats()

    expect(screen.getAllByTestId('box').length).toBeGreaterThan(0)
  })

  it('should have navigation role', () => {
    const { container } = renderWithStats()

    const nav = container.querySelector('[role="navigation"]')
    expect(nav).toBeInTheDocument()
  })

  it('should have aria-label for navigation', () => {
    const { container } = renderWithStats()

    const nav = container.querySelector('[aria-label="Utility navigation"]')
    expect(nav).toBeInTheDocument()
  })

  it('should render design container', () => {
    renderWithStats()

    expect(screen.getByTestId('design-container')).toBeInTheDocument()
  })

  describe('Contact Information', () => {
    it('should render phone icon', () => {
      renderWithStats()

      expect(screen.getAllByTestId('phone-icon').length).toBeGreaterThan(0)
    })

    it('should render email icon', () => {
      renderWithStats()

      expect(screen.getAllByTestId('email-icon').length).toBeGreaterThan(0)
    })

    it('should display phone number', () => {
      renderWithStats()

      expect(screen.getByText('+44 123 456 7890')).toBeInTheDocument()
    })

    it('should display email address', () => {
      renderWithStats()

      expect(screen.getByText('hello@olgishcakes.co.uk')).toBeInTheDocument()
    })

    it('should link phone number', () => {
      renderWithStats()

      const phoneLink = screen.getByText('+44 123 456 7890').closest('a')
      expect(phoneLink).toHaveAttribute('href', 'tel:+441234567890')
    })

    it('should link email address', () => {
      renderWithStats()

      const emailLink = screen.getByText('hello@olgishcakes.co.uk').closest('a')
      expect(emailLink).toHaveAttribute('href', 'mailto:hello@olgishcakes.co.uk')
    })
  })

  describe('Hours and Rating', () => {
    it('should display "Order online 24/7" text', () => {
      renderWithStats()

      expect(screen.getByText('Order online 24/7')).toBeInTheDocument()
    })

    it('should render star icon', () => {
      renderWithStats()

      expect(screen.getByTestId('star-icon')).toBeInTheDocument()
    })

    it('should display rating', () => {
      renderWithStats({ count: 13, averageRating: 5 })

      expect(screen.getByText('5★ (13)')).toBeInTheDocument()
    })
  })

  describe('Social Media Links', () => {
    it('should render all social media icons', () => {
      renderWithStats()

      expect(screen.getByTestId('instagram-icon')).toBeInTheDocument()
      expect(screen.getByTestId('facebook-icon')).toBeInTheDocument()
      expect(screen.getByTestId('youtube-icon')).toBeInTheDocument()
      expect(screen.getByTestId('whatsapp-icon')).toBeInTheDocument()
    })

    it('should link to Instagram', () => {
      renderWithStats()

      const instagramButton = screen.getByTestId('instagram-icon').closest('a')
      expect(instagramButton).toHaveAttribute('href', 'https://www.instagram.com/olgish_cakes/')
    })

    it('should link to Facebook', () => {
      renderWithStats()

      const facebookButton = screen.getByTestId('facebook-icon').closest('a')
      expect(facebookButton).toHaveAttribute('href', expect.stringContaining('facebook.com'))
    })

    it('should link to YouTube', () => {
      renderWithStats()

      const youtubeButton = screen.getByTestId('youtube-icon').closest('a')
      expect(youtubeButton).toHaveAttribute('href', 'https://youtube.com/test')
    })

    it('should link to WhatsApp', () => {
      renderWithStats()

      const whatsappButton = screen.getByTestId('whatsapp-icon').closest('a')
      expect(whatsappButton).toHaveAttribute('href', 'https://wa.me/123')
    })

    it('should open social links in new tab', () => {
      renderWithStats()

      const instagramButton = screen.getByTestId('instagram-icon').closest('a')
      expect(instagramButton).toHaveAttribute('target', '_blank')
      expect(instagramButton).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  describe('Tooltips', () => {
    it('should have Instagram tooltip', () => {
      renderWithStats()

      const tooltips = screen.getAllByTestId('tooltip')
      const instagramTooltip = tooltips.find(t => t.getAttribute('title') === 'Instagram')
      expect(instagramTooltip).toBeTruthy()
    })

    it('should have Facebook tooltip', () => {
      renderWithStats()

      const tooltips = screen.getAllByTestId('tooltip')
      const facebookTooltip = tooltips.find(t => t.getAttribute('title') === 'Facebook')
      expect(facebookTooltip).toBeTruthy()
    })

    it('should have YouTube tooltip', () => {
      renderWithStats()

      const tooltips = screen.getAllByTestId('tooltip')
      const youtubeTooltip = tooltips.find(t => t.getAttribute('title') === 'YouTube')
      expect(youtubeTooltip).toBeTruthy()
    })

    it('should have WhatsApp tooltip', () => {
      renderWithStats()

      const tooltips = screen.getAllByTestId('tooltip')
      const whatsappTooltip = tooltips.find(t => t.getAttribute('title') === 'WhatsApp')
      expect(whatsappTooltip).toBeTruthy()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible icon buttons', () => {
      renderWithStats()

      const iconButtons = screen.getAllByTestId('accessible-icon-button')
      expect(iconButtons.length).toBeGreaterThan(0)
    })

    it('should have aria-labels on social buttons', () => {
      renderWithStats()

      const iconButtons = screen.getAllByTestId('accessible-icon-button')
      
      const instagramButton = iconButtons.find(btn => 
        btn.getAttribute('aria-label') === 'Open Instagram'
      )
      expect(instagramButton).toBeTruthy()
    })

    it('should have aria-label for phone', () => {
      renderWithStats()

      const phoneLinks = screen.getAllByText('+44 123 456 7890')
      const phoneLink = phoneLinks[0].closest('a')
      expect(phoneLink).toHaveAttribute('aria-label', expect.stringContaining('Call'))
    })

    it('should have aria-label for email', () => {
      renderWithStats()

      const emailLink = screen.getByText('hello@olgishcakes.co.uk').closest('a')
      expect(emailLink).toHaveAttribute('aria-label', 'Email hello@olgishcakes.co.uk')
    })
  })

  describe('Export', () => {
    it('should export UtilityBar as named export', () => {
      expect(UtilityBar).toBeDefined()
      expect(typeof UtilityBar).toBe('function')
    })
  })
})
