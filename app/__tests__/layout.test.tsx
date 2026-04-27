import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server.node'

interface MockProps {
  children?: ReactNode
  id?: string
  strategy?: string
  dangerouslySetInnerHTML?: {
    __html: string
  }
  [key: string]: unknown
}

jest.mock('next/font/local', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    className: 'font-class',
    variable: 'font-variable'
  }))
}))

jest.mock('@vercel/analytics/react', () => ({
  Analytics: () => <div data-testid='vercel-analytics' />
}))

jest.mock('@vercel/speed-insights/next', () => ({
  SpeedInsights: () => <div data-testid='vercel-speed-insights' />
}))

jest.mock('next/script', () => ({
  __esModule: true,
  default: ({ children, dangerouslySetInnerHTML, ...props }: MockProps) => {
    if (dangerouslySetInnerHTML) {
      return <script {...props} dangerouslySetInnerHTML={dangerouslySetInnerHTML} />
    }

    return <script {...props}>{children}</script>
  }
}))

jest.mock('../components/homepage/SiteHeader', () => ({
  SiteHeader: () => <div data-testid='site-header' />
}))

jest.mock('../components/ReviewStatsProvider', () => ({
  ReviewStatsProvider: ({ children }: { children: ReactNode }) => <>{children}</>
}))

jest.mock('../components/RootChrome', () => ({
  RootChrome: ({
    children,
    isVercelDeployment
  }: {
    children: ReactNode
    isVercelDeployment: boolean
  }) => (
    <div data-testid='root-chrome'>
      <div data-testid='non-critical-client-features' />
      {children}
      {isVercelDeployment ? <div data-testid='deferred-vercel-observability' /> : null}
    </div>
  )
}))

jest.mock('../components/PerformanceOptimizer', () => ({
  PerformanceOptimizer: () => <div data-testid='performance-optimizer' />
}))

jest.mock('../components/NonCriticalClientFeatures', () => ({
  NonCriticalClientFeatures: () => <div data-testid='non-critical-client-features' />
}))

jest.mock('../components/DeferredVercelObservability', () => ({
  DeferredVercelObservability: () => <div data-testid='deferred-vercel-observability' />
}))

jest.mock('../components/RouteScrollReset', () => ({
  RouteScrollReset: () => <div data-testid='route-scroll-reset' />
}))

jest.mock('../components/SiteFooter', () => ({
  SiteFooter: () => <div data-testid='site-footer' />
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

    expect(markup).toContain('data-testid="non-critical-client-features"')
    expect(markup).toContain('data-testid="deferred-vercel-observability"')
  })

  it('does not render Vercel analytics components outside Vercel deployments', async () => {
    const markup = await renderRootLayout()

    expect(markup).toContain('data-testid="page-child"')
    expect(markup).not.toContain('data-testid="deferred-vercel-observability"')
  })

  it('keeps the consent runtime out of the initial HTML when GTM is configured', async () => {
    const markup = await renderRootLayout({
      gtmId: 'GTM-TEST123'
    })

    expect(markup).not.toContain('id="gtag-consent-default"')
    expect(markup).not.toContain('id="klaro-config"')
    expect(markup).not.toContain('id="klaro-script"')
    expect(markup).not.toContain('id="google-tag-manager-template"')
    expect(markup).not.toContain('data-name="google-tag-manager"')
    expect(markup).toContain('data-testid="non-critical-client-features"')
    expect(markup).not.toContain('data-testid="deferred-vercel-observability"')
  })

  it('does not emit SearchAction in the sitewide WebSite structured data', async () => {
    const markup = await renderRootLayout()

    expect(markup).not.toContain('"@type":"SearchAction"')
    expect(markup).not.toContain('search_term_string')
  })

  it('keeps the root shell free of global public providers', async () => {
    const markup = await renderRootLayout()

    expect(markup).not.toContain('data-testid="nuqs-adapter"')
    expect(markup).not.toContain('data-testid="query-providers"')
    expect(markup).not.toContain('data-testid="mui-providers"')
  })

  it('defers non-critical client features behind a single shell component', async () => {
    const markup = await renderRootLayout()

    expect(markup).toContain('data-testid="non-critical-client-features"')
    expect(markup).not.toContain('data-testid="klaro-bridge"')
    expect(markup).not.toContain('data-testid="scroll-to-top"')
    expect(markup).not.toContain('data-testid="web-vitals-monitor"')
  })
})
