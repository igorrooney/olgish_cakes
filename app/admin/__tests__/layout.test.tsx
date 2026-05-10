/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import AdminLayout from '../layout'

describe('AdminLayout', () => {
  it('renders admin children', () => {
    render(
      <AdminLayout>
        <div data-testid='admin-child'>Admin content</div>
      </AdminLayout>
    )

    expect(screen.getByTestId('admin-child')).toBeInTheDocument()
  })
})
