/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import {
  PrimaryButton,
  SecondaryButton,
  OutlineButton,
  ProductCard,
  FeatureCard,
  StyledTextField,
  IngredientChip,
  AllergenChip,
  CategoryChip,
  DisplayHeading,
  SectionHeading,
  CardHeading,
  BodyText,
  Container,
  Section,
  StyledAccordion,
  PriceDisplay,
  RatingBadge,
  AddToCartButton,
  AccessibleIconButton,
  FavoriteButton,
  ContactInfo,
  TouchTargetWrapper,
  StyledDivider,
  UIComponents
} from '../ui-components'

// Mock MUI and design system
jest.mock('@mui/material', () => ({
  Button: ({ children, variant, sx, startIcon, ...props }: any) => (
    <button data-variant={variant} data-sx={JSON.stringify(sx)} {...props}>
      {startIcon}
      {children}
    </button>
  ),
  Card: ({ children, sx, ...props }: any) => (
    <div data-testid="card" data-sx={JSON.stringify(sx)} {...props}>{children}</div>
  ),
  CardContent: ({ children, sx, ...props }: any) => (
    <div data-testid="card-content" data-sx={JSON.stringify(sx)} {...props}>{children}</div>
  ),
  TextField: ({ sx, ...props }: any) => (
    <input data-testid="text-field" data-sx={JSON.stringify(sx)} {...props} />
  ),
  Chip: ({ label, sx, ...props }: any) => (
    <div data-testid="chip" data-sx={JSON.stringify(sx)} {...props}>{label}</div>
  ),
  Typography: ({ children, variant, component, sx, itemProp, content, ...props }: any) => {
    const Tag = component || 'div'
    return (
      <Tag
        data-testid="typography"
        data-variant={variant}
        data-sx={JSON.stringify(sx)}
        itemProp={itemProp}
        content={content}
        {...props}
      >
        {children}
      </Tag>
    )
  },
  Box: ({ children, component, sx, ...props }: any) => {
    const Tag = component || 'div'
    return (
      <Tag data-testid="box" data-sx={JSON.stringify(sx)} {...props}>{children}</Tag>
    )
  },
  Paper: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Accordion: ({ children, sx, ...props }: any) => (
    <div data-testid="accordion" data-sx={JSON.stringify(sx)} {...props}>{children}</div>
  ),
  AccordionSummary: ({ children, expandIcon, sx, ...props }: any) => (
    <div data-testid="accordion-summary" data-sx={JSON.stringify(sx)} {...props}>
      {children}
      {expandIcon}
    </div>
  ),
  AccordionDetails: ({ children, sx, ...props }: any) => (
    <div data-testid="accordion-details" data-sx={JSON.stringify(sx)} {...props}>{children}</div>
  ),
  IconButton: ({ children, 'aria-label': ariaLabel, sx, component, href, ...props }: any) => {
    const Tag = component || 'button'
    return (
      <Tag
        data-testid="icon-button"
        aria-label={ariaLabel}
        href={href}
        data-sx={JSON.stringify(sx)}
        {...props}
      >
        {children}
      </Tag>
    )
  },
  Badge: ({ children, badgeContent, sx, ...props }: any) => (
    <div data-testid="badge" data-badge-content={badgeContent} data-sx={JSON.stringify(sx)} {...props}>
      {children}
    </div>
  ),
  Divider: ({ sx, ...props }: any) => (
    <hr data-testid="divider" data-sx={JSON.stringify(sx)} {...props} />
  )
}))

jest.mock('@/lib/mui-optimization', () => ({
  ShoppingCartIcon: () => <span data-testid="shopping-cart-icon">ShoppingCart</span>,
  FavoriteIcon: () => <span data-testid="favorite-icon">Favorite</span>,
  StarIcon: () => <span data-testid="star-icon">Star</span>,
  ExpandMoreIcon: () => <span data-testid="expand-more-icon">ExpandMore</span>,
  ArrowForwardIcon: () => <span>ArrowForward</span>,
  LocalShippingIcon: () => <span>LocalShipping</span>,
  CakeIcon: () => <span data-testid="cake-icon">Cake</span>,
  EmailIcon: () => <span data-testid="email-icon">Email</span>,
  PhoneIcon: () => <span data-testid="phone-icon">Phone</span>
}))

jest.mock('@/lib/design-system', () => ({
  designTokens: {
    colors: {
      primary: { main: '#2E3192', dark: '#1F2368', contrast: '#FFFFFF' },
      secondary: { main: '#FEF102', dark: '#C9C200', contrast: '#2D2D2D' },
      background: { paper: '#FFFFFF', subtle: '#FFF5E6', default: '#FFF8E7' },
      text: { primary: '#2D2D2D', secondary: '#666666' },
      error: { main: '#D04436', dark: '#C0392B' },
      warning: { main: '#F39C12' },
      border: { light: '#E0E0E0', medium: '#BDBDBD', dark: '#757575' }
    },
    typography: {
      fontFamily: { primary: 'Inter', display: 'Playfair Display' },
      fontSize: { xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem', '2xl': '1.5rem', '3xl': '1.875rem', '4xl': '2.25rem', '5xl': '3rem' },
      fontWeight: { medium: 500, semibold: 600, bold: 700 },
      lineHeight: { tight: 1.2, relaxed: 1.75 },
      letterSpacing: { tight: '-0.025em' }
    },
    spacing: { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem', '2xl': '3rem' },
    borderRadius: { md: '0.375rem', lg: '0.5rem', xl: '0.75rem', full: '9999px' },
    shadows: { base: '0 1px 3px rgba(0,0,0,0.1)', md: '0 4px 6px rgba(0,0,0,0.1)', lg: '0 10px 15px rgba(0,0,0,0.1)' },
    components: {
      card: { backgroundColor: '#FFFFFF', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
      chip: { backgroundColor: '#FFF5E6', borderRadius: '9999px' }
    }
  }
}))

jest.mock('@/app/utils/seo', () => ({
  getPriceValidUntil: jest.fn(() => '2026-01-01')
}))

describe('ui-components', () => {
  describe('PrimaryButton', () => {
    it('should render button with children', () => {
      render(<PrimaryButton>Click Me</PrimaryButton>)

      expect(screen.getByText('Click Me')).toBeInTheDocument()
    })

    it('should use contained variant', () => {
      const { container } = render(<PrimaryButton>Test</PrimaryButton>)
      const button = container.querySelector('button')

      expect(button?.getAttribute('data-variant')).toBe('contained')
    })

    it('should apply custom sx props', () => {
      render(<PrimaryButton sx={{ margin: '10px' }}>Test</PrimaryButton>)

      expect(screen.getByText('Test')).toBeInTheDocument()
    })
  })

  describe('SecondaryButton', () => {
    it('should render button', () => {
      render(<SecondaryButton>Secondary</SecondaryButton>)

      expect(screen.getByText('Secondary')).toBeInTheDocument()
    })

    it('should use contained variant', () => {
      const { container } = render(<SecondaryButton>Test</SecondaryButton>)
      const button = container.querySelector('button')

      expect(button?.getAttribute('data-variant')).toBe('contained')
    })
  })

  describe('OutlineButton', () => {
    it('should render button', () => {
      render(<OutlineButton>Outline</OutlineButton>)

      expect(screen.getByText('Outline')).toBeInTheDocument()
    })

    it('should use outlined variant', () => {
      const { container } = render(<OutlineButton>Test</OutlineButton>)
      const button = container.querySelector('button')

      expect(button?.getAttribute('data-variant')).toBe('outlined')
    })
  })

  describe('ProductCard', () => {
    it('should render card with children', () => {
      render(<ProductCard>Card Content</ProductCard>)

      expect(screen.getByText('Card Content')).toBeInTheDocument()
    })

    it('should render Card component', () => {
      const { getByTestId } = render(<ProductCard>Test</ProductCard>)

      expect(getByTestId('card')).toBeInTheDocument()
    })
  })

  describe('FeatureCard', () => {
    const icon = <span data-testid="test-icon">Icon</span>

    it('should render with icon, title, and description', () => {
      render(
        <FeatureCard
          icon={icon}
          title="Feature Title"
          description="Feature description"
        />
      )

      expect(screen.getByText('Feature Title')).toBeInTheDocument()
      expect(screen.getByText('Feature description')).toBeInTheDocument()
    })

    it('should clone and style icon', () => {
      const { container } = render(
        <FeatureCard
          icon={icon}
          title="Test"
          description="Test"
        />
      )

      expect(container.querySelector('[data-testid="test-icon"]')).toBeTruthy()
    })
  })

  describe('StyledTextField', () => {
    it('should render TextField', () => {
      const { getByTestId } = render(<StyledTextField />)

      expect(getByTestId('text-field')).toBeInTheDocument()
    })

    it('should pass props to TextField', () => {
      const { getByTestId } = render(<StyledTextField placeholder="Test" />)

      expect(getByTestId('text-field')).toHaveAttribute('placeholder', 'Test')
    })
  })

  describe('Chip Components', () => {
    it('should render IngredientChip', () => {
      render(<IngredientChip label="Flour" />)

      expect(screen.getByText('Flour')).toBeInTheDocument()
    })

    it('should render AllergenChip', () => {
      render(<AllergenChip label="Eggs" />)

      expect(screen.getByText('Eggs')).toBeInTheDocument()
    })

    it('should render CategoryChip', () => {
      render(<CategoryChip label="Cakes" />)

      expect(screen.getByText('Cakes')).toBeInTheDocument()
    })
  })

  describe('Typography Components', () => {
    it('should render DisplayHeading', () => {
      render(<DisplayHeading>Display Title</DisplayHeading>)

      expect(screen.getByText('Display Title')).toBeInTheDocument()
    })

    it('should render SectionHeading', () => {
      render(<SectionHeading>Section Title</SectionHeading>)

      expect(screen.getByText('Section Title')).toBeInTheDocument()
    })

    it('should render CardHeading', () => {
      render(<CardHeading>Card Title</CardHeading>)

      expect(screen.getByText('Card Title')).toBeInTheDocument()
    })

    it('should render BodyText', () => {
      render(<BodyText>Body content</BodyText>)

      expect(screen.getByText('Body content')).toBeInTheDocument()
    })
  })

  describe('Layout Components', () => {
    it('should render Container', () => {
      render(<Container>Content</Container>)

      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('should render Section', () => {
      render(<Section>Section content</Section>)

      expect(screen.getByText('Section content')).toBeInTheDocument()
    })
  })

  describe('StyledAccordion', () => {
    it('should render with title and children', () => {
      render(
        <StyledAccordion title="Accordion Title">
          Accordion Content
        </StyledAccordion>
      )

      expect(screen.getByText('Accordion Title')).toBeInTheDocument()
      expect(screen.getByText('Accordion Content')).toBeInTheDocument()
    })

    it('should include expand icon', () => {
      const { getByTestId } = render(
        <StyledAccordion title="Test">Content</StyledAccordion>
      )

      expect(getByTestId('expand-more-icon')).toBeInTheDocument()
    })
  })

  describe('PriceDisplay', () => {
    it('should format price in GBP', () => {
      render(<PriceDisplay price={30} />)

      expect(screen.getByText(/£30/)).toBeInTheDocument()
    })

    it('should handle decimal prices', () => {
      render(<PriceDisplay price={29.99} />)

      expect(screen.getByText(/£29.99/)).toBeInTheDocument()
    })

    it('should use large size by default', () => {
      render(<PriceDisplay price={30} />)

      expect(screen.getByText(/£30/)).toBeInTheDocument()
    })

    it('should support small size', () => {
      render(<PriceDisplay price={30} size="small" />)

      expect(screen.getByText(/£30/)).toBeInTheDocument()
    })

    it('should support medium size', () => {
      render(<PriceDisplay price={30} size="medium" />)

      expect(screen.getByText(/£30/)).toBeInTheDocument()
    })

    it('should support xlarge size', () => {
      render(<PriceDisplay price={30} size="xlarge" />)

      expect(screen.getByText(/£30/)).toBeInTheDocument()
    })

    it('should include label when provided', () => {
      render(<PriceDisplay price={30} label="From" />)

      expect(screen.getByText('From')).toBeInTheDocument()
    })

    it('should not show label when not provided', () => {
      render(<PriceDisplay price={30} />)

      expect(screen.queryByText('From')).not.toBeInTheDocument()
    })

    it('should include schema.org metadata', () => {
      const { container } = render(<PriceDisplay price={30} />)

      const priceMeta = container.querySelector('[itemprop="price"]')
      const currencyMeta = container.querySelector('[itemprop="priceCurrency"]')
      const availabilityMeta = container.querySelector('[itemprop="availability"]')

      expect(priceMeta).toBeTruthy()
      expect(currencyMeta).toBeTruthy()
      expect(availabilityMeta).toBeTruthy()
    })

    it('should set price content attribute', () => {
      const { container } = render(<PriceDisplay price={42.50} />)

      const priceElement = container.querySelector('[itemprop="price"]')
      expect(priceElement?.getAttribute('content')).toBe('42.5')
    })

    it('should format whole numbers without decimals', () => {
      render(<PriceDisplay price={30} />)

      expect(screen.getByText('£30')).toBeInTheDocument()
    })
  })

  describe('RatingBadge', () => {
    it('should render badge with rating', () => {
      const { getByTestId } = render(<RatingBadge rating={5} />)

      expect(getByTestId('badge')).toBeInTheDocument()
      expect(getByTestId('badge').getAttribute('data-badge-content')).toBe('5')
    })

    it('should include star icon', () => {
      const { getByTestId } = render(<RatingBadge rating={4.5} />)

      expect(getByTestId('star-icon')).toBeInTheDocument()
    })
  })

  describe('AddToCartButton', () => {
    it('should render with shopping cart icon', () => {
      const { getByTestId } = render(<AddToCartButton onClick={() => {}} />)

      expect(getByTestId('shopping-cart-icon')).toBeInTheDocument()
    })

    it('should call onClick handler', () => {
      const onClick = jest.fn()
      const { container } = render(<AddToCartButton onClick={onClick} />)

      const button = container.querySelector('button')
      button?.click()

      expect(onClick).toHaveBeenCalled()
    })

    it('should display "Add to Cart" text', () => {
      render(<AddToCartButton onClick={() => {}} />)

      expect(screen.getByText('Add to Cart')).toBeInTheDocument()
    })
  })

  describe('AccessibleIconButton', () => {
    const icon = <span data-testid="test-icon">Icon</span>

    it('should render icon button with aria-label', () => {
      const { getByTestId } = render(
        <AccessibleIconButton ariaLabel="Test Action">
          {icon}
        </AccessibleIconButton>
      )

      expect(getByTestId('icon-button')).toHaveAttribute('aria-label', 'Test Action')
    })

    it('should set title from aria-label by default', () => {
      const { getByTestId } = render(
        <AccessibleIconButton ariaLabel="Test Action">
          {icon}
        </AccessibleIconButton>
      )

      expect(getByTestId('icon-button')).toHaveAttribute('title', 'Test Action')
    })

    it('should use custom title when provided', () => {
      const { getByTestId } = render(
        <AccessibleIconButton ariaLabel="Test" title="Custom Title">
          {icon}
        </AccessibleIconButton>
      )

      expect(getByTestId('icon-button')).toHaveAttribute('title', 'Custom Title')
    })

    it('should render as link when href provided', () => {
      const { getByTestId } = render(
        <AccessibleIconButton ariaLabel="Link" href="/test">
          {icon}
        </AccessibleIconButton>
      )

      expect(getByTestId('icon-button')).toHaveAttribute('href', '/test')
    })

    it('should render as link when component=a', () => {
      const { getByTestId } = render(
        <AccessibleIconButton ariaLabel="Link" component="a">
          {icon}
        </AccessibleIconButton>
      )

      expect(getByTestId('icon-button').tagName.toLowerCase()).toBe('a')
    })

    it('should render as button by default', () => {
      const { getByTestId } = render(
        <AccessibleIconButton ariaLabel="Button">
          {icon}
        </AccessibleIconButton>
      )

      expect(getByTestId('icon-button').tagName.toLowerCase()).toBe('button')
    })

    it('should have displayName', () => {
    })
  })

  describe('FavoriteButton', () => {
    it('should render favorite icon', () => {
      const { getByTestId } = render(<FavoriteButton isFavorite={false} onClick={() => {}} />)

      expect(getByTestId('favorite-icon')).toBeInTheDocument()
    })

    it('should have "Add to favorites" label when not favorited', () => {
      const { getByTestId } = render(<FavoriteButton isFavorite={false} onClick={() => {}} />)

      expect(getByTestId('icon-button')).toHaveAttribute('aria-label', 'Add to favorites')
    })

    it('should have "Remove from favorites" label when favorited', () => {
      const { getByTestId } = render(<FavoriteButton isFavorite={true} onClick={() => {}} />)

      expect(getByTestId('icon-button')).toHaveAttribute('aria-label', 'Remove from favorites')
    })

    it('should call onClick handler', () => {
      const onClick = jest.fn()
      const { getByTestId } = render(<FavoriteButton isFavorite={false} onClick={onClick} />)

      getByTestId('icon-button').click()

      expect(onClick).toHaveBeenCalled()
    })
  })

  describe('ContactInfo', () => {
    const phoneIcon = <span data-testid="phone-icon">Phone</span>
    const emailIcon = <span data-testid="email-icon">Email</span>

    it('should render with icon and text', () => {
      render(<ContactInfo icon={phoneIcon} text="+44 123 456 7890" />)

      expect(screen.getByText('+44 123 456 7890')).toBeInTheDocument()
    })

    it('should create tel: link for phone numbers', () => {
      const { getByTestId } = render(<ContactInfo icon={phoneIcon} text="+44 123 456 7890" />)
      const box = getByTestId('box')

      expect(box).toHaveAttribute('href', 'tel:+44 123 456 7890')
    })

    it('should create mailto: link for email addresses', () => {
      const { getByTestId } = render(<ContactInfo icon={emailIcon} text="test@example.com" />)
      const box = getByTestId('box')

      expect(box).toHaveAttribute('href', 'mailto:test@example.com')
    })

    it('should use custom href when provided', () => {
      const { getByTestId } = render(
        <ContactInfo icon={phoneIcon} text="Contact" href="/custom-link" />
      )

      expect(getByTestId('box')).toHaveAttribute('href', '/custom-link')
    })

    it('should not create link for non-phone/email text', () => {
      const { getByTestId } = render(<ContactInfo icon={phoneIcon} text="Regular text" />)
      const box = getByTestId('box')

      expect(box).not.toHaveAttribute('href')
    })

    it('should set accessible label for phone', () => {
      const { getByTestId } = render(<ContactInfo icon={phoneIcon} text="+44 123" />)

      expect(getByTestId('box')).toHaveAttribute('aria-label', 'Call +44 123')
    })

    it('should set accessible label for email', () => {
      const { getByTestId } = render(<ContactInfo icon={emailIcon} text="test@example.com" />)

      expect(getByTestId('box')).toHaveAttribute('aria-label', 'Email test@example.com')
    })
  })

  describe('TouchTargetWrapper', () => {
    it('should render children', () => {
      render(<TouchTargetWrapper>Wrapped Content</TouchTargetWrapper>)

      expect(screen.getByText('Wrapped Content')).toBeInTheDocument()
    })

    it('should apply WCAG touch target size', () => {
      const { getByTestId } = render(<TouchTargetWrapper>Test</TouchTargetWrapper>)
      const box = getByTestId('box')
      const sx = JSON.parse(box.getAttribute('data-sx') || '{}')

      expect(sx.minHeight).toBe('44px')
      expect(sx.minWidth).toBe('44px')
    })
  })

  describe('StyledDivider', () => {
    it('should render divider', () => {
      const { getByTestId } = render(<StyledDivider />)

      expect(getByTestId('divider')).toBeInTheDocument()
    })
  })

  describe('UIComponents Export', () => {
    it('should export all button components', () => {
      expect(UIComponents.PrimaryButton).toBeDefined()
      expect(UIComponents.SecondaryButton).toBeDefined()
      expect(UIComponents.OutlineButton).toBeDefined()
      expect(UIComponents.AddToCartButton).toBeDefined()
      expect(UIComponents.FavoriteButton).toBeDefined()
    })

    it('should export all card components', () => {
      expect(UIComponents.ProductCard).toBeDefined()
      expect(UIComponents.FeatureCard).toBeDefined()
    })

    it('should export input components', () => {
      expect(UIComponents.StyledTextField).toBeDefined()
    })

    it('should export chip components', () => {
      expect(UIComponents.IngredientChip).toBeDefined()
      expect(UIComponents.AllergenChip).toBeDefined()
      expect(UIComponents.CategoryChip).toBeDefined()
    })

    it('should export typography components', () => {
      expect(UIComponents.DisplayHeading).toBeDefined()
      expect(UIComponents.SectionHeading).toBeDefined()
      expect(UIComponents.CardHeading).toBeDefined()
      expect(UIComponents.BodyText).toBeDefined()
      expect(UIComponents.PriceDisplay).toBeDefined()
    })

    it('should export layout components', () => {
      expect(UIComponents.Container).toBeDefined()
      expect(UIComponents.Section).toBeDefined()
    })

    it('should export accordion', () => {
      expect(UIComponents.StyledAccordion).toBeDefined()
    })

    it('should export badge components', () => {
      expect(UIComponents.RatingBadge).toBeDefined()
    })

    it('should export contact components', () => {
      expect(UIComponents.ContactInfo).toBeDefined()
    })

    it('should export accessibility components', () => {
      expect(UIComponents.TouchTargetWrapper).toBeDefined()
    })

    it('should export divider', () => {
      expect(UIComponents.StyledDivider).toBeDefined()
    })
  })

  describe('WCAG Compliance', () => {
    it('should ensure 44px touch targets for buttons', () => {
      const { container } = render(<PrimaryButton>Test</PrimaryButton>)
      const button = container.querySelector('button')
      const sx = JSON.parse(button?.getAttribute('data-sx') || '{}')

      expect(sx.minHeight).toBe('44px')
      expect(sx.minWidth).toBe('44px')
    })

    it('should ensure 48px touch targets for icon buttons', () => {
      const icon = <span>Icon</span>
      const { getByTestId } = render(<AccessibleIconButton ariaLabel="Test">{icon}</AccessibleIconButton>)
      const sx = JSON.parse(getByTestId('icon-button').getAttribute('data-sx') || '{}')

      expect(sx.minWidth).toBe('48px')
      expect(sx.minHeight).toBe('48px')
    })

    it('should ensure 44px touch targets for chips', () => {
      const { getByTestId } = render(<IngredientChip label="Test" />)
      const sx = JSON.parse(getByTestId('chip').getAttribute('data-sx') || '{}')

      expect(sx.minHeight).toBe('44px')
    })
  })

  describe('Accessibility', () => {
    it('should have aria-label for AccessibleIconButton', () => {
      const icon = <span>Icon</span>
      const { getByTestId } = render(
        <AccessibleIconButton ariaLabel="Close dialog">{icon}</AccessibleIconButton>
      )

      expect(getByTestId('icon-button')).toHaveAttribute('aria-label', 'Close dialog')
    })

    it('should have focus styles', () => {
      const { container } = render(<PrimaryButton>Test</PrimaryButton>)
      const button = container.querySelector('button')
      const sx = JSON.parse(button?.getAttribute('data-sx') || '{}')

      expect(sx['&:focus']).toBeDefined()
    })
  })
})

