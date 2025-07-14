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
  themeColor: "#ffffff",
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: "Olgish Cakes - Authentic Ukrainian Cakes in Leeds | Honey Cake & Medovik",
  description:
    "Handcrafted Ukrainian cakes made with love in Leeds. Traditional honey cake (Medovik), Kyiv cake, and authentic Ukrainian desserts. Premium ingredients and exceptional taste.",
  keywords:
    "Ukrainian cakes Leeds, honey cake, Medovik, Kyiv cake, traditional Ukrainian desserts, Ukrainian bakery Leeds, custom cakes Leeds, wedding cakes Leeds, birthday cakes Leeds",
  metadataBase: new URL("https://olgish-cakes.vercel.app"),
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Olgish Cakes - Authentic Ukrainian Cakes in Leeds | Honey Cake & Medovik",
    description:
      "Handcrafted Ukrainian cakes made with love in Leeds. Traditional honey cake (Medovik), Kyiv cake, and authentic Ukrainian desserts.",
    type: "website",
    locale: "en_GB",
    images: [
      {
        url: "https://olgish-cakes.vercel.app/logo.png",
        width: 1200,
        height: 630,
        alt: "Olgish Cakes - Authentic Ukrainian Cakes in Leeds",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Olgish Cakes - Authentic Ukrainian Cakes in Leeds | Honey Cake & Medovik",
    description:
      "Handcrafted Ukrainian cakes made with love in Leeds. Traditional honey cake (Medovik), Kyiv cake, and authentic Ukrainian desserts.",
    images: ["https://olgish-cakes.vercel.app/logo.png"],
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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Preload critical resources */}
        <link rel="preload" href="/logo.png" as="image" type="image/png" />
        <link rel="preload" href="/images/hero-cake.jpg" as="image" type="image/jpeg" />

        {/* DNS prefetch for external domains */}
        <link rel="dns-prefetch" href="//cdn.sanity.io" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />

        {/* Google Analytics 4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX', {
              page_title: document.title,
              page_location: window.location.href,
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
