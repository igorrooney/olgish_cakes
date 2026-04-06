/**
 * @jest-environment jsdom
 */
import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { CatalogClientProviders } from '../CatalogClientProviders'

jest.mock('nuqs/adapters/next/app', () => ({
  NuqsAdapter: ({ children }: { children: ReactNode }) => (
    <div data-testid='nuqs-adapter'>{children}</div>
  )
}))

jest.mock('../../providers', () => ({
  Providers: ({ children }: { children: ReactNode }) => (
    <div data-testid='query-providers'>{children}</div>
  )
}))

describe('CatalogClientProviders', () => {
  it('wraps the catalog subtree with route-local nuqs and query providers', () => {
    render(
      <CatalogClientProviders>
        <div data-testid='catalog-child'>Catalog</div>
      </CatalogClientProviders>
    )

    expect(screen.getByTestId('nuqs-adapter')).toBeInTheDocument()
    expect(screen.getByTestId('query-providers')).toBeInTheDocument()
    expect(screen.getByTestId('catalog-child')).toBeInTheDocument()
  })
})
