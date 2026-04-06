/**
 * @jest-environment jsdom
 */
import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import AdminLayout from '../layout'

jest.mock('@/app/components/MuiProviders', () => ({
  MuiProviders: ({ children }: { children: ReactNode }) => (
    <div data-testid='mui-providers'>{children}</div>
  )
}))

describe('AdminLayout', () => {
  it('wraps children with MuiProviders', () => {
    render(
      <AdminLayout>
        <div data-testid='admin-child'>Admin content</div>
      </AdminLayout>
    )

    expect(screen.getByTestId('mui-providers')).toBeInTheDocument()
    expect(screen.getByTestId('admin-child')).toBeInTheDocument()
  })
})
