import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Playfair_Display } from "next/font/google";
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
  title: "Olgish Cakes - Authentic Ukrainian Cakes in Leeds | Honey Cake & Medovik",
  description:
    "Handcrafted Ukrainian cakes made with love in Leeds. Traditional honey cake (Medovik), Kyiv cake, and authentic Ukrainian desserts. Premium ingredients and exceptional taste.",
  keywords:
    "Ukrainian cakes Leeds, honey cake, Medovik, Kyiv cake, traditional Ukrainian desserts, Ukrainian bakery Leeds",
  metadataBase: new URL("https://olgish-cakes.vercel.app"),
  openGraph: {
    title: "Olgish Cakes - Authentic Ukrainian Cakes in Leeds | Honey Cake & Medovik",
    description:
      "Handcrafted Ukrainian cakes made with love in Leeds. Traditional honey cake (Medovik), Kyiv cake, and authentic Ukrainian desserts.",
    type: "website",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "Olgish Cakes - Authentic Ukrainian Cakes in Leeds | Honey Cake & Medovik",
    description:
      "Handcrafted Ukrainian cakes made with love in Leeds. Traditional honey cake (Medovik), Kyiv cake, and authentic Ukrainian desserts.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${playfairDisplay.variable}`}>
        <EmotionCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">
                <Providers>{children}</Providers>
              </main>
              <Footer />
              <CookieConsent />
            </div>
          </ThemeProvider>
        </EmotionCacheProvider>
        <Analytics />
      </body>
    </html>
  );
}
