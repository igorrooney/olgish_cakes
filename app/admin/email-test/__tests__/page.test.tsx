/**
 * @jest-environment jsdom
 */
import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import EmailTestPage from '../page'

jest.mock('next/navigation', () => ({
  redirect: jest.fn(() => {
    throw new Error('NEXT_REDIRECT')
  })
}))

jest.mock('@/lib/admin/auth.server', () => ({
  isAdminAuthenticated: jest.fn()
}))

jest.mock('@/app/providers', () => ({
  Providers: ({ children }: { children: ReactNode }) => (
    <div data-testid='query-providers'>{children}</div>
  )
}))

jest.mock('../EmailTestPageClient', () => ({
  EmailTestPageClient: () => <div data-testid='email-test-page-client'>Email test page</div>
}))

const { redirect: mockRedirect } = jest.requireMock('next/navigation')
const { isAdminAuthenticated: mockIsAdminAuthenticated } = jest.requireMock('@/lib/admin/auth.server')

describe('admin email test page auth gate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('redirects unauthenticated users to admin auth page', async () => {
    mockIsAdminAuthenticated.mockResolvedValue(false)

    await expect(EmailTestPage()).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/admin/auth')
  })

  it('renders email test page for authenticated admin users', async () => {
    mockIsAdminAuthenticated.mockResolvedValue(true)

    const page = await EmailTestPage()
    render(page)

    expect(screen.getByTestId('query-providers')).toBeInTheDocument()
    expect(screen.getByTestId('email-test-page-client')).toBeInTheDocument()
    expect(mockRedirect).not.toHaveBeenCalled()
  })
})
