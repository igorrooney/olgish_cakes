/**
 * @jest-environment jsdom
 */
import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import PrivacyRetentionPage from '../page'

jest.mock('next/navigation', () => ({
  redirect: jest.fn(() => {
    throw new Error('NEXT_REDIRECT')
  })
}))

jest.mock('@/lib/admin/auth.server', () => ({
  isAdminAuthenticated: jest.fn()
}))

jest.mock('@/components/AdminAuthGuard', () => ({
  AdminAuthGuard: ({ children }: { children: ReactNode }) => <div data-testid='admin-auth-guard'>{children}</div>
}))

jest.mock('../PrivacyRetentionCentre', () => ({
  PrivacyRetentionCentre: () => <div data-testid='privacy-retention-centre'>Retention centre</div>
}))

const { redirect: mockRedirect } = jest.requireMock('next/navigation')
const { isAdminAuthenticated: mockIsAdminAuthenticated } = jest.requireMock('@/lib/admin/auth.server')

describe('PrivacyRetentionPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('redirects unauthenticated users before rendering retention controls', async () => {
    mockIsAdminAuthenticated.mockResolvedValue(false)

    await expect(PrivacyRetentionPage()).rejects.toThrow('NEXT_REDIRECT')

    expect(mockRedirect).toHaveBeenCalledWith('/admin/auth')
  })

  it('renders the guarded retention centre for authenticated admins', async () => {
    mockIsAdminAuthenticated.mockResolvedValue(true)

    render(await PrivacyRetentionPage())

    expect(screen.getByTestId('admin-auth-guard')).toBeInTheDocument()
    expect(screen.getByTestId('privacy-retention-centre')).toBeInTheDocument()
    expect(mockRedirect).not.toHaveBeenCalled()
  })
})
