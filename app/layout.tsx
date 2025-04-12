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
  title: "Olgish Cakes - Authentic Ukrainian Cakes in Leeds",
  description:
    "Handcrafted Ukrainian cakes made with love in Leeds. Traditional recipes, premium ingredients, and exceptional taste.",
  metadataBase: new URL("https://olgish-cakes.vercel.app"),
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
