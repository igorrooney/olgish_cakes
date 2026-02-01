/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { ConditionalMuiProviders } from '../ConditionalMuiProviders'

jest.mock('next/dynamic', () => {
  return () => {
    const Component = ({ children }: MockProps) => (
      <div data-testid='mui-providers'>{children}</div>
    )
    Component.displayName = 'DynamicMuiProviders'
    return Component
  }
})

describe('ConditionalMuiProviders', () => {
  it('wraps children with MUI providers', () => {
    render(
      <ConditionalMuiProviders>
        <div data-testid='child'>Content</div>
      </ConditionalMuiProviders>
    )

    expect(screen.getByTestId('mui-providers')).toBeInTheDocument()
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })
})
