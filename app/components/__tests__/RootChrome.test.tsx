/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { RootChrome } from '../RootChrome'

const mockUsePathname = jest.fn()

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname()
}))

jest.mock('../homepage/SiteHeader', () => ({
  SiteHeader: () => <header data-testid='site-header' />
}))

jest.mock('../SiteFooter', () => ({
  SiteFooter: () => <footer data-testid='site-footer' />
}))

jest.mock('../NonCriticalClientFeatures', () => ({
  NonCriticalClientFeatures: () => <div data-testid='non-critical-client-features' />
}))

jest.mock('../DeferredVercelObservability', () => ({
  DeferredVercelObservability: () => <div data-testid='deferred-vercel-observability' />
}))

describe('RootChrome', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/')
  })

  it('renders public site chrome for storefront routes', () => {
    render(
      <RootChrome isVercelDeployment={false}>
        <div data-testid='page-child'>Page</div>
      </RootChrome>
    )

    expect(screen.getByTestId('site-header')).toBeInTheDocument()
    expect(screen.getByTestId('site-footer')).toBeInTheDocument()
    expect(screen.getByTestId('non-critical-client-features')).toBeInTheDocument()
    expect(screen.getByRole('main')).toContainElement(screen.getByTestId('page-child'))
  })

  it('removes public chrome and non-essential scripts for admin routes', () => {
    mockUsePathname.mockReturnValue('/admin')

    render(
      <RootChrome isVercelDeployment={false}>
        <div data-testid='admin-child'>Admin</div>
      </RootChrome>
    )

    expect(screen.getByTestId('admin-child')).toBeInTheDocument()
    expect(screen.queryByTestId('site-header')).not.toBeInTheDocument()
    expect(screen.queryByTestId('site-footer')).not.toBeInTheDocument()
    expect(screen.queryByTestId('non-critical-client-features')).not.toBeInTheDocument()
  })

  it('keeps observability enabled on Vercel admin routes', () => {
    mockUsePathname.mockReturnValue('/admin/orders')

    render(
      <RootChrome isVercelDeployment>
        <div>Admin</div>
      </RootChrome>
    )

    expect(screen.getByTestId('deferred-vercel-observability')).toBeInTheDocument()
  })
})
