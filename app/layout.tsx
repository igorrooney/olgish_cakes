import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Playfair_Display } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { theme } from "@/lib/theme";
import { EmotionCacheProvider } from "./components/EmotionCacheProvider";
import { StructuredData } from "./components/StructuredData";
import { Breadcrumbs } from "./components/Breadcrumbs";

const inter = Inter({ subsets: ["latin"] });
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "Olgish Cakes - Authentic Ukrainian Cakes in Leeds | Handcrafted Desserts",
  description:
    "Experience authentic Ukrainian cakes in Leeds. Handcrafted by Olga Ieromenko using traditional recipes and premium ingredients. Order custom cakes, wedding cakes, and celebration desserts.",
  keywords: [
    "Ukrainian cakes",
    "Leeds bakery",
    "custom cakes",
    "wedding cakes",
    "homemade desserts",
    "traditional Ukrainian recipes",
    "Olgish Cakes",
    "Olga Ieromenko",
  ],
  authors: [{ name: "Olgish Cakes" }],
  openGraph: {
    title: "Olgish Cakes - Authentic Ukrainian Cakes in Leeds",
    description:
      "Handcrafted Ukrainian cakes made with love in Leeds. Traditional recipes, premium ingredients, and exceptional taste.",
    type: "website",
    locale: "en_GB",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Olgish Cakes - Authentic Ukrainian Cakes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Olgish Cakes - Authentic Ukrainian Cakes in Leeds",
    description:
      "Handcrafted Ukrainian cakes made with love in Leeds. Traditional recipes, premium ingredients, and exceptional taste.",
    images: ["/og-image.jpg"],
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
    google: "your-google-site-verification-code", // Add your Google Search Console verification code
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <StructuredData />
      </head>
      <body className={`${inter.className} ${playfairDisplay.variable}`}>
        <EmotionCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Providers>
              <Breadcrumbs />
              {children}
            </Providers>
          </ThemeProvider>
        </EmotionCacheProvider>
      </body>
    </html>
  );
}
