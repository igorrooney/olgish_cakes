/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { MuiProviders } from '../MuiProviders'

jest.mock('../EmotionCacheProvider', () => ({
  EmotionCacheProvider: ({ children }: MockProps) => (
    <div data-testid='emotion-provider'>{children}</div>
  )
}))

jest.mock('@/lib/mui-optimization', () => ({
  ThemeProvider: ({ children }: MockProps) => (
    <div data-testid='theme-provider'>{children}</div>
  ),
  CssBaseline: () => <div data-testid='css-baseline' />
}))

jest.mock('@/lib/theme', () => ({
  theme: { palette: { primary: { main: '#000' } } }
}))

describe('MuiProviders', () => {
  it('renders children', () => {
    render(
      <MuiProviders>
        <div data-testid='child'>Content</div>
      </MuiProviders>
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('wraps children with EmotionCacheProvider and ThemeProvider', () => {
    render(
      <MuiProviders>
        <div>Content</div>
      </MuiProviders>
    )

    expect(screen.getByTestId('emotion-provider')).toBeInTheDocument()
    expect(screen.getByTestId('theme-provider')).toBeInTheDocument()
  })

  it('renders CssBaseline', () => {
    render(
      <MuiProviders>
        <div>Content</div>
      </MuiProviders>
    )

    expect(screen.getByTestId('css-baseline')).toBeInTheDocument()
  })
})
