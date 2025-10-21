/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { UtilityBar } from '../UtilityBar'

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>
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

jest.mock('@/lib/mui-optimization', () => ({
  Box: ({ children, component, role, sx, ...props }: any) => {
    const Component = component || 'div'
    return <Component data-testid="box" role={role} {...props}>{children}</Component>
  },
  Typography: ({ children, variant, sx, ...props }: any) => (
    <div data-testid="typography" data-variant={variant} {...props}>{children}</div>
  ),
  Tooltip: ({ children, title, ...props }: any) => (
    <div data-testid="tooltip" title={title} {...props}>{children}</div>
  ),
  PhoneIcon: (props: any) => <span data-testid="phone-icon" {...props}>📞</span>,
  EmailIcon: (props: any) => <span data-testid="email-icon" {...props}>📧</span>,
  StarIcon: (props: any) => <span data-testid="star-icon" {...props}>⭐</span>,
  InstagramIcon: (props: any) => <span data-testid="instagram-icon" {...props}>📷</span>,
  FacebookIcon: (props: any) => <span data-testid="facebook-icon" {...props}>👍</span>,
  YouTubeIcon: (props: any) => <span data-testid="youtube-icon" {...props}>📺</span>,
  WhatsAppIcon: (props: any) => <span data-testid="whatsapp-icon" {...props}>💬</span>
}))

jest.mock('@/lib/ui-components', () => ({
  Container: ({ children, sx, ...props }: any) => <div data-testid="design-container" {...props}>{children}</div>,
  AccessibleIconButton: ({ children, component, href, ariaLabel, title, sx, ...props }: any) => {
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
    render(<UtilityBar />)

    expect(screen.getAllByTestId('box').length).toBeGreaterThan(0)
  })

  it('should have navigation role', () => {
    const { container } = render(<UtilityBar />)

    const nav = container.querySelector('[role="navigation"]')
    expect(nav).toBeInTheDocument()
  })

  it('should have aria-label for navigation', () => {
    const { container } = render(<UtilityBar />)

    const nav = container.querySelector('[aria-label="Utility navigation"]')
    expect(nav).toBeInTheDocument()
  })

  it('should render design container', () => {
    render(<UtilityBar />)

    expect(screen.getByTestId('design-container')).toBeInTheDocument()
  })

  describe('Contact Information', () => {
    it('should render phone icon', () => {
      render(<UtilityBar />)

      expect(screen.getAllByTestId('phone-icon').length).toBeGreaterThan(0)
    })

    it('should render email icon', () => {
      render(<UtilityBar />)

      expect(screen.getAllByTestId('email-icon').length).toBeGreaterThan(0)
    })

    it('should display phone number', () => {
      render(<UtilityBar />)

      expect(screen.getByText('+44 123 456 7890')).toBeInTheDocument()
    })

    it('should display email address', () => {
      render(<UtilityBar />)

      expect(screen.getByText('hello@olgishcakes.co.uk')).toBeInTheDocument()
    })

    it('should link phone number', () => {
      render(<UtilityBar />)

      const phoneLink = screen.getByText('+44 123 456 7890').closest('a')
      expect(phoneLink).toHaveAttribute('href', 'tel:+441234567890')
    })

    it('should link email address', () => {
      render(<UtilityBar />)

      const emailLink = screen.getByText('hello@olgishcakes.co.uk').closest('a')
      expect(emailLink).toHaveAttribute('href', 'mailto:hello@olgishcakes.co.uk')
    })
  })

  describe('Hours and Rating', () => {
    it('should display "Order online 24/7" text', () => {
      render(<UtilityBar />)

      expect(screen.getByText('Order online 24/7')).toBeInTheDocument()
    })

    it('should render star icon', () => {
      render(<UtilityBar />)

      expect(screen.getByTestId('star-icon')).toBeInTheDocument()
    })

    it('should display rating', () => {
      render(<UtilityBar />)

      expect(screen.getByText('5★ (127+)')).toBeInTheDocument()
    })
  })

  describe('Social Media Links', () => {
    it('should render all social media icons', () => {
      render(<UtilityBar />)

      expect(screen.getByTestId('instagram-icon')).toBeInTheDocument()
      expect(screen.getByTestId('facebook-icon')).toBeInTheDocument()
      expect(screen.getByTestId('youtube-icon')).toBeInTheDocument()
      expect(screen.getByTestId('whatsapp-icon')).toBeInTheDocument()
    })

    it('should link to Instagram', () => {
      render(<UtilityBar />)

      const instagramButton = screen.getByTestId('instagram-icon').closest('a')
      expect(instagramButton).toHaveAttribute('href', 'https://www.instagram.com/olgish_cakes/')
    })

    it('should link to Facebook', () => {
      render(<UtilityBar />)

      const facebookButton = screen.getByTestId('facebook-icon').closest('a')
      expect(facebookButton).toHaveAttribute('href', expect.stringContaining('facebook.com'))
    })

    it('should link to YouTube', () => {
      render(<UtilityBar />)

      const youtubeButton = screen.getByTestId('youtube-icon').closest('a')
      expect(youtubeButton).toHaveAttribute('href', 'https://youtube.com/test')
    })

    it('should link to WhatsApp', () => {
      render(<UtilityBar />)

      const whatsappButton = screen.getByTestId('whatsapp-icon').closest('a')
      expect(whatsappButton).toHaveAttribute('href', 'https://wa.me/123')
    })

    it('should open social links in new tab', () => {
      render(<UtilityBar />)

      const instagramButton = screen.getByTestId('instagram-icon').closest('a')
      expect(instagramButton).toHaveAttribute('target', '_blank')
      expect(instagramButton).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  describe('Tooltips', () => {
    it('should have Instagram tooltip', () => {
      render(<UtilityBar />)

      const tooltips = screen.getAllByTestId('tooltip')
      const instagramTooltip = tooltips.find(t => t.getAttribute('title') === 'Instagram')
      expect(instagramTooltip).toBeTruthy()
    })

    it('should have Facebook tooltip', () => {
      render(<UtilityBar />)

      const tooltips = screen.getAllByTestId('tooltip')
      const facebookTooltip = tooltips.find(t => t.getAttribute('title') === 'Facebook')
      expect(facebookTooltip).toBeTruthy()
    })

    it('should have YouTube tooltip', () => {
      render(<UtilityBar />)

      const tooltips = screen.getAllByTestId('tooltip')
      const youtubeTooltip = tooltips.find(t => t.getAttribute('title') === 'YouTube')
      expect(youtubeTooltip).toBeTruthy()
    })

    it('should have WhatsApp tooltip', () => {
      render(<UtilityBar />)

      const tooltips = screen.getAllByTestId('tooltip')
      const whatsappTooltip = tooltips.find(t => t.getAttribute('title') === 'WhatsApp')
      expect(whatsappTooltip).toBeTruthy()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible icon buttons', () => {
      render(<UtilityBar />)

      const iconButtons = screen.getAllByTestId('accessible-icon-button')
      expect(iconButtons.length).toBeGreaterThan(0)
    })

    it('should have aria-labels on social buttons', () => {
      render(<UtilityBar />)

      const iconButtons = screen.getAllByTestId('accessible-icon-button')
      
      const instagramButton = iconButtons.find(btn => 
        btn.getAttribute('aria-label') === 'Open Instagram'
      )
      expect(instagramButton).toBeTruthy()
    })

    it('should have aria-label for phone', () => {
      render(<UtilityBar />)

      const phoneLinks = screen.getAllByText('+44 123 456 7890')
      const phoneLink = phoneLinks[0].closest('a')
      expect(phoneLink).toHaveAttribute('aria-label', expect.stringContaining('Call'))
    })

    it('should have aria-label for email', () => {
      render(<UtilityBar />)

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

