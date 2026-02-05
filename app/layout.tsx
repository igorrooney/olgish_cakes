import { BUSINESS_CONSTANTS } from "@/lib/constants";
import { designTokens } from "@/lib/design-system";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { Alice, Inter, Oldenburg } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import { SiteHeader } from "./components/homepage/SiteHeader";
import { ConditionalMuiProviders } from "./components/ConditionalMuiProviders";
import { PerformanceOptimizer } from "./components/PerformanceOptimizer";
import { ScrollToTop } from "./components/ScrollToTop";
import { SiteFooter } from "./components/SiteFooter";
import { WebVitalsMonitor } from "./components/WebVitalsMonitor";
import "./globals.css";
import { Providers } from "./providers";

const alice = Alice({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-alice",
  display: "swap",
  preload: true,
  fallback: ["Georgia", "serif"],
  adjustFontFallback: true,
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
  adjustFontFallback: true,
});

const oldenburg = Oldenburg({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-oldenburg",
  display: "swap",
  preload: true,
  fallback: ["Georgia", "serif"],
  adjustFontFallback: true,
});

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
  preload: true,
  fallback: ['cursive', 'fantasy']
})

const primary = designTokens.colors.primary.main;
const primaryDark = designTokens.colors.primary.dark;
const secondary = designTokens.colors.secondary.main;
const gtmId = process.env.NEXT_PUBLIC_GTM_ID
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

export const metadata: Metadata = {
  title: {
    default:
      'Olgish Cakes - #1 Ukrainian Cakes Leeds | Honey Cake',
    template: '%s | Olgish Cakes',
  },
  description:
    'Authentic Ukrainian honey cake and Kyiv cake in Leeds. Handmade bakes with 5★ reviews, same-day local delivery, and custom designs across West Yorkshire.',
  keywords: [
    "Ukrainian cakes Leeds",
    "honey cake",
    "Medovik",
    "Kyiv cake",
    "traditional Ukrainian desserts",
    "Ukrainian bakery Leeds",
    "custom cakes Leeds",
    "wedding cakes Leeds",
    "birthday cakes Leeds",
    "best Ukrainian cakes Leeds",
    "honey cake delivery Yorkshire",
    "Ukrainian bakery near me",
    "authentic Ukrainian cakes",
    "traditional medovik",
    "Ukrainian honey cake recipe",
    "Leeds cake delivery",
    "Yorkshire Ukrainian bakery",
    "custom wedding cakes Leeds",
    "birthday cake delivery Leeds",
    "Ukrainian dessert shop Leeds",
  ].join(", "),
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
    title:
      'Olgish Cakes - #1 Ukrainian Cakes Leeds | Honey Cake',
    description:
      'Authentic Ukrainian honey cake and Kyiv cake in Leeds. Handmade bakes with 5★ reviews, same-day local delivery, and custom designs across West Yorkshire.',
    type: "website",
    locale: "en_GB",
    url: "https://olgishcakes.co.uk",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png",
        width: 1200,
        height: 630,
        alt: "Olgish Cakes - #1 Ukrainian Cakes Leeds | Authentic Honey Cake (Medovik) | Cake by Post UK | Letterbox Delivery | Traditional Ukrainian Bakery",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'Olgish Cakes - #1 Ukrainian Cakes Leeds | Honey Cake',
    description:
      "🏆 #1 Rated Ukrainian Bakery in Leeds! Authentic honey cake (Medovik), Kyiv cake & traditional Ukrainian desserts. 5★ rating.",
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
  other: {
    "geo.region": "GB-ENG",
    "geo.placename": "Leeds",
    "geo.position": "53.8008;-1.5491",
    ICBM: "53.8008, -1.5491",
    rating: "5",
    rating_count: "127",
    price_range: "££",
    cuisine: "Ukrainian",
    payment: "cash, credit card, bank transfer",
    delivery: "yes",
    takeout: "yes",
    "business:contact_data:street_address": "Allerton Grange",
    "business:contact_data:locality": "Leeds",
    "business:contact_data:postal_code": "LS17",
    "business:contact_data:country_name": "United Kingdom",
    "business:contact_data:phone_number": BUSINESS_CONSTANTS.PHONE,
    "business:contact_data:email": "hello@olgishcakes.co.uk",
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk",
    languages: {
      "en-GB": "https://olgishcakes.co.uk",
    },
  },
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-GB" data-theme="olgish-cakes" className={`${alice.variable} ${inter.variable} ${moreSugar.variable} ${oldenburg.variable}`}>
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

        {/* Fonts are loaded via next/font/google - see Alice import at top of file */}

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

        {/* Enhanced Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Bakery",
              "@id": "https://olgishcakes.co.uk/#organization",
              name: "Olgish Cakes",
              alternateName: "Olgish Ukrainian Cakes",
    description:
      'Authentic Ukrainian honey cake and Kyiv cake in Leeds. Handmade bakes with 5★ reviews, same-day local delivery, and custom designs across West Yorkshire.',
              url: "https://olgishcakes.co.uk",
              logo: {
                "@type": "ImageObject",
                url: "https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png",
                width: 1200,
                height: 630,
              },
              image: "https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png",
              telephone: BUSINESS_CONSTANTS.PHONE,
              email: "hello@olgishcakes.co.uk",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Allerton Grange",
                addressLocality: "Leeds",
                addressRegion: "West Yorkshire",
                postalCode: "LS17",
                addressCountry: "GB",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: "53.8008",
                longitude: "-1.5491",
              },
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                  ],
                  opens: "00:00",
                  closes: "23:59",
                },
              ],
              priceRange: "££",
              servesCuisine: ["Ukrainian", "Traditional", "Honey Cake", "Medovik", "Kyiv Cake"],
              hasMenu: "https://olgishcakes.co.uk/cakes",
              areaServed: [
                { "@type": "City", name: "Leeds" },
                { "@type": "City", name: "York" },
                { "@type": "City", name: "Bradford" },
                { "@type": "City", name: "Halifax" },
                { "@type": "City", name: "Huddersfield" },
                { "@type": "City", name: "Wakefield" },
                { "@type": "City", name: "Otley" },
                { "@type": "City", name: "Pudsey" },
                { "@type": "City", name: "Skipton" },
                { "@type": "City", name: "Ilkley" },
              ],
              sameAs: [
                "https://www.facebook.com/p/Olgish-Cakes-61557043820222/?locale=en_GB",
                "https://www.instagram.com/olgish_cakes/",
              ],
              // Aggregate ratings are provided on Product and review pages to avoid duplication
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "Ukrainian Cakes Menu",
                itemListElement: [
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Service",
                      name: "Traditional Honey Cake (Medovik)",
                      category: "Ukrainian Honey Cake",
                      description: "Authentic Ukrainian honey cake with traditional recipe",
                    },
                    hasMerchantReturnPolicy: {
                      "@type": "MerchantReturnPolicy",
                      applicableCountry: "GB",
                      returnFees: "https://schema.org/FreeReturn",
                      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
                      merchantReturnDays: 14,
                      returnMethod: "https://schema.org/ReturnByMail",
                    },
                  },
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Service",
                      name: "Kyiv Cake",
                      category: "Ukrainian Traditional Cake",
                      description: "Classic Kyiv cake with hazelnut meringue",
                    },
                    hasMerchantReturnPolicy: {
                      "@type": "MerchantReturnPolicy",
                      applicableCountry: "GB",
                      returnFees: "https://schema.org/FreeReturn",
                      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
                      merchantReturnDays: 14,
                      returnMethod: "https://schema.org/ReturnByMail",
                    },
                  },
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Service",
                      name: "Custom Wedding Cakes",
                      category: "Wedding Cake Design",
                      description: "Personalized wedding cakes with Ukrainian flavors",
                    },
                    hasMerchantReturnPolicy: {
                      "@type": "MerchantReturnPolicy",
                      applicableCountry: "GB",
                      returnFees: "https://schema.org/FreeReturn",
                      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
                      merchantReturnDays: 14,
                      returnMethod: "https://schema.org/ReturnByMail",
                    },
                  },
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Service",
                      name: "Birthday Cakes",
                      category: "Birthday Cake Design",
                      description: "Custom birthday cakes for all ages",
                    },
                    hasMerchantReturnPolicy: {
                      "@type": "MerchantReturnPolicy",
                      applicableCountry: "GB",
                      returnFees: "https://schema.org/FreeReturn",
                      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
                      merchantReturnDays: 14,
                      returnMethod: "https://schema.org/ReturnByMail",
                    },
                  },
                ],
              },
              paymentAccepted: ["Cash", "Credit Card", "Bank Transfer"],
              deliveryAvailable: true,
              takeoutAvailable: true,
              foundingDate: "2023",
              award: [
                "Best Ukrainian Bakery Leeds 2024",
                "5★ Customer Rating",
                "Same-day Delivery Service",
              ],
            }),
          }}
        />

        {/* Website Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": "https://olgishcakes.co.uk/#website",
              url: "https://olgishcakes.co.uk",
              name: "Olgish Cakes",
              description: "Authentic Ukrainian honey cakes and traditional desserts in Leeds",
              publisher: {
                "@id": "https://olgishcakes.co.uk/#organization",
              },
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: "https://olgishcakes.co.uk/search?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body className={`${alice.className} ${alice.variable} critical-loading`} suppressHydrationWarning>
        <ConditionalMuiProviders>
          <Providers>
            <div className="flex flex-col min-h-screen">
              <SiteHeader />
              <main className="flex-grow">{children}</main>
              <SiteFooter />
              <ScrollToTop />
              <WebVitalsMonitor />
              <PerformanceOptimizer />
            </div>
          </Providers>
        </ConditionalMuiProviders>
        <Analytics />
        <SpeedInsights />

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
