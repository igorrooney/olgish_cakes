import type { Metadata, Viewport } from "next";
import { Alice } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";
import { ThemeProvider, CssBaseline } from "@/lib/mui-optimization";
import { theme } from "@/lib/theme";
import { designTokens } from "@/lib/design-system";
import { EmotionCacheProvider } from "./components/EmotionCacheProvider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Header } from "./components/Header";
import UtilityBar from "./components/UtilityBar";
import Footer from "./components/Footer";
import { ScrollToTop } from "./components/ScrollToTop";
import { WebVitalsMonitor } from "./components/WebVitalsMonitor";
import { DynamicCookieConsent, DynamicDevTools } from "./components/DynamicImports";
import { PerformanceOptimizer, CriticalCSS } from "./components/PerformanceOptimizer";
import Script from "next/script";
import { BUSINESS_CONSTANTS } from "@/lib/constants";

const alice = Alice({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-alice",
  display: "swap",
  preload: true,
  fallback: ["Georgia", "serif"],
  adjustFontFallback: true,
});

const primary = designTokens.colors.primary.main;
const primaryDark = designTokens.colors.primary.dark;
const secondary = designTokens.colors.secondary.main;

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
      "Olgish Cakes - #1 Ukrainian Cakes Leeds | Authentic Honey Cake",
    template: "%s | Olgish Cakes",
  },
  description:
    "🏆 #1 Rated Ukrainian Bakery in Leeds! Authentic honey cake (Medovik), Kyiv cake & traditional Ukrainian desserts. 5★ rating, same-day delivery across Yorkshire. Premium ingredients, custom designs. Order now!",
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
      "Olgish Cakes - #1 Ukrainian Cakes Leeds | Authentic Honey Cake",
    description:
      "🏆 #1 Rated Ukrainian Bakery in Leeds! Authentic honey cake (Medovik), Kyiv cake & traditional Ukrainian desserts. 5★ rating, same-day delivery across Yorkshire.",
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
    card: "summary_large_image",
    title:
      "Olgish Cakes - #1 Ukrainian Cakes Leeds | Authentic Honey Cake",
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${alice.variable}`}>
      <head>
        {/* Critical CSS inlining */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Critical CSS for above-the-fold content */
              body { margin: 0; font-family: var(--font-playfair-display), Georgia, serif; }
              .critical-loading { opacity: 0; transition: opacity 0.3s; }
              .critical-loaded { opacity: 1; }

              /* Critical layout styles */
              .flex { display: flex; }
              .flex-col { flex-direction: column; }
              .min-h-screen { min-height: 100vh; }
              .flex-grow { flex-grow: 1; }

              /* Critical typography */
              h1, h2, h3, h4, h5, h6 { line-height: 1.2; margin-bottom: 0.5em; font-weight: 600; }
              h1 { font-size: clamp(2rem, 5vw, 4rem); }
              h2 { font-size: clamp(1.5rem, 4vw, 3rem); }

              /* Critical button styles */
              .btn-primary { background: ${primary}; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
              .btn-primary:hover { background: ${primaryDark}; transform: translateY(-1px); }

              /* Critical container styles */
              .container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }

              /* Critical focus states */
              a:focus, button:focus, input:focus, textarea:focus, select:focus { outline: 2px solid ${primary}; outline-offset: 2px; }
            `,
          }}
        />
        <style>{`:root{--primary:${primary};--primary-dark:${primaryDark};--secondary:${secondary};}`}</style>
        <CriticalCSS />

        {/* DNS prefetch for external domains */}
        <link rel="dns-prefetch" href="//cdn.sanity.io" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />

        {/* Preconnect for critical domains */}
        <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />

        {/* Font preloading for better performance */}
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Alice:wght@400&display=swap"
          as="style"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Alice:wght@400&display=swap"
        />

        {/* Google Analytics 4 - Load with lower priority */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-QGQC58H2LD"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-QGQC58H2LD', {
              page_title: document.title,
              page_location: window.location.href,
              custom_map: {
                'custom_parameter_1': 'business_type',
                'custom_parameter_2': 'location'
              }
            });
            gtag('config', 'G-QGQC58H2LD', {
              business_type: 'bakery',
              location: 'leeds'
            });
          `}
        </Script>

        {/* Google Tag Manager - Load with lower priority */}
        <Script id="google-tag-manager" strategy="lazyOnload">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-XXXXXXX');
          `}
        </Script>

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
                "🏆 #1 Rated Ukrainian Bakery in Leeds! Authentic honey cake (Medovik), Kyiv cake & traditional Ukrainian desserts. 5★ rating, same-day delivery across Yorkshire.",
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
      <body className={`${alice.className} ${alice.variable} critical-loading`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>

        <EmotionCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Providers>
              <div className="flex flex-col min-h-screen">
                <UtilityBar />
                <Header />
                <main className="flex-grow">{children}</main>
                <Footer />
                      <ScrollToTop />
                      <WebVitalsMonitor />
                      <PerformanceOptimizer />
                      <DynamicCookieConsent />
                      <DynamicDevTools />
              </div>
            </Providers>
          </ThemeProvider>
        </EmotionCacheProvider>
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
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
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
      </body>
    </html>
  );
}
