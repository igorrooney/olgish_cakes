/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { DesignSystemExample } from '../DesignSystemExample'

// Mock all dependencies
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>
})

jest.mock('@/lib/business-info', () => ({
  CLIENT_BUSINESS_INFO: {
    displayPhone: '+44 123 456 7890',
    telLink: 'tel:+44123456789'
  }
}))

jest.mock('@/lib/mui-optimization', () => ({
  Grid: ({ children, container, item, xs, md, spacing, ...props }: any) => (
    <div data-container={container} data-item={item} {...props}>{children}</div>
  ),
  Box: ({ children, component, sx, ...props }: any) => {
    const Component = component || 'div'
    return <Component data-testid="box" {...props}>{children}</Component>
  },
  CakeOutlinedIcon: (props: any) => <span {...props}>🎂</span>,
  LocalShippingIcon: () => <span>🚚</span>,
  StarIcon: (props: any) => <span {...props}>⭐</span>,
  EmailIcon: () => <span>📧</span>,
  PhoneIcon: (props: any) => <span {...props}>📞</span>,
  FavoriteIcon: () => <span>❤️</span>
}))

jest.mock('@/lib/design-system', () => ({
  designTokens: {
    colors: {
      primary: { main: '#2E3192' },
      text: { secondary: '#666' },
      ukrainian: { blue: '#0057B7', yellow: '#FFD700', honey: '#D4A017', cream: '#FFFDD0', berry: '#8B008B' },
      border: { light: '#E0E0E0' }
    },
    spacing: { sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem', '4xl': '6rem' }
  }
}))

jest.mock('@/lib/ui-components', () => ({
  DisplayHeading: ({ children, sx, ...props }: any) => <h1 data-testid="display-heading" {...props}>{children}</h1>,
  SectionHeading: ({ children, sx, ...props }: any) => <h2 data-testid="section-heading" {...props}>{children}</h2>,
  BodyText: ({ children, sx, ...props }: any) => <p data-testid="body-text" {...props}>{children}</p>,
  PrimaryButton: ({ children, ...props }: any) => <button data-testid="primary-button" {...props}>{children}</button>,
  SecondaryButton: ({ children, ...props }: any) => <button data-testid="secondary-button" {...props}>{children}</button>,
  OutlineButton: ({ children, ...props }: any) => <button data-testid="outline-button" {...props}>{children}</button>,
  ProductCard: ({ children, ...props }: any) => <div data-testid="product-card" {...props}>{children}</div>,
  FeatureCard: ({ icon, title, description, ...props }: any) => (
    <div data-testid="feature-card" {...props}>
      {icon}
      <div>{title}</div>
      <div>{description}</div>
    </div>
  ),
  StyledTextField: (props: any) => <input data-testid="styled-textfield" {...props} />,
  IngredientChip: ({ label, ...props }: any) => <span data-testid="ingredient-chip" {...props}>{label}</span>,
  AllergenChip: ({ label, ...props }: any) => <span data-testid="allergen-chip" {...props}>{label}</span>,
  CategoryChip: ({ label, ...props }: any) => <span data-testid="category-chip" {...props}>{label}</span>,
  PriceDisplay: ({ price, size, ...props }: any) => <span data-testid="price-display" data-size={size} {...props}>£{price}</span>,
  Container: ({ children, sx, ...props }: any) => <div data-testid="container" {...props}>{children}</div>,
  Section: ({ children, ...props }: any) => <section data-testid="section" {...props}>{children}</section>,
  StyledAccordion: ({ title, children, sx, ...props }: any) => (
    <div data-testid="styled-accordion" {...props}>
      <div>{title}</div>
      <div>{children}</div>
    </div>
  ),
  RatingBadge: ({ rating, ...props }: any) => <div data-testid="rating-badge" {...props}>{rating}</div>,
  ContactInfo: ({ icon, text, ...props }: any) => (
    <div data-testid="contact-info" {...props}>{icon} {text}</div>
  ),
  StyledDivider: (props: any) => <hr data-testid="styled-divider" {...props} />
}))

describe('DesignSystemExample', () => {
  it('should render without crashing', () => {
    render(<DesignSystemExample />)

    expect(screen.getByTestId('container')).toBeInTheDocument()
  })

  it('should render main heading', () => {
    render(<DesignSystemExample />)

    expect(screen.getByText('Ukrainian Design System')).toBeInTheDocument()
  })

  it('should render button examples', () => {
    render(<DesignSystemExample />)

    expect(screen.getByTestId('primary-button')).toBeInTheDocument()
    expect(screen.getByTestId('secondary-button')).toBeInTheDocument()
    expect(screen.getByTestId('outline-button')).toBeInTheDocument()
  })

  it('should display button labels', () => {
    render(<DesignSystemExample />)

    expect(screen.getByText('Primary Button')).toBeInTheDocument()
    expect(screen.getByText('Secondary Button')).toBeInTheDocument()
    expect(screen.getByText('Outline Button')).toBeInTheDocument()
  })

  it('should render ProductCard with Honey Cake', () => {
    render(<DesignSystemExample />)

    expect(screen.getByText('Honey Cake')).toBeInTheDocument()
  })

  it('should render FeatureCard', () => {
    render(<DesignSystemExample />)

    expect(screen.getByTestId('feature-card')).toBeInTheDocument()
    expect(screen.getByText('Free UK Delivery')).toBeInTheDocument()
  })

  it('should render price display', () => {
    render(<DesignSystemExample />)

    expect(screen.getByTestId('price-display')).toBeInTheDocument()
  })

  it('should render form elements', () => {
    render(<DesignSystemExample />)

    expect(screen.getByTestId('styled-textfield')).toBeInTheDocument()
  })

  it('should render ingredient chips', () => {
    render(<DesignSystemExample />)

    const ingredientChips = screen.getAllByTestId('ingredient-chip')
    expect(ingredientChips.length).toBeGreaterThan(0)
  })

  it('should display Honey, Flour, Eggs, Butter ingredients', () => {
    render(<DesignSystemExample />)

    // Use getAllByText since these might appear multiple times
    expect(screen.getAllByText(/Honey/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Flour/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Eggs/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Butter/i).length).toBeGreaterThan(0)
  })

  it('should render allergen chips', () => {
    render(<DesignSystemExample />)

    const allergenChips = screen.getAllByTestId('allergen-chip')
    expect(allergenChips.length).toBeGreaterThan(0)
  })

  it('should display Gluten and Dairy allergens', () => {
    render(<DesignSystemExample />)

    expect(screen.getByText('Gluten')).toBeInTheDocument()
    expect(screen.getByText('Dairy')).toBeInTheDocument()
  })

  it('should render category chips', () => {
    render(<DesignSystemExample />)

    const categoryChips = screen.getAllByTestId('category-chip')
    expect(categoryChips.length).toBeGreaterThan(0)
  })

  it('should display categories', () => {
    render(<DesignSystemExample />)

    expect(screen.getByText('Traditional')).toBeInTheDocument()
    expect(screen.getByText('Ukrainian')).toBeInTheDocument()
  })

  it('should render accordions', () => {
    render(<DesignSystemExample />)

    const accordions = screen.getAllByTestId('styled-accordion')
    expect(accordions.length).toBeGreaterThanOrEqual(2)
  })

  it('should show accordion titles', () => {
    render(<DesignSystemExample />)

    expect(screen.getByText('About Our Cakes')).toBeInTheDocument()
    expect(screen.getByText('Delivery Information')).toBeInTheDocument()
  })

  it('should render contact information', () => {
    render(<DesignSystemExample />)

    const contactInfos = screen.getAllByTestId('contact-info')
    expect(contactInfos.length).toBeGreaterThanOrEqual(2)
  })

  it('should render rating badge', () => {
    render(<DesignSystemExample />)

    expect(screen.getByTestId('rating-badge')).toBeInTheDocument()
  })

  it('should render divider', () => {
    render(<DesignSystemExample />)

    expect(screen.getByTestId('styled-divider')).toBeInTheDocument()
  })

  it('should display color palette section', () => {
    render(<DesignSystemExample />)

    expect(screen.getByText('Ukrainian Color Palette')).toBeInTheDocument()
  })

  it('should show all color names', () => {
    render(<DesignSystemExample />)

    // Use getAllByText since these might appear multiple times
    expect(screen.getAllByText(/Blue/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Yellow/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Honey/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Cream/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Berry/i).length).toBeGreaterThan(0)
  })

  it('should render Section component', () => {
    render(<DesignSystemExample />)

    expect(screen.getByTestId('section')).toBeInTheDocument()
  })

  it('should render Container component', () => {
    render(<DesignSystemExample />)

    expect(screen.getByTestId('container')).toBeInTheDocument()
  })

  it('should include section headings', () => {
    render(<DesignSystemExample />)

    const headings = screen.getAllByTestId('section-heading')
    expect(headings.length).toBeGreaterThan(0)
  })
})

