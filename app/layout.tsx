import { BUSINESS_CONSTANTS } from "@/lib/constants";
import { designTokens } from "@/lib/design-system";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { SiteHeader } from "./components/homepage/SiteHeader";
import { ReviewStatsProvider } from "./components/ReviewStatsProvider";
import { ConditionalMuiProviders } from "./components/ConditionalMuiProviders";
import { KlaroA11yBridge } from "./components/KlaroA11yBridge";
import { PerformanceOptimizer } from "./components/PerformanceOptimizer";
import { RouteScrollReset } from "./components/RouteScrollReset";
import { ScrollToTop } from "./components/ScrollToTop";
import { SiteFooter } from "./components/SiteFooter";
import { WebVitalsMonitor } from "./components/WebVitalsMonitor";
import "./globals.css";
import { Providers } from "./providers";
import { getReviewStats } from "./utils/review-stats.server";

const alice = localFont({
  src: [
    {
      path: './fonts/alice/Alice-Regular.woff2',
      weight: '400',
      style: 'normal'
    }
  ],
  variable: '--font-alice',
  display: 'swap',
  preload: true,
  fallback: ['Georgia', 'serif'],
  adjustFontFallback: 'Times New Roman'
})

const inter = localFont({
  src: [
    {
      path: './fonts/inter/Inter-Variable.woff2',
      weight: '100 900',
      style: 'normal'
    }
  ],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
  adjustFontFallback: 'Arial'
})

const oldenburg = localFont({
  src: [
    {
      path: './fonts/oldenburg/Oldenburg-Regular.woff2',
      weight: '400',
      style: 'normal'
    }
  ],
  variable: '--font-oldenburg',
  display: 'swap',
  preload: false,
  fallback: ['Georgia', 'serif'],
  adjustFontFallback: 'Times New Roman'
})

const moreSugar = localFont({
  src: [
    {
      path: './fonts/more_sugar/MoreSugar-Regular.ttf',
      weight: '400',
      style: 'normal'
    }
  ],
  variable: '--font-more-sugar',
  display: 'swap',
  preload: false,
  fallback: ['cursive', 'fantasy']
})

const primary = designTokens.colors.primary.main;
const primaryDark = designTokens.colors.primary.dark;
const secondary = designTokens.colors.secondary.main;
const gtmId = process.env.NEXT_PUBLIC_GTM_ID
const isVercelDeployment = process.env.VERCEL === '1'
const isConsentEnabled = Boolean(gtmId)
const klaroScriptSrc = 'https://cdn.kiprotect.com/klaro/v0.7/klaro.js'
const klaroStyleHref = 'https://cdn.kiprotect.com/klaro/v0.7/klaro.min.css'
const klaroStyleInitScript = `
  (function () {
    var link = document.querySelector('link[data-klaro-style]')
    if (link) {
      link.media = 'all'
    }
  })()
`
const consentDefaultsScript = `
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){dataLayer.push(arguments)}
  gtag('consent', 'default', {
    'ad_storage': 'denied',
    'analytics_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied'
  })
  gtag('set', 'ads_data_redaction', true)
`

const klaroServices = isConsentEnabled ? [
  {
    name: 'google-tag-manager',
    default: true,
    required: true,
    purposes: ['necessary'],
    onlyOnce: true,
    translations: {
      zz: {
        title: 'Google Tag Manager'
      },
      en: {
        description: 'Loads the tag manager to apply your consent choices.'
      }
    },
    onAccept: `
      for (let k of Object.keys(opts.consents)) {
        if (opts.consents[k]) {
          dataLayer.push({ event: 'klaro-' + k + '-accepted' })
        }
      }
    `
  },
  {
    name: 'google-analytics',
    purposes: ['analytics'],
    cookies: ['_ga', '_gid', '_gat'],
    translations: {
      zz: {
        title: 'Google Analytics'
      },
      en: {
        description: 'Helps us understand how people use the site.'
      }
    },
    onAccept: `
      gtag('consent', 'update', {
        'analytics_storage': 'granted'
      })
    `,
    onDecline: `
      gtag('consent', 'update', {
        'analytics_storage': 'denied'
      })
    `
  },
  {
    name: 'microsoft-clarity',
    purposes: ['analytics'],
    translations: {
      zz: {
        title: 'Microsoft Clarity'
      },
      en: {
        description: 'Helps us understand how people use the site with session insights.'
      }
    }
  },
  {
    name: 'google-ads',
    purposes: ['marketing'],
    cookies: ['_gcl_au', '_gcl_aw', '_gcl_dc'],
    translations: {
      zz: {
        title: 'Google Ads'
      },
      en: {
        description: 'Shows personalised ads and measures ad performance.'
      }
    },
    onAccept: `
      gtag('consent', 'update', {
        'ad_storage': 'granted',
        'ad_user_data': 'granted',
        'ad_personalization': 'granted'
      })
    `,
    onDecline: `
      gtag('consent', 'update', {
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied'
      })
    `
  }
] : []

const klaroConfig = {
  elementID: 'klaro',
  storageMethod: 'cookie',
  storageName: 'klaro',
  default: false,
  mustConsent: false,
  acceptAll: true,
  hideDeclineAll: false,
  hideLearnMore: false,
  translations: {
    zz: {
      privacyPolicyUrl: '/privacy'
    },
    en: {
      consentNotice: {
        title: 'Cookie preferences',
        description: 'We use cookies to improve your experience, understand site traffic, and support marketing.',
        learnMore: 'Choose cookies'
      },
      consentModal: {
        title: 'Cookie preferences',
        description: 'Choose which cookies you are happy for us to use. You can change your mind anytime.'
      },
      purposes: {
        analytics: {
          title: 'Analytics'
        },
        necessary: {
          title: 'Necessary',
          description: 'Required to store your cookie choices and keep the site secure.'
        },
        marketing: {
          title: 'Marketing'
        }
      }
    },
    'en-GB': {
      consentNotice: {
        title: 'Cookie preferences',
        description: 'We use cookies to improve your experience, understand site traffic, and support marketing.',
        learnMore: 'Choose cookies'
      },
      consentModal: {
        title: 'Cookie preferences',
        description: 'Choose which cookies you are happy for us to use. You can change your mind anytime.'
      },
      purposes: {
        analytics: {
          title: 'Analytics'
        },
        necessary: {
          title: 'Necessary',
          description: 'Required to store your cookie choices and keep the site secure.'
        },
        marketing: {
          title: 'Marketing'
        }
      }
    }
  },
  services: klaroServices
}

const klaroConfigScript = `var klaroConfig = ${JSON.stringify(klaroConfig)}`

const gtmSnippet = gtmId
  ? `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`
  : ''

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: primary,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover"
};

const baseSiteTitle = 'Olgish Cakes | Handmade Ukrainian cakes from Leeds'
const baseSiteDescription =
  'Handmade Ukrainian cakes from Leeds, with postal bakes across the UK and custom celebration cakes for local orders.'
const siteLogoUrl = 'https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png'
const toJsonLdScript = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c')

const baseMetadata: Metadata = {
  title: {
    default: baseSiteTitle,
    template: '%s | Olgish Cakes',
  },
  description: baseSiteDescription,
  authors: [{ name: "Olgish Cakes", url: "https://olgishcakes.co.uk" }],
  creator: "Olgish Cakes",
  publisher: "Olgish Cakes",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://olgishcakes.co.uk"),
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/safari-pinned-tab.svg", color: primary },
      { rel: "msapplication-config", url: "/browserconfig.xml" },
      { rel: "icon", url: "/favicon.ico", type: "image/x-icon" },
    ],
  },
  openGraph: {
    title: baseSiteTitle,
    description: baseSiteDescription,
    type: "website",
    locale: "en_GB",
    url: "https://olgishcakes.co.uk",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png",
        width: 1200,
        height: 630,
        alt: "Olgish Cakes logo and bakery branding",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: baseSiteTitle,
    description: baseSiteDescription,
    images: ["https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png"],
    creator: "@olgish_cakes",
    site: "@olgish_cakes",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "ggHjlSwV1aM_lVT4IcRSlUIk6Vn98ZbJ_FGCepoVi64",
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk",
    languages: {
      "en-GB": "https://olgishcakes.co.uk",
    },
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return baseMetadata
}

export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  const reviewStats = await getReviewStats()
  const organizationStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://olgishcakes.co.uk/#organization',
    name: 'Olgish Cakes',
    alternateName: 'Olgish Ukrainian Cakes',
    description: baseSiteDescription,
    url: BUSINESS_CONSTANTS.BASE_URL,
    logo: {
      '@type': 'ImageObject',
      url: siteLogoUrl,
      width: 1200,
      height: 630
    },
    image: siteLogoUrl,
    email: 'hello@olgishcakes.co.uk',
    telephone: BUSINESS_CONSTANTS.PHONE,
    sameAs: [
      'https://www.facebook.com/p/Olgish-Cakes-61557043820222/?locale=en_GB',
      'https://www.instagram.com/olgish_cakes/'
    ]
  }
  const websiteStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://olgishcakes.co.uk/#website',
    url: BUSINESS_CONSTANTS.BASE_URL,
    name: BUSINESS_CONSTANTS.NAME,
    description: baseSiteDescription,
    publisher: {
      '@id': 'https://olgishcakes.co.uk/#organization'
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://olgishcakes.co.uk/search?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    }
  }

  return (
    <html
      lang="en-GB"
      data-theme="olgish-cakes"
      data-scroll-behavior="smooth"
      className={`${alice.variable} ${inter.variable} ${moreSugar.variable} ${oldenburg.variable}`}
    >
      <head>
        <style>{`:root{--primary:${primary};--primary-dark:${primaryDark};--secondary:${secondary};}`}</style>

        {/* DNS prefetch for external domains */}
        <link rel="dns-prefetch" href="//cdn.sanity.io" />
        {isConsentEnabled ? (
          <link rel="dns-prefetch" href="//cdn.kiprotect.com" />
        ) : null}

        {/* Preconnect for critical domains */}
        <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="anonymous" />
        {isConsentEnabled ? (
          <link rel="preconnect" href="https://cdn.kiprotect.com" crossOrigin="anonymous" />
        ) : null}

        {/* Fonts are self-hosted via next/font/local - see font definitions at top of file */}

        {isConsentEnabled ? (
          <>
            <link rel="preload" as="style" href={klaroStyleHref} />
            <link rel="stylesheet" href={klaroStyleHref} media="print" data-klaro-style="true" />
            <Script
              id="klaro-style-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{ __html: klaroStyleInitScript }}
            />
            <Script
              id="gtag-consent-default"
              strategy="beforeInteractive"
              dangerouslySetInnerHTML={{ __html: consentDefaultsScript }}
            />
            <Script
              id="klaro-config"
              strategy="beforeInteractive"
              dangerouslySetInnerHTML={{ __html: klaroConfigScript }}
            />
            <Script
              id="klaro-script"
              strategy="afterInteractive"
              data-config="klaroConfig"
              src={klaroScriptSrc}
            />
            <script
              type="text/plain"
              data-type="application/javascript"
              data-name="google-tag-manager"
              dangerouslySetInnerHTML={{ __html: gtmSnippet }}
            />
          </>
        ) : null}

        {/* Sitewide structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: toJsonLdScript(organizationStructuredData),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: toJsonLdScript(websiteStructuredData),
          }}
        />
      </head>
      <body className={`${alice.className} ${alice.variable} critical-loading`} suppressHydrationWarning>
        <NuqsAdapter>
          <ConditionalMuiProviders>
            <ReviewStatsProvider stats={reviewStats}>
              <Providers>
                <div className="flex flex-col min-h-screen">
                  <RouteScrollReset />
                  <SiteHeader />
                  <main className="flex-grow">{children}</main>
                  <SiteFooter />
                  <KlaroA11yBridge />
                  <ScrollToTop />
                  <WebVitalsMonitor />
                  <PerformanceOptimizer />
                </div>
              </Providers>
            </ReviewStatsProvider>
          </ConditionalMuiProviders>
          {isVercelDeployment ? (
            <>
              <Analytics />
              <SpeedInsights />
            </>
          ) : null}
        </NuqsAdapter>

        {/* Critical CSS loading script */}
        <Script id="critical-css-loader" strategy="afterInteractive">
          {`
            document.body.classList.remove('critical-loading');
            document.body.classList.add('critical-loaded');
          `}
        </Script>

        {/* Service Worker Registration */}
        {process.env.NODE_ENV === "production" && (
          <Script id="sw-register" strategy="afterInteractive">
            {`
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js', {
                    scope: '/',
                    updateViaCache: 'none'
                  })
                    .then((registration) => {
                      // Service worker registered successfully
                    })
                    .catch((registrationError) => {
                      // Service worker registration failed
                    });
                });
              }
            `}
          </Script>
        )}

        {/* Suppress MetaMask extension errors */}
        <Script id="suppress-extension-errors" strategy="afterInteractive">
          {`
            // Suppress MetaMask and other extension errors that are expected
            const originalError = console.error;
            console.error = function(...args) {
              const message = args.join(' ');
              // Suppress MetaMask extension errors
              if (message.includes('MetaMask') || message.includes('Failed to connect to MetaMask')) {
                return;
              }
              originalError.apply(console, args);
            };

            // Suppress unhandled promise rejections from extensions
            window.addEventListener('unhandledrejection', (event) => {
              if (event.reason && typeof event.reason === 'object') {
                const reason = event.reason.toString();
                if (reason.includes('MetaMask') || reason.includes('extension not found')) {
                  event.preventDefault();
                }
              }
            });
          `}
        </Script>
      </body>
    </html>
  );
}


