/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { RootChrome } from '../RootChrome'

jest.mock('../DeferredNonCriticalClientFeatures', () => ({
  DeferredNonCriticalClientFeatures: () => <div data-testid='deferred-non-critical-client-features' />
}))

jest.mock('../LightweightConsentBanner', () => ({
  LightweightConsentBanner: () => <div data-testid='lightweight-consent-banner' />
}))

jest.mock('../ConsentPreferencesController', () => ({
  ConsentPreferencesController: () => <div data-testid='consent-preferences-controller' />
}))

jest.mock('../DeferredVercelObservability', () => ({
  DeferredVercelObservability: () => <div data-testid='deferred-vercel-observability' />
}))

describe('RootChrome', () => {
  const renderRootChrome = ({
    children,
    isVercelDeployment = false
  }: {
    children: React.ReactNode
    isVercelDeployment?: boolean
  }) => render(
    <RootChrome
      isVercelDeployment={isVercelDeployment}
      siteFooter={<footer data-testid='site-footer' />}
      siteHeader={<header data-testid='site-header' />}
    >
      {children}
    </RootChrome>
  )

  it('renders public site chrome for storefront routes', () => {
    renderRootChrome({
      children: <div data-testid='page-child'>Page</div>
    })

    expect(screen.getByTestId('site-header')).toBeInTheDocument()
    expect(screen.getByTestId('site-footer')).toBeInTheDocument()
    expect(screen.getByTestId('lightweight-consent-banner')).toBeInTheDocument()
    expect(screen.getByTestId('consent-preferences-controller')).toBeInTheDocument()
    expect(screen.getByTestId('deferred-non-critical-client-features')).toBeInTheDocument()
    expect(screen.getByRole('main')).toContainElement(screen.getByTestId('page-child'))
  })

  it('keeps the in-flow consent notice before the header without replacing window scrolling', () => {
    renderRootChrome({
      children: <div data-testid='page-child'>Page</div>
    })

    const consentRoot = screen.getByTestId('lightweight-consent-banner').closest('.public-root-consent')
    const headerRoot = screen.getByTestId('site-header').closest('.public-root-header')
    const rootChrome = consentRoot?.parentElement

    expect(consentRoot).not.toBeNull()
    expect(headerRoot).not.toBeNull()
    expect(consentRoot?.compareDocumentPosition(headerRoot as Node)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    )
    expect(rootChrome).toHaveClass('min-h-screen', 'flex', 'flex-col')
    expect(rootChrome).not.toHaveClass('h-dvh', 'overflow-y-auto')
  })

  it('keeps public chrome outside admin content so admin CSS can hide it without a client root wrapper', () => {
    renderRootChrome({
      children: <div data-admin-root data-testid='admin-child'>Admin</div>
    })

    expect(screen.getByTestId('admin-child')).toBeInTheDocument()
    expect(screen.getByTestId('site-header').closest('.public-root-header')).toBeInTheDocument()
    expect(screen.getByTestId('site-footer').closest('.public-root-footer')).toBeInTheDocument()
    expect(screen.getByTestId('lightweight-consent-banner').closest('.public-root-consent')).toBeInTheDocument()
    expect(screen.getByTestId('deferred-non-critical-client-features').closest('.public-root-deferred-features')).toBeInTheDocument()
  })

  it('keeps observability enabled on Vercel deployments', () => {
    renderRootChrome({
      children: <div>Page</div>,
      isVercelDeployment: true
    })

    expect(screen.getByTestId('deferred-vercel-observability')).toBeInTheDocument()
  })
})
