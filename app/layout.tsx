import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { theme } from "@/lib/theme";
import { EmotionCacheProvider } from "./components/EmotionCacheProvider";
import { Analytics } from "@vercel/analytics/react";
import { Header } from "./components/Header";
import Footer from "./components/Footer";
import CookieConsent from "./components/CookieConsent";
import { DevTools } from "./components/DevTools";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
  variable: "--font-inter",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
  display: "swap",
  preload: true,
  fallback: ["Georgia", "serif"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#005BBB",
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default:
      "Olgish Cakes - #1 Ukrainian Cakes Leeds | Authentic Honey Cake (Medovik) & Traditional Desserts",
    template: "%s | Olgish Cakes - Ukrainian Cakes Leeds",
  },
  description:
    "🏆 #1 Rated Ukrainian Bakery in Leeds! Authentic honey cake (Medovik), Kyiv cake & traditional Ukrainian desserts. 4.9★ rating, same-day delivery across Yorkshire. Premium ingredients, custom designs. Order now!",
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
      { url: "/images/olgish-cakes-logo-bakery-brand.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/images/olgish-cakes-logo-bakery-brand.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title:
      "Olgish Cakes - #1 Ukrainian Cakes Leeds | Authentic Honey Cake (Medovik) & Traditional Desserts",
    description:
      "🏆 #1 Rated Ukrainian Bakery in Leeds! Authentic honey cake (Medovik), Kyiv cake & traditional Ukrainian desserts. 4.9★ rating, same-day delivery across Yorkshire.",
    type: "website",
    locale: "en_GB",
    url: "https://olgishcakes.co.uk",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png",
        width: 1200,
        height: 630,
        alt: "Olgish Cakes - #1 Ukrainian Cakes Leeds | Authentic Honey Cake (Medovik)",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Olgish Cakes - #1 Ukrainian Cakes Leeds | Authentic Honey Cake (Medovik) & Traditional Desserts",
    description:
      "🏆 #1 Rated Ukrainian Bakery in Leeds! Authentic honey cake (Medovik), Kyiv cake & traditional Ukrainian desserts. 4.9★ rating.",
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
    google: "your-google-verification-code",
  },
  other: {
    "geo.region": "GB-ENG",
    "geo.placename": "Leeds",
    "geo.position": "53.8008;-1.5491",
    ICBM: "53.8008, -1.5491",
    rating: "4.9",
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
    "business:contact_data:phone_number": "+44 786 721 8194",
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
    <html lang="en-GB" className={`${inter.variable} ${playfairDisplay.variable}`}>
      <head>
        {/* Preload critical resources */}
        <link
          rel="preload"
          href="/images/olgish-cakes-logo-bakery-brand.png"
          as="image"
          type="image/png"
        />
        <link rel="preload" href="/images/hero-cake.jpg" as="image" type="image/jpeg" />
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/playfair-display-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />

        {/* DNS prefetch for external domains */}
        <link rel="dns-prefetch" href="//cdn.sanity.io" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />

        {/* Preconnect for critical domains */}
        <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Google Analytics 4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-QGQC58H2LD"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
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

        {/* Google Tag Manager */}
        <Script id="google-tag-manager" strategy="afterInteractive">
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
                "🏆 #1 Rated Ukrainian Bakery in Leeds! Authentic honey cake (Medovik), Kyiv cake & traditional Ukrainian desserts. 4.9★ rating, same-day delivery across Yorkshire.",
              url: "https://olgishcakes.co.uk",
              logo: {
                "@type": "ImageObject",
                url: "https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png",
                width: 1200,
                height: 630,
              },
              image: "https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png",
              telephone: "+44 786 721 8194",
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
                  dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                  opens: "09:00",
                  closes: "18:00",
                },
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: "Saturday",
                  opens: "09:00",
                  closes: "17:00",
                },
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: "Sunday",
                  opens: "10:00",
                  closes: "16:00",
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
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.9",
                reviewCount: "127",
                bestRating: "5",
                worstRating: "1",
              },
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "Ukrainian Cakes Menu",
                itemListElement: [
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Product",
                      name: "Traditional Honey Cake (Medovik)",
                      category: "Ukrainian Honey Cake",
                      description: "Authentic Ukrainian honey cake with traditional recipe",
                    },
                  },
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Product",
                      name: "Kyiv Cake",
                      category: "Ukrainian Traditional Cake",
                      description: "Classic Kyiv cake with hazelnut meringue",
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
                  },
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Service",
                      name: "Birthday Cakes",
                      category: "Birthday Cake Design",
                      description: "Custom birthday cakes for all ages",
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
                "4.9★ Customer Rating",
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
      <body className={`${inter.className} ${playfairDisplay.variable}`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        <EmotionCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Providers>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow">{children}</main>
                <Footer />
                <CookieConsent />
                <DevTools />
              </div>
            </Providers>
          </ThemeProvider>
        </EmotionCacheProvider>
        <Analytics />
      </body>
    </html>
  );
}
