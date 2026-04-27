import { BUSINESS_CONSTANTS } from '@/lib/constants'
import { designTokens } from '@/lib/design-system'
import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { ReviewStatsProvider } from './components/ReviewStatsProvider'
import { RootChrome } from './components/RootChrome'
import './globals.css'
import { getReviewStats } from './utils/review-stats.server'

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
  preload: false,
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
  preload: true,
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

const primary = designTokens.colors.primary.main
const primaryDark = designTokens.colors.primary.dark
const secondary = designTokens.colors.secondary.main
const isVercelDeployment = process.env.VERCEL === '1'

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
      <body className={alice.variable} suppressHydrationWarning>
        <ReviewStatsProvider stats={reviewStats}>
          <RootChrome isVercelDeployment={isVercelDeployment}>
            {children}
          </RootChrome>
        </ReviewStatsProvider>

      </body>
    </html>
  );
}


