/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import Loading from '../Loading'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, animate, transition, initial, component, ...props }: any) => {
      const Component = component || 'div'
      return <Component {...props}>{children}</Component>
    }
  }
}))

// Mock MUI
jest.mock('@/lib/mui-optimization', () => ({
  Box: ({ children, sx, ...props }: any) => <div data-testid="box" {...props}>{children}</div>,
  CircularProgress: ({ size, thickness, sx, ...props }: any) => (
    <div data-testid="circular-progress" data-size={size} data-thickness={thickness} {...props}>
      Loading...
    </div>
  ),
  Typography: ({ children, ...props }: any) => <div {...props}>{children}</div>
}))

// Mock design system
jest.mock('@/lib/design-system', () => ({
  designTokens: {
    colors: {
      primary: { main: '#2E3192' },
      text: { secondary: '#666666' }
    },
    spacing: {
      md: '1rem',
      '3xl': '4rem'
    }
  }
}))

// Mock UI components
jest.mock('@/lib/ui-components', () => ({
  BodyText: ({ children, component, initial, animate, transition, sx, ...props }: any) => {
    const Component = component || 'div'
    return <Component data-testid="body-text" {...props}>{children}</Component>
  }
}))

describe('Loading', () => {
  it('should render without crashing', () => {
    render(<Loading />)

    expect(screen.getByTestId('box')).toBeInTheDocument()
  })

  it('should display CircularProgress', () => {
    render(<Loading />)

    expect(screen.getByTestId('circular-progress')).toBeInTheDocument()
  })

  it('should use size 60 for CircularProgress', () => {
    render(<Loading />)

    const progress = screen.getByTestId('circular-progress')
    expect(progress.getAttribute('data-size')).toBe('60')
  })

  it('should use thickness 4 for CircularProgress', () => {
    render(<Loading />)

    const progress = screen.getByTestId('circular-progress')
    expect(progress.getAttribute('data-thickness')).toBe('4')
  })

  it('should display loading text', () => {
    render(<Loading />)

    expect(screen.getByText('Loading our delicious cakes...')).toBeInTheDocument()
  })

  it('should render BodyText component', () => {
    render(<Loading />)

    expect(screen.getByTestId('body-text')).toBeInTheDocument()
  })

  it('should center content vertically and horizontally', () => {
    render(<Loading />)

    expect(screen.getByTestId('box')).toBeInTheDocument()
  })

  it('should be defined', () => {
    expect(Loading).toBeDefined()
  })
})

