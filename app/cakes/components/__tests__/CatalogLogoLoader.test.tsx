/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { CatalogLogoLoader } from '../CatalogLogoLoader'

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    alt,
    ...props
  }: React.ComponentProps<'img'>) => (
    <img alt={alt || ''} {...props} />
  )
}))

describe('CatalogLogoLoader', () => {
  it('renders status semantics and sr-only loading text', () => {
    render(
      <CatalogLogoLoader
        srLabel='Loading custom cakes...'
        testId='catalog-logo-loader'
      />
    )

    const loader = screen.getByTestId('catalog-logo-loader')
    const srText = screen.getByText('Loading custom cakes...')

    expect(loader).toHaveAttribute('role', 'status')
    expect(loader).toHaveAttribute('aria-live', 'polite')
    expect(loader).toHaveAttribute('aria-label', 'Loading custom cakes...')
    expect(srText).toHaveClass('sr-only')
  })

  it('renders brand logo with animation class and decorative attributes', () => {
    render(
      <CatalogLogoLoader
        srLabel='Loading cakes by post...'
        testId='catalog-logo-loader'
      />
    )

    const loader = screen.getByTestId('catalog-logo-loader')
    const logoImage = loader.querySelector('img')

    expect(logoImage).not.toBeNull()
    if (!logoImage) {
      return
    }
    expect(logoImage).toHaveAttribute('src', '/images/olgish-cakes-logo-bakery-brand.png')
    expect(logoImage).toHaveAttribute('alt', '')
    expect(logoImage).toHaveAttribute('aria-hidden', 'true')
    expect(logoImage).toHaveAttribute('loading', 'eager')
    expect(logoImage).toHaveClass('catalog-logo-loader-spin')
  })
})
