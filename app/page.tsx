import type { Metadata } from "next";
import {
  MobileHero,
  MobileAbout,
  MobileBestsellers,
  MobileMarkets,
  MobileReviews,
  MobileOccasions,
  MobileForm,
  MobileFooter,
} from "./components/mobile-homepage";

export const metadata: Metadata = {
  title: "Olgish Cakes - Authentic Ukrainian Honey Cakes in Leeds",
  description: "Order authentic Ukrainian honey cakes (Medovik) and traditional desserts delivered to Leeds and across the UK. Handmade with love, shipped fresh.",
  keywords: ["Ukrainian cakes", "honey cake", "Medovik", "Leeds bakery", "cake delivery UK"],
  openGraph: {
    title: "Olgish Cakes - Authentic Ukrainian Honey Cakes",
    description: "Order authentic Ukrainian honey cakes delivered fresh to your door",
    url: "https://olgishcakes.co.uk",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png",
        width: 1200,
        height: 630,
        alt: "Olgish Cakes - Ukrainian Honey Cakes",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Olgish Cakes - Authentic Ukrainian Honey Cakes",
    description: "Order authentic Ukrainian honey cakes delivered fresh to your door",
    images: ["https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk",
  },
};

export default async function Home() {
  // Generate structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Bakery",
    name: "Olgish Cakes",
    description: "Authentic Ukrainian honey cakes and traditional desserts",
    url: "https://olgishcakes.co.uk",
    logo: "https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Leeds",
      addressCountry: "GB",
    },
    servesCuisine: "Ukrainian",
    priceRange: "££",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen bg-base-100">
        <main className="flex flex-col">
          <MobileHero />
          <MobileAbout />
          <MobileBestsellers />
          <MobileMarkets />
          <MobileReviews />
          <MobileOccasions />
          <MobileForm />
        </main>
        <MobileFooter />
      </div>
    </>
  );
}