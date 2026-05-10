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

describe('CatalogClientProviders', () => {
  it('wraps the catalog subtree with route-local nuqs state support', () => {
    render(
      <CatalogClientProviders>
        <div data-testid='catalog-child'>Catalog</div>
      </CatalogClientProviders>
    )

    expect(screen.getByTestId('nuqs-adapter')).toBeInTheDocument()
    expect(screen.getByTestId('catalog-child')).toBeInTheDocument()
  })
})
