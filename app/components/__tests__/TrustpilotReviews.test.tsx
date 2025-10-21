/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { TrustpilotReviews } from '../TrustpilotReviews'

// Mock trustpilot lib
const mockFetchTrustpilotReviews = jest.fn()
jest.mock('@/app/lib/trustpilot', () => ({
  fetchTrustpilotReviews: (productName: string) => mockFetchTrustpilotReviews(productName)
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, initial, animate, transition, ...props }: any) => (
      <div {...props}>{children}</div>
    )
  }
}))

// Mock MUI
jest.mock('@mui/material', () => ({
  Box: ({ children, component, src, alt, sx, ...props }: any) => {
    if (component === 'img') {
      return <img src={src} alt={alt} {...props} />
    }
    return <div data-testid="box" {...props}>{children}</div>
  },
  Container: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Paper: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Typography: ({ children, variant, sx, ...props }: any) => (
    <div data-testid="typography" data-variant={variant} {...props}>{children}</div>
  ),
  Rating: ({ value, readOnly, sx, ...props }: any) => (
    <div data-testid="rating" data-value={value} {...props}>Rating: {value}</div>
  ),
  Avatar: ({ children, sx, ...props }: any) => <div data-testid="avatar" {...props}>{children}</div>,
  CircularProgress: () => <div data-testid="circular-progress">Loading...</div>,
  Alert: ({ children, ...props }: any) => <div data-testid="alert" {...props}>{children}</div>
}))

// Mock dependencies
jest.mock('@/lib/design-system', () => ({
  designTokens: {
    colors: {
      primary: { main: '#2E3192' },
      secondary: { main: '#FEF102' },
      text: { primary: '#000', secondary: '#666' },
      background: { subtle: '#F5F5F5' }
    },
    typography: {
      fontWeight: { semibold: 600 },
      fontSize: { sm: '0.875rem' },
      lineHeight: { relaxed: 1.75 }
    },
    spacing: { sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem', '2xl': '3rem', '4xl': '6rem' },
    borderRadius: {},
    shadows: {}
  }
}))

jest.mock('@/lib/ui-components', () => ({
  Container: ({ children, sx, ...props }: any) => <div data-testid="design-container" {...props}>{children}</div>,
  BodyText: ({ children, sx, ...props }: any) => <p data-testid="body-text" {...props}>{children}</p>,
  SectionHeading: ({ children, sx, ...props }: any) => <h2 data-testid="section-heading" {...props}>{children}</h2>,
  ProductCard: ({ children, sx, ...props }: any) => <div data-testid="product-card" {...props}>{children}</div>,
  TouchTargetWrapper: ({ children, ...props }: any) => <div {...props}>{children}</div>
}))

describe('TrustpilotReviews', () => {
  const mockReviews = [
    {
      id: '1',
      author: 'John Doe',
      rating: 5,
      title: 'Amazing Cake!',
      content: 'Best honey cake I ever had',
      date: '2025-01-15',
      location: 'Leeds'
    },
    {
      id: '2',
      author: 'Jane Smith',
      rating: 4,
      title: 'Great Service',
      content: 'Excellent quality and delivery',
      date: '2025-01-20'
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Loading State', () => {
    it('should show nothing while loading', () => {
      mockFetchTrustpilotReviews.mockImplementation(() => new Promise(() => {}))

      const { container } = render(<TrustpilotReviews productName="Honey Cake" />)

      expect(container.firstChild).toBeNull()
    })
  })

  describe('Empty State', () => {
    it('should return null when no reviews', async () => {
      mockFetchTrustpilotReviews.mockResolvedValue([])

      const { container } = render(<TrustpilotReviews productName="Honey Cake" />)

      await waitFor(() => {
        expect(container.firstChild).toBeNull()
      })
    })

    it('should return null when reviews is null', async () => {
      mockFetchTrustpilotReviews.mockResolvedValue(null)

      const { container } = render(<TrustpilotReviews productName="Honey Cake" />)

      await waitFor(() => {
        expect(container.firstChild).toBeNull()
      })
    })
  })

  describe('Reviews Display', () => {
    beforeEach(() => {
      mockFetchTrustpilotReviews.mockResolvedValue(mockReviews)
    })

    it('should fetch reviews on mount', async () => {
      render(<TrustpilotReviews productName="Honey Cake" />)

      await waitFor(() => {
        expect(mockFetchTrustpilotReviews).toHaveBeenCalledWith('Honey Cake')
      })
    })

    it('should render section heading', async () => {
      render(<TrustpilotReviews productName="Honey Cake" />)

      await waitFor(() => {
        expect(screen.getByTestId('section-heading')).toBeInTheDocument()
      })
    })

    it('should display Trustpilot logo', async () => {
      render(<TrustpilotReviews productName="Honey Cake" />)

      await waitFor(() => {
        const logo = screen.getByAltText('Trustpilot')
        expect(logo).toBeInTheDocument()
        expect(logo).toHaveAttribute('src', expect.stringContaining('trustpilot.net'))
      })
    })

    it('should render all reviews', async () => {
      render(<TrustpilotReviews productName="Honey Cake" />)

      await waitFor(() => {
        expect(screen.getByText('Amazing Cake!')).toBeInTheDocument()
        expect(screen.getByText('Great Service')).toBeInTheDocument()
      })
    })

    it('should display review authors', async () => {
      render(<TrustpilotReviews productName="Honey Cake" />)

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      })
    })

    it('should display review ratings', async () => {
      render(<TrustpilotReviews productName="Honey Cake" />)

      await waitFor(() => {
        const ratings = screen.getAllByTestId('rating')
        expect(ratings.length).toBe(2)
      })
    })

    it('should display review content', async () => {
      render(<TrustpilotReviews productName="Honey Cake" />)

      await waitFor(() => {
        expect(screen.getByText('Best honey cake I ever had')).toBeInTheDocument()
        expect(screen.getByText('Excellent quality and delivery')).toBeInTheDocument()
      })
    })

    it('should display author avatars', async () => {
      render(<TrustpilotReviews productName="Honey Cake" />)

      await waitFor(() => {
        const avatars = screen.getAllByTestId('avatar')
        expect(avatars.length).toBe(2)
      })
    })

    it('should show first letter of author in avatar', async () => {
      render(<TrustpilotReviews productName="Honey Cake" />)

      await waitFor(() => {
        const avatars = screen.getAllByTestId('avatar')
        expect(avatars[0]).toHaveTextContent('J')
      })
    })

    it('should display location when available', async () => {
      render(<TrustpilotReviews productName="Honey Cake" />)

      await waitFor(() => {
        expect(screen.getByText(/Leeds •/)).toBeInTheDocument()
      })
    })

    it('should format date in British format', async () => {
      render(<TrustpilotReviews productName="Honey Cake" />)

      await waitFor(() => {
        expect(screen.getByText(/15 January 2025/)).toBeInTheDocument()
      })
    })

    it('should display verification notice', async () => {
      render(<TrustpilotReviews productName="Honey Cake" />)

      await waitFor(() => {
        expect(screen.getByText('These reviews are from verified purchases on Trustpilot')).toBeInTheDocument()
      })
    })
  })

  describe('Re-fetch on product change', () => {
    it('should fetch reviews when productName changes', async () => {
      mockFetchTrustpilotReviews.mockResolvedValue(mockReviews)

      const { rerender } = render(<TrustpilotReviews productName="Honey Cake" />)

      await waitFor(() => {
        expect(mockFetchTrustpilotReviews).toHaveBeenCalledWith('Honey Cake')
      })

      mockFetchTrustpilotReviews.mockClear()

      rerender(<TrustpilotReviews productName="Chocolate Cake" />)

      await waitFor(() => {
        expect(mockFetchTrustpilotReviews).toHaveBeenCalledWith('Chocolate Cake')
      })
    })
  })
})

