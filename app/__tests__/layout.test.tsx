import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server.node'

interface MockProps {
  children?: ReactNode
  id?: string
  strategy?: string
  [key: string]: unknown
}

jest.mock('next/font/local', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    className: 'font-class',
    variable: 'font-variable'
  }))
}))

jest.mock('next/script', () => ({
  __esModule: true,
  default: ({ children, id, strategy, ...props }: MockProps) => (
    <script data-testid={id} data-strategy={strategy} {...props}>
      {children}
    </script>
  )
}))

jest.mock('@vercel/analytics/react', () => ({
  Analytics: () => <div data-testid='vercel-analytics' />
}))

jest.mock('@vercel/speed-insights/next', () => ({
  SpeedInsights: () => <div data-testid='vercel-speed-insights' />
}))

jest.mock('nuqs/adapters/next/app', () => ({
  NuqsAdapter: ({ children }: { children: ReactNode }) => <>{children}</>
}))

jest.mock('../components/homepage/SiteHeader', () => ({
  SiteHeader: () => <div data-testid='site-header' />
}))

jest.mock('../components/ReviewStatsProvider', () => ({
  ReviewStatsProvider: ({ children }: { children: ReactNode }) => <>{children}</>
}))

jest.mock('../components/ConditionalMuiProviders', () => ({
  ConditionalMuiProviders: ({ children }: { children: ReactNode }) => <>{children}</>
}))

jest.mock('../components/ConditionalQueryProviders', () => ({
  ConditionalQueryProviders: ({ children }: { children: ReactNode }) => <>{children}</>
}))

jest.mock('../components/KlaroA11yBridge', () => ({
  KlaroA11yBridge: () => <div data-testid='klaro-bridge' />
}))

jest.mock('../components/PerformanceOptimizer', () => ({
  PerformanceOptimizer: () => <div data-testid='performance-optimizer' />
}))

jest.mock('../components/RouteScrollReset', () => ({
  RouteScrollReset: () => <div data-testid='route-scroll-reset' />
}))

jest.mock('../components/ScrollToTop', () => ({
  ScrollToTop: () => <div data-testid='scroll-to-top' />
}))

jest.mock('../components/SiteFooter', () => ({
  SiteFooter: () => <div data-testid='site-footer' />
}))

jest.mock('../components/WebVitalsMonitor', () => ({
  WebVitalsMonitor: () => <div data-testid='web-vitals-monitor' />
}))

jest.mock('../utils/review-stats.server', () => ({
  getReviewStats: jest.fn(async () => ({ count: 13, averageRating: 5 }))
}))

async function renderRootLayout({
  gtmId,
  vercelValue
}: {
  gtmId?: string
  vercelValue?: string
} = {}) {
  jest.resetModules()

  if (vercelValue === undefined) {
    delete process.env.VERCEL
  } else {
    process.env.VERCEL = vercelValue
  }

  if (gtmId === undefined) {
    delete process.env.NEXT_PUBLIC_GTM_ID
  } else {
    process.env.NEXT_PUBLIC_GTM_ID = gtmId
  }

  const { default: RootLayout } = await import('../layout')

  return renderToStaticMarkup(
    await RootLayout({
      children: <div data-testid='page-child'>Page</div>
    })
  )
}

describe('RootLayout', () => {
  afterEach(() => {
    delete process.env.VERCEL
    delete process.env.NEXT_PUBLIC_GTM_ID
  })

  it('renders Vercel analytics components on Vercel deployments', async () => {
    const markup = await renderRootLayout({ vercelValue: '1' })

    expect(markup).toContain('data-testid="vercel-analytics"')
    expect(markup).toContain('data-testid="vercel-speed-insights"')
  })

  it('does not render Vercel analytics components outside Vercel deployments', async () => {
    const markup = await renderRootLayout()

    expect(markup).toContain('data-testid="page-child"')
    expect(markup).not.toContain('data-testid="vercel-analytics"')
    expect(markup).not.toContain('data-testid="vercel-speed-insights"')
  })

  it('keeps consent scripts enabled when GTM is configured outside Vercel deployments', async () => {
    const markup = await renderRootLayout({
      gtmId: 'GTM-TEST123'
    })

    expect(markup).toContain('data-testid="gtag-consent-default"')
    expect(markup).toContain('data-testid="klaro-config"')
    expect(markup).toContain('data-testid="klaro-script"')
    expect(markup).not.toContain('data-testid="vercel-analytics"')
    expect(markup).not.toContain('data-testid="vercel-speed-insights"')
  })

  it('does not emit SearchAction in the sitewide WebSite structured data', async () => {
    const markup = await renderRootLayout()

    expect(markup).not.toContain('"@type":"SearchAction"')
    expect(markup).not.toContain('search_term_string')
  })
})
